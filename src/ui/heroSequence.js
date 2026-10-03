// The masthead's one-shot, in eight steps:
//
//   Quiet → Expansion → Return → Rotation → Acceleration → Burst → Four paths → Exploration
//
// The constellation mark exhales, draws itself back in, spins up under a
// building bloom and releases in a skyshot. Its four points ride a horizon
// line out to four places; the name gives way; and at each place a section
// stands up out of the line — Work, Projects, Skills, About.
//
// One continuous movement on a single clock: the outward travel ends at zero
// velocity, the return ends at full velocity, that velocity becomes the
// rotation, the rotation becomes the burst, and the burst hands its four
// points to the paths.
//
// The background follows the steps: the video keeps playing while a dusk
// layer and a static field of star dust come up, and they stay up. The final
// state is the CSS default for data-seq="done", so a visitor with reduced
// motion (or no JS) lands directly on it.
//
// Framework-agnostic and dependency-free: one hero-sized <canvas>, one rAF
// loop, no shadowBlur (glow is a pre-rendered sprite drawn additively). The
// loop stops and the canvas clears the moment the sequence ends.

// ── Timeline (ms) ────────────────────────────────────────────────────────────
export const TIMELINE = {
  out: [0, 1000], //        Expansion: the four points travel outward
  back: [1000, 1600], //    Return: …and fall back in, and form
  spin: [1600, 2500], //    Rotation (to 2000), then Acceleration
  accel: 2000,
  charge: [1900, 2500], //  energy builds while it spins up
  burst: 2500, //           Burst
  paths: [2800, 3350], //   Four paths: the points ride the horizon out
  giveWay: [2900, 3300], // the name, tagline, badge and flanks fade
  explore: 3350, //         Exploration: the sections stand up
  fade: [2850, 4200], //    burst particles expand and fade
  lines: [3350, 3900], //   horizon and beam give way as the sections stand
  end: 4450,
};
// Inner sections stand first, then the outer pair: it opens from the centre.
export const landAt = (i) => TIMELINE.paths[1] + (i === 0 || i === 3 ? 70 : 0);

// The background, keyed to the steps rather than to time: [ms, value].
const DUSK = [[0, 0], [1000, 0.06], [1600, 0.14], [2000, 0.32], [2500, 0.66], [2800, 0.88], [3600, 1]];
const STARS = [[0, 0], [1900, 0], [2500, 0.35], [2900, 0.8], [3600, 1]];

// ── Helpers ──────────────────────────────────────────────────────────────────
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const easeOutQuart = (t) => 1 - (1 - t) ** 4;
const easeInQuart = (t) => t * t * t * t;
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const easeOutQuint = (t) => 1 - (1 - t) ** 5;
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

function keyed(frames, t) {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [t1, v1] = frames[i];
    if (t <= t1) {
      const [t0, v0] = frames[i - 1];
      return lerp(v0, v1, smooth((t - t0) / (t1 - t0)));
    }
  }
  return frames[frames.length - 1][1];
}

// Seeded, so a replay is the same shot every time and a scrub can rebuild
// any frame exactly. A new seed per page load keeps visits from being identical.
function makeRng(seed) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = s;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  next.reset = () => {
    s = seed >>> 0;
  };
  return next;
}

// Rotation, in closed form so every frame (and every motion-blur sub-step)
// can ask "where was it at time t" without integrating. ω ramps with u³:
// barely turning through Rotation, then Acceleration does most of the work.
const W0 = 2.4; //  rad/s at the moment of forming — the return's momentum
const W1 = 58; //   rad/s at release (~9 rev/s: pure smear)
const SPIN_S = (TIMELINE.spin[1] - TIMELINE.spin[0]) / 1000;
function spinTheta(t) {
  const u = seg(t, ...TIMELINE.spin);
  return SPIN_S * (W0 * u + ((W1 - W0) * u ** 4) / 4);
}
function spinOmega(t) {
  const u = seg(t, ...TIMELINE.spin);
  return W0 + (W1 - W0) * u ** 3;
}

// Warm is the ember hairline pushed most of the way to white: present as a
// temperature, never as a colour.
const WHITE = [255, 255, 255];
const GREY = [214, 214, 210];
const WARM = [255, 216, 188];
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a < 0 ? 0 : a > 1 ? 1 : a})`;

function makeGlow(size, warm) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const g = cv.getContext("2d");
  const h = size / 2;
  const grd = g.createRadialGradient(h, h, 0, h, h, h);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.16, "rgba(255,255,255,0.62)");
  grd.addColorStop(0.42, warm ? "rgba(238,196,164,0.16)" : "rgba(230,230,228,0.14)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return cv;
}

function diamondPath(ctx, x, y, r, rot) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  // Local points N, E, S, W — the same order Mark.jsx draws them.
  ctx.moveTo(x + r * s, y - r * c);
  ctx.lineTo(x + r * c, y + r * s);
  ctx.lineTo(x - r * s, y + r * c);
  ctx.lineTo(x - r * c, y - r * s);
  ctx.closePath();
}

// ── Star dust ────────────────────────────────────────────────────────────────
/**
 * Paint the static star field once (and again on resize). Denser along the
 * horizon line through the mark, with a band of fine glitter along the floor
 * the panels stand on (`floor`, as a fraction of the height); a handful of the
 * brightest are the system's own four-point diamond at sparkle scale.
 * Opacity is the only thing that ever animates, so it costs nothing per frame.
 */
export function paintStars(canvas, { horizon = 0.5, floor = 0.8, seed = 7 } = {}) {
  const rect = canvas.getBoundingClientRect();
  const W = rect.width;
  const H = rect.height;
  if (!W || !H) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const r = makeRng(seed);
  const hy = H * horizon;
  const fy = H * floor;
  const dot = (x, y, s, a, c) => {
    ctx.fillStyle = rgba(c, a);
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
  };
  // A field everywhere, and a band hugging the horizon.
  const n = Math.round(Math.min(360, (W * H) / 4200));
  for (let i = 0; i < n; i++) {
    const band = r() < 0.45;
    const y = band ? hy + (r() + r() + r() - 1.5) * H * 0.16 : r() * H;
    dot(r() * W, y, 0.4 + r() ** 3 * 1.3, 0.12 + r() ** 2 * 0.6, r() < 0.16 ? WARM : r() < 0.35 ? GREY : WHITE);
  }
  // Floor glitter: fine, warm, thickest under the centre.
  const g = Math.round(Math.min(420, W / 3.2));
  for (let i = 0; i < g; i++) {
    const x = W / 2 + (r() + r() - 1) * W * 0.55;
    const y = fy + (r() + r() - 1) * H * 0.05 + (r() < 0.3 ? r() * H * 0.08 : 0);
    dot(x, y, 0.4 + r() ** 4 * 1.6, 0.18 + r() ** 2 * 0.7, r() < 0.4 ? WARM : WHITE);
  }
  // Sparkles: tiny four-point stars with hairline rays.
  const k = Math.max(5, Math.round(W / 200));
  for (let i = 0; i < k; i++) {
    const x = r() * W;
    const y = i % 3 === 0 ? fy + (r() - 0.5) * H * 0.06 : hy + (r() - 0.5) * H * 0.7;
    const len = 2 + r() * 4;
    const a = 0.22 + r() * 0.35;
    ctx.strokeStyle = rgba(WHITE, a);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x - len, y);
    ctx.lineTo(x + len, y);
    ctx.moveTo(x, y - len);
    ctx.lineTo(x, y + len);
    ctx.stroke();
    dot(x, y, 1.2, a + 0.2, WHITE);
  }
}

// ── Engine ───────────────────────────────────────────────────────────────────
/**
 * @param {object} o
 * @param {HTMLCanvasElement} o.fx      hero-sized canvas the light is drawn on
 * @param {Element} o.mark              the SVG mark; hidden while the canvas owns it
 * @param {() => Element[]} o.panels    the four panels, in order (left → right)
 * @param {() => Element[]} [o.fade]    what gives way to the panels: the copy and flanks
 * @param {Element} [o.dusk]            dusk layer; its opacity is driven
 * @param {Element} [o.stars]           star-dust canvas; its opacity is driven
 * @param {number}  [o.size=76]         Mark.jsx's size prop
 * @param {number}  [o.quiet=0]         ms of stillness held before Expansion
 * @param {(phase:string)=>void} [o.onPhase]
 * @param {(open:boolean[])=>void} [o.onPanels]
 * @param {()=>void} [o.onEnd]
 */
export function createHeroSequence(o) {
  const fx = o.fx;
  const markEl = o.mark ?? null;
  const getPanels = o.panels ?? (() => []);
  const getFade = o.fade ?? (() => []);
  const duskEl = o.dusk ?? null;
  const starsEl = o.stars ?? null;
  const size = o.size ?? 76;
  const quiet = o.quiet ?? 0;
  const onPhase = o.onPhase ?? (() => {});
  const onPanels = o.onPanels ?? (() => {});
  const onEnd = o.onEnd ?? (() => {});

  // Mark.jsx ratios.
  const ARM = size * 0.37;
  const CORE = size * 0.17;
  const PT = size * 0.085;
  const LINE = 1; // strokeWidth="1" in the SVG

  const ctx = fx.getContext("2d");
  const glowW = makeGlow(128, false);
  const glowK = makeGlow(128, true);
  const rnd = makeRng((Math.random() * 2 ** 32) >>> 0);
  const rand = (a, b) => a + rnd() * (b - a);

  let W = 0;
  let H = 0;
  let dpr = 1;
  let cx = 0; // mark centre, in canvas px
  let cy = 0;
  let nodes = []; // per panel: { x, top, bottom } in canvas px
  let raf = 0;
  let last = 0;
  let t = 0;
  let speed = 1;
  let running = false;
  let burstDone = false;
  let phase = "";
  let open = [];
  let orbiters = [];
  let streaks = [];
  let parts = [];
  let rays = [];
  let orbAcc = 0;

  function measure() {
    const r = fx.getBoundingClientRect();
    W = r.width;
    H = r.height;
    // Cap the backing store at ~2.6M px: this is soft light, not text.
    dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2.6e6 / Math.max(1, W * H)));
    fx.width = Math.max(1, Math.round(W * dpr));
    fx.height = Math.max(1, Math.round(H * dpr));
    if (markEl) {
      const m = markEl.getBoundingClientRect();
      cx = m.left + m.width / 2 - r.left;
      cy = m.top + m.height / 2 - r.top;
    } else {
      cx = W / 2;
      cy = H / 2;
    }
    nodes = getPanels().map((el) => {
      // A closed panel is clipped, not moved, so its box is already final.
      const p = el.getBoundingClientRect();
      return {
        x: p.left + p.width / 2 - r.left,
        left: p.left - r.left,
        right: p.right - r.left,
        top: p.top - r.top,
        bottom: p.bottom - r.top,
      };
    });
  }

  function setPhase(p) {
    if (p !== phase) {
      phase = p;
      onPhase(p);
    }
  }

  function setOpen(next) {
    if (next.length !== open.length || next.some((v, i) => v !== open[i])) {
      open = next;
      onPanels(open.slice());
    }
  }

  function setMark(opacity) {
    if (markEl) markEl.style.opacity = String(opacity);
  }

  function setBackdrop(time) {
    if (duskEl) duskEl.style.opacity = keyed(DUSK, time).toFixed(3);
    if (starsEl) starsEl.style.opacity = keyed(STARS, time).toFixed(3);
    const f = (1 - easeOutCubic(seg(time, ...TIMELINE.giveWay))).toFixed(3);
    for (const el of getFade()) el.style.opacity = f;
  }

  function glow(x, y, r, a, warm) {
    if (a <= 0.002 || r <= 0.5) return;
    ctx.globalAlpha = a > 1 ? 1 : a;
    ctx.drawImage(warm ? glowK : glowW, x - r, y - r, r * 2, r * 2);
  }

  // A luminous line: a wide faint pass under a thin bright one.
  function lightLine(x0, y0, x1, y1, a, core = 1.2, halo = 6, c = WHITE) {
    if (a <= 0.003) return;
    ctx.strokeStyle = rgba(c, 1);
    ctx.lineCap = "round";
    ctx.globalAlpha = a * 0.14;
    ctx.lineWidth = halo;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.globalAlpha = a;
    ctx.lineWidth = core;
    ctx.stroke();
    ctx.lineCap = "butt";
  }

  // A tapered ray from (x0,y0) toward (x1,y1): bright at the start, gone at the end.
  function ray(x0, y0, x1, y1, a, w, c = WHITE) {
    if (a <= 0.003) return;
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, rgba(c, a));
    g.addColorStop(1, rgba(c, 0));
    ctx.globalAlpha = 1;
    ctx.strokeStyle = g;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  // A four-point star flare: the mark's own geometry as light.
  function flare(x, y, len, a, warm) {
    if (a <= 0.003) return;
    glow(x, y, len * 0.9, a * 0.8, warm);
    ray(x, y, x - len, y, a, 1);
    ray(x, y, x + len, y, a, 1);
    ray(x, y, x, y - len * 1.3, a, 1);
    ray(x, y, x, y + len * 0.7, a * 0.8, 1);
  }

  // ── Particles ──────────────────────────────────────────────────────────────
  function spawnOrbiter() {
    orbiters.push({
      a: rand(0, Math.PI * 2),
      r: rand(ARM * 2.2, ARM * 4.6),
      w: rand(3.5, 6.5) * (rnd() < 0.5 ? 1 : -1) * 0.35 + 3.2, // mostly with the spin
      s: rand(0.6, 1.5),
      born: t,
      warm: rnd() < 0.25,
    });
  }

  // Frame 7's streaks: light flying in along the horizon from both sides.
  function spawnStreaks() {
    streaks = [];
    for (let i = 0; i < 14; i++) {
      streaks.push({
        side: i % 2 ? 1 : -1,
        dy: (rnd() + rnd() - 1) * 70,
        t0: TIMELINE.charge[0] + rand(0, 420),
        dur: rand(260, 420),
        len: rand(50, 150),
        a: rand(0.35, 0.8),
        warm: rnd() < 0.3,
      });
    }
  }

  function spawnBurst() {
    parts = [];
    // Anamorphic bias: wider than tall, like the storyboard's skyshot.
    const ax = 1.32;
    const ay = 0.8;
    const dir = () => {
      const a = rand(0, Math.PI * 2);
      return [Math.cos(a) * ax, Math.sin(a) * ay];
    };
    // Frame 8's starburst: long thin rays out of the heart.
    rays = [];
    for (let i = 0; i < 84; i++) {
      const a = rand(0, Math.PI * 2);
      rays.push({
        dx: Math.cos(a) * ax,
        dy: Math.sin(a) * ay,
        len: rand(90, 300) * (rnd() < 0.2 ? 2.1 : 1),
        w: rand(0.5, 1.4),
        a: rand(0.35, 0.95),
        c: rnd() < 0.2 ? WARM : WHITE,
      });
    }
    // Thin luminous trails.
    for (let i = 0; i < 130; i++) {
      const [dx, dy] = dir();
      const v = rand(520, 1600);
      parts.push({
        kind: "spark",
        x: dx * rand(2, 10), y: dy * rand(2, 10),
        vx: dx * v, vy: dy * v,
        drag: rand(0.9, 0.935),
        life: rand(0.55, 1.2),
        age: 0,
        w: rand(0.6, 1.4),
        c: rnd() < 0.2 ? WARM : rnd() < 0.3 ? GREY : WHITE,
        a: rand(0.6, 1),
      });
    }
    // Geometric fragments: the mark in pieces, big enough to read as diamonds.
    for (let i = 0; i < 34; i++) {
      const [dx, dy] = dir();
      const v = rand(160, 700);
      parts.push({
        kind: "shard",
        x: dx * rand(0, 8), y: dy * rand(0, 8),
        vx: dx * v, vy: dy * v,
        drag: rand(0.93, 0.955),
        life: rand(1.1, 1.7),
        age: 0,
        r: rnd() < 0.3 ? rand(4.5, 7) : rand(2, 4.5),
        rot: 0,
        vr: rand(-5, 5),
        c: rnd() < 0.15 ? WARM : WHITE,
        a: rand(0.6, 0.95),
      });
    }
    // Dust: some flies, some hangs at the heart as frame 9's glittering cloud.
    for (let i = 0; i < 170; i++) {
      const [dx, dy] = dir();
      const slow = rnd() < 0.45;
      const v = slow ? rand(10, 90) : rand(80, 520);
      parts.push({
        kind: "dust",
        x: dx * rand(0, 14), y: dy * rand(0, 14),
        vx: dx * v, vy: dy * v,
        drag: rand(0.94, 0.965),
        buoy: rand(-22, -4),
        life: slow ? rand(1.2, 1.7) : rand(0.9, 1.5),
        age: 0,
        r: rand(0.5, 1.5),
        c: rnd() < 0.25 ? WARM : rnd() < 0.4 ? GREY : WHITE,
        a: rand(0.35, 0.9),
      });
    }
    orbiters = [];
  }

  function stepParts(dt) {
    const k = dt * 60;
    for (const p of parts) {
      const d = p.drag ** k;
      p.vx *= d;
      p.vy *= d;
      if (p.buoy) p.vy += p.buoy * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.vr) p.rot += p.vr * dt * (0.25 + (0.75 * Math.hypot(p.vx, p.vy)) / 700);
      p.age += dt;
    }
    parts = parts.filter((p) => p.age < p.life);
  }

  // ── Drawing: the mark ──────────────────────────────────────────────────────
  function strokeMark(arm, rot, coreR, alpha) {
    if (alpha <= 0.003) return;
    ctx.globalAlpha = alpha > 1 ? 1 : alpha;
    ctx.lineWidth = LINE;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    diamondPath(ctx, cx, cy, coreR, rot);
    for (let i = 0; i < 4; i++) {
      const a = rot + (i * Math.PI) / 2;
      diamondPath(ctx, cx + Math.sin(a) * arm, cy - Math.cos(a) * arm, PT, rot);
    }
    ctx.stroke();
  }

  // Shared by Expansion and Return: four points on the axes, trailing light.
  function drawTravel(arm, vel, coreR, coreA, inward, linkA) {
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const sx = Math.sin(a);
      const sy = -Math.cos(a);
      const px = cx + sx * arm;
      const py = cy + sy * arm;
      // The trail points where it came from. Long while fast, gone at rest.
      const k = inward ? 1 : -1;
      const len = Math.min(inward ? 70 : 60, vel * (inward ? 22 : 19));
      if (len > 1) ray(px + k * sx * (PT + 1), py + k * sy * (PT + 1), px + k * sx * len, py + k * sy * len, 0.55 * (vel / 4) + 0.08, 1);
      // Form: hairlines reconnect each point to the centre as it lands.
      if (linkA > 0) {
        ctx.globalAlpha = 0.18 * linkA;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(px - sx * (PT + 2), py - sy * (PT + 2));
        ctx.lineTo(cx + sx * (CORE + 2), cy + sy * (CORE + 2));
        ctx.stroke();
      }
      // Frame 2's glints: each travelling point carries a small flare.
      flare(px, py, 8 + 10 * (vel / 4), 0.2 + 0.3 * (vel / 4), false);
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.lineWidth = LINE;
    ctx.strokeStyle = "#fff";
    ctx.globalAlpha = coreA;
    ctx.beginPath();
    diamondPath(ctx, cx, cy, coreR, 0);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      diamondPath(ctx, cx + Math.sin(a) * arm, cy - Math.cos(a) * arm, PT, 0);
    }
    ctx.stroke();
  }

  function drawOut() {
    // Expansion — an inhale: quick off the mark, gliding to a stop.
    const u = seg(t, ...TIMELINE.out);
    const e = easeOutQuart(u);
    drawTravel(lerp(ARM, ARM * 3.4, e), 4 * (1 - u) ** 3, lerp(CORE, CORE * 0.74, e), lerp(1, 0.5, e), false, 0);
  }

  function drawBack() {
    // Return — they fall back in, gathering speed, like being called home.
    const u = seg(t, ...TIMELINE.back);
    const e = easeInQuart(u);
    drawTravel(
      lerp(ARM * 3.4, ARM, e),
      4 * u ** 3,
      lerp(CORE * 0.74, CORE, e),
      lerp(0.5, 1, easeOutCubic(u)),
      true,
      seg(u, 0.45, 1) * (1 - seg(u, 0.96, 1) * 0.6)
    );
  }

  function spinArm(u) {
    // Tightens as it spins up, then flicks open just before release.
    let s = 1 - 0.16 * easeOutCubic(u);
    if (u > 0.9) s += 0.26 * ((u - 0.9) / 0.1) ** 2;
    return ARM * s;
  }

  function drawSpin(dtMs) {
    // Rotation → Acceleration, with the energy build-up (frame 7) underneath.
    const u = seg(t, ...TIMELINE.spin);
    const w = spinOmega(t);
    const rot = spinTheta(t);
    const arm = spinArm(u);
    const coreR = CORE * (1 - 0.22 * u);
    const heat = u * u; // intensity follows speed, not time

    ctx.globalCompositeOperation = "lighter";

    // The landing pulse from the form beat, decaying into the spin.
    const land = 1 - seg(t, TIMELINE.spin[0], TIMELINE.spin[0] + 260);
    if (land > 0) glow(cx, cy, lerp(18, 60, 1 - land), 0.45 * land * land, false);

    // Bloom: a wide warm field and a tight white heart, both rising with speed.
    glow(cx, cy, lerp(30, 170, heat), 0.05 + 0.55 * heat, true);
    glow(cx, cy, lerp(14, 60, heat), 0.1 + 0.7 * heat, false);

    // Frame 7's rings: concentric halos that brighten as it winds up.
    const rings = [1.42, 1.9, 2.45];
    rings.forEach((k, j) => {
      const a = seg(u, 0.1 + j * 0.15, 0.6 + j * 0.12) * (0.18 + 0.5 * heat) * (1 - j * 0.22);
      if (a <= 0.003) return;
      const rr = arm * k * (1 + 0.04 * Math.sin(t / 90 + j));
      ctx.strokeStyle = "#fff";
      ctx.globalAlpha = a * 0.12;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = a;
      ctx.lineWidth = j === 0 ? 1.2 : 0.8;
      ctx.stroke();
    });

    // Circular light trails — bright arcs riding the rings, lengthening with ω.
    // Two counter-rotate slightly: it reads as mechanism, not a loading spinner.
    const arcs = [
      { r: arm * 1.42, k: 1, len: 0.3 + 2.1 * heat, a: 0.15 + 0.7 * heat, n: 2 },
      { r: arm * 1.9, k: -0.42, len: 0.15 + 1.3 * heat, a: 0.08 + 0.45 * heat, n: 3 },
    ];
    ctx.lineCap = "round";
    if (u >= 0.08) {
      for (const ring of arcs) {
        const base = rot * ring.k;
        const d = ring.k > 0 ? -1 : 1;
        for (let j = 0; j < ring.n; j++) {
          const a0 = base + (j * Math.PI * 2) / ring.n - Math.PI / 2;
          const SEG = 7;
          for (let s = 0; s < SEG; s++) {
            const f = s / SEG;
            ctx.globalAlpha = ring.a * (1 - f) * seg(u, 0.08, 0.3);
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.6 - f;
            ctx.beginPath();
            ctx.arc(cx, cy, ring.r, a0 + d * f * ring.len, a0 + d * (f + 1 / SEG) * ring.len, d < 0);
            ctx.stroke();
          }
        }
      }
    }
    ctx.lineCap = "butt";

    // Streaks flying in along the horizon.
    for (const s of streaks) {
      const p = seg(t, s.t0, s.t0 + s.dur);
      if (p <= 0 || p >= 1) continue;
      const e = easeInQuart(p);
      const x = cx + s.side * lerp(W * 0.55, arm * 2, e);
      const y = cy + s.dy * (1 - e);
      const a = s.a * Math.sin(p * Math.PI);
      ray(x, y, x + s.side * s.len * (0.4 + e), y, a, 1.1, s.warm ? WARM : WHITE);
      glow(x, y, 6, a * 0.5, s.warm);
    }

    // Energy build-up — orbiters spiral in; more of them as it winds up.
    for (const ob of orbiters) {
      const age = (t - ob.born) / 1000;
      const rr = ob.r * Math.max(0.28, 1 - age * 1.25);
      const aa = ob.a + ob.w * age + rot * 0.18;
      const x = cx + Math.cos(aa) * rr;
      const y = cy + Math.sin(aa) * rr * 0.92;
      const fadeIn = clamp01(age / 0.18);
      ctx.globalAlpha = 0.85 * fadeIn * (0.4 + 0.6 * heat);
      ctx.fillStyle = rgba(ob.warm ? WARM : WHITE, 1);
      ctx.fillRect(x - ob.s / 2, y - ob.s / 2, ob.s, ob.s);
      glow(x, y, 3 + 5 * ob.s, 0.18 * fadeIn * heat, ob.warm);
    }

    // The mark itself, with true motion blur: redraw it along the arc it swept
    // since the last frame, each copy fainter. More copies as it speeds up.
    const sweep = Math.min(1.25, (w * Math.max(dtMs, 16.7)) / 1000);
    const n = Math.max(1, Math.min(16, Math.ceil(sweep / 0.06)));
    for (let i = n - 1; i >= 0; i--) {
      const f = i / n;
      const a = n === 1 ? 1 : ((1 - f) ** 1.6 * 2.6) / n + (i === 0 ? 0.4 : 0);
      strokeMark(arm, rot - sweep * f, coreR, a);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  // ── Drawing: burst, four paths, sections ───────────────────────────────────
  function drawAfter() {
    const tb = t - TIMELINE.burst;
    const fadeAll = 1 - easeOutCubic(seg(t, TIMELINE.fade[0] + 500, TIMELINE.fade[1]));

    ctx.globalCompositeOperation = "lighter";

    // 8 · The skyshot: fast up, slow down. Warm at the edges, white at the heart.
    const fl = tb < 40 ? tb / 40 : 1 - easeOutQuart(seg(tb, 40, 520));
    glow(cx, cy, lerp(40, 380, easeOutQuint(seg(tb, 0, 420))), 0.95 * fl, true);
    glow(cx, cy, lerp(10, 110, easeOutQuint(seg(tb, 0, 240))), fl, false);
    glow(cx, cy, 26, 0.9 * (1 - seg(tb, 0, 900)), false);

    // Starburst rays: shoot out, then thin away.
    const rp = seg(tb, 0, 760);
    if (rp < 1) {
      const grow = easeOutQuint(seg(tb, 0, 380));
      const fade = (1 - rp) ** 1.6;
      for (const r of rays) {
        const L = r.len * grow;
        const s0 = L * 0.12 * rp;
        ray(cx + r.dx * s0, cy + r.dy * s0, cx + r.dx * L, cy + r.dy * L, r.a * fade, r.w, r.c);
      }
    }

    // Shockwave: one hairline, gone in under half a second.
    const sw = seg(tb, 0, 460);
    if (sw < 1) {
      const rr = lerp(14, 240, easeOutQuint(sw));
      ctx.globalAlpha = 0.3 * (1 - sw) ** 2.4;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = lerp(1.2, 0.4, sw);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rr, rr * 0.78, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Particles.
    for (const p of parts) {
      const life = 1 - p.age / p.life;
      const a = p.a * life ** 1.3 * fadeAll;
      if (a <= 0.004) continue;
      const x = cx + p.x;
      const y = cy + p.y;
      if (p.kind === "spark") {
        // A tapered streak whose length is its own speed: motion blur for free.
        const sp = Math.hypot(p.vx, p.vy);
        const len = Math.min(150, sp * 0.036 + 2);
        const nx = p.vx / (sp || 1);
        const ny = p.vy / (sp || 1);
        ray(x, y, x - nx * len, y - ny * len, a, p.w, p.c);
        if (tb < 350) glow(x, y, 5, a * 0.35, p.c === WARM);
      } else if (p.kind === "shard") {
        glow(x, y, p.r * 3.6, a * 0.35, p.c === WARM);
        ctx.globalAlpha = a;
        ctx.strokeStyle = rgba(p.c, 1);
        ctx.lineWidth = p.r > 4 ? 1.1 : 0.9;
        ctx.beginPath();
        diamondPath(ctx, x, y, p.r, p.rot);
        ctx.stroke();
      } else {
        ctx.globalAlpha = a;
        ctx.fillStyle = rgba(p.c, 1);
        ctx.fillRect(x - p.r / 2, y - p.r / 2, p.r, p.r);
      }
    }

    drawPaths();
    ctx.globalCompositeOperation = "source-over";
  }

  function drawPaths() {
    // 9 · Four paths: the horizon line runs out to both edges, arrow-tipped;
    // a beam rises from the heart; the mark's four points ride the line out
    // to where their sections will stand.
    const lines = 1 - easeOutCubic(seg(t, ...TIMELINE.lines));
    const start = TIMELINE.burst + 40;
    if (t < start) return;
    const ext = easeOutQuint(seg(t, start, TIMELINE.paths[1]));
    const reach = lerp(30, W * 0.48, ext);
    const lineA = Math.min(1, seg(t, start, start + 120) * 1.2) * lines;

    // The horizon, brightest at the heart.
    const g = ctx.createLinearGradient(cx - reach, cy, cx + reach, cy);
    g.addColorStop(0, rgba(WHITE, 0.55 * lineA));
    g.addColorStop(0.25, rgba(WARM, 0.35 * lineA));
    g.addColorStop(0.5, rgba(WHITE, 0.95 * lineA));
    g.addColorStop(0.75, rgba(WARM, 0.35 * lineA));
    g.addColorStop(1, rgba(WHITE, 0.55 * lineA));
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = g;
    ctx.fillRect(cx - reach, cy - 3, reach * 2, 6);
    ctx.globalAlpha = 1;
    ctx.fillRect(cx - reach, cy - 0.75, reach * 2, 1.5);
    // Arrow tips riding the ends out.
    for (const s of [-1, 1]) {
      const x = cx + s * reach;
      const a = lineA * (0.5 + 0.5 * ext);
      glow(x, cy, 16, a * 0.7, false);
      ctx.globalAlpha = a;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x - s * 12, cy - 6);
      ctx.lineTo(x, cy);
      ctx.lineTo(x - s * 12, cy + 6);
      ctx.stroke();
    }

    // The beam rising from the heart, crowned with a flare where the centre
    // seam of the sections will begin.
    const top = nodes.length ? Math.min(...nodes.map((n) => n.top)) - 36 : cy - 260;
    const up = easeOutQuint(seg(t, start + 60, TIMELINE.paths[1] + 100));
    const by = lerp(cy, top, up);
    ray(cx, by, cx, cy, 0.8 * lineA, 1.2);
    ray(cx, cy, cx, by, 0.35 * lineA, 4);
    flare(cx, by, 16 + 10 * up, 0.8 * lineA * up, false);

    // The four points: glowing diamonds sliding out along the horizon.
    nodes.forEach((n, i) => {
      const land = landAt(i);
      const s = easeOutCubic(seg(t, TIMELINE.paths[0], land));
      if (t < TIMELINE.paths[0]) return;
      const x = lerp(cx, n.x, s);
      const after = seg(t, land, land + 500);
      const a = lineA * (1 - after * 0.7);
      glow(x, cy, 22, 0.7 * a, i === 1 || i === 2);
      ctx.globalAlpha = a;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      diamondPath(ctx, x, cy, PT * 1.25, 0);
      ctx.stroke();
      // 10 · On arrival the section stands up out of the line: its two side
      // edges race up and down from the horizon to full height, a flare
      // riding each end, as the panel opens behind them.
      if (t >= land) {
        const e = easeOutQuint(seg(t, land, land + 560));
        const fade = 1 - seg(t, land + 300, land + 950);
        const y0 = lerp(cy, n.top, e);
        const y1 = lerp(cy, n.bottom, e);
        // The top edge draws across as the sides reach it.
        const across = seg(e, 0.85, 1);
        for (const ex of [n.left, n.right]) {
          const xx = lerp(x, ex, easeOutCubic(seg(t, land, land + 260)));
          lightLine(xx, y0, xx, y1, 0.6 * fade, 1, 8);
          flare(xx, y0, 12, 0.75 * fade, false);
          flare(xx, y1, 9, 0.45 * fade, true);
        }
        if (across > 0) lightLine(n.left, n.top, n.right, n.top, 0.5 * fade * across, 1, 6);
      }
    });
  }

  // ── Loop ───────────────────────────────────────────────────────────────────

  // Simulation only: the clock, spawning, particle physics, the DOM handoffs.
  function advance(dtMs) {
    t += dtMs;
    if (t >= TIMELINE.charge[0] && t < TIMELINE.burst) {
      if (!streaks.length) spawnStreaks();
      // Density rises with speed: ~10 → ~90 orbiters/s.
      const u = seg(t, ...TIMELINE.charge);
      orbAcc += (dtMs / 1000) * (10 + 80 * u * u);
      while (orbAcc >= 1 && orbiters.length < 56) {
        spawnOrbiter();
        orbAcc -= 1;
      }
    }
    if (t >= TIMELINE.burst) {
      if (!burstDone) {
        burstDone = true;
        spawnBurst();
      }
      stepParts(dtMs / 1000);
    }
    setMark(t < 0 ? 1 : 0);
    setBackdrop(t);
    setOpen(getPanels().map((_, i) => t >= landAt(i)));
  }

  function phaseAt(time) {
    if (time < 0) return "quiet";
    if (time < TIMELINE.out[1]) return "expansion";
    if (time < TIMELINE.back[1]) return "return";
    if (time < TIMELINE.accel) return "rotation";
    if (time < TIMELINE.burst) return "acceleration";
    if (time < TIMELINE.paths[0]) return "burst";
    if (time < TIMELINE.explore) return "paths";
    return time < TIMELINE.end ? "exploration" : "done";
  }

  // Rendering only.
  function draw(dtMs) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (t < 0) {
      // Quiet: the resting hero; nothing drawn.
    } else if (t < TIMELINE.out[1]) drawOut();
    else if (t < TIMELINE.back[1]) drawBack();
    else if (t < TIMELINE.burst) drawSpin(dtMs);
    else drawAfter();
    ctx.globalAlpha = 1;
    setPhase(phaseAt(t));
  }

  function frame(now) {
    // Clamped dt: a hidden tab or a long stall resumes where it left off
    // rather than skipping the burst; ordinary slow frames keep real time.
    const raw = last ? now - last : 16.7;
    last = now;
    const dtMs = Math.min(raw, 100) * speed;
    advance(dtMs);
    if (t >= TIMELINE.end) {
      finish();
      return;
    }
    draw(dtMs);
    raf = requestAnimationFrame(frame);
  }

  function reset(from) {
    cancelAnimationFrame(raf);
    raf = 0;
    // Measure the resting layout: text present, panels in place.
    for (const el of getFade()) el.style.opacity = "1";
    measure();
    rnd.reset();
    t = from;
    last = 0;
    orbAcc = 0;
    burstDone = false;
    parts = [];
    rays = [];
    orbiters = [];
    streaks = [];
    phase = "";
    open = [];
  }

  // Hold the final state. It equals the CSS default for data-seq="done", so
  // this only bridges the frame before the host flips the attribute.
  function release() {
    setMark(0);
    if (duskEl) duskEl.style.opacity = "1";
    if (starsEl) starsEl.style.opacity = "1";
    for (const el of getFade()) el.style.opacity = "0";
  }

  function finish() {
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
    t = Math.max(t, TIMELINE.end);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, fx.width, fx.height);
    parts = [];
    rays = [];
    orbiters = [];
    streaks = [];
    setOpen(getPanels().map(() => true));
    release();
    setPhase("done");
    onEnd();
  }

  function play() {
    reset(-quiet);
    running = true;
    advance(0);
    raf = requestAnimationFrame(frame);
  }

  // Hold a single frame at time `ms`, rebuilt deterministically from zero.
  // For review tooling and tests; the site itself only ever calls play().
  function seek(ms) {
    reset(Math.min(0, ms));
    running = false;
    const target = Math.min(ms, TIMELINE.end - 1);
    const STEP = 1000 / 60;
    while (t + STEP <= target) advance(STEP);
    advance(Math.max(0, target - t));
    draw(STEP);
  }

  function stop() {
    if (running) finish();
  }

  const onResize = () => {
    if (running) measure();
  };
  window.addEventListener("resize", onResize);

  return {
    play,
    seek,
    stop,
    setSpeed(s) {
      speed = s;
    },
    get running() {
      return running;
    },
    get time() {
      return t;
    },
    destroy() {
      stop();
      window.removeEventListener("resize", onResize);
    },
  };
}
