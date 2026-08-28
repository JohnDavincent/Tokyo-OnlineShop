"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CreateVoucherPayload,
  DISCOUNT_TYPES,
  DiscountType,
  UpdateVoucherPayload,
  VOUCHER_AUDIENCES,
  VOUCHER_TYPES,
  VoucherAudience,
  VoucherDetail,
  VoucherListItem,
  VoucherType,
  createVoucher,
  humanizeEnum,
  toDateTimeLocalInput,
  toLocalDateTime,
  updateVoucher,
} from "../../../../../services/adminVoucherService";
import {
  Modal,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../../components/ui";

/* --- Segmented control ---------------------------------------
 * Used instead of a <select> for the three enum fields: an admin
 * can see every option at once and pick it in one click.
 */

function Segmented<T extends string>({
  options,
  value,
  onChange,
  describe,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  describe?: (option: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            title={describe?.(option)}
            className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
              active
                ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-[var(--admin-on-primary)]"
                : "border-[var(--admin-border)] text-[var(--admin-muted)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-heading)]"
            }`}
          >
            {humanizeEnum(option)}
          </button>
        );
      })}
    </div>
  );
}

function FieldGroup({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--admin-border)] p-4">
      <div className="mb-3">
        <h4 className="font-headline text-sm font-extrabold tracking-[-0.02em] text-[var(--admin-heading)]">{title}</h4>
        {hint && <p className="mt-0.5 text-xs text-[var(--admin-muted)]">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

/* --- Form state ------------------------------------------------ */

interface FormState {
  title: string;
  code: string;
  description: string;
  voucherType: VoucherType;
  discountType: DiscountType;
  value: string;
  audience: VoucherAudience;
  startAt: string;
  endAt: string;
  totalQuote: string;
  usageLimit: string;
  minimalSpend: string;
  minQuantity: string;
  maximumDiscount: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  code: "",
  description: "",
  voucherType: "DISCOUNT",
  discountType: "PERCENTAGE",
  value: "",
  audience: "ALL_USER",
  startAt: "",
  endAt: "",
  totalQuote: "",
  usageLimit: "1",
  minimalSpend: "",
  minQuantity: "",
  maximumDiscount: "",
};

function numberOrNull(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Seed the form from whatever we know about an existing voucher. */
function seedForm(row: VoucherListItem, detail: VoucherDetail | undefined): FormState {
  return {
    ...EMPTY_FORM,
    title: detail?.title ?? row.voucherTitle ?? "",
    code: detail?.code ?? row.voucherCode ?? "",
    description: detail?.description ?? "",
    voucherType: detail?.voucherType ?? row.voucherType ?? "DISCOUNT",
    discountType: detail?.discountType ?? row.discountType ?? "PERCENTAGE",
    value: detail?.value != null ? String(detail.value) : "",
    audience: detail?.audience ?? "ALL_USER",
    startAt: toDateTimeLocalInput(detail?.startAt ?? row.startDate),
    endAt: toDateTimeLocalInput(detail?.endAt ?? row.endDate),
    totalQuote: detail?.totalQuote != null ? String(detail.totalQuote) : "",
    usageLimit: detail?.usageLimit != null ? String(detail.usageLimit) : "",
    minimalSpend: detail?.criteria?.minimal_spend != null ? String(detail.criteria.minimal_spend) : "",
    minQuantity: detail?.criteria?.minimal_quantity != null ? String(detail.criteria.minimal_quantity) : "",
    maximumDiscount: detail?.criteria?.maximum_discount != null ? String(detail.criteria.maximum_discount) : "",
  };
}

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `TOKYO${suffix}`;
}

/* --- Modal ------------------------------------------------------ */

export default function VoucherFormModal({
  mode,
  target,
  detail,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  /** The list row being edited — omitted in create mode. */
  target?: VoucherListItem;
  /** Full DTO, when we already have one cached from a previous save. */
  detail?: VoucherDetail;
  onClose: () => void;
  onSaved: (saved: VoucherDetail) => void;
}) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState<FormState>(() =>
    isEdit && target ? seedForm(target, detail) : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);

  // In edit mode the list endpoint doesn't return value/quota/criteria, so
  // unless we have a cached DTO those inputs start blank — and blank means
  // "keep the stored value" (the backend update is a partial merge).
  const partialSeed = isEdit && !detail;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const valuePreview = useMemo(() => {
    const parsed = numberOrNull(form.value);
    if (parsed == null || parsed <= 0) return null;
    if (form.discountType === "PERCENTAGE") {
      if (parsed > 100) return null;
      const cap = numberOrNull(form.maximumDiscount);
      return `${parsed}% off${cap ? ` · max Rp ${cap.toLocaleString("id-ID")}` : ""}`;
    }
    return `Rp ${parsed.toLocaleString("id-ID")} off`;
  }, [form.value, form.discountType, form.maximumDiscount]);

  function validate(): string | null {
    const value = numberOrNull(form.value);

    if (!isEdit) {
      if (!form.title.trim()) return "Voucher title is required";
      if (!form.code.trim()) return "Voucher code is required";
      if (!form.startAt) return "Pick a start date & time";
      if (value == null || value <= 0) return "Value must be greater than 0";
    }

    if (value != null && value <= 0) return "Value must be greater than 0";
    if (form.discountType === "PERCENTAGE" && value != null && value > 100) {
      return "A percentage discount must be between 0 and 100";
    }
    if (form.startAt && form.endAt && form.endAt <= form.startAt) {
      return "The end date must be after the start date";
    }
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const error = validate();
    if (error) return void toast.error(error);

    setSaving(true);
    try {
      if (isEdit && target) {
        // Partial update: only send the fields the admin actually filled in.
        const payload: UpdateVoucherPayload = {
          title: form.title.trim() || undefined,
          description: form.description.trim() || undefined,
          voucherType: form.voucherType,
          discountType: form.discountType,
          value: numberOrNull(form.value) ?? undefined,
          audience: form.audience,
          startAt: toLocalDateTime(form.startAt) ?? undefined,
          endAt: toLocalDateTime(form.endAt) ?? undefined,
          totalQuote: numberOrNull(form.totalQuote) ?? undefined,
          usageLimit: numberOrNull(form.usageLimit) ?? undefined,
          minimalSpend: numberOrNull(form.minimalSpend) ?? undefined,
          minQuantity: numberOrNull(form.minQuantity) ?? undefined,
          maximumDiscount: numberOrNull(form.maximumDiscount) ?? undefined,
        };
        const saved = await updateVoucher(target.voucherId, payload);
        toast.success("Voucher updated");
        onSaved(saved);
      } else {
        const payload: CreateVoucherPayload = {
          title: form.title.trim(),
          code: form.code.trim().toUpperCase(),
          description: form.description.trim() || null,
          voucherType: form.voucherType,
          discountType: form.discountType,
          value: numberOrNull(form.value) as number,
          audience: form.audience,
          startAt: toLocalDateTime(form.startAt) as string,
          endAt: toLocalDateTime(form.endAt),
          totalQuote: numberOrNull(form.totalQuote),
          // usageLimit maps to usage_limit_per_user; the backend writes it
          // straight through, so default to 1 rather than leaving it null.
          usageLimit: numberOrNull(form.usageLimit) ?? 1,
          minimalSpend: numberOrNull(form.minimalSpend),
          minQuantity: numberOrNull(form.minQuantity),
          maximumDiscount: numberOrNull(form.maximumDiscount),
          applicableProductId: null,
          applicableCategoryId: null,
        };
        const saved = await createVoucher(payload);
        toast.success(`Voucher ${saved.code ?? ""} created`);
        onSaved(saved);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save voucher");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Edit voucher" : "Create voucher"}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {partialSeed && (
          <p className="rounded-xl bg-[var(--admin-info-soft)] px-4 py-3 text-xs text-[var(--admin-info)]">
            The list endpoint only returns the summary fields. Anything you leave blank below keeps its stored value.
          </p>
        )}

        {/* 1. Identity */}
        <FieldGroup title="1. Identity" hint="What the customer sees and types at checkout.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="v-title" className={labelClass}>
                Title {!isEdit && <span className="text-[var(--admin-danger)]">*</span>}
              </label>
              <input
                id="v-title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Diskon Belanja Akhir Bulan"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="v-code" className={labelClass}>
                Code {!isEdit && <span className="text-[var(--admin-danger)]">*</span>}
              </label>
              <div className="flex gap-2">
                <input
                  id="v-code"
                  value={form.code}
                  disabled={isEdit}
                  onChange={(e) => set("code", e.target.value.toUpperCase())}
                  placeholder="TOKYOHEMAT"
                  className={`${inputClass} font-mono uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-60`}
                />
                {!isEdit && (
                  <button
                    type="button"
                    onClick={() => set("code", randomCode())}
                    className={`${secondaryButtonClass} shrink-0 !px-3.5 text-xs`}
                  >
                    Generate
                  </button>
                )}
              </div>
              {isEdit && <p className="mt-1 text-[11px] text-[var(--admin-muted)]">The code cannot be changed after creation.</p>}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="v-desc" className={labelClass}>
              Description
            </label>
            <textarea
              id="v-desc"
              rows={2}
              maxLength={500}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Short explanation shown to the customer…"
              className={`${inputClass} resize-none`}
            />
          </div>
        </FieldGroup>

        {/* 2. Reward */}
        <FieldGroup title="2. Reward" hint="How much the voucher is worth, and in what form.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className={labelClass}>Voucher type</p>
              <Segmented options={VOUCHER_TYPES} value={form.voucherType} onChange={(v) => set("voucherType", v)} />
            </div>
            <div>
              <p className={labelClass}>Discount type</p>
              <Segmented options={DISCOUNT_TYPES} value={form.discountType} onChange={(v) => set("discountType", v)} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div>
              <label htmlFor="v-value" className={labelClass}>
                Value {!isEdit && <span className="text-[var(--admin-danger)]">*</span>}
                {form.discountType === "PERCENTAGE" ? " (%)" : " (Rp)"}
              </label>
              <input
                id="v-value"
                type="number"
                min={1}
                max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                step={form.discountType === "PERCENTAGE" ? 1 : 500}
                value={form.value}
                onChange={(e) => set("value", e.target.value)}
                placeholder={form.discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 25000"}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="v-maxdisc" className={labelClass}>
                Max discount (Rp)
              </label>
              <input
                id="v-maxdisc"
                type="number"
                min={0}
                step={500}
                value={form.maximumDiscount}
                onChange={(e) => set("maximumDiscount", e.target.value)}
                placeholder="Optional cap"
                className={inputClass}
              />
            </div>

            <div className="min-w-[150px] rounded-xl bg-[var(--admin-primary-soft)] px-4 py-3">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
                Customer sees
              </p>
              <p className="mt-0.5 font-headline text-base font-extrabold tracking-[-0.02em] text-[var(--admin-primary)]">
                {valuePreview ?? "—"}
              </p>
            </div>
          </div>
        </FieldGroup>

        {/* 3. Audience & schedule */}
        <FieldGroup title="3. Audience & schedule" hint="Who can claim it, and when it is live.">
          <div>
            <p className={labelClass}>
              Audience {!isEdit && <span className="text-[var(--admin-danger)]">*</span>}
            </p>
            <Segmented options={VOUCHER_AUDIENCES} value={form.audience} onChange={(v) => set("audience", v)} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="v-start" className={labelClass}>
                Starts at {!isEdit && <span className="text-[var(--admin-danger)]">*</span>}
              </label>
              <input
                id="v-start"
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => set("startAt", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="v-end" className={labelClass}>
                Ends at
              </label>
              <input
                id="v-end"
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => set("endAt", e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-[var(--admin-muted)]">Leave empty for a voucher with no end date.</p>
            </div>
          </div>
        </FieldGroup>

        {/* 4. Limits */}
        <FieldGroup title="4. Quota & conditions" hint="All optional — leave blank for no limit.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label htmlFor="v-quote" className={labelClass}>
                Total quota
              </label>
              <input
                id="v-quote"
                type="number"
                min={1}
                value={form.totalQuote}
                onChange={(e) => set("totalQuote", e.target.value)}
                placeholder="e.g. 500"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="v-limit" className={labelClass}>
                Uses per customer
              </label>
              <input
                id="v-limit"
                type="number"
                min={1}
                value={form.usageLimit}
                onChange={(e) => set("usageLimit", e.target.value)}
                placeholder="1"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="v-spend" className={labelClass}>
                Min. spend (Rp)
              </label>
              <input
                id="v-spend"
                type="number"
                min={0}
                step={500}
                value={form.minimalSpend}
                onChange={(e) => set("minimalSpend", e.target.value)}
                placeholder="e.g. 50000"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="v-qty" className={labelClass}>
                Min. quantity
              </label>
              <input
                id="v-qty"
                type="number"
                min={1}
                value={form.minQuantity}
                onChange={(e) => set("minQuantity", e.target.value)}
                placeholder="e.g. 2"
                className={inputClass}
              />
            </div>
          </div>
        </FieldGroup>

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={primaryButtonClass}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create voucher"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
