// Where did this visit come from? Worked out once, when the site is opened:
// a share link (?s=wa), the referring site (Google, Facebook…), or typed / an app that hides it (direct).
// Pages reached by clicking inside the site count as "site".
const LANDING = typeof window !== 'undefined' ? window.location.pathname : '';
const TAGS = { wa: 'whatsapp', fb: 'facebook', qr: 'qr', ig: 'instagram', tt: 'tiktok' };

function landingSource() {
  try {
    const tag = new URLSearchParams(window.location.search).get('s');
    if (TAGS[tag]) return TAGS[tag];
    if (!document.referrer) return 'direct';
    const host = new URL(document.referrer).hostname;
    if (host === window.location.hostname) return 'site';
    if (/google\./.test(host)) return 'google';
    if (/facebook\.|fb\.|messenger\./.test(host)) return 'facebook';
    if (/whatsapp\.|wa\.me/.test(host)) return 'whatsapp';
    if (/instagram\./.test(host)) return 'instagram';
    if (/tiktok\./.test(host)) return 'tiktok';
    return 'other';
  } catch { return 'other'; }
}

let used = false;
/** Source of a listing view at this path: the landing source for the page the site opened on, else "site". */
export function viewSource(pathname) {
  if (!used && pathname === LANDING) { used = true; return landingSource(); }
  return 'site';
}

/** A link to share, tagged so a visit from it is counted as coming from that app. */
export const taggedUrl = (url, tag) => { try { const u = new URL(url); u.searchParams.set('s', tag); return u.toString(); } catch { return url; } };
