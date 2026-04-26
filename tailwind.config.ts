import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f7f3eb",
        panel: "#ffffff",
        line: "#e5ded3",
        ink: "#1f2933",
        muted: "#6b7280",
        sidebar: "#202028",
        sidebarSoft: "#2b2b36",
        accent: "#6652d9",
        accentSoft: "#efedff",
        success: "#287a52",
        warning: "#9a6a13",
        danger: "#a33a3a",
      },
      boxShadow: {
        card: "0 1px 2px rgba(31, 41, 51, 0.05)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
