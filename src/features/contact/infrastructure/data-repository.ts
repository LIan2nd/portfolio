import fs from "node:fs";
import path from "node:path";
import type { ContactMessage } from "../domain/types";

interface ContactStore {
  messages: ContactMessage[];
}

const STORE_PATH = path.join(process.cwd(), "src/lib/contact-store.json");

function readStore(): ContactStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        messages: Array.isArray(parsed?.messages) ? parsed.messages : [],
      };
    }
  } catch (error) {
    console.error("Failed to read contact store:", error);
  }
  return { messages: [] };
}

function writeStore(store: ContactStore): void {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write contact store:", error);
    throw new Error("Failed to persist contact store.");
  }
}

export function loadContactMessages(): ContactMessage[] {
  const store = readStore();
  // Return messages sorted newest first
  return [...store.messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function saveContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): ContactMessage {
  const store = readStore();
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newMsg: ContactMessage = {
    id,
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
    createdAt: new Date().toISOString(),
    read: false,
  };

  store.messages.unshift(newMsg);
  writeStore(store);
  return newMsg;
}

export function markContactMessageRead(
  id: string,
  read: boolean,
): ContactMessage | null {
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

export function deleteContactMessage(id: string): boolean {
  const store = readStore();
  const index = store.messages.findIndex((m) => m.id === id);
  if (index === -1) return false;

  store.messages.splice(index, 1);
  writeStore(store);
  return true;
}
