import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, type Db } from "mongodb";
import type { ProjectEntry } from "../domain/types";
import { createMongoProjectRepository } from "./mongodb-repository";

let server: MongoMemoryServer;
let client: MongoClient;
let db: Db;

const seeds: ProjectEntry[] = [
  {
    id: "project-seed",
    title: "Seed Project",
    description: "Bundled project",
    icon: "notebook",
  },
];

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  client = await MongoClient.connect(server.getUri());
  db = client.db("synthetic_project_test");
}, 120_000);

beforeEach(async () => {
  await db.collection("portfolio_projects").deleteMany({});
});

afterAll(async () => {
  await client?.close();
  await server?.stop();
});

function createRepository() {
  return createMongoProjectRepository(
    async () => db,
    () => seeds,
  );
}

describe("persistent project repository", () => {
  it("uses seeds until projects are changed", async () => {
    await expect(createRepository().loadProjectEntries()).resolves.toEqual(
      seeds,
    );
  });

  it("shares overrides and custom projects across repository instances", async () => {
    const dashboard = createRepository();
    await dashboard.saveProjectEntry!(
      {
        id: "project-seed",
        title: "Updated Project",
        description: "Updated from Dashboard",
        icon: "code",
      },
      true,
    );
    const created = await dashboard.saveProjectEntry!({
      title: "New Project",
      description: "Created from Dashboard",
      icon: "rocket",
    });

    const entries = await createRepository().loadProjectEntries();
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      id: "project-seed",
      title: "Updated Project",
    });
    expect(entries[1]).toEqual(created);
  });

  it("persists seed tombstones and removes custom projects", async () => {
    const repository = createRepository();
    const created = await repository.saveProjectEntry!({
      title: "Temporary Project",
      description: "Delete me",
      icon: "notebook",
    });
    await repository.deleteProjectEntry!("project-seed");
    await repository.deleteProjectEntry!(created.id);

    await expect(
      createRepository().loadProjectEntries(),
    ).resolves.toEqual([]);
  });

  it("keeps concurrent projects with the same title as separate entries", async () => {
    const repository = createRepository();
    const input = {
      title: "Concurrent Project",
      description: "Created at the same time",
      icon: "notebook",
    };

    const created = await Promise.all([
      repository.saveProjectEntry!(input),
      repository.saveProjectEntry!(input),
    ]);

    expect(new Set(created.map((entry) => entry.id)).size).toBe(2);
    await expect(repository.loadProjectEntries()).resolves.toHaveLength(3);
  });

  it("falls back to seeds for reads and rejects writes without MongoDB", async () => {
    const repository = createMongoProjectRepository(
      async () => null,
      () => seeds,
    );
    await expect(repository.loadProjectEntries()).resolves.toEqual(seeds);
    await expect(
      repository.saveProjectEntry!({
        title: "Unsaved",
        description: "Must fail",
        icon: "notebook",
      }),
    ).rejects.toThrow("Project storage is unavailable");
  });
});
