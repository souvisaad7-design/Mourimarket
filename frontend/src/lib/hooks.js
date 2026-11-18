import { getSiteName } from '../context/SettingsContext.jsx';
import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

/** Load data from the API; re-runs when `deps` change. Returns { data, error, loading, reload, setData }. */
export function useApi(path, options, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!path) return undefined;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path, options)
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((error) => !cancelled && setState({ data: null, error, loading: false }));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick, ...deps]);

  const setData = useCallback((fn) => setState((s) => ({ ...s, data: typeof fn === 'function' ? fn(s.data) : fn })), []);
  return { ...state, reload, setData };
}

export function useDocumentTitle(title) {
  useEffect(() => {
    const name = getSiteName();
    document.title = title ? `${title} · ${name}` : name;
  }, [title]);
}
