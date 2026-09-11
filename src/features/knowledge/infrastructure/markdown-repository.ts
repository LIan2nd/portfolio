import fs from "node:fs";
import path from "node:path";
import { buildPortfolioKnowledge } from "@/lib/ai/knowledge";
import type { KnowledgeDocument } from "../domain/types";

let cachedDocuments: KnowledgeDocument[] | null = null;

const CATEGORY_MAP: Record<string, string> = {
  about_alfian: "Profile",
  "another-about-me": "Profile & FAQ",
  campus_experience: "Education & Campus",
  chicken_yasaka: "Projects",
  current_activity: "Activities",
  digiarc: "Projects",
  esao_research: "Research & Projects",
  hrd_api: "Projects",
  l_movie: "Projects",
  leath_notes: "Projects",
  roadsense: "Projects",
  thesis_and_education: "Education & Research",
};

function parseTitle(content: string, filename: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].replace(/^(Proyek\s*(Web|Riset|Backend)?:\s*)/i, "").trim();
  }
  return filename.replace(/[-_]/g, " ");
}

function parseCategory(content: string, docId: string): string {
  if (CATEGORY_MAP[docId]) {
    return CATEGORY_MAP[docId];
  }
  const match = content.match(/-\s+\*\*Kategori:\*\*\s*(.+)$/m);
  if (match) {
    return match[1].trim();
  }
  return "General";
}

function parseDescription(content: string): string {
  // Try to find summary after ## Ringkasan or Overview
  const summaryMatch = content.match(
    /##\s+[^\n]*(?:Ringkasan|Overview)[^\n]*\n+([\s\S]*?)(?=\n\n|\n##|\n---|$)/i,
  );
  if (summaryMatch && summaryMatch[1].trim()) {
    return summaryMatch[1].replace(/[*_#`]/g, "").trim().split("\n")[0];
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
      return trimmed.replace(/[*_#`]/g, "").trim().split("\n")[0];
    }
  }

  return "Context documentation for portfolio AI assistant.";
}

export function loadKnowledgeDocuments(): KnowledgeDocument[] {
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
            title: parseTitle(rawText, docId),
            description: parseDescription(rawText),
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

  // Add system prompt / AI persona document from knowledge.ts
  const systemPromptContent = buildPortfolioKnowledge();
  documents.push({
    id: "ai-system-prompt",
    title: "AI Persona & System Guidelines",
    description:
      "Core system instructions, persona definition, guardrails, and knowledge synthesis from data.ts.",
    category: "AI Behavior",
    content: systemPromptContent,
    updatedAt: new Date().toISOString(),
  });

  cachedDocuments = documents;
  return documents;
}

export function clearKnowledgeCache(): void {
  cachedDocuments = null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface SaveKnowledgeInput {
  id?: string;
  title: string;
  category: string;
  description?: string;
  content: string;
}

export function saveKnowledgeDocument(
  input: SaveKnowledgeInput,
): KnowledgeDocument {
  const knowledgeDir = path.join(process.cwd(), "src/lib/ai/knowledge");
  if (!fs.existsSync(knowledgeDir)) {
    fs.mkdirSync(knowledgeDir, { recursive: true });
  }

  const rawId = input.id ? slugify(input.id) : slugify(input.title);
  const docId = rawId || `doc-${Date.now()}`;
  const filePath = path.join(knowledgeDir, `${docId}.md`);

  let content = input.content.trim();
  if (!content.startsWith("#")) {
    content = `# ${input.title}\n\n${content}`;
  }
  if (!content.includes("- **Kategori:**")) {
    const firstNewline = content.indexOf("\n");
    if (firstNewline !== -1) {
      content = `${content.slice(0, firstNewline)}\n\n- **Kategori:** ${input.category}${content.slice(firstNewline)}`;
    } else {
      content = `${content}\n\n- **Kategori:** ${input.category}`;
    }
  }

  fs.writeFileSync(filePath, content, "utf-8");
  clearKnowledgeCache();

  return {
    id: docId,
    title: input.title,
    category: input.category,
    description: input.description || parseDescription(content),
    content,
    updatedAt: new Date().toISOString(),
  };
}
