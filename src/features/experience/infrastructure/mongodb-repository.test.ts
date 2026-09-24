import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, type Db } from "mongodb";
import type { ExperienceEntry } from "../domain/types";
import { createMongoExperienceRepository } from "./mongodb-repository";

let server: MongoMemoryServer;
let client: MongoClient;
let db: Db;

const seeds: ExperienceEntry[] = [
  {
    id: "work-seed-role",
    title: "Seed Role",
    organization: "Seed Organization",
    kind: "work",
    dateRange: "2025 - Present",
    description: "Bundled experience",
    highlights: ["Bundled experience"],
  },
];

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  client = await MongoClient.connect(server.getUri());
  db = client.db("synthetic_experience_test");
}, 120_000);

beforeEach(async () => {
  await db.collection("portfolio_experience").deleteMany({});
});

afterAll(async () => {
  await client?.close();
  await server?.stop();
});

function createRepository() {
  return createMongoExperienceRepository(
    async () => db,
    () => seeds,
  );
}

describe("persistent experience repository", () => {
  it("uses seeds until experience entries are changed", async () => {
    await expect(createRepository().loadExperienceEntries()).resolves.toEqual(
      seeds,
    );
  });

  it("shares overrides and custom entries across repository instances", async () => {
    const dashboard = createRepository();
    await dashboard.saveExperienceEntry!(
      {
        id: "work-seed-role",
        title: "Updated Role",
        organization: "Updated Organization",
        kind: "work",
        dateRange: "2026 - Present",
        description: "Updated from Dashboard",
        highlights: ["Updated from Dashboard"],
      },
      true,
    );
    const created = await dashboard.saveExperienceEntry!({
      title: "New School",
      organization: "Example University",
      kind: "education",
      dateRange: "2022 - 2026",
      description: "Created from Dashboard",
      highlights: ["Created from Dashboard"],
    });

    const entries = await createRepository().loadExperienceEntries();
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      id: "work-seed-role",
      title: "Updated Role",
    });
    expect(entries[1]).toEqual(created);
  });

  it("persists seed tombstones and removes custom entries", async () => {
    const repository = createRepository();
    const created = await repository.saveExperienceEntry!({
      title: "Temporary Role",
      organization: "Temporary Organization",
      kind: "work",
      dateRange: "2026",
      description: "Delete me",
      highlights: [],
    });
    await repository.deleteExperienceEntry!("work-seed-role");
    await repository.deleteExperienceEntry!(created.id);

    await expect(
      createRepository().loadExperienceEntries(),
    ).resolves.toEqual([]);
  });

  it("keeps concurrent entries with the same title as separate records", async () => {
    const repository = createRepository();
    const input = {
      title: "Concurrent Role",
      organization: "Example Organization",
      kind: "work" as const,
      dateRange: "2026",
      description: "Created at the same time",
      highlights: [],
    };

    const created = await Promise.all([
      repository.saveExperienceEntry!(input),
      repository.saveExperienceEntry!(input),
    ]);

    expect(new Set(created.map((entry) => entry.id)).size).toBe(2);
    await expect(repository.loadExperienceEntries()).resolves.toHaveLength(3);
  });

  it("falls back to seeds for reads and rejects writes without MongoDB", async () => {
    const repository = createMongoExperienceRepository(
      async () => null,
      () => seeds,
    );
    await expect(repository.loadExperienceEntries()).resolves.toEqual(seeds);
    await expect(
      repository.saveExperienceEntry!({
        title: "Unsaved Role",
        organization: "Unavailable",
        kind: "work",
        dateRange: "2026",
        description: "Must fail",
        highlights: [],
      }),
    ).rejects.toThrow("Experience storage is unavailable");
  });
});
