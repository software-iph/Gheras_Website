import type { Metadata, Viewport } from 'next';
import { fontVariables } from '../fonts';
import { getAdminLang } from '@/admin/lang';
import '@/styles/tokens.css';
import '@/styles/admin.css';

export const metadata: Metadata = {
  title: { default: 'GHERAS — Content dashboard', template: '%s · GHERAS dashboard' },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: '#1F2A1C' };

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getAdminLang();
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
