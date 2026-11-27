// Spoken description of a listing: the seller records up to 90 s in the sell form; buyers play it.
import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { useRecorder } from '../lib/recorder.js';
import { useModule } from '../lib/modules.js';

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** value: { blob, seconds } (new recording) | { url, seconds } (saved) | null */
function VoiceFieldInner({ value, onChange }) {
  const { t } = useI18n();
  const recorder = useRecorder((blob, seconds) => onChange({ blob, seconds }), 90);
  const [src, setSrc] = useState(null);
  useEffect(() => {
    if (value?.blob) { const u = URL.createObjectURL(value.blob); setSrc(u); return () => URL.revokeObjectURL(u); }
    setSrc(value?.url || null);
    return undefined;
  }, [value]);
  const [error, setError] = useState(false);
  if (!recorder.supported) return null;
  const start = async () => { setError(false); try { await recorder.start(); } catch { setError(true); } };
  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3">
      <p className="text-sm font-semibold text-sky-900">🎙 {t('voice.title')}</p>
      <p className="mb-2 text-xs text-slate-600">{t('voice.hint')}</p>
      {recorder.recording ? (
        <div className="flex items-center gap-3" role="status">
          <span className="h-3 w-3 animate-pulse rounded-full bg-rose-600" aria-hidden="true" />
          <span className="flex-1 text-sm font-semibold text-rose-700">{t('chat.recording')} <span className="ltr-nums">{fmt(recorder.seconds)}</span> / 1:30</span>
          <button type="button" className="btn-ghost text-sm" onClick={recorder.cancel}>{t('common.cancel')}</button>
          <button type="button" className="btn-primary px-3 text-sm" onClick={recorder.stop}>{t('voice.stop')}</button>
        </div>
      ) : src ? (
        <div className="flex flex-wrap items-center gap-2">
          <audio src={src} controls preload="metadata" className="h-10 max-w-full flex-1" />
          <button type="button" className="btn-outline px-3 py-1.5 text-xs" onClick={start}>{t('voice.again')}</button>
          <button type="button" className="btn-ghost px-3 py-1.5 text-xs text-rose-600" onClick={() => onChange(null)}>{t('common.delete')}</button>
        </div>
      ) : (
        <button type="button" className="btn-outline px-4 py-2 text-sm" onClick={start}>🎤 {t('voice.record')}</button>
      )}
      {error && <p className="mt-1 text-xs text-rose-600">{t('errors.camera_denied')}</p>}
    </div>
  );
}

/** Player on the listing page. */
function VoicePlayerInner({ url, seconds }) {
  const { t } = useI18n();
  if (!url) return null;
  return (
    <div className="card flex flex-wrap items-center gap-3 p-4">
      <span className="text-2xl" aria-hidden="true">🎙</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{t('voice.listen')}</p>
        {seconds ? <p className="text-xs text-slate-500 ltr-nums">{fmt(seconds)}</p> : null}
      </div>
      <audio src={url} controls preload="none" className="h-10 w-full sm:w-72" />
    </div>
  );
}

/** Upload / remove the voice after the listing is saved. */
export async function saveVoice(api, productId, before, after) {
  if (after?.blob) {
    const fd = new FormData();
    const ext = after.blob.type.includes('mp4') ? 'm4a' : after.blob.type.includes('ogg') ? 'ogg' : 'webm';
    fd.append('voice', after.blob, `voice.${ext}`);
    fd.append('duration', String(Math.min(90, Math.max(1, after.seconds))));
    await api(`/products/${productId}/voice`, { method: 'POST', body: fd });
  } else if (before?.url && !after) {
    await api(`/products/${productId}/voice`, { method: 'DELETE' });
  }
}

/** Hidden while the admin has switched this feature off. */
export function VoiceField(props) {
  return useModule('voice') ? <VoiceFieldInner {...props} /> : null;
}

/** Hidden while the admin has switched this feature off. */
export function VoicePlayer(props) {
  return useModule('voice') ? <VoicePlayerInner {...props} /> : null;
}
