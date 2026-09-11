import "server-only";
import { createProjectHandlers } from "./api/handlers";
import { createProjectService } from "./application/service";
import {
  loadProjectEntries,
  saveProjectEntry,
  deleteProjectEntry,
  loadPortfolioProjects,
} from "./infrastructure/data-repository";

const repository = {
  loadProjectEntries,
  saveProjectEntry,
  deleteProjectEntry,
};

export const projectHandlers = createProjectHandlers(
  createProjectService(repository),
  () => process.env.DASHBOARD_API_TOKEN,
);

export {
  loadProjectEntries,
  saveProjectEntry,
  deleteProjectEntry,
  loadPortfolioProjects,
};
export type { ProjectEntry } from "./domain/types";
