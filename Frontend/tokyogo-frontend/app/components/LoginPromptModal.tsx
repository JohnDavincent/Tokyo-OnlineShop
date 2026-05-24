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
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-[400px] overflow-hidden rounded-t-[36px] bg-white shadow-[0_-20px_80px_rgba(0,0,0,0.2)] sm:rounded-[36px] border border-white/40"
        style={{ animation: "scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-[40px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-[40px] pointer-events-none" />

        <div className="relative px-8 pb-8 pt-8 text-center flex flex-col items-center">
          <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-black/10 sm:hidden" />

          {/* Icon with pulse effect */}
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75" style={{ animationDuration: '2s' }}></div>
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-primary to-emerald-400 text-white shadow-[0_8px_24px_rgba(0,105,65,0.3)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-9 w-9 drop-shadow-sm">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <h3 className="font-headline text-[1.4rem] font-extrabold tracking-tight text-[#0f2118]">
            Login Diperlukan
          </h3>
          <p className="mt-3 text-[0.95rem] font-medium text-black/60 leading-[1.6]">
            Silahkan melakukan Login terlebih dahulu untuk menambahkan barang
          </p>

          <div className="mt-8 flex w-full flex-col gap-3">
            <Link
              href="/login"
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,105,65,0.35)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              Login sekarang
            </Link>
            <button
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-2xl border border-black/5 bg-black/[0.03] py-4 text-sm font-bold text-black/60 transition-all hover:bg-black/[0.06] hover:text-[#101210]"
            >
              nanti dulu
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
