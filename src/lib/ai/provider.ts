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
          generationConfig: { temperature: 0.6, maxOutputTokens: 900 },
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
                generationConfig: { temperature: 0.6, maxOutputTokens: 900 },
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
        max_tokens: 900,
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
              max_tokens: 900,
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
    const msg = lastUserMessage.toLowerCase().trim();

    if (
      msg.includes("roadsense") ||
      msg.includes("gis") ||
      msg.includes("jalan") ||
      msg.includes("navigasi")
    ) {
      return (
        "🗺️ **RoadSense (Smart Road Safety Navigation)** adalah platform GIS partisipatif yang kubangun untuk memetakan titik kerusakan jalan secara crowdsourcing.\n\n" +
        "- **Tech Stack:** T3 Stack (Next.js 15, tRPC, Prisma), Leaflet, Flask (Shapely), dan OSRM.\n" +
        "- **Fitur Utama:** Peta sebaran bahaya jalan interaktif, crowdsourced hazard reporting (4 level keparahan), dan kalkulasi navigasi rute aman (safe routing).\n" +
        "- **Repository:** [github.com/LIan2nd/RoadSense](https://github.com/LIan2nd/RoadSense)"
      );
    }

    if (
      msg.includes("hrd") ||
      msg.includes("uas") ||
      msg.includes("employee") ||
      msg.includes("express")
    ) {
      return (
        "⚙️ **HRD RESTful API** adalah proyek backend manajemen kepegawaian yang kubuat untuk UAS Pemrograman Backend di STT NF.\n\n" +
        "- **Arsitektur & Konsep:** Arsitektur modular MVC dan konsep OOP (Class-based Controllers & DAO Models) menggunakan **Node.js, Express.js, dan MySQL**.\n" +
        "- **Fitur:** Full CRUD pegawai, filter status (active/inactive/terminated), name search, parameterized SQL queries, dan standar HTTP RESTful codes.\n" +
        "- **Repository:** [github.com/LIan2nd/uas-pemrograman-backend](https://github.com/LIan2nd/uas-pemrograman-backend)"
      );
    }

    if (
      msg.includes("esao") ||
      msg.includes("ai grading") ||
      msg.includes("langchain")
    ) {
      return (
        "🤖 **ESAO (Essay Analytic Online)** adalah proyek riset akademik unggulan yang kubangun bersama dosen di STT Terpadu Nurul Fikri (sudah selesai).\n\n" +
        "- **Fungsi Utama:** Platform koreksi soal esai otomatis berbasis AI untuk dosen yang mampu menilai jawaban uraian dalam hitungan detik (hemat 80% waktu koreksi).\n" +
        "- **Arsitektur:** Decoupled Architecture menggunakan **Next.js** untuk dashboard dan **Flask (Python) + LangChain** untuk evaluasi NLP berbasis rubrik.\n" +
        "- **Live URL:** [esao.nurulfikri.ac.id](https://esao.nurulfikri.ac.id)"
      );
    }

    if (
      msg.includes("digiarc") ||
      msg.includes("blockchain") ||
      msg.includes("web3") ||
      msg.includes("ipfs")
    ) {
      return (
        "🛡️ **DigiArc (Web3 Storage)** adalah platform penyimpanan file terdesentralisasi yang terinspirasi dari Google Drive (sudah selesai dikembangkan).\n\n" +
        "- **Tech Stack:** Next.js, Wagmi, Solidity Smart Contracts, dan IPFS.\n" +
        "- **Fitur:** Penyimpanan file terdistribusi dengan verifikasi integritas data berbasis blockchain (proof-of-storage).\n" +
        "- **Live Demo:** [digiarc.vercel.app](https://digiarc.vercel.app)"
      );
    }

    if (
      msg.includes("sekarang") ||
      msg.includes("lagi apa") ||
      msg.includes("ngapain") ||
      msg.includes("pantona") ||
      msg.includes("bootcamp") ||
      msg.includes("kesibukan")
    ) {
      return (
        "Saat ini aku sudah **lulus kuliah S.Kom dari STT Terpadu Nurul Fikri (IPK 3.94 Cumlaude)**.\n\n" +
        "Kesibukan sehari-hariku saat ini adalah sedang mengikuti program **Bootcamp Fullstack Web Development selama 6 bulan di Pantona**, yang sekarang lagi di **tahap belajar QA & QC (Quality Assurance & Quality Control)**. Selain itu, aku juga *immediately available* untuk peluang kerja Full-time / Project-based! 🚀"
      );
    }

    if (
      msg.includes("cewek") ||
      msg.includes("pacar") ||
      msg.includes("pasangan") ||
      msg.includes("distia")
    ) {
      return "Udah dong, aku punya cewek namanya Distia (Distia Fajar Familiati). Dia juga alumni Teknik Informatika di STT NF! ✨";
    }

    if (
      msg.includes("skill") ||
      msg.includes("tech") ||
      msg.includes("bahasa") ||
      msg.includes("stack")
    ) {
      return (
        "💻 **Tech Stack & Keahlian Utamaku:**\n\n" +
        "- **Languages:** JavaScript, TypeScript, PHP, Python, Solidity, SQL\n" +
        "- **Frontend & Frameworks:** Next.js 15 (React), Tailwind CSS v4, HTML5/CSS3\n" +
        "- **Backend & Architecture:** Laravel (PHP), Flask (Python), Express.js (Node.js), RESTful API, MVC & OOP\n" +
        "- **Databases:** PostgreSQL, MySQL, Supabase\n" +
        "- **AI & Web3:** LangChain, LLM APIs, Wagmi, IPFS, Smart Contracts"
      );
    }

    if (
      msg.includes("kuliah") ||
      msg.includes("pendidikan") ||
      msg.includes("education") ||
      msg.includes("gpa") ||
      msg.includes("skripsi") ||
      msg.includes("jurnal")
    ) {
      return (
        "🎓 **Pendidikan & Publikasi Ilmiahku:**\n\n" +
        "- **STT Terpadu Nurul Fikri (2022 - 2026)**: Sarjana Komputer (S.Kom) Teknik Informatika — **Cumlaude (IPK 3.94 / 4.00)**.\n" +
        "- **Publikasi Jurnal Ilmiah:** Paper di *MIND Journal (Itenas Bandung)* mengenai *Prediksi Retensi Mahasiswa Menggunakan Random Forest & Algoritma Genetika (SMOTE)*.\n" +
        "- **Teaching Assistant:** Asisten Dosen untuk Struktur Data & Algoritma, Basis Data, dan Backend Laravel."
      );
    }

    if (
      msg.includes("kontak") ||
      msg.includes("email") ||
      msg.includes("hubungi") ||
      msg.includes("contact")
    ) {
      return (
        "📫 **Informasi Kontakku:**\n\n" +
        "- **Email:** [alfiannurusyaid19@gmail.com](mailto:alfiannurusyaid19@gmail.com)\n" +
        "- **LinkedIn:** [linkedin.com/in/alfian-nur-usyaid](https://linkedin.com/in/alfian-nur-usyaid/)\n" +
        "- **GitHub:** [github.com/LIan2nd](https://github.com/LIan2nd/)\n" +
        "- **Instagram:** [@wonder__liand](https://www.instagram.com/wonder__liand)"
      );
    }

    if (
      msg.includes("halo") ||
      msg.includes("hai") ||
      msg.includes("p") ||
      msg.includes("tes") ||
      msg.includes("test")
    ) {
      return (
        "Halo! Aku kloningan digital dari **Alfian Nur Usyaid (LIand)**.\n\n" +
        "Kamu bisa tanya-tanya seputar riset AI **ESAO**, Web3 **DigiArc**, GIS **RoadSense**, backend **HRD API**, publikasi jurnal, atau tech stack-ku. Mau kepoin yang mana nih? 😎"
      );
    }

    // Default witty / sarcastic out-of-context response
    return (
      "Dih, si tau tuh aku... Tanya yang berbobot seputar proyek atau portofolioku kek, misal ESAO, RoadSense, atau DigiArc 🗿\n\n" +
      "Atau mau tanya seputar tech stack dan pengalamanku? Tanyain aja ya!"
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
