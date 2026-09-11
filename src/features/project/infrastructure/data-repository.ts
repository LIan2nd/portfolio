import fs from "node:fs";
import path from "node:path";
import { PROJECTS } from "@/lib/data";
import type { Project } from "@/lib/types";
import type { ProjectEntry } from "../domain/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapToProject(entry: Project, index: number): ProjectEntry {
  const slug = slugify(entry.title);
  const id = `project-${slug || index + 1}`;
  return {
    id,
    title: entry.title,
    description: entry.description,
    icon: entry.icon,
    url: entry.url,
    image: entry.image,
  };
}

interface ProjectStore {
  customEntries: ProjectEntry[];
  overrides: Record<string, ProjectEntry>;
  deletedIds?: string[];
}

const STORE_PATH = path.join(process.cwd(), "src/lib/project-store.json");

function readStore(): ProjectStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        customEntries: Array.isArray(parsed?.customEntries)
          ? parsed.customEntries
          : [],
        overrides:
          typeof parsed?.overrides === "object" && parsed.overrides !== null
            ? parsed.overrides
            : {},
        deletedIds: Array.isArray(parsed?.deletedIds) ? parsed.deletedIds : [],
      };
    }
  } catch (error) {
    console.error("Failed to read project store:", error);
  }
  return { customEntries: [], overrides: {}, deletedIds: [] };
}

function writeStore(store: ProjectStore): void {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write project store:", error);
    throw new Error("Failed to persist project store.");
  }
}

export function loadProjectEntries(): ProjectEntry[] {
  const base = PROJECTS.map((entry, index) => mapToProject(entry, index));
  const store = readStore();
  const deletedSet = new Set(store.deletedIds ?? []);

  const mergedBase = base
    .filter((entry) => !deletedSet.has(entry.id))
    .map((entry) => {
      return store.overrides[entry.id] ?? entry;
    });

  return [
    ...mergedBase,
    ...store.customEntries.filter((entry) => !deletedSet.has(entry.id)),
  ];
}

export interface SaveProjectInput {
  id?: string;
  title: string;
  description: string;
  icon: string;
  url?: string;
  image?: string;
}

export function saveProjectEntry(
  input: SaveProjectInput,
  isEdit = false,
): ProjectEntry {
  const store = readStore();
  const url = input.url?.trim() || undefined;
  const image = input.image?.trim() || undefined;
  const icon = input.icon?.trim() || "notebook";

  if (isEdit) {
    if (!input.id) {
      throw new Error("ID is required for editing a project entry.");
    }
    const targetId = input.id;
    const updated: ProjectEntry = {
      id: targetId,
      title: input.title,
      description: input.description,
      icon,
      url,
      image,
    };

    const customIndex = store.customEntries.findIndex(
      (e) => e.id === targetId,
    );
    if (customIndex !== -1) {
      store.customEntries[customIndex] = updated;
    } else {
      store.overrides[targetId] = updated;
    }
    if (store.deletedIds?.includes(targetId)) {
      store.deletedIds = store.deletedIds.filter((id) => id !== targetId);
    }
    writeStore(store);
    return updated;
  }

  // Creating new entry
  const baseSlug = `project-${slugify(input.title) || Date.now()}`;
  let docId = baseSlug;
  const existingEntries = loadProjectEntries();
  if (existingEntries.some((e) => e.id === docId)) {
    docId = `${baseSlug}-${Date.now()}`;
  }

  const newEntry: ProjectEntry = {
    id: docId,
    title: input.title,
    description: input.description,
    icon,
    url,
    image,
  };

  store.customEntries.push(newEntry);
  if (store.deletedIds?.includes(docId)) {
    store.deletedIds = store.deletedIds.filter((id) => id !== docId);
  }
  writeStore(store);
  return newEntry;
}

export function deleteProjectEntry(id: string): boolean {
  const store = readStore();
  let changed = false;

  const customIndex = store.customEntries.findIndex((e) => e.id === id);
  if (customIndex !== -1) {
    store.customEntries.splice(customIndex, 1);
    changed = true;
  }

  if (store.overrides[id]) {
    delete store.overrides[id];
    changed = true;
  }

  const deletedIds = store.deletedIds ?? [];
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    store.deletedIds = deletedIds;
    changed = true;
  }

  if (changed) {
    writeStore(store);
  }
  return true;
}

export function loadPortfolioProjects(): Project[] {
  return loadProjectEntries().map((entry) => ({
    title: entry.title,
    description: entry.description,
    icon: entry.icon,
    url: entry.url,
    image: entry.image,
  }));
}
