import crypto from "crypto";
import { ObjectId } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";

export interface LogQuestionParams {
  queryId?: ObjectId;
  question: string;
  provider?: string;
  mode?: string;
  ip?: string;
}

export interface LogResponseParams {
  queryId?: ObjectId;
  response: string;
  provider?: string;
  mode?: string;
  durationMs?: number;
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
 * Non-blocking, asynchronous logger for user questions (stored in 'user_queries' collection).
 */
export async function logUserQuestion({
  queryId = new ObjectId(),
  question,
  provider = "Unknown",
  mode = "live",
  ip = "anonymous",
}: LogQuestionParams): Promise<ObjectId | null> {
  try {
    const trimmed = question.trim();
    if (!trimmed) return null;

    const db = await getMongoDb();
    if (!db) return null;

    const anonymousId = createAnonymousId(ip);
    const now = new Date();

    const collection = db.collection("user_queries");
    await collection.insertOne({
      _id: queryId,
      question: trimmed,
      characterCount: trimmed.length,
      anonymousId,
      provider,
      mode,
      createdAt: now,
      createdAtIso: now.toISOString(),
    });

    return queryId;
  } catch (err) {
    console.error("[MongoDB User Query Logger Error - Silently Handled]:", err);
    return null;
  }
}

/**
 * Non-blocking, asynchronous logger for AI responses (stored in separate 'bot_responses' collection).
 */
export async function logBotResponse({
  queryId,
  response,
  provider = "Unknown",
  mode = "live",
  durationMs = 0,
}: LogResponseParams): Promise<void> {
  try {
    const trimmed = response.trim();
    if (!trimmed) return;

    const db = await getMongoDb();
    if (!db) return;

    const now = new Date();
    const collection = db.collection("bot_responses");

    await collection.insertOne({
      queryId: queryId || null,
      response: trimmed,
      characterCount: trimmed.length,
      provider,
      mode,
      durationMs,
      createdAt: now,
      createdAtIso: now.toISOString(),
    });
  } catch (err) {
    console.error("[MongoDB Bot Response Logger Error - Silently Handled]:", err);
  }
}
