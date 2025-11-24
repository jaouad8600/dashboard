import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        teylingereind: {
          blue: "#140D4D", // Donkerblauw
          orange: "#ED4B00", // Vurig Oranje
          royal: "#3E5EFC", // Helder Koningsblauw
          gray: "#F9F9F9", // Lichtgrijs
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-instrument-sans)", "Helvetica", "Arial", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
