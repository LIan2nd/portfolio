import fs from "node:fs";
import path from "node:path";
import { WORK_ENTRIES, EDUCATION_ENTRIES } from "@/lib/data";
import type { TimelineEntry } from "@/lib/types";
import type { ExperienceEntry } from "../domain/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapToExperience(
  entry: TimelineEntry,
  kind: "work" | "education",
  index: number,
): ExperienceEntry {
  const slug = slugify(entry.title);
  const id = `${kind}-${slug || index + 1}`;
  const highlights = entry.description ?? [];
  const description = highlights[0] ?? `${entry.title} at ${entry.subtitle}`;

  return {
    id,
    title: entry.title,
    organization: entry.subtitle,
    kind,
    dateRange: entry.dateRange,
    description,
    highlights,
    logo: entry.logo,
  };
}

interface ExperienceStore {
  customEntries: ExperienceEntry[];
  overrides: Record<string, ExperienceEntry>;
  deletedIds?: string[];
}

const STORE_PATH = path.join(process.cwd(), "src/lib/experience-store.json");

function readStore(): ExperienceStore {
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
    console.error("Failed to read experience store:", error);
  }
  return { customEntries: [], overrides: {}, deletedIds: [] };
}

function writeStore(store: ExperienceStore): void {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write experience store:", error);
    throw new Error("Failed to persist experience store.");
  }
}

export function loadExperienceEntries(): ExperienceEntry[] {
  const work = WORK_ENTRIES.map((entry, index) =>
    mapToExperience(entry, "work", index),
  );
  const education = EDUCATION_ENTRIES.map((entry, index) =>
    mapToExperience(entry, "education", index),
  );

  const base = [...work, ...education];
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

export interface SaveExperienceInput {
  id?: string;
  title: string;
  organization: string;
  kind: "work" | "education";
  dateRange: string;
  description: string;
  highlights: string[];
  logo?: string;
}

export function saveExperienceEntry(
  input: SaveExperienceInput,
  isEdit = false,
): ExperienceEntry {
  const store = readStore();
  const logo = input.logo?.trim() || undefined;

  if (isEdit) {
    if (!input.id) {
      throw new Error("ID is required for editing an experience entry.");
    }
    const targetId = input.id;
    const updated: ExperienceEntry = {
      id: targetId,
      title: input.title,
      organization: input.organization,
      kind: input.kind,
      dateRange: input.dateRange,
      description: input.description,
      highlights: input.highlights,
      logo,
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
  const baseSlug = `${input.kind}-${slugify(input.title) || Date.now()}`;
  let docId = baseSlug;
  const existingEntries = loadExperienceEntries();
  if (existingEntries.some((e) => e.id === docId)) {
    docId = `${baseSlug}-${Date.now()}`;
  }

  const newEntry: ExperienceEntry = {
    id: docId,
    title: input.title,
    organization: input.organization,
    kind: input.kind,
    dateRange: input.dateRange,
    description: input.description,
    highlights: input.highlights,
    logo,
  };

  store.customEntries.push(newEntry);
  if (store.deletedIds?.includes(docId)) {
    store.deletedIds = store.deletedIds.filter((id) => id !== docId);
  }
  writeStore(store);
  return newEntry;
}

export function deleteExperienceEntry(id: string): boolean {
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

export function loadTimelineEntries(): {
  work: TimelineEntry[];
  education: TimelineEntry[];
} {
  const all = loadExperienceEntries();

  const work = all
    .filter((e) => e.kind === "work")
    .map((e) => {
      const original = WORK_ENTRIES.find(
        (w) => slugify(w.title) === slugify(e.title) || e.id.includes(slugify(w.title)),
      );
      const logo = e.logo || original?.logo || undefined;
      const icon = !logo ? "briefcase" : original?.icon;
      return {
        logo,
        icon,
        dateRange: e.dateRange,
        title: e.title,
        subtitle: e.organization,
        description:
          e.highlights && e.highlights.length > 0
            ? [...e.highlights]
            : [e.description],
        certificate: original?.certificate,
        link: original?.link,
      };
    });

  const education = all
    .filter((e) => e.kind === "education")
    .map((e) => {
      const original = EDUCATION_ENTRIES.find(
        (ed) => slugify(ed.title) === slugify(e.title) || e.id.includes(slugify(ed.title)),
      );
      const logo = e.logo || original?.logo || undefined;
      const icon = !logo ? "graduation-cap" : original?.icon;
      return {
        logo,
        icon,
        dateRange: e.dateRange,
        title: e.title,
        subtitle: e.organization,
        description:
          e.highlights && e.highlights.length > 0
            ? [...e.highlights]
            : [e.description],
        certificate: original?.certificate,
        link: original?.link,
      };
    });

  return { work, education };
}
