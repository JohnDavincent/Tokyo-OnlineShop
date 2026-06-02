"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { addAddress, CreateAddressPayload } from "../../services/authService";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────── */
interface LatLng {
  lat: number;
  lng: number;
}

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/* ─── Constants ─────────────────────────────────────────── */
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const DEFAULT_CENTER: LatLng = { lat: -6.2088, lng: 106.8456 }; // Jakarta

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
};

const MAP_OPTIONS: google.maps.MapOptions = {
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: "greedy",
};

/* ─── Helpers ───────────────────────────────────────────── */
function extractAddressComponent(
  components: google.maps.GeocoderAddressComponent[],
  type: string
): string {
  const found = components.find((c) => c.types.includes(type));
  return found?.long_name || "";
}

/* ─── Component ─────────────────────────────────────────── */
export default function AddAddressModal({ isOpen, onClose, onSuccess }: AddAddressModalProps) {
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authFailed, setAuthFailed] = useState(false);

  const mapRef = useRef<google.maps.Map | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  /* Catch Google Maps auth failures (invalid key) */
  useEffect(() => {
    if (!isOpen) return;
    const original = (window as unknown as Record<string, unknown>).gm_authFailure;
    (window as unknown as Record<string, unknown>).gm_authFailure = () => {
      setAuthFailed(true);
    };
    return () => {
      (window as unknown as Record<string, unknown>).gm_authFailure = original;
    };
  }, [isOpen]);

  /* Reset form when opened */
  useEffect(() => {
    if (isOpen) {
      setRecipientName("");
      setRecipientPhone("");
      setFullAddress("");
      setProvince("");
      setCity("");
      setPostalCode("");
      setNotes("");
      setErrors({});
      setIsSubmitting(false);

      // Try to get user location
      setIsLocating(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setCenter(loc);
            setIsLocating(false);
          },
          () => {
            setIsLocating(false);
          },
          { timeout: 10000 }
        );
      } else {
        setIsLocating(false);
      }
    }
  }, [isOpen]);

  /* Geocode center when map stops moving */
  const handleGeocode = useCallback(async (lat: number, lng: number) => {
    if (!window.google?.maps?.Geocoder) return;
    setIsGeocoding(true);

    const geocoder = new window.google.maps.Geocoder();
    try {
      const result = await geocoder.geocode({ location: { lat, lng } });
      if (result.results && result.results.length > 0) {
        const place = result.results[0];
        const comps = place.address_components;

        const streetNumber = extractAddressComponent(comps, "street_number");
        const route = extractAddressComponent(comps, "route");
        const subLocality = extractAddressComponent(comps, "sublocality_level_1") || extractAddressComponent(comps, "sublocality");
        const locality = extractAddressComponent(comps, "locality");
        const admin2 = extractAddressComponent(comps, "administrative_area_level_2");
        const admin1 = extractAddressComponent(comps, "administrative_area_level_1");
        const postal = extractAddressComponent(comps, "postal_code");
        const country = extractAddressComponent(comps, "country");

        // Build full address
        const addressParts = [
          streetNumber && route ? `${streetNumber} ${route}` : route || streetNumber,
          subLocality,
          locality || admin2,
        ].filter(Boolean);

        const formattedAddress = place.formatted_address || addressParts.join(", ");

        setFullAddress(formattedAddress);
        setProvince(admin1);
        setCity(locality || admin2);
        setPostalCode(postal);

        // If country is available and not Indonesia, we might want to note it
        if (country && country !== "Indonesia") {
          // Keep as-is, user can edit
        }
      }
    } catch {
      // Silently fail — user can type manually
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  /* Debounced geocode on map idle */
  const handleMapIdle = useCallback(() => {
    if (!mapRef.current) return;
    const c = mapRef.current.getCenter();
    if (!c) return;
    const lat = c.lat();
    const lng = c.lng();

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      handleGeocode(lat, lng);
    }, 600);
  }, [handleGeocode]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!recipientName.trim() || recipientName.trim().length < 2) {
      newErrors.recipientName = "Please enter the recipient's name (min 2 characters)";
    }
    if (!recipientPhone.trim() || recipientPhone.trim().length < 5) {
      newErrors.recipientPhone = "Please enter a valid phone number";
    }
    if (!fullAddress.trim() || fullAddress.trim().length < 10) {
      newErrors.fullAddress = "Please enter a complete address (min 10 characters)";
    }
    if (!province.trim()) {
      newErrors.province = "Province is required";
    }
    if (!city.trim()) {
      newErrors.city = "City is required";
    }
    if (!postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    if (!validate()) {
      toast.error("Please check the form and fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateAddressPayload = {
        fullAddress: fullAddress.trim(),
        province: province.trim(),
        notes: notes.trim(),
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
      };

      await addAddress(payload);
      toast.success("Address added successfully!");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add address";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCenter(loc);
          mapRef.current?.panTo(loc);
          setIsLocating(false);
          handleGeocode(loc.lat, loc.lng);
        },
        () => {
          setIsLocating(false);
          toast.error("Unable to get your location. Please allow location access.");
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
      toast.error("Geolocation is not supported by your browser");
    }
  };

  if (!isOpen) return null;

  /* ─── Render ────────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[640px] overflow-hidden rounded-t-[28px] bg-white shadow-[0_-20px_80px_rgba(0,0,0,0.2)] sm:rounded-[28px] border border-white/40 flex flex-col max-h-[92dvh] sm:max-h-[90vh]"
        style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        {/* Decorative background */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-[40px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-[40px] pointer-events-none" />

        {/* Header */}
        <div className="relative shrink-0 px-6 pt-6 pb-4 flex items-center justify-between border-b border-black/[0.05]">
          <div>
            <h2 className="font-headline text-[1.25rem] font-extrabold tracking-[-0.02em] text-[#101210]">
              Add New Address
            </h2>
            <p className="text-sm font-medium text-black/50 mt-0.5">
              Pin your location on the map — we&apos;ll fill the details for you
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.04] text-black/50 transition hover:bg-black/[0.08] hover:text-black/80"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="relative overflow-y-auto overscroll-contain">
          {/* Map Section */}
          <div className="relative h-[280px] sm:h-[320px] w-full bg-gray-100">
            {loadError || authFailed || !GOOGLE_MAPS_API_KEY ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-black/70">
                  {!GOOGLE_MAPS_API_KEY
                    ? "Google Maps API key is not configured"
                    : authFailed
                      ? "Google Maps API key is invalid"
                      : "Failed to load Google Maps"}
                </p>
                <p className="text-xs font-medium text-black/40 max-w-[280px]">
                  {!GOOGLE_MAPS_API_KEY || authFailed
                    ? "Please add a valid API key in .env.local, or enter your address manually below"
                    : "You can still enter your address manually below"}
                </p>
              </div>
            ) : !isLoaded ? (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <p className="text-sm font-medium text-black/50">Loading map…</p>
              </div>
            ) : (
              <>
                <GoogleMap
                  mapContainerStyle={MAP_CONTAINER_STYLE}
                  center={center}
                  zoom={16}
                  options={MAP_OPTIONS}
                  onLoad={onMapLoad}
                  onIdle={handleMapIdle}
                />
                {/* Center Pin Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative -mt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_16px_rgba(0,105,65,0.35)]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
                  </div>
                </div>

                {/* Locate Me Button */}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-primary shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition hover:bg-primary hover:text-white disabled:opacity-60"
                >
                  {isLocating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Locating…
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
                      </svg>
                      Use My Location
                    </>
                  )}
                </button>

                {/* Geocoding Indicator */}
                {isGeocoding && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    Finding address…
                  </div>
                )}
              </>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative px-6 py-6 space-y-5">
            {/* Recipient Name */}
            <div>
              <label htmlFor="recipientName" className="block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-black/50 mb-2">
                Recipient Name <span className="text-red-500">*</span>
              </label>
              <input
                id="recipientName"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Who will receive the package?"
                className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm font-semibold text-[#101210] outline-none transition placeholder:font-medium placeholder:text-black/30 focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.recipientName ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-black/[0.08]"}`}
              />
              {errors.recipientName && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.recipientName}</p>
              )}
            </div>

            {/* Recipient Phone */}
            <div>
              <label htmlFor="recipientPhone" className="block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-black/50 mb-2">
                Recipient Phone <span className="text-red-500">*</span>
              </label>
              <input
                id="recipientPhone"
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="e.g. 081234567890"
                className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm font-semibold text-[#101210] outline-none transition placeholder:font-medium placeholder:text-black/30 focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.recipientPhone ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-black/[0.08]"}`}
              />
              {errors.recipientPhone && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.recipientPhone}</p>
              )}
            </div>

            {/* Full Address */}
            <div>
              <label htmlFor="fullAddress" className="block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-black/50 mb-2">
                Full Address <span className="text-red-500">*</span>
                <span className="normal-case font-medium text-black/35 ml-1">(auto-filled from map)</span>
              </label>
              <textarea
                id="fullAddress"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Street name, building number, area…"
                rows={3}
                className={`w-full resize-none rounded-2xl border bg-white px-4 py-3.5 text-sm font-semibold text-[#101210] outline-none transition placeholder:font-medium placeholder:text-black/30 focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.fullAddress ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-black/[0.08]"}`}
              />
              {errors.fullAddress && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.fullAddress}</p>
              )}
            </div>

            {/* Province & City Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="province" className="block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-black/50 mb-2">
                  Province <span className="text-red-500">*</span>
                </label>
                <input
                  id="province"
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Province"
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm font-semibold text-[#101210] outline-none transition placeholder:font-medium placeholder:text-black/30 focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.province ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-black/[0.08]"}`}
                />
                {errors.province && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.province}</p>
                )}
              </div>
              <div>
                <label htmlFor="city" className="block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-black/50 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City / District"
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm font-semibold text-[#101210] outline-none transition placeholder:font-medium placeholder:text-black/30 focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.city ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-black/[0.08]"}`}
                />
                {errors.city && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.city}</p>
                )}
              </div>
            </div>

            {/* Postal Code & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="postalCode" className="block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-black/50 mb-2">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 12345"
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm font-semibold text-[#101210] outline-none transition placeholder:font-medium placeholder:text-black/30 focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.postalCode ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-black/[0.08]"}`}
                />
                {errors.postalCode && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.postalCode}</p>
                )}
              </div>
              <div>
                <label htmlFor="notes" className="block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-black/50 mb-2">
                  Notes <span className="text-black/30 font-medium normal-case">(optional)</span>
                </label>
                <input
                  id="notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Landmark, floor, etc."
                  className="w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3.5 text-sm font-semibold text-[#101210] outline-none transition placeholder:font-medium placeholder:text-black/30 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="relative shrink-0 px-6 py-4 border-t border-black/[0.05] bg-white">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-black/[0.08] bg-black/[0.03] py-3.5 text-sm font-bold text-black/60 transition hover:bg-black/[0.06] hover:text-[#101210]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-[2] rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-dim hover:shadow-[0_12px_32px_rgba(0,105,65,0.3)] disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </span>
              ) : (
                "Save Address"
              )}
            </button>
          </div>
        </div>

        {/* Animation styles */}
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
