"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";


export default function Started() {

    const [phoneNumber, setPhoneNumber] = useState("");
    const [formValues, setFormValues] = useState({
        name: "",
        phoneNumber: "",
        pin: ""
    });
    const [message, setMessage] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(300); // 5 minutes in seconds
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    // Timer countdown
    useEffect(() => {
        if (!isTimerRunning || timer <= 0) return;
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    setIsTimerRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isTimerRunning, timer]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(e.target.value);
    };

    const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const phoneClean = phoneNumber.replace(/[\s-]/g, '');
        if (!phoneClean || phoneClean.length < 8 || !/^\d+$/.test(phoneClean)) {
            alert("enter a valid phone number");
            return;
        }

        setMessage(""); // clear msg

        try {
            const response = await fetch("http://localhost:5000/tokyo/request-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phoneNumber: phoneNumber
                })
            });

            if (!response.ok) {
                const data = await response.text();
                setMessage(data);
            }
        } catch (error) {
            console.error("Error sending OTP request:", error);
            setMessage("Error connecting to backend");
        }

        // Move to OTP slide
        setCurrentSlide(1);
        setTimer(300);
        setIsTimerRunning(true);
        // Focus the first OTP input after slide transition
        setTimeout(() => {
            otpRefs.current[0]?.focus();
        }, 500);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // only digits

        const newOtp = [...otpValues];
        newOtp[index] = value.slice(-1); // only keep last char
        setOtpValues(newOtp);

        // Auto-advance to next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData) {
            const newOtp = [...otpValues];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtpValues(newOtp);
            // Focus the next empty input or the last one
            const nextEmpty = pastedData.length < 6 ? pastedData.length : 5;
            otpRefs.current[nextEmpty]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otp = otpValues.join("");
        if (otp.length < 6) {
            alert("Please enter the complete 6-digit code");
            return;
        }

        setMessage(""); // clear previous errors

        try {
            const response = await fetch("http://localhost:5000/tokyo/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber, code: otp })
            });

            if (response.ok) {
                // Success: move to register slide
                setCurrentSlide(2);
            } else {
                // Return error text and do not change slide!
                const data = await response.text();
                setMessage(data || "Invalid OTP");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            // Mock behavior for prototyping without a real backend:
            if (otp === "123456") {
                setCurrentSlide(2);
            } else {
                setMessage("Network error or invalid code. (Use 123456 to test success without backend)");
            }
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await fetch("http://localhost:5000/tokyo/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: formValues.name,
                    phoneNumber: phoneNumber, // Use the verified phone number
                    pin: formValues.pin
                })
            });

            const data = await response.text();
            if (response.ok) {
                alert("Registration successful!");
                // router.push("/dashboard");
            } else {
                setMessage(data || "Registration failed");
            }
        } catch (error) {
            console.error("Error registering:", error);
            setMessage("Error connecting to backend");
        }
    }

    const handleResendCode = async () => {
        setTimer(300);
        setIsTimerRunning(true);
        setOtpValues(["", "", "", "", "", ""]);
        setMessage("");
        otpRefs.current[0]?.focus();

        try {
            await fetch("http://localhost:5000/tokyo/request-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber })
            });
        } catch (error) {
            console.error("Error resending OTP:", error);
        }
    };

    const handleBackToPhone = () => {
        setCurrentSlide(0);
        setIsTimerRunning(false);
        setOtpValues(["", "", "", "", "", ""]);
        setMessage("");
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col relative overflow-hidden">
            {/*<!-- Background Decorative Elements -->*/}
            <div className="absolute inset-0 produce-pattern pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-container/30 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute top-1/2 -left-32 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl opacity-40"></div>
            {/*<!-- Main Content Canvas -->*/}
            <main className="flex-grow flex flex-col items-center justify-center px-6 pt-12 pb-24 z-10">
                {/*<!-- Brand Identity -->*/}
                <div className="mb-12 text-center">
                    <h2 className="plus-jakarta-sans text-3xl font-black tracking-tighter text-on-surface mb-2">Tokyo GO</h2>
                    <div className="inline-block px-3 py-1 bg-tertiary-container/10 border border-tertiary-container/20 rounded-full">
                        <span className="manrope text-[10px] font-bold tracking-widest text-tertiary uppercase">Wholesale Precision</span>
                    </div>
                </div>

                {/*<!-- Step Indicator -->*/}
                <div className="flex items-center justify-center gap-1 sm:gap-3 mb-8 w-full max-w-md">
                    <div className={`flex items-center gap-1 sm:gap-2 transition-all duration-500 ${currentSlide === 0 ? "opacity-100" : "opacity-40"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${currentSlide === 0 ? "bg-primary text-on-primary scale-110" : "bg-primary/20 text-primary"}`}>1</div>
                        <span className="manrope text-xs font-semibold text-on-surface-variant hidden sm:inline">Phone</span>
                    </div>
                    <div className={`w-4 sm:w-8 h-[2px] rounded-full transition-all duration-500 ${currentSlide >= 1 ? "bg-primary" : "bg-outline-variant/30"}`}></div>
                    <div className={`flex items-center gap-1 sm:gap-2 transition-all duration-500 ${currentSlide === 1 ? "opacity-100" : "opacity-40"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${currentSlide === 1 ? "bg-primary text-on-primary scale-110" : "bg-primary/20 text-primary"}`}>2</div>
                        <span className="manrope text-xs font-semibold text-on-surface-variant hidden sm:inline">Verify</span>
                    </div>
                    <div className={`w-4 sm:w-8 h-[2px] rounded-full transition-all duration-500 ${currentSlide >= 2 ? "bg-primary" : "bg-outline-variant/30"}`}></div>
                    <div className={`flex items-center gap-1 sm:gap-2 transition-all duration-500 ${currentSlide === 2 ? "opacity-100" : "opacity-40"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${currentSlide === 2 ? "bg-primary text-on-primary scale-110" : "bg-primary/20 text-primary"}`}>3</div>
                        <span className="manrope text-xs font-semibold text-on-surface-variant hidden sm:inline">Register</span>
                    </div>
                </div>

                {/*<!-- Slider Container -->*/}
                <div className="w-full max-w-md overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {/*<!-- SLIDE 1: Phone Number Entry -->*/}
                        <div className="w-full flex-shrink-0 px-1">
                            {/*<!-- Editorial Header -->*/}
                            <div className="text-center max-w-sm mx-auto mb-10">
                                <h1 className="plus-jakarta-sans text-4xl font-extrabold tracking-tight text-on-surface leading-[1.1] mb-4">
                                    Your Daily Essentials, <span className="text-primary italic">Delivered.</span>
                                </h1>
                                <p className="manrope text-on-surface-variant text-sm leading-relaxed px-4">
                                    Join Tokyo GO for fresh groceries and household necessities at wholesale prices.
                                </p>
                            </div>
                            {/*<!-- Entry Card -->*/}
                            <div className="w-full glass-panel rounded-xl shadow-[0px_12px_32px_rgba(0,54,39,0.08)] p-8 relative overflow-hidden">
                                <div className="absolute -top-4 -right-4 opacity-10">
                                    <span className="material-symbols-outlined text-8xl" data-icon="eco">eco</span>
                                </div>
                                <form onSubmit={handlePhoneSubmit} className="space-y-6 relative z-10">
                                    {message && currentSlide === 0 && (
                                        <div className="p-3 bg-error-container/20 text-error rounded-lg text-sm font-semibold text-center mb-4">
                                            {message}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="manrope text-xs font-bold text-on-surface-variant tracking-wider uppercase ml-1">Mobile Number</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <span className="manrope text-sm font-bold text-primary">+62</span>
                                            </div>
                                            <input value={phoneNumber} onChange={handlePhoneChange} className="w-full bg-surface-variant/30 border-0 rounded-lg py-4 pl-14 pr-4 manrope text-on-surface placeholder:text-outline-variant/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 outline-none" placeholder="00-0000-0000" type="tel" />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full editorial-gradient py-4 rounded-lg flex items-center justify-center group active:scale-95 transition-all duration-200">
                                        <span className="manrope font-bold text-on-primary tracking-wide">Selanjutnya</span>
                                        <span className="material-symbols-outlined ml-2 text-on-primary text-sm group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
                                    </button>
                                    <p className="manrope text-[10px] text-center text-on-surface-variant/60 px-4">
                                        Dengan melanjutkan, Anda menyetujui <a className="underline decoration-primary/20 text-on-surface-variant" href="#">Syarat Layanan</a> dan <a className="underline decoration-primary/20 text-on-surface-variant" href="#">Kebijakan Privasi</a>.
                                    </p>
                                </form>
                            </div>
                        </div>

                        {/*<!-- SLIDE 2: OTP Verification -->*/}
                        <div className="w-full flex-shrink-0 px-1">
                            <div className="w-full glass-panel rounded-xl shadow-[0px_12px_32px_rgba(0,54,39,0.08)] p-8 md:p-10 relative overflow-hidden">
                                <div className="mb-8 text-center">
                                    <h1 className="text-2xl md:text-3xl plus-jakarta-sans font-extrabold tracking-tight text-on-surface mb-3">Verify Your Identity</h1>
                                    <p className="manrope text-on-surface-variant text-sm md:text-base leading-relaxed">
                                        Enter the 6-digit code sent to <span className="font-bold text-primary">+62 {phoneNumber}</span>
                                    </p>
                                </div>

                                {message && currentSlide === 1 && (
                                    <div className="p-3 bg-error-container/20 text-error rounded-lg text-sm font-semibold text-center mb-6">
                                        {message}
                                    </div>
                                )}

                                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
                                    {otpValues.map((val, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpRefs.current[i] = el; }}
                                            aria-label={`OTP digit ${i + 1}`}
                                            className={`w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold rounded-lg border-none ring-2 focus:bg-surface-container-lowest transition-all outline-none ${message && currentSlide === 1 ? 'bg-error-container/10 ring-error/40 focus:ring-error text-error' : 'bg-surface-variant ring-transparent focus:ring-primary/20 text-on-surface'}`}
                                            maxLength={1}
                                            type="text"
                                            inputMode="numeric"
                                            value={val}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            onPaste={i === 0 ? handleOtpPaste : undefined}
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-col items-center gap-6">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full">
                                        <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                                        <span className={`text-sm font-semibold font-body tracking-wider ${timer <= 30 ? "text-error" : "text-primary"}`}>{formatTime(timer)}</span>
                                    </div>
                                    <button onClick={handleVerifyOtp} className="w-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold py-4 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                                        Verify Code
                                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                    </button>
                                    <div className="text-center">
                                        <p className="text-xs text-on-surface-variant font-medium mb-1">Didn&apos;t receive the code?</p>
                                        <button
                                            onClick={handleResendCode}
                                            disabled={timer > 0}
                                            className={`text-sm font-bold transition-colors ${timer > 0 ? "text-on-surface-variant/40 cursor-not-allowed" : "text-primary hover:text-primary-dim underline decoration-primary/30"}`}
                                        >
                                            Resend Code
                                        </button>
                                    </div>
                                    <button onClick={handleBackToPhone} className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                                        Change phone number
                                    </button>
                                </div>
                            </div>
                            {/*<!-- Trust Badges -->*/}
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="bg-surface-container-low/50 p-4 rounded-xl flex items-center gap-3">
                                    <div className="bg-surface-container-lowest p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-primary" data-icon="lock" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Secure Session</span>
                                </div>
                                <div className="bg-surface-container-low/50 p-4 rounded-xl flex items-center gap-3">
                                    <div className="bg-surface-container-lowest p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-secondary" data-icon="verified_user" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Identity Verified</span>
                                </div>
                            </div>
                        </div>

                        {/*<!-- SLIDE 3: Registration -->*/}
                        <div className="w-full flex-shrink-0 px-1">
                            <div className="w-full glass-panel rounded-xl shadow-[0px_12px_32px_rgba(0,54,39,0.08)] p-8 md:p-10 relative overflow-hidden">
                                <div className="mb-8 text-center">
                                    <h1 className="text-2xl md:text-3xl plus-jakarta-sans font-extrabold tracking-tight text-on-surface mb-3">Create Account</h1>
                                    <p className="manrope text-on-surface-variant text-sm md:text-base leading-relaxed">
                                        Complete your registration to start shopping.
                                    </p>
                                </div>

                                {message && currentSlide === 2 && (
                                    <div className="p-3 bg-error-container/20 text-error rounded-lg text-sm font-semibold text-center mb-6">
                                        {message}
                                    </div>
                                )}

                                <form onSubmit={handleRegister} className="space-y-6 relative z-10">
                                    {/* Disabled Phone Input Display */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase ml-1 flex justify-between">
                                            Verified Phone
                                            <span className="text-[10px] text-primary flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]" data-icon="verified_user">verified_user</span>
                                                VERIFIED
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary">
                                                <span className="material-symbols-outlined text-xl" data-icon="smartphone">smartphone</span>
                                            </div>
                                            <input
                                                className="w-full bg-surface-container-lowest/50 border-none rounded-lg pl-12 pr-4 py-4 text-on-surface-variant cursor-not-allowed opacity-70"
                                                value={`+62 ${phoneNumber}`}
                                                type="text"
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase ml-1">Full Name</label>
                                        <div className="relative">
                                            <input
                                                className="w-full bg-surface-variant/30 border-none rounded-lg px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant/60"
                                                name="name"
                                                value={formValues.name}
                                                onChange={handleFormChange}
                                                placeholder="Enter your legal name"
                                                type="text"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase ml-1">Account PIN</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline-variant">
                                                <span className="material-symbols-outlined text-xl" data-icon="lock">lock</span>
                                            </div>
                                            <input
                                                className="w-full bg-surface-variant/30 border-none rounded-lg pl-12 pr-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant/60 tracking-[0.5em]"
                                                maxLength={6}
                                                name="pin"
                                                value={formValues.pin}
                                                onChange={handleFormChange}
                                                placeholder="••••"
                                                type="password"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-center text-on-surface-variant leading-relaxed">
                                        By registering, you agree to our <a className="text-primary font-bold hover:underline" href="#">Terms of Service</a> &amp; <a className="text-primary font-bold hover:underline" href="#">Privacy Policy</a>
                                    </p>
                                    <div className="pt-2">
                                        <button className="w-full editorial-gradient text-on-primary font-bold py-4 rounded-lg shadow-lg active:scale-95 transition-all text-center tracking-tight flex items-center justify-center gap-2" type="submit">
                                            Register Account
                                            <span className="material-symbols-outlined" data-icon="check_circle">check_circle</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>

                {/*<!-- Asymmetric Visual Cues (only on slide 1) -->*/}
                <div className={`mt-12 flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 ${currentSlide !== 0 ? "hidden" : ""}`}>
                    <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-2xl mb-1" data-icon="temp_preferences_custom">temp_preferences_custom</span>
                        <span className="manrope text-[10px] font-bold tracking-tighter">COLD CHAIN</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-2xl mb-1" data-icon="delivery_dining">delivery_dining</span>
                        <span className="manrope text-[10px] font-bold tracking-tighter">EXPRESS</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-2xl mb-1" data-icon="verified">verified</span>
                        <span className="manrope text-[10px] font-bold tracking-tighter">WHOLESALE</span>
                    </div>
                </div>
            </main>
            {/*<!-- Visual Anchor: Bottom Abstract Shape -->*/}
            <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-surface-container-low/50 to-transparent pointer-events-none"></div>
            {/*<!-- Floating Product Glimpse (Asymmetric Design) -->*/}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 rotate-12 opacity-80 pointer-events-none hidden md:block">
                <img alt="" className="w-full h-full object-cover rounded-2xl shadow-xl" data-alt="close-up of vibrant fresh green grapes with water droplets in soft studio lighting against an emerald background" src="/images/green_grapes.png" />
            </div>
            {/*<!-- Footer Identity -->*/}
            <footer className="w-full mt-auto bg-emerald-50 dark:bg-emerald-900/20 px-12 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 z-20">
                <div className="flex flex-col justify-center">
                    <p className="manrope text-xs tracking-wide text-emerald-800 dark:text-emerald-400">
                        © 2026 Tokyo GO. Precision Freshness.
                    </p>
                </div>
                <div className="flex items-center md:justify-end gap-6">
                    <a className="manrope text-xs text-emerald-700/60 hover:text-emerald-900 underline decoration-emerald-500/30 transition-opacity" href="#">About Us</a>
                    <a className="manrope text-xs text-emerald-700/60 hover:text-emerald-900 underline decoration-emerald-500/30 transition-opacity" href="#">Sustainability</a>
                    <a className="manrope text-xs text-emerald-700/60 hover:text-emerald-900 underline decoration-emerald-500/30 transition-opacity" href="#">Delivery Info</a>
                </div>
            </footer>
        </div>
    )

}