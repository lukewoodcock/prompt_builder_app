import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf6f0",
          100: "#f7e6d8",
          500: "#cc785c",
          600: "#b85c3e",
          700: "#9a4a30",
        },
      },
    },
  },
  plugins: [],
};

export default config;
