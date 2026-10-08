import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { base: "#05060A", s1: "#0B0D14", s2: "#11141D", ink: "#E8EAF2", mute: "#8A90A6", accent: "#7C6CFF" },
    fontFamily: { sans: ["var(--font-inter)"], display: ["var(--font-grotesk)"] },
    boxShadow: { glow: "0 0 40px -8px rgba(124,108,255,.55)" } } },
  plugins: [],
} satisfies Config;
