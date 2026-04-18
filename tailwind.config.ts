import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "var(--color-bg-base)",
          surface: "var(--color-bg-surface)",
          soft: "var(--color-bg-soft)"
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)"
        },
        accent: {
          deep: "var(--color-accent-deep)",
          gold: "var(--color-accent-gold)"
        },
        border: {
          soft: "var(--color-border-soft)",
          medium: "var(--color-border-medium)"
        },
        state: {
          success: "var(--color-state-success-soft)",
          disabledBg: "var(--color-state-disabled-bg)",
          disabledText: "var(--color-state-disabled-text)"
        }
      },
      fontFamily: {
        sans: ["Manrope", "Inter", "system-ui", "sans-serif"],
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        montserrat: ["Montserrat", "Inter", "system-ui", "sans-serif"]
      },
      borderRadius: {
        xl2: "var(--radius-surface-xl)",
        xl: "var(--radius-surface-l)",
        card: "var(--radius-card-main)",
        compact: "var(--radius-card-compact)",
        button: "var(--radius-button)"
      },
      boxShadow: {
        soft: "var(--shadow-card-soft)",
        elevated: "var(--shadow-card-elevated)",
        floating: "var(--shadow-floating)"
      },
      spacing: {
        screen: "var(--spacing-screen-x)",
        section: "var(--spacing-section-y)",
        block: "var(--spacing-block-gap)",
        card: "var(--spacing-card-padding)",
        compact: "var(--spacing-card-padding-compact)"
      }
    }
  },
  plugins: []
};

export default config;
