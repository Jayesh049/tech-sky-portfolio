import { chromium } from 'playwright';

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const ctx = await browser.newContext({
  viewport: { width: 375, height: 812 },
  hasTouch: true,
  isMobile: true,
});
const page = await ctx.newPage();
page.setDefaultTimeout(90000);
await page.goto(process.env.TEST_URL || 'http://localhost:5178/', { waitUntil: 'domcontentloaded' });
await page.locator('.chip').first().waitFor({ state: 'visible', timeout: 90000 });
await page.waitForTimeout(4000);

const info = await page.evaluate(() => {
  const chip = document.querySelector('.chip');
  chip.scrollIntoView({ block: 'center' });
  const r = chip.getBoundingClientRect();
  const cx = Math.round(r.left + r.width / 2);
  const cy = Math.round(r.top + r.height / 2);
  const hit = document.elementFromPoint(cx, cy);
  const chain = [];
  let n = hit;
  while (n && chain.length < 6) {
    const cs = getComputedStyle(n);
    chain.push(`${n.tagName}.${String(n.className).slice(0, 28)} [z=${cs.zIndex} pe=${cs.pointerEvents} pos=${cs.position}]`);
    n = n.parentElement;
  }
  return {
    chipRect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    point: [cx, cy],
    hitIsChipOrInside: hit === chip || chip.contains(hit) || hit.contains(chip),
    hitChain: chain,
    disabled: chip.disabled,
  };
});
console.log(JSON.stringify(info, null, 2));

// does a plain DOM click reach the handler at all?
const domClick = await page.evaluate(() => {
  const chip = document.querySelector('.chip');
  chip.click();
  return new Promise((r) =>
    setTimeout(() => r(document.querySelector('.hero').dataset.phase), 1500)
  );
});
console.log('phase after el.click():', domClick);
await browser.close();
