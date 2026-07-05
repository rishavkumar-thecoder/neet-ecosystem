// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0EA5E9',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#10B981',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        background: '#09090B',
        foreground: '#FAFAFA',
      },
    },
  },
  plugins: [],
};

export default config;