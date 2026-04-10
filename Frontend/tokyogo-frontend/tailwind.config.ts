import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-plus-jakarta-sans)", "var(--font-manrope)"],
            },
            colors: {
                "on-surface": "#003627",
                "surface-bright": "#d9ffed",
                "on-tertiary": "#fff0e2",
                "surface": "#d9ffed",
                "primary-fixed": "#7bfeb8",
                "surface-container-low": "#c0fee3",
                "tertiary-fixed-dim": "#ec9e00",
                "error-container": "#fb5151",
                "on-background": "#003627",
                "tertiary-fixed": "#feaa00",
                "tertiary": "#7e5200",
                "on-primary-fixed": "#004b2d",
                "on-primary-container": "#00603b",
                "on-primary-fixed-variant": "#006b43",
                "error-dim": "#9f0519",
                "surface-container-high": "#aaf1d4",
                "on-tertiary-fixed": "#331f00",
                "surface-container": "#b4f6da",
                "background": "#d9ffed",
                "inverse-surface": "#00120b",
                "primary": "#006941",
                "primary-container": "#7bfeb8",
                "surface-dim": "#92e5c4",
                "on-error-container": "#570008",
                "on-secondary-fixed-variant": "#12661e",
                "on-tertiary-container": "#503300",
                "tertiary-dim": "#6e4800",
                "on-surface-variant": "#316552",
                "surface-container-highest": "#9feccd",
                "inverse-on-surface": "#73a892",
                "on-primary": "#caffdc",
                "outline": "#4d816d",
                "on-secondary-container": "#005c15",
                "secondary-fixed": "#9df197",
                "on-secondary": "#d1ffc8",
                "secondary": "#176a21",
                "tertiary-container": "#feaa00",
                "error": "#b31b25",
                "secondary-fixed-dim": "#90e28a",
                "surface-variant": "#9feccd",
                "surface-container-lowest": "#ffffff",
                "on-tertiary-fixed-variant": "#5b3b00",
                "secondary-dim": "#025d16",
                "primary-dim": "#005c38",
                "inverse-primary": "#7bfeb8",
                "primary-fixed-dim": "#6cefab",
                "on-secondary-fixed": "#00460e",
                "on-error": "#ffefee",
                "secondary-container": "#9df197",
                "outline-variant": "#83b8a2",
                "surface-tint": "#006941"
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            }
        },
    },
    plugins: [],
}

export default config;