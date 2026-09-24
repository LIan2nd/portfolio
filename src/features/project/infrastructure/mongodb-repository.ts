import { randomUUID } from "node:crypto";
import type { Db } from "mongodb";
import type { ProjectRepository } from "../application/service";
import type { ProjectEntry } from "../domain/types";

const COLLECTION_NAME = "portfolio_projects";

interface StoredProject extends ProjectEntry {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted?: boolean;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toProject(document: StoredProject): ProjectEntry {
  return {
    id: document._id,
    title: document.title,
    description: document.description,
    icon: document.icon,
    url: document.url,
    image: document.image,
  };
}

function isDuplicateKeyError(error: unknown) {
  return (error as { code?: number })?.code === 11_000;
}

function toStoredProject(entry: ProjectEntry, now: Date): StoredProject {
  return {
    _id: entry.id,
    id: entry.id,
    title: entry.title,
    description: entry.description,
    icon: entry.icon,
    ...(entry.url === undefined ? {} : { url: entry.url }),
    ...(entry.image === undefined ? {} : { image: entry.image }),
    createdAt: now,
    updatedAt: now,
  };
}

function mergeProjects(
  seeds: ProjectEntry[],
  stored: StoredProject[],
): ProjectEntry[] {
  const storedById = new Map(stored.map((entry) => [entry._id, entry]));
  const seedIds = new Set(seeds.map((entry) => entry.id));
  const mergedSeeds = seeds.flatMap((seed) => {
    const saved = storedById.get(seed.id);
    if (saved?.deleted) return [];
    return [saved ? toProject(saved) : seed];
  });
  const customEntries = stored
    .filter((entry) => !entry.deleted && !seedIds.has(entry._id))
    .map(toProject);

  return [...mergedSeeds, ...customEntries];
}

async function requireDatabase(readDb: () => Promise<Db | null>) {
  const db = await readDb();
  if (!db) throw new Error("Project storage is unavailable.");
  return db;
}

export function createMongoProjectRepository(
  readDb: () => Promise<Db | null>,
  readSeeds: () => ProjectEntry[],
): ProjectRepository {
  return {
    async loadProjectEntries() {
      const seeds = readSeeds();
      try {
        const db = await readDb();
        if (!db) return seeds;
        const stored = await db
          .collection<StoredProject>(COLLECTION_NAME)
          .find({}, { maxTimeMS: 4_000 })
          .sort({ createdAt: 1, _id: 1 })
          .toArray();
        return mergeProjects(seeds, stored);
      } catch (error) {
        console.error(
          "Project database read failed; using bundled seeds:",
          error,
        );
        return seeds;
      }
    },

    async saveProjectEntry(input, isEdit = false) {
      const db = await requireDatabase(readDb);
      const collection = db.collection<StoredProject>(COLLECTION_NAME);
      const seeds = readSeeds();
      const baseId = `project-${slugify(input.title) || randomUUID()}`;
      if (!isEdit) {
        const hasSeed = seeds.some((entry) => entry.id === baseId);
        let id = hasSeed ? `${baseId}-${randomUUID().slice(0, 8)}` : baseId;
        let entry: ProjectEntry = { ...input, id };
        const now = new Date();
        try {
          await collection.insertOne(toStoredProject(entry, now));
        } catch (error) {
          if (!isDuplicateKeyError(error)) throw error;
          id = `${baseId}-${randomUUID().slice(0, 8)}`;
          entry = { ...input, id };
          await collection.insertOne(toStoredProject(entry, now));
        }
        return entry;
      }

      const id = input.id;
      if (!id) throw new Error("ID is required for editing a project entry.");

      const entry: ProjectEntry = {
        id,
        title: input.title,
        description: input.description,
        icon: input.icon,
        url: input.url,
        image: input.image,
      };
      const now = new Date();
      const unset: Record<string, ""> = {};
      if (entry.url === undefined) unset.url = "";
      if (entry.image === undefined) unset.image = "";
      const result = await collection.updateOne(
        { _id: id },
        {
          $set: {
            id: entry.id,
            title: entry.title,
            description: entry.description,
            icon: entry.icon,
            ...(entry.url === undefined ? {} : { url: entry.url }),
            ...(entry.image === undefined ? {} : { image: entry.image }),
            deleted: false,
            updatedAt: now,
          },
          ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
          $setOnInsert: { createdAt: now },
        },
        { upsert: seeds.some((seed) => seed.id === id) },
      );
      if (result.matchedCount === 0 && result.upsertedCount === 0) {
        throw new Error("ENTRY_NOT_FOUND");
      }
      return entry;
    },

    async deleteProjectEntry(id) {
      const db = await requireDatabase(readDb);
      const collection = db.collection<StoredProject>(COLLECTION_NAME);
      const isSeed = readSeeds().some((entry) => entry.id === id);
      if (!isSeed) {
        return (await collection.deleteOne({ _id: id })).deletedCount > 0;
      }

      const now = new Date();
      await collection.updateOne(
        { _id: id },
        {
          $set: { deleted: true, updatedAt: now },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true },
      );
      return true;
    },
  };
}
