# Tech Sky — Build Spec

Hand this whole file to Cursor or Claude Code in a fresh Vite + React repo. Build in the phase order at the bottom; do not attempt all phases in one pass.

---

## Concept

An interactive portfolio hero. A 3D sky with drifting volumetric clouds sits at day. When a visitor picks a technology, its logo is **compiled on screen** — a code panel types the CSS/GLSL that defines it, and the described object then actually appears as a real 3D mesh. The logo launches straight up into the sky. The sun drops to the horizon and the sky becomes evening, then holds still. A second code panel types a React snippet, and that snippet **actually executes** in a live runtime to produce the UI it describes.

The thesis of the piece: nothing here is an asset. Every visual is code the visitor watched get written.

---

## Stack

```
react react-dom vite
three @react-three/fiber @react-three/drei @react-three/postprocessing
gsap
@codesandbox/sandpack-react
shiki
zustand
```

- **three / R3F / drei** — the scene, sky, clouds, extruded logos
- **gsap** — sequence orchestration (timelines with labels)
- **sandpack-react** — the live React runtime that executes typed code
- **shiki** — VSCode-grade syntax highlighting in code panels
- **zustand** — sequence state shared between DOM UI and 3D scene without prop drilling

Do not add Framer Motion. GSAP handles the orchestration; mixing two animation systems across the R3F boundary causes conflicts.

---

## Data model

One entry per technology. `logoSvg` is a path to a flat SVG (use devicon or simple-icons) which gets extruded into 3D at runtime — no 3D modelling required.

```js
{
  id: "react",
  name: "React",
  color: "#61DAFB",
  logoSvg: "/logos/react.svg",

  // Extrusion params for SVGLoader -> ExtrudeGeometry
  extrude: {
    depth: 6,
    bevelEnabled: true,
    bevelThickness: 1.2,
    bevelSize: 0.8,
    scale: 0.02,          // SVG units are large; scale down to scene units
  },

  // Material
  material: {
    metalness: 0.6,
    roughness: 0.25,
    emissive: "#61DAFB",
    emissiveIntensity: 0.4,
  },

  // Idle rotation once compiled
  spin: { axis: "y", speed: 0.4 },

  // Code that "builds" the logo — displayed, not executed
  logoCode: `const geo = new ExtrudeGeometry(shape, {
  depth: 6,
  bevelEnabled: true,
});
mesh.rotation.y += 0.4 * delta;`,

  // Code that IS executed by Sandpack — must be a valid standalone React module
  uiCode: `export default function App() {
  return (
    <button className="btn">Click me</button>
  );
}`,
  uiCss: `.btn {
  padding: 10px 20px;
  border-radius: 8px;
  background: #61DAFB;
  border: none;
  font-weight: 600;
}`,
}
```

### >>> PASTE YOUR TECHNOLOGY LIST HERE <<<

Replace the sample entries with the real stack. For each one supply: `name`, brand `color`, an SVG logo, and a short `uiCode` snippet that renders something small and characteristic of that technology (a button, a card, a badge, a form field — under 15 lines).

---

## Scene architecture

```
src/
  store.js                  zustand: { phase, activeTech, setPhase, throwTech }
  data/techs.js             the array above
  scene/
    SkyScene.jsx            <Canvas> root, camera, lights, postprocessing
    Sky.jsx                 drei <Sky> with animated sunPosition
    CloudLayer.jsx          drei <Clouds>, drifting right -> left
    ExtrudedLogo.jsx        SVGLoader -> ExtrudeGeometry -> mesh
    LogoStage.jsx           positions the active logo, drives launch
  ui/
    CodePanel.jsx           shiki-highlighted typewriter, in drei <Html>
    LivePreview.jsx         Sandpack runtime, in drei <Html>
    TechPicker.jsx          DOM chips + input, outside the canvas
    LandedRail.jsx          DOM list of completed techs
  sequence/
    timeline.js             GSAP timeline factory per throw
```

---

## The sequence

A state machine in zustand. Phases:

```
IDLE → CODE_LOGO → COMPILE → LAUNCH → SKY_SHIFT → HOLD → CODE_UI → EXECUTE → SETTLE → IDLE
```

| Phase | Duration | What happens |
|---|---|---|
| `IDLE` | — | Day sky. Clouds drift right→left. Camera slow-orbits ±3°. |
| `CODE_LOGO` | ~1.4s | Code panel fades in low in frame, types `logoCode` via shiki. |
| `COMPILE` | 0.6s | Panel dissolves. Extruded logo scales 0→1 with a slight overshoot, bloom pulse on arrival. |
| `LAUNCH` | 0.8s | Logo translates straight up on Y, no arc. Slight rotation acceleration. Camera tilts up to follow. |
| `SKY_SHIFT` | 1.6s | GSAP tweens `sunPosition` from high to horizon. Sky shader resolves to evening naturally. Cloud drift speed tweens to 0. |
| `HOLD` | 0.8s | Everything still. Logo hangs, slowly spinning. This is the beat that sells it. |
| `CODE_UI` | ~1.6s | Second code panel types `uiCode`. |
| `EXECUTE` | 0.5s | Sandpack mounts and runs the code. Panel cross-fades into the live output. |
| `SETTLE` | 1.2s | Output floats. Logo drifts to the landed rail. Sun returns to day **only if this is the last tech in the session** (see below). |

### Pacing rule — important

Run the **full sequence for the first technology only**. It is the hero moment and earns its length.

For every technology after the first:
- Skip `CODE_LOGO`. Instead keep a persistent code rail pinned to one side that live-updates as each logo compiles.
- Keep the sky at evening. Do not round-trip day↔evening per throw — repeated sunsets become tedious by the third one.
- Collapse to: `COMPILE → LAUNCH → CODE_UI → EXECUTE → SETTLE`, roughly 3.5s total.

Ten technologies at the full sequence is around two minutes of watching. Ten at the collapsed sequence is under forty seconds, and the message is identical.

---

## Implementation notes

### Sky

Use drei's `<Sky>`, which implements the Preetham atmospheric model. Do not hand-roll a gradient.

```jsx
<Sky
  distance={450000}
  sunPosition={sunPos}      // animated Vector3
  inclination={inclination}
  azimuth={0.25}
  turbidity={10}
  rayleigh={evening ? 3 : 1}
  mieCoefficient={0.005}
  mieDirectionalG={0.8}
/>
```

Tween `sunPosition` from roughly `[0, 100, -100]` (day) to `[0, 2, -100]` (horizon) and raise `rayleigh`. Sunset colour emerges from the physics — you do not specify orange anywhere.

### Clouds

drei `<Clouds>` with several `<Cloud>` instances at varying `segments`, `bounds`, `volume`, and `opacity` for depth. Drift in `useFrame`:

```js
useFrame((state, delta) => {
  ref.current.position.x -= driftSpeed.current * delta;
  if (ref.current.position.x < -BOUND) ref.current.position.x = BOUND;
});
```

`driftSpeed` is a ref GSAP tweens to `0` during `SKY_SHIFT`, giving a natural deceleration to stillness rather than an abrupt freeze.

### Extruded logos

```js
const { paths } = useLoader(SVGLoader, tech.logoSvg);
const shapes = paths.flatMap(p => SVGLoader.createShapes(p));
const geometry = new ExtrudeGeometry(shapes, tech.extrude);
geometry.center();
```

Wrap in `useMemo` keyed on `tech.id`. Apply `MeshStandardMaterial` from `tech.material`. Add `<Environment preset="sunset" />` so the metalness has something to reflect — without it, metallic materials render black.

### Code panels in 3D

```jsx
<Html transform occlude distanceFactor={8} position={panelPos}>
  <CodePanel code={tech.logoCode} lang="js" />
</Html>
```

`transform` makes the panel sit in 3D space and respect perspective. Highlight with shiki at build time where possible (it is heavy at runtime); pre-tokenize the snippets in a build step and ship the tokens.

### Live execution

```jsx
<Sandpack
  template="react"
  files={{
    "/App.js": tech.uiCode,
    "/styles.css": tech.uiCss,
  }}
  options={{ showTabs: false, showLineNumbers: false, editorHeight: 0 }}
/>
```

Render **preview only** — hide the editor entirely, since the code panel already showed the code. Lazy-load Sandpack with `React.lazy`; it bundles a full runtime and will hurt initial load if eagerly imported. Mount **one instance at a time** and unmount on `SETTLE`. Do not keep a live Sandpack per landed technology.

### Postprocessing

```jsx
<EffectComposer>
  <Bloom luminanceThreshold={0.6} intensity={0.8} mipmapBlur />
</EffectComposer>
```

Drive `intensity` up briefly on `COMPILE` for the arrival pulse, then back down.

---

## Quality floor

- **Reduced motion**: on `prefers-reduced-motion`, skip clouds and launch animation, snap through phases, keep the code typing but at 4× speed. The content must remain reachable.
- **Mobile**: below 768px, drop cloud count to 2, disable bloom, lower `dpr` to `[1, 1.5]`. Consider a static evening sky with no day state on small screens.
- **Fallback**: wrap `<Canvas>` in an error boundary. If WebGL is unavailable, render a plain DOM grid of technologies with their UI previews. A portfolio must never render blank.
- **Keyboard**: technology chips are real buttons with visible focus rings. The sequence must be triggerable and skippable without a mouse.
- **Skip control**: a persistent "skip animation" button that jumps straight to the landed grid. Some visitors are recruiters with four minutes.

---

## Build order

Do not attempt all of this at once. Build and verify in this order:

1. Vite + R3F canvas with drei `<Sky>` and orbit controls. Verify day→evening by manually dragging `sunPosition`.
2. Cloud layer with right→left drift and a speed ref you can set to zero.
3. `ExtrudedLogo` for a single hardcoded SVG. Verify it renders with depth and reflects the environment.
4. zustand phase machine with buttons to manually step through phases. No animation yet.
5. GSAP timeline wiring the phases together with the timings above.
6. `CodePanel` in `<Html>` with the typewriter and shiki.
7. Sandpack live preview, lazy-loaded, one instance.
8. Multi-technology data, the collapsed sequence for techs 2+, landed rail.
9. Reduced motion, mobile tuning, WebGL fallback, skip control.