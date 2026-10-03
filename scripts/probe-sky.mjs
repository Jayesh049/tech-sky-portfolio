// What colour is the sky actually rendering, with every scrim removed?
import { chromium } from 'playwright';
import sharp from 'sharp';

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
await page.goto(process.env.TEST_URL || 'http://localhost:5178/', { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
await page.addStyleTag({
  content: '.hero-scrim,.nav,.hero-grid,.stage,.scroll-cue{display:none!important}',
});
await page.waitForTimeout(1500);

const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 900, height: 600 }, timeout: 90000 });
await sharp(buf).toFile('review/shots/probe-sky-raw.png');
const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });

const at = (x, y) => {
  const i = (y * info.width + x) * info.channels;
  return [data[i], data[i + 1], data[i + 2]];
};
console.log('channels', info.channels, info.width + 'x' + info.height);
for (const [label, x, y] of [
  ['top-left', 60, 40],
  ['top-mid', 450, 40],
  ['upper', 450, 160],
  ['middle', 450, 300],
  ['lower', 450, 470],
  ['bottom-right', 840, 560],
]) {
  const [r, g, b] = at(x, y);
  console.log(`${label.padEnd(13)} rgb(${r},${g},${b})  saturation=${(Math.max(r,g,b)-Math.min(r,g,b))}`);
}
await browser.close();
