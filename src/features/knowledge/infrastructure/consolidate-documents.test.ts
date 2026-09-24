import { describe, expect, it } from "vitest";
import {
  consolidateKnowledgeDocuments,
  KNOWLEDGE_SCHEMA_VERSION,
  type PersistedKnowledgeDocument,
} from "./consolidate-documents";
import { loadSeedKnowledgeDocuments } from "./markdown-repository";

const seeds = loadSeedKnowledgeDocuments();
function stored(
  id: string,
  content: string,
  overrides: Partial<PersistedKnowledgeDocument> = {},
): PersistedKnowledgeDocument {
  return {
    id,
    title: id,
    description: "Saved knowledge",
    category: "Legacy",
    content,
    updatedAt: "2026-09-20T10:00:00.000Z",
    ...overrides,
  };
}
function consolidate(...documents: PersistedKnowledgeDocument[]) {
  return consolidateKnowledgeDocuments(seeds, documents);
}
function contentOf(documents: ReturnType<typeof consolidate>, id: string) {
  return documents.find((document) => document.id === id)!.content;
}

const graduation =
  "- **Pendidikan:** Sudah lulus S.Kom (Cumlaude, IPK 3.94) dari STT Terpadu Nurul Fikri.";
const availability =
  "- **Kesiapan Karir:** Siap bergabung untuk pekerjaan Full-time / Freelance (*Immediately Available*).";

describe("legacy knowledge consolidation", () => {
  it("keeps bundled facts once when only the current activity was edited", () => {
    const result = consolidate(
      stored(
        "current_activity",
        `# Activities\n\n## 📌 Status Terkini (Saat Ini)\n${graduation}\n- **Aktivitas Sehari-hari Saat Ini:**\n  - Pantona Phase2: Web Developer.\n  - Working at Example Company.\n${availability}`,
      ),
    );
    const career = contentOf(result, "current_activity");
    expect(career).toContain("Phase2: Web Developer");
    expect(career).toContain("Example Company");
    expect(career).not.toContain("QA & QC");
    expect(career).not.toContain("3.94");
    expect(
      result
        .map(({ content }) => content)
        .join("\n")
        .match(/3\.94/g),
    ).toHaveLength(1);
    expect(result).toHaveLength(5);
  });

  it("preserves other current facts when an additional activity is appended", () => {
    const result = consolidate(
      stored(
        "current_activity",
        "# Activities\n\n## 📌 Status Terkini (Saat Ini)\n- **New activity:** A community workshop.",
      ),
    );
    expect(contentOf(result, "current_activity")).toContain(
      "community workshop",
    );
    expect(contentOf(result, "current_activity")).toContain("Pantona");
  });

  it("moves a changed salary out of the old FAQ and keeps the newest value", () => {
    const earlier = stored(
      "another-about-me",
      "# FAQ\n\n## Expected Salary & Rate\n- **Full-time (Monthly):** IDR 15.000.000 per bulan.",
    );
    const later = stored(
      "current_activity",
      "# Career\n\n## Expected Salary & Rate\n- **Full-time:** IDR 18.000.000 per bulan.",
      { updatedAt: "2026-09-21T10:00:00.000Z" },
    );
    const result = consolidate(later, earlier);
    expect(result.some(({ id }) => id === "another-about-me")).toBe(false);
    expect(contentOf(result, "current_activity")).toContain("18.000.000");
    expect(contentOf(result, "current_activity")).not.toContain("15.000.000");
    expect(contentOf(result, "current_activity")).not.toContain("7.000.000");
    expect(contentOf(result, "about_alfian")).not.toContain("18.000.000");
  });

  it("replaces edited contact fields without losing other identity facts", () => {
    const result = consolidate(
      stored(
        "about_alfian",
        "# About\n\n- **Email:** updated@example.test\n\n## Custom note\nA unique personal fact.",
      ),
    );
    const profile = contentOf(result, "about_alfian");
    expect(profile).toContain("updated@example.test");
    expect(profile).not.toContain("alfiannurusyaid19@gmail.com");
    expect(profile).toContain("Alfian Nur Usyaid");
    expect(profile).toContain("A unique personal fact");
  });

  it("keeps a full rewrite of a legacy canonical document authoritative", () => {
    const content =
      "# My activity\n\nAn entirely new activity from the dashboard.";
    expect(
      contentOf(
        consolidate(stored("current_activity", content)),
        "current_activity",
      ),
    ).toBe(content);
  });

  it("keeps a project update without restoring its unchanged obsolete status", () => {
    const result = consolidate(
      stored(
        "roadsense",
        "# RoadSense\n\n- **Status:** In Development / Active Project\n\n## Features\nUpdated hazard reporting and unique new features.",
      ),
    );
    const projects = contentOf(result, "projects");
    expect(projects).toContain("Updated hazard reporting");
    expect(projects).not.toContain("In Development / Active Project");
    expect(projects).toContain("sudah selesai");
    expect(projects).toContain("Leath Notes");
    expect(result.some(({ id }) => id === "roadsense")).toBe(false);
  });

  it("routes edited lifecycle status to its project section", () => {
    const result = consolidate(
      stored(
        "current_activity",
        "# Activities\n\n## 🚀 Status Lifecycle Proyek & Riset\n- **RoadSense (GIS Navigation):** **MAINTENANCE** — *Lihat detail di `roadsense.md`*.",
      ),
    );
    expect(contentOf(result, "projects")).toContain("MAINTENANCE");
    expect(contentOf(result, "current_activity")).not.toContain("MAINTENANCE");
    const roadsense = contentOf(result, "projects")
      .split("## roadsense")[1]
      .split("## digiarc")[0];
    expect(roadsense).not.toContain("sudah selesai");
    expect(roadsense).not.toContain("roadsense.md");
  });

  it("never resurrects legacy fragments after a canonical save", () => {
    const canonical = stored(
      "current_activity",
      "# Career\n\nOnly my latest career facts.",
      { knowledgeSchemaVersion: KNOWLEDGE_SCHEMA_VERSION },
    );
    const legacy = stored(
      "another-about-me",
      "# FAQ\n\n## Expected Salary & Rate\n- **Full-time:** Old salary.",
      { updatedAt: "2026-09-22T10:00:00.000Z" },
    );
    const result = consolidate(canonical, legacy);
    expect(contentOf(result, "current_activity")).toBe(canonical.content);
    expect(result.find(({ id }) => id === "current_activity")?.category).toBe(
      "Career & Activity",
    );
    expect(
      result.find(({ id }) => id === "current_activity"),
    ).not.toHaveProperty("knowledgeSchemaVersion");
  });

  it("preserves custom documents and unknown sections without mutating inputs", () => {
    const custom = stored(
      "my-custom-topic",
      "# Custom\n\nOwner-authored knowledge.",
    );
    const legacy = stored(
      "campus_experience",
      "# Campus\n\n## Mentoring outside campus\nA unique saved detail.",
    );
    const snapshot = structuredClone([seeds, custom, legacy]);
    const result = consolidate(custom, legacy);
    expect(result.find(({ id }) => id === custom.id)).toEqual(custom);
    expect(contentOf(result, "education_experience")).toContain(
      "A unique saved detail",
    );
    expect([seeds, custom, legacy]).toEqual(snapshot);
  });

  it("retains additional AI rules while omitting copied default profile facts", () => {
    const result = consolidate(
      stored(
        "ai-system-prompt",
        "### PROFIL DIRIKU:\n- Nama: Alfian Nur Usyaid (Panggilan: Alfian / LIand)\n- Gelar & Lulusan: Sarjana Komputer (S.Kom) dengan predikat Cumlaude (IPK 3.94 / 4.00) dari STT Terpadu Nurul Fikri.\n- Spesialisasi: Fullstack Web Developer (Next.js, Laravel, Flask), AI Integration (LangChain, LLM APIs), dan Web3 (Solidity, IPFS).\n\n### Custom voice\nAlways keep the owner-specific voice.",
      ),
    );
    const behavior = contentOf(result, "ai-system-prompt");
    expect(behavior).toContain("owner-specific voice");
    expect(behavior).not.toContain("3.94");
    expect(behavior).not.toContain("Alfian Nur Usyaid");
  });
});
