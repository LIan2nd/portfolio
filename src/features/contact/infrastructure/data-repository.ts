import { randomUUID } from "node:crypto";
import type { Db } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";
import type { ContactMessage } from "../domain/types";

const COLLECTION_NAME = "contact_messages";

async function requireDatabase(readDb: () => Promise<Db | null>) {
  const db = await readDb();
  if (!db) throw new Error("Contact storage is unavailable.");
  return db;
}

function toContactMessage(document: ContactMessage): ContactMessage {
  return {
    id: document.id,
    name: document.name,
    email: document.email,
    message: document.message,
    createdAt: document.createdAt,
    read: Boolean(document.read),
  };
}

export function createMongoContactRepository(
  readDb: () => Promise<Db | null>,
) {
  return {
    async loadContactMessages(): Promise<ContactMessage[]> {
      const db = await requireDatabase(readDb);
      const documents = await db
        .collection<ContactMessage>(COLLECTION_NAME)
        .find({}, { maxTimeMS: 4_000 })
        .sort({ createdAt: -1 })
        .toArray();
      return documents.map(toContactMessage);
    },

    async saveContactMessage(input: {
      name: string;
      email: string;
      message: string;
    }): Promise<ContactMessage> {
      const db = await requireDatabase(readDb);
      const message: ContactMessage = {
        id: `msg-${randomUUID()}`,
        name: input.name.trim(),
        email: input.email.trim(),
        message: input.message.trim(),
        createdAt: new Date().toISOString(),
        read: false,
      };
      await db
        .collection<ContactMessage>(COLLECTION_NAME)
        .insertOne({ ...message });
      return message;
    },

    async markContactMessageRead(
      id: string,
      read: boolean,
    ): Promise<ContactMessage | null> {
      const db = await requireDatabase(readDb);
      const collection = db.collection<ContactMessage>(COLLECTION_NAME);
      const result = await collection.updateOne({ id }, { $set: { read } });
      if (result.matchedCount === 0) return null;
      const document = await collection.findOne({ id }, { maxTimeMS: 4_000 });
      return document ? toContactMessage(document) : null;
    },

    async deleteContactMessage(id: string): Promise<boolean> {
      const db = await requireDatabase(readDb);
      const result = await db
        .collection<ContactMessage>(COLLECTION_NAME)
        .deleteOne({ id });
      return result.deletedCount > 0;
    },
  };
}

const repository = createMongoContactRepository(getMongoDb);

export const loadContactMessages = repository.loadContactMessages;
export const saveContactMessage = repository.saveContactMessage;
export const markContactMessageRead = repository.markContactMessageRead;
export const deleteContactMessage = repository.deleteContactMessage;
