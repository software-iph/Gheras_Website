import { Almarai, Fraunces, IBM_Plex_Mono, Manrope } from 'next/font/google';

// Only the approved families and weights. Fraunces is loaded as a variable font so its
// optical-size axis matches the prototypes; it is only ever set at 300 and 400.
export const fraunces = Fraunces({ subsets: ['latin'], axes: ['opsz'], variable: '--font-fraunces', display: 'swap' });
export const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-manrope', display: 'swap' });
// Arabic: Almarai. Body text is Light (300), headings Regular (400), labels and buttons Bold (700).
export const almarai = Almarai({ subsets: ['arabic'], weight: ['300', '400', '700'], variable: '--font-almarai', display: 'swap' });
export const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-plex-mono', display: 'swap' });

export const fontVariables = [fraunces, manrope, almarai, plexMono].map((f) => f.variable).join(' ');
