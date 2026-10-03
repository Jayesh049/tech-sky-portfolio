// The page peel: the portfolio layer behaves like a physical sheet. Grab its
// bottom-right corner and it lifts, folds and follows the pointer; let go far
// enough (or fling it) and it peels away, revealing the introduction beneath.
// Once peeled, the sheet's corner waits folded at the top-left; tap it and
// the page is laid back down.
//
// How the fold works. A corner C dragged to a point P folds the sheet along
// the perpendicular bisector of CP. Everything on C's side of that line is
// lifted: it is clipped off the sheet, and its mirror image across the line
// is the flap — the back of the page — lying on top. So per frame this is
// three clip-path polygons and two gradients; no canvas, no copy of the DOM,
// and the live page (video, links) keeps working right up to the fold.
//
//   sheet  the page itself, clipped to what's still lying flat
//   flap   the lifted part's back, shaded like a curl: crease, highlight, falloff
//   shade  the shadow the lifted part casts on what's beneath
//
// Framework-agnostic. Pointer events cover mouse, touch and pen; the handle
// and the return corner are real buttons, so Enter/Space work too.

// ── Tuning ───────────────────────────────────────────────────────────────────
export const PEEL = {
  hint: 46, //          px: the resting fold at the corner
  hintHover: 84, //     px: how far it lifts when you point at it
  follow: 55, //        ms: time constant of the page catching up with the pointer
  complete: 0.3, //     fraction of the page's diagonal: release past this and it goes
  fling: 0.9, //        px/ms toward the upper-left: a flick this fast goes too
  outMs: 720, //        auto-complete
  backMs: 460, //       spring back when released too early
  restoreMs: 950, //    laying the page back down
  dogEar: 64, //        px: the folded corner left at the top-left once peeled
};

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const easeOutQuart = (t) => 1 - (1 - t) ** 4;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// One pass of Sutherland–Hodgman: keep the part of `poly` where side(X) <= 0.
function clipHalf(poly, side) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const sa = side(a);
    const sb = side(b);
    if (sa <= 0) out.push(a);
    if ((sa < 0 && sb > 0) || (sa > 0 && sb < 0)) {
      const k = sa / (sa - sb);
      out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    }
  }
  return out;
}

const toPolygon = (pts) =>
  pts.length < 3 ? "polygon(0 0, 0 0, 0 0)" : `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(", ")})`;

/**
 * @param {object} o
 * @param {HTMLElement} o.stage    positioned wrapper; the sheet fills it exactly
 * @param {HTMLElement} o.sheet    the page that peels
 * @param {HTMLElement} o.flap     back-of-page layer, above the sheet
 * @param {HTMLElement} o.shade    cast-shadow layer, between the underlay and the sheet
 * @param {HTMLElement} o.handle   bottom-right grab target (a button)
 * @param {HTMLElement} [o.back]   top-left return target (a button)
 * @param {boolean} [o.reduced]    reduced motion: fades instead of sweeps
 * @param {(state:string)=>void} [o.onState]
 *   "idle" → "ready" → "peeling" → ("ready" | "completing") → "peeled" → "restoring" → "ready"
 */
export function createPagePeel(o) {
  const { stage, sheet, flap, shade, handle, back } = o;
  const reduced = Boolean(o.reduced);
  const onState = o.onState ?? (() => {});

  let W = 0;
  let H = 0;
  let P = [0, 0]; // where the corner is now
  let T = [0, 0]; // where the pointer wants it
  let state = "idle";
  let raf = 0;
  let last = 0;
  let tween = null; // { from, to, t0, dur, ease, done }
  let dragging = false;
  let grab = [0, 0];
  let samples = [];
  let hover = false;
  let sheetHidden = false;

  const C = () => [W, H];

  function measure() {
    const r = stage.getBoundingClientRect();
    W = r.width;
    H = r.height;
  }

  function set(s) {
    if (s === state) return;
    state = s;
    stage.dataset.peel = s;
    onState(s);
  }

  function hideSheet(h) {
    sheetHidden = h;
    sheet.style.visibility = h ? "hidden" : "";
    if (h) sheet.setAttribute("inert", "");
    else sheet.removeAttribute("inert");
  }

  // ── Geometry → styles ──────────────────────────────────────────────────────
  function render() {
    const [cx, cy] = C();
    const dx = cx - P[0];
    const dy = cy - P[1];
    const len = Math.hypot(dx, dy);
    if (len < 0.5) {
      sheet.style.clipPath = "";
      flap.style.visibility = "hidden";
      shade.style.visibility = "hidden";
      return;
    }
    const n = [dx / len, dy / len]; // toward the corner
    const M = [(cx + P[0]) / 2, (cy + P[1]) / 2];
    const side = (X) => (X[0] - M[0]) * n[0] + (X[1] - M[1]) * n[1];
    const rect = [
      [0, 0],
      [W, 0],
      [W, H],
      [0, H],
    ];
    const D = len / 2; // fold → tip of the flap

    // A real page doesn't crease in a straight line while it's being lifted:
    // it rolls. Bow the fold toward the corner, and pull the flap's free
    // edges in a little, so the lifted part reads as a curl, not a triangle.
    const keep = clipHalf(rect, side);
    const liftedFlat = clipHalf(rect, (X) => -side(X));
    const onFold = (X) => Math.abs(side(X)) < 0.5;
    const crease = (A, B) => {
      const ab = Math.hypot(B[0] - A[0], B[1] - A[1]);
      const bow = Math.min(D * 0.14, ab * 0.1);
      const pts = [];
      for (let k = 1; k < 16; k++) {
        const t = k / 16;
        const b = bow * Math.sin(Math.PI * t);
        pts.push([A[0] + (B[0] - A[0]) * t + n[0] * b, A[1] + (B[1] - A[1]) * t + n[1] * b, true]);
      }
      return pts;
    };
    // Splice the bowed crease into a polygon in place of its straight fold edge.
    const withCrease = (poly) => {
      for (let i = 0; i < poly.length; i++) {
        const A = poly[i];
        const B = poly[(i + 1) % poly.length];
        if (onFold(A) && onFold(B) && Math.hypot(B[0] - A[0], B[1] - A[1]) > 1) {
          return [...poly.slice(0, i + 1), ...crease(A, B), ...poly.slice(i + 1)];
        }
      }
      return poly;
    };
    const lifted = withCrease(liftedFlat);
    const reflect = (X) => {
      if (X[2] || onFold(X)) return [X[0], X[1], true]; // the crease stays where it is
      const d = 2 * side(X);
      return [X[0] - d * n[0], X[1] - d * n[1]];
    };
    const flapRaw = lifted.map(reflect);
    // Free edges (both ends off the crease) sag inward toward the flap's middle.
    const cx0 = flapRaw.reduce((a, X) => a + X[0], 0) / (flapRaw.length || 1);
    const cy0 = flapRaw.reduce((a, X) => a + X[1], 0) / (flapRaw.length || 1);
    const flapPoly = [];
    flapRaw.forEach((A, i) => {
      flapPoly.push(A);
      const B = flapRaw[(i + 1) % flapRaw.length];
      if (A[2] && B[2]) return;
      const mx = (A[0] + B[0]) / 2;
      const my = (A[1] + B[1]) / 2;
      const el = Math.hypot(B[0] - A[0], B[1] - A[1]);
      const tl = Math.hypot(cx0 - mx, cy0 - my) || 1;
      const sag = Math.min(el * 0.045, tl * 0.5);
      for (let k = 1; k < 10; k++) {
        const t = k / 10;
        const b = sag * Math.sin(Math.PI * t);
        flapPoly.push([A[0] + (B[0] - A[0]) * t + ((cx0 - mx) / tl) * b, A[1] + (B[1] - A[1]) * t + ((cy0 - my) / tl) * b]);
      }
    });

    if (!sheetHidden) sheet.style.clipPath = toPolygon(withCrease(keep));
    flap.style.visibility = "visible";
    shade.style.visibility = "visible";
    flap.style.clipPath = toPolygon(flapPoly);
    shade.style.clipPath = toPolygon(lifted);

    // Gradients in CSS angle space: 0deg points up, 90deg right.
    const cen = [W / 2, H / 2];
    const grad = (dir) => {
      const ang = Math.atan2(dir[0], -dir[1]);
      const L = Math.abs(W * Math.sin(ang)) + Math.abs(H * Math.cos(ang));
      const s0 = (M[0] - cen[0]) * dir[0] + (M[1] - cen[1]) * dir[1] + L / 2;
      return { deg: (ang * 180) / Math.PI, s0 };
    };

    // The back of the page, lit like a curl: a shaded crease, a bright band
    // just off it, a long falloff, and a little light again at the edge.
    const f = grad([-n[0], -n[1]]);
    const at = (k) => `${(f.s0 + k * D).toFixed(1)}px`;
    flap.style.backgroundImage =
      `linear-gradient(${f.deg.toFixed(2)}deg,` +
      ` #6f6e6b ${at(0)}, #b9b8b4 ${at(0.035)}, #f4f3ef ${at(0.1)}, #e2e1dd ${at(0.26)},` +
      ` #a8a7a3 ${at(0.66)}, #8f8e8a ${at(0.9)}, #c4c3bf ${at(1)})`;

    // The shadow the lifted page throws on what's underneath: darkest at the
    // fold, wider the higher it's lifted.
    const g = grad(n);
    const spread = clamp(D * 0.55, 18, 150);
    const a = clamp(0.35 + D / 900, 0.35, 0.62);
    shade.style.backgroundImage =
      `linear-gradient(${g.deg.toFixed(2)}deg, rgb(0 0 0 / ${a.toFixed(2)}) ${g.s0.toFixed(1)}px,` +
      ` rgb(0 0 0 / 0) ${(g.s0 + spread).toFixed(1)}px)`;
  }

  // ── Named positions ────────────────────────────────────────────────────────
  const hintAt = (h) => [W - h, H - h * 0.86];
  const restPoint = () => hintAt(hover ? PEEL.hintHover : PEEL.hint * (W < 600 ? 0.8 : 1));

  // Far enough along the drag's own direction that the fold has passed the
  // farthest corner of the page: nothing left lying flat.
  function offPoint() {
    const [cx, cy] = C();
    let dx = cx - P[0];
    let dy = cy - P[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    // Keep it heading up and to the left, whatever the release angle.
    if (dx < 0.25) dx = 0.25;
    if (dy < 0.25) dy = 0.25;
    const l2 = Math.hypot(dx, dy);
    dx /= l2;
    dy /= l2;
    const far = Math.max(...[[0, 0], [W, 0], [0, H]].map(([x, y]) => (cx - x) * dx + (cy - y) * dy));
    const k = 2 * (far + 60);
    return [cx - dx * k, cy - dy * k];
  }

  // Once peeled, the page waits folded at the top-left: the fold line is
  // x + y = s, so the flap is exactly the small triangle in that corner.
  const dogEarPoint = (s = PEEL.dogEar) => [s - H, s - W];
  const diagonalOff = () => dogEarPoint(-60);

  // ── Loop ───────────────────────────────────────────────────────────────────
  function loop(now) {
    const dt = last ? Math.min(now - last, 50) : 16.7;
    last = now;
    if (tween) {
      const u = clamp((now - tween.t0) / tween.dur, 0, 1);
      const e = tween.ease(u);
      P = [tween.from[0] + (tween.to[0] - tween.from[0]) * e, tween.from[1] + (tween.to[1] - tween.from[1]) * e];
      render();
      if (u >= 1) {
        const done = tween.done;
        tween = null;
        done?.();
      }
    } else if (dragging) {
      const k = 1 - Math.exp(-dt / PEEL.follow);
      P = [P[0] + (T[0] - P[0]) * k, P[1] + (T[1] - P[1]) * k];
      render();
    }
    if (tween || dragging) raf = requestAnimationFrame(loop);
    else {
      raf = 0;
      last = 0;
    }
  }
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  function animate(to, dur, ease, done) {
    tween = { from: P.slice(), to, t0: performance.now(), dur, ease, done };
    kick();
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  /** Show the folded corner. Call once the portfolio layer is interactive. */
  function arm() {
    measure();
    hideSheet(false);
    set("ready");
    if (reduced) {
      P = restPoint();
      render();
      return;
    }
    // Lift a little past the rest fold, then settle: enough to catch the eye.
    P = C();
    animate(hintAt(PEEL.hint * 1.9), 520, easeOutCubic, () => animate(restPoint(), 620, easeInOutCubic));
  }

  function finishPeel() {
    hideSheet(true);
    sheet.style.opacity = "";
    flap.style.opacity = "";
    shade.style.opacity = "";
    set("peeled");
    if (!back) {
      P = diagonalOff();
      render();
      return;
    }
    // The page's corner comes back into view, folded, at the top-left.
    P = diagonalOff();
    render();
    if (reduced) {
      P = dogEarPoint();
      render();
    } else {
      window.setTimeout(() => {
        if (state === "peeled") animate(dogEarPoint(), 620, easeOutCubic);
      }, 350);
    }
  }

  /** Peel the page away (used by release, keyboard and programmatic calls). */
  function peel() {
    if (state === "peeled" || state === "completing" || state === "restoring") return;
    measure();
    set("completing");
    if (reduced) {
      // Simplified: the page fades rather than sweeps.
      tween = null;
      for (const el of [sheet, flap, shade]) {
        el.style.transition = "opacity 320ms linear";
        el.style.opacity = "0";
      }
      window.setTimeout(() => {
        for (const el of [sheet, flap, shade]) el.style.transition = "";
        finishPeel();
      }, 330);
      return;
    }
    const fromRest = Math.hypot(W - P[0], H - P[1]) < PEEL.hintHover * 1.6;
    animate(offPoint(), PEEL.outMs, fromRest ? easeInOutCubic : easeOutCubic, finishPeel);
  }

  /** Lay the page back down over the introduction. */
  function restore() {
    if (state !== "peeled") return;
    measure();
    set("restoring");
    hideSheet(false);
    if (reduced) {
      P = C();
      render();
      sheet.style.opacity = "0";
      sheet.style.transition = "opacity 320ms linear";
      requestAnimationFrame(() => {
        sheet.style.opacity = "1";
      });
      window.setTimeout(() => {
        sheet.style.transition = "";
        sheet.style.opacity = "";
        arm();
      }, 340);
      return;
    }
    if (Math.hypot(P[0] - dogEarPoint()[0], P[1] - dogEarPoint()[1]) > 1) P = dogEarPoint();
    animate(C(), PEEL.restoreMs, easeInOutCubic, () => {
      P = C();
      render();
      arm();
    });
  }

  // ── Pointer ────────────────────────────────────────────────────────────────
  const local = (e) => {
    const r = stage.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  function onDown(e) {
    if (state !== "ready") return;
    if (e.button !== undefined && e.button !== 0) return;
    measure();
    tween = null;
    dragging = true;
    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic or already-released pointer: moves still arrive while over the handle.
    }
    const p = local(e);
    grab = [P[0] - p[0], P[1] - p[1]];
    T = P.slice();
    samples = [[performance.now(), p[0], p[1]]];
    set("peeling");
    kick();
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging) {
      return;
    }
    const p = local(e);
    // The corner can't come back past itself, and can't leave the page too far.
    T = [clamp(p[0] + grab[0], -W * 0.25, W - 1), clamp(p[1] + grab[1], -H * 0.25, H - 1)];
    const now = performance.now();
    samples.push([now, p[0], p[1]]);
    while (samples.length > 2 && now - samples[0][0] > 90) samples.shift();
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    const [t0, x0, y0] = samples[0];
    const [t1, x1, y1] = samples[samples.length - 1];
    const dtm = Math.max(1, t1 - t0);
    // Speed toward the upper-left.
    const v = (x0 - x1 + (y0 - y1)) / Math.SQRT2 / dtm;
    const progress = Math.hypot(W - T[0], H - T[1]) / Math.hypot(W, H);
    if (progress > PEEL.complete || (v > PEEL.fling && progress > 0.06)) peel();
    else {
      set("ready");
      animate(restPoint(), PEEL.backMs, easeOutQuart);
    }
  }

  function onEnter() {
    hover = true;
    if (state === "ready" && !reduced) animate(restPoint(), 360, easeOutCubic);
  }
  function onLeave() {
    hover = false;
    if (state === "ready" && !reduced) animate(restPoint(), 420, easeOutCubic);
  }

  function onKey(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (state === "ready") peel();
    }
  }
  function onBack(e) {
    e.preventDefault();
    restore();
  }

  handle.addEventListener("pointerdown", onDown);
  handle.addEventListener("pointermove", onMove);
  handle.addEventListener("pointerup", onUp);
  handle.addEventListener("pointercancel", onUp);
  handle.addEventListener("lostpointercapture", onUp);
  handle.addEventListener("pointerenter", onEnter);
  handle.addEventListener("pointerleave", onLeave);
  handle.addEventListener("keydown", onKey);
  back?.addEventListener("click", onBack);

  const onResize = () => {
    measure();
    if (state === "ready") P = restPoint();
    else if (state === "peeled") P = dogEarPoint();
    else return;
    render();
  };
  window.addEventListener("resize", onResize);

  measure();
  P = C();
  render();
  set("idle");

  return {
    arm,
    peel,
    restore,
    get state() {
      return state;
    },
    destroy() {
      cancelAnimationFrame(raf);
      handle.removeEventListener("pointerdown", onDown);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      handle.removeEventListener("lostpointercapture", onUp);
      handle.removeEventListener("pointerenter", onEnter);
      handle.removeEventListener("pointerleave", onLeave);
      handle.removeEventListener("keydown", onKey);
      back?.removeEventListener("click", onBack);
      window.removeEventListener("resize", onResize);
      hideSheet(false);
      sheet.style.clipPath = "";
    },
  };
}
