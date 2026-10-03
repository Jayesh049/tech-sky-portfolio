// One clean compression pass over the project screenshots.
// Source PNGs stay in review/ so they never ship.
import { readdir, mkdir, rename, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const SRC = 'public/work';
const KEEP = 'review/work-src';
await mkdir(KEEP, { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith('.png'));
let before = 0;
let after = 0;

for (const f of files) {
  const from = join(SRC, f);
  before += (await stat(from)).size;

  const out = join(SRC, f.replace(/\.png$/, '.webp'));
  await sharp(from)
    .resize({ width: 1340, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(out);

  after += (await stat(out)).size;
  await rename(from, join(KEEP, f));
}

const mb = (n) => (n / 1048576).toFixed(2) + ' MB';
console.log(`images: ${files.length} files, ${mb(before)} -> ${mb(after)}`);
