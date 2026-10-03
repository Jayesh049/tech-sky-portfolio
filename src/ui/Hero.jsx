import gsap from 'gsap';
import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useStore, RUNNING } from '../store.js';
import { techs, byId } from '../data/techs.js';
import { profile } from '../data/profile.js';
import { storyFor } from '../data/techStory.js';
import { buildSequence, phaseDuration } from '../sequence/timeline.js';
import { atmo, resetLogo, logo, setStormNow, setClearNow } from '../scene/state.js';
import { useReducedMotion, useIsSmall, hasWebGL } from '../hooks/useEnvironment.js';
import CodePanel from './CodePanel.jsx';
import CompilePanel from './CompilePanel.jsx';
import { ExpertisePanel, FinalPanel } from './ExpertisePanel.jsx';
import StormField from './StormField.jsx';
import { sceneFor } from './scenes/index.js';

const SkyScene = lazy(() => import('../scene/SkyScene.jsx'));

// What the visitor is told is happening, beat by beat. The same line is the
// screen reader's live announcement, so it says it in words, once per beat.
const BEATS = {
  TECH_SELECTED: 'Selected',
  TECH_RISE: 'Rising',
  CODE_REVEAL: 'Writing the code',
  LIVE_BUILD: 'Building',
  COMPILING: 'Compiling',
  BUILD_COMPLETE: 'Build complete',
  ENERGY_BUILD: 'Energy building',
  BURST: 'Release',
  CLOUD_TRANSITION: 'The sky clears',
  WHITE_CLOUD: 'Clear',
  EXPERTISE: 'Expertise',
};
const BEAT_ORDER = Object.keys(BEATS);

// Which panels are on the stage in which phase.
const CODE_PHASES = new Set(['CODE_REVEAL', 'LIVE_BUILD']);
const BUILD_PANEL_PHASES = new Set(['COMPILING', 'BUILD_COMPLETE', 'ENERGY_BUILD', 'BURST']);
const ART_PHASES = new Set(['LIVE_BUILD', 'COMPILING', 'BUILD_COMPLETE', 'ENERGY_BUILD', 'BURST']);
const ALIVE_PHASES = new Set(['COMPILING', 'BUILD_COMPLETE', 'ENERGY_BUILD']);
const BUILT_PHASES = new Set(['COMPILING', 'BUILD_COMPLETE', 'ENERGY_BUILD', 'BURST']);
// Phases in which the stage takes the place of the headline.
const STAGE_OWNS = new Set([...RUNNING, 'EXPERTISE', 'FINAL_STATE']);

// Splits the headline so its last word can take the accent.
function headline(line) {
  const i = line.lastIndexOf(' ');
  return i < 0 ? [line, ''] : [line.slice(0, i + 1), line.slice(i + 1)];
}

// Lines a build step lights up in the code window: [a, b] or [a, b, c, d].
function lineSet(lines) {
  const out = new Set();
  for (let k = 0; k + 1 < (lines?.length ?? 0); k += 2) {
    for (let i = lines[k]; i <= lines[k + 1]; i += 1) out.add(i);
  }
  return out;
}

// LIVE_BUILD in steps: each step of the scene lands in turn across the phase,
// the last just before it ends. Before the phase nothing is built; after it,
// everything is.
function useBuildStep(phase, count, ms) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (phase === 'LIVE_BUILD') {
      setStep(0);
      const ids = [];
      for (let i = 1; i <= count; i += 1) {
        ids.push(setTimeout(() => setStep(i), (ms / count) * (i - 0.6)));
      }
      return () => ids.forEach(clearTimeout);
    }
    setStep(BUILT_PHASES.has(phase) ? count : 0);
    return undefined;
  }, [phase, count, ms]);
  return step;
}

export default function Hero() {
  const reduced = useReducedMotion();
  const small = useIsSmall();
  const [webgl] = useState(hasWebGL);

  const phase = useStore((s) => s.phase);
  const activeId = useStore((s) => s.activeId);
  const landed = useStore((s) => s.landed);
  const sky = useStore((s) => s.sky);
  const firstDone = useStore((s) => s.firstDone);
  const setPhase = useStore((s) => s.setPhase);

  const tl = useRef(null);
  const heroRef = useRef(null);
  const anchorRef = useRef(null);
  const stageRef = useRef(null);
  const windowRef = useRef(null);
  const pickerRef = useRef(null);
  const [onScreen, setOnScreen] = useState(true);
  const [warm, setWarm] = useState(false);
  const [flyer, setFlyer] = useState(null);
  const [repeatRun, setRepeatRun] = useState(false);

  const active = activeId ? byId[activeId] : null;
  const story = activeId ? storyFor(activeId) : null;
  const running = RUNNING.has(phase);
  const done = landed.length >= techs.length;
  const Scene = active ? sceneFor(active.id) : null;

  // The scale the timeline runs at, so the DOM steps keep time with it.
  const speed = reduced ? 2 : 1;
  const buildSteps = story?.build.steps ?? [];
  const step = useBuildStep(phase, buildSteps.length, (phaseDuration('LIVE_BUILD', repeatRun) * 1000) / speed);
  const highlight = useMemo(
    () => (phase === 'LIVE_BUILD' && step > 0 ? lineSet(buildSteps[step - 1]?.lines) : null),
    [phase, step, buildSteps]
  );

  useEffect(() => {
    setStormNow();
    return () => tl.current?.kill();
  }, []);

  // The WebGL loop and the effects loop both stop once the section leaves
  // the viewport.
  useEffect(() => {
    const el = heroRef.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pointIn = (el) => {
    const h = heroRef.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return h
      ? { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height, cx: r.left + r.width / 2 - h.left, cy: r.top + r.height / 2 - h.top }
      : null;
  };

  const run = useCallback(
    (id, chipEl) => {
      const s = useStore.getState();
      if (!s.start(id)) return;
      const tech = byId[id];
      const repeat = s.firstDone;
      setRepeatRun(repeat);
      // A storm already on its way back is taken over by the sequence.
      gsap.killTweensOf(atmo, 'white');
      const fromClear = atmo.white > 0.02;

      atmo.accent = tech.color;
      if (chipEl) {
        const p = pointIn(chipEl);
        if (p) {
          Object.assign(atmo.pick, { x: p.cx, y: p.cy, color: tech.color });
          // The technology leaves the selector: a copy of the chip flies to
          // the centre of the stage and hands over to the 3D mark there.
          if (!reduced) setFlyer({ ...p, label: tech.name, color: tech.color, key: Date.now() });
        }
      }

      // Below the two-column layout the stage sits under the picker, so
      // bring it into view for the visitor.
      if (window.matchMedia('(max-width: 1080px)').matches) {
        stageRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      }

      tl.current?.kill();
      resetLogo();
      tl.current = buildSequence({
        repeat,
        fromClear,
        reduced,
        setPhase,
        setSky: useStore.getState().setSky,
        // One custom-property write per frame and zero React renders: the
        // hairline under the picker tracks the whole sequence.
        onUpdate: () => {
          pickerRef.current?.style.setProperty('--run', tl.current?.progress() ?? 0);
        },
        onComplete: () => {
          useStore.getState().finish();
          resetLogo();
          atmo.white = 1;
          pickerRef.current?.style.setProperty('--run', 0);
          // The white sky is the burst's moment, not a resting state. It lands
          // fully white on the beat the expertise panel appears, then settles
          // back to the storm over the next couple of seconds while the panel
          // is read. Only the weather moves: the panel, the counter and the
          // landed list are untouched, and .xp's base styling is already the
          // dark-sky one (skills-storm.css carries [data-sky='clear'] as the
          // override, not the default).
          //
          // MUST come after `atmo.white = 1` above -- stormReturn tweens from
          // the current value, so starting it first would be overwritten by
          // that assignment and the sky would stay white.
          stormReturn();
        },
      });
      tl.current.play();
    },
    [reduced, setPhase]
  );

  // The flight from the chip to the stage centre.
  const flyerRef = useRef(null);
  useLayoutEffect(() => {
    const el = flyerRef.current;
    const a = anchorRef.current;
    if (!flyer || !el || !a || !el.animate) return undefined;
    const h = heroRef.current.getBoundingClientRect();
    const r = a.getBoundingClientRect();
    const dx = r.left + r.width / 2 - h.left - flyer.cx;
    const dy = r.top + r.height / 2 - h.top - flyer.cy;
    const anim = el.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1, filter: 'blur(0px)' },
        { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 40}px) scale(1.25)`, opacity: 1, offset: 0.55, filter: 'blur(0px)' },
        { transform: `translate(${dx}px, ${dy}px) scale(0.6)`, opacity: 0, filter: 'blur(6px)' },
      ],
      { duration: 1100, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' }
    );
    anim.onfinish = () => setFlyer(null);
    return () => anim.cancel();
  }, [flyer]);

  // Straight to the result: every beat's callback still fires in order, so
  // the state machine ends exactly where it would have.
  const skipToResult = () => tl.current?.progress(1);

  const skipAll = () => {
    tl.current?.kill();
    gsap.killTweensOf(atmo, 'white');
    tl.current = null;
    resetLogo();
    logo.scale = 0;
    setClearNow();
    setFlyer(null);
    useStore.getState().skipAll();
  };

  // After white clouds, back to the storm: the sky darkens over a couple of
  // seconds (the same continuous value the burst cleared), and the page ink
  // flips back to light halfway, when the sky is dark enough to carry it.
  const stormReturn = () => {
    gsap.killTweensOf(atmo, 'white');
    let flipped = false;
    gsap.to(atmo, {
      white: 0,
      duration: reduced ? 0.6 : 2.6,
      ease: 'sine.inOut',
      onUpdate: () => {
        if (!flipped && atmo.white < 0.5) {
          flipped = true;
          useStore.getState().setSky('storm');
        }
      },
      onComplete: () => useStore.getState().setSky('storm'),
    });
  };

  const restart = () => {
    useStore.getState().restart();
    stormReturn();
  };

  const next = () => {
    const id = useStore.getState().activeId;
    useStore.getState().next();
    // The last technology ends on the summary, still under white clouds.
    // Every other exit goes back to the storm for the next build.
    if (useStore.getState().phase !== 'FINAL_STATE') stormReturn();
    // Back to the selector, on the chip just built.
    requestAnimationFrame(() => pickerRef.current?.querySelector(`[data-id="${id}"]`)?.focus({ preventScroll: true }));
  };

  const [h1a, h1b] = headline(profile.heroLine);
  const beatIndex = BEAT_ORDER.indexOf(phase);
  const codeDuration = (phaseDuration('CODE_REVEAL', repeatRun) * 1000 * 0.9) / speed;
  const compileDuration = (phaseDuration('COMPILING', repeatRun) * 1000) / speed;
  const sceneStatus =
    phase === 'LIVE_BUILD'
      ? `Building: ${buildSteps[Math.max(0, step - 1)]?.label ?? ''}`
      : story?.build.ready ?? '';

  return (
    <section
      className="hero sky-hero"
      id="top"
      data-phase={phase}
      data-sky={sky}
      data-running={running ? 'true' : 'false'}
      data-stage={STAGE_OWNS.has(phase) ? 'true' : 'false'}
      data-warm={warm ? 'true' : 'false'}
      ref={heroRef}
    >
      {/* Sits UNDER the canvas, so a render stall degrades to atmosphere
          rather than to a black rectangle. See theme-ciridae.css. */}
      <div className="hero-field" aria-hidden="true" />
      <div className="hero-canvas" aria-hidden="true">
        {webgl ? (
          <Suspense fallback={<div className="sky-flat" />}>
            <SkyScene light={small} reduced={reduced} active={onScreen} onWarm={() => setWarm(true)} />
          </Suspense>
        ) : (
          <div className="sky-flat" />
        )}
      </div>

      {/* Lifted once the scene reports its first painted frames. */}
      <div className="hero-veil" aria-hidden="true" />
      <div className="hero-scrim" aria-hidden="true" />
      {/* The clear-sky light: a white wash and warm sun, faded in by --white,
          plus the pale field dark type needs once the clouds are white. */}
      <div className="sky-haze" aria-hidden="true" />

      <StormField
        heroRef={heroRef}
        anchorRef={anchorRef}
        windowRef={windowRef}
        tech={active}
        reduced={reduced}
        small={small}
        onScreen={onScreen}
      />

      <div className="hero-grid">
        <div className="hero-copy" data-reveal data-dim={STAGE_OWNS.has(phase) ? 'true' : 'false'}>
          <p className="eyebrow">
            <span className="pip" aria-hidden="true" />
            {profile.available}
          </p>
          <h1 className="hero-h1">
            {h1a}
            <span className="hero-hi">{h1b}</span>
          </h1>
          <p className="hero-sub">{profile.heroSub}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={profile.cta.href}>
              {profile.cta.label}
            </a>
            <a className="btn btn-ghost" href="#work">
              See the work
            </a>
          </div>
        </div>

        <div className="hero-console" data-reveal>
          <div className="picker" ref={pickerRef}>
            <div className="picker-head">
              <span className="picker-title">{done ? 'The whole stack is built' : 'Pick one. Watch it compile.'}</span>
              <span className="picker-count">
                {landed.length}/{techs.length}
              </span>
            </div>

            <ul className="chips">
              {techs.map((t, i) => {
                const isLanded = landed.includes(t.id);
                const isActive = activeId === t.id;
                return (
                  <li key={t.id} data-reveal style={{ '--i': i }}>
                    <button
                      type="button"
                      className="chip"
                      data-id={t.id}
                      style={{ '--tech': t.color }}
                      data-landed={isLanded ? 'true' : 'false'}
                      data-active={isActive ? 'true' : 'false'}
                      data-away={isActive && running ? 'true' : 'false'}
                      aria-pressed={isActive}
                      disabled={running}
                      onClick={(e) => run(t.id, e.currentTarget)}
                      onPointerEnter={(e) => {
                        const p = pointIn(e.currentTarget);
                        if (p) Object.assign(atmo.hover, { x: p.cx, y: p.cy, color: t.color, target: 1 });
                      }}
                      onPointerLeave={() => {
                        atmo.hover.target = 0;
                      }}
                      aria-label={isLanded ? `${t.name}, built. Build it again` : `Build with ${t.name}`}
                    >
                      <span className="chip-dot" aria-hidden="true" />
                      {t.name}
                      {isLanded ? (
                        <span className="chip-check" aria-hidden="true">
                          ✓
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="picker-foot">
              {running ? (
                <button type="button" className="linkish" onClick={skipToResult}>
                  Skip to the result
                </button>
              ) : (
                <button type="button" className="linkish" onClick={skipAll}>
                  Land the whole stack
                </button>
              )}
              <a className="linkish" href="#work">
                See what it built
              </a>
            </div>
          </div>
        </div>
      </div>

      {flyer ? (
        <span
          key={flyer.key}
          ref={flyerRef}
          className="sky-flyer"
          aria-hidden="true"
          style={{ left: flyer.x, top: flyer.y, width: flyer.w, height: flyer.h, '--tech': flyer.color }}
        >
          <span className="chip-dot" />
          {flyer.label}
        </span>
      ) : null}

      {/* The stage: where the code, the build and the expertise appear, and
          the point the rising mark and the burst are centred on. */}
      <div className="stage" ref={stageRef} data-phase={phase}>
        <div className="stage-anchor" ref={anchorRef} aria-hidden="true" />

        <p className="sky-status" role="status" aria-live="polite" data-on={active && running ? 'true' : 'false'}>
          {active && running ? (
            <>
              <span className="sky-status-tech" style={{ '--tech': active.color }}>
                {story?.display ?? active.name}
              </span>
              <span className="sky-status-beat">{BEATS[phase]}</span>
              <span className="sky-status-dots" aria-hidden="true">
                {BEAT_ORDER.slice(0, 10).map((b, i) => (
                  <i key={b} data-on={i <= beatIndex ? 'true' : 'false'} />
                ))}
              </span>
            </>
          ) : null}
        </p>

        {active && story && CODE_PHASES.has(phase) && (
          <div className="stage-slot stage-code sky-window" key={`code-${active.id}`} ref={windowRef}>
            <CodePanel
              snippetKey={`${active.id}:story`}
              label={story.code.file}
              duration={codeDuration}
              typing={!reduced}
              numbered
              highlight={highlight}
            />
          </div>
        )}

        {active && story && BUILD_PANEL_PHASES.has(phase) && (
          <div
            className="stage-slot stage-code sky-window sky-build"
            key={`build-${active.id}`}
            data-converge={phase === 'ENERGY_BUILD' || phase === 'BURST' ? 'true' : 'false'}
            data-burst={phase === 'BURST' ? 'true' : 'false'}
          >
            <CompilePanel
              title={story.compile.title}
              steps={story.compile.steps}
              duration={compileDuration}
              done={phase !== 'COMPILING'}
              accent={active.color}
            />
          </div>
        )}

        {active && story && Scene && ART_PHASES.has(phase) && (
          <div
            className="stage-slot sky-art"
            key={`art-${active.id}`}
            data-converge={phase === 'ENERGY_BUILD' || phase === 'BURST' ? 'true' : 'false'}
            data-burst={phase === 'BURST' ? 'true' : 'false'}
            data-alive={ALIVE_PHASES.has(phase) ? 'true' : 'false'}
          >
            <Scene step={step} alive={ALIVE_PHASES.has(phase)} status={sceneStatus} story={story} tech={active} reduced={reduced} />
          </div>
        )}

        {active && story && phase === 'EXPERTISE' && (
          <div className="stage-slot stage-xp" key={`xp-${active.id}`}>
            <ExpertisePanel
              tech={active}
              story={story}
              count={landed.length}
              total={techs.length}
              isLast={done}
              onNext={next}
              onReplay={() => run(active.id, pickerRef.current?.querySelector(`[data-id="${active.id}"]`))}
            />
          </div>
        )}

        {phase === 'FINAL_STATE' && (
          <div className="stage-slot stage-xp" key="final">
            <FinalPanel total={techs.length} onReplay={restart} />
          </div>
        )}
      </div>

      <a className="scroll-cue" href="#work" aria-label="Go to the work">
        <span aria-hidden="true" />
      </a>
    </section>
  );
}
