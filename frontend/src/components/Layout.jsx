import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { LANGS } from '../i18n/messages.js';
import { InstallPrompt, OfflineBanner, ThemeToggle } from './AppChrome.jsx';
import { Avatar, Icon, Logo } from './ui.jsx';

function Badge({ n }) {
  if (!n) return null;
  return (
    <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
      {n > 99 ? '99+' : n}
    </span>
  );
}

function LangSwitcher({ compact }) {
  const { lang, setLang } = useI18n();
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

function Header() {
  const { user, counts } = useApp();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navCls = ({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100'}`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-surface/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-3">
        <button className="btn-ghost -ms-2 p-2 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label={t('nav.menu')}>
          <Icon name={mobileOpen ? 'x' : 'menu'} />
        </button>
        <Logo />
        <nav className="ms-4 hidden items-center gap-1 lg:flex">
          <NavLink to="/products" className={navCls}>{t('nav.products')}</NavLink>
          <NavLink to="/categories" className={navCls}>{t('nav.categories')}</NavLink>
          <NavLink to="/stores" className={navCls}>{t('nav.stores')}</NavLink>
        </nav>
        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:block"><LangSwitcher /></div>
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
            </>
          ) : (
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">{t('nav.login')}</Link>
          )}
          <Link to="/sell" className="btn-accent hidden sm:inline-flex"><Icon name="plus" className="h-4 w-4" />{t('nav.post')}</Link>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-surface lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-3">
            <NavLink to="/" end className={navCls}>{t('nav.home')}</NavLink>
            <NavLink to="/products" className={navCls}>{t('nav.products')}</NavLink>
            <NavLink to="/categories" className={navCls}>{t('nav.categories')}</NavLink>
            <NavLink to="/stores" className={navCls}>{t('nav.stores')}</NavLink>
            {!user && <NavLink to="/login" className={navCls}>{t('nav.login')}</NavLink>}
            {!user && <NavLink to="/register" className={navCls}>{t('nav.register')}</NavLink>}
            <div className="flex items-center gap-2 pt-2"><div className="flex-1"><LangSwitcher compact /></div><ThemeToggle withLabel /></div>
          </nav>
        </div>
      )}
    </header>
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
