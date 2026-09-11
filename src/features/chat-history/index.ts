import "server-only";
import { getMongoDb } from "@/lib/mongodb";
import { createHistoryHandlers } from "./api/handlers";
import { createChatHistoryService } from "./application/service";
import { createMongoChatHistoryRepository } from "./infrastructure/mongodb-repository";

const repository = createMongoChatHistoryRepository(getMongoDb);
export const historyHandlers = createHistoryHandlers(
  createChatHistoryService(repository),
  () => process.env.DASHBOARD_API_TOKEN,
);
