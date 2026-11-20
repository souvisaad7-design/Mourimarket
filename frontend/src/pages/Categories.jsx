import { Link } from 'react-router-dom';
import { CategoryIcon, PageHeader } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useDocumentTitle } from '../lib/hooks.js';

export default function Categories() {
  const { t, tl, number } = useI18n();
  const { categories } = useApp();
  useDocumentTitle(t('nav.categories'));
  return (
    <div className="container-page py-8">
      <PageHeader title={t('nav.categories')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.id} to={`/products?category=${c.slug}`} className="card flex items-center gap-4 p-5 transition hover:border-brand-300 hover:shadow-md">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-3xl" aria-hidden="true"><CategoryIcon icon={c.icon} /></span>
            <div>
              <h2 className="font-bold">{tl(c)}</h2>
              <p className="text-sm text-slate-500">{t('store.products', { n: number(c.product_count) })}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
