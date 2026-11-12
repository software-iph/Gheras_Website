import 'server-only';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { UPLOADS_DIR } from '@/lib/db/uploads';

/**
 * CV files are stored in <UPLOADS_DIR>/cvs/ under a random name. That folder is never served
 * publicly; the dashboard downloads them through an admin-only route.
 */
const CV_DIR = path.join(/*turbopackIgnore: true*/ UPLOADS_DIR, 'cvs');

export const isCvName = (name: string) => /^[0-9a-f-]{36}\.(pdf|doc|docx)$/.test(name);

const TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
} as const;
export type CvExt = keyof typeof TYPES;

/** Identify the file by its first bytes (not by its name or the browser's claim). */
export function detectCv(buf: Buffer, fileName: string): { ext: CvExt; type: string } | null {
  if (buf.subarray(0, 5).toString('latin1') === '%PDF-') return { ext: 'pdf', type: TYPES.pdf };
  // Legacy Word: OLE compound file.
  if (buf.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) return { ext: 'doc', type: TYPES.doc };
  // .docx is a ZIP that contains word/document.xml.
  if (buf.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) && /\.docx$/i.test(fileName) && buf.includes('word/')) {
    return { ext: 'docx', type: TYPES.docx };
  }
  return null;
}

export async function saveCv(name: string, buf: Buffer) {
  await mkdir(CV_DIR, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ CV_DIR, name), buf);
}

export async function readCv(name: string): Promise<Buffer | null> {
  if (!isCvName(name)) return null;
  try { return await readFile(path.join(/*turbopackIgnore: true*/ CV_DIR, name)); } catch { return null; }
}

export async function deleteCv(name: string) {
  if (isCvName(name)) await unlink(path.join(/*turbopackIgnore: true*/ CV_DIR, name)).catch(() => undefined);
}

export const cvContentType = (name: string) => TYPES[name.split('.').pop() as CvExt] ?? 'application/octet-stream';
