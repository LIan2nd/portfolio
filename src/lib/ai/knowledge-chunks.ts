import type { KnowledgeDocument } from "@/features/knowledge/domain/types";

export interface KnowledgeChunk {
  id: string;
  source: string;
  content: string;
  embedding?: number[];
}

export function buildKnowledgeChunks(
  documents: readonly KnowledgeDocument[],
): KnowledgeChunk[] {
  return documents.flatMap((document) => {
    if (document.id === "ai-system-prompt") return [];
    const source = `${document.id}.md`;
    const sections = document.content.trim().split(/(?=^##\s)/m);
    return sections.flatMap((section, index) => {
      const content = section.trim();
      const facts = content
        .replace(/^#.*$|^\s*-\s*\*\*Kategori:\*\*.*$|^---+$/gm, "")
        .trim();
      if (
        !facts ||
        /^##[^\n]*(?:instruksi|instructions|guidelines)/i.test(content)
      )
        return [];
      return [{ id: `${source}-${index}`, source, content }];
    });
  });
}
