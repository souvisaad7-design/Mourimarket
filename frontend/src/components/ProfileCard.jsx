import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { Icon, LogoMark, VerifiedBadge, useCityName } from './ui.jsx';

const ROLE_STYLE = {
  buyer: 'bg-[#e0f2fe] text-[#075985]',
  individual: 'bg-white text-[#0d5532]',
  merchant: 'bg-gold-400 text-ink',
};

// SC = Souk Chinguetti
export const memberId = (id) => `SC-${String(id).padStart(6, '0')}`;

/** Formats +22236000001 as +222 36 00 00 01 for display. */
export function formatPhone(phone) {
  const m = /^\+222(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(phone || '');
  return m ? `+222 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : phone || '';
}

function QR({ value }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    let alive = true;
    QRCode.toString(value, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#0b462a', light: '#ffffff' } })
      .then((s) => { if (alive) setSvg(s); })
      .catch(() => setSvg(''));
    return () => { alive = false; };
  }, [value]);
  // The SVG string comes from the qrcode library, not from user input.
  return <div className="h-full w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}

/**
 * Member card ("بطاقة شخصية"): an ID-card style summary of an account with a QR code
 * that opens the public profile. `user` is /auth/me (own card) or /users/:id (public card).
 */
export default function ProfileCard({ user, showPhone = true, actions = true }) {
  const { t, date, number, siteName } = useI18n();
  const { meta, notify } = useApp();
  const cityName = useCityName();
  const type = user.account_type || 'individual';
  const isSeller = type !== 'buyer';
  const url = `${window.location.origin}/users/${user.id}`;

  const share = async () => {
    const text = t('card.shareText', { name: user.name });
    if (navigator.share) {
      try { await navigator.share({ title: user.name, text, url }); return; } catch { return; }
    }
    try { await navigator.clipboard.writeText(url); notify(t('product.linkCopied')); } catch { /* ignore */ }
  };

  const stats = isSeller
    ? [['live', user.live_count ?? user.products_count], ['sold', user.sold_count], ['rating', user.reviews_count > 0 ? `★ ${user.rating}` : '—']]
    : [['favorites', user.favorites_count]];

  return (
    <div>
      <article
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-5 text-white shadow-xl sm:p-6"
        aria-label={t('card.title')}
      >
        {/* decorative pattern */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
          <defs><pattern id="card-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="#fff" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#card-dots)" />
        </svg>
        <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-gold-400/20 blur-2xl" />

        <header className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <LogoMark className="h-9 w-9" onDark />
            <span className="truncate text-lg font-bold text-gold-400">{siteName}</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-white/70">{t('card.title')}</span>
        </header>

        <div className="relative mt-5 flex items-start gap-4">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-4 ring-white/25 sm:h-24 sm:w-24" />
          ) : (
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl font-bold ring-4 ring-white/25 sm:h-24 sm:w-24">
              {(user.name || '?').trim().charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-1.5 truncate text-xl font-bold text-white sm:text-2xl">
              <span className="truncate">{user.name}</span>
              {user.is_verified && <span className="rounded-full bg-white p-0.5"><VerifiedBadge /></span>}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className={`badge ${ROLE_STYLE[type]}`}>{t(`roles.${type}`)}</span>
              {user.is_verified && <span className="badge bg-sky-500 text-white">{t('common.verified')}</span>}
              {(user.phone_verified || user.phone_verified_at) && <span className="badge bg-emerald-500 text-white">📱 {t('phone.badge')}</span>}
            </div>
            <dl className="mt-3 space-y-1 text-sm text-white/85">
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">{t('card.memberId')}</dt>
                <Icon name="shield" className="h-4 w-4 shrink-0 text-white/60" />
                <dd className="font-mono tracking-wide" dir="ltr">{memberId(user.id)}</dd>
              </div>
              {showPhone && user.phone && (
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">{t('auth.phone')}</dt>
                  <Icon name="phone" className="h-4 w-4 shrink-0 text-white/60" />
                  <dd dir="ltr">{formatPhone(user.phone)}</dd>
                </div>
              )}
              {user.city && (
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">{t('form.city')}</dt>
                  <Icon name="pin" className="h-4 w-4 shrink-0 text-white/60" />
                  <dd>{cityName(meta.cities, user.city)}</dd>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">{t('card.since')}</dt>
                <Icon name="clock" className="h-4 w-4 shrink-0 text-white/60" />
                <dd>{t('common.since', { d: date(user.created_at) })}</dd>
              </div>
            </dl>
          </div>
          <figure className="hidden shrink-0 flex-col items-center gap-1 sm:flex">
            <div className="h-24 w-24 rounded-xl bg-white p-1.5"><QR value={url} /></div>
            <figcaption className="text-[10px] text-white/70">{t('card.scan')}</figcaption>
          </figure>
        </div>

        <footer className={`relative mt-5 grid gap-2 border-t border-white/15 pt-4 ${stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {stats.map(([k, v]) => (
            <div key={k} className="text-center">
              <p className="text-lg font-bold text-gold-400 ltr-nums">{typeof v === 'number' ? number(v) : (v ?? 0)}</p>
              <p className="text-[11px] text-white/70">{t(`card.${k}`)}</p>
            </div>
          ))}
          {!isSeller && <div className="flex items-center justify-center sm:hidden"><div className="h-14 w-14 rounded-lg bg-white p-1"><QR value={url} /></div></div>}
        </footer>
        {isSeller && <div className="relative mt-3 flex justify-center sm:hidden"><div className="h-20 w-20 rounded-xl bg-white p-1.5"><QR value={url} /></div></div>}
      </article>

      {actions && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={share} className="btn-primary rounded-full"><Icon name="share" className="h-4 w-4" />{t('card.share')}</button>
          <a href={url} className="btn-outline rounded-full"><Icon name="eye" className="h-4 w-4" />{t('card.viewPublic')}</a>
        </div>
      )}
    </div>
  );
}
