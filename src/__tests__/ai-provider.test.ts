import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getAiProvider,
  OpenAiProvider,
  MockFallbackProvider,
} from "@/lib/ai/provider";

vi.mock("@/features/ai-config/infrastructure/data-repository", () => ({
  loadAiConfig: async () => ({
    activeProvider: "nara",
    naraModel: process.env.NARA_MODEL || "muse-spark-1.3-contributor-free",
    sumopodModel: process.env.SUMOPOD_MODEL || "mimo-v2.5",
  }),
}));

describe("AI Provider Selection & Factory", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NARA_API_KEY;
    delete process.env.NARA_BASE_URL;
    delete process.env.NARA_MODEL;
    delete process.env.SUMOPOD_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("prioritizes Nara AI Gateway when NARA_API_KEY is configured", async () => {
    process.env.NARA_API_KEY = "test-nara-key";
    process.env.NARA_BASE_URL = "https://router.bynara.id/v1";
    process.env.NARA_MODEL = "muse-spark-1.3-contributor-free";
    process.env.SUMOPOD_API_KEY = "test-sumopod-key";

    const { provider, mode } = await getAiProvider();

    expect(mode).toBe("live");
    expect(provider).toBeInstanceOf(OpenAiProvider);
    expect(provider.name).toBe("Nara AI");
  });

  it("uses default Nara base URL and model if only NARA_API_KEY is given", async () => {
    process.env.NARA_API_KEY = "test-nara-key";

    const { provider, mode } = await getAiProvider();

    expect(mode).toBe("live");
    expect(provider.name).toBe("Nara AI");
  });

  it("falls back to SumoPod AI Gateway when NARA_API_KEY is missing but SUMOPOD_API_KEY is present", async () => {
    process.env.SUMOPOD_API_KEY = "test-sumopod-key";
    process.env.SUMOPOD_BASE_URL = "https://ai.sumopod.com/v1";
    process.env.SUMOPOD_MODEL = "mimo-v2.5";

    const { provider, mode } = await getAiProvider();

    expect(mode).toBe("live");
    expect(provider).toBeInstanceOf(OpenAiProvider);
    expect(provider.name).toBe("SumoPod AI");
  });

  it("falls back to MockFallbackProvider in simulated mode when no API keys are set", async () => {
    const { provider, mode } = await getAiProvider();

    expect(mode).toBe("simulated");
    expect(provider).toBeInstanceOf(MockFallbackProvider);
    expect(provider.name).toBe("Simulated Portfolio AI");
  });
});
