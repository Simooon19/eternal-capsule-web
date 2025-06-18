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
        granite: {
          900: '#2D2D2D',
          100: '#E6E6E6',
        },
        copper: {
          500: '#CC7A3E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontFamily: 'Playfair Display',
              fontWeight: '700',
              fontSize: '48px',
              lineHeight: '56px',
            },
            body: {
              fontFamily: 'Inter',
              fontWeight: '400',
              fontSize: '18px',
              lineHeight: '28px',
            },
            caption: {
              fontFamily: 'Inter',
              fontWeight: '300',
              fontSize: '14px',
              lineHeight: '20px',
            },
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;