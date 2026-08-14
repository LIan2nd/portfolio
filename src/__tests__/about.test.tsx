import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { AboutSection } from "@/components/AboutSection";
import { SKILLS, PERSONAL_DETAILS, SOCIALS } from "@/lib/data";
import type { Skill } from "@/lib/types";

describe("AboutSection & SkillBadge", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders profile image with proper alt text", () => {
    render(
      <AboutSection
        skills={SKILLS}
        details={PERSONAL_DETAILS}
        socials={SOCIALS}
      />
    );

    const img = screen.getByAltText("Alfian Nur Usyaid - Fullstack Developer");
    expect(img).toBeInTheDocument();
  });

  it("renders all personal details accurately", () => {
    render(
      <AboutSection
        skills={SKILLS}
        details={PERSONAL_DETAILS}
        socials={SOCIALS}
      />
    );

    PERSONAL_DETAILS.forEach((detail) => {
      expect(screen.getByText(detail.label)).toBeInTheDocument();
      expect(screen.getByText(detail.value)).toBeInTheDocument();
    });
  });

  it("renders social links opening in a new tab with noopener noreferrer", () => {
    render(
      <AboutSection
        skills={SKILLS}
        details={PERSONAL_DETAILS}
        socials={SOCIALS}
      />
    );

    SOCIALS.forEach((social) => {
      const link = screen.getByLabelText(social.label);
      expect(link).toHaveAttribute("href", social.url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  // Feature: portfolio-nextjs-migration, Property 3: Skills badge rendering completeness
  it("Property 3: renders exactly one SkillBadge per skill, matching text content", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(
          fc.stringMatching(/^[A-Za-z0-9+#.-]{1,20}$/),
          { minLength: 1, maxLength: 20 }
        ),
        (skillNames) => {
          cleanup();
          const skills: Skill[] = skillNames.map((name) => ({ name }));

          const { container } = render(
            <AboutSection
              skills={skills}
              details={PERSONAL_DETAILS}
              socials={SOCIALS}
            />
          );

          const badges = Array.from(container.querySelectorAll("small")).map(
            (el) => el.textContent
          );
          expect(badges).toEqual(skillNames);

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
