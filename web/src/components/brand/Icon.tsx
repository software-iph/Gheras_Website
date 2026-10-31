// GHERAS icon set — 24 px grid, 1.5 px stroke, round caps/joins, one colour + optional gold accent.
// Path data copied from design/Gheras Icon.dc.html (static I).

type Circle = [number, number, number];
type GlyphDef = { p?: string[]; c?: Circle[]; ap?: string[]; ac?: Circle[] };

const I = {
  land: { p: ['M3 20h18', 'M5.5 16.5h13', 'M8 13h8'], ap: ['M8.5 9.5a3.5 3.5 0 0 1 7 0', 'M12 3.5v1.5', 'M6.6 5.6l1 1', 'M17.4 5.6l-1 1'] },
  crop: { p: ['M12 21V5', 'M12 10c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4z', 'M12 10c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4z', 'M12 15.5c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4z', 'M12 15.5c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4z'], ap: ['M12 5V2.5'] },
  drip: { p: ['M3 6h18', 'M7 6v3', 'M12 6v3', 'M17 6v3', 'M3 20h18'], ap: ['M7 12.5l1.3 2.1a1.5 1.5 0 1 1-2.6 0z', 'M12 12.5l1.3 2.1a1.5 1.5 0 1 1-2.6 0z', 'M17 12.5l1.3 2.1a1.5 1.5 0 1 1-2.6 0z'] },
  pivot: { c: [[12, 12, 9], [12, 12, 4.5]], p: ['M12 12l6.4-6.4'], ac: [[12, 12, 1.2]] },
  sensor: { p: ['M12 21v-8', 'M9 21h6', 'M8.5 8.5a5 5 0 0 1 7 0', 'M5.8 5.8a8.8 8.8 0 0 1 12.4 0'], ac: [[12, 11.5, 1]] },
  soil: { p: ['M3 11h18', 'M3 15.5h18', 'M3 20h18', 'M12 11V6', 'M12 7.5c1-2 2.8-3 5-3-.6 2-2.4 3-5 3z'], ac: [[7, 18, 0.5], [16, 13.3, 0.5]] },
  water: { p: ['M12 3c3.5 4.5 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2.5-6.5 6-11z'], ap: ['M9 15c1 .8 2 .8 3 0s2-.8 3 0'] },
  cold: { p: ['M12 3v18', 'M4.2 7.5l15.6 9', 'M4.2 16.5l15.6-9'], ap: ['M9.5 4.5L12 7l2.5-2.5', 'M9.5 19.5L12 17l2.5 2.5'] },
  distribution: { p: ['M3 7h11v9H3z', 'M14 10h4l3 3v3h-7'], c: [[7, 17.5, 1.8], [17, 17.5, 1.8]], ap: ['M5.5 10.5h5'] },
  supply: { c: [[5, 17, 2], [12, 7, 2], [19, 17, 2]], p: ['M6.2 15.3l4.6-6.6', 'M13.2 8.7l4.6 6.6'], ap: ['M7 17h10'] },
  partner: { c: [[9, 12, 5.5], [15, 12, 5.5]], ac: [[12, 12, 0.6]] },
  training: { p: ['M3 6c3-1 6-1 9 1 3-2 6-2 9-1v12c-3-1-6-1-9 1-3-2-6-2-9-1z', 'M12 7v13'] },
  food: { p: ['M6 21V10a6 6 0 0 1 12 0v11', 'M4 21h16', 'M6 14h12'], ap: ['M10 17.5h4'] },
  quality: { c: [[10.5, 10.5, 6.5]], p: ['M15.3 15.3L21 21'], ap: ['M7.8 10.6l1.9 1.9 3.3-3.8'] },
  integrity: { p: ['M8 3h8', 'M12 3v10', 'M5 21h14'], ap: ['M12 13.5l-2.5 3 2.5 3.5 2.5-3.5z'] },
  commitment: { p: ['M4 15h16', 'M12 15V9', 'M12 9c0-3 2-5 5-5 0 3-2 5-5 5z', 'M12 11c0-2.5-1.8-4-4-4 0 2.2 1.8 4 4 4z'], ap: ['M12 15v5', 'M12 18l-2.5 2', 'M12 18l2.5 2'] },
  accountability: { p: ['M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z'], ap: ['M9 12l2 2 4-4'] },
  respect: { p: ['M12 21c-5 0-8-3.2-8-8 5 0 8 3.2 8 8z', 'M12 21c5 0 8-3.2 8-8-5 0-8 3.2-8 8z'], ac: [[12, 7, 2.5]] },
  excellence: { c: [[12, 12, 7.5]], p: ['M12 2v4', 'M12 18v4', 'M2 12h4', 'M18 12h4'], ac: [[12, 12, 1.5]] },
  arrow: { p: ['M5 12h14', 'M13 6l6 6-6 6'] },
  globe: { c: [[12, 12, 9]], p: ['M3 12h18', 'M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z'] },
  mail: { p: ['M3 6h18v12H3z', 'M3 7l9 6 9-6'] },
  phone: { p: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z'] },
  pin: { p: ['M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z'], ac: [[12, 9.5, 2.5]] },
} satisfies Record<string, GlyphDef>;

export type Glyph = keyof typeof I;
export const isGlyph = (v: string): v is Glyph => v in I;

type Props = {
  glyph: Glyph | string;
  size?: number;
  color?: string;
  accent?: string;
  className?: string;
};

export function Icon({ glyph, size = 32, color = '#3F5A2A', accent = '#C99A3B', className }: Props) {
  const d: GlyphDef = isGlyph(glyph) ? I[glyph] : I.pivot;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      {d.p?.map((x, i) => <path key={`p${i}`} d={x} stroke={color} />)}
      {d.c?.map(([cx, cy, r], i) => <circle key={`c${i}`} cx={cx} cy={cy} r={r} stroke={color} />)}
      {d.ap?.map((x, i) => <path key={`ap${i}`} d={x} stroke={accent} />)}
      {d.ac?.map(([cx, cy, r], i) => <circle key={`ac${i}`} cx={cx} cy={cy} r={r} stroke={accent} />)}
    </svg>
  );
}

/** CTA arrow: mirrored in RTL (via CSS), nudges 4 px toward the reading direction on hover. */
export function Arrow({ size = 18, color }: { size?: number; color: string }) {
  return (
    <span className="cta-arrow">
      <Icon glyph="arrow" size={size} color={color} accent={color} />
    </span>
  );
}
