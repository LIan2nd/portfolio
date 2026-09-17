import "server-only";
import { createKnowledgeHandlers } from "./api/handlers";
import { createKnowledgeService } from "./application/service";
import { knowledgeRepository } from "./composition";

export const knowledgeHandlers = createKnowledgeHandlers(
  createKnowledgeService(knowledgeRepository),
  () => process.env.DASHBOARD_API_TOKEN,
);

export type { KnowledgeDocument } from "./domain/types";
