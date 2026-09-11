import type { KnowledgeDocument } from "../domain/types";

export interface KnowledgeRepository {
  loadKnowledgeDocuments(): KnowledgeDocument[];
  saveKnowledgeDocument?(input: {
    id?: string;
    title: string;
    category: string;
    description?: string;
    content: string;
  }): KnowledgeDocument;
}

export interface KnowledgeService {
  list(searchParams?: URLSearchParams): Promise<{ items: KnowledgeDocument[] }>;
  find(id: string): Promise<KnowledgeDocument | null>;
  create(input: {
    id?: string;
    title: string;
    category: string;
    description?: string;
    content: string;
  }): Promise<KnowledgeDocument>;
  update(
    id: string,
    input: {
      title: string;
      category: string;
      description?: string;
      content: string;
    },
  ): Promise<KnowledgeDocument>;
}

export function createKnowledgeService(
  repository: KnowledgeRepository,
): KnowledgeService {
  return {
    async list(searchParams) {
      const documents = repository.loadKnowledgeDocuments();
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
      const documents = repository.loadKnowledgeDocuments();
      return documents.find((doc) => doc.id === id) ?? null;
    },

    async create(input) {
      if (!input.title?.trim() || !input.category?.trim() || !input.content?.trim()) {
        throw new Error("Title, category, and content are required.");
      }
      if (!repository.saveKnowledgeDocument) {
        throw new Error("Repository does not support saving documents.");
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
      if (!input.title?.trim() || !input.category?.trim() || !input.content?.trim()) {
        throw new Error("Title, category, and content are required.");
      }
      const existing = repository.loadKnowledgeDocuments().find((d) => d.id === id);
      if (!existing) {
        throw new Error("DOCUMENT_NOT_FOUND");
      }
      if (!repository.saveKnowledgeDocument) {
        throw new Error("Repository does not support saving documents.");
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
