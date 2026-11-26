// Admin → Souk AI: switches, model and limits, cost monitoring, and the fraud-detection queue.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorBox, Field, Spinner } from '../../components/ui.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { api } from '../../lib/api.js';
import { useApi, useDocumentTitle } from '../../lib/hooks.js';

const FEATURES = ['assistant', 'describe', 'visual', 'translate', 'fraud'];
const MODELS = ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'];
const usd = (v) => `$${Number(v || 0).toFixed(Number(v) < 1 ? 4 : 2)}`;

function Stat({ label, value, hint }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold ltr-nums" dir="ltr">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function SettingsCard({ onSaved }) {
  const { t } = useI18n();
  const { notify, reloadMeta } = useApp();
  const { data, loading, error } = useApi('/admin/settings');
  const [ai, setAi] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState(null);
  useEffect(() => { if (data?.settings?.ai) setAi(structuredClone(data.settings.ai)); }, [data]);
  if (loading || !ai) return error ? <ErrorBox error={error} /> : <Spinner />;
  const put = (patch) => setAi((a) => ({ ...a, ...patch }));
  const num = (k) => (e) => put({ [k]: e.target.value === '' ? '' : Number(e.target.value) });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setSaveError(null);
    try {
      await api('/admin/settings', { method: 'PUT', body: { ai } });
      notify(t('common.changesSaved'));
      reloadMeta();
      onSaved();
    } catch (err) { setSaveError(err); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="card space-y-4 p-5">
      <h2 className="font-bold">⚙️ {t('ai.admin.settings')}</h2>
      <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
        <span><span className="block text-sm font-semibold">{t('ai.admin.enabled')}</span><span className="text-xs text-slate-500">{t('ai.admin.enabledHint')}</span></span>
        <input type="checkbox" className="h-5 w-5" checked={ai.enabled} onChange={(e) => put({ enabled: e.target.checked })} />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <label key={f} className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-sm">
            <input type="checkbox" checked={ai.features[f] !== false} onChange={(e) => put({ features: { ...ai.features, [f]: e.target.checked } })} />
            {t(`ai.admin.feature.${f}`)}
          </label>
        ))}
      </div>
      <p className="text-xs text-slate-500">{t('ai.admin.freeFeatures')}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t('ai.admin.model')} hint={t('ai.admin.modelHint')}>
          <select className="input" dir="ltr" value={ai.model} onChange={(e) => put({ model: e.target.value })}>
            {MODELS.map((m) => <option key={m} value={m}>{t(`ai.admin.models.${m}`)}</option>)}
          </select>
        </Field>
        <Field label={t('ai.admin.userDaily')} hint={t('ai.admin.userDailyHint')}>
          <input className="input" type="number" min="1" max="500" dir="ltr" value={ai.userDaily} onChange={num('userDaily')} required />
        </Field>
        <Field label={t('ai.admin.dailyBudget')} hint={t('ai.admin.budgetHint')}>
          <input className="input" type="number" min="0" step="0.5" dir="ltr" value={ai.dailyBudgetUsd} onChange={num('dailyBudgetUsd')} required />
        </Field>
        <Field label={t('ai.admin.monthlyBudget')}>
          <input className="input" type="number" min="0" step="1" dir="ltr" value={ai.monthlyBudgetUsd} onChange={num('monthlyBudgetUsd')} required />
        </Field>
      </div>
      <ErrorBox error={saveError} />
      <button className="btn-primary" disabled={busy}>{busy ? t('common.loading') : t('common.save')}</button>
    </form>
  );
}

function Usage({ data }) {
  const { t, number } = useI18n();
  const u = data.usage;
  const max = Math.max(0.0001, ...u.daily.map((d) => d.usd));
  return (
    <section className="space-y-3">
      <h2 className="font-bold">📊 {t('ai.admin.usage')}</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t('ai.admin.todayCost')} value={usd(u.today_usd)} hint={t('ai.admin.ofBudget', { b: usd(data.budget?.daily) })} />
        <Stat label={t('ai.admin.monthCost')} value={usd(u.month_usd)} hint={t('ai.admin.ofBudget', { b: usd(data.budget?.monthly) })} />
        <Stat label={t('ai.admin.todayCalls')} value={number(u.today_calls)} hint={u.today_errors ? t('ai.admin.errors', { n: u.today_errors }) : null} />
        <Stat label={t('ai.admin.monthUsers')} value={number(u.month_users)} />
      </div>
      {u.daily.length > 0 && (
        <div className="card p-4">
          <p className="mb-2 text-xs text-slate-500">{t('ai.admin.last14')}</p>
          <div className="flex h-28 items-end gap-1" dir="ltr">
            {u.daily.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${usd(d.usd)} · ${d.calls}`}>
                <div className="w-full rounded-t bg-emerald-500" style={{ height: `${(d.usd / max) * 100}%`, minHeight: 2 }} />
                <span className="text-[9px] text-slate-400">{d.day.slice(8)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {u.byFeature.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500"><tr>
              <th className="p-2.5 text-start">{t('ai.admin.featureCol')}</th><th className="p-2.5 text-start">{t('ai.admin.callsCol')}</th>
              <th className="p-2.5 text-start">{t('ai.admin.errorsCol')}</th><th className="p-2.5 text-start">{t('ai.admin.tokensCol')}</th><th className="p-2.5 text-start">{t('ai.admin.costCol')}</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {u.byFeature.map((f) => (
                <tr key={f.feature}>
                  <td className="p-2.5">{t(`ai.admin.feature.${f.feature}`)}</td>
                  <td className="p-2.5 ltr-nums">{number(f.calls)}</td>
                  <td className="p-2.5 ltr-nums">{number(f.errors)}</td>
                  <td className="p-2.5 ltr-nums">{number(Number(f.tokens))}</td>
                  <td className="p-2.5 ltr-nums" dir="ltr">{usd(f.usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Flags({ onChange }) {
  const { t, price, ago } = useI18n();
  const [status, setStatus] = useState('open');
  const { data, loading, error, reload } = useApi(`/ai/admin/flags?status=${status}`, undefined, [status]);
  const [busy, setBusy] = useState(null);
  const act = async (f, action) => {
    if (action === 'disable_user' && !window.confirm(t('ai.admin.disableConfirm', { name: f.user_name || '' }))) return;
    setBusy(f.id);
    try { await api(`/ai/admin/flags/${f.id}`, { method: 'PATCH', body: { action } }); reload(); onChange(); } finally { setBusy(null); }
  };
  const tone = { high: 'bg-rose-100 text-rose-700', medium: 'bg-amber-100 text-amber-800', low: 'bg-slate-100 text-slate-600' };
  return (
    <section className="space-y-3">
      <h2 className="font-bold">🛡️ {t('ai.admin.fraud')}</h2>
      <p className="text-xs text-slate-500">{t('ai.admin.fraudHint')}</p>
      <div className="flex gap-1.5">
        {['open', 'actioned', 'dismissed'].map((s) => (
          <button key={s} type="button" onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status === s ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'}`}>{t(`ai.admin.flagStatus.${s}`)}</button>
        ))}
      </div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState icon="shield" title={t('ai.admin.noFlags')} /> : (
        <ul className="space-y-2">
          {data.items.map((f) => (
            <li key={f.id} className="card flex flex-wrap items-start gap-3 p-3">
              {f.cover_url && <img src={f.cover_url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`badge ${tone[f.risk]}`}>{t(`ai.admin.risk.${f.risk}`)}</span>
                  <span className="badge bg-slate-100 text-slate-600">{f.source === 'ai' ? '✨ AI' : `⚙️ ${t('ai.admin.rules')}`}</span>
                  <span className="text-xs text-slate-400">{ago(f.created_at)}</span>
                </div>
                {f.product_id ? (
                  <Link to={`/products/${f.product_id}`} className="block truncate font-semibold hover:underline">{f.product_title} · <span className="ltr-nums">{price(f.price)}</span></Link>
                ) : <p className="font-semibold">{f.user_name}</p>}
                <p className="text-xs text-slate-500">👤 <Link to={`/users/${f.user_id}`} className="hover:underline">{f.user_name}</Link>{f.user_active === false ? ` · ${t('ai.admin.userDisabled')}` : ''}</p>
                {f.summary && <p className="text-sm">{f.summary}</p>}
                <ul className="flex flex-wrap gap-1">
                  {(f.reasons || []).map((r) => {
                    const label = t(`ai.admin.reason.${r}`);
                    return <li key={r} className="rounded bg-rose-50 px-1.5 py-0.5 text-[11px] text-rose-700">{label.startsWith('ai.admin.reason.') ? r : label}</li>;
                  })}
                </ul>
              </div>
              {f.status === 'open' && (
                <div className="flex flex-wrap gap-1.5">
                  {f.product_id && <button className="btn px-3 py-1.5 text-xs bg-rose-50 text-rose-700 hover:bg-rose-100" disabled={busy === f.id} onClick={() => act(f, 'reject_listing')}>{t('ai.admin.rejectListing')}</button>}
                  {f.user_id && <button className="btn-outline px-3 py-1.5 text-xs" disabled={busy === f.id} onClick={() => act(f, 'disable_user')}>{t('ai.admin.disableUser')}</button>}
                  <button className="btn-ghost px-3 py-1.5 text-xs" disabled={busy === f.id} onClick={() => act(f, 'dismiss')}>{t('ai.admin.dismiss')}</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AdminAI() {
  const { t } = useI18n();
  useDocumentTitle('Souk AI');
  const overview = useApi('/ai/admin/overview');
  const settings = useApi('/admin/settings');
  const reload = () => { overview.reload(); settings.reload(); };
  const ai = settings.data?.settings?.ai;
  const data = overview.data && { ...overview.data, budget: ai && { daily: ai.dailyBudgetUsd, monthly: ai.monthlyBudgetUsd } };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">✨ Souk AI</h1>
        <p className="text-sm text-slate-500">{t('ai.admin.intro')}</p>
      </div>
      {overview.data && !overview.data.keyConfigured && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">🔑 {t('ai.admin.noKey')}</p>
          <p className="mt-1">{t('ai.admin.noKeyHelp')}</p>
        </div>
      )}
      <ErrorBox error={overview.error} />
      <SettingsCard onSaved={reload} />
      {data ? <Usage data={data} /> : <Spinner />}
      <Flags onChange={overview.reload} />
    </div>
  );
}
