// GHERAS logo — the enhanced master, as supplied (see scripts/build-brand.mjs).
// The vector "refinement" from the brand book is on hold and must not be used.

type Scheme = 'full' | 'reversed';

/** The emblem (artwork + GHERAS / غراس wordmarks). Rendered from the master raster. */
export function Emblem({ scheme = 'full', alt = '', sizes = '200px', className, style }: {
  scheme?: Scheme;
  alt?: string;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const src = (w: number) => `/brand/emblem-${scheme}-${w}.webp`;
  return (
    <img
      src={src(480)}
      srcSet={`${src(240)} 240w, ${src(480)} 480w, ${src(960)} 960w`}
      sizes={sizes}
      width={1294}
      height={1150}
      alt={alt}
      decoding="async"
      className={className}
      style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: `1294 / 1150`, ...style }}
    />
  );
}

const COLOURS: Record<Scheme, { word: string; desc: string; rule: string }> = {
  full: { word: '#1F2A1C', desc: '#6B675C', rule: '#C99A3B' },
  reversed: { word: '#FAF8F2', desc: '#E8D3A0', rule: '#C99A3B' },
};

/**
 * Header/footer lockup: emblem + descriptor ("للاستثمار الزراعي" over a gold rule over
 * "Agricultural Investment"). In RTL the emblem sits on the right.
 */
export function LogoHorizontal({ scheme = 'full', rtl = false, width, alt = '' }: {
  scheme?: Scheme;
  rtl?: boolean;
  width: number;
  alt?: string;
}) {
  const c = COLOURS[scheme];
  const ax = rtl ? 260 : 0;
  const anchor = rtl ? 'end' : 'start';
  return (
    <span
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      style={{
        display: 'flex', alignItems: 'center', gap: '4%', width,
        flexDirection: rtl ? 'row-reverse' : 'row', direction: 'ltr',
      }}
    >
      <span style={{ width: '42%', flexShrink: 0 }}>
        <Emblem scheme={scheme} sizes={`${Math.round(width * 0.42)}px`} />
      </span>
      <svg viewBox="0 0 260 150" style={{ display: 'block', flex: 1, minWidth: 0, overflow: 'visible' }} aria-hidden="true">
        <text x={ax} y={62} fontSize={30} textAnchor={anchor} fill={c.word}
          style={{ fontFamily: 'var(--font-plex-arabic), sans-serif', fontWeight: 600 }}>للاستثمار الزراعي</text>
        <path d={rtl ? 'M150 82H260' : 'M0 82H110'} stroke={c.rule} strokeWidth={1.6} />
        <text x={ax} y={118} fontSize={22} textAnchor={anchor} fill={c.desc}
          style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600 }}>Agricultural Investment</text>
      </svg>
    </span>
  );
}
