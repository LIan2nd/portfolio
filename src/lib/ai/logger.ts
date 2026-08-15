import crypto from "crypto";
import { getMongoDb } from "@/lib/mongodb";

export interface LogQuestionParams {
  question: string;
  provider?: string;
  mode?: string;
  ip?: string;
}

/**
 * Creates a one-way anonymous hash for session grouping without storing raw IP.
 */
function createAnonymousId(rawIdentifier?: string): string {
  if (!rawIdentifier || rawIdentifier === "anonymous") {
    return "anon_unknown";
  }
  const hash = crypto.createHash("sha256").update(rawIdentifier + "_portfolio_salt").digest("hex");
  return `anon_${hash.slice(0, 12)}`;
}

/**
 * Non-blocking, asynchronous logger for user questions.
 * Saves questions anonymously to MongoDB Atlas.
 */
export async function logUserQuestion({
  question,
  provider = "Unknown",
  mode = "live",
  ip = "anonymous",
}: LogQuestionParams): Promise<void> {
  // Run asynchronously in the background
  try {
    const trimmed = question.trim();
    if (!trimmed) return;

    const db = await getMongoDb();
    if (!db) {
      // MongoDB URI not configured or connection failed
      return;
    }

    const anonymousId = createAnonymousId(ip);
    const now = new Date();

    const collection = db.collection("user_queries");
    await collection.insertOne({
      question: trimmed,
      characterCount: trimmed.length,
      anonymousId,
      provider,
      mode,
      createdAt: now,
      createdAtIso: now.toISOString(),
    });
  } catch (err) {
    // Silently log to server console to prevent user-facing errors
    console.error("[MongoDB Query Logger Error]:", err);
  }
}
