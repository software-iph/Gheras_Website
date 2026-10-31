// Graphic language: botanical line art, brand pattern, contour lines.
// Geometry ported from design/Gheras Logo.dc.html (lineart) and the website prototypes (build()).

const f = (n: number) => Math.round(n * 100) / 100;
const lens = (L: number, w: number) => `M0 0Q${f(L / 2)} ${f(-w)} ${f(L)} 0Q${f(L / 2)} ${f(w)} 0 0Z`;

type Pt = [number, number];
type Bez = [Pt, Pt, Pt, Pt];
const WH: Bez = [[152, 216], [18, 222], [-4, 104], [78, 14]];
const OL: Bez = [[88, 216], [222, 222], [246, 104], [164, 16]];
const pt = (B: Bez, t: number): Pt => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * B[0][k] + 3 * u * u * t * B[1][k] + 3 * u * t * t * B[2][k] + t * t * t * B[3][k]) as Pt;
};
const dv = (B: Bez, t: number): Pt => {
  const u = 1 - t;
  return [0, 1].map((k) => 3 * u * u * (B[1][k] - B[0][k]) + 6 * u * t * (B[2][k] - B[1][k]) + 3 * t * t * (B[3][k] - B[2][k])) as Pt;
};
const ang = (B: Bez, t: number) => { const d = dv(B, t); return (Math.atan2(d[1], d[0]) * 180) / Math.PI; };
const bez = (B: Bez) => `M${B[0][0]} ${B[0][1]}C${B[1][0]} ${B[1][1]} ${B[2][0]} ${B[2][1]} ${B[3][0]} ${B[3][1]}`;

/** Single-weight gold stroke drawing of the wheat and olive. Paths are drawn in by the motion layer. */
export function BotanicalLineArt({ stroke = 0.45, color = '#C99A3B' }: { stroke?: number; color?: string }) {
  const sw = stroke;
  const els: React.ReactElement[] = [];
  let key = 0;
  const shape = (L: number, w: number, p: Pt, a: number) => {
    const tr = `translate(${f(p[0])} ${f(p[1])}) rotate(${f(a)})`;
    els.push(<path key={key++} d={lens(L, w)} transform={tr} fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" />);
    els.push(<path key={key++} d={`M${f(L * 0.12)} 0L${f(L * 0.8)} 0`} transform={tr} fill="none" stroke={color} strokeWidth={sw * 0.6} strokeLinecap="round" />);
  };
  els.push(<path key={key++} d={bez(WH)} fill="none" stroke={color} strokeWidth={sw * 1.5} strokeLinecap="round" />);
  els.push(<path key={key++} d={bez(OL)} fill="none" stroke={color} strokeWidth={sw * 1.5} strokeLinecap="round" />);
  const gn = 9, g0 = 0.48, g1 = 0.92;
  for (let i = 0; i < gn; i++) {
    const t = g0 + ((g1 - g0) * i) / (gn - 1), p = pt(WH, t), a = ang(WH, t), k = 1 - (0.25 * i) / (gn - 1);
    shape(31 * k, 10.5 * k, p, a - 18);
    shape(31 * k, 10.5 * k, p, a + 18);
  }
  shape(23, 7.6, pt(WH, 1), ang(WH, 1));
  const ln = 11, l0 = 0.3, l1 = 0.94;
  for (let i = 0; i < ln; i++) {
    const t = l0 + ((l1 - l0) * i) / (ln - 1), p = pt(OL, t), a = ang(OL, t), sd = i % 2 ? 1 : -1, k = 1 - (0.3 * i) / (ln - 1);
    shape(40 * k, 8.4 * k, p, a + sd * 40);
  }
  shape(28, 6.6, pt(OL, 1), ang(OL, 1));
  ([[0.8, 14, 9], [0.74, 26, 9]] as const).forEach(([t, off, r]) => {
    const p = pt(OL, t), d = dv(OL, t), m = Math.hypot(d[0], d[1]);
    let nx = -d[1] / m, ny = d[0] / m;
    if ((120 - p[0]) * nx + (120 - p[1]) * ny < 0) { nx = -nx; ny = -ny; }
    const cx = p[0] + nx * off, cy = p[1] + ny * off;
    els.push(<path key={key++} d={`M${f(p[0])} ${f(p[1])}L${f(cx)} ${f(cy)}`} stroke={color} strokeWidth={sw} fill="none" />);
    els.push(<ellipse key={key++} cx={f(cx)} cy={f(cy)} rx={r * 0.8} ry={r} transform={`rotate(${f(ang(OL, t) + 90)} ${f(cx)} ${f(cy)})`} fill="none" stroke={color} strokeWidth={sw} />);
  });
  return (
    <svg viewBox="0 0 240 240" width="100%" style={{ display: 'block', overflow: 'visible' }} aria-hidden="true" focusable="false">
      {els}
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
