import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setCurrentSiteName, useSettings } from '../context/SettingsContext.jsx';
import { LANGS, messages } from './messages.js';

const I18nContext = createContext(null);

function readStoredLang() {
  try {
    const v = localStorage.getItem('mm_lang');
    if (v && messages[v]) return v;
  } catch { /* storage unavailable */ }
  return 'ar';
}

function lookup(dict, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict);
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang);
  // Texts the admin changed from the panel take precedence over the built-in ones.
  const { settings } = useSettings();
  const overrides = settings.texts;
  // The site's name: the admin's (Admin → Identity & appearance) or the default for this language.
  const siteName = settings.appearance?.siteName || lookup(messages[lang], 'brand.name') || lookup(messages.ar, 'brand.name');
  useEffect(() => { setCurrentSiteName(siteName); }, [siteName]);
  const meta = LANGS.find((l) => l.code === lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
  }, [lang, meta.dir]);

  const setLang = useCallback((code) => {
    setLangState(code);
    try { localStorage.setItem('mm_lang', code); } catch { /* ignore */ }
  }, []);

  const t = useCallback(
    (key, vars) => {
      const own = overrides?.[lang]?.[key];
      let s = (own || undefined) ?? lookup(messages[lang], key) ?? (overrides?.ar?.[key] || undefined) ?? lookup(messages.ar, key) ?? key;
      if (typeof s !== 'string') return s;
      if (s.includes('{site}')) s = s.replaceAll('{site}', siteName);
      if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
      return s;
    },
    [lang, overrides, siteName],
  );

  const value = useMemo(() => {
    const priceFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
    const nf = new Intl.NumberFormat(meta.locale === 'ar-MR' ? 'ar-MR-u-nu-latn' : meta.locale);
    const df = new Intl.DateTimeFormat(meta.locale === 'ar-MR' ? 'ar-MR-u-nu-latn' : meta.locale, { dateStyle: 'medium' });
    const dtf = new Intl.DateTimeFormat(meta.locale === 'ar-MR' ? 'ar-MR-u-nu-latn' : meta.locale, { dateStyle: 'short', timeStyle: 'short' });
    const rtf = new Intl.RelativeTimeFormat(meta.locale === 'ar-MR' ? 'ar-u-nu-latn' : meta.locale, { numeric: 'auto' });
    return {
      lang,
      siteName,
      dir: meta.dir,
      setLang,
      t,
      /** Localised field of an API row: name_ar / name_fr / name_en */
      tl: (row, field = 'name') => row?.[`${field}_${lang}`] ?? row?.[`${field}_ar`] ?? '',
      price: (n) => `${(lang === 'fr' ? nf : priceFmt).format(Number(n))} MRU`,
      number: (n) => nf.format(n),
      /** The same amount in old ouguiya (1 MRU = 10 MRO), said the way people say it: «11.5 مليون», «165 ألف». */
      oldMoney: (n) => {
        const v = Number(n) * 10;
        const short = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 2 });
        if (v >= 1_000_000) return t('ouguiya.millions', { n: short.format(v / 1_000_000) });
        if (v >= 10_000 && v % 1000 === 0) return t('ouguiya.thousands', { n: short.format(v / 1000) });
        return t('ouguiya.units', { n: nf.format(v) });
      },
      date: (d) => df.format(new Date(d)),
      dateTime: (d) => dtf.format(new Date(d)),
      ago: (d) => {
        const diff = (new Date(d).getTime() - Date.now()) / 1000;
        const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
        for (const [unit, sec] of units) {
          if (Math.abs(diff) >= sec) return rtf.format(Math.round(diff / sec), unit);
        }
        return rtf.format(0, 'minute');
      },
    };
  }, [lang, meta, setLang, t, siteName]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
