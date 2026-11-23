// Bulk upload from Excel / CSV: each row becomes a normal listing (same checks and review as the form).
// Photos are picked next to the file and matched by name through the "photos" column.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import readXlsxFile from 'read-excel-file';
import { ErrorBox, Icon, PageHeader } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { attributesFor } from '../lib/attributes.js';
import { useDocumentTitle } from '../lib/hooks.js';
import { compressImage } from '../lib/image.js';

const MAX_ROWS = 200;
const COLUMNS = ['title', 'description', 'price', 'old_price', 'category', 'city', 'condition', 'photos', 'brand', 'model', 'year', 'mileage', 'gearbox', 'fuel', 'deal', 'propertyType', 'rooms', 'surface', 'storage', 'ram'];

/** Minimal CSV reader (quotes, commas or semicolons, CRLF). */
function parseCsv(text) {
  const sep = (text.split('\n')[0].match(/;/g) || []).length > (text.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  const rows = []; let row = []; let cell = ''; let q = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i += 1; } else if (c === '"') q = false; else cell += c; continue; }
    if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((v) => String(v).trim()));
}

const norm = (s) => String(s ?? '').trim().toLowerCase();

export default function BulkImport() {
  const { t, tl, lang } = useI18n();
  const { categories, meta } = useApp();
  const [rows, setRows] = useState([]);
  const [photos, setPhotos] = useState({});
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  useDocumentTitle(t('bulk.title'));

  const findCategory = (v) => categories.find((c) => [c.slug, c.name_ar, c.name_fr, c.name_en].map(norm).includes(norm(v)));
  const findCity = (v) => meta.cities.find((c) => [c.key, c.ar, c.fr, c.en].map(norm).includes(norm(v)));
  const conditionOf = (v) => (['new', 'جديد', 'neuf', 'nouveau'].includes(norm(v)) ? 'new' : 'used');

  /** Check one row in the browser before sending (the server checks everything again). */
  const check = (r, files) => {
    const problems = [];
    if (String(r.title || '').trim().length < 3) problems.push(t('bulk.p.title'));
    if (String(r.description || '').trim().length < 10) problems.push(t('bulk.p.description'));
    if (!(Number(String(r.price).replace(/[\s,]/g, '')) >= 0) || r.price === '' || r.price == null) problems.push(t('bulk.p.price'));
    if (!findCategory(r.category)) problems.push(t('bulk.p.category'));
    if (!findCity(r.city)) problems.push(t('bulk.p.city'));
    const names = String(r.photos || '').split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
    const found = names.map((n) => files[norm(n)]).filter(Boolean);
    if (!found.length) problems.push(t('bulk.p.photos'));
    return { problems, images: found.slice(0, 8), missing: names.filter((n) => !files[norm(n)]) };
  };

  const readSheet = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null); setProgress(null);
    try {
      const table = /\.csv$/i.test(file.name) ? parseCsv((await file.text()).replace(/^﻿/, '')) : await readXlsxFile(file);
      const [head, ...body] = table;
      const keys = head.map((h) => COLUMNS.find((c) => norm(c) === norm(h)) || norm(h));
      if (!keys.includes('title')) throw new Error('no_title_column');
      const parsed = body.slice(0, MAX_ROWS).map((cells, i) => ({ n: i + 2, data: Object.fromEntries(keys.map((k, j) => [k, cells[j] ?? ''])) }));
      setRows(parsed.map((r) => ({ ...r, status: 'ready' })));
    } catch (err) { setError({ code: err.message === 'no_title_column' ? 'bulk_no_title' : 'bulk_unreadable' }); }
  };

  const pickPhotos = (e) => {
    const map = { ...photos };
    for (const f of e.target.files || []) map[norm(f.name)] = f;
    setPhotos(map);
    e.target.value = '';
  };

  const downloadTemplate = () => {
    const sample = [COLUMNS, ['تويوتا هايلكس 2018 دبل كابينة', 'سيارة نظيفة، صيانة دورية، مكيفة', '1350000', '', 'vehicles', 'nouakchott', 'used', 'hilux1.jpg, hilux2.jpg', 'toyota', 'Hilux', '2018', '120000', 'manual', 'diesel', '', '', '', '', '', ''],
      ['هاتف سامسونج A54 جديد', 'جديد في علبته مع الضمان', '16500', '18000', 'phones-electronics', 'nouakchott', 'new', 'a54.jpg', 'samsung', '', '', '', '', '', '', '', '', '', '128', '']];
    const csv = `﻿${sample.map((r) => r.map((v) => (/[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(',')).join('\r\n')}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'souk-chinguetti-template.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const checked = rows.map((r) => ({ ...r, ...check(r.data, photos) }));
  const valid = checked.filter((r) => !r.problems.length && r.status !== 'done');

  const importAll = async () => {
    setProgress({ done: 0, total: valid.length, ok: 0 });
    let ok = 0;
    for (const [i, r] of valid.entries()) {
      const d = r.data;
      const category = findCategory(d.category);
      const fd = new FormData();
      fd.append('title', String(d.title).trim());
      fd.append('description', String(d.description).trim());
      fd.append('price', String(d.price).replace(/[\s,]/g, ''));
      if (String(d.old_price || '').trim()) fd.append('oldPrice', String(d.old_price).replace(/[\s,]/g, ''));
      fd.append('categoryId', String(category.id));
      fd.append('city', findCity(d.city).key);
      fd.append('condition', conditionOf(d.condition));
      fd.append('attrs', JSON.stringify(Object.fromEntries(attributesFor(category.slug).map((a) => [a.key, d[a.key]]).filter(([, v]) => String(v ?? '').trim() !== ''))));
      for (const img of r.images) fd.append('images', (await compressImage(img).catch(() => null))?.file || img);
      let status = 'done'; let message = '';
      try { await api('/products', { method: 'POST', body: fd }); ok += 1; } catch (err) {
        status = 'failed';
        const field = err.fields && Object.keys(err.fields)[0];
        message = field ? `${field}: ${t(`fields.${err.fields[field]}`)}` : t(`errors.${err.code}`);
        if (err.code === 'too_many_requests') { setRows((all) => all.map((x) => (x.n === r.n ? { ...x, status, message } : x))); break; }
      }
      setRows((all) => all.map((x) => (x.n === r.n ? { ...x, status, message } : x)));
      setProgress({ done: i + 1, total: valid.length, ok });
    }
  };

  const busy = progress && progress.done < progress.total;
  return (
    <div className="container-page max-w-5xl py-8">
      <PageHeader title={`📥 ${t('bulk.title')}`}><Link to="/dashboard" className="btn-outline">{t('nav.dashboard')}</Link></PageHeader>
      <ol className="mb-5 grid gap-3 md:grid-cols-3">
        <li className="card space-y-2 p-4">
          <p className="font-bold">1. {t('bulk.step1')}</p>
          <p className="text-xs text-slate-500">{t('bulk.step1Text')}</p>
          <button type="button" className="btn-outline w-full" onClick={downloadTemplate}><Icon name="download" className="h-4 w-4" />{t('bulk.template')}</button>
        </li>
        <li className="card space-y-2 p-4">
          <p className="font-bold">2. {t('bulk.step2')}</p>
          <p className="text-xs text-slate-500">{t('bulk.step2Text')}</p>
          <label className="btn-primary w-full cursor-pointer"><Icon name="plus" className="h-4 w-4" />{t('bulk.pickFile')}<input type="file" accept=".xlsx,.csv" className="sr-only" onChange={readSheet} disabled={busy} /></label>
        </li>
        <li className="card space-y-2 p-4">
          <p className="font-bold">3. {t('bulk.step3')}</p>
          <p className="text-xs text-slate-500">{t('bulk.step3Text')}</p>
          <label className="btn-outline w-full cursor-pointer"><Icon name="image" className="h-4 w-4" />{t('bulk.pickPhotos', { n: Object.keys(photos).length })}<input type="file" accept="image/*" multiple className="sr-only" onChange={pickPhotos} disabled={busy} /></label>
        </li>
      </ol>
      <ErrorBox error={error} />
      {checked.length > 0 && (
        <section className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
            <p className="text-sm">{t('bulk.summary', { total: checked.length, ok: checked.filter((r) => !r.problems.length).length })}</p>
            <button className="btn-primary" onClick={importAll} disabled={busy || !valid.length}><Icon name="check" className="h-4 w-4" />{t('bulk.import', { n: valid.length })}</button>
          </div>
          {progress && (
            <div className="border-b border-slate-100 p-4" role="status">
              <p className="mb-1 text-sm">{t('bulk.progress', { done: progress.done, total: progress.total, ok: progress.ok })}</p>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-brand-600 transition-all" style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} /></div>
              {progress.done === progress.total && <p className="mt-2 text-sm text-emerald-700">{t('bulk.finished')}</p>}
            </div>
          )}
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500"><tr><th className="p-2 text-start">#</th><th className="p-2 text-start">{t('bulk.col.title')}</th><th className="p-2 text-start">{t('bulk.col.category')}</th><th className="p-2 text-start">{t('bulk.col.photos')}</th><th className="p-2 text-start">{t('bulk.col.status')}</th></tr></thead>
              <tbody>
                {checked.map((r) => {
                  const cat = findCategory(r.data.category);
                  return (
                    <tr key={r.n} className={`border-t border-slate-100 ${r.status === 'done' ? 'bg-emerald-50/60' : r.problems.length || r.status === 'failed' ? 'bg-rose-50/60' : ''}`}>
                      <td className="p-2 text-xs text-slate-400">{r.n}</td>
                      <td className="p-2 font-semibold">{String(r.data.title || '—')}<span className="block text-xs font-normal text-slate-500 ltr-nums">{String(r.data.price || '')} MRU</span></td>
                      <td className="p-2 text-xs">{cat ? tl(cat) : '—'}</td>
                      <td className="p-2 text-xs">{r.images.length}{r.missing.length > 0 && <span className="block text-rose-600" lang={lang}>{t('bulk.missing', { names: r.missing.join('، ') })}</span>}</td>
                      <td className="p-2 text-xs">
                        {r.status === 'done' ? <span className="text-emerald-700">✓ {t('bulk.sent')}</span>
                          : r.status === 'failed' ? <span className="text-rose-700">✕ {r.message}</span>
                            : r.problems.length ? <span className="text-rose-700">{r.problems.join(' · ')}</span> : <span className="text-slate-500">{t('bulk.readyRow')}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <p className="mt-4 text-xs text-slate-500">{t('bulk.note')}</p>
    </div>
  );
}
