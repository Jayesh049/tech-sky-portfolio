// Adversarial self-test. Drives a real Chromium so the checks are genuine:
// touch emulation, live reduced-motion flips and actual WebGL, not guesses.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const URL = process.env.TEST_URL || 'http://localhost:5178/';
const SHOTS = 'review/shots';
await mkdir(SHOTS, { recursive: true });

const problems = [];
const note = (s) => console.log('  ' + s);
const fail = (s) => {
  problems.push(s);
  console.log('  FAIL ' + s);
};

const browser = await chromium.launch({
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ],
});

async function newPage(size, opts = {}) {
  const ctx = await browser.newContext({
    viewport: size,
    deviceScaleFactor: 1,
    reducedMotion: opts.reducedMotion,
    hasTouch: opts.touch || false,
    isMobile: opts.touch || false,
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(60000);
  const errors = [];
  const thirdParty = [];
  // Sandpack compiles inside a cross-origin iframe. Its failures are worth
  // knowing about but they are not this page's console.
  // Errors thrown inside Sandpack's cross-origin WORKER arrive with an empty
  // location, so matching on the URL alone let them count as this page's
  // console. The origin is named in the stack text, so check both.
  const foreign = (u = '') => /codesandbox\.io|sandpack/.test(u);
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    (foreign(m.location()?.url) || foreign(text) ? thirdParty : errors).push(text);
  });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  return { ctx, page, errors, thirdParty };
}

// Screenshots under SwiftShader are slow, so give them room and freeze
// animations rather than waiting for a moving page to settle.
const shot = (page, path, fullPage = false) =>
  page.screenshot({ path, fullPage, animations: 'disabled', timeout: 90000 });

const fps = (page) =>
  page.evaluate(
    () =>
      new Promise((res) => {
        let n = 0;
        const t0 = performance.now();
        const tick = () => {
          n += 1;
          if (performance.now() - t0 < 1000) requestAnimationFrame(tick);
          else res(Math.round((n * 1000) / (performance.now() - t0)));
        };
        requestAnimationFrame(tick);
      })
  );

const overflow = (page) =>
  page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    win: window.innerWidth,
  }));

// ---------------------------------------------------------------- desktop
console.log('\n[1] desktop 1440x900');
{
  const { ctx, page, errors, thirdParty } = await newPage({ width: 1440, height: 900 });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await shot(page, `${SHOTS}/01-hero-1440.png`);

  const canvas = await page.locator('.hero-canvas canvas').count();
  canvas ? note('canvas mounted') : fail('no canvas in the hero');

  const gl = await page.evaluate(() => {
    const c = document.querySelector('.hero-canvas canvas');
    if (!c) return 'missing';
    const ctx2 = c.getContext('webgl2') || c.getContext('webgl');
    return ctx2 ? 'ok' : 'no-context';
  });
  gl === 'ok' ? note('webgl context live') : fail(`webgl: ${gl}`);


  // Watch the phase machine from inside the page, and note what the stage
  // showed on the way: the code window, the build scene, the compile panel.
  await page.evaluate(() => {
    window.__phases = [];
    window.__seen = {};
    window.__skies = new Set();
    const hero = document.querySelector('.hero');
    window.__t0 = performance.now();
    new MutationObserver(() => {
      window.__phases.push([
        hero.dataset.phase,
        Math.round(performance.now() - window.__t0),
      ]);
      window.__skies.add(hero.dataset.sky);
      if (document.querySelector('.stage .sky-window .cp')) window.__seen.code = true;
      if (document.querySelector('.stage .sky-art .art')) window.__seen.scene = true;
      if (document.querySelector('.stage .cmp')) window.__seen.compile = true;
    }).observe(hero, { attributes: true, attributeFilter: ['data-phase'] });
  });

  // run the sequence for the first technology
  const first = page.locator('.chip').first();
  await first.click();
  await page.waitForTimeout(700);

  const typedOk = await page
    .waitForFunction(
      () => {
        const slot = document.querySelector('.stage-code');
        if (!slot) return false;
        // the code window is named after a real file for that technology
        if (!/\.[a-z]+$/.test(slot.querySelector('.cp-name')?.textContent || '')) return false;
        return (slot.querySelector('.cp-body')?.innerText.length || 0) > 24;
      },
      null,
      { timeout: 60000 }
    )
    .then(() => true)
    .catch(() => false);
  if (typedOk) note('code window mounts and types');
  else {
    const seen = await page.evaluate(() => {
      const slot = document.querySelector('.stage-code');
      return {
        phase: document.querySelector('.hero')?.dataset.phase,
        slotPresent: !!slot,
        label: slot?.querySelector('.cp-name')?.textContent ?? null,
        chars: slot?.querySelector('.cp-body')?.innerText.length ?? 0,
      };
    });
    fail(`code window not seen: ${JSON.stringify(seen)}`);
  }
  await shot(page, `${SHOTS}/02-code-panel.png`);

  await page.waitForFunction(() => document.querySelector('.hero').dataset.phase === 'BUILD_COMPLETE', null, { timeout: 120000 }).catch(() => {});
  await shot(page, `${SHOTS}/03-build-complete.png`);

  await page.waitForFunction(
    () => document.querySelector('.hero').dataset.phase === 'EXPERTISE',
    null,
    { timeout: 240000 }
  );
  await shot(page, `${SHOTS}/04-expertise.png`);
  const trace = await page.evaluate(() => window.__phases);
  const seen1 = await page.evaluate(() => window.__seen);
  note('phases: ' + trace.map(([p, ms]) => `${p}@${ms}`).join(' '));

  const landedCount = await page.locator('.chip[data-landed="true"]').count();
  landedCount >= 1
    ? note(`sequence completed, ${landedCount} landed`)
    : fail('sequence never landed a technology');

  const BEATS = [
    'TECH_SELECTED', 'TECH_RISE', 'CODE_REVEAL', 'LIVE_BUILD', 'COMPILING',
    'BUILD_COMPLETE', 'ENERGY_BUILD', 'BURST', 'CLOUD_TRANSITION', 'WHITE_CLOUD', 'EXPERTISE',
  ];
  const missing1 = BEATS.filter((b) => !trace.some(([q]) => q === b));
  const order1 = trace.map(([q]) => q).filter((q) => BEATS.includes(q));
  const inOrder = (o) => o.every((q, i) => i === 0 || BEATS.indexOf(q) >= BEATS.indexOf(o[i - 1]));
  missing1.length === 0 && inOrder(order1)
    ? note('first run plays every beat, in order')
    : fail(`first run beats wrong: missing ${missing1.join(', ') || 'none'}, order ${order1.join('>')}`);
  seen1.code && seen1.scene && seen1.compile
    ? note('stage showed code, the live build and the compile panel')
    : fail(`stage never showed: ${['code', 'scene', 'compile'].filter((k) => !seen1[k]).join(', ')}`);
  // CHANGED WITH THE BEHAVIOUR. This used to read data-sky at one moment and
  // require 'clear', because the white sky was a resting state that lasted
  // until the visitor left the panel. It is now a beat: the burst clears the
  // sky, the expertise panel appears on that frame, and the sky settles back
  // to the storm over ~2.6s while the panel is read. Sampling one moment was
  // also racy -- the shot() and evaluates above take long enough that the
  // darkening had already begun -- so assert the transition instead: the sky
  // WAS cleared during the run, and it SETTLES to storm afterwards.
  const skies1 = await page.evaluate(() => [...window.__skies]);
  skies1.includes('clear')
    ? note('the burst cleared the clouds')
    : fail(`first build never cleared the sky: ${skies1.join(', ') || 'none'}`);
  await page.waitForFunction(() => document.querySelector('.hero').dataset.sky === 'storm', null, { timeout: 30000 })
    .then(() => note('the sky settles back to the storm under the expertise panel'))
    .catch(() => fail('the sky stayed white under the expertise panel'));

  // the second technology: back to the selector, pick another
  await page.evaluate(() => {
    window.__phases = [];
    window.__skies = new Set();
    window.__t0 = performance.now();
  });
  await page.locator('.xp .btn-primary').first().click();
  await page.waitForFunction(() => document.querySelector('.hero').dataset.phase === 'READY_FOR_NEXT', null, { timeout: 10000 })
    .then(() => note('expertise returns to the selector'))
    .catch(() => fail('expertise did not return to the selector'));
  // ...and the white clouds go back to the storm before the next build.
  await page.waitForFunction(() => document.querySelector('.hero').dataset.sky === 'storm', null, { timeout: 60000 })
    .then(() => note('the sky returns to the storm after white clouds'))
    .catch(() => fail('the sky stayed white after leaving the expertise panel'));
  await page.evaluate(() => { window.__skies = new Set(); });
  await page.locator('.chip:not([data-landed="true"])').first().click();
  await page.waitForFunction(
    () => document.querySelectorAll('.chip[data-landed="true"]').length >= 2,
    null,
    { timeout: 240000 }
  );
  const trace2 = await page.evaluate(() => window.__phases);
  const skies2 = await page.evaluate(() => [...window.__skies]);
  note('second run phases: ' + trace2.map(([p, ms]) => `${p}@${ms}`).join(' '));

  // Wall-clock is worthless under a software renderer (GSAP's lag smoothing
  // stretches every timeline), so assert the phase SET, which is exact.
  const rate = await fps(page);
  const span = (tr) => (tr.length ? tr[tr.length - 1][1] - tr[0][1] : 0);
  note(`render rate here: ${rate} fps (first ${(span(trace) / 1000).toFixed(1)}s, second ${(span(trace2) / 1000).toFixed(1)}s wall-clock, both lag-stretched)`);

  const missing2 = BEATS.filter((b) => !trace2.some(([q]) => q === b));
  missing2.length === 0
    ? note('second run plays every beat too')
    : fail(`second run missing: ${missing2.join(', ')}`);
  // Same change as the first build: the run must pass through BOTH states --
  // it starts in the storm, the burst clears it -- rather than ending parked
  // on 'clear'.
  skies2.includes('storm') && skies2.includes('clear')
    ? note('the second build runs dark to white and back again')
    : fail(`second build sky sequence wrong: ${skies2.join(', ')}`);
  await shot(page, `${SHOTS}/05-second-tech.png`);

  // Replay the same technology from its expertise panel.
  await page.locator('.xp .btn-ghost').first().click();
  await page.waitForFunction(() => document.querySelector('.hero').dataset.phase === 'TECH_SELECTED' || document.querySelector('.hero').dataset.phase === 'TECH_RISE', null, { timeout: 10000 })
    .then(() => note('replay restarts the same technology'))
    .catch(() => fail('replay did not start'));
  await page.evaluate(() => [...document.querySelectorAll('.picker .linkish')].find((b) => /skip/i.test(b.textContent))?.click());
  await page.waitForFunction(() => document.querySelector('.hero').dataset.phase === 'EXPERTISE', null, { timeout: 20000 })
    .then(() => note('skip lands on the result'))
    .catch(() => fail('skip did not land on the result'));

  // The two assertions above pass while the headline feature is dead: a canvas
  // can be mounted, sized and holding a live context while never having been
  // drawn into once. Two separate things can break it, so there are two
  // separate assertions.
  //
  // (a) IS THE LOOP RUNNING? When the hero moved below the fold, the
  //     IntersectionObserver reported off-screen before the first frame and
  //     frameloop went to 'never'. invalidate() is a no-op there, so the
  //     canvas could never repaint itself. SkyScene publishes its committed
  //     frame count as data-frames; if that advances, gl.render is being
  //     called. Deliberately not a pixel diff: at the 7fps this software
  //     renderer manages, cloud drift between two screenshots is not
  //     separable from noise (measured: 0.28-0.68 either way).
  //     This asserts the state a visitor is actually in -- hero on screen,
  //     loop running. It does not reproduce the original below-the-fold
  //     stall, which needs a cold load with the hero never scrolled to.
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelector('.hero')?.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(2200);

  const frames = async () =>
    Number((await page.getAttribute('.hero-canvas', 'data-frames')) ?? -1);
  const f0 = await frames();
  await page.waitForTimeout(1500);
  const f1 = await frames();

  if (f0 < 0) fail('sky never published a frame count: the loop never started');
  else if (f1 > f0) note(`sky render loop is live (${f0} to ${f1} frames)`);
  else fail(`sky render loop is stalled (stuck at ${f0} frames)`);

  // (b) IS ANY OF IT REACHING THE VIEWER? This is what actually broke: the
  //     hero scrim was tuned against a bright Preetham noon and needed to be
  //     nearly opaque for white type to clear 4.5:1. Once the sky was graded
  //     down to smoke, the same five layers crushed it to a flat field and
  //     the clouds disappeared. Sample a band that is pure sky -- above the
  //     copy and the picker, below the header -- where that shows up as a
  //     dead flat fill.
  const box = await page.locator('.hero-canvas canvas').boundingBox();
  if (!box) {
    fail('hero canvas has no box');
  } else {
    const clip = {
      x: Math.round(box.x + box.width * 0.12),
      y: Math.round(box.y + box.height * 0.1),
      width: Math.round(box.width * 0.76),
      height: Math.round(box.height * 0.12),
    };
    const shot = await page.screenshot({ clip });
    const st = await sharp(shot).stats();
    const sd = Math.max(...st.channels.map((c) => c.stdev));
    sd > 2
      ? note(`sky is visible on the page (stdev ${sd.toFixed(2)})`)
      : fail(`sky reaches the viewer as a flat fill, stdev ${sd.toFixed(2)} -- scrim too heavy or grade too dark`);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  const o = await overflow(page);
  o.doc <= o.win + 1 ? note('no sideways scroll') : fail(`page is ${o.doc - o.win}px too wide`);

  // Ciridae caps every size at 32px and loads one weight per family. Both are
  // asserted rather than trusted: the ceiling is the whole reason the design
  // has no fluid type, so it must hold identically at every viewport.
  const overscale = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('body *').forEach((el) => {
      let hasText = false;
      for (const n of el.childNodes) {
        if (n.nodeType === 3 && n.textContent.trim()) hasText = true;
      }
      if (!hasText) return;
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      const fw = parseInt(cs.fontWeight, 10);
      const id = `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`;
      if (fs > 32.5) out.push(`${id} ${fs.toFixed(1)}px`);
      if (fw > 400) out.push(`${id} w${fw}`);
    });
    return [...new Set(out)];
  });
  overscale.length
    ? fail(`type ceiling broken: ${overscale.slice(0, 5).join(', ')}`)
    : note('type ceiling holds (nothing over 32px, nothing bolder than 400)');

  // Walk the page so IntersectionObserver actually fires. A fullPage
  // screenshot on its own never scrolls, so entrances stay unplayed and the
  // shot lies about what a visitor sees.
  await page.evaluate(async () => {
    // Steps must be smaller than the viewport or elements fall between two
    // sampled positions and never intersect. The waits are long because
    // IntersectionObserver delivers on rendering steps, and this machine
    // renders a WebGL page at a few frames a second.
    const step = window.innerHeight * 0.5;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 450));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 900));
  });

  // Poll rather than sample once: IntersectionObserver delivers on rendering
  // steps, and this machine renders a few frames a second.
  const allIn = await page
    .waitForFunction(
      () =>
        document.querySelectorAll('[data-reveal]').length ===
        document.querySelectorAll('[data-reveal].in').length,
      null,
      { timeout: 15000 }
    )
    .then(() => true)
    .catch(() => false);

  if (allIn) {
    const n = await page.$$eval('[data-reveal]', (e) => e.length);
    note(`every entrance plays (${n}/${n})`);
  } else {
    const left = await page.$$eval('[data-reveal]:not(.in)', (els) =>
      els.map((e) => e.className)
    );
    fail(`entrances never played on ${left.length}: ${left.slice(0, 3).join(', ')}`);
  }

  const stagger = await page.$$eval('.disciplines, .facts', (els) =>
    els.filter((e) => !e.classList.contains('done')).length
  );
  stagger
    ? fail(`${stagger} stagger container(s) never retired their delays`)
    : note('stagger delays retired after entrance');

  await shot(page, `${SHOTS}/06-full.png`, true);

  // exercise every link and button
  const links = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'))
  );
  const bad = links.filter((h) => !h || h === '#');
  const anchors = links.filter((h) => h?.startsWith('#'));
  const missing = [];
  for (const a of anchors) {
    const id = a.slice(1);
    const found = await page.locator(`#${id}`).count();
    if (!found) missing.push(a);
  }
  missing.length ? fail(`anchors with no target: ${missing.join(', ')}`) : note(`${anchors.length} anchors all resolve`);
  if (bad.length) fail(`empty hrefs: ${bad.length}`);

  errors.length
    ? fail(`console errors: ${errors.slice(0, 3).map((e) => e.slice(0, 140)).join(' | ')}`)
    : note('console clean (own page)');
  if (thirdParty.length)
    note(`note: ${thirdParty.length} error(s) from the Sandpack iframe, the page falls back to source`);
  await ctx.close();
}

// ---------------------------------------------------------------- phone
console.log('\n[2] phone 375x812, coarse pointer');
{
  const { ctx, page, errors } = await newPage({ width: 375, height: 812 }, { touch: true });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.locator('.chip').first().waitFor({ state: 'visible', timeout: 60000 });
  await page.waitForTimeout(2500);
  await shot(page, `${SHOTS}/07-phone.png`);

  const o = await overflow(page);
  o.doc <= o.win + 1 ? note('no sideways scroll') : fail(`phone is ${o.doc - o.win}px too wide`);

  // Ciridae caps every size at 32px and loads one weight per family. Both are
  // asserted rather than trusted: the ceiling is the whole reason the design
  // has no fluid type, so it must hold identically at every viewport.
  const overscale = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('body *').forEach((el) => {
      let hasText = false;
      for (const n of el.childNodes) {
        if (n.nodeType === 3 && n.textContent.trim()) hasText = true;
      }
      if (!hasText) return;
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      const fw = parseInt(cs.fontWeight, 10);
      const id = `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`;
      if (fs > 32.5) out.push(`${id} ${fs.toFixed(1)}px`);
      if (fw > 400) out.push(`${id} w${fw}`);
    });
    return [...new Set(out)];
  });
  overscale.length
    ? fail(`type ceiling broken: ${overscale.slice(0, 5).join(', ')}`)
    : note('type ceiling holds (nothing over 32px, nothing bolder than 400)');

  const small = await page.evaluate(() => {
    const bad = [];
    // The hero sequence added five more interactive classes. Zero-height
    // elements are skipped as before, which is what excludes the peel handle
    // and dog-ear while they are `hidden`.
    const sel =
      '.btn, .chip, .linkish, .cir-path, .cir-intro__link, .cir-intro__play,' +
      ' .sq-peel__handle, .sq-peel__back, .cir-paths__flare,' +
      // the film section's transport and stage rail
      // the film deck's one control. Was the SPECTRA player's transport/rail:
      // ' .fs-play, .fs-mark, .fs-track';
      ' .fs-step';
    document.querySelectorAll(sel).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.height > 0 && r.height < 44) bad.push(`${el.className}:${Math.round(r.height)}px`);
    });
    return bad;
  });
  small.length ? fail(`touch targets under 44px: ${small.slice(0, 5).join(', ')}`) : note('touch targets 44px+');

  // Centre it first: scrollIntoViewIfNeeded can park a control under the
  // fixed nav, and then the tap lands on the nav instead.
  const hit = await page.evaluate(() => {
    const chip = document.querySelector('.chip');
    // chip.scrollIntoView({ block: 'center' });
    // The 3D hero now sits in the skills section, so the chip needs a real scroll first;
    // html has smooth scrolling, so jump instantly or the rect is read mid-animation.
    chip.scrollIntoView({ block: 'center', behavior: 'instant' });
    const r = chip.getBoundingClientRect();
    const el = document.elementFromPoint(
      Math.round(r.left + r.width / 2),
      Math.round(r.top + r.height / 2)
    );
    return {
      reachable: el === chip || chip.contains(el),
      blockedBy: el === chip || chip.contains(el) ? null : el?.className || el?.tagName,
    };
  });
  hit.reachable
    ? note('chip is the top element at its own centre, nothing overlays it')
    : fail(`chip is covered by ${hit.blockedBy}`);

  // Fire through the DOM. Playwright's synthetic mouse dispatch is a CDP round
  // trip that stalls while a software-rendered WebGL frame blocks the renderer,
  // which is this machine rather than the page. The hit test above is the check
  // that would catch a real overlay bug.
  await page.evaluate(() => document.querySelector('.chip').click());

  // Wait for the outcome rather than a clock: the timeline is lag-stretched
  // here in proportion to how slowly this machine renders.
  const phoneLanded = await page
    .waitForFunction(
      () => document.querySelectorAll('.chip[data-landed="true"]').length >= 1,
      null,
      { timeout: 240000 }
    )
    .then(() => true)
    .catch(() => false);
  phoneLanded
    ? note('sequence runs and lands on a phone')
    : fail(
        `phone sequence never landed (stuck at phase ${await page.evaluate(
          () => document.querySelector('.hero')?.dataset.phase
        )})`
      );
  await shot(page, `${SHOTS}/08-phone-run.png`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, `${SHOTS}/09-phone-full.png`, true);

  errors.length ? fail(`phone console: ${errors.slice(0, 4).join(' | ')}`) : note('console clean');
  await ctx.close();
}

// ---------------------------------------------------------------- reduced motion
console.log('\n[3] reduced motion');
{
  const { ctx, page, errors } = await newPage({ width: 1280, height: 800 }, { reducedMotion: 'reduce' });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);

  await page.locator('.chip').first().click();
  await page
    .waitForFunction(() => document.querySelectorAll('.chip[data-landed="true"]').length >= 1, null, { timeout: 120000 })
    .catch(() => {});
  await shot(page, `${SHOTS}/10-reduced.png`);

  const landed = await page.locator('.chip[data-landed="true"]').count();
  landed >= 1 ? note('sequence still completes and lands') : fail('reduced motion never lands a tech');

  await page.evaluate(() =>
    document.getElementById('experience')?.scrollIntoView({ behavior: 'auto' })
  );
  await page.waitForTimeout(500);
  const hidden = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const vis = r.top < window.innerHeight && r.bottom > 0;
      if (vis && Number(getComputedStyle(el).opacity) < 0.9) bad.push(el.className);
    });
    return bad;
  });
  hidden.length ? fail(`reveal stuck hidden: ${hidden.join(', ')}`) : note('every revealed block shows its final state');

  errors.length ? fail(`reduced console: ${errors.slice(0, 4).join(' | ')}`) : note('console clean');
  await ctx.close();
}

// ---------------------------------------------------------------- no WebGL
console.log('\n[4] WebGL unavailable');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (String(type).includes('webgl')) return null;
      return orig.call(this, type, ...rest);
    };
  });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await shot(page, `${SHOTS}/11-no-webgl.png`);

  const h1 = await page.locator('h1').first().innerText();
  // const stack = await page.locator('.tcard').count();
  // The Stack cards were replaced by the 3D hero (skills section); its chips carry the same list.
  const stack = Math.max(
    await page.locator('.tcard').count(),
    await page.locator('.chip').count()
  );
  h1 && stack >= 10
    ? note(`page complete without webgl: h1 present, ${stack} technologies listed`)
    : fail(`fallback incomplete: h1="${h1}" cards=${stack}`);
  await ctx.close();
}

// ---------------------------------------------------------------- copy gate
console.log('\n[5] copy gate');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  // Two reads: the whole page, and the page with the hero's introduction
  // layer hidden. Toggling display rather than splicing substrings out --
  // substring surgery breaks the moment the same words appear elsewhere.
  const { all: raw, exIntro: rawNoIntro } = await page.evaluate(() => {
    const intro = document.querySelector('.cir-intro');
    const all = document.body.innerText;
    if (!intro) return { all, exIntro: all };
    const prev = intro.style.display;
    intro.style.display = 'none';
    const exIntro = document.body.innerText;
    intro.style.display = prev;
    return { all, exIntro };
  });
  // Registered company names are not copy choices. Case-insensitive because
  // innerText returns the RENDERED text, and Ciridae sets the company line in
  // uppercase — a case-sensitive exemption silently stops matching.
  const text = raw.replace(/iONE IT Solutions Pvt\. Ltd\./gi, 'iONE');
  const textNoIntro = rawNoIntro.replace(/iONE IT Solutions Pvt\. Ltd\./gi, 'iONE');

  const banned = [
    'leverage', 'seamless', 'empower', 'unlock', 'robust', 'actionable',
    'data-driven', 'solutions', 'testament', 'landscape', 'delve', 'elevate',
  ];
  const hits = banned.filter((w) => new RegExp(`\\b${w}`, 'i').test(text));
  hits.length ? fail(`stock words on the page: ${hits.join(', ')}`) : note('no stock words');

  // The hero's introduction copy is authored with em dashes deliberately, so
  // .cir-intro is exempt from THIS rule only -- the banned-word check above
  // still runs against the whole page, intro included.
  const dashes = (textNoIntro.match(/—/g) || []).length;
  dashes
    ? fail(`${dashes} em dashes in the copy`)
    : note('no em dashes (.cir-intro exempt)');
  await ctx.close();
}

// ------------------------------------------------- hero legibility
console.log('\n[6] hero headline over the live sky');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const targets = [
    ['.hero-h1', 4.5],
    ['.hero-sub', 4.5],
  ];
  // The 3D sky hero moved below the fold into the skills section. Bring it into view so the
  // headline boxes are inside the viewport when they are measured.
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelector('.hero')?.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(2500);

  // Read the text colour off the page rather than hardcoding it. The literals
  // that used to live here (#b9bfd0 / #eae7df) are index.css's --paper-dim and
  // --paper; theme-ciridae.css re-points those to --cir-ash (#cecece) and
  // --cir-white, so the gate was measuring a colour the site had stopped using
  // and understating .hero-sub by roughly 15%. Measured, not assumed, so a
  // future theme change cannot quietly invalidate it again.
  const boxes = [];
  for (const [sel, min] of targets) {
    const colour = await page.$eval(sel, (el) => getComputedStyle(el).color);
    boxes.push([sel, min, await page.locator(sel).boundingBox(), colour]);
  }

  // Hide the glyphs but keep every scrim layer, then measure what a reader
  // actually has behind the words. Hiding the text also drops its shadow,
  // so this reads conservative.
  await page.addStyleTag({
    content: '.hero-copy{visibility:hidden!important}',
  });
  await page.waitForTimeout(400);

  const lin = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

  for (const [sel, min, box, colour] of boxes) {
    if (!box) {
      fail(`${sel} has no box to measure`);
      continue;
    }
    const buf = await page.screenshot({ clip: box, animations: 'disabled', timeout: 90000 });
    const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });

    let worst = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      const L = lum(data[i], data[i + 1], data[i + 2]);
      if (L > worst) worst = L;
    }
    const [tr, tg, tb] = colour.match(/\d+/g).map(Number);
    const textL = lum(tr, tg, tb);
    const ratio = (Math.max(textL, worst) + 0.05) / (Math.min(textL, worst) + 0.05);

    ratio >= min
      ? note(`${sel} worst-pixel contrast ${ratio.toFixed(2)}:1`)
      : fail(`${sel} worst-pixel contrast only ${ratio.toFixed(2)}:1, needs ${min}`);
  }
  await ctx.close();
}

await browser.close();

console.log('\n' + '='.repeat(52));
if (problems.length) {
  console.log(`${problems.length} problem(s):`);
  problems.forEach((p) => console.log(' - ' + p));
  process.exitCode = 1;
} else {
  console.log('all checks passed');
}
console.log(`shots in ${SHOTS}`);
