/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5f2',
          100: '#ffe9e2',
          200: '#ffcfbf',
          300: '#ffaa90',
          400: '#ff7a57',
          500: '#ff5229',
          600: '#e63c13',
          700: '#c42e0d',
          800: '#a22813',
          900: '#862516',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [],
};
