/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Exo 2'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        cyber: {
          50: "#f0fdf9",
          100: "#ccfbef",
          200: "#99f6e0",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        dark: {
          50: "#f8f9fa",
          100: "#e9ecef",
          200: "#dee2e6",
          700: "#1a1f2e",
          800: "#12161f",
          900: "#0a0d14",
          950: "#050709",
        }
      },
      animation: {
        "scan": "scan 3s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(20,184,166,0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(20,184,166,0.6), 0 0 40px rgba(20,184,166,0.2)" },
        },
      },
    },
  },
  plugins: [],
};
