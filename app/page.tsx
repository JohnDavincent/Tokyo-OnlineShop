"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Started() {

    const [phoneNumber, setPhoneNumber] = useState("");
    const router = useRouter();
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(e.target.value);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const phoneClean = phoneNumber.replace(/[\s-]/g, '');
        if (!phoneClean || phoneClean.length < 8 || !/^\d+$/.test(phoneClean)) {
            alert("enter a valid phone number");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/tokyo/request-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",

                },
                body: JSON.stringify({
                    phoneNumber: phoneNumber
                })
            });

            const data = await response.text();
            setMessage(data);
            router.push("/verify");

        } catch (error) {
            console.error("Error sending OTP request:", error);
            setMessage("Error connecting to backend");
            // Proceed to next page even if backend is not available for prototyping
            router.push("/verify");
        }
    }

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
                {/*<!-- Editorial Header -->*/}
                <div className="text-center max-w-sm mb-10">
                    <h1 className="plus-jakarta-sans text-4xl font-extrabold tracking-tight text-on-surface leading-[1.1] mb-4">
                        Your Daily Essentials, <span className="text-primary italic">Delivered.</span>
                    </h1>
                    <p className="manrope text-on-surface-variant text-sm leading-relaxed px-4">
                        Join Tokyo GO for fresh groceries and household necessities at wholesale prices.
                    </p>
                </div>
                {/*<!-- Entry Card -->*/}
                <div className="w-full max-w-md glass-panel rounded-xl shadow-[0px_12px_32px_rgba(0,54,39,0.08)] p-8 relative overflow-hidden">
                    {/*<!-- Subtle Visual Cue: Organic Leaf Icon -->*/}
                    <div className="absolute -top-4 -right-4 opacity-10">
                        <span className="material-symbols-outlined text-8xl" data-icon="eco">eco</span>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="manrope text-xs font-bold text-on-surface-variant tracking-wider uppercase ml-1">Mobile Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="manrope text-sm font-bold text-primary">+62</span>
                                </div>
                                <input value={phoneNumber} onChange={handleChange} className="w-full bg-surface-variant/30 border-0 rounded-lg py-4 pl-14 pr-4 manrope text-on-surface placeholder:text-outline-variant/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 outline-none" placeholder="00-0000-0000" type="tel" />
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
                {/*<!-- Asymmetric Visual Cues -->*/}
                <div className="mt-12 flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
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
            {/*<!-- Footer Identity from JSON Concept -->*/}
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