import "server-only";
import { createExperienceHandlers } from "./api/handlers";
import { createExperienceService } from "./application/service";
import {
  loadExperienceEntries,
  saveExperienceEntry,
  deleteExperienceEntry,
  loadTimelineEntries,
} from "./infrastructure/data-repository";

const repository = {
  loadExperienceEntries,
  saveExperienceEntry,
  deleteExperienceEntry,
};

export const experienceHandlers = createExperienceHandlers(
  createExperienceService(repository),
  () => process.env.DASHBOARD_API_TOKEN,
);

export { loadExperienceEntries, loadTimelineEntries, deleteExperienceEntry };
export type { ExperienceEntry } from "./domain/types";
