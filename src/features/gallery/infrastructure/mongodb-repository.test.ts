import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoClient, type Db } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createMongoGalleryRepository } from "./mongodb-repository";

let server: MongoMemoryServer;
let client: MongoClient;
let db: Db;

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  client = await MongoClient.connect(server.getUri());
  db = client.db("synthetic_gallery_test");
}, 120_000);

beforeEach(async () => {
  await db.collection("portfolio_gallery").deleteMany({});
});

afterAll(async () => {
  await client?.close();
  await server?.stop();
});

function input(title: string, objectKey: string) {
  return {
    title,
    description: `${title} description`,
    alt: `${title} alternative text`,
    imageUrl: `https://gallery.example.com/${objectKey}`,
    objectKey,
    width: 1600,
    height: 1200,
  };
}

describe("persistent gallery repository", () => {
  it("stores new photos at the beginning of the collection", async () => {
    const repository = createMongoGalleryRepository(async () => db);
    const first = await repository.create(
      input("First", "gallery/86dc681b-22e0-4f91-af4a-03a52b763ada.webp"),
    );
    await new Promise((resolve) => setTimeout(resolve, 2));
    const second = await repository.create(
      input("Second", "gallery/e661834c-7be8-4426-bc20-e662c16f662a.webp"),
    );

    const items = await repository.list();
    expect(items.map(({ id }) => id)).toEqual([second.id, first.id]);
  });

  it("updates descriptive metadata without replacing the image", async () => {
    const repository = createMongoGalleryRepository(async () => db);
    const created = await repository.create(
      input("Original", "gallery/86dc681b-22e0-4f91-af4a-03a52b763ada.webp"),
    );
    const updated = await repository.update(created.id, {
      title: "After the rain",
      description: "Clouds opening over the city.",
      alt: "Blue clouds above a wet city street",
      takenAt: "2026-09-25",
    });

    expect(updated).toMatchObject({
      title: "After the rain",
      objectKey: created.objectKey,
      imageUrl: created.imageUrl,
      takenAt: "2026-09-25",
    });
  });

  it("removes photo metadata", async () => {
    const repository = createMongoGalleryRepository(async () => db);
    const created = await repository.create(
      input("Temporary", "gallery/86dc681b-22e0-4f91-af4a-03a52b763ada.webp"),
    );
    await expect(repository.delete(created.id)).resolves.toBe(true);
    await expect(repository.find(created.id)).resolves.toBeNull();
  });
});
