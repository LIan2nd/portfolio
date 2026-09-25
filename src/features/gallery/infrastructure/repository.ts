import { getMongoDb } from "@/lib/mongodb";
import { createMongoGalleryRepository } from "./mongodb-repository";

export const galleryRepository = createMongoGalleryRepository(getMongoDb);

export const loadGalleryItems = galleryRepository.list;
