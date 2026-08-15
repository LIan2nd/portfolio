"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, X, Database, Lock, UserX, Info } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Escape key with highest priority capture and stopPropagation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Mobile & browser back button handler (popstate)
  useEffect(() => {
    if (!isOpen) return;

    // Push history state to capture back button
    window.history.pushState({ privacyModal: true }, "");

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Do NOT call history.back() here — it fires an async popstate event
      // that races with the AiAssistant's handler and closes the chat too.
      // Stale history entries are harmless (popped as no-ops on next back press).
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-tab-slide"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--color-bg-primary)] border border-[var(--color-bg-tertiary)]/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-bg-tertiary)]/50 bg-[var(--color-bg-secondary)]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 id="privacy-modal-title" className="text-base font-bold text-[var(--color-text-primary)] m-0">
                AI Assistant Privacy Policy
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] m-0">
                Transparency &amp; Conversation Data Handling
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/25 text-[var(--color-text-primary)] flex items-start gap-3">
            <Info size={18} className="text-accent shrink-0 mt-0.5" />
            <p className="m-0 text-xs leading-5">
              Your privacy is deeply respected. This system is designed to keep your interactions <strong>100% anonymous</strong> without collecting any Personally Identifiable Information (PII).
            </p>
          </div>

          <div className="flex flex-col gap-3.5 mt-1">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)]/50 flex items-center justify-center text-accent shrink-0 mt-0.5">
                <UserX size={15} />
              </div>
              <div>
                <strong className="text-[var(--color-text-primary)] block mb-0.5">Zero Personally Identifiable Information (Zero PII)</strong>
                <p className="m-0 text-xs">
                  We never request or store your name, email address, social profiles, or raw IP address. Network addresses are mathematically one-way hashed (SHA-256) strictly for rate-limiting protection.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)]/50 flex items-center justify-center text-accent shrink-0 mt-0.5">
                <Database size={15} />
              </div>
              <div>
                <strong className="text-[var(--color-text-primary)] block mb-0.5">What is Stored in MongoDB Atlas?</strong>
                <p className="m-0 text-xs">
                  Only your prompt text and the AI assistant&apos;s generated response are stored in separate MongoDB Atlas collections (<code>user_queries</code> &amp; <code>bot_responses</code>), along with timestamp, character count, and latency metadata.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)]/50 flex items-center justify-center text-accent shrink-0 mt-0.5">
                <Lock size={15} />
              </div>
              <div>
                <strong className="text-[var(--color-text-primary)] block mb-0.5">Purpose of Data Logging</strong>
                <p className="m-0 text-xs">
                  Conversation records are analyzed solely to evaluate response accuracy, expand Alfian&apos;s portfolio knowledge base, and improve visitor interaction. Your data is never sold, shared, or commercialized.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--color-bg-tertiary)]/50 bg-[var(--color-bg-secondary)]/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-dark active:scale-95 transition-all cursor-pointer border-none shadow-xs"
          >
            Understood &amp; Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
