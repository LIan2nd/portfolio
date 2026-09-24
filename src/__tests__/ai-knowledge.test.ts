import { describe, it, expect } from "vitest";
import {
  buildPortfolioKnowledge,
  shouldIncludeTypingFunFact,
} from "@/lib/ai/knowledge";
import { MockFallbackProvider } from "@/lib/ai/provider";
import { buildKnowledgeChunks } from "@/lib/ai/knowledge-chunks";
import { getRelevantContext } from "@/lib/ai/rag";
import { loadSeedKnowledgeDocuments } from "@/features/knowledge/infrastructure/markdown-repository";

describe("grouped AI knowledge", () => {
  it("separates behavior from facts that are edited in other groups", () => {
    const behavior = buildPortfolioKnowledge();
    expect(behavior).toContain("Privasi & Pasangan");
    expect(behavior).toContain("gebetan masa lalu");
    expect(behavior).toContain("prioritaskan pasangan saat ini");
    expect(behavior).not.toContain("Distia Fajar Familiati");
    expect(behavior).not.toContain("3.94");
    expect(behavior).not.toContain("7.000.000");
    expect(behavior).not.toContain("100++ WPM");
  });

  it("loads only the five canonical seed groups", () => {
    const documents = loadSeedKnowledgeDocuments();
    expect(documents.map(({ id }) => id).sort()).toEqual([
      "about_alfian",
      "ai-system-prompt",
      "current_activity",
      "education_experience",
      "projects",
    ]);
    expect(new Set(documents.map(({ category }) => category)).size).toBe(5);
    const chunks = buildKnowledgeChunks(documents);
    expect(
      chunks.some(
        ({ source }) =>
          source === "ai-system-prompt.md" || source === "data.ts",
      ),
    ).toBe(false);
    expect(
      chunks.filter(({ content }) =>
        content.includes("Distia Fajar Familiati"),
      ),
    ).toHaveLength(1);
    expect(
      chunks.filter(({ content }) => content.includes("7.000.000")),
    ).toHaveLength(1);
  });

  it("chunks each section once without also indexing a duplicate full document", () => {
    const chunks = buildKnowledgeChunks([
      {
        id: "sample",
        title: "Sample",
        category: "Profile",
        description: "",
        updatedAt: "",
        content:
          "# Sample\n\n## Identity\nUnique profile fact.\n\n## Skills\nUnique skill fact.",
      },
    ]);
    expect(chunks).toHaveLength(2);
    expect(
      chunks.filter(({ content }) => content.includes("Unique profile fact")),
    ).toHaveLength(1);
  });

  it("only enables typing facts for introductions, social identity, or direct questions", () => {
    for (const query of [
      "Tolong perkenalkan diri kamu",
      "Di mana aku bisa mencari kamu?",
      "Where can I find you?",
      "Berapa typing speed kamu?",
    ]) {
      expect(shouldIncludeTypingFunFact(query)).toBe(true);
      expect(buildPortfolioKnowledge(query)).toContain(
        "FUN FACT YANG DIIZINKAN",
      );
    }
    for (const query of [
      "Apa proyek unggulanmu?",
      "Apa email kamu?",
      "Kamu lagi sibuk apa?",
      "Portofoliomu keren",
    ]) {
      expect(shouldIncludeTypingFunFact(query)).toBe(false);
    }
  });

  it("retrieves typing facts from Profile only for allowed queries", async () => {
    const documents = loadSeedKnowledgeDocuments();
    const project = await getRelevantContext(
      "Ceritakan proyek ESAO",
      5,
      documents,
    );
    const intro = await getRelevantContext("Perkenalkan dirimu", 5, documents);
    expect(project).not.toContain("100++ WPM");
    expect(project).not.toContain("10fastfingers.com");
    expect(intro).toContain("100++ WPM");
    expect(intro).toContain("10fastfingers.com");
    expect(intro).not.toContain("Distia");
  });

  it("retrieves project status from Projects even when asked about current status", async () => {
    const context = await getRelevantContext(
      "Apa status RoadSense sekarang?",
      1,
      loadSeedKnowledgeDocuments(),
    );
    expect(context).toContain("projects.md");
    expect(context).toContain("RoadSense");
    expect(context).not.toContain("In Development");
    expect(context).not.toContain("Pantona");
  });

  it.each([
    ["Ceritakan semua proyekmu", "projects.md", "Proyek"],
    ["What are your projects?", "projects.md", "Proyek"],
    ["Siapa cewekmu?", "about_alfian.md", "Distia"],
    ["Berapa gajimu?", "current_activity.md", "7.000.000"],
    ["Apa status kelulusanmu?", "education_experience.md", "3.94"],
    ["What is your relationship status?", "about_alfian.md", "Distia"],
  ])("retrieves the owning group for %s", async (query, source, fact) => {
    const context = await getRelevantContext(
      query,
      1,
      loadSeedKnowledgeDocuments(),
    );
    expect(context).toContain(source);
    if (fact !== "Proyek") expect(context).toContain(fact);
  });

  it("keeps project status questions out of unrelated career sections", async () => {
    const context = await getRelevantContext(
      "Apa status RoadSense sekarang?",
      5,
      loadSeedKnowledgeDocuments(),
    );
    expect(context).toContain("RoadSense");
    expect(context).not.toContain("Pantona");
    expect(context).not.toContain("Expected Salary");
  });

  it("does not retrieve profile facts for a greeting", async () => {
    expect(
      await getRelevantContext("Hi!", 5, loadSeedKnowledgeDocuments()),
    ).toBe("");
  });

  it("keeps private relationship history out of fallback answers", async () => {
    const provider = new MockFallbackProvider();
    for (const content of [
      "halah boong",
      "affh ingyhhh",
      "siapa gebetan masa lalu?",
    ]) {
      const response = await provider.generateResponse([
        { role: "user", content },
      ]);
      expect(response).toContain("tidak dibagikan");
      expect(response).not.toContain("Distia");
    }
  });
});
