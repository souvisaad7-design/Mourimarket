// "📲 WhatsApp status": turns a listing into a ready-to-post status image (1080×1920) with the photo,
// title, price (new and old ouguiya), city and a QR code that opens the listing. Drawn in the browser
// with <canvas>: no server, no cost. Visits from the QR / link are counted as coming from WhatsApp.
import { useState } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { taggedUrl } from '../lib/viewSource.js';
import { Modal, useCityName } from './ui.jsx';

const W = 1080;
const H = 1920;
const GREEN = '#213c35';
const GOLD = '#d4af6a';

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Split text into lines that fit `width`, at most `max` lines (the last one ends with …). */
function wrap(ctx, text, width, max) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > width && line) { lines.push(line); line = w; } else line = next;
  }
  if (line) lines.push(line);
  if (lines.length > max) { lines.length = max; lines[max - 1] = `${lines[max - 1].replace(/\s+\S*$/, '')} …`; }
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

async function draw({ product, url, t, price, oldMoney, city, siteName, dir }) {
  await Promise.all(['700 80px "El Messiri"', '500 44px "El Messiri"'].map((f) => document.fonts?.load(f).catch(() => null)));
  const font = (size, weight = 700) => `${weight} ${size}px "El Messiri", "Segoe UI", Tahoma, sans-serif`;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.direction = dir;
  ctx.textAlign = 'center';

  // Background: the site's green with a soft gold glow.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, GREEN); bg.addColorStop(1, '#0f2620');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 520, 50, W / 2, 520, 700);
  glow.addColorStop(0, 'rgba(212,175,106,0.25)'); glow.addColorStop(1, 'rgba(212,175,106,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  // Header: logo + site name.
  const [logo, photo] = await Promise.all([loadImage('/logo-mark.png'), loadImage(product.images?.[0]?.url)]);
  if (logo) ctx.drawImage(logo, W / 2 - 60, 70, 120, 120);
  ctx.fillStyle = GOLD; ctx.font = font(64); ctx.fillText(siteName, W / 2, 260);

  // Photo, cropped to fill a rounded square.
  const ps = 760; const px = (W - ps) / 2; const py = 310;
  ctx.save(); roundRect(ctx, px, py, ps, ps, 48); ctx.clip();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(px, py, ps, ps);
  if (photo) {
    const s = Math.max(ps / photo.width, ps / photo.height);
    const w = photo.width * s; const h = photo.height * s;
    ctx.drawImage(photo, px + (ps - w) / 2, py + (ps - h) / 2, w, h);
  }
  ctx.restore();
  if (product.availability === 'sold') {
    ctx.fillStyle = 'rgba(190,18,60,0.9)'; roundRect(ctx, px + 30, py + 30, 300, 90, 45); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = font(48); ctx.fillText(t('common.sold'), px + 180, py + 92);
  }

  // Title, price, old price, city.
  let y = py + ps + 100;
  ctx.fillStyle = '#ffffff'; ctx.font = font(60);
  for (const line of wrap(ctx, product.title, W - 160, 2)) { ctx.fillText(line, W / 2, y); y += 78; }
  y += 30;
  ctx.fillStyle = GOLD; ctx.font = font(104);
  ctx.save(); ctx.direction = 'ltr'; ctx.fillText(price(product.price), W / 2, y); ctx.restore();
  y += 70;
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = font(44, 500);
  ctx.fillText(`≈ ${oldMoney(product.price)}`, W / 2, y);
  y += 70;
  if (city) { ctx.fillText(`📍 ${city}`, W / 2, y); }

  // QR code that opens the listing, in a white card.
  const qr = document.createElement('canvas');
  await QRCode.toCanvas(qr, url, { width: 260, margin: 1, errorCorrectionLevel: 'M', color: { dark: GREEN, light: '#ffffff' } });
  const qy = H - 380;
  ctx.fillStyle = '#ffffff'; roundRect(ctx, W / 2 - 160, qy, 320, 320, 32); ctx.fill();
  ctx.drawImage(qr, W / 2 - 130, qy + 30, 260, 260);
  ctx.fillStyle = '#ffffff'; ctx.font = font(40, 500);
  ctx.fillText(t('status.scan'), W / 2, H - 22);
  return canvas;
}

export default function StatusImageButton({ product, className = '' }) {
  const { t, price, oldMoney, siteName, dir } = useI18n();
  const cityName = useCityName();
  const { meta } = useApp();
  const [open, setOpen] = useState(false);
  const [img, setImg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const make = async () => {
    setOpen(true); setBusy(true); setError(false); setImg(null);
    try {
      const url = taggedUrl(`${window.location.origin}/products/${product.id}`, 'wa');
      const canvas = await draw({ product, url, t, price, oldMoney, city: cityName(meta.cities || [], product.city), siteName, dir });
      const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.88));
      setImg({ blob, src: URL.createObjectURL(blob) });
    } catch (err) { console.error('status image', err); setError(true); } finally { setBusy(false); }
  };
  const file = () => new File([img.blob], `souk-chinguetti-${product.id}.jpg`, { type: 'image/jpeg' });
  const canShareFile = typeof navigator !== 'undefined' && navigator.canShare && img && navigator.canShare({ files: [file()] });
  const share = async () => { try { await navigator.share({ files: [file()], title: product.title }); } catch { /* cancelled */ } };
  const close = () => { if (img) URL.revokeObjectURL(img.src); setImg(null); setOpen(false); };

  return (
    <>
      <button type="button" onClick={make} className={`btn bg-[#128C7E] px-3 py-1.5 text-xs text-white hover:brightness-95 ${className}`}>📲 {t('status.button')}</button>
      <Modal open={open} onClose={close} title={t('status.title')}>
        <div className="space-y-3 text-center">
          {busy && <p className="py-10 text-sm text-slate-500">{t('status.making')}</p>}
          {error && <p className="text-sm text-rose-600">{t('common.error')}</p>}
          {img && (
            <>
              <img src={img.src} alt={product.title} className="mx-auto max-h-[60vh] rounded-xl shadow" />
              <p className="text-xs text-slate-500">{t('status.hint')}</p>
              <div className="flex gap-2">
                {canShareFile && <button type="button" onClick={share} className="btn flex-1 bg-[#25D366] text-white">{t('status.share')}</button>}
                <a href={img.src} download={`souk-chinguetti-${product.id}.jpg`} className="btn-outline flex-1">{t('status.download')}</a>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
