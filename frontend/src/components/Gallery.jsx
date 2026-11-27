import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { Icon } from './ui.jsx';
import { thumb, useLite } from '../lib/dataSaver.js';

/** Horizontal, swipeable strip of images (scroll-snap). Reports the visible index. */
function SwipeTrack({ images, index, onIndex, render, className = '' }) {
  const track = useRef();
  // Keep the track in LTR so scroll maths is identical in Arabic and French.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const target = index * el.clientWidth;
    if (Math.abs(el.scrollLeft - target) > 4) el.scrollTo({ left: target, behavior: 'smooth' });
  }, [index]);
  const onScroll = () => {
    const el = track.current;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) onIndex(i);
  };
  return (
    <div ref={track} dir="ltr" onScroll={onScroll} className={`no-scrollbar flex snap-x snap-mandatory overflow-x-auto ${className}`}>
      {images.map((img, i) => (
        <div key={img.id} className="w-full shrink-0 snap-center">{render(img, i)}</div>
      ))}
    </div>
  );
}

function NavButtons({ count, index, setIndex, dark = false }) {
  const { t } = useI18n();
  if (count < 2) return null;
  const base = `absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full p-2 shadow-md transition sm:block ${dark ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-surface/90 text-slate-800 hover:bg-surface'}`;
  return (
    <>
      <button type="button" aria-label={t('common.previous')} disabled={index === 0} onClick={() => setIndex(index - 1)} className={`${base} left-3 disabled:opacity-0`}>
        <Icon name="chevronLeft" />
      </button>
      <button type="button" aria-label={t('common.next')} disabled={index === count - 1} onClick={() => setIndex(index + 1)} className={`${base} right-3 disabled:opacity-0`}>
        <Icon name="chevron" />
      </button>
    </>
  );
}

/** Full-screen viewer: swipe between photos, double-tap or button to zoom, pinch-zoom on phones. */
function Lightbox({ images, start, title, onClose }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(start);
  const [zoomed, setZoomed] = useState(false);

  const go = useCallback((i) => { setZoomed(false); setIndex(Math.max(0, Math.min(images.length - 1, i))); }, [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [index, go, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[60] flex flex-col bg-black/95 text-white animate-fade-in">
      <div className="flex items-center justify-between p-3">
        <span className="text-sm text-white/70 ltr-nums">{t('product.photo', { i: index + 1, n: images.length })}</span>
        <div className="flex gap-1">
          <button type="button" onClick={() => setZoomed(!zoomed)} className="rounded-full p-2 hover:bg-white/10" aria-label={t('product.zoom')} aria-pressed={zoomed}>
            <Icon name={zoomed ? 'x' : 'search'} />
          </button>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label={t('common.close')}><Icon name="x" /></button>
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {zoomed ? (
          <div className="h-full overflow-auto" style={{ touchAction: 'pan-x pan-y pinch-zoom' }} onDoubleClick={() => setZoomed(false)}>
            <img src={images[index].url} alt={title} className="h-auto min-h-full w-[220%] max-w-none object-contain" />
          </div>
        ) : (
          <>
            <SwipeTrack images={images} index={index} onIndex={setIndex} className="h-full"
              render={(img) => (
                <div className="flex h-full items-center justify-center p-2" style={{ touchAction: 'pan-x pinch-zoom' }} onDoubleClick={() => setZoomed(true)}>
                  <img src={lite ? thumb(img.url, 480) : img.url} alt={title} className="max-h-full max-w-full object-contain" draggable="false" />
                </div>
              )} />
            <NavButtons count={images.length} index={index} setIndex={go} dark />
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto p-3" dir="ltr">
          {images.map((img, i) => (
            <button key={img.id} type="button" onClick={() => go(i)} aria-label={t('product.photo', { i: i + 1, n: images.length })}
              className={`h-12 w-16 shrink-0 overflow-hidden rounded-md ring-2 ${i === index ? 'ring-gold-400' : 'ring-transparent opacity-50'}`}>
              <img src={thumb(img.url, 240)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Gallery({ images, title, badge }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState(null);
  if (!images.length) return <div className="card aspect-[4/3] bg-slate-100" />;

  return (
    <div>
      <div className="relative -mx-4 overflow-hidden bg-ink sm:mx-0 sm:rounded-2xl">
        <SwipeTrack images={images} index={index} onIndex={setIndex}
          render={(img, i) => (
            <button type="button" onClick={() => setViewer(i)} className="block w-full cursor-zoom-in" aria-label={t('product.zoom')}>
              <img src={img.url} alt={i === 0 ? title : ''} loading={i === 0 ? 'eager' : 'lazy'} className="mx-auto aspect-[4/3] w-full object-contain" draggable="false" />
            </button>
          )} />
        <NavButtons count={images.length} index={index} setIndex={setIndex} />
        {badge && <div className="pointer-events-none absolute start-3 top-3">{badge}</div>}
        {images.length > 1 && (
          <>
            <span className="pointer-events-none absolute bottom-3 end-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white ltr-nums">
              {index + 1} / {images.length}
            </span>
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden" dir="ltr">
              {images.map((img, i) => <span key={img.id} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />)}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar mt-3 hidden gap-2 overflow-x-auto sm:flex" dir="ltr">
          {images.map((img, i) => (
            <button key={img.id} type="button" onClick={() => setIndex(i)} aria-label={t('product.photo', { i: i + 1, n: images.length })}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg ring-2 ${i === index ? 'ring-brand-600' : 'ring-transparent opacity-70 hover:opacity-100'}`}>
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {viewer !== null && <Lightbox images={images} start={viewer} title={title} onClose={() => setViewer(null)} />}
    </div>
  );
}
