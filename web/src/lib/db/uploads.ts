import 'server-only';
import path from 'node:path';

/**
 * Folder where uploaded images are saved (default `<app>/image-uploads`, override with UPLOADS_DIR).
 * Files are served at /image-uploads/<name>; that URL is what the database stores.
 */
export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ?? path.join(/*turbopackIgnore: true*/ process.cwd(), 'image-uploads');

export const UPLOADS_URL = '/image-uploads';

/** Upload file names are generated (uuid + extension); anything else is rejected. */
export const isUploadName = (name: string) => /^[0-9a-f-]{36}\.(jpg|webp)$/.test(name);
