import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { ErrorBox, Icon } from './ui.jsx';

/**
 * Shown to buyer accounts instead of the "post an ad" form: explains that only
 * sellers can post, and switches the account to a seller in one click.
 */
export default function BecomeSeller({ compact = false, onDone }) {
  const { t } = useI18n();
  const { user, refreshUser, notify } = useApp();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const become = async (accountType) => {
    setBusy(accountType);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('name', user.name);
      if (user.phone) fd.append('phone', user.phone);
      if (user.email) fd.append('email', user.email);
      if (user.city) fd.append('city', user.city);
      if (user.bio) fd.append('bio', user.bio);
      fd.append('accountType', accountType);
      await api('/auth/me', { method: 'PUT', body: fd });
      const fresh = await refreshUser();
      notify(fresh?.merchant_status === 'pending' ? t('merchant.requested') : t('seller.switched'));
      onDone?.(accountType);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={`overflow-hidden rounded-3xl border border-brand-100 bg-brand-50 ${compact ? 'p-5' : 'p-6 sm:p-8'}`}>
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-white"><Icon name="store" /></span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-brand-900">{t('seller.becomeTitle')}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{t('seller.becomeText')}</p>
        </div>
      </div>
      <div className="mt-4"><ErrorBox error={error} /></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[['individual', 'user'], ['merchant', 'store']].map(([type, icon]) => (
          <button key={type} type="button" disabled={Boolean(busy)} onClick={() => become(type)}
            className="card flex items-start gap-3 p-4 text-start transition hover:border-brand-400 hover:shadow-md disabled:opacity-60">
            <Icon name={icon} className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
            <span>
              <span className="block font-bold text-slate-900">{busy === type ? t('common.loading') : t('seller.becomeAs', { role: t(`roles.${type}`) })}</span>
              <span className="text-xs text-slate-500">{t(`roles.${type}Text`)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
