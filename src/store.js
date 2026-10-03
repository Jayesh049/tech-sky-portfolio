import { create } from 'zustand';
import { techs } from './data/techs.js';

// THE SKILLS SKY STATE MACHINE.
//
//   IDLE
//   -> TECH_SELECTED -> TECH_RISE -> CODE_REVEAL -> LIVE_BUILD -> COMPILING
//   -> BUILD_COMPLETE -> ENERGY_BUILD -> BURST -> CLOUD_TRANSITION
//   -> WHITE_CLOUD -> EXPERTISE -> READY_FOR_NEXT ... -> FINAL_STATE
//
// TECH_SELECTED to WHITE_CLOUD are driven by the GSAP timeline in
// sequence/timeline.js, which calls setPhase at each beat and finish() at the
// end. EXPERTISE, READY_FOR_NEXT and FINAL_STATE are resting states the
// visitor moves between with buttons, so they belong to the store.
//
// `sky` is separate from `phase`: it turns white at the end of every build
// and goes back to the storm when the visitor leaves the expertise panel (or
// replays), so each build clears the sky again.
export const PHASES = [
  'IDLE',
  'TECH_SELECTED',
  'TECH_RISE',
  'CODE_REVEAL',
  'LIVE_BUILD',
  'COMPILING',
  'BUILD_COMPLETE',
  'ENERGY_BUILD',
  'BURST',
  'CLOUD_TRANSITION',
  'WHITE_CLOUD',
  'EXPERTISE',
  'READY_FOR_NEXT',
  'FINAL_STATE',
];

// The phases a running timeline owns. While in one, the picker is locked.
export const RUNNING = new Set(PHASES.slice(1, 11));

export const useStore = create((set, get) => ({
  phase: 'IDLE',
  activeId: null,
  landed: [],
  sky: 'storm', // 'clear' from the end of a build until the visitor moves on
  firstDone: false,
  skipped: false,

  setPhase: (phase) => set({ phase }),
  setSky: (sky) => set({ sky }),

  isBusy: () => RUNNING.has(get().phase),

  start: (id) => {
    if (RUNNING.has(get().phase)) return false;
    set({ activeId: id });
    return true;
  },

  // The timeline has played out: the clouds are white, the expertise is up.
  finish: () => {
    const { activeId, landed } = get();
    if (!activeId) return;
    set({
      landed: landed.includes(activeId) ? landed : [...landed, activeId],
      phase: 'EXPERTISE',
      sky: 'clear',
      firstDone: true,
    });
  },

  // Leave the expertise panel: back to the selector, or to the summary once
  // every technology has been built.
  next: () => {
    const all = get().landed.length >= techs.length;
    set({ phase: all ? 'FINAL_STATE' : 'READY_FOR_NEXT', activeId: null });
  },

  // Clear the counter and go again. Hero.jsx brings the storm back.
  restart: () => set({ landed: [], activeId: null, phase: 'READY_FOR_NEXT', skipped: false }),

  // For visitors with four minutes. Jumps to the finished state.
  skipAll: () =>
    set({
      landed: techs.map((t) => t.id),
      activeId: null,
      phase: 'FINAL_STATE',
      sky: 'clear',
      firstDone: true,
      skipped: true,
    }),

  reset: () =>
    set({
      landed: [],
      activeId: null,
      phase: 'IDLE',
      sky: 'storm',
      firstDone: false,
      skipped: false,
    }),
}));

export const allLanded = (landed) => landed.length >= techs.length;
