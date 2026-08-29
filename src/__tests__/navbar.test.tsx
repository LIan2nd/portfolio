import { render, screen, renderHook, act, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AiVisibilityProvider } from "@/components/AiVisibilityContext";
import { useActiveSection } from "@/hooks/useActiveSection";
import { NAV_LINKS } from "@/lib/data";

describe("Navbar & useActiveSection", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders navigation links in correct order", () => {
    render(
      <ThemeProvider>
        <AiVisibilityProvider>
          <Navbar links={NAV_LINKS} />
        </AiVisibilityProvider>
      </ThemeProvider>
    );

    NAV_LINKS.forEach((link) => {
      const links = screen.getAllByRole("link", { name: link.label });
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByRole("link", { name: "LIand home" })).toHaveAttribute(
      "href",
      "#home"
    );
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toHaveClass(
      "grid",
      "grid-cols-[1fr_auto_1fr]"
    );
    expect(screen.getByRole("list", { name: "Portfolio sections" })).toHaveClass(
      "justify-center"
    );
  });

  it("toggles mobile menu when hamburger button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <AiVisibilityProvider>
          <Navbar links={NAV_LINKS} />
        </AiVisibilityProvider>
      </ThemeProvider>
    );

    const toggleBtn = screen.getByLabelText("Toggle navigation");
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");

    await user.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-expanded", "true");

    await user.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("renders theme toggle button and switches icon", async () => {
    const user = userEvent.setup();
    localStorage.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <AiVisibilityProvider>
          <Navbar links={NAV_LINKS} />
        </AiVisibilityProvider>
      </ThemeProvider>
    );

    const themeBtn = screen.getByLabelText(/Switch to/i);
    expect(themeBtn).toBeInTheDocument();

    await user.click(themeBtn);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("renders AI assistant toggle button and toggles state", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <AiVisibilityProvider>
          <Navbar links={NAV_LINKS} />
        </AiVisibilityProvider>
      </ThemeProvider>
    );

    const aiBtn = screen.getByLabelText(/Hide AI Assistant|Show AI Assistant/i);
    expect(aiBtn).toBeInTheDocument();

    await user.click(aiBtn);
    expect(localStorage.getItem("ai_assistant_visible")).toBe("false");
  });

  it("adapts navbar styling and blur when scrolled", () => {
    const { container } = render(
      <ThemeProvider>
        <Navbar links={NAV_LINKS} />
      </ThemeProvider>
    );

    const bgLayer = container.querySelector("header > div");
    expect(bgLayer).toHaveClass("opacity-0");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 50, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(bgLayer).toHaveClass("backdrop-blur-md");
    expect(bgLayer).toHaveClass("opacity-100");
  });

  // Feature: portfolio-nextjs-migration, Property 9: Active navigation link tracking
  it("Property 9: useActiveSection identifies the section closest to top / largest visibility", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.stringMatching(/^[a-z]{3,10}$/), { minLength: 2, maxLength: 6 }),
        fc.nat({ max: 5 }),
        (sectionIds, activeIdxRaw) => {
          cleanup();
          const activeIdx = activeIdxRaw % sectionIds.length;
          const targetSection = sectionIds[activeIdx];

          // Setup mock elements in DOM
          const createdEls: HTMLElement[] = [];
          sectionIds.forEach((id) => {
            const el = document.createElement("div");
            el.id = id;
            document.body.appendChild(el);
            createdEls.push(el);
          });

          let observerCallback: (entries: IntersectionObserverEntry[]) => void = () => {};

          class MockIntersectionObserver {
            constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
              observerCallback = cb;
            }
            observe() {}
            unobserve() {}
            disconnect() {}
          }
          window.IntersectionObserver = MockIntersectionObserver as any;

          const { result, unmount } = renderHook(() => useActiveSection(sectionIds));

          const entries: IntersectionObserverEntry[] = sectionIds.map((id, index) => ({
            target: { id } as Element,
            isIntersecting: true,
            boundingClientRect: {
              top: index === activeIdx ? 10 : 100 + index * 50,
            } as DOMRectReadOnly,
            intersectionRatio: 1,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          }));

          act(() => {
            observerCallback(entries);
          });

          expect(result.current).toBe(targetSection);

          unmount();
          cleanup();
          createdEls.forEach((el) => el.remove());
        }
      ),
      { numRuns: 100 }
    );
  });
});
