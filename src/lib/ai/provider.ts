import { buildPortfolioKnowledge } from "./knowledge";
import { getRelevantContext } from "./rag";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AiProvider {
  name: string;
  generateResponse(messages: ChatMessage[]): Promise<string>;
  generateStream(messages: ChatMessage[]): ReadableStream<Uint8Array>;
}

/**
 * Helper to encode text chunks into Uint8Array stream
 */
function createTextStream(chunks: string[], delayMs = 25): ReadableStream<Uint8Array> {
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
    const lastUserQuery = messages.filter((m) => m.role === "user").pop()?.content || "";
    const ragContext = await getRelevantContext(lastUserQuery);
    const systemInstruction = `${buildPortfolioKnowledge()}\n\n### RELEVANT RETRIEVED CONTEXT (RAG):\n${ragContext}`;
    const contents = this.formatContents(messages);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.6, maxOutputTokens: 650 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error (${response.status}): ${err.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, saya tidak dapat menghasilkan jawaban saat ini."
    );
  }

  generateStream(messages: ChatMessage[]): ReadableStream<Uint8Array> {
    const lastUserQuery = messages.filter((m) => m.role === "user").pop()?.content || "";
    const encoder = new TextEncoder();
    const contents = this.formatContents(messages);
    const apiKey = this.apiKey;
    const model = this.model;

    return new ReadableStream({
      async start(controller) {
        try {
          const ragContext = await getRelevantContext(lastUserQuery);
          const systemInstruction = `${buildPortfolioKnowledge()}\n\n### RELEVANT RETRIEVED CONTEXT (RAG):\n${ragContext}`;

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents,
                generationConfig: { temperature: 0.6, maxOutputTokens: 650 },
              }),
            }
          );

          if (!response.ok || !response.body) {
            controller.enqueue(
              encoder.encode("Terjadi kendala saat menghubungkan ke Gemini stream.")
            );
            controller.close();
            return;
          }

          const reader = response.body.getReader();
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
                    const text =
                      parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    if (text) {
                      controller.enqueue(encoder.encode(text));
                    }
                  } catch (e) {
                    // Ignore SSE json parse errors on partial chunks
                  }
                }
              }
            }
          }
        } catch (error) {
          controller.enqueue(
            encoder.encode("Terjadi kesalahan streaming dari Gemini.")
          );
        } finally {
          controller.close();
        }
      },
    });
  }
}

/**
 * OpenAI / SumoPod Compatible Provider implementation
 */
export class OpenAiProvider implements AiProvider {
  name = "OpenAI Compatible";
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(
    apiKey: string,
    baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    model = process.env.OPENAI_MODEL || "gpt-4o-mini"
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.model = model;
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    const lastUserQuery = messages.filter((m) => m.role === "user").pop()?.content || "";
    const ragContext = await getRelevantContext(lastUserQuery);
    const systemPrompt: ChatMessage = {
      role: "system",
      content: `${buildPortfolioKnowledge()}\n\n### RELEVANT RETRIEVED CONTEXT (RAG):\n${ragContext}`,
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
        temperature: 0.6,
        max_tokens: 650,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error (${response.status}): ${err.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content ||
      "Maaf, tidak ada respon yang diterima."
    );
  }

  generateStream(messages: ChatMessage[]): ReadableStream<Uint8Array> {
    const lastUserQuery = messages.filter((m) => m.role === "user").pop()?.content || "";
    const encoder = new TextEncoder();
    const apiKey = this.apiKey;
    const baseUrl = this.baseUrl;
    const model = this.model;

    return new ReadableStream({
      async start(controller) {
        try {
          const ragContext = await getRelevantContext(lastUserQuery);
          const systemPrompt: ChatMessage = {
            role: "system",
            content: `${buildPortfolioKnowledge()}\n\n### RELEVANT RETRIEVED CONTEXT (RAG):\n${ragContext}`,
          };
          const formattedMessages = [systemPrompt, ...messages];

          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: formattedMessages,
              temperature: 0.6,
              max_tokens: 650,
              stream: true,
            }),
          });

          if (!response.ok || !response.body) {
            // Intelligent fallback: if external API quota runs out, stream from local knowledge engine
            const fallback = new MockFallbackProvider();
            const fallbackStream = fallback.generateStream(messages);
            const fallbackReader = fallbackStream.getReader();
            while (true) {
              const { done, value } = await fallbackReader.read();
              if (done) break;
              controller.enqueue(value);
            }
            controller.close();
            return;
          }

          const reader = response.body.getReader();
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
                  const content = parsed.choices?.[0]?.delta?.content || "";
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Ignore partial SSE chunk errors
                }
              }
            }
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode("Terjadi kesalahan streaming dari server AI.")
          );
        } finally {
          controller.close();
        }
      },
    });
  }
}

/**
 * Intelligent Fallback Mock Provider with real-time streaming
 */
export class MockFallbackProvider implements AiProvider {
  name = "Simulated Portfolio AI";

  private getFullResponse(lastUserMessage: string): string {
    if (
      lastUserMessage.includes("esao") ||
      lastUserMessage.includes("ai grading") ||
      lastUserMessage.includes("langchain")
    ) {
      return (
        "🤖 **ESAO (Essay Analytic Online)** adalah proyek riset akademik unggulan yang dibangun oleh Alfian Nur Usyaid bersama tim dosen di STT Terpadu Nurul Fikri.\n\n" +
        "- **Fungsi Utama:** Platform koreksi soal esai otomatis berbasis AI untuk dosen yang mampu menilai jawaban uraian dalam hitungan detik (hemat 80% waktu koreksi).\n" +
        "- **Arsitektur:** Decoupled Architecture menggunakan **Next.js** untuk dashboard interaktif dan **Flask (Python) + LangChain** untuk evaluasi NLP berbasis rubrik.\n" +
        "- **Fitur Unggulan:** Penilaian multimodal (teks & gambar), feedback AI detail per soal, dan ekspor nilai ke Excel.\n" +
        "- **Live URL:** [esao.nurulfikri.ac.id](https://esao.nurulfikri.ac.id)"
      );
    }

    if (
      lastUserMessage.includes("digiarc") ||
      lastUserMessage.includes("blockchain") ||
      lastUserMessage.includes("web3") ||
      lastUserMessage.includes("ipfs")
    ) {
      return (
        "🛡️ **DigiArc (Web3 Storage)** adalah platform penyimpanan file terdesentralisasi yang terinspirasi dari Google Drive.\n\n" +
        "- **Tech Stack:** Next.js, Wagmi, Solidity Smart Contracts, dan IPFS.\n" +
        "- **Fitur:** Penyimpanan file terdistribusi dengan verifikasi integritas data berbasis blockchain (proof-of-storage).\n" +
        "- **Live Demo:** [digiarc.vercel.app](https://digiarc.vercel.app)"
      );
    }

    if (
      lastUserMessage.includes("skill") ||
      lastUserMessage.includes("tech") ||
      lastUserMessage.includes("bahasa") ||
      lastUserMessage.includes("stack")
    ) {
      return (
        "💻 **Tech Stack & Keahlian Alfian:**\n\n" +
        "- **Languages:** JavaScript, TypeScript, PHP, Python, Solidity, SQL\n" +
        "- **Frontend & Frameworks:** Next.js (React), TailwindCSS, Bootstrap, jQuery\n" +
        "- **Backend & API:** Laravel (PHP), Flask (Python), Node.js, RESTful APIs, OOP & SOLID Principles\n" +
        "- **Databases:** PostgreSQL, MySQL, MongoDB\n" +
        "- **AI & Web3:** LangChain, Google Gemini API, Wagmi, IPFS, Smart Contracts"
      );
    }

    if (
      lastUserMessage.includes("kuliah") ||
      lastUserMessage.includes("pendidikan") ||
      lastUserMessage.includes("education") ||
      lastUserMessage.includes("gpa") ||
      lastUserMessage.includes("skripsi") ||
      lastUserMessage.includes("jurnal")
    ) {
      return (
        "🎓 **Pendidikan & Prestasi Akademik Alfian:**\n\n" +
        "- **STT Terpadu Nurul Fikri (2022 - 2026)**: Sarjana Komputer (S.Kom) - Teknik Informatika.\n" +
        "- **Predikat:** Lulus dengan predikat **Cumlaude (IPK 3.94 / 4.00)**.\n" +
        "- **Publikasi Jurnal Ilmiah:** Mempublikasikan tugas akhir di *MIND Journal (Itenas)* mengenai otomatisasi penilaian esai.\n" +
        "- **Pengalaman Mengajar:** Asisten Dosen untuk mata kuliah Struktur Data & Algoritma, Basis Data, dan Pemrograman Backend."
      );
    }

    if (
      lastUserMessage.includes("kontak") ||
      lastUserMessage.includes("email") ||
      lastUserMessage.includes("hubungi") ||
      lastUserMessage.includes("contact")
    ) {
      return (
        "📫 **Informasi Kontak Alfian Nur Usyaid:**\n\n" +
        "- **Email:** [alfiannurusyaid19@gmail.com](mailto:alfiannurusyaid19@gmail.com)\n" +
        "- **LinkedIn:** [linkedin.com/in/alfian-nur-usyaid](https://linkedin.com/in/alfian-nur-usyaid/)\n" +
        "- **GitHub:** [github.com/LIan2nd](https://github.com/LIan2nd/)\n" +
        "- **Lokasi:** Bogor, Indonesia (Terbuka untuk posisi Remote & Onsite)."
      );
    }

    return (
      "Halo! Saya adalah **AI Assistant Portofolio Alfian Nur Usyaid**.\n\n" +
      "Saya bisa membantu Anda mengetahui lebih dalam mengenai:\n" +
      "1. 🚀 **Proyek Unggulan**: ESAO (AI Essay Grading), DigiArc (Web3 Storage), Event Registration.\n" +
      "2. 💻 **Tech Stack & Skills**: Next.js, Laravel, Flask, Python/LangChain, PostgreSQL.\n" +
      "3. 🎓 **Latar Belakang Akademik**: Lulusan Cumlaude IPK 3.94 & Publikasi Jurnal Ilmiah.\n" +
      "4. 💼 **Pengalaman Kerja & Riset**: Fullstack Developer & Asisten Dosen.\n\n" +
      "*Ada yang ingin Anda ketahui lebih detail?*"
    );
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.getFullResponse(lastUserMessage);
  }

  generateStream(messages: ChatMessage[]): ReadableStream<Uint8Array> {
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    const fullText = this.getFullResponse(lastUserMessage);

    // Split text into tokens / word chunks for smooth natural streaming
    const chunks: string[] = [];
    const words = fullText.split(/(\s+)/);
    for (let i = 0; i < words.length; i += 2) {
      chunks.push((words[i] || "") + (words[i + 1] || ""));
    }

    return createTextStream(chunks, 22);
  }
}

/**
 * Factory to get the active AI Provider based on environment variables
 */
export function getAiProvider(): {
  provider: AiProvider;
  mode: "live" | "simulated";
} {
  // 1. SumoPod AI Gateway (Primary support)
  const sumopodKey = process.env.SUMOPOD_API_KEY;
  if (sumopodKey) {
    const baseUrl = process.env.SUMOPOD_BASE_URL || "https://ai.sumopod.com/v1";
    const model = process.env.SUMOPOD_MODEL || "deepseek-v3";
    return {
      provider: new OpenAiProvider(sumopodKey, baseUrl, model),
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
