import { chromium } from 'playwright';
import sharp from 'sharp';

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(process.env.TEST_URL || 'http://localhost:5178/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.screenshot({ path: 'review/shots/probe-hero.png', animations: 'disabled', timeout: 90000 });

const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

const boxes = [];
for (const sel of ['.hero-h1', '.hero-sub']) boxes.push([sel, await page.locator(sel).boundingBox()]);
await page.addStyleTag({ content: '.hero-copy{visibility:hidden!important}' });
await page.waitForTimeout(400);

for (const [sel, box] of boxes) {
  const buf = await page.screenshot({ clip: box, animations: 'disabled', timeout: 90000 });
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  let worst = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const L = lum(data[i], data[i + 1], data[i + 2]);
    if (L > worst) worst = L;
  }
  const t = sel === '.hero-sub' ? lum(0xb9, 0xbf, 0xd0) : lum(0xea, 0xe7, 0xdf);
  const ratio = (Math.max(t, worst) + 0.05) / (Math.min(t, worst) + 0.05);
  console.log(`${sel.padEnd(11)} worst-pixel contrast ${ratio.toFixed(2)}:1`);
}
await browser.close();
