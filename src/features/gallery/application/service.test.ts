import { describe, expect, it, vi } from "vitest";
import { createGalleryService } from "./service";
import type { GalleryItem } from "../domain/types";

const item: GalleryItem = {
  id: "photo-1",
  title: "Morning sky",
  description: "Soft light above the hills.",
  alt: "Pink morning sky above green hills",
  imageUrl: "https://images.example/gallery/photo-1.webp",
  objectKey: "gallery/86dc681b-22e0-4f91-af4a-03a52b763ada.webp",
  width: 1600,
  height: 1200,
  createdAt: "2026-09-25T10:00:00.000Z",
};

function setup() {
  const repository = {
    list: vi.fn(async () => [item]),
    find: vi.fn(async (id: string) => (id === item.id ? item : null)),
    create: vi.fn(async (input) => ({ ...item, ...input })),
    update: vi.fn(async (_id, input) => ({ ...item, ...input })),
    delete: vi.fn(async () => true),
  };
  const storage = {
    createUploadTicket: vi.fn(async () => ({
      uploadUrl: "https://upload.example/signed",
      objectKey: item.objectKey,
      publicUrl: item.imageUrl,
      expiresIn: 600,
    })),
    getPublicUrl: vi.fn(() => item.imageUrl),
    deleteObject: vi.fn(async () => undefined),
  };
  return { repository, storage, service: createGalleryService(repository, storage) };
}

describe("gallery service", () => {
  it("creates metadata with a server-derived public URL", async () => {
    const { repository, storage, service } = setup();
    await service.create({
      title: " Morning sky ",
      description: " Soft light above the hills. ",
      objectKey: item.objectKey,
      width: 1600,
      height: 1200,
    });
    expect(storage.getPublicUrl).toHaveBeenCalledWith(item.objectKey);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Morning sky",
        alt: "Morning sky",
        imageUrl: item.imageUrl,
      }),
    );
  });

  it("rejects unsupported or oversized uploads before signing", async () => {
    const { storage, service } = setup();
    await expect(
      service.createUploadTicket({
        fileName: "photo.svg",
        contentType: "image/svg+xml",
        size: 100,
      }),
    ).rejects.toThrow("supported");
    await expect(
      service.createUploadTicket({
        fileName: "photo.jpg",
        contentType: "image/jpeg",
        size: 16 * 1024 * 1024,
      }),
    ).rejects.toThrow("15 MB");
    expect(storage.createUploadTicket).not.toHaveBeenCalled();
  });

  it("removes metadata and its R2 object", async () => {
    const { repository, storage, service } = setup();
    await expect(service.delete(item.id)).resolves.toBe(true);
    expect(repository.delete).toHaveBeenCalledWith(item.id);
    expect(storage.deleteObject).toHaveBeenCalledWith(item.objectKey);
  });

  it("discards an uploaded object when metadata cannot be saved", async () => {
    const { storage, service } = setup();
    await service.discardUpload(item.objectKey);
    expect(storage.deleteObject).toHaveBeenCalledWith(item.objectKey);
  });
});
