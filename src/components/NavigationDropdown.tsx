"use client";

import { useId, useState } from "react";
import { ChevronDown, Images } from "lucide-react";
import type { NavLink } from "@/lib/types";

interface NavigationDropdownProps {
  label: string;
  links: NavLink[];
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

export function NavigationDropdown({
  label,
  links,
  variant = "desktop",
  onNavigate,
}: NavigationDropdownProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  const closeWhenFocusLeaves = (event: React.FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  };

  if (variant === "mobile") {
    return (
      <li onBlur={closeWhenFocusLeaves}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium tracking-wide text-[var(--color-text-primary)] transition-colors duration-200 hover:bg-[var(--color-bg-tertiary)]/60 hover:text-accent"
        >
          {label}
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
        <div
          id={menuId}
          className={`ml-4 grid overflow-hidden border-l border-[var(--color-bg-tertiary)]/70 pl-3 transition-[grid-template-rows,opacity] duration-200 ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <ul className="min-h-0 overflow-hidden">
            {links.map((link) => (
              <li key={link.href}>
              <a
                href={link.href}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-secondary)] no-underline transition-colors duration-200 hover:bg-[var(--color-bg-tertiary)]/50 hover:text-accent"
              >
                <Images size={15} aria-hidden="true" />
                {link.label}
              </a>
              </li>
            ))}
          </ul>
        </div>
      </li>
    );
  }

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={closeWhenFocusLeaves}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 bg-transparent py-1 text-sm font-medium tracking-wide text-[var(--color-text-primary)]/80 transition-colors duration-200 hover:text-accent"
      >
        {label}
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={menuId}
        className={`absolute left-1/2 top-[calc(100%+12px)] w-44 -translate-x-1/2 rounded-xl border border-[var(--color-bg-tertiary)]/60 bg-[var(--color-bg-primary)]/95 p-1.5 shadow-xl backdrop-blur-xl transition-all duration-200 ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0"
        }`}
      >
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-secondary)] no-underline transition-colors duration-200 hover:bg-accent/10 hover:text-accent"
          >
            <Images size={15} aria-hidden="true" />
            {link.label}
          </a>
        ))}
      </div>
    </li>
  );
}
