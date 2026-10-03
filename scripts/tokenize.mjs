// Shiki is heavy at runtime, so every snippet is tokenised here at build time
// and the app ships the tokens instead of the highlighter.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHighlighter } from 'shiki';
import { techs } from '../src/data/techs.js';
import { techStory } from '../src/data/techStory.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const THEME = 'github-dark-default';

const hl = await createHighlighter({
  themes: [THEME],
  langs: ['js', 'jsx', 'python', 'ts', 'tsx', 'java', 'sql', 'csharp', 'dockerfile', 'yaml'],
});

// One entry per snippet: an array of lines, each an array of [text, color] pairs.
// Colours are indexed into a palette so the JSON stays small.
const palette = [];
const idx = (color) => {
  const c = (color || '#e6edf3').toLowerCase();
  let i = palette.indexOf(c);
  if (i === -1) i = palette.push(c) - 1;
  return i;
};

const snippets = {};
for (const tech of techs) {
  for (const [kind, code, lang] of [
    ['logo', tech.logoCode, 'js'],
    ['ui', tech.uiCode, 'jsx'],
  ]) {
    // The technologies added from the 2026 resume carry only story code.
    if (!code) continue;
    const { tokens } = hl.codeToTokens(code, { lang, theme: THEME });
    snippets[`${tech.id}:${kind}`] = tokens.map((line) =>
      line.map((t) => [t.content, idx(t.color)])
    );
  }
}

// The film section's two states of auth.py. Not a tech, so keyed by hand, and
// appended AFTER the techs loop so the existing palette indices keep their
// numbers and the regenerated JSON diffs by appended colours only.
//
// Two snippets, not four: Read and Found share the file as found, Fixed and
// Shipped share it after the fix. The changed line is called out with a CSS
// band over CodePanel's own .cp-line, so a third and fourth copy of identical
// text would buy nothing.
const FILM_BAD = `def get_user(username):
    query = "SELECT * FROM users WHERE name = '" + username + "'"
    return db.execute(query)`;

const FILM_GOOD = `def get_user(username):
    query = "SELECT * FROM users WHERE name = %s"
    return db.execute(query, (username,))`;

for (const [key, code] of [
  ['auth:bad', FILM_BAD],
  ['auth:good', FILM_GOOD],
]) {
  const { tokens } = hl.codeToTokens(code, { lang: 'python', theme: THEME });
  snippets[key] = tokens.map((line) => line.map((t) => [t.content, idx(t.color)]));
}

// The skills sky's code window: one real example per technology, in that
// technology's own language. Appended after everything above so existing
// palette indices keep their numbers.
for (const tech of techs) {
  const story = techStory[tech.id];
  if (!story) continue;
  const { tokens } = hl.codeToTokens(story.code.src, { lang: story.code.lang, theme: THEME });
  snippets[`${tech.id}:story`] = tokens.map((line) => line.map((t) => [t.content, idx(t.color)]));
}

const payload = { palette, snippets };
await writeFile(
  join(root, 'src', 'data', 'tokens.generated.json'),
  JSON.stringify(payload),
  'utf8'
);

const count = Object.keys(snippets).length;
console.log(`tokens: ${count} snippets, ${palette.length} colours`);
