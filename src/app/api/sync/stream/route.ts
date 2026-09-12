import { syncEventEmitter } from "@/features/sync/infrastructure/sync-event-emitter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"));

      const onSyncEvent = (event: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: content_update\ndata: ${JSON.stringify(event)}\n\n`),
          );
        } catch {
          // Stream might be closed
        }
      };

      syncEventEmitter.on("sync_event", onSyncEvent);

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          if (heartbeat) clearInterval(heartbeat);
        }
      }, 15000);

      request.signal.addEventListener("abort", () => {
        syncEventEmitter.off("sync_event", onSyncEvent);
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
}
