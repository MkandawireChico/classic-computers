import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff8ff",
          100: "#dff1ff",
          200: "#b8e4ff",
          300: "#7bd0ff",
          400: "#3bb5f2",
          500: "#168bce",
          600: "#0872b2",
          700: "#0b5b91",
          800: "#104d77",
          900: "#123f61",
        },
        navy: {
          50: "#eef2f8",
          100: "#dce4f0",
          200: "#bdcadd",
          300: "#91a5c2",
          400: "#617da2",
          500: "#405d82",
          600: "#304969",
          700: "#243a56",
          800: "#192b43",
          900: "#101d35",
          950: "#091426",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f5f7fb",
          strong: "#edf3ff",
          border: "#e2e8f0",
        },
        status: {
          success: { DEFAULT: "#166534", surface: "#ecfdf5", border: "#b7e4c7" },
          warning: { DEFAULT: "#92400e", surface: "#fff7ed", border: "#f6d6a8" },
          danger: { DEFAULT: "#b42318", surface: "#fef3f2", border: "#f3c7c2" },
          info: { DEFAULT: "#1d4ed8", surface: "#eff6ff", border: "#bfdbfe" },
        },
      },
      boxShadow: {
        soft: "0 12px 30px -22px rgba(16, 29, 53, 0.22)",
        panel: "0 22px 55px -30px rgba(16, 29, 53, 0.3)",
        elevated: "0 28px 70px -35px rgba(9, 20, 38, 0.48)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Segoe UI", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["clamp(2.75rem, 5.2vw, 4.75rem)", { lineHeight: "1.02", letterSpacing: "-0.06em" }],
        h1: ["clamp(2.2rem, 4vw, 3.4rem)", { lineHeight: "1.08", letterSpacing: "-0.05em" }],
        h2: ["clamp(1.8rem, 3vw, 2.5rem)", { lineHeight: "1.12", letterSpacing: "-0.04em" }],
      },
      borderRadius: {
        card: "1rem",
        panel: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
