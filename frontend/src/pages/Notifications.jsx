import { Link } from 'react-router-dom';
import { EmptyState, ErrorBox, Icon, PageHeader, Spinner } from '../components/ui.jsx';
import { PushToggle } from '../components/PushPrompt.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

const ICON_FOR = {
  new_message: 'chat', seller_reply: 'chat', product_approved: 'check', product_rejected: 'x', product_deleted: 'trash',
  sale_recorded: 'check', new_review: 'star', store_enabled: 'store', store_disabled: 'store',
  product_featured: 'star', account_verified: 'shield',
  merchant_request: 'store', merchant_approved: 'store', merchant_rejected: 'x',
  wanted_reply: 'chat', product_bumped: 'arrow', upgrade_request_bump: 'arrow', upgrade_rejected_bump: 'x',
  offer_new: 'star', offer_accepted: 'check', offer_declined: 'x',
  saved_search_match: 'search', price_drop: 'bolt', push_test: 'bell',
  order_new: 'bell', order_status: 'check', order_courier: 'user', order_available: 'bell', order_assigned: 'bell', order_unassigned: 'x',
  delivery_rated: 'star', courier_application: 'users', courier_approved: 'check', courier_rejected: 'x', courier_suspended: 'x',
  upgrade_request_verify: 'shield', upgrade_request_feature: 'star', upgrade_rejected_verify: 'x', upgrade_rejected_feature: 'x',
};

export default function Notifications() {
  const { t, ago } = useI18n();
  const { refreshCounts } = useApp();
  const { data, loading, error, setData } = useApi('/notifications');
  useDocumentTitle(t('notifications.title'));

  const markAll = async () => {
    await api('/notifications/read-all', { method: 'POST' });
    setData((d) => ({ items: d.items.map((n) => ({ ...n, is_read: true })) }));
    refreshCounts();
  };
  const markOne = (n) => {
    if (n.is_read) return;
    api(`/notifications/${n.id}/read`, { method: 'PATCH' }).then(refreshCounts).catch(() => {});
  };

  return (
    <div className="container-page max-w-3xl py-8">
      <PageHeader title={t('notifications.title')}>
        {data?.items?.some((n) => !n.is_read) && <button className="btn-outline" onClick={markAll}><Icon name="check" className="h-4 w-4" />{t('notifications.markAll')}</button>}
      </PageHeader>
      <PushToggle className="mb-4" />
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState icon="bell" title={t('notifications.empty')} /> : (
        <ul className="card divide-y divide-slate-100 overflow-hidden">
          {data.items.map((n) => {
            const vars = { ...n.data };
            if (n.type === 'order_status') vars.status = t(`delivery.status.${n.data?.status}`);
            for (const k of ['old', 'price', 'amount']) if (typeof vars[k] === 'number') vars[k] = vars[k].toLocaleString('en-US');
            const text = t(`notifications.types.${n.type}`, vars);
            const content = (
              <div className={`flex items-start gap-3 p-4 ${n.is_read ? '' : 'bg-brand-50/60'}`}>
                <span className={`rounded-full p-2 ${n.is_read ? 'bg-slate-100 text-slate-500' : 'bg-brand-100 text-brand-800'}`}><Icon name={ICON_FOR[n.type] || 'bell'} className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${n.is_read ? 'text-slate-600' : 'font-semibold text-slate-900'}`}>{text}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{ago(n.created_at)}</p>
                </div>
                {!n.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
              </div>
            );
            return <li key={n.id}>{n.link ? <Link to={n.link} onClick={() => markOne(n)} className="block hover:bg-slate-50">{content}</Link> : <div onClick={() => markOne(n)}>{content}</div>}</li>;
          })}
        </ul>
      )}
    </div>
  );
}
