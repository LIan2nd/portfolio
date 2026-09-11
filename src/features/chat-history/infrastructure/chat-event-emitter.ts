import { EventEmitter } from "node:events";
import type { ChatExchange } from "../domain/types";

export type ChatEvent =
  | {
      type: "user_question";
      exchange: ChatExchange;
    }
  | {
      type: "bot_response";
      queryId: string;
      response: NonNullable<ChatExchange["response"]>;
    };

declare global {
  var __portfolioChatEventEmitter: EventEmitter | undefined;
}

export const chatEventEmitter: EventEmitter =
  globalThis.__portfolioChatEventEmitter ?? new EventEmitter();
chatEventEmitter.setMaxListeners(100);

if (process.env.NODE_ENV !== "production") {
  globalThis.__portfolioChatEventEmitter = chatEventEmitter;
}

export function emitChatEvent(event: ChatEvent): void {
  chatEventEmitter.emit("chat_event", event);
}
