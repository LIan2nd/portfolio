import type { KnowledgeDocument } from "@/features/knowledge/domain/types";
import { buildPortfolioKnowledge } from "./knowledge";

export interface KnowledgeChunk {
  id: string;
  source: string;
  content: string;
  embedding?: number[];
}

export function buildKnowledgeChunks(
  documents: readonly KnowledgeDocument[],
): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  const coreSections = buildPortfolioKnowledge().split("### ");

  coreSections.forEach((section, index) => {
    if (section.trim()) {
      chunks.push({
        id: `core-data-${index}`,
        source: "data.ts",
        content: `### ${section.trim()}`,
      });
    }
  });

  for (const document of documents) {
    if (document.id === "ai-system-prompt") continue;
    const source = `${document.id}.md`;
    const content = document.content.trim();

    if (!content) continue;

    chunks.push({
      id: `${source}-full`,
      source,
      content,
    });

    const sections = content.split(/(?=\n##\s)/g);
    if (sections.length > 1) {
      sections.forEach((section, index) => {
        const trimmed = section.trim();
        if (trimmed.length > 10) {
          chunks.push({
            id: `${source}-${index}`,
            source,
            content: trimmed,
          });
        }
      });
    }
  }

  return chunks;
}
