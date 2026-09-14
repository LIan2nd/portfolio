"use client";

import { useLayoutEffect, useState, type CSSProperties } from "react";

interface ViewportBounds {
  height: number;
  bottomOffset: number;
}

interface FloatingViewportStyle extends CSSProperties {
  "--floating-viewport-height"?: string;
  "--floating-bottom-offset"?: string;
}

export function useFloatingViewport(enabled: boolean): FloatingViewportStyle {
  const [bounds, setBounds] = useState<ViewportBounds | null>(null);

  useLayoutEffect(() => {
    if (!enabled) return;
    const viewport = window.visualViewport;

    function updateBounds() {
      const layoutHeight = document.documentElement.clientHeight || window.innerHeight;
      const height = Math.min(layoutHeight, viewport?.height || layoutHeight);
      const bottomOffset = Math.max(0, layoutHeight - height - (viewport?.offsetTop || 0));
      setBounds((previous) =>
        previous?.height === height && previous.bottomOffset === bottomOffset
          ? previous
          : { height, bottomOffset },
      );
    }

    updateBounds();
    window.addEventListener("resize", updateBounds);
    viewport?.addEventListener("resize", updateBounds);
    viewport?.addEventListener("scroll", updateBounds);

    return () => {
      window.removeEventListener("resize", updateBounds);
      viewport?.removeEventListener("resize", updateBounds);
      viewport?.removeEventListener("scroll", updateBounds);
    };
  }, [enabled]);

  return bounds
    ? {
        "--floating-viewport-height": `${bounds.height}px`,
        "--floating-bottom-offset": `${bounds.bottomOffset}px`,
      }
    : {};
}
