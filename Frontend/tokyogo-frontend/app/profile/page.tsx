"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, UserDataResponse } from "../../services/authService";

/* ─── Icons ─────────────────────────────────────────────── */
function ArrowLeftIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5 19c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PackageIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TicketIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v14" />
    </svg>
  );
}

/* ─── Helpers ───────────────────────────────────────────── */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function displayValue(value: string | string[] | null | undefined): string {
  if (value === null || value === undefined) return "none";
  if (Array.isArray(value)) {
    if (value.length === 0) return "none";
    return value.join(", ");
  }
  if (typeof value === "string" && value.trim() === "") return "none";
  return String(value);
}

function getMembershipColor(membership: string): string {
  const m = membership.toUpperCase();
  if (m.includes("GOLD")) return "text-amber-600 bg-amber-50 border-amber-200";
  if (m.includes("SILVER")) return "text-slate-600 bg-slate-100 border-slate-200";
  if (m.includes("PLATINUM")) return "text-indigo-600 bg-indigo-50 border-indigo-200";
  return "text-primary bg-primary/5 border-primary/20";
}

/* ─── Components ────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (e: unknown) {
        if (e instanceof Error && (e.message.includes("401") || e.message.includes("Unauthorized") || e.message.includes("AUTH_REQUIRED"))) {
          router.push("/login");
          return;
        }
        console.error("Failed to load profile:", e);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-medium text-black/50">Loading profile…</p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[#f6f8f5] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[28px] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)] text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-headline text-2xl font-bold text-[#101210] mb-2">{error || "Profile Not Found"}</h1>
          <p className="text-black/50 mb-8">We couldn&apos;t load your profile. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-[0_8px_24px_rgba(0,105,65,0.25)] hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const membershipClass = getMembershipColor(profile.membership);

  const accountRows = [
    {
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserIcon className="h-5 w-5" />
        </div>
      ),
      label: "FULL NAME",
      value: displayValue(profile.username),
    },
    {
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500">
          <CrownIcon className="h-5 w-5" />
        </div>
      ),
      label: "MEMBERSHIP",
      value: displayValue(profile.membership),
    },
    {
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <PhoneIcon className="h-5 w-5" />
        </div>
      ),
      label: "PHONE NUMBER",
      value: displayValue(profile.phoneNumber),
    },
    {
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
          <MapPinIcon className="h-5 w-5" />
        </div>
      ),
      label: "ADDRESS",
      value: displayValue(profile.address),
    },
  ];

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-[#0f2118]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface/60 transition-colors hover:text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-primary/10">
              <ArrowLeftIcon className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Back to Home</span>
          </Link>

          <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-headline text-[1.35rem] font-extrabold tracking-[-0.03em] text-primary">
            My Profile
          </h1>

          <div className="w-8" />
        </div>
      </header>

      {/* ── Content ── */}
      <div className="mx-auto max-w-[640px] px-6 py-8 lg:px-8 lg:py-12">
        {/* Profile Card */}
        <div className="rounded-[28px] border border-black/[0.06] bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,39,25,0.06)]">
          {/* Avatar */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white text-2xl font-extrabold shadow-[0_8px_24px_rgba(0,105,65,0.25)]">
            {getInitials(profile.username)}
          </div>

          {/* Name */}
          <h2 className="mt-4 font-headline text-[1.6rem] font-extrabold tracking-[-0.03em] text-[#101210]">
            {profile.username}
          </h2>

          {/* Membership + Since */}
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider ${membershipClass}`}>
              <CrownIcon className="h-3.5 w-3.5" />
              {profile.membership}
            </span>
          </div>

          {/* Edit Profile Button */}
          <button className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/[0.1] bg-white px-6 py-2.5 text-sm font-bold text-black/70 shadow-sm transition hover:bg-[#f9faf8] hover:text-[#101210]">
            <PencilIcon className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_4px_16px_rgba(0,39,25,0.04)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <PackageIcon className="h-5 w-5" />
            </div>
            <span className="text-[1.35rem] font-extrabold text-[#101210]">0</span>
            <span className="text-xs font-medium text-black/50">Orders</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_4px_16px_rgba(0,39,25,0.04)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 mb-3">
              <HeartIcon className="h-5 w-5" />
            </div>
            <span className="text-[1.35rem] font-extrabold text-[#101210]">0</span>
            <span className="text-xs font-medium text-black/50">Wishlist</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_4px_16px_rgba(0,39,25,0.04)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-3">
              <TicketIcon className="h-5 w-5" />
            </div>
            <span className="text-[1.35rem] font-extrabold text-[#101210]">0</span>
            <span className="text-xs font-medium text-black/50">Vouchers</span>
          </div>
        </div>

        {/* Account Information */}
        <div className="mt-5 rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_rgba(0,39,25,0.06)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-headline text-lg font-bold tracking-[-0.02em] text-[#101210]">
              Account Information
            </h3>
            <button className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition hover:text-primary-dim">
              <PencilIcon className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>

          <div className="flex flex-col gap-0">
            {accountRows.map((row, index) => (
              <div
                key={row.label}
                className={`flex items-start gap-4 py-5 ${index !== accountRows.length - 1 ? "border-b border-black/[0.05]" : ""}`}
              >
                <div className="shrink-0 mt-0.5">{row.icon}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/40">
                    {row.label}
                  </p>
                  <p className="mt-1 text-base font-bold text-[#101210]">
                    {row.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
