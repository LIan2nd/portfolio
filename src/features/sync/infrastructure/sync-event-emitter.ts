import { EventEmitter } from "node:events";

export type SyncEvent = {
  type: "content_update";
  resource: "experience" | "knowledge" | "project" | "contact" | "all";
  timestamp: number;
};

declare global {
  var __portfolioSyncEventEmitter: EventEmitter | undefined;
}

export const syncEventEmitter: EventEmitter =
  globalThis.__portfolioSyncEventEmitter ?? new EventEmitter();
syncEventEmitter.setMaxListeners(100);

if (process.env.NODE_ENV !== "production") {
  globalThis.__portfolioSyncEventEmitter = syncEventEmitter;
}

export function emitSyncEvent(event: Omit<SyncEvent, "timestamp">): void {
  syncEventEmitter.emit("sync_event", { ...event, timestamp: Date.now() });
}
