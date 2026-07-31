import type { Config } from "tailwindcss";

// Magnifico brand tokens.
// Primary purple #6D28D9 is the single accent; everything else stays neutral
// so the purple + bold type carries the personality of the store.
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#6D28D9",
          foreground: "#FFFFFF",
          50: "#F5F0FE",
          100: "#EDE4FD",
          600: "#6D28D9",
          700: "#5B21B6",
        },
        muted: { DEFAULT: "#F5F5F7", foreground: "#6B7280" },
        card: { DEFAULT: "#FFFFFF", foreground: "#111114" },
        destructive: { DEFAULT: "#DC2626", foreground: "#FFFFFF" },
        accent: { DEFAULT: "#F5F0FE", foreground: "#5B21B6" },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: { lg: "0.75rem", md: "0.5rem", sm: "0.25rem" },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { "fade-up": "fade-up 0.5s ease-out" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
