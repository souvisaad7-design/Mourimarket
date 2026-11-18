import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, setToken, getToken } from '../lib/api.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ cities: [], reportReasons: [] });
  const [counts, setCounts] = useState({ notifications: 0, messages: 0 });
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  const notify = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) { setUser(null); return null; }
    try {
      const { user: u } = await api('/auth/me');
      setUser(u);
      return u;
    } catch {
      setToken(null);
      setUser(null);
      return null;
    }
  }, []);

  const refreshCounts = useCallback(async () => {
    if (!getToken()) return;
    try { setCounts(await api('/notifications/summary')); } catch { /* ignore */ }
  }, []);

  const loadCategories = useCallback(async () => {
    try { setCategories((await api('/categories')).items); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    Promise.all([refreshUser(), loadCategories(), api('/meta').then(setMeta).catch(() => {})]).finally(() => setReady(true));
    const onUnauthorized = () => { setToken(null); setUser(null); };
    window.addEventListener('mm:unauthorized', onUnauthorized);
    return () => window.removeEventListener('mm:unauthorized', onUnauthorized);
  }, [refreshUser, loadCategories]);

  // Poll badge counts while logged in.
  useEffect(() => {
    if (!user) { setCounts({ notifications: 0, messages: 0 }); return undefined; }
    refreshCounts();
    const id = setInterval(refreshCounts, 20000);
    return () => clearInterval(id);
  }, [user, refreshCounts]);

  const login = useCallback((token, u) => { setToken(token); setUser(u); refreshUser(); }, [refreshUser]);
  const logout = useCallback(() => { setToken(null); setUser(null); }, []);
  const reloadMeta = useCallback(() => api('/meta').then(setMeta).catch(() => {}), []);
  // Cities, prices and categories are edited in /admin: refresh them when the visitor comes back to the tab.
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') { reloadMeta(); loadCategories(); } };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [reloadMeta, loadCategories]);

  const value = useMemo(
    () => ({ user, ready, login, logout, refreshUser, categories, loadCategories, meta, reloadMeta, counts, refreshCounts, notify, toast }),
    [user, ready, login, logout, refreshUser, categories, loadCategories, meta, reloadMeta, counts, refreshCounts, notify, toast],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
