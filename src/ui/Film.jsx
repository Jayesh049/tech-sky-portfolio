import { useCallback, useEffect, useRef, useState } from 'react';
import TypedLine from './TypedLine.jsx';
import CodePanel from './CodePanel.jsx';
import { createFilmDeck } from './filmDeck.js';
import { FilmScene, CoverArt, Icon } from './FilmArt.jsx';
import { film } from '../data/profile.js';
// Still imported: film.css also carries the Nav's own [data-key='film'] rule,
// which has nothing to do with this section. Its .film-* rules are commented
// out, and as of this rewrite the markup genuinely carries none of them.
import '../film.css';

const STEPS = film.steps;

// The step names the fan faces and the kicker icons are keyed on.
const KINDS = ['read', 'found', 'fixed', 'shipped'];

// Set `hi` inside `text` in gold. Plain text when there is nothing to mark,
// so the heading's accessible name never changes shape.
function lit(text, hi, cls) {
  const at = hi ? text.indexOf(hi) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className={cls}>{hi}</span>
      {text.slice(at + hi.length)}
    </>
  );
}

/**
 * The four steps as a deck of cards. Throw the top one away and the next rises.
 *
 * THE REACT BOUNDARY, stated out loud because this codebase has been bitten
 * twice by per-frame setState: `idx` is the only state and changes at most four
 * times per pass. React owns --d, data-top, inert, tabIndex, the pips, the
 * labels and the live region. filmDeck.js owns --x, --y, --r, --o and
 * data-state, none of which ever appear in a style prop -- React's style diff
 * walks only the keys it knows, so those imperative writes survive re-renders.
 *
 * The card behind rising into place is free: React changes --d from 1 to 0 and
 * the card's existing transform transition animates it. Nothing here animates
 * a promotion.
 */
export default function Film() {
  const [idx, setIdx] = useState(0);
  const stackRef = useRef(null);
  const cardRefs = useRef([]);
  const nextRef = useRef(null);
  const deckRef = useRef(null);
  // 'card' or 'button': focus only moves when the thing holding it is about to
  // stop existing, and that depends on where the dismissal came from.
  const cameFrom = useRef('button');

  const done = idx >= STEPS.length;

  // Read by the controller's callbacks, which are created once and must not
  // close over a stale idx.
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const doneRef = useRef(done);
  doneRef.current = done;

  const go = useCallback((n, from) => {
    const next = Math.max(0, Math.min(STEPS.length, n));
    cameFrom.current = from;
    // Clearing the throw styles happens HERE, not inside the setIdx updater:
    // StrictMode invokes updaters twice, and an updater must stay pure.
    if (next < idxRef.current) deckRef.current?.reset(cardRefs.current[next]);
    setIdx(next);
  }, []);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return undefined;
    const deck = createFilmDeck({
      stack,
      canDrag: () => !doneRef.current,
      onDismiss: () => go(idxRef.current + 1, 'card'),
    });
    deckRef.current = deck;
    // Symmetric teardown: StrictMode mounts effects twice in dev, and without
    // this two listener sets fire and one throw advances two steps.
    return () => {
      deck.destroy();
      deckRef.current = null;
    };
  }, [go]);

  // Focus only follows when the element holding it is going away. Dismissing
  // from a button leaves focus on that button, which stays mounted; stealing it
  // there would be the bug, and it is the common path.
  useEffect(() => {
    if (cameFrom.current !== 'card') return;
    cameFrom.current = 'button';
    const target = idx >= STEPS.length ? nextRef.current : cardRefs.current[idx];
    // preventScroll is load-bearing: html has scroll-behavior: smooth, and a
    // focus-induced scroll would fight it.
    target?.focus({ preventScroll: true });
  }, [idx]);

  const onCardKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      go(idx + 1, 'card');
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      go(idx - 1, 'card');
    } else if (e.key === 'Home') {
      e.preventDefault();
      go(0, 'card');
    }
  };

  const restart = () => {
    STEPS.forEach((_, i) => deckRef.current?.reset(cardRefs.current[i]));
    go(0, 'button');
  };

  const shown = Math.min(idx + 1, STEPS.length);
  const current = STEPS[Math.min(idx, STEPS.length - 1)];

  return (
    <section className="sec sec-film" id="film">
      <div className="wrap">
        {/* Two columns: the prose on the left, the deck and its facts on the
            right. One narrow column down a 1376px wrap left ~750px empty and
            made the section 1360px tall in a 900px viewport. */}
        <div className="fs-layout">
          <div className="fs-intro">
            <TypedLine text={film.source} />
            {/* Progress sits with the prose now, under the source line, the way
                the reference lays it out. Still aria-hidden: the live region
                below the deck is what announces the step. */}
            <div className="fs-meter" data-end={done ? 'true' : undefined} aria-hidden="true">
              <span>
                <b>{done ? '04' : String(shown).padStart(2, '0')}</b> / 04
              </span>
              <ol className="fs-pips">
                {STEPS.map((s, i) => (
                  <li
                    key={s.title}
                    className="fs-pip"
                    data-state={i < idx ? 'done' : i === idx ? 'now' : undefined}
                  />
                ))}
              </ol>
              <span className="fs-meter-now">{done ? film.closing.line : current.title}</span>
            </div>
            <h2 className="h2 h2-wide">{lit(film.head, film.headHi, 'fs-head-hi')}</h2>
            {film.lede.map((p, i) => (
              <p className="lede lede-wide" key={i}>
                {p}
              </p>
            ))}
            {/* The three facts, as the row of lit icons under the prose. */}
            <ul className="fs-facts">
              {film.notes.map((n, i) => (
                <li key={n.v}>
                  <span className="fs-fact-ico">
                    <Icon name={['read', 'shield', 'code'][i] ?? 'read'} size={20} />
                  </span>
                  <span className="fs-fact-txt">
                    <b>{n.k}</b> {n.v}
                  </span>
                </li>
              ))}
            </ul>
            <p className="fs-scroll" aria-hidden="true">
              <Icon name="mouse" size={22} />
              <span>{film.scroll}</span>
            </p>
          </div>

          <div className="fs-side">
            {/* The world the deck stands in: rock, rings of light, gold dust. */}
            <FilmScene />
        {/* The only [data-reveal] in the section, and deliberately the one
            element the drag never transforms: the parity check needs every one
            of them to reach .in at opacity >= 0.9, and a transform of its own
            would compose with the cards' transforms inside it. */}
        <div className="fs-deck" data-reveal>
          <div className="fs-stack" ref={stackRef} role="group" aria-label={film.label}>
            {/* Sits in the same grid cell, behind the cards, and is simply
                uncovered as the last one leaves. `hidden`, never opacity: 0 --
                a resting zero opacity is the exact shape rm-check.mjs hunts. */}
            <div className="fs-done" hidden={!done}>
              <p className="fs-done-line">{film.closing.line}</p>
              <p className="fs-done-sub">{film.closing.sub}</p>
            </div>

            {STEPS.map((s, i) => {
              const top = i === idx;
              return (
                <article
                  key={s.title}
                  className="fs-card"
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  data-top={top ? 'true' : undefined}
                  data-gone={i < idx ? 'true' : undefined}
                  style={{ '--d': Math.max(0, i - idx) }}
                  tabIndex={top ? 0 : -1}
                  // A real boolean: React 19 omits the attribute for false, but
                  // the string "false" would activate it and silently make the
                  // whole deck unreachable.
                  inert={!top}
                  aria-labelledby={`fs-t-${i}`}
                  onKeyDown={top ? onCardKey : undefined}
                >
                  {/* What the card shows while it waits in the fan: its number,
                      its name and a drawing. Hidden once it is on top. */}
                  <div className="fs-cover" aria-hidden="true">
                    <span className="fs-cover-no">{s.no}</span>
                    <span className="fs-cover-t">{s.title}</span>
                    <CoverArt kind={KINDS[i]} />
                  </div>
                  <p className="fs-kicker">
                    <span className="fs-kicker-no">{s.no}</span>
                    <span className="fs-kicker-rule" aria-hidden="true" />
                    <span className="fs-kicker-t">{s.title}</span>
                    <Icon name={KINDS[i]} size={24} className="fs-kicker-ico" />
                  </p>
                  {/* The kicker already names the step, so the heading carries
                      the SENTENCE instead of repeating the title. Same shape as
                      the SPECTRA caption lane: kicker, then the line. */}
                  <h3 className="fs-card-title" id={`fs-t-${i}`}>
                    {lit(s.say, s.hi, 'fs-hi')}
                  </h3>
                  <figure className="fs-code" data-mark={s.mark || undefined}>
                    <figcaption className="fs-vh">{s.alt}</figcaption>
                    <CodePanel snippetKey={s.snippet} label={film.file} typing={false} />
                  </figure>
                  {s.note ? (
                    <p className="fs-code-note" data-mark={s.mark || undefined}>
                      {s.note}
                    </p>
                  ) : null}
                  {s.tip ? (
                    <p className="fs-tip">
                      <Icon name="bulb" size={22} className="fs-tip-ico" />
                      <span>{s.tip}</span>
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="fs-bar">
            {/* Never `disabled`: a disabled button loses focus the instant it is
                disabled, which at step 0 would dump a keyboard user to <body>
                and the top of the document. */}
            <button
              type="button"
              className="fs-step"
              aria-disabled={idx === 0 ? 'true' : undefined}
              onClick={() => idx > 0 && go(idx - 1, 'button')}
            >
              <Icon name="back" size={16} />
              Back
            </button>
            {/* Never disappears: at the end it becomes Start again. Same
                element, same ref, new label. A hidden-while-focused button is
                the other way to destroy focus. */}
            <button
              type="button"
              className="fs-step fs-step--next"
              ref={nextRef}
              onClick={done ? restart : () => go(idx + 1, 'button')}
            >
              {done ? film.closing.again : 'Next step'}
              <Icon name="next" size={16} />
            </button>
            {/* In the bar now, so it sits inside the top card with the buttons. */}
            <p className="fs-hint">
              <span>{film.hint}</span>
              <Icon name="hand" size={22} />
            </p>
          </div>

          {/* One polite region, owned by React and OUTSIDE the stack: the cards
              are inert when they are not on top, so mutations inside the stack
              are not reliably announced, and a live region wrapping the code
              block would read the snippet token by token. */}
          <p className="fs-vh" role="status" aria-live="polite">
            {done
              ? `All ${STEPS.length} steps shown. ${film.closing.line}`
              : `Step ${idx + 1} of ${STEPS.length}. ${current.title}. ${current.say}`}
          </p>
        </div>

          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// PREVIOUS: the SPECTRA six-stage player. It drove seven caption bands off
// video.currentTime with a rAF loop, plus a HUD chip and a stage rail. Its
// assets are still on disk, moved out of public/ to media-retired/film/ so
// they stop shipping in the build;
// uncomment this and the matching keys in profile.js to bring it back.
//
// Line comments, not a /* */ block: the JSX below contains {/* ... */} and its
// inner */ would close an outer block early, leaving raw JSX as live code.
// ---------------------------------------------------------------------------
// import { useCallback, useEffect, useRef, useState } from 'react';
// import TypedLine from './TypedLine.jsx';
// import { film } from '../data/profile.js';
// // Still imported: film.css also carries the Nav's own [data-key='film'] rule,
// // which has nothing to do with this section. Its .film-* rules are commented out.
// import '../film.css';
//
// const asset = (p) => `${import.meta.env.BASE_URL}${p}`;
// const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
// const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// const smoothstep = (x, a, b) => {
//   const t = clamp((x - a) / Math.max(1e-6, b - a), 0, 1);
//   return t * t * (3 - 2 * t);
// };
//
// const STAGES = film.stages;
// const TOTAL = film.duration;
//
// /**
//  * The SPECTRA film: the six-stage sequence from the AISecurity site, driven by
//  * the video's own clock rather than by scroll.
//  *
//  * The reference (site/index.html, `.hero-six`) is an 1100vh sticky scroll hero
//  * that maps scroll position to currentTime and runs a rAF loop which scrolls
//  * the page itself. Every pixel of the look is kept here; that transport is not,
//  * because a second scroll authority would fight the page peel, useScrollMotion
//  * and `scroll-behavior: smooth`.
//  *
//  * PER-FRAME WORK NEVER GOES THROUGH REACT STATE. State changes at most a dozen
//  * times per playback; the band opacities, the entrance driver, the rail fill
//  * and the clock are all ref writes inside one rAF loop, delta-gated exactly as
//  * the source does. timeupdate fires about 4Hz, far too coarse for the caption
//  * fades, so it only seeds the loop.
//  */
// export default function Film() {
//   const videoRef = useRef(null);
//   const stageRef = useRef(null);
//   const bandRefs = useRef([]);
//   const railRef = useRef(null);
//   const timeRef = useRef(null);
//
//   const rafRef = useRef(null);
//   const bandState = useRef(STAGES.map(() => ({ op: -1, k: -1 })));
//   const lastF = useRef(-1);
//   const lastClock = useRef('');
//   const lastIdx = useRef(-1);
//
//   const [playing, setPlaying] = useState(false);
//   const [stageIdx, setStageIdx] = useState(0);
//   const [failed, setFailed] = useState(false);
//
//   // Last stage whose `at` has passed. Ends are implicit, as in the source.
//   const stageAt = (t) => {
//     let i = 0;
//     STAGES.forEach((s, n) => {
//       if (t >= s.at - 0.05) i = n;
//     });
//     return i;
//   };
//
//   const paint = useCallback(() => {
//     const v = videoRef.current;
//     if (!v) return;
//     const dur = v.duration || TOTAL;
//     const t = v.currentTime;
//
//     STAGES.forEach((s, i) => {
//       const el = bandRefs.current[i];
//       if (!el) return;
//       const st = bandState.current[i];
//       const first = i === 0;
//       const last = i === STAGES.length - 1;
//       // A short fade at each edge, with the opening and closing beats pinned so
//       // the section starts and ends clean instead of fading up from nothing.
//       const f = Math.min(0.35, (s.out - s.at) / 3);
//       const rise = first ? 1 : smoothstep(t, s.at, s.at + f);
//       const fall = last ? 1 : 1 - smoothstep(t, s.out - f, s.out);
//       let op = rise * fall;
//       if (t < s.at - 0.02 && !first) op = 0;
//       if (t > s.out + 0.02 && !last) op = 0;
//
//       const ramp = Math.min(0.8, (s.out - s.at) * 0.35);
//       const k = clamp((t - s.at) / ramp, 0, 1);
//
//       if (Math.abs(op - st.op) > 0.004) {
//         st.op = op;
//         el.style.opacity = op.toFixed(3);
//       }
//       if (Math.abs(k - st.k) > 0.008) {
//         st.k = k;
//         el.style.setProperty('--k', k.toFixed(3));
//       }
//     });
//
//     const frac = clamp(t / Math.max(0.1, dur), 0, 1);
//     if (Math.abs(frac - lastF.current) > 0.0005) {
//       lastF.current = frac;
//       railRef.current?.style.setProperty('--f', frac.toFixed(4));
//     }
//
//     const clock = `${fmt(t)} / ${fmt(dur)}`;
//     if (clock !== lastClock.current) {
//       lastClock.current = clock;
//       if (timeRef.current) timeRef.current.textContent = clock;
//     }
//
//     const idx = stageAt(t);
//     if (idx !== lastIdx.current) {
//       lastIdx.current = idx;
//       setStageIdx(idx);
//     }
//   }, []);
//
//   const frame = useCallback(() => {
//     const v = videoRef.current;
//     paint();
//     rafRef.current = v && !v.paused && !v.ended ? requestAnimationFrame(frame) : null;
//   }, [paint]);
//
//   const wake = useCallback(() => {
//     if (rafRef.current == null) rafRef.current = requestAnimationFrame(frame);
//   }, [frame]);
//
//   useEffect(() => {
//     const v = videoRef.current;
//     if (!v) return undefined;
//
//     const onPlay = () => {
//       setPlaying(true);
//       wake();
//     };
//     const onPause = () => {
//       setPlaying(false);
//       paint();
//     };
//     const onTick = () => paint();
//     const onReady = () => {
//       stageRef.current?.setAttribute('data-ready', 'true');
//       paint();
//     };
//     const onError = () => {
//       setFailed(true);
//       setPlaying(false);
//     };
//
//     v.addEventListener('play', onPlay);
//     v.addEventListener('pause', onPause);
//     v.addEventListener('ended', onPause);
//     v.addEventListener('seeked', onTick);
//     v.addEventListener('timeupdate', onTick);
//     v.addEventListener('loadeddata', onReady);
//     v.addEventListener('error', onError);
//
//     return () => {
//       v.removeEventListener('play', onPlay);
//       v.removeEventListener('pause', onPause);
//       v.removeEventListener('ended', onPause);
//       v.removeEventListener('seeked', onTick);
//       v.removeEventListener('timeupdate', onTick);
//       v.removeEventListener('loadeddata', onReady);
//       v.removeEventListener('error', onError);
//       if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
//       rafRef.current = null;
//     };
//   }, [paint, wake]);
//
//   // Nothing autoplays, so there is no autoplay gate to disable; a hidden tab
//   // only needs the loop and the footage stopped.
//   useEffect(() => {
//     const onVis = () => {
//       if (document.hidden) videoRef.current?.pause();
//     };
//     document.addEventListener('visibilitychange', onVis);
//     return () => document.removeEventListener('visibilitychange', onVis);
//   }, []);
//
//   const toggle = () => {
//     const v = videoRef.current;
//     if (!v || failed) return;
//     if (v.paused) {
//       // A rejected play promise is an unhandled rejection, and the suite fails
//       // on any console error at three viewports.
//       const p = v.play();
//       if (p && p.catch) p.catch(() => {});
//     } else {
//       v.pause();
//     }
//   };
//
//   const seekStage = (i) => {
//     const v = videoRef.current;
//     if (!v || failed) return;
//     v.currentTime = STAGES[clamp(i, 0, STAGES.length - 1)].at;
//     lastIdx.current = -1;
//     paint();
//   };
//
//   const onTrackKey = (e) => {
//     const step = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key];
//     if (step) {
//       e.preventDefault();
//       seekStage(stageIdx + step);
//       return;
//     }
//     if (e.key === 'Home') {
//       e.preventDefault();
//       seekStage(0);
//     }
//     if (e.key === 'End') {
//       e.preventDefault();
//       seekStage(STAGES.length - 1);
//     }
//   };
//
//   const active = STAGES[stageIdx];
//   const stageNo = (s) => s.num.split('/')[0];
//
//   return (
//     <section className="sec sec-film" id="film">
//       <div className="wrap">
//         <TypedLine text={film.source} />
//         <h2 className="h2 h2-wide">{film.head}</h2>
//         {film.lede.map((p, i) => (
//           <p className="lede lede-wide" key={i}>
//             {p}
//           </p>
//         ))}
//
//         {/* The only [data-reveal] in the section, and always in normal flow:
//             the parity check requires every one of them to reach .in. */}
//         <div className="fs-stage" ref={stageRef} data-reveal>
//           <div className="fs-bezel">
//             <div
//               className="fs-poster"
//               aria-hidden="true"
//               style={{ backgroundImage: `url(${asset(film.poster)})` }}
//             />
//             <video
//               ref={videoRef}
//               className="fs-video"
//               muted
//               playsInline
//               preload="metadata"
//               tabIndex={-1}
//               aria-hidden="true"
//               poster={asset(film.poster)}
//             >
//               <source src={asset(film.video)} type="video/mp4" />
//             </video>
//           </div>
//
//           <div className="fs-frame" aria-hidden="true">
//             <span className="fs-tick tl" />
//             <span className="fs-tick tr" />
//             <span className="fs-tick bl" />
//             <span className="fs-tick br" />
//           </div>
//
//           <div className="fs-hud" aria-hidden="true" data-ok={active.fixed ? 'true' : 'false'}>
//             <span className="fs-dot" />
//             <span>{active.hud}</span>
//             {' · '}
//             <b>{active.num}</b>
//           </div>
//
//           <div className="fs-rail" ref={railRef}>
//             <div
//               className="fs-track"
//               role="slider"
//               tabIndex={0}
//               aria-label="Film stages"
//               aria-orientation="vertical"
//               aria-valuemin={1}
//               aria-valuemax={STAGES.length}
//               aria-valuenow={stageIdx + 1}
//               aria-valuetext={`Stage ${stageNo(active)} ${active.hud}`}
//               aria-disabled={failed ? 'true' : undefined}
//               onKeyDown={onTrackKey}
//             >
//               <span className="fs-fill" />
//               <span className="fs-thumb" />
//             </div>
//             <ol className="fs-marks" aria-label="Jump to a stage">
//               {STAGES.map((s, i) => (
//                 <li key={s.hud} style={{ top: `${((s.at / TOTAL) * 100).toFixed(2)}%` }}>
//                   <button
//                     type="button"
//                     className={`fs-mark${s.fixed ? ' is-fixed' : ''}`}
//                     aria-label={`Stage ${stageNo(s)} ${s.hud}`}
//                     aria-current={i === stageIdx ? 'step' : undefined}
//                     aria-disabled={failed ? 'true' : undefined}
//                     data-passed={i < stageIdx ? 'true' : 'false'}
//                     onClick={() => seekStage(i)}
//                   >
//                     {s.fixed ? (
//                       <svg viewBox="0 0 24 24" aria-hidden="true">
//                         <path
//                           d="M5 12.5l4.5 4.5L19 7.5"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2.4"
//                         />
//                       </svg>
//                     ) : (
//                       stageNo(s)
//                     )}
//                   </button>
//                 </li>
//               ))}
//             </ol>
//           </div>
//
//           {/* Polite, not assertive: seven changes in 33s, and it is the only
//               thing announcing the stage to a reader who is not on the rail. */}
//           <div className="fs-lane" aria-live="polite">
//             {STAGES.map((s, i) => (
//               <div
//                 key={s.hud}
//                 className="fs-band"
//                 data-fixed={s.fixed ? 'true' : undefined}
//                 ref={(el) => {
//                   bandRefs.current[i] = el;
//                 }}
//               >
//                 {s.kicker ? <p className="fs-kicker">{s.kicker}</p> : null}
//                 <p className="fs-line">
//                   <span className="fs-vh">{s.line}</span>
//                   <span className="fs-soft" aria-hidden="true">
//                     {s.line}
//                   </span>
//                   <span className="fs-sharp" aria-hidden="true">
//                     {s.line}
//                   </span>
//                 </p>
//                 <p className="fs-sub">{s.sub}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//
//         <div className="fs-bar">
//           <button
//             type="button"
//             className="fs-play"
//             onClick={toggle}
//             aria-label={playing ? 'Pause the film' : 'Play the film'}
//             aria-disabled={failed ? 'true' : undefined}
//           >
//             {playing ? (
//               <svg viewBox="0 0 24 24" aria-hidden="true">
//                 <path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" fill="currentColor" />
//               </svg>
//             ) : (
//               <svg viewBox="0 0 24 24" aria-hidden="true">
//                 <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
//               </svg>
//             )}
//           </button>
//           {/* Childless on purpose: React never owns this text, so the rAF write
//               cannot be clobbered by reconciliation. */}
//           <p className="fs-time" ref={timeRef} aria-hidden="true" />
//         </div>
//
//         <p className="fs-note" role="status" hidden={!failed}>
//           {film.failNote}
//         </p>
//
//         <ul className="film-notes">
//           {film.notes.map((n) => (
//             <li key={n.v}>
//               <b>{n.k}</b>
//               <span>{n.v}</span>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </section>
//   );
// }
//
// // ---------------------------------------------------------------------------
// // PREVIOUS FILM SECTION, kept for reference. It played the four-step 720p cut
// // (auth-py-film-720p.mp4, still in public/film) with native <video controls>
// // and a vertical chapter rail. Superseded by the SPECTRA six-stage player.
// //
// // Line comments, not a /* */ block: the JSX below contains {/* ... */} and its
// // inner */ would close an outer block early, leaving raw JSX as live code.
// // ---------------------------------------------------------------------------
// // import { useEffect, useRef, useState } from 'react';
// // import TypedLine from './TypedLine.jsx';
// // import { film } from '../data/profile.js';
// // import '../film.css';
// //
// // const asset = (p) => `${import.meta.env.BASE_URL}${p}`;
// //
// // /**
// //  * The auth.py film: a player that leads, and a chapter rail beside it that
// //  * jumps to each of the four shots and follows along while it plays.
// //  */
// // export default function Film() {
// //   const ref = useRef(null);
// //   const [active, setActive] = useState(0);
// //
// //   useEffect(() => {
// //     const v = ref.current;
// //     if (!v) return;
// //     const sync = () => {
// //       let idx = 0;
// //       film.chapters.forEach((c, i) => {
// //         if (v.currentTime >= c.at - 0.05) idx = i;
// //       });
// //       setActive(idx);
// //     };
// //     v.addEventListener('timeupdate', sync);
// //     v.addEventListener('seeked', sync);
// //     return () => {
// //       v.removeEventListener('timeupdate', sync);
// //       v.removeEventListener('seeked', sync);
// //     };
// //   }, []);
// //
// //   const jump = (c) => {
// //     const v = ref.current;
// //     if (!v) return;
// //     v.currentTime = c.at;
// //     const playing = v.play();
// //     if (playing && typeof playing.catch === 'function') playing.catch(() => {});
// //   };
// //
// //   return (
// //     <section className="sec sec-film" id="film">
// //       <div className="wrap">
// //         <TypedLine text={film.source} />
// //         <h2 className="h2 h2-wide">{film.head}</h2>
// //         {film.lede.map((p, i) => (
// //           <p className="lede lede-wide" key={i}>
// //             {p}
// //           </p>
// //         ))}
// //
// //         <div className="film-grid">
// //           <figure className="film-frame" data-reveal>
// //             <video
// //               ref={ref}
// //               className="film-video"
// //               controls
// //               preload="metadata"
// //               playsInline
// //               poster={asset(film.poster)}
// //               width="1280"
// //               height="720"
// //               aria-label={film.label}
// //             >
// //               <source src={asset(film.video)} type="video/mp4" />
// //             </video>
// //           </figure>
// //
// //           <div className="film-side" data-reveal>
// //             <ol className="film-chapters">
// //               {film.chapters.map((c, i) => (
// //                 <li key={c.label}>
// //                   <button
// //                     type="button"
// //                     className="film-chap"
// //                     data-active={active === i ? 'true' : 'false'}
// //                     aria-label={`Play from ${c.stamp}: ${c.label}`}
// //                     onClick={() => jump(c)}
// //                   >
// //                     <span className="film-chap-at">{c.stamp}</span>
// //                     <span className="film-chap-body">
// //                       <b>{c.label}</b>
// //                       <span>{c.line}</span>
// //                     </span>
// //                   </button>
// //                 </li>
// //               ))}
// //             </ol>
// //
// //             <ul className="film-notes">
// //               {film.notes.map((n) => (
// //                 <li key={n.v}>
// //                   <b>{n.k}</b>
// //                   <span>{n.v}</span>
// //                 </li>
// //               ))}
// //             </ul>
// //
// //             <a className="linkish" href={asset(film.videoHd)} target="_blank" rel="noreferrer">
// //               {film.hdLabel}
// //             </a>
// //           </div>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // }
// //
//
