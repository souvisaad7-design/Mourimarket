import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext.jsx';
import { useI18n } from '../i18n/index.jsx';

const ICONS = {
  search: 'M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z',
  heart: 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.2 4.2 2.4h2c.6-1.2 2.1-2.4 4.2-2.4 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z',
  chat: 'M7 8h10M7 12h6m-9 8l3.5-3H19a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h0v3z',
  bell: 'M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM4 21a8 8 0 0 1 16 0',
  plus: 'M12 5v14M5 12h14',
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  clock: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  flag: 'M4 21V4m0 0h13l-2 4 2 4H4',
  menu: 'M4 6h16M4 12h16M4 18h16',
  x: 'M6 6l12 12M18 6L6 18',
  store: 'M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  edit: 'M4 20h4L19 9l-4-4L4 16v4z',
  trash: 'M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3',
  check: 'M5 13l4 4L19 7',
  logout: 'M15 17l5-5-5-5m5 5H9m4 9H5V3h8',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
  image: 'M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9.5a1 1 0 1 0 0-.01',
  send: 'M4 12l16-8-6 16-2.5-6.5L4 12z',
  filter: 'M4 5h16l-6 8v6l-4-2v-4L4 5z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c2.5-2.5 3.5-5.5 3.5-9S14.5 5.5 12 3m0 18c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3M3.5 9h17M3.5 15h17',
  chevron: 'M9 6l6 6-6 6',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z',
  share: 'M8.7 13.3l6.6 3.4m0-9.4l-6.6 3.4M21 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  sun: 'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10l1.4 1.4m0-12.8L17 7m-10 10l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
  auto: 'M12 3a9 9 0 1 0 0 18V3z M12 3a9 9 0 1 1 0 18',
  download: 'M12 4v11m0 0l-4-4m4 4l4-4M5 20h14',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronDown: 'M6 9l6 6 6-6',
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-10v5m0-8h.01',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm-2.5-11.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6m0 3h.01',
  mail: 'M3 6h18v12H3zm0 0l9 7 9-7',
  userPlus: 'M15 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM3 21a8 8 0 0 1 12.5-6.6M19 14v6m-3-3h6',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 10a7 7 0 0 1 14 0m1-10a3 3 0 1 0 0-6m2 16h3a6 6 0 0 0-4-5.6',
  rocket: 'M5 15c-1 1-2 4-2 6 2 0 5-1 6-2m-4-4l4 4m-4-4c1-4 5-11 14-12-1 9-8 13-12 14m3-8a1.5 1.5 0 1 0 0-.01',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  handshake: 'M8 12l3 3a2 2 0 0 0 3-3l-3-3 2-2 6 6-6 6-2-2M2 12l6-6 3 3',
  arrow: 'M19 12H5m6-6l-6 6 6 6',
};

export function Icon({ name, className = 'h-5 w-5', filled = false }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

/** Blue tick shown next to sellers verified by an admin. */
export function VerifiedBadge({ small = false, label }) {
  const { t } = useI18n();
  const size = small ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <span className="inline-flex items-center gap-1 text-sky-600" title={t('product.verifiedHint')}>
      <svg viewBox="0 0 24 24" className={`${size} shrink-0`} aria-label={t('common.verified')} role="img">
        <path fill="currentColor" d="M12 2l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 22l-2.4-1.8-3 .2-.9-2.9L3.2 15.8l1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2z" />
        <path d="M8 12.2l2.6 2.6L16.2 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label && <span className="text-xs font-semibold">{t('common.verified')}</span>}
    </span>
  );
}

/**
 * Brand mark: the Souk Chinguetti bag with its Moorish door (line art from the official logo).
 * Gold on the dark-green header and in dark mode, green on light backgrounds.
 */
export function LogoMark({ className = 'h-10 w-10', onDark = false }) {
  const img = (src, extra = '') => <img src={src} alt="" aria-hidden="true" draggable="false" className={`mm-logo shrink-0 object-contain ${extra} ${className}`} />;
  if (onDark) return img('/logo-mark.png');
  return <>{img('/logo-mark-green.png', 'mm-logo-light')}{img('/logo-mark.png', 'mm-logo-dark')}</>;
}

/** The site's mark: the admin's uploaded logo, or the built-in bag. */
export function SiteMark({ className = 'h-10 w-10', onDark = false }) {
  const { logoUrl } = useSettings().settings.appearance || {};
  return logoUrl ? <img src={logoUrl} alt="" className={`shrink-0 object-contain ${className}`} /> : <LogoMark className={className} onDark={onDark} />;
}

export function Logo({ className = '', size = 'md', onDark = false }) {
  const big = size === 'lg';
  const { t, siteName, lang } = useI18n();
  const name = useSettings().settings.appearance?.siteName;
  return (
    <Link to="/" className={`flex min-w-0 items-center gap-1.5 sm:gap-2 ${className}`} aria-label={siteName}>
      <SiteMark className={big ? 'h-10 w-10 sm:h-12 sm:w-12' : 'h-10 w-10'} onDark={onDark} />
      {name ? (
        <span className={`${big ? 'text-base min-[360px]:text-lg min-[400px]:text-xl sm:text-2xl' : 'text-xl'} min-w-0 truncate font-bold tracking-tight sm:max-w-none ${onDark ? 'text-gold-400' : 'text-brand-800 dark-brand-text'}`}>{name}</span>
      ) : (
        <span className={`${big ? 'text-base min-[360px]:text-lg min-[400px]:text-xl sm:text-2xl' : 'text-xl'} min-w-0 truncate whitespace-nowrap font-bold ${lang === 'ar' ? '' : 'tracking-tight'}`}>
          <span className={onDark ? 'text-gold-400' : 'text-brand-900 dark-brand-text'}>{t('brand.nameA')}</span>{' '}
          <span className={onDark ? 'text-gold-400' : 'text-brand-600'}>{t('brand.nameB')}</span>
        </span>
      )}
    </Link>
  );
}

export function Spinner({ className = '' }) {
  return (
    <div className={`flex justify-center py-12 ${className}`} role="status">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
    </div>
  );
}

export function EmptyState({ icon = 'grid', title, children }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="rounded-full bg-brand-50 p-4 text-brand-700"><Icon name={icon} className="h-8 w-8" /></div>
      <p className="max-w-md text-slate-600">{title}</p>
      {children}
    </div>
  );
}

export function ErrorBox({ error }) {
  const { t } = useI18n();
  if (!error) return null;
  const msg = t(`errors.${error.code}`);
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
      {msg.startsWith('errors.') ? t('common.error') : msg}
      {error.code === 'phone_unverified' && <> <Link to="/verify-phone" state={{ from: typeof window !== 'undefined' ? window.location.pathname : '/' }} className="font-bold underline">{t('phone.verifyNow')}</Link></>}
    </div>
  );
}

/** Translate a field error code returned by the API. */
export function useFieldError(error) {
  const { t } = useI18n();
  return (name) => {
    const code = error?.fields?.[name];
    if (!code) return null;
    const msg = t(`fields.${code}`);
    return msg.startsWith('fields.') ? t('fields.required') : msg;
  };
}

export function Field({ label, error, hint, children, optional }) {
  const { t } = useI18n();
  return (
    <label className="block">
      {label && (
        <span className="label">
          {label} {optional && <span className="font-normal text-slate-400">({t('common.optional')})</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}

/** Mauritanian phone number input: fixed +222 prefix, 8 digits. */
export function PhoneInput({ value, onChange, id, autoComplete = 'tel-national', ...rest }) {
  return (
    <div dir="ltr" className="flex overflow-hidden rounded-xl border border-slate-300 bg-surface focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/20">
      <span className="flex select-none items-center gap-1.5 border-e border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600">
        <svg viewBox="0 0 30 20" className="h-3.5 w-5 rounded-sm" aria-hidden="true">
          <rect width="30" height="20" fill="#00a95c" /><rect width="30" height="3" fill="#d01c1f" /><rect y="17" width="30" height="3" fill="#d01c1f" />
          <path d="M9 8a6 6 0 0 0 12 0 6.5 5 0 0 1-12 0z" fill="#ffd700" /><circle cx="15" cy="6" r="1.6" fill="#ffd700" />
        </svg>
        +222
      </span>
      <input id={id} type="tel" inputMode="tel" autoComplete={autoComplete} placeholder="36 00 00 00" maxLength={16}
        className="w-full bg-transparent px-3 py-2.5 text-sm tracking-wide text-slate-900 placeholder:text-slate-400 focus:outline-none"
        value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </div>
  );
}

export function CitySelect({ value, onChange, cities, placeholder, ...rest }) {
  const { lang } = useI18n();
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
      <option value="">{placeholder}</option>
      {cities.map((c) => <option key={c.key} value={c.key}>{c[lang]}</option>)}
    </select>
  );
}

export function useCityName() {
  const { lang } = useI18n();
  return (cities, key) => cities.find((c) => c.key === key)?.[lang] || key || '';
}

export function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`card max-h-[92vh] w-full overflow-y-auto p-5 ${size === 'lg' ? 'max-w-2xl' : 'max-w-md'}`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button className="btn-ghost p-1.5" onClick={onClose} aria-label="close"><Icon name="x" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Stars({ value = 0, size = 'h-4 w-4', onChange }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-gold-500" dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => {
        const star = <Icon name="star" filled={n <= Math.round(value)} className={`${size} ${n <= Math.round(value) ? '' : 'text-slate-300'}`} />;
        return onChange ? (
          <button type="button" key={n} onClick={() => onChange(n)} aria-label={`${n}`} className="p-0.5">{star}</button>
        ) : <span key={n}>{star}</span>;
      })}
    </span>
  );
}

export function Pagination({ page, total, limit, onPage }) {
  const { t } = useI18n();
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <button className="btn-outline" disabled={page <= 1} onClick={() => onPage(page - 1)}>{t('common.previous')}</button>
      <span className="text-sm text-slate-600">{t('common.page', { p: page, n: pages })}</span>
      <button className="btn-outline" disabled={page >= pages} onClick={() => onPage(page + 1)}>{t('common.next')}</button>
    </div>
  );
}

export function StatusBadge({ status }) {
  const { t } = useI18n();
  const styles = { pending: 'bg-amber-100 text-amber-800', approved: 'bg-emerald-100 text-emerald-800', rejected: 'bg-rose-100 text-rose-700' };
  return <span className={`badge ${styles[status]}`}>{t(`dashboard.status.${status}`)}</span>;
}

export function Avatar({ name, url, size = 'h-11 w-11' }) {
  if (url) return <img src={url} alt="" className={`${size} shrink-0 rounded-full object-cover`} />;
  return (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-800`}>
      {(name || '?').trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function PageHeader({ title, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </div>
  );
}

/** A plain smartphone the size of an emoji (the 📱 emoji draws a crowded grid of apps). */
function PhoneGlyph() {
  return (
    <svg viewBox="0 0 64 64" className="inline-block h-[1em] w-[1em] align-[-0.125em]" aria-hidden="true">
      <defs>
        <linearGradient id="mm-phone-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7cc4e8" />
          <stop offset="1" stopColor="#2f6fb0" />
        </linearGradient>
      </defs>
      <rect x="15" y="3" width="34" height="58" rx="8" fill="#2b3340" />
      <rect x="15.8" y="3.8" width="32.4" height="56.4" rx="7.4" fill="none" stroke="#5b6573" strokeWidth="1.6" />
      <rect x="19" y="9" width="26" height="45" rx="3.5" fill="url(#mm-phone-screen)" />
      <path d="M19 30 L45 16 L45 22 L19 38 Z" fill="#fff" opacity="0.18" />
      <rect x="27" y="5.6" width="10" height="2" rx="1" fill="#11161d" />
      <rect x="27.5" y="56.5" width="9" height="1.6" rx="0.8" fill="#9aa3ae" />
    </svg>
  );
}

const SIMPLE_ICONS = { '📱': PhoneGlyph, '📲': PhoneGlyph };

/** A category's icon (an emoji chosen by the admin), with a cleaner drawing where the emoji is too busy. */
export function CategoryIcon({ icon }) {
  const Simple = SIMPLE_ICONS[(icon || '').replace(/\uFE0F/g, '')];
  return Simple ? <Simple /> : icon || null;
}

/** "= 11.5 مليون أوقية قديمة" under a price: many people still count in old ouguiya. */
export function OldPrice({ value, className = '' }) {
  const { t, oldMoney } = useI18n();
  if (!Number(value)) return null;
  return <p className={`text-xs text-slate-500 ${className}`} title={t('ouguiya.hint')}>≈ {oldMoney(value)}</p>;
}
