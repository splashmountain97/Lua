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

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(root, 'dist');
const ORIGIN = 'https://lua-coral.vercel.app';

const escapeAttr = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const source = await readFile(join(root, 'src/data/content.ts'), 'utf8');
const prompts = [...source.matchAll(/\{ id: (\d+), c: '(\w+)', w: (\d), t: '([^']*)' \}/g)]
  .map(([, id, , , t]) => ({ id: Number(id), t }));

if (!prompts.length) {
  throw new Error('no prompts parsed from src/data/content.ts — has the format changed?');
}
const ids = new Set(prompts.map(p => p.id));
if (ids.size !== prompts.length) {
  throw new Error('duplicate prompt ids — share links must resolve to exactly one question');
}

const shell = await readFile(join(DIST, 'index.html'), 'utf8');

for (const { id, t } of prompts) {
  const url = `${ORIGIN}/q/${id}`;
  const page = shell
    .replace('<title>Lua</title>', `<title>${escapeAttr(t)}</title>`)
    .replace(
      /<meta property="og:title"[^>]*>/,
      `<meta property="og:title" content="${escapeAttr(t)}" />`,
    )
    .replace(
      /<meta property="og:description"[^>]*>/,
      '<meta property="og:description" content="A question, once a day. Sit with it as long as you like." />',
    )
    .replace(
      /<meta property="og:url"[^>]*>/,
      `<meta property="og:url" content="${url}" />`,
    );

  const dir = join(DIST, 'q', String(id));
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), page);
}

console.log(`share pages: ${prompts.length} written to dist/q/`);
