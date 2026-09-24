import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroBackground } from "@/components/hero-background/HeroBackground";

const mocks = vi.hoisted(() => ({
  theme: "dark",
  draw: vi.fn(),
  resize: vi.fn(() => false),
  dispose: vi.fn(),
  createRenderer: vi.fn(),
}));

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({ theme: mocks.theme }),
}));

vi.mock("@/components/hero-background/renderer", () => ({
  createSkyRenderer: mocks.createRenderer,
}));

describe("HeroBackground rendering lifecycle", () => {
  let setVisible: (visible: boolean) => void;
  let notifyResize: () => void;
  let motion: EventTarget & { matches: boolean };
  let hidden: boolean;
  let now: number;
  let nextFrameId: number;
  let frames: Map<number, FrameRequestCallback>;

  function advanceFrame(milliseconds: number) {
    now += milliseconds;
    const callbacks = [...frames.values()];
    frames.clear();
    act(() => callbacks.forEach((callback) => callback(now)));
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.theme = "dark";
    mocks.resize.mockReset().mockReturnValue(false);
    mocks.createRenderer.mockReset().mockReturnValue({
      draw: mocks.draw,
      resize: mocks.resize,
      dispose: mocks.dispose,
    });
    document.documentElement.dataset.theme = "dark";
    hidden = false;
    now = 0;
    nextFrameId = 0;
    frames = new Map();
    motion = Object.assign(new EventTarget(), { matches: false });
    vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
    vi.spyOn(performance, "now").mockImplementation(() => now);
    vi.stubGlobal("matchMedia", () => motion);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.set(++nextFrameId, callback);
      return nextFrameId;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        setVisible = (visible) => act(() => callback([{ isIntersecting: visible }]));
      }
      observe() {}
      disconnect() {}
    });
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: () => void) {
        notifyResize = () => act(callback);
      }
      observe() {}
      disconnect() {}
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete document.documentElement.dataset.theme;
  });

  it("defers GPU initialization until visible and pauses while offscreen or hidden", () => {
    render(<HeroBackground />);
    expect(mocks.createRenderer).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);

    setVisible(true);
    expect(mocks.createRenderer).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(1);
    advanceFrame(16);
    expect(mocks.draw).toHaveBeenCalledTimes(2);
    expect(mocks.draw).toHaveBeenLastCalledWith(
      expect.objectContaining({ time: 0.016, motionEnabled: true }),
    );
    advanceFrame(34);
    expect(mocks.draw).toHaveBeenLastCalledWith(expect.objectContaining({ time: 0.05, motionEnabled: true }));
    advanceFrame(20);
    expect(mocks.draw).toHaveBeenLastCalledWith(expect.objectContaining({ time: 0.07 }));

    setVisible(false);
    const drawCount = mocks.draw.mock.calls.length;
    advanceFrame(10_000);
    expect(mocks.draw).toHaveBeenCalledTimes(drawCount);
    expect(frames.size).toBe(0);
    setVisible(true);
    expect(mocks.draw).toHaveBeenLastCalledWith(expect.objectContaining({ time: 0.07 }));
    expect(mocks.createRenderer).toHaveBeenCalledTimes(1);

    hidden = true;
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(frames.size).toBe(0);
    hidden = false;
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(frames.size).toBe(1);
  });

  it("keeps reduced motion static while responding to theme and actual size changes", () => {
    motion.matches = true;
    const view = render(<HeroBackground />);
    setVisible(true);
    expect(mocks.draw).toHaveBeenLastCalledWith({
      time: 8, daylight: 0, motionEnabled: false, pointer: { x: 0.5, y: 0.5 },
    });
    expect(frames.size).toBe(0);
    notifyResize();
    expect(mocks.draw).toHaveBeenCalledTimes(1);
    mocks.resize.mockReturnValueOnce(true);
    notifyResize();
    expect(mocks.draw).toHaveBeenCalledTimes(2);

    mocks.theme = "light";
    view.rerender(<HeroBackground />);
    expect(mocks.draw).toHaveBeenLastCalledWith({
      time: 8, daylight: 1, motionEnabled: false, pointer: { x: 0.5, y: 0.5 },
    });
    expect(frames.size).toBe(0);
    motion.matches = false;
    act(() => motion.dispatchEvent(new Event("change")));
    expect(frames.size).toBe(1);
  });

  it("batches pointer movement into a single layout read per rendered frame", () => {
    const { container } = render(<HeroBackground />);
    setVisible(true);
    const canvas = container.querySelector("canvas")!;
    const readBounds = vi.spyOn(canvas, "getBoundingClientRect");
    for (let x = 0; x < 20; x++) {
      window.dispatchEvent(new MouseEvent("pointermove", { clientX: x, clientY: 10 }));
    }
    expect(readBounds).not.toHaveBeenCalled();
    advanceFrame(34);
    expect(readBounds).toHaveBeenCalledTimes(1);
  });

  it("stops continuous rendering if reduced motion changes before its event arrives", () => {
    render(<HeroBackground />);
    setVisible(true);
    motion.matches = true;
    advanceFrame(34);
    expect(mocks.draw).toHaveBeenLastCalledWith({
      time: 8, daylight: 0, motionEnabled: false, pointer: { x: 0.5, y: 0.5 },
    });
    expect(frames.size).toBe(0);
  });

  it("restores lost contexts only when visible and releases resources on unmount", () => {
    const { container, unmount } = render(<HeroBackground />);
    setVisible(true);
    const canvas = container.querySelector("canvas")!;
    expect(canvas).toHaveAttribute("data-ready", "true");
    const lost = new Event("webglcontextlost", { cancelable: true });
    act(() => canvas.dispatchEvent(lost));
    expect(lost.defaultPrevented).toBe(true);
    expect(canvas).not.toHaveAttribute("data-ready");
    expect(frames.size).toBe(0);
    expect(mocks.dispose).not.toHaveBeenCalled();

    setVisible(false);
    act(() => canvas.dispatchEvent(new Event("webglcontextrestored")));
    expect(mocks.createRenderer).toHaveBeenCalledTimes(1);
    setVisible(true);
    expect(mocks.createRenderer).toHaveBeenCalledTimes(2);
    expect(canvas).toHaveAttribute("data-ready", "true");
    unmount();
    expect(mocks.dispose).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
  });

  it("uses the CSS sky if allocation fails after a resize", () => {
    const { container } = render(<HeroBackground />);
    setVisible(true);
    mocks.resize.mockImplementationOnce(() => { throw new Error("GPU allocation failed"); });
    notifyResize();
    expect(container.querySelector("canvas")).not.toHaveAttribute("data-ready");
    expect(mocks.dispose).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
  });

  it("keeps the CSS fallback without repeatedly requesting an unavailable renderer", () => {
    mocks.createRenderer.mockReturnValue(null);
    const { container } = render(<HeroBackground />);
    setVisible(true);
    setVisible(false);
    setVisible(true);
    expect(mocks.createRenderer).toHaveBeenCalledTimes(1);
    expect(container.querySelector("canvas")).not.toHaveAttribute("data-ready");
    expect(frames.size).toBe(0);
  });
});
