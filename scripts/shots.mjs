// Visual probe. The in-app browser pane is far narrower than a desktop, so
// design judgement has to happen at a real viewport. Drives the same Chromium
// flags as selftest.mjs so WebGL actually renders under software GL.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL = process.env.TEST_URL || 'http://localhost:5179/';
const OUT = process.env.OUT || 'review/ciridae';
const WIDTH = Number(process.env.W || 1440);
const HEIGHT = Number(process.env.H || 900);
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ],
});
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

// Walk the page so IntersectionObserver actually fires; a fullPage screenshot
// never scrolls, so entrances would stay unplayed and the shot would lie.
await page.evaluate(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const step = window.innerHeight * 0.5;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 260));
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 700));
});

const targets = [
  ['01-masthead', null],
  ['02-about', '#about'],
  ['03-stack', '#stack'],
  ['04-work', '#work'],
  ['05-film', '#film'],
  ['06-experience', '#experience'],
  ['07-contact', '#contact'],
];

for (const [name, sel] of targets) {
  if (sel) {
    await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
    }, sel);
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot', name);
}

// The type ceiling and the no-bold rule, measured rather than eyeballed.
const bad = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('body *').forEach((el) => {
    let hasText = false;
    for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) hasText = true;
    if (!hasText) return;
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize);
    const fw = parseInt(cs.fontWeight, 10);
    const id = `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`;
    if (fs > 32.5) out.push(`SIZE ${id} ${fs.toFixed(1)}px`);
    if (fw > 400) out.push(`WEIGHT ${id} ${fw}`);
  });
  return [...new Set(out)];
});
console.log('\ntype-ceiling violations:', bad.length);
bad.slice(0, 30).forEach((b) => console.log('  ' + b));

const reveal = await page.evaluate(() => ({
  total: document.querySelectorAll('[data-reveal]').length,
  played: document.querySelectorAll('[data-reveal].in').length,
  stuck: [...document.querySelectorAll('[data-reveal]:not(.in)')].map(
    (e) => (e.className || e.tagName).toString().split(' ')[0]
  ),
}));
console.log('\nreveals:', JSON.stringify(reveal));

await browser.close();
