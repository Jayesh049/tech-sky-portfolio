// The film deck's drawings: the world behind the cards (rock, rings, gold
// dust), the face each card shows while it waits in the fan, and the small
// line icons. All vector and seeded, so every render is identical and nothing
// is fetched. Decorative throughout: every export is aria-hidden.

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
const f1 = (n) => Math.round(n * 10) / 10;
const pts = (a) => a.map(([x, y]) => `${f1(x)},${f1(y)}`).join(" ");

// ── Line icons (24px, 1.4 stroke, currentColor) ─────────────────────────────

const ICON_PATHS = {
  read: "M3 5.5c3-1.2 6-1.2 9 1 3-2.2 6-2.2 9-1v13c-3-1.2-6-1.2-9 1-3-2.2-6-2.2-9-1zM12 6.5v13",
  found: "M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM15.3 15.3L21 21M8 10.5h5",
  fixed: "M14.5 3.5a5 5 0 0 0-4.8 6.4L3.5 16.1a2 2 0 0 0 2.8 2.8l6.2-6.2a5 5 0 0 0 6.4-4.8l-2.9 2.9-2.8-.7-.7-2.8z",
  shipped: "M5 12.5l4.5 4.5L19 7.5M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z",
  bulb: "M9 17.5h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2v1.5h5V16c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z",
  hand: "M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v4.5c0 3-2 5.5-5.5 5.5H12c-2 0-3.3-.8-4.4-2.3L5 16.2a1.5 1.5 0 0 1 2.3-1.9L9 16",
  back: "M19 12H5M11 6l-6 6 6 6",
  next: "M5 12h14M13 6l6 6-6 6",
  mouse: "M12 3a6 6 0 0 1 6 6v6a6 6 0 0 1-12 0V9a6 6 0 0 1 6-6zM12 7v3",
  shield: "M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6zM9 12l2 2 4-4",
  code: "M9 7l-5 5 5 5M15 7l5 5-5 5M13.5 5l-3 14",
};

export function Icon({ name, size = 20, className = "" }) {
  return (
    <svg
      className={`fs-icon ${className}`}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICON_PATHS[name] ?? ICON_PATHS.read} />
    </svg>
  );
}

// ── The fan faces: what a card shows while it waits behind the top one ─────
// Drawn for a 200x260 box sitting in the card's lower right, which is the part
// of a waiting card that stays in view.

// A wireframe ridge in gold dust: a grid of points lifted by a height field,
// joined to their neighbours.
function mesh(seed, peaks) {
  const r = rng(seed);
  const cols = 11;
  const rows = 9;
  const P = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u = i / (cols - 1);
      const v = j / (rows - 1);
      let h = 0;
      for (const [px, py, amp, w] of peaks) h += amp * Math.exp(-((u - px) ** 2 + (v - py) ** 2) / w);
      const x = 10 + u * 180 + (r() - 0.5) * 8 + (v - 0.5) * 30;
      const y = 120 + v * 130 - h * 120 + (r() - 0.5) * 6;
      P.push([x, y]);
    }
  }
  const L = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      if (i < cols - 1) L.push([P[k], P[k + 1]]);
      if (j < rows - 1) L.push([P[k], P[k + cols]]);
      if (i < cols - 1 && j < rows - 1 && (i + j) % 2 === 0) L.push([P[k], P[k + cols + 1]]);
    }
  }
  return { P, L };
}

const MESHES = {
  read: mesh(3, [[0.3, 0.3, 0.5, 0.05], [0.7, 0.5, 0.4, 0.06]]),
  found: mesh(7, [[0.5, 0.35, 0.9, 0.04], [0.2, 0.6, 0.35, 0.05], [0.82, 0.55, 0.45, 0.04]]),
  fixed: mesh(11, [[0.45, 0.5, 0.35, 0.08]]),
  shipped: mesh(17, [[0.6, 0.4, 0.7, 0.05], [0.25, 0.55, 0.4, 0.06]]),
};

export function CoverArt({ kind }) {
  const m = MESHES[kind] ?? MESHES.found;
  return (
    <svg className="fs-cover-art" viewBox="0 0 200 260" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`fs-cv-g-${kind}`} cx="0.5" cy="0.45" r="0.55">
          <stop offset="0" stopColor="#f2f0ee" stopOpacity="0.3" />
          <stop offset="1" stopColor="#f2f0ee" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="260" fill={`url(#fs-cv-g-${kind})`} />
      <g stroke="#edebe7" strokeOpacity="0.28" strokeWidth="0.6">
        {m.L.map(([a, b], i) => (
          <line key={i} x1={f1(a[0])} y1={f1(a[1])} x2={f1(b[0])} y2={f1(b[1])} />
        ))}
      </g>
      <g fill="#ffffff">
        {m.P.map(([x, y], i) => (
          <circle key={i} cx={f1(x)} cy={f1(y)} r={i % 7 === 0 ? 1.3 : 0.7} opacity={i % 7 === 0 ? 0.95 : 0.55} />
        ))}
      </g>
      {kind === "fixed" ? (
        <g stroke="#f2f0ee" strokeWidth="1" fill="none">
          <path d="M-10 250C60 230 120 170 210 40" strokeOpacity="0.9" />
          <path d="M-10 240C70 220 130 160 210 60" strokeOpacity="0.45" />
          <path d="M-10 230C80 212 140 150 210 80" strokeOpacity="0.25" />
        </g>
      ) : null}
      {kind === "shipped" ? (
        <g stroke="#f2f0ee" strokeWidth="1.4" fill="none">
          <circle cx="120" cy="92" r="17" />
          <path d="M112 92l6 6 11-12" />
        </g>
      ) : null}
    </svg>
  );
}

// ── The world behind the deck ───────────────────────────────────────────────
// Stretched to the deck's box (preserveAspectRatio="none"), so everything here
// is either an ellipse, a ragged ridge or a speck: shapes that read the same at
// any aspect. Strokes don't scale with it.

const SCENE = (() => {
  const r = rng(29);
  // Rock: three ragged ridges rising toward the right.
  const ridge = (y0, y1, rough, seed) => {
    const q = rng(seed);
    const out = [];
    for (let i = 0; i <= 40; i++) {
      const x = -20 + i * 26;
      const t = i / 40;
      out.push([x, y0 + (y1 - y0) * t + (q() - 0.5) * rough - Math.sin(t * 9 + seed) * rough * 0.4]);
    }
    return out;
  };
  const rocks = [ridge(930, 760, 70, 1), ridge(960, 820, 60, 2), ridge(990, 900, 40, 3)];
  // Gold dust: denser near the rings and along the ridges.
  const dust = Array.from({ length: 170 }, (_, i) => {
    const near = i % 3 === 0;
    const a = r() * Math.PI * 2;
    const x = near ? 420 + Math.cos(a) * (200 + r() * 260) : r() * 1000;
    const y = near ? 860 + Math.sin(a) * (40 + r() * 70) : r() * 1000;
    return [x, y, 0.6 + r() ** 3 * 2.2, 0.25 + r() * 0.7];
  });
  // Specks along the rock edges, like light caught on mica.
  const glints = rocks.flatMap((rr, k) => rr.filter((_, i) => (i + k) % 3 === 0).map(([x, y]) => [x + (r() - 0.5) * 10, y + 2 + r() * 8]));
  return { rocks, dust, glints };
})();

export function FilmScene() {
  const { rocks, dust, glints } = SCENE;
  return (
    <svg className="fs-scene" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="fs-sc-glow" cx="0.42" cy="0.86" r="0.55">
          <stop offset="0" stopColor="#edebe7" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#6b6b6b" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fs-sc-rock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1a" />
          <stop offset="1" stopColor="#070707" />
        </linearGradient>
      </defs>
      <rect width="1000" height="1000" fill="url(#fs-sc-glow)" />
      {/* The great arc behind the deck. */}
      <ellipse cx="430" cy="470" rx="470" ry="440" fill="none" stroke="#edebe7" strokeOpacity="0.14" vectorEffect="non-scaling-stroke" strokeDasharray="2 6" />
      <ellipse cx="430" cy="470" rx="400" ry="370" fill="none" stroke="#edebe7" strokeOpacity="0.08" vectorEffect="non-scaling-stroke" />
      {rocks.map((rr, i) => (
        <g key={i}>
          <polygon points={pts([...rr, [1020, 1000], [-20, 1000]])} fill="url(#fs-sc-rock)" opacity={0.75 + i * 0.1} />
          <polyline points={pts(rr)} fill="none" stroke="#edebe7" strokeOpacity={0.14 + i * 0.06} vectorEffect="non-scaling-stroke" />
        </g>
      ))}
      {/* The rings on the floor, centred under the top card. Each stroked
          twice, wide and faint under thin and bright, which reads as a glow. */}
      <g fill="none" vectorEffect="non-scaling-stroke">
        {[
          [470, 110, 0.22],
          [360, 84, 0.4],
          [250, 58, 0.55],
          [150, 34, 0.75],
        ].map(([rx, ry, a], i) => (
          <g key={i}>
            <ellipse cx="420" cy="880" rx={rx} ry={ry} stroke="#edebe7" strokeOpacity={a * 0.25} strokeWidth="7" vectorEffect="non-scaling-stroke" />
            <ellipse cx="420" cy="880" rx={rx} ry={ry} stroke="#f2f0ee" strokeOpacity={a} strokeWidth="1.1" vectorEffect="non-scaling-stroke" strokeDasharray={i === 1 ? "14 8" : undefined} />
          </g>
        ))}
      </g>
      <g fill="#ffffff">
        {glints.map(([x, y], i) => (
          <rect key={`g${i}`} x={f1(x)} y={f1(y)} width="1.6" height="1.2" opacity={0.35 + (i % 4) * 0.12} />
        ))}
        {dust.map(([x, y, s, a], i) => (
          <rect key={i} x={f1(x)} y={f1(y)} width={f1(s)} height={f1(s * 0.8)} opacity={f1(a)} />
        ))}
      </g>
    </svg>
  );
}
