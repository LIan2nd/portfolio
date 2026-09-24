import { knowledgeRepository } from "@/features/knowledge/composition";
import { buildPortfolioKnowledge } from "./knowledge";
import { getRelevantContext } from "./rag";

export async function loadSystemPrompt(query: string): Promise<string> {
  const documents = await knowledgeRepository.loadKnowledgeDocuments();
  const behavior = documents.find(
    ({ id }) => id === "ai-system-prompt",
  )?.content;
  const context = await getRelevantContext(query, 5, documents);
  return `${buildPortfolioKnowledge(query, behavior)}\n\n### RELEVANT RETRIEVED CONTEXT (RAG):\n${context}`;
}
