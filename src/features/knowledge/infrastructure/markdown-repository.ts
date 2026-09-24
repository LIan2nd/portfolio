import fs from "node:fs";
import path from "node:path";
import { DEFAULT_AI_BEHAVIOR } from "@/lib/ai/knowledge";
import type { KnowledgeDocument } from "../domain/types";
import { isKnowledgeGroup, KNOWLEDGE_GROUPS } from "../domain/groups";

let cachedDocuments: KnowledgeDocument[] | null = null;

function parseTitle(content: string, filename: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].replace(/^(Proyek\s*(Web|Riset|Backend)?:\s*)/i, "").trim();
  }
  return filename.replace(/[-_]/g, " ");
}

function parseCategory(content: string, docId: string): string {
  if (isKnowledgeGroup(docId)) {
    return KNOWLEDGE_GROUPS[docId].category;
  }
  const match = content.match(/-\s+\*\*Kategori:\*\*\s*(.+)$/m);
  if (match) {
    return match[1].trim();
  }
  return "General";
}

export function parseKnowledgeDescription(content: string): string {
  // Try to find summary after ## Ringkasan or Overview
  const summaryMatch = content.match(
    /##\s+[^\n]*(?:Ringkasan|Overview)[^\n]*\n+([\s\S]*?)(?=\n\n|\n##|\n---|$)/i,
  );
  if (summaryMatch && summaryMatch[1].trim()) {
    return summaryMatch[1]
      .replace(/[*_#`]/g, "")
      .trim()
      .split("\n")[0];
  }

  // Fallback: look for the first non-bullet, non-header paragraph
  const paragraphs = content.split(/\n\n+/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("-") &&
      !trimmed.startsWith("---")
    ) {
      return trimmed
        .replace(/[*_#`]/g, "")
        .trim()
        .split("\n")[0];
    }
  }

  return "Context documentation for portfolio AI assistant.";
}

export function loadSeedKnowledgeDocuments(): KnowledgeDocument[] {
  if (cachedDocuments) {
    return cachedDocuments;
  }

  const documents: KnowledgeDocument[] = [];
  const knowledgeDir = path.join(process.cwd(), "src/lib/ai/knowledge");

  try {
    if (fs.existsSync(knowledgeDir)) {
      const files = fs.readdirSync(knowledgeDir);
      for (const file of files) {
        if (!file.endsWith(".md")) continue;
        const filePath = path.join(knowledgeDir, file);
        const stats = fs.statSync(filePath);
        const rawText = fs.readFileSync(filePath, "utf-8").trim();
        const docId = file.replace(/\.md$/, "");

        if (rawText.length > 0) {
          documents.push({
            id: docId,
            title: isKnowledgeGroup(docId)
              ? KNOWLEDGE_GROUPS[docId].title
              : parseTitle(rawText, docId),
            description: isKnowledgeGroup(docId)
              ? KNOWLEDGE_GROUPS[docId].description
              : parseKnowledgeDescription(rawText),
            category: parseCategory(rawText, docId),
            content: rawText,
            updatedAt: stats.mtime.toISOString(),
          });
        }
      }
    }
  } catch (error) {
    console.error("Error reading markdown knowledge directory:", error);
  }

  documents.push({
    id: "ai-system-prompt",
    title: KNOWLEDGE_GROUPS["ai-system-prompt"].title,
    description:
      "Aturan gaya bicara, privasi, navigasi, dan penggunaan fakta oleh AI.",
    category: "AI Behavior",
    content: DEFAULT_AI_BEHAVIOR,
    updatedAt: new Date().toISOString(),
  });

  cachedDocuments = documents;
  return documents;
}
