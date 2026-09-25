import { describe, expect, it } from "vitest";
import { isMissingR2Object } from "./r2-object-storage";

describe("R2 object storage", () => {
  it("treats an already missing object as deleted", () => {
    expect(isMissingR2Object({ name: "NoSuchKey" })).toBe(true);
    expect(
      isMissingR2Object({ $metadata: { httpStatusCode: 404 } }),
    ).toBe(true);
  });

  it("does not hide other R2 failures", () => {
    expect(
      isMissingR2Object({
        name: "AccessDenied",
        $metadata: { httpStatusCode: 403 },
      }),
    ).toBe(false);
    expect(isMissingR2Object(new Error("Network unavailable"))).toBe(false);
  });
});
