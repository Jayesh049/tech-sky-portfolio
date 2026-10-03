// The six skill-card scenes, in the same lit-glass register as the film deck
// and the hero's crystal panels: white hairlines, glass faces, light pooling
// under each object. All vector, seeded, no filters, nothing fetched. Each is
// drawn on a 260x220 stage. Decorative: aria-hidden.
//
// The light here used to be gold, matching the section's old SPECTRA palette.
// It is neutral now -- see the note on GOLD/HOT/EDGE below. Technology brand
// colours (the blue-white component tree, for instance) are deliberately left
// alone: they identify what they draw.

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
const P = (a) => a.map(([x, y]) => `${f1(x)},${f1(y)}`).join(" ");

// RECOLOURED with the section (see src/theme/skills-cards.css). These three
// carried the whole gold scheme through every drawing, so the section's palette
// change is these three lines plus two inline fills below.
// WAS: GOLD #f2b36b, HOT #ffd9a8, EDGE #fbe6c8.
const GOLD = "#edebe7"; // bone: the main linework
const HOT = "#ffffff"; //  white: highlights and lit edges
const EDGE = "#f6f5f3"; // the brightest edge, a shade off white

// Isometric projection around (cx, cy); s is the unit size.
const iso = (cx, cy, s) => (x, y, z) => [cx + (x - y) * 0.866 * s, cy + (x + y) * 0.5 * s - z * s];

// A box in isometric space, returned as its three visible faces.
function box(pr, x, y, z, w, d, h) {
  const p = (a, b, c) => pr(a, b, c);
  return {
    top: [p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)],
    left: [p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)],
    right: [p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)],
  };
}

function Glass({ faces, lit = 0.5, stroke = EDGE, sw = 0.8 }) {
  return (
    <g stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
      <polygon points={P(faces.left)} fill={`rgb(255 255 255 / ${0.05 + lit * 0.06})`} strokeOpacity="0.6" />
      <polygon points={P(faces.right)} fill={`rgb(255 255 255 / ${0.02 + lit * 0.04})`} strokeOpacity="0.5" />
      <polygon points={P(faces.top)} fill={`rgb(255 255 255 / ${0.1 + lit * 0.14})`} strokeOpacity="0.85" />
    </g>
  );
}

// Light pooled on the floor under an object, and a ring or two around it.
function Floor({ cx, cy, rx, id }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx * 1.5} ry={rx * 0.34} fill={`url(#${id}-pool)`} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.22} fill="none" stroke={GOLD} strokeOpacity="0.55" />
      <ellipse cx={cx} cy={cy} rx={rx * 1.35} ry={rx * 0.3} fill="none" stroke={GOLD} strokeOpacity="0.22" strokeDasharray="3 5" />
    </g>
  );
}

function Defs({ id }) {
  return (
    <defs>
      <radialGradient id={`${id}-pool`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={GOLD} stopOpacity="0.55" />
        <stop offset="0.5" stopColor={GOLD} stopOpacity="0.14" />
        <stop offset="1" stopColor={GOLD} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
        <stop offset="0.25" stopColor={HOT} stopOpacity="0.45" />
        <stop offset="1" stopColor={GOLD} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-pane`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
        <stop offset="0.5" stopColor="#fff" stopOpacity="0.04" />
        <stop offset="1" stopColor={GOLD} stopOpacity="0.1" />
      </linearGradient>
    </defs>
  );
}

function Dust({ seed, n = 26 }) {
  const r = rng(seed);
  return (
    <g fill={HOT}>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={f1(r() * 260)} cy={f1(r() * 220)} r={f1(0.4 + r() ** 3 * 1.3)} opacity={f1(0.2 + r() * 0.6)} />
      ))}
    </g>
  );
}

// A pane seen at an angle: a parallelogram leaning back.
const pane = (x, y, w, h, skew) => [[x, y + skew], [x + w, y], [x + w, y + h], [x, y + h + skew]];

// ── 01 Frontend: glass screens, a component on the front one ────────────────
function Frontend() {
  const id = "sk1";
  return (
    <>
      <Defs id={id} />
      <Dust seed={1} />
      <Floor cx={134} cy={196} rx={78} id={id} />
      {[
        [70, 40, 118, 92, 14, 0.35],
        [52, 58, 126, 100, 14, 0.6],
      ].map(([x, y, w, h, k, o], i) => (
        <g key={i} opacity={o}>
          <polygon points={P(pane(x, y, w, h, k))} fill={`url(#${id}-pane)`} stroke={EDGE} strokeOpacity="0.6" />
          {[0, 1, 2, 3].map((j) => (
            <rect key={j} x={x + 10} y={y + k + 14 + j * 12} width={40 - j * 6} height="3" rx="1.5" fill={EDGE} opacity="0.35" />
          ))}
        </g>
      ))}
      {/* The front screen, with a component tree glowing on it. */}
      <polygon points={P(pane(96, 76, 132, 104, 12))} fill="rgb(11 11 11 / 0.9)" stroke={EDGE} strokeWidth="1.1" />
      <polygon points={P(pane(96, 76, 132, 104, 12))} fill={`url(#${id}-pane)`} />
      <circle cx="162" cy="132" r="34" fill={`url(#${id}-glow)`} opacity="0.5" />
      <g fill="none" stroke="#d9f0ff" strokeWidth="1.3" opacity="0.95">
        <ellipse cx="162" cy="132" rx="26" ry="9.5" />
        <ellipse cx="162" cy="132" rx="26" ry="9.5" transform="rotate(60 162 132)" />
        <ellipse cx="162" cy="132" rx="26" ry="9.5" transform="rotate(-60 162 132)" />
      </g>
      <circle cx="162" cy="132" r="3.2" fill="#eef8ff" />
      {/* Its stand. */}
      <path d="M150 181l-6 12h40l-6-12" fill="rgb(255 255 255 / 0.06)" stroke={EDGE} strokeOpacity="0.5" />
    </>
  );
}

// ── 02 Backend: a server tower and the services around it ───────────────────
function Backend() {
  const id = "sk2";
  const pr = iso(136, 120, 1);
  const units = [0, 1, 2, 3];
  const small = [
    [-78, 10, 18, "{ }"],
    [72, -6, 18, "db"],
    [56, 50, 14, ""],
  ];
  return (
    <>
      <Defs id={id} />
      <Dust seed={2} />
      <Floor cx={136} cy={190} rx={74} id={id} />
      {units.map((u) => {
        const b = box(pr, -26, -26, u * 26 - 40, 52, 52, 20);
        return (
          <g key={u}>
            <Glass faces={b} lit={0.3 + u * 0.12} />
            {/* The lit slots on the front faces. */}
            {[0.25, 0.5, 0.75].map((t, j) => {
              const [a0, a1] = [b.left[0], b.left[1]];
              const x = a0[0] + (a1[0] - a0[0]) * t;
              const y = a0[1] + (a1[1] - a0[1]) * t - 10;
              return <line key={j} x1={x - 6} y1={y + 3} x2={x + 6} y2={y - 3} stroke={HOT} strokeWidth="1.4" opacity={0.5 + j * 0.2} />;
            })}
            <circle cx={b.right[3][0] - 8} cy={b.right[3][1] + 12} r="1.6" fill={HOT} />
          </g>
        );
      })}
      <circle cx="136" cy="18" r="30" fill={`url(#${id}-glow)`} opacity="0.45" />
      {small.map(([dx, dz, s, label], i) => {
        const q = iso(136 + dx, 120 - dz, 1);
        const b = box(q, -s / 2, -s / 2, 0, s, s, s);
        return (
          <g key={i}>
            <Glass faces={b} lit={0.6} />
            {label ? (
              <text x={b.top[0][0]} y={b.top[0][1] + s + 4} textAnchor="middle" fontSize="7" fill={HOT} fontFamily="monospace">
                {label}
              </text>
            ) : null}
          </g>
        );
      })}
    </>
  );
}

// ── 03 Design and structure: a lattice of glass cubes ───────────────────────
function Design() {
  const id = "sk3";
  const pr = iso(140, 128, 1);
  const cells = [];
  for (let z = 0; z < 3; z++) for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) cells.push([x, y, z]);
  // Back to front so nearer cubes draw over farther ones.
  cells.sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[2] - b[2]);
  return (
    <>
      <Defs id={id} />
      <Dust seed={3} />
      <Floor cx={140} cy={196} rx={80} id={id} />
      <rect x="139.2" y="0" width="1.6" height="130" fill={HOT} opacity="0.35" />
      {cells.map(([x, y, z], i) => {
        const b = box(pr, x * 30 - 30, y * 30 - 30, z * 30 - 40, 28, 28, 28);
        const core = x === 1 && y === 1 && z === 1;
        return <Glass key={i} faces={b} lit={core ? 1 : 0.15 + z * 0.1} sw={core ? 1.2 : 0.7} />;
      })}
      <circle cx="140" cy="100" r="30" fill={`url(#${id}-glow)`} opacity="0.6" />
      {[[60, 70], [226, 60], [214, 150], [70, 160]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 7}l7 7-7 7-7-7z`} fill="none" stroke={HOT} strokeOpacity="0.7" />
      ))}
    </>
  );
}

// ── 04 Data and analysis: a database and the charts it feeds ────────────────
function Data() {
  const id = "sk4";
  const bars = [22, 36, 28, 50, 44, 62];
  const line = [[146, 92], [162, 80], [176, 86], [192, 62], [208, 70], [224, 46]];
  return (
    <>
      <Defs id={id} />
      <Dust seed={4} />
      <Floor cx={132} cy={198} rx={80} id={id} />
      {/* Two chart panes, leaning back. */}
      <polygon points={P(pane(60, 44, 84, 76, 10))} fill={`url(#${id}-pane)`} stroke={EDGE} strokeOpacity="0.55" />
      {bars.map((h, i) => (
        <rect key={i} x={70 + i * 12} y={112 - h + 8 - i * 1.2} width="7" height={h} fill={i === 5 ? HOT : EDGE} opacity={i === 5 ? 0.9 : 0.4} />
      ))}
      <polygon points={P(pane(140, 30, 94, 82, 10))} fill={`url(#${id}-pane)`} stroke={EDGE} strokeOpacity="0.6" />
      <polyline points={P(line)} fill="none" stroke={HOT} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={P([...line, [224, 104], [146, 104]])} fill={GOLD} opacity="0.12" />
      {line.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.8" fill={HOT} />
      ))}
      {/* The database: three platters. */}
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <path
            d={`M96 ${180 - k * 20}v-16a36 10 0 0 0 72 0v16a36 10 0 0 1 -72 0z`}
            fill="rgb(19 19 19 / 0.95)"
            stroke={EDGE}
            strokeOpacity="0.6"
          />
          <ellipse cx="132" cy={164 - k * 20} rx="36" ry="10" fill={`rgb(255 255 255 / ${0.08 + k * 0.05})`} stroke={EDGE} strokeOpacity="0.75" />
          <circle cx="104" cy={176 - k * 20} r="1.5" fill={HOT} />
        </g>
      ))}
      <circle cx="132" cy="124" r="26" fill={`url(#${id}-glow)`} opacity="0.5" />
    </>
  );
}

// ── 05 Tickets and clients: the queue, one resolved ─────────────────────────
function Tickets() {
  const id = "sk5";
  const cards = [
    [48, 46, 0.35],
    [80, 62, 0.55],
    [112, 78, 1],
  ];
  return (
    <>
      <Defs id={id} />
      <Dust seed={5} />
      <Floor cx={146} cy={198} rx={82} id={id} />
      {cards.map(([x, y, o], i) => (
        <g key={i} opacity={o}>
          <polygon points={P(pane(x, y, 100, 88, 12))} fill="rgb(11 11 11 / 0.92)" stroke={EDGE} strokeWidth={i === 2 ? 1.1 : 0.8} />
          <polygon points={P(pane(x, y, 100, 88, 12))} fill={`url(#${id}-pane)`} />
          <rect x={x + 10} y={y + 20} width="26" height="3" rx="1.5" fill={EDGE} opacity="0.7" />
          {[0, 1, 2].map((j) => (
            <rect key={j} x={x + 10} y={y + 34 + j * 11} width={70 - j * 14} height="2.5" rx="1.2" fill={EDGE} opacity="0.3" />
          ))}
          {i === 2 ? (
            <g>
              <rect x={x + 44} y={y + 8} width="48" height="14" rx="7" fill="rgb(255 255 255 / 0.14)" stroke={HOT} strokeOpacity="0.8" />
              <path d={`M${x + 51} ${y + 15}l3 3 5-6`} fill="none" stroke={HOT} strokeWidth="1.2" />
              <text x={x + 76} y={y + 18} textAnchor="middle" fontSize="6.5" fill={HOT} fontFamily="monospace" letterSpacing="0.5">
                DONE
              </text>
            </g>
          ) : null}
        </g>
      ))}
      <circle cx="200" cy="96" r="30" fill={`url(#${id}-glow)`} opacity="0.4" />
    </>
  );
}

// ── 06 AI in the loop: a network on a pedestal, tools in orbit ──────────────
function Ai() {
  const id = "sk6";
  const r = rng(61);
  const cx = 140;
  const cy = 100;
  const R = 46;
  const nodes = [];
  while (nodes.length < 34) {
    const x = (r() * 2 - 1) * R;
    const y = (r() * 2 - 1) * R * 0.8;
    if ((x / R) ** 2 + (y / (R * 0.8)) ** 2 < 1) nodes.push([cx + x, cy + y]);
  }
  const edges = [];
  nodes.forEach((a, i) =>
    nodes.forEach((b, j) => {
      if (j > i && Math.hypot(a[0] - b[0], a[1] - b[1]) < 22) edges.push([a, b]);
    })
  );
  const orbit = [
    [72, 60, "chat"],
    [214, 52, "code"],
    [224, 136, "db"],
    [60, 142, "view"],
  ];
  const glyph = {
    chat: "M-5 -4h10v6h-6l-3 3v-3h-1z",
    code: "M-2 -4l-4 4 4 4M2 -4l4 4-4 4",
    db: "M-5 -3a5 2 0 0 0 10 0a5 2 0 0 0 -10 0v6a5 2 0 0 0 10 0v-6",
    view: "M-6 -4h12v7h-12zM-2 5h4",
  };
  return (
    <>
      <Defs id={id} />
      <Dust seed={6} />
      <ellipse cx={cx} cy={cy} rx="96" ry="34" fill="none" stroke={GOLD} strokeOpacity="0.28" transform={`rotate(-10 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r="62" fill={`url(#${id}-glow)`} opacity="0.35" />
      <g stroke={EDGE} strokeOpacity="0.32" strokeWidth="0.6">
        {edges.map(([a, b], i) => (
          <line key={i} x1={f1(a[0])} y1={f1(a[1])} x2={f1(b[0])} y2={f1(b[1])} />
        ))}
      </g>
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={f1(x)} cy={f1(y)} r={i % 5 === 0 ? 2 : 1.1} fill={i % 5 === 0 ? "#fff" : HOT} opacity={i % 5 === 0 ? 1 : 0.7} />
      ))}
      {orbit.map(([x, y, k]) => (
        <g key={k} transform={`translate(${x} ${y})`}>
          <line x1="0" y1="0" x2={f1((cx - x) * 0.45)} y2={f1((cy - y) * 0.45)} stroke={GOLD} strokeOpacity="0.35" />
          <circle r="13" fill="rgb(13 13 13 / 0.95)" stroke={HOT} strokeOpacity="0.75" />
          <path d={glyph[k]} fill="none" stroke={HOT} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      {/* The pedestal, lit from inside. */}
      <path d="M112 176h56l6 14h-68z" fill="rgb(19 19 19 / 0.95)" stroke={EDGE} strokeOpacity="0.5" />
      <ellipse cx={cx} cy="176" rx="28" ry="6" fill={`rgb(255 255 255 / 0.4)`} stroke={HOT} />
      <rect x={cx - 1} y="146" width="2" height="30" fill={HOT} opacity="0.6" />
      <Floor cx={cx} cy={198} rx={70} id={id} />
    </>
  );
}

const SCENES = [Frontend, Backend, Design, Data, Tickets, Ai];

export default function SkillArt({ index }) {
  const Scene = SCENES[index % SCENES.length];
  return (
    <svg className="disc-art" viewBox="0 0 260 220" fill="none" aria-hidden="true" focusable="false">
      <Scene />
    </svg>
  );
}

// The small badge beside each list row: a hexagon with a tick, as the
// reference draws it. One glyph for all thirty rows.
export function RowMark() {
  return (
    <svg className="disc-mark" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true" focusable="false">
      <path d="M8 1.5l5.6 3.2v6.6L8 14.5l-5.6-3.2V4.7z" stroke="currentColor" strokeWidth="1" />
      <path d="M5.5 8.2l1.7 1.7 3.3-3.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
