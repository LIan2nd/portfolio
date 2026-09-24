import { knowledgeRepository } from "@/features/knowledge/composition";
import { isCurrentActivityQuery } from "./current-activity";
import {
  isIntroductionQuery,
  isSocialIdentityQuery,
  shouldIncludeTypingFunFact,
} from "./knowledge";
import type { KnowledgeDocument } from "@/features/knowledge/domain/types";
import { buildKnowledgeChunks, type KnowledgeChunk } from "./knowledge-chunks";

export { buildKnowledgeChunks } from "./knowledge-chunks";
export type { KnowledgeChunk } from "./knowledge-chunks";

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
  const embeddingKey =
    process.env.SUMOPOD_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl =
    process.env.SUMOPOD_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    "https://ai.sumopod.com/v1";
  const embeddingModel =
    process.env.SUMOPOD_EMBEDDING_MODEL || "gemini/gemini-embedding-001";

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
        },
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
 * Loads the current knowledge for each request so dashboard updates are visible
 * without rebuilding or restarting the Portfolio deployment.
 */
export async function loadAllKnowledgeChunks(): Promise<KnowledgeChunk[]> {
  try {
    return buildKnowledgeChunks(
      await knowledgeRepository.loadKnowledgeDocuments(),
    );
  } catch (error) {
    console.error("Knowledge chunks could not be loaded:", error);
    return buildKnowledgeChunks([]);
  }
}

const QUERY_SYNONYMS: Record<string, string[]> = {
  cewek: ["pasangan", "girlfriend"],
  girlfriend: ["pasangan", "cewek"],
  partner: ["pasangan"],
  relationship: ["pasangan", "cewek"],
  jomblo: ["pasangan", "cewek"],
  menikah: ["pasangan"],
  salary: ["gaji", "salary", "rate"],
  gaji: ["salary", "rate"],
  hire: ["kerja", "kontak"],
  availability: ["kesiapan", "kerja"],
  available: ["kesiapan", "kerja"],
  contact: ["kontak", "email"],
  skills: ["skill", "prinsip", "setup"],
  stack: ["skill", "setup"],
  education: ["akademik", "pendidikan"],
  kelulusan: ["akademik", "lulus"],
  lulusan: ["akademik", "lulus"],
  graduation: ["akademik", "lulus"],
  graduated: ["akademik", "lulus"],
  degree: ["akademik", "gelar"],
  kuliah: ["akademik", "asisten", "kampus"],
  experience: ["pengalaman", "asisten", "riset"],
  work: ["kerja", "pengalaman"],
  project: ["proyek"],
  projects: ["proyek"],
  proyek: ["proyek"],
  typing: ["mengetik", "10fastfingers"],
  ngetik: ["mengetik"],
  hobbies: ["hobi", "personal"],
  hobby: ["hobi", "personal"],
  certificate: ["sertifikasi", "sertifikat"],
  certifications: ["sertifikasi"],
  research: ["riset", "penelitian", "publikasi"],
  paper: ["jurnal", "publikasi"],
};

const STOP_WORDS = new Set(
  "apa itu kamu aku saya tentang ceritakan jelaskan bagaimana siapa mana berapa kapan semua yang dan dengan bisa dong what who where when is are your you the me tell about how can do my of a an to now saat ini sekarang status".split(
    " ",
  ),
);

function expandedQueryWords(query: string): string[] {
  const words = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}_-]+/u)
    .map((word) => (word.length > 4 ? word.replace(/(?:mu|ku)$/, "") : word))
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word));
  return [
    ...new Set(
      words.flatMap((word) => [word, ...(QUERY_SYNONYMS[word] ?? [])]),
    ),
  ];
}

function topicScore(
  query: string,
  chunk: KnowledgeChunk,
  projectMatches: ReadonlySet<string>,
): number {
  const title = chunk.content.split("\n")[0].toLowerCase();
  const source = chunk.source;
  if (projectMatches.has(chunk.id)) return 60;
  if (
    source === "projects.md" &&
    /\b(proyek|projects?)(?:mu|ku)?\b/i.test(query)
  )
    return 20;
  if (
    !projectMatches.size &&
    isCurrentActivityQuery(query) &&
    source === "current_activity.md"
  )
    return 20;
  if (
    isIntroductionQuery(query) &&
    source === "about_alfian.md" &&
    /identitas|skill/.test(title)
  )
    return 20;
  if (isSocialIdentityQuery(query) && /identitas|kontak/.test(title)) return 20;
  if (
    shouldIncludeTypingFunFact(query) &&
    /10fastfingers|mengetik/i.test(title)
  )
    return 15;
  return 0;
}

export async function getRelevantChunks(
  query: string,
  documents: readonly KnowledgeDocument[],
  topK = 5,
): Promise<KnowledgeChunk[]> {
  if (
    topK <= 0 ||
    !query.trim() ||
    /^(halo|hi|hai|hello|hey|pagi|siang|sore|malam|assalamu'alaikum|assalam|p)[\s!.]*$/i.test(
      query.trim(),
    )
  )
    return [];
  const words = expandedQueryWords(query);
  const chunks = buildKnowledgeChunks(documents).filter((chunk) => {
    const title = chunk.content.split("\n")[0];
    if (
      /10fastfingers|mengetik/i.test(title) &&
      !shouldIncludeTypingFunFact(query)
    )
      return false;
    if (
      /pasangan|life partner/i.test(title) &&
      !/pasangan|cewek|girlfriend|partner|relationship|distia|single|pacar|jomblo|menikah/i.test(
        query,
      )
    )
      return false;
    return true;
  });
  const projectMatches = new Set(
    chunks
      .filter(
        (chunk) =>
          chunk.source === "projects.md" &&
          words.some(
            (word) =>
              word.length >= 3 &&
              chunk.content.split("\n")[0].toLowerCase().includes(word),
          ),
      )
      .map(({ id }) => id),
  );
  const hasEmbeddings = chunks.some((chunk) => chunk.embedding?.length);
  const embedding = hasEmbeddings ? await getEmbedding(query) : [];
  return chunks
    .map((chunk) => {
      const text = chunk.content.toLowerCase();
      const title = text.split("\n")[0];
      const keywordScore = words.reduce(
        (score, word) =>
          score + (title.includes(word) ? 5 : text.includes(word) ? 2 : 0),
        0,
      );
      const vectorScore =
        embedding.length && chunk.embedding
          ? cosineSimilarity(embedding, chunk.embedding)
          : 0;
      return {
        chunk,
        score:
          keywordScore + topicScore(query, chunk, projectMatches) + vectorScore,
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk }) => chunk);
}

export async function getRelevantContext(
  query: string,
  topK = 5,
  documents?: readonly KnowledgeDocument[],
): Promise<string> {
  const currentDocuments =
    documents ?? (await knowledgeRepository.loadKnowledgeDocuments());
  const chunks = await getRelevantChunks(query, currentDocuments, topK);
  return chunks
    .map((chunk) => `Source: ${chunk.source}\n${chunk.content}`)
    .join("\n\n---\n\n");
}
