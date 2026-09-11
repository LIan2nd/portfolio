import { describe, expect, it, vi } from "vitest";
import { createExperienceHandlers } from "./handlers";
import { createExperienceService } from "../application/service";
import type { ExperienceEntry } from "../domain/types";

const token = "synthetic-token-for-tests-only-0000000000000";

const mockEntries: ExperienceEntry[] = [
  {
    id: "work-teaching-assistant",
    title: "Teaching Assistant",
    organization: "STT Terpadu Nurul Fikri",
    kind: "work",
    dateRange: "May 2026 - Jul 2026",
    description: "Mentored students in core DSA concepts.",
    highlights: ["Mentored students", "Graded assignments"],
  },
  {
    id: "education-bachelor",
    title: "Bachelor of Computer Science",
    organization: "STT Terpadu Nurul Fikri",
    kind: "education",
    dateRange: "2022 - 2026",
    description: "Graduated with Honors.",
    highlights: ["Cumlaude IPK 3.94"],
  },
];

function request(query = "", authorization = `Bearer ${token}`) {
  return new Request(`http://localhost/api/admin/v1/experience${query}`, {
    headers: { authorization },
  });
}

function setup(configured: string | undefined = token) {
  const repository = {
    loadExperienceEntries: vi.fn(() => [...mockEntries]),
    saveExperienceEntry: vi.fn(
      (
        input: {
          id?: string;
          title: string;
          organization: string;
          kind: "work" | "education";
          dateRange: string;
          description: string;
          highlights: string[];
        },
        _isEdit?: boolean,
      ) => ({
        id: input.id || "work-new-role",
        title: input.title,
        organization: input.organization,
        kind: input.kind,
        dateRange: input.dateRange,
        description: input.description,
        highlights: input.highlights,
      }),
    ),
  };
  return {
    repository,
    handlers: createExperienceHandlers(
      createExperienceService(repository),
      () => configured,
    ),
  };
}

describe("experience API boundary", () => {
  it.each(["", "Bearer wrong", `Basic ${token}`, `Bearer ${token}extra`])(
    "rejects invalid authorization before reading data: %s",
    async (authorization) => {
      const { repository, handlers } = setup();
      expect((await handlers.list(request("", authorization))).status).toBe(401);
      expect(
        (
          await handlers.detail(
            request("", authorization),
            "work-teaching-assistant",
          )
        ).status,
      ).toBe(401);
      expect(repository.loadExperienceEntries).not.toHaveBeenCalled();
    },
  );

  it("fails closed when the integration token is absent or too short", async () => {
    for (const configured of ["", "short"]) {
      const { handlers, repository } = setup(configured);
      expect((await handlers.list(request())).status).toBe(503);
      expect(repository.loadExperienceEntries).not.toHaveBeenCalled();
    }
  });

  it("lists experience entries with valid authorization", async () => {
    const { handlers, repository } = setup();
    const res = await handlers.list(request());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.items).toHaveLength(2);
    expect(json.items[0].id).toBe("work-teaching-assistant");
    expect(repository.loadExperienceEntries).toHaveBeenCalled();
  });

  it("filters entries by kind", async () => {
    const { handlers } = setup();
    const res = await handlers.list(request("?kind=work"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.items).toHaveLength(1);
    expect(json.items[0].kind).toBe("work");
  });

  it("returns 404 for unknown entry", async () => {
    const { handlers } = setup();
    const res = await handlers.detail(request(), "non-existent");
    expect(res.status).toBe(404);
  });

  it("returns entry detail for valid id", async () => {
    const { handlers } = setup();
    const res = await handlers.detail(request(), "work-teaching-assistant");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("work-teaching-assistant");
    expect(json.title).toBe("Teaching Assistant");
  });

  it("creates a new experience entry with valid payload", async () => {
    const { handlers, repository } = setup();
    const body = JSON.stringify({
      title: "Senior Engineer",
      organization: "Tech Corp",
      kind: "work",
      dateRange: "2025 - Present",
      description: "Leading frontend architecture.",
      highlights: ["Built modern dashboard"],
    });
    const req = new Request("http://localhost/api/admin/v1/experience", {
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
    expect(json.title).toBe("Senior Engineer");
    expect(repository.saveExperienceEntry).toHaveBeenCalled();
  });

  it("rejects experience creation with 400 on invalid payload", async () => {
    const { handlers } = setup();
    const req = new Request("http://localhost/api/admin/v1/experience", {
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

  it("updates an existing experience entry with valid payload", async () => {
    const { handlers, repository } = setup();
    const body = JSON.stringify({
      title: "Lead Teaching Assistant",
      organization: "STT Terpadu Nurul Fikri",
      kind: "work",
      dateRange: "May 2026 - Present",
      description: "Mentoring 20+ students.",
      highlights: ["Mentored students", "Conducted workshops"],
    });
    const req = new Request(
      "http://localhost/api/admin/v1/experience/work-teaching-assistant",
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body,
      },
    );
    const res = await handlers.update(req, "work-teaching-assistant");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.title).toBe("Lead Teaching Assistant");
    expect(repository.saveExperienceEntry).toHaveBeenCalled();
  });

  it("returns 404 when updating non-existent experience entry", async () => {
    const { handlers } = setup();
    const body = JSON.stringify({
      title: "Role",
      organization: "Org",
      kind: "work",
      dateRange: "2024",
      description: "Desc",
      highlights: [],
    });
    const req = new Request(
      "http://localhost/api/admin/v1/experience/non-existent",
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body,
      },
    );
    const res = await handlers.update(req, "non-existent");
    expect(res.status).toBe(404);
  });
});

