import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/index.jsx';
import { Icon } from './ui.jsx';

/** Shows a seller where their merchant-account request stands (pending or rejected). */
export default function MerchantStatus({ user, className = '' }) {
  const { t } = useI18n();
  if (!user || user.account_type === 'merchant') return null;
  if (user.merchant_status === 'pending') {
    return (
      <div role="status" className={`flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 ${className}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Icon name="clock" /></span>
        <div className="min-w-0 text-sm">
          <p className="font-bold text-amber-900">{t('merchant.pendingTitle')}</p>
          <p className="mt-0.5 leading-relaxed text-amber-800">{t('merchant.pendingText')}</p>
          {(!user.city || !user.bio) && <Link to="/profile" className="link mt-1 inline-block text-xs">{t('merchant.completeProfile')}</Link>}
        </div>
      </div>
    );
  }
  if (user.merchant_status === 'rejected') {
    return (
      <div role="status" className={`flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 ${className}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700"><Icon name="info" /></span>
        <div className="min-w-0 text-sm">
          <p className="font-bold text-rose-900">{t('merchant.rejectedTitle')}</p>
          {user.merchant_note && <p className="mt-0.5 text-rose-800">{t('merchant.rejectedText', { reason: user.merchant_note })}</p>}
          <Link to="/profile" className="link mt-1 inline-block text-xs">{t('merchant.reapply')}</Link>
        </div>
      </div>
    );
  }
  return null;
}
