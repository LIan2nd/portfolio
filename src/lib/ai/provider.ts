import { loadSystemPrompt } from "./prompt";
import { getRelevantChunks } from "./rag";
import { knowledgeRepository } from "@/features/knowledge/composition";
import type { AiGateway } from "@/features/ai-config/domain/types";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AiProvider {
  name: string;
  generateResponse(messages: ChatMessage[]): Promise<string>;
  generateStream(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>>;
}

/**
 * Helper to encode text chunks into Uint8Array stream
 */
function createTextStream(
  chunks: string[],
  delayMs = 25,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        if (delayMs > 0) {
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
      controller.close();
    },
  });
}

/**
 * Helper to detect whether a message or context is primarily English
 */
export function isEnglishText(msg: string): boolean {
  const englishKeywords = [
    "tell me",
    "how can",
    "how to",
    "what is",
    "what are",
    "hire",
    "contact",
    "skills",
    "publication",
    "paper",
    "about",
    "who are",
    "why",
    "where",
    "can you",
    "project",
    "projects",
    "work",
    "experience",
    "resume",
    "cv",
    "salary",
    "grading",
    "navigation",
    "storage",
    "hello",
    "hi",
    "hey",
    "english",
    "indonesian",
    "answer in",
    "speak",
    "everything",
    "all about",
    "full story",
    "details",
  ];
  const indonesianKeywords = [
    "kamu",
    "aku",
    "proyek",
    "cewek",
    "pacar",
    "kontak",
    "kesibukan",
    "ngapain",
    "kuliah",
    "jalan",
    "bahasa",
    "hubungi",
    "sarkas",
    "siapa",
    "kenapa",
    "dimana",
    "bisa",
    "halo",
    "hai",
    "ngoding",
    "lagi apa",
    "sekarang",
    "udah",
    "keseluruhan",
    "tentang kamu",
    "semua",
    "kelewat",
    "jelasin",
    "ceritain",
    "lengkap",
  ];

  const lower = msg.toLowerCase().trim();
  const hasIndo = indonesianKeywords.some((w) => lower.includes(w));
  const hasEng = englishKeywords.some((w) => lower.includes(w));

  if (hasEng && !hasIndo) return true;
  if (
    !hasIndo &&
    /[a-z]/i.test(lower) &&
    (lower.includes("how") ||
      lower.includes("what") ||
      lower.includes("why") ||
      lower.includes("tell") ||
      lower.includes("hire") ||
      lower.includes("contact") ||
      lower.includes("everything") ||
      lower.includes("all"))
  ) {
    return true;
  }
  return false;
}

/**
 * Witty fallback / cutoff notice when token limit is hit
 */
export function getCutoffNotice(isEn: boolean): string {
  if (isEn) {
    return "\n\n*(...oops, got cut off! This digital clone runs on token-saver mode so server costs stay friendly 😆 Want to explore all the details? Feel free to scroll through this portfolio or check out my [Resume / CV here](/resume)!)*\n[NAV:about:📍 View About & Skills]";
  }
  return "\n\n*(...waduh, kepotong nih! Maklum kloningan versi hemat token biar kuota & server nggak boncos 😆 Mau kepoin lebih lengkap? Yuk langsung scroll ke bawah buat eksplor portofolio ini atau cek [Resume / CV-ku di sini](/resume) ya!)*\n[NAV:about:📍 View About & Skills]";
}

/**
 * Google Gemini Provider implementation
 */
export class GeminiProvider implements AiProvider {
  name = "Google Gemini";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = "gemini-2.0-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  private formatContents(messages: ChatMessage[]) {
    return messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    const lastUserQuery =
      messages.filter((m) => m.role === "user").pop()?.content || "";
    const systemInstruction = await loadSystemPrompt(lastUserQuery);
    const contents = this.formatContents(messages);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.35, maxOutputTokens: 900 },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error (${response.status}): ${err.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    let text =
      candidate?.content?.parts?.[0]?.text ||
      "Maaf, saya tidak dapat menghasilkan jawaban saat ini.";

    if (candidate?.finishReason === "MAX_TOKENS") {
      text += getCutoffNotice(isEnglishText(lastUserQuery));
    }

    return text;
  }

  async generateStream(
    messages: ChatMessage[],
    signal = AbortSignal.timeout(45_000),
  ): Promise<ReadableStream<Uint8Array>> {
    const lastUserQuery =
      messages.filter((m) => m.role === "user").pop()?.content || "";
    const encoder = new TextEncoder();
    const contents = this.formatContents(messages);
    const apiKey = this.apiKey;
    const model = this.model;

    const systemInstruction = await loadSystemPrompt(lastUserQuery);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.35, maxOutputTokens: 900 },
        }),
      },
    );

    if (!response.ok || !response.body) {
      throw new Error(
        "Gemini streaming request failed (HTTP " + response.status + ").",
      );
    }
    const responseBody = response.body;

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const reader = responseBody.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6).trim();
                if (jsonStr) {
                  try {
                    const parsed = JSON.parse(jsonStr);
                    const candidate = parsed.candidates?.[0];
                    const text = candidate?.content?.parts?.[0]?.text || "";
                    if (text) {
                      controller.enqueue(encoder.encode(text));
                    }
                    if (candidate?.finishReason === "MAX_TOKENS") {
                      controller.enqueue(
                        encoder.encode(
                          getCutoffNotice(isEnglishText(lastUserQuery)),
                        ),
                      );
                    }
                  } catch {
                    // Ignore SSE json parse errors on partial chunks
                  }
                }
              }
            }
          }
        } catch (error) {
          controller.error(error);
          return;
        }
        controller.close();
      },
    });
  }
}

/**
 * OpenAI / SumoPod / Nara Compatible Provider implementation
 */
export class OpenAiProvider implements AiProvider {
  name: string;
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private maxTokens: number;

  constructor(
    apiKey: string,
    baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    model = process.env.OPENAI_MODEL || "gpt-4o-mini",
    name = "OpenAI Compatible",
    maxTokens = 2048,
  ) {
    this.name = name;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.model = model;
    this.maxTokens = maxTokens;
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    const lastUserQuery =
      messages.filter((m) => m.role === "user").pop()?.content || "";
    const systemPrompt: ChatMessage = {
      role: "system",
      content: await loadSystemPrompt(lastUserQuery),
    };
    const formattedMessages = [systemPrompt, ...messages];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: formattedMessages,
        temperature: 0.35,
        max_tokens: this.maxTokens,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error (${response.status}): ${err.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    let text =
      choice?.message?.content || "Maaf, tidak ada respon yang diterima.";

    if (choice?.finish_reason === "length") {
      text += getCutoffNotice(isEnglishText(lastUserQuery));
    }

    return text;
  }

  async generateStream(
    messages: ChatMessage[],
    signal = AbortSignal.timeout(45_000),
  ): Promise<ReadableStream<Uint8Array>> {
    const lastUserQuery =
      messages.filter((m) => m.role === "user").pop()?.content || "";
    const encoder = new TextEncoder();
    const apiKey = this.apiKey;
    const baseUrl = this.baseUrl;
    const model = this.model;
    const maxTokens = this.maxTokens;

    const systemPrompt: ChatMessage = {
      role: "system",
      content: await loadSystemPrompt(lastUserQuery),
    };
    const formattedMessages = [systemPrompt, ...messages];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: 0.35,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(
        "OpenAi streaming request failed (HTTP " + response.status + ").",
      );
    }
    const responseBody = response.body;

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const reader = responseBody.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") break;
                try {
                  const parsed = JSON.parse(data);
                  const choice = parsed.choices?.[0];
                  const content = choice?.delta?.content || "";
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                  if (choice?.finish_reason === "length") {
                    controller.enqueue(
                      encoder.encode(
                        getCutoffNotice(isEnglishText(lastUserQuery)),
                      ),
                    );
                  }
                } catch {
                  // Ignore partial SSE chunk errors
                }
              }
            }
          }
        } catch (err) {
          controller.error(err);
          return;
        }
        controller.close();
      },
    });
  }
}

export class MockFallbackProvider implements AiProvider {
  name = "Simulated Portfolio AI";

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    const query =
      messages.filter(({ role }) => role === "user").pop()?.content ?? "";
    const isEn = isEnglishText(query);
    if (
      /gebetan|mantan|masa lalu|past (?:relationship|crush)|boong|bohong|affh/i.test(
        query,
      )
    ) {
      return isEn
        ? "The AI service is unavailable. Private relationship history is not shared here. Please ask about the portfolio."
        : "Layanan AI sedang tidak tersedia. Cerita hubungan pribadi di masa lalu tidak dibagikan di sini. Silakan tanya tentang portofolio.";
    }
    const facts = (
      await getRelevantChunks(
        query,
        await knowledgeRepository.loadKnowledgeDocuments(),
        2,
      )
    )
      .map(({ content }) => content)
      .join("\n\n");
    if (!facts) {
      return isEn
        ? "The AI service is unavailable, and I cannot confirm that information. Please try again later or explore this portfolio."
        : "Layanan AI sedang tidak tersedia, dan aku belum bisa memastikan informasi itu. Coba lagi nanti atau jelajahi portofolio ini, ya.";
    }
    const notice = isEn
      ? "The AI service is unavailable. Here is an excerpt from my current knowledge (in its original language):"
      : "Layanan AI sedang tidak tersedia. Ini kutipan dari knowledge terkiniku:";
    return `${notice}\n\n${facts}`;
  }

  async generateStream(
    messages: ChatMessage[],
  ): Promise<ReadableStream<Uint8Array>> {
    return createTextStream([await this.generateResponse(messages)], 0);
  }
}

import { loadAiConfig } from "@/features/ai-config/infrastructure/data-repository";

export function createGatewayProvider(gateway: AiGateway, model: string) {
  const isNara = gateway === "nara";
  const apiKey = isNara
    ? process.env.NARA_API_KEY
    : process.env.SUMOPOD_API_KEY;
  if (!apiKey) return null;

  return new OpenAiProvider(
    apiKey,
    isNara
      ? process.env.NARA_BASE_URL || "https://router.bynara.id/v1"
      : process.env.SUMOPOD_BASE_URL || "https://ai.sumopod.com/v1",
    model,
    isNara ? "Nara AI" : "SumoPod AI",
    isNara ? 2048 : 1500,
  );
}

/**
 * Factory to get the active AI Provider based on configuration and environment variables
 */
export async function getAiProvider(): Promise<{
  provider: AiProvider;
  mode: "live" | "simulated";
}> {
  const aiConfig = await loadAiConfig();

  // If user selected SumoPod as active provider
  if (aiConfig.activeProvider === "sumopod") {
    const provider = createGatewayProvider("sumopod", aiConfig.sumopodModel);
    if (provider) {
      return {
        provider,
        mode: "live",
      };
    }
  }

  // Primary default or selected: Nara AI Gateway
  const naraProvider = createGatewayProvider("nara", aiConfig.naraModel);
  if (naraProvider) {
    return {
      provider: naraProvider,
      mode: "live",
    };
  }

  // Fallback to SumoPod AI Gateway if Nara key is absent
  const sumopodProvider = createGatewayProvider(
    "sumopod",
    aiConfig.sumopodModel,
  );
  if (sumopodProvider) {
    return {
      provider: sumopodProvider,
      mode: "live",
    };
  }

  // 2. OpenAI / Compatible Provider (Groq, DeepSeek, OpenRouter)
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    return {
      provider: new OpenAiProvider(openAiKey),
      mode: "live",
    };
  }

  // 3. Google Gemini API
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    return {
      provider: new GeminiProvider(geminiKey),
      mode: "live",
    };
  }

  return {
    provider: new MockFallbackProvider(),
    mode: "simulated",
  };
}
