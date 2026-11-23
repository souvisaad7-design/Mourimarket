// Short videos on listings, stored in Vercel Blob. Videos are too big to go through the API function
// (Vercel caps request bodies at 4.5 MB), so the browser uploads straight to Blob with a short-lived
// token that only allows one video file, of limited size, under a folder of its own user.
import crypto from 'node:crypto';
import { del } from '@vercel/blob';
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';

const rwToken = () => process.env.BLOB_READ_WRITE_TOKEN || '';
export const videoEnabled = () => Boolean(rwToken());

export const VIDEO_TYPES = { mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' };
export const MAX_VIDEO_BYTES = 60 * 1024 * 1024;

/** The public host of our store: vercel_blob_rw_<storeId>_<secret> → <storeid>.public.blob.vercel-storage.com */
function storeHost() {
  const id = rwToken().split('_')[3];
  return id ? `${id.toLowerCase()}.public.blob.vercel-storage.com` : null;
}

export async function videoUploadToken(userId, ext) {
  const type = VIDEO_TYPES[ext];
  const pathname = `videos/u${userId}/${crypto.randomUUID()}.${ext}`;
  const token = await generateClientTokenFromReadWriteToken({
    token: rwToken(),
    pathname,
    allowedContentTypes: [type],
    maximumSizeInBytes: MAX_VIDEO_BYTES,
    validUntil: Date.now() + 15 * 60 * 1000,
    addRandomSuffix: false,
    allowOverwrite: false,
  });
  return { token, pathname, contentType: type };
}

/** Is this the URL of a video this user uploaded to our store? */
export function ownVideoUrl(url, userId) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.host === storeHost() && new RegExp(`^/videos/u${Number(userId)}/[0-9a-f-]{36}\\.(mp4|webm|mov)$`).test(u.pathname) && !u.search && !u.hash;
  } catch { return false; }
}

export function deleteVideo(url) {
  if (!url || !videoEnabled()) return;
  del(url, { token: rwToken() }).catch(() => {});
}
