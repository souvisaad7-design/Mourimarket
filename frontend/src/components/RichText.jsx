import { Fragment } from 'react';
import { Link } from 'react-router-dom';

// Safe, tiny formatter for admin-written pages (no HTML is ever injected):
//   # / ## heading · "- " list item · ![alt](url) image line · **bold** · [text](/link or https://…)
const SAFE_URL = /^(\/(?!\/)|https:\/\/)/i;

function Inline({ text }) {
  const parts = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={m.index}>{m[1]}</strong>);
    else if (SAFE_URL.test(m[3])) {
      parts.push(m[3].startsWith('/')
        ? <Link key={m.index} to={m[3]} className="link">{m[2]}</Link>
        : <a key={m.index} href={m[3]} target="_blank" rel="noreferrer" className="link">{m[2]}</a>);
    } else parts.push(m[2]);
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}

export default function RichText({ text = '', className = '' }) {
  const blocks = String(text).replace(/\r/g, '').split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={`space-y-4 leading-relaxed text-slate-700 ${className}`}>
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        const img = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(block);
        if (img && SAFE_URL.test(img[2])) return <img key={i} src={img[2]} alt={img[1]} loading="lazy" className="mx-auto max-h-[480px] rounded-2xl object-contain" />;
        if (block.startsWith('## ')) return <h3 key={i} className="pt-2 text-lg font-bold text-slate-900"><Inline text={block.slice(3)} /></h3>;
        if (block.startsWith('# ')) return <h2 key={i} className="pt-2 text-xl font-bold text-slate-900"><Inline text={block.slice(2)} /></h2>;
        if (lines.every((l) => l.startsWith('- '))) {
          return <ul key={i} className="list-disc space-y-1 ps-6">{lines.map((l, j) => <li key={j}><Inline text={l.slice(2)} /></li>)}</ul>;
        }
        return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}<Inline text={l} /></Fragment>)}</p>;
      })}
    </div>
  );
}
