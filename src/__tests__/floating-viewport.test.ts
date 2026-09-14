import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFloatingViewport } from "@/hooks/useFloatingViewport";

function mockViewport(height: number, offsetTop = 0) {
  const viewport = Object.assign(new EventTarget(), { height, offsetTop });
  vi.stubGlobal("visualViewport", viewport);
  return viewport;
}

describe("floating panel viewport", () => {
  beforeEach(() => {
    vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(900);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps the existing edge spacing when the whole viewport is visible", () => {
    mockViewport(900);
    const { result } = renderHook(() => useFloatingViewport(true));

    expect(result.current).toEqual({
      "--floating-viewport-height": "900px",
      "--floating-bottom-offset": "0px",
    });
  });

  it("raises the panel above an obscured bottom edge and restores it after resizing", () => {
    const viewport = mockViewport(850);
    const { result } = renderHook(() => useFloatingViewport(true));

    expect(result.current["--floating-bottom-offset"]).toBe("50px");

    act(() => {
      viewport.height = 620;
      viewport.dispatchEvent(new Event("resize"));
    });
    expect(result.current["--floating-bottom-offset"]).toBe("280px");
    expect(result.current["--floating-viewport-height"]).toBe("620px");

    act(() => {
      viewport.height = 900;
      viewport.dispatchEvent(new Event("resize"));
    });
    expect(result.current["--floating-bottom-offset"]).toBe("0px");
  });

  it("accounts for the visible viewport moving downward without a negative bottom offset", () => {
    const viewport = mockViewport(620, 80);
    const { result } = renderHook(() => useFloatingViewport(true));
    expect(result.current["--floating-bottom-offset"]).toBe("200px");

    act(() => {
      viewport.offsetTop = 300;
      viewport.dispatchEvent(new Event("scroll"));
    });
    expect(result.current["--floating-bottom-offset"]).toBe("0px");
  });

  it("uses the layout viewport when VisualViewport is unavailable", () => {
    vi.stubGlobal("visualViewport", undefined);
    const { result } = renderHook(() => useFloatingViewport(true));

    act(() => {
      vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(700);
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toEqual({
      "--floating-viewport-height": "700px",
      "--floating-bottom-offset": "0px",
    });
  });

  it("stops tracking while hidden and measures again when the panel returns", () => {
    const viewport = mockViewport(850);
    const removeListener = vi.spyOn(viewport, "removeEventListener");
    const { result, rerender, unmount } = renderHook(
      (enabled: boolean) => useFloatingViewport(enabled),
      { initialProps: true },
    );

    rerender(false);
    expect(removeListener).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith("scroll", expect.any(Function));

    act(() => {
      viewport.height = 600;
      viewport.dispatchEvent(new Event("resize"));
    });
    expect(result.current["--floating-viewport-height"]).toBe("850px");

    rerender(true);
    expect(result.current["--floating-viewport-height"]).toBe("600px");
    removeListener.mockClear();
    unmount();
    expect(removeListener).toHaveBeenCalledTimes(2);
  });
});
