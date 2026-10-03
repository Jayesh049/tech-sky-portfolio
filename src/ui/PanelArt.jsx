// The four scenes inside the crystal panels: a faceted peak under a falling
// beam (Work), a gem among floating cubes (Projects), a glass planet with its
// moons (Skills), a figure at the waterline facing the sunrise (About).
//
// All vector, all generated here: no photographs, no network, sharp at any
// DPI, a few KB in total. Monochrome with a warm undertone, so they sit in the
// same light as the rest of the masthead. Shapes that are random are seeded,
// so every render (and every visitor) sees the same mountain.
//
// Each scene is drawn on a 300x340 stage and placed with `slice`, so it fills
// whatever the panel gives it; hero-panels.css fades its lower edge into the
// glass where the text begins.

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = s;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 300;
const H = 340;
const f1 = (n) => Math.round(n * 10) / 10;
const pts = (a) => a.map(([x, y]) => `${f1(x)},${f1(y)}`).join(" ");

// A star field: [x, y, r, twinkles?]
function stars(seed, n, maxY) {
  const r = rng(seed);
  return Array.from({ length: n }, () => [r() * W, r() * maxY, 0.35 + r() ** 3 * 1.1, r() < 0.25]);
}

function Stars({ list, fill = "#fff" }) {
  return (
    <g fill={fill}>
      {list.map(([x, y, rad, tw], i) => (
        <circle
          key={i}
          cx={f1(x)}
          cy={f1(y)}
          r={f1(rad)}
          opacity={tw ? undefined : 0.25 + (i % 5) * 0.12}
          className={tw ? "pa-twinkle" : undefined}
          style={tw ? { "--pa-d": `${2.6 + (i % 4) * 0.7}s`, "--pa-dl": `${-(i % 7) * 0.6}s` } : undefined}
        />
      ))}
    </g>
  );
}

// ── Work: a faceted peak ────────────────────────────────────────────────────

// Midpoint displacement between fixed anchors, so the summit lands where the
// beam falls. Returns the ridge as [x, y] from left edge to right edge.
function ridge(seed, anchors, rough, depth = 5) {
  const r = rng(seed);
  let line = anchors.slice();
  let amp = rough;
  for (let d = 0; d < depth; d++) {
    const next = [];
    for (let i = 0; i < line.length - 1; i++) {
      const [x0, y0] = line[i];
      const [x1, y1] = line[i + 1];
      next.push(line[i]);
      next.push([(x0 + x1) / 2 + (r() - 0.5) * amp * 0.3, (y0 + y1) / 2 + (r() - 0.5) * amp]);
    }
    next.push(line[line.length - 1]);
    line = next;
    amp *= 0.52;
  }
  return line;
}

// Break the mountain into broad rock faces: each ridge segment drops a tall
// facet down the slope toward a scattered point on the valley floor. Lit from
// the upper left, so a face under a rising segment catches the light and one
// under a falling segment stays in shadow.
function facets(seed, line, base) {
  const r = rng(seed);
  const foot = line.map(([x, y], i) => [x + (i % 2 ? 1 : -1) * (10 + r() * 16), Math.min(base, y + 40 + r() * 50)]);
  const tris = [];
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i];
    const b = line[i + 1];
    const slope = (b[1] - a[1]) / Math.max(1, b[0] - a[0]);
    const lit = Math.max(0.04, Math.min(0.62, 0.3 - slope * 0.8 + (r() - 0.5) * 0.16));
    tris.push({ p: [a, b, foot[i]], l: lit });
    tris.push({ p: [b, foot[i + 1], foot[i]], l: lit * 0.4 });
  }
  return tris;
}

const tone = (l, a = 1) => {
  const v = Math.round(22 + l * 190);
  return `rgb(${v + 6} ${v + 3} ${v} / ${a})`;
};

const WORK = (() => {
  // Coarse on purpose: three passes of displacement gives ~30 broad faces,
  // which reads as rock; five passes gave ~130 slivers, which read as drips.
  const main = ridge(11, [[-10, 250], [70, 214], [150, 146], [226, 206], [310, 240]], 30, 3);
  const back = ridge(23, [[-10, 214], [60, 188], [120, 202], [200, 178], [310, 200]], 22, 4);
  const far = ridge(37, [[-10, 196], [90, 180], [180, 190], [250, 172], [310, 186]], 14, 4);
  return { main, back, far, tris: facets(5, main, 330), stars: stars(3, 46, 180) };
})();

function WorkArt() {
  const { main, back, far, tris } = WORK;
  const poly = (line, bottom) => pts([...line, [W + 10, bottom], [-10, bottom]]);
  return (
    <>
      <defs>
        <linearGradient id="pa-w-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c0c0c" />
          <stop offset="0.55" stopColor="#23211e" />
          <stop offset="0.7" stopColor="#3b3630" />
          <stop offset="1" stopColor="#0b0b0b" />
        </linearGradient>
        <linearGradient id="pa-w-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="pa-w-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.25" stopColor="#fff4e8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pa-w-haze" x1="0" y1="0.42" x2="0" y2="0.95">
          <stop offset="0" stopColor="#0b0b0b" stopOpacity="0" />
          <stop offset="1" stopColor="#0b0b0b" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="pa-w-fog" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3efe8" stopOpacity="0.5" />
          <stop offset="0.6" stopColor="#f3efe8" stopOpacity="0.14" />
          <stop offset="1" stopColor="#f3efe8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#pa-w-sky)" />
      <Stars list={WORK.stars} />
      {/* The ring the beam falls through. */}
      <circle cx="150" cy="118" r="80" fill="none" stroke="#fff" strokeOpacity="0.32" strokeWidth="0.8" />
      <circle cx="150" cy="118" r="88" fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="0.6" strokeDasharray="1 5" />
      <polygon points={poly(far, 260)} fill="#34302b" opacity="0.55" />
      <polygon points={poly(back, 280)} fill="#1d1b19" opacity="0.9" />
      <g>
        <polygon points={poly(main, 340)} fill="#121110" />
        {tris.map((t, i) => (
          <polygon key={i} points={pts(t.p)} fill={tone(t.l, 0.95)} />
        ))}
        {/* Air between here and the valley floor: the faces fade as they fall. */}
        <polygon points={poly(main, 340)} fill="url(#pa-w-haze)" />
        {/* Snow on the ridge line: the lit edge of the whole range. */}
        <polyline points={pts(main)} fill="none" stroke="#f4f1ea" strokeOpacity="0.75" strokeWidth="0.9" strokeLinejoin="round" />
      </g>
      {/* Fog pooling in the valleys: soft gradients, no filter, so it costs
          nothing to paint and never repaints. */}
      <g opacity="0.55">
        <ellipse cx="46" cy="250" rx="90" ry="18" fill="url(#pa-w-fog)" />
        <ellipse cx="238" cy="244" rx="100" ry="16" fill="url(#pa-w-fog)" />
        <ellipse cx="150" cy="276" rx="170" ry="20" fill="url(#pa-w-fog)" />
        <ellipse cx="96" cy="300" rx="110" ry="14" fill="url(#pa-w-fog)" opacity="0.7" />
      </g>
      {/* The beam, falling onto the summit. */}
      <rect x="149.4" y="0" width="1.2" height="146" fill="url(#pa-w-beam)" />
      <circle cx="150" cy="38" r="16" fill="url(#pa-w-glow)" className="pa-pulse" />
      <circle cx="150" cy="38" r="1.6" fill="#fff" />
      <circle cx="150" cy="146" r="22" fill="url(#pa-w-glow)" opacity="0.8" className="pa-pulse" style={{ "--pa-dl": "-1.4s" }} />
      <path d="M150 140l3 6-3 6-3-6z" fill="#fff" />
    </>
  );
}

// ── Projects: a gem among cubes ─────────────────────────────────────────────

const CUBES = [
  // [cx, cy, size, solid?]
  [150, 70, 15, true],
  [92, 102, 12, true],
  [212, 100, 14, true],
  [62, 170, 9, false],
  [240, 168, 11, true],
  [80, 238, 13, true],
  [224, 238, 10, false],
  [150, 262, 12, true],
  [112, 58, 6, false],
  [196, 54, 7, true],
  [40, 120, 6, true],
  [262, 118, 6, false],
  [120, 292, 7, false],
  [186, 290, 6, true],
];

function cube(cx, cy, s) {
  const h = s * 0.58;
  const top = [[cx, cy - s], [cx + s, cy - s + h], [cx, cy - s + 2 * h], [cx - s, cy - s + h]];
  const left = [[cx - s, cy - s + h], [cx, cy - s + 2 * h], [cx, cy + s], [cx - s, cy + s - h]];
  const right = [[cx + s, cy - s + h], [cx, cy - s + 2 * h], [cx, cy + s], [cx + s, cy + s - h]];
  return { top, left, right };
}

function ProjectsArt() {
  const gem = { t: [150, 96], r: [212, 168], b: [150, 244], l: [88, 168], c: [150, 168], tl: [120, 132], tr: [180, 132] };
  const face = (a, b, c, fill) => <polygon points={pts([a, b, c])} fill={fill} />;
  return (
    <>
      <defs>
        <radialGradient id="pa-p-bg" cx="0.5" cy="0.48" r="0.6">
          <stop offset="0" stopColor="#2c2925" />
          <stop offset="0.6" stopColor="#141312" />
          <stop offset="1" stopColor="#0b0b0b" />
        </radialGradient>
        <radialGradient id="pa-p-core" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.3" stopColor="#fff6ec" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pa-p-f1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6f3ee" stopOpacity="0.95" />
          <stop offset="1" stopColor="#8f8a84" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="pa-p-f2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bdb8b1" stopOpacity="0.7" />
          <stop offset="1" stopColor="#3a3733" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="pa-p-f3" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#1b1a18" stopOpacity="0.9" />
          <stop offset="1" stopColor="#6f6a64" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#pa-p-bg)" />
      <Stars list={stars(41, 30, H)} />
      {/* The build graph: every part wired back to the centre. */}
      <g stroke="#fff" strokeOpacity="0.16" strokeWidth="0.6">
        {CUBES.map(([x, y], i) => (
          <line key={i} x1="150" y1="168" x2={x} y2={y} />
        ))}
        <polyline points="92,102 150,70 212,100 240,168 224,238 150,262 80,238 62,170 92,102" fill="none" strokeOpacity="0.1" />
      </g>
      {CUBES.map(([x, y, s, solid], i) => {
        const c = cube(x, y, s);
        return (
          <g key={i} className={i % 3 === 0 ? "pa-bob" : undefined} style={{ "--pa-dl": `${-i * 0.7}s` }}>
            {solid ? (
              <>
                <polygon points={pts(c.left)} fill="#6d6863" fillOpacity="0.75" />
                <polygon points={pts(c.right)} fill="#302d2a" fillOpacity="0.85" />
                <polygon points={pts(c.top)} fill="#ece8e1" fillOpacity="0.85" />
              </>
            ) : null}
            <path
              d={`M${pts(c.top)}Z M${pts(c.left)}Z M${pts(c.right)}Z`}
              fill="none"
              stroke="#fff"
              strokeOpacity={solid ? 0.8 : 0.55}
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
      {/* The gem: eight facets, lit from the upper left, burning at the core. */}
      <circle cx="150" cy="168" r="96" fill="url(#pa-p-core)" opacity="0.35" />
      {face(gem.t, gem.tl, gem.c, "url(#pa-p-f1)")}
      {face(gem.t, gem.tr, gem.c, "url(#pa-p-f2)")}
      {face(gem.tl, gem.l, gem.c, "url(#pa-p-f1)")}
      {face(gem.tr, gem.r, gem.c, "url(#pa-p-f3)")}
      {face(gem.l, gem.b, gem.c, "url(#pa-p-f3)")}
      {face(gem.r, gem.b, gem.c, "url(#pa-p-f2)")}
      <path
        d={`M${pts([gem.t, gem.r, gem.b, gem.l])}Z M${pts([gem.tl, gem.tr])} M${pts([gem.t, gem.c, gem.b])} M${pts([gem.l, gem.c, gem.r])} M${pts([gem.tl, gem.c, gem.tr])}`}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.85"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <circle cx="150" cy="168" r="34" fill="url(#pa-p-core)" className="pa-pulse" />
      <circle cx="150" cy="168" r="2.2" fill="#fff" />
    </>
  );
}

// ── Skills: a glass planet ──────────────────────────────────────────────────

function SkillsArt() {
  const cx = 150;
  const cy = 160;
  const R = 64;
  const ring = { rx: 118, ry: 26, rot: -14 };
  const rs = stars(59, 44, H);
  // Constellation: a few of the stars, joined.
  const con = [[36, 58], [70, 36], [104, 52], [92, 88], [238, 262], [262, 238], [276, 276]];
  const moons = [
    [52, 196, 8],
    [246, 124, 10],
    [206, 268, 6],
  ];
  return (
    <>
      <defs>
        <radialGradient id="pa-s-bg" cx="0.5" cy="0.47" r="0.62">
          <stop offset="0" stopColor="#24221f" />
          <stop offset="1" stopColor="#0b0b0b" />
        </radialGradient>
        <radialGradient id="pa-s-glass" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.03" />
          <stop offset="0.72" stopColor="#fff" stopOpacity="0.07" />
          <stop offset="0.93" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.75" />
        </radialGradient>
        <radialGradient id="pa-s-spec" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pa-s-moon" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.45" stopColor="#a9a49d" />
          <stop offset="1" stopColor="#1a1917" />
        </radialGradient>
        <clipPath id="pa-s-back">
          <rect x="0" y="0" width={W} height={cy} />
        </clipPath>
        <clipPath id="pa-s-front">
          <rect x="0" y={cy} width={W} height={H - cy} />
        </clipPath>
      </defs>
      <rect width={W} height={H} fill="url(#pa-s-bg)" />
      <Stars list={rs} />
      <polyline points={pts(con.slice(0, 4))} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.5" />
      <polyline points={pts(con.slice(4))} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.5" />
      {con.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.3" fill="#fff" />
      ))}
      {/* Orbits. */}
      <g fill="none" stroke="#fff" strokeWidth="0.6">
        <ellipse cx={cx} cy={cy} rx="104" ry="46" strokeOpacity="0.18" transform={`rotate(12 ${cx} ${cy})`} />
        <ellipse cx={cx} cy={cy} rx="128" ry="112" strokeOpacity="0.1" strokeDasharray="2 4" />
      </g>
      {/* The ring's far half, behind the planet. */}
      <g clipPath="url(#pa-s-back)" transform={`rotate(${ring.rot} ${cx} ${cy})`}>
        <ellipse cx={cx} cy={cy} rx={ring.rx} ry={ring.ry} fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="3" />
        <ellipse cx={cx} cy={cy} rx={ring.rx - 8} ry={ring.ry - 3} fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />
      </g>
      {/* The planet: dark glass, bright rim, a band of latitude lines. */}
      <circle cx={cx} cy={cy} r={R} fill="#0d0d0c" />
      <circle cx={cx} cy={cy} r={R} fill="url(#pa-s-glass)" />
      <g fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="0.6">
        <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.3} />
        <ellipse cx={cx} cy={cy - 30} rx={R * 0.86} ry={R * 0.2} />
        <ellipse cx={cx} cy={cy + 30} rx={R * 0.86} ry={R * 0.2} />
        <ellipse cx={cx} cy={cy} rx={R * 0.4} ry={R} />
      </g>
      <ellipse cx={cx - 24} cy={cy - 30} rx="20" ry="12" fill="url(#pa-s-spec)" opacity="0.55" transform={`rotate(-35 ${cx - 24} ${cy - 30})`} />
      {/* The ring's near half, in front. */}
      <g clipPath="url(#pa-s-front)" transform={`rotate(${ring.rot} ${cx} ${cy})`}>
        <ellipse cx={cx} cy={cy} rx={ring.rx} ry={ring.ry} fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="3" />
        <ellipse cx={cx} cy={cy} rx={ring.rx - 8} ry={ring.ry - 3} fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1" />
      </g>
      {moons.map(([x, y, r], i) => (
        <g key={i} className="pa-bob" style={{ "--pa-dl": `${-i * 1.3}s` }}>
          <circle cx={x} cy={y} r={r * 2.4} fill="url(#pa-s-spec)" opacity="0.12" />
          <circle cx={x} cy={y} r={r} fill="url(#pa-s-moon)" />
        </g>
      ))}
    </>
  );
}

// ── About: the figure at the waterline ──────────────────────────────────────

function AboutArt() {
  const hz = 206; // horizon
  const r = rng(71);
  const ripples = Array.from({ length: 22 }, (_, i) => {
    const y = hz + 6 + i * i * 0.27 + r() * 2;
    const w = 6 + i * 2.2 + r() * 10;
    return [196 - w / 2 + (r() - 0.5) * 8, y, w];
  });
  const hills = ridge(83, [[-10, 196], [40, 184], [96, 198], [150, 192], [210, 200], [260, 186], [310, 194]], 8, 3);
  return (
    <>
      <defs>
        <linearGradient id="pa-a-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0b0b" />
          <stop offset="0.45" stopColor="#1f1d1b" />
          <stop offset="0.6" stopColor="#5b5044" />
          <stop offset="0.605" stopColor="#1a1816" />
          <stop offset="1" stopColor="#0b0b0b" />
        </linearGradient>
        <radialGradient id="pa-a-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.12" stopColor="#fff2e2" stopOpacity="0.85" />
          <stop offset="0.4" stopColor="#e8c9a6" stopOpacity="0.25" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pa-a-path" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4e6" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="pa-a-refl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#pa-a-sky)" />
      <Stars list={stars(67, 36, 150)} />
      {/* A thin ring in the sky, like the one over the peak. */}
      <circle cx="120" cy="104" r="62" fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="0.7" />
      <circle cx="170" cy="62" r="2" fill="#fff" opacity="0.8" />
      {/* The sun, just breaking the horizon. */}
      <circle cx="196" cy={hz} r="90" fill="url(#pa-a-sun)" className="pa-pulse" style={{ "--pa-dl": "-0.8s" }} />
      <polygon points={pts([...hills, [310, hz + 2], [-10, hz + 2]])} fill="#171513" />
      <rect x="0" y={hz} width={W} height="0.8" fill="#fff" opacity="0.5" />
      {/* Its path across the water, broken by ripples. */}
      <rect x="180" y={hz} width="32" height={H - hz} fill="url(#pa-a-path)" opacity="0.35" className="pa-shimmer" />
      <g fill="#fff4e6">
        {ripples.map(([x, y, w], i) => (
          <rect key={i} x={f1(x)} y={f1(y)} width={f1(w)} height="0.8" opacity={Math.max(0.08, 0.7 - i * 0.03)} />
        ))}
      </g>
      {/* The figure, and his reflection. */}
      <g transform={`translate(214 ${hz + 44})`}>
        <path
          d="M0 -48a4.6 4.6 0 1 1 0.01 0Z M-5.2 -38.5c1.4 -1.3 9 -1.3 10.4 0l1.3 17.5-2.6 0.6-0.4 20.4h-2.6l-1-17.5-0.9 17.5h-2.6l-0.4-20.4-2.6-0.6Z"
          fill="#050505"
        />
        <path
          d="M0 -48a4.6 4.6 0 1 1 0.01 0Z M-5.2 -38.5c1.4 -1.3 9 -1.3 10.4 0l1.3 17.5-2.6 0.6-0.4 20.4h-2.6l-1-17.5-0.9 17.5h-2.6l-0.4-20.4-2.6-0.6Z"
          fill="#050505"
          opacity="0.45"
          transform="scale(1 -0.8)"
        />
      </g>
      <rect x="0" y={hz + 44} width={W} height={H - hz - 44} fill="url(#pa-a-refl)" />
    </>
  );
}

const SCENES = { work: WorkArt, projects: ProjectsArt, skills: SkillsArt, about: AboutArt };

export default function PanelArt({ scene, className = "" }) {
  const Scene = SCENES[scene] ?? WorkArt;
  return (
    <svg
      className={`cir-path__scene ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <Scene />
    </svg>
  );
}
