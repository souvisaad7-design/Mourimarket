// /auctions – running auctions (ending soonest first), ended ones, and the visitor's own.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductCard.jsx';
import { CitySelect, EmptyState, ErrorBox, Pagination } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

export default function Auctions() {
  const { t, number } = useI18n();
  const { user, meta } = useApp();
  useDocumentTitle(t('auction.pageTitle'));
  const [tab, setTab] = useState('active');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ page: String(page), limit: '24' });
  params.set('status', tab === 'ended' ? 'ended' : 'active');
  if (tab === 'mine') params.set('mine', '1');
  if (tab === 'bidding') params.set('bidding', '1');
  if (city) params.set('city', city);
  const list = useApi(`/auctions?${params}`, undefined, [params.toString()]);
  const tabs = [['active', t('auction.tabActive')], ['ended', t('auction.tabEnded')], ...(user ? [['bidding', t('auction.tabBidding')], ['mine', t('auction.tabMine')]] : [])];
  return (
    <div className="container-page max-w-6xl space-y-5 py-6">
      <header className="rounded-3xl bg-gradient-to-l from-orange-500 via-orange-600 to-brand-800 p-6 text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">🔨 {t('auction.pageTitle')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-white/90">{t('auction.pageSubtitle')}</p>
      </header>
      {!meta.auctions && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{t('auction.off')}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5" role="tablist">
          {tabs.map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setPage(1); }}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === k ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{label}</button>
          ))}
        </div>
        <div className="ms-auto w-48"><CitySelect value={city} onChange={(v) => { setCity(v); setPage(1); }} cities={meta.cities} placeholder={t('common.allCities')} /></div>
      </div>
      <ErrorBox error={list.error} />
      {list.loading ? <ProductGridSkeleton /> : list.data?.items?.length ? (
        <>
          <p className="text-sm text-slate-500">{t('auction.count', { n: number(list.data.total) })}</p>
          <ProductGrid items={list.data.items} />
          <Pagination page={page} total={list.data.total} limit={24} onPage={setPage} />
        </>
      ) : (
        <EmptyState icon="search" title={t('auction.none')}>
          {user && <p className="text-sm text-slate-500">{t('auction.howToStart')}</p>}
          <Link to="/dashboard" className="btn-outline mt-2 rounded-full">{t('auction.myListings')}</Link>
        </EmptyState>
      )}
      <section className="card space-y-2 p-5 text-sm leading-relaxed">
        <h2 className="text-lg font-bold">❓ {t('auction.rulesTitle')}</h2>
        <ul className="ms-5 list-disc space-y-1">{t('auction.rules').split('|').map((x) => <li key={x}>{x}</li>)}</ul>
      </section>
    </div>
  );
}
