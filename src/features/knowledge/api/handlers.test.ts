import { describe, expect, it, vi } from "vitest";
import { createKnowledgeHandlers } from "./handlers";
import { createKnowledgeService } from "../application/service";
import type { KnowledgeDocument } from "../domain/types";

const token = "synthetic-token-for-tests-only-0000000000000";

const mockDocuments: KnowledgeDocument[] = [
  {
    id: "about_alfian",
    title: "About Alfian",
    description: "Profile description",
    category: "Profile",
    content: "# About Alfian\n\nContent here.",
    updatedAt: "2026-09-08T08:00:00.000Z",
  },
  {
    id: "roadsense",
    title: "RoadSense",
    description: "GIS navigation",
    category: "Projects",
    content: "# RoadSense\n\nGIS content.",
    updatedAt: "2026-09-08T08:00:00.000Z",
  },
];

function request(query = "", authorization = `Bearer ${token}`) {
  return new Request(`http://localhost/api/admin/v1/knowledge${query}`, {
    headers: { authorization },
  });
}

function setup(configured: string | undefined = token) {
  const repository = {
    loadKnowledgeDocuments: vi.fn(() => [...mockDocuments]),
    saveKnowledgeDocument: vi.fn(
      (input: {
        id?: string;
        title: string;
        category: string;
        description?: string;
        content: string;
      }) => ({
        id: input.id || "created-slug",
        title: input.title,
        category: input.category,
        description: input.description || "Description",
        content: input.content,
        updatedAt: "2026-09-11T12:00:00.000Z",
      }),
    ),
  };
  return {
    repository,
    handlers: createKnowledgeHandlers(
      createKnowledgeService(repository),
      () => configured,
    ),
  };
}

describe("knowledge API boundary", () => {
  it.each(["", "Bearer wrong", `Basic ${token}`, `Bearer ${token}extra`])(
    "rejects invalid authorization before reading data: %s",
    async (authorization) => {
      const { repository, handlers } = setup();
      expect((await handlers.list(request("", authorization))).status).toBe(401);
      expect(
        (await handlers.detail(request("", authorization), "about_alfian"))
          .status,
      ).toBe(401);
      expect(repository.loadKnowledgeDocuments).not.toHaveBeenCalled();
    },
  );

  it("fails closed when the integration token is absent or too short", async () => {
    for (const configured of ["", "short"]) {
      const { handlers, repository } = setup(configured);
      expect((await handlers.list(request())).status).toBe(503);
      expect(repository.loadKnowledgeDocuments).not.toHaveBeenCalled();
    }
  });

  it("lists knowledge documents with valid authorization", async () => {
    const { handlers, repository } = setup();
    const res = await handlers.list(request());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.items).toHaveLength(2);
    expect(json.items[0].id).toBe("about_alfian");
    expect(repository.loadKnowledgeDocuments).toHaveBeenCalled();
  });

  it("filters documents by search query", async () => {
    const { handlers } = setup();
    const res = await handlers.list(request("?q=roadsense"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.items).toHaveLength(1);
    expect(json.items[0].id).toBe("roadsense");
  });

  it("returns 404 for unknown document", async () => {
    const { handlers } = setup();
    const res = await handlers.detail(request(), "non-existent");
    expect(res.status).toBe(404);
  });

  it("returns document detail for valid id", async () => {
    const { handlers } = setup();
    const res = await handlers.detail(request(), "about_alfian");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("about_alfian");
    expect(json.title).toBe("About Alfian");
  });

  it("creates a new document with valid payload", async () => {
    const { handlers, repository } = setup();
    const body = JSON.stringify({
      title: "New Project",
      category: "Projects",
      content: "# New Project\n\nContent details.",
    });
    const req = new Request("http://localhost/api/admin/v1/knowledge", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body,
    });
    const res = await handlers.create(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.title).toBe("New Project");
    expect(repository.saveKnowledgeDocument).toHaveBeenCalled();
  });

  it("rejects document creation with 400 on missing required fields", async () => {
    const { handlers } = setup();
    const req = new Request("http://localhost/api/admin/v1/knowledge", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ title: "Incomplete" }),
    });
    const res = await handlers.create(req);
    expect(res.status).toBe(400);
  });

  it("updates an existing document with valid payload", async () => {
    const { handlers, repository } = setup();
    const body = JSON.stringify({
      title: "About Alfian Updated",
      category: "Profile",
      content: "# About Alfian\n\nUpdated content.",
    });
    const req = new Request(
      "http://localhost/api/admin/v1/knowledge/about_alfian",
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body,
      },
    );
    const res = await handlers.update(req, "about_alfian");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.title).toBe("About Alfian Updated");
    expect(repository.saveKnowledgeDocument).toHaveBeenCalled();
  });

  it("returns 404 when updating non-existent document", async () => {
    const { handlers } = setup();
    const body = JSON.stringify({
      title: "Non-existent",
      category: "Projects",
      content: "Content",
    });
    const req = new Request(
      "http://localhost/api/admin/v1/knowledge/not-found",
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body,
      },
    );
    const res = await handlers.update(req, "not-found");
    expect(res.status).toBe(404);
  });
});

