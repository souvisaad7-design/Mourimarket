import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Avatar, CategoryIcon, CitySelect, EmptyState, ErrorBox, Field, Icon, Modal, Pagination, PhoneInput, Spinner, StatusBadge, VerifiedBadge, useCityName, useFieldError } from '../../components/ui.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { api, getToken } from '../../lib/api.js';
import { formatPhone } from '../../components/ProfileCard.jsx';
import { useApi } from '../../lib/hooks.js';

function useAction(reload) {
  const { notify } = useApp();
  const { t } = useI18n();
  return async (fn) => {
    try {
      await fn();
      notify(t('common.changesSaved'));
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
        <div className="flex flex-wrap gap-2">
          <SearchBox value={q} onSearch={(v) => setParam('q', v)} />
          <Link to="/admin/listings/new" className="btn-accent"><Icon name="plus" className="h-4 w-4" />{t('admin.addListing')}</Link>
        </div>
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
                  <Link to={`/products/${p.id}/edit`} className="btn-outline px-3 py-2 text-xs"><Icon name="edit" className="h-4 w-4" />{t('common.edit')}</Link>
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
  const [temp, setTemp] = useState(null);
  const [editing, setEditing] = useState(null);
  const [params, setParams] = useSearchParams();
  const adding = params.get('new') === '1';
  const setAdding = (v) => setParams(v ? { new: '1' } : {}, { replace: true });
  const remove = (u) => {
    if (window.prompt(t('admin.deleteUserConfirm', { name: u.name })) !== u.name) return;
    act(() => api(`/admin/users/${u.id}`, { method: 'DELETE' }));
  };
  const resetPassword = async (u) => {
    if (!window.confirm(t('admin.resetConfirm', { name: u.name }))) return;
    try {
      const { password } = await api(`/admin/users/${u.id}/reset-password`, { method: 'POST' });
      setTemp({ name: u.name, phone: u.phone, password });
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <SearchBox value={q} onSearch={(v) => { setQ(v); setPage(1); }} />
        <button type="button" className="btn-accent" onClick={() => setAdding(true)}><Icon name="userPlus" className="h-4 w-4" />{t('admin.addUser')}</button>
      </div>
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
                    <div className="text-xs text-slate-500" dir="ltr">{formatPhone(u.phone)}{u.phone && u.email ? ' · ' : ''}{u.email}</div>
                  </td>
                  <td className="p-3">
                    <select className="rounded-lg border border-slate-200 px-2 py-1 text-xs" value={u.account_type} onChange={(e) => patch(u.id, { accountType: e.target.value })}>
                      <option value="buyer">{t('roles.buyer')}</option><option value="individual">{t('roles.individual')}</option><option value="merchant">{t('roles.merchant')}</option>
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
                        <button className="btn-ghost px-2 py-1 text-xs" onClick={() => setEditing(u)}><Icon name="edit" className="h-3.5 w-3.5" />{t('common.edit')}</button>
                        <button className="btn-ghost px-2 py-1 text-xs" onClick={() => resetPassword(u)}>{t('admin.resetPassword')}</button>
                        <button className="btn-ghost px-2 py-1 text-xs" onClick={() => patch(u.id, { role: u.role === 'admin' ? 'user' : 'admin' })}>
                          {u.role === 'admin' ? t('admin.removeAdmin') : t('admin.makeAdmin')}
                        </button>
                        {u.role !== 'admin' && <button className="btn-ghost px-2 py-1 text-xs text-rose-600" onClick={() => remove(u)}><Icon name="trash" className="h-3.5 w-3.5" />{t('common.delete')}</button>}
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
      <UserEditModal user={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
      {adding && <UserCreateModal onClose={() => setAdding(false)} onSaved={() => { setAdding(false); reload(); }} />}
      <Modal open={Boolean(temp)} onClose={() => setTemp(null)} title={t('admin.resetPassword')}>
        {temp && (
          <div className="space-y-3 text-sm">
            <p>{t('admin.tempPasswordFor', { name: temp.name })} <bdi dir="ltr">{formatPhone(temp.phone)}</bdi></p>
            <p className="select-all rounded-xl bg-slate-100 p-3 text-center font-mono text-lg font-bold tracking-wider" dir="ltr">{temp.password}</p>
            <p className="text-xs text-slate-500">{t('admin.tempPasswordHelp')}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ---------- Stores ----------

export function AdminStores() {
  const { t, date } = useI18n();
  const { data, loading, error, reload } = useApi('/admin/stores');
  const act = useAction(reload);
  const [editing, setEditing] = useState(null);
  const remove = (s) => window.confirm(t('admin.deleteStoreConfirm', { name: s.name })) && act(() => api(`/admin/stores/${s.id}`, { method: 'DELETE' }));
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
              <button className="btn-ghost p-2" onClick={() => setEditing(s)} aria-label={t('common.edit')}><Icon name="edit" className="h-4 w-4" /></button>
              <button className="btn-ghost p-2 text-rose-600" onClick={() => remove(s)} aria-label={t('common.delete')}><Icon name="trash" className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <StoreEditModal store={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
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
      notify(t('common.changesSaved'));
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
            <span className="text-2xl" aria-hidden="true"><CategoryIcon icon={c.icon} /></span>
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
          <button className="btn-primary w-full">{t('common.saveChanges')}</button>
        </form>
      </Modal>
    </div>
  );
}

// ---------- Verification & featuring requests ----------

/** Load a private receipt with the admin's token and show it via a blob: URL. */
function useReceipt(id, enabled) {
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!enabled) return undefined;
    let objectUrl = '';
    let cancelled = false;
    fetch(`/api/admin/upgrade-requests/${id}/receipt`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error('receipt'))))
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id, enabled]);
  return { url, failed };
}

function ReceiptThumb({ request, onOpen }) {
  const { t } = useI18n();
  const { url, failed } = useReceipt(request.id, request.has_receipt);
  if (!request.has_receipt || failed) {
    return <span className="flex h-28 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-100 p-2 text-center text-[11px] text-slate-400">{t('admin.noReceipt')}</span>;
  }
  return (
    <button type="button" onClick={() => url && onOpen(url)} aria-label={t('admin.viewReceipt')}
      className="group relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
      {url ? <img src={url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" /> : <span className="absolute inset-0 animate-pulse bg-slate-200" />}
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-ink/70 py-1 text-[10px] font-semibold text-white">
        <Icon name="eye" className="h-3 w-3" />{t('admin.viewReceipt')}
      </span>
    </button>
  );
}

const REQ_TONE = { pending: 'bg-amber-100 text-amber-800', approved: 'bg-emerald-100 text-emerald-800', rejected: 'bg-rose-100 text-rose-700' };

export function AdminUpgrades() {
  const { t, price, dateTime, ago, number } = useI18n();
  const [params, setParams] = useSearchParams();
  const status = ['pending', 'approved', 'rejected'].includes(params.get('status')) ? params.get('status') : 'pending';
  const kind = ['verify', 'feature'].includes(params.get('kind')) ? params.get('kind') : '';
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(`/admin/upgrade-requests?status=${status}&kind=${kind}&page=${page}`);
  const act = useAction(reload);
  const [viewer, setViewer] = useState('');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const set = (k, v) => { const n = new URLSearchParams(params); if (v) n.set(k, v); else n.delete(k); setParams(n, { replace: true }); setPage(1); };
  const counts = data?.counts || {};
  const label = (s) => `${t(`upgrades.status.${s}`)}${counts[s] ? ` (${number(counts[s])})` : ''}`;

  const approve = (r) => {
    const msg = r.kind === 'verify' ? t('admin.confirmApproveVerify') : t('admin.confirmApproveFeature', { days: r.days });
    if (window.confirm(msg)) act(() => api(`/admin/upgrade-requests/${r.id}`, { method: 'PATCH', body: { status: 'approved' } }));
  };
  const reject = (e) => {
    e.preventDefault();
    const r = rejecting;
    setRejecting(null);
    act(() => api(`/admin/upgrade-requests/${r.id}`, { method: 'PATCH', body: { status: 'rejected', note: reason } }));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={status} onChange={(v) => set('status', v === 'pending' ? '' : v)} options={['pending', 'approved', 'rejected'].map((s) => [s, label(s)])} />
        <Tabs value={kind} onChange={(v) => set('kind', v)} options={[['', t('admin.allKinds')], ['verify', t('upgrades.kind.verify')], ['feature', t('upgrades.kind.feature')], ['bump', t('upgrades.kind.bump')]]} />
      </div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState icon="shield" title={t('common.empty')} /> : (
        <ul className="space-y-3">
          {data.items.map((r) => {
            const productLive = r.product_status === 'approved' && r.product_availability === 'available';
            return (
              <li key={r.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
                <ReceiptThumb request={r} onOpen={setViewer} />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`badge ${r.kind === 'verify' ? 'bg-sky-100 text-sky-700' : 'bg-gold-400 text-ink'}`}>
                      <Icon name={r.kind === 'verify' ? 'shield' : 'star'} filled={r.kind === 'feature'} className="me-1 h-3 w-3" />{t(`upgrades.kind.${r.kind}`)}
                    </span>
                    {status !== 'pending' && <span className={`badge ${REQ_TONE[r.status]}`}>{t(`upgrades.status.${r.status}`)}</span>}
                    <span className="text-lg font-bold text-brand-800 ltr-nums">{price(r.amount)}</span>
                    <span className="text-xs text-slate-500">{t('admin.paidVia', { method: t(`upgrades.methods.${r.payment_method}`) })}</span>
                  </div>
                  <p className="flex flex-wrap items-center gap-x-2 text-sm">
                    <Link to={`/users/${r.user_id}`} className="font-semibold hover:underline">{r.user_name}</Link>
                    {r.is_verified && <VerifiedBadge small />}
                    <span className="badge bg-slate-100 text-slate-600">{t(`roles.${r.account_type}`)}</span>
                    {r.user_phone && <bdi dir="ltr" className="text-xs text-slate-500">{formatPhone(r.user_phone)}</bdi>}
                    {r.kind === 'verify' && r.is_verified && r.status === 'pending' && <span className="badge bg-emerald-100 text-emerald-800">{t('admin.alreadyVerified')}</span>}
                  </p>
                  {r.kind === 'feature' && (
                    <Link to={`/products/${r.product_id}`} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 hover:bg-slate-100">
                      {r.product_image ? <img src={r.product_image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" /> : <span className="h-10 w-10 shrink-0 rounded-lg bg-slate-200" />}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{r.product_title}</span>
                        <span className="text-xs text-slate-500">
                          {t('upgrades.planDays', { days: r.days })}
                          {!productLive && <span className="ms-2 font-semibold text-rose-600">· {t('admin.listingNotLive')}</span>}
                        </span>
                      </span>
                    </Link>
                  )}
                  {r.payment_ref && <p className="text-xs text-slate-600">{t('upgrades.ref')}: <bdi dir="ltr" className="font-mono font-semibold">{r.payment_ref}</bdi></p>}
                  {r.note && <p className="text-sm text-slate-600">«{r.note}»</p>}
                  <p className="text-xs text-slate-400"><time dateTime={r.created_at} title={dateTime(r.created_at)}>{ago(r.created_at)}</time>
                    {r.reviewed_by_name && <> · {t('admin.reviewedBy', { name: r.reviewed_by_name })}</>}
                  </p>
                  {r.status === 'rejected' && r.admin_note && <p className="text-xs text-rose-600">{t('upgrades.reason', { reason: r.admin_note })}</p>}
                </div>
                {status === 'pending' && (
                  <div className="flex shrink-0 gap-2 sm:flex-col">
                    <button className="btn-primary flex-1 px-3 py-2 text-xs" disabled={r.kind === 'feature' && !productLive} onClick={() => approve(r)}>
                      <Icon name="check" className="h-4 w-4" />{t('admin.approveActivate')}
                    </button>
                    <button className="btn-outline flex-1 px-3 py-2 text-xs text-rose-600" onClick={() => { setReason(''); setRejecting(r); }}>
                      <Icon name="x" className="h-4 w-4" />{t('admin.reject')}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {data && <Pagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />}

      <Modal open={Boolean(viewer)} onClose={() => setViewer('')} title={t('admin.receiptTitle')} size="lg">
        <img src={viewer} alt={t('admin.receiptTitle')} className="mx-auto max-h-[70vh] rounded-xl object-contain" />
        <a href={viewer} target="_blank" rel="noreferrer" className="btn-outline mt-4 w-full">{t('admin.openOriginal')}</a>
      </Modal>
      <Modal open={Boolean(rejecting)} onClose={() => setRejecting(null)} title={t('admin.rejectTitle')}>
        <form onSubmit={reject} className="space-y-4">
          <Field label={t('admin.rejectReasonSeller')}><textarea className="input" rows={3} required maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
          <button className="btn-danger w-full">{t('admin.reject')}</button>
        </form>
      </Modal>
    </div>
  );
}

// ---------- Merchant account requests ----------

const MERCHANT_TONE = { pending: 'bg-amber-100 text-amber-800', approved: 'bg-emerald-100 text-emerald-800', rejected: 'bg-rose-100 text-rose-700' };

export function AdminMerchants() {
  const { t, ago, date, dateTime, number } = useI18n();
  const { meta } = useApp();
  const cityName = useCityName();
  const [params, setParams] = useSearchParams();
  const status = ['pending', 'approved', 'rejected'].includes(params.get('status')) ? params.get('status') : 'pending';
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(`/admin/merchant-requests?status=${status}&page=${page}`);
  const act = useAction(reload);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const counts = data?.counts || {};
  const label = (s) => `${t(`upgrades.status.${s}`)}${counts[s] ? ` (${number(counts[s])})` : ''}`;
  const setStatus = (v) => { setParams(v === 'pending' ? {} : { status: v }, { replace: true }); setPage(1); };

  const approve = (u) => {
    if (window.confirm(t('admin.confirmApproveMerchant', { name: u.name }))) {
      act(() => api(`/admin/merchant-requests/${u.id}`, { method: 'PATCH', body: { status: 'approved' } }));
    }
  };
  const reject = (e) => {
    e.preventDefault();
    const u = rejecting;
    setRejecting(null);
    act(() => api(`/admin/merchant-requests/${u.id}`, { method: 'PATCH', body: { status: 'rejected', note: reason } }));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={status} onChange={setStatus} options={['pending', 'approved', 'rejected'].map((s) => [s, label(s)])} />
        {status === 'pending' && <p className="flex items-center gap-1.5 text-xs text-slate-500"><Icon name="shield" className="h-4 w-4 text-brand-700" />{t('admin.trustHint')}</p>}
      </div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState icon="store" title={t('common.empty')} /> : (
        <ul className="space-y-3">
          {data.items.map((u) => (
            <li key={u.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
              <Avatar name={u.name} url={u.avatar_url} size="h-14 w-14" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/users/${u.id}`} className="text-base font-bold hover:underline">{u.name}</Link>
                  {u.is_verified && <VerifiedBadge small />}
                  {status !== 'pending' && <span className={`badge ${MERCHANT_TONE[u.merchant_status]}`}>{t(`upgrades.status.${u.merchant_status}`)}</span>}
                  {!u.is_active && <span className="badge bg-slate-200 text-slate-600">{t('admin.disabled')}</span>}
                </div>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                  {u.phone && <bdi dir="ltr" className="font-semibold text-slate-800">{formatPhone(u.phone)}</bdi>}
                  {u.city && <span className="flex items-center gap-1"><Icon name="pin" className="h-3.5 w-3.5" />{cityName(meta.cities, u.city)}</span>}
                  <span className="text-xs text-slate-500">{t('admin.joinedOn', { date: date(u.created_at) })}</span>
                </p>
                <p className={`text-sm ${u.bio ? 'text-slate-700' : 'italic text-slate-400'}`}>{u.bio ? `«${u.bio}»` : t('admin.noBio')}</p>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="badge bg-slate-100 text-slate-700">{t('admin.listingsCount', { n: number(u.listings_count) })}</span>
                  <span className="badge bg-emerald-50 text-emerald-800">{t('admin.approvedCount', { n: number(u.approved_count) })}</span>
                  <span className={`badge ${Number(u.reports_count) ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>{t('admin.reportsCount', { n: number(u.reports_count) })}</span>
                  {u.store && <Link to={`/stores/${u.store.slug}`} className="badge bg-gold-400 text-ink">{t('admin.storeName', { name: u.store.name })}</Link>}
                </div>
                <p className="text-xs text-slate-400">
                  {u.merchant_requested_at && <time dateTime={u.merchant_requested_at} title={dateTime(u.merchant_requested_at)}>{t('admin.requestedAt', { time: ago(u.merchant_requested_at) })}</time>}
                  {u.reviewed_by_name && <> · {t('admin.reviewedBy', { name: u.reviewed_by_name })}</>}
                </p>
                {u.merchant_status === 'rejected' && u.merchant_note && <p className="text-xs text-rose-600">{t('upgrades.reason', { reason: u.merchant_note })}</p>}
              </div>
              <div className="flex shrink-0 gap-2 sm:flex-col">
                {status === 'pending' ? (
                  <>
                    <button className="btn-primary flex-1 whitespace-nowrap px-3 py-2 text-xs" onClick={() => approve(u)}><Icon name="check" className="h-4 w-4" />{t('admin.approveMerchant')}</button>
                    <button className="btn-outline flex-1 whitespace-nowrap px-3 py-2 text-xs text-rose-600" onClick={() => { setReason(''); setRejecting(u); }}><Icon name="x" className="h-4 w-4" />{t('admin.rejectMerchant')}</button>
                  </>
                ) : null}
                <Link to={`/users/${u.id}`} className="btn-ghost flex-1 whitespace-nowrap px-3 py-2 text-xs">{t('admin.viewProfile')}</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      {data && <Pagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />}
      <Modal open={Boolean(rejecting)} onClose={() => setRejecting(null)} title={t('admin.rejectMerchantTitle')}>
        <form onSubmit={reject} className="space-y-4">
          <Field label={t('admin.rejectReasonSeller')}><textarea className="input" rows={3} required maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
          <button className="btn-danger w-full">{t('admin.rejectMerchant')}</button>
        </form>
      </Modal>
    </div>
  );
}

// ---------- Edit forms (users, stores) ----------

function useEditForm(initial, deps) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setForm(initial); setError(null); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return { form, setForm, set, error, setError, busy, setBusy };
}

function UserEditModal({ user, onClose, onSaved }) {
  const { t } = useI18n();
  const { meta, notify } = useApp();
  const f = useEditForm({ name: user?.name || '', phone: (user?.phone || '').replace(/^\+222/, ''), email: user?.email || '', city: user?.city || '', bio: user?.bio || '' }, [user?.id]);
  const fieldError = useFieldError(f.error);
  if (!user) return null;
  const submit = async (e) => {
    e.preventDefault();
    f.setBusy(true);
    try {
      await api(`/admin/users/${user.id}/profile`, { method: 'PUT', body: f.form });
      notify(t('common.changesSaved'));
      onSaved();
    } catch (err) { f.setError(err); } finally { f.setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={t('admin.editUser', { name: user.name })}>
      <form onSubmit={submit} className="space-y-3">
        <ErrorBox error={f.error && !f.error.fields ? f.error : null} />
        <Field label={t('auth.name')} error={fieldError('name')}><input className="input" required value={f.form.name} onChange={f.set('name')} /></Field>
        <Field label={t('auth.phone')} error={fieldError('phone')}><PhoneInput value={f.form.phone} onChange={(v) => f.setForm({ ...f.form, phone: v })} /></Field>
        <Field label={t('auth.email')} error={fieldError('email')} optional><input className="input" type="email" dir="ltr" value={f.form.email} onChange={f.set('email')} /></Field>
        <Field label={t('form.city')} optional><CitySelect value={f.form.city} onChange={(v) => f.setForm({ ...f.form, city: v })} cities={meta.cities} placeholder="—" /></Field>
        <Field label={t('profile.bio')} optional><textarea className="input" rows={2} maxLength={500} value={f.form.bio} onChange={f.set('bio')} /></Field>
        <button className="btn-primary w-full" disabled={f.busy}>{t('common.saveChanges')}</button>
      </form>
    </Modal>
  );
}

function StoreEditModal({ store, onClose, onSaved }) {
  const { t } = useI18n();
  const { meta, notify } = useApp();
  const f = useEditForm({ name: store?.name || '', description: store?.description || '', phone: store?.phone || '', whatsapp: store?.whatsapp || '', email: store?.email || '', city: store?.city || '' }, [store?.id]);
  const fieldError = useFieldError(f.error);
  if (!store) return null;
  const submit = async (e) => {
    e.preventDefault();
    f.setBusy(true);
    try {
      await api(`/admin/stores/${store.id}`, { method: 'PUT', body: f.form });
      notify(t('common.changesSaved'));
      onSaved();
    } catch (err) { f.setError(err); } finally { f.setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={t('admin.editStore', { name: store.name })}>
      <form onSubmit={submit} className="space-y-3">
        <ErrorBox error={f.error && !f.error.fields ? f.error : null} />
        <Field label={t('store.name')} error={fieldError('name')}><input className="input" required value={f.form.name} onChange={f.set('name')} /></Field>
        <Field label={t('store.description')} optional><textarea className="input" rows={3} maxLength={2000} value={f.form.description} onChange={f.set('description')} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('store.phone')} optional><input className="input" dir="ltr" value={f.form.phone} onChange={f.set('phone')} /></Field>
          <Field label={t('store.whatsapp')} optional><input className="input" dir="ltr" value={f.form.whatsapp} onChange={f.set('whatsapp')} /></Field>
        </div>
        <Field label={t('auth.email')} optional><input className="input" type="email" dir="ltr" value={f.form.email} onChange={f.set('email')} /></Field>
        <Field label={t('form.city')} optional><CitySelect value={f.form.city} onChange={(v) => f.setForm({ ...f.form, city: v })} cities={meta.cities} placeholder="—" /></Field>
        <button className="btn-primary w-full" disabled={f.busy}>{t('common.saveChanges')}</button>
      </form>
    </Modal>
  );
}

function UserCreateModal({ onClose, onSaved }) {
  const { t } = useI18n();
  const { meta, notify } = useApp();
  const f = useEditForm({ name: '', phone: '', email: '', password: '', accountType: 'individual', role: 'user', city: '', isVerified: false }, []);
  const fieldError = useFieldError(f.error);
  const submit = async (e) => {
    e.preventDefault();
    f.setBusy(true);
    try {
      await api('/admin/users', { method: 'POST', body: f.form });
      notify(t('admin.userCreated', { name: f.form.name }));
      onSaved();
    } catch (err) { f.setError(err); } finally { f.setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={t('admin.addUser')}>
      <form onSubmit={submit} className="space-y-3" noValidate>
        <ErrorBox error={f.error && !f.error.fields ? f.error : null} />
        <Field label={t('auth.name')} error={fieldError('name')}><input className="input" required value={f.form.name} onChange={f.set('name')} /></Field>
        <Field label={t('auth.phone')} error={fieldError('phone')} hint={t('admin.addUserPhoneHint')}><PhoneInput value={f.form.phone} onChange={(v) => f.setForm({ ...f.form, phone: v })} /></Field>
        <Field label={t('auth.email')} error={fieldError('email')} optional><input className="input" type="email" dir="ltr" value={f.form.email} onChange={f.set('email')} /></Field>
        <Field label={t('auth.password')} error={fieldError('password')} hint={t('admin.addUserPasswordHint')}>
          <input className="input" type="text" dir="ltr" autoComplete="new-password" required value={f.form.password} onChange={f.set('password')} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('auth.accountType')}>
            <select className="input" value={f.form.accountType} onChange={f.set('accountType')}>
              {['buyer', 'individual', 'merchant'].map((v) => <option key={v} value={v}>{t(`roles.${v}`)}</option>)}
            </select>
          </Field>
          <Field label={t('admin.role')}>
            <select className="input" value={f.form.role} onChange={f.set('role')}>
              <option value="user">{t('admin.userRole')}</option><option value="admin">{t('admin.adminRole')}</option>
            </select>
          </Field>
        </div>
        <Field label={t('form.city')} optional><CitySelect value={f.form.city} onChange={(v) => f.setForm({ ...f.form, city: v })} cities={meta.cities} placeholder="—" /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.form.isVerified} onChange={(e) => f.setForm({ ...f.form, isVerified: e.target.checked })} />{t('admin.verify')} ✓</label>
        <button className="btn-primary w-full" disabled={f.busy}>{f.busy ? t('common.loading') : t('admin.addUser')}</button>
      </form>
    </Modal>
  );
}
