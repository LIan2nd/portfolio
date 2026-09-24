import type { ProjectEntry } from "../domain/types";

export interface ProjectRepository {
  loadProjectEntries(): Promise<ProjectEntry[]> | ProjectEntry[];
  saveProjectEntry?(
    input: {
      id?: string;
      title: string;
      description: string;
      icon: string;
      url?: string;
      image?: string;
    },
    isEdit?: boolean,
  ): Promise<ProjectEntry> | ProjectEntry;
  deleteProjectEntry?(id: string): Promise<boolean> | boolean;
}

export interface ProjectService {
  list(searchParams?: URLSearchParams): Promise<{ items: ProjectEntry[] }>;
  find(id: string): Promise<ProjectEntry | null>;
  create(input: {
    id?: string;
    title: string;
    description: string;
    icon?: string;
    url?: string;
    image?: string;
  }): Promise<ProjectEntry>;
  update(
    id: string,
    input: {
      title: string;
      description: string;
      icon?: string;
      url?: string;
      image?: string;
    },
  ): Promise<ProjectEntry>;
  delete(id: string): Promise<boolean>;
}

export function createProjectService(
  repository: ProjectRepository,
): ProjectService {
  return {
    async list(searchParams) {
      const entries = await repository.loadProjectEntries();
      if (!searchParams) {
        return { items: entries };
      }

      const q = searchParams.get("q")?.toLowerCase().trim();

      const filtered = entries.filter((entry) => {
        const matchesQ =
          !q ||
          entry.title.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q);

        return matchesQ;
      });

      return { items: filtered };
    },

    async find(id) {
      const entries = await repository.loadProjectEntries();
      return entries.find((entry) => entry.id === id) ?? null;
    },

    async create(input) {
      if (!input.title?.trim() || !input.description?.trim()) {
        throw new Error("Invalid project data provided.");
      }
      if (!repository.saveProjectEntry) {
        throw new Error("Repository does not support saving project.");
      }
      return await repository.saveProjectEntry(
        {
          id: input.id?.trim() || undefined,
          title: input.title.trim(),
          description: input.description.trim(),
          icon: input.icon?.trim() || "notebook",
          url: input.url?.trim() || undefined,
          image: input.image?.trim() || undefined,
        },
        false,
      );
    },

    async update(id, input) {
      if (!id?.trim()) {
        throw new Error("Project ID is required.");
      }
      if (!input.title?.trim() || !input.description?.trim()) {
        throw new Error("Invalid project data provided.");
      }
      const entries = await repository.loadProjectEntries();
      const existing = entries.find((entry) => entry.id === id);
      if (!existing) {
        throw new Error("ENTRY_NOT_FOUND");
      }
      if (!repository.saveProjectEntry) {
        throw new Error("Repository does not support saving project.");
      }
      return await repository.saveProjectEntry(
        {
          id: id.trim(),
          title: input.title.trim(),
          description: input.description.trim(),
          icon: input.icon?.trim() || "notebook",
          url: input.url?.trim() || undefined,
          image: input.image?.trim() || undefined,
        },
        true,
      );
    },

    async delete(id) {
      if (!id?.trim()) {
        throw new Error("Project ID is required.");
      }
      const entries = await repository.loadProjectEntries();
      const existing = entries.find((entry) => entry.id === id);
      if (!existing) {
        return false;
      }
      if (!repository.deleteProjectEntry) {
        throw new Error("Repository does not support deleting project.");
      }
      return await repository.deleteProjectEntry(id);
    },
  };
}
