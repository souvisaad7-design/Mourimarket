// My statistics: views per day, where visitors come from, reply rate and speed, best listings.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorBox, Icon, PageHeader, Spinner } from '../components/ui.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

function Tile({ label, value, hint }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold ltr-nums">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

// Axis labels as plain digits (day/month), so they read the same in every language.
const dm = (d) => `${Number(d.slice(8, 10))}/${Number(d.slice(5, 7))}`;

/** Views per day: one series, bars with rounded tops on a shared baseline, value on hover/focus. */
function DailyBars({ rows }) {
  const { t, number, date } = useI18n();
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...rows.map((r) => r.views));
  const shown = hover ?? rows.length - 1;
  return (
    <div>
      <p className="mb-2 h-5 text-sm text-slate-600" aria-live="polite">
        <span className="font-semibold">{date(rows[shown].day)}</span> · <span className="ltr-nums">{number(rows[shown].views)}</span> {t('stats.viewsUnit')}
      </p>
      <div className="flex h-40 items-end gap-[2px] border-b border-slate-300" dir="ltr" role="img" aria-label={t('stats.daily')} onMouseLeave={() => setHover(null)}>
        {rows.map((r, i) => (
          <button key={r.day} type="button" className="group relative flex h-full min-w-0 flex-1 items-end focus:outline-none" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)}
            aria-label={`${date(r.day)}: ${r.views}`}>
            <span className={`block w-full rounded-t-[4px] transition-colors ${hover === i ? 'bg-brand-800' : 'bg-brand-600'} group-focus-visible:ring-2 group-focus-visible:ring-gold-400`}
              style={{ height: `${r.views ? Math.max(3, (r.views / max) * 100) : 0}%` }} />
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-slate-400 ltr-nums" dir="ltr"><span>{dm(rows[0].day)}</span><span>{dm(rows.at(-1).day)}</span></div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-xs text-brand-700">{t('stats.asTable')}</summary>
        <table className="mt-2 w-full text-xs"><tbody>
          {rows.slice().reverse().map((r) => <tr key={r.day} className="border-b border-slate-100"><td className="py-1">{date(r.day)}</td><td className="py-1 text-end ltr-nums">{number(r.views)}</td></tr>)}
        </tbody></table>
      </details>
    </div>
  );
}

/** Sources: horizontal bars, one hue, labelled with the name and the number. */
function SourceBars({ rows }) {
  const { t, number } = useI18n();
  const total = rows.reduce((a, r) => a + r.views, 0);
  if (!total) return <p className="text-sm text-slate-500">{t('stats.noViews')}</p>;
  const max = Math.max(...rows.map((r) => r.views));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.source}>
          <div className="mb-1 flex justify-between text-sm"><span>{t(`stats.source.${r.source}`)}</span><span className="text-slate-600 ltr-nums">{number(r.views)} · {Math.round((r.views / total) * 100)}%</span></div>
          <div className="h-2.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${(r.views / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

export default function SellerStats() {
  const { t, number, price } = useI18n();
  const [days, setDays] = useState(30);
  const { data, loading, error } = useApi(`/seller/stats?days=${days}`, undefined, [days]);
  useDocumentTitle(t('stats.title'));
  const s = data?.totals;
  const speed = (m) => (m == null ? '—' : m < 60 ? t('stats.minutes', { n: m }) : m < 1440 ? t('stats.hours', { n: Math.round(m / 60) }) : t('stats.daysN', { n: Math.round(m / 1440) }));
  return (
    <div className="container-page max-w-5xl py-8">
      <PageHeader title={`📊 ${t('stats.title')}`}>
        <div role="group" aria-label={t('stats.period')} className="flex rounded-xl bg-slate-100 p-1">
          {[7, 30, 90].map((d) => (
            <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${days === d ? 'bg-surface shadow' : 'text-slate-600'}`}>{t('stats.lastDays', { n: d })}</button>
          ))}
        </div>
      </PageHeader>
      <ErrorBox error={error} />
      {loading && !data ? <Spinner /> : data && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Tile label={t('stats.views')} value={number(s.views)} />
            <Tile label={t('stats.chats')} value={number(s.chats)} />
            <Tile label={t('stats.replyRate')} value={s.replyRate == null ? '—' : `${s.replyRate}%`} hint={t('stats.replySpeed', { v: speed(s.medianReplyMinutes) })} />
            <Tile label={t('stats.favorites')} value={number(s.favorites)} hint={t('stats.live', { n: number(s.live) })} />
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <section className="card p-5"><h2 className="mb-3 font-bold">{t('stats.daily')}</h2><DailyBars rows={data.daily} /></section>
            <section className="card p-5"><h2 className="mb-3 font-bold">{t('stats.sources')}</h2><SourceBars rows={data.sources} /><p className="mt-3 text-[11px] text-slate-400">{t('stats.sourcesHint')}</p></section>
          </div>
          <section className="card overflow-x-auto p-5">
            <h2 className="mb-3 font-bold">{t('stats.top')}</h2>
            {!data.top.length ? <p className="text-sm text-slate-500">{t('stats.noListings')}</p> : (
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500"><tr><th className="py-1 text-start font-semibold">{t('stats.listing')}</th><th className="text-end font-semibold">{t('stats.views')}</th><th className="text-end font-semibold">{t('stats.favorites')}</th><th className="text-end font-semibold">{t('stats.chats')}</th></tr></thead>
                <tbody>
                  {data.top.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="py-2"><Link to={`/products/${p.id}`} className="font-semibold hover:underline">{p.title}</Link><span className="block text-xs text-slate-400 ltr-nums">{price(p.price)}</span></td>
                      <td className="text-end ltr-nums">{number(p.views)}</td><td className="text-end ltr-nums">{number(p.favorites)}</td><td className="text-end ltr-nums">{number(p.chats)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
          <p className="text-xs text-slate-500"><Icon name="info" className="me-1 inline h-3.5 w-3.5" />{t('stats.tip')}</p>
        </div>
      )}
    </div>
  );
}
