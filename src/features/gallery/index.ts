import "server-only";
import { createGalleryHandlers } from "./api/handlers";
import { createGalleryService } from "./application/service";
import { galleryRepository, loadGalleryItems } from "./infrastructure/repository";
import { r2GalleryStorage } from "./infrastructure/r2-object-storage";

export const galleryService = createGalleryService(
  galleryRepository,
  r2GalleryStorage,
);

export const galleryHandlers = createGalleryHandlers(
  galleryService,
  () => process.env.DASHBOARD_API_TOKEN,
);

export { loadGalleryItems };
export type { GalleryItem } from "./domain/types";
