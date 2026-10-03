import { useEffect, useRef, useState } from "react";
import { createPagePeel } from "./pagePeel.js";

/**
 * Wires the page peel to the hero. Arms it (shows the folded corner) once the
 * masthead sequence is done, and returns the peel state for the stage:
 *
 *   "idle"       sequence still running; no corner yet
 *   "ready"      PEEL_READY — the folded corner and "Pull to explore"
 *   "peeling"    PEELING — the page is following the pointer
 *   "completing" released past the threshold (or keyboard): peeling away
 *   "peeled"     INTRO_REVEAL — the introduction is the page now
 *   "restoring"  the page is being laid back down
 *
 * Focus follows the layer: to the introduction when it's revealed, back to
 * the corner when the page returns.
 */
export default function usePagePeel(refs, { armed }) {
  const [state, setState] = useState("idle");
  const engine = useRef(null);

  // The handle is `hidden` the moment peel === "peeled" (HeroVideo.jsx), which
  // blurs it and drops focus to <body>. Reading document.activeElement inside
  // onState therefore RACES the React re-render it is announcing: sometimes
  // focus is still on the handle, sometimes it is already on body and the
  // hand-off is skipped, stranding a keyboard user with no focus at all.
  // Measured 1-in-2 flaky before this.
  //
  // So remember the last DELIBERATE focus position instead. focusin fires when
  // something is actually focused and never for the implicit fall-back to
  // <body>, which is exactly the distinction the original check was reaching
  // for: move focus for someone navigating the stage, leave a mouse user alone.
  const focusWasInside = useRef(false);

  useEffect(() => {
    const onFocusIn = () => {
      const el = refs.stage?.current;
      if (el) focusWasInside.current = el.contains(document.activeElement);
    };
    document.addEventListener("focusin", onFocusIn, true);
    return () => document.removeEventListener("focusin", onFocusIn, true);
  }, [refs]);

  useEffect(() => {
    const { stage, sheet, flap, shade, handle, back, introFocus } = refs;
    if (!stage.current || !sheet.current || !flap.current || !shade.current || !handle.current) return undefined;

    // .focus() is a SILENT no-op while the element sits inside an inert
    // subtree, and IntroReveal removes `inert` in a React effect one render
    // AFTER the peel state lands. Firing a single rAF therefore lost the race
    // often enough to strand keyboard users (measured 1-in-3 even after the
    // hadFocus fix). Retry across a few frames until the subtree can actually
    // take focus, then stop as soon as it does.
    const focusWhenReady = (el, tries = 20) => {
      if (!el || typeof el.focus !== "function") return;
      const tick = () => {
        if (!el.isConnected) return;
        if (!el.closest("[inert]")) el.focus({ preventScroll: true });
        if (document.activeElement !== el && tries-- > 0) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let focusNext = null;
    const e = createPagePeel({
      stage: stage.current,
      sheet: sheet.current,
      flap: flap.current,
      shade: shade.current,
      handle: handle.current,
      back: back?.current ?? undefined,
      reduced,
      onState: (s) => {
        setState(s);
        // const hadFocus = stage.current?.contains(document.activeElement);
        const hadFocus =
          stage.current?.contains(document.activeElement) || focusWasInside.current;
        if (s === "peeled" && hadFocus) focusNext = introFocus?.current;
        if (s === "ready" && focusNext === "handle") focusNext = handle.current;
        if (focusNext && typeof focusNext.focus === "function") {
          const el = focusNext;
          focusNext = null;
          focusWhenReady(el);
        }
        if (s === "restoring" && hadFocus) focusNext = "handle";
      },
    });
    engine.current = e;
    return () => {
      e.destroy();
      engine.current = null;
    };
  }, [refs]);

  useEffect(() => {
    if (armed && engine.current?.state === "idle") engine.current.arm();
  }, [armed]);

  return state;
}
