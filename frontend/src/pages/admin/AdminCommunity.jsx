// Admin → Social & Live: switches, the moderation queue (posts, comments, lives, live chat) and lives on air.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorBox, Field, Spinner } from '../../components/ui.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { api } from '../../lib/api.js';
import { useApi, useDocumentTitle } from '../../lib/hooks.js';

function Settings() {
  const { t } = useI18n();
  const { notify } = useApp();
  const { data } = useApi('/admin/settings');
  const [c, setC] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { if (data?.settings?.community) setC(structuredClone(data.settings.community)); }, [data]);
  if (!c) return <Spinner />;
  const num = (k) => (e) => setC({ ...c, [k]: Number(e.target.value) });
  const save = async (e) => {
    e.preventDefault(); setError(null);
    try { await api('/admin/settings', { method: 'PUT', body: { community: c } }); notify(t('common.changesSaved')); } catch (err) { setError(err); }
  };
  return (
    <form onSubmit={save} className="card space-y-3 p-5">
      <h2 className="font-bold">⚙️ {t('community.settings')}</h2>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={c.enabled} onChange={(e) => setC({ ...c, enabled: e.target.checked })} /> {t('community.enabled')}</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={c.liveEnabled} onChange={(e) => setC({ ...c, liveEnabled: e.target.checked })} /> {t('community.liveEnabled')}</label>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t('community.hostFanout')} hint={t('community.hostFanoutHint')}><input className="input" type="number" min="1" max="10" dir="ltr" value={c.hostFanout} onChange={num('hostFanout')} /></Field>
        <Field label={t('community.relayFanout')} hint={t('community.relayFanoutHint')}><input className="input" type="number" min="0" max="4" dir="ltr" value={c.relayFanout} onChange={num('relayFanout')} /></Field>
        <Field label={t('community.maxDepth')}><input className="input" type="number" min="1" max="10" dir="ltr" value={c.maxDepth} onChange={num('maxDepth')} /></Field>
        <Field label={t('community.autoHide')} hint={t('community.autoHideHint')}><input className="input" type="number" min="2" max="100" dir="ltr" value={c.autoHideReports} onChange={num('autoHideReports')} /></Field>
      </div>
      <p className="text-xs text-slate-500">{t('community.capacity', { n: (() => { let total = 0; let level = c.hostFanout; for (let d = 1; d <= c.maxDepth; d += 1) { total += level; level *= c.relayFanout; if (!level) break; } return total; })() })}</p>
      <ErrorBox error={error} />
      <button className="btn-primary">{t('common.save')}</button>
    </form>
  );
}

function Reports({ onChange }) {
  const { t, ago } = useI18n();
  const [status, setStatus] = useState('open');
  const { data, loading, error, reload } = useApi(`/social/admin/reports?status=${status}`, undefined, [status]);
  const [busy, setBusy] = useState(null);
  const handle = async (r, action, banDays = 0) => {
    if (banDays && !window.confirm(t('community.banConfirm', { name: r.target?.owner || '', n: banDays }))) return;
    setBusy(`${r.target_type}-${r.target_id}`);
    try {
      await api('/social/admin/reports/handle', { method: 'POST', body: { targetType: r.target_type, targetId: r.target_id, action, banDays } });
      reload(); onChange();
    } finally { setBusy(null); }
  };
  return (
    <section className="space-y-3">
      <h2 className="font-bold">🚩 {t('community.reports')}</h2>
      <div className="flex gap-1.5">
        {['open', 'resolved', 'dismissed'].map((s) => (
          <button key={s} type="button" onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status === s ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'}`}>{t(`community.reportStatus.${s}`)}</button>
        ))}
      </div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState icon="shield" title={t('community.noReports')} /> : (
        <ul className="space-y-2">
          {data.items.map((r) => {
            const key = `${r.target_type}-${r.target_id}`;
            const img = r.target?.media?.find?.((m) => m.type === 'image');
            return (
              <li key={key} className="card flex flex-wrap items-start gap-3 p-3">
                {img && <img src={img.url} alt="" className="h-14 w-14 rounded-lg object-cover" />}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="badge bg-slate-100 text-slate-700">{t(`community.target.${r.target_type}`)}</span>
                    <span className="badge bg-rose-100 text-rose-700">{t('community.nReports', { n: r.reports })}</span>
                    {r.reasons.map((x) => <span key={x} className="badge bg-amber-50 text-amber-800">{t(`social.reasons.${x}`)}</span>)}
                    {r.target?.status && r.target.status !== 'published' && r.target.status !== 'live' && <span className="badge bg-slate-200 text-slate-600">{r.target.status}</span>}
                    <span className="text-slate-400">{ago(r.last_at)}</span>
                  </div>
                  <p className="line-clamp-3 text-sm">{r.target?.text || '—'}</p>
                  {r.details && <p className="text-xs text-slate-500">“{r.details}”</p>}
                  <p className="text-xs text-slate-500">👤 <Link to={`/users/${r.target?.owner_id}`} className="hover:underline">{r.target?.owner}</Link> · {r.target?.link && <Link to={r.target.link} className="link">{t('community.open')}</Link>}</p>
                </div>
                {status === 'open' && (
                  <div className="flex flex-wrap gap-1.5">
                    <button type="button" className="btn px-3 py-1.5 text-xs bg-rose-50 text-rose-700" disabled={busy === key} onClick={() => handle(r, 'remove')}>{t('community.remove')}</button>
                    <button type="button" className="btn px-3 py-1.5 text-xs bg-rose-600 text-white" disabled={busy === key} onClick={() => handle(r, 'remove', 7)}>{t('community.removeBan')}</button>
                    {r.target_type === 'post' && r.target?.status === 'hidden' && <button type="button" className="btn-outline px-3 py-1.5 text-xs" disabled={busy === key} onClick={() => handle(r, 'restore')}>{t('community.restore')}</button>}
                    <button type="button" className="btn-ghost px-3 py-1.5 text-xs" disabled={busy === key} onClick={() => handle(r, 'dismiss')}>{t('community.dismiss')}</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Lives({ onChange }) {
  const { t, number, ago } = useI18n();
  const { data, loading, reload } = useApi('/live/admin/list');
  const stop = async (l) => {
    const reason = window.prompt(t('community.stopReason'));
    if (reason === null) return;
    await api(`/live/admin/${l.id}/stop`, { method: 'POST', body: { reason } });
    reload(); onChange();
  };
  return (
    <section className="space-y-3">
      <h2 className="font-bold">🔴 {t('community.lives')}</h2>
      {loading ? <Spinner /> : !data?.items?.length ? <p className="text-sm text-slate-500">{t('live.noneNow')}</p> : (
        <ul className="space-y-2">
          {data.items.map((l) => (
            <li key={l.id} className="card flex flex-wrap items-center gap-3 p-3 text-sm">
              <span className={`badge ${l.status === 'live' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{t(`live.status.${l.status}`)}</span>
              <Link to={`/live/${l.id}`} className="min-w-0 flex-1 truncate font-semibold hover:underline">{l.title}</Link>
              <span className="text-xs text-slate-500">{l.host_name} · 👁 <span className="ltr-nums">{number(l.viewers)}</span> · {ago(l.created_at)}</span>
              {l.reports > 0 && <span className="badge bg-rose-100 text-rose-700">🚩 {l.reports}</span>}
              {['live', 'scheduled'].includes(l.status) && <button type="button" className="btn px-3 py-1.5 text-xs bg-rose-600 text-white" onClick={() => stop(l)}>{t('community.stopLive')}</button>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AdminCommunity() {
  const { t, number } = useI18n();
  useDocumentTitle('Souk Social & Live');
  const ov = useApi('/social/admin/overview');
  const o = ov.data || {};
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">💬 Souk Social & 🔴 Souk Live</h1>
        <p className="text-sm text-slate-500">{t('community.intro')}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['posts', o.posts], ['postsToday', o.posts_today], ['openReports', o.open_reports], ['liveNow', o.live_now], ['scheduled', o.live_scheduled], ['hidden', o.hidden_posts], ['follows', o.follows], ['banned', o.banned]].map(([k, v]) => (
          <div key={k} className="card p-4"><p className="text-xs text-slate-500">{t(`community.stat.${k}`)}</p><p className="mt-1 text-xl font-bold ltr-nums">{number(v || 0)}</p></div>
        ))}
      </div>
      <Reports onChange={ov.reload} />
      <Lives onChange={ov.reload} />
      <Settings />
    </div>
  );
}
