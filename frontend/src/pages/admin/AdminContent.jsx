// Admin pages that shape the public site: banner slides, menus & links,
// custom pages, and posting a listing for any user.
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RichText from '../../components/RichText.jsx';
import { EmptyState, ErrorBox, Field, Icon, Modal, Spinner, useFieldError } from '../../components/ui.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { LANGS } from '../../i18n/messages.js';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/hooks.js';
import { compressImage } from '../../lib/image.js';
import { pickLang } from '../../lib/localized.js';
import { BUILTIN_LINKS, DEFAULT_FOOTER, DEFAULT_HEADER, HOME_SECTIONS } from '../../lib/menus.js';
import ProductForm from '../ProductForm.jsx';

const emptyL = () => ({ ar: '', fr: '', en: '' });

function PageTitle({ icon, title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Icon name={icon} className="h-6 w-6 text-brand-700" />{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/** Upload one image (compressed in the browser) and get its URL back. */
export function useImageUpload() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const upload = async (file, maxWidth = 1600) => {
    setBusy(true);
    setError(null);
    try {
      const { file: small } = await compressImage(file, { maxWidth, quality: 0.82 });
      const fd = new FormData();
      fd.append('file', small);
      const { url } = await api('/admin/uploads', { method: 'POST', body: fd });
      return url;
    } catch (err) {
      setError(err);
      return null;
    } finally { setBusy(false); }
  };
  return { upload, busy, error };
}

function ImagePicker({ value, onChange, label, maxWidth }) {
  const { t } = useI18n();
  const ref = useRef(null);
  const { upload, busy, error } = useImageUpload();
  const pick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const url = await upload(f, maxWidth);
    if (url) onChange(url);
  };
  return (
    <Field label={label} optional>
      <input ref={ref} type="file" accept="image/*" className="sr-only" onChange={pick} tabIndex={-1} />
      <div className="flex flex-wrap items-center gap-3">
        {value ? <img src={value} alt="" className="h-20 w-32 rounded-xl object-cover ring-1 ring-slate-200" /> : <span className="flex h-20 w-32 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><Icon name="image" /></span>}
        <button type="button" className="btn-outline" disabled={busy} onClick={() => ref.current?.click()}><Icon name="image" className="h-4 w-4" />{busy ? t('common.loading') : value ? t('admin.changeImage') : t('admin.uploadImage')}</button>
        {value && <button type="button" className="btn-ghost text-rose-600" onClick={() => onChange('')}>{t('admin.removeImage')}</button>}
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{t('errors.invalid_image_type')}</p>}
    </Field>
  );
}

/** Three inputs (Arabic, French, English) for one piece of text. */
function LangInputs({ label, value, onChange, max = 200, multiline = false, required = false }) {
  const { t } = useI18n();
  return (
    <fieldset className="space-y-2">
      <legend className="label">{label}</legend>
      {LANGS.map((l) => {
        const props = { className: 'input text-sm', dir: l.dir, maxLength: max, value: value?.[l.code] || '', placeholder: l.label, 'aria-label': `${label} (${l.label})`, onChange: (e) => onChange({ ...value, [l.code]: e.target.value }), required: required && l.code === 'ar' };
        return (
          <div key={l.code} className="flex items-start gap-2">
            <span className="mt-2.5 w-8 shrink-0 text-[11px] font-bold uppercase text-slate-400">{l.code}</span>
            {multiline ? <textarea rows={2} {...props} /> : <input {...props} />}
          </div>
        );
      })}
      <p className="text-[11px] text-slate-400">{t('admin.langFallback')}</p>
    </fieldset>
  );
}

function useSaveSection() {
  const { t } = useI18n();
  const { notify } = useApp();
  const { setSettings } = useSettings();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const save = async (body) => {
    setBusy(true);
    setError(null);
    try {
      const { settings } = await api('/admin/settings', { method: 'PUT', body });
      setSettings(settings);
      notify(t('common.saved'));
      return true;
    } catch (err) { setError(err); return false; } finally { setBusy(false); }
  };
  return { save, busy, error };
}

const move = (list, i, d) => {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function RowTools({ index, length, onMove, onRemove }) {
  const { t } = useI18n();
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" className="btn-ghost p-1.5" disabled={index === 0} onClick={() => onMove(-1)} aria-label={t('admin.moveUp')}><Icon name="chevronDown" className="h-4 w-4 rotate-180" /></button>
      <button type="button" className="btn-ghost p-1.5" disabled={index === length - 1} onClick={() => onMove(1)} aria-label={t('admin.moveDown')}><Icon name="chevronDown" className="h-4 w-4" /></button>
      <button type="button" className="btn-ghost p-1.5 text-rose-600" onClick={onRemove} aria-label={t('common.delete')}><Icon name="trash" className="h-4 w-4" /></button>
    </div>
  );
}

// ---------- Banner (hero slides) ----------

const builtinSlides = (t) => [1, 2, 3, 4].map((k) => ({
  enabled: true,
  title: Object.fromEntries(LANGS.map((l) => [l.code, ''])), text: emptyL(), cta: emptyL(),
  link: ['/products', '/products?category=vehicles', '/sell', '/products?deals=1'][k - 1], image: '',
  _defaults: { title: t(`hero.s${k}title`), text: t(`hero.s${k}text`), cta: t(`hero.s${k}cta`) },
}));

export function AdminBanner() {
  const { t, lang } = useI18n();
  const { settings } = useSettings();
  const { save, busy, error } = useSaveSection();
  const [slides, setSlides] = useState(() => structuredClone(settings.hero?.slides || []));
  useEffect(() => { setSlides(structuredClone(settings.hero?.slides || [])); }, [settings.hero]);
  const set = (i, patch) => setSlides((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  // Start from the current built-in slides, with their texts filled in.
  const importBuiltin = () => setSlides(builtinSlides(t).map(({ _defaults, ...s }) => ({
    ...s, title: { ...emptyL(), ar: _defaults.title }, text: { ...emptyL(), ar: _defaults.text }, cta: { ...emptyL(), ar: _defaults.cta },
  })));
  const add = () => setSlides((s) => [...s, { enabled: true, title: emptyL(), text: emptyL(), cta: emptyL(), link: '/products', image: '' }]);
  const submit = () => save({ hero: { slides: slides.map(({ _defaults, ...s }) => s) } });

  return (
    <div className="max-w-4xl">
      <PageTitle icon="image" title={t('admin.banner')} subtitle={t('admin.bannerHint')}>
        <button className="btn-primary" disabled={busy} onClick={submit}>{busy ? t('common.loading') : t('common.save')}</button>
      </PageTitle>
      <ErrorBox error={error} />
      {!slides.length ? (
        <div className="card space-y-3 p-6 text-center">
          <p className="text-slate-600">{t('admin.bannerBuiltin')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" className="btn-primary" onClick={importBuiltin}><Icon name="edit" className="h-4 w-4" />{t('admin.bannerEditCurrent')}</button>
            <button type="button" className="btn-outline" onClick={add}><Icon name="plus" className="h-4 w-4" />{t('admin.addSlide')}</button>
          </div>
        </div>
      ) : (
        <ol className="space-y-4">
          {slides.map((s, i) => (
            <li key={i} className={`card space-y-4 p-5 ${s.enabled ? '' : 'opacity-60'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold">{t('admin.slideN', { n: i + 1 })}{pickLang(s.title, lang) ? ` — ${pickLang(s.title, lang)}` : ''}</h2>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={s.enabled} onChange={(e) => set(i, { enabled: e.target.checked })} />{t('admin.slideVisible')}</label>
                  <RowTools index={i} length={slides.length} onMove={(d) => setSlides(move(slides, i, d))} onRemove={() => setSlides(slides.filter((_, j) => j !== i))} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <LangInputs label={t('admin.slideTitle')} value={s.title} max={120} onChange={(v) => set(i, { title: v })} required />
                <LangInputs label={t('admin.slideText')} value={s.text} max={200} onChange={(v) => set(i, { text: v })} />
                <LangInputs label={t('admin.slideButton')} value={s.cta} max={40} onChange={(v) => set(i, { cta: v })} />
                <div className="space-y-4">
                  <Field label={t('admin.set.link')} hint={t('admin.set.linkHint')}><input className="input" dir="ltr" value={s.link} onChange={(e) => set(i, { link: e.target.value })} /></Field>
                  <ImagePicker label={t('admin.slideImage')} value={s.image} onChange={(url) => set(i, { image: url })} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
      {slides.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-between gap-2">
          <button type="button" className="btn-outline" onClick={add} disabled={slides.length >= 8}><Icon name="plus" className="h-4 w-4" />{t('admin.addSlide')}</button>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost text-rose-600" onClick={() => window.confirm(t('admin.bannerResetConfirm')) && setSlides([])}>{t('admin.bannerReset')}</button>
            <button className="btn-primary" disabled={busy} onClick={submit}>{t('common.save')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Menus & links, home page sections ----------

function MenuEditor({ title, hint, items, onChange, pages }) {
  const { t, lang } = useI18n();
  const [adding, setAdding] = useState('');
  const used = new Set(items.filter((i) => i.type === 'builtin').map((i) => i.key));
  const add = (v) => {
    if (!v) return;
    if (v === 'custom') onChange([...items, { type: 'link', label: emptyL(), to: '/' }]);
    else if (v.startsWith('page:')) {
      const p = pages.find((x) => x.slug === v.slice(5));
      onChange([...items, { type: 'link', label: { ...emptyL(), ...p.title }, to: `/p/${p.slug}` }]);
    } else onChange([...items, { type: 'builtin', key: v }]);
    setAdding('');
  };
  return (
    <section className="card space-y-3 p-5">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 rounded-xl border border-slate-200 p-2.5">
            <span className="mt-1.5 w-5 shrink-0 text-center text-xs font-bold text-slate-400">{i + 1}</span>
            {it.type === 'builtin' ? (
              <p className="flex-1 py-1.5 text-sm font-semibold">{t(BUILTIN_LINKS[it.key]?.label || '')} <span className="text-xs font-normal text-slate-400" dir="ltr">{BUILTIN_LINKS[it.key]?.to}</span></p>
            ) : (
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <input className="input py-2 text-sm" placeholder={t('admin.linkLabel')} value={it.label?.[lang] ?? it.label?.ar ?? ''} maxLength={60}
                  onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, label: { ...x.label, [lang]: e.target.value } } : x)))} aria-label={t('admin.linkLabel')} />
                <input className="input py-2 text-sm" dir="ltr" placeholder="/p/terms" value={it.to} maxLength={300}
                  onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)))} aria-label={t('admin.set.link')} />
              </div>
            )}
            <RowTools index={i} length={items.length} onMove={(d) => onChange(move(items, i, d))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
          </li>
        ))}
      </ul>
      <select className="input py-2 text-sm" value={adding} onChange={(e) => add(e.target.value)} aria-label={t('admin.addLink')}>
        <option value="">{`+ ${t('admin.addLink')}…`}</option>
        <optgroup label={t('admin.builtinLinks')}>
          {Object.entries(BUILTIN_LINKS).filter(([k]) => !used.has(k)).map(([k, d]) => <option key={k} value={k}>{t(d.label)}</option>)}
        </optgroup>
        {pages.length > 0 && (
          <optgroup label={t('admin.customPages')}>
            {pages.map((p) => <option key={p.slug} value={`page:${p.slug}`}>{pickLang(p.title, lang)}</option>)}
          </optgroup>
        )}
        <option value="custom">{t('admin.customLink')}</option>
      </select>
      <p className="text-[11px] text-slate-400">{t('admin.linkLabelLangHint')}</p>
    </section>
  );
}

export function AdminMenus() {
  const { t } = useI18n();
  const { settings } = useSettings();
  const pages = useApi('/admin/pages');
  const { save, busy, error } = useSaveSection();
  const init = () => ({
    header: structuredClone(settings.menu?.header || DEFAULT_HEADER),
    footer: structuredClone(settings.menu?.footer || DEFAULT_FOOTER),
    home: { ...Object.fromEntries(HOME_SECTIONS.map((k) => [k, true])), ...settings.menu?.home },
  });
  const [menu, setMenu] = useState(init);
  useEffect(() => { setMenu(init()); }, [settings.menu]); // eslint-disable-line react-hooks/exhaustive-deps
  const published = (pages.data?.items || []).filter((p) => p.is_published);
  const submit = () => save({ menu });

  return (
    <div className="max-w-4xl space-y-6">
      <PageTitle icon="link" title={t('admin.menus')} subtitle={t('admin.menusHint')}>
        <button className="btn-primary" disabled={busy} onClick={submit}>{busy ? t('common.loading') : t('common.save')}</button>
      </PageTitle>
      <ErrorBox error={error} />
      <div className="grid gap-6 lg:grid-cols-2">
        <MenuEditor title={t('admin.headerMenu')} hint={t('admin.headerMenuHint')} items={menu.header} pages={published} onChange={(header) => setMenu({ ...menu, header })} />
        <MenuEditor title={t('admin.footerMenu')} hint={t('admin.footerMenuHint')} items={menu.footer} pages={published} onChange={(footer) => setMenu({ ...menu, footer })} />
      </div>
      <section className="card space-y-3 p-5">
        <div>
          <h2 className="text-lg font-bold">{t('admin.homeSections')}</h2>
          <p className="text-xs text-slate-500">{t('admin.homeSectionsHint')}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {HOME_SECTIONS.map((k) => (
            <label key={k} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
              <input type="checkbox" checked={menu.home[k]} onChange={(e) => setMenu({ ...menu, home: { ...menu.home, [k]: e.target.checked } })} />
              <span className="text-sm font-semibold">{t(`admin.homeSection.${k}`)}</span>
            </label>
          ))}
        </div>
      </section>
      <div className="flex flex-wrap justify-between gap-2">
        <button type="button" className="btn-ghost text-rose-600" onClick={() => window.confirm(t('admin.menusResetConfirm')) && save({ menu: { header: null, footer: null, home: Object.fromEntries(HOME_SECTIONS.map((k) => [k, true])) } })}>{t('admin.menusReset')}</button>
        <button className="btn-primary" disabled={busy} onClick={submit}>{t('common.save')}</button>
      </div>
    </div>
  );
}

// ---------- Custom pages ----------

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
const emptyPage = () => ({ id: null, slug: '', title: emptyL(), body: emptyL(), coverUrl: '', isPublished: true });

function PageEditor({ page, onClose, onSaved }) {
  const { t } = useI18n();
  const { notify } = useApp();
  const [form, setForm] = useState(page);
  const [lang, setLang] = useState('ar');
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const fieldError = useFieldError(error);
  const bodyRef = useRef(null);
  const imgRef = useRef(null);
  const { upload, busy: uploading } = useImageUpload();
  const dir = LANGS.find((l) => l.code === lang).dir;

  const insert = (snippet) => {
    const el = bodyRef.current;
    const text = form.body[lang] || '';
    const at = el ? el.selectionStart : text.length;
    const next = `${text.slice(0, at)}${snippet}${text.slice(at)}`;
    setForm({ ...form, body: { ...form.body, [lang]: next } });
  };
  const insertImage = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const url = await upload(f, 1400);
    if (url) insert(`\n\n![](${url})\n\n`);
  };
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { slug: form.slug || slugify(form.title.en || form.title.fr) || `page-${Date.now().toString(36)}`, title: form.title, body: form.body, coverUrl: form.coverUrl || '', isPublished: form.isPublished };
      if (form.id) await api(`/admin/pages/${form.id}`, { method: 'PUT', body });
      else await api('/admin/pages', { method: 'POST', body });
      notify(t('common.saved'));
      onSaved();
    } catch (err) { setError(err); } finally { setBusy(false); }
  };

  return (
    <Modal open onClose={onClose} title={form.id ? t('admin.editPage') : t('admin.newPage')} size="lg">
      <form onSubmit={submit} className="space-y-4">
        <ErrorBox error={error && !error.fields ? error : null} />
        <LangInputs label={t('admin.pageTitle')} value={form.title} max={150} onChange={(v) => setForm({ ...form, title: v })} required />
        <Field label={t('admin.pageSlug')} hint={t('admin.pageSlugHint', { url: `/p/${form.slug || 'my-page'}` })} error={fieldError('slug')}>
          <input className="input" dir="ltr" placeholder="terms" value={form.slug} maxLength={80} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
        </Field>
        <ImagePicker label={t('admin.pageCover')} value={form.coverUrl} onChange={(url) => setForm({ ...form, coverUrl: url })} />
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="label mb-0">{t('admin.pageBody')}</span>
            <div className="flex flex-wrap gap-1">
              {LANGS.map((l) => <button key={l.code} type="button" onClick={() => setLang(l.code)} className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${lang === l.code ? 'bg-ink text-white' : 'bg-slate-100 text-slate-600'}`}>{l.label}</button>)}
              <button type="button" onClick={() => setPreview(!preview)} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{preview ? t('common.edit') : t('admin.preview')}</button>
            </div>
          </div>
          {preview ? (
            <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-slate-200 p-4" dir={dir}><RichText text={form.body[lang] || form.body.ar} /></div>
          ) : (
            <>
              <div className="mb-1.5 flex flex-wrap gap-1 text-xs">
                {[['## ', t('admin.fmtHeading')], ['- ', t('admin.fmtList')], ['**نص**', t('admin.fmtBold')], ['[نص](/products)', t('admin.fmtLink')]].map(([snip, label]) => (
                  <button key={label} type="button" className="rounded-md border border-slate-200 px-2 py-1 hover:bg-slate-50" onClick={() => insert(snip)}>{label}</button>
                ))}
                <input ref={imgRef} type="file" accept="image/*" className="sr-only" onChange={insertImage} tabIndex={-1} />
                <button type="button" className="rounded-md border border-slate-200 px-2 py-1 hover:bg-slate-50" disabled={uploading} onClick={() => imgRef.current?.click()}><Icon name="image" className="me-1 inline h-3.5 w-3.5" />{uploading ? t('common.loading') : t('admin.fmtImage')}</button>
              </div>
              <textarea ref={bodyRef} className="input min-h-[14rem] font-[inherit] text-sm" dir={dir} maxLength={30000} value={form.body[lang] || ''}
                onChange={(e) => setForm({ ...form, body: { ...form.body, [lang]: e.target.value } })} aria-label={t('admin.pageBody')} />
              <p className="mt-1 text-[11px] text-slate-400">{t('admin.pageBodyHint')}</p>
            </>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />{t('admin.pagePublished')}</label>
        <button className="btn-primary w-full" disabled={busy}>{busy ? t('common.loading') : t('common.save')}</button>
      </form>
    </Modal>
  );
}

export function AdminCustomPages() {
  const { t, lang, date } = useI18n();
  const { notify } = useApp();
  const { data, loading, error, reload } = useApi('/admin/pages');
  const [editing, setEditing] = useState(null);
  const remove = async (p) => {
    if (!window.confirm(t('admin.deletePageConfirm', { title: pickLang(p.title, lang) }))) return;
    await api(`/admin/pages/${p.id}`, { method: 'DELETE' });
    notify(t('common.saved'));
    reload();
  };
  const open = (p) => setEditing(p ? { id: p.id, slug: p.slug, title: { ...emptyL(), ...p.title }, body: { ...emptyL(), ...p.body }, coverUrl: p.cover_url || '', isPublished: p.is_published } : emptyPage());

  return (
    <div className="max-w-4xl">
      <PageTitle icon="edit" title={t('admin.customPages')} subtitle={t('admin.customPagesHint')}>
        <button className="btn-primary" onClick={() => open(null)}><Icon name="plus" className="h-4 w-4" />{t('admin.newPage')}</button>
      </PageTitle>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? (
        <EmptyState icon="edit" title={t('admin.noPages')}><button className="btn-primary" onClick={() => open(null)}>{t('admin.newPage')}</button></EmptyState>
      ) : (
        <ul className="space-y-3">
          {data.items.map((p) => (
            <li key={p.id} className="card flex flex-wrap items-center gap-3 p-4">
              {p.cover_url ? <img src={p.cover_url} alt="" className="h-14 w-20 rounded-lg object-cover" /> : <span className="flex h-14 w-20 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><Icon name="edit" /></span>}
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold">{pickLang(p.title, lang)}
                  <span className={`badge ${p.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{p.is_published ? t('admin.published') : t('admin.draft')}</span>
                </p>
                <p className="text-xs text-slate-500"><span dir="ltr">/p/{p.slug}</span> · {date(p.updated_at)}</p>
              </div>
              <div className="flex gap-1">
                {p.is_published && <Link to={`/p/${p.slug}`} target="_blank" className="btn-ghost px-3 py-2 text-xs"><Icon name="eye" className="h-4 w-4" />{t('admin.view')}</Link>}
                <button className="btn-outline px-3 py-2 text-xs" onClick={() => open(p)}><Icon name="edit" className="h-4 w-4" />{t('common.edit')}</button>
                <button className="btn-ghost px-3 py-2 text-xs text-rose-600" onClick={() => remove(p)}><Icon name="trash" className="h-4 w-4" />{t('common.delete')}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing && <PageEditor page={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
    </div>
  );
}

// ---------- Post a listing for any user ----------

export function AdminNewListing() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [seller, setSeller] = useState(null);
  const users = useApi(`/admin/users/pick?q=${encodeURIComponent(q)}`, undefined, [q]);

  if (!seller) {
    return (
      <div className="max-w-2xl">
        <PageTitle icon="plus" title={t('admin.addListing')} subtitle={t('admin.pickSellerHint')} />
        <input className="input mb-3" type="search" autoFocus placeholder={t('admin.searchUser')} value={q} onChange={(e) => setQ(e.target.value)} />
        {users.loading ? <Spinner /> : (
          <ul className="card divide-y divide-slate-100">
            {(users.data?.items || []).map((u) => (
              <li key={u.id}>
                <button type="button" onClick={() => setSeller(u)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start hover:bg-slate-50">
                  <span className="font-semibold">{u.name}</span>
                  <span className="text-xs text-slate-500"><span dir="ltr">{u.phone}</span> · {t(`roles.${u.account_type}`)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-sm text-slate-500">{t('admin.noSellerYet')} <Link to="/admin/users?new=1" className="link">{t('admin.addUser')}</Link></p>
      </div>
    );
  }
  return (
    <div>
      <p className="mb-2 flex flex-wrap items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-900">
        <Icon name="user" className="h-4 w-4" />{t('admin.postingAs', { name: seller.name })}
        <button type="button" className="link ms-auto text-xs" onClick={() => setSeller(null)}>{t('admin.changeSeller')}</button>
      </p>
      <div className="-mx-4 sm:-mx-6"><ProductForm sellerId={seller.id} onCreated={() => navigate('/admin/listings?status=approved')} /></div>
    </div>
  );
}
