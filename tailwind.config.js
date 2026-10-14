/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#EFF5FF',
          100: '#DBE7FE',
          200: '#BFD4FE',
          300: '#93B6FD',
          400: '#608EFA',
          500: '#3B6AF6',
          600: '#2550EB',
          700: '#1D3ED8',
          800: '#1E35AF',
          900: '#1E318A',
        },
        ink: {
          50: '#F6F7F9',
          100: '#ECEEF2',
          200: '#D5DAE2',
          300: '#B1BAC8',
          400: '#8793A8',
          500: '#68758D',
          600: '#535E74',
          700: '#444D5F',
          800: '#2B3242',
          900: '#141A2A',
          950: '#0B1020',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        lift: '0 12px 32px -12px rgba(16, 24, 40, 0.18)',
        ring: '0 0 0 4px rgba(37, 80, 235, 0.12)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
