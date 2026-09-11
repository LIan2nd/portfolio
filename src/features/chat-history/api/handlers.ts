import { createHash, timingSafeEqual } from "node:crypto";
import { InvalidHistoryQuery } from "../application/query";
import type { ChatHistoryService } from "../application/service";
import { chatEventEmitter } from "../infrastructure/chat-event-emitter";
import { contactEventEmitter } from "@/features/contact/infrastructure/contact-event-emitter";

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

        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"));

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

            heartbeat = setInterval(() => {
              try {
                controller.enqueue(encoder.encode(": keepalive\n\n"));
              } catch {
                if (heartbeat) clearInterval(heartbeat);
              }
            }, 15000);

            request.signal.addEventListener("abort", () => {
              chatEventEmitter.off("chat_event", onChatEvent);
              contactEventEmitter.off("contact_event", onContactEvent);
              if (heartbeat) clearInterval(heartbeat);
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
