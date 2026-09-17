import { knowledgeRepository } from "@/features/knowledge/composition";

export function isCurrentActivityQuery(query: string): boolean {
  return /\b(sekarang|saat ini|lagi apa|ngapain|ngerjain|kesibukan(?:mu)?|sibuk|aktivitas(?:mu)?|pantona|bootcamp|currently|doing now|these days|current (?:activity|activities|status)|status)\b/i.test(
    query,
  );
}

export async function readCurrentActivity(): Promise<string | null> {
  const documents = await knowledgeRepository.loadKnowledgeDocuments();
  const document = documents.find(({ id }) => id === "current_activity");
  if (!document) return null;

  // The fallback quotes facts, not the document's instructions for the model.
  const facts = document.content
    .split(/^##[^\n]*(?:instruksi|instructions|guidelines)[^\n]*$/im)[0]
    .replace(/^#\s+[^\n]*\n?/m, "")
    .replace(/^\s*-\s*\*\*Kategori:\*\*[^\n]*$/gm, "")
    .replace(/^---+\s*$/gm, "")
    .trim();

  return facts || null;
}
