import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, type Db } from "mongodb";
import { createMongoContactRepository } from "./data-repository";

let server: MongoMemoryServer;
let client: MongoClient;
let db: Db;

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  client = await MongoClient.connect(server.getUri());
  db = client.db("synthetic_contact_test");
}, 120_000);

beforeEach(async () => {
  await db.collection("contact_messages").deleteMany({});
});

afterAll(async () => {
  await client?.close();
  await server?.stop();
});

describe("persistent contact repository", () => {
  it("shares saved messages across repository instances", async () => {
    const sender = createMongoContactRepository(async () => db);
    const dashboard = createMongoContactRepository(async () => db);
    const saved = await sender.saveContactMessage({
      name: "Sample Visitor",
      email: "visitor@example.com",
      message: "Hello from the contact form",
    });

    await expect(dashboard.loadContactMessages()).resolves.toEqual([saved]);
  });

  it("persists read state and deletion", async () => {
    const repository = createMongoContactRepository(async () => db);
    const saved = await repository.saveContactMessage({
      name: "Sample Visitor",
      email: "visitor@example.com",
      message: "Please mark this as read",
    });

    await expect(
      repository.markContactMessageRead(saved.id, true),
    ).resolves.toMatchObject({ id: saved.id, read: true });
    await expect(repository.deleteContactMessage(saved.id)).resolves.toBe(true);
    await expect(repository.loadContactMessages()).resolves.toEqual([]);
  });

  it("rejects reads and writes when MongoDB is unavailable", async () => {
    const repository = createMongoContactRepository(async () => null);
    await expect(repository.loadContactMessages()).rejects.toThrow(
      "Contact storage is unavailable",
    );
    await expect(
      repository.saveContactMessage({
        name: "Unsaved Visitor",
        email: "visitor@example.com",
        message: "Must fail",
      }),
    ).rejects.toThrow("Contact storage is unavailable");
  });
});
