import { describe, it, expect } from "vitest";
import {
  buildPortfolioKnowledge,
  shouldIncludeTypingFunFact,
} from "@/lib/ai/knowledge";
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

  it("only enables the typing fact for introductions, broad social identity, or direct questions", () => {
    expect(shouldIncludeTypingFunFact("Tolong perkenalkan diri kamu")).toBe(true);
    expect(shouldIncludeTypingFunFact("Di mana aku bisa mencari kamu?")).toBe(true);
    expect(shouldIncludeTypingFunFact("Where can I find you?")).toBe(true);
    expect(shouldIncludeTypingFunFact("Berapa typing speed kamu?")).toBe(true);
    expect(shouldIncludeTypingFunFact("Apa proyek unggulanmu?")).toBe(false);
    expect(shouldIncludeTypingFunFact("Apa email kamu?")).toBe(false);
    expect(shouldIncludeTypingFunFact("Kamu lagi sibuk apa?")).toBe(false);
    expect(shouldIncludeTypingFunFact("Portofoliomu keren")).toBe(false);
  });

  it("only exposes 10FastFingers data to the live model for an allowed query", () => {
    const unrelatedKnowledge = buildPortfolioKnowledge("Ceritakan proyek ESAO");
    const introductionKnowledge = buildPortfolioKnowledge("Perkenalkan dirimu");

    expect(unrelatedKnowledge).not.toContain("100++ WPM");
    expect(unrelatedKnowledge).not.toContain("10fastfingers.com");
    expect(introductionKnowledge).toContain("100++ WPM");
    expect(introductionKnowledge).toContain("10fastfingers.com");
  });

  it("keeps the fallback typing fun fact out of unrelated and single-detail answers", async () => {
    const mock = new MockFallbackProvider();
    const projectResponse = await mock.generateResponse([
      { role: "user", content: "Apa itu ESAO?" },
    ]);
    const emailResponse = await mock.generateResponse([
      { role: "user", content: "Apa email kamu?" },
    ]);
    const introductionResponse = await mock.generateResponse([
      { role: "user", content: "Tolong perkenalkan diri kamu" },
    ]);

    expect(projectResponse).not.toContain("100++ WPM");
    expect(emailResponse).not.toContain("100++ WPM");
    expect(introductionResponse).toContain("100++ WPM");
    expect(introductionResponse).toMatch(/100\+\+ WPM[\s\S]*\[NAV:/);
  });
});
