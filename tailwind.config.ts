import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-mori)"],
        serif: ["var(--font-display)"],
        display: ["var(--font-display)"],
      },
      letterSpacing: {
        display: "var(--tracking-display)",
      },
      colors: {
        // Primitive Brand Scale (logotipo InterJuri: #006DFD / #021F50)
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          200: "var(--brand-200)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          800: "var(--brand-800)",
          900: "var(--brand-900)",
          950: "var(--brand-950)",
        },
        // Brand Accents
        "accent-brand": {
          cyan: "var(--accent-cyan)",
          blue: "var(--accent-blue)",
          green: "var(--accent-green)",
          teal: "var(--accent-teal)",
          yellow: "var(--accent-yellow)",
        },
        // Neutral Scale
        neutral: {
          0: "var(--neutral-0)",
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
          950: "var(--neutral-950)",
        },
        // Semantic Status Colors
        semantic: {
          success: {
            DEFAULT: "var(--semantic-success)",
            bg: "var(--semantic-success-bg)",
            border: "var(--semantic-success-border)",
            hover: "var(--semantic-success-hover)",
          },
          warning: {
            DEFAULT: "var(--semantic-warning)",
            bg: "var(--semantic-warning-bg)",
            border: "var(--semantic-warning-border)",
            hover: "var(--semantic-warning-hover)",
          },
          error: {
            DEFAULT: "var(--semantic-error)",
            bg: "var(--semantic-error-bg)",
            border: "var(--semantic-error-border)",
            hover: "var(--semantic-error-hover)",
          },
          info: {
            DEFAULT: "var(--semantic-info)",
            bg: "var(--semantic-info-bg)",
            border: "var(--semantic-info-border)",
            hover: "var(--semantic-info-hover)",
          },
        },
        // Semantic Surfaces & Text
        surface: {
          page: "var(--bg-page)",
          card: "var(--bg-surface)",
          subtle: "var(--bg-subtle)",
          hover: "var(--bg-hover)",
          selected: "var(--bg-selected)",
          inverse: "var(--bg-inverse)",
        },
        // Legacy / B2C compatibility mappings
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#021F50",
          50: "#EEF5FF",
          100: "#D9E8FF",
          200: "#B3D1FF",
          300: "#7DB2FF",
          400: "#3D8DFF",
          500: "#006DFD",
          600: "#0057D1",
          700: "#0045A6",
          800: "#04367F",
          900: "#032A66",
          950: "#021F50",
        },
        gold: {
          DEFAULT: "#C59B27",
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
          DEFAULT: "#006DFD",
          light: "#EEF5FF",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
      },
      transitionDuration: {
        fast: "var(--motion-fast)",
        normal: "var(--motion-normal)",
        slow: "var(--motion-slow)",
      },
    },
  },
  plugins: [],
};

export default config;
