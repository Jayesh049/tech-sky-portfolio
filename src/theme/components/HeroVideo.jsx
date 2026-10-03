import { useCallback, useEffect, useRef, useState } from "react";
import Mark from "../../ui/Mark.jsx";
import HeroPaths, { DEFAULT_PATHS, HeroCosmos } from "../../ui/HeroPaths.jsx";
import useHeroSequence from "../../ui/useHeroSequence.js";
import IntroReveal, { DEFAULT_INTRO } from "../../ui/IntroReveal.jsx";
import usePagePeel from "../../ui/usePagePeel.js";
// Moved to main.jsx so the cascade is explicit: hero-sequence.css must land
// AFTER theme-ciridae.css (identical specificity on `.sq-hero { min-height }`),
// and Vite gives no ordering guarantee between a component-level import and
// main.jsx's own chain.
// import "../hero-sequence.css";
// import "../page-peel.css";
import { asset } from "./site.js";

const DEFAULT_STILL = {
  large: "media/hero-1112.webp",
  small: "media/hero-640.webp",
  alt: "Jayesh Kumar Singh at a laptop by a window at golden hour",
};

/**
 * Full-viewport hero with a muted background loop.
 * Port of portfolio-next/app/page.tsx and components/HeroVideo.tsx.
 *
 * Files it expects in public/ (copy them from portfolio-next):
 *   media/hero-1112.webp, media/hero-640.webp          from assets/
 *   media/hero-loop-1112.webm, media/hero-loop-1112.mp4,
 *   media/hero-loop-640.webm, media/hero-loop-640.mp4  from public/media/
 *
 * The still is the first paint and the fallback. The loop starts only after
 * the page has loaded and the browser is idle, never under reduced motion or
 * Save-Data, pauses whenever nobody can see it, and has a pause toggle.
 */
export default function HeroVideo({
  id = "hero",
  title = "Jayesh Kumar Singh",
  headline = (
    <>
      Full-stack AI, shipped to <em className="sq-accent">production</em>.
    </>
  ),
  badge = "Open to remote · Noida, India · UTC+5:30",
  // Ciridae's masthead is triadic: micro-label, centred mark, micro-label.
  flankLeft = "Automate the mundane",
  flankRight = "Accelerate the remarkable",
  still = DEFAULT_STILL,
  loop = "media/hero-loop",
  // The four panels the mark's points travel to. Point each href at the id of
  // the matching section on the page.
  paths = DEFAULT_PATHS,
  // The layer under the page: what the peel reveals.
  intro = DEFAULT_INTRO,
}) {
  const video = useRef(null);
  const ready = useRef(false);
  const userPaused = useRef(false);
  const onScreen = useRef(true);
  const [sources, setSources] = useState(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);

  // Quiet → Expansion → Return → Rotation → Acceleration → Burst → Four paths → Exploration
  const seqRefs = useRef(null);
  if (!seqRefs.current) {
    seqRefs.current = {
      hero: { current: null },
      fx: { current: null },
      dusk: { current: null },
      stars: { current: null },
      mark: { current: null },
      copy: { current: null },
      nav: { current: null },
    };
  }
  const r = seqRefs.current;
  const [seq, replay] = useHeroSequence(r);

  // … → Interactive → Page peel → Introduction. The sheet that peels is the
  // hero section itself (r.hero); the introduction waits underneath.
  const peelRefs = useRef(null);
  if (!peelRefs.current) {
    peelRefs.current = {
      stage: { current: null },
      sheet: r.hero,
      flap: { current: null },
      shade: { current: null },
      handle: { current: null },
      back: { current: null },
      introFocus: { current: null },
    };
  }
  const pr = peelRefs.current;
  const peel = usePagePeel(pr, { armed: seq === "done" });
  const covered = peel === "peeled";

  // ── Replay ────────────────────────────────────────────────────────────────
  // The flare above the sections is the control. Clicking it re-runs the shot.
  const flareRef = useRef(null);
  const wantFlareFocus = useRef(false);

  // Going `disabled` blurs a focused element, so a keyboard user who presses
  // Enter would lose focus to <body> for the whole 4.45s. Remember only
  // DELIBERATE focus: on Safari a click does not focus a button, so this reads
  // false for mouse users and true for keyboard users, which is the split we
  // want. The effect below hands focus back when the shot ends.
  const replayFromFlare = useCallback(() => {
    wantFlareFocus.current = document.activeElement === flareRef.current;
    replay?.();
  }, [replay]);

  useEffect(() => {
    if (seq !== "done" || !wantFlareFocus.current) return;
    wantFlareFocus.current = false;
    flareRef.current?.focus({ preventScroll: true });
  }, [seq]);

  // Only offered while the page is lying flat. Peeled, the hero is
  // visibility:hidden and inert so the flare is unreachable anyway; this also
  // covers "peeling", "completing" and "restoring", which are not.
  // `replay` itself must be in the test: replayFromFlare is always a function,
  // so gating on it alone left the star focusable and clickable under reduced
  // motion, where there is no engine and the click is a no-op.
  const canReplay = replay && seq === "done" && peel === "ready" ? replayFromFlare : null;
  const introLoop = useCallback(
    (width) => ({ webm: asset(`${loop}-${width}.webm`), mp4: asset(`${loop}-${width}.mp4`) }),
    [loop]
  );

  // Pick a file for this screen and start once the page has finished loading.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || navigator.connection?.saveData) return undefined;

    const begin = () => {
      const width = window.matchMedia("(min-width: 768px)").matches ? 1112 : 640;
      setSources({ webm: asset(`${loop}-${width}.webm`), mp4: asset(`${loop}-${width}.mp4`) });
    };

    let cancel = () => {};
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") {
        const handle = window.requestIdleCallback(begin, { timeout: 1500 });
        cancel = () => window.cancelIdleCallback(handle);
      } else {
        const handle = window.setTimeout(begin, 200);
        cancel = () => window.clearTimeout(handle);
      }
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      window.removeEventListener("load", schedule);
      cancel();
    };
  }, [loop]);

  // Sources are in the DOM: load and play.
  useEffect(() => {
    const v = video.current;
    if (!sources || !v) return;
    ready.current = true;
    v.muted = true;
    v.load();
    v.play().catch(() => {
      // Autoplay refused: the still stays, and the toggle is never offered.
    });
  }, [sources]);

  const hidden = useRef(false); // peeled away: nothing to see, nothing to decode
  const play = useCallback(() => {
    const v = video.current;
    if (!v || !ready.current || userPaused.current || hidden.current || !onScreen.current || document.hidden) return;
    v.play().catch(() => {});
  }, []);

  useEffect(() => {
    hidden.current = covered;
    if (covered) video.current?.pause();
    else play();
  }, [covered, play]);

  // Pause whenever nobody can see it: scrolled away, or the tab is hidden.
  useEffect(() => {
    const v = video.current;
    const hero = v?.closest("section");
    if (!v || !hero) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      onScreen.current = Boolean(entry?.isIntersecting);
      if (onScreen.current) play();
      else v.pause();
    });
    observer.observe(hero);
    const onVisibility = () => {
      if (document.hidden) v.pause();
      else play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [play]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    userPaused.current = !userPaused.current;
    setPaused(userPaused.current);
    if (userPaused.current) v.pause();
    else play();
  };

  // Tapping the hero surface toggles the loop, but only once it is really
  // playing, so an early tap (or reduced motion / refused autoplay, where no
  // loop exists) does nothing — the same condition under which the old button
  // used to appear.
  const handleSurfaceToggle = () => {
    if (visible) toggle();
  };

  return (
    <div ref={pr.stage} className="sq-stage" data-peel={peel}>
      {/* Underneath: the introduction, revealed when the page is peeled. */}
      <IntroReveal
        peel={peel}
        focusRef={pr.introFocus}
        loop={introLoop}
        poster={asset(still.large)}
        intro={intro}
      />
      <div ref={pr.shade} aria-hidden="true" className="sq-peel__shade" />

      <section
        ref={r.hero}
        id={id}
        aria-labelledby={`${id}-title`}
        className="sq-hero"
        data-seq={seq}
        onClick={handleSurfaceToggle}
        style={{ cursor: visible ? "pointer" : undefined }}
      >
        <img
          data-parallax
          className="sq-hero__media"
          src={asset(still.large)}
          srcSet={`${asset(still.small)} 640w, ${asset(still.large)} 1112w`}
          sizes="100vw"
          width="1112"
          height="834"
          alt={still.alt}
          fetchPriority="high"
        />
        <video
          ref={video}
          aria-hidden="true"
          tabIndex={-1}
          muted
          loop
          playsInline
          preload="none"
          onPlaying={() => setVisible(true)}
          data-visible={visible ? "true" : "false"}
          className="sq-hero__media sq-hero__video"
        >
          {sources ? (
            <>
              <source src={sources.webm} type="video/webm" />
              <source src={sources.mp4} type="video/mp4" />
            </>
          ) : null}
        </video>
        <div aria-hidden="true" className="sq-hero__scrim-top" />
        <div aria-hidden="true" className="sq-hero__scrim" />
        {/* The sequence's atmosphere: dusk and star dust over the video (which
            keeps playing), then the light itself. */}
        <div ref={r.dusk} aria-hidden="true" className="sq-hero__dusk" />
        <canvas ref={r.stars} aria-hidden="true" className="sq-hero__stars" />
        {/* The crystal panels' world: galaxy, debris, pillars (hero-panels.css). */}
        <HeroCosmos />
        <canvas ref={r.fx} aria-hidden="true" className="sq-hero__fx" />

        <div className="sq-hero__row" data-reveal>
          <div className="sq-hero__above" aria-hidden="true" />

          {/* The triad: micro-label, the mark at the hero's exact centre, micro-label.
              Its centre line is the horizon the whole sequence plays along. */}
          <div className="sq-hero__triad">
            <span className="cir-flank cir-flank--l" aria-hidden="true">
              {flankLeft}
            </span>
            <span ref={r.mark} className="cir-mark-stage sq-hero__mark">
              <Mark />
            </span>
            <span className="cir-flank cir-flank--r" aria-hidden="true">
              {flankRight}
            </span>
            {/* The four sections stand on this line once the mark has burst. */}
            <HeroPaths items={paths} navRef={r.nav} onReplay={canReplay} flareRef={flareRef} flanks={[flankLeft, flankRight]} />
          </div>

          <div className="sq-hero__below">
            <div ref={r.copy} className="sq-hero__text">
              <h1 id={`${id}-title`} className="sq-hero__title" style={{ "--i": 1 }}>
                {title}
              </h1>
              <p className="sq-hero__headline" style={{ "--i": 2 }}>
                {headline}
              </p>
              <p className="sq-badge-glass sq-hero__badge" style={{ "--i": 3 }}>
                {badge}
              </p>
            </div>
          </div>

          <div className="sq-hero__toggle-slot">
            {/* The whole hero now toggles the loop on tap/click (see the section's
                onClick). The circular icon button is retired but kept for reference. */}
            {/*
            {visible ? (
              <button
                type="button"
                aria-pressed={paused}
                aria-label="Pause background video"
                onClick={toggle}
                className="sq-btn-pause"
              >
                {paused ? (
                  <svg aria-hidden="true" viewBox="0 0 10 12">
                    <path d="M0 0L10 6L0 12Z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" viewBox="0 0 10 12">
                    <path d="M1 0h3v12H1zM6 0h3v12H6z" fill="currentColor" />
                  </svg>
                )}
              </button>
            ) : null}
            */}
            {/* Keyboard and screen-reader control: no icon, only reachable by Tab,
                so tapping the surface is not the only way to stop the motion (WCAG 2.2.2). */}
            {visible ? (
              <button
                type="button"
                className="sr-only"
                aria-pressed={paused}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle();
                }}
              >
                {paused ? "Play background video" : "Pause background video"}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* The back of the page, as it lifts. */}
      <div aria-hidden="true" className="sq-peel__flapwrap">
        <div ref={pr.flap} className="sq-peel__flap" />
      </div>

      {/* The folded corner: drag it, or press it with the keyboard. */}
      <button
        ref={pr.handle}
        type="button"
        className="sq-peel__handle"
        aria-label="Pull the page away to reveal the introduction"
        // Also hidden for the length of a replay. Not cosmetic: the sheet this
        // folds IS .sq-hero, which holds the canvas being drawn into, and a
        // drag started mid-shot would clip and transform it while the engine
        // kept drawing against geometry that a clip-path change never
        // re-measures.
        hidden={
          seq !== "done" ||
          peel === "idle" ||
          peel === "peeled" ||
          peel === "restoring"
        }
      >
        <span className="sq-peel__hint" aria-hidden="true">
          Pull to explore <span className="sq-peel__arrow">→</span>
        </span>
      </button>

      {/* Once peeled, the page waits folded at the top-left. */}
      <button
        ref={pr.back}
        type="button"
        className="sq-peel__back"
        hidden={peel !== "peeled"}
      >
        <span className="sq-peel__back-label">
          <span aria-hidden="true">← </span>Back to paths
        </span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PRE-SEQUENCE MASTHEAD, kept for reference. Superseded by the cinematic hero
// sequence above, which is a strict superset: same props, same triadic
// masthead, same data-parallax still, same sr-only pause control. The only
// structural changes are the .sq-hero__triad wrapper, the .cir-mark-stage span
// around <Mark/>, and [data-reveal] moving from .sq-hero__text to .sq-hero__row.
//
// Line comments, not a /* */ block: the JSX below contains {/* ... */} and its
// inner */ would close an outer block early, leaving raw JSX as live code.
// ---------------------------------------------------------------------------
// import { useCallback, useEffect, useRef, useState } from "react";
// import Mark from "../../ui/Mark.jsx";
// import { asset } from "./site.js";
//
// const DEFAULT_STILL = {
//   large: "media/hero-1112.webp",
//   small: "media/hero-640.webp",
//   alt: "Jayesh Kumar Singh at a laptop by a window at golden hour",
// };
//
// /**
//  * Full-viewport hero with a muted background loop.
//  * Port of portfolio-next/app/page.tsx and components/HeroVideo.tsx.
//  *
//  * Files it expects in public/ (copy them from portfolio-next):
//  *   media/hero-1112.webp, media/hero-640.webp          from assets/
//  *   media/hero-loop-1112.webm, media/hero-loop-1112.mp4,
//  *   media/hero-loop-640.webm, media/hero-loop-640.mp4  from public/media/
//  *
//  * The still is the first paint and the fallback. The loop starts only after
//  * the page has loaded and the browser is idle, never under reduced motion or
//  * Save-Data, pauses whenever nobody can see it, and has a pause toggle.
//  */
// export default function HeroVideo({
//   id = "hero",
//   title = "Jayesh Kumar Singh",
//   headline = (
//     <>
//       Full-stack AI, shipped to <em className="sq-accent">production</em>.
//     </>
//   ),
//   badge = "Open to remote · Noida, India · UTC+5:30",
//   // Ciridae's masthead is triadic: micro-label, centred mark, micro-label.
//   flankLeft = "Automate the mundane",
//   flankRight = "Accelerate the remarkable",
//   still = DEFAULT_STILL,
//   loop = "media/hero-loop",
// }) {
//   const video = useRef(null);
//   const ready = useRef(false);
//   const userPaused = useRef(false);
//   const onScreen = useRef(true);
//   const [sources, setSources] = useState(null);
//   const [visible, setVisible] = useState(false);
//   const [paused, setPaused] = useState(false);
//
//   // Pick a file for this screen and start once the page has finished loading.
//   useEffect(() => {
//     const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
//     if (reduced || navigator.connection?.saveData) return undefined;
//
//     const begin = () => {
//       const width = window.matchMedia("(min-width: 768px)").matches ? 1112 : 640;
//       setSources({ webm: asset(`${loop}-${width}.webm`), mp4: asset(`${loop}-${width}.mp4`) });
//     };
//
//     let cancel = () => {};
//     const schedule = () => {
//       if (typeof window.requestIdleCallback === "function") {
//         const handle = window.requestIdleCallback(begin, { timeout: 1500 });
//         cancel = () => window.cancelIdleCallback(handle);
//       } else {
//         const handle = window.setTimeout(begin, 200);
//         cancel = () => window.clearTimeout(handle);
//       }
//     };
//
//     if (document.readyState === "complete") schedule();
//     else window.addEventListener("load", schedule, { once: true });
//
//     return () => {
//       window.removeEventListener("load", schedule);
//       cancel();
//     };
//   }, [loop]);
//
//   // Sources are in the DOM: load and play.
//   useEffect(() => {
//     const v = video.current;
//     if (!sources || !v) return;
//     ready.current = true;
//     v.muted = true;
//     v.load();
//     v.play().catch(() => {
//       // Autoplay refused: the still stays, and the toggle is never offered.
//     });
//   }, [sources]);
//
//   const play = useCallback(() => {
//     const v = video.current;
//     if (!v || !ready.current || userPaused.current || !onScreen.current || document.hidden) return;
//     v.play().catch(() => {});
//   }, []);
//
//   // Pause whenever nobody can see it: scrolled away, or the tab is hidden.
//   useEffect(() => {
//     const v = video.current;
//     const hero = v?.closest("section");
//     if (!v || !hero) return undefined;
//     const observer = new IntersectionObserver(([entry]) => {
//       onScreen.current = Boolean(entry?.isIntersecting);
//       if (onScreen.current) play();
//       else v.pause();
//     });
//     observer.observe(hero);
//     const onVisibility = () => {
//       if (document.hidden) v.pause();
//       else play();
//     };
//     document.addEventListener("visibilitychange", onVisibility);
//     return () => {
//       observer.disconnect();
//       document.removeEventListener("visibilitychange", onVisibility);
//     };
//   }, [play]);
//
//   const toggle = () => {
//     const v = video.current;
//     if (!v) return;
//     userPaused.current = !userPaused.current;
//     setPaused(userPaused.current);
//     if (userPaused.current) v.pause();
//     else play();
//   };
//
//   // Tapping the hero surface toggles the loop, but only once it is really
//   // playing, so an early tap (or reduced motion / refused autoplay, where no
//   // loop exists) does nothing — the same condition under which the old button
//   // used to appear.
//   const handleSurfaceToggle = () => {
//     if (visible) toggle();
//   };
//
//   return (
//     <section
//       id={id}
//       aria-labelledby={`${id}-title`}
//       className="sq-hero"
//       onClick={handleSurfaceToggle}
//       style={{ cursor: visible ? "pointer" : undefined }}
//     >
//       <img
//         data-parallax
//         className="sq-hero__media"
//         src={asset(still.large)}
//         srcSet={`${asset(still.small)} 640w, ${asset(still.large)} 1112w`}
//         sizes="100vw"
//         width="1112"
//         height="834"
//         alt={still.alt}
//         fetchPriority="high"
//       />
//       <video
//         ref={video}
//         aria-hidden="true"
//         tabIndex={-1}
//         muted
//         loop
//         playsInline
//         preload="none"
//         onPlaying={() => setVisible(true)}
//         data-visible={visible ? "true" : "false"}
//         className="sq-hero__media sq-hero__video"
//       >
//         {sources ? (
//           <>
//             <source src={sources.webm} type="video/webm" />
//             <source src={sources.mp4} type="video/mp4" />
//           </>
//         ) : null}
//       </video>
//       <div aria-hidden="true" className="sq-hero__scrim-top" />
//       <div aria-hidden="true" className="sq-hero__scrim" />
//
//       <div className="sq-hero__row">
//         <span className="cir-flank cir-flank--l" aria-hidden="true">
//           {flankLeft}
//         </span>
//
//         <div className="sq-hero__text" data-reveal>
//           <Mark className="sq-hero__mark" />
//           <h1 id={`${id}-title`} className="sq-hero__title" style={{ "--i": 1 }}>
//             {title}
//           </h1>
//           <p className="sq-hero__headline" style={{ "--i": 2 }}>
//             {headline}
//           </p>
//           <p className="sq-badge-glass sq-hero__badge" style={{ "--i": 3 }}>
//             {badge}
//           </p>
//         </div>
//
//         <span className="cir-flank cir-flank--r" aria-hidden="true">
//           {flankRight}
//         </span>
//         <div className="sq-hero__toggle-slot">
//           {/* The whole hero now toggles the loop on tap/click (see the section's
//               onClick). The circular icon button is retired but kept for reference. */}
//           {/*
//           {visible ? (
//             <button
//               type="button"
//               aria-pressed={paused}
//               aria-label="Pause background video"
//               onClick={toggle}
//               className="sq-btn-pause"
//             >
//               {paused ? (
//                 <svg aria-hidden="true" viewBox="0 0 10 12">
//                   <path d="M0 0L10 6L0 12Z" fill="currentColor" />
//                 </svg>
//               ) : (
//                 <svg aria-hidden="true" viewBox="0 0 10 12">
//                   <path d="M1 0h3v12H1zM6 0h3v12H6z" fill="currentColor" />
//                 </svg>
//               )}
//             </button>
//           ) : null}
//           */}
//           {/* Keyboard and screen-reader control: no icon, only reachable by Tab,
//               so tapping the surface is not the only way to stop the motion (WCAG 2.2.2). */}
//           {visible ? (
//             <button
//               type="button"
//               className="sr-only"
//               aria-pressed={paused}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 toggle();
//               }}
//             >
//               {paused ? "Play background video" : "Pause background video"}
//             </button>
//           ) : null}
//         </div>
//       </div>
//     </section>
//   );
// }
//
