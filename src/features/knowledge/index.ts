import "server-only";
import { createKnowledgeHandlers } from "./api/handlers";
import { createKnowledgeService } from "./application/service";
import {
  loadKnowledgeDocuments,
  clearKnowledgeCache,
  saveKnowledgeDocument,
} from "./infrastructure/markdown-repository";

const repository = {
  loadKnowledgeDocuments,
  saveKnowledgeDocument,
};

export const knowledgeHandlers = createKnowledgeHandlers(
  createKnowledgeService(repository),
  () => process.env.DASHBOARD_API_TOKEN,
);

export { loadKnowledgeDocuments, clearKnowledgeCache };
export type { KnowledgeDocument } from "./domain/types";
