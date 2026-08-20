import fs from "fs";
import path from "path";
import { buildPortfolioKnowledge } from "./knowledge";

export interface KnowledgeChunk {
  id: string;
  source: string;
  content: string;
  embedding?: number[];
}

// In-memory cache for loaded chunks and pre-computed embeddings
let cachedChunks: KnowledgeChunk[] | null = null;

/**
 * Calculates cosine similarity between two numeric vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Generates text embedding via SumoPod / OpenAI-compatible / Gemini API
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const sumopodKey = process.env.SUMOPOD_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = process.env.SUMOPOD_BASE_URL || process.env.OPENAI_BASE_URL || "https://ai.sumopod.com/v1";
  const embeddingModel = process.env.SUMOPOD_EMBEDDING_MODEL || "gemini/gemini-embedding-001";

  // 1. SumoPod / OpenAI Compatible /embeddings endpoint
  if (sumopodKey) {
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sumopodKey}`,
        },
        body: JSON.stringify({
          model: embeddingModel,
          input: text.slice(0, 2048),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const vector = data.data?.[0]?.embedding;
        if (Array.isArray(vector) && vector.length > 0) {
          return vector;
        }
      }
    } catch (err) {
      // Fallback if network or model error
    }
  }

  // 2. Direct Google Gemini API fallback
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: {
              parts: [{ text: text.slice(0, 2048) }],
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.embedding?.values || [];
      }
    } catch (e) {
      // Fallback
    }
  }

  return [];
}

/**
 * Loads and chunks all Markdown documents from src/lib/ai/knowledge/
 * plus core data from data.ts dynamically
 */
export function loadAllKnowledgeChunks(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  // 1. Add core knowledge base from data.ts
  const coreContent = buildPortfolioKnowledge();
  const coreSections = coreContent.split("### ");
  coreSections.forEach((section, idx) => {
    if (section.trim()) {
      chunks.push({
        id: `core-data-${idx}`,
        source: "data.ts",
        content: `### ${section.trim()}`,
      });
    }
  });

  // 2. Read all Markdown files from src/lib/ai/knowledge/
  try {
    const knowledgeDir = path.join(process.cwd(), "src/lib/ai/knowledge");
    if (fs.existsSync(knowledgeDir)) {
      const files = fs.readdirSync(knowledgeDir);
      for (const file of files) {
        if (file.endsWith(".md")) {
          const filePath = path.join(knowledgeDir, file);
          const rawText = fs.readFileSync(filePath, "utf-8").trim();

          if (rawText.length > 0) {
            // Add entire file chunk for holistic context
            chunks.push({
              id: `${file}-full`,
              source: file,
              content: rawText,
            });

            // Also chunk by markdown sections (## Header) if multiple sections exist
            const sections = rawText.split(/(?=\n##\s)/g);
            if (sections.length > 1) {
              sections.forEach((sec, sIdx) => {
                const trimmed = sec.trim();
                if (trimmed.length > 10) {
                  chunks.push({
                    id: `${file}-${sIdx}`,
                    source: file,
                    content: trimmed,
                  });
                }
              });
            }
          }
        }
      }
    }
  } catch (e) {
    // Fallback gracefully
  }

  return chunks;
}

/**
 * Retrieves the Top-K most relevant knowledge chunks for a user query
 */
export async function getRelevantContext(
  query: string,
  topK = 5
): Promise<string> {
  const chunks = loadAllKnowledgeChunks();

  // Try Vector Embedding Search first
  const queryEmbedding = await getEmbedding(query);

  if (queryEmbedding.length > 0) {
    // Score each chunk
    const scored = await Promise.all(
      chunks.map(async (chunk) => {
        if (!chunk.embedding || chunk.embedding.length === 0) {
          chunk.embedding = await getEmbedding(chunk.content);
        }
        const score = cosineSimilarity(queryEmbedding, chunk.embedding);
        return { chunk, score };
      })
    );

    scored.sort((a, b) => b.score - a.score);
    const topChunks = scored.slice(0, topK).map((s) => s.chunk.content);
    return topChunks.join("\n\n---\n\n");
  }

  // Fast Keyword & Semantic Fallback if embedding is unavailable
  const normalizedQuery = query.toLowerCase();
  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length >= 2);

  // Common synonym expansion for Indonesian conversational queries
  const synonyms: Record<string, string[]> = {
    ngapain: ["aktivitas", "sehari-hari", "kegiatan", "bootcamp", "belajar", "pantona", "saat ini", "sekarang"],
    sekarang: ["saat ini", "terakhir", "sehari-hari", "aktivitas", "sedang"],
    cewek: ["pasangan", "distia", "girlfriend", "hubungan"],
    gaji: ["salary", "rate", "penghasilan", "harga"],
    kuliah: ["pendidikan", "stt", "nurul fikri", "skripsi", "jurnal", "ipk", "cumlaude"],
  };

  const expandedWords = new Set<string>(queryWords);
  for (const word of queryWords) {
    if (synonyms[word]) {
      synonyms[word].forEach((syn) => expandedWords.add(syn));
    }
  }

  const scored = chunks.map((chunk) => {
    const text = chunk.content.toLowerCase();
    let score = 0;
    for (const word of expandedWords) {
      if (text.includes(word)) score += 2;
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, topK).map((s) => s.chunk.content);
  return selected.join("\n\n---\n\n");
}
