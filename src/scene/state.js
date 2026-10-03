import { Vector3 } from 'three';

// Values that change every frame live here, not in React state.
// GSAP tweens these plain objects and useFrame reads them, so a running
// sequence never triggers a re-render.

// CIRIDAE GRADE. The names below still read DAY/EVENING because timeline.js and
// Hero.jsx import them, but the two states are now SMOKE and EMBER. Ciridae is a
// flat, monochrome, no-gradient system whose imagery direction asks for
// "heavily blurred... moody and dark, not high-key... smoke... fire/ember
// textures". A bright Preetham noon is the opposite of that, so the dome is
// graded down to a near-monochrome smoke field with a single ember band.
//
// These are not eyeballed. three/examples/jsm/objects/Sky.js gates all
// brightness on sunIntensity(), which reads sun.y / |sun|:
//   old DAY     0.745  -> sunE ~ 444      old EVENING  0.0199 -> sunE ~ 39
//   new SMOKE   0.0817 -> sunE ~  78      new EMBER    0.0115 -> sunE ~ 34
// Both new endpoints sit at or below the OLD evening brightness. That, and not
// a CSS filter, is what makes the sky dark enough to sit under Ciridae type.
//
// rayleighCoefficient = rayleigh - (1 - vSunfade), and vSunfade evaluates to
// ~1.0 for any |sun.y| far below 450000, so it is always 1 here and the
// coefficient equals rayleigh exactly. Dropping rayleigh to 0.26 is therefore
// safe (no negative-beta blowout) and it is what kills the blue outright.
// High turbidity + high mie + mieDirectionalG 0.90 moves what colour remains
// into the Mie term, which is warm and tight around the sun: an ember band
// over void black, which is exactly the reference implementation's
// radial-gradient(#7d2f18) under a 50px blur.

// SMOKE: low and BEHIND the camera, so the frame holds the anti-solar (darkest)
// part of the dome rather than the forward-scatter.
export const DAY_SUN = [-60, 9, 92];
// EMBER: low and in front, so a narrow warm band enters frame on SKY_SHIFT.
export const EVENING_SUN = [10, 1.2, -104];

export const DAY_TURBIDITY = 14;
export const EVENING_TURBIDITY = 19;
export const DAY_RAYLEIGH = 0.5;

// Where the compiled logo rests, matched to the camera's upward pitch.
export const LOGO_BASE_Y = 3.0;
export const EVENING_RAYLEIGH = 0.26;

export const DAY_MIE = 0.021;
export const EVENING_MIE = 0.042;
export const DAY_MIE_G = 0.86;
export const EVENING_MIE_G = 0.9;

// The arrival pulse. Ciridae forbids glow on surfaces and chrome; this drives an
// additive sprite inside the atmospheric layer, in a system that explicitly asks
// for ember textures. Kept, but roughly halved from 0.55/2.30.
export const BLOOM_REST = 0.4;
export const BLOOM_PEAK = 1.3;

export const sky = {
  sun: new Vector3(...DAY_SUN),
  // Blue scattering. Raise it and the day deepens; raise it with a low sun and
  // the long path through the atmosphere turns the whole band red.
  rayleigh: DAY_RAYLEIGH,
  // Haze. Low and the day reads as a clean blue; high and the low sun has
  // something to scatter through, which is what makes the sunset.
  turbidity: DAY_TURBIDITY,
  // Haze density and forward-scatter tightness. Both are now tweened, so the
  // ember band narrows as the sun drops instead of staying a fixed width.
  mie: DAY_MIE,
  mieG: DAY_MIE_G,
  drift: 1, // cloud drift multiplier, tweened to 0 on SKY_SHIFT
  bloom: BLOOM_REST,
};

// Written by the scroll driver, read (and lerped) by Rig in SkyScene. Lives
// here rather than in React state for the same reason everything else does:
// a scroll must never cause a render.
export const view = { parallax: 0 };

export const logo = {
  scale: 0,
  y: 0,
  spin: 0, // accumulated idle rotation
  boost: 0, // extra rotation added during launch
  fade: 1,
};

export const cam = {
  tilt: 0, // extra pitch, raised while the logo climbs
  orbit: 1, // idle orbit amplitude, damped while a sequence runs
};

export function resetLogo() {
  logo.scale = 0;
  logo.y = 0;
  logo.spin = 0;
  logo.boost = 0;
  logo.fade = 1;
}

export function setEveningNow() {
  sky.sun.set(...EVENING_SUN);
  sky.rayleigh = EVENING_RAYLEIGH;
  sky.turbidity = EVENING_TURBIDITY;
  sky.mie = EVENING_MIE;
  sky.mieG = EVENING_MIE_G;
  sky.drift = 0.12;
}

export function setDayNow() {
  sky.sun.set(...DAY_SUN);
  sky.rayleigh = DAY_RAYLEIGH;
  sky.turbidity = DAY_TURBIDITY;
  sky.mie = DAY_MIE;
  sky.mieG = DAY_MIE_G;
  sky.drift = 1;
}

// ---------------------------------------------------------------------------
// THE SKILLS SKY ATMOSPHERE
// One plain object that the GSAP timeline tweens and three readers sample
// every frame: the WebGL scene (SkyDome, CloudLayer, Rig, LogoStage), the 2D
// effects canvas (ui/StormField.jsx) and, through one CSS custom property,
// the scrims. Nothing in here ever causes a React render.
export const atmo = {
  white: 0, // 0 storm .. 1 clear. The dark-to-white transformation.
  energy: 0, // how agitated the clouds and particles are
  compile: 0, // compile progress, 0..1; light builds with it
  converge: 0, // particles drawn into the code window as it materialises
  beam: 0, // the column of light the technology rises on
  build: 0, // LIVE_BUILD progress, 0..1
  charge: 0, // the energy field before the burst
  burst: 0, // 0..1 progress of the release; particles spawn as it starts
  shock: 0, // cloud displacement and flash, eased back to 0
  shake: 0, // camera shake amplitude
  // Screen anchor for the rising logo and the burst, written by StormField
  // from the stage element's box: pixels inside the section, and NDC.
  ax: 0,
  ay: 0,
  ndcX: 0,
  ndcY: 0,
  anchored: false,
  // The chip being hovered or picked, for the small atmospheric response.
  hover: { x: 0, y: 0, color: '#ffffff', a: 0 },
  pick: { x: 0, y: 0, color: '#ffffff', a: 0 },
  accent: '#ffffff', // the active technology's colour
};

// The two ends of the transformation. SkyDome, CloudLayer and SunLight lerp
// between them by atmo.white, so the sky is never swapped, only moved.
export const STORM = {
  sun: DAY_SUN,
  rayleigh: DAY_RAYLEIGH,
  turbidity: DAY_TURBIDITY,
  mie: DAY_MIE,
  mieG: DAY_MIE_G,
  exposure: 0.34,
  sunLight: 3.6,
  ambient: 1.7,
};
export const CLEAR = {
  // High and in front of the camera, a little right of centre: the light
  // comes through the clouds where the burst was.
  sun: [34, 30, -92],
  rayleigh: 1.35,
  turbidity: 3.4,
  mie: 0.0045,
  mieG: 0.8,
  exposure: 0.5,
  sunLight: 4.6,
  ambient: 2.6,
};

// Cloud tint along the way: black, charcoal, blue-grey, soft grey, white.
// The storm end stays close to the old smoke grade (#a8a49d), a little
// cooler; the darkness comes from the sky and exposure, not from the clouds.
export const CLOUD_RAMP = ['#b3b9c2', '#bac1ca', '#c8cfd8', '#e2e6ea', '#ffffff'];

export function setStormNow() {
  atmo.white = 0;
  atmo.energy = 0;
  atmo.compile = 0;
  atmo.converge = 0;
  atmo.beam = 0;
  atmo.build = 0;
  atmo.charge = 0;
  atmo.burst = 0;
  atmo.shock = 0;
  atmo.shake = 0;
}

export function setClearNow() {
  setStormNow();
  atmo.white = 1;
}
