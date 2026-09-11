import type { ChatHistoryRepository } from "../domain/types";
import { InvalidHistoryQuery, isQueryId, parseHistoryQuery } from "./query";

export function createChatHistoryService(repository: ChatHistoryRepository) {
  return {
    list: (params: URLSearchParams) =>
      repository.list(parseHistoryQuery(params)),
    find: (queryId: string) => {
      if (!isQueryId(queryId))
        throw new InvalidHistoryQuery("Invalid query ID.");
      return repository.find(queryId);
    },
    summarize: () => repository.summarize(),
  };
}

export type ChatHistoryService = ReturnType<typeof createChatHistoryService>;
