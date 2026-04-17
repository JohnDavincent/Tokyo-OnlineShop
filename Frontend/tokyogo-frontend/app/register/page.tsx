import Link from "next/link";

export default function Register() {

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col">
            {/* Suppressing Navigation Shell for Transactional/Focused Onboarding Flow as per Design System */}
            <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 produce-pattern pointer-events-none"></div>
                <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-0 relative z-10 editorial-shadow rounded-xl overflow-hidden">
                    {/* Visual Editorial Column */}
                    <div className="hidden md:flex md:col-span-5 bg-primary relative overflow-hidden flex-col justify-end p-12">
                        <div className="absolute inset-0 opacity-40">
                            <img alt="Fresh green organic vegetables and local Japanese produce on a market stall" className="w-full h-full object-cover" data-alt="Close-up of vibrant green bok choy and crisp lettuce in a modern wooden crate with bright natural sunlight" src="/images/fresh_veggies.png" />
                        </div>
                        <div className="relative z-10">
                            <div className="mb-4 text-primary-container">
                                <span className="material-symbols-outlined text-4xl" data-icon="eco">eco</span>
                            </div>
                            <h2 className="text-4xl font-extrabold text-white tracking-tighter leading-tight mb-4">
                                Precision Freshness <br />Directly to You.
                            </h2>
                            <p className="text-on-primary font-medium max-w-xs">
                                Tokyo GO curates the finest local ingredients with the speed of an editor&apos;s eye.
                            </p>
                        </div>
                        {/* Signature Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-dim/80 pointer-events-none"></div>
                    </div>
                    {/* Registration Form Column */}
                    <div className="md:col-span-7 bg-surface-container-lowest p-8 md:p-16 flex flex-col justify-center">
                        <div className="mb-10">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight mb-3">Create Your Grocery Account</h1>
                            <p className="text-on-surface-variant font-body">Start saving on your daily household needs.</p>
                        </div>
                        <form className="space-y-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold tracking-widest text-outline uppercase" htmlFor="full_name">Full Name</label>
                                <div className="relative">
                                    <input className="w-full bg-surface-container-low border-none rounded-lg px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant/60" id="full_name" name="full_name" placeholder="Enter your legal name" type="text" />
                                </div>
                            </div>
                            {/* Phone Number with Verification Badge */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold tracking-widest text-outline uppercase flex justify-between" htmlFor="phone">
                                    Phone Number
                                    <span className="text-[10px] text-primary flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]" data-icon="verified_user">verified_user</span>
                                        IDENTITY VERIFICATION REQUIRED
                                    </span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline-variant">
                                        <span className="material-symbols-outlined text-xl" data-icon="smartphone">smartphone</span>
                                    </div>
                                    <input className="w-full bg-surface-container-low border-none rounded-lg pl-12 pr-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant/60" id="phone" name="phone" placeholder="+81 00-0000-0000" type="tel" />
                                </div>
                            </div>
                            {/* Account PIN */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold tracking-widest text-outline uppercase" htmlFor="pin">Account PIN (4-6 digits)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline-variant">
                                        <span className="material-symbols-outlined text-xl" data-icon="lock">lock</span>
                                    </div>
                                    <input className="w-full bg-surface-container-low border-none rounded-lg pl-12 pr-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant/60 tracking-[0.5em]" id="pin" maxLength={6} name="pin" placeholder="••••" type="password" />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                        <button className="text-outline-variant hover:text-primary transition-colors" type="button">
                                            <span className="material-symbols-outlined" data-icon="visibility">visibility</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Terms Notice */}
                            <p className="text-[11px] text-on-surface-variant leading-relaxed">
                                By registering, you agree to our <a className="text-primary font-bold hover:underline" href="#">Terms of Service</a> and <a className="text-primary font-bold hover:underline" href="#">Privacy Policy</a> regarding your fresh grocery delivery.
                            </p>
                            {/* Primary Action */}
                            <div className="pt-4">
                                <button className="w-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold py-5 rounded-lg editorial-shadow active:scale-95 transition-all text-center tracking-tight flex items-center justify-center gap-2" type="submit">
                                    Register
                                    <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
                                </button>
                            </div>
                            {/* Sign In Link */}
                            <div className="text-center pt-6">
                                <p className="text-sm text-on-surface-variant font-medium">
                                    Existing member?
                                    <Link className="text-primary font-extrabold ml-1 hover:underline underline-offset-4 decoration-primary-fixed" href="/">Sign In</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            {/* Footer: Shared Component Shell Logic */}
            <footer className="bg-emerald-50 dark:bg-emerald-900/20 w-full mt-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-12 py-16 w-full">
                <div>
                    <span className="text-lg font-bold text-emerald-900 dark:text-emerald-50 block mb-2">Tokyo GO</span>
                    <p className="manrope text-xs tracking-wide text-emerald-800 dark:text-emerald-400">© 2024 Tokyo GO. Precision Freshness.</p>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end items-center">
                    <a className="manrope text-xs tracking-wide text-emerald-700/60 hover:text-emerald-900 underline decoration-emerald-500/30 opacity-100 hover:opacity-80 transition-opacity" href="#">About Us</a>
                    <a className="manrope text-xs tracking-wide text-emerald-700/60 hover:text-emerald-900 underline decoration-emerald-500/30 opacity-100 hover:opacity-80 transition-opacity" href="#">Sustainability</a>
                    <a className="manrope text-xs tracking-wide text-emerald-700/60 hover:text-emerald-900 underline decoration-emerald-500/30 opacity-100 hover:opacity-80 transition-opacity" href="#">Delivery Info</a>
                    <a className="manrope text-xs tracking-wide text-emerald-700/60 hover:text-emerald-900 underline decoration-emerald-500/30 opacity-100 hover:opacity-80 transition-opacity" href="#">Privacy Policy</a>
                </div>
            </footer>
        </div>
    )
}
