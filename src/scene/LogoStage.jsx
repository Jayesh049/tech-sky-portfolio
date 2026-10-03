import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, AdditiveBlending, Vector3 } from 'three';
import ExtrudedLogo from './ExtrudedLogo.jsx';
import { logo, sky, atmo, LOGO_BASE_Y, BLOOM_REST, BLOOM_PEAK } from './state.js';
import { byId } from '../data/techs.js';
import { useStore } from '../store.js';

// A soft radial falloff, drawn once into a canvas. This is the arrival pulse.
// A full-screen bloom pass cannot be used here: the Preetham sky is brighter
// than any logo, so a threshold low enough to catch the mesh washes the whole
// frame white. Glowing the object itself is both truer and cheaper.
function useGlowTexture() {
  return useMemo(() => {
    const s = 128;
    const c = document.createElement('canvas');
    c.width = s;
    c.height = s;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.18, 'rgba(255,255,255,0.62)');
    grad.addColorStop(0.45, 'rgba(255,255,255,0.2)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
    return new CanvasTexture(c);
  }, []);
}

const ray = new Vector3();

export default function LogoStage() {
  const activeId = useStore((s) => s.activeId);
  const group = useRef(null);
  const matRef = useRef(null);
  const glowRef = useRef(null);
  const glowMat = useRef(null);
  const glow = useGlowTexture();
  const tech = activeId ? byId[activeId] : null;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g || !tech) return;

    logo.spin += (tech.spin.speed + logo.boost) * delta;

    // Pinned under the orbit's screen anchor (written by StormField from the
    // stage element's box), on the z = 0 plane, so the 3D mark and the DOM
    // orbit around it always share a centre whatever the layout does.
    if (atmo.anchored) {
      const cam = state.camera;
      ray.set(atmo.ndcX, atmo.ndcY, 0.5).unproject(cam).sub(cam.position).normalize();
      const k = -cam.position.z / ray.z;
      g.position.copy(cam.position).addScaledVector(ray, k);
      g.position.y += logo.y;
    } else {
      g.position.set(0, LOGO_BASE_Y + logo.y, 0);
    }
    g.rotation.y = logo.spin;
    g.scale.setScalar(logo.scale * (atmo.logoScale ?? 1));
    g.visible = logo.scale > 0.001 && logo.fade > 0.01;

    if (matRef.current) {
      matRef.current.opacity = logo.fade;
      matRef.current.emissiveIntensity =
        tech.material.emissiveIntensity * (0.6 + 0.9 * logo.scale);
    }

    // Derived from the constants rather than repeating them, so the rest and
    // peak can be retuned in one place without silently desyncing this map.
    const pulse = Math.max(0, (sky.bloom - BLOOM_REST) / (BLOOM_PEAK - BLOOM_REST));
    if (glowRef.current) {
      const s = tech.size * (1.5 + pulse * 0.9);
      glowRef.current.scale.set(s, s, s);
    }
    if (glowMat.current) {
      glowMat.current.opacity = logo.fade * (0.14 + pulse * 0.4);
    }
  });

  if (!tech) return null;

  return (
    <group ref={group} position={[0, LOGO_BASE_Y, 0]}>
      {/* The extruded mark keeps its brand colour: it is content, and
          desaturating a brand mark would be wrong. The glow around it is
          atmosphere, so it is Ember for every technology. That is what keeps
          "one chromatic colour" true of the system. */}
      <sprite ref={glowRef} position={[0, 0, -0.6]}>
        <spriteMaterial
          ref={glowMat}
          map={glow}
          color="#cc6437"
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </sprite>

      <Suspense fallback={null}>
        <ExtrudedLogo tech={tech} matRef={matRef} />
      </Suspense>
    </group>
  );
}
