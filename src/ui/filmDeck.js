// Drag-to-dismiss for the film deck: grab the top card, throw it sideways, and
// the next one rises into place.
//
// Framework-agnostic on purpose, and shaped like src/ui/pagePeel.js -- same
// tuning-object-then-factory layout, same pointer-capture-in-a-try, same
// velocity sample window, same five listeners, same destroy(). The two gestures
// on this page should feel like one hand, and matching the numbers is most of
// how that happens.
//
// It owns exactly five things on the card: --x, --y, --r, --o and data-state.
// Nothing else. React owns --d, data-top, inert, tabIndex and every label, and
// never writes the five above through a style prop -- React's style diff walks
// only the keys it knows, so these imperative writes survive every re-render.

export const DECK = {
  sample: 90, //    ms of pointer history kept for the throw estimate
  minDrag: 6, //    px before a press counts as a drag rather than a tap
  complete: 0.28, // fraction of the card's width: release past this and it goes
  fling: 0.55, //   px/ms sideways: a flick this fast goes too
  tilt: 9, //       deg of rotation at a full card-width of drag
  lift: 0.22, //    how much of the sideways drag is echoed as lift
  fade: 0.9, //     how fast opacity falls off with |x| / width
};

const TOP = '.fs-card[data-top="true"]';

/**
 * @param {object} o
 * @param {HTMLElement} o.stack   the grid the cards share; listeners live here
 * @param {() => boolean} o.canDrag  false while the deck is finished
 * @param {(dir:number) => void} o.onDismiss  called once the throw is committed
 */
export function createFilmDeck(o) {
  const stack = o.stack;
  const canDrag = o.canDrag || (() => true);
  const onDismiss = o.onDismiss || (() => {});

  let card = null;
  let drag = false;
  let armed = false;
  let x0 = 0;
  let tx = 0;
  let raf = 0;
  let samples = [];

  const paint = () => {
    raf = 0;
    if (!card) return;
    const w = card.getBoundingClientRect().width || 1;
    const k = tx / w;
    card.style.setProperty('--x', `${tx.toFixed(1)}px`);
    // the lift is symmetric: throwing either way raises the card off the stack
    card.style.setProperty('--y', `${(-Math.abs(tx) * DECK.lift).toFixed(1)}px`);
    card.style.setProperty('--r', `${(k * DECK.tilt).toFixed(2)}deg`);
    card.style.setProperty('--o', Math.max(0, 1 - Math.abs(k) * DECK.fade).toFixed(3));
  };

  const clear = () => {
    if (!card) return;
    card.style.removeProperty('--x');
    card.style.removeProperty('--y');
    card.style.removeProperty('--r');
    card.style.removeProperty('--o');
  };

  function onDown(e) {
    if (!canDrag()) return;
    if (e.button !== undefined && e.button !== 0) return;
    // Resolved per gesture rather than bound per card: the card under the
    // pointer changes every step, and re-binding listeners would be a leak.
    const hit = e.target.closest ? e.target.closest(TOP) : null;
    if (!hit) return;

    card = hit;
    drag = true;
    armed = false;
    x0 = e.clientX;
    tx = 0;
    samples = [[performance.now(), e.clientX]];
    try {
      // Captured on the STACK, never the card: the card goes visibility:hidden
      // mid-gesture, and a capture target that disappears is exactly what
      // lostpointercapture exists for.
      stack.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic or already-released pointer: moves still arrive over the stack.
    }
  }

  function onMove(e) {
    if (!drag) return;
    tx = e.clientX - x0;
    // Below the threshold this is still a tap, so the card must not twitch and
    // text selection inside the code panel must keep working.
    if (!armed) {
      if (Math.abs(tx) < DECK.minDrag) return;
      armed = true;
      card.dataset.state = 'drag';
    }
    samples.push([performance.now(), e.clientX]);
    while (samples.length > 2 && samples[samples.length - 1][0] - samples[0][0] > DECK.sample) {
      samples.shift();
    }
    // rAF-coalesced: a 1000Hz mouse must not write styles faster than the
    // compositor reads them.
    if (!raf) raf = requestAnimationFrame(paint);
  }

  function release(e) {
    if (!drag) return;
    drag = false;
    try {
      stack.releasePointerCapture(e.pointerId);
    } catch {
      // already gone
    }
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    if (!armed || !card) {
      card = null;
      return;
    }

    const w = card.getBoundingClientRect().width || 1;
    const first = samples[0];
    const last = samples[samples.length - 1];
    const v = (last[1] - first[1]) / Math.max(1, last[0] - first[0]); // px/ms, signed
    const past = Math.abs(tx) / w > DECK.complete;
    // A fast flick counts even from a short distance, but not from a twitch.
    const flung = Math.abs(v) > DECK.fling && Math.abs(tx) > 12;

    if (past || flung) {
      const dir = Math.sign(flung ? v : tx) || 1;
      const gone = card;
      gone.dataset.state = 'gone';
      // Force one reflow so the transition is guaranteed to interpolate from
      // where the finger left it rather than from the resting position.
      void gone.offsetWidth;
      gone.style.setProperty('--x', `${dir * (w + 220)}px`);
      gone.style.setProperty('--y', `${-w * DECK.lift * 0.5}px`);
      gone.style.setProperty('--r', `${dir * DECK.tilt * 1.6}deg`);
      gone.style.setProperty('--o', '0');
      card = null;
      onDismiss(dir);
    } else {
      card.dataset.state = '';
      clear();
      card = null;
    }
    armed = false;
  }

  stack.addEventListener('pointerdown', onDown);
  stack.addEventListener('pointermove', onMove);
  stack.addEventListener('pointerup', release);
  stack.addEventListener('pointercancel', release);
  stack.addEventListener('lostpointercapture', release);

  return {
    /** Clear the throw styles off a card React is bringing back (Back / restart). */
    reset(el) {
      if (!el) return;
      el.dataset.state = '';
      el.style.removeProperty('--x');
      el.style.removeProperty('--y');
      el.style.removeProperty('--r');
      el.style.removeProperty('--o');
    },
    destroy() {
      stack.removeEventListener('pointerdown', onDown);
      stack.removeEventListener('pointermove', onMove);
      stack.removeEventListener('pointerup', release);
      stack.removeEventListener('pointercancel', release);
      stack.removeEventListener('lostpointercapture', release);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      card = null;
      drag = false;
    },
  };
}
