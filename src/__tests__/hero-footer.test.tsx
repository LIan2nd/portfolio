import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import { SOCIALS } from "@/lib/data";

describe("HeroSection & Footer", () => {
  it("renders HeroSection with greeting, heading, tagline, and photo credit", () => {
    render(<HeroSection />);

    expect(screen.getByText("Hi, there")).toBeInTheDocument();
    expect(screen.getByText("I'm Programmer")).toBeInTheDocument();
    expect(
      screen.getByText("Specializing in Next.js, Laravel & Blockchain Ecosystem")
    ).toBeInTheDocument();
    expect(screen.getByText("Slava Auchynnikau")).toBeInTheDocument();
    expect(screen.getByText("Unsplash")).toBeInTheDocument();
  });

  it("renders Footer with copyright notice including emoji and social links", () => {
    render(<Footer socials={SOCIALS} />);

    expect(screen.getByText("© 2025 LIand 🍵")).toBeInTheDocument();

    SOCIALS.forEach((social) => {
      const link = screen.getByLabelText(social.label);
      expect(link).toHaveAttribute("href", social.url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
