import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0F2942", // Navy Cartorial Nobre
          50: "#f0f6fa",
          100: "#e0edf5",
          200: "#bad7ea",
          300: "#7fb7d9",
          400: "#3d91c4",
          500: "#1a73a7",
          600: "#0f5a89",
          700: "#0e486f",
          800: "#0f2942",
          900: "#0b2034",
          950: "#061320",
        },
        gold: {
          DEFAULT: "#C59B27", // Ouro Notarial de Destaque
          50: "#faf8f0",
          100: "#f4eedb",
          200: "#e9dbb5",
          300: "#dbc387",
          400: "#cfa959",
          500: "#c59b27",
          600: "#aa7e1d",
          700: "#865e1a",
          800: "#704d1c",
          900: "#5e401c",
        },
        accent: {
          DEFAULT: "#0284C7",
          light: "#E0F2FE",
        }
      },
    },
  },
  plugins: [],
};
export default config;
