import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CitySelect, ErrorBox, Field, Icon, PageHeader, Spinner, useFieldError } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { compressImage, formatBytes } from '../lib/image.js';
import { useDocumentTitle } from '../lib/hooks.js';

const MAX_IMAGES = 8;

/** Create (/sell) or edit (/products/:id/edit) a listing. */
export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { t, tl } = useI18n();
  const { categories, meta, user, notify } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', price: '', oldPrice: '', categoryId: '', city: user.city || '', condition: 'used' });
  const [existing, setExisting] = useState([]);
  const [removeIds, setRemoveIds] = useState([]);
  // New photos: { key, file, originalSize, status: 'processing' | 'ready' | 'error' }.
  // Each one is compressed (WebP, ≤1000px wide, quality 0.75) as soon as it is picked.
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
        oldPrice: product.old_price ? String(product.old_price) : '',
        categoryId: String(product.category_id), city: product.city, condition: product.condition,
      });
      setExisting(product.images);
    }).catch(setError).finally(() => setLoading(false));
  }, [editing, id]);

  const previews = useMemo(
    () => files.map((item) => ({ ...item, url: item.file ? URL.createObjectURL(item.file) : null })),
    [files],
  );
  useEffect(() => () => previews.forEach((p) => p.url && URL.revokeObjectURL(p.url)), [previews]);
  const processing = files.some((f) => f.status === 'processing');
  const ready = files.filter((f) => f.status === 'ready');
  const savedBytes = ready.reduce((sum, f) => sum + Math.max(0, f.originalSize - f.file.size), 0);
  const beforeBytes = ready.reduce((sum, f) => sum + f.originalSize, 0);

  const keptExisting = existing.filter((img) => !removeIds.includes(img.id));
  const imageCount = keptExisting.length + files.length;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const addFiles = (list) => {
    const room = MAX_IMAGES - imageCount;
    const picked = Array.from(list).filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name)).slice(0, room);
    const items = picked.map((f, i) => ({ key: `${Date.now()}-${i}-${f.name}`, file: null, originalSize: f.size, status: 'processing' }));
    setFiles((prev) => [...prev, ...items]);
    // Compress in the browser right away so the preview shows exactly what will be uploaded.
    picked.forEach(async (f, i) => {
      const { key } = items[i];
      try {
        const out = await compressImage(f);
        setFiles((prev) => prev.map((it) => (it.key === key ? { ...it, file: out.file, status: 'ready' } : it)));
      } catch {
        setFiles((prev) => prev.map((it) => (it.key === key ? { ...it, status: 'error' } : it)));
      }
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      removeIds.forEach((rid) => fd.append('removeImageIds', rid));
      for (const item of ready) fd.append('images', item.file);
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
                  {i === 0 && <span className="badge absolute bottom-1 start-1 bg-ink/80 text-white">{t('form.cover')}</span>}
                  <button type="button" onClick={() => setRemoveIds([...removeIds, img.id])} className="absolute end-1 top-1 rounded-full bg-surface/90 p-1 text-rose-600" aria-label={t('common.delete')}>
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {previews.map((p, i) => (
                <div key={p.key} className={`relative aspect-square overflow-hidden rounded-xl bg-slate-100 ${p.status === 'error' ? 'ring-2 ring-rose-500' : ''}`}>
                  {p.url && <img src={p.url} alt="" className="h-full w-full object-cover" />}
                  {p.status === 'processing' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-100 text-xs text-slate-500" role="status">
                      <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-700" />{t('form.compressing')}
                    </div>
                  )}
                  {p.status === 'error' && (
                    <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-xs font-semibold text-rose-600">{t('form.imageError')}</div>
                  )}
                  {p.status === 'ready' && (
                    <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1">
                      {keptExisting.length === 0 && i === 0 ? <span className="badge bg-ink/80 text-white">{t('form.cover')}</span> : <span />}
                      <span className="badge bg-ink/75 px-1.5 text-[10px] text-white" title={`${formatBytes(p.originalSize)} → ${formatBytes(p.file.size)}`}>
                        <bdi dir="ltr">{formatBytes(p.file.size)}</bdi>
                      </span>
                    </div>
                  )}
                  <button type="button" onClick={() => setFiles((prev) => prev.filter((f) => f.key !== p.key))} className="absolute end-1 top-1 rounded-full bg-surface/90 p-1 text-rose-600" aria-label={t('common.delete')}>
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {imageCount < MAX_IMAGES && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-brand-500 hover:text-brand-700">
                  <Icon name="image" className="h-7 w-7" />
                  <span className="text-xs font-medium">{t('form.addImages')}</span>
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
                </label>
              )}
            </div>
          </Field>
          {ready.length > 0 && savedBytes > 0 && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-brand-700" role="status">
              <Icon name="check" className="h-4 w-4" />
              <span>{t('form.compressedSummary', { n: ready.length, pct: Math.round((savedBytes / beforeBytes) * 100) })}</span>
              <bdi dir="ltr" className="font-semibold">{formatBytes(beforeBytes)} → {formatBytes(beforeBytes - savedBytes)}</bdi>
            </p>
          )}
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
            <Field label={t('form.oldPrice')} error={fieldError('oldPrice')} hint={t('form.oldPriceHelp')} optional>
              <input className="input" type="number" min="0" step="1" inputMode="numeric" value={form.oldPrice} onChange={set('oldPrice')} dir="ltr" />
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
        <button className="btn-primary w-full py-3 text-base sm:w-auto sm:px-10" disabled={busy || processing}>
          {busy ? t('common.loading') : processing ? t('form.compressing') : editing ? t('form.update') : t('form.publish')}
        </button>
      </form>
    </div>
  );
}
