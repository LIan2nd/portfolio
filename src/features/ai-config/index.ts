import "server-only";
import { createAiConfigHandlers } from "./api/handlers";
import {
  loadAiConfig,
  saveAiConfig,
  POPULAR_NARA_MODELS,
  POPULAR_SUMOPOD_MODELS,
} from "./infrastructure/data-repository";

export const aiConfigHandlers = createAiConfigHandlers(
  () => process.env.DASHBOARD_API_TOKEN,
);

export {
  loadAiConfig,
  saveAiConfig,
  POPULAR_NARA_MODELS,
  POPULAR_SUMOPOD_MODELS,
};
export type { AiModelConfig, AiGateway } from "./domain/types";
