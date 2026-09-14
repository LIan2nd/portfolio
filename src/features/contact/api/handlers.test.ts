import { describe, expect, it, vi } from "vitest";
import { getMongoDb } from "@/lib/mongodb";
import type { ContactService } from "../application/service";
import { createContactHandlers } from "./handlers";

vi.mock("@/lib/mongodb", () => ({ getMongoDb: vi.fn() }));

const token = "synthetic-token-for-tests-only-0000000000000";

function request(authorization = `Bearer ${token}`) {
  return new Request("http://localhost/api/admin/v1/contact/stream", {
    headers: { authorization },
  });
}

function createService(): ContactService {
  return {
    list: vi.fn(async () => ({ items: [] })),
    find: vi.fn(async () => null),
    markRead: vi.fn(async () => null),
    delete: vi.fn(async () => false),
  };
}

describe("retired contact stream", () => {
  it("returns 204 without reading storage or starting background work", async () => {
    vi.useFakeTimers();
    try {
      const service = createService();
      const handlers = createContactHandlers(service, () => token);
      const response = await handlers.stream(request());

      expect(response.status).toBe(204);
      expect(response.body).toBeNull();
      expect(response.headers.get("Cache-Control")).toBe("private, no-store");
      await vi.advanceTimersByTimeAsync(60_000);
      expect(vi.getTimerCount()).toBe(0);
      expect(getMongoDb).not.toHaveBeenCalled();
      for (const method of Object.values(service)) {
        expect(method).not.toHaveBeenCalled();
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it.each(["", "Bearer wrong", `Basic ${token}`, `Bearer ${token}extra`])(
    "preserves authorization checks: %s",
    async (authorization) => {
      const service = createService();
      const handlers = createContactHandlers(service, () => token);
      const response = await handlers.stream(request(authorization));

      expect(response.status).toBe(401);
      expect(response.headers.get("WWW-Authenticate")).toBe("Bearer");
      expect(response.headers.get("Cache-Control")).toBe("private, no-store");
      for (const method of Object.values(service)) {
        expect(method).not.toHaveBeenCalled();
      }
    },
  );

  it.each([undefined, "", "short"])(
    "fails closed with an unconfigured token: %s",
    async (configured) => {
      const handlers = createContactHandlers(createService(), () => configured);
      expect((await handlers.stream(request())).status).toBe(503);
    },
  );
});
