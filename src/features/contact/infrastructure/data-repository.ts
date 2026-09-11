import fs from "node:fs";
import path from "node:path";
import { getMongoDb } from "@/lib/mongodb";
import type { ContactMessage } from "../domain/types";

interface ContactStore {
  messages: ContactMessage[];
}

const STORE_PATH = path.join(process.cwd(), "src/lib/contact-store.json");

let inMemoryStore: ContactStore | null = null;

function readStore(): ContactStore {
  if (inMemoryStore) {
    return inMemoryStore;
  }
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      inMemoryStore = {
        messages: Array.isArray(parsed?.messages) ? parsed.messages : [],
      };
      return inMemoryStore;
    }
  } catch (error) {
    console.error("Failed to read contact store:", error);
  }
  inMemoryStore = { messages: [] };
  return inMemoryStore;
}

function writeStore(store: ContactStore): void {
  inMemoryStore = store;
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch {
    // Gracefully handle read-only file systems (like Vercel serverless functions)
  }
}

export async function loadContactMessages(): Promise<ContactMessage[]> {
  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection<ContactMessage>("contact_messages");
      const docs = await collection.find({}).sort({ createdAt: -1 }).toArray();

      if (docs.length > 0) {
        return docs.map((d) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          message: d.message,
          createdAt: d.createdAt,
          read: Boolean(d.read),
        }));
      }

      // If MongoDB collection is empty, seed with initial local messages if any
      const localStore = readStore();
      if (localStore.messages.length > 0) {
        try {
          await collection.insertMany(
            localStore.messages.map((m) => ({ ...m })),
          );
          return localStore.messages;
        } catch {}
      }
    }
  } catch (err) {
    console.error("[MongoDB Contact Read Error, fallback to local]:", err);
  }

  const store = readStore();
  return [...store.messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function saveContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<ContactMessage> {
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newMsg: ContactMessage = {
    id,
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
    createdAt: new Date().toISOString(),
    read: false,
  };

  try {
    const db = await getMongoDb();
    if (db) {
      await db.collection("contact_messages").insertOne({ ...newMsg });
    }
  } catch (err) {
    console.error("[MongoDB Contact Save Error]:", err);
  }

  const store = readStore();
  store.messages.unshift(newMsg);
  writeStore(store);

  return newMsg;
}

export async function markContactMessageRead(
  id: string,
  read: boolean,
): Promise<ContactMessage | null> {
  try {
    const db = await getMongoDb();
    if (db) {
      await db
        .collection("contact_messages")
        .updateOne({ id }, { $set: { read } });
      const doc = await db
        .collection<ContactMessage>("contact_messages")
        .findOne({ id });
      if (doc) {
        return {
          id: doc.id,
          name: doc.name,
          email: doc.email,
          message: doc.message,
          createdAt: doc.createdAt,
          read: Boolean(doc.read),
        };
      }
    }
  } catch (err) {
    console.error("[MongoDB Contact Update Error]:", err);
  }

  const store = readStore();
  const index = store.messages.findIndex((m) => m.id === id);
  if (index === -1) return null;

  store.messages[index] = {
    ...store.messages[index],
    read,
  };
  writeStore(store);
  return store.messages[index];
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (db) {
      const result = await db.collection("contact_messages").deleteOne({ id });
      if (result.deletedCount > 0) {
        const store = readStore();
        const index = store.messages.findIndex((m) => m.id === id);
        if (index !== -1) {
          store.messages.splice(index, 1);
          writeStore(store);
        }
        return true;
      }
    }
  } catch (err) {
    console.error("[MongoDB Contact Delete Error]:", err);
  }

  const store = readStore();
  const index = store.messages.findIndex((m) => m.id === id);
  if (index === -1) return false;

  store.messages.splice(index, 1);
  writeStore(store);
  return true;
}
