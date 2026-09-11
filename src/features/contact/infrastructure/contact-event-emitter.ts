import { EventEmitter } from "node:events";
import type { ContactMessage } from "../domain/types";

export type ContactEvent =
  | {
      type: "new_message";
      message: ContactMessage;
    }
  | {
      type: "message_read";
      id: string;
      read: boolean;
    }
  | {
      type: "message_deleted";
      id: string;
    };

declare global {
  var __portfolioContactEventEmitter: EventEmitter | undefined;
}

export const contactEventEmitter: EventEmitter =
  globalThis.__portfolioContactEventEmitter ?? new EventEmitter();
contactEventEmitter.setMaxListeners(100);

if (process.env.NODE_ENV !== "production") {
  globalThis.__portfolioContactEventEmitter = contactEventEmitter;
}

export function emitContactEvent(event: ContactEvent): void {
  contactEventEmitter.emit("contact_event", event);
}
