import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { pickLang } from '../lib/localized.js';
import { Icon } from './ui.jsx';

function Palm({ x, y, s = 1, flip = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0c2-30 1-60-4-92" fill="none" stroke="#8a6a3d" strokeWidth="6" strokeLinecap="round" />
      {[-70, -35, 0, 35, 70, 110, -110].map((a) => (
        <path key={a} transform={`translate(-4 -92) rotate(${a})`} d="M0 0c14-10 32-10 46 2-16-3-31 0-46 8z" fill="#2f8f4e" />
      ))}
    </g>
  );
}

/** Original illustration: a Mauritanian city square with an arch, palms and the national flag. */
function CityScene({ accent }) {
  return (
    <svg viewBox="0 0 600 320" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5fb3ea" /><stop offset="1" stopColor="#d7eefb" /></linearGradient>
        <linearGradient id="stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3dfb8" /><stop offset="1" stopColor="#d9bd8c" /></linearGradient>
      </defs>
      <rect width="600" height="320" fill="url(#sky)" />
      <circle cx="510" cy="60" r="30" fill="#fff3c4" opacity="0.9" />
      {[[90, 55, 1], [300, 40, 0.8], [430, 85, 0.6]].map(([x, y, s]) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity="0.9">
          <ellipse cx="0" cy="0" rx="34" ry="13" /><ellipse cx="24" cy="-8" rx="22" ry="14" /><ellipse cx="-22" cy="-4" rx="18" ry="11" />
        </g>
      ))}
      {/* distant hills and buildings */}
      <path d="M0 210c80-30 160-36 250-18s170 6 350-22v150H0z" fill="#c9b48e" opacity="0.7" />
      {[40, 110, 380, 450, 520].map((x, i) => (
        <g key={x} fill="#eadcc0" stroke="#d2bf98">
          <rect x={x} y={176 - (i % 2) * 14} width="52" height={60 + (i % 2) * 14} />
          {[0, 1, 2].map((r) => <rect key={r} x={x + 8 + r * 14} y={190 - (i % 2) * 14} width="7" height="10" fill="#b99f72" stroke="none" />)}
        </g>
      ))}
      {/* monumental arch */}
      <g>
        <rect x="205" y="120" width="190" height="130" fill="url(#stone)" />
        <path d="M200 120h200l-10-18H210z" fill="#e6cfa3" />
        <path d="M262 250v-62a38 42 0 0 1 76 0v62z" fill="#9fc6da" />
        <path d="M262 250v-62a38 42 0 0 1 76 0v62" fill="none" stroke="#c8a96f" strokeWidth="5" />
        <rect x="222" y="140" width="22" height="40" rx="11" fill="#d1b37e" />
        <rect x="356" y="140" width="22" height="40" rx="11" fill="#d1b37e" />
        <rect x="205" y="110" width="190" height="10" fill="#cfae74" />
      </g>
      {/* flag of Mauritania */}
      <g>
        <rect x="296" y="30" width="4" height="80" fill="#6b6b6b" />
        <g transform="translate(300 32)">
          <rect width="62" height="40" fill="#00a95c" />
          <rect width="62" height="6" fill="#d01c1f" />
          <rect y="34" width="62" height="6" fill="#d01c1f" />
          <path d="M19 15a12 12 0 0 0 24 0 13 10 0 0 1-24 0z" fill="#ffd700" />
          <path d="M31 9l1.6 3.5 3.8.4-2.9 2.5.9 3.7-3.4-2-3.4 2 .9-3.7-2.9-2.5 3.8-.4z" fill="#ffd700" />
        </g>
      </g>
      {/* plaza, lawn, road */}
      <path d="M0 250h600v70H0z" fill="#7cbf5a" />
      <path d="M170 320c40-40 80-62 130-70 50 8 90 30 130 70z" fill="#e9dcc2" />
      <path d="M0 300c120-14 210-12 300-6s200 4 300-8v34H0z" fill="#8a8f96" />
      <Palm x={60} y={282} s={1.1} />
      <Palm x={150} y={262} s={0.85} flip />
      <Palm x={455} y={264} s={0.9} />
      <Palm x={548} y={286} s={1.15} flip />
      {accent && (
        <g transform="translate(470 180)">
          <circle r="54" fill="#fff" opacity="0.95" />
          <circle r="54" fill="none" stroke="#fbc531" strokeWidth="5" />
          <text textAnchor="middle" dominantBaseline="central" fontSize="58">{accent}</text>
        </g>
      )}
    </svg>
  );
}

/** Faint line-art skyline (minarets, palms, arches) for the green text panel. */
function Skyline() {
  return (
    <svg viewBox="0 0 600 120" preserveAspectRatio="xMidYMax slice" className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full opacity-[0.16]" aria-hidden="true">
      <g fill="none" stroke="#fff" strokeWidth="2">
        <path d="M0 118h600" />
        <path d="M40 118V60h18v58M49 60V40m-6 0h12l-6-10z" />
        <path d="M120 118V85a20 20 0 0 1 40 0v33M130 118V95a10 10 0 0 1 20 0v23" />
        <path d="M230 118V50h14v68M237 50V28m-5 0h10l-5-9zM226 70h22M226 90h22" />
        <path d="M300 118c2-20 1-40-4-58m0 0c10-7 22-7 32 2m-32-2c-9-7-21-7-30 1m30-1c4-10 12-16 22-16m-22 16c-5-9-12-14-21-14" />
        <path d="M380 118V78h60v40M392 118V96a18 18 0 0 1 36 0v22M380 78l30-18 30 18" />
        <path d="M500 118V40h16v78M508 40V16m-6 0h12l-6-11zM496 64h24M496 92h24" />
        <path d="M560 118c2-18 1-36-3-52m0 0c9-6 19-6 28 2m-28-2c-8-6-18-6-26 1" />
      </g>
    </svg>
  );
}

const SLIDES = [
  { key: 1, to: '/products', accent: null },
  { key: 2, to: '/products?category=vehicles', accent: '🚗' },
  { key: 3, to: '/sell', accent: '📱' },
  { key: 4, to: '/products?deals=1', accent: '🏷️' },
];

export default function HeroCarousel() {
  const { t, dir, lang } = useI18n();
  // Banners the admin made (Admin → Banners, table `banners`) replace the built-in slides.
  const custom = useSettings().banners || [];
  const slides = custom.length
    ? custom.map((s) => ({ key: `b${s.id}`, to: s.link || '/products', image: s.image_url, title: pickLang(s.title, lang), text: pickLang(s.subtitle, lang), cta: pickLang(s.cta, lang) }))
    : SLIDES.map((s) => ({ ...s, title: t(`hero.s${s.key}title`), text: t(`hero.s${s.key}text`), cta: t(`hero.s${s.key}cta`) }));
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const count = slides.length;
  useEffect(() => { if (index >= count) setIndex(0); }, [count, index]);
  const go = useCallback((i) => setIndex((i + count) % count), [count]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const id = setInterval(() => { if (!paused.current && !document.hidden) setIndex((i) => (i + 1) % count); }, 6500);
    return () => clearInterval(id);
  }, [count]);

  // Swipe between slides on touch screens.
  const touchX = useRef(null);
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; paused.current = true; };
  const onTouchEnd = (e) => {
    paused.current = false;
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 40) return;
    // In RTL, swiping right shows the next slide.
    const forward = dir === 'rtl' ? dx > 0 : dx < 0;
    go(index + (forward ? 1 : -1));
  };

  const slide = slides[index] || slides[0];
  const external = /^https?:/i.test(slide.to);
  // In RTL the "next" arrow sits on the left.
  const prevSide = dir === 'rtl' ? 'right-3' : 'left-3';
  const nextSide = dir === 'rtl' ? 'left-3' : 'right-3';

  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-brand-800 shadow-sm"
      aria-roledescription="carousel" aria-label={t('hero.label')}
      onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }}
      onFocus={() => { paused.current = true; }} onBlur={() => { paused.current = false; }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
    >
      <div className="grid min-h-[132px] sm:min-h-[230px] md:min-h-[260px] md:grid-cols-[1.05fr_1fr]">
        {/* Text panel (first = right side in Arabic) */}
        <div key={`t-${slide.key}`} className="relative flex animate-fade-in flex-col items-start justify-center gap-1.5 overflow-hidden bg-gradient-to-bl from-brand-700 via-brand-800 to-brand-900 px-5 pb-7 pt-3.5 text-start text-white sm:gap-3 sm:px-14 sm:pb-12 sm:pt-8 md:px-16">
          {/* phones: the slide photo behind the text */}
          {slide.image && <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 md:hidden" />}
          <Skyline />
          {slide.title && <h1 className="relative text-lg font-bold leading-snug text-white sm:text-[1.75rem] xl:text-[2rem]">{slide.title}</h1>}
          {slide.text && <p className="relative text-[13px] leading-snug text-white/85 sm:text-lg">{slide.text}</p>}
          {slide.cta && (
            <div className="relative mt-1 sm:mt-2">
              {external ? (
                <a href={slide.to} target="_blank" rel="noreferrer" className="btn-accent rounded-full px-4 py-2 text-sm shadow-lg sm:px-7 sm:py-3 sm:text-base">{slide.cta}<Icon name="arrow" className="h-5 w-5 ltr:rotate-180" /></a>
              ) : (
                <Link to={slide.to} className="btn-accent rounded-full px-4 py-2 text-sm shadow-lg sm:px-7 sm:py-3 sm:text-base">
                  {slide.cta}<Icon name="arrow" className="h-5 w-5 ltr:rotate-180" />
                </Link>
              )}
            </div>
          )}
        </div>
        {/* Illustration (left side in Arabic) */}
        <div className="relative hidden md:block">
          <div key={`i-${slide.key}`} className="absolute inset-0 animate-fade-in">
            {slide.image ? <img src={slide.image} alt="" className="h-full w-full object-cover" /> : <CityScene accent={slide.accent} />}
          </div>
          {/* gold + white curved divider between the panels */}
          <svg viewBox="0 0 60 330" preserveAspectRatio="none" className="absolute inset-y-0 start-0 h-full w-14 ltr:-scale-x-100" aria-hidden="true">
            <path d="M60 0H0v330h60C18 250 18 80 60 0z" style={{ fill: 'rgb(var(--brand-800))' }} />
            <path d="M60 0C18 80 18 250 60 330" fill="none" style={{ stroke: 'rgb(var(--gold-400))' }} strokeWidth="7" />
            <path d="M52 0C12 80 12 250 52 330" fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
          </svg>
          <span className="absolute bottom-4 end-4 flex items-center gap-1.5 rounded-full bg-brand-800/90 px-3 py-1.5 text-sm font-semibold text-white shadow">
            <Icon name="pin" className="h-4 w-4" />{t('hero.country')}
          </span>
        </div>
      </div>

      {count > 1 && <>
      <button type="button" onClick={() => go(index - 1)} aria-label={t('common.previous')}
        className={`absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 text-ink shadow-md transition hover:scale-105 sm:block ${prevSide}`}>
        <Icon name={dir === 'rtl' ? 'chevron' : 'chevronLeft'} className="h-5 w-5" />
      </button>
      <button type="button" onClick={() => go(index + 1)} aria-label={t('common.next')}
        className={`absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 text-ink shadow-md transition hover:scale-105 sm:block ${nextSide}`}>
        <Icon name={dir === 'rtl' ? 'chevronLeft' : 'chevron'} className="h-5 w-5" />
      </button>
      <div className="absolute inset-x-0 bottom-2.5 z-10 flex justify-center gap-2 sm:bottom-4" dir="ltr">
        {slides.map((s, i) => (
          <button key={s.key} type="button" onClick={() => go(i)} aria-label={`${i + 1} / ${count}`} aria-current={i === index}
            className={`h-2 rounded-full transition-all sm:h-2.5 ${i === index ? 'w-6 bg-gold-400 sm:w-7' : 'w-2 bg-white/50 hover:bg-white/80 sm:w-2.5'}`} />
        ))}
      </div>
      </>}
    </section>
  );
}
