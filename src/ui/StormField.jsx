import { useEffect, useRef } from 'react';
import { atmo } from '../scene/state.js';
import { logoUrl } from '../scene/ExtrudedLogo.jsx';
import { byId } from '../data/techs.js';

// The simple-icons marks are single-path SVGs with no fill, so they are drawn
// as a mask over the technology's own colour rather than as an <img>.
export function TechLogo({ id, color, className = '' }) {
  return (
    <span
      className={`tech-logo ${className}`}
      style={{ '--logo': `url(${logoUrl(id)})`, '--c': color ?? byId[id]?.color ?? '#fff' }}
      aria-hidden="true"
    />
  );
}

// THE EFFECTS LAYER of the skills sky: everything that is light rather than
// cloud. One 2D canvas over the WebGL sky and under every panel and control,
// so no particle ever sits on top of text.
//
// One requestAnimationFrame loop, running only while the section is on
// screen. It reads the atmosphere object the GSAP timeline tweens
// (scene/state.js) and writes pixels plus a single CSS custom property,
// --white. It never causes a React render.
//
// What it draws, by beat:
//   always          slow dust; now and then a faint light inside the storm
//   hover, select   a small glow of the chip's colour where the chip is
//   TECH_RISE       a column of light under the rising technology
//   CODE_REVEAL     dust drawn into the code window as it forms
//   COMPILING       dust swirling, light rising with the progress
//   ENERGY_BUILD    tilted rings tightening, light building underneath
//   BURST           the panels break into glass fragments; sparks with
//                   motion streaks, a shock ring, radial light, a flash
//   white clouds    the same effects re-inked so they read on a bright sky
//
// Particle counts are fixed and small: 70 dust (34 on phones), at most 240
// sparks and 90 fragments for about two seconds per burst.

const TAU = Math.PI * 2;
const mix = (a, b, k) => a + (b - a) * k;
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];

function hexRgb(hex) {
  const h = (hex || '#ffffff').replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgba = ([r, g, b], a) => `rgba(${r | 0},${g | 0},${b | 0},${a <= 0 ? 0 : a >= 1 ? 1 : a.toFixed(3)})`;

// Dark-sky inks, and the inks the same effects use once the sky is white.
const INK = {
  dust: [[196, 218, 255], [70, 98, 136]],
  cyan: [[159, 232, 255], [18, 128, 170]],
  white: [[255, 255, 255], [38, 66, 104]],
  amber: [[255, 217, 168], [196, 110, 40]],
};
const ink = (name, w) => mix3(INK[name][0], INK[name][1], w);

function makeDust(n, W, H) {
  return Array.from({ length: n }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 8,
    vy: -2 - Math.random() * 6,
    r: 0.5 + Math.random() ** 2 * 1.6,
    a: 0.12 + Math.random() * 0.4,
    tw: Math.random() * TAU,
  }));
}

export default function StormField({ heroRef, anchorRef, windowRef, tech, reduced, small, onScreen }) {
  const canvasRef = useRef(null);

  // The loop reads these without restarting.
  const live = useRef({});
  live.current = { reduced, small, accent: tech?.color ?? '#ffffff' };

  useEffect(() => {
    if (!onScreen) return undefined;
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let W = 0;
    let H = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      W = hero.clientWidth;
      H = hero.clientHeight;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
    };
    resize();
    const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
    ro?.observe(hero);

    let dust = makeDust(live.current.small ? 34 : 70, W, H);
    let sparks = [];
    let shards = [];
    let ring = -1; // seconds since the burst, or -1
    let spawned = false;
    let spin = 0;
    let glint = { x: 0, y: 0, age: 99, next: 3 + Math.random() * 4 };
    let lastWhite = -1;
    let t = 0;
    let last = performance.now();
    let raf = 0;

    // The burst. The panels on the stage break into glass fragments that fly
    // away from the centre, and sparks leave the centre itself.
    const spawnBurst = (cx, cy, hr) => {
      const tiny = live.current.small;
      const palette = ['white', 'white', 'white', 'cyan', 'cyan', 'amber'];
      sparks = Array.from({ length: tiny ? 120 : 240 }, () => {
        const a = Math.random() * TAU;
        const s = 380 + Math.random() ** 1.6 * 1300;
        const life = 0.7 + Math.random() * 1.1;
        const k = Math.random();
        return {
          x: cx + Math.cos(a) * 12,
          y: cy + Math.sin(a) * 12,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s * 0.78,
          life,
          max: life,
          w: 0.6 + Math.random() * 1.6,
          c: k < 0.08 ? 'accent' : palette[(Math.random() * palette.length) | 0],
        };
      });
      shards = [];
      const slots = hero.querySelectorAll('.stage-slot');
      const per = tiny ? 14 : 30;
      slots.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        for (let i = 0; i < per && shards.length < 90; i++) {
          const x = r.left - hr.left + Math.random() * r.width;
          const y = r.top - hr.top + Math.random() * r.height;
          const dx = x - cx;
          const dy = y - cy;
          const d = Math.hypot(dx, dy) || 1;
          const s = 220 + Math.random() * 620;
          const life = 1 + Math.random() * 0.9;
          shards.push({
            x,
            y,
            vx: (dx / d) * s + (Math.random() - 0.5) * 160,
            vy: (dy / d) * s * 0.85 + (Math.random() - 0.5) * 160,
            rot: Math.random() * TAU,
            vr: (Math.random() - 0.5) * 7,
            w: 8 + Math.random() * 26,
            h: 5 + Math.random() * 16,
            life,
            max: life,
            c: Math.random() < 0.55 ? 'cyan' : 'white',
          });
        }
      });
      ring = 0;
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const { reduced: still, small: tiny } = live.current;
      const accent = hexRgb(live.current.accent);
      const w = atmo.white;
      const bright = w > 0.5;

      // ── Anchor: the stage's centre, in section pixels and NDC ──
      // Reads first, writes after, so the loop never forces a layout.
      const hr = hero.getBoundingClientRect();
      const ar = anchorRef.current?.getBoundingClientRect();
      const wr = windowRef?.current?.getBoundingClientRect();
      let ax = W * 0.5;
      let ay = H * 0.5;
      if (ar && (ar.width || ar.height || ar.left || ar.top)) {
        ax = ar.left + ar.width / 2 - hr.left;
        ay = ar.top + ar.height / 2 - hr.top;
      }
      atmo.ax = ax;
      atmo.ay = ay;
      atmo.ndcX = (ax / Math.max(1, W)) * 2 - 1;
      atmo.ndcY = -((ay / Math.max(1, H)) * 2 - 1);
      atmo.anchored = true;
      atmo.logoScale = tiny ? 0.72 : 1;
      // Dust gathers into the code window while it forms, else the centre.
      const gx = wr && wr.width ? wr.left + wr.width / 2 - hr.left : ax;
      const gy = wr && wr.height ? wr.top + wr.height / 2 - hr.top : ay;

      if (Math.abs(w - lastWhite) > 0.002) {
        hero.style.setProperty('--white', w.toFixed(3));
        lastWhite = w;
      }

      const hv = atmo.hover;
      hv.a += ((hv.target ?? 0) - hv.a) * Math.min(1, dt * 6);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // Additive light on the dark sky; ordinary ink on the white one, where
      // adding light to near-white would show nothing.
      ctx.globalCompositeOperation = bright ? 'source-over' : 'lighter';
      const glowK = bright ? 0.45 : 1;

      const glow = (x, y, r, c, a) => {
        a *= glowK;
        if (a <= 0.002 || r <= 0) return;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgba(c, a));
        g.addColorStop(0.45, rgba(c, a * 0.35));
        g.addColorStop(1, rgba(c, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      };

      // ── Light moving inside the storm, rarely and faintly ──
      if (!still && w < 0.6) {
        glint.age += dt;
        if (t > glint.next) {
          glint = { x: W * (0.1 + Math.random() * 0.8), y: H * (0.08 + Math.random() * 0.4), age: 0, next: t + 6 + Math.random() * 7 };
        }
        if (glint.age < 1.8) {
          const k = Math.sin((glint.age / 1.8) * Math.PI) ** 2;
          glow(glint.x, glint.y, 260, [170, 200, 255], k * 0.07 * (1 - w) * (0.7 + atmo.energy));
        }
      }

      // ── Chip hover and pick ──
      if (hv.a > 0.01) glow(hv.x, hv.y, 150, hexRgb(hv.color), hv.a * 0.1);
      const pk = atmo.pick;
      if (pk.a > 0.01) glow(pk.x, pk.y, 90 + pk.a * 110, hexRgb(pk.color), pk.a * 0.24);

      // ── The column of light the technology rises on ──
      if (atmo.beam > 0.01) {
        const bw = tiny ? 70 : 120;
        const g = ctx.createLinearGradient(0, ay - H * 0.1, 0, H);
        const c = mix3(accent, ink('white', w), 0.5);
        g.addColorStop(0, rgba(c, 0));
        g.addColorStop(0.25, rgba(c, 0.16 * atmo.beam * glowK));
        g.addColorStop(1, rgba(c, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(ax - bw * 0.25, ay);
        ctx.lineTo(ax + bw * 0.25, ay);
        ctx.lineTo(ax + bw, H);
        ctx.lineTo(ax - bw, H);
        ctx.closePath();
        ctx.fill();
        glow(ax, ay, tiny ? 120 : 190, accent, atmo.beam * 0.3);
      }

      // ── Light building at the centre: compile, then charge ──
      const centre = atmo.compile * 0.14 + atmo.charge * 0.36;
      if (centre > 0.002) {
        const rr = (tiny ? 170 : 280) * (1 + atmo.charge * 0.6);
        glow(ax, ay, rr, ink('amber', w), centre);
        glow(ax, ay, rr * 0.55, accent, centre * 0.5);
        glow(ax, ay + rr * 0.35, rr * 1.4, ink('dust', w), atmo.charge * 0.12);
      }

      // ── Energy field: tilted rings round the centre ──
      spin += (0.35 + atmo.charge * 4) * dt * (still ? 0 : 1);
      if (atmo.charge > 0.01) {
        const c = atmo.charge;
        const R0 = tiny ? 150 : 300;
        for (let k = 0; k < 3; k++) {
          const rr = R0 * (0.55 + k * 0.3) * (1 - c * 0.25);
          ctx.save();
          ctx.translate(ax, ay);
          ctx.rotate(spin * (k % 2 ? -0.5 : 0.35));
          ctx.scale(1, 0.34);
          ctx.setLineDash(k === 1 ? [10, 12] : []);
          ctx.lineWidth = 6;
          ctx.strokeStyle = rgba(ink('cyan', w), c * 0.08);
          ctx.beginPath();
          ctx.arc(0, 0, rr, 0, TAU);
          ctx.stroke();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = rgba(k === 2 ? ink('amber', w) : ink('white', w), c * (0.55 - k * 0.1));
          ctx.stroke();
          ctx.restore();
        }
        ctx.setLineDash([]);
      }

      // ── Dust ──
      const speed = still ? 0 : 1 + atmo.energy * 3.2;
      const dustC = ink('dust', w);
      const pull = atmo.converge;
      const swirl = atmo.compile + atmo.charge;
      for (const d of dust) {
        if (!still) {
          const tx = pull > 0.01 ? gx : ax;
          const ty = pull > 0.01 ? gy : ay;
          const dx = tx - d.x;
          const dy = ty - d.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (pull > 0.01) {
            d.vx += (dx / dist) * pull * 520 * dt;
            d.vy += (dy / dist) * pull * 520 * dt;
          }
          if (swirl > 0.01 && dist < 600) {
            d.vx += (-dy / dist) * swirl * 150 * dt;
            d.vy += (dx / dist) * swirl * 150 * dt;
          }
          const damp = Math.exp(-(pull > 0.01 || swirl > 0.01 ? 1.6 : 0.4) * dt);
          d.vx *= damp;
          d.vy *= damp;
          if (Math.abs(d.vy) < 2) d.vy -= 3 * dt; // the resting drift is upward
          d.x += d.vx * dt * speed;
          d.y += d.vy * dt * speed;
          if (pull > 0.2 && dist < 26) {
            // Absorbed into the window: respawn at an edge to keep the stream.
            const side = Math.random() * 4;
            d.x = side < 1 ? -5 : side < 2 ? W + 5 : Math.random() * W;
            d.y = side < 2 ? Math.random() * H : side < 3 ? -5 : H + 5;
            d.vx = 0;
            d.vy = 0;
          }
          if (d.x < -10) d.x = W + 10;
          if (d.x > W + 10) d.x = -10;
          if (d.y < -10) d.y = H + 10;
          if (d.y > H + 10) d.y = -10;
        }
        const tw = 0.65 + 0.35 * Math.sin(t * 1.7 + d.tw);
        const a = d.a * tw * (0.55 + atmo.energy * 0.6) * (bright ? 0.7 : 1);
        const r = d.r * (1 + w * 0.3);
        if (speed > 2.2 && !still) {
          // Fast dust streaks along its velocity.
          ctx.strokeStyle = rgba(dustC, a);
          ctx.lineWidth = r;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.vx * 0.04, d.y - d.vy * 0.04);
          ctx.stroke();
        } else {
          ctx.fillStyle = rgba(dustC, a);
          ctx.fillRect(d.x - r / 2, d.y - r / 2, r, r);
        }
      }

      // ── Burst ──
      if (atmo.burst > 0 && !spawned) {
        spawned = true;
        if (!still) spawnBurst(ax, ay, hr);
      }
      if (atmo.burst === 0) spawned = false;

      if (ring >= 0) {
        ring += dt;
        const rr = ring * (tiny ? 900 : 1500);
        const a = Math.max(0, 1 - ring / 0.9);
        if (a > 0) {
          ctx.save();
          ctx.translate(ax, ay);
          ctx.scale(1, 0.62);
          ctx.lineWidth = 18;
          ctx.strokeStyle = rgba(ink('cyan', w), a * 0.12);
          ctx.beginPath();
          ctx.arc(0, 0, rr, 0, TAU);
          ctx.stroke();
          ctx.lineWidth = 2;
          ctx.strokeStyle = rgba(ink('white', w), a * 0.7);
          ctx.stroke();
          ctx.restore();
        } else {
          ring = -1;
        }
      }

      if (atmo.shock > 0.01) {
        const s = atmo.shock;
        // Radial light: long thin wedges turning slowly.
        const far = Math.hypot(W, H);
        for (let k = 0; k < 12; k++) {
          const a0 = (k / 12) * TAU + t * 0.15;
          const spread = 0.012 + (k % 3) * 0.008;
          const g = ctx.createRadialGradient(ax, ay, 0, ax, ay, far * 0.7);
          g.addColorStop(0, rgba(k % 4 === 0 ? ink('amber', w) : ink('white', w), s * 0.14 * glowK));
          g.addColorStop(1, rgba(ink('white', w), 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax + Math.cos(a0 - spread) * far, ay + Math.sin(a0 - spread) * far);
          ctx.lineTo(ax + Math.cos(a0 + spread) * far, ay + Math.sin(a0 + spread) * far);
          ctx.closePath();
          ctx.fill();
        }
        // The flash is light on either sky.
        ctx.globalCompositeOperation = 'lighter';
        glow(ax, ay, (tiny ? 260 : 460) * (1 + (1 - s) * 0.8), [255, 255, 255], s * (bright ? 1.2 : 0.6));
        ctx.globalCompositeOperation = bright ? 'source-over' : 'lighter';
      }

      if (sparks.length) {
        const drag = Math.exp(-2.1 * dt);
        let alive = 0;
        for (const p of sparks) {
          if (p.life <= 0) continue;
          alive += 1;
          p.life -= dt;
          p.vx *= drag;
          p.vy = p.vy * drag + 30 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          const a = (p.life / p.max) ** 1.4;
          ctx.strokeStyle = rgba(p.c === 'accent' ? accent : ink(p.c, w), a);
          ctx.lineWidth = p.w;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05);
          ctx.stroke();
        }
        if (!alive) sparks = [];
      }
      if (shards.length) {
        const drag = Math.exp(-1.5 * dt);
        let alive = 0;
        for (const p of shards) {
          if (p.life <= 0) continue;
          alive += 1;
          p.life -= dt;
          p.vx *= drag;
          p.vy = p.vy * drag + 22 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          const a = (p.life / p.max) ** 1.2;
          const c = ink(p.c, w);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = bright ? rgba([20, 28, 40], a * 0.55) : rgba(c, a * 0.12);
          ctx.strokeStyle = rgba(c, a * 0.85);
          ctx.lineWidth = 1;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
          // A line of "content" on some fragments: they were UI a moment ago.
          if (p.w > 18) {
            ctx.fillStyle = rgba(c, a * 0.5);
            ctx.fillRect(-p.w / 2 + 3, -1, p.w * 0.55, 1.5);
          }
          ctx.restore();
        }
        if (!alive) shards = [];
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      dust = [];
    };
  }, [onScreen, heroRef, anchorRef, windowRef]);

  return (
    <div className="sky-fx" aria-hidden="true">
      <canvas className="sky-fx-canvas" ref={canvasRef} />
    </div>
  );
}
