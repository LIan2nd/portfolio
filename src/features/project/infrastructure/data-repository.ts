import { PROJECTS } from "@/lib/data";
import { getMongoDb } from "@/lib/mongodb";
import type { Project } from "@/lib/types";
import type { ProjectEntry } from "../domain/types";
import { createMongoProjectRepository } from "./mongodb-repository";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readProjectSeeds(): ProjectEntry[] {
  return PROJECTS.map((entry, index) => ({
    id: `project-${slugify(entry.title) || index + 1}`,
    title: entry.title,
    description: entry.description,
    icon: entry.icon,
    url: entry.url,
    image: entry.image,
  }));
}

const repository = createMongoProjectRepository(getMongoDb, readProjectSeeds);

export const loadProjectEntries = repository.loadProjectEntries;
export const saveProjectEntry = repository.saveProjectEntry!;
export const deleteProjectEntry = repository.deleteProjectEntry!;

export async function loadPortfolioProjects(): Promise<Project[]> {
  return (await loadProjectEntries()).map((entry) => ({
    title: entry.title,
    description: entry.description,
    icon: entry.icon,
    url: entry.url,
    image: entry.image,
  }));
}
