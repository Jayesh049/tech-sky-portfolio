// One entry per technology.
// `icon` is a simple-icons slug; scripts/gen-logos.mjs turns it into public/logos/<id>.svg,
// which SVGLoader extrudes into a real mesh at runtime. No 3D models anywhere.
// `logoCode` is displayed only. `uiCode` is actually executed by Sandpack.

export const techs = [
  {
    id: 'react',
    name: 'React',
    icon: 'react',
    color: '#61DAFB',
    blurb: 'Component-driven UI',
    size: 2.5,
    extrude: { depth: 3.0, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.26, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.62, roughness: 0.22, emissive: '#61DAFB', emissiveIntensity: 0.35 },
    spin: { speed: 0.45 },
    logoCode: `const shapes = SVGLoader.createShapes(path);

const geo = new ExtrudeGeometry(shapes, {
  depth: 3.0,
  bevelEnabled: true,
  bevelThickness: 0.4,
});

geo.center();
scene.add(new Mesh(geo, material));`,
    uiCode: `import { useState } from "react";

export default function App() {
  const [n, setN] = useState(0);
  return (
    <button className="counter" onClick={() => setN(n + 1)}>
      re-rendered {n} {n === 1 ? "time" : "times"}
    </button>
  );
}`,
    uiCss: `.counter {
  font: 600 15px/1 ui-monospace, monospace;
  color: #0b1416;
  background: #61DAFB;
  border: 0;
  border-radius: 10px;
  padding: 14px 22px;
  cursor: pointer;
  transition: transform .18s cubic-bezier(.2,.7,.3,1);
}
.counter:hover { transform: translateY(-2px); }`,
  },

  {
    id: 'typescript',
    name: 'TypeScript',
    icon: 'typescript',
    color: '#3178C6',
    blurb: 'Types that catch it early',
    size: 2.3,
    extrude: { depth: 3.2, bevelEnabled: true, bevelThickness: 0.38, bevelSize: 0.24, bevelSegments: 3, curveSegments: 12 },
    material: { metalness: 0.55, roughness: 0.28, emissive: '#3178C6', emissiveIntensity: 0.4 },
    spin: { speed: 0.38 },
    logoCode: `const mat = new MeshStandardMaterial({
  color: "#3178C6",
  metalness: 0.55,
  roughness: 0.28,
  emissive: "#3178C6",
  emissiveIntensity: 0.4,
});`,
    uiCode: `export default function App() {
  const user = { name: "Jayesh", role: "engineer", years: 4 };
  return (
    <div className="card">
      <code className="sig">interface User</code>
      {Object.entries(user).map(([k, v]) => (
        <div className="row" key={k}>
          <span className="key">{k}</span>
          <span className="val">{typeof v}</span>
        </div>
      ))}
    </div>
  );
}`,
    uiCss: `.card {
  font: 13px/1.6 ui-monospace, monospace;
  background: #0f1724;
  border: 1px solid #24364f;
  border-radius: 12px;
  padding: 16px 18px;
  min-width: 230px;
}
.sig { color: #3178C6; font-weight: 700; display: block; margin-bottom: 10px; }
.row { display: flex; justify-content: space-between; gap: 24px; }
.key { color: #9fb3cd; }
.val { color: #6fd3a6; }`,
  },

  {
    id: 'nodedotjs',
    name: 'Node.js',
    icon: 'nodedotjs',
    color: '#5FA04E',
    blurb: 'The server side',
    size: 2.4,
    extrude: { depth: 3.4, bevelEnabled: true, bevelThickness: 0.42, bevelSize: 0.26, bevelSegments: 3, curveSegments: 12 },
    material: { metalness: 0.5, roughness: 0.3, emissive: '#5FA04E', emissiveIntensity: 0.32 },
    spin: { speed: 0.4 },
    logoCode: `mesh.scale.setScalar(0);

gsap.to(mesh.scale, {
  x: 1, y: 1, z: 1,
  duration: 0.6,
  ease: "back.out(1.7)",
});`,
    uiCode: `export default function App() {
  const log = [
    ["ok", "server listening on :4000"],
    ["ok", "mongo connected in 42ms"],
    ["warn", "cache empty, warming"],
  ];
  return (
    <div className="term">
      {log.map(([lvl, msg], i) => (
        <div className="line" key={i}>
          <span className={lvl}>{lvl}</span> {msg}
        </div>
      ))}
    </div>
  );
}`,
    uiCss: `.term {
  font: 12.5px/1.9 ui-monospace, monospace;
  background: #0c120c;
  border: 1px solid #24361f;
  border-radius: 12px;
  padding: 14px 16px;
  color: #cfe0c8;
  min-width: 260px;
}
.ok, .warn { font-weight: 700; margin-right: 8px; }
.ok { color: #5FA04E; }
.warn { color: #e0b155; }`,
  },

  {
    id: 'express',
    name: 'Express',
    icon: 'express',
    color: '#C8CDD4',
    blurb: 'Routes and middleware',
    size: 2.7,
    extrude: { depth: 2.8, bevelEnabled: true, bevelThickness: 0.34, bevelSize: 0.2, bevelSegments: 3, curveSegments: 12 },
    material: { metalness: 0.72, roughness: 0.2, emissive: '#8f99a6', emissiveIntensity: 0.25 },
    spin: { speed: 0.35 },
    logoCode: `useFrame((state, delta) => {
  mesh.current.rotation.y += 0.35 * delta;
  mesh.current.position.y =
    hover + Math.sin(state.clock.elapsedTime) * 0.12;
});`,
    uiCode: `export default function App() {
  const routes = [
    ["GET", "/api/orders"],
    ["POST", "/api/orders"],
    ["DELETE", "/api/orders/:id"],
  ];
  return (
    <ul className="routes">
      {routes.map(([m, p]) => (
        <li key={m + p}>
          <span className={"m " + m.toLowerCase()}>{m}</span>
          <code>{p}</code>
        </li>
      ))}
    </ul>
  );
}`,
    uiCss: `.routes {
  list-style: none; margin: 0; padding: 0;
  font: 12.5px/1 ui-monospace, monospace;
  min-width: 280px;
}
.routes li {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px;
  border: 1px solid #2a2f38;
  border-bottom: 0;
  background: #14181e;
  color: #d7dde5;
}
.routes li:first-child { border-radius: 10px 10px 0 0; }
.routes li:last-child { border-radius: 0 0 10px 10px; border-bottom: 1px solid #2a2f38; }
.m { font-weight: 700; width: 54px; }
.get { color: #6fd3a6; }
.post { color: #e0b155; }
.delete { color: #e08080; }`,
  },

  {
    id: 'mongodb',
    name: 'MongoDB',
    icon: 'mongodb',
    color: '#47A248',
    blurb: 'Documents, not rows',
    size: 2.2,
    extrude: { depth: 3.6, bevelEnabled: true, bevelThickness: 0.44, bevelSize: 0.26, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.48, roughness: 0.26, emissive: '#47A248', emissiveIntensity: 0.36 },
    spin: { speed: 0.42 },
    logoCode: `const geo = new ExtrudeGeometry(shapes, {
  depth: 3.6,
  bevelThickness: 0.44,
  bevelSegments: 3,
  curveSegments: 14,
});

geo.computeVertexNormals();`,
    uiCode: `export default function App() {
  const doc = { plan: "Protein Bowl", kcal: 540, active: true };
  return (
    <div className="doc">
      <div className="brace">{"{"}</div>
      {Object.entries(doc).map(([k, v]) => (
        <div className="f" key={k}>
          <span className="k">"{k}"</span>:{" "}
          <span className="v">{JSON.stringify(v)}</span>
        </div>
      ))}
      <div className="brace">{"}"}</div>
    </div>
  );
}`,
    uiCss: `.doc {
  font: 13px/1.8 ui-monospace, monospace;
  background: #0c130c;
  border: 1px solid #234023;
  border-radius: 12px;
  padding: 14px 18px;
  min-width: 250px;
}
.brace { color: #47A248; }
.f { padding-left: 18px; }
.k { color: #9ec99e; }
.v { color: #e6e2d8; }`,
  },

  {
    id: 'mysql',
    name: 'MySQL',
    icon: 'mysql',
    color: '#4479A1',
    blurb: 'Rows that stay fast',
    size: 2.7,
    extrude: { depth: 2.6, bevelEnabled: true, bevelThickness: 0.32, bevelSize: 0.2, bevelSegments: 3, curveSegments: 12 },
    material: { metalness: 0.66, roughness: 0.24, emissive: '#4479A1', emissiveIntensity: 0.3 },
    spin: { speed: 0.33 },
    logoCode: `const box = new Box3().setFromObject(mesh);
const span = box.getSize(new Vector3());

// normalise every logo to the same visual weight
mesh.scale.setScalar(2.7 / Math.max(span.x, span.y));`,
    uiCode: `export default function App() {
  const rows = [
    ["1", "orders", "12,480"],
    ["2", "users", "3,912"],
    ["3", "plans", "64"],
  ];
  return (
    <table className="rs">
      <thead>
        <tr><th>id</th><th>table</th><th>rows</th></tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}`,
    uiCss: `.rs {
  font: 12.5px/1 ui-monospace, monospace;
  border-collapse: collapse;
  background: #0d141b;
  border: 1px solid #1f3244;
  border-radius: 12px;
  overflow: hidden;
  min-width: 260px;
}
.rs th, .rs td { padding: 10px 16px; text-align: left; }
.rs th { background: #132132; color: #7fb0d8; font-weight: 700; }
.rs td { color: #d4dde6; border-top: 1px solid #1b2a38; }`,
  },

  {
    id: 'tailwindcss',
    name: 'Tailwind CSS',
    icon: 'tailwindcss',
    color: '#38BDF8',
    blurb: 'Styling in the markup',
    size: 2.8,
    extrude: { depth: 2.4, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.18, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.58, roughness: 0.2, emissive: '#38BDF8', emissiveIntensity: 0.42 },
    spin: { speed: 0.44 },
    logoCode: `<mesh geometry={geo}>
  <meshStandardMaterial
    color="#38BDF8"
    emissive="#38BDF8"
    emissiveIntensity={0.42}
    metalness={0.58}
  />
</mesh>`,
    uiCode: `export default function App() {
  return (
    <div className="rounded-2xl bg-slate-900 p-6 ring-1 ring-sky-400">
      <p className="text-xs uppercase tracking-widest text-sky-400">
        utility first
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-50">
        Styled in the markup
      </h1>
      <button className="mt-4 rounded-lg bg-sky-500 px-4 py-2 text-slate-950">
        Ship it
      </button>
    </div>
  );
}`,
    uiCss: `/* the utilities above, written out by hand */
.rounded-2xl { border-radius: 16px; }
.rounded-lg { border-radius: 8px; }
.bg-slate-900 { background: #0f172a; }
.bg-sky-500 { background: #0ea5e9; }
.p-6 { padding: 24px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.ring-1.ring-sky-400 { box-shadow: 0 0 0 1px #38bdf8; }
.text-xs { font-size: 11px; }
.text-2xl { font-size: 24px; }
.uppercase { text-transform: uppercase; }
.tracking-widest { letter-spacing: .18em; }
.text-sky-400 { color: #38bdf8; }
.text-slate-50 { color: #f8fafc; }
.text-slate-950 { color: #020617; }
.font-bold { font-weight: 700; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
button { border: 0; font: 600 14px system-ui; cursor: pointer; }
h1 { margin: 0; }`,
  },

  {
    id: 'redux',
    name: 'Redux',
    icon: 'redux',
    color: '#764ABC',
    blurb: 'One predictable store',
    size: 2.3,
    extrude: { depth: 3.2, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.24, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.6, roughness: 0.24, emissive: '#764ABC', emissiveIntensity: 0.44 },
    spin: { speed: 0.4 },
    logoCode: `const bloom = useRef(0.7);

gsap.timeline()
  .to(bloom, { current: 2.4, duration: 0.22 })
  .to(bloom, { current: 0.7, duration: 0.5 });`,
    uiCode: `import { useReducer } from "react";

const reducer = (s, a) =>
  a.type === "cart/add" ? { items: s.items + 1 } : s;

export default function App() {
  const [state, dispatch] = useReducer(reducer, { items: 0 });
  return (
    <div className="store">
      <span className="badge">cart: {state.items}</span>
      <button onClick={() => dispatch({ type: "cart/add" })}>
        dispatch
      </button>
    </div>
  );
}`,
    uiCss: `.store {
  display: flex; align-items: center; gap: 14px;
  font: 13px/1 ui-monospace, monospace;
  background: #150f1f;
  border: 1px solid #33254d;
  border-radius: 12px;
  padding: 14px 16px;
}
.badge { color: #c3a8e8; }
.store button {
  font: 600 13px ui-monospace, monospace;
  color: #fff; background: #764ABC;
  border: 0; border-radius: 8px; padding: 9px 14px; cursor: pointer;
}`,
  },

  {
    id: 'threedotjs',
    name: 'Three.js',
    icon: 'threedotjs',
    color: '#E8E8E8',
    blurb: 'The sky you are looking at',
    size: 2.4,
    extrude: { depth: 3.0, bevelEnabled: true, bevelThickness: 0.38, bevelSize: 0.22, bevelSegments: 3, curveSegments: 12 },
    material: { metalness: 0.8, roughness: 0.15, emissive: '#ffffff', emissiveIntensity: 0.2 },
    spin: { speed: 0.5 },
    logoCode: `// this one renders itself
<Sky
  sunPosition={sun}
  turbidity={10}
  rayleigh={evening ? 3 : 1}
  mieCoefficient={0.005}
/>`,
    uiCode: `export default function App() {
  const faces = ["fr", "bk", "lf", "rt", "tp", "bt"];
  return (
    <div className="stage">
      <div className="cube">
        {faces.map((f) => (
          <div className={"face " + f} key={f} />
        ))}
      </div>
    </div>
  );
}`,
    uiCss: `.stage { perspective: 520px; padding: 30px; }
.cube {
  position: relative;
  width: 96px; height: 96px;
  margin: 0 auto;
  transform-style: preserve-3d;
  animation: spin 9s linear infinite;
}
.face {
  position: absolute; inset: 0;
  border: 1px solid rgba(255,255,255,.55);
  background: rgba(180,200,220,.07);
}
.fr { transform: translateZ(48px); }
.bk { transform: rotateY(180deg) translateZ(48px); }
.lf { transform: rotateY(-90deg) translateZ(48px); }
.rt { transform: rotateY(90deg) translateZ(48px); }
.tp { transform: rotateX(90deg) translateZ(48px); }
.bt { transform: rotateX(-90deg) translateZ(48px); }
@keyframes spin {
  to { transform: rotateX(360deg) rotateY(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .cube { animation: none; transform: rotateX(-22deg) rotateY(34deg); }
}`,
  },

  {
    id: 'springboot',
    name: 'Spring Boot',
    icon: 'springboot',
    color: '#6DB33F',
    blurb: 'Java that starts up',
    size: 2.3,
    extrude: { depth: 3.4, bevelEnabled: true, bevelThickness: 0.42, bevelSize: 0.25, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.52, roughness: 0.28, emissive: '#6DB33F', emissiveIntensity: 0.34 },
    spin: { speed: 0.36 },
    logoCode: `gsap.to(logo.position, {
  y: 14,
  duration: 0.8,
  ease: "power2.in",
});

// straight up. no arc.`,
    uiCode: `export default function App() {
  const res = { status: "UP", db: "UP", uptime: "11d 4h" };
  return (
    <div className="res">
      <div className="head">
        <span className="ok">200</span> GET /actuator/health
      </div>
      {Object.entries(res).map(([k, v]) => (
        <div className="row" key={k}>
          <span>{k}</span><b>{v}</b>
        </div>
      ))}
    </div>
  );
}`,
    uiCss: `.res {
  font: 12.5px/1 ui-monospace, monospace;
  background: #0d130b;
  border: 1px solid #2a4020;
  border-radius: 12px;
  overflow: hidden;
  min-width: 270px;
  color: #d8e3d2;
}
.head { padding: 12px 16px; background: #131c10; border-bottom: 1px solid #2a4020; }
.ok {
  background: #6DB33F; color: #08120b; font-weight: 700;
  border-radius: 5px; padding: 3px 7px; margin-right: 8px;
}
.row { display: flex; justify-content: space-between; padding: 10px 16px; }
.row span { color: #8fae7c; }
.row b { color: #eef3ea; }`,
  },
  // From the 2026 resume: .NET, Angular, Next.js, PostgreSQL + pgvector,
  // Python, Docker, GitHub Actions, and the AI work (LLMs, RAG, MCP). No
  // logoCode or uiCode on these: the sequence uses techStory.js instead.
  // `glyph` is a hand-drawn 24x24 mark for the three without a brand icon.
  {
    id: 'dotnet',
    name: '.NET',
    icon: 'dotnet',
    color: '#7C5CFF',
    blurb: 'Typed services in C#',
    size: 2.4,
    extrude: { depth: 3.0, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.24, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.55, roughness: 0.28, emissive: '#512BD4', emissiveIntensity: 0.4 },
    spin: { speed: 0.4 },
  },

  {
    id: 'angular',
    name: 'Angular',
    icon: 'angular',
    color: '#DD0031',
    blurb: 'Components with signals',
    size: 2.4,
    extrude: { depth: 3.0, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.24, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.55, roughness: 0.28, emissive: '#DD0031', emissiveIntensity: 0.4 },
    spin: { speed: 0.38 },
  },

  {
    id: 'nextdotjs',
    name: 'Next.js',
    icon: 'nextdotjs',
    color: '#FFFFFF',
    blurb: 'React on the server',
    size: 2.4,
    extrude: { depth: 3.0, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.24, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.6, roughness: 0.25, emissive: '#9aa4b2', emissiveIntensity: 0.4 },
    spin: { speed: 0.42 },
  },

  {
    id: 'postgresql',
    name: 'PostgreSQL',
    icon: 'postgresql',
    color: '#4169E1',
    blurb: 'Rows and vectors',
    size: 2.4,
    extrude: { depth: 3.0, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.24, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.55, roughness: 0.28, emissive: '#4169E1', emissiveIntensity: 0.4 },
    spin: { speed: 0.36 },
  },

  {
    id: 'python',
    name: 'Python',
    icon: 'python',
    color: '#3776AB',
    blurb: 'Data and models',
    size: 2.4,
    extrude: { depth: 3.0, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.24, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.55, roughness: 0.28, emissive: '#3776AB', emissiveIntensity: 0.4 },
    spin: { speed: 0.4 },
  },

  {
    id: 'docker',
    name: 'Docker',
    icon: 'docker',
    color: '#2496ED',
    blurb: 'Ships the same everywhere',
    size: 2.5,
    extrude: { depth: 3.0, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.24, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.55, roughness: 0.28, emissive: '#2496ED', emissiveIntensity: 0.4 },
    spin: { speed: 0.38 },
  },

  {
    id: 'githubactions',
    name: 'GitHub Actions',
    icon: 'githubactions',
    color: '#2088FF',
    blurb: 'CI/CD to AWS',
    size: 2.4,
    extrude: { depth: 3.0, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.24, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.55, roughness: 0.28, emissive: '#2088FF', emissiveIntensity: 0.4 },
    spin: { speed: 0.4 },
  },

  {
    id: 'llm',
    name: 'LLMs',
    icon: null,
    glyph: ['M10 1Q11 9 19 10Q11 11 10 19Q9 11 1 10Q9 9 10 1Z', 'M19.5 15.5Q19.8 19.2 23.5 19.5Q19.8 19.8 19.5 23.5Q19.2 19.8 15.5 19.5Q19.2 19.2 19.5 15.5Z'],
    color: '#C8A2FF',
    blurb: 'Prompts with contracts',
    size: 2.4,
    extrude: { depth: 3.2, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.24, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.5, roughness: 0.3, emissive: '#9B6BFF', emissiveIntensity: 0.4 },
    spin: { speed: 0.5 },
  },

  {
    id: 'rag',
    name: 'RAG',
    icon: null,
    glyph: ['M2 1h8.5L14 4.5V10h-2V6h-3.5V3H4v14h4v2H2z', 'M5.5 7h4v1.5h-4zM5.5 10h3v1.5h-3z', 'M15.5 10a5.5 5.5 0 1 1 0 11a5.5 5.5 0 1 1 0-11zM15.5 12.2a3.3 3.3 0 1 0 0 6.6a3.3 3.3 0 1 0 0-6.6z', 'M19.2 20.6l1.4-1.4 3.2 3.2-1.4 1.4z'],
    color: '#2FD4B2',
    blurb: 'Answers from sources',
    size: 2.4,
    extrude: { depth: 3.0, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.24, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.5, roughness: 0.3, emissive: '#1FB89A', emissiveIntensity: 0.4 },
    spin: { speed: 0.4 },
  },

  {
    id: 'mcp',
    name: 'MCP',
    icon: null,
    glyph: ['M12 8.9a3.6 3.6 0 1 1 0 7.2a3.6 3.6 0 1 1 0 -7.2zM12 10.9a1.6 1.6 0 1 0 0 3.2a1.6 1.6 0 1 0 0 -3.2z', 'M12 0.3999999999999999a2.6 2.6 0 1 1 0 5.2a2.6 2.6 0 1 1 0 -5.2z', 'M13.10 9.10L13.10 5.40L10.90 5.40L10.90 9.10Z', 'M3.5 15.9a2.6 2.6 0 1 1 0 5.2a2.6 2.6 0 1 1 0 -5.2z', 'M8.59 13.56L4.83 16.22L6.10 18.01L9.86 15.36Z', 'M20.5 15.9a2.6 2.6 0 1 1 0 5.2a2.6 2.6 0 1 1 0 -5.2z', 'M14.14 15.36L17.90 18.01L19.17 16.22L15.41 13.56Z'],
    color: '#7AA2F7',
    blurb: 'Tools for agents',
    size: 2.4,
    extrude: { depth: 3.0, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.24, bevelSegments: 3, curveSegments: 14 },
    material: { metalness: 0.5, roughness: 0.3, emissive: '#5B7FE0', emissiveIntensity: 0.4 },
    spin: { speed: 0.42 },
  },
];

export const byId = Object.fromEntries(techs.map((t) => [t.id, t]));
