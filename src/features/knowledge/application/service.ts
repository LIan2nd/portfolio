import type { KnowledgeDocument } from "../domain/types";

export interface KnowledgeRepository {
  loadKnowledgeDocuments(): Promise<KnowledgeDocument[]>;
  saveKnowledgeDocument(input: SaveKnowledgeInput): Promise<KnowledgeDocument>;
}

export interface SaveKnowledgeInput {
  id?: string;
  title: string;
  category: string;
  description?: string;
  content: string;
}

export interface KnowledgeService {
  list(searchParams?: URLSearchParams): Promise<{ items: KnowledgeDocument[] }>;
  find(id: string): Promise<KnowledgeDocument | null>;
  create(input: SaveKnowledgeInput): Promise<KnowledgeDocument>;
  update(
    id: string,
    input: Omit<SaveKnowledgeInput, "id">,
  ): Promise<KnowledgeDocument>;
}

export function createKnowledgeService(
  repository: KnowledgeRepository,
): KnowledgeService {
  return {
    async list(searchParams) {
      const documents = await repository.loadKnowledgeDocuments();
      if (!searchParams) {
        return { items: documents };
      }

      const q = searchParams.get("q")?.toLowerCase().trim();
      const category = searchParams.get("category")?.toLowerCase().trim();

      const filtered = documents.filter((doc) => {
        const matchesQ =
          !q ||
          doc.title.toLowerCase().includes(q) ||
          doc.content.toLowerCase().includes(q) ||
          doc.description.toLowerCase().includes(q);

        const matchesCategory =
          !category || doc.category.toLowerCase() === category;

        return matchesQ && matchesCategory;
      });

      return { items: filtered };
    },

    async find(id) {
      const documents = await repository.loadKnowledgeDocuments();
      return documents.find((doc) => doc.id === id) ?? null;
    },

    async create(input) {
      if (
        !input.title?.trim() ||
        !input.category?.trim() ||
        !input.content?.trim()
      ) {
        throw new Error("Title, category, and content are required.");
      }
      return repository.saveKnowledgeDocument({
        id: input.id?.trim() || undefined,
        title: input.title.trim(),
        category: input.category.trim(),
        description: input.description?.trim(),
        content: input.content.trim(),
      });
    },

    async update(id, input) {
      if (!id?.trim()) {
        throw new Error("Document ID is required.");
      }
      if (
        !input.title?.trim() ||
        !input.category?.trim() ||
        !input.content?.trim()
      ) {
        throw new Error("Title, category, and content are required.");
      }
      const existing = (await repository.loadKnowledgeDocuments()).find(
        (document) => document.id === id,
      );
      if (!existing) {
        throw new Error("DOCUMENT_NOT_FOUND");
      }
      return repository.saveKnowledgeDocument({
        id: id.trim(),
        title: input.title.trim(),
        category: input.category.trim(),
        description: input.description?.trim(),
        content: input.content.trim(),
      });
    },
  };
}
