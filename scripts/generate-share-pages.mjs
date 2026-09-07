// Builds one static page per question under dist/q/<id>/.
//
// Share links have to preview properly in a chat app, and the crawlers that
// build those previews do not run the app's JavaScript — they read the HTML the
// server returns. So the question cannot be put on the page at runtime; it has
// to be in the markup already. Each page here is the same app shell with its own
// title and Open Graph tags, which Vercel serves as a static file. No server and
// no database, so the app's promise that nothing is stored still holds.
//
// The running app reads the id back out of the path (see lib/share.ts) and opens
// on that question, so the same URL works for both the crawler and the person.
//
// One page per question per language. A preview can only be in one language, so
// the sender's decides: English keeps the canonical /q/<id> because English is
// the source language, and Portuguese gets /q/pt/<id>. shareUrl in
// data/content.ts is the other half of this and has to agree with it.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(root, 'dist');
const ORIGIN = 'https://lua-coral.vercel.app';

const escapeAttr = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const source = await readFile(join(root, 'src/data/content.ts'), 'utf8');
const prompts = [
  ...source.matchAll(/\{ id: (\d+), c: '(\w+)', w: (\d), t: \{ en: '([^']*)', pt: '([^']*)' \} \}/g),
].map(([, id, , , en, pt]) => ({ id: Number(id), t: { en, pt } }));

if (!prompts.length) {
  throw new Error('no prompts parsed from src/data/content.ts — has the format changed?');
}
// Parsing TypeScript with a regex is the one brittle seam in this build, so it
// is checked against the raw count rather than trusted: a prompt the pattern
// silently skipped would lose its share page without failing anything.
const declared = [...source.matchAll(/^ {2}\{ id: (\d+), c: '/gm)].length;
if (declared !== prompts.length) {
  throw new Error(
    `parsed ${prompts.length} prompts but ${declared} are declared — the row format has drifted`,
  );
}
const ids = new Set(prompts.map(p => p.id));
if (ids.size !== prompts.length) {
  throw new Error('duplicate prompt ids — share links must resolve to exactly one question');
}

const LOCALES = [
  { lang: 'en', path: (id) => `q/${id}`, desc: 'A question, once a day. Sit with it as long as you like.' },
  { lang: 'pt', path: (id) => `q/pt/${id}`, desc: 'Uma pergunta por dia. Fique com ela o tempo que quiser.' },
];

const shell = await readFile(join(DIST, 'index.html'), 'utf8');

for (const { id, t } of prompts) {
  for (const { lang, path, desc } of LOCALES) {
    const url = `${ORIGIN}/${path(id)}`;
    const title = t[lang];
    const page = shell
      .replace('<title>Lua</title>', `<title>${escapeAttr(title)}</title>`)
      .replace('<html lang="en">', `<html lang="${lang === 'pt' ? 'pt-BR' : 'en'}">`)
      .replace(
        /<meta property="og:title"[^>]*>/,
        `<meta property="og:title" content="${escapeAttr(title)}" />`,
      )
      .replace(
        /<meta property="og:description"[^>]*>/,
        `<meta property="og:description" content="${escapeAttr(desc)}" />`,
      )
      .replace(
        /<meta property="og:url"[^>]*>/,
        `<meta property="og:url" content="${url}" />`,
      );

    const dir = join(DIST, path(id));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), page);
  }
}

console.log(`share pages: ${prompts.length * LOCALES.length} written to dist/q/`);
