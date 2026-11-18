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
        // Primary and secondary colours are CSS variables too, so the admin can change them
        // (Admin → Identity & appearance). Defaults: Mauritanian green and gold (index.css).
        brand: Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => [n, v(`brand-${n}`)])),
        gold: Object.fromEntries([300, 400, 500, 600].map((n) => [n, v(`gold-${n}`)])),
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { 'fade-in': 'fade-in .2s ease-out' },
    },
  },
  plugins: [],
};
