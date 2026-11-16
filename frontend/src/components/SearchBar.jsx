import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { CitySelect, Icon } from './ui.jsx';

/** Search box with live suggestions (listings + categories) while typing. */
export function SearchBar({ initial = {}, large = false, compact = false }) {
  const { t, tl } = useI18n();
  const { categories, meta } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState(initial.q || '');
  const [category, setCategory] = useState(initial.category || '');
  const [city, setCity] = useState(initial.city || '');
  const [suggest, setSuggest] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef();

  // Debounced suggestions.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setSuggest(null); return undefined; }
    const timer = setTimeout(() => {
      api('/products/suggest', { query: { q: term } }).then(setSuggest).catch(() => setSuggest(null));
    }, 180);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const go = (params) => {
    setOpen(false);
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    navigate(`/products?${sp}`);
  };
  const submit = (e) => {
    e.preventDefault();
    go({ q: q.trim(), category, city });
  };

  const options = [
    ...(suggest?.categories || []).map((c) => ({ key: `c-${c.slug}`, label: tl(c), icon: c.icon, onPick: () => go({ category: c.slug, city }) })),
    ...(suggest?.titles || []).map((p) => ({ key: `p-${p.id}`, label: p.title, onPick: () => { setOpen(false); navigate(`/products/${p.id}`); } })),
  ];
  const showList = open && q.trim().length >= 2 && options.length > 0;

  const onKeyDown = (e) => {
    if (!showList) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % (options.length + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a <= 0 ? options.length : a - 1)); }
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Enter' && active >= 0 && active < options.length) { e.preventDefault(); options[active].onPick(); }
  };

  return (
    <form onSubmit={submit} role="search"
      className={compact
        ? 'flex items-center gap-1 rounded-full border border-slate-300 bg-surface p-1 ps-2 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/20'
        : `grid gap-2 rounded-2xl bg-surface p-2 sm:grid-cols-[1fr_auto_auto_auto] ${large ? 'shadow-xl' : 'shadow-sm'}`}>
      <div className={`relative ${compact ? 'flex-1' : ''}`} ref={box}>
        {!compact && <Icon name="search" className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />}
        <input
          className={compact ? 'w-full bg-transparent px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none' : 'input border-0 ps-10 focus:ring-0'}
          placeholder={compact ? t('search.headerPlaceholder') : t('common.searchPlaceholder')} value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)} onKeyDown={onKeyDown}
          aria-label={t('common.search')} role="combobox" aria-expanded={showList} aria-autocomplete="list" aria-controls="search-suggestions"
          autoComplete="off" enterKeyHint="search"
        />
        {showList && (
          <ul id="search-suggestions" role="listbox" className="card absolute inset-x-0 top-full z-40 mt-2 max-h-80 animate-fade-in overflow-y-auto p-1.5 text-slate-800">
            {options.map((o, i) => (
              <li key={o.key} role="option" aria-selected={active === i}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={o.onPick}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm ${active === i ? 'bg-slate-100' : 'hover:bg-slate-100'}`}>
                  {o.icon ? <span aria-hidden="true">{o.icon}</span> : <Icon name="search" className="h-4 w-4 shrink-0 text-slate-400" />}
                  <span className="truncate">{o.label}</span>
                </button>
              </li>
            ))}
            <li role="option" aria-selected={active === options.length}>
              <button type="submit" onMouseDown={(e) => e.preventDefault()}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm font-semibold text-brand-700 ${active === options.length ? 'bg-slate-100' : 'hover:bg-slate-100'}`}>
                <Icon name="search" className="h-4 w-4 shrink-0" />{t('search.seeAll', { q: q.trim() })}
              </button>
            </li>
          </ul>
        )}
      </div>
      {compact ? (
        <button className="flex h-10 w-12 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white hover:bg-brand-800" aria-label={t('common.search')}>
          <Icon name="search" className="h-5 w-5" />
        </button>
      ) : (<>
      <select className="input sm:w-48" value={category} onChange={(e) => setCategory(e.target.value)} aria-label={t('products.category')}>
        <option value="">{t('common.allCategories')}</option>
        {categories.map((c) => <option key={c.id} value={c.slug}>{tl(c)}</option>)}
      </select>
      <CitySelect value={city} onChange={setCity} cities={meta.cities} placeholder={t('common.allCities')} aria-label={t('products.city')} />
      <button className="btn-primary px-6">{t('common.search')}</button>
      </>)}
    </form>
  );
}

