/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'granite': {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
          950: '#1a1d20',
        },
        'copper': {
          50: '#fff8f1',
          100: '#feecdc',
          200: '#fcd9bd',
          300: '#f9c39d',
          400: '#f7a97e',
          500: '#f48c5f',
          600: '#f26f40',
          700: '#f05221',
          800: '#ee3502',
          900: '#cc2d02',
          950: '#aa2502',
        },
      },
    },
  },
  plugins: [],
}; 