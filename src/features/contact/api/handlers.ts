import { createHash, timingSafeEqual } from "node:crypto";
import { emitSyncEvent } from "@/features/sync/infrastructure/sync-event-emitter";
import {
  contactEventEmitter,
  emitContactEvent,
} from "../infrastructure/contact-event-emitter";
import type { ContactService } from "../application/service";

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
  if (!token || token.length < 32) {
    return json(
      {
        error: {
          code: "NOT_CONFIGURED",
          message: "Contact integration is not configured.",
        },
      },
      503,
    );
  }
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  const digest = (value: string) =>
    createHash("sha256").update(value).digest();
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

export function createContactHandlers(
  service: ContactService,
  readToken: () => string | undefined,
) {
  async function handle(request: Request, action: () => Promise<Response>) {
    const denied = authenticate(request, readToken());
    if (denied) return denied;
    try {
      return await action();
    } catch (error) {
      console.error("Contact handler error:", error);
      return json(
        {
          error: {
            code: "CONTACT_UNAVAILABLE",
            message: "Contact service is temporarily unavailable. Please retry.",
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
    detail: (request: Request, id: string) =>
      handle(request, async () => {
        const item = await service.find(id);
        return item
          ? json(item)
          : json(
              { error: { code: "NOT_FOUND", message: "Contact message not found." } },
              404,
            );
      }),
    markRead: (request: Request, id: string) =>
      handle(request, async () => {
        let body: { read?: boolean };
        try {
          body = await request.json();
        } catch {
          return json(
            {
              error: {
                code: "INVALID_REQUEST",
                message: "Invalid JSON body.",
              },
            },
            400,
          );
        }
        if (typeof body.read !== "boolean") {
          return json(
            {
              error: {
                code: "INVALID_REQUEST",
                message: "Property 'read' boolean is required.",
              },
            },
            400,
          );
        }
        const updated = await service.markRead(id, body.read);
        if (!updated) {
          return json(
            { error: { code: "NOT_FOUND", message: "Contact message not found." } },
            404,
          );
        }
        emitSyncEvent({ type: "content_update", resource: "contact" });
        emitContactEvent({ type: "message_read", id, read: body.read });
        return json(updated, 200);
      }),
    delete: (request: Request, id: string) =>
      handle(request, async () => {
        const deleted = await service.delete(id);
        if (!deleted) {
          return json(
            { error: { code: "NOT_FOUND", message: "Contact message not found." } },
            404,
          );
        }
        emitSyncEvent({ type: "content_update", resource: "contact" });
        emitContactEvent({ type: "message_deleted", id });
        return json({ success: true }, 200);
      }),
    stream: (request: Request) =>
      handle(request, async () => {
        const encoder = new TextEncoder();
        let heartbeat: ReturnType<typeof setInterval> | undefined;

        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"));

            const onContactEvent = (event: unknown) => {
              try {
                controller.enqueue(
                  encoder.encode(`event: contact_event\ndata: ${JSON.stringify(event)}\n\n`),
                );
              } catch {
                // Stream might be closed
              }
            };

            contactEventEmitter.on("contact_event", onContactEvent);

            heartbeat = setInterval(() => {
              try {
                controller.enqueue(encoder.encode(": keepalive\n\n"));
              } catch {
                if (heartbeat) clearInterval(heartbeat);
              }
            }, 15000);

            request.signal.addEventListener("abort", () => {
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
            Connection: "keep-alive",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }),
  };
}
