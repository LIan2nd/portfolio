"use client";

import { useState, useEffect } from "react";
import type { NavLink } from "@/lib/types";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useTheme } from "@/components/ThemeProvider";
import { useAiVisibility } from "@/components/AiVisibilityContext";
import { Bot, BotOff } from "lucide-react";
import { NavigationDropdown } from "@/components/NavigationDropdown";
import {
  NAVBAR_BRAND_CLASS,
  NAVBAR_CONTENT_CLASS,
  NAVBAR_LINK_CLASS,
  NAVBAR_ROW_CLASS,
  NAVBAR_TOP_SPACING_CLASS,
} from "@/lib/navigationStyles";

interface NavbarProps {
  links: NavLink[];
  additionalLinks?: NavLink[];
  homeHref?: string;
}

function getSectionId(href: string) {
  return href.includes("#") ? href.split("#").at(-1) ?? "" : "";
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

export function Navbar({
  links,
  additionalLinks = [],
  homeHref = "#home",
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sectionIds = links.map((link) => getSectionId(link.href)).filter(Boolean);
  const activeSection = useActiveSection(sectionIds);
  const { theme, toggleTheme } = useTheme();
  const { isAiVisible, toggleAiVisibility } = useAiVisibility();

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
    const id = getSectionId(href);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6">
      {/* Ultra-smooth glassmorphic background layer */}
      <div
        className={`absolute inset-0 transition-all duration-500 ease-in-out pointer-events-none ${
          isScrolled
            ? "bg-[var(--color-bg-primary)]/85 backdrop-blur-md border-b border-[var(--color-bg-tertiary)]/50 shadow-sm opacity-100"
            : "bg-[var(--color-bg-primary)]/0 backdrop-blur-none border-b border-transparent shadow-none opacity-0"
        }`}
      />

      <div className={NAVBAR_CONTENT_CLASS}>
        <nav
          aria-label="Main navigation"
          className={`${NAVBAR_ROW_CLASS} transition-all duration-500 ease-in-out ${
            isScrolled ? "py-2.5" : NAVBAR_TOP_SPACING_CLASS
          }`}
        >
          {/* Left side: mobile menu trigger and desktop brand */}
          <div className="flex items-center gap-5">
            {/* Mobile Animated Hamburger to X (On Left for Mobile) */}
            <button
              className="md:hidden relative bg-transparent border-none cursor-pointer p-1.5 -ml-1 focus:outline-none flex items-center justify-center z-50"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              <div className="w-5 h-[16px] flex flex-col justify-between pointer-events-none">
                <span
                  className={`w-full h-0.5 bg-[var(--color-text-primary)] rounded-full transition-all duration-300 ease-in-out origin-center ${
                    menuOpen ? "rotate-45 translate-y-[7px] !bg-accent" : ""
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-[var(--color-text-primary)] rounded-full transition-all duration-300 ease-in-out ${
                    menuOpen ? "opacity-0 -translate-x-2" : "opacity-100"
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-[var(--color-text-primary)] rounded-full transition-all duration-300 ease-in-out origin-center ${
                    menuOpen ? "-rotate-45 -translate-y-[7px] !bg-accent" : ""
                  }`}
                />
              </div>
            </button>

            <a
              href={homeHref}
              onClick={(e) => handleLinkClick(e, homeHref)}
              className={`${NAVBAR_BRAND_CLASS} hidden md:inline`}
              aria-label="LIand home"
            >
              LIand
            </a>
          </div>

          {/* Center: desktop section navigation */}
          <ul
            aria-label="Portfolio sections"
            className="hidden md:flex items-center justify-center gap-6 list-none m-0 p-0"
          >
            {links.map((link) => {
              const isActive = activeSection === getSectionId(link.href);
              return (
                <li key={link.href} className="flex items-center">
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={`${NAVBAR_LINK_CLASS} ${
                      isActive
                        ? "text-accent font-semibold after:w-full"
                        : "text-[var(--color-text-primary)]/80 hover:text-accent after:w-0 hover:after:w-full"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
            {additionalLinks.length > 0 && (
              <NavigationDropdown label="Explore" links={additionalLinks} />
            )}
          </ul>

          {/* Right side: AI Chat Toggle & Theme Toggle (Clean & Borderless) */}
          <div
            role="group"
            aria-label="Navbar actions"
            className="col-start-3 flex items-center justify-self-end gap-2.5"
          >
            <a
              href={homeHref}
              onClick={(e) => handleLinkClick(e, homeHref)}
              className={`${NAVBAR_BRAND_CLASS} md:hidden`}
              aria-label="LIand home"
            >
              LIand
            </a>

            {/* AI Assistant Visibility Toggle */}
            <button
              onClick={toggleAiVisibility}
              className="bg-transparent border-none p-1 cursor-pointer text-accent hover:opacity-80 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center shrink-0"
              aria-label={isAiVisible ? "Hide AI Assistant" : "Show AI Assistant"}
              title={isAiVisible ? "Hide AI Assistant" : "Show AI Assistant"}
            >
              {isAiVisible ? (
                <Bot className="w-5 h-5 transition-transform duration-200" />
              ) : (
                <BotOff className="w-5 h-5 text-[var(--color-text-secondary)] opacity-50 hover:opacity-100 transition-transform duration-200" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="bg-transparent border-none p-1 -mr-1 cursor-pointer text-accent hover:opacity-75 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center shrink-0"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              <AnimatedThemeIcon isDark={theme === "dark"} />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile Slide-from-Left Drawer */}
      <div
        id="mobile-navigation-drawer"
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal="true"
        aria-hidden={!menuOpen}
        className={`md:hidden fixed top-0 bottom-0 left-0 w-64 max-w-[80vw] bg-[var(--color-bg-primary)]/95 backdrop-blur-2xl border-r border-[var(--color-bg-tertiary)]/70 shadow-2xl p-6 pt-20 flex flex-col justify-between transition-transform duration-300 ease-out z-40 ${
          menuOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <ul className="flex flex-col gap-1.5 list-none m-0 p-0">
          {links.map((link) => {
            const isActive = activeSection === getSectionId(link.href);
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`block px-4 py-3 text-sm font-medium rounded-xl tracking-wide transition-all duration-200 no-underline ${
                    isActive
                      ? "bg-accent/10 text-accent font-semibold"
                      : "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]/60 hover:text-accent"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
          {additionalLinks.length > 0 && (
            <NavigationDropdown
              label="Explore"
              links={additionalLinks}
              variant="mobile"
              onNavigate={() => setMenuOpen(false)}
            />
          )}
        </ul>

        <div className="pt-6 border-t border-[var(--color-bg-tertiary)]/60 text-xs text-[var(--color-text-secondary)]">
          <p>© {new Date().getFullYear()} LIand 🍵</p>
        </div>
      </div>
    </header>
  );
}
