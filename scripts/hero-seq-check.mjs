// Verifies the hero sequence and the page peel end to end: the phase machine
// actually advances, the four panels stand up, the peel works by KEYBOARD (not
// just pointer), inert holds both ways, and reduced motion lands on the final
// state. Headed-equivalent flags so the canvas really rasterises.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL = process.env.TEST_URL || 'http://localhost:5178/';
const OUT = 'review/hero-seq';
await mkdir(OUT, { recursive: true });

const problems = [];
const note = (s) => console.log('  ' + s);
const fail = (s) => {
  problems.push(s);
  console.log('  FAIL ' + s);
};

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

// ---------------------------------------------------------------- sequence
console.log('\n[A] the sequence plays');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: 'networkidle' });

  // Record every data-seq / data-phase transition from inside the page.
  await page.evaluate(() => {
    window.__seq = [];
    const h = document.querySelector('.sq-hero');
    if (!h) return;
    window.__t0 = performance.now();
    const push = () =>
      window.__seq.push([h.dataset.seq, h.dataset.phase, Math.round(performance.now() - window.__t0)]);
    push();
    new MutationObserver(push).observe(h, {
      attributes: true,
      attributeFilter: ['data-seq', 'data-phase'],
    });
  });

  const minH = await page.evaluate(() => {
    const h = document.querySelector('.sq-hero');
    return h ? { min: getComputedStyle(h).minHeight, win: window.innerHeight } : null;
  });
  if (!minH) fail('.sq-hero not in the DOM');
  else {
    // 100svh, not the pre-merge 78svh: proves the import order took.
    const ratio = parseFloat(minH.min) / minH.win;
    ratio > 0.95
      ? note(`hero is full height (${minH.min} of ${minH.win}px)`)
      : fail(`hero is ${minH.min} of ${minH.win}px -- hero-sequence.css lost the cascade`);
  }

  const done = await page
    .waitForFunction(() => document.querySelector('.sq-hero')?.dataset.seq === 'done', null, {
      timeout: 45000,
    })
    .then(() => true)
    .catch(() => false);

  const seq = await page.evaluate(() => window.__seq || []);
  note('seq: ' + seq.map(([s, p, ms]) => `${s}/${p ?? '-'}@${ms}`).join(' '));

  if (!done) fail('sequence never reached data-seq="done"');
  else {
    const phases = [...new Set(seq.map((e) => e[1]).filter(Boolean))];
    const want = ['expansion', 'return', 'rotation', 'acceleration', 'burst', 'paths', 'exploration'];
    const missing = want.filter((p) => !phases.includes(p));
    missing.length
      ? fail(`phases never seen: ${missing.join(', ')}`)
      : note(`all ${want.length} phases played`);
  }

  const panels = await page.evaluate(() => ({
    total: document.querySelectorAll('.cir-path').length,
    open: document.querySelectorAll('.cir-path[data-open="true"]').length,
    lit: document.querySelector('.cir-paths')?.dataset.lit ?? null,
    hrefs: [...document.querySelectorAll('.cir-path')].map((a) => a.getAttribute('href')),
  }));
  panels.total === 4 ? note('four panels rendered') : fail(`${panels.total} panels, expected 4`);
  panels.open === 4 ? note('all four stood up') : fail(`${panels.open}/4 panels opened`);
  panels.lit === 'true' ? note('nav lit') : fail(`nav data-lit=${panels.lit}`);
  note('panel hrefs: ' + panels.hrefs.join(' '));

  // Every hero href must resolve to a real section.
  const dead = await page.evaluate(() =>
    [...document.querySelectorAll('.cir-path, .cir-intro__link')]
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && h.startsWith('#') && !document.getElementById(h.slice(1)))
  );
  dead.length ? fail(`dead hero anchors: ${dead.join(', ')}`) : note('every hero anchor resolves');

  await page.screenshot({ path: `${OUT}/01-sequence-done.png` });
  await page.close();
}

// ------------------------------------------------------------ peel by key
console.log('\n[B] the peel works by keyboard');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page
    .waitForFunction(() => document.querySelector('.sq-hero')?.dataset.seq === 'done', null, {
      timeout: 45000,
    })
    .catch(() => {});

  // Before peeling, the intro layer must be unreachable.
  const inertBefore = await page.evaluate(() => {
    const intro = document.querySelector('.cir-intro');
    return { present: !!intro, inert: intro?.hasAttribute('inert') ?? null };
  });
  inertBefore.inert === true
    ? note('intro layer is inert while the sheet is down')
    : fail(`intro inert=${inertBefore.inert} before peel`);

  const handle = page.locator('.sq-peel__handle');
  if (!(await handle.count())) fail('no peel handle');
  else {
    // The handle's `hidden` now depends on seq as well as peel, so wait for it
    // to actually be visible. Without this the waitFor above falling through
    // on timeout surfaces as an opaque Playwright focus error instead of the
    // friendly 'no peel handle' failure.
    await handle.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await handle.focus();
    await page.keyboard.press('Enter');
    const peeled = await page
      .waitForFunction(() => document.querySelector('.sq-stage')?.dataset.peel === 'peeled', null, {
        timeout: 15000,
      })
      .then(() => true)
      .catch(() => false);
    peeled ? note('Enter on the corner peels the page') : fail('Enter did not peel');

    if (peeled) {
      // pagePeel.js writes stage.dataset.peel straight to the DOM, while inert
      // clears in a React effect one render later, and focus moves on a rAF
      // after the 720ms sweep. Wait for each rather than sampling: an
      // immediate read sees the pre-render state and cries wolf.
      const reachable = await page
        .waitForFunction(() => !document.querySelector('.cir-intro')?.hasAttribute('inert'), null, {
          timeout: 5000,
        })
        .then(() => true)
        .catch(() => false);
      reachable
        ? note('intro becomes reachable once revealed')
        : fail('intro stayed inert after peel -- nothing underneath is tabbable');

      const heroInert = await page.evaluate(
        () => document.querySelector('.sq-hero')?.hasAttribute('inert') ?? null
      );
      heroInert === true
        ? note('peeled-away hero is inert, never tabbable')
        : fail(`hero inert=${heroInert} after peel`);

      const focused = await page
        .waitForFunction(
          () => document.activeElement?.classList?.contains('cir-intro__title'),
          null,
          { timeout: 6000 }
        )
        .then(() => true)
        .catch(() => false);
      focused
        ? note('focus moved to the introduction heading')
        : fail('focus never reached the introduction heading');
      await page.screenshot({ path: `${OUT}/02-peeled.png` });

      await page.locator('.sq-peel__back').focus();
      await page.keyboard.press('Enter');
      const back = await page
        .waitForFunction(() => document.querySelector('.sq-stage')?.dataset.peel === 'ready', null, {
          timeout: 15000,
        })
        .then(() => true)
        .catch(() => false);
      back ? note('Enter on the dog-ear lays the page back down') : fail('could not restore');
    }
  }
  await page.close();
}

// -------------------------------------------------------- reduced motion
console.log('\n[C] reduced motion lands on the final state');
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const st = await page.evaluate(() => {
    const h = document.querySelector('.sq-hero');
    const fx = document.querySelector('.sq-hero__fx');
    return {
      seq: h?.dataset.seq,
      panels: document.querySelectorAll('.cir-path').length,
      hiddenPanels: [...document.querySelectorAll('.cir-path')].filter(
        (p) => getComputedStyle(p).visibility === 'hidden' || getComputedStyle(p).opacity === '0'
      ).length,
      fxDisplay: fx ? getComputedStyle(fx).display : 'absent',
    };
  });
  st.seq === 'done' ? note('seq is done on the first frame') : fail(`seq=${st.seq} under reduced motion`);
  st.hiddenPanels === 0
    ? note(`all ${st.panels} panels visible, none waiting on an animation`)
    : fail(`${st.hiddenPanels} panel(s) stuck hidden under reduced motion`);
  st.fxDisplay === 'none' ? note('fx canvas suppressed') : fail(`fx canvas display=${st.fxDisplay}`);

  // The theme-ciridae.css line-993 patch: strip .in and the flanks must not
  // fall back to opacity 0 with no transition to bring them back.
  const flank = await page.evaluate(() => {
    const row = document.querySelector('.sq-hero__row');
    if (!row) return null;
    row.classList.remove('in');
    const f = document.querySelector('.cir-flank');
    return f ? getComputedStyle(f).opacity : null;
  });
  flank === '1'
    ? note('flanks hold opacity 1 without .in (reduced-motion patch works)')
    : fail(`flank opacity is ${flank} without .in -- the :has() patch did not take`);

  await page.screenshot({ path: `${OUT}/03-reduced-motion.png` });
  await page.close();
}

// --------------------------------------------------------------- replay
console.log('\n[D] the star replays the sequence');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page
    .waitForFunction(() => document.querySelector('.sq-stage')?.dataset.peel === 'ready', null, {
      timeout: 60000,
    })
    .catch(() => {});

  const flare = await page.evaluate(() => {
    const f = document.querySelector('.cir-paths__flare');
    if (!f) return null;
    return { tag: f.tagName, disabled: f.disabled, h: Math.round(f.getBoundingClientRect().height) };
  });
  if (!flare) fail('no flare control');
  else {
    flare.tag === 'BUTTON' ? note('flare is a real button') : fail(`flare is a <${flare.tag}>`);
    flare.disabled === false ? note('flare enabled once the shot is done') : fail('flare still disabled');
    flare.h >= 44 ? note(`flare hit area ${flare.h}px`) : fail(`flare only ${flare.h}px tall`);
  }

  await page.evaluate(() => {
    window.__t = [];
    const h = document.querySelector('.sq-hero');
    new MutationObserver(() => window.__t.push(h.dataset.phase)).observe(h, {
      attributes: true,
      attributeFilter: ['data-phase'],
    });
  });

  await page.click('.cir-paths__flare');
  await page.waitForTimeout(150);

  // THE regression test for the useLayoutEffect ordering. play() calls
  // measure() synchronously, and under [data-seq="done"] the copy is a 1x1
  // sr-only box. If a replay ever plays before React commits
  // data-seq="running", the copy collapses and the whole shot composes against
  // the wrong horizon -- silently, with no error and nothing else failing.
  const mid = await page.evaluate(() => ({
    seq: document.querySelector('.sq-hero')?.dataset.seq,
    copyH: parseFloat(getComputedStyle(document.querySelector('.sq-hero__text')).height),
    handleHidden: document.querySelector('.sq-peel__handle')?.hidden,
  }));
  mid.seq === 'running' ? note('replay entered the running state') : fail(`mid-replay seq=${mid.seq}`);
  mid.copyH > 20
    ? note(`geometry re-measured against the running layout (copy ${mid.copyH.toFixed(0)}px)`)
    : fail(`copy collapsed to ${mid.copyH}px during replay -- play() ran before data-seq committed`);
  mid.handleHidden === true
    ? note('peel handle hidden for the duration')
    : fail('peel handle still draggable mid-replay');

  const back = await page
    .waitForFunction(() => document.querySelector('.sq-hero')?.dataset.seq === 'done', null, {
      timeout: 60000,
    })
    .then(() => true)
    .catch(() => false);
  back ? note('replay completes') : fail('replay never finished');

  const after = await page.evaluate(() => ({
    phases: [...new Set(window.__t.filter(Boolean))],
    open: document.querySelectorAll('.cir-path[data-open="true"]').length,
    lit: document.querySelector('.cir-paths')?.dataset.lit,
    peel: document.querySelector('.sq-stage')?.dataset.peel,
  }));
  const want = ['expansion', 'return', 'rotation', 'acceleration', 'burst', 'paths', 'exploration'];
  const missing = want.filter((x) => !after.phases.includes(x));
  missing.length ? fail(`replay skipped: ${missing.join(', ')}`) : note('all 7 phases replayed');
  after.open === 4 ? note('four panels stood up again') : fail(`${after.open}/4 reopened`);
  after.lit === 'true' ? note('nav re-lit') : fail(`nav data-lit=${after.lit}`);
  // The peel is a separate axis and a replay must not touch it.
  after.peel === 'ready' ? note('peel untouched by the replay') : fail(`peel=${after.peel}`);

  // Keyboard: Enter replays, and focus must come back -- `disabled` blurs the
  // button, which would otherwise strand a keyboard user on <body> for 4.45s.
  await page.focus('.cir-paths__flare');
  await page.keyboard.press('Enter');
  const notTabbable = await page.evaluate(
    () => document.querySelector('.cir-paths__flare')?.disabled === true
  );
  notTabbable
    ? note('flare is disabled, so not tabbable, while replaying')
    : fail('flare still focusable mid-replay');
  await page
    .waitForFunction(() => document.querySelector('.sq-hero')?.dataset.seq === 'done', null, {
      timeout: 60000,
    })
    .catch(() => {});
  const refocused = await page
    .waitForFunction(() => document.activeElement?.classList?.contains('cir-paths__flare'), null, {
      timeout: 6000,
    })
    .then(() => true)
    .catch(() => false);
  refocused
    ? note('focus returns to the star after a keyboard replay')
    : fail('focus lost after a keyboard replay');

  await page.screenshot({ path: `${OUT}/04-after-replay.png` });
  await page.close();
}

// Under reduced motion no engine is ever built, so the control must be inert.
console.log('\n[E] reduced motion leaves the star inert');
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const f = await page.evaluate(() => {
    const el = document.querySelector('.cir-paths__flare');
    return el
      ? {
          disabled: el.disabled,
          ariaHidden: el.getAttribute('aria-hidden'),
          pe: getComputedStyle(el).pointerEvents,
        }
      : null;
  });
  if (!f) fail('no flare under reduced motion');
  else {
    f.disabled === true ? note('flare disabled') : fail('flare is interactive under reduced motion');
    f.ariaHidden === 'true' ? note('flare hidden from assistive tech') : fail(`aria-hidden=${f.ariaHidden}`);
    f.pe === 'none' ? note('flare takes no pointer events') : fail(`pointer-events=${f.pe}`);
  }
  await page.close();
}

console.log('\n' + '='.repeat(52));
console.log(problems.length ? `${problems.length} problem(s):\n - ` + problems.join('\n - ') : 'all hero-sequence checks passed');
console.log(`shots in ${OUT}`);
await browser.close();
process.exit(problems.length ? 1 : 0);
