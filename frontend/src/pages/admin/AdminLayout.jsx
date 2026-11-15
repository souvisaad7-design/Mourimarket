import { Link, NavLink, Outlet } from 'react-router-dom';
import { ErrorBox, Icon, Spinner, useCityName } from '../../components/ui.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { useApi, useDocumentTitle } from '../../lib/hooks.js';

const TABS = [
  ['', 'overview', 'grid'], ['listings', 'listings', 'image'], ['reports', 'reports', 'flag'],
  ['users', 'users', 'user'], ['stores', 'stores', 'store'], ['categories', 'categories', 'filter'],
];

export default function AdminLayout() {
  const { t } = useI18n();
  useDocumentTitle(t('admin.title'));
  return (
    <div className="container-page py-6">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold"><Icon name="shield" className="h-6 w-6 text-brand-700" />{t('admin.title')}</h1>
      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-slate-200">
        {TABS.map(([path, key, icon]) => (
          <NavLink key={key} to={`/admin${path ? `/${path}` : ''}`} end={!path}
            className={({ isActive }) => `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Icon name={icon} className="h-4 w-4" />{t(`admin.${key}`)}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}

/** Horizontal bars: one hue, value labels on every bar so no legend is needed. */
function BarList({ rows, label, value }) {
  const { number } = useI18n();
  const max = Math.max(1, ...rows.map(value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={i} className="text-sm">
          <div className="mb-1 flex justify-between gap-2"><span className="truncate text-slate-700">{label(r)}</span><span className="font-semibold ltr-nums">{number(value(r))}</span></div>
          <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand-600" style={{ width: `${(value(r) / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

/** Daily columns for two series, drawn side by side with a direct legend. */
function DailyChart({ rows }) {
  const { t, lang } = useI18n();
  const max = Math.max(1, ...rows.flatMap((r) => [r.products, r.users]));
  return (
    <div>
      <div className="mb-3 flex gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-600" />{t('admin.newListings')}</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gold-400" />{t('admin.newUsers')}</span>
      </div>
      <div className="flex h-40 items-end gap-1" dir="ltr" role="img" aria-label={t('admin.activity')}>
        {rows.map((r) => (
          <div key={r.day} className="group relative flex h-full flex-1 items-end justify-center gap-0.5">
            <div className="w-1/2 rounded-t bg-brand-600" style={{ height: `${(r.products / max) * 100}%`, minHeight: r.products ? 3 : 0 }} />
            <div className="w-1/2 rounded-t bg-gold-400" style={{ height: `${(r.users / max) * 100}%`, minHeight: r.users ? 3 : 0 }} />
            <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] text-white group-hover:block">
              {new Date(r.day).toLocaleDateString(lang === 'ar' ? 'ar-u-nu-latn' : lang, { day: 'numeric', month: 'short' })}: {r.products} / {r.users}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400" dir="ltr">
        <span>{rows[0]?.day.slice(5)}</span><span>{rows[rows.length - 1]?.day.slice(5)}</span>
      </div>
    </div>
  );
}

export function AdminOverview() {
  const { t, tl, number } = useI18n();
  const { meta } = useApp();
  const getCityName = useCityName();
  const { data, loading, error } = useApi('/admin/stats');
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} />;
  const { totals, byCategory, byCity, daily } = data;
  const cityName = (k) => getCityName(meta.cities, k);

  const tiles = [
    ['users', t('admin.users'), totals.users], ['merchants', t('admin.merchants'), totals.merchants],
    ['live', t('dashboard.live'), totals.live_products], ['sold', t('dashboard.soldCount'), totals.sold_products],
    ['stores', t('admin.stores'), totals.stores], ['messages', t('admin.messagesCount'), totals.messages],
    ['views', t('admin.totalViews'), totals.views], ['new', t('admin.newUsers7d'), totals.new_users_7d],
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/admin/listings?status=pending" className="card flex items-center justify-between border-amber-300 bg-amber-50 p-5 hover:shadow-md">
          <span className="font-semibold text-amber-900">{t('admin.pendingQueue')}</span>
          <span className="text-3xl font-bold text-amber-700 ltr-nums">{number(totals.pending_products)}</span>
        </Link>
        <Link to="/admin/reports" className="card flex items-center justify-between border-rose-200 bg-rose-50 p-5 hover:shadow-md">
          <span className="font-semibold text-rose-900">{t('admin.openReports')}</span>
          <span className="text-3xl font-bold text-rose-700 ltr-nums">{number(totals.open_reports)}</span>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(([k, label, v]) => (
          <div key={k} className="card p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold ltr-nums">{number(v)}</p></div>
        ))}
      </div>
      <div className="card p-5"><h2 className="mb-4 font-bold">{t('admin.activity')}</h2><DailyChart rows={daily} /></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5"><h2 className="mb-4 font-bold">{t('admin.byCategory')}</h2><BarList rows={byCategory} label={(r) => tl(r)} value={(r) => r.n} /></div>
        <div className="card p-5"><h2 className="mb-4 font-bold">{t('admin.byCity')}</h2><BarList rows={byCity} label={(r) => cityName(r.city)} value={(r) => r.n} /></div>
      </div>
    </div>
  );
}
