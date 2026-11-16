import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorBox, Field, Icon, Modal, Pagination, Spinner, StatusBadge, VerifiedBadge, useFieldError } from '../../components/ui.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/hooks.js';

function useAction(reload) {
  const { notify } = useApp();
  const { t } = useI18n();
  return async (fn) => {
    try {
      await fn();
      notify(t('common.saved'));
      reload();
    } catch (err) {
      const msg = t(`errors.${err.code}`);
      notify(msg.startsWith('errors.') ? t('common.error') : msg, 'error');
    }
  };
}

function SearchBox({ value, onSearch }) {
  const { t } = useI18n();
  const [q, setQ] = useState(value);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSearch(q); }} className="flex gap-2">
      <input className="input w-56" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')} aria-label={t('common.search')} />
      <button className="btn-outline px-3" aria-label={t('common.search')}><Icon name="search" className="h-4 w-4" /></button>
    </form>
  );
}

function Tabs({ value, options, onChange }) {
  return (
    <div className="flex gap-1 rounded-xl bg-surface p-1 ring-1 ring-slate-200">
      {options.map(([v, label]) => (
        <button key={v} onClick={() => onChange(v)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${value === v ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>
      ))}
    </div>
  );
}

// ---------- Listings moderation ----------

export function AdminListings() {
  const { t, price, date } = useI18n();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? 'pending';
  const q = params.get('q') || '';
  const page = Number(params.get('page') || 1);
  const { data, loading, error, reload } = useApi(`/admin/products?status=${status}&q=${encodeURIComponent(q)}&page=${page}`);
  const act = useAction(reload);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [featuring, setFeaturing] = useState(null);
  const [days, setDays] = useState(7);
  const setParam = (k, v) => { const n = new URLSearchParams(params); if (v) n.set(k, v); else n.delete(k); if (k !== 'page') n.delete('page'); setParams(n); };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={status} onChange={(v) => setParam('status', v || 'all')}
          options={[['pending', t('dashboard.status.pending')], ['approved', t('dashboard.status.approved')], ['featured', t('admin.featuredTab')], ['rejected', t('dashboard.status.rejected')], ['all', t('common.all')]]} />
        <SearchBox value={q} onSearch={(v) => setParam('q', v)} />
      </div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState title={t('common.empty')} /> : (
        <>
          <ul className="space-y-3">
            {data.items.map((p) => (
              <li key={p.id} className="card flex flex-col gap-3 p-4 md:flex-row">
                <img src={p.cover_url} alt="" className="h-28 w-full shrink-0 rounded-xl bg-slate-100 object-cover md:w-36" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={p.status} />
                    {p.open_reports > 0 && <span className="badge bg-rose-100 text-rose-700"><Icon name="flag" className="me-1 h-3 w-3" />{p.open_reports}</span>}
                    {p.is_featured && <span className="badge gap-1 bg-gold-400 text-ink"><Icon name="star" filled className="h-3 w-3" />{t('admin.featuredUntil', { d: date(p.featured_until) })}</span>}
                    <span className="text-xs text-slate-400">#{p.id} · {date(p.created_at)}</span>
                  </div>
                  <Link to={`/products/${p.id}`} className="mt-1 block font-semibold hover:underline">{p.title}</Link>
                  <p className="text-sm font-bold text-brand-800 ltr-nums">{price(p.price)}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{p.description}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">{p.seller_name}{p.seller_verified && <VerifiedBadge small />} · <span dir="ltr">{p.seller_email}</span></p>
                  {p.rejection_reason && <p className="mt-1 text-xs text-rose-600">{p.rejection_reason}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap items-start gap-2 md:flex-col">
                  {p.status !== 'approved' && <button className="btn-primary px-3 py-2 text-xs" onClick={() => act(() => api(`/admin/products/${p.id}/status`, { method: 'PATCH', body: { status: 'approved' } }))}><Icon name="check" className="h-4 w-4" />{t('admin.approve')}</button>}
                  {p.status === 'approved' && (p.is_featured ? (
                    <button className="btn-outline px-3 py-2 text-xs" onClick={() => act(() => api(`/admin/products/${p.id}/feature`, { method: 'PATCH', body: { days: 0 } }))}>
                      <Icon name="star" className="h-4 w-4" />{t('admin.unfeature')}
                    </button>
                  ) : (
                    <button className="btn-accent px-3 py-2 text-xs" onClick={() => { setFeaturing(p); setDays(7); }}>
                      <Icon name="star" filled className="h-4 w-4" />{t('admin.feature')}
                    </button>
                  ))}
                  {p.status !== 'rejected' && <button className="btn-outline px-3 py-2 text-xs" onClick={() => { setRejecting(p); setReason(''); }}><Icon name="x" className="h-4 w-4" />{t('admin.reject')}</button>}
                  <button className="btn-ghost px-3 py-2 text-xs text-rose-600" onClick={() => window.confirm(t('dashboard.confirmDelete')) && act(() => api(`/admin/products/${p.id}`, { method: 'DELETE' }))}><Icon name="trash" className="h-4 w-4" />{t('common.delete')}</button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={data.page} total={data.total} limit={data.limit} onPage={(n) => setParam('page', String(n))} />
        </>
      )}
      <Modal open={Boolean(rejecting)} onClose={() => setRejecting(null)} title={t('admin.reject')}>
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const p = rejecting;
          setRejecting(null);
          act(() => api(`/admin/products/${p.id}/status`, { method: 'PATCH', body: { status: 'rejected', reason } }));
        }}>
          <p className="text-sm font-semibold">{rejecting?.title}</p>
          <Field label={t('admin.rejectReason')}><textarea className="input" rows={3} required maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
          <button className="btn-danger w-full">{t('admin.reject')}</button>
        </form>
      </Modal>
      <Modal open={Boolean(featuring)} onClose={() => setFeaturing(null)} title={t('admin.feature')}>
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const p = featuring;
          setFeaturing(null);
          act(() => api(`/admin/products/${p.id}/feature`, { method: 'PATCH', body: { days } }));
        }}>
          <p className="text-sm font-semibold">{featuring?.title}</p>
          <fieldset>
            <legend className="label">{t('admin.featureFor')}</legend>
            <div className="grid grid-cols-4 gap-2">
              {[3, 7, 14, 30].map((n) => (
                <label key={n} className={`cursor-pointer rounded-xl border-2 px-2 py-2 text-center text-sm font-semibold ${days === n ? 'border-gold-500 bg-amber-50' : 'border-slate-200'}`}>
                  <input type="radio" name="days" className="sr-only" checked={days === n} onChange={() => setDays(n)} />
                  {t('admin.days', { n })}
                </label>
              ))}
            </div>
          </fieldset>
          <button className="btn-accent w-full"><Icon name="star" filled className="h-4 w-4" />{t('admin.feature')}</button>
        </form>
      </Modal>
    </div>
  );
}

// ---------- Reports ----------

export function AdminReports() {
  const { t, dateTime } = useI18n();
  const [status, setStatus] = useState('open');
  const { data, loading, error, reload } = useApi(`/admin/reports?status=${status}`);
  const act = useAction(reload);
  const setReport = (id, s) => act(() => api(`/admin/reports/${id}`, { method: 'PATCH', body: { status: s } }));

  return (
    <div>
      <div className="mb-4"><Tabs value={status} onChange={setStatus} options={[['open', t('admin.open')], ['resolved', t('admin.resolved')], ['dismissed', t('admin.dismissed')]]} /></div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState icon="flag" title={t('common.empty')} /> : (
        <ul className="space-y-3">
          {data.items.map((r) => (
            <li key={r.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-rose-100 text-rose-700">{t(`report.reasons.${r.reason}`)}</span>
                  <StatusBadge status={r.product_status} />
                  <span className="text-xs text-slate-400">{dateTime(r.created_at)}</span>
                </div>
                <Link to={`/products/${r.product_id}`} className="mt-1 block font-semibold hover:underline">{r.product_title}</Link>
                {r.details && <p className="mt-1 text-sm text-slate-600">«{r.details}»</p>}
                <p className="mt-1 text-xs text-slate-500">{t('admin.reporter')}: {r.reporter_name} · {t('product.seller')}: {r.seller_name}{r.handled_by_name ? ` · ✓ ${r.handled_by_name}` : ''}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {status === 'open' ? (
                  <>
                    <button className="btn-danger px-3 py-2 text-xs" onClick={() => window.confirm(t('dashboard.confirmDelete')) && act(async () => {
                      await api(`/admin/reports/${r.id}`, { method: 'PATCH', body: { status: 'resolved' } });
                      await api(`/admin/products/${r.product_id}`, { method: 'DELETE' });
                    })}>{t('admin.deleteListing')}</button>
                    <button className="btn-primary px-3 py-2 text-xs" onClick={() => setReport(r.id, 'resolved')}>{t('admin.resolve')}</button>
                    <button className="btn-outline px-3 py-2 text-xs" onClick={() => setReport(r.id, 'dismissed')}>{t('admin.dismiss')}</button>
                  </>
                ) : <button className="btn-outline px-3 py-2 text-xs" onClick={() => setReport(r.id, 'open')}>{t('admin.reopen')}</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Users ----------

export function AdminUsers() {
  const { t, date } = useI18n();
  const { user: me } = useApp();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(`/admin/users?q=${encodeURIComponent(q)}&page=${page}`);
  const act = useAction(reload);
  const patch = (id, body) => act(() => api(`/admin/users/${id}`, { method: 'PATCH', body }));

  return (
    <div>
      <div className="mb-4 flex justify-end"><SearchBox value={q} onSearch={(v) => { setQ(v); setPage(1); }} /></div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="p-3 text-start">{t('auth.name')}</th><th className="p-3 text-start">{t('auth.accountType')}</th>
                <th className="p-3 text-start">{t('admin.role')}</th><th className="p-3 text-start">{t('admin.listings')}</th>
                <th className="p-3 text-start">{t('admin.joined')}</th><th className="p-3 text-start">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((u) => (
                <tr key={u.id} className={u.is_active ? '' : 'bg-slate-50 text-slate-400'}>
                  <td className="p-3">
                    <Link to={`/users/${u.id}`} className="inline-flex items-center gap-1 font-semibold hover:underline">{u.name}{u.is_verified && <VerifiedBadge small />}</Link>
                    <div className="text-xs text-slate-500" dir="ltr">{u.email}</div>
                  </td>
                  <td className="p-3">
                    <select className="rounded-lg border border-slate-200 px-2 py-1 text-xs" value={u.account_type} onChange={(e) => patch(u.id, { accountType: e.target.value })}>
                      <option value="individual">{t('auth.individual')}</option><option value="merchant">{t('auth.merchant')}</option>
                    </select>
                  </td>
                  <td className="p-3"><span className={`badge ${u.role === 'admin' ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-600'}`}>{u.role === 'admin' ? t('admin.adminRole') : t('admin.userRole')}</span></td>
                  <td className="p-3 ltr-nums">{u.products_count}</td>
                  <td className="p-3 text-xs">{date(u.created_at)}</td>
                  <td className="p-3">
                    {u.id !== me.id && (
                      <div className="flex flex-wrap gap-1">
                        <button className={`btn px-2 py-1 text-xs ${u.is_active ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`} onClick={() => patch(u.id, { isActive: !u.is_active })}>
                          {u.is_active ? t('admin.disable') : t('admin.enable')}
                        </button>
                        <button className={`btn px-2 py-1 text-xs ${u.is_verified ? 'text-slate-600 hover:bg-slate-100' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'}`} onClick={() => patch(u.id, { isVerified: !u.is_verified })}>
                          {u.is_verified ? t('admin.unverify') : <><VerifiedBadge small />{t('admin.verify')}</>}
                        </button>
                        <button className="btn-ghost px-2 py-1 text-xs" onClick={() => patch(u.id, { role: u.role === 'admin' ? 'user' : 'admin' })}>
                          {u.role === 'admin' ? t('admin.removeAdmin') : t('admin.makeAdmin')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />}
    </div>
  );
}

// ---------- Stores ----------

export function AdminStores() {
  const { t, date } = useI18n();
  const { data, loading, error, reload } = useApi('/admin/stores');
  const act = useAction(reload);
  if (loading) return <Spinner />;
  return (
    <div>
      <ErrorBox error={error} />
      {!data?.items?.length ? <EmptyState icon="store" title={t('store.empty')} /> : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.items.map((s) => (
            <li key={s.id} className={`card flex items-center gap-3 p-4 ${s.is_active ? '' : 'opacity-60'}`}>
              <div className="min-w-0 flex-1">
                <Link to={`/stores/${s.slug}`} className="inline-flex items-center gap-1 font-semibold hover:underline">{s.name}{s.owner_verified && <VerifiedBadge small />}</Link>
                <p className="text-xs text-slate-500">{t('admin.owner')}: {s.owner_name} · {t('store.products', { n: s.products_count })} · {date(s.created_at)}</p>
              </div>
              <button className={`btn px-3 py-1.5 text-xs ${s.is_active ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}
                onClick={() => act(() => api(`/admin/stores/${s.id}`, { method: 'PATCH', body: { isActive: !s.is_active } }))}>
                {s.is_active ? t('admin.disable') : t('admin.enable')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Categories ----------

const EMPTY_CAT = { slug: '', nameAr: '', nameFr: '', nameEn: '', icon: '', sortOrder: 0 };

export function AdminCategories() {
  const { t, number } = useI18n();
  const { categories, loadCategories, notify } = useApp();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_CAT);
  const [error, setError] = useState(null);
  const fieldError = useFieldError(error);

  const open = (c) => {
    setError(null);
    setEditing(c || 'new');
    setForm(c ? { slug: c.slug, nameAr: c.name_ar, nameFr: c.name_fr, nameEn: c.name_en, icon: c.icon || '', sortOrder: c.sort_order } : { ...EMPTY_CAT, sortOrder: categories.length });
  };
  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing === 'new') await api('/admin/categories', { method: 'POST', body: form });
      else await api(`/admin/categories/${editing.id}`, { method: 'PUT', body: form });
      setEditing(null);
      loadCategories();
      notify(t('common.saved'));
    } catch (err) { setError(err); }
  };
  const remove = async (c) => {
    if (!window.confirm(t('admin.confirmDeleteCategory'))) return;
    try {
      await api(`/admin/categories/${c.id}`, { method: 'DELETE' });
      loadCategories();
    } catch (err) {
      notify(t(`errors.${err.code}`), 'error');
    }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <div className="mb-4 flex justify-end"><button className="btn-primary" onClick={() => open(null)}><Icon name="plus" className="h-4 w-4" />{t('admin.addCategory')}</button></div>
      <ul className="card divide-y divide-slate-100">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-3 p-3">
            <span className="text-2xl" aria-hidden="true">{c.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c.name_ar} · {c.name_fr} · {c.name_en}</p>
              <p className="text-xs text-slate-500" dir="ltr">{c.slug} · {number(c.product_count)}</p>
            </div>
            <button className="btn-ghost p-2" onClick={() => open(c)} aria-label={t('common.edit')}><Icon name="edit" className="h-4 w-4" /></button>
            <button className="btn-ghost p-2 text-rose-600" onClick={() => remove(c)} aria-label={t('common.delete')}><Icon name="trash" className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? t('admin.addCategory') : t('common.edit')}>
        <form onSubmit={save} className="space-y-3">
          <ErrorBox error={error} />
          <Field label={t('admin.nameAr')}><input className="input" dir="rtl" required value={form.nameAr} onChange={set('nameAr')} /></Field>
          <Field label={t('admin.nameFr')}><input className="input" dir="ltr" required value={form.nameFr} onChange={set('nameFr')} /></Field>
          <Field label={t('admin.nameEn')}><input className="input" dir="ltr" required value={form.nameEn} onChange={set('nameEn')} /></Field>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1"><Field label={t('admin.slug')} error={fieldError('slug')}><input className="input" dir="ltr" required value={form.slug} onChange={set('slug')} /></Field></div>
            <Field label={t('admin.icon')}><input className="input text-center" value={form.icon} onChange={set('icon')} maxLength={16} /></Field>
            <Field label={t('admin.order')}><input className="input" type="number" value={form.sortOrder} onChange={set('sortOrder')} /></Field>
          </div>
          <button className="btn-primary w-full">{t('common.save')}</button>
        </form>
      </Modal>
    </div>
  );
}
