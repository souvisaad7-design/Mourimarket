// /pro – Souk Pro for sellers: inventory, discount coupons, sales reports and the store page look.
import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorBox, Field, Spinner, useFieldError } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api, getToken } from '../lib/api.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';
import { thumb } from '../lib/dataSaver.js';

// ---------- Inventory ----------

function StockRow({ p, onSaved }) {
  const { t, price } = useI18n();
  const [v, setV] = useState(p.stock === null ? '' : String(p.stock));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const dirty = v !== (p.stock === null ? '' : String(p.stock));
  const save = async () => {
    setBusy(true); setError(null);
    try { await api(`/pro/inventory/${p.id}`, { method: 'PATCH', body: { stock: v === '' ? null : Number(v) } }); onSaved(); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  const low = p.stock !== null && p.stock <= 2;
  return (
    <li className={`flex flex-wrap items-center gap-3 p-3 ${low ? 'bg-amber-50' : ''}`}>
      {p.cover_url ? <img src={thumb(p.cover_url, 240)} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <span className="h-12 w-12 shrink-0 rounded-lg bg-slate-100" />}
      <div className="min-w-0 flex-1">
        <Link to={`/products/${p.id}`} className="line-clamp-1 font-semibold hover:text-brand-700">{p.title}</Link>
        <p className="text-xs text-slate-500">
          <span className="ltr-nums">{price(p.price)}</span>
          {p.open_orders > 0 && ` · ${t('pro.stock.reserved', { n: p.open_orders })}`}
          {p.delivered > 0 && ` · ${t('pro.stock.sold', { n: p.delivered })}`}
          {p.availability === 'sold' && ` · ${t('common.sold')}`}
          {p.status === 'pending' && ` · ${t('dashboard.status.pending')}`}
        </p>
        {error && <ErrorBox error={error} />}
      </div>
      <div className="flex items-center gap-1.5">
        <button type="button" className="btn-ghost h-9 w-9 p-0" aria-label="−" onClick={() => setV(String(Math.max(0, Number(v || 0) - 1)))}>−</button>
        <input className="input h-9 w-20 px-2 text-center" type="number" min="0" inputMode="numeric" dir="ltr" value={v} placeholder="—"
          onChange={(e) => setV(e.target.value)} aria-label={t('pro.stock.units')} />
        <button type="button" className="btn-ghost h-9 w-9 p-0" aria-label="+" onClick={() => setV(String(Number(v || 0) + 1))}>+</button>
        <button type="button" className="btn-primary h-9 px-3 text-xs" disabled={!dirty || busy} onClick={save}>{t('common.save')}</button>
      </div>
    </li>
  );
}

function Inventory() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useApi('/pro/inventory');
  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox error={error} />;
  const items = data.items;
  const low = items.filter((p) => p.stock !== null && p.stock <= 2 && p.availability !== 'sold').length;
  return (
    <section className="space-y-3">
      <p className="text-sm text-slate-600">{t('pro.stock.intro')}</p>
      {low > 0 && <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">⚠️ {t('pro.stock.lowWarning', { n: low })}</p>}
      {items.length ? <ul className="card divide-y divide-slate-100 p-0">{items.map((p) => <StockRow key={`${p.id}-${p.stock}`} p={p} onSaved={reload} />)}</ul>
        : <EmptyState icon="grid" title={t('pro.stock.none')}><Link to="/sell" className="btn-primary">{t('nav.post')}</Link></EmptyState>}
    </section>
  );
}

// ---------- Coupons ----------

const COUPON_EMPTY = { code: '', kind: 'percent', value: '', minTotal: '', maxUses: '', expiresAt: '', isPublic: true };

function Coupons() {
  const { t, price, date } = useI18n();
  const { notify } = useApp();
  const { data, loading, error, reload } = useApi('/pro/coupons');
  const [f, setF] = useState(COUPON_EMPTY);
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const create = async (e) => {
    e.preventDefault(); setBusy(true); setFormError(null);
    try {
      await api('/pro/coupons', { method: 'POST', body: { ...f, value: Number(f.value), minTotal: Number(f.minTotal || 0), maxUses: f.maxUses || null, expiresAt: f.expiresAt || null } });
      notify(t('common.changesSaved')); setF(COUPON_EMPTY); reload();
    } catch (err) { setFormError(err); } finally { setBusy(false); }
  };
  const patch = async (c, body) => { await api(`/pro/coupons/${c.id}`, { method: 'PATCH', body }); reload(); };
  const remove = async (c) => { if (window.confirm(t('pro.coupon.deleteConfirm', { code: c.code }))) { await api(`/pro/coupons/${c.id}`, { method: 'DELETE' }); reload(); } };
  const fieldErr = useFieldError(formError);
  return (
    <section className="space-y-4">
      <p className="text-sm text-slate-600">{t('pro.coupon.intro')}</p>
      <form onSubmit={create} className="card grid gap-3 p-5 sm:grid-cols-3">
        <Field label={t('pro.coupon.code')} error={fieldErr('code')}><input className="input uppercase" dir="ltr" required minLength={3} maxLength={30} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="EID10" /></Field>
        <Field label={t('pro.coupon.kind')}>
          <select className="input" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
            <option value="percent">{t('pro.coupon.percent')}</option><option value="amount">{t('pro.coupon.amount')}</option>
          </select>
        </Field>
        <Field label={f.kind === 'percent' ? t('pro.coupon.valuePct') : t('pro.coupon.valueMru')} error={fieldErr('value')}>
          <input className="input" type="number" min="1" max={f.kind === 'percent' ? 90 : undefined} dir="ltr" required value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
        </Field>
        <Field label={t('pro.coupon.minTotal')} optional><input className="input" type="number" min="0" dir="ltr" value={f.minTotal} onChange={(e) => setF({ ...f, minTotal: e.target.value })} /></Field>
        <Field label={t('pro.coupon.maxUses')} optional><input className="input" type="number" min="1" dir="ltr" value={f.maxUses} onChange={(e) => setF({ ...f, maxUses: e.target.value })} /></Field>
        <Field label={t('pro.coupon.expires')} optional><input className="input" type="date" dir="ltr" value={f.expiresAt} onChange={(e) => setF({ ...f, expiresAt: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={f.isPublic} onChange={(e) => setF({ ...f, isPublic: e.target.checked })} />{t('pro.coupon.public')}</label>
        <button className="btn-primary" disabled={busy}>+ {t('pro.coupon.create')}</button>
        {formError && !formError.fields && <div className="sm:col-span-3"><ErrorBox error={formError} /></div>}
      </form>
      {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} /> : data.items.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.items.map((c) => (
            <li key={c.id} className={`card space-y-2 border-2 border-dashed p-4 text-sm ${c.is_active ? 'border-emerald-300' : 'border-slate-200 opacity-60'}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-lg font-bold tracking-wider" dir="ltr">{c.code}</p>
                <p className="font-bold text-emerald-700">{c.kind === 'percent' ? <bdi dir="ltr">−{c.value}%</bdi> : <bdi dir="ltr">−{price(c.value)}</bdi>}</p>
              </div>
              <p className="text-xs text-slate-500">
                {t('pro.coupon.used', { n: c.uses })}{c.max_uses ? ` / ${c.max_uses}` : ''}
                {c.min_total > 0 && ` · ${t('pro.coupon.from', { amount: price(c.min_total) })}`}
                {c.expires_at && ` · ${t('pro.coupon.until', { d: date(c.expires_at) })}`}
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                <label className="flex items-center gap-1"><input type="checkbox" checked={c.is_active} onChange={(e) => patch(c, { isActive: e.target.checked })} />{t('pro.coupon.active')}</label>
                <label className="flex items-center gap-1"><input type="checkbox" checked={c.is_public} onChange={(e) => patch(c, { isPublic: e.target.checked })} />{t('pro.coupon.onStore')}</label>
                <button type="button" className="ms-auto text-rose-600 hover:underline" onClick={() => remove(c)}>{t('common.delete')}</button>
              </div>
            </li>
          ))}
        </ul>
      ) : <EmptyState icon="star" title={t('pro.coupon.none')} />}
    </section>
  );
}

// ---------- Reports ----------

function Bars({ series }) {
  const { price, date } = useI18n();
  if (!series.length) return null;
  const max = Math.max(...series.map((s) => s.revenue), 1);
  return (
    <div className="card p-4">
      <div className="flex h-40 items-end gap-1" role="img" aria-label="revenue">
        {series.map((s) => (
          <div key={s.day} className="group relative flex-1">
            <div className="rounded-t bg-brand-600/80 transition group-hover:bg-brand-700" style={{ height: `${Math.max(4, (s.revenue / max) * 150)}px` }} />
            <span className="pointer-events-none absolute -top-12 start-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] text-white group-hover:block">
              {date(s.day)}<br /><span className="ltr-nums">{price(s.revenue)}</span> · {s.orders}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-slate-400"><span>{date(series[0].day)}</span><span>{date(series[series.length - 1].day)}</span></div>
    </div>
  );
}

function Reports() {
  const { t, price, number } = useI18n();
  const [days, setDays] = useState(30);
  const { data, loading, error } = useApi(`/pro/reports?days=${days}`, undefined, [days]);
  const exportCsv = async () => {
    const res = await fetch(`/api/pro/reports.csv?days=${days}`, { headers: { Authorization: `Bearer ${getToken()}` } });
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a'); a.href = url; a.download = `sales-${days}d.csv`; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {[7, 30, 90, 365].map((d) => (
          <button key={d} type="button" onClick={() => setDays(d)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${days === d ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700'}`}>{t('pro.report.days', { n: d })}</button>
        ))}
        <button type="button" className="btn-outline ms-auto text-xs" onClick={exportCsv}>⬇️ CSV</button>
      </div>
      {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} /> : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[[t('pro.report.revenue'), price(data.summary.revenue)], [t('pro.report.orders'), number(data.summary.delivered)], [t('pro.report.average'), price(data.summary.average)], [t('pro.report.buyers'), number(data.summary.buyers)],
              [t('pro.report.discounts'), price(data.summary.discounts)], [t('pro.report.cancelRate'), `${data.summary.cancelRate}%`], [t('pro.report.open'), number(data.summary.open)], [t('pro.report.manual'), number(data.summary.manualSales)]].map(([label, v]) => (
              <div key={label} className="card p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-bold ltr-nums">{v}</p></div>
            ))}
          </div>
          {data.series.length ? <Bars series={data.series} /> : <p className="card p-4 text-sm text-slate-500">{t('pro.report.empty')}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card p-4">
              <h3 className="mb-2 font-bold">🏆 {t('pro.report.top')}</h3>
              {data.top.length ? <ol className="space-y-1.5 text-sm">{data.top.map((p, i) => (
                <li key={p.product_id || i} className="flex justify-between gap-2"><span className="truncate">{i + 1}. {p.title}</span><span className="shrink-0 text-slate-500">{p.orders} · <span className="ltr-nums">{price(p.revenue)}</span></span></li>
              ))}</ol> : <p className="text-sm text-slate-500">—</p>}
            </div>
            <div className="card p-4">
              <h3 className="mb-2 font-bold">🏷️ {t('pro.report.coupons')}</h3>
              {data.coupons.length ? <ul className="space-y-1.5 text-sm">{data.coupons.map((c) => (
                <li key={c.code} className="flex justify-between gap-2"><span className="font-mono" dir="ltr">{c.code}</span><span className="text-slate-500">{c.orders} · <bdi dir="ltr">−{price(c.discount)}</bdi></span></li>
              ))}</ul> : <p className="text-sm text-slate-500">—</p>}
            </div>
          </div>
          {data.summary.manualSales > 0 && <p className="text-xs text-slate-500">{t('pro.report.manualHint', { n: data.summary.manualSales, amount: price(data.summary.manualValue) })}</p>}
        </>
      )}
    </section>
  );
}

// ---------- Store page look ----------

function StoreLook() {
  const { t } = useI18n();
  const { notify } = useApp();
  const store = useApi('/stores/me');
  const inv = useApi('/pro/inventory');
  const [f, setF] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  if (store.loading || inv.loading) return <Spinner />;
  const s = store.data?.store;
  if (!s) return <EmptyState icon="store" title={t('pro.look.noStore')}><Link to="/dashboard/store" className="btn-primary">{t('nav.myStore')}</Link></EmptyState>;
  const v = f || { tagline: s.tagline || '', hours: s.hours || '', themeColor: s.theme_color || '', pinnedIds: s.pinned_ids || [] };
  const live = (inv.data?.items || []).filter((p) => p.status === 'approved' && p.availability === 'available');
  const togglePin = (id) => setF({ ...v, pinnedIds: v.pinnedIds.includes(id) ? v.pinnedIds.filter((x) => x !== id) : [...v.pinnedIds, id].slice(0, 4) });
  const save = async () => {
    setBusy(true); setError(null);
    try { await api('/pro/store-look', { method: 'PUT', body: v }); notify(t('common.changesSaved')); setF(null); store.reload(); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  const uploadBanner = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    const fd = new FormData(); fd.append('banner', file);
    setBusy(true); setError(null);
    try { await api('/pro/store-banner', { method: 'POST', body: fd }); store.reload(); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  const removeBanner = async () => { await api('/pro/store-banner', { method: 'DELETE' }); store.reload(); };
  return (
    <section className="space-y-4">
      <div className="card overflow-hidden p-0">
        <div className="relative h-36 bg-slate-100" style={{ background: s.banner_url ? undefined : v.themeColor || undefined }}>
          {s.banner_url && <img src={s.banner_url} alt="" className="h-full w-full object-cover" />}
          <div className="absolute bottom-2 end-2 flex gap-2">
            <button type="button" className="btn bg-white/90 px-3 py-1.5 text-xs" onClick={() => fileRef.current?.click()} disabled={busy}>🖼️ {t('pro.look.banner')}</button>
            {s.banner_url && <button type="button" className="btn bg-white/90 px-3 py-1.5 text-xs text-rose-700" onClick={removeBanner}>{t('common.delete')}</button>}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadBanner} />
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <Field label={t('pro.look.tagline')} optional><input className="input" maxLength={140} value={v.tagline} onChange={(e) => setF({ ...v, tagline: e.target.value })} /></Field>
          <Field label={t('pro.look.hours')} optional><input className="input" maxLength={200} value={v.hours} onChange={(e) => setF({ ...v, hours: e.target.value })} placeholder={t('pro.look.hoursPh')} /></Field>
          <Field label={t('pro.look.color')} optional>
            <div className="flex items-center gap-2">
              <input type="color" className="h-11 w-14 cursor-pointer rounded-lg border border-slate-300 p-1" value={v.themeColor || '#2f5d50'} onChange={(e) => setF({ ...v, themeColor: e.target.value })} aria-label={t('pro.look.color')} />
              {v.themeColor && <button type="button" className="text-xs text-slate-500 underline" onClick={() => setF({ ...v, themeColor: '' })}>{t('pro.look.defaultColor')}</button>}
            </div>
          </Field>
        </div>
      </div>
      <div className="card space-y-2 p-5">
        <h3 className="font-bold">📌 {t('pro.look.pinned')}</h3>
        <p className="text-xs text-slate-500">{t('pro.look.pinnedHint')}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {live.map((p) => (
            <label key={p.id} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-2 text-sm ${v.pinnedIds.includes(p.id) ? 'border-brand-600 bg-brand-50' : 'border-slate-200'}`}>
              <input type="checkbox" checked={v.pinnedIds.includes(p.id)} onChange={() => togglePin(p.id)} disabled={!v.pinnedIds.includes(p.id) && v.pinnedIds.length >= 4} />
              <span className="truncate">{p.title}</span>
            </label>
          ))}
        </div>
      </div>
      <ErrorBox error={error} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary" disabled={!f || busy} onClick={save}>{t('common.save')}</button>
        <Link to={`/stores/${s.slug}`} className="btn-outline">{t('pro.look.view')}</Link>
      </div>
    </section>
  );
}

const TABS = ['stock', 'coupons', 'reports', 'look'];

export default function ProTools() {
  const { t } = useI18n();
  const { user } = useApp();
  useDocumentTitle(t('pro.title'));
  const [params, setParams] = useSearchParams();
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'stock';
  const tabs = TABS.filter((k) => k !== 'look' || user?.account_type === 'merchant');
  return (
    <div className="container-page max-w-5xl space-y-5 py-6">
      <header className="rounded-3xl bg-gradient-to-l from-ink to-brand-800 p-6 text-white">
        <h1 className="text-2xl font-bold">⚡ {t('pro.title')}</h1>
        <p className="mt-1 text-sm text-white/85">{t('pro.subtitle')}</p>
      </header>
      <div className="flex flex-wrap gap-1.5" role="tablist">
        {tabs.map((k) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setParams({ tab: k }, { replace: true })}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === k ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700'}`}>{t(`pro.tabs.${k}`)}</button>
        ))}
      </div>
      {tab === 'stock' && <Inventory />}
      {tab === 'coupons' && <Coupons />}
      {tab === 'reports' && <Reports />}
      {tab === 'look' && <StoreLook />}
    </div>
  );
}
