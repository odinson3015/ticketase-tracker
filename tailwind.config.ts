import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAF8F4",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#1A1D29",
          muted: "#5B5F73",
          faint: "#8B8FA3",
        },
        line: "#E4E1D8",
        primary: {
          DEFAULT: "#3B3FA1",
          hover: "#2F3280",
          light: "#EEEEFB",
        },
        accent: {
          DEFAULT: "#E8963C",
          light: "#FCF0DF",
        },
        success: {
          DEFAULT: "#4C8C6B",
          light: "#E7F2EC",
        },
        danger: {
          DEFAULT: "#C1543C",
          light: "#FBEAE6",
        },
      },
      fontFamily: {
        heading: ["var(--font-sora)", "sans-serif"],
        body: ["var(--font-plex)", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(26, 29, 41, 0.06), 0 1px 1px rgba(26, 29, 41, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
