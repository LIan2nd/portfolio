import { getMongoDb } from "@/lib/mongodb";
import type { AiModelConfig } from "../domain/types";
import { createAiConfigRepository } from "./mongodb-repository";

export const POPULAR_NARA_MODELS = [
  {
    id: "muse-spark-1.3-contributor-free",
    name: "Muse Spark 1.3 (Contributor Free)",
  },
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

const repository = createAiConfigRepository(async () => {
  const db = await getMongoDb();
  if (!db && process.env.MONGODB_URI) {
    throw new Error("AI configuration storage is unavailable.");
  }
  return db;
}, getDefaultConfig);

export const { loadAiConfig, saveAiConfig } = repository;
