"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MOCK_BANNERS, MockBanner } from "../../../../services/adminMocks";
import {
  MockBadge,
  Modal,
  SectionCard,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/ui";

/*
 * TODO: connect to backend — the storefront homepage (hero banner, section
 * visibility) is hardcoded in app/page.tsx and there are no site-content
 * endpoints yet. Everything on this page is mock state.
 */

interface BannerFormValues {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  tone: "green" | "amber";
}

function BannerFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: MockBanner;
  onClose: () => void;
  onSave: (values: BannerFormValues) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [ctaLabel, setCtaLabel] = useState(initial?.ctaLabel ?? "");
  const [ctaHref, setCtaHref] = useState(initial?.ctaHref ?? "/product/category");
  const [tone, setTone] = useState<"green" | "amber">(initial?.tone ?? "green");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !subtitle.trim() || !ctaLabel.trim()) {
      toast.error("Fill in the banner title, subtitle and CTA label");
      return;
    }
    onSave({ title: title.trim(), subtitle: subtitle.trim(), ctaLabel: ctaLabel.trim(), ctaHref: ctaHref.trim() || "/", tone });
  }

  return (
    <Modal open onClose={onClose} title={initial ? "Edit banner" : "Add banner"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="b-title" className={labelClass}>Title</label>
          <input id="b-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Fresh Groceries, Delivered Fast" />
        </div>
        <div>
          <label htmlFor="b-subtitle" className={labelClass}>Subtitle</label>
          <input id="b-subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} placeholder="Free delivery on orders above…" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="b-cta" className={labelClass}>CTA label</label>
            <input id="b-cta" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className={inputClass} placeholder="Shop now" />
          </div>
          <div>
            <label htmlFor="b-href" className={labelClass}>CTA link</label>
            <input id="b-href" value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} className={inputClass} placeholder="/product/category" />
          </div>
        </div>
        <div>
          <label htmlFor="b-tone" className={labelClass}>Color tone</label>
          <select id="b-tone" value={tone} onChange={(e) => setTone(e.target.value as "green" | "amber")} className={inputClass}>
            <option value="green">Green (brand)</option>
            <option value="amber">Amber (promo)</option>
          </select>
        </div>
        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="submit" className={primaryButtonClass}>
            {initial ? "Save banner" : "Add banner"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function BannerPreview({ banner }: { banner: MockBanner }) {
  const toneClasses =
    banner.tone === "green"
      ? "bg-gradient-to-br from-[#006941] to-[#005c38] text-white"
      : "bg-gradient-to-br from-[#feaa00] to-[#e29700] text-[#331f00]";
  return (
    <div className={`rounded-2xl p-5 ${toneClasses} ${banner.active ? "" : "opacity-45"}`}>
      <p className="font-headline text-base font-extrabold tracking-[-0.02em]">{banner.title}</p>
      <p className="mt-1 text-xs opacity-85">{banner.subtitle}</p>
      <span className="mt-3 inline-block rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold backdrop-blur">
        {banner.ctaLabel} →
      </span>
    </div>
  );
}

interface SiteToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const INITIAL_TOGGLES: SiteToggle[] = [
  { id: "flash-strip", label: "Flash sale strip", description: "Show the flash sale countdown strip at the top of the homepage", enabled: true },
  { id: "new-arrivals", label: "New arrivals slider", description: "Show the New Arrivals section on the homepage", enabled: true },
  { id: "best-sellers", label: "Best sellers section", description: "Show the top-sold products section on the homepage", enabled: true },
  { id: "category-slider", label: "Category slider", description: "Show the category quick-nav slider under the hero", enabled: true },
  { id: "maintenance", label: "Maintenance banner", description: "Show a maintenance notice bar across the storefront", enabled: false },
];

export default function AdminSitePage() {
  const [banners, setBanners] = useState<MockBanner[]>(MOCK_BANNERS);
  const [toggles, setToggles] = useState<SiteToggle[]>(INITIAL_TOGGLES);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MockBanner | null>(null);

  function moveBanner(index: number, direction: -1 | 1) {
    setBanners((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSave(values: BannerFormValues) {
    if (editing) {
      setBanners((prev) => prev.map((b) => (b.id === editing.id ? { ...b, ...values } : b)));
      toast.success("Banner updated (mock)");
    } else {
      setBanners((prev) => [...prev, { ...values, id: `banner-${Date.now()}`, active: true }]);
      toast.success("Banner added (mock)");
    }
    setFormOpen(false);
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Banners */}
        <SectionCard
          title="Homepage banners"
          subtitle="Promotional banners shown in the storefront hero area"
          mock
          className="xl:col-span-2"
          action={
            <button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className={primaryButtonClass}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Add banner
            </button>
          }
        >
          <div className="flex flex-col gap-4">
            {banners.map((banner, index) => (
              <div key={banner.id} className="grid grid-cols-1 gap-4 rounded-2xl border border-[var(--admin-border)] p-4 lg:grid-cols-[1fr_auto]">
                <BannerPreview banner={banner} />
                <div className="flex flex-row items-center gap-2 lg:flex-col lg:justify-center">
                  <button
                    aria-label="Move up"
                    onClick={() => moveBanner(index, -1)}
                    disabled={index === 0}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-border)] text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-surface-2)] disabled:opacity-30"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                      <path d="m18 15-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    aria-label="Move down"
                    onClick={() => moveBanner(index, 1)}
                    disabled={index === banners.length - 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-border)] text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-surface-2)] disabled:opacity-30"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    aria-label="Edit banner"
                    onClick={() => {
                      setEditing(banner);
                      setFormOpen(true);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-border)] text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-surface-2)]"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    aria-label={banner.active ? "Deactivate banner" : "Activate banner"}
                    onClick={() =>
                      setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, active: !b.active } : b)))
                    }
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                      banner.active
                        ? "border-[var(--admin-primary)] bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"
                        : "border-[var(--admin-border)] text-[var(--admin-muted)] hover:bg-[var(--admin-surface-2)]"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      {banner.active ? (
                        <>
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      ) : (
                        <>
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.78 0 1.53-.09 2.24-.26" />
                          <path d="M2 2l20 20" />
                        </>
                      )}
                    </svg>
                  </button>
                  <button
                    aria-label="Remove banner"
                    onClick={() => {
                      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
                      toast.success("Banner removed (mock)");
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-border)] text-[var(--admin-danger)] transition-colors hover:bg-[var(--admin-danger-soft)]"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <p className="py-8 text-center text-sm text-[var(--admin-muted)]">No banners — add one above.</p>
            )}
          </div>
        </SectionCard>

        {/* Display toggles */}
        <SectionCard title="Storefront sections" subtitle="Control which homepage sections are visible" mock>
          <ul className="flex flex-col gap-4">
            {toggles.map((toggle) => (
              <li key={toggle.id} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--admin-heading)]">{toggle.label}</p>
                  <p className="text-xs text-[var(--admin-muted)]">{toggle.description}</p>
                </div>
                <button
                  role="switch"
                  aria-checked={toggle.enabled}
                  aria-label={toggle.label}
                  onClick={() =>
                    setToggles((prev) =>
                      prev.map((t) => (t.id === toggle.id ? { ...t, enabled: !t.enabled } : t)),
                    )
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    toggle.enabled ? "bg-[var(--admin-primary)]" : "bg-[var(--admin-border)]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      toggle.enabled ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl bg-[var(--admin-surface-2)] p-4">
            <div className="mb-2">
              <MockBadge />
            </div>
            <p className="text-xs leading-relaxed text-[var(--admin-muted)]">
              These switches are visual only for now — the storefront homepage is still hardcoded. Once site-content
              endpoints exist, wire them up in <span className="font-mono">app/admin/(panel)/site/page.tsx</span>.
            </p>
          </div>
        </SectionCard>
      </div>

      {formOpen && (
        <BannerFormModal
          initial={editing ?? undefined}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
