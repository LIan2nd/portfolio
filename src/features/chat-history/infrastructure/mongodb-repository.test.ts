import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb";
import { createMongoChatHistoryRepository } from "./mongodb-repository";
import { createChatHistoryService } from "../application/service";

let server: MongoMemoryServer;
let client: MongoClient;
let service: ReturnType<typeof createChatHistoryService>;
const ids = [1, 2, 3, 4].map(
  (value) => new ObjectId(String(value).padStart(24, "0")),
);

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  client = await MongoClient.connect(server.getUri());
  const db = client.db("synthetic_history_test");
  await db.collection("user_queries").insertMany([
    {
      _id: ids[0],
      question: "Literal a.*b",
      anonymousId: "anon_first",
      createdAt: new Date("2026-09-08T16:59:59Z"),
    },
    {
      _id: ids[1],
      question: "Second question",
      anonymousId: "anon_second",
      createdAt: new Date("2026-09-08T17:00:00Z"),
    },
    {
      _id: ids[2],
      question: "Third question",
      anonymousId: "anon_third",
      createdAt: new Date("2026-09-08T17:00:00Z"),
    },
    {
      _id: ids[3],
      question: "Fourth question",
      createdAt: new Date("2026-09-09T17:00:00Z"),
    },
  ]);
  await db.collection("bot_responses").insertMany([
    {
      queryId: ids[0],
      response: "Old answer",
      durationMs: 1,
      createdAt: new Date("2026-09-08T17:01:00Z"),
    },
    {
      queryId: ids[0],
      response: "Newest answer with searchable context",
      durationMs: 2,
      createdAt: new Date("2026-09-08T17:02:00Z"),
    },
    {
      queryId: ids[2],
      response: "Third answer",
      durationMs: 3,
      createdAt: new Date("2026-09-08T17:03:00Z"),
    },
    { queryId: null, response: "Orphan answer", createdAt: new Date() },
  ]);
  service = createChatHistoryService(
    createMongoChatHistoryRepository(async () => db),
  );
}, 120_000);

afterAll(async () => {
  await client?.close();
  await server?.stop();
});

describe("MongoDB history contract", () => {
  it("pairs only the latest answer, preserves missing answers, and counts questions", async () => {
    expect(await service.summarize()).toEqual({ total: 4, answered: 2 });
    const first = await service.find(ids[0].toHexString());
    expect(first?.response?.content).toBe(
      "Newest answer with searchable context",
    );
    expect(first?.response?.queryId).toBe(first?.queryId);
    expect((await service.find(ids[1].toHexString()))?.response).toBeNull();
  });
  it("paginates deterministically across tied timestamps without duplicates", async () => {
    const first = await service.list(new URLSearchParams({ limit: "2" }));
    const second = await service.list(
      new URLSearchParams({ limit: "2", cursor: first.nextCursor! }),
    );
    expect(
      [...first.items, ...second.items].map((item) => item.queryId),
    ).toEqual([...ids].reverse().map((id) => id.toHexString()));
    expect(second.nextCursor).toBeNull();
    expect(second.items).toHaveLength(2);
  });
  it("uses Jakarta date boundaries and combines search with missing-answer status", async () => {
    const result = await service.list(
      new URLSearchParams({
        date: "2026-09-09",
        status: "missing",
        q: "second",
      }),
    );
    expect(result.items.map((item) => item.queryId)).toEqual([
      ids[1].toHexString(),
    ]);
    expect(
      (await service.list(new URLSearchParams({ date: "2026-09-09" }))).items,
    ).toHaveLength(2);
  });
  it("searches saved answers and treats regex metacharacters as literal text", async () => {
    expect(
      (await service.list(new URLSearchParams({ q: "searchable context" })))
        .items,
    ).toHaveLength(1);
    expect(
      (await service.list(new URLSearchParams({ q: "a.*b" }))).items,
    ).toHaveLength(1);
    expect(
      (await service.list(new URLSearchParams({ q: ".*" }))).items,
    ).toHaveLength(1);
  });
  it("does not turn a failed connection into an empty dataset", async () => {
    const repository = createMongoChatHistoryRepository(async () => null);
    await expect(repository.summarize()).rejects.toThrow("unavailable");
  });
});
