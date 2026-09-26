"use client";

import { useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Compass, Images } from "lucide-react";
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
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeWhenFocusLeaves = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  };

  const closeOnEscape = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape" || !open) return;
    event.stopPropagation();
    setOpen(false);
    triggerRef.current?.focus();
  };

  if (variant === "mobile") {
    return (
      <li onBlur={closeWhenFocusLeaves} onKeyDown={closeOnEscape}>
        <button
          ref={triggerRef}
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
          inert={!open}
          aria-hidden={!open}
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
                  className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium leading-5 text-[var(--color-text-primary)]/80 no-underline transition-colors duration-200 hover:bg-accent/10 hover:text-accent focus-visible:bg-accent/10 focus-visible:text-accent focus-visible:outline-accent"
                >
                  <Images size={16} strokeWidth={1.75} aria-hidden="true" />
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
    <div
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={(event) => {
        if (!event.currentTarget.contains(document.activeElement)) setOpen(false);
      }}
      onBlur={closeWhenFocusLeaves}
      onKeyDown={closeOnEscape}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(true)}
        title={label}
        className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center gap-1.5 rounded-md border-0 bg-transparent px-0 text-sm font-medium leading-5 tracking-wide transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none lg:w-auto lg:px-3 ${
          open
            ? "bg-accent/10 text-accent"
            : "text-[var(--color-text-primary)]/75 hover:bg-[var(--color-bg-tertiary)]/45 hover:text-accent"
        }`}
      >
        <Compass size={17} strokeWidth={1.8} aria-hidden="true" />
        <span className="hidden lg:inline">{label}</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`hidden shrink-0 transition-transform duration-200 motion-reduce:transition-none lg:block ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={menuId}
        inert={!open}
        aria-hidden={!open}
        className={`absolute right-0 top-full w-48 pt-3 transition-[opacity,transform,visibility] duration-200 motion-reduce:transition-none ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0"
        }`}
      >
        <ul className="m-0 list-none rounded-md border border-[var(--color-bg-tertiary)]/40 bg-[var(--color-bg-primary)]/95 p-1.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="group flex min-h-11 items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium leading-5 text-[var(--color-text-primary)]/80 no-underline transition-colors duration-200 hover:bg-accent/10 hover:text-accent focus-visible:bg-accent/10 focus-visible:text-accent focus-visible:outline-accent"
              >
                <Images size={16} strokeWidth={1.75} aria-hidden="true" />
                {link.label}
                <ArrowRight
                  size={14}
                  aria-hidden="true"
                  className="ml-auto -translate-x-1 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
