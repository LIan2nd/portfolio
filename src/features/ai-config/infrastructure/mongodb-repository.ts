import type { Db } from "mongodb";
import type { AiModelConfig } from "../domain/types";

type StoredConfig = AiModelConfig & { id: string };

export function createAiConfigRepository(
  readDb: () => Promise<Db | null>,
  readDefaults: () => AiModelConfig,
) {
  async function loadAiConfig(): Promise<AiModelConfig> {
    const defaults = readDefaults();
    const db = await readDb();
    if (!db) return defaults;

    const saved = await db
      .collection<StoredConfig>("portfolio_settings")
      .findOne({ id: "ai_config" }, { maxTimeMS: 3_000 });
    if (!saved) return defaults;

    return {
      activeProvider: saved.activeProvider === "sumopod" ? "sumopod" : "nara",
      naraModel: saved.naraModel || defaults.naraModel,
      sumopodModel: saved.sumopodModel || defaults.sumopodModel,
      updatedAt: saved.updatedAt,
    };
  }

  async function saveAiConfig(
    input: Partial<AiModelConfig>,
  ): Promise<AiModelConfig> {
    const db = await readDb();
    if (!db) throw new Error("AI configuration storage is unavailable.");

    const current = await loadAiConfig();
    const updated: AiModelConfig = {
      activeProvider: input.activeProvider ?? current.activeProvider,
      naraModel: input.naraModel?.trim() || current.naraModel,
      sumopodModel: input.sumopodModel?.trim() || current.sumopodModel,
      updatedAt: new Date().toISOString(),
    };

    await db
      .collection<StoredConfig>("portfolio_settings")
      .updateOne(
        { id: "ai_config" },
        { $set: { ...updated, id: "ai_config" } },
        { upsert: true, maxTimeMS: 3_000 },
      );
    return updated;
  }

  return { loadAiConfig, saveAiConfig };
}
