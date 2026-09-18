import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, type Db } from "mongodb";
import type { AiModelConfig } from "../domain/types";
import { createAiConfigRepository } from "./mongodb-repository";

let server: MongoMemoryServer;
let client: MongoClient;
let db: Db;
const defaults: AiModelConfig = {
  activeProvider: "nara",
  naraModel: "default-nara",
  sumopodModel: "default-sumopod",
};

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  client = await MongoClient.connect(server.getUri());
  db = client.db("synthetic_ai_config_test");
}, 120_000);

beforeEach(async () => {
  await db.collection("portfolio_settings").deleteMany({});
});

afterAll(async () => {
  await client?.close();
  await server?.stop();
});

describe("persistent AI configuration", () => {
  const createRepository = () =>
    createAiConfigRepository(
      async () => db,
      () => defaults,
    );

  it("uses defaults until the owner saves configuration", async () => {
    expect(await createRepository().loadAiConfig()).toEqual(defaults);
  });

  it("shares saved settings across instances and subsequent updates without restart", async () => {
    const dashboard = createRepository();
    const chatbot = createRepository();
    await chatbot.loadAiConfig();
    const saved = await dashboard.saveAiConfig({
      activeProvider: "sumopod",
      sumopodModel: "selected-model",
    });
    expect(await chatbot.loadAiConfig()).toEqual(saved);
    expect(await createRepository().loadAiConfig()).toEqual(saved);

    await dashboard.saveAiConfig({ sumopodModel: "updated-model" });
    expect(await chatbot.loadAiConfig()).toMatchObject({
      activeProvider: "sumopod",
      naraModel: "default-nara",
      sumopodModel: "updated-model",
    });
    expect(
      await db
        .collection("portfolio_settings")
        .countDocuments({ id: "ai_config" }),
    ).toBe(1);
  });

  it("reads the document format written by previous deployments", async () => {
    await db.collection("portfolio_settings").insertOne({
      id: "ai_config",
      activeProvider: "sumopod",
      naraModel: "old-nara",
      sumopodModel: "owner-choice",
      updatedAt: "2026-09-17T10:00:00.000Z",
    });
    expect(await createRepository().loadAiConfig()).toMatchObject({
      activeProvider: "sumopod",
      sumopodModel: "owner-choice",
    });
  });

  it("rejects a save when persistent storage is unavailable", async () => {
    const repository = createAiConfigRepository(
      async () => null,
      () => defaults,
    );
    await expect(
      repository.saveAiConfig({ naraModel: "unsaved-model" }),
    ).rejects.toThrow("storage is unavailable");
    expect(await repository.loadAiConfig()).toEqual(defaults);
  });
});
