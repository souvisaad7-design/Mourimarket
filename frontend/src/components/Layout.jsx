import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { DEFAULT_FOOTER, DEFAULT_HEADER, resolveLink } from '../lib/menus.js';
import { useI18n } from '../i18n/index.jsx';
import { LANGS } from '../i18n/messages.js';
import { InstallPrompt, OfflineBanner, ThemeToggle } from './AppChrome.jsx';
import { SearchBar } from './SearchBar.jsx';
import { Avatar, CategoryIcon, Icon, Logo, SiteMark } from './ui.jsx';

function Badge({ n }) {
  if (!n) return null;
  return (
    <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
      {n > 99 ? '99+' : n}
    </span>
  );
}

/** Phones: one tap between Arabic and French (English stays in the menu). */
function QuickLang() {
  const { lang, setLang } = useI18n();
  const next = lang === 'ar' ? 'fr' : 'ar';
  return (
    <button type="button" onClick={() => setLang(next)} lang={next}
      aria-label={next === 'fr' ? 'Français' : 'العربية'} title={next === 'fr' ? 'Français' : 'العربية'}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 text-xs font-bold leading-none text-white hover:bg-white/10">
      {next === 'fr' ? 'FR' : 'ع'}
    </button>
  );
}

/** Phones: "📍 All cities" under the search bar: opens the listings of one city. */
function CityChip() {
  const { t, lang } = useI18n();
  const { meta } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname === '/products' ? new URLSearchParams(location.search).get('city') || '' : '';
  const name = meta.cities.find((c) => c.key === current)?.[lang];
  const choose = (key) => {
    const params = location.pathname === '/products' ? new URLSearchParams(location.search) : new URLSearchParams();
    if (key) params.set('city', key); else params.delete('city');
    params.delete('page');
    navigate(`/products${params.toString() ? `?${params}` : ''}`);
  };
  return (
    <label className="relative mt-1.5 inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full bg-white/10 pe-2.5 ps-3 text-xs font-semibold text-white ring-1 ring-white/20 hover:bg-white/15">
      <span aria-hidden="true">📍</span>
      <span>{name || t('common.allCities')}</span>
      <Icon name="chevronDown" className="h-3.5 w-3.5 opacity-80" />
      <select value={current} onChange={(e) => choose(e.target.value)} aria-label={t('common.allCities')}
        className="absolute inset-0 cursor-pointer opacity-0 [&>option]:text-slate-900">
        <option value="">{t('common.allCities')}</option>
        {meta.cities.map((c) => <option key={c.key} value={c.key}>{c[lang]}</option>)}
      </select>
    </label>
  );
}

export function LangSwitcher({ compact, dark = false }) {
  const { lang, setLang } = useI18n();
  if (dark) {
    return (
      <label className="relative flex items-center gap-1 text-white">
        <Icon name="globe" className="pointer-events-none h-4 w-4" />
        <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value)}
          className="cursor-pointer appearance-none bg-transparent pe-1 text-xs font-semibold text-white focus:outline-none [&>option]:text-slate-900">
          {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        <Icon name="chevronDown" className="pointer-events-none h-3 w-3" />
      </label>
    );
  }
  return (
    <label className="relative flex items-center text-slate-600">
      <Icon name="globe" className="pointer-events-none absolute start-2 h-4 w-4" />
      <select
        aria-label="Language"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className={`cursor-pointer appearance-none rounded-lg border border-slate-200 bg-surface py-1.5 pe-2 ps-7 text-sm hover:bg-slate-50 ${compact ? 'w-full' : ''}`}
      >
        {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </label>
  );
}

function UserMenu() {
  const { user, logout } = useApp();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const item = 'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100';
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-gold-300" aria-expanded={open} aria-haspopup="menu">
        <Avatar name={user.name} url={user.avatar_url} size="h-9 w-9" />
      </button>
      {open && (
        <div role="menu" className="card absolute end-0 z-40 mt-2 w-60 p-2" onClick={() => setOpen(false)}>
          <div className="border-b border-slate-100 px-3 pb-2 pt-1">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="pt-1">
            <Link className={item} to="/dashboard"><Icon name="grid" className="h-4 w-4" />{user.account_type === 'buyer' ? t('nav.myAccount') : t('nav.dashboard')}</Link>
            <Link className={item} to="/profile"><Icon name="shield" className="h-4 w-4" />{t('card.title')}</Link>
            {user.account_type === 'merchant' && <Link className={item} to="/dashboard/store"><Icon name="store" className="h-4 w-4" />{t('nav.myStore')}</Link>}
            <Link className={item} to="/orders"><span className="w-4 text-center" aria-hidden="true">📦</span>{t('delivery.nav.orders')}</Link>
            <Link className={item} to="/courier"><span className="w-4 text-center" aria-hidden="true">🛵</span>{t('delivery.nav.courier')}</Link>
            <Link className={item} to="/favorites"><Icon name="heart" className="h-4 w-4" />{t('nav.favorites')}</Link>
            <Link className={item} to="/profile"><Icon name="user" className="h-4 w-4" />{t('nav.profile')}</Link>
            {user.role === 'admin' && <Link className={item} to="/admin"><Icon name="shield" className="h-4 w-4" />{t('nav.admin')}</Link>}
            <button className={`${item} w-full text-rose-600`} onClick={() => { logout(); navigate('/'); }}>
              <Icon name="logout" className="h-4 w-4" />{t('nav.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Thin green strip above the header (desktop). */
const ANNOUNCE_TONES = { brand: 'bg-brand-700 text-white', gold: 'bg-gold-400 text-ink', rose: 'bg-rose-600 text-white' };

/** Site-wide announcement the admin writes in the panel (Settings → Announcement). */
function AnnouncementBar() {
  const { t } = useI18n();
  const { announcement } = useSettings().settings;
  const text = t('announcement.text');
  if (!announcement?.enabled || !text || text === 'announcement.text') return null;
  const marquee = announcement.style === 'marquee';
  const label = <span className="font-semibold">{text}{announcement.link && <span aria-hidden="true"> ←</span>}</span>;
  // Scrolling text: the sentence repeats across the bar; it stays still for people who ask for less motion.
  const body = marquee ? (
    <span className="mm-marquee" aria-label={text}>
      <span className="mm-marquee-track" aria-hidden="true">{[0, 1, 2, 3].map((i) => <span key={i} className="px-10">{label}</span>)}</span>
    </span>
  ) : label;
  const cls = `block overflow-hidden px-4 py-2 text-center text-sm ${ANNOUNCE_TONES[announcement.tone] || ANNOUNCE_TONES.gold}`;
  if (!announcement.link) return <div className={cls} role="note">{body}</div>;
  return /^https?:/.test(announcement.link)
    ? <a href={announcement.link} target="_blank" rel="noreferrer" className={`${cls} hover:brightness-95`}>{body}</a>
    : <Link to={announcement.link} className={`${cls} hover:brightness-95`}>{body}</Link>;
}

const SOCIAL = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['x', 'X'], ['youtube', 'YouTube']];

function SocialLinks() {
  const { social } = useSettings().settings;
  const links = SOCIAL.filter(([k]) => social?.[k]);
  if (!links.length) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {links.map(([k, label]) => (
        <li key={k}><a href={social[k]} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-800">{label}</a></li>
      ))}
    </ul>
  );
}

function TopBar() {
  const { t } = useI18n();
  return (
    <div className="hidden bg-brand-800 text-white md:block">
      <div className="container-page flex h-9 items-center justify-between text-xs">
        <p className="flex items-center gap-2 font-semibold"><Icon name="heart" className="h-4 w-4" />{t('brand.topTagline')}</p>
        <div className="flex items-center divide-x divide-white/25 rtl:divide-x-reverse">
          <div className="px-3"><LangSwitcher dark /></div>
          <Link to="/about#contact" className="flex items-center gap-1.5 px-3 hover:text-gold-300"><Icon name="mail" className="h-4 w-4" />{t('nav.contact')}</Link>
          <Link to="/help" className="flex items-center gap-1.5 px-3 hover:text-gold-300"><Icon name="help" className="h-4 w-4" />{t('nav.help')}</Link>
        </div>
      </div>
    </div>
  );
}

/** "Categories" menu item with a drop-down list. */
function CategoriesMenu({ navCls }) {
  const { t, tl } = useI18n();
  const { categories } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const { pathname, search } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname, search]);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu"
        className={navCls({ isActive: pathname === '/categories' })}>
        <Icon name="grid" className="h-4 w-4" />{t('nav.categories')}<Icon name="chevronDown" className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="card absolute start-0 top-full z-40 mt-2 grid w-[34rem] animate-fade-in grid-cols-3 gap-1 p-2">
          {categories.map((c) => (
            <Link key={c.id} role="menuitem" to={`/products?category=${c.slug}`} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50">
              <span className="text-xl" aria-hidden="true"><CategoryIcon icon={c.icon} /></span>{tl(c)}
            </Link>
          ))}
          <Link to="/categories" className="col-span-3 mt-1 rounded-xl px-3 py-2 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50">{t('home.allCategories')}</Link>
        </div>
      )}
    </div>
  );
}

function Header() {
  const { user, counts } = useApp();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // The header is dark green (design colours): links are light, the current one is sand-gold.
  const navCls = ({ isActive }) => `relative flex items-center gap-1.5 px-3 py-3 text-sm font-semibold transition ${
    isActive ? 'text-gold-300 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-gold-400' : 'text-white/85 hover:text-gold-300'}`;
  const mobileCls = ({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-100'}`;
  const offersActive = location.pathname === '/products' && new URLSearchParams(location.search).has('deals');
  // The public "search listings" box is for shoppers; hide it inside the admin panel.
  const inAdmin = location.pathname.startsWith('/admin');
  // Top menu: the admin's list (Admin → Menus) or the built-in one.
  const { lang } = useI18n();
  const custom = useSettings().settings.menu?.header;
  const items = (custom || DEFAULT_HEADER).map((it) => resolveLink(it, t, lang)).filter(Boolean);
  const mobileItems = custom ? items : [...items, resolveLink({ type: 'builtin', key: 'help' }, t, lang)];
  const here = location.pathname + location.search;
  const isActiveLink = (l) => {
    if (l.key === 'offers') return offersActive;
    if (l.key === 'products') return location.pathname === '/products' && !offersActive && !location.search.includes('category=');
    if (l.end) return location.pathname === l.to;
    return l.to.includes('?') ? here === l.to : location.pathname === l.to || location.pathname.startsWith(`${l.to}/`);
  };
  const renderLink = (l, cls, mobile = false) => {
    if (l.dropdown && !mobile) return <CategoriesMenu key={l.key} navCls={cls} />;
    const content = <>{l.emoji ? <span aria-hidden="true">{l.emoji}</span> : l.icon ? <Icon name={l.icon} className="h-4 w-4" /> : null}{l.label}</>;
    if (l.external) return <a key={l.key} href={l.to} target="_blank" rel="noreferrer" className={cls({ isActive: false })}>{content}</a>;
    return <Link key={l.key} to={l.to} className={cls({ isActive: isActiveLink(l) })} aria-current={isActiveLink(l) ? 'page' : undefined}>{content}</Link>;
  };

  return (
    <>
      <TopBar />
      <header className="site-header sticky top-0 z-30 border-b border-brand-800 bg-brand-900 text-white">
        <div className="container-page flex h-16 items-center gap-3 md:h-[76px] md:gap-6">
          <button className="btn-ghost -ms-2 p-2 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label={t('nav.menu')} aria-expanded={mobileOpen}>
            <Icon name={mobileOpen ? 'x' : 'menu'} />
          </button>
          <Logo size="lg" onDark />
          {!inAdmin && <div className="mx-auto hidden w-full max-w-xl md:block"><SearchBar compact /></div>}
          <div className="ms-auto flex shrink-0 items-center gap-1 sm:gap-2 md:ms-0">
            <div className="hidden sm:block"><ThemeToggle /></div>
            {user ? (
              <>
                {/* Phones have Messages in the bottom bar: the language button takes its place here */}
                <div className="sm:hidden"><QuickLang /></div>
                <Link to="/messages" className="btn-ghost relative hidden p-2 sm:inline-flex" aria-label={t('nav.messages')} title={t('nav.messages')}>
                  <Icon name="chat" /><Badge n={counts.messages} />
                </Link>
                <Link to="/notifications" className="btn-ghost relative p-2" aria-label={t('nav.notifications')} title={t('nav.notifications')}>
                  <Icon name="bell" /><Badge n={counts.notifications} />
                </Link>
                <UserMenu />
                {user.account_type !== 'buyer' && <Link to="/sell" className="btn-accent hidden rounded-full lg:inline-flex"><Icon name="plus" className="h-4 w-4" />{t('nav.post')}</Link>}
              </>
            ) : (
              <>
                <div className="sm:hidden"><QuickLang /></div>
                <Link to="/login" className="btn hidden rounded-full border-2 border-white/60 px-5 text-white hover:bg-white/10 sm:inline-flex">
                  <Icon name="user" className="h-4 w-4" />{t('nav.loginShort')}
                </Link>
                <Link to="/register" className="btn rounded-full bg-gold-400 px-5 text-ink hover:bg-gold-500">
                  <Icon name="userPlus" className="h-4 w-4" /><span className="hidden sm:inline">{t('nav.register')}</span>
                </Link>
              </>
            )}
          </div>
        </div>
        {/* Phones: search under the logo row */}
        {!inAdmin && <div className="container-page pb-2 md:hidden"><SearchBar compact /><CityChip /></div>}
        {/* Desktop navigation */}
        <nav className="hidden border-t border-white/10 lg:block">
          <div className="container-page flex items-center justify-center gap-2">
            {items.map((l) => renderLink(l, navCls))}
          </div>
        </nav>
        {mobileOpen && (
          <div className="on-light border-t border-slate-200 bg-surface text-slate-800 lg:hidden">
            <nav className="container-page flex flex-col gap-1 py-3">
              {mobileItems.map((l) => renderLink(l, mobileCls, true))}
              {!user && <NavLink to="/login" className={mobileCls}><Icon name="user" className="h-4 w-4" />{t('nav.login')}</NavLink>}
              <div className="flex items-center gap-2 pt-2"><div className="flex-1"><LangSwitcher compact /></div><ThemeToggle withLabel /></div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

function Footer() {
  const { t, tl, lang, siteName } = useI18n();
  const { categories } = useApp();
  const { menu, delivery } = useSettings().settings;
  const custom = menu?.footer;
  const links = (custom || DEFAULT_FOOTER).map((it) => resolveLink(it, t, lang)).filter(Boolean);
  return (
    <footer className="mt-16 border-t border-slate-200 bg-surface pb-[calc(110px+env(safe-area-inset-bottom))] sm:pb-0">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-slate-600">{t('footer.about')}</p>
          <p className="mt-2 text-sm font-semibold text-brand-700">{t('brand.tagline')}</p>
          <SocialLinks />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold">{t('nav.categories')}</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {categories.slice(0, 5).map((c) => (
              <li key={c.id}><Link className="hover:text-brand-700" to={`/products?category=${c.slug}`}>{tl(c)}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold">{t('footer.links')}</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {links.map((l) => (
              <li key={l.key}>
                {l.external
                  ? <a className="hover:text-brand-700" href={l.to} target="_blank" rel="noreferrer">{l.label}</a>
                  : <Link className="hover:text-brand-700" to={l.to}>{l.key === 'products' ? t('nav.products') : l.label}</Link>}
              </li>
            ))}
            {delivery?.enabled && <li><Link className="font-semibold text-brand-700 hover:text-brand-900" to="/courier">🛵 {t('delivery.nav.join')}</Link></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {siteName} — {t('footer.rights')}
      </div>
    </footer>
  );
}

/** Bottom navigation for phones. */
function MobileTabBar() {
  const { t } = useI18n();
  const { user, counts } = useApp();
  const cls = ({ isActive }) => `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? 'text-brand-700' : 'text-slate-500'}`;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
      <NavLink to="/" end className={cls}><Icon name="grid" />{t('nav.home')}</NavLink>
      <NavLink to="/products" className={cls}><Icon name="search" />{t('common.search')}</NavLink>
      <NavLink to="/sell" className={cls}>
        <span className="-mt-5 rounded-full bg-gold-400 p-3 text-ink shadow-lg"><Icon name="plus" /></span>{t('nav.post')}
      </NavLink>
      <NavLink to={user ? '/messages' : '/login'} className={cls}>
        <span className="relative"><Icon name="chat" /><Badge n={counts.messages} /></span>{t('nav.messages')}
      </NavLink>
      <NavLink to={user ? '/dashboard' : '/login'} className={cls}><Icon name="user" />{user ? t('nav.myAccount') : t('nav.login')}</NavLink>
    </nav>
  );
}

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 sm:bottom-6" role="status" aria-live="polite">
      <div className={`rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${toast.type === 'error' ? 'bg-rose-600' : 'bg-ink'}`}>
        {toast.message}
      </div>
    </div>
  );
}

/** Shown to visitors while the admin has the site in maintenance mode. */
function MaintenanceScreen() {
  const { t, lang, siteName } = useI18n();
  const { maintenance } = useSettings().settings;
  const message = maintenance.message?.[lang] || maintenance.message?.ar || t('maintenance.text');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-6 text-center text-white">
      <SiteMark className="h-20 w-20" onDark />
      <p className="text-2xl font-bold">{siteName}</p>
      <div className="max-w-md rounded-3xl bg-white/10 p-6 backdrop-blur">
        <p className="mb-2 flex items-center justify-center gap-2 text-lg font-bold"><Icon name="clock" className="h-5 w-5" />{t('maintenance.title')}</p>
        <p className="whitespace-pre-line leading-relaxed text-white/90">{message}</p>
      </div>
      <div className="flex items-center gap-3"><LangSwitcher compact dark /><Link to="/admin/login" className="text-xs text-white/60 hover:text-white">{t('maintenance.adminLink')}</Link></div>
    </div>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const { user } = useApp();
  const { t } = useI18n();
  const { maintenance } = useSettings().settings;
  // Listing pages have their own bottom action bar on phones.
  const onListing = /^\/products\/\d+$/.test(pathname);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  if (maintenance?.enabled && user?.role !== 'admin') return <MaintenanceScreen />;
  return (
    <div className="flex min-h-screen flex-col">
      {maintenance?.enabled && <p className="bg-rose-600 px-4 py-1.5 text-center text-xs font-semibold text-white">{t('maintenance.adminNotice')} <Link to="/admin/appearance" className="underline">{t('maintenance.turnOff')}</Link></p>}
      <AnnouncementBar />
      <Header />
      <OfflineBanner />
      <main className={`flex-1 ${onListing ? '' : 'pb-[calc(90px+env(safe-area-inset-bottom))] sm:pb-0'}`}><Outlet /></main>
      <Footer />
      {!onListing && <MobileTabBar />}
      <Toast />
      <InstallPrompt />
    </div>
  );
}
