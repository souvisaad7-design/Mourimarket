import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CitySelect, ErrorBox, Field, Icon, PageHeader, Spinner, useFieldError } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { compressImage, formatBytes } from '../lib/image.js';
import MapView, { MAURITANIA } from '../components/MapView.jsx';
import { useGeo } from '../context/LocationContext.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';
import { AttributeFields } from '../components/Attributes.jsx';
import VideoField from '../components/VideoField.jsx';
import { AiWriter, PriceSuggestion } from '../components/AiListing.jsx';

const MAX_IMAGES = 8;

/**
 * Create (/sell) or edit (/products/:id/edit) a listing.
 * In the admin area it posts for another user: `sellerId`, then `onCreated`.
 */
export default function ProductForm({ sellerId, onCreated } = {}) {
  const { id } = useParams();
  const editing = Boolean(id);
  const { t, tl } = useI18n();
  const { categories, meta, user, notify } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', price: '', oldPrice: '', categoryId: '', city: user.city || '', condition: 'used' });
  // Where the item is: optional pin, moughataa and neighbourhood (see the "Location" section).
  const [loc, setLoc] = useState({ lat: null, lng: null, area: '', district: '', locExact: false });
  const [attrs, setAttrs] = useState({});
  const [videoUrl, setVideoUrl] = useState('');
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
      setAttrs(product.attrs || {});
      setVideoUrl(product.video_url || '');
      setLoc({ lat: product.pin_lat ?? null, lng: product.pin_lng ?? null, area: product.area || '', district: product.district || '', locExact: Boolean(product.loc_exact) });
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
      fd.append('lat', loc.lat ?? ''); fd.append('lng', loc.lng ?? '');
      fd.append('area', loc.area); fd.append('district', loc.district); fd.append('locExact', loc.locExact ? 'true' : 'false');
      fd.append('attrs', JSON.stringify(attrs));
      fd.append('videoUrl', videoUrl);
      if (sellerId) fd.append('sellerId', String(sellerId));
      removeIds.forEach((rid) => fd.append('removeImageIds', rid));
      for (const item of ready) fd.append('images', item.file);
      if (editing) {
        await api(`/products/${id}`, { method: 'PUT', body: fd });
        notify(t('form.updated'));
        navigate(`/products/${id}`);
      } else {
        const { product } = await api('/products', { method: 'POST', body: fd });
        notify(product.status === 'approved' ? t('form.createdLive') : t('form.created'));
        if (onCreated) onCreated(product); else navigate('/dashboard');
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
          <AiWriter files={ready.map((f) => f.file)} onFill={(r) => setForm((prev) => ({
            ...prev,
            title: r.title || prev.title,
            description: r.description || prev.description,
            categoryId: r.categoryId ? String(r.categoryId) : prev.categoryId,
            condition: r.condition || prev.condition,
          }))} />
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
              <div className="mt-2"><PriceSuggestion categoryId={form.categoryId} title={form.title} condition={form.condition} /></div>
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
          <AttributeFields categorySlug={categories.find((c) => String(c.id) === String(form.categoryId))?.slug} value={attrs} onChange={setAttrs} fieldError={fieldError} />
          <VideoField value={videoUrl} onChange={setVideoUrl} />
          <Field label={t('form.description')} error={fieldError('description')}>
            <textarea className="input" rows={6} maxLength={5000} placeholder={t('form.descriptionPh')} value={form.description} onChange={set('description')} required />
          </Field>
        </section>

        <LocationSection city={form.city} onCity={(c) => setForm((f) => ({ ...f, city: c }))} loc={loc} setLoc={setLoc} error={fieldError('lat')} />

        {/* Listings an admin posts go live at once, so the review note does not apply. */}
        {user.role !== 'admin' && <p className="text-sm text-slate-500">{t('form.reviewNote')}</p>}
        <button className="btn-primary w-full py-3 text-base sm:w-auto sm:px-10" disabled={busy || processing}>
          {busy ? t('common.loading') : processing ? t('form.compressing') : editing ? t('form.update') : t('form.publish')}
        </button>
      </form>
    </div>
  );
}

/**
 * "Location of the item": pin on the map (click or drag), "use my position", moughataa and
 * neighbourhood. Buyers only see the exact pin if the seller ticks the box; otherwise ~1 km.
 */
function LocationSection({ city, onCity, loc, setLoc, error }) {
  const { t, lang } = useI18n();
  const { meta } = useApp();
  const { locate, status } = useGeo();
  const areas = useApi('/geo/areas');
  const cityRow = meta.cities.find((c) => c.key === city);
  const known = (areas.data?.areas || {})[city] || [];
  const hasPin = loc.lat != null;
  const center = hasPin ? [loc.lat, loc.lng] : cityRow?.lat != null ? [cityRow.lat, cityRow.lng] : MAURITANIA.center;
  const round6 = (n) => Math.round(n * 1e6) / 1e6;
  const pick = (lat, lng) => setLoc((l) => ({ ...l, lat: round6(lat), lng: round6(lng) }));

  // Use the seller's current position: pin + city / moughataa / neighbourhood.
  const useMine = async () => {
    const here = await new Promise((resolve) => {
      if (!('geolocation' in navigator)) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition((p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }), () => resolve(null), { enableHighAccuracy: true, timeout: 12000 });
    });
    if (!here) { locate(); return; } // shows the "permission refused" message through the shared state
    pick(here.lat, here.lng);
    try {
      const place = await api('/geo/reverse', { method: 'POST', body: { lat: here.lat, lng: here.lng, lang } });
      if (place.city && place.inMauritania) onCity(place.city.key);
      setLoc((l) => ({ ...l, area: place.area ? (place.area[lang] || place.area.ar) : l.area, district: place.district || l.district }));
    } catch { /* names are optional */ }
  };

  return (
    <section className="card space-y-4 p-5" aria-labelledby="loc-h">
      <div>
        <h2 id="loc-h" className="flex items-center gap-2 text-lg font-bold"><Icon name="pin" className="h-5 w-5 text-brand-700" />{t('geo.itemLocation')} <span className="text-xs font-normal text-slate-400">({t('common.optional')})</span></h2>
        <p className="mt-1 text-sm text-slate-500">{t('geo.formHint')}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-accent" onClick={useMine} disabled={status === 'locating'}><span aria-hidden="true">📍</span>{t('geo.useMyLocation')}</button>
        {hasPin && <button type="button" className="btn-ghost text-rose-600" onClick={() => setLoc((l) => ({ ...l, lat: null, lng: null }))}>{t('geo.removePin')}</button>}
      </div>
      {status === 'denied' && <p role="alert" className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">{t('geo.error.denied')} {t('geo.pickOnMap')}</p>}
      <MapView className="h-72" center={center} zoom={hasPin ? 15 : cityRow ? 12 : 5} picker={hasPin ? { lat: loc.lat, lng: loc.lng } : null} onPick={pick} label={t('geo.pickOnMap')} />
      <p className="text-xs text-slate-500">{hasPin ? t('geo.pinSet') : t('geo.pickOnMap')}</p>
      {error && <p className="text-xs text-rose-600">{t('geo.outOfArea')}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('geo.area')} optional>
          <input className="input" list="mm-areas" maxLength={80} value={loc.area} onChange={(e) => setLoc({ ...loc, area: e.target.value })} placeholder={known[0]?.[lang] || ''} />
          <datalist id="mm-areas">{known.map((a) => <option key={a.key} value={a[lang] || a.ar} />)}</datalist>
        </Field>
        <Field label={t('geo.district')} optional>
          <input className="input" maxLength={80} value={loc.district} onChange={(e) => setLoc({ ...loc, district: e.target.value })} />
        </Field>
      </div>
      <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm">
        <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-700" checked={loc.locExact} disabled={!hasPin} onChange={(e) => setLoc({ ...loc, locExact: e.target.checked })} />
        <span>
          <span className="block font-semibold">{t('geo.showExact')}</span>
          <span className="text-xs text-slate-500">{t('geo.showExactHint')}</span>
        </span>
      </label>
    </section>
  );
}
