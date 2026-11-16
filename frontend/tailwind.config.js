/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"El Messiri"', 'Tahoma', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Neutral greys are CSS variables so the whole UI flips in dark mode (see index.css).
        slate: Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => [n, v(`slate-${n}`)])),
        surface: v('surface'),
        // Always-dark ink for overlays, toasts and badges, whatever the theme.
        ink: '#0f172a',
        brand: {
          // Mauritanian green
          50: '#effaf3', 100: '#d8f3e2', 200: '#b3e6c8', 300: '#7fd2a5', 400: '#48b77c',
          500: '#249b5e', 600: '#167d4a', 700: '#0f6a3d', 800: '#0d5532', 900: '#0b462a',
        },
        gold: { 300: '#fde68a', 400: '#fbc531', 500: '#f5b301', 600: '#d99a00' },
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { 'fade-in': 'fade-in .2s ease-out' },
    },
  },
  plugins: [],
};
