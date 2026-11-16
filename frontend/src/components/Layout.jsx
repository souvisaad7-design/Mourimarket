import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { LANGS } from '../i18n/messages.js';
import { InstallPrompt, OfflineBanner, ThemeToggle } from './AppChrome.jsx';
import { SearchBar } from './SearchBar.jsx';
import { Avatar, Icon, Logo } from './ui.jsx';

function Badge({ n }) {
  if (!n) return null;
  return (
    <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
      {n > 99 ? '99+' : n}
    </span>
  );
}

function LangSwitcher({ compact, dark = false }) {
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
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-brand-100" aria-expanded={open} aria-haspopup="menu">
        <Avatar name={user.name} url={user.avatar_url} size="h-9 w-9" />
      </button>
      {open && (
        <div role="menu" className="card absolute end-0 z-40 mt-2 w-60 p-2" onClick={() => setOpen(false)}>
          <div className="border-b border-slate-100 px-3 pb-2 pt-1">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="pt-1">
            <Link className={item} to="/dashboard"><Icon name="grid" className="h-4 w-4" />{t('nav.dashboard')}</Link>
            {user.account_type === 'merchant' && <Link className={item} to="/dashboard/store"><Icon name="store" className="h-4 w-4" />{t('nav.myStore')}</Link>}
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
              <span className="text-xl" aria-hidden="true">{c.icon}</span>{tl(c)}
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

  const navCls = ({ isActive }) => `relative flex items-center gap-1.5 px-3 py-3 text-sm font-semibold transition ${
    isActive ? 'text-brand-700 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand-700' : 'text-slate-700 hover:text-brand-700'}`;
  const mobileCls = ({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-100'}`;
  const offersActive = location.pathname === '/products' && new URLSearchParams(location.search).has('deals');

  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-surface/95 backdrop-blur">
        <div className="container-page flex h-16 items-center gap-3 md:h-[76px] md:gap-6">
          <button className="btn-ghost -ms-2 p-2 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label={t('nav.menu')} aria-expanded={mobileOpen}>
            <Icon name={mobileOpen ? 'x' : 'menu'} />
          </button>
          <Logo size="lg" />
          <div className="mx-auto hidden w-full max-w-xl md:block"><SearchBar compact /></div>
          <div className="ms-auto flex items-center gap-1.5 sm:gap-2 md:ms-0">
            <div className="hidden sm:block"><ThemeToggle /></div>
            {user ? (
              <>
                <Link to="/messages" className="btn-ghost relative p-2" aria-label={t('nav.messages')} title={t('nav.messages')}>
                  <Icon name="chat" /><Badge n={counts.messages} />
                </Link>
                <Link to="/notifications" className="btn-ghost relative p-2" aria-label={t('nav.notifications')} title={t('nav.notifications')}>
                  <Icon name="bell" /><Badge n={counts.notifications} />
                </Link>
                <UserMenu />
                <Link to="/sell" className="btn-accent hidden rounded-full lg:inline-flex"><Icon name="plus" className="h-4 w-4" />{t('nav.post')}</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn hidden rounded-full border-2 border-brand-700 px-5 text-brand-700 hover:bg-brand-50 sm:inline-flex">
                  <Icon name="user" className="h-4 w-4" />{t('nav.loginShort')}
                </Link>
                <Link to="/register" className="btn rounded-full bg-brand-700 px-5 text-white hover:bg-brand-800">
                  <Icon name="userPlus" className="h-4 w-4" /><span className="hidden sm:inline">{t('nav.register')}</span>
                </Link>
              </>
            )}
          </div>
        </div>
        {/* Phones: search under the logo row */}
        <div className="container-page pb-3 md:hidden"><SearchBar compact /></div>
        {/* Desktop navigation */}
        <nav className="hidden border-t border-slate-100 lg:block">
          <div className="container-page flex items-center justify-center gap-2">
            <NavLink to="/" end className={navCls}><Icon name="home" className="h-4 w-4" />{t('nav.home')}</NavLink>
            <NavLink to="/products" end className={({ isActive }) => navCls({ isActive: isActive && !offersActive && !location.search.includes('category=') })}>
              <Icon name="grid" className="h-4 w-4" />{t('nav.allProducts')}
            </NavLink>
            <CategoriesMenu navCls={navCls} />
            <NavLink to="/stores" className={navCls}><Icon name="store" className="h-4 w-4" />{t('nav.stores')}</NavLink>
            <Link to="/products?deals=1" className={navCls({ isActive: offersActive })}><span aria-hidden="true">🔥</span>{t('nav.offers')}</Link>
            <NavLink to="/about" className={navCls}><Icon name="info" className="h-4 w-4" />{t('nav.about')}</NavLink>
          </div>
        </nav>
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-surface lg:hidden">
            <nav className="container-page flex flex-col gap-1 py-3">
              <NavLink to="/" end className={mobileCls}><Icon name="home" className="h-4 w-4" />{t('nav.home')}</NavLink>
              <NavLink to="/products" end className={mobileCls}><Icon name="grid" className="h-4 w-4" />{t('nav.allProducts')}</NavLink>
              <NavLink to="/categories" className={mobileCls}><Icon name="grid" className="h-4 w-4" />{t('nav.categories')}</NavLink>
              <NavLink to="/stores" className={mobileCls}><Icon name="store" className="h-4 w-4" />{t('nav.stores')}</NavLink>
              <Link to="/products?deals=1" className={mobileCls({ isActive: offersActive })}><span aria-hidden="true">🔥</span>{t('nav.offers')}</Link>
              <NavLink to="/about" className={mobileCls}><Icon name="info" className="h-4 w-4" />{t('nav.about')}</NavLink>
              <NavLink to="/help" className={mobileCls}><Icon name="help" className="h-4 w-4" />{t('nav.help')}</NavLink>
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
  const { t } = useI18n();
  const { categories } = useApp();
  const { tl } = useI18n();
  return (
    <footer className="mt-16 border-t border-slate-200 bg-surface pb-20 sm:pb-0">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-slate-600">{t('footer.about')}</p>
          <p className="mt-2 text-sm font-semibold text-brand-700">{t('brand.tagline')}</p>
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
            <li><Link className="hover:text-brand-700" to="/products">{t('nav.products')}</Link></li>
            <li><Link className="hover:text-brand-700" to="/stores">{t('nav.stores')}</Link></li>
            <li><Link className="hover:text-brand-700" to="/sell">{t('nav.post')}</Link></li>
            <li><Link className="hover:text-brand-700" to="/products?deals=1">{t('nav.offers')}</Link></li>
            <li><Link className="hover:text-brand-700" to="/about">{t('nav.about')}</Link></li>
            <li><Link className="hover:text-brand-700" to="/help">{t('nav.help')}</Link></li>
            <li><Link className="hover:text-brand-700" to="/safety">{t('footer.safety')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} MauriMarket — {t('footer.rights')}
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
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-surface sm:hidden">
      <NavLink to="/" end className={cls}><Icon name="grid" />{t('nav.home')}</NavLink>
      <NavLink to="/products" className={cls}><Icon name="search" />{t('common.search')}</NavLink>
      <NavLink to="/sell" className={cls}>
        <span className="-mt-5 rounded-full bg-gold-400 p-3 text-ink shadow-lg"><Icon name="plus" /></span>{t('nav.post')}
      </NavLink>
      <NavLink to={user ? '/messages' : '/login'} className={cls}>
        <span className="relative"><Icon name="chat" /><Badge n={counts.messages} /></span>{t('nav.messages')}
      </NavLink>
      <NavLink to={user ? '/dashboard' : '/login'} className={cls}><Icon name="user" />{user ? t('nav.dashboard').split(' ')[0] : t('nav.login')}</NavLink>
    </nav>
  );
}

function Toast() {
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

export default function Layout() {
  const { pathname } = useLocation();
  // Listing pages have their own bottom action bar on phones.
  const onListing = /^\/products\/\d+$/.test(pathname);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <OfflineBanner />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      {!onListing && <MobileTabBar />}
      <Toast />
      <InstallPrompt />
    </div>
  );
}
