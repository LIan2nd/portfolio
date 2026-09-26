"use client";

import { useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Compass, Images } from "lucide-react";
import Link from "next/link";
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
          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium tracking-wide transition-colors duration-200 ${
            open
              ? "bg-accent/10 text-accent font-semibold"
              : "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]/60 hover:text-accent"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Compass
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
              className={`transition-transform duration-300 ease-out ${
                open ? "rotate-45 text-accent" : "text-accent/80"
              }`}
            />
            <span>{label}</span>
          </span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={`transition-transform duration-200 ${open ? "rotate-180 text-accent" : ""}`}
          />
        </button>
        <div
          id={menuId}
          inert={!open}
          aria-hidden={!open}
          className={`ml-4 grid overflow-hidden border-l-2 border-accent/30 pl-3 transition-[grid-template-rows,opacity] duration-200 ${
            open ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <ul className="min-h-0 overflow-hidden list-none p-0 m-0 flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium leading-5 text-[var(--color-text-primary)]/80 no-underline transition-colors duration-200 hover:bg-accent/10 hover:text-accent focus-visible:bg-accent/10 focus-visible:text-accent focus-visible:outline-accent"
                >
                  <Images size={16} strokeWidth={1.75} aria-hidden="true" className="text-accent/80 group-hover:text-accent" />
                  <span>{link.label}</span>
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="ml-auto text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  />
                </Link>
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
        aria-label={label}
        onClick={() => setOpen(true)}
        title={label}
        className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-accent transition-colors duration-200 hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none ${
          open ? "bg-accent/15" : ""
        }`}
      >
        <Compass
          size={20}
          strokeWidth={1.8}
          aria-hidden="true"
          className={`transition-transform duration-300 ease-out ${open ? "rotate-45" : "rotate-0"}`}
        />
        <span className="sr-only">{label}</span>
      </button>
      <div
        id={menuId}
        inert={!open}
        aria-hidden={!open}
        className={`absolute right-0 top-full w-48 pt-2.5 transition-[opacity,transform,visibility] duration-200 motion-reduce:transition-none ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0 pointer-events-none"
        }`}
      >
        <ul className="m-0 list-none rounded-xl border border-[var(--color-bg-tertiary)]/50 bg-[var(--color-bg-primary)]/95 p-1.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium leading-5 text-[var(--color-text-primary)]/80 no-underline transition-colors duration-200 hover:bg-accent/10 hover:text-accent focus-visible:bg-accent/10 focus-visible:text-accent focus-visible:outline-accent"
              >
                <Images size={16} strokeWidth={1.75} aria-hidden="true" />
                {link.label}
                <ArrowRight
                  size={14}
                  aria-hidden="true"
                  className="ml-auto -translate-x-1 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
