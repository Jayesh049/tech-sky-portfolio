import PanelArt from "./PanelArt.jsx";

// The four sections the mark becomes. Each panel is a plain link to its
// section; the sequence only decides WHEN it stands up (data-open="true", set
// by heroSequence.js as each of the mark's points lands on the horizon). Without the
// sequence — reduced motion, Save-Data, no JS — they are simply open.
//
// Icons are drawn at 24px in the mark's own register: 1px white hairlines.

// The large line drawing that fills the middle of each panel. Drawn on a
// 120x80 stage in the same 1px hairline register as ICONS, just bigger: the
// panels are 292x581 and were carrying ~172px of content, so roughly 400px of
// each one was empty. This is what fills it.
//
// Abstract on purpose. The reference render puts photographs in here --
// mountains, a planet, a figure at sunset -- and a photograph inside a panel
// whose whole language is "hairlines on dark glass" would be the only raster
// thing on the page. These stay sharp at any DPI and cost about 200 bytes each.
export const ART = {
  work: (
    <>
      <path d="M4 62L30 34L46 50L64 26L86 54L116 62" />
      <circle cx="95" cy="21" r="9" />
    </>
  ),
  // An isometric cube: the hexagon is its silhouette, the three spokes from the
  // centre are the near corner's edges. Reads as "a thing built out of parts".
  projects: (
    <>
      <path d="M60 12L84 26L84 54L60 68L36 54L36 26Z" />
      <path d="M60 40L60 68M60 40L36 26M60 40L84 26" />
    </>
  ),
  // Three rings around a small core, not one ring around a large planet. A
  // single ellipse crossing a 16px circle has to pass BEHIND it to read as an
  // orbit, and there is no way to occlude a stroke against a gradient panel
  // without either a mask or a fill that would have to match the background
  // exactly. Three symmetrical rings through a 7px core read as intended with
  // no occlusion at all.
  skills: (
    <>
      <circle cx="60" cy="40" r="7" />
      <ellipse cx="60" cy="40" rx="38" ry="14" />
      <ellipse cx="60" cy="40" rx="38" ry="14" transform="rotate(60 60 40)" />
      <ellipse cx="60" cy="40" rx="38" ry="14" transform="rotate(-60 60 40)" />
    </>
  ),
  // A road running to the horizon. The render has a figure against a sunset,
  // but a person drawn in 1px hairlines at this size is a stick figure, and a
  // stick figure next to a ridge line and an isometric cube looks like a
  // mistake. The perspective road carries "journey" without drawing anybody.
  // The horizon sits high so the road below it has room to recede: 32 units of
  // depth, 84 units wide at the near edge narrowing to 12 at the vanishing
  // point. At the first attempt the horizon was at y=62, which left the road
  // 18 units tall -- too short to read as perspective, so it came out as a
  // stray V under a line. The dashed centre line settles any doubt.
  about: (
    <>
      <circle cx="60" cy="24" r="11" />
      <path d="M4 48h112" />
      <path d="M18 80L54 48M102 80L66 48" />
      <path d="M60 80v-8M60 66v-6M60 56v-4" />
    </>
  ),
};

// One glyph for all twelve list rows, not twelve. At 13px the render's
// per-row icons are indistinguishable from one another, so twelve near-identical
// paths would be weight spent on a difference nobody can see.
const TICK = <path d="M1 5.5L4.5 9L11 1.5" />;

export const ICONS = {
  work: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="1" />
      <path d="M9 7.5V5.5h6v2M3.5 12.5h17" />
    </>
  ),
  projects: (
    <>
      <path d="M12 3.5l8.5 4.5-8.5 4.5L3.5 8z" />
      <path d="M3.5 12l8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5" />
    </>
  ),
  skills: (
    <>
      <rect x="4.5" y="13.5" width="3" height="6" />
      <rect x="10.5" y="9.5" width="3" height="10" />
      <rect x="16.5" y="4.5" width="3" height="15" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.5 20.5c1.4-3.8 4.2-5.75 7.5-5.75s6.1 1.95 7.5 5.75" />
    </>
  ),
};

// HREFS REMAPPED for this site. Originals, which pointed at sections that do
// not exist here (#projects, #skills):
// export const DEFAULT_PATHS = [
//   { key: "work", title: "Work", sub: "Professional experience", href: "#work" },
//   { key: "projects", title: "Projects", sub: "Ideas to reality", href: "#projects" },
//   { key: "skills", title: "Skills", sub: "Tools & technologies", href: "#skills" },
//   { key: "about", title: "About", sub: "My story & vision", href: "#about" },
// ];
// The host's section ids are historically mis-named relative to their content:
// #work IS the projects gallery ("Three things I built end to end") and
// #experience IS the job history ("Where the four years went"). The labels below
// describe what the visitor gets, so "Work" deliberately opens #experience and
// "Projects" opens #work. Not a typo. Four is structural: Mark.jsx emits exactly
// four points and hero-sequence.css lays out repeat(4, ...).
//
// `items` is what each panel promises the visitor once they land. Every string
// is checked against the copy gate's banned list in scripts/selftest.mjs --
// note that "solutions" is on it, which is why Skills says "Tools and platforms"
// rather than the obvious thing.
export const DEFAULT_PATHS = [
  {
    key: "work",
    title: "Work",
    sub: "Professional experience",
    href: "#experience",
    items: ["Experience timeline", "Roles and responsibilities", "Impact and achievements"],
  },
  {
    key: "projects",
    title: "Projects",
    sub: "Ideas to reality",
    href: "#work",
    items: ["Featured projects", "Case studies", "Real-world impact"],
  },
  {
    key: "skills",
    title: "Skills",
    sub: "Tools & technologies",
    href: "#stack",
    items: ["Tech stack", "Tools and platforms", "Certifications"],
  },
  {
    key: "about",
    title: "About",
    sub: "My story & vision",
    href: "#about",
    items: ["My journey", "What drives me", "Future goals"],
  },
];

// Light motes drifting up around the sections: a golden-ratio scatter, so
// they're spread evenly without looking gridded, and stable between renders.
const MOTES = Array.from({ length: 22 }, (_, i) => ({
  "--x": `${((i * 0.618034 + 0.07) % 1) * 100}%`,
  "--y": `${((i * 0.381966 + 0.21) % 1) * 100}%`,
  "--s": `${1.2 + (i % 4) * 0.55}px`,
  "--d": `${4.2 + (i % 5) * 0.9}s`,
  "--dl": `${-(i * 0.73) % 6}s`,
}));

// The crown's four-point mark: the masthead's own symbol, drawn once more at
// the top of the centre beam, where the burst's light came down.
const CROWN = (
  <svg className="cir-paths__crown-mark" viewBox="0 0 80 80" fill="none" aria-hidden="true" focusable="false">
    <path d="M40 4l9 9-9 9-9-9z M67 31l9 9-9 9-9-9z M40 58l9 9-9 9-9-9z M13 31l9 9-9 9-9-9z" stroke="currentColor" strokeWidth="1.6" />
    <path d="M40 30l10 10-10 10-10-10z" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

// Floating debris for the backdrop: [x, y, size, rotation] on a 1600x900 stage.
const ROCKS = [
  [70, 330, 26, 12], [150, 610, 18, -20], [1500, 520, 30, 24], [1420, 260, 14, -8],
  [260, 170, 10, 40], [1330, 140, 9, -30], [40, 520, 12, 5], [1560, 700, 16, 16],
];
// Diamond outlines hanging in the air, echoing the mark: [x, y, size].
const DIAMONDS = [[330, 90, 9], [1240, 230, 11], [150, 420, 16], [1330, 330, 9], [520, 60, 6]];
// Pillars at the edges of the world: [x, width, height, lit?].
const PILLARS = [
  [0, 70, 380, true], [62, 36, 260, false], [110, 48, 200, true], [178, 26, 140, false],
  [1600 - 70, 70, 400, true], [1600 - 112, 44, 240, false], [1600 - 168, 52, 180, true], [1600 - 200, 22, 120, false],
];

// The world the slabs stand in: a slow galactic swirl, debris hanging in the
// air, diamond outlines, pillars at the edges. Rendered by HeroVideo as a
// hero-sized layer over the star dust and under everything else, and shown
// only once the four sections are lit (hero-panels.css).
export function HeroCosmos() {
  return (
    <div className="sq-hero__cosmos" aria-hidden="true">
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <radialGradient id="cp-nebula" cx="0.5" cy="0.42" r="0.55">
          <stop offset="0" stopColor="#fff2e2" stopOpacity="0.16" />
          <stop offset="0.45" stopColor="#c9b8a4" stopOpacity="0.06" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cp-pillar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2622" />
          <stop offset="1" stopColor="#0b0b0b" />
        </linearGradient>
        <radialGradient id="cp-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe9cf" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe9cf" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#cp-nebula)" />
      {/* The galaxy's arms: each one stroked several times, wide and faint
          to thin and bright, which reads as a glow without a blur filter. */}
      <g className="cir-paths__swirl" fill="none" stroke="#fff" transform="rotate(-8 800 330)">
        {[
          [760, 250],
          [620, 190],
          [470, 140],
        ].map(([rx, ry], i) => (
          <g key={i}>
            <ellipse cx="800" cy="330" rx={rx} ry={ry} strokeOpacity="0.018" strokeWidth="46" />
            <ellipse cx="800" cy="330" rx={rx} ry={ry} strokeOpacity="0.03" strokeWidth="20" />
            <ellipse cx="800" cy="330" rx={rx} ry={ry} strokeOpacity="0.05" strokeWidth="6" />
          </g>
        ))}
      </g>
      <g fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="1">
        <ellipse cx="800" cy="330" rx="690" ry="215" transform="rotate(-8 800 330)" strokeDasharray="2 10" />
      </g>
      {PILLARS.map(([x, w, h, lit], i) => (
        <g key={i}>
          <rect x={x} y={900 - h} width={w} height={h} fill="url(#cp-pillar)" />
          <rect x={x} y={900 - h} width={w} height="1" fill="#fff" opacity="0.35" />
          <rect x={x + w - 1} y={900 - h} width="1" height={h} fill="#fff" opacity="0.12" />
          {lit ? <circle cx={x + w / 2} cy={900 - h + 14} r={w * 0.9} fill="url(#cp-lamp)" opacity="0.5" /> : null}
        </g>
      ))}
      {ROCKS.map(([x, y, s, rot], i) => (
        <g key={i} transform={`rotate(${rot} ${x} ${y})`}>
          <polygon
            points={`${x - s},${y - s * 0.2} ${x - s * 0.3},${y - s * 0.8} ${x + s * 0.7},${y - s * 0.5} ${x + s},${y + s * 0.3} ${x + s * 0.1},${y + s * 0.8} ${x - s * 0.7},${y + s * 0.5}`}
            fill="#0f0e0d"
          />
          <polyline
            points={`${x - s},${y - s * 0.2} ${x - s * 0.3},${y - s * 0.8} ${x + s * 0.7},${y - s * 0.5} ${x + s},${y + s * 0.3}`}
            fill="none"
            stroke="#fff"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
        </g>
      ))}
      {DIAMONDS.map(([x, y, s], i) => (
        <path
          key={i}
          d={`M${x} ${y - s}L${x + s} ${y}L${x} ${y + s}L${x - s} ${y}Z`}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.8"
          strokeWidth="1.2"
        />
      ))}
    </svg>
  </div>
  );
}

export default function HeroPaths({
  items = DEFAULT_PATHS,
  navRef,
  onReplay = null,
  flareRef = null,
  flanks = ["Automate the mundane", "Accelerate the remarkable"],
}) {
  return (
    <nav
      ref={navRef}
      className="cir-paths"
      aria-label="Explore the portfolio"
      // A tap on a panel is navigation, not a tap on the hero's video toggle.
      onClick={(e) => e.stopPropagation()}
    >
      {/* Light in the seams between the sections, and a flare above the centre
          one: where the burst's beam came down. */}
      <span className="cir-paths__beam" style={{ "--b": 1 }} aria-hidden="true" />
      <span className="cir-paths__beam cir-paths__beam--c" style={{ "--b": 2 }} aria-hidden="true" />
      <span className="cir-paths__beam" style={{ "--b": 3 }} aria-hidden="true" />
      {/* The flare is also the replay control: click the star, watch the mark
          build the sections again.

          Always a <button>, never swapped with a <span> by state. React would
          remount the node on the swap, and a freshly mounted element does not
          transition -- it snaps. The swap would land exactly as data-lit="true"
          arrives, popping at the climax of the shot. `disabled` is the gate
          instead, because opacity:0 removes neither the tab stop nor the hit
          target.

          It also has to keep this class and stay inside .cir-paths: the fade
          rules and the reduced-motion override are descendant selectors rooted
          there, so a wrapper button would sit at opacity 1 as an invisible
          220x96 tab stop over the hero for the whole sequence. */}
      <button
        ref={flareRef}
        type="button"
        className="cir-paths__flare"
        aria-label="Replay the opening sequence"
        disabled={!onReplay}
        aria-hidden={onReplay ? undefined : "true"}
        onClick={onReplay ?? undefined}
      >
        {CROWN}
      </button>
      {/* The masthead's two lines, restated as the world's horizon: one either
          side of the mark, each with a rule running in to meet it. */}
      <span className="cir-paths__crown" aria-hidden="true">
        <span className="cir-paths__crown-l">{flanks[0]}</span>
        <span className="cir-paths__crown-r">{flanks[1]}</span>
      </span>
      {/* Where the centre beam meets the floor: rings of light spreading out. */}
      <span className="cir-paths__portal" aria-hidden="true">
        <svg viewBox="0 0 600 160" fill="none" focusable="false">
          <ellipse cx="300" cy="80" rx="290" ry="66" stroke="#fff" strokeOpacity="0.12" />
          <ellipse cx="300" cy="80" rx="220" ry="50" stroke="#fff" strokeOpacity="0.2" strokeDasharray="3 7" className="cir-paths__spin" />
          <ellipse cx="300" cy="80" rx="150" ry="34" stroke="#fff" strokeOpacity="0.35" />
          <ellipse cx="300" cy="80" rx="96" ry="22" stroke="#fff" strokeOpacity="0.55" strokeDasharray="10 5" className="cir-paths__spin cir-paths__spin--r" />
          <ellipse cx="300" cy="80" rx="52" ry="12" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.4" />
        </svg>
      </span>
      {/* The floor they stand on, and the light still hanging in the air. */}
      <span className="cir-paths__floor" aria-hidden="true" />
      <span className="cir-paths__motes" aria-hidden="true">
        {MOTES.map((style, i) => (
          <i key={i} style={style} />
        ))}
      </span>
      {items.map((it, i) => (
        // Everything below .cir-path__edge is a DIRECT child on purpose.
        // hero-sequence.css gives every direct child the staged fade-in, and
        // hides every direct child until the sequence opens this panel. Both
        // behaviours arrive free by nesting correctly; wrap these in a div and
        // the whole group animates as one block instead.
        <a key={it.key} className="cir-path" href={it.href} style={{ "--i": i }}>
          <span className="cir-path__edge" aria-hidden="true" />
          {/* Decorative ordering, so it stays out of the link's accessible
              name -- "01" tells a screen reader nothing the list order doesn't. */}
          <span className="cir-path__no" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          {/* The scene: fills the top of the glass and fades into it behind the
              text. PanelArt.jsx draws all four; the older hairline drawings
              (ART above) are kept for reference but no longer rendered. */}
          <PanelArt className="cir-path__art" scene={it.icon ?? it.key} />
          {/* The slab's own furniture: the bevelled inner frame, the tab on its
              top edge, and the engraved marks in two corners. Decorative, so
              aria-hidden, and absolutely placed so the grid never sees them. */}
          <span className="cir-path__bevel" aria-hidden="true" />
          <span className="cir-path__tab" aria-hidden="true" />
          <span className="cir-path__marks" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="cir-path__ticks" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <svg
            className="cir-path__icon"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            aria-hidden="true"
            focusable="false"
          >
            {ICONS[it.icon ?? it.key] ?? ICONS.work}
          </svg>
          <span className="cir-path__title">{it.title}</span>
          <span className="cir-path__sub">{it.sub}</span>
          {/* Real content, so it stays readable by AT -- only the numeral and
              the arrow are hidden. */}
          <ul className="cir-path__list">
            {(it.items ?? []).map((row) => (
              <li key={row}>
                <span className="cir-path__ico" aria-hidden="true">
                <svg
                  viewBox="0 0 12 11"
                  width="12"
                  height="11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  aria-hidden="true"
                  focusable="false"
                >
                  {TICK}
                </svg>
                </span>
                {row}
              </li>
            ))}
          </ul>
          {/* A span, never a button: the whole card is already the link, and a
              nested button would be invalid HTML and a second tab stop per
              panel. This is an affordance for a link that already works. */}
          <span className="cir-path__go" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              focusable="false"
            >
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          </span>
        </a>
      ))}
    </nav>
  );
}
