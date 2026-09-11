import { createHash, timingSafeEqual } from "node:crypto";
import {
  loadAiConfig,
  saveAiConfig,
  POPULAR_NARA_MODELS,
  POPULAR_SUMOPOD_MODELS,
} from "../infrastructure/data-repository";
import type { AiGateway } from "../domain/types";

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
          message: "AI config integration is not configured.",
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

export function createAiConfigHandlers(readToken: () => string | undefined) {
  async function handle(request: Request, action: () => Promise<Response>) {
    const denied = authenticate(request, readToken());
    if (denied) return denied;
    try {
      return await action();
    } catch (error) {
      console.error("AI config handler error:", error);
      return json(
        {
          error: {
            code: "AI_CONFIG_UNAVAILABLE",
            message: "AI config service is temporarily unavailable.",
          },
        },
        503,
      );
    }
  }

  return {
    getConfig: (request: Request) =>
      handle(request, async () => {
        const config = loadAiConfig();
        return json({
          config,
          popularModels: {
            nara: POPULAR_NARA_MODELS,
            sumopod: POPULAR_SUMOPOD_MODELS,
          },
          hasKeys: {
            nara: Boolean(process.env.NARA_API_KEY),
            sumopod: Boolean(process.env.SUMOPOD_API_KEY),
          },
        });
      }),

    updateConfig: (request: Request) =>
      handle(request, async () => {
        let body: {
          activeProvider?: AiGateway;
          naraModel?: string;
          sumopodModel?: string;
        };
        try {
          body = await request.json();
        } catch {
          return json(
            { error: { code: "INVALID_REQUEST", message: "Invalid JSON body." } },
            400,
          );
        }

        const updated = saveAiConfig({
          activeProvider: body.activeProvider,
          naraModel: body.naraModel,
          sumopodModel: body.sumopodModel,
        });

        return json(updated, 200);
      }),

    testModel: (request: Request) =>
      handle(request, async () => {
        let body: {
          provider: AiGateway;
          model: string;
        };
        try {
          body = await request.json();
        } catch {
          return json(
            { error: { code: "INVALID_REQUEST", message: "Invalid JSON body." } },
            400,
          );
        }

        const providerType = body.provider;
        const model = body.model?.trim();

        if (!providerType || !model) {
          return json(
            {
              error: {
                code: "INVALID_REQUEST",
                message: "Both provider and model are required.",
              },
            },
            400,
          );
        }

        const apiKey =
          providerType === "nara"
            ? process.env.NARA_API_KEY
            : process.env.SUMOPOD_API_KEY;

        const baseUrl =
          providerType === "nara"
            ? process.env.NARA_BASE_URL || "https://router.bynara.id/v1"
            : process.env.SUMOPOD_BASE_URL || "https://ai.sumopod.com/v1";

        if (!apiKey) {
          return json(
            {
              success: false,
              error: `API key for ${providerType} is not configured on the portfolio server.`,
            },
            400,
          );
        }

        const startTime = Date.now();
        try {
          const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "user", content: "Reply with the exact word 'READY' and nothing else." },
              ],
              max_tokens: 30,
              temperature: 0.1,
            }),
            signal: AbortSignal.timeout(15_000),
          });

          const latencyMs = Date.now() - startTime;

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            return json({
              success: false,
              latencyMs,
              error: errJson.error?.message || `Gateway returned HTTP ${res.status}: ${res.statusText}`,
            });
          }

          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content?.trim() || "OK";

          return json({
            success: true,
            latencyMs,
            reply,
            model,
          });
        } catch (fetchErr: unknown) {
          const latencyMs = Date.now() - startTime;
          const msg = fetchErr instanceof Error ? fetchErr.message : "Connection failed";
          return json({
            success: false,
            latencyMs,
            error: msg,
          });
        }
      }),
  };
}
