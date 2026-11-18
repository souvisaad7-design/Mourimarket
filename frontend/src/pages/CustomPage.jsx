import { useParams } from 'react-router-dom';
import RichText from '../components/RichText.jsx';
import { ErrorBox, Spinner } from '../components/ui.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';
import { pickLang } from '../lib/localized.js';
import { NotFound } from './Static.jsx';

/** A page the admin created in the panel (/p/:slug). */
export default function CustomPage() {
  const { slug } = useParams();
  const { lang } = useI18n();
  const { data, loading, error } = useApi(`/pages/${encodeURIComponent(slug)}`, undefined, [slug]);
  const page = data?.page;
  useDocumentTitle(page ? pickLang(page.title, lang) : '');
  if (loading) return <Spinner />;
  if (error?.status === 404) return <NotFound />;
  if (error) return <div className="container-page py-10"><ErrorBox error={error} /></div>;
  return (
    <article className="container-page max-w-3xl space-y-6 py-10">
      {page.cover_url && <img src={page.cover_url} alt="" className="max-h-80 w-full rounded-3xl object-cover" />}
      <h1 className="text-3xl font-bold">{pickLang(page.title, lang)}</h1>
      <div className="card p-6 sm:p-8"><RichText text={pickLang(page.body, lang)} /></div>
    </article>
  );
}
