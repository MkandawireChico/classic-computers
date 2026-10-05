import type { Config } from "tailwindcss";

// Design-system tokens for the storefront + admin. Kept centralized here so
// spacing/typography/colour decisions are made once, not re-invented per
// component. Extend this file as the design system (section 80 of the brief)
// is fleshed out in Phase 4, rather than hard-coding one-off values in JSX.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f7ff",
          100: "#e7efff",
          200: "#cfe0ff",
          300: "#a8c2ff",
          400: "#7b9fff",
          500: "#1f56f0",
          600: "#184fe0",
          700: "#163fbd",
          800: "#193892",
          900: "#182d67",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f5f7fb",
          strong: "#edf3ff",
          border: "#d7e0ee",
        },
        status: {
          success: {
            DEFAULT: "#166534",
            surface: "#ecfdf5",
            border: "#b7e4c7",
          },
          warning: {
            DEFAULT: "#92400e",
            surface: "#fff7ed",
            border: "#f6d6a8",
          },
          danger: {
            DEFAULT: "#b42318",
            surface: "#fef3f2",
            border: "#f3c7c2",
          },
          info: {
            DEFAULT: "#1d4ed8",
            surface: "#eff6ff",
            border: "#bfdbfe",
          },
        },
      },
      boxShadow: {
        soft: "0 12px 28px -22px rgba(15, 23, 42, 0.22)",
        panel: "0 18px 35px -22px rgba(15, 23, 42, 0.25)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Segoe UI", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["clamp(2.75rem, 5vw, 4.5rem)", { lineHeight: "1.02", letterSpacing: "-0.06em" }],
        h1: ["clamp(2.2rem, 4vw, 3.4rem)", { lineHeight: "1.08", letterSpacing: "-0.05em" }],
        h2: ["clamp(1.8rem, 3vw, 2.5rem)", { lineHeight: "1.12", letterSpacing: "-0.04em" }],
      },
      borderRadius: {
        card: "0.9rem",
        panel: "1.1rem",
      },
    },
  },
  plugins: [],
};

export default config;
