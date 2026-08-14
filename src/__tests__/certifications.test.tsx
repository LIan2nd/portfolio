import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { CertificationCard } from "@/components/CertificationCard";
import { CertificationsSection } from "@/components/CertificationsSection";
import { CERTIFICATIONS } from "@/lib/data";
import type { Certification } from "@/lib/types";

describe("CertificationsSection & CertificationCard", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders all certifications from props", () => {
    render(<CertificationsSection certifications={CERTIFICATIONS} />);
    CERTIFICATIONS.forEach((cert) => {
      expect(screen.getByText(cert.title)).toBeInTheDocument();
      expect(screen.getAllByText(cert.issuer).length).toBeGreaterThan(0);
      expect(screen.getAllByText(cert.date).length).toBeGreaterThan(0);
    });
  });

  it("renders credential link opening in a new tab when credentialUrl is provided", () => {
    const certWithUrl: Certification = {
      title: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      date: "2024",
      credentialUrl: "https://aws.amazon.com/verification",
      credentialId: "AWS-123456",
      skills: ["AWS", "Cloud"],
    };

    const { container } = render(<CertificationCard certification={certWithUrl} />);

    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute("href", certWithUrl.credentialUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("Credential ID: AWS-123456")).toBeInTheDocument();
    expect(screen.getByText("AWS")).toBeInTheDocument();
  });

  it("renders non-interactive card when credentialUrl is absent", () => {
    const certWithoutUrl: Certification = {
      title: "Certificate of Completion",
      issuer: "Internal Organization",
      date: "2023",
    };

    const { container } = render(<CertificationCard certification={certWithoutUrl} />);
    expect(container.querySelector("a")).toBeNull();
    expect(screen.getByText(certWithoutUrl.title)).toBeInTheDocument();
  });

  it("Property: renders all fields of any Certification object correctly", () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.stringMatching(/^[A-Za-z0-9 ]{3,30}$/),
          issuer: fc.stringMatching(/^[A-Za-z0-9 ]{3,30}$/),
          date: fc.stringMatching(/^[0-9]{4}$/),
          credentialUrl: fc.option(fc.webUrl(), { nil: undefined }),
          credentialId: fc.option(fc.stringMatching(/^[A-Za-z0-9-]{4,15}$/), { nil: undefined }),
          skills: fc.option(fc.array(fc.stringMatching(/^[A-Za-z0-9]{2,10}$/), { maxLength: 4 }), { nil: undefined }),
        }),
        (cert: Certification) => {
          cleanup();
          const { container } = render(<CertificationCard certification={cert} />);

          const titleEl = container.querySelector("h3");
          expect(titleEl?.textContent).toBe(cert.title);

          expect(container.textContent).toContain(cert.issuer);
          expect(container.textContent).toContain(cert.date);

          if (cert.credentialId) {
            expect(container.textContent).toContain(cert.credentialId);
          }

          if (cert.skills) {
            cert.skills.forEach((skill) => {
              expect(container.textContent).toContain(skill);
            });
          }

          if (cert.credentialUrl) {
            const link = container.querySelector("a");
            expect(link).not.toBeNull();
            expect(link).toHaveAttribute("href", cert.credentialUrl);
          } else {
            expect(container.querySelector("a")).toBeNull();
          }

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
