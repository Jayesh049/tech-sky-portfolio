import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { Vector3 } from 'three';
import { atmo, STORM, CLEAR } from './state.js';

// drei's Sky is the Preetham atmospheric model. The storm is the model with a
// low sun behind the camera and heavy haze; the clear sky is the same model
// with the sun high in front and the haze thinned. atmo.white moves every
// parameter between the two, so the sky itself clears rather than being
// swapped for a picture of a clear sky. See state.js for the grading notes.
const A = new Vector3(...STORM.sun);
const B = new Vector3(...CLEAR.sun);
const lerp = (a, b, k) => a + (b - a) * k;

export default function SkyDome() {
  const ref = useRef(null);

  useFrame((state) => {
    const u = ref.current?.material?.uniforms;
    if (!u) return;
    const w = atmo.white;
    // Eased per parameter: the haze thins first, then the sun climbs.
    const haze = Math.min(1, w * 1.35);
    const sun = w * w * (3 - 2 * w);
    u.sunPosition.value.copy(A).lerp(B, sun);
    u.rayleigh.value = lerp(STORM.rayleigh, CLEAR.rayleigh, sun);
    u.turbidity.value = lerp(STORM.turbidity, CLEAR.turbidity, haze);
    u.mieCoefficient.value = lerp(STORM.mie, CLEAR.mie, haze);
    u.mieDirectionalG.value = lerp(STORM.mieG, CLEAR.mieG, sun);
    // A little light inside the storm while it charges and at the burst.
    state.gl.toneMappingExposure =
      lerp(STORM.exposure, CLEAR.exposure, w) + atmo.charge * 0.05 + atmo.shock * 0.12;
  });

  return (
    <Sky
      ref={ref}
      distance={450000}
      sunPosition={STORM.sun}
      turbidity={STORM.turbidity}
      rayleigh={STORM.rayleigh}
      mieCoefficient={STORM.mie}
      mieDirectionalG={STORM.mieG}
    />
  );
}
