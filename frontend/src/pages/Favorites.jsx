import { ProductGrid } from '../components/ProductCard.jsx';
import { EmptyState, ErrorBox, PageHeader, Spinner } from '../components/ui.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

export default function Favorites() {
  const { t } = useI18n();
  const { data, loading, error, setData } = useApi('/favorites');
  useDocumentTitle(t('favorites.title'));
  const onFavoriteChange = (p, isFav) => {
    if (!isFav) setData((d) => ({ ...d, items: d.items.filter((x) => x.id !== p.id) }));
  };
  return (
    <div className="container-page py-8">
      <PageHeader title={t('favorites.title')} />
      <p className="mb-4 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-900">🔔 {t('alerts.priceDropHint')}</p>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : data?.items?.length ? (
        <ProductGrid items={data.items} onFavoriteChange={onFavoriteChange} />
      ) : !error && <EmptyState icon="heart" title={t('favorites.empty')} />}
    </div>
  );
}
