  import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",
          400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",
          800:"#3730a3",900:"#312e81"
        },
        danger:  { DEFAULT:"#ef4444", fg:"#7f1d1d", soft:"#fee2e2" },
        warning: { DEFAULT:"#f59e0b", fg:"#7c2d12", soft:"#fef3c7" },
        info:    { DEFAULT:"#0ea5e9", fg:"#0c4a6e", soft:"#e0f2fe" },
        ok:      { DEFAULT:"#16a34a", fg:"#14532d", soft:"#dcfce7" }
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.1)"
      },
      borderRadius: { xl: "14px", "2xl":"16px" }
    }
  },
  plugins: [],
} satisfies Config;
