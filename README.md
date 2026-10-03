# Tech Sky

An interactive portfolio for Jayesh Singh. The hero is a 3D sky. Pick a
technology and its logo is compiled on screen: a panel types the code that
defines it, the described object appears as a real mesh, it launches, the sun
drops to the horizon, and a second panel types React that actually executes in a
live runtime.

Nothing in the hero is an asset. Every logo is an SVG path extruded into
geometry at runtime, and the sunset is the Preetham atmospheric model resolving,
not a gradient anyone picked.

## Run it

```bash
npm install
npm run prepare:assets   # generates public/logos/*.svg and the shiki tokens
npm run dev
```

`prepare:assets` only needs re-running when `src/data/techs.js` changes.

## Build

```bash
npm run build
npm run preview
```

## Test it

```bash
npm run preview          # in one terminal
npm run test:site        # in another
```

The test drives a real headless Chromium: WebGL, touch emulation, reduced
motion, a blocked WebGL context, and a copy gate that fails the run on stock
words and em dashes. Screenshots land in `review/shots/`.

## Deploy

The base path is set from an environment variable so the same source works
anywhere.

**GitHub Pages at `<user>.github.io/portfolio/`**

```bash
VITE_BASE=/portfolio/ npm run build
```

Then publish `dist/`. The workflow in `.github/workflows/deploy-pages.yml` does
this on every push to `main`.

**Netlify, Vercel, or a root domain**

```bash
npm run build
```

Publish `dist/`. No base path needed.

## Where things live

```
src/
  data/techs.js          the ten technologies, their extrusion params and
                         their snippets. Editing this file changes the sky.
  data/profile.js        every word of the site's copy
  store.js               the phase machine
  sequence/timeline.js   one GSAP timeline per throw
  scene/state.js         per-frame values GSAP mutates, kept out of React
  scene/                 sky, clouds, extruded logos, the camera rig
  ui/                    code panel, live runtime, the page sections
scripts/
  gen-logos.mjs          simple-icons -> public/logos/*.svg
  tokenize.mjs           shiki at build time, tokens shipped instead
  images.mjs             one compression pass over the screenshots
  selftest.mjs           the adversarial browser test
  probe-sky.mjs          samples the rendered sky with every scrim removed
  probe-hero.mjs         re-measures headline contrast over the live sky
```

The two probes are tuning aids. Run either against a live preview when you
change the sky, the scrim, or the type: `node scripts/probe-sky.mjs`.

## Adding a technology

1. Add an entry to `src/data/techs.js`. `icon` is a
   [simple-icons](https://simpleicons.org) slug.
2. Write a `logoCode` snippet (shown, never run) and a `uiCode` snippet under
   fifteen lines that renders something characteristic (actually executed).
3. `npm run prepare:assets`.

## Notes on the build

- **The first technology gets the full sequence.** Everything after it collapses
  to compile, launch, type, execute, settle, and the sky stays at evening. Ten
  full sunsets in a row is ten times the same idea.
- **Shiki runs at build time.** The highlighter is heavy; `scripts/tokenize.mjs`
  pre-tokenises every snippet and the app ships a 15 KB JSON of tokens.
- **Sandpack is lazy and single-instance.** It arrives only when a snippet is
  about to run and unmounts on settle. If its bundler is unreachable the panel
  shows the source instead of a spinner that never resolves.
- **The page is complete without WebGL.** No canvas, no problem: the hero falls
  back to a composed still and the Stack section carries the same content.

## Where this differs from the brief, and why

Four deliberate departures from `soni.md`. Each one was made after seeing the
thing it describes render badly.

1. **No `EffectComposer` bloom.** The brief calls for a bloom pass with
   `luminanceThreshold: 0.6`. The Preetham sky is brighter than any logo, so a
   threshold low enough to catch the mesh blooms the entire frame to white. The
   arrival pulse is now an additive sprite on the logo itself, driven by the
   same value the timeline was going to drive bloom with. It is truer to the
   moment and it removes a full-screen pass from every frame.
2. **Code panels are DOM overlays, not `<Html transform>`.** Text in a CSS 3D
   transform resamples and softens, and the panel has to stay readable at
   375px. The panels keep a small `rotateY` so they still sit in the scene's
   space. The live runtime is an iframe, which is the element least likely to
   survive a 3D transform intact.
3. **`<Environment>` is built from `<Lightformer>`s, not `preset="sunset"`.**
   The preset downloads an HDR from a CDN at runtime. The metals get the same
   thing to reflect without the page depending on someone else's server.
4. **Tone mapping exposure is 0.28, not the default.** The Preetham model
   radiates well above 1.0. Left at 1, the whole dome clips to white. The
   three.js Sky example lowers exposure for exactly this reason; the scene
   lights are raised to compensate.

Two numbers the brief left open, settled by measurement rather than taste: the
hero scrim is tuned so the headline holds about 10:1 worst-pixel contrast over
the live sky, and the sub-headline about 6:1. `npm run test:site` re-measures
both on every run, so changing the sky cannot quietly break the type.
