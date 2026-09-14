import { createHash, timingSafeEqual } from "node:crypto";
import { InvalidHistoryQuery } from "../application/query";
import type { ChatHistoryService } from "../application/service";

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
      handle(request, async () =>
        // HTTP 204 tells legacy EventSource clients to stop reconnecting.
        new Response(null, {
          status: 204,
          headers: {
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
          },
        }),
      ),
  };
}
