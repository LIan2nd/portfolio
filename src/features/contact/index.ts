import "server-only";
import { createContactHandlers } from "./api/handlers";
import { createContactService } from "./application/service";
import {
  loadContactMessages,
  saveContactMessage,
  markContactMessageRead,
  deleteContactMessage,
} from "./infrastructure/data-repository";

const repository = {
  loadContactMessages,
  markContactMessageRead,
  deleteContactMessage,
};

export const contactHandlers = createContactHandlers(
  createContactService(repository),
  () => process.env.DASHBOARD_API_TOKEN,
);

export {
  loadContactMessages,
  saveContactMessage,
  markContactMessageRead,
  deleteContactMessage,
};
export {
  contactEventEmitter,
  emitContactEvent,
  type ContactEvent,
} from "./infrastructure/contact-event-emitter";
export type { ContactMessage } from "./domain/types";

