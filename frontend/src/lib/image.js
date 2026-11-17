// Client-side image compression with HTML5 Canvas.
//
// Every photo a user picks is decoded, resized so its width is at most
// `maxWidth` (aspect ratio kept), and re-encoded as WebP before upload.
// Re-encoding also strips EXIF metadata such as GPS location, and the
// orientation is applied so phone photos are never sideways.
//
// Browsers that cannot *encode* WebP (older Safari) silently produce a PNG
// from canvas.toBlob('image/webp'); we detect that and fall back to JPEG.

export const IMAGE_DEFAULTS = { maxWidth: 1000, quality: 0.75, type: 'image/webp' };

/** Types the server accepts (it re-checks the real bytes). */
const SERVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

async function decode(file) {
  if ('createImageBitmap' in window) {
    try {
      // `from-image` applies the EXIF orientation of phone photos.
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* fall through to <img> decoding (e.g. HEIC on Safari) */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function renameTo(name, ext) {
  const base = (name || 'photo').replace(/\.[^.]+$/, '') || 'photo';
  return `${base}.${ext}`;
}

/**
 * Compress one image file.
 * @returns {Promise<{file: File, originalSize: number, width: number, height: number, compressed: boolean}>}
 */
export async function compressImage(file, options = {}) {
  const { maxWidth, quality, type } = { ...IMAGE_DEFAULTS, ...options };
  const originalSize = file.size;
  let source;
  try {
    source = await decode(file);
  } catch {
    // Could not decode: keep the original if the server can take it.
    if (SERVER_TYPES.includes(file.type)) return { file, originalSize, width: 0, height: 0, compressed: false };
    throw new Error('unsupported_image');
  }

  const srcW = source.width;
  const srcH = source.height;
  const scale = Math.min(1, maxWidth / srcW);
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // White background so transparent PNGs don't turn black in JPEG fallback.
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  if (typeof source.close === 'function') source.close();

  let blob = await toBlob(canvas, type, quality);
  let outType = type;
  if (!blob || blob.type !== type) {
    // WebP encoding not supported: use JPEG with the same quality.
    outType = 'image/jpeg';
    blob = await toBlob(canvas, outType, quality);
  }
  if (!blob) throw new Error('unsupported_image');

  const ext = outType === 'image/webp' ? 'webp' : 'jpg';
  const out = new File([blob], renameTo(file.name, ext), { type: outType, lastModified: Date.now() });
  return { file: out, originalSize, width, height, compressed: true };
}

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
