// Souk Social: a feed of posts about real listings, with likes, comments, shares, follows and reports.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { put } from '@vercel/blob';
import { Avatar, EmptyState, ErrorBox, Icon, Modal, Spinner, VerifiedBadge } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';
import { compressImage } from '../lib/image.js';

export const REPORT_REASONS = ['scam', 'prohibited', 'offensive', 'nudity', 'violence', 'spam', 'other'];

/** "Report" dialog for a post, comment, live or live comment. */
export function ReportDialog({ target, onClose }) {
  const { t } = useI18n();
  const { notify } = useApp();
  const [reason, setReason] = useState('scam');
  const [details, setDetails] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  if (!target) return null;
  const send = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await api('/social/reports', { method: 'POST', body: { targetType: target.type, targetId: target.id, reason, details: details || undefined } });
      notify(t('social.reported')); onClose();
    } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={t('social.reportTitle')}>
      <form onSubmit={send} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {REPORT_REASONS.map((r) => (
            <label key={r} className={`cursor-pointer rounded-xl border-2 px-3 py-2 text-sm ${reason === r ? 'border-brand-600 bg-brand-50' : 'border-slate-200'}`}>
              <input type="radio" className="sr-only" checked={reason === r} onChange={() => setReason(r)} />{t(`social.reasons.${r}`)}
            </label>
          ))}
        </div>
        <textarea className="input" rows={2} maxLength={500} value={details} onChange={(e) => setDetails(e.target.value)} placeholder={t('social.reportDetails')} />
        <ErrorBox error={error} />
        <button className="btn-primary w-full" disabled={busy}>{t('social.sendReport')}</button>
      </form>
    </Modal>
  );
}

/** Follow / unfollow a user (or the owner of a store). */
export function FollowButton({ userId, className = '', onChange }) {
  const { t, number } = useI18n();
  const { user } = useApp();
  const navigate = useNavigate();
  const { data, reload } = useApi(userId ? `/social/users/${userId}` : null, undefined, [userId, user?.id]);
  const [busy, setBusy] = useState(false);
  if (!data || user?.id === userId) return data ? <span className="text-xs text-slate-500">{t('social.followers', { n: number(data.followers) })}</span> : null;
  const toggle = async () => {
    if (!user) { navigate('/login'); return; }
    setBusy(true);
    try { await api(`/social/follow/${userId}`, { method: data.followed_by_me ? 'DELETE' : 'POST' }); await reload(); onChange?.(); } catch { /* shown by state */ } finally { setBusy(false); }
  };
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <button type="button" onClick={toggle} disabled={busy || data.blocked_by_me}
        className={`rounded-full px-4 py-1.5 text-sm font-bold ${data.followed_by_me ? 'border border-slate-300 bg-surface text-slate-700' : 'bg-brand-700 text-white hover:bg-brand-800'}`}>
        {data.followed_by_me ? `✓ ${t('social.following')}` : `+ ${t('social.follow')}`}
      </button>
      <span className="text-xs text-slate-500">{t('social.followers', { n: number(data.followers) })}</span>
    </span>
  );
}

function Media({ media }) {
  const [i, setI] = useState(0);
  if (!media?.length) return null;
  const m = media[Math.min(i, media.length - 1)];
  return (
    <div className="relative bg-black">
      {m.type === 'video'
        ? <video src={m.url} controls playsInline preload="metadata" className="max-h-[70vh] w-full" />
        : <img src={m.url} alt="" loading="lazy" className="max-h-[70vh] w-full object-contain" />}
      {media.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {media.map((x, k) => (
            <button key={x.url} type="button" onClick={() => setI(k)} aria-label={`${k + 1}`}
              className={`h-2 rounded-full ${k === i ? 'w-5 bg-white' : 'w-2 bg-white/60'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/** One post in the feed (or on its own page with `full`). */
export function PostCard({ post: initial, full = false, onDeleted }) {
  const { t, price, ago, number } = useI18n();
  const { user, notify } = useApp();
  const navigate = useNavigate();
  const [post, setPost] = useState(initial);
  const [menu, setMenu] = useState(false);
  const [report, setReport] = useState(null);
  const mine = user?.id === post.author_id;
  const p = post.product;
  const needLogin = () => { if (!user) { navigate('/login'); return true; } return false; };

  const like = async () => {
    if (needLogin()) return;
    const r = await api(`/social/posts/${post.id}/like`, { method: post.liked ? 'DELETE' : 'POST' }).catch(() => null);
    if (r) setPost({ ...post, liked: r.liked, like_count: r.like_count });
  };
  const follow = async () => {
    if (needLogin()) return;
    const r = await api(`/social/follow/${post.author_id}`, { method: post.following ? 'DELETE' : 'POST' }).catch(() => null);
    if (r) setPost({ ...post, following: r.following });
  };
  const share = async () => {
    const url = `${window.location.origin}/social/posts/${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: p.title, text: post.body?.slice(0, 120) || p.title, url });
      else { await navigator.clipboard.writeText(url); notify(t('product.linkCopied')); }
      const r = await api(`/social/posts/${post.id}/share`, { method: 'POST' });
      setPost((x) => ({ ...x, share_count: r.share_count }));
    } catch { /* cancelled */ }
  };
  const remove = async () => {
    if (!window.confirm(t('social.deleteConfirm'))) return;
    await api(`/social/posts/${post.id}`, { method: 'DELETE' });
    notify(t('social.deleted')); onDeleted?.(post.id);
  };
  const block = async () => {
    if (!window.confirm(t('social.blockConfirm', { name: post.author_name }))) return;
    await api(`/social/block/${post.author_id}`, { method: 'POST' });
    notify(t('social.blocked')); onDeleted?.(post.id);
  };

  return (
    <article className="card overflow-hidden p-0">
      <header className="flex items-center gap-3 p-3">
        <Link to={post.store_slug ? `/stores/${post.store_slug}` : `/users/${post.author_id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
          <Avatar name={post.store_name || post.author_name} url={post.store_logo || post.author_avatar} size="h-10 w-10" />
          <span className="min-w-0">
            <span className="flex min-w-0 items-center gap-1 font-bold"><bdi dir="auto" className="truncate">{post.store_name || post.author_name}</bdi>{post.author_verified && <VerifiedBadge small />}</span>
            <span className="block text-xs text-slate-500">{ago(post.created_at)}{post.visibility === 'followers' ? ` · 👥 ${t('social.followersOnly')}` : ''}</span>
          </span>
        </Link>
        {!mine && (
          <button type="button" onClick={follow}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${post.following ? 'border border-slate-300 text-slate-600' : 'bg-brand-700 text-white'}`}>
            {post.following ? `✓ ${t('social.following')}` : `+ ${t('social.follow')}`}
          </button>
        )}
        <div className="relative">
          <button type="button" className="btn-ghost p-2" onClick={() => setMenu(!menu)} aria-label={t('social.more')}>⋯</button>
          {menu && (
            <div className="absolute end-0 z-10 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-surface text-sm shadow-lg" onMouseLeave={() => setMenu(false)}>
              {mine || user?.role === 'admin'
                ? <button type="button" className="block w-full px-3 py-2 text-start text-rose-600 hover:bg-slate-50" onClick={remove}>{t('common.delete')}</button>
                : (
                  <>
                    <button type="button" className="block w-full px-3 py-2 text-start hover:bg-slate-50" onClick={() => { setMenu(false); if (!needLogin()) setReport({ type: 'post', id: post.id }); }}>🚩 {t('social.report')}</button>
                    {user && <button type="button" className="block w-full px-3 py-2 text-start hover:bg-slate-50" onClick={block}>⛔ {t('social.block')}</button>}
                  </>
                )}
            </div>
          )}
        </div>
      </header>
      {post.body && <p className={`whitespace-pre-line px-3 pb-3 text-[15px] leading-relaxed ${full ? '' : 'line-clamp-5'}`}>{post.body}</p>}
      <Media media={post.media} />
      {/* The listing this post is about: open it, order it, or message the seller. */}
      <div className="m-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
        {p.cover_url && <img src={p.cover_url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />}
        <Link to={`/products/${p.id}`} className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{p.title}</p>
          <p className="font-bold text-brand-700 ltr-nums">{price(p.price)}{p.old_price > p.price && <span className="ms-2 text-xs font-normal text-slate-400 line-through">{price(p.old_price)}</span>}</p>
          {p.availability === 'sold' && <span className="text-xs text-rose-600">{t('common.sold')}</span>}
        </Link>
        {p.availability !== 'sold' && !mine && <Link to={`/products/${p.id}`} className="btn-accent shrink-0 rounded-full px-3 py-1.5 text-xs">{t('social.buy')}</Link>}
      </div>
      <footer className="flex items-center gap-1 border-t border-slate-100 px-2 py-1.5 text-sm">
        <button type="button" onClick={like} className={`btn-ghost flex-1 gap-1.5 px-2 py-1.5 ${post.liked ? 'text-rose-600' : ''}`} aria-pressed={post.liked}>
          <Icon name="heart" filled={post.liked} className="h-5 w-5" /><span className="ltr-nums">{number(post.like_count)}</span>
        </button>
        <Link to={`/social/posts/${post.id}#comments`} className="btn-ghost flex-1 gap-1.5 px-2 py-1.5">
          <Icon name="chat" className="h-5 w-5" /><span className="ltr-nums">{number(post.comment_count)}</span>
        </Link>
        <button type="button" onClick={share} className="btn-ghost flex-1 gap-1.5 px-2 py-1.5">
          <Icon name="share" className="h-5 w-5" /><span className="ltr-nums">{number(post.share_count)}</span>
        </button>
      </footer>
      <ReportDialog target={report} onClose={() => setReport(null)} />
    </article>
  );
}

/** Seller's composer: pick one of their live listings, write, add photos or a short video. */
function Composer({ onPosted }) {
  const { t } = useI18n();
  const { user, meta } = useApp();
  const mine = useApi(user ? `/products?seller=${user.id}&limit=60` : null, undefined, [user?.id]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ productId: '', body: '', visibility: 'public', comments: 'everyone' });
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState(null);
  if (!user || user.account_type === 'buyer') return null;
  const products = mine.data?.items || [];
  const addImages = async (list) => {
    setBusy('photos');
    const out = [];
    for (const file of Array.from(list).slice(0, 6 - images.length)) {
      try { out.push((await compressImage(file)).file); } catch { /* skip unreadable */ }
    }
    setImages((x) => [...x, ...out]); setBusy('');
  };
  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let videoUrl = '';
      if (video) {
        setBusy('video');
        const ext = video.name.split('.').pop().toLowerCase().replace('qt', 'mov');
        const { token, pathname, contentType } = await api('/products/video-token', { method: 'POST', body: { ext } });
        videoUrl = (await put(pathname, video, { access: 'public', token, contentType, multipart: video.size > 8 * 1024 * 1024 })).url;
      }
      setBusy('post');
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => fd.append(k, v));
      if (videoUrl) fd.append('videoUrl', videoUrl);
      images.forEach((img) => fd.append('images', img));
      const { post } = await api('/social/posts', { method: 'POST', body: fd });
      setF({ productId: '', body: '', visibility: 'public', comments: 'everyone' }); setImages([]); setVideo(null); setOpen(false);
      onPosted(post);
    } catch (err) { setError(err); } finally { setBusy(''); }
  };
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="card flex w-full items-center gap-3 p-3 text-start text-slate-500 hover:bg-slate-50">
        <Avatar name={user.name} url={user.avatar_url} size="h-10 w-10" />
        <span className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm">{t('social.composePrompt')}</span>
        <span aria-hidden="true">📷</span>
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <label className="block text-sm font-semibold" htmlFor="post-product">{t('social.whichProduct')}</label>
      {!products.length && !mine.loading ? (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{t('social.needProduct')} <Link to="/sell" className="font-bold underline">{t('nav.post')}</Link></p>
      ) : (
        <select id="post-product" className="input" required value={f.productId} onChange={(e) => setF({ ...f, productId: e.target.value })}>
          <option value="">{t('form.choose')}</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      )}
      <textarea className="input" rows={3} maxLength={2000} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} placeholder={t('social.bodyPh')} />
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <div key={i} className="relative h-20 w-20 shrink-0">
              <img src={URL.createObjectURL(img)} alt="" className="h-full w-full rounded-lg object-cover" />
              <button type="button" onClick={() => setImages(images.filter((_, k) => k !== i))} className="absolute end-1 top-1 rounded-full bg-surface/90 p-0.5 text-rose-600" aria-label={t('common.delete')}><Icon name="x" className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}
      {video && <p className="text-xs text-slate-600">🎬 {video.name} <button type="button" className="link" onClick={() => setVideo(null)}>{t('common.delete')}</button></p>}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="btn-ghost cursor-pointer gap-1.5 px-3 py-1.5">📷 {t('social.addPhotos')}
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addImages(e.target.files); e.target.value = ''; }} />
        </label>
        {meta.videoUploads && (
          <label className="btn-ghost cursor-pointer gap-1.5 px-3 py-1.5">🎬 {t('social.addVideo')}
            <input type="file" accept="video/mp4,video/webm,video/quicktime" className="sr-only" onChange={(e) => { const v = e.target.files?.[0]; if (v && v.size <= 60 * 1024 * 1024) setVideo(v); e.target.value = ''; }} />
          </label>
        )}
        <select className="rounded-lg border border-slate-200 px-2 py-1 text-xs" value={f.visibility} onChange={(e) => setF({ ...f, visibility: e.target.value })} aria-label={t('social.whoSees')}>
          <option value="public">🌍 {t('social.public')}</option><option value="followers">👥 {t('social.followersOnly')}</option>
        </select>
        <select className="rounded-lg border border-slate-200 px-2 py-1 text-xs" value={f.comments} onChange={(e) => setF({ ...f, comments: e.target.value })} aria-label={t('social.whoComments')}>
          <option value="everyone">💬 {t('social.commentsEveryone')}</option><option value="followers">💬 {t('social.commentsFollowers')}</option><option value="off">🚫 {t('social.commentsOff')}</option>
        </select>
      </div>
      <ErrorBox error={error} />
      <div className="flex gap-2">
        <button className="btn-primary flex-1" disabled={Boolean(busy) || !f.productId}>{busy === 'video' ? t('video.uploading') : busy ? t('common.loading') : t('social.publish')}</button>
        <button type="button" className="btn-outline" onClick={() => setOpen(false)}>{t('common.cancel')}</button>
      </div>
    </form>
  );
}

export function PostList({ query: q = {}, empty }) {
  const { t } = useI18n();
  const { user } = useApp();
  const [items, setItems] = useState(null);
  const [next, setNext] = useState(null);
  const [error, setError] = useState(null);
  const key = JSON.stringify(q);
  const load = async (before) => {
    try {
      const r = await api('/social/feed', { query: { ...q, before } });
      setItems((x) => (before ? [...(x || []), ...r.items] : r.items)); setNext(r.next);
    } catch (err) { setError(err); }
  };
  useEffect(() => { setItems(null); load(); }, [key, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (error) return <ErrorBox error={error} />;
  if (!items) return <Spinner />;
  return (
    <div className="space-y-4">
      {q.withComposer && <Composer onPosted={(p) => setItems([p, ...items])} />}
      {!items.length ? (empty || <EmptyState icon="chat" title={t('social.empty')} />) : items.map((p) => (
        <PostCard key={p.id} post={p} onDeleted={(id) => setItems(items.filter((x) => x.id !== id))} />
      ))}
      {next && <button type="button" className="btn-outline w-full" onClick={() => load(next)}>{t('social.more')}</button>}
    </div>
  );
}

export default function Social() {
  const { t } = useI18n();
  const { user } = useApp();
  const [tab, setTab] = useState('foryou');
  useDocumentTitle('Souk Social');
  return (
    <div className="container-page max-w-2xl py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">💬 Souk Social</h1>
          <p className="text-sm text-slate-500">{t('social.subtitle')}</p>
        </div>
        <Link to="/live" className="btn rounded-full bg-rose-600 px-4 text-white hover:bg-rose-700">🔴 Souk Live</Link>
      </header>
      <div className="mb-4 flex gap-1.5" role="tablist">
        {['foryou', 'following'].map((k) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} disabled={k === 'following' && !user} onClick={() => setTab(k)}
            className={`rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50 ${tab === k ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700'}`}>{t(`social.tabs.${k}`)}</button>
        ))}
      </div>
      <PostList query={{ tab, withComposer: true }} empty={tab === 'following' ? <EmptyState icon="users" title={t('social.followingEmpty')} /> : undefined} />
    </div>
  );
}

/** /social/posts/:id – one post with its comments. */
export function PostPage() {
  const { id } = useParams();
  const { t, ago } = useI18n();
  const { user } = useApp();
  const navigate = useNavigate();
  const post = useApi(`/social/posts/${id}`, undefined, [id]);
  const comments = useApi(`/social/posts/${id}/comments`, undefined, [id]);
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(null);
  useDocumentTitle(post.data?.post?.product?.title);
  if (post.loading) return <Spinner />;
  if (post.error) return <div className="container-page max-w-2xl py-8"><ErrorBox error={post.error} /></div>;
  const p = post.data.post;
  const send = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setBusy(true); setError(null);
    try { await api(`/social/posts/${id}/comments`, { method: 'POST', body: { body: text } }); setText(''); comments.reload(); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  const del = async (c) => { await api(`/social/comments/${c.id}`, { method: 'DELETE' }); comments.reload(); };
  return (
    <div className="container-page max-w-2xl space-y-4 py-6">
      <Link to="/social" className="link text-sm">← Souk Social</Link>
      <PostCard post={p} full onDeleted={() => navigate('/social')} />
      <section id="comments" className="card space-y-3 p-4">
        <h2 className="font-bold">{t('social.comments')}</h2>
        {(comments.data?.items || []).map((c) => (
          <div key={c.id} className="flex gap-2.5">
            <Avatar name={c.name} url={c.avatar_url} size="h-8 w-8" />
            <div className="min-w-0 flex-1 rounded-2xl bg-slate-100 px-3 py-2">
              <p className="flex items-center gap-1 text-xs font-bold">{c.name}{c.is_verified && <VerifiedBadge small />} <span className="font-normal text-slate-400">· {ago(c.created_at)}</span></p>
              <p className="whitespace-pre-line text-sm">{c.body}</p>
            </div>
            {user && (user.id === c.user_id || user.id === p.author_id || user.role === 'admin')
              ? <button type="button" className="text-xs text-slate-400 hover:text-rose-600" onClick={() => del(c)} aria-label={t('common.delete')}><Icon name="trash" className="h-4 w-4" /></button>
              : user && <button type="button" className="text-xs text-slate-400 hover:text-rose-600" onClick={() => setReport({ type: 'comment', id: c.id })} aria-label={t('social.report')}>🚩</button>}
          </div>
        ))}
        {!comments.data?.items?.length && <p className="text-sm text-slate-500">{t('social.noComments')}</p>}
        {p.comments === 'off' && user?.id !== p.author_id ? <p className="text-xs text-slate-500">🚫 {t('social.commentsOffNote')}</p> : (
          <form onSubmit={send} className="flex gap-2">
            <input className="input flex-1" value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder={t('social.commentPh')} required />
            <button className="btn-primary px-4" disabled={busy || !text.trim()} aria-label={t('ai.send')}><Icon name="send" className="h-4 w-4" /></button>
          </form>
        )}
        <ErrorBox error={error} />
      </section>
      <ReportDialog target={report} onClose={() => setReport(null)} />
    </div>
  );
}
