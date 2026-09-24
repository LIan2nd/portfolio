import type { Db } from "mongodb";
import { describe, expect, it, vi } from "vitest";
import type { KnowledgeDocument } from "../domain/types";
import { createMongoKnowledgeRepository } from "./mongodb-repository";

const seeds: KnowledgeDocument[] = [
  {
    id: "current_activity",
    title: "Current activity",
    description: "Bundled activity",
    category: "Activities",
    content: "# Current activity\n\nBundled content.",
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "about_alfian",
    title: "About Alfian",
    description: "Bundled profile",
    category: "Profile",
    content: "# About Alfian\n\nBundled profile content.",
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
];

function createDb(storedDocuments: object[] = []) {
  const toArray = vi.fn(async () => storedDocuments);
  const sort = vi.fn(() => ({ toArray }));
  const find = vi.fn(() => ({ sort }));
  const updateOne = vi.fn(async () => ({ acknowledged: true }));
  const collection = vi.fn(() => ({ find, updateOne }));

  return {
    db: { collection } as unknown as Db,
    collection,
    find,
    sort,
    toArray,
    updateOne,
  };
}

describe("MongoDB knowledge repository", () => {
  it("merges MongoDB overrides and custom documents with bundled seeds", async () => {
    const database = createDb([
      {
        _id: "current_activity",
        title: "Current activity",
        description: "Updated activity",
        category: "Activities",
        content: "# Current activity\n\nUpdated from the dashboard.",
        updatedAt: new Date("2026-09-17T10:00:00.000Z"),
      },
      {
        _id: "custom-note",
        title: "Custom note",
        description: "A custom document",
        category: "General",
        content: "# Custom note\n\nCustom content.",
        updatedAt: new Date("2026-09-17T11:00:00.000Z"),
      },
    ]);
    const repository = createMongoKnowledgeRepository(
      async () => database.db,
      () => seeds,
    );

    const documents = await repository.loadKnowledgeDocuments();

    expect(documents).toHaveLength(3);
    expect(
      documents.find(({ id }) => id === "current_activity")?.content,
    ).toContain("Updated from the dashboard");
    expect(documents.find(({ id }) => id === "about_alfian")).toEqual(seeds[1]);
    expect(documents.find(({ id }) => id === "custom-note")).toBeDefined();
  });

  it("upserts a normalized document into MongoDB", async () => {
    const database = createDb();
    const repository = createMongoKnowledgeRepository(
      async () => database.db,
      () => seeds,
    );

    const saved = await repository.saveKnowledgeDocument({
      id: "current_activity",
      title: "Current Activity",
      category: "Activities",
      content: "The latest activity from the dashboard.",
    });

    expect(saved.id).toBe("current_activity");
    expect(saved.content).toContain("# Current Activity");
    expect(saved.content).toContain("- **Kategori:** Career & Activity");
    expect(database.updateOne).toHaveBeenCalledWith(
      { _id: "current_activity" },
      expect.objectContaining({
        $set: expect.objectContaining({
          title: "Current Activity",
          category: "Career & Activity",
          knowledgeSchemaVersion: 2,
        }),
      }),
      { upsert: true },
    );
  });

  it("uses seeds for reads and rejects writes when MongoDB is unavailable", async () => {
    const repository = createMongoKnowledgeRepository(
      async () => null,
      () => seeds,
    );

    await expect(repository.loadKnowledgeDocuments()).resolves.toEqual(seeds);
    await expect(
      repository.saveKnowledgeDocument({
        title: "Unavailable",
        category: "General",
        content: "Content",
      }),
    ).rejects.toThrow("Knowledge storage is unavailable");
  });
});
