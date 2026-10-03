import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Clouds, Cloud } from '@react-three/drei';
import { Color, MeshLambertMaterial } from 'three';
import { sky, atmo, CLOUD_RAMP } from './state.js';

const BOUND = 40;

// Bundled with the site. drei's default is a CDN URL, and when that host was
// unreachable the texture load threw, the error boundary caught it and the
// whole skills section fell back to a flat screen with no chips.
const CLOUD_TEXTURE = `${import.meta.env.BASE_URL}media/cloud.png`;

function Drifter({ speed, start, children }) {
  const ref = useRef(null);

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    // sky.drift is tweened by the sequence: faster while it builds, slower
    // once the storm has cleared.
    g.position.x -= speed * sky.drift * delta;
    if (g.position.x < -BOUND) g.position.x += BOUND * 2;
    // The burst pushes every body outward for a moment.
    g.scale.setScalar(1 + atmo.shock * 0.22);
  });

  return (
    <group ref={ref} position={[start, 0, 0]}>
      {children}
    </group>
  );
}

// Smoke, not cumulus, at the storm end. Opacity and colour are lifted by
// atmo.white as the storm clears, through the material every instance shares.
const FULL = [
  { start: 8, speed: 0.9, pos: [0, 6.5, -18], seed: 11, segments: 26, bounds: [7, 1.2, 2], volume: 4.5, opacity: 0.34, growth: 6 },
  { start: -16, speed: 0.55, pos: [0, 9, -26], seed: 27, segments: 20, bounds: [9, 1.4, 2], volume: 5.5, opacity: 0.26, growth: 7 },
  { start: 26, speed: 1.3, pos: [0, 12, -14], seed: 44, segments: 14, bounds: [5, 1, 1.6], volume: 3, opacity: 0.2, growth: 5 },
  { start: -34, speed: 0.35, pos: [0, 4.5, -40], seed: 58, segments: 18, bounds: [12, 1.8, 3], volume: 7, opacity: 0.17, growth: 8 },
  { start: 38, speed: 1.7, pos: [0, 15, -22], seed: 73, segments: 12, bounds: [4, 0.9, 1.4], volume: 2.4, opacity: 0.15, growth: 5 },
  // More body across the whole frame: one low and close, three high, one far.
  { start: -4, speed: 0.7, pos: [0, 3, -10], seed: 91, segments: 16, bounds: [8, 1, 2], volume: 4, opacity: 0.22, growth: 5 },
  { start: 20, speed: 1.0, pos: [0, 18, -30], seed: 103, segments: 16, bounds: [10, 1.4, 2], volume: 6, opacity: 0.2, growth: 7 },
  { start: -26, speed: 0.8, pos: [0, 23, -24], seed: 117, segments: 14, bounds: [8, 1.2, 2], volume: 5, opacity: 0.18, growth: 6 },
  { start: 12, speed: 0.45, pos: [0, 10, -48], seed: 129, segments: 18, bounds: [14, 2, 3], volume: 8, opacity: 0.2, growth: 8 },
];

// Phones get four bodies, not two: enough to read as a sky.
const LIGHT = [FULL[0], FULL[1], FULL[5], FULL[6]];

// Piecewise lerp through the ramp: black, charcoal, blue-grey, soft grey, white.
export function rampColor(ramp, k, out) {
  const n = ramp.length - 1;
  const x = Math.min(n, Math.max(0, k * n));
  const i = Math.min(n - 1, Math.floor(x));
  return out.copy(ramp[i]).lerp(ramp[i + 1], x - i);
}

// `still` renders the volumetrics with every motion switched off. The clouds
// ARE the atmosphere, so a reduced-motion visitor still gets them; what they
// lose is the drift and the internal churn, not the sky itself.
export default function CloudLayer({ light = false, still = false }) {
  const set = light ? LIGHT : FULL;
  const group = useRef(null);
  const ramp = useMemo(() => CLOUD_RAMP.map((c) => new Color(c)), []);
  const tint = useMemo(() => new Color(), []);

  useFrame(() => {
    const mesh = group.current?.children.find((c) => c.isInstancedMesh);
    const m = mesh?.material;
    if (!m) return;
    rampColor(ramp, atmo.white, m.color);
    // A little light inside the storm while it charges, then full white body.
    m.color.lerp(tint.set('#ffe7c8'), atmo.charge * 0.25);
    // Denser than the old smoke grade in both skies, so the clouds read as
    // clouds and not as haze.
    m.opacity = 2.1 + atmo.white * 1.0 + atmo.energy * 0.2;
    // A little light inside even in the storm; lit through once it clears,
    // so the white clouds read brighter than the sky behind them.
    m.emissive.setRGB(1, 1, 1);
    m.emissiveIntensity = 0.16 + atmo.white * atmo.white * 1.6;
  });

  return (
    <Clouds
      ref={group}
      texture={CLOUD_TEXTURE}
      material={MeshLambertMaterial}
      limit={light ? 140 : 400}
      range={light ? 60 : 220}
    >
      {set.map((c) => (
        <Drifter key={c.seed} speed={still ? 0 : c.speed} start={c.start}>
          <Cloud
            seed={c.seed}
            position={c.pos}
            segments={c.segments}
            bounds={c.bounds}
            volume={c.volume}
            opacity={c.opacity}
            growth={c.growth}
            speed={still ? 0 : 0.05}
            // White here; the tint lives on the shared material so it can
            // move every frame without a render.
            color="#ffffff"
            fade={62}
          />
        </Drifter>
      ))}
    </Clouds>
  );
}
