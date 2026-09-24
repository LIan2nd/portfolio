import { EDUCATION_ENTRIES, WORK_ENTRIES } from "@/lib/data";
import { getMongoDb } from "@/lib/mongodb";
import type { TimelineEntry } from "@/lib/types";
import type { ExperienceEntry } from "../domain/types";
import { createMongoExperienceRepository } from "./mongodb-repository";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toExperience(
  entry: TimelineEntry,
  kind: "work" | "education",
  index: number,
): ExperienceEntry {
  const highlights = entry.description ?? [];
  return {
    id: `${kind}-${slugify(entry.title) || index + 1}`,
    title: entry.title,
    organization: entry.subtitle,
    kind,
    dateRange: entry.dateRange,
    description: highlights[0] ?? `${entry.title} at ${entry.subtitle}`,
    highlights,
    logo: entry.logo,
  };
}

function readExperienceSeeds(): ExperienceEntry[] {
  return [
    ...WORK_ENTRIES.map((entry, index) =>
      toExperience(entry, "work", index),
    ),
    ...EDUCATION_ENTRIES.map((entry, index) =>
      toExperience(entry, "education", index),
    ),
  ];
}

const repository = createMongoExperienceRepository(
  getMongoDb,
  readExperienceSeeds,
);

export const loadExperienceEntries = repository.loadExperienceEntries;
export const saveExperienceEntry = repository.saveExperienceEntry!;
export const deleteExperienceEntry = repository.deleteExperienceEntry!;

function findOriginalEntry(entry: ExperienceEntry) {
  const source = entry.kind === "work" ? WORK_ENTRIES : EDUCATION_ENTRIES;
  return source.find(
    (original) =>
      slugify(original.title) === slugify(entry.title) ||
      entry.id.includes(slugify(original.title)),
  );
}

function toTimelineEntry(entry: ExperienceEntry): TimelineEntry {
  const original = findOriginalEntry(entry);
  const logo = entry.logo || original?.logo;
  return {
    logo,
    icon: logo
      ? original?.icon
      : entry.kind === "work"
        ? "briefcase"
        : "graduation-cap",
    dateRange: entry.dateRange,
    title: entry.title,
    subtitle: entry.organization,
    description:
      entry.highlights.length > 0
        ? [...entry.highlights]
        : [entry.description],
    certificate: original?.certificate,
    link: original?.link,
  };
}

export async function loadTimelineEntries(): Promise<{
  work: TimelineEntry[];
  education: TimelineEntry[];
}> {
  const entries = await loadExperienceEntries();
  return {
    work: entries.filter((entry) => entry.kind === "work").map(toTimelineEntry),
    education: entries
      .filter((entry) => entry.kind === "education")
      .map(toTimelineEntry),
  };
}
