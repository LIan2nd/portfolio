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
 * Helper to detect whether a message or context is primarily English
 */
export function isEnglishText(msg: string): boolean {
  const englishKeywords = [
    "tell me", "how can", "how to", "what is", "what are", "hire", "contact",
    "skills", "publication", "paper", "about", "who are", "why", "where",
    "can you", "project", "projects", "work", "experience", "resume", "cv",
    "salary", "grading", "navigation", "storage", "hello", "hi", "hey",
    "english", "indonesian", "answer in", "speak", "everything", "all about",
    "full story", "details"
  ];
  const indonesianKeywords = [
    "kamu", "aku", "proyek", "cewek", "pacar", "kontak", "kesibukan",
    "ngapain", "kuliah", "jalan", "bahasa", "hubungi", "sarkas", "siapa",
    "kenapa", "dimana", "bisa", "halo", "hai", "ngoding", "lagi apa", "sekarang", "udah",
    "keseluruhan", "tentang kamu", "semua", "kelewat", "jelasin", "ceritain", "lengkap"
  ];

  const lower = msg.toLowerCase().trim();
  const hasIndo = indonesianKeywords.some((w) => lower.includes(w));
  const hasEng = englishKeywords.some((w) => lower.includes(w));

  if (hasEng && !hasIndo) return true;
  if (!hasIndo && /[a-z]/i.test(lower) && (lower.includes("how") || lower.includes("what") || lower.includes("why") || lower.includes("tell") || lower.includes("hire") || lower.includes("contact") || lower.includes("everything") || lower.includes("all"))) {
    return true;
  }
  return false;
}

/**
 * Witty fallback / cutoff notice when token limit is hit
 */
export function getCutoffNotice(isEn: boolean): string {
  if (isEn) {
    return "\n\n*(...oops, got cut off! This digital clone runs on token-saver mode so server costs stay friendly 😆 Want to explore all the details? Feel free to scroll through this portfolio or check out my [Resume / CV here](/file/resume.pdf)!)*\n[NAV:about:📍 View About & Skills]";
  }
  return "\n\n*(...waduh, kepotong nih! Maklum kloningan versi hemat token biar kuota & server nggak boncos 😆 Mau kepoin lebih lengkap? Yuk langsung scroll ke bawah buat eksplor portofolio ini atau cek [Resume / CV-ku di sini](/file/resume.pdf) ya!)*\n[NAV:about:📍 View About & Skills]";
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
          generationConfig: { temperature: 0.35, maxOutputTokens: 900 },
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
    const candidate = data.candidates?.[0];
    let text =
      candidate?.content?.parts?.[0]?.text ||
      "Maaf, saya tidak dapat menghasilkan jawaban saat ini.";

    if (candidate?.finishReason === "MAX_TOKENS") {
      text += getCutoffNotice(isEnglishText(lastUserQuery));
    }

    return text;
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
                generationConfig: { temperature: 0.35, maxOutputTokens: 900 },
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
                    const candidate = parsed.candidates?.[0];
                    const text =
                      candidate?.content?.parts?.[0]?.text || "";
                    if (text) {
                      controller.enqueue(encoder.encode(text));
                    }
                    if (candidate?.finishReason === "MAX_TOKENS") {
                      controller.enqueue(
                        encoder.encode(getCutoffNotice(isEnglishText(lastUserQuery)))
                      );
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
        temperature: 0.35,
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
    const choice = data.choices?.[0];
    let text =
      choice?.message?.content ||
      "Maaf, tidak ada respon yang diterima.";

    if (choice?.finish_reason === "length") {
      text += getCutoffNotice(isEnglishText(lastUserQuery));
    }

    return text;
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
              temperature: 0.35,
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
                  const choice = parsed.choices?.[0];
                  const content = choice?.delta?.content || "";
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                  if (choice?.finish_reason === "length") {
                    controller.enqueue(
                      encoder.encode(getCutoffNotice(isEnglishText(lastUserQuery)))
                    );
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
 * Intelligent Fallback Mock Provider with real-time streaming and bilingual support
 */
export class MockFallbackProvider implements AiProvider {
  name = "Simulated Portfolio AI";

  private isEnglish(msg: string): boolean {
    return isEnglishText(msg);
  }

  private getFullResponse(lastUserMessage: string): string {
    const msg = lastUserMessage.toLowerCase().trim();
    const isEn = this.isEnglish(msg);

    // Comprehensive "tell me everything" question handler
    if (
      msg.includes("keseluruhan") ||
      (msg.includes("semua") && (msg.includes("kamu") || msg.includes("tentang") || msg.includes("cerita") || msg.includes("jelasin") || msg.includes("profil") || msg.includes("diri") || msg.includes("hidup"))) ||
      msg.includes("kelewat") ||
      msg.includes("everything") ||
      msg.includes("all about you") ||
      msg.includes("tell me all") ||
      msg.includes("full detail")
    ) {
      return isEn
        ? "👋 I am **Alfian Nur Usyaid (LIand)**, a Computer Science graduate (**Cumlaude, GPA 3.94**) from STT Terpadu Nurul Fikri, currently specializing in **Fullstack Web Development, AI Integration, and QA/QC** at Pantona Bootcamp!\n\n" +
          "- **Flagship Research:** Built **ESAO** (AI automated essay grading) and **DigiArc** (Web3 decentralized storage).\n" +
          "- **Publications:** Author of a student retention prediction paper in *MIND Journal*.\n\n" +
          "*(...eitss, berhubung kloningan ini mode hemat token biar ramah kuota & server nggak boncos 🚀)*, info selengkapnya gak mungkin ku-spill semua di satu chat ini! Yuk langsung **scroll portofolio ini** buat kepoin karya-karyaku, atau intip [Resume / CV-ku di sini](/file/resume.pdf) ya! 😉\n\n" +
          "[NAV:about:📍 View About & Skills]"
        : "👋 Aku **Alfian Nur Usyaid (LIand)**, Sarjana Komputer (**Cumlaude, IPK 3.94**) dari STT Terpadu Nurul Fikri yang fokus di **Fullstack Web Development, Integrasi AI, dan QA/QC** di Bootcamp Pantona!\n\n" +
          "- **Proyek Unggulan:** Pengembang **ESAO** (Platform AI koreksi esai) & **DigiArc** (Penyimpanan Web3 terdesentralisasi).\n" +
          "*(...eitss, berhubung kloningan AI ini hemat token biar ramah kuota & server nggak boncos 🚀)*, info super detailnya gak mungkin ku-spill semua di satu chat ini! Yuk langsung **scroll portofolio ini** buat kepoin proyek & pengalamanku, atau intip [Resume / CV-ku di sini](/file/resume.pdf) ya! 😉\n\n" +
          "[NAV:about:📍 View About & Skills]";
    }

    // Language explanation / inquiry
    if (
      msg.includes("indonesian") ||
      msg.includes("english") ||
      msg.includes("bahasa") && (msg.includes("why") || msg.includes("kenapa")) ||
      msg.includes("speak english")
    ) {
      return isEn
        ? "My apologies! I default to Alfian's native Indonesian persona, but I'm completely fluent in English too. How can I help you today? Feel free to ask about my projects like ESAO and RoadSense, my tech stack, or how to contact me! 😊"
        : "Waduh sori! Aku bisa bahasa Inggris dan bahasa Indonesia kok. Mau nanya apa nih seputar proyek, tech stack, atau pengalamanku? Bebas tanyain ya! 😊";
    }

    if (
      msg.includes("roadsense") ||
      msg.includes("gis") ||
      msg.includes("jalan") ||
      msg.includes("navigasi") ||
      msg.includes("navigation") ||
      msg.includes("road")
    ) {
      return isEn
        ? "🗺️ **RoadSense (Smart Road Safety Navigation)** is a participatory GIS platform I built to crowdsource road damage and hazard points.\n\n" +
          "- **Tech Stack:** T3 Stack (Next.js 15, tRPC, Prisma), Leaflet, Flask (Shapely), and OSRM.\n" +
          "- **Key Features:** Interactive hazard density map, crowdsourced hazard reporting (4 severity levels), and safe route calculation.\n" +
          "- **Repository:** [github.com/LIan2nd/RoadSense](https://github.com/LIan2nd/RoadSense)\n\n" +
          "[NAV:project:📍 View Projects]"
        : "🗺️ **RoadSense (Smart Road Safety Navigation)** adalah platform GIS partisipatif yang kubangun untuk memetakan titik kerusakan jalan secara crowdsourcing.\n\n" +
          "- **Tech Stack:** T3 Stack (Next.js 15, tRPC, Prisma), Leaflet, Flask (Shapely), dan OSRM.\n" +
          "- **Fitur Utama:** Peta sebaran bahaya jalan interaktif, crowdsourced hazard reporting (4 level keparahan), dan kalkulasi navigasi rute aman (safe routing).\n" +
          "- **Repository:** [github.com/LIan2nd/RoadSense](https://github.com/LIan2nd/RoadSense)\n\n" +
          "[NAV:project:📍 View Projects]";
    }

    if (
      msg.includes("hrd") ||
      msg.includes("uas") ||
      msg.includes("employee") ||
      msg.includes("express")
    ) {
      return isEn
        ? "⚙️ **HRD RESTful API** is an employee management backend project I developed for the Backend Programming exam at STT NF.\n\n" +
          "- **Architecture & Concepts:** Modular MVC architecture and OOP concepts (Class-based Controllers & DAO Models) using **Node.js, Express.js, and MySQL**.\n" +
          "- **Features:** Full employee CRUD, status filtering (active/inactive/terminated), name search, parameterized SQL queries, and standard HTTP REST codes.\n" +
          "- **Repository:** [github.com/LIan2nd/uas-pemrograman-backend](https://github.com/LIan2nd/uas-pemrograman-backend)\n\n" +
          "[NAV:project:📍 View Projects]"
        : "⚙️ **HRD RESTful API** adalah proyek backend manajemen kepegawaian yang kubuat untuk UAS Pemrograman Backend di STT NF.\n\n" +
          "- **Arsitektur & Konsep:** Arsitektur modular MVC dan konsep OOP (Class-based Controllers & DAO Models) menggunakan **Node.js, Express.js, dan MySQL**.\n" +
          "- **Fitur:** Full CRUD pegawai, filter status (active/inactive/terminated), name search, parameterized SQL queries, dan standar HTTP RESTful codes.\n" +
          "- **Repository:** [github.com/LIan2nd/uas-pemrograman-backend](https://github.com/LIan2nd/uas-pemrograman-backend)\n\n" +
          "[NAV:project:📍 View Projects]";
    }

    if (
      msg.includes("esao") ||
      msg.includes("ai grading") ||
      msg.includes("essay") ||
      msg.includes("langchain")
    ) {
      return isEn
        ? "🤖 **ESAO (Essay Analytic Online)** is my flagship academic AI research project developed with faculty at STT Terpadu Nurul Fikri (completed).\n\n" +
          "- **Core Function:** Automated AI essay grading platform for educators that evaluates open-ended responses in seconds (saving up to 80% grading time).\n" +
          "- **Architecture:** Decoupled Architecture with **Next.js** for the dashboard and **Flask (Python) + LangChain** for rubric-based NLP evaluation.\n" +
          "- **Live URL:** [esao.nurulfikri.ac.id](https://esao.nurulfikri.ac.id)\n\n" +
          "[NAV:project:📍 View Projects]"
        : "🤖 **ESAO (Essay Analytic Online)** adalah proyek riset akademik unggulan yang kubangun bersama dosen di STT Terpadu Nurul Fikri (sudah selesai).\n\n" +
          "- **Fungsi Utama:** Platform koreksi soal esai otomatis berbasis AI untuk dosen yang mampu menilai jawaban uraian dalam hitungan detik (hemat 80% waktu koreksi).\n" +
          "- **Arsitektur:** Decoupled Architecture menggunakan **Next.js** untuk dashboard dan **Flask (Python) + LangChain** untuk evaluasi NLP berbasis rubrik.\n" +
          "- **Live URL:** [esao.nurulfikri.ac.id](https://esao.nurulfikri.ac.id)\n\n" +
          "[NAV:project:📍 View Projects]";
    }

    if (
      msg.includes("digiarc") ||
      msg.includes("blockchain") ||
      msg.includes("web3") ||
      msg.includes("ipfs") ||
      msg.includes("storage")
    ) {
      return isEn
        ? "🛡️ **DigiArc (Web3 Storage)** is a decentralized file storage platform inspired by Google Drive (completed).\n\n" +
          "- **Tech Stack:** Next.js, Wagmi, Solidity Smart Contracts, and IPFS.\n" +
          "- **Features:** Distributed file storage with blockchain-verified data integrity (proof-of-storage).\n" +
          "- **Live Demo:** [digiarc.vercel.app](https://digiarc.vercel.app)\n\n" +
          "[NAV:project:📍 View Projects]"
        : "🛡️ **DigiArc (Web3 Storage)** adalah platform penyimpanan file terdesentralisasi yang terinspirasi dari Google Drive (sudah selesai dikembangkan).\n\n" +
          "- **Tech Stack:** Next.js, Wagmi, Solidity Smart Contracts, dan IPFS.\n" +
          "- **Fitur:** Penyimpanan file terdistribusi dengan verifikasi integritas data berbasis blockchain (proof-of-storage).\n" +
          "- **Live Demo:** [digiarc.vercel.app](https://digiarc.vercel.app)\n\n" +
          "[NAV:project:📍 View Projects]";
    }

    if (
      msg.includes("lmovie") ||
      msg.includes("l-movie") ||
      msg.includes("movie") ||
      msg.includes("film") ||
      msg.includes("tmdb") ||
      msg.includes("imdb")
    ) {
      return isEn
        ? "🎬 **L-Movie (Cinema & Movie Discovery)** is a frontend web application I built for the Frontend Programming midterm exam (UTS) at STT NF.\n\n" +
          "- **Core Learning:** Client-side asynchronous REST API fetching and dynamic JSON catalog rendering (using movie database APIs).\n" +
          "- **Live Demo:** [lmovie.liand.web.id](https://lmovie.liand.web.id)\n\n" +
          "[NAV:project:📍 View Projects]"
        : "🎬 **L-Movie (Cinema & Movie Discovery)** adalah web eksplorasi film yang kubuat untuk UTS mata kuliah Pemrograman Frontend di STT NF.\n\n" +
          "- **Fokus Utama:** Belajar integrasi & *data fetching* asinkron dari REST API backend/third-party (katalog database film) ke tampilan antarmuka secara dinamis.\n" +
          "- **Live Demo:** [lmovie.liand.web.id](https://lmovie.liand.web.id)\n\n" +
          "[NAV:project:📍 View Projects]";
    }

    if (
      msg.includes("msib") ||
      msg.includes("studi independen") ||
      msg.includes("chicken yasaka") ||
      msg.includes("yasaka") ||
      msg.includes("learning x") ||
      msg.includes("learningx")
    ) {
      return isEn
        ? "🍗 **MSIB Batch 7 — Software Engineering Participant:**\n\n" +
          "- **Role & Organization:** Software Engineering Participant at PT Global Investment Institusi (Learning X Academy), Sep – Dec 2024.\n" +
          "- **Learnings & Project:** Mastered full-stack fundamentals (Flask, jQuery AJAX, MongoDB) and developed **Chicken Yasaka** (poultry e-commerce).\n" +
          "- **Official Certificate:** [View MSIB Certificate](/file/work/msib.pdf) 📄\n\n" +
          "[NAV:experience:📍 View Experience]"
        : "🍗 **MSIB Batch 7 — Software Engineering Participant:**\n\n" +
          "- **Program & Mitra:** Magang & Studi Independen Bersertifikat (MSIB) Batch 7 di PT Global Investment Institusi (Learning X Academy), Sep – Des 2024.\n" +
          "- **Materi & Final Project:** Belajar full-stack web dev (Flask, jQuery AJAX, MongoDB) dan menyelesaikan proyek web e-commerce **Chicken Yasaka**.\n" +
          "- **Bukti Sertifikat:** [Lihat Sertifikat MSIB](/file/work/msib.pdf) 📄\n\n" +
          "[NAV:experience:📍 View Experience]";
    }

    if (
      msg.includes("sekarang") ||
      msg.includes("lagi apa") ||
      msg.includes("ngapain") ||
      msg.includes("pantona") ||
      msg.includes("bootcamp") ||
      msg.includes("kesibukan") ||
      msg.includes("currently") ||
      msg.includes("doing now") ||
      msg.includes("status")
    ) {
      return isEn
        ? "I have graduated with a **Bachelor of Computer Science (Cumlaude, GPA 3.94)** from STT Terpadu Nurul Fikri.\n\n" +
          "Currently, I am participating in a **6-month Fullstack Web Development Bootcamp at Pantona**, focusing on **QA & QC (Quality Assurance & Control)**. I am also **immediately available** for Full-time and Project-based opportunities! 🚀"
        : "Saat ini aku sudah **lulus kuliah S.Kom dari STT Terpadu Nurul Fikri (IPK 3.94 Cumlaude)**.\n\n" +
          "Kesibukan sehari-hariku saat ini adalah sedang mengikuti program **Bootcamp Fullstack Web Development selama 6 bulan di Pantona**, yang sekarang lagi di **tahap belajar QA & QC (Quality Assurance & Quality Control)**. Selain itu, aku juga *immediately available* untuk peluang kerja Full-time / Project-based! 🚀";
    }

    if (
      msg.includes("babymonster") ||
      msg.includes("ahyeon") ||
      msg.includes("asa") ||
      msg.includes("chiquita")
    ) {
      if (
        msg.includes("distia") ||
        msg.includes("cewek") ||
        msg.includes("pacar") ||
        msg.includes("pasangan") ||
        msg.includes("lebih suka") ||
        msg.includes("pilih") ||
        msg.includes("prefer") ||
        msg.includes("mana")
      ) {
        return isEn
          ? "Distia, without a doubt! 😄 BABYMONSTER is just my favorite K-Pop group, but Distia is 100% my one and only beloved life partner! 💙"
          : "Ya jelas Distia lah! 😄 BABYMONSTER tuh emang girl group favoritku, tapi kalau urusan cinta dan di hati ya 100% mutlak cuma cewekku Distia seorang, ga ada tandingannya! 💙";
      }

      return isEn
        ? "I'm a big fan of **BABYMONSTER**! Ahyeon's powerful vocals, Asa's insane rap & aura, and Chiquita's visual are all amazing. But in real life, my heart belongs 100% to my girlfriend Distia! ✨"
        : "Suka banget sama **BABYMONSTER**! Vokalnya Ahyeon yang powerful, rap Asa yang gokil, dan visualnya Chiquita emang mantap. Tapi kalau urusan hati ya 100% tetap cuma buat cewekku Distia tercinta! ✨";
    }

    if (
      msg.includes("boong") ||
      msg.includes("bohong") ||
      msg.includes("affh") ||
      msg.includes("gebetan") ||
      msg.includes("mantan") ||
      msg.includes("masa lalu")
    ) {
      return isEn
        ? "Haha, for real, I'm completely serious! 😄 No need to bring up past things—what matters is that my girlfriend Distia is the only one in my heart right now! 💙"
        : "Haha suer beneran, ngapain bohong! 😄 Ga usah bahas-bahas soal masa lalu lagi hehe, yang jelas di hatiku sekarang ya cuma ada cewekku Distia seorang! 💙";
    }

    if (
      msg.includes("cewek") ||
      msg.includes("pacar") ||
      msg.includes("pasangan") ||
      msg.includes("partner") ||
      msg.includes("girlfriend") ||
      msg.includes("distia")
    ) {
      const isWho = msg.includes("who") || msg.includes("siapa") || msg.includes("nama") || msg.includes("name");
      if (isWho) {
        return isEn
          ? "My girlfriend (life partner) is **Distia Fajar Familiati**. She is also an Informatics alumna from STT Terpadu Nurul Fikri! 💙"
          : "Cewekku (pasangan hidupku) namanya **Distia Fajar Familiati**. Dia juga alumni Teknik Informatika di STT Terpadu Nurul Fikri! 💙";
      }

      const isStatus = msg.includes("single") || msg.includes("punya") || msg.includes("udah") || msg.includes("have");
      if (isStatus) {
        return isEn
          ? "Yes, I have a life partner! Her name is **Distia Fajar Familiati**, an Informatics alumna from STT NF. ✨"
          : "Udah punya, cewekku namanya **Distia Fajar Familiati**! Dia juga alumni Teknik Informatika di STT NF. ✨";
      }

      return isEn
        ? "Distia Fajar Familiati is my life partner / girlfriend. She is an Informatics alumna from STT Terpadu Nurul Fikri! ✨"
        : "Distia Fajar Familiati itu cewekku / pasangan hidupku. Dia juga lulusan Teknik Informatika di STT Terpadu Nurul Fikri! ✨";
    }

    if (
      msg.includes("skill") ||
      msg.includes("tech") ||
      msg.includes("bahasa") ||
      msg.includes("stack")
    ) {
      return isEn
        ? "💻 **My Tech Stack & Key Skills:**\n\n" +
          "- **Languages:** TypeScript, JavaScript, PHP, Python, Solidity, SQL\n" +
          "- **Frontend & Frameworks:** Next.js 15 (React), Tailwind CSS v4, HTML5/CSS3\n" +
          "- **Backend & Architecture:** Laravel (PHP), Flask (Python), Express.js (Node.js), RESTful APIs, MVC & OOP\n" +
          "- **Databases:** PostgreSQL, MySQL, Supabase\n" +
          "- **AI & Web3:** LangChain, LLM APIs, Wagmi, IPFS, Smart Contracts\n\n" +
          "[NAV:about:📍 View About & Skills]"
        : "💻 **Tech Stack & Keahlian Utamaku:**\n\n" +
          "- **Languages:** JavaScript, TypeScript, PHP, Python, Solidity, SQL\n" +
          "- **Frontend & Frameworks:** Next.js 15 (React), Tailwind CSS v4, HTML5/CSS3\n" +
          "- **Backend & Architecture:** Laravel (PHP), Flask (Python), Express.js (Node.js), RESTful API, MVC & OOP\n" +
          "- **Databases:** PostgreSQL, MySQL, Supabase\n" +
          "- **AI & Web3:** LangChain, LLM APIs, Wagmi, IPFS, Smart Contracts\n\n" +
          "[NAV:about:📍 View About & Skills]";
    }

    if (
      msg.includes("kuliah") ||
      msg.includes("kampus") ||
      msg.includes("pendidikan") ||
      msg.includes("education") ||
      msg.includes("gpa") ||
      msg.includes("ipk") ||
      msg.includes("asdos") ||
      msg.includes("asisten dosen") ||
      msg.includes("kepanitiaan") ||
      msg.includes("skripsi") ||
      msg.includes("jurnal") ||
      msg.includes("publication") ||
      msg.includes("paper")
    ) {
      return isEn
        ? "🎓 **Campus Life, Education & Academic Research:**\n\n" +
          "- **STT Terpadu Nurul Fikri (2022 - 2026):** Bachelor of Computer Science (S.Kom) in Informatics — **Cumlaude (GPA 3.94 / 4.00)**.\n" +
          "- **Teaching Assistant:** Data Structures & Algorithms (Tree, Graph, Sorting, Big-O), Databases (MySQL, ERD, Query Optimization), and Backend Laravel.\n" +
          "- **Faculty Research & Publications:** Built ESAO (AI grading) & DigiArc (Web3 storage); published machine learning paper in *MIND Journal (Itenas Bandung)*.\n" +
          "- **Campus Activities:** Active in internal student event committees and academic competitions.\n\n" +
          "[NAV:experience:📍 View Experience]"
        : "🎓 **Pengalaman Kuliah, Pendidikan & Riset Kampus:**\n\n" +
          "- **STT Terpadu Nurul Fikri (2022 - 2026):** Sarjana Komputer (S.Kom) Teknik Informatika — **Cumlaude (IPK 3.94 / 4.00)**.\n" +
          "- **Asisten Dosen (Teaching Assistant):** Mengajar Struktur Data & Algoritma, Basis Data (MySQL/ERD), dan Lab Backend (Laravel).\n" +
          "- **Riset Dosen & Publikasi:** Mengembangkan riset AI ESAO & Web3 DigiArc; menerbitkan paper machine learning di *MIND Journal (Itenas Bandung)*.\n" +
          "- **Kepanitiaan:** Aktif sebagai panitia berbagai event lomba teknologi dan kegiatan akademik mahasiswa di kampus.\n\n" +
          "[NAV:experience:📍 View Experience]";
    }

    if (
      msg.includes("kontak") ||
      msg.includes("email") ||
      msg.includes("hubungi") ||
      msg.includes("contact") ||
      msg.includes("hire")
    ) {
      return isEn
        ? "📫 **Contact & Hiring Information:**\n\n" +
          "- **Email:** [alfiannurusyaid19@gmail.com](mailto:alfiannurusyaid19@gmail.com)\n" +
          "- **LinkedIn:** [linkedin.com/in/alfian-nur-usyaid](https://linkedin.com/in/alfian-nur-usyaid/)\n" +
          "- **GitHub:** [github.com/LIan2nd](https://github.com/LIan2nd/)\n" +
          "- **Instagram:** [@wonder__liand](https://www.instagram.com/wonder__liand)\n\n" +
          "I am **open for work**—available for full-time, freelance, and project-based opportunities. Let's connect! 🚀\n\n" +
          "[NAV:contact:📍 Go to Contact Section]"
        : "📫 **Informasi Kontakku:**\n\n" +
          "- **Email:** [alfiannurusyaid19@gmail.com](mailto:alfiannurusyaid19@gmail.com)\n" +
          "- **LinkedIn:** [linkedin.com/in/alfian-nur-usyaid](https://linkedin.com/in/alfian-nur-usyaid/)\n" +
          "- **GitHub:** [github.com/LIan2nd](https://github.com/LIan2nd/)\n" +
          "- **Instagram:** [@wonder__liand](https://www.instagram.com/wonder__liand)\n\n" +
          "Aku *open for work*—baik full-time, freelance, maupun project-based. Yuk diskusi lebih lanjut! 🚀\n\n" +
          "[NAV:contact:📍 Go to Contact Section]";
    }

    if (
      msg.includes("google") ||
      msg.includes("pencarian") ||
      (msg.includes("portfolio") && (msg.includes("keren") || msg.includes("bagus") || msg.includes("nongol") || msg.includes("nemu") || msg.includes("found")))
    ) {
      return isEn
        ? "Thank you so much! 😎 I'm thrilled to see my portfolio showing up on Google. Feel free to scroll down to explore projects like ESAO, DigiArc, or RoadSense on this page! 🚀\n\n[NAV:project:📍 View Projects]"
        : "Wah makasih bro/sis! 😎 Seneng banget portofolioku udah mulai nongol di Google. Kamu bisa langsung scroll ke bawah buat eksplor proyek-proyek kayak ESAO, DigiArc, atau RoadSense di web ini ya hehe 🚀\n\n[NAV:project:📍 View Projects]";
    }

    if (
      (msg.includes("buka") || msg.includes("tips") || msg.includes("open") || msg.includes("akses")) &&
      (msg.includes("windows") || msg.includes("mac") || msg.includes("hp") || msg.includes("browser") || msg.includes("portfolio") || msg.includes("web"))
    ) {
      return isEn
        ? "Haha, you've actually already opened it and are chatting with my clone right now! 😄\n\n" +
          "If you'd like some tips to explore my portfolio:\n" +
          "- Toggle **Dark / Light mode** in the top-right navbar\n" +
          "- Scroll down to check out **ESAO**, **DigiArc**, and **RoadSense**\n" +
          "- Click on project cards to see live demos and repositories!\n\n" +
          "[NAV:project:📍 View Projects]"
        : "Loh, kan sekarang kamu udah berhasil membukanya dan lagi ngobrol sama klon-ku di sini haha! 😄\n\n" +
          "Kalau mau tips eksplor portofolio ini:\n" +
          "- Coba ganti tema **Dark / Light mode** di navbar kanan atas\n" +
          "- Scroll ke bawah buat kepoin detail proyek kayak **ESAO**, **DigiArc**, dan **RoadSense**\n" +
          "- Klik kartu proyek untuk lihat demo langsung atau repository di GitHub!\n\n" +
          "[NAV:project:📍 View Projects]";
    }

    if (
      msg.includes("halo") ||
      msg.includes("hai") ||
      msg.includes("hello") ||
      msg.includes("hi") ||
      msg.includes("hey") ||
      msg.includes("p") ||
      msg.includes("tes") ||
      msg.includes("test")
    ) {
      return isEn
        ? "Hello! I am the digital AI clone of **Alfian Nur Usyaid (LIand)**.\n\n" +
          "Feel free to ask about my AI research **ESAO**, Web3 project **DigiArc**, GIS platform **RoadSense**, backend **HRD API**, journal publication, or my tech stack. What would you like to explore? 😎"
        : "Halo! Aku kloningan digital dari **Alfian Nur Usyaid (LIand)**.\n\n" +
          "Kamu bisa tanya-tanya seputar riset AI **ESAO**, Web3 **DigiArc**, GIS **RoadSense**, backend **HRD API**, publikasi jurnal, atau tech stack-ku. Mau kepoin yang mana nih? 😎";
    }

    // Default witty / sarcastic out-of-context response
    return isEn
      ? "Hey! I'm only trained to answer questions about Alfian's portfolio, projects, and skills (like ESAO, RoadSense, or DigiArc) 🗿\n\nFeel free to ask anything about my tech stack and experience!"
      : "Dih, si tau tuh aku... Tanya yang berbobot seputar proyek atau portofolioku kek, misal ESAO, RoadSense, atau DigiArc 🗿\n\nAtau mau tanya seputar tech stack dan pengalamanku? Tanyain aja ya!";
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
