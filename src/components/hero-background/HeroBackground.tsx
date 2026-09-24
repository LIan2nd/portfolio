"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { createFramePacer } from "./framePacing";
import { createSkyRenderer, type SkyRenderer } from "./renderer";
import styles from "./HeroBackground.module.css";

const STILL_TIME = 8;

export function HeroBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const updateThemeRef = useRef<(isLight: boolean) => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const framePacer = createFramePacer();
    const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
    let renderer: SkyRenderer | null = null;
    let hasAttemptedRenderer = false;
    let pendingPointer: { x: number; y: number } | null = null;
    let targetDaylight = document.documentElement.dataset.theme === "light" ? 1 : 0;
    let daylight = targetDaylight;
    let isVisible = false;
    let isContextLost = false;
    let frameId = 0;
    let lastDrawTime = 0;
    let elapsed = 0;

    function draw(delta = 0) {
      if (!renderer || isContextLost) return;
      if (pendingPointer) {
        const bounds = canvas!.getBoundingClientRect();
        pointer.targetX = Math.max(0, Math.min(1, (pendingPointer.x - bounds.left) / Math.max(1, bounds.width)));
        pointer.targetY = 1 - Math.max(0, Math.min(1, (pendingPointer.y - bounds.top) / Math.max(1, bounds.height)));
        pendingPointer = null;
      }
      const isStill = motionPreference.matches;
      elapsed += delta / 1000;
      const easing = 1 - Math.exp(-delta / 200);
      daylight = isStill ? targetDaylight : daylight + (targetDaylight - daylight) * easing;
      if (Math.abs(targetDaylight - daylight) < 0.001) daylight = targetDaylight;
      pointer.x += (pointer.targetX - pointer.x) * easing;
      pointer.y += (pointer.targetY - pointer.y) * easing;
      renderer.draw({
        time: isStill ? STILL_TIME : elapsed,
        daylight,
        motionEnabled: !isStill,
        pointer: isStill ? { x: 0.5, y: 0.5 } : pointer,
      });
      if (canvas!.dataset.ready !== "true") canvas!.dataset.ready = "true";
    }

    function tick(now: number) {
      if (motionPreference.matches) {
        draw();
        return;
      }
      if (framePacer.shouldDraw(now)) {
        draw(Math.min(now - lastDrawTime, 100));
        lastDrawTime = now;
      }
      frameId = requestAnimationFrame(tick);
    }

    function updateAnimation() {
      cancelAnimationFrame(frameId);
      if (!isVisible || document.hidden || isContextLost) return;
      if (!renderer && !hasAttemptedRenderer) {
        hasAttemptedRenderer = true;
        renderer = createSkyRenderer(canvas!);
      }
      if (!renderer) return;
      draw();
      if (motionPreference.matches) return;
      framePacer.reset();
      lastDrawTime = performance.now();
      frameId = requestAnimationFrame(tick);
    }

    function resize() {
      if (!renderer || isContextLost) return;
      try {
        if (renderer.resize()) updateAnimation();
      } catch {
        cancelAnimationFrame(frameId);
        renderer.dispose();
        renderer = null;
        delete canvas!.dataset.ready;
      }
    }

    function movePointer(event: PointerEvent) {
      if (motionPreference.matches || !isVisible || event.pointerType === "touch") return;
      pendingPointer = { x: event.clientX, y: event.clientY };
    }

    function loseContext(event: Event) {
      event.preventDefault();
      isContextLost = true;
      // Context loss releases GPU resources and invalidates their handles.
      renderer = null;
      hasAttemptedRenderer = false;
      delete canvas!.dataset.ready;
      cancelAnimationFrame(frameId);
    }

    function restoreContext() {
      isContextLost = false;
      updateAnimation();
    }

    updateThemeRef.current = (isLight) => {
      if (!isLight && targetDaylight === 1) elapsed = 0;
      targetDaylight = isLight ? 1 : 0;
      if (motionPreference.matches || !isVisible || document.hidden) daylight = targetDaylight;
      updateAnimation();
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      updateAnimation();
    });
    const resizeObserver = new ResizeObserver(resize);
    visibilityObserver.observe(canvas);
    resizeObserver.observe(canvas);
    motionPreference.addEventListener("change", updateAnimation);
    document.addEventListener("visibilitychange", updateAnimation);
    window.addEventListener("pointermove", movePointer, { passive: true });
    window.addEventListener("resize", resize);
    canvas.addEventListener("webglcontextlost", loseContext);
    canvas.addEventListener("webglcontextrestored", restoreContext);

    return () => {
      cancelAnimationFrame(frameId);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      motionPreference.removeEventListener("change", updateAnimation);
      document.removeEventListener("visibilitychange", updateAnimation);
      window.removeEventListener("pointermove", movePointer);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", loseContext);
      canvas.removeEventListener("webglcontextrestored", restoreContext);
      updateThemeRef.current = () => {};
      delete canvas.dataset.ready;
      renderer?.dispose();
    };
  }, []);

  useEffect(() => {
    updateThemeRef.current(theme === "light");
  }, [theme]);

  return (
    <div id="hero-background" className={styles.background} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.scrim} />
    </div>
  );
}
