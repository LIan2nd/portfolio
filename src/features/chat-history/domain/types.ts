export interface ChatExchange {
  queryId: string;
  question: string;
  anonymousId: string;
  createdAt: string;
  response: {
    queryId: string;
    content: string;
    durationMs: number;
    createdAt: string;
  } | null;
}

export interface HistoryQuery {
  q: string;
  status: "" | "answered" | "missing";
  date: string;
  limit: number;
  cursor?: { id: string; createdAt: string };
}

export interface HistoryPage {
  items: ChatExchange[];
  nextCursor: string | null;
}

export interface HistorySummary {
  total: number;
  answered: number;
}

export interface ChatHistoryRepository {
  list(query: HistoryQuery): Promise<HistoryPage>;
  find(queryId: string): Promise<ChatExchange | null>;
  summarize(): Promise<HistorySummary>;
}
