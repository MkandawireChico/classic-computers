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
          50: "#f1f5ff",
          100: "#e1eaff",
          200: "#c4d5ff",
          300: "#9bb8ff",
          400: "#6e91ff",
          500: "#1f56f0",
          600: "#1948cf",
          700: "#173ba8",
          800: "#183583",
          900: "#172d68",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f5f7fb",
          strong: "#eef3fb",
          border: "#dfe7f2",
        },
        status: {
          success: {
            DEFAULT: "#17643a",
            surface: "#f0f8f2",
            border: "#c8e5ce",
          },
          warning: {
            DEFAULT: "#805000",
            surface: "#fff8e8",
            border: "#f0dba8",
          },
          danger: {
            DEFAULT: "#a52c2c",
            surface: "#fff2f0",
            border: "#efc9c4",
          },
          info: {
            DEFAULT: "#1948cf",
            surface: "#f1f5ff",
            border: "#c4d5ff",
          },
        },
      },
      boxShadow: {
        soft: "0 2px 8px rgba(15, 23, 42, 0.05)",
        panel: "0 4px 14px rgba(15, 23, 42, 0.07)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Segoe UI", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "0.5rem",
        panel: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
