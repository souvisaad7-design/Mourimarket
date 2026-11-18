// Turns the admin's primary / secondary colours (Admin → Identity & appearance)
// into the CSS variables Tailwind's brand-* and gold-* classes read.
const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((c, i) => Math.round(c + (b[i] - c) * t));
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const VALID = /^#[0-9a-f]{6}$/i;

export function brandPalette(hex) {
  const p = hexToRgb(hex); // used as shade 700, the main button colour
  return {
    '--brand-50': mix(p, WHITE, 0.93), '--brand-100': mix(p, WHITE, 0.86), '--brand-200': mix(p, WHITE, 0.72),
    '--brand-300': mix(p, WHITE, 0.52), '--brand-400': mix(p, WHITE, 0.32), '--brand-500': mix(p, WHITE, 0.16),
    '--brand-600': mix(p, WHITE, 0.07), '--brand-700': p, '--brand-800': mix(p, BLACK, 0.18), '--brand-900': mix(p, BLACK, 0.32),
    '--brand-dark-text': mix(p, WHITE, 0.6), '--brand-dark-text-2': mix(p, WHITE, 0.42),
    '--brand-dark-bg': mix(p, BLACK, 0.55), '--brand-dark-strong': mix(p, WHITE, 0.94),
  };
}

export function accentPalette(hex) {
  const s = hexToRgb(hex); // used as shade 400, the accent buttons
  return { '--gold-300': mix(s, WHITE, 0.45), '--gold-400': s, '--gold-500': mix(s, BLACK, 0.06), '--gold-600': mix(s, BLACK, 0.15) };
}

const BRAND_KEYS = Object.keys(brandPalette('#000000'));
const ACCENT_KEYS = Object.keys(accentPalette('#000000'));

/** Apply (or clear, for '') the custom colours on <html>. */
export function applyColors({ primaryColor, secondaryColor } = {}) {
  const root = document.documentElement.style;
  const set = (vars, keys, on) => keys.forEach((k) => (on ? root.setProperty(k, vars[k].join(' ')) : root.removeProperty(k)));
  const hasP = VALID.test(primaryColor || '');
  const hasS = VALID.test(secondaryColor || '');
  set(hasP ? brandPalette(primaryColor) : {}, BRAND_KEYS, hasP);
  set(hasS ? accentPalette(secondaryColor) : {}, ACCENT_KEYS, hasS);
  const meta = document.querySelector('meta[name="theme-color"][media*="light"]');
  if (meta) meta.setAttribute('content', hasP ? primaryColor : '#0f6a3d');
}
