import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, AdaptiveDpr } from '@react-three/drei';
import { Vector3 } from 'three';

import SkyDome from './SkyDome.jsx';
import CloudLayer from './CloudLayer.jsx';
import LogoStage from './LogoStage.jsx';
import { preloadLogos } from './ExtrudedLogo.jsx';
import { cam, view, atmo, STORM, CLEAR } from './state.js';
import { techs } from '../data/techs.js';

preloadLogos(techs.map((t) => t.id));

const RADIUS = 14;
const target = new Vector3();

function Rig() {
  // Lerped, never applied raw: the scroll driver can jump `view.parallax` by a
  // large step on a fling, and assigning that straight to the camera snaps.
  const p = useRef(0);

  useFrame((state, delta) => {
    p.current += (view.parallax - p.current) * Math.min(1, delta * 6);
    const t = state.clock.elapsedTime;
    // a slow ±3° drift that damps out while a sequence is running
    const a = Math.sin(t * 0.11) * (3 * Math.PI) / 180 * cam.orbit;
    // Pitched up past the half-FOV so the flat sub-horizon band never enters
    // frame. The logo stage is raised to match, which keeps it centred.
    state.camera.position.set(
      Math.sin(a) * RADIUS,
      -2.6 + cam.tilt * 5 + p.current * 1.8,
      Math.cos(a) * RADIUS
    );
    target.set(0, 3.2 + cam.tilt * 42 + p.current * 4, 0);
    // Shake while the energy builds and at the burst. Two incommensurate
    // sines rather than noise, so it reads as a tremor, not jitter.
    if (atmo.shake > 0.001) {
      const k = atmo.shake * 0.09;
      state.camera.position.x += Math.sin(t * 53.1) * k;
      state.camera.position.y += Math.sin(t * 47.7 + 1.3) * k;
    }
    state.camera.lookAt(target);
  });
  return null;
}

const SUN_A = new Vector3(...STORM.sun).normalize();
const SUN_B = new Vector3(...CLEAR.sun).normalize();

function SunLight() {
  const ref = useRef(null);
  const amb = useRef(null);
  useFrame(() => {
    const l = ref.current;
    if (!l) return;
    const w = atmo.white;
    l.position.copy(SUN_A).lerp(SUN_B, w).normalize().multiplyScalar(30);
    // 2.5 is what the old low-sun formula gave for the storm sun, so the
    // dark state is lit exactly as before.
    l.intensity = 2.5 + (CLEAR.sunLight - 2.5) * w + atmo.charge * 0.8;
    if (amb.current) amb.current.intensity = STORM.ambient + (CLEAR.ambient - STORM.ambient) * w;
  });
  // CIRIDAE GRADE: about half the old output. Low enough that the clouds stay
  // in the void's tonal register, high enough that they are actually visible —
  // the first pass at 2.4 made them disappear entirely.
  return (
    <>
      <ambientLight ref={amb} intensity={STORM.ambient} />
      <directionalLight ref={ref} color="#e8c9ad" intensity={2.5} />
    </>
  );
}

// Counts committed frames. Mounted inside the inner Suspense, so it cannot
// start until SkyDome, CloudLayer and the SVG logo loads have all resolved:
// once it fires, the scene is provably painted.
//
// It also publishes the running count onto the canvas's wrapper as
// data-frames, throttled to ~4Hz. That is the only honest way to assert from
// outside that the render loop is ALIVE: a canvas can be mounted, sized and
// hold a live WebGL context while never having been drawn into once, which is
// exactly the failure this component exists to prevent. Pixel-diffing the
// composited page cannot tell "not rendering" from "rendering something that
// happens to be dark".
function Warmup({ frames = 10, onWarm }) {
  const n = useRef(0);
  const published = useRef(0);
  useFrame((state) => {
    n.current += 1;
    if (n.current === frames) onWarm();
    const t = state.clock.elapsedTime;
    if (t - published.current > 0.25) {
      published.current = t;
      // closest(), not parentElement: R3F wraps the canvas in its own div, so
      // the parent is an internal node the page never names.
      const host = state.gl.domElement.closest('.hero-canvas');
      if (host) host.dataset.frames = String(n.current);
    }
  });
  return null;
}

export default function SkyScene({ light = false, reduced = false, active = true, onWarm }) {
  // The hero sits below the fold now, so the IntersectionObserver reports
  // off-screen on its very first callback — before a single frame has been
  // drawn. Holding 'always' until the scene is warm is what stops the canvas
  // being handed to the compositor as an undrawn (opaque black) buffer.
  const [warm, setWarm] = useState(false);

  return (
    <Canvas
      dpr={light ? [1, 1.25] : [1, 2]}
      // Never 'never': invalidate() is a no-op there, so a canvas parked in
      // that state can never repaint itself. 'demand' still stops useFrame
      // (the battery goal) but any prop or scene change paints a frame.
      frameloop={!warm || active ? 'always' : 'demand'}
      gl={{
        antialias: !light,
        powerPreference: 'high-performance',
        alpha: false,
        // The Preetham model radiates well above 1.0. The three.js Sky example
        // pairs it with an exposure around 0.5 for exactly this reason: leave
        // it at 1 and the whole dome clips to white.
        toneMappingExposure: 0.34,
      }}
      camera={{ position: [0, -2.6, RADIUS], fov: 45, near: 0.1, far: 600000 }}
    >
      <Suspense fallback={null}>
        <SkyDome />
        <CloudLayer light={light} still={reduced} />

        <SunLight />

        {/* A local studio instead of a CDN HDR: metals get something to
            reflect without the page depending on someone else's server. */}
        <Environment resolution={192} frames={1}>
          {/* Ember key. The cold blue fill that used to sit opposite it is now
              Ash: Ciridae permits exactly one chromatic colour, so a second
              accent in the reflections would break the system. */}
          <Lightformer intensity={0.9} color="#cc6437" position={[0, 3, -9]} scale={[12, 8, 1]} />
          <Lightformer intensity={0.45} color="#cecece" position={[-8, 6, 4]} scale={[8, 8, 1]} />
          <Lightformer intensity={0.35} color="#cecece" position={[8, -2, 4]} scale={[6, 6, 1]} />
          <Lightformer intensity={0.6} form="ring" color="#cc6437" position={[0, -6, -6]} scale={[9, 9, 1]} />
        </Environment>

        <LogoStage />
        <Rig />
        <Warmup
          frames={10}
          onWarm={() => {
            setWarm(true);
            onWarm?.();
          }}
        />
      </Suspense>

      <AdaptiveDpr pixelated={false} />
    </Canvas>
  );
}
