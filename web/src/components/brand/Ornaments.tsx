// Graphic language: pivot rings, brand pattern, contour lines. Field tiles are static files in public/brand/fields.

const f = (n: number) => Math.round(n * 100) / 100;
const lens = (L: number, w: number) => `M0 0Q${f(L / 2)} ${f(-w)} ${f(L)} 0Q${f(L / 2)} ${f(w)} 0 0Z`;

/**
 * Pivot rings: concentric arcs left open at the top, like the logo's ring and the centre-pivot fields.
 * Paths are drawn in by the motion layer.
 */
export function PivotRings({ stroke = 1.2, color = '#C99A3B', count = 7 }: { stroke?: number; color?: string; count?: number }) {
  const point = (r: number, deg: number) => `${f(500 + r * Math.cos((deg * Math.PI) / 180))} ${f(500 + r * Math.sin((deg * Math.PI) / 180))}`;
  return (
    <svg viewBox="0 0 1000 1000" width="100%" style={{ display: 'block' }} aria-hidden="true" focusable="false">
      {Array.from({ length: count }, (_, i) => {
        const r = 492 - i * 56;
        return <path key={i} d={`M${point(r, -66)}A${r} ${r} 0 1 1 ${point(r, -114)}`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />;
      })}
    </svg>
  );
}

/** Grain and leaf lenses on concentric rings centred off-canvas. Mission/Vision only, at 16 % opacity. */
export function BrandPattern({ rtl = false }: { rtl?: boolean }) {
  const W = 1440, H = 720, cx = rtl ? 200 : 1240, cy = 360;
  const els: React.ReactElement[] = [];
  let i = 0;
  for (let m = 0; m < 24; m++) {
    const r = 60 + m * 44;
    if (m % 2 === 0) els.push(<circle key={i++} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(201,154,59,.5)" strokeWidth={0.7} />);
    const n = Math.max(6, Math.round((2 * Math.PI * r) / 50));
    for (let k = 0; k < n; k++) {
      const th = ((k + (m % 2) * 0.5) / n) * 2 * Math.PI, x = cx + r * Math.cos(th), y = cy + r * Math.sin(th);
      if (x < -30 || x > W + 30 || y < -30 || y > H + 30) continue;
      const g = (k + m) % 2 === 0, L = g ? 15 : 24, w = g ? 4.6 : 3.4, rot = (th * 180) / Math.PI + 90 + (g ? 0 : 22);
      els.push(<path key={i++} d={lens(L, w)} fill={g ? '#C99A3B' : '#8A9A4B'}
        transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) translate(${-L / 2} 0)`} />);
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio={`${rtl ? 'xMin' : 'xMax'}YMid slice`}
      style={{ display: 'block' }} aria-hidden="true" focusable="false">
      {els}
    </svg>
  );
}

/** Libyan Soil contour lines, ≤ 1.2 px, for the Why section background. */
export function ContourLines() {
  const ps: React.ReactElement[] = [];
  for (let k = 0; k < 12; k++) {
    let d = '';
    for (let j = 0; j <= 120; j++) {
      const t = (j / 120) * 2 * Math.PI;
      const rr = 26 + k * 24 + 9 * Math.sin(3 * t + k * 0.35) + 6 * Math.sin(5 * t - k * 0.2) + 4 * Math.cos(2 * t + 1);
      const x = 300 + rr * 1.4 * Math.cos(t), y = 200 + rr * Math.sin(t);
      d += (j ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    ps.push(<path key={k} d={d + 'Z'} fill="none" stroke="#9A5B3A" strokeWidth={k % 4 === 0 ? 1.2 : 0.6} />);
  }
  return (
    <svg viewBox="0 0 600 400" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
      style={{ display: 'block' }} aria-hidden="true" focusable="false">
      {ps}
    </svg>
  );
}
