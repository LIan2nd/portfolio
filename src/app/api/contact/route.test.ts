import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { saveContactMessage } from "@/features/contact";

vi.mock("@/features/contact", () => ({ saveContactMessage: vi.fn() }));

function request(ip: string) {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({
      name: "Sample visitor",
      email: "visitor@example.com",
      message: "Sample contact message",
      _timing: 5_000,
    }),
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("contact submission rate limit", () => {
  it("expires rate limits on the next request without background timers", async () => {
    vi.useFakeTimers();
    vi.stubEnv("CONTACT_SCRIPT_URL", "");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { POST } = await import("./route");

    expect(vi.getTimerCount()).toBe(0);
    for (let attempt = 0; attempt < 5; attempt++) {
      expect((await POST(request("192.0.2.1"))).status).toBe(200);
    }
    expect((await POST(request("192.0.2.1"))).status).toBe(429);
    expect((await POST(request("192.0.2.2"))).status).toBe(200);
    expect(saveContactMessage).toHaveBeenCalledTimes(6);

    await vi.advanceTimersByTimeAsync(15 * 60 * 1_000);
    expect((await POST(request("192.0.2.1"))).status).toBe(200);
    expect(saveContactMessage).toHaveBeenCalledTimes(7);
    expect(vi.getTimerCount()).toBe(0);
  });
});
