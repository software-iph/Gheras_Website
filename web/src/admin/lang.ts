import 'server-only';
import { cookies } from 'next/headers';
import type { UILang } from './i18n';

/** Dashboard interface language (cookie set by setAdminLang). */
export async function getAdminLang(): Promise<UILang> {
  return (await cookies()).get('gheras_admin_lang')?.value === 'ar' ? 'ar' : 'en';
}
