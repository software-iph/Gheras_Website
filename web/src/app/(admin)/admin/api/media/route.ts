import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import sharp, { type Metadata } from 'sharp';
import type { Media } from '@/content/types';
import { getAdmin } from '@/lib/auth/session';
import { updateDraft } from '@/lib/cms/store';
import { db } from '@/lib/db/sql';
import { UPLOADS_DIR, UPLOADS_URL } from '@/lib/db/uploads';

const MAX_BYTES = 40 * 1024 * 1024;
/** Longest side kept on disk; bigger photos are scaled down (smaller ones are left as they are). */
const MAX_SIDE = 3200;
/** Formats people commonly upload. Everything is converted to JPG (or WebP when it has transparency). */
const INPUT_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif', 'gif', 'tiff', 'heif']);

/**
 * Upload an image (JPG, PNG, WebP, AVIF, GIF, TIFF, HEIF). With `slotId` the file replaces that
 * media item's image (keeping its alt text and usage); without it a new, unused library item is created.
 * The image is auto-rotated, scaled down if huge, and saved as JPG/WebP in the `image-uploads`
 * folder; its URL and details go into `media_files`.
 */
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');
  const slotId = typeof form.get('slotId') === 'string' ? String(form.get('slotId')) : '';
  if (!(file instanceof File)) return Response.json({ error: 'no-file' }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: 'too-large' }, { status: 413 });

  const input = Buffer.from(await file.arrayBuffer());
  let meta: Metadata;
  try { meta = await sharp(input).metadata(); } catch { return Response.json({ error: 'type' }, { status: 415 }); }
  if (!meta.format || !INPUT_FORMATS.has(meta.format)) return Response.json({ error: 'type' }, { status: 415 });

  // Normalise: apply EXIF rotation, cap the size, and store as JPG (WebP if transparent).
  const webp = !!meta.hasAlpha;
  let buf: Buffer, width: number, height: number;
  try {
    const pipeline = sharp(input, { failOn: 'none' })
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true });
    const out = await (webp ? pipeline.webp({ quality: 88 }) : pipeline.flatten({ background: '#ffffff' }).jpeg({ quality: 86, mozjpeg: true }))
      .toBuffer({ resolveWithObject: true });
    buf = out.data; width = out.info.width; height = out.info.height;
  } catch {
    return Response.json({ error: 'type' }, { status: 415 });
  }
  const name = `${randomUUID()}.${webp ? 'webp' : 'jpg'}`;
  const contentType = webp ? 'image/webp' : 'image/jpeg';
  const original = file.name.replace(/[^\w.\- ]+/g, '').slice(0, 80) || name;
  const url = `${UPLOADS_URL}/${name}`;

  // 1. Save the file to the folder. 2. Record its URL in the database.
  const filePath = path.join(/*turbopackIgnore: true*/ UPLOADS_DIR, name);
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(filePath, buf);
  try {
    await db()`
      insert into media_files (name, url, original_name, content_type, size, width, height)
      values (${name}, ${url}, ${original}, ${contentType}, ${buf.length}, ${width}, ${height})`;
  } catch (e) {
    await unlink(filePath).catch(() => undefined); // keep the folder and the database in step
    throw e;
  }

  let id = slotId;
  await updateDraft(admin.name, (d) => {
    if (slotId && d.media.some((m) => m.id === slotId)) {
      return { ...d, media: d.media.map((m) => (m.id === slotId ? { ...m, url, width, height, file: original } as Media : m)) };
    }
    id = `m-${name.slice(0, 8)}`;
    const item = { id, brief: original, ratio: '', minWidth: 0, url, width, height, focal: { x: 0.5, y: 0.5 }, alt: { en: '', ar: '' }, file: original } as Media;
    return { ...d, media: [...d.media, item] };
  }, slotId ? { en: `Image replaced — ${original}`, ar: `استبدال صورة — ${original}` } : { en: `Image uploaded — ${original}`, ar: `رفع صورة — ${original}` });
  revalidatePath('/admin', 'layout');
  return Response.json({ id, url, width, height });
}
