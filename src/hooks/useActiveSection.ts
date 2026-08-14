"use client";

import { useState, useEffect, useRef } from "react";

export function useActiveSection(sectionIds: string[]): string {
  const [activeSection, setActiveSection] = useState("");
  const visibleSections = useRef<Map<string, IntersectionObserverEntry>>(new Map());

  useEffect(() => {
    // Check scroll position to reset active section when near top of page (Hero section)
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY < 100) {
          setActiveSection("");
          return;
        }

        const firstSection = sectionIds[0] ? document.getElementById(sectionIds[0]) : null;
        if (firstSection) {
          const rect = firstSection.getBoundingClientRect();
          if (rect.top > 200) {
            setActiveSection("");
          }
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Update visibility map
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSections.current.set(entry.target.id, entry);
          } else {
            visibleSections.current.delete(entry.target.id);
          }
        }

        // If no tracked section is visible (e.g. at the top in Hero section)
        if (visibleSections.current.size === 0) {
          setActiveSection("");
          return;
        }

        // Pick the section closest to the top of the viewport
        let topSection = "";
        let topDistance = Infinity;

        for (const [id, entry] of visibleSections.current) {
          const distance = Math.abs(entry.boundingClientRect.top);
          if (distance < topDistance) {
            topDistance = distance;
            topSection = id;
          }
        }

        if (topSection) {
          setActiveSection(topSection);
        }
      },
      {
        // Single low threshold — fires once when section enters/exits
        threshold: 0.15,
        // Account for fixed navbar height
        rootMargin: "-80px 0px -35% 0px",
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", handleScroll);
      }
      observer.disconnect();
      visibleSections.current.clear();
    };
  }, [sectionIds]); // eslint-disable-line react-hooks/exhaustive-deps

  return activeSection;
}
