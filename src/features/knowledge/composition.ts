import { getMongoDb } from "@/lib/mongodb";
import { loadSeedKnowledgeDocuments } from "./infrastructure/markdown-repository";
import { createMongoKnowledgeRepository } from "./infrastructure/mongodb-repository";

export const knowledgeRepository = createMongoKnowledgeRepository(
  getMongoDb,
  loadSeedKnowledgeDocuments,
);
