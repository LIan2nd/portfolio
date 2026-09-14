import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HeroSection } from "@/components/HeroSection";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Footer } from "@/components/Footer";
import { SOCIALS } from "@/lib/data";

describe("HeroSection & Footer", () => {
  it("preserves hero content with a decorative sky when WebGL is unavailable", () => {
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(null);
    const { container, unmount } = render(
      <ThemeProvider>
        <HeroSection />
      </ThemeProvider>,
    );

    expect(screen.getByText("Hi, there, I'm")).toBeInTheDocument();
    expect(screen.getByText("Alfian Nur Usyaid")).toBeInTheDocument();
    expect(
      screen.getByText("Fullstack Web Developer — Next.js, Laravel & Blockchain")
    ).toBeInTheDocument();
    expect(screen.queryByText("Slava Auchynnikau")).not.toBeInTheDocument();
    expect(screen.queryByText("Unsplash")).not.toBeInTheDocument();

    const background = container.querySelector("#hero-background");
    expect(background).toHaveAttribute("aria-hidden", "true");
    expect(background?.querySelector("canvas")).not.toHaveAttribute("data-ready");
    expect(container.querySelector("#home img")).toBeNull();
    unmount();
    getContext.mockRestore();
  });

  it("renders Footer with copyright notice including emoji and social links", () => {
    render(<Footer socials={SOCIALS} />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} LIand 🍵`)).toBeInTheDocument();

    SOCIALS.forEach((social) => {
      const link = screen.getByLabelText(social.label);
      expect(link).toHaveAttribute("href", social.url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
