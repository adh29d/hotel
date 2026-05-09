import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        bone: "#F7F4EF",
        ink: "#1B1B1B",
        muted: "#6B6760",
        line: "#E7E1D7",
        accent: {
          DEFAULT: "#1F4D3C",
          soft: "#E9F0EC",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.08)",
        press: "inset 0 1px 2px rgba(0,0,0,0.06)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        tickDraw: {
          "0%": { strokeDashoffset: "48" },
          "100%": { strokeDashoffset: "0" },
        },
        ringExpand: {
          "0%": { transform: "scale(0.4)", opacity: "0.6" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        fadeUp: "fadeUp 500ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        fadeIn: "fadeIn 400ms ease-out both",
        pop: "pop 500ms cubic-bezier(0.2, 0.9, 0.3, 1.2) both",
        tickDraw: "tickDraw 500ms 200ms ease-out forwards",
        ringExpand: "ringExpand 800ms ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
