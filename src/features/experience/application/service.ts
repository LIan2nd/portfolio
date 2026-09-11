import type { ExperienceEntry } from "../domain/types";

export interface ExperienceRepository {
  loadExperienceEntries(): ExperienceEntry[];
  saveExperienceEntry?(
    input: {
      id?: string;
      title: string;
      organization: string;
      kind: "work" | "education";
      dateRange: string;
      description: string;
      highlights: string[];
      logo?: string;
    },
    isEdit?: boolean,
  ): ExperienceEntry;
  deleteExperienceEntry?(id: string): boolean;
}

export interface ExperienceService {
  list(searchParams?: URLSearchParams): Promise<{ items: ExperienceEntry[] }>;
  find(id: string): Promise<ExperienceEntry | null>;
  create(input: {
    id?: string;
    title: string;
    organization: string;
    kind: "work" | "education";
    dateRange: string;
    description: string;
    highlights: string[];
    logo?: string;
  }): Promise<ExperienceEntry>;
  update(
    id: string,
    input: {
      title: string;
      organization: string;
      kind: "work" | "education";
      dateRange: string;
      description: string;
      highlights: string[];
      logo?: string;
    },
  ): Promise<ExperienceEntry>;
  delete(id: string): Promise<boolean>;
}

export function createExperienceService(
  repository: ExperienceRepository,
): ExperienceService {
  return {
    async list(searchParams) {
      const entries = repository.loadExperienceEntries();
      if (!searchParams) {
        return { items: entries };
      }

      const q = searchParams.get("q")?.toLowerCase().trim();
      const kind = searchParams.get("kind")?.toLowerCase().trim();

      const filtered = entries.filter((entry) => {
        const matchesKind = !kind || entry.kind === kind;
        const matchesQ =
          !q ||
          entry.title.toLowerCase().includes(q) ||
          entry.organization.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q) ||
          entry.highlights.some((h) => h.toLowerCase().includes(q));

        return matchesKind && matchesQ;
      });

      return { items: filtered };
    },

    async find(id) {
      const entries = repository.loadExperienceEntries();
      return entries.find((entry) => entry.id === id) ?? null;
    },

    async create(input) {
      if (
        !input.title?.trim() ||
        !input.organization?.trim() ||
        !input.kind ||
        !["work", "education"].includes(input.kind) ||
        !input.dateRange?.trim() ||
        !input.description?.trim()
      ) {
        throw new Error("Invalid experience data provided.");
      }
      if (!repository.saveExperienceEntry) {
        throw new Error("Repository does not support saving experience.");
      }
      return repository.saveExperienceEntry(
        {
          id: input.id?.trim() || undefined,
          title: input.title.trim(),
          organization: input.organization.trim(),
          kind: input.kind,
          dateRange: input.dateRange.trim(),
          description: input.description.trim(),
          highlights: Array.isArray(input.highlights) ? input.highlights : [],
          logo: input.logo?.trim() || undefined,
        },
        false,
      );
    },

    async update(id, input) {
      if (!id?.trim()) {
        throw new Error("Entry ID is required.");
      }
      if (
        !input.title?.trim() ||
        !input.organization?.trim() ||
        !input.kind ||
        !["work", "education"].includes(input.kind) ||
        !input.dateRange?.trim() ||
        !input.description?.trim()
      ) {
        throw new Error("Invalid experience data provided.");
      }
      const existing = repository
        .loadExperienceEntries()
        .find((e) => e.id === id);
      if (!existing) {
        throw new Error("ENTRY_NOT_FOUND");
      }
      if (!repository.saveExperienceEntry) {
        throw new Error("Repository does not support saving experience.");
      }
      return repository.saveExperienceEntry(
        {
          id: id.trim(),
          title: input.title.trim(),
          organization: input.organization.trim(),
          kind: input.kind,
          dateRange: input.dateRange.trim(),
          description: input.description.trim(),
          highlights: Array.isArray(input.highlights) ? input.highlights : [],
          logo: input.logo?.trim() || undefined,
        },
        true,
      );
    },

    async delete(id) {
      if (!id?.trim()) {
        throw new Error("Entry ID is required.");
      }
      const existing = repository
        .loadExperienceEntries()
        .find((e) => e.id === id);
      if (!existing) {
        return false;
      }
      if (!repository.deleteExperienceEntry) {
        throw new Error("Repository does not support deleting experience.");
      }
      return repository.deleteExperienceEntry(id);
    },
  };
}
