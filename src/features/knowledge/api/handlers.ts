import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { KnowledgeService } from "../application/service";

function triggerRevalidation() {
  try {
    revalidatePath("/", "page");
  } catch {
    // Graceful fallback in non-Next runtime or test environment
  }
}

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
          message: "Knowledge integration is not configured.",
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

export function createKnowledgeHandlers(
  service: KnowledgeService,
  readToken: () => string | undefined,
) {
  async function handle(request: Request, action: () => Promise<Response>) {
    const denied = authenticate(request, readToken());
    if (denied) return denied;
    try {
      return await action();
    } catch (error) {
      console.error("Knowledge request failed:", error);
      return json(
        {
          error: {
            code: "KNOWLEDGE_UNAVAILABLE",
            message: "Knowledge is temporarily unavailable. Please retry.",
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
              { error: { code: "NOT_FOUND", message: "Document not found." } },
              404,
            );
      }),
    create: (request: Request) =>
      handle(request, async () => {
        let body: {
          id?: string;
          title?: string;
          category?: string;
          description?: string;
          content?: string;
        };
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
        if (
          !body.title?.trim() ||
          !body.category?.trim() ||
          !body.content?.trim()
        ) {
          return json(
            {
              error: {
                code: "INVALID_REQUEST",
                message: "Title, category, and content are required.",
              },
            },
            400,
          );
        }
        const created = await service.create({
          id: body.id,
          title: body.title,
          category: body.category,
          description: body.description,
          content: body.content,
        });
        triggerRevalidation();
        return json(created, 201);
      }),
    update: (request: Request, id: string) =>
      handle(request, async () => {
        let body: {
          title?: string;
          category?: string;
          description?: string;
          content?: string;
        };
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
        if (
          !body.title?.trim() ||
          !body.category?.trim() ||
          !body.content?.trim()
        ) {
          return json(
            {
              error: {
                code: "INVALID_REQUEST",
                message: "Title, category, and content are required.",
              },
            },
            400,
          );
        }
        try {
          const updated = await service.update(id, {
            title: body.title,
            category: body.category,
            description: body.description,
            content: body.content,
          });
          triggerRevalidation();
          return json(updated, 200);
        } catch (error: unknown) {
          if ((error as { message?: string })?.message === "DOCUMENT_NOT_FOUND") {
            return json(
              { error: { code: "NOT_FOUND", message: "Document not found." } },
              404,
            );
          }
          throw error;
        }
      }),
  };
}
