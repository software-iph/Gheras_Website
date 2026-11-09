/** Same limit as the server: longer sides are scaled down there anyway. */
const MAX_SIDE = 3200;

/**
 * Shrink big JPG/WebP photos in the browser before uploading, so a phone photo (often 5–15 MB)
 * goes up as ~1–2 MB. Other formats (PNG with transparency, HEIC, GIF…) are sent as they are and
 * the server converts them.
 */
async function shrink(file: File): Promise<File> {
  if (!/^image\/(jpeg|webp)$/.test(file.type) || file.size < 1_500_000 || typeof createImageBitmap !== 'function') return file;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.9));
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file;
  } catch {
    return file;
  }
}

/** Client helper: upload an image to the media library, optionally replacing a slot's image. */
export async function uploadImage(file: File, slotId?: string): Promise<{ id: string } | null> {
  const body = new FormData();
  body.set('file', await shrink(file));
  if (slotId) body.set('slotId', slotId);
  const res = await fetch('/admin/api/media', { method: 'POST', body });
  return res.ok ? res.json() : null;
}

/**
 * A resized copy of an uploaded photo for dashboard previews (via the Next.js image optimizer),
 * instead of the full-size file. `w` must be one of Next's default sizes, e.g. 384 or 828.
 */
export const preview = (url: string, w: 384 | 828) => `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=75`;

// HEIC is not listed: the server's image library can't read it. iPhones then convert photos to JPG
// automatically when one is picked.
export const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif,image/tiff,.jpg,.jpeg,.png,.webp,.avif,.gif,.tif,.tiff';
