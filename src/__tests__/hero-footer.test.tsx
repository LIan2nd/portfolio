import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import { SOCIALS } from "@/lib/data";

describe("HeroSection & Footer", () => {
  it("renders HeroSection with greeting, heading, tagline, and photo credit", () => {
    const { container } = render(<HeroSection />);

    expect(screen.getByText("Hi, there, I'm")).toBeInTheDocument();
    expect(screen.getByText("Alfian Nur Usyaid")).toBeInTheDocument();
    expect(
      screen.getByText("Fullstack Web Developer — Next.js, Laravel & Blockchain")
    ).toBeInTheDocument();
    expect(screen.getByText("Slava Auchynnikau")).toBeInTheDocument();
    expect(screen.getByText("Unsplash")).toBeInTheDocument();

    const background = container.querySelector("#hero-background");
    expect(background).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("#home img")).toBeNull();
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
