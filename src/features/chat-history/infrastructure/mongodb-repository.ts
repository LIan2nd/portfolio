import { ObjectId, type Db, type Document } from "mongodb";
import type {
  ChatExchange,
  ChatHistoryRepository,
  HistoryQuery,
} from "../domain/types";

interface StoredExchange {
  _id: ObjectId;
  question: string;
  anonymousId?: string;
  createdAt: Date;
  answers: { response: string; durationMs?: number; createdAt: Date }[];
}

const answerLookup: Document = {
  $lookup: {
    from: "bot_responses",
    localField: "_id",
    foreignField: "queryId",
    pipeline: [
      { $sort: { createdAt: -1, _id: -1 } },
      { $limit: 1 },
      { $project: { _id: 0, response: 1, durationMs: 1, createdAt: 1 } },
    ],
    as: "answers",
  },
};
const projection = {
  $project: { question: 1, anonymousId: 1, createdAt: 1, answers: 1 },
};

function toExchange(row: StoredExchange): ChatExchange {
  const answer = row.answers[0];
  const queryId = row._id.toHexString();
  return {
    queryId,
    question: row.question,
    anonymousId: row.anonymousId ?? "anon_unknown",
    createdAt: row.createdAt.toISOString(),
    response: answer
      ? {
          queryId,
          content: answer.response,
          durationMs: answer.durationMs ?? 0,
          createdAt: answer.createdAt.toISOString(),
        }
      : null,
  };
}

export function createMongoChatHistoryRepository(
  readDb: () => Promise<Db | null>,
): ChatHistoryRepository {
  async function collection() {
    const db = await readDb();
    if (!db) throw new Error("History storage is unavailable.");
    return db.collection("user_queries");
  }

  return {
    async list(query: HistoryQuery) {
      const match: Document = {};
      if (query.date) {
        const start = new Date(`${query.date}T00:00:00+07:00`);
        match.createdAt = {
          $gte: start,
          $lt: new Date(start.getTime() + 86_400_000),
        };
      }
      if (query.cursor) {
        const createdAt = new Date(query.cursor.createdAt);
        match.$or = [
          { createdAt: { $lt: createdAt } },
          { createdAt, _id: { $lt: new ObjectId(query.cursor.id) } },
        ];
      }
      const pipeline: Document[] = [
        { $match: match },
        { $sort: { createdAt: -1, _id: -1 } },
        answerLookup,
      ];
      if (query.status)
        pipeline.push({
          $match: { "answers.0": { $exists: query.status === "answered" } },
        });
      if (query.q) {
        const literal = query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        pipeline.push({
          $match: {
            $or: ["question", "anonymousId", "answers.response"].map(
              (field) => ({ [field]: { $regex: literal, $options: "i" } }),
            ),
          },
        });
      }
      pipeline.push({ $limit: query.limit + 1 }, projection);
      const rows = await (
        await collection()
      )
        .aggregate<StoredExchange>(pipeline, { maxTimeMS: 4000 })
        .toArray();
      const items = rows.slice(0, query.limit).map(toExchange);
      const last = items.at(-1);
      return {
        items,
        nextCursor:
          rows.length > query.limit && last
            ? Buffer.from(
                JSON.stringify({ id: last.queryId, createdAt: last.createdAt }),
              ).toString("base64url")
            : null,
      };
    },
    async find(queryId) {
      const rows = await (
        await collection()
      )
        .aggregate<StoredExchange>(
          [
            { $match: { _id: new ObjectId(queryId) } },
            answerLookup,
            projection,
          ],
          { maxTimeMS: 4000 },
        )
        .toArray();
      return rows[0] ? toExchange(rows[0]) : null;
    },
    async summarize() {
      const rows = await (
        await collection()
      )
        .aggregate<{ total: number; answered: number }>(
          [
            answerLookup,
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                answered: {
                  $sum: { $cond: [{ $gt: [{ $size: "$answers" }, 0] }, 1, 0] },
                },
              },
            },
            { $project: { _id: 0, total: 1, answered: 1 } },
          ],
          { maxTimeMS: 4000 },
        )
        .toArray();
      return rows[0] ?? { total: 0, answered: 0 };
    },
  };
}
