import { Link, NavLink, Outlet } from 'react-router-dom';
import { ErrorBox, Icon, Spinner, StatusBadge, useCityName } from '../../components/ui.jsx';
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
      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-surface p-1 ring-1 ring-slate-200">
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
            <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-[11px] text-white group-hover:block">
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

const TONES = {
  amber: { card: 'border-amber-300 bg-amber-50 hover:border-amber-400', label: 'text-amber-900', count: 'text-amber-700', go: 'bg-amber-100 text-amber-800 group-hover:bg-amber-200' },
  rose: { card: 'border-rose-200 bg-rose-50 hover:border-rose-300', label: 'text-rose-900', count: 'text-rose-700', go: 'bg-rose-100 text-rose-700 group-hover:bg-rose-200' },
};

/** Clickable shortcut to a moderation queue, with an arrow showing where it leads. */
function QueueCard({ to, label, count, tone }) {
  const { t, number } = useI18n();
  const c = TONES[tone];
  return (
    <Link to={to} aria-label={`${label}: ${count} — ${t('admin.reviewNow')}`}
      className={`card group flex items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${c.card}`}>
      <span className="min-w-0">
        <span className={`block font-semibold ${c.label}`}>{label}</span>
        <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${c.go}`}>
          {t('admin.reviewNow')}
          <Icon name="arrow" className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1 ltr:rotate-180 ltr:group-hover:translate-x-1" />
        </span>
      </span>
      <span className="flex items-center gap-3">
        <span className={`text-3xl font-bold ltr-nums ${c.count}`}>{number(count)}</span>
        <Icon name="chevron" className={`h-6 w-6 transition-transform rtl:rotate-180 group-hover:-translate-x-1 ltr:group-hover:translate-x-1 ${c.count}`} />
      </span>
    </Link>
  );
}

export function AdminOverview() {
  const { t, tl, number } = useI18n();
  const { meta } = useApp();
  const getCityName = useCityName();
  const { data, loading, error } = useApi('/admin/stats');
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} />;
  const { totals, byCategory, byCity, daily, recent = [] } = data;
  const cityName = (k) => getCityName(meta.cities, k);

  const tiles = [
    ['users', t('admin.users'), totals.users], ['merchants', t('admin.merchants'), totals.merchants],
    ['featured', t('admin.featuredCount'), totals.featured_products], ['verified', t('admin.verifiedCount'), totals.verified_users],
    ['live', t('dashboard.live'), totals.live_products], ['sold', t('dashboard.soldCount'), totals.sold_products],
    ['stores', t('admin.stores'), totals.stores], ['messages', t('admin.messagesCount'), totals.messages],
    ['views', t('admin.totalViews'), totals.views], ['new', t('admin.newUsers7d'), totals.new_users_7d],
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <QueueCard to="/admin/listings?status=pending" label={t('admin.pendingQueue')} count={totals.pending_products} tone="amber" />
        <QueueCard to="/admin/reports" label={t('admin.openReports')} count={totals.open_reports} tone="rose" />
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
      <RecentActivity items={recent} />
    </div>
  );
}

/** "Latest activity": the 5 newest listings or newly registered users. */
function RecentActivity({ items }) {
  const { t, ago, dateTime, price } = useI18n();
  return (
    <section className="card p-5" aria-labelledby="recent-activity">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="recent-activity" className="flex items-center gap-2 font-bold"><Icon name="clock" className="h-5 w-5 text-brand-700" />{t('admin.recentActivity')}</h2>
        <div className="flex gap-2 text-xs">
          <Link to="/admin/listings?status=all" className="link">{t('admin.listings')}</Link>
          <span className="text-slate-300">·</span>
          <Link to="/admin/users" className="link">{t('admin.users')}</Link>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">{t('admin.noActivity')}</p>
      ) : (
        <ol className="divide-y divide-slate-100">
          {items.map((it) => {
            const isListing = it.kind === 'listing';
            const to = isListing ? `/products/${it.id}` : `/users/${it.id}`;
            return (
              <li key={`${it.kind}-${it.id}`}>
                <Link to={to} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50">
                  {it.image ? (
                    <img src={it.image} alt="" className={`h-11 w-11 shrink-0 object-cover ${isListing ? 'rounded-lg' : 'rounded-full'}`} />
                  ) : (
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center ${isListing ? 'rounded-lg bg-slate-100 text-slate-400' : 'rounded-full bg-brand-100 font-bold text-brand-800'}`}>
                      {isListing ? <Icon name="image" className="h-5 w-5" /> : (it.label || '?').trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className={`badge ${isListing ? 'bg-brand-50 text-brand-800' : 'bg-sky-100 text-sky-700'}`}>
                        <Icon name={isListing ? 'plus' : 'userPlus'} className="me-1 h-3 w-3" />{isListing ? t('admin.newListing') : t('admin.newUser')}
                      </span>
                      {isListing ? <StatusBadge status={it.status} /> : <span className="badge bg-slate-100 text-slate-600">{t(`roles.${it.account_type}`)}</span>}
                    </span>
                    <span className="mt-1 block truncate text-sm font-semibold text-slate-900">{it.label}</span>
                    <span className="flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500">
                      {isListing ? (
                        <>
                          <span className="min-w-0 truncate">{t('admin.by', { name: it.actor })}</span>
                          <span aria-hidden="true">·</span>
                          <span className="whitespace-nowrap font-semibold text-slate-700 ltr-nums">{price(it.price)}</span>
                        </>
                      ) : t('admin.joinedThePlatform')}
                    </span>
                    {/* phones: time under the text, so nothing gets cut off */}
                    <time dateTime={it.created_at} title={dateTime(it.created_at)} className="mt-0.5 block text-[11px] text-slate-400 sm:hidden">{ago(it.created_at)}</time>
                  </span>
                  <time dateTime={it.created_at} title={dateTime(it.created_at)} className="hidden shrink-0 text-xs text-slate-400 sm:block">{ago(it.created_at)}</time>
                  <Icon name="chevron" className="h-4 w-4 shrink-0 text-slate-300 rtl:rotate-180" />
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
