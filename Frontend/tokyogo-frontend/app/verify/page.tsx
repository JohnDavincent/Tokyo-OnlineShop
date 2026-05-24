"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp, registerUser, requestOtp } from "../../services/authService";

function ShieldIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ArrowRightIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const name = searchParams.get("name") || "";
  const pin = searchParams.get("pin") || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    pasted.split("").forEach((digit, i) => {
      if (i < 6) newCode[i] = digit;
    });
    setCode(newCode);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  }

  const isComplete = code.every((c) => c !== "");

  const handleVerify = async () => {
    if (!isComplete || !phone) return;
    setLoading(true);
    setError("");

    try {
      const otpCode = code.join("");
      // 1. Verify OTP
      await verifyOtp(phone, otpCode);
      
      // 2. Register user if OTP is correct
      if (name && pin) {
        await registerUser(name, phone, pin);
        router.push("/login?registered=true");
      } else {
        throw new Error("Missing registration details.");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone) return;
    setError("");
    try {
      await requestOtp(phone);
      setTimer(300);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8f5] flex flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-[#4d816d] to-primary" />

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-[#7bfeb8]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="font-headline text-[2.2rem] font-extrabold tracking-[-0.04em] text-primary">
                Tokyo GO
              </h1>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-[28px] p-8 shadow-[0_8px_40px_rgba(0,39,25,0.08)] border border-black/[0.04]">
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0fdf4]">
              <ShieldIcon className="h-8 w-8 text-primary" />
            </div>

            <h2 className="font-headline text-xl font-bold text-[#101210] text-center mb-2">
              Verify Your Phone
            </h2>
            <p className="text-sm text-black/50 text-center mb-8">
              Enter the 6-digit code we sent to {phone || "your phone"}
            </p>

            {error && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            {/* OTP Inputs */}
            <div className="flex justify-between gap-2 mb-8" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  aria-label={`Code digit ${i + 1}`}
                  className={`h-14 w-12 rounded-2xl text-center text-xl font-bold border-2 outline-none transition-all ${digit
                    ? "bg-primary text-white border-primary shadow-[0_4px_12px_rgba(0,105,65,0.25)]"
                    : "bg-[#f6f8f5] text-[#101210] border-black/[0.06] focus:border-primary/40 focus:ring-4 focus:ring-primary/8"
                    }`}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-1.5 rounded-full bg-[#f0fdf4] px-3 py-1.5">
                <div className={`h-2 w-2 rounded-full ${timer > 0 ? "bg-primary animate-pulse" : "bg-black/20"}`} />
                <span className="text-xs font-bold text-primary tracking-wider">
                  {timer > 0 ? formatTime(timer) : "Expired"}
                </span>
              </div>
            </div>

            {/* Verify Button */}
            <button
              disabled={!isComplete || loading}
              onClick={handleVerify}
              className="w-full rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] hover:-translate-y-0.5 hover:bg-primary-dim active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? "Verifying..." : "Verify Code"}
              {!loading && <ArrowRightIcon className="h-4 w-4" />}
            </button>

            {/* Resend */}
            <div className="text-center mt-6">
              <p className="text-xs text-black/40 mb-1">Didn&apos;t receive it?</p>
              {timer > 0 ? (
                <span className="text-sm font-bold text-black/30">Wait to resend</span>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-sm font-bold text-primary hover:text-primary-dim transition-colors"
                >
                  Send code again
                </button>
              )}
            </div>
          </div>

          {/* Security badges */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 border border-black/[0.04]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0fdf4]">
                <LockIcon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-black/50">Secure</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 border border-black/[0.04]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0fdf4]">
                <ShieldIcon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-black/50">Verified</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-white/65">
        <div className="mx-auto max-w-[1180px] flex flex-col md:flex-row items-center justify-between px-6 py-6 gap-4">
          <p className="font-headline text-lg font-extrabold tracking-[-0.04em] text-primary">Tokyo GO</p>
          <p className="text-xs text-black/40">&copy; 2024 Tokyo GO. Precision Freshness.</p>
        </div>
      </footer>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f6f8f5]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
