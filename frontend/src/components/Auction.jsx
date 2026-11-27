// Auctions (المزادات) on a listing: the live box on the product page (countdown, bids, history),
// the seller's "start an auction" dialog, the small badge on cards and the result card in the chat.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/hooks.js';
import { ErrorBox, Modal } from './ui.jsx';

/** Seconds left until `endsAt`, updated every second. */
export function useCountdown(endsAt) {
  const left = () => (endsAt ? Math.max(0, Math.floor((new Date(endsAt) - Date.now()) / 1000)) : 0);
  const [s, setS] = useState(left);
  useEffect(() => {
    setS(left());
    if (!endsAt) return undefined;
    const id = setInterval(() => setS(left()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);
  return s;
}

/** "2 d 03:15:09" style countdown, digits left-to-right. */
export function Countdown({ endsAt, className = '' }) {
  const { t } = useI18n();
  const s = useCountdown(endsAt);
  const d = Math.floor(s / 86400);
  const hms = [Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join(':');
  return <bdi dir="ltr" className={`tabular-nums ${className}`}>{d > 0 ? `${d}${t('auction.daysShort')} ` : ''}{hms}</bdi>;
}

/** One line on listing cards: "🔨 Auction · 12,000 MRU · 03:12:45". */
export function AuctionBadge({ auction }) {
  const { t, price } = useI18n();
  if (!auction) return null;
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-1 text-[11px] font-semibold text-orange-700">
      🔨 {t('auction.badge')} · <span className="ltr-nums">{price(auction.current)}</span> · <Countdown endsAt={auction.ends_at} />
    </p>
  );
}

const HOURS = [6, 12, 24, 48, 72, 120, 168];

/** The seller's form: start price, step, hidden reserve, length. */
function StartDialog({ product, open, onClose, onDone }) {
  const { t, number } = useI18n();
  const { meta } = useApp();
  const limits = meta.auctions || { minHours: 6, maxDays: 7 };
  const hours = HOURS.filter((h) => h >= limits.minHours && h <= limits.maxDays * 24);
  const [f, setF] = useState({ startPrice: '', minIncrement: '', reservePrice: '', hours: hours.includes(24) ? 24 : hours[0] });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError(null);
    try {
      await api('/auctions', { method: 'POST', body: {
        productId: product.id, startPrice: Number(f.startPrice), hours: Number(f.hours),
        minIncrement: f.minIncrement ? Number(f.minIncrement) : null, reservePrice: f.reservePrice ? Number(f.reservePrice) : null,
      } });
      onDone();
    } catch (err) { setError(err); } finally { setBusy(false); }
  };
  const lengthLabel = (h) => (h < 24 ? t('auction.hours', { n: number(h) }) : t('auction.days', { n: number(h / 24) }));
  return (
    <Modal open={open} onClose={onClose} title={`🔨 ${t('auction.start')}`}>
      <form onSubmit={submit} className="space-y-3 text-sm">
        <p className="rounded-xl bg-orange-50 p-3 text-xs leading-relaxed text-orange-900">{t('auction.howSeller')}</p>
        <label className="block">
          <span className="mb-1 block font-semibold">{t('auction.startPrice')}</span>
          <input className="input" type="number" min="1" inputMode="numeric" dir="ltr" required value={f.startPrice}
            placeholder={String(Math.round(Number(product.price) * 0.7) || '')} onChange={(e) => setF({ ...f, startPrice: e.target.value })} />
        </label>
        <label className="block">
          <span className="mb-1 block font-semibold">{t('auction.step')} <span className="font-normal text-slate-500">({t('common.optional')})</span></span>
          <input className="input" type="number" min="1" inputMode="numeric" dir="ltr" value={f.minIncrement} onChange={(e) => setF({ ...f, minIncrement: e.target.value })} />
          <span className="mt-1 block text-xs text-slate-500">{t('auction.stepHint')}</span>
        </label>
        <label className="block">
          <span className="mb-1 block font-semibold">{t('auction.reserve')} <span className="font-normal text-slate-500">({t('common.optional')})</span></span>
          <input className="input" type="number" min="1" inputMode="numeric" dir="ltr" value={f.reservePrice} onChange={(e) => setF({ ...f, reservePrice: e.target.value })} />
          <span className="mt-1 block text-xs text-slate-500">{t('auction.reserveHint')}</span>
        </label>
        <div>
          <span className="mb-1 block font-semibold">{t('auction.length')}</span>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t('auction.length')}>
            {hours.map((h) => (
              <button key={h} type="button" role="radio" aria-checked={Number(f.hours) === h} onClick={() => setF({ ...f, hours: h })}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${Number(f.hours) === h ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{lengthLabel(h)}</button>
            ))}
          </div>
        </div>
        <ErrorBox error={error} />
        <button className="btn-primary w-full" disabled={busy}>{busy ? t('common.loading') : t('auction.startNow')}</button>
      </form>
    </Modal>
  );
}

/** The bid form: quick amounts, and a second tap to confirm big jumps. */
function BidForm({ a, onDone }) {
  const { t, price } = useI18n();
  const [amount, setAmount] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setAmount(''); setConfirm(false); }, [a.min_bid]);
  const quick = [a.min_bid, a.min_bid + a.min_increment, a.min_bid + 4 * a.min_increment];
  const send = async (e) => {
    e.preventDefault();
    const n = Number(amount || a.min_bid);
    if (n >= a.min_bid * 2 && !confirm) { setConfirm(true); return; }
    setBusy(true); setError(null);
    try { await api(`/auctions/${a.id}/bids`, { method: 'POST', body: { amount: n } }); setAmount(''); setConfirm(false); onDone(); } catch (err) {
      setError(err); if (err.code === 'auction_closed' || err.code === 'bid_too_low') onDone();
    } finally { setBusy(false); }
  };
  return (
    <form onSubmit={send} className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {quick.map((q) => (
          <button key={q} type="button" onClick={() => { setAmount(String(q)); setConfirm(false); }}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${Number(amount) === q ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-800'}`}>
            <span className="ltr-nums">{price(q)}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input min-w-0 flex-1" type="number" min={a.min_bid} inputMode="numeric" dir="ltr" value={amount}
          placeholder={String(a.min_bid)} onChange={(e) => { setAmount(e.target.value); setConfirm(false); }} aria-label={t('auction.yourBid')} />
        <button className={`btn shrink-0 text-white ${confirm ? 'bg-rose-600' : 'bg-orange-600 hover:bg-orange-700'}`} disabled={busy}>
          {busy ? '…' : confirm ? t('auction.confirmBig') : `🔨 ${t('auction.bid')}`}
        </button>
      </div>
      {confirm && <p className="text-xs font-semibold text-rose-700">{t('auction.bigWarning', { amount: price(Number(amount)) })}</p>}
      {error && (error.code === 'bid_too_low' && error.fields?.min
        ? <p className="text-sm text-rose-700" role="alert">{t('errors.bid_too_low', { min: price(error.fields.min) })}</p>
        : <ErrorBox error={error} />)}
      <p className="text-[11px] leading-relaxed text-slate-500">{t('auction.bidNote')}</p>
    </form>
  );
}

/** The auction box on the product page (or the seller's "start an auction" button). */
export function AuctionBox({ product, onChange }) {
  const { t, price, ago } = useI18n();
  const { user, meta } = useApp();
  const { data, reload } = useApi(`/products/${product.id}/auction`, undefined, [product.id, user?.id]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const a = data?.auction;
  const active = a?.status === 'active';
  const s = useCountdown(active ? a.ends_at : null);
  // Refresh while it runs (every 10 s; every 3 s in the last minute), only when the tab is visible.
  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => { if (document.visibilityState === 'visible') reload(); }, s < 60 ? 3000 : 10000);
    return () => clearInterval(id);
  }, [active, s < 60, reload]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (active && s === 0) { const id = setTimeout(reload, 1500); return () => clearTimeout(id); } return undefined; }, [active, s, reload]);

  const isOwner = user && user.id === product.seller_id;
  const done = () => { reload(); onChange?.(); };

  if (!a) {
    if (!isOwner || !meta.auctions || product.status !== 'approved' || product.availability !== 'available') return null;
    return (
      <>
        <button type="button" onClick={() => setOpen(true)} className="btn w-full border-2 border-dashed border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100">🔨 {t('auction.start')}</button>
        <StartDialog product={product} open={open} onClose={() => setOpen(false)} onDone={() => { setOpen(false); done(); }} />
      </>
    );
  }

  const cancel = async () => {
    if (!window.confirm(t('auction.cancelConfirm'))) return;
    setBusy(true);
    try { await api(`/auctions/${a.id}/cancel`, { method: 'POST', body: {} }); done(); } catch (err) { window.alert(t(`errors.${err.code}`)); } finally { setBusy(false); }
  };

  return (
    <section className={`card space-y-3 border-2 p-5 ${active ? 'border-orange-300' : 'border-slate-200'}`} aria-label={t('auction.title')}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">🔨 {active ? t('auction.title') : t('auction.ended')}</h2>
        {active && <span className={`rounded-full px-3 py-1 text-sm font-bold ${s < 300 ? 'bg-rose-600 text-white' : 'bg-orange-100 text-orange-800'}`}>⏳ <Countdown endsAt={a.ends_at} /></span>}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">{a.current_bid ? t('auction.current') : t('auction.startsAt')}</p>
          <p className="text-2xl font-bold text-orange-700"><span className="ltr-nums">{price(a.current_bid || a.start_price)}</span></p>
        </div>
        <p className="text-end text-xs text-slate-500">{t('auction.bidsCount', { n: a.bid_count })}<br />
          {a.has_reserve && <span className={a.reserve_reached ? 'font-semibold text-emerald-700' : 'text-amber-700'}>{a.reserve_reached ? t('auction.reserveReached') : t('auction.reserveNotReached')}</span>}
        </p>
      </div>
      {isOwner && a.reserve_price && <p className="text-xs text-slate-500">{t('auction.yourReserve', { amount: price(a.reserve_price) })}</p>}

      {active && a.is_leading && <p className="rounded-xl bg-emerald-50 p-2.5 text-sm font-semibold text-emerald-800">✅ {t('auction.leading')}</p>}
      {active && !isOwner && !a.is_leading && (user
        ? <BidForm a={a} onDone={done} />
        : <Link to="/login" state={{ from: `/products/${product.id}` }} className="btn w-full bg-orange-600 text-white">{t('auction.loginToBid')}</Link>)}

      {!active && (
        <div className="rounded-xl bg-slate-50 p-3 text-sm">
          {a.is_winner && <p className="font-bold text-emerald-700">🎉 {t('auction.youWon', { amount: price(a.current_bid) })}</p>}
          {!a.is_winner && a.bid_count === 0 && <p>{t('auction.noBids')}</p>}
          {!a.is_winner && a.bid_count > 0 && (a.reserve_met
            ? <p>{t('auction.soldFor', { amount: price(a.current_bid) })}</p>
            : <p>{t('auction.reserveUnmet', { amount: price(a.current_bid) })}</p>)}
          {a.conversation_id && <Link to={`/messages/${a.conversation_id}`} className="btn-primary mt-2 w-full">💬 {isOwner ? t('auction.chatWinner') : t('auction.chatSeller')}</Link>}
        </div>
      )}

      {a.bids?.length > 0 && (
        <details className="text-sm" open={active}>
          <summary className="cursor-pointer font-semibold text-slate-700">{t('auction.history')}</summary>
          <ol className="mt-2 max-h-56 space-y-1 overflow-y-auto">
            {a.bids.map((b, i) => (
              <li key={b.id} className={`flex items-center justify-between rounded-lg px-2 py-1 ${i === 0 ? 'bg-orange-50 font-semibold' : ''}`}>
                <span>{b.is_me ? t('auction.you') : b.name}{isOwner && b.bidder_id && <Link to={`/users/${b.bidder_id}`} className="ms-1 text-xs text-brand-700">↗</Link>}</span>
                <span className="flex items-center gap-2"><span className="ltr-nums">{price(b.amount)}</span><span className="text-[11px] font-normal text-slate-400">{ago(b.created_at)}</span></span>
              </li>
            ))}
          </ol>
        </details>
      )}

      {active && (isOwner && a.bid_count === 0 || user?.role === 'admin') && (
        <button type="button" onClick={cancel} disabled={busy} className="text-xs font-semibold text-rose-600 hover:underline">{t('auction.cancel')}</button>
      )}
      {!active && isOwner && product.availability === 'available' && meta.auctions && (
        <>
          <button type="button" onClick={() => setOpen(true)} className="btn-outline w-full text-sm">🔨 {t('auction.again')}</button>
          <StartDialog product={product} open={open} onClose={() => setOpen(false)} onDone={() => { setOpen(false); done(); }} />
        </>
      )}
    </section>
  );
}

/** The card the site posts in the chat when an auction ends. */
export function AuctionResultCard({ m }) {
  const { t, price } = useI18n();
  const met = m.offer_status === 'accepted';
  return (
    <div className={`rounded-2xl border-2 p-3 text-sm text-slate-800 ${met ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
      <p className="font-bold">🔨 {t('auction.chatTitle')}</p>
      <p className="mt-1 text-lg font-bold"><span className="ltr-nums">{price(m.amount)}</span></p>
      <p className="mt-1 text-xs leading-relaxed">{met ? t('auction.chatMet') : t('auction.chatUnmet')}</p>
    </div>
  );
}
