import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createHeroSequence, paintStars } from "./heroSequence.js";

const motionAllowed = () =>
  typeof window !== "undefined" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  !navigator.connection?.saveData;

/**
 * Drives the masthead sequence. Returns the state to put on the section as
 * data-seq: "pending" (quiet, sections closed, background untouched) →
 * "running" → "done" (dark, the four sections standing, the name kept for
 * screen readers only). "done" is also where reduced-motion visitors start, and
 * it is the CSS default, so the hero never depends on this hook to be whole.
 *
 * Plays once on arrival: after the row's [data-reveal] entrance lands, then
 * `startDelay` of Quiet, and only while the hero is on screen and the tab is
 * visible.
 *
 * Returns [seq, replay]. `replay` re-runs the whole shot on demand and is null
 * when motion is not allowed, so a caller can render its control inert without
 * repeating the media query. The engine itself was always replayable -- play()
 * calls reset() unconditionally and there is no played guard -- the one-shot
 * behaviour lived here, in an effect-local engine nobody could reach.
 */
export default function useHeroSequence(refs, { startDelay = 1100 } = {}) {
  const [seq, setSeq] = useState(() => (motionAllowed() ? "pending" : "done"));

  // The engine, reachable once the effect below has built it. Cleared by that
  // effect's cleanup BEFORE destroy(), so a replay racing a StrictMode teardown
  // finds null rather than an engine mid-destruction.
  const engineRef = useRef(null);
  // Bumped by replay(). The layout effect keyed on it plays only AFTER React
  // has committed data-seq="running" -- see the note on that effect.
  const [replayNonce, setReplayNonce] = useState(0);
  // seq, readable from a callback that must keep a stable identity.
  const seqRef = useRef(seq);
  seqRef.current = seq;
  // Decided once, like the initial seq. Under reduced motion or Save-Data the
  // engine is never built, so there is nothing to replay.
  const motionOK = useRef(null);
  if (motionOK.current === null) motionOK.current = motionAllowed();

  // Star dust is part of the final state, so it is painted for everyone.
  useEffect(() => {
    const cv = refs.stars.current;
    const hero = refs.hero.current;
    const mark = refs.mark.current;
    if (!cv || !hero) return undefined;
    const nav = refs.nav.current;
    const paint = () => {
      const h = hero.getBoundingClientRect();
      if (!h.height) return;
      const m = mark?.getBoundingClientRect();
      const n = nav?.getBoundingClientRect();
      const horizon = m ? (m.top + m.height / 2 - h.top) / h.height : 0.5;
      // The glitter lies along the floor the sections stand on.
      const floor = n?.height ? (n.bottom - h.top) / h.height : 0.8;
      paintStars(cv, { horizon, floor });
    };
    paint();
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(paint, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [refs]);

  useEffect(() => {
    if (!motionAllowed()) return undefined;
    const hero = refs.hero.current;
    const fx = refs.fx.current;
    const stage = refs.mark.current;
    const nav = refs.nav.current;
    if (!hero || !fx || !stage || !nav) return undefined;

    const panels = () => [...nav.querySelectorAll(".cir-path")];
    // What gives way to the sections: the copy and the two flanks.
    const fade = () => [refs.copy.current, ...hero.querySelectorAll(".cir-flank")].filter(Boolean);
    const engine = createHeroSequence({
      fx,
      mark: stage.querySelector(".cir-mark"),
      panels,
      fade,
      dusk: refs.dusk.current,
      stars: refs.stars.current,
      onPhase: (p) => {
        hero.dataset.phase = p;
      },
      onPanels: (open) => {
        panels().forEach((el, i) => {
          if (open[i]) el.dataset.open = "true";
          else delete el.dataset.open;
        });
        // The seams light once every section is standing.
        if (open.length && open.every(Boolean)) nav.dataset.lit = "true";
        else delete nav.dataset.lit;
      },
      onEnd: () => setSeq("done"),
    });
    engineRef.current = engine;

    let timer = 0;
    let started = false;
    let revealed = false;
    let onScreen = true;

    // All three must hold: entrance landed, hero on screen, tab visible. Any
    // turning false before the beat is up cancels the countdown.
    const schedule = () => {
      window.clearTimeout(timer);
      timer = 0;
      if (started || !revealed || !onScreen || document.hidden) return;
      timer = window.setTimeout(() => {
        if (started || !onScreen || document.hidden) return;
        started = true;
        setSeq("running");
        engine.play();
      }, startDelay);
    };

    const reveal = stage.closest("[data-reveal]");
    let mo;
    if (!reveal || reveal.classList.contains("in")) {
      revealed = true;
    } else {
      mo = new MutationObserver(() => {
        if (reveal.classList.contains("in")) {
          mo.disconnect();
          revealed = true;
          schedule();
        }
      });
      mo.observe(reveal, { attributes: true, attributeFilter: ["class"] });
    }
    const io = new IntersectionObserver(([entry]) => {
      onScreen = Boolean(entry?.isIntersecting);
      schedule();
    });
    io.observe(hero);
    document.addEventListener("visibilitychange", schedule);
    schedule();

    return () => {
      window.clearTimeout(timer);
      mo?.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", schedule);
      engineRef.current = null;
      engine.destroy();
    };
  }, [refs, startDelay]);

  // `started` is deliberately untouched: it only gates schedule(), and leaving
  // it true means a later visibilitychange can never double-play on top of a
  // replay already in flight.
  const doReplay = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return; //                   reduced motion, or between mounts
    if (engine.running) return; //            already mid-sequence
    if (seqRef.current !== "done") return; // covers the render before the effect
    if (document.hidden) return; //           rAF would not tick
    setSeq("running");
    setReplayNonce((n) => n + 1);
  }, []);

  // play() calls measure() SYNCHRONOUSLY inside reset(), and under
  // [data-seq="done"] the copy is collapsed to a 1x1 sr-only box, which lifts
  // the triad the whole shot is composed against. React commits every DOM
  // mutation for a render before any layout effect in it, so by the time this
  // runs the section already reads "running" and the geometry is the real one.
  // Nothing has painted yet, so there is no flash of the wrong frame.
  useLayoutEffect(() => {
    if (!replayNonce) return; // the mount pass, and StrictMode's repeat of it
    engineRef.current?.play();
  }, [replayNonce]);

  return [seq, motionOK.current ? doReplay : null];
}
