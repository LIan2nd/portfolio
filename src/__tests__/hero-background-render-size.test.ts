import { describe, expect, it } from "vitest";
import { getSkyRenderSize } from "@/components/hero-background/renderer";

describe("hero background render sizing", () => {
  it("keeps Full HD sharp on a high-density display", () => {
    expect(getSkyRenderSize(1920, 1080, 2)).toEqual({
      width: 2560,
      height: 1440,
    });
  });

  it("retains near-native detail on a 2560 by 1600 laptop display", () => {
    const size = getSkyRenderSize(2560, 1600, 1);
    expect(size.width).toBeGreaterThanOrEqual(2400);
    expect(size.height).toBeGreaterThanOrEqual(1500);
    expect(size.width * size.height).toBeLessThanOrEqual(2560 * 1440);
  });

  it("caps a 4K viewport at a crisp QHD render target", () => {
    expect(getSkyRenderSize(3840, 2160, 1)).toEqual({
      width: 2560,
      height: 1440,
    });
  });
});
