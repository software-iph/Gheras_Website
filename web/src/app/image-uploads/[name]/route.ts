import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { UPLOADS_DIR, isUploadName } from '@/lib/db/uploads';

const TYPES: Record<string, string> = { jpg: 'image/jpeg', webp: 'image/webp' };

/** Serves an uploaded image from the `image-uploads` folder at /image-uploads/<name>. */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!isUploadName(name)) return new Response('Not found', { status: 404 });
  try {
    const buf = await readFile(path.join(/*turbopackIgnore: true*/ UPLOADS_DIR, name));
    return new Response(new Uint8Array(buf), {
      headers: {
        'Content-Type': TYPES[name.split('.').pop()!],
        'Content-Length': String(buf.length),
        // File names are random UUIDs and never reused, so they can be cached forever.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
