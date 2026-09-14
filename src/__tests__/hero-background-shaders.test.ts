import { describe, expect, it } from "vitest";
import {
  SKY_COMPOSITE_SHADER,
  SKY_FRAGMENT_SHADER,
  SKY_VERTEX_SHADER,
} from "@/components/hero-background/shaders";

describe("hero background shooting star shaders", () => {
  it("schedules a short event after the initial delay and on faster cycles", () => {
    expect(SKY_VERTEX_SHADER).toContain("flat out vec4 shootingStar;");
    expect(SKY_VERTEX_SHADER).toContain("uniform bool motionEnabled;");
    expect(SKY_VERTEX_SHADER).toContain("const float cycleLength = 11.0;");
    expect(SKY_VERTEX_SHADER).toContain("const float delayStart = 3.0;");
    expect(SKY_VERTEX_SHADER).toContain("const float delayRange = 1.0;");
    expect(SKY_VERTEX_SHADER).toContain("const float duration = 1.15;");
    expect(SKY_VERTEX_SHADER).toContain("float eventStart = cycle * cycleLength");
  });

  it("varies the starting point across the viewport while keeping the travel inside it", () => {
    expect(SKY_VERTEX_SHADER).toContain("float travel = min(0.34, aspect * 0.45);");
    expect(SKY_VERTEX_SHADER).toContain("mix(-0.5 * aspect, 0.5 * aspect - travel");
  });

  it("keeps light mode atmospheric with thin clouds and a subtle sun shimmer", () => {
    expect(SKY_FRAGMENT_SHADER).toContain("float clouds = smoothstep(0.5, 0.68, cloudField);");
    expect(SKY_FRAGMENT_SHADER).toContain("clouds * 0.52");
    expect(SKY_FRAGMENT_SHADER).toContain("float shimmerPulse = 0.5 + 0.5 * sin(time * 0.7 + 1.3);");
    expect(SKY_FRAGMENT_SHADER).toContain("float sunShimmer = exp(-pow(sunDistance / 0.24, 2.0))");
  });

  it("disables the streak for reduced motion or daylight and renders it in the composite", () => {
    expect(SKY_VERTEX_SHADER).toContain("if (!motionEnabled || dayMix == 1.0) return vec4(0.0);");
    expect(SKY_COMPOSITE_SHADER).toContain("flat in vec4 shootingStar;");
    expect(SKY_COMPOSITE_SHADER).toContain("float shootingStarLight(vec2 uv)");
    expect(SKY_COMPOSITE_SHADER).toContain("shootingStarLight(uv)");
    expect(SKY_COMPOSITE_SHADER).toContain("if (dayMix < 1.0)");
  });
});