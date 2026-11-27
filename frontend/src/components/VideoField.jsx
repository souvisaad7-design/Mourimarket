// A short video for the listing: checked in the browser (≤ 60 s, ≤ 60 MB), then uploaded straight
// to storage with a one-time key from our server, with a progress bar.
import { useRef, useState } from 'react';
import { put } from '@vercel/blob';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { Icon } from './ui.jsx';
import { useModule } from '../lib/modules.js';

const MAX_SECONDS = 60;
const MAX_BYTES = 60 * 1024 * 1024;
const EXT = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };

const durationOf = (file) => new Promise((resolve) => {
  const v = document.createElement('video');
  v.preload = 'metadata';
  v.onloadedmetadata = () => { URL.revokeObjectURL(v.src); resolve(v.duration); };
  v.onerror = () => resolve(NaN);
  v.src = URL.createObjectURL(file);
});

function VideoFieldInner({ value, onChange }) {
  const { t } = useI18n();
  const { meta } = useApp();
  const input = useRef(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  if (!meta.videoUploads) return null;

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    const ext = EXT[file.type] || (/\.mov$/i.test(file.name) ? 'mov' : /\.webm$/i.test(file.name) ? 'webm' : /\.mp4$/i.test(file.name) ? 'mp4' : null);
    if (!ext) return setError(t('video.badType'));
    if (file.size > MAX_BYTES) return setError(t('video.tooBig'));
    const seconds = await durationOf(file);
    if (seconds > MAX_SECONDS + 1) return setError(t('video.tooLong'));
    try {
      setProgress(0);
      const { token, pathname, contentType } = await api('/products/video-token', { method: 'POST', body: { ext } });
      const blob = await put(pathname, file, {
        access: 'public', token, contentType, multipart: file.size > 8 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      onChange(blob.url);
    } catch (err) {
      setError(err?.code === 'phone_unverified' ? t('errors.phone_unverified') : t('video.failed'));
    } finally { setProgress(null); }
  };

  return (
    <section className="space-y-2">
      <p className="label mb-0">🎬 {t('video.title')} <span className="font-normal text-slate-400">({t('common.optional')})</span></p>
      <p className="text-xs text-slate-500">{t('video.hint')}</p>
      {value ? (
        <div className="space-y-2">
          <video src={value} controls playsInline preload="metadata" className="max-h-72 w-full rounded-xl bg-black" />
          <button type="button" className="btn-ghost text-sm text-rose-600" onClick={() => onChange('')}><Icon name="trash" className="h-4 w-4" />{t('video.remove')}</button>
        </div>
      ) : progress !== null ? (
        <div className="rounded-xl border border-slate-200 p-3" role="status">
          <p className="mb-2 text-sm">{t('video.uploading')} <span className="ltr-nums">{progress}%</span></p>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      ) : (
        <button type="button" className="btn-outline w-full border-dashed py-4" onClick={() => input.current?.click()}><Icon name="plus" className="h-4 w-4" />{t('video.add')}</button>
      )}
      <input ref={input} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={pick} />
      {error && <p role="alert" className="text-xs font-medium text-rose-600">{error}</p>}
    </section>
  );
}

/** Hidden while the admin has switched this feature off. */
export default function VideoField(props) {
  return useModule('video') ? <VideoFieldInner {...props} /> : null;
}
