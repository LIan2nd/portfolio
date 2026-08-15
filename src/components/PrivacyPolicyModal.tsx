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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
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
                Kebijakan Privasi AI Assistant
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] m-0">
                Transparansi &amp; Pengelolaan Data Percakapan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
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
              Privasi Anda sangat dihargai. Sistem ini dirancang untuk menjaga interaksi Anda tetap <strong>100% anonim</strong> tanpa mengumpulkan data identitas pribadi (PII).
            </p>
          </div>

          <div className="flex flex-col gap-3.5 mt-1">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)]/50 flex items-center justify-center text-accent shrink-0 mt-0.5">
                <UserX size={15} />
              </div>
              <div>
                <strong className="text-[var(--color-text-primary)] block mb-0.5">Tanpa Identitas Pribadi (Zero PII)</strong>
                <p className="m-0 text-xs">
                  Kami tidak pernah meminta atau menyimpan nama, email, akun media sosial, maupun alamat IP mentah Anda. Alamat jaringan di-hash satu arah secara matematis (SHA-256) semata-mata untuk proteksi <em>rate-limiting</em>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)]/50 flex items-center justify-center text-accent shrink-0 mt-0.5">
                <Database size={15} />
              </div>
              <div>
                <strong className="text-[var(--color-text-primary)] block mb-0.5">Apa yang Disimpan di MongoDB?</strong>
                <p className="m-0 text-xs">
                  Hanya teks pesan pertanyaan Anda, panjang karakter, dan waktu pengiriman yang disimpan di database aman MongoDB Atlas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)]/50 flex items-center justify-center text-accent shrink-0 mt-0.5">
                <Lock size={15} />
              </div>
              <div>
                <strong className="text-[var(--color-text-primary)] block mb-0.5">Tujuan Penggunaan</strong>
                <p className="m-0 text-xs">
                  Data teks pertanyaan semata-mata dianalisis untuk mengevaluasi akurasi jawaban AI Clone, melengkapi basis pengetahuan portofolio Alfian, dan meningkatkan pengalaman pengunjung. Data tidak pernah dibagikan atau dikomersialkan.
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
            Mengerti &amp; Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
