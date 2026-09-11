import { describe, expect, it, vi } from "vitest";
import { createHistoryHandlers } from "./handlers";
import { createChatHistoryService } from "../application/service";
import type { ChatHistoryRepository } from "../domain/types";

const token = "synthetic-token-for-tests-only-0000000000000";
function request(query = "", authorization = `Bearer ${token}`) {
  return new Request(`http://localhost/api/admin/v1/chat-history${query}`, {
    headers: { authorization },
  });
}
function setup(configured: string | undefined = token) {
  const repository: ChatHistoryRepository = {
    list: vi.fn(async () => ({ items: [], nextCursor: null })),
    find: vi.fn(async () => null),
    summarize: vi.fn(async () => ({ total: 0, answered: 0 })),
  };
  return {
    repository,
    handlers: createHistoryHandlers(
      createChatHistoryService(repository),
      () => configured,
    ),
  };
}

describe("read-only history API boundary", () => {
  it.each(["", "Bearer wrong", `Basic ${token}`, `Bearer ${token}extra`])(
    "rejects invalid authorization before reading data: %s",
    async (authorization) => {
      const { repository, handlers } = setup();
      expect((await handlers.list(request("", authorization))).status).toBe(
        401,
      );
      expect((await handlers.summary(request("", authorization))).status).toBe(
        401,
      );
      expect(
        (
          await handlers.detail(
            request("", authorization),
            "000000000000000000000001",
          )
        ).status,
      ).toBe(401);
      expect(repository.list).not.toHaveBeenCalled();
      expect(repository.summarize).not.toHaveBeenCalled();
      expect(repository.find).not.toHaveBeenCalled();
    },
  );
  it("fails closed when the integration token is absent or too short", async () => {
    for (const configured of ["", "short"]) {
      const { handlers, repository } = setup(configured);
      expect((await handlers.list(request())).status).toBe(503);
      expect(repository.list).not.toHaveBeenCalled();
    }
  });
  it.each([
    "?limit=51",
    "?limit=-1",
    "?limit=1.5",
    "?q=" + "x".repeat(201),
    "?date=2026-02-30",
    "?status=failed",
    "?cursor=bad",
    "?limit=2&limit=3",
    "?unknown=1",
  ])("rejects invalid filters before reading data: %s", async (query) => {
    const { handlers, repository } = setup();
    expect((await handlers.list(request(query))).status).toBe(400);
    expect(repository.list).not.toHaveBeenCalled();
  });
  it("disables caching and returns no secrets on a storage failure", async () => {
    const { handlers, repository } = setup();
    vi.mocked(repository.list).mockRejectedValue(
      new Error("mongodb://secret-host/private-history"),
    );
    const response = await handlers.list(request());
    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await response.text()).not.toContain("secret-host");
  });
  it("distinguishes unknown IDs from invalid IDs", async () => {
    const { handlers } = setup();
    expect((await handlers.detail(request(), "invalid")).status).toBe(400);
    expect(
      (await handlers.detail(request(), "000000000000000000000001")).status,
    ).toBe(404);
  });
});
