import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { KnowledgeDocument } from "@/features/knowledge/domain/types";
import { buildPortfolioKnowledge } from "@/lib/ai/knowledge";
import { getRelevantContext } from "@/lib/ai/rag";
import {
  GeminiProvider,
  MockFallbackProvider,
  OpenAiProvider,
} from "@/lib/ai/provider";
import { POST } from "@/app/api/chat/route";

const { loadDocuments, logQuestion, logResponse } = vi.hoisted(() => ({
  loadDocuments: vi.fn<() => Promise<KnowledgeDocument[]>>(),
  logQuestion: vi.fn(),
  logResponse: vi.fn(),
}));

vi.mock("@/features/knowledge/composition", () => ({
  knowledgeRepository: { loadKnowledgeDocuments: loadDocuments },
}));
vi.mock("@/lib/ai/logger", () => ({
  logUserQuestion: logQuestion,
  logBotResponse: logResponse,
}));
vi.mock("@/features/ai-config/infrastructure/data-repository", () => ({
  loadAiConfig: () => ({ activeProvider: "nara", naraModel: "test-model" }),
}));

const activity: KnowledgeDocument = {
  id: "current_activity",
  title: "Aktivitas & Status Proyek Terkini",
  category: "Activities",
  description: "Current activities",
  content:
    "# Aktivitas & Status Proyek Terkini\n\n- **Kategori:** Activities\n\n## Status Terkini\n- Pantona: **Phase2: Web Developer**.\n- Bekerja sebagai SSE di **PT Boer Technology**, ditempatkan di bank BRI.\n\n---\n\n## Instruksi Menjawab untuk AI Clone:\nJawab berdasarkan informasi di atas.",
  updatedAt: "2026-09-17T10:00:00.000Z",
};
const messages = [
  { role: "user" as const, content: "btw, sekarang kesibukanmu ngapain?" },
];

beforeEach(() => {
  vi.clearAllMocks();
  loadDocuments.mockResolvedValue([activity]);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("current knowledge in chatbot answers", () => {
  it.each([
    messages[0].content,
    "Halo, apa kesibukanmu sekarang?",
    "What are you currently doing?",
  ])("retrieves current activities for %s", async (query) => {
    const context = await getRelevantContext(query);
    expect(context).toContain("Phase2: Web Developer");
    expect(context).toContain("PT Boer Technology");
    expect(context).not.toContain("QA & QC");
  });

  it("removes stale activity facts from the base prompt", () => {
    expect(buildPortfolioKnowledge()).not.toContain("tahap belajar QA & QC");
    expect(buildPortfolioKnowledge()).toContain("current_activity");
  });

  it("reads updates on successive fallback requests and strips model instructions", async () => {
    const provider = new MockFallbackProvider();
    const first = await provider.generateResponse(messages);
    expect(first).toContain("Phase2: Web Developer");
    expect(first).toContain("PT Boer Technology");
    expect(first).toContain("Layanan AI sedang tidak tersedia");
    expect(first).not.toContain("Instruksi Menjawab");
    expect(first).not.toContain("Jawab berdasarkan");
    expect(first).not.toContain("QA & QC");

    loadDocuments.mockResolvedValue([
      {
        ...activity,
        content: "# Activities\n\nUpdated again: working on a new project.",
      },
    ]);
    const second = await new Response(
      await provider.generateStream(messages),
    ).text();
    expect(second).toContain("Updated again");
    expect(second).not.toContain("Phase2");
  });

  it("does not invent old activities when knowledge is missing", async () => {
    loadDocuments.mockResolvedValue([]);
    const response = await new MockFallbackProvider().generateResponse(
      messages,
    );
    expect(response).toContain("belum bisa memastikan");
    expect(response).not.toContain("QA & QC");
  });

  it("sends fresh knowledge to the live model despite old conversation history", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          'data: {"choices":[{"delta":{"content":"Fresh answer"}}]}\n\ndata: [DONE]\n\n',
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const provider = new OpenAiProvider(
      "test-key",
      "https://ai.example/v1",
      "test-model",
    );
    const stream = await provider.generateStream([
      { role: "assistant", content: "Dulu tahap QA & QC" },
      ...messages,
    ]);
    expect(await new Response(stream).text()).toBe("Fresh answer");
    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    const prompt = requestBody.messages[0].content;
    expect(prompt).toContain("Phase2: Web Developer");
    expect(prompt).toContain("PT Boer Technology");
    expect(prompt).not.toContain("QA & QC");
    expect(prompt).toContain(
      "mengungguli data profil statis dan jawaban asisten sebelumnya",
    );
  });

  it.each([
    ["openai", "generateResponse"],
    ["openai", "generateStream"],
    ["gemini", "generateResponse"],
    ["gemini", "generateStream"],
  ] as const)(
    "uses saved behavior and one knowledge snapshot for %s %s",
    async (gateway, method) => {
      loadDocuments.mockResolvedValue([
        activity,
        {
          ...activity,
          id: "ai-system-prompt",
          category: "AI Behavior",
          content: "# Voice\nUse the owner's updated concise voice.",
        },
      ]);
      const response =
        gateway === "openai"
          ? { choices: [{ message: { content: "Fresh reply" } }] }
          : { candidates: [{ content: { parts: [{ text: "Fresh reply" }] } }] };
      const fetchMock = vi.fn().mockResolvedValue(Response.json(response));
      vi.stubGlobal("fetch", fetchMock);
      const provider =
        gateway === "openai"
          ? new OpenAiProvider(
              "test-key",
              "https://ai.example/v1",
              "test-model",
            )
          : new GeminiProvider("test-key", "test-model");

      await provider[method](messages);

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      const prompt =
        gateway === "openai"
          ? body.messages[0].content
          : body.system_instruction.parts[0].text;
      expect(prompt).toContain("owner's updated concise voice");
      expect(prompt).toContain("Phase2: Web Developer");
      expect(prompt).not.toContain("QA & QC");
      expect(prompt).not.toContain("3.94");
      expect(loadDocuments).toHaveBeenCalledTimes(1);
    },
  );

  it("reads edited profile facts in fallback answers without a stale hardcoded copy", async () => {
    const profile = {
      ...activity,
      id: "about_alfian",
      category: "Profile",
      content: "# Profile\n\n## Kontak\nEmail: updated@example.test",
    };
    loadDocuments.mockResolvedValue([profile]);
    const provider = new MockFallbackProvider();
    const question = [{ role: "user" as const, content: "Apa email kamu?" }];
    expect(await provider.generateResponse(question)).toContain(
      "updated@example.test",
    );
    loadDocuments.mockResolvedValue([
      { ...profile, content: profile.content.replace("updated@", "newest@") },
    ]);
    const response = await provider.generateResponse(question);
    expect(response).toContain("newest@example.test");
    expect(response).not.toContain("updated@example.test");
    expect(response).not.toContain("alfiannurusyaid19");
  });

  it("propagates Gemini HTTP failures before returning a stream", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response("Quota exceeded", { status: 429 })),
    );
    await expect(
      new GeminiProvider("test-key").generateStream(messages),
    ).rejects.toThrow("HTTP 429");
  });

  it.each([401, 429])(
    "labels and logs the real fallback mode on HTTP %s",
    async (status) => {
      vi.stubEnv("NARA_API_KEY", "test-key");
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("Unavailable", { status })),
      );
      const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
      try {
        const response = await POST(
          new NextRequest("https://portfolio.example/api/chat", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-forwarded-for": `192.0.2.${status % 255}`,
            },
            body: JSON.stringify({ messages }),
          }),
        );
        expect(response.headers.get("X-AI-Mode")).toBe("simulated");
        const text = await response.text();
        expect(text).toContain("Phase2: Web Developer");
        expect(text).not.toContain("QA & QC");
        expect(logQuestion).toHaveBeenCalledTimes(1);
        expect(logQuestion).toHaveBeenCalledWith(
          expect.objectContaining({ mode: "simulated" }),
        );
        expect(logResponse).toHaveBeenCalledWith(
          expect.objectContaining({ mode: "simulated", response: text }),
        );
        expect(errorLog).toHaveBeenCalled();
      } finally {
        errorLog.mockRestore();
      }
    },
  );
});
