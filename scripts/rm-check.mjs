// Reduced motion is the highest-severity risk in this design: index.css zeroes
// every duration, so anything whose RESTING state is scale(0) or a full
// clip-path inset would be permanently invisible. Assert the final state of
// every draw-in directly.
import { chromium } from 'playwright';
const URL = process.env.TEST_URL || 'http://localhost:5179/';
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.evaluate(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const step = window.innerHeight * 0.5;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 200));
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 600));
});

const bad = await page.evaluate(() => {
  const out = [];
  const zeroish = (t) => t && t !== 'none' && /matrix\((?:0|[-0-9.]+, 0, 0, 0)/.test(t);
  // every hairline that draws must end visible
  document.querySelectorAll('.h2, .hero-h1').forEach((el) => {
    const cs = getComputedStyle(el, '::after');
    if (zeroish(cs.transform)) out.push(`rule collapsed on .${el.className.split(' ')[0]}`);
  });
  document.querySelectorAll('.job').forEach((el, i) => {
    const cs = getComputedStyle(el, '::after');
    if (zeroish(cs.transform)) out.push(`spine collapsed on .job[${i}]`);
  });
  const contact = document.querySelector('.sec-contact');
  if (contact) {
    const cp = getComputedStyle(contact).clipPath;
    if (cp && cp !== 'none' && /100%/.test(cp)) out.push(`contact still clipped: ${cp}`);
  }
  document.querySelectorAll('.cir-mark__pt').forEach((el, i) => {
    if (parseFloat(getComputedStyle(el).opacity) < 0.9) out.push(`mark point ${i} invisible`);
  });
  const core = document.querySelector('.cir-mark__core');
  if (core && parseFloat(getComputedStyle(core).strokeDashoffset) > 1) out.push('mark core undrawn');
  const veil = document.querySelector('.hero-veil');
  if (veil && parseFloat(getComputedStyle(veil).opacity) > 0.05) out.push('hero veil still covering');
  document.querySelectorAll('.cir-flank').forEach((el, i) => {
    if (parseFloat(getComputedStyle(el).opacity) < 0.9) out.push(`flank ${i} invisible`);
  });
  const t = document.querySelector('.newsbar__ticker');
  if (t && /100%/.test(getComputedStyle(t).clipPath || '')) out.push('ticker still clipped');
  // and nothing anywhere may be left at zero opacity
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    if (parseFloat(getComputedStyle(el).opacity) < 0.9)
      out.push(`hidden: ${(el.className || el.tagName).toString().split(' ')[0]}`);
  });
  return out;
});
console.log(bad.length ? 'REDUCED-MOTION FAILURES:\n  ' + bad.join('\n  ') : 'reduced motion: every draw-in shows its final state');
await page.screenshot({ path: 'review/ciridae/rm-masthead.png' });
await browser.close();
process.exit(bad.length ? 1 : 0);
