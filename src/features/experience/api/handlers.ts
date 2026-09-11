import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { emitSyncEvent } from "@/features/sync/infrastructure/sync-event-emitter";
import type { ExperienceService } from "../application/service";

function triggerRevalidation() {
  try {
    revalidatePath("/", "page");
    revalidatePath("/resume", "page");
  } catch {
    // Graceful fallback in non-Next runtime or test environment
  }
  emitSyncEvent({ type: "content_update", resource: "experience" });
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
          message: "Experience integration is not configured.",
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

export function createExperienceHandlers(
  service: ExperienceService,
  readToken: () => string | undefined,
) {
  async function handle(request: Request, action: () => Promise<Response>) {
    const denied = authenticate(request, readToken());
    if (denied) return denied;
    try {
      return await action();
    } catch (error) {
      console.error("Experience handler error:", error);
      return json(
        {
          error: {
            code: "EXPERIENCE_UNAVAILABLE",
            message: "Experience is temporarily unavailable. Please retry.",
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
              { error: { code: "NOT_FOUND", message: "Entry not found." } },
              404,
            );
      }),
    create: (request: Request) =>
      handle(request, async () => {
        let body: {
          id?: string;
          title?: string;
          organization?: string;
          kind?: "work" | "education";
          dateRange?: string;
          description?: string;
          highlights?: string[];
          logo?: string;
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
          !body.organization?.trim() ||
          !body.kind ||
          !["work", "education"].includes(body.kind) ||
          !body.dateRange?.trim() ||
          !body.description?.trim()
        ) {
          return json(
            {
              error: {
                code: "INVALID_REQUEST",
                message:
                  "Title, organization, valid kind (work/education), dateRange, and description are required.",
              },
            },
            400,
          );
        }
        const created = await service.create({
          id: body.id,
          title: body.title,
          organization: body.organization,
          kind: body.kind,
          dateRange: body.dateRange,
          description: body.description,
          highlights: Array.isArray(body.highlights) ? body.highlights : [],
          logo: body.logo,
        });
        triggerRevalidation();
        return json(created, 201);
      }),
    update: (request: Request, id: string) =>
      handle(request, async () => {
        let body: {
          title?: string;
          organization?: string;
          kind?: "work" | "education";
          dateRange?: string;
          description?: string;
          highlights?: string[];
          logo?: string;
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
          !body.organization?.trim() ||
          !body.kind ||
          !["work", "education"].includes(body.kind) ||
          !body.dateRange?.trim() ||
          !body.description?.trim()
        ) {
          return json(
            {
              error: {
                code: "INVALID_REQUEST",
                message:
                  "Title, organization, valid kind (work/education), dateRange, and description are required.",
              },
            },
            400,
          );
        }
        try {
          const updated = await service.update(id, {
            title: body.title,
            organization: body.organization,
            kind: body.kind,
            dateRange: body.dateRange,
            description: body.description,
            highlights: Array.isArray(body.highlights) ? body.highlights : [],
            logo: body.logo,
          });
          triggerRevalidation();
          return json(updated, 200);
        } catch (error: unknown) {
          if ((error as { message?: string })?.message === "ENTRY_NOT_FOUND") {
            return json(
              { error: { code: "NOT_FOUND", message: "Entry not found." } },
              404,
            );
          }
          throw error;
        }
      }),
    delete: (request: Request, id: string) =>
      handle(request, async () => {
        const deleted = await service.delete(id);
        if (!deleted) {
          return json(
            { error: { code: "NOT_FOUND", message: "Entry not found." } },
            404,
          );
        }
        triggerRevalidation();
        return json({ success: true }, 200);
      }),
  };
}
