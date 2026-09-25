import { randomUUID } from "node:crypto";
import type { Db } from "mongodb";
import type { GalleryRepository } from "../application/service";
import type {
  GalleryInput,
  GalleryItem,
  GalleryUpdateInput,
} from "../domain/types";

const COLLECTION_NAME = "portfolio_gallery";

interface StoredGalleryItem {
  _id: string;
  title: string;
  description: string;
  alt: string;
  imageUrl: string;
  objectKey: string;
  width: number;
  height: number;
  takenAt?: string;
  createdAt: Date;
  updatedAt: Date;
}

function toGalleryItem(document: StoredGalleryItem): GalleryItem {
  return {
    id: document._id,
    title: document.title,
    description: document.description,
    alt: document.alt,
    imageUrl: document.imageUrl,
    objectKey: document.objectKey,
    width: document.width,
    height: document.height,
    takenAt: document.takenAt,
    createdAt: document.createdAt.toISOString(),
  };
}

async function requireDatabase(readDb: () => Promise<Db | null>) {
  const db = await readDb();
  if (!db) throw new Error("Gallery storage is unavailable.");
  return db;
}

export function createMongoGalleryRepository(
  readDb: () => Promise<Db | null>,
): GalleryRepository {
  return {
    async list() {
      try {
        const db = await readDb();
        if (!db) return [];
        const documents = await db
          .collection<StoredGalleryItem>(COLLECTION_NAME)
          .find({}, { maxTimeMS: 4_000 })
          .sort({ createdAt: -1, _id: -1 })
          .toArray();
        return documents.map(toGalleryItem);
      } catch (error) {
        console.error("Gallery database read failed:", error);
        return [];
      }
    },

    async find(id) {
      try {
        const db = await readDb();
        if (!db) return null;
        const document = await db
          .collection<StoredGalleryItem>(COLLECTION_NAME)
          .findOne({ _id: id }, { maxTimeMS: 4_000 });
        return document ? toGalleryItem(document) : null;
      } catch (error) {
        console.error("Gallery database detail read failed:", error);
        return null;
      }
    },

    async create(input: GalleryInput & { imageUrl: string }) {
      const db = await requireDatabase(readDb);
      const now = new Date();
      const document: StoredGalleryItem = {
        _id: randomUUID(),
        title: input.title,
        description: input.description,
        alt: input.alt || input.title,
        imageUrl: input.imageUrl,
        objectKey: input.objectKey,
        width: input.width,
        height: input.height,
        ...(input.takenAt ? { takenAt: input.takenAt } : {}),
        createdAt: now,
        updatedAt: now,
      };
      await db.collection<StoredGalleryItem>(COLLECTION_NAME).insertOne(document);
      return toGalleryItem(document);
    },

    async update(id: string, input: GalleryUpdateInput) {
      const db = await requireDatabase(readDb);
      const unset: Record<string, ""> = {};
      if (!input.takenAt) unset.takenAt = "";
      const result = await db
        .collection<StoredGalleryItem>(COLLECTION_NAME)
        .findOneAndUpdate(
          { _id: id },
          {
            $set: {
              title: input.title,
              description: input.description,
              alt: input.alt || input.title,
              ...(input.takenAt ? { takenAt: input.takenAt } : {}),
              updatedAt: new Date(),
            },
            ...(Object.keys(unset).length ? { $unset: unset } : {}),
          },
          { returnDocument: "after" },
        );
      if (!result) throw new Error("ENTRY_NOT_FOUND");
      return toGalleryItem(result);
    },

    async delete(id) {
      const db = await requireDatabase(readDb);
      return (
        await db.collection<StoredGalleryItem>(COLLECTION_NAME).deleteOne({ _id: id })
      ).deletedCount > 0;
    },
  };
}
