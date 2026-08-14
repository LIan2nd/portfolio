"use client";

import { useState, useEffect } from "react";
import type { NavLink } from "@/lib/types";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useTheme } from "@/components/ThemeProvider";

interface NavbarProps {
  links: NavLink[];
}

function AnimatedThemeIcon({ isDark }: { isDark: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      className={`text-accent group-hover:text-white transition-transform duration-300 ease-out ${
        isDark ? "rotate-0" : "-rotate-45"
      }`}
      fill="currentColor"
    >
      <mask id="theme-toggle-mask">
        <rect x="0" y="0" width="100%" height="100%" fill="white" />
        <circle
          cx={isDark ? "30" : "19"}
          cy={isDark ? "0" : "7"}
          r={isDark ? "0" : "8"}
          fill="black"
          className="transition-all duration-300 ease-out"
        />
      </mask>

      {/* Sun / Moon body */}
      <circle
        cx="12"
        cy="12"
        r={isDark ? "5" : "9"}
        fill="currentColor"
        mask="url(#theme-toggle-mask)"
        className="transition-all duration-300 ease-out"
      />

      {/* Sun rays */}
      <g
        className={`origin-center transition-all duration-300 ease-out ${
          isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 rotate-90"
        }`}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </g>
    </svg>
  );
}

export function Navbar({ links }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sectionIds = links.map((l) => l.href.replace("#", ""));
  const activeSection = useActiveSection(sectionIds);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Ultra-smooth glassmorphic background layer */}
      <div
        className={`absolute inset-0 transition-all duration-500 ease-in-out pointer-events-none ${
          isScrolled
            ? "bg-[var(--color-bg-primary)]/85 backdrop-blur-md border-b border-[var(--color-bg-tertiary)]/50 shadow-sm opacity-100"
            : "bg-[var(--color-bg-primary)]/0 backdrop-blur-none border-b border-transparent shadow-none opacity-0"
        }`}
      />

      <div className="max-w-[800px] mx-auto px-6 relative z-10">
        <nav
          aria-label="Main navigation"
          className={`flex items-center justify-between transition-all duration-500 ease-in-out ${
            isScrolled ? "py-3" : "py-6 max-md:py-4"
          }`}
        >
          <span className="text-2xl font-bold text-[var(--color-text-primary)]">
            <a
              href="#home"
              onClick={(e) => handleLinkClick(e, "#home")}
              className="cursor-pointer no-underline text-inherit hover:opacity-90 transition-opacity"
            >
              Portfolio
            </a>
          </span>

          {/* Mobile Animated Hamburger to X (Centered & Clean Transparent) */}
          <button
            className="md:hidden relative bg-transparent border-none cursor-pointer p-2 focus:outline-none flex items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <div className="w-6 h-[18px] flex flex-col justify-between pointer-events-none">
              <span
                className={`w-full h-0.5 bg-[var(--color-text-primary)] rounded-full transition-all duration-200 ease-in-out origin-center ${
                  menuOpen ? "rotate-45 translate-y-[8px] !bg-accent" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-[var(--color-text-primary)] rounded-full transition-all duration-200 ease-in-out ${
                  menuOpen ? "opacity-0 -translate-x-2" : "opacity-100"
                }`}
              />
              <span
                className={`w-full h-0.5 bg-[var(--color-text-primary)] rounded-full transition-all duration-200 ease-in-out origin-center ${
                  menuOpen ? "-rotate-45 -translate-y-[8px] !bg-accent" : ""
                }`}
              />
            </div>
          </button>

          {/* Navigation Links (Desktop & Mobile Dropdown) */}
          <div
            className={`absolute md:static top-full left-0 right-0 md:w-auto overflow-hidden md:overflow-visible transition-all duration-200 ease-in-out ${
              menuOpen
                ? "max-h-96 opacity-100 translate-y-0"
                : "max-h-0 md:max-h-none opacity-0 md:opacity-100 -translate-y-2 md:translate-y-0 pointer-events-none md:pointer-events-auto"
            }`}
          >
            <ul className="flex flex-col md:flex-row bg-[var(--color-bg-primary)]/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-b border-[var(--color-bg-tertiary)]/70 md:border-none shadow-2xl md:shadow-none rounded-b-2xl md:rounded-none p-3 md:p-0 mx-3 md:mx-0 mt-1 md:mt-0 gap-1 md:gap-0 items-stretch md:items-center list-none m-0">
              {links.map((link) => {
                const isActive = activeSection === link.href.replace("#", "");
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className={`block md:inline-block px-4 md:px-3 py-2.5 md:py-1 text-base md:text-lg rounded-xl md:rounded-none tracking-wide transition-all duration-200 ${
                        isActive
                          ? "bg-accent/10 md:bg-transparent text-accent font-semibold md:font-normal after:w-full"
                          : "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]/60 md:hover:bg-transparent hover:text-accent after:w-0 hover:after:w-full"
                      } relative md:after:content-[''] md:after:absolute md:after:bg-accent md:after:h-[3px] md:after:left-0 md:after:bottom-[-7px] md:after:rounded-[var(--radius-default)] md:after:transition-all md:after:duration-200`}
                    >
                      <span>{link.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Theme toggle (Right) */}
          <button
            onClick={toggleTheme}
            className="ml-0 md:ml-4 border-2 border-accent rounded-full p-2 bg-transparent cursor-pointer hover:bg-accent hover:scale-105 active:scale-95 group transition-all duration-200 flex items-center justify-center shrink-0"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            <AnimatedThemeIcon isDark={theme === "dark"} />
          </button>
        </nav>
      </div>
    </header>
  );
}
