import type { ContactMessage } from "../domain/types";

export interface ContactRepository {
  loadContactMessages(): ContactMessage[];
  markContactMessageRead?(id: string, read: boolean): ContactMessage | null;
  deleteContactMessage?(id: string): boolean;
}

export interface ContactService {
  list(searchParams?: URLSearchParams): Promise<{ items: ContactMessage[] }>;
  find(id: string): Promise<ContactMessage | null>;
  markRead(id: string, read: boolean): Promise<ContactMessage | null>;
  delete(id: string): Promise<boolean>;
}

export function createContactService(
  repository: ContactRepository,
): ContactService {
  return {
    async list(searchParams) {
      const messages = repository.loadContactMessages();
      if (!searchParams) {
        return { items: messages };
      }

      const q = searchParams.get("q")?.toLowerCase().trim();
      const status = searchParams.get("status")?.toLowerCase().trim();

      const filtered = messages.filter((msg) => {
        const matchesStatus =
          !status ||
          status === "all" ||
          (status === "unread" && !msg.read) ||
          (status === "read" && msg.read);

        const matchesQ =
          !q ||
          msg.name.toLowerCase().includes(q) ||
          msg.email.toLowerCase().includes(q) ||
          msg.message.toLowerCase().includes(q);

        return matchesStatus && matchesQ;
      });

      return { items: filtered };
    },

    async find(id) {
      const messages = repository.loadContactMessages();
      return messages.find((msg) => msg.id === id) ?? null;
    },

    async markRead(id, read) {
      if (!repository.markContactMessageRead) {
        throw new Error("Repository does not support updating contact messages.");
      }
      return repository.markContactMessageRead(id, read);
    },

    async delete(id) {
      if (!repository.deleteContactMessage) {
        throw new Error("Repository does not support deleting contact messages.");
      }
      return repository.deleteContactMessage(id);
    },
  };
}
