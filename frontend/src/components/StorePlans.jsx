// Monthly store plans: current plan, featured credits, and the plans on sale (when paid services are on).
import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { UpgradeModal } from './Upgrades.jsx';

export function StorePlans({ store, onChange }) {
  const { t, price, date, lang } = useI18n();
  const { meta } = useApp();
  const [buy, setBuy] = useState(null);
  const plans = meta.upgrades?.storePlans || [];
  if (!plans.length || !store) return null;
  const active = store.plan && new Date(store.plan_until) > new Date();
  const current = plans.find((p) => p.key === store.plan);
  return (
    <section className="card mb-5 space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">💼 {t('plans.title')}</h2>
        {active && <span className="badge bg-gold-400 text-ink">★ {current?.name?.[lang] || store.plan} · {t('plans.until', { date: date(store.plan_until) })}</span>}
      </div>
      {active && <p className="rounded-xl bg-brand-50 p-3 text-sm text-brand-900">{t('plans.credits', { n: store.feature_credits })}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {plans.map((p) => (
          <div key={p.key} className={`rounded-2xl border-2 p-4 ${store.plan === p.key && active ? 'border-gold-400' : 'border-slate-200'}`}>
            <p className="font-bold">{p.name?.[lang] || p.name?.ar}</p>
            <p className="mt-1 text-2xl font-bold text-brand-800 ltr-nums">{price(p.price)}<span className="text-sm font-normal text-slate-500"> / {t('plans.month')}</span></p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              <li>⭐ {t('plans.featured', { n: p.featuredPerMonth })}</li>
              <li>🏅 {t('plans.badge')}</li>
              <li>⬆ {t('plans.priority')}</li>
            </ul>
            <button className="btn-primary mt-3 w-full" onClick={() => setBuy({ kind: 'plan', plan: p.key })}>{store.plan === p.key && active ? t('plans.renew') : t('plans.subscribe')}</button>
          </div>
        ))}
      </div>
      <UpgradeModal request={buy} onClose={() => setBuy(null)} onDone={() => { setBuy(null); onChange?.(); }} />
    </section>
  );
}

export function ProBadge() {
  const { t } = useI18n();
  return <span className="badge bg-gold-400 px-1.5 py-0.5 text-[10px] text-ink" title={t('plans.badge')}>PRO</span>;
}
