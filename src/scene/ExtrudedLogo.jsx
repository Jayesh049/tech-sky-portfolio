import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { ExtrudeGeometry, Box3, Vector3 } from 'three';

export const logoUrl = (id) => `${import.meta.env.BASE_URL}logos/${id}.svg`;

export function preloadLogos(ids) {
  ids.forEach((id) => useLoader.preload(SVGLoader, logoUrl(id)));
}

// A flat SVG becomes a real mesh: shapes out of the path data, extruded and
// bevelled, then normalised so every logo carries the same visual weight.
function useLogoGeometry(tech) {
  const data = useLoader(SVGLoader, logoUrl(tech.id));

  return useMemo(() => {
    const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
    const geo = new ExtrudeGeometry(shapes, { ...tech.extrude, bevelOffset: 0 });
    geo.center();

    const span = new Box3()
      .setFromBufferAttribute(geo.attributes.position)
      .getSize(new Vector3());
    const k = tech.size / Math.max(span.x, span.y);
    geo.scale(k, k, k);
    geo.computeVertexNormals();

    return geo;
  }, [data, tech]);
}

export default function ExtrudedLogo({ tech, matRef }) {
  const geometry = useLogoGeometry(tech);
  const m = tech.material;

  return (
    // SVG space is Y-down. A half turn on X flips it without inverting the
    // winding order, which a negative scale would.
    <mesh geometry={geometry} rotation-x={Math.PI}>
      <meshStandardMaterial
        ref={matRef}
        color={tech.color}
        metalness={m.metalness}
        roughness={m.roughness}
        emissive={m.emissive}
        emissiveIntensity={m.emissiveIntensity}
        transparent
        opacity={1}
      />
    </mesh>
  );
}
