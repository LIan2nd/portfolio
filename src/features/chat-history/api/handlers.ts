import { createHash, timingSafeEqual } from "node:crypto";
import { InvalidHistoryQuery } from "../application/query";
import type { ChatHistoryService } from "../application/service";
import { chatEventEmitter } from "../infrastructure/chat-event-emitter";
import { contactEventEmitter } from "@/features/contact/infrastructure/contact-event-emitter";
import { getMongoDb } from "@/lib/mongodb";

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function authenticate(request: Request, token: string | undefined) {
  if (!token || token.length < 32)
    return json(
      {
        error: {
          code: "NOT_CONFIGURED",
          message: "History integration is not configured.",
        },
      },
      503,
    );
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (!supplied || !timingSafeEqual(digest(supplied), digest(token))) {
    const response = json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Valid integration credentials are required.",
        },
      },
      401,
    );
    response.headers.set("WWW-Authenticate", "Bearer");
    return response;
  }
}

export function createHistoryHandlers(
  service: ChatHistoryService,
  readToken: () => string | undefined,
) {
  async function handle(request: Request, action: () => Promise<Response>) {
    const denied = authenticate(request, readToken());
    if (denied) return denied;
    try {
      return await action();
    } catch (error) {
      if (error instanceof InvalidHistoryQuery)
        return json(
          { error: { code: "INVALID_QUERY", message: error.message } },
          400,
        );
      return json(
        {
          error: {
            code: "HISTORY_UNAVAILABLE",
            message: "History is temporarily unavailable. Please retry.",
          },
        },
        503,
      );
    }
  }
  return {
    list: (request: Request) =>
      handle(request, async () =>
        json(await service.list(new URL(request.url).searchParams)),
      ),
    summary: (request: Request) =>
      handle(request, async () => json(await service.summarize())),
    detail: (request: Request, id: string) =>
      handle(request, async () => {
        const item = await service.find(id);
        return item
          ? json(item)
          : json(
              { error: { code: "NOT_FOUND", message: "Exchange not found." } },
              404,
            );
      }),
    stream: (request: Request) =>
      handle(request, async () => {
        const encoder = new TextEncoder();
        let heartbeat: ReturnType<typeof setInterval> | undefined;
        let pollInterval: ReturnType<typeof setInterval> | undefined;

        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"));

            const emittedQueryIds = new Set<string>();
            const emittedResponseQueryIds = new Set<string>();
            const emittedContactIds = new Set<string>();
            let lastCheckedTime = new Date(Date.now() - 5000);

            const onChatEvent = (event: unknown) => {
              try {
                controller.enqueue(
                  encoder.encode(`event: chat_event\ndata: ${JSON.stringify(event)}\n\n`),
                );
              } catch {
                // Stream might be closed
              }
            };

            const onContactEvent = (event: unknown) => {
              try {
                controller.enqueue(
                  encoder.encode(`event: contact_event\ndata: ${JSON.stringify(event)}\n\n`),
                );
              } catch {
                // Stream might be closed
              }
            };

            chatEventEmitter.on("chat_event", onChatEvent);
            contactEventEmitter.on("contact_event", onContactEvent);

            let isPolling = false;
            const pollDatabase = async () => {
              if (isPolling) return;
              isPolling = true;
              try {
                const db = await getMongoDb();
                if (!db) return;

                // 1. Detect new user queries
                const newQueries = await db
                  .collection("user_queries")
                  .find({ createdAt: { $gte: lastCheckedTime } })
                  .sort({ createdAt: 1 })
                  .limit(10)
                  .toArray();

                for (const q of newQueries) {
                  const qId = q._id.toString();
                  if (!emittedQueryIds.has(qId)) {
                    emittedQueryIds.add(qId);
                    const resp = await db
                      .collection("bot_responses")
                      .findOne({ queryId: q._id });

                    const exchange = {
                      queryId: qId,
                      question: q.question,
                      anonymousId: q.anonymousId || "anon_unknown",
                      createdAt: (q.createdAt instanceof Date
                        ? q.createdAt
                        : new Date(q.createdAt)
                      ).toISOString(),
                      response: resp
                        ? {
                            queryId: qId,
                            content: resp.response,
                            durationMs: resp.durationMs || 0,
                            createdAt: (resp.createdAt instanceof Date
                              ? resp.createdAt
                              : new Date(resp.createdAt)
                            ).toISOString(),
                          }
                        : null,
                    };

                    controller.enqueue(
                      encoder.encode(
                        `event: chat_event\ndata: ${JSON.stringify({
                          type: "user_question",
                          exchange,
                        })}\n\n`,
                      ),
                    );

                    if (resp) {
                      emittedResponseQueryIds.add(qId);
                    }
                  }
                }

                // 2. Detect new bot responses for previously unanswered queries
                const newResponses = await db
                  .collection("bot_responses")
                  .find({ createdAt: { $gte: lastCheckedTime } })
                  .sort({ createdAt: 1 })
                  .limit(10)
                  .toArray();

                for (const r of newResponses) {
                  if (r.queryId) {
                    const qId = r.queryId.toString();
                    if (!emittedResponseQueryIds.has(qId)) {
                      emittedResponseQueryIds.add(qId);
                      controller.enqueue(
                        encoder.encode(
                          `event: chat_event\ndata: ${JSON.stringify({
                            type: "bot_response",
                            queryId: qId,
                            response: {
                              queryId: qId,
                              content: r.response,
                              durationMs: r.durationMs || 0,
                              createdAt: (r.createdAt instanceof Date
                                ? r.createdAt
                                : new Date(r.createdAt)
                              ).toISOString(),
                            },
                          })}\n\n`,
                        ),
                      );
                    }
                  }
                }

                // 3. Detect new contact messages
                const newContacts = await db
                  .collection("contact_messages")
                  .find({ createdAt: { $gte: lastCheckedTime.toISOString() } })
                  .sort({ createdAt: 1 })
                  .limit(10)
                  .toArray();

                for (const c of newContacts) {
                  const cId = c.id || c._id.toString();
                  if (!emittedContactIds.has(cId)) {
                    emittedContactIds.add(cId);
                    controller.enqueue(
                      encoder.encode(
                        `event: contact_event\ndata: ${JSON.stringify({
                          type: "new_message",
                          message: {
                            id: c.id,
                            name: c.name,
                            email: c.email,
                            message: c.message,
                            createdAt: c.createdAt,
                            read: Boolean(c.read),
                          },
                        })}\n\n`,
                      ),
                    );
                  }
                }

                lastCheckedTime = new Date(Date.now() - 3000);
              } catch {
                // Ignore background polling errors
              } finally {
                isPolling = false;
              }
            };

            // Run initial check and then poll periodically
            pollDatabase();
            pollInterval = setInterval(pollDatabase, 2000);

            heartbeat = setInterval(() => {
              try {
                controller.enqueue(encoder.encode(": keepalive\n\n"));
              } catch {
                if (heartbeat) clearInterval(heartbeat);
                if (pollInterval) clearInterval(pollInterval);
              }
            }, 15000);

            request.signal.addEventListener("abort", () => {
              chatEventEmitter.off("chat_event", onChatEvent);
              contactEventEmitter.off("contact_event", onContactEvent);
              if (heartbeat) clearInterval(heartbeat);
              if (pollInterval) clearInterval(pollInterval);
              try {
                controller.close();
              } catch {}
            });
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }),
  };
}
