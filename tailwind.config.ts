import type { Config } from "tailwindcss";

/**
 * Colours are defined once as CSS variables in globals.css (light + dark),
 * so the same utility class (e.g. `bg-surface`) works in both themes.
 */
const token = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: token("--c-bg"),
        surface: token("--c-surface"),
        subtle: token("--c-subtle"),
        hover: token("--c-hover"),
        chip: token("--c-chip"),
        line: token("--c-line"),
        ink: {
          DEFAULT: token("--c-ink"),
          muted: token("--c-ink-muted"),
          faint: token("--c-ink-faint"),
        },
        primary: {
          DEFAULT: token("--c-primary"),
          hover: token("--c-primary-hover"),
          fg: token("--c-primary-fg"),
          ink: token("--c-primary-ink"),
          light: token("--c-primary-light"),
        },
        accent: {
          DEFAULT: token("--c-accent"),
          light: token("--c-accent-light"),
        },
        success: {
          DEFAULT: token("--c-success"),
          light: token("--c-success-light"),
        },
        danger: {
          DEFAULT: token("--c-danger"),
          light: token("--c-danger-light"),
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "4px",
        panel: "6px",
      },
      boxShadow: {
        card: "none",
        panel: "-8px 0 24px rgba(0, 0, 0, 0.08)",
        pop: "0 4px 12px rgba(0, 0, 0, 0.08)",
      },
      transitionDuration: {
        DEFAULT: "120ms",
      },
    },
  },
  plugins: [],
};

export default config;
