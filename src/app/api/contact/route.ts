import { NextRequest, NextResponse } from "next/server";
import { saveContactMessage } from "@/features/contact";

// ---------------------------------------------------------------------------
// Rate limiter – in-memory, per-IP (sufficient for a portfolio-scale site)
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // max submissions per window

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function evictExpired(now: number) {
  for (const [key, entry] of rateLimitMap) {
    if (now >= entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  evictExpired(now);
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    // First request or window expired → reset
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

// ---------------------------------------------------------------------------
// Minimum time (ms) between form render and submit – bots are fast
// ---------------------------------------------------------------------------
const MIN_SUBMIT_TIME_MS = 3_000;

// ---------------------------------------------------------------------------
// POST /api/contact
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, _honeypot, _timing } = body as {
      name?: string;
      email?: string;
      message?: string;
      _honeypot?: string;
      _timing?: number;
    };

    // ---- Layer 1: Honeypot check ----
    // If the hidden field is filled, it's a bot. Return fake success.
    if (_honeypot) {
      return NextResponse.json({ status: "success" });
    }

    // ---- Layer 2: Timing check ----
    // If form was submitted impossibly fast, it's likely a bot.
    if (typeof _timing === "number" && _timing < MIN_SUBMIT_TIME_MS) {
      return NextResponse.json(
        { status: "error", error: "Please take your time filling the form." },
        { status: 422 },
      );
    }

    // ---- Layer 3: Rate limiting (per IP) ----
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { status: "error", error: "Too many messages. Please try again later." },
        { status: 429 },
      );
    }

    // ---- Basic server-side validation ----
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { status: "error", error: "All fields are required." },
        { status: 400 },
      );
    }

    if (!email.includes("@") || !email.split("@")[1]?.includes(".")) {
      return NextResponse.json(
        { status: "error", error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    // ---- Save message to portfolio database ----
    try {
      await saveContactMessage({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
    } catch (saveErr) {
      console.error("[Contact API] Failed to save message to local store:", saveErr);
    }

    // ---- Forward to Google Apps Script (if configured) ----
    const scriptUrl = process.env.CONTACT_SCRIPT_URL;

    if (scriptUrl) {
      try {
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("email", email.trim());
        formData.append("message", message.trim());

        await fetch(scriptUrl, {
          method: "POST",
          body: formData,
        });
      } catch (scriptErr) {
        console.error("[Contact API] Failed to forward to Google Apps Script:", scriptErr);
      }
    } else {
      console.warn("[Contact API] CONTACT_SCRIPT_URL not set; message saved locally to dashboard store.");
    }

    return NextResponse.json({ status: "success" });
  } catch (err) {
    console.error("[Contact API] Unexpected error:", err);
    return NextResponse.json(
      { status: "error", error: "Failed to send message. Please try again." },
      { status: 500 },
    );
  }
}
