import { describe, it, expect } from "vitest";
import { buildPortfolioKnowledge } from "@/lib/ai/knowledge";
import { MockFallbackProvider } from "@/lib/ai/provider";
import { loadAllKnowledgeChunks } from "@/lib/ai/rag";

describe("AI Knowledge & Anti-Hallucination Guardrails", () => {
  it("buildPortfolioKnowledge contains explicit loyalty and anti-hallucination rules", () => {
    const knowledge = buildPortfolioKnowledge();

    // Check Distia & Loyalty rules
    expect(knowledge).toContain("Distia Fajar Familiati");
    expect(knowledge).toContain("BATASAN PRIVASI");
    expect(knowledge).toContain("gebetan masa lalu");
    expect(knowledge).toContain("ZERO-TOLERANCE");

    // Check anti-boong and idol comparison rules
    expect(knowledge).toContain("BABYMONSTER");
    expect(knowledge).toContain("Ya jelas Distia lah");
    expect(knowledge).toContain("ga perlu dibahas");
  });

  it("MockFallbackProvider prioritizes Distia when comparing with BABYMONSTER / idols", async () => {
    const mock = new MockFallbackProvider();

    const resIndo = await mock.generateResponse([
      { role: "user", content: "lebih suka ahyeon apa distia?" },
    ]);
    expect(resIndo.toLowerCase()).toContain("distia");
    expect(resIndo.toLowerCase()).not.toContain("gebetan");

    const resEn = await mock.generateResponse([
      { role: "user", content: "do you prefer ahyeon or your girlfriend distia?" },
    ]);
    expect(resEn.toLowerCase()).toContain("distia");
  });

  it("MockFallbackProvider defends truth without inventing past crush when teased", async () => {
    const mock = new MockFallbackProvider();

    const resBoong = await mock.generateResponse([
      { role: "user", content: "halah boong" },
    ]);
    expect(resBoong.toLowerCase()).toContain("distia");
    expect(resBoong.toLowerCase()).not.toContain("memang sempat ada");

    const resAffh = await mock.generateResponse([
      { role: "user", content: "affh ingyhhh" },
    ]);
    expect(resAffh.toLowerCase()).toContain("distia");
    expect(resAffh.toLowerCase()).not.toContain("memang sempat ada");
  });

  it("loads all knowledge chunks including another-about-me without errors", () => {
    const chunks = loadAllKnowledgeChunks();
    expect(chunks.length).toBeGreaterThan(0);

    const partnerChunk = chunks.find(
      (c) => c.content.includes("Distia") && c.content.includes("Kesetiaan")
    );
    expect(partnerChunk).toBeDefined();
  });
});
