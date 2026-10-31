import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans_Arabic, Manrope, Noto_Naskh_Arabic } from 'next/font/google';

// Only the approved families and weights. Fraunces is loaded as a variable font so its
// optical-size axis matches the prototypes; it is only ever set at 300 and 400.
export const fraunces = Fraunces({ subsets: ['latin'], axes: ['opsz'], variable: '--font-fraunces', display: 'swap' });
export const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-manrope', display: 'swap' });
export const naskh = Noto_Naskh_Arabic({ subsets: ['arabic'], weight: ['600'], variable: '--font-naskh', display: 'swap' });
export const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ['arabic', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-plex-arabic', display: 'swap' });
export const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-plex-mono', display: 'swap' });

export const fontVariables = [fraunces, manrope, naskh, plexArabic, plexMono].map((f) => f.variable).join(' ');
