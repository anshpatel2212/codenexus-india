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
        brand: {
          primary: "#416F89",
          navy: "#20364A",
          light: "#D5E3EC",
          highlight: "#F4D77B",
        },
        navy: {
          DEFAULT: "#20364A",
          light: "#31566D",
          dark: "#172B3D",
        },
        primary: {
          DEFAULT: "#416F89",
          dark: "#315C74",
          light: "#5A8BA7",
          50: "#F0F5F8",
          100: "#DCE7ED",
          200: "#B9D0DC",
          300: "#8FB3C6",
          400: "#6795AE",
          500: "#416F89",
          600: "#315C74",
          700: "#27485B",
          800: "#20364A",
          900: "#172B3D",
        },
        yellow: {
          DEFAULT: "#F4D77B",
          accent: "#F4D77B",
          light: "#FCF5DC",
          dark: "#D1AF47",
        },
        bg: {
          DEFAULT: "#EDF3F6",
          soft: "#D5E3EC",
        },
        text: {
          DEFAULT: "#263B4D",
          primary: "#20364A",
          muted: "#4F6576",
          subtle: "#5A7182",
          light: "#D5E3EC",
          "light-muted": "#B9CDDC",
        },
        line: {
          DEFAULT: "rgba(196,213,224,.75)",
          solid: "#C4D5E0",
        },
        status: {
          success: "#1F7560",
          warning: "#9A682D",
          danger: "#A94842",
        },
      },
      fontFamily: {
        sans: ["'DM Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        heading: ["'DM Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        theme: "12px",
        card: "12px",
        control: "8px",
        pill: "9999px",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(32,54,74,.04), 0 4px 14px rgba(32,54,74,.05)",
        card: "0 2px 6px rgba(32,54,74,.04), 0 12px 32px rgba(32,54,74,.06)",
        elevated: "0 20px 50px rgba(32,54,74,.14)",
        dropdown: "0 18px 45px rgba(32,54,74,.14)",
        focus: "0 0 0 3px rgba(65,111,137,.25)",
      },
      transitionDuration: {
        DEFAULT: "180ms",
      },
    },
  },
  plugins: [],
};

export default config;
