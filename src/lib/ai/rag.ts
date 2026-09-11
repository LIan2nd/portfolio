import fs from "fs";
import path from "path";
import { buildPortfolioKnowledge } from "./knowledge";
import { loadKnowledgeDocuments } from "@/features/knowledge/infrastructure/markdown-repository";

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
 * Generates text embedding via Nara / SumoPod / OpenAI-compatible / Gemini API,
 * with graceful fallback to keyword & semantic scoring.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const embeddingKey = process.env.SUMOPOD_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = process.env.SUMOPOD_BASE_URL || process.env.OPENAI_BASE_URL || "https://ai.sumopod.com/v1";
  const embeddingModel = process.env.SUMOPOD_EMBEDDING_MODEL || "gemini/gemini-embedding-001";

  // 1. External OpenAI-compatible /embeddings endpoint (e.g. SumoPod, OpenAI)
  if (embeddingKey) {
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${embeddingKey}`,
        },
        body: JSON.stringify({
          model: embeddingModel,
          input: text.slice(0, 2048),
        }),
        signal: AbortSignal.timeout(2500),
      });

      if (response.ok) {
        const data = await response.json();
        const vector = data.data?.[0]?.embedding;
        if (Array.isArray(vector) && vector.length > 0) {
          return vector;
        }
      }
    } catch {
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
          signal: AbortSignal.timeout(2500),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.embedding?.values || [];
      }
    } catch {
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
  if (cachedChunks) {
    return cachedChunks;
  }

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

  // 2. Read all Markdown files from cached knowledge repository
  try {
    const documents = loadKnowledgeDocuments();
    for (const doc of documents) {
      if (doc.id === "ai-system-prompt") continue;
      const file = `${doc.id}.md`;
      const rawText = doc.content.trim();

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
  } catch (e) {
    // Fallback gracefully
  }

  cachedChunks = chunks;
  return chunks;
}

function isIntroductionQuery(text: string): boolean {
  const introPatterns = /^(halo|hi|hai|pagi|siang|sore|malam|assalamu'alaikum|assalam|p)\b/i;
  return introPatterns.test(text);
}

/**
 * Retrieves the Top-K most relevant knowledge chunks for a user query
 */
export async function getRelevantContext(
  query: string,
  topK = 5
): Promise<string> {
  const trimmed = query.trim();
  if (isIntroductionQuery(trimmed) || trimmed.length <= 3) {
    return "";
  }

  const chunks = loadAllKnowledgeChunks();
  if (chunks.length === 0) return "";

  // If any chunks have precomputed embeddings, try vector search
  const hasPrecomputed = chunks.some((c) => Array.isArray(c.embedding) && c.embedding.length > 0);
  if (hasPrecomputed) {
    try {
      const queryEmbedding = await getEmbedding(trimmed);
      if (queryEmbedding.length > 0) {
        const scored = chunks
          .filter((c) => Array.isArray(c.embedding) && c.embedding.length > 0)
          .map((chunk) => ({
            chunk,
            score: cosineSimilarity(queryEmbedding, chunk.embedding!),
          }));
        scored.sort((a, b) => b.score - a.score);
        const topChunks = scored.slice(0, topK).map((s) => s.chunk.content);
        if (topChunks.length > 0) {
          return topChunks.join("\n\n---\n\n");
        }
      }
    } catch {
      // Fallback to fast keyword scoring
    }
  }

  // Fast Keyword & Semantic Scoring with synonym expansion
  const normalizedQuery = trimmed.toLowerCase();
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
