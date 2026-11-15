import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CitySelect, ErrorBox, Field, Icon, PageHeader, Spinner, useFieldError } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api, compressImage } from '../lib/api.js';
import { useDocumentTitle } from '../lib/hooks.js';

const MAX_IMAGES = 8;

/** Create (/sell) or edit (/products/:id/edit) a listing. */
export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { t, tl } = useI18n();
  const { categories, meta, user, notify } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', price: '', categoryId: '', city: user.city || '', condition: 'used' });
  const [existing, setExisting] = useState([]);
  const [removeIds, setRemoveIds] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const fieldError = useFieldError(error);
  useDocumentTitle(editing ? t('form.editTitle') : t('form.newTitle'));

  useEffect(() => {
    if (!editing) return;
    api(`/products/${id}`).then(({ product }) => {
      setForm({
        title: product.title, description: product.description, price: String(product.price),
        categoryId: String(product.category_id), city: product.city, condition: product.condition,
      });
      setExisting(product.images);
    }).catch(setError).finally(() => setLoading(false));
  }, [editing, id]);

  const previews = useMemo(() => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })), [files]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const keptExisting = existing.filter((img) => !removeIds.includes(img.id));
  const imageCount = keptExisting.length + files.length;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const addFiles = (list) => {
    const room = MAX_IMAGES - imageCount;
    setFiles([...files, ...Array.from(list).filter((f) => f.type.startsWith('image/')).slice(0, room)]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      removeIds.forEach((rid) => fd.append('removeImageIds', rid));
      for (const f of files) fd.append('images', await compressImage(f));
      if (editing) {
        await api(`/products/${id}`, { method: 'PUT', body: fd });
        notify(t('form.updated'));
        navigate(`/products/${id}`);
      } else {
        const { product } = await api('/products', { method: 'POST', body: fd });
        notify(product.status === 'approved' ? t('form.createdLive') : t('form.created'));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container-page max-w-3xl py-8">
      <PageHeader title={editing ? t('form.editTitle') : t('form.newTitle')} />
      <form onSubmit={submit} className="space-y-6" noValidate>
        <ErrorBox error={error} />

        <section className="card space-y-4 p-5">
          <Field label={t('form.images')} error={fieldError('images')} hint={t('form.imagesHelp', { n: MAX_IMAGES })}>
            <div
              className="grid grid-cols-3 gap-2 sm:grid-cols-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            >
              {keptExisting.map((img, i) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="badge absolute bottom-1 start-1 bg-slate-900/80 text-white">{t('form.cover')}</span>}
                  <button type="button" onClick={() => setRemoveIds([...removeIds, img.id])} className="absolute end-1 top-1 rounded-full bg-white/90 p-1 text-rose-600" aria-label={t('common.delete')}>
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {previews.map((p, i) => (
                <div key={p.url} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                  {keptExisting.length === 0 && i === 0 && <span className="badge absolute bottom-1 start-1 bg-slate-900/80 text-white">{t('form.cover')}</span>}
                  <button type="button" onClick={() => setFiles(files.filter((f) => f !== p.file))} className="absolute end-1 top-1 rounded-full bg-white/90 p-1 text-rose-600" aria-label={t('common.delete')}>
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {imageCount < MAX_IMAGES && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-brand-500 hover:text-brand-700">
                  <Icon name="image" className="h-7 w-7" />
                  <span className="text-xs font-medium">{t('form.addImages')}</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
                </label>
              )}
            </div>
          </Field>
        </section>

        <section className="card space-y-4 p-5">
          <Field label={t('form.title')} error={fieldError('title')}>
            <input className="input" maxLength={140} placeholder={t('form.titlePh')} value={form.title} onChange={set('title')} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('form.category')} error={fieldError('categoryId')}>
              <select className="input" value={form.categoryId} onChange={set('categoryId')} required>
                <option value="">{t('form.choose')}</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {tl(c)}</option>)}
              </select>
            </Field>
            <Field label={t('form.price')} error={fieldError('price')}>
              <input className="input" type="number" min="0" step="1" inputMode="numeric" value={form.price} onChange={set('price')} required dir="ltr" />
            </Field>
            <Field label={t('form.city')} error={fieldError('city')}>
              <CitySelect value={form.city} onChange={(v) => setForm({ ...form, city: v })} cities={meta.cities} placeholder={t('form.choose')} required />
            </Field>
            <Field label={t('form.condition')}>
              <div className="grid grid-cols-2 gap-2">
                {['used', 'new'].map((c) => (
                  <label key={c} className={`cursor-pointer rounded-xl border-2 px-3 py-2 text-center text-sm font-semibold ${form.condition === c ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-slate-200 text-slate-600'}`}>
                    <input type="radio" className="sr-only" name="condition" value={c} checked={form.condition === c} onChange={set('condition')} />
                    {t(`common.${c}`)}
                  </label>
                ))}
              </div>
            </Field>
          </div>
          <Field label={t('form.description')} error={fieldError('description')}>
            <textarea className="input" rows={6} maxLength={5000} placeholder={t('form.descriptionPh')} value={form.description} onChange={set('description')} required />
          </Field>
        </section>

        <p className="text-sm text-slate-500">{t('form.reviewNote')}</p>
        <button className="btn-primary w-full py-3 text-base sm:w-auto sm:px-10" disabled={busy}>
          {busy ? t('common.loading') : editing ? t('form.update') : t('form.publish')}
        </button>
      </form>
    </div>
  );
}
