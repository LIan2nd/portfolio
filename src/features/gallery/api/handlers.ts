import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { GalleryService } from "../application/service";

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
          message: "Gallery integration is not configured.",
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

function revalidateGallery() {
  try {
    revalidatePath("/gallery", "page");
  } catch {
    // Tests and non-Next runtimes do not expose an active cache context.
  }
}

async function readBody(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Gallery request failed.";
}

export function createGalleryHandlers(
  service: GalleryService,
  readToken: () => string | undefined,
) {
  async function handle(request: Request, action: () => Promise<Response>) {
    const denied = authenticate(request, readToken());
    if (denied) return denied;
    try {
      return await action();
    } catch (error) {
      console.error("Gallery handler error:", error);
      const message = errorMessage(error);
      const configurationMessage =
        message === "R2_NOT_CONFIGURED"
          ? "Cloudflare R2 is not configured."
          : message === "R2_PUBLIC_URL_INVALID"
            ? "R2_PUBLIC_BASE_URL must be a complete HTTPS URL."
            : null;
      const invalid =
        message.includes("required") ||
        message.includes("supported") ||
        message.includes("smaller") ||
        message.includes("too long") ||
        message.includes("Invalid") ||
        message.includes("dimensions");
      return json(
        {
          error: {
            code: configurationMessage
              ? "R2_CONFIGURATION_ERROR"
              : invalid
                ? "INVALID_REQUEST"
                : "GALLERY_UNAVAILABLE",
            message: configurationMessage
              ? configurationMessage
              : invalid
                ? message
                : "Gallery is temporarily unavailable. Please retry.",
          },
        },
        invalid && !configurationMessage ? 400 : 503,
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
              { error: { code: "NOT_FOUND", message: "Photo not found." } },
              404,
            );
      }),

    createUploadTicket: (request: Request) =>
      handle(request, async () => {
        const body = await readBody(request);
        if (!body) {
          return json(
            { error: { code: "INVALID_REQUEST", message: "Invalid JSON body." } },
            400,
          );
        }
        const ticket = await service.createUploadTicket({
          fileName: String(body.fileName ?? ""),
          contentType: String(body.contentType ?? ""),
          size: Number(body.size),
        });
        return json(ticket, 201);
      }),

    discardUpload: (request: Request) =>
      handle(request, async () => {
        const body = await readBody(request);
        if (!body) {
          return json(
            { error: { code: "INVALID_REQUEST", message: "Invalid JSON body." } },
            400,
          );
        }
        await service.discardUpload(String(body.objectKey ?? ""));
        return json({ success: true });
      }),

    create: (request: Request) =>
      handle(request, async () => {
        const body = await readBody(request);
        if (!body) {
          return json(
            { error: { code: "INVALID_REQUEST", message: "Invalid JSON body." } },
            400,
          );
        }
        const item = await service.create({
          title: String(body.title ?? ""),
          description: String(body.description ?? ""),
          alt: typeof body.alt === "string" ? body.alt : undefined,
          objectKey: String(body.objectKey ?? ""),
          width: Number(body.width),
          height: Number(body.height),
          takenAt: typeof body.takenAt === "string" ? body.takenAt : undefined,
        });
        revalidateGallery();
        return json(item, 201);
      }),

    update: (request: Request, id: string) =>
      handle(request, async () => {
        const body = await readBody(request);
        if (!body) {
          return json(
            { error: { code: "INVALID_REQUEST", message: "Invalid JSON body." } },
            400,
          );
        }
        try {
          const item = await service.update(id, {
            title: String(body.title ?? ""),
            description: String(body.description ?? ""),
            alt: typeof body.alt === "string" ? body.alt : undefined,
            takenAt:
              typeof body.takenAt === "string" ? body.takenAt : undefined,
          });
          revalidateGallery();
          return json(item);
        } catch (error) {
          if (error instanceof Error && error.message === "ENTRY_NOT_FOUND") {
            return json(
              { error: { code: "NOT_FOUND", message: "Photo not found." } },
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
            { error: { code: "NOT_FOUND", message: "Photo not found." } },
            404,
          );
        }
        revalidateGallery();
        return json({ success: true });
      }),
  };
}
