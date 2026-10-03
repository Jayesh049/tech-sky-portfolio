// Writes public/logos/<id>.svg from simple-icons path data.
// These are the files SVGLoader extrudes into real meshes at runtime.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as si from 'simple-icons';
import { techs } from '../src/data/techs.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'logos');
await mkdir(out, { recursive: true });

const key = (slug) => 'si' + slug.charAt(0).toUpperCase() + slug.slice(1);

let written = 0;
const missing = [];

for (const tech of techs) {
  // A hand-drawn mark (24x24, filled, one or more paths) for a technology
  // that has no brand icon. Separate paths may overlap; SVGLoader extrudes
  // each one and the meshes simply union.
  if (tech.glyph) {
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">',
      `<title>${tech.name}</title>`,
      ...tech.glyph.map((d) => `<path fill-rule="evenodd" d="${d}"/>`),
      '</svg>',
    ].join('');
    await writeFile(join(out, `${tech.id}.svg`), svg, 'utf8');
    written += 1;
    continue;
  }
  const icon = si[key(tech.icon)];
  if (!icon) {
    missing.push(`${tech.name} (looked for ${key(tech.icon)})`);
    continue;
  }
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">',
    `<title>${icon.title}</title>`,
    `<path d="${icon.path}"/>`,
    '</svg>',
  ].join('');
  await writeFile(join(out, `${tech.id}.svg`), svg, 'utf8');
  written += 1;
}

console.log(`logos: wrote ${written} of ${techs.length} into public/logos`);
if (missing.length) {
  console.error('logos: no simple-icons entry for:\n  ' + missing.join('\n  '));
  process.exit(1);
}
