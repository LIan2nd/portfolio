import { randomUUID } from "node:crypto";
import type { Db } from "mongodb";
import type { ExperienceRepository } from "../application/service";
import type { ExperienceEntry } from "../domain/types";

const COLLECTION_NAME = "portfolio_experience";

interface StoredExperience extends ExperienceEntry {
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

function toExperience(document: StoredExperience): ExperienceEntry {
  return {
    id: document._id,
    title: document.title,
    organization: document.organization,
    kind: document.kind,
    dateRange: document.dateRange,
    description: document.description,
    highlights: document.highlights,
    logo: document.logo,
  };
}

function isDuplicateKeyError(error: unknown) {
  return (error as { code?: number })?.code === 11_000;
}

function toStoredExperience(
  entry: ExperienceEntry,
  now: Date,
): StoredExperience {
  return {
    _id: entry.id,
    id: entry.id,
    title: entry.title,
    organization: entry.organization,
    kind: entry.kind,
    dateRange: entry.dateRange,
    description: entry.description,
    highlights: entry.highlights,
    ...(entry.logo === undefined ? {} : { logo: entry.logo }),
    createdAt: now,
    updatedAt: now,
  };
}

function mergeExperiences(
  seeds: ExperienceEntry[],
  stored: StoredExperience[],
): ExperienceEntry[] {
  const storedById = new Map(stored.map((entry) => [entry._id, entry]));
  const seedIds = new Set(seeds.map((entry) => entry.id));
  const mergedSeeds = seeds.flatMap((seed) => {
    const saved = storedById.get(seed.id);
    if (saved?.deleted) return [];
    return [saved ? toExperience(saved) : seed];
  });
  const customEntries = stored
    .filter((entry) => !entry.deleted && !seedIds.has(entry._id))
    .map(toExperience);

  return [...mergedSeeds, ...customEntries];
}

async function requireDatabase(readDb: () => Promise<Db | null>) {
  const db = await readDb();
  if (!db) throw new Error("Experience storage is unavailable.");
  return db;
}

export function createMongoExperienceRepository(
  readDb: () => Promise<Db | null>,
  readSeeds: () => ExperienceEntry[],
): ExperienceRepository {
  return {
    async loadExperienceEntries() {
      const seeds = readSeeds();
      try {
        const db = await readDb();
        if (!db) return seeds;
        const stored = await db
          .collection<StoredExperience>(COLLECTION_NAME)
          .find({}, { maxTimeMS: 4_000 })
          .sort({ createdAt: 1, _id: 1 })
          .toArray();
        return mergeExperiences(seeds, stored);
      } catch (error) {
        console.error(
          "Experience database read failed; using bundled seeds:",
          error,
        );
        return seeds;
      }
    },

    async saveExperienceEntry(input, isEdit = false) {
      const db = await requireDatabase(readDb);
      const collection = db.collection<StoredExperience>(COLLECTION_NAME);
      const seeds = readSeeds();
      const baseId = `${input.kind}-${slugify(input.title) || randomUUID()}`;
      if (!isEdit) {
        const hasSeed = seeds.some((entry) => entry.id === baseId);
        let id = hasSeed ? `${baseId}-${randomUUID().slice(0, 8)}` : baseId;
        let entry: ExperienceEntry = { ...input, id };
        const now = new Date();
        try {
          await collection.insertOne(toStoredExperience(entry, now));
        } catch (error) {
          if (!isDuplicateKeyError(error)) throw error;
          id = `${baseId}-${randomUUID().slice(0, 8)}`;
          entry = { ...input, id };
          await collection.insertOne(toStoredExperience(entry, now));
        }
        return entry;
      }

      const id = input.id;
      if (!id) {
        throw new Error("ID is required for editing an experience entry.");
      }

      const entry: ExperienceEntry = {
        id,
        title: input.title,
        organization: input.organization,
        kind: input.kind,
        dateRange: input.dateRange,
        description: input.description,
        highlights: input.highlights,
        logo: input.logo,
      };
      const now = new Date();
      const result = await collection.updateOne(
        { _id: id },
        {
          $set: {
            id: entry.id,
            title: entry.title,
            organization: entry.organization,
            kind: entry.kind,
            dateRange: entry.dateRange,
            description: entry.description,
            highlights: entry.highlights,
            ...(entry.logo === undefined ? {} : { logo: entry.logo }),
            deleted: false,
            updatedAt: now,
          },
          ...(entry.logo === undefined ? { $unset: { logo: "" } } : {}),
          $setOnInsert: { createdAt: now },
        },
        { upsert: seeds.some((seed) => seed.id === id) },
      );
      if (result.matchedCount === 0 && result.upsertedCount === 0) {
        throw new Error("ENTRY_NOT_FOUND");
      }
      return entry;
    },

    async deleteExperienceEntry(id) {
      const db = await requireDatabase(readDb);
      const collection = db.collection<StoredExperience>(COLLECTION_NAME);
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
