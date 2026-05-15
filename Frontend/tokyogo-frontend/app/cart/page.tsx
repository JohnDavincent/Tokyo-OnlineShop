"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  CartListItem,
  getCartList,
  updateCartItem,
  removeFromCart,
  AuthRequiredError,
} from "../../services/cartservice";
import LoginPromptModal from "../components/LoginPromptModal";
import { normalizeUnit } from "../../services/config";
import { useAuth } from "../../hooks/useAuth";
import { UserAddress, getUserAddressList } from "../../services/authService";

function resolveProductImage(url?: string) {
  if (!url) {
    return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23f1f5f9'/><text x='200' y='200' fill='%23cbd5e1' font-size='32' font-family='Arial' font-weight='bold' text-anchor='middle'>NO IMAGE</text></svg>";
  }
  if (url.startsWith("data:")) return url;
  const filename = url.split("/").pop();
  return `/${filename}`;
}

/* ─── Icons ─────────────────────────────────────────────── */
function ArrowLeftIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MinusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function CartEmptyIcon({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3 5h2.5l1.8 8.2a1.5 1.5 0 0 0 1.46 1.18h7.98a1.5 1.5 0 0 0 1.45-1.11L20 8H7.1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="19" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="17" cy="19" r="1.25" fill="currentColor" stroke="none" />
      <path d="M9 5V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    </svg>
  );
}

function PackageIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v11c0 .6-.4 1-1 1h-2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="18" r="2" />
      <path d="M15 9h4.5a2 2 0 0 1 1.6.8L23 13v4c0 .6-.4 1-1 1h-1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="18" r="2" />
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

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link href="/login" aria-label="Account" className="transition-transform duration-200 hover:scale-110 text-primary">
        <UserIcon />
      </Link>
    );
  }

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-bold shadow-sm transition hover:bg-primary-dim"
        aria-label="Account menu"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-black/5 bg-white p-2 shadow-[0_16px_40px_rgba(0,0,0,0.12)] z-50">
          <div className="px-3 py-2.5">
            <p className="text-sm font-bold text-[#101210]">{user.name}</p>
            <p className="text-xs text-black/40">{user.phoneNumber}</p>
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-primary">
              {user.membership}
            </span>
          </div>
          <div className="my-1 h-px bg-black/[0.06]" />
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[#101210] transition hover:bg-black/[0.04]"
          >
            My Profile
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

function ShieldCheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ChevronDownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronUpIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
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

/* ─── Address Dropdown ──────────────────────────────────── */
function AddressDropdown({
  addresses,
  selectedAddress,
  onSelect,
}: {
  addresses: UserAddress[];
  selectedAddress: UserAddress | null;
  onSelect: (addr: UserAddress) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  if (addresses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-[#f6f8f5] p-5 text-center">
        <MapPinIcon className="mx-auto h-6 w-6 text-black/25" />
        <p className="mt-2 text-sm font-bold text-black/50">No saved address</p>
        <p className="text-xs text-black/35 mt-1">Add an address to proceed with checkout.</p>
        <button className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-dim">
          <PlusIcon className="h-3.5 w-3.5" />
          Add Address
        </button>
      </div>
    );
  }

  const current = selectedAddress || addresses[0];

  return (
    <div ref={ref} className="relative">
      {/* Collapsed header — the "button" */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-2xl border border-black/6 bg-[#f6f8f5] p-4 text-left transition hover:border-primary/20 hover:bg-primary/[0.03]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MapPinIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#101210]">{current.label}</span>
            {current.isDefaultShipping && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-emerald-600">
                Default
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-black/45">
            {current.address}, {current.city}
          </p>
        </div>
        <div className="shrink-0 text-black/30 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <ChevronDownIcon className="h-5 w-5" />
        </div>
      </button>

      {/* Expanded dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-black/6 bg-white p-2 shadow-[0_16px_50px_rgba(0,0,0,0.12)]">
          <p className="px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/40">
            Choose delivery address
          </p>

          <div className="flex flex-col gap-1">
            {addresses.map((addr) => {
              const isSelected = addr.addressId === current.addressId;
              return (
                <button
                  key={addr.addressId}
                  onClick={() => {
                    onSelect(addr);
                    setOpen(false);
                  }}
                  className={`flex items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                    isSelected
                      ? "bg-primary/[0.05] ring-1 ring-primary/15"
                      : "hover:bg-black/[0.02]"
                  }`}
                >
                  {/* Radio indicator */}
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors">
                    {isSelected ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-primary">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-black/15" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#101210]">{addr.label}</span>
                      {addr.isDefaultShipping && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-emerald-600">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-bold text-black/70">{addr.recipientName}</p>
                    <p className="text-xs text-black/45">{addr.recipientPhoneNumber}</p>
                    <p className="mt-1 text-xs leading-relaxed text-black/50">
                      {addr.address}, {addr.city}, {addr.province} {addr.postalCode}
                    </p>
                    {addr.notes && (
                      <p className="mt-1 text-xs italic text-black/35">Note: {addr.notes}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="my-2 h-px bg-black/[0.06]" />

          <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/[0.05]">
            <PlusIcon className="h-4 w-4" />
            Add More Address
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Components ────────────────────────────────────────── */
export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<CartListItem[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCartList();
      if (res.data) {
        setItems(res.data.itemList || []);
        setGrandTotal(res.data.grandTotal || 0);
      } else {
        setItems([]);
        setGrandTotal(0);
      }
    } catch (e) {
      console.error("Failed to load cart:", e);
      setError("Failed to load your cart. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    async function loadAddresses() {
      const token = localStorage.getItem("token");
      if (!token) return;
      setAddressLoading(true);
      try {
        const list = await getUserAddressList(token);
        setAddresses(list);
        if (list.length > 0) {
          // Prefer default shipping, otherwise first address
          const def = list.find((a) => a.isDefaultShipping);
          setSelectedAddress(def || list[0]);
        }
      } catch (e) {
        console.error("Failed to load addresses:", e);
      } finally {
        setAddressLoading(false);
      }
    }
    loadAddresses();
  }, []);

  async function handleQuantityChange(item: CartListItem, delta: number) {
    const newQty = Math.max(0, item.quantity + delta);
    const key = `${item.productId}-${item.productUnit}`;

    if (newQty === 0) {
      await handleRemove(item);
      return;
    }

    setUpdating((prev) => ({ ...prev, [key]: true }));
    try {
      await updateCartItem(item.productId, newQty);
      await loadCart();
    } catch (e) {
      if (e instanceof AuthRequiredError) {
        setShowLoginPrompt(true);
        return;
      }
      console.error("Failed to update quantity:", e);
    } finally {
      setUpdating((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function handleRemove(item: CartListItem) {
    const key = `${item.productId}-${item.productUnit}`;
    setRemoving((prev) => ({ ...prev, [key]: true }));
    try {
      await removeFromCart(item.cartDetailId);
      toast.success("Success deleted");
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      console.error("Failed to remove item:", e);
      setRemoving((prev) => ({ ...prev, [key]: false }));
    }
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

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
            <span className="hidden sm:inline">Continue Shopping</span>
          </Link>

          <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-headline text-[1.35rem] font-extrabold tracking-[-0.03em] text-primary">
            Your Cart
          </h1>

          <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-black/40">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="mx-auto max-w-[1180px] px-6 py-8 lg:px-8 lg:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="text-sm font-medium text-on-surface/50">Loading your cart…</p>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md rounded-[28px] border border-[#f3d6cf] bg-[#fff7f3] p-8 text-center shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-headline text-xl font-bold text-[#101210]">{error}</h2>
            <button
              onClick={loadCart}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] transition-all hover:-translate-y-0.5 hover:bg-primary-dim"
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-[28px] bg-white p-10 text-center shadow-[0_16px_40px_rgba(0,39,25,0.06)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f6f8f5] text-black/20">
              <CartEmptyIcon className="h-10 w-10" />
            </div>
            <h2 className="mt-6 font-headline text-[1.6rem] font-extrabold tracking-[-0.03em] text-[#101210]">
              Keranjang anda kosong
            </h2>
            <p className="mt-2 text-sm text-black/45">
              Looks like you haven&apos;t added anything yet. Explore our fresh products and fill it up!
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] transition-all hover:-translate-y-0.5 hover:bg-primary-dim"
            >
              Start Shopping <span aria-hidden>→</span>
            </Link>
            {!user && (
              <p className="mt-4 text-sm text-black/40">
                Already have items?{" "}
                <Link href="/login" className="font-bold text-primary hover:text-primary-dim transition-colors">
                  Log in
                </Link>{" "}
                to view your saved cart.
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* ── Cart Items ── */}
            <div className="flex flex-col gap-4">
              {!user && (
                <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[#101210]">Log in to save your cart</p>
                    <p className="text-xs text-black/50 mt-0.5">Your items will be saved for checkout.</p>
                  </div>
                  <Link
                    href="/login"
                    className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-[0_4px_16px_rgba(0,105,65,0.2)] transition hover:bg-primary-dim"
                  >
                    Log In
                  </Link>
                </div>
              )}
              {items.map((item) => {
                const key = `${item.productId}-${item.productUnit}`;
                const isUpdating = updating[key];
                const isRemoving = removing[key];
                const normUnit = normalizeUnit(item.productUnit);

                return (
                  <article
                    key={key}
                    className={`flex gap-4 rounded-[24px] border border-black/5 bg-white p-4 shadow-[0_8px_30px_rgba(0,39,25,0.06)] transition-all sm:gap-5 sm:p-5 ${isRemoving ? "opacity-40" : ""}`}
                  >
                    {/* Product Image */}
                    <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f6f8f5] text-primary/40 sm:h-[100px] sm:w-[100px]">
                      {item.productUrl ? (
                        <img
                          src={resolveProductImage(item.productUrl)}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = resolveProductImage(); }}
                        />
                      ) : (
                        <span className="font-headline text-2xl font-extrabold tracking-[-0.04em]">
                          {getInitials(item.productName)}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between py-0.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-headline text-[1.15rem] font-bold leading-tight tracking-[-0.03em] text-[#101210]">
                            {item.productName}
                          </h3>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-primary">
                              <PackageIcon className="h-3 w-3" />
                              {normUnit}
                            </span>
                            <span className="text-[0.75rem] text-black/35">
                              Rp {item.price.toLocaleString("id-ID")} / {normUnit.toLowerCase()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemove(item)}
                          disabled={isRemoving}
                          aria-label={`Remove ${item.productName}`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black/30 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-end justify-between gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 rounded-xl border border-black/[0.08] bg-[#f6f8f5] px-1.5 py-1">
                          <button
                            onClick={() => handleQuantityChange(item, -1)}
                            disabled={isUpdating || isRemoving}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-black/50 transition hover:bg-white hover:shadow-sm disabled:opacity-30"
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-bold text-[#101210]">
                            {isUpdating ? (
                              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item, 1)}
                            disabled={isUpdating || isRemoving}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-black/50 transition hover:bg-white hover:shadow-sm disabled:opacity-30"
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-black/35">
                            Subtotal
                          </p>
                          <p className="text-[1.15rem] font-extrabold tracking-tight text-[#101210]">
                            Rp {item.subTotal.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* ── Order Summary ── */}
            <div className="h-fit rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_16px_40px_rgba(0,39,25,0.06)] sm:p-7">
              <h2 className="font-headline text-[1.25rem] font-bold tracking-[-0.03em] text-[#101210]">
                Order Summary
              </h2>

              {/* ── Delivery Address ── */}
              <div className="mt-5">
                <label className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-black/40">
                  Deliver to
                </label>
                {addressLoading ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-black/6 bg-[#f6f8f5] p-4">
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-black/5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-black/5" />
                      <div className="h-3 w-40 animate-pulse rounded bg-black/5" />
                    </div>
                  </div>
                ) : (
                  <AddressDropdown
                    addresses={addresses}
                    selectedAddress={selectedAddress}
                    onSelect={setSelectedAddress}
                  />
                )}
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/50">
                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                  <span className="font-bold text-[#101210]">
                    Rp {grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/50">Shipping</span>
                  <span className="font-bold text-emerald-600">Free</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/50">Tax</span>
                  <span className="font-bold text-[#101210]">Included</span>
                </div>
              </div>

              <div className="my-5 h-px bg-black/[0.06]" />

              <div className="flex items-center justify-between">
                <span className="text-[0.8rem] font-bold uppercase tracking-[0.12em] text-black/40">
                  Grand Total
                </span>
                <span className="font-headline text-[1.65rem] font-extrabold tracking-[-0.04em] text-primary">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>

              {user ? (
                <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dim hover:shadow-[0_12px_32px_rgba(0,105,65,0.28)] active:translate-y-0">
                  Checkout Now
                </button>
              ) : (
                <Link
                  href="/login"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dim hover:shadow-[0_12px_32px_rgba(0,105,65,0.28)] active:translate-y-0"
                >
                  Login to Checkout
                </Link>
              )}

              <Link
                href="/"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-black/[0.08] bg-white py-3.5 text-sm font-bold text-[#101210] transition-all hover:bg-[#f6f8f5]"
              >
                Continue Shopping
              </Link>

              {/* Trust badges */}
              <div className="mt-6 flex items-center justify-center gap-4 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-black/35">
                <span className="flex items-center gap-1">
                  <TruckIcon className="h-3.5 w-3.5" />
                  Free Delivery
                </span>
                <span className="h-3 w-px bg-black/10" />
                <span className="flex items-center gap-1">
                  <ShieldCheckIcon className="h-3.5 w-3.5" />
                  Secure
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Login Prompt Modal ── */}
      <LoginPromptModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />

      {/* ── Footer ── */}
      <footer className="border-t border-black/5 bg-white/65">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-primary">Tokyo GO</p>
            <p className="mt-3 text-sm text-on-surface/55">© 2024 Tokyo GO. Precision Freshness.</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-on-surface/58">
            <Link href="/">About Us</Link>
            <Link href="/">Sustainability</Link>
            <Link href="/">Shipping Policy</Link>
            <Link href="/">Contact Support</Link>
            <Link href="/">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
