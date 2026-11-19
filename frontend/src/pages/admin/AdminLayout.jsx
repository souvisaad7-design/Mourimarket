import { Suspense, useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../../components/AppChrome.jsx';
import { LangSwitcher, Toast } from '../../components/Layout.jsx';
import { ErrorBox, Field, Icon, SiteMark, Spinner, StatusBadge, useCityName } from '../../components/ui.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { api } from '../../lib/api.js';
import { useApi, useDocumentTitle } from '../../lib/hooks.js';

// Sidebar sections of the admin area. `count` names a field of /admin/stats totals shown as a badge.
const NAV = [
  ['dashboard', [['', 'overview', 'grid']]],
  ['review', [
    ['listings', 'listings', 'image', 'pending_products'], ['merchants', 'merchantsTab', 'store', 'pending_merchants'],
    ['reports', 'reports', 'flag', 'open_reports'], ['requests', 'requests', 'star', 'pending_upgrades'],
  ]],
  ['manage', [
    ['users', 'users', 'user'], ['stores', 'stores', 'store'], ['categories', 'categories', 'filter'], ['cities', 'cities', 'pin'],
    ['reviews', 'reviews', 'star'], ['files', 'files', 'image'],
  ]],
  ['site', [
    ['appearance', 'appearance', 'star'], ['banner', 'banner', 'image'], ['alerts', 'alerts', 'bell'], ['payments', 'payments', 'phone'],
    ['settings', 'siteSettings', 'globe'], ['menus', 'menus', 'menu'], ['pages', 'customPages', 'edit'],
    ['texts', 'siteTexts', 'edit'], ['sitemap', 'sitemap.title', 'link'],
  ]],
  ['account', [['account', 'adminAccount', 'shield']]],
];

function AdminNav({ totals, onNavigate }) {
  const { t, number } = useI18n();
  const { meta } = useApp();
  return (
    <nav aria-label={t('admin.title')} className="space-y-5">
      {NAV.map(([group, items]) => (
        <div key={group}>
          <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">{t(`admin.nav.${group}`)}</p>
          <ul className="space-y-0.5">
            {items.filter(([path]) => path !== 'requests' || meta.upgrades).map(([path, key, icon, count]) => {
              const n = count ? Number(totals?.[count] || 0) : 0;
              return (
                <li key={key}>
                  <NavLink to={`/admin${path ? `/${path}` : ''}`} end={!path} onClick={onNavigate}
                    className={({ isActive }) => `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-brand-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                    <Icon name={icon} className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{t(`admin.${key}`)}</span>
                    {n > 0 && <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white ltr-nums">{number(n)}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** The admin area: its own full-screen layout (sidebar + top bar), separate from the public site. */
export default function AdminLayout() {
  const { t } = useI18n();
  const { user } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const stats = useApi('/admin/stats', undefined, [pathname]);
  useDocumentTitle(t('admin.title'));
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  // The sign-in page does the sign-out, so it never sends the next admin back to this page.
  const signOut = () => navigate('/admin/login', { replace: true, state: { logout: true } });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-surface/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <button type="button" className="btn-ghost p-2 lg:hidden" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="admin-sidebar" aria-label={t('nav.menu')}>
            <Icon name={open ? 'x' : 'menu'} />
          </button>
          <Link to="/admin" className="flex items-center gap-2">
            <SiteMark className="h-8 w-8" />
            <span className="font-bold">{t('admin.title')}</span>
          </Link>
          <div className="ms-auto flex items-center gap-1.5">
            <LangSwitcher compact />
            <ThemeToggle />
            <a href="/" target="_blank" rel="noreferrer" className="btn-outline hidden px-3 py-1.5 text-xs sm:inline-flex"><Icon name="globe" className="h-4 w-4" />{t('admin.viewSite')}</a>
            <span className="hidden max-w-[10rem] truncate text-sm font-semibold text-slate-700 md:block">{user?.name}</span>
            <button type="button" onClick={signOut} className="btn-ghost px-2.5 py-1.5 text-xs text-rose-600"><Icon name="logout" className="h-4 w-4" /><span className="hidden sm:inline">{t('nav.logout')}</span></button>
          </div>
        </div>
      </header>
      <div className="flex">
        {open && <div className="fixed inset-0 top-14 z-20 bg-ink/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}
        <aside id="admin-sidebar"
          className={`fixed inset-y-0 top-14 z-20 w-64 shrink-0 overflow-y-auto border-e border-slate-200 bg-surface p-3 transition-transform start-0 lg:sticky lg:block lg:h-[calc(100vh-3.5rem)] ${open ? '' : 'max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full'}`}>
          <AdminNav totals={stats.data?.totals} onNavigate={() => setOpen(false)} />
          <a href="/" target="_blank" rel="noreferrer" className="btn-outline mt-6 w-full text-xs sm:hidden"><Icon name="globe" className="h-4 w-4" />{t('admin.viewSite')}</a>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<Spinner />}><Outlet /></Suspense>
        </main>
      </div>
      <Toast />
    </div>
  );
}

/** Admin sign-in with email and password, at /admin/login. */
export function AdminLogin() {
  const { t } = useI18n();
  const { user, login, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  useDocumentTitle(t('admin.loginTitle'));
  const { siteName: siteNameShown } = useI18n();
  const leaving = Boolean(location.state?.logout);
  useEffect(() => { if (leaving) logout(); }, [leaving, logout]);
  if (user?.role === 'admin' && !leaving) return <Navigate to={location.state?.from || '/admin'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { token, user: u } = await api('/auth/login', { method: 'POST', body: form });
      if (u.role !== 'admin') { logout(); setError({ code: 'admin_only' }); return; }
      login(token, u);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) { setError(err); } finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-white">
          <SiteMark className="h-14 w-14" onDark />
          <p className="text-lg font-bold">{siteNameShown}</p>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6" noValidate>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold"><Icon name="shield" className="h-5 w-5 text-brand-700" />{t('admin.loginTitle')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('admin.loginSubtitle')}</p>
          </div>
          <ErrorBox error={error} />
          <Field label={t('auth.email')}>
            <input className="input" type="email" autoComplete="username" required value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} dir="ltr" />
          </Field>
          <Field label={t('auth.password')}>
            <input className="input" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} dir="ltr" />
          </Field>
          <button className="btn-primary w-full" disabled={busy}>{busy ? t('common.loading') : t('nav.login')}</button>
          <a href="/" className="block text-center text-xs text-slate-500 hover:text-brand-700">{t('admin.backToSite')}</a>
        </form>
      </div>
      <Toast />
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
  violet: { card: 'border-violet-200 bg-violet-50 hover:border-violet-300', label: 'text-violet-900', count: 'text-violet-700', go: 'bg-violet-100 text-violet-800 group-hover:bg-violet-200' },
  sky: { card: 'border-sky-200 bg-sky-50 hover:border-sky-300', label: 'text-sky-900', count: 'text-sky-700', go: 'bg-sky-100 text-sky-800 group-hover:bg-sky-200' },
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

/** Headline figure: listings that are published and still for sale, with their share of all listings. */
function ActiveListingsCard({ live, total }) {
  const { t, number } = useI18n();
  const pct = Number(total) ? Math.round((Number(live) / Number(total)) * 100) : 0;
  return (
    <Link to="/admin/listings?status=approved"
      className="group relative block overflow-hidden rounded-3xl bg-gradient-to-l from-brand-800 to-brand-600 p-5 text-white shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 sm:p-6">
      <span aria-hidden="true" className="absolute -top-10 end-[-2.5rem] h-40 w-40 rounded-full bg-white/10" />
      <span className="relative flex items-center justify-between gap-4">
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-sm font-semibold text-brand-100"><Icon name="grid" className="h-4 w-4" />{t('admin.activeListings')}</span>
          <span className="mt-1 block text-4xl font-bold ltr-nums sm:text-5xl">{number(live)}</span>
          <span className="mt-1 block text-xs text-brand-100">{t('admin.activeListingsSub', { total: number(total) })}</span>
        </span>
        <span className="flex shrink-0 flex-col items-center gap-1">
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20"
            style={{ background: `conic-gradient(rgb(var(--gold-400)) ${pct * 3.6}deg, rgba(255,255,255,.18) 0)` }}>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-700 text-sm font-bold ltr-nums sm:h-16 sm:w-16 sm:text-base">{pct}%</span>
          </span>
          <Icon name="chevron" className="h-5 w-5 text-brand-100 transition-transform rtl:rotate-180 group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
        </span>
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
    ['all', t('admin.totalListings'), totals.products], ['sold', t('dashboard.soldCount'), totals.sold_products],
    ['stores', t('admin.stores'), totals.stores], ['messages', t('admin.messagesCount'), totals.messages],
    ['views', t('admin.totalViews'), totals.views], ['new', t('admin.newUsers7d'), totals.new_users_7d],
  ];

  return (
    <div className="space-y-6">
      <ActiveListingsCard live={totals.live_products} total={totals.products} />
      <div className={`grid gap-3 md:grid-cols-3 ${meta.upgrades ? 'xl:grid-cols-4' : ''}`}>
        <QueueCard to="/admin/listings?status=pending" label={t('admin.pendingQueue')} count={totals.pending_products} tone="amber" />
        <QueueCard to="/admin/merchants" label={t('admin.merchantRequests')} count={totals.pending_merchants} tone="violet" />
        {meta.upgrades && <QueueCard to="/admin/requests" label={t('admin.pendingUpgrades')} count={totals.pending_upgrades} tone="sky" />}
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
