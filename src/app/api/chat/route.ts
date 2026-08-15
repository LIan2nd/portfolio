import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAiProvider, ChatMessage, MockFallbackProvider } from "@/lib/ai/provider";
import { logUserQuestion, logBotResponse } from "@/lib/ai/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// In-memory rate limiting map with short-term (1 min) and hourly limits
interface RateLimitRecord {
  minuteCount: number;
  minuteExpiresAt: number;
  hourCount: number;
  hourExpiresAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

function isRateLimited(ip: string): { limited: boolean; reason?: string } {
  const now = Date.now();
  const MINUTE_MS = 60 * 1000;
  const HOUR_MS = 60 * 60 * 1000;

  const MAX_PER_MINUTE = 6; // Max 6 messages/min per IP
  const MAX_PER_HOUR = 25; // Max 25 messages/hour per IP

  const record = rateLimitMap.get(ip);

  if (
    !record ||
    typeof record.minuteCount !== "number" ||
    typeof record.minuteExpiresAt !== "number" ||
    typeof record.hourCount !== "number" ||
    typeof record.hourExpiresAt !== "number"
  ) {
    rateLimitMap.set(ip, {
      minuteCount: 1,
      minuteExpiresAt: now + MINUTE_MS,
      hourCount: 1,
      hourExpiresAt: now + HOUR_MS,
    });
    return { limited: false };
  }

  // Reset expired windows
  if (record.minuteExpiresAt < now) {
    record.minuteCount = 0;
    record.minuteExpiresAt = now + MINUTE_MS;
  }
  if (record.hourExpiresAt < now) {
    record.hourCount = 0;
    record.hourExpiresAt = now + HOUR_MS;
  }

  // Check limits
  if (record.minuteCount >= MAX_PER_MINUTE) {
    return {
      limited: true,
      reason: "Sending messages too fast. Please wait 1 minute!",
    };
  }

  if (record.hourCount >= MAX_PER_HOUR) {
    return {
      limited: true,
      reason:
        "Hourly message limit reached. Want to discuss further? Feel free to reach out to Alfian via Email or LinkedIn!",
    };
  }

  record.minuteCount += 1;
  record.hourCount += 1;
  return { limited: false };
}

function createLoggingStream(
  originalStream: ReadableStream<Uint8Array>,
  onComplete: (fullText: string) => void
): ReadableStream<Uint8Array> {
  const reader = originalStream.getReader();
  const decoder = new TextDecoder();
  let accumulatedText = "";

  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          onComplete(accumulatedText);
          return;
        }
        accumulatedText += decoder.decode(value, { stream: true });
        controller.enqueue(value);
      } catch (err) {
        controller.error(err);
        if (accumulatedText) {
          onComplete(accumulatedText);
        }
      }
    },
    cancel(reason) {
      reader.cancel(reason);
      if (accumulatedText) {
        onComplete(accumulatedText);
      }
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const check = isRateLimited(ip);
    if (check.limited) {
      return NextResponse.json(
        { error: check.reason || "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid message format. Expected an array of messages." },
        { status: 400 }
      );
    }

    // Sanitize, limit history length, and truncate characters to save token cost
    const sanitizedMessages: ChatMessage[] = messages
      .slice(-5) // Keep only last 5 messages for high context & token efficiency
      .map((msg: { role?: unknown; content?: unknown }) => {
        const role: "user" | "assistant" =
          msg.role === "user" || msg.role === "assistant" ? msg.role : "user";
        const content =
          typeof msg.content === "string"
            ? msg.content.trim().slice(0, 280) // Max 280 chars per message
            : "";
        return { role, content };
      })
      .filter((msg) => msg.content.length > 0);

    if (sanitizedMessages.length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty or exceed maximum length." },
        { status: 400 }
      );
    }

    const latestUserQuery = sanitizedMessages
      .filter((m) => m.role === "user")
      .pop()?.content;

    const queryId = new ObjectId();
    const startTime = Date.now();

    try {
      const { provider, mode } = getAiProvider();

      if (latestUserQuery) {
        void logUserQuestion({
          queryId,
          question: latestUserQuery,
          provider: provider.name,
          mode,
          ip,
        });
      }

      const rawStream = provider.generateStream(sanitizedMessages);
      const loggedStream = createLoggingStream(rawStream, (fullResponse) => {
        void logBotResponse({
          queryId,
          response: fullResponse,
          provider: provider.name,
          mode,
          durationMs: Date.now() - startTime,
        });
      });

      return new Response(loggedStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-AI-Mode": mode,
          "X-AI-Provider": encodeURIComponent(provider.name),
        },
      });
    } catch (providerError) {
      console.error("[Chat Provider Error, falling back to simulated engine]:", providerError);
      const fallback = new MockFallbackProvider();

      if (latestUserQuery) {
        void logUserQuestion({
          queryId,
          question: latestUserQuery,
          provider: fallback.name,
          mode: "simulated",
          ip,
        });
      }

      const rawStream = fallback.generateStream(sanitizedMessages);
      const loggedStream = createLoggingStream(rawStream, (fullResponse) => {
        void logBotResponse({
          queryId,
          response: fullResponse,
          provider: fallback.name,
          mode: "simulated",
          durationMs: Date.now() - startTime,
        });
      });

      return new Response(loggedStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-AI-Mode": "simulated",
          "X-AI-Provider": "Simulated Portfolio AI",
        },
      });
    }
  } catch (error) {
    console.error("[Chat API Fatal Error]:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan pada server AI.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { provider, mode } = getAiProvider();
    return NextResponse.json({
      status: "ok",
      provider: provider.name,
      mode,
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: "AI provider initialization failed" },
      { status: 500 }
    );
  }
}
