import fs from "node:fs";
import path from "node:path";
import { getMongoDb } from "@/lib/mongodb";
import type { AiModelConfig } from "../domain/types";

const STORE_PATH = path.join(process.cwd(), "src/lib/ai-config-store.json");

export const POPULAR_NARA_MODELS = [
  { id: "muse-spark-1.3-contributor-free", name: "Muse Spark 1.3 (Contributor Free)" },
  { id: "agnes-2.5-flash", name: "Agnes 2.5 Flash" },
  { id: "claude-fable-5", name: "Claude Fable 5" },
  { id: "claude-fable-5.1", name: "Claude Fable 5.1" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
];

export const POPULAR_SUMOPOD_MODELS = [
  { id: "mimo-v2.5", name: "Mimo v2.5" },
  { id: "gemini/gemini-3.5-flash", name: "Gemini 3.5 Flash" },
  { id: "gemini/gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite" },
  { id: "gemini/gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
];

function getDefaultConfig(): AiModelConfig {
  return {
    activeProvider: "nara",
    naraModel: process.env.NARA_MODEL || "muse-spark-1.3-contributor-free",
    sumopodModel: process.env.SUMOPOD_MODEL || "mimo-v2.5",
  };
}

let cachedConfig: AiModelConfig | null = null;

export function loadAiConfig(): AiModelConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const defaults = getDefaultConfig();
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      cachedConfig = {
        activeProvider:
          parsed?.activeProvider === "sumopod" ? "sumopod" : "nara",
        naraModel: parsed?.naraModel || defaults.naraModel,
        sumopodModel: parsed?.sumopodModel || defaults.sumopodModel,
        updatedAt: parsed?.updatedAt,
      };
      return cachedConfig;
    }
  } catch (error) {
    console.error("Failed to read AI config store:", error);
  }

  cachedConfig = defaults;
  return defaults;
}

export function saveAiConfig(
  input: Partial<AiModelConfig>,
): AiModelConfig {
  const current = loadAiConfig();
  const updated: AiModelConfig = {
    activeProvider:
      input.activeProvider === "sumopod"
        ? "sumopod"
        : input.activeProvider === "nara"
          ? "nara"
          : current.activeProvider,
    naraModel: input.naraModel?.trim() || current.naraModel,
    sumopodModel: input.sumopodModel?.trim() || current.sumopodModel,
    updatedAt: new Date().toISOString(),
  };

  cachedConfig = updated;

  // Persist to MongoDB asynchronously for serverless runtime
  try {
    void (async () => {
      const db = await getMongoDb();
      if (db) {
        await db.collection("portfolio_settings").updateOne(
          { id: "ai_config" },
          { $set: { ...updated, id: "ai_config" } },
          { upsert: true },
        );
      }
    })();
  } catch (err) {
    console.error("[MongoDB AI Config Save Error]:", err);
  }

  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch {
    // Gracefully fallback on read-only file system
  }

  return updated;
}

