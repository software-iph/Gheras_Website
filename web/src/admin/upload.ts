/** Client helper: upload a JPG/WebP to the media library, optionally replacing a slot's image. */
export async function uploadImage(file: File, slotId?: string): Promise<{ id: string } | null> {
  const body = new FormData();
  body.set('file', file);
  if (slotId) body.set('slotId', slotId);
  const res = await fetch('/admin/api/media', { method: 'POST', body });
  return res.ok ? res.json() : null;
}

export const ACCEPT = 'image/jpeg,image/webp';
