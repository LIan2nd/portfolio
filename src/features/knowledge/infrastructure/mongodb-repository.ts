import { randomUUID } from "node:crypto";
import type { Db } from "mongodb";
import type {
  KnowledgeRepository,
  SaveKnowledgeInput,
} from "../application/service";
import type { KnowledgeDocument } from "../domain/types";
import { parseKnowledgeDescription } from "./markdown-repository";

const COLLECTION_NAME = "ai_knowledge_documents";

interface StoredKnowledgeDocument {
  _id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  updatedAt: Date;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeContent(input: SaveKnowledgeInput) {
  let content = input.content.trim();
  if (!content.startsWith("#")) {
    content = `# ${input.title}\n\n${content}`;
  }
  if (content.includes("- **Kategori:**")) return content;

  const firstNewline = content.indexOf("\n");
  if (firstNewline === -1) {
    return `${content}\n\n- **Kategori:** ${input.category}`;
  }
  return `${content.slice(0, firstNewline)}\n\n- **Kategori:** ${input.category}${content.slice(firstNewline)}`;
}

function toDocument(stored: StoredKnowledgeDocument): KnowledgeDocument {
  return {
    id: stored._id,
    title: stored.title,
    description: stored.description,
    category: stored.category,
    content: stored.content,
    updatedAt: stored.updatedAt.toISOString(),
  };
}

function mergeDocuments(
  seeds: readonly KnowledgeDocument[],
  stored: readonly StoredKnowledgeDocument[],
) {
  const documents = new Map(seeds.map((document) => [document.id, document]));
  for (const document of stored) {
    documents.set(document._id, toDocument(document));
  }
  return [...documents.values()];
}

export function createMongoKnowledgeRepository(
  readDb: () => Promise<Db | null>,
  readSeeds: () => KnowledgeDocument[],
): KnowledgeRepository {
  async function readStoredDocuments() {
    const db = await readDb();
    if (!db) return [];
    return db
      .collection<StoredKnowledgeDocument>(COLLECTION_NAME)
      .find({}, { maxTimeMS: 4_000 })
      .sort({ updatedAt: -1 })
      .toArray();
  }

  return {
    async loadKnowledgeDocuments() {
      const seeds = readSeeds();
      try {
        return mergeDocuments(seeds, await readStoredDocuments());
      } catch (error) {
        console.error("Knowledge database read failed; using bundled seeds:", error);
        return seeds;
      }
    },

    async saveKnowledgeDocument(input) {
      const db = await readDb();
      if (!db) throw new Error("Knowledge storage is unavailable.");

      const id = slugify(input.id ?? input.title) || `doc-${randomUUID()}`;
      const content = normalizeContent(input);
      const updatedAt = new Date();
      const stored: StoredKnowledgeDocument = {
        _id: id,
        title: input.title,
        description:
          input.description?.trim() || parseKnowledgeDescription(content),
        category: input.category,
        content,
        updatedAt,
      };

      await db.collection<StoredKnowledgeDocument>(COLLECTION_NAME).updateOne(
        { _id: id },
        {
          $set: {
            title: stored.title,
            description: stored.description,
            category: stored.category,
            content: stored.content,
            updatedAt,
          },
        },
        { upsert: true },
      );

      return toDocument(stored);
    },
  };
}
