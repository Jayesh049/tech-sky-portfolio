import gsap from 'gsap';
import { atmo, logo, cam, sky, resetLogo, BLOOM_REST, BLOOM_PEAK } from '../scene/state.js';

// THE SKILLS SKY SEQUENCE.
//
// One GSAP timeline per pick, assembled from the phase table below. Each
// phase owns its duration and a small function that places its own tweens;
// buildSequence only walks the table and calls setPhase at each boundary.
// Nothing here touches the DOM or React: the tweens move plain objects in
// scene/state.js (atmo, logo, cam, sky), which the WebGL scene and the
// effects canvas read every frame. The DOM panels follow `phase`.

export const DUR = {
  STORM_RETURN: 1.4, // only when a pick starts under white clouds (a replay)
  TECH_SELECTED: 0.8,
  TECH_RISE: 1.5,
  CODE_REVEAL: 2.4,
  LIVE_BUILD: 3.4,
  COMPILING: 2.4,
  BUILD_COMPLETE: 2.0,
  ENERGY_BUILD: 1.6,
  BURST: 1.0,
  CLOUD_TRANSITION: 3.4,
  WHITE_CLOUD: 0.6,
};

// After the first build the reading beats trim a little. The sky does not:
// it goes back to the storm between builds, so every build clears it again.
const REPEAT = {
  CODE_REVEAL: 1.9,
  LIVE_BUILD: 2.9,
  COMPILING: 1.9,
  BUILD_COMPLETE: 1.6,
};

export function phaseDuration(phase, repeat = false) {
  return (repeat && REPEAT[phase]) || DUR[phase] || 0;
}

// ── The phases, in order ────────────────────────────────────────────────────
// run(tl, at, d, ctx): add this phase's tweens starting at `at`, lasting `d`.

const PHASE_TABLE = [
  {
    name: 'TECH_SELECTED',
    // Under white clouds (a replay straight from the expertise panel), the
    // storm comes back first.
    duration: (ctx) => DUR.TECH_SELECTED + (ctx.fromClear ? DUR.STORM_RETURN : 0),
    run(tl, at, d, ctx) {
      if (ctx.fromClear) {
        tl.to(atmo, { white: 0, duration: DUR.STORM_RETURN, ease: 'sine.inOut' }, at);
        tl.call(() => ctx.setSky?.('storm'), null, at + DUR.STORM_RETURN * 0.5);
      }
      // The clouds notice: a little more drift, light gathering at the chip.
      tl.to(atmo, { energy: 0.3, duration: d, ease: 'power1.out' }, at)
        .fromTo(atmo.pick, { a: 0 }, { a: 1, duration: d * 0.6, ease: 'power2.out' }, at)
        .to(atmo.pick, { a: 0, duration: d * 0.6 }, at + d * 0.6)
        .to(sky, { drift: 1.6, duration: d }, at)
        .to(cam, { orbit: 0.4, duration: d }, at);
    },
  },
  {
    name: 'TECH_RISE',
    run(tl, at, d) {
      // The technology climbs out of the clouds and becomes the focus.
      tl.set(logo, { fade: 1, boost: 0 }, at)
        .fromTo(logo, { scale: 0, y: -4 }, { scale: 1, y: 0, duration: d * 0.85, ease: 'back.out(1.5)' }, at)
        .fromTo(atmo, { beam: 0 }, { beam: 1, duration: d * 0.5, ease: 'power2.out' }, at)
        .to(sky, { bloom: BLOOM_PEAK, duration: d * 0.3, ease: 'power2.out' }, at + d * 0.4)
        .to(sky, { bloom: BLOOM_REST, duration: d * 0.6 }, at + d * 0.7)
        .to(atmo, { energy: 0.4, duration: d }, at);
    },
  },
  {
    name: 'CODE_REVEAL',
    run(tl, at, d) {
      // The mark lifts above the work and the code forms under it. Dust is
      // drawn into the window as it materialises.
      tl.to(logo, { y: 3.1, scale: 0.46, duration: d * 0.45, ease: 'power2.inOut' }, at)
        .to(atmo, { beam: 0.35, duration: d * 0.45 }, at)
        .fromTo(atmo, { converge: 0 }, { converge: 1, duration: d * 0.3, ease: 'power2.out' }, at)
        .to(atmo, { converge: 0, duration: d * 0.4, ease: 'power1.in' }, at + d * 0.5);
    },
  },
  {
    name: 'LIVE_BUILD',
    run(tl, at, d) {
      tl.fromTo(atmo, { build: 0 }, { build: 1, duration: d, ease: 'none' }, at)
        .to(atmo, { energy: 0.5, duration: d }, at);
    },
  },
  {
    name: 'COMPILING',
    run(tl, at, d) {
      // Light and particle speed climb with the progress bar.
      tl.fromTo(atmo, { compile: 0 }, { compile: 1, duration: d, ease: 'none' }, at)
        .to(atmo, { energy: 0.62, duration: d, ease: 'power1.in' }, at)
        .to(sky, { drift: 2.2, duration: d }, at);
    },
  },
  {
    name: 'BUILD_COMPLETE',
    run(tl, at, d) {
      tl.to(atmo, { energy: 0.68, duration: d }, at).to(atmo, { compile: 0.6, duration: d }, at);
    },
  },
  {
    name: 'ENERGY_BUILD',
    run(tl, at, d) {
      // Code, system and mark converge on the centre. Accelerating eases
      // only, so it reads as pressure rather than a loop.
      tl.to(logo, { y: 0, scale: 1.15, duration: d * 0.6, ease: 'power2.inOut' }, at)
        .to(logo, { boost: 8, duration: d, ease: 'power2.in' }, at)
        .fromTo(atmo, { charge: 0 }, { charge: 1, duration: d, ease: 'power2.in' }, at)
        .to(atmo, { energy: 1, compile: 0, beam: 0, duration: d, ease: 'power2.in' }, at)
        .to(atmo, { shake: 0.35, duration: d, ease: 'power3.in' }, at)
        .to(sky, { bloom: BLOOM_PEAK, drift: 3.2, duration: d, ease: 'power2.in' }, at);
    },
  },
  {
    name: 'BURST',
    run(tl, at, d) {
      tl.set(atmo, { shock: 1, shake: 1, charge: 0 }, at)
        .fromTo(atmo, { burst: 0 }, { burst: 1, duration: d, ease: 'power1.out' }, at)
        .to(atmo, { shock: 0, duration: d * 1.8, ease: 'expo.out' }, at + 0.05)
        .to(atmo, { shake: 0, duration: d * 0.9, ease: 'power3.out' }, at + 0.05)
        .to(atmo, { energy: 0.4, duration: d, ease: 'power2.out' }, at)
        .to(logo, { scale: 1.8, fade: 0, duration: d * 0.45, ease: 'power2.out' }, at)
        .to(sky, { bloom: BLOOM_REST, drift: 1.2, duration: d, ease: 'power2.out' }, at);
    },
  },
  {
    name: 'CLOUD_TRANSITION',
    run(tl, at, d) {
      // The storm clears: black, charcoal, blue-grey, soft grey, white. One
      // continuous value, never a swap.
      tl.to(atmo, { white: 1, duration: d, ease: 'sine.inOut' }, at)
        .to(atmo, { energy: 0.12, duration: d }, at)
        .to(sky, { drift: 0.4, duration: d, ease: 'power2.out' }, at)
        .to(cam, { orbit: 1, duration: d }, at);
    },
  },
  {
    name: 'WHITE_CLOUD',
    run(tl, at, d) {
      tl.set(atmo, { burst: 0 }, at + d);
    },
  },
];

export const TIMELINE_PHASES = PHASE_TABLE.map((p) => p.name);

/**
 * One timeline per pick.
 *
 *  repeat    - a technology has been built before: the reading beats trim
 *  fromClear - the clouds are white (a replay), so the storm returns first
 *  reduced - prefers-reduced-motion: the same beats and content in order,
 *            quicker, with no shake and no travel
 */
export function buildSequence({ repeat = false, fromClear = false, reduced = false, setPhase, setSky, onComplete, onUpdate }) {
  resetLogo();

  const tl = gsap.timeline({ onComplete, onUpdate, paused: true });
  const ctx = { repeat, fromClear, reduced, setSky };
  let t = 0;

  for (const phase of PHASE_TABLE) {
    const d = phase.duration ? phase.duration(ctx) : phaseDuration(phase.name, repeat);
    const at = t;
    tl.call(() => setPhase(phase.name), null, at);
    phase.run(tl, at, d, ctx);
    t += d;
  }

  if (reduced) {
    // Motion that exists only to be felt is removed; fades stay.
    tl.eventCallback('onUpdate', () => {
      atmo.shake = 0;
      onUpdate?.();
    });
    tl.timeScale(2);
  }

  // Holds the timeline open to its full length even when the last beat has
  // no tween of its own.
  tl.to({}, { duration: t }, 0);
  return tl;
}

export const sequenceLength = (repeat) =>
  PHASE_TABLE.reduce((s, p) => s + phaseDuration(p.name, repeat), 0);
