// Publishes the question library as data, at dist/app/questions.json.
//
// The native app compiles the same library into its binary, and a native build
// is what it costs to change it there. This file is the way round that: the app
// fetches it once a day and, when it parses, uses it as the live library for
// the session, with the compiled copy as the offline fallback. So the weekly
// questions reach phones from the same merge that puts them on the web.
//
// The shape is the library's own: `prompts` is PROMPTS as it stands, every row
// `{ id, c, w, t: { en, pt } }`. `version` is the commit the build came from,
// so two copies can be told apart without comparing them; `generatedAt` is
// when. Nothing else — the categories, weights and copy stay in the code on
// both sides, because they are design, not content.
//
// Read by importing the TypeScript rather than by pattern, so a row this
// script would miss is a row that fails the typecheck first. The type-only
// import at the top of content.ts is stripped with the types, which is what
// lets the module stand on its own.

import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformWithOxc } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(root, 'dist', 'app');
const SOURCE = join(root, 'src/data/content.ts');

const { code } = await transformWithOxc(await readFile(SOURCE, 'utf8'), SOURCE);
const { PROMPTS } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

// The checks the app repeats on arrival, run here first so a bad row never
// leaves the build: the app would refuse the whole file, and the phones would
// quietly stay on their compiled copy until someone noticed.
const CATS = new Set(['you', 'life', 'world']);
const seen = new Set();
for (const p of PROMPTS) {
  const ok = Number.isInteger(p.id) && p.id > 0 && CATS.has(p.c) && [1, 2, 3].includes(p.w)
    && typeof p.t?.en === 'string' && p.t.en.trim() && typeof p.t?.pt === 'string' && p.t.pt.trim();
  if (!ok) throw new Error(`questions.json: malformed prompt ${JSON.stringify(p)}`);
  if (seen.has(p.id)) throw new Error(`questions.json: duplicate prompt id ${p.id}`);
  seen.add(p.id);
}
if (!PROMPTS.length) throw new Error('questions.json: no prompts in src/data/content.ts');

function commit() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 12);
  try { return execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(); }
  catch { return 'local'; }
}

const payload = {
  version: commit(),
  generatedAt: new Date().toISOString(),
  count: PROMPTS.length,
  prompts: PROMPTS.map(({ id, c, w, t }) => ({ id, c, w, t: { en: t.en, pt: t.pt } })),
};

await mkdir(DIST, { recursive: true });
await writeFile(join(DIST, 'questions.json'), JSON.stringify(payload));
console.log(`questions.json: ${PROMPTS.length} prompts, version ${payload.version}, written to dist/app/`);
