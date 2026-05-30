/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f0ff",
          100: "#e0e0ff",
          200: "#c4c4ff",
          300: "#a4a4ff",
          400: "#8080ff",
          500: "#6C63FF",
          600: "#5a52e0",
          700: "#4840c0",
          800: "#3630a0",
          900: "#252080",
        },
        accent: {
          500: "#FF6584",
          600: "#e5587a",
        },
        success: { 500: "#4CAF50" },
        warning: { 500: "#FF9800" },
        danger: { 500: "#F44336" },
      },
      fontFamily: {
        heading: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(108, 99, 255, 0.08)",
        "card-hover": "0 8px 30px rgba(108, 99, 255, 0.16)",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
      },
    },
  },
  plugins: [],
};
