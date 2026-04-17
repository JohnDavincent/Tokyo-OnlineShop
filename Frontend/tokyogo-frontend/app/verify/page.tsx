import Link from "next/link";

export default function verifyPage() {
    return (
        <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
            <main className="flex-grow flex items-center justify-center px-4 py-12 produce-pattern relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-container/20 rounded-full blur-3xl"></div>
                <div className="max-w-md w-full relative">
                    <div className="mb-10 text-center">
                        <span className="text-3xl font-black tracking-tighter text-primary mb-2 block font-headline">Tokyo GO</span>
                        <div className="h-1 w-12 bg-primary mx-auto rounded-full"></div>
                    </div>
                    <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 md:p-10 shadow-[0px_12px_32px_rgba(0,54,39,0.08)]">
                        <div className="mb-8 text-center">
                            <h1 className="text-2xl md:text-3xl font-headline font-extrabold tracking-tight text-on-surface mb-3">Verify Your Identity</h1>
                            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                                Enter the 6-digit code sent to your phone to continue your household shopping experience.
                            </p>
                        </div>
                        <div className="flex justify-between gap-2 md:gap-3 mb-8">
                            <input aria-label="OTP digit 1" className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold bg-surface-variant rounded-lg border-none ring-2 ring-transparent focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" maxLength={1} type="text" />
                            <input aria-label="OTP digit 2" className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold bg-surface-variant rounded-lg border-none ring-2 ring-transparent focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" maxLength={1} type="text" />
                            <input aria-label="OTP digit 3" className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold bg-surface-variant rounded-lg border-none ring-2 ring-transparent focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" maxLength={1} type="text" />
                            <input aria-label="OTP digit 4" className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold bg-surface-variant rounded-lg border-none ring-2 ring-transparent focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" maxLength={1} type="text" />
                            <input aria-label="OTP digit 5" className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold bg-surface-variant rounded-lg border-none ring-2 ring-transparent focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" maxLength={1} type="text" />
                            <input aria-label="OTP digit 6" className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold bg-surface-variant rounded-lg border-none ring-2 ring-transparent focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" maxLength={1} type="text" />
                        </div>
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full">
                                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                                <span className="text-sm font-semibold text-primary font-body tracking-wider">05:00</span>
                            </div>
                            <Link href="/register" className="w-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold py-4 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                                Verify Code
                                <span className="material-symbols-outlined text-xl">arrow_forward</span>
                            </Link>
                            <div className="text-center">
                                <p className="text-xs text-on-surface-variant font-medium mb-1">Didn&apos;t receive the code?</p>
                                <button className="text-sm font-bold text-primary hover:text-primary-dim underline decoration-primary/30 transition-colors">
                                    Resend Code
                                </button>
                            </div>
                        </div>
                    </div>
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
            </main>
            <footer className="w-full mt-auto bg-emerald-50 dark:bg-emerald-900/20 grid grid-cols-1 md:grid-cols-2 gap-8 px-12 py-16">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-50 font-headline tracking-tighter">Tokyo GO</h3>
                    <p className="manrope text-xs tracking-wide text-emerald-800 dark:text-emerald-400 max-w-xs">
                        Premium delivery of Tokyo&apos;s finest groceries and wholesale essentials. Experience precision freshness delivered to your door.
                    </p>
                </div>
                <div className="flex flex-col md:items-end justify-between gap-4">
                    <div className="flex flex-wrap gap-6">
                        <a className="manrope text-xs tracking-wide text-emerald-700/60 hover:text-emerald-900 underline decoration-emerald-500/30 transition-opacity" href="#">About Us</a>
                        <a className="manrope text-xs tracking-wide text-emerald-700/60 hover:text-emerald-900 underline decoration-emerald-500/30 transition-opacity" href="#">Sustainability</a>
                        <a className="manrope text-xs tracking-wide text-emerald-700/60 hover:text-emerald-900 underline decoration-emerald-500/30 transition-opacity" href="#">Delivery Info</a>
                        <a className="manrope text-xs tracking-wide text-emerald-700/60 hover:text-emerald-900 underline decoration-emerald-500/30 transition-opacity" href="#">Privacy Policy</a>
                    </div>
                    <p className="manrope text-xs tracking-wide text-emerald-700/60">
                        © 2024 Tokyo GO. Precision Freshness.
                    </p>
                </div>
            </footer>
            <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-40"></div>
        </div>
    );
}
