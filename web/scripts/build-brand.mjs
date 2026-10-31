// Renders the enhanced logo master (HD artwork clipped by traced vector edges,
// wordmarks as vector paths) to transparent raster files, once.
// Source: design_handoff_gheras_website_dashboard/design/assets. See "Gheras Logo.dc.html".
// Usage: node scripts/build-brand.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, '../../design_handoff_gheras_website_dashboard/design/assets');
const out = path.resolve(here, '../public/brand');

const P = JSON.parse(await readFile(path.join(src, 'gheras-logo-paths.json'), 'utf8'));
const jpg = (await readFile(path.join(src, 'gheras-logo-fill-hd.jpg'))).toString('base64');

// Wordmark colours from the Logo component: full = #2D3A2C, reversed = Linen.
const schemes = { full: '#2D3A2C', reversed: '#FAF8F2' };

const svgFor = (wordColour) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${P.w} ${P.h}" width="${P.w}" height="${P.h}">
<defs><clipPath id="c">${P.clip.map((d) => `<path d="${d}"/>`).join('')}</clipPath></defs>
<image xlink:href="data:image/jpeg;base64,${jpg}" href="data:image/jpeg;base64,${jpg}" x="0" y="0" width="${P.w}" height="${P.h}" preserveAspectRatio="none" clip-path="url(#c)"/>
<g fill="${wordColour}" transform="${P.textT}">${P.text2.map((d) => `<path d="${d}"/>`).join('')}</g>
</svg>`;

await mkdir(out, { recursive: true });
for (const [scheme, colour] of Object.entries(schemes)) {
  const svg = Buffer.from(svgFor(colour));
  // density 144 → 2588 px wide master, then downscale.
  const master = await sharp(svg, { density: 144 }).png().toBuffer();
  await writeFile(path.join(out, `emblem-${scheme}-master.png`), await sharp(master).resize({ width: 2400 }).png({ compressionLevel: 9 }).toBuffer());
  for (const w of [240, 480, 960]) {
    await writeFile(path.join(out, `emblem-${scheme}-${w}.webp`), await sharp(master).resize({ width: w }).webp({ quality: 90, alphaQuality: 100 }).toBuffer());
    await writeFile(path.join(out, `emblem-${scheme}-${w}.png`), await sharp(master).resize({ width: w }).png({ compressionLevel: 9 }).toBuffer());
  }
  console.log('rendered', scheme);
}
