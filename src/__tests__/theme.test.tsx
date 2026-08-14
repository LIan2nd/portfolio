import { render, screen, cleanup, renderHook, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";

describe("ThemeProvider", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    vi.restoreAllMocks();
  });

  it("throws error when useTheme is used outside ThemeProvider", () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used within ThemeProvider"
    );
  });

  it("renders children and defaults to dark theme when OS prefers dark", () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    function TestComponent() {
      const { theme, toggleTheme } = useTheme();
      return (
        <div>
          <span data-testid="theme-val">{theme}</span>
          <button onClick={toggleTheme}>Toggle</button>
        </div>
      );
    }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
  });

  // Feature: portfolio-nextjs-migration, Property 1: Theme fallback to OS preference
  it("Property 1: falls back to OS preference for invalid or missing localStorage value", () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => s !== "dark" && s !== "light"),
        fc.boolean(),
        (storedVal, osPrefersDark) => {
          cleanup();
          localStorage.setItem("theme", storedVal);

          window.matchMedia = vi.fn().mockImplementation((query) => ({
            matches: osPrefersDark && query === "(prefers-color-scheme: dark)",
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }));

          let currentTheme = "";
          function Consumer() {
            const { theme } = useTheme();
            currentTheme = theme;
            return null;
          }

          render(
            <ThemeProvider>
              <Consumer />
            </ThemeProvider>
          );

          const expected = osPrefersDark ? "dark" : "light";
          expect(currentTheme).toBe(expected);
          cleanup();
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: portfolio-nextjs-migration, Property 2: Theme toggle round-trip
  it("Property 2: toggling theme produces opposite value in state and localStorage", () => {
    fc.assert(
      fc.property(
        fc.constantFrom<"dark" | "light">("dark", "light"),
        (initialTheme) => {
          cleanup();
          localStorage.setItem("theme", initialTheme);

          window.matchMedia = vi.fn().mockImplementation(() => ({
            matches: false,
            media: "",
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }));

          function ToggleConsumer() {
            const { theme, toggleTheme } = useTheme();
            return (
              <button data-testid="toggle-btn" onClick={toggleTheme}>
                {theme}
              </button>
            );
          }

          render(
            <ThemeProvider>
              <ToggleConsumer />
            </ThemeProvider>
          );

          const btn = screen.getByTestId("toggle-btn");
          expect(btn).toHaveTextContent(initialTheme);

          fireEvent.click(btn);
          const opposite = initialTheme === "dark" ? "light" : "dark";
          expect(btn).toHaveTextContent(opposite);
          expect(localStorage.getItem("theme")).toBe(opposite);

          cleanup();
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });
});
