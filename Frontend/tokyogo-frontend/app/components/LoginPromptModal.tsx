"use client";

import Link from "next/link";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.42)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm rounded-t-[32px] bg-white px-6 pb-8 pt-6 shadow-[0_-24px_80px_rgba(0,0,0,0.18)] sm:rounded-[28px] sm:pb-8"
        style={{ animation: "slideUp 0.32s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-black/12 sm:hidden" />

        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
              <circle cx="12" cy="8" r="4" />
              <path d="M5 20c1.4-3.5 4.2-5.5 7-5.5s5.6 2 7 5.5" strokeLinecap="round" />
            </svg>
          </div>

          <h3 className="font-headline text-xl font-extrabold tracking-[-0.03em] text-[#101210]">
            Login Diperlukan
          </h3>
          <p className="mt-2 text-sm text-black/50 leading-relaxed">
            Anda harus login terlebih dahulu untuk menambahkan produk ke keranjang.
          </p>

          <div className="mt-6 flex w-full flex-col gap-3">
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] transition-all hover:-translate-y-0.5 hover:bg-primary-dim"
            >
              Login Sekarang
            </Link>
            <button
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-2xl border border-black/[0.08] bg-white py-3.5 text-sm font-bold text-[#101210] transition-all hover:bg-[#f6f8f5]"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
