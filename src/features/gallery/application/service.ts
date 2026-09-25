import type {
  GalleryInput,
  GalleryItem,
  GalleryUpdateInput,
  GalleryUploadRequest,
  GalleryUploadTicket,
} from "../domain/types";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export interface GalleryRepository {
  list(): Promise<GalleryItem[]>;
  find(id: string): Promise<GalleryItem | null>;
  create(input: GalleryInput & { imageUrl: string }): Promise<GalleryItem>;
  update(id: string, input: GalleryUpdateInput): Promise<GalleryItem>;
  delete(id: string): Promise<boolean>;
}

export interface GalleryObjectStorage {
  createUploadTicket(
    input: GalleryUploadRequest,
  ): Promise<GalleryUploadTicket>;
  getPublicUrl(objectKey: string): string;
  deleteObject(objectKey: string): Promise<void>;
}

export interface GalleryService {
  list(searchParams?: URLSearchParams): Promise<{ items: GalleryItem[] }>;
  find(id: string): Promise<GalleryItem | null>;
  create(input: GalleryInput): Promise<GalleryItem>;
  update(id: string, input: GalleryUpdateInput): Promise<GalleryItem>;
  delete(id: string): Promise<boolean>;
  createUploadTicket(
    input: GalleryUploadRequest,
  ): Promise<GalleryUploadTicket>;
  discardUpload(objectKey: string): Promise<void>;
}

export class GalleryObjectDeletionError extends Error {
  constructor(cause: unknown) {
    super("R2_DELETE_FAILED", { cause });
    this.name = "GalleryObjectDeletionError";
  }
}

function cleanRequired(
  value: string | undefined,
  field: string,
  maxLength = 5_000,
): string {
  const cleaned = value?.trim();
  if (!cleaned) throw new Error(`${field} is required.`);
  if (cleaned.length > maxLength) throw new Error(`${field} is too long.`);
  return cleaned;
}

function cleanOptional(value?: string, maxLength = 5_000): string | undefined {
  const cleaned = value?.trim() || undefined;
  if (cleaned && cleaned.length > maxLength) {
    throw new Error("Optional text is too long.");
  }
  return cleaned;
}

function cleanTakenAt(value?: string) {
  const cleaned = cleanOptional(value, 10);
  const parsed = cleaned ? new Date(`${cleaned}T00:00:00Z`) : null;
  if (
    cleaned &&
    (!parsed ||
      Number.isNaN(parsed.valueOf()) ||
      parsed.toISOString().slice(0, 10) !== cleaned)
  ) {
    throw new Error("Invalid capture date.");
  }
  return cleaned;
}

function validateDimensions(width: number, height: number) {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > 30_000 ||
    height > 30_000
  ) {
    throw new Error("Valid image dimensions are required.");
  }
}

function validateObjectKey(objectKey: string) {
  if (!/^gallery\/[a-f0-9-]+\.(avif|jpe?g|png|webp)$/i.test(objectKey)) {
    throw new Error("Invalid gallery object key.");
  }
}

function validateUpload(input: GalleryUploadRequest): GalleryUploadRequest {
  const fileName = cleanRequired(input.fileName, "File name", 255);
  if (!ALLOWED_IMAGE_TYPES.has(input.contentType)) {
    throw new Error("Only AVIF, JPEG, PNG, and WebP images are supported.");
  }
  if (!Number.isInteger(input.size) || input.size < 1 || input.size > MAX_IMAGE_BYTES) {
    throw new Error("Images must be smaller than 15 MB.");
  }
  return { fileName, contentType: input.contentType, size: input.size };
}

export function createGalleryService(
  repository: GalleryRepository,
  storage: GalleryObjectStorage,
): GalleryService {
  return {
    async list(searchParams) {
      const items = await repository.list();
      const query = searchParams?.get("q")?.trim().toLowerCase();
      if (!query) return { items };
      return {
        items: items.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query),
        ),
      };
    },

    find(id) {
      return repository.find(id);
    },

    create(input) {
      const title = cleanRequired(input.title, "Title", 120);
      const description = cleanRequired(input.description, "Description", 5_000);
      const objectKey = cleanRequired(input.objectKey, "Object key");
      validateObjectKey(objectKey);
      validateDimensions(input.width, input.height);
      return repository.create({
        title,
        description,
        alt: cleanOptional(input.alt, 240) || title,
        objectKey,
        imageUrl: storage.getPublicUrl(objectKey),
        width: input.width,
        height: input.height,
        takenAt: cleanTakenAt(input.takenAt),
      });
    },

    async update(id, input) {
      if (!id.trim()) throw new Error("Gallery item ID is required.");
      return repository.update(id, {
        title: cleanRequired(input.title, "Title", 120),
        description: cleanRequired(input.description, "Description", 5_000),
        alt: cleanOptional(input.alt, 240),
        takenAt: cleanTakenAt(input.takenAt),
      });
    },

    async delete(id) {
      const item = await repository.find(id);
      if (!item) return false;
      try {
        await storage.deleteObject(item.objectKey);
      } catch (error) {
        throw new GalleryObjectDeletionError(error);
      }
      return repository.delete(id);
    },

    async createUploadTicket(input) {
      return storage.createUploadTicket(validateUpload(input));
    },

    discardUpload(objectKey) {
      validateObjectKey(objectKey);
      return storage.deleteObject(objectKey);
    },
  };
}
