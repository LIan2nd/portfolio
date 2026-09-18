import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAiConfigHandlers } from "./handlers";
import { getAiProvider } from "@/lib/ai/provider";

const { loadConfig, saveConfig } = vi.hoisted(() => ({
  loadConfig: vi.fn(),
  saveConfig: vi.fn(),
}));
vi.mock("../infrastructure/data-repository", () => ({
  loadAiConfig: loadConfig,
  saveAiConfig: saveConfig,
  POPULAR_NARA_MODELS: [],
  POPULAR_SUMOPOD_MODELS: [],
}));
vi.mock("@/lib/ai/rag", () => ({
  getRelevantContext: async () => "Synthetic knowledge",
}));

const token = "synthetic-integration-token-00000000000000";
const handlers = createAiConfigHandlers(() => token);
function request(body: unknown, authorization = `Bearer ${token}`) {
  return new Request("http://localhost/api/admin/v1/ai-config/test", {
    method: "POST",
    headers: { authorization, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("SUMOPOD_API_KEY", "synthetic-key");
  vi.stubEnv("NARA_API_KEY", "synthetic-key");
  loadConfig.mockResolvedValue({
    activeProvider: "sumopod",
    naraModel: "default-nara",
    sumopodModel: "owner-model",
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("AI configuration API", () => {
  it("authenticates before testing a model or saving configuration", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(
      (
        await handlers.testModel(
          request({ provider: "nara", model: "test" }, ""),
        )
      ).status,
    ).toBe(401);
    expect(
      (await handlers.updateConfig(request({ activeProvider: "nara" }, "")))
        .status,
    ).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(saveConfig).not.toHaveBeenCalled();
  });

  it("awaits saved configuration before serializing it", async () => {
    saveConfig.mockResolvedValue({
      activeProvider: "sumopod",
      sumopodModel: "new-model",
    });
    const response = await handlers.updateConfig(
      request({ activeProvider: "sumopod", sumopodModel: "new-model" }),
    );
    expect(await response.json()).toMatchObject({
      activeProvider: "sumopod",
      sumopodModel: "new-model",
    });
  });

  it("does not report success when the database write fails", async () => {
    saveConfig.mockRejectedValue(new Error("Database unavailable"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(
      (await handlers.updateConfig(request({ activeProvider: "sumopod" })))
        .status,
    ).toBe(503);
  });

  it.each([
    null,
    { activeProvider: "unknown" },
    { naraModel: 5 },
    { sumopodModel: " " },
  ])("rejects invalid settings: %j", async (body) => {
    expect((await handlers.updateConfig(request(body))).status).toBe(400);
    expect(saveConfig).not.toHaveBeenCalled();
  });

  it("tests the same gateway, selected model, streaming and output budget as the chatbot", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(
        async () =>
          new Response(
            'data: {"choices":[{"delta":{"content":"READY"}}]}\n\ndata: [DONE]\n\n',
          ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const result = await handlers.testModel(
      request({ provider: "sumopod", model: "owner-model" }),
    );
    expect(await result.json()).toMatchObject({
      success: true,
      reply: "READY",
      model: "owner-model",
    });

    const { provider } = await getAiProvider();
    expect(provider.name).toBe("SumoPod AI");
    await new Response(
      await provider.generateStream([
        { role: "user", content: "My activities?" },
      ]),
    ).text();
    const testCall = fetchMock.mock.calls[0];
    const chatCall = fetchMock.mock.calls[1];
    expect(chatCall[0]).toBe(testCall[0]);
    const testBody = JSON.parse(testCall[1].body);
    const chatBody = JSON.parse(chatCall[1].body);
    for (const body of [testBody, chatBody]) {
      expect(body).toMatchObject({
        model: "owner-model",
        stream: true,
        max_tokens: 1500,
      });
      expect(body.messages[0].role).toBe("system");
    }
    expect(saveConfig).not.toHaveBeenCalled();
  });

  it("does not pass a non-streaming success response as a streaming test", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ choices: [{ message: { content: "READY" } }] }),
        ),
    );
    const result = await handlers.testModel(
      request({ provider: "sumopod", model: "test-model" }),
    );
    expect(await result.json()).toMatchObject({
      success: false,
      error: "The model returned no streaming content.",
    });
  });

  it("surfaces HTTP streaming failures without simulated replies", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("Unsupported streaming", { status: 400 }),
        ),
    );
    const result = await handlers.testModel(
      request({ provider: "nara", model: "test-model" }),
    );
    expect(await result.json()).toMatchObject({
      success: false,
      error: expect.stringContaining("HTTP 400"),
    });
  });
});
