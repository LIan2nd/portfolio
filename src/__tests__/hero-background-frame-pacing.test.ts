import { describe, expect, it } from "vitest";
import { createFramePacer } from "@/components/hero-background/framePacing";

function sampleFrames(interval: number, count: number) {
  const pacer = createFramePacer();
  let timestamp = 0;
  const decisions: boolean[] = [];
  for (let frame = 0; frame < count; frame += 1) {
    timestamp += interval;
    decisions.push(pacer.shouldDraw(timestamp));
  }
  return decisions;
}

describe("hero background frame pacing", () => {
  it("draws every refresh on a regular 60 Hz display", () => {
    expect(sampleFrames(1000 / 60, 20).every(Boolean)).toBe(true);
  });

  it("uses an even every-other-frame cadence on a 144 Hz display", () => {
    const decisions = sampleFrames(1000 / 144, 14);
    expect(decisions.slice(9)).toEqual([false, true, false, true, false]);
  });

  it("returns to full-rate sampling after reset", () => {
    const pacer = createFramePacer();
    for (let frame = 1; frame <= 12; frame += 1) {
      pacer.shouldDraw((frame * 1000) / 144);
    }
    pacer.reset();

    expect(pacer.shouldDraw(100)).toBe(true);
    expect(pacer.shouldDraw(100 + 1000 / 60)).toBe(true);
  });
});
