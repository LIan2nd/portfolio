export interface ExperienceEntry {
  id: string;
  title: string;
  organization: string;
  kind: "work" | "education";
  dateRange: string;
  description: string;
  highlights: readonly string[];
  logo?: string;
}
