/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        pitch: {
          50: '#f0faf4',
          100: '#dcf5e6',
          200: '#bce8ce',
          300: '#8fd4a8',
          500: '#2f9e5a',
          600: '#238047',
          700: '#1c6639',
          800: '#185230',
          900: '#0f2918',
        },
        wicket: {
          400: '#e8c468',
          500: '#d4a84a',
          600: '#b8892e',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 41 24 / 0.04), 0 12px 40px -12px rgb(15 41 24 / 0.12)',
        'card-hover': '0 1px 2px rgb(15 41 24 / 0.06), 0 20px 50px -16px rgb(15 41 24 / 0.18)',
      },
      keyframes: {
        'due-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        'due-blink': 'due-blink 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [forms],
};
