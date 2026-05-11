"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, getCurrentUser } from "../../services/authService";
import { toast } from "sonner";

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
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

function EyeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.78 0 1.53-.09 2.24-.26" />
      <path d="M2 2l20 20" />
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

export default function LoginPage() {
  const [showPin, setShowPin] = useState(false);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone || !pin) {
      setError("Please fill in both phone number and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(phone, pin);
      // Store token (e.g. localStorage or cookie)
      if (data && data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        // Fetch and store user profile
        try {
          const user = await getCurrentUser(data.accessToken);
          sessionStorage.setItem("user", JSON.stringify(user));
          toast.success(`Selamat datang kembali, ${user.name}`);
        } catch (profileErr) {
          console.error("Failed to fetch user profile:", profileErr);
        }
      }
      
      // Redirect to home page
      router.push("/");
    } catch (err: any) {
      const msg = "login gagal, silahkan cek nomor telepon dan pin anda";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8f5] flex flex-col">
      {/* Subtle top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-[#4d816d] to-primary" />

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative">
        {/* Soft background decoration */}
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
            <p className="mt-2 text-sm text-black/50">Sign in to start shopping</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-[28px] p-8 shadow-[0_8px_40px_rgba(0,39,25,0.08)] border border-black/[0.04]">
            <h2 className="font-headline text-xl font-bold text-[#101210] mb-6">
              Welcome Back
            </h2>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-[0.7rem] font-bold uppercase tracking-[0.14em] text-black/50 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/30">
                    <PhoneIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812 3456 7890"
                    className="w-full rounded-2xl bg-[#f6f8f5] border border-black/[0.06] py-4 pl-12 pr-4 text-base font-medium text-[#101210] placeholder:text-black/25 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/8 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="pin" className="block text-[0.7rem] font-bold uppercase tracking-[0.14em] text-black/50 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/30">
                    <LockIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl bg-[#f6f8f5] border border-black/[0.06] py-4 pl-12 pr-12 text-base font-medium text-[#101210] placeholder:text-black/25 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/8 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-black/30 hover:text-primary transition-colors"
                    aria-label={showPin ? "Hide password" : "Show password"}
                  >
                    {showPin ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <Link href="/" className="text-xs font-bold text-primary hover:text-primary-dim transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] hover:-translate-y-0.5 hover:bg-primary-dim active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? "Signing In..." : "Sign In"}
                {!loading && <ArrowRightIcon className="h-4 w-4" />}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-black/[0.06]" />
              <span className="text-xs font-bold text-black/30 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-black/[0.06]" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-black/60">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-bold text-primary hover:text-primary-dim transition-colors">
                Create one
              </Link>
            </p>
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
