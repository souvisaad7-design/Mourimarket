// /orders/:id/invoice – a printable invoice for a delivery order. "Print / Save as PDF" uses the browser's
// own print dialog, so the PDF is made on the phone or computer: no server, no cost.
import { Link, useParams } from 'react-router-dom';
import { ErrorBox, Spinner } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

export default function Invoice() {
  const { id } = useParams();
  const { t, price, date, siteName, dir } = useI18n();
  const { meta } = useApp();
  const { data, loading, error } = useApi(`/orders/${id}`);
  const o = data?.order;
  const number = o ? `SC-${new Date(o.created_at).getFullYear()}-${String(o.id).padStart(6, '0')}` : '';
  useDocumentTitle(number ? `${t('pro.invoice.title')} ${number}` : t('pro.invoice.title'));
  if (loading) return <Spinner />;
  if (error) return <div className="mx-auto max-w-3xl p-6"><ErrorBox error={error} /></div>;
  const store = o.seller_store;
  const city = (k) => meta.cities?.find((c) => c.key === k)?.ar || k;
  const itemNet = Number(o.item_price) - Number(o.discount || 0);
  const state = o.status === 'delivered' ? t('pro.invoice.paid') : o.status === 'cancelled' ? t('pro.invoice.cancelled') : t('pro.invoice.unpaid');
  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0" dir={dir}>
      <div className="mx-auto mb-4 flex max-w-3xl flex-wrap gap-2 px-4 print:hidden">
        <button type="button" className="btn-primary" onClick={() => window.print()}>🖨️ {t('pro.invoice.print')}</button>
        <Link to={`/orders/${o.id}`} className="btn-outline">{t('pro.invoice.back')}</Link>
        <p className="w-full text-xs text-slate-500">{t('pro.invoice.pdfHint')}</p>
      </div>
      <article className="mx-auto max-w-3xl bg-white p-6 text-sm text-slate-800 shadow print:max-w-none print:p-0 print:shadow-none sm:p-10">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            {store?.logo_url ? <img src={store.logo_url} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <img src="/logo-mark.png" alt="" className="h-14 w-14" />}
            <div>
              <p className="text-lg font-bold">{store?.name || o.seller_name}</p>
              {store?.city && <p className="text-xs text-slate-500">{city(store.city)}</p>}
              {store?.phone && <p className="text-xs text-slate-500"><bdi dir="ltr">{store.phone}</bdi></p>}
            </div>
          </div>
          <div className="text-end">
            <p className="text-2xl font-bold tracking-wide">{t('pro.invoice.title')}</p>
            <p className="font-mono text-xs" dir="ltr">{number}</p>
            <p className="text-xs text-slate-500">{date(o.created_at)}</p>
            <p className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-bold ${o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{state}</p>
          </div>
        </header>

        <section className="grid gap-4 py-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">{t('pro.invoice.billedTo')}</p>
            <p className="font-semibold">{o.buyer_name}</p>
            <p className="text-xs text-slate-600">{[city(o.city), o.district].filter(Boolean).join(' · ')}</p>
            {o.address && <p className="text-xs text-slate-600">{o.address}</p>}
            {o.phone && <p className="text-xs text-slate-600"><bdi dir="ltr">{o.phone}</bdi></p>}
          </div>
          <div className="sm:text-end">
            <p className="text-xs font-bold uppercase text-slate-500">{t('pro.invoice.payment')}</p>
            <p className="font-semibold">{o.payment_method === 'escrow' ? t('escrow.title') : t('delivery.cod.title')}</p>
            {o.delivered_at && <p className="text-xs text-slate-600">{t('pro.invoice.deliveredOn', { d: date(o.delivered_at) })}</p>}
            {o.courier_name && <p className="text-xs text-slate-600">🛵 {o.courier_name}</p>}
          </div>
        </section>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-xs text-slate-500">
              <th className="py-2 text-start">{t('pro.invoice.item')}</th>
              <th className="py-2 text-center">{t('pro.invoice.qty')}</th>
              <th className="py-2 text-end">{t('pro.invoice.amount')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2">{o.product_title}</td>
              <td className="py-2 text-center">1</td>
              <td className="py-2 text-end"><span className="ltr-nums">{price(o.item_price)}</span></td>
            </tr>
            {Number(o.discount) > 0 && (
              <tr className="border-b border-slate-100 text-emerald-700">
                <td className="py-2">{t('pro.coupon.discount', { code: o.coupon_code || '' })}</td>
                <td />
                <td className="py-2 text-end"><bdi dir="ltr">−{price(o.discount)}</bdi></td>
              </tr>
            )}
            <tr className="border-b border-slate-100">
              <td className="py-2">{t('delivery.cost.delivery')}{o.distance_km ? ` (${t('delivery.cost.distance', { km: String(Number(o.distance_km)) })})` : ''}</td>
              <td />
              <td className="py-2 text-end"><span className="ltr-nums">{price(o.delivery_fee)}</span></td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="text-base font-bold">
              <td className="pt-3">{t('delivery.cost.total')}</td>
              <td />
              <td className="pt-3 text-end"><span className="ltr-nums">{price(o.total)}</span></td>
            </tr>
          </tfoot>
        </table>
        {Number(o.discount) > 0 && <p className="mt-1 text-xs text-slate-500">{t('pro.invoice.itemAfter', { amount: price(itemNet) })}</p>}

        <footer className="mt-8 border-t border-slate-200 pt-3 text-center text-[11px] text-slate-500">
          <p>{t('pro.invoice.footer', { site: siteName })}</p>
          <p dir="ltr">{typeof window !== 'undefined' ? window.location.host : ''}</p>
        </footer>
      </article>
    </div>
  );
}
