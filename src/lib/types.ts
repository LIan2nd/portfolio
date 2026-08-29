export interface Skill {
  name: string;
}

export interface PersonalDetail {
  label: string;
  value: string;
  isEmail?: boolean;
}

export interface SocialLink {
  platform: "instagram" | "github" | "linkedin";
  url: string;
  label: string;
}

export interface TimelineEntry {
  icon?: string;
  logo?: string;
  dateRange: string;
  title: string;
  subtitle: string;
  description?: string[];
  link?: { url: string; label: string };
  certificate?: { url: string; label?: string };
}

export interface Project {
  icon: string;
  title: string;
  description: string;
  url?: string;
  image?: string;
}

export interface Certification {
  title: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  credentialId?: string;
  logo?: string;
  skills?: string[];
}

export interface Publication {
  title: string;
  alternativeTitle: string;
  authors: string[];
  journal: string;
  year: string;
  url: string;
  doi: string;
  topics: string[];
}

export interface NavLink {
  label: string;
  href: string;
}

export type Theme = "dark" | "light";

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}
