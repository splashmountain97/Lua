#!/usr/bin/env node
// The deterministic half of the weekly "new questions" task. Claude (the
// scheduled task in ~/.claude/scheduled-tasks/lua-weekly-questions) does the
// reading and the writing; this script does the parts that must not be left to
// judgement: what changed this week, whether a candidate already exists, whether
// it copies a source sentence, and appending to the library with fresh ids.
//
//   node scripts/question-pipeline.mjs sources  --since 2026-11-19
//   node scripts/question-pipeline.mjs snapshot            (after a successful run)
//   node scripts/question-pipeline.mjs check    candidates.json
//   node scripts/question-pipeline.mjs append   candidates.json [--dry-run]
//   node scripts/question-pipeline.mjs log      candidates.json --pr 57
//
// candidates.json is an array of
//   { en, pt, c: 'you'|'life'|'world', w: 1|2|3, source, idea }
// where `source` names where the idea came from ("Readwise · Meditations",
// "Recall · <title>", "Captures 2026-11-25", "Seeds") and `idea` is one line
// in the task's own words — never a quote.
//
// The vault is Pedro's Obsidian vault; override with LUA_VAULT.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import { join, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(REPO, 'src/data/content.ts');
const VAULT =
  process.env.LUA_VAULT ||
  join(homedir(), 'Library/Mobile Documents/iCloud~md~obsidian/Documents/PM Vault');
const READWISE = join(VAULT, '04 - Resources/Readwise');
const RECALL = join(VAULT, '04 - Resources/Recall');
const CAPTURES = join(VAULT, '00 - Inbox/Captures.md');
const LUA_DIR = join(VAULT, '03 - Projects/Lua');
const SEEDS = join(LUA_DIR, 'Lua Seeds.md');
const LOG = join(LUA_DIR, 'Question Log.md');
const SNAPSHOT = join(LUA_DIR, 'readwise-snapshot.json');

const CATS = new Set(['you', 'life', 'world']);
const MAX_LEN = 150; // the longest question in the library today is a little under this

// ---------------------------------------------------------------- helpers

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
};

const frontmatter = (text) => {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (!m) return fm;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1').trim();
  }
  return fm;
};

const stripDiacritics = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const normalize = (s) =>
  stripDiacritics(s.toLowerCase())
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const STOP = new Set(
  'the a an of to in on at for and or is are be do does did you your yours what which who whom when where why how it its this that these those with from by as if than then there here not no so i me my we our one thing things today right now would could should have has had was were will about into out up down more most some any'.split(' '),
);
const contentWords = (s) => normalize(s).split(' ').filter((w) => w && !STOP.has(w));
const shingles = (s, n) => {
  const w = normalize(s).split(' ').filter(Boolean);
  const out = [];
  for (let i = 0; i + n <= w.length; i++) out.push(w.slice(i, i + n).join(' '));
  return out;
};
const jaccard = (a, b) => {
  const A = new Set(a), B = new Set(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
};

// Parse the library straight out of content.ts. The file is data, but it is
// TypeScript, so we read the one array we need by regex rather than import it.
const readLibrary = () => {
  const src = readFileSync(CONTENT, 'utf8');
  const start = src.indexOf('export const PROMPTS');
  const end = src.indexOf('\n];', start);
  if (start < 0 || end < 0) throw new Error('could not find PROMPTS in content.ts');
  const body = src.slice(start, end);
  const re = /\{ id: (\d+), c: '(\w+)', w: (\d), t: \{ en: '((?:[^'\\]|\\.)*)', pt: '((?:[^'\\]|\\.)*)' \} \}/g;
  const prompts = [];
  let m;
  while ((m = re.exec(body))) {
    prompts.push({ id: +m[1], c: m[2], w: +m[3], en: m[4].replace(/\\'/g, "'"), pt: m[5].replace(/\\'/g, "'") });
  }
  const allIds = [...src.matchAll(/\bid: (\d+)/g)].map((x) => +x[1]);
  return { src, prompts, maxId: Math.max(...allIds), arrayEnd: end };
};

const readCandidates = (file) => {
  const list = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(list)) throw new Error('candidates file must be a JSON array');
  return list;
};

const arg = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : dflt;
};
const flag = (name) => process.argv.includes(name);
const today = () => new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------- readwise state

// Highlight lines of every Readwise note: "- text ([Location 12](...))", with
// the trailing link removed. Keyed by relative path under the Readwise folder.
const readwiseState = () => {
  const state = {};
  for (const p of walk(READWISE)) {
    if (p.includes('/Full Document Contents/')) continue;
    const text = readFileSync(p, 'utf8');
    const after = text.split(/^## Highlights\s*$/m)[1];
    if (!after) continue;
    const highlights = [];
    for (const line of after.split('\n')) {
      const m = line.match(/^- (.+)$/);
      if (!m) continue;
      highlights.push(m[1].replace(/\s*\(\[(View Highlight|Location\s\d+)\]\([^)]*\)\)\s*$/, '').trim());
    }
    state[p.slice(READWISE.length + 1)] = highlights;
  }
  return state;
};
const highlightKey = (h) => normalize(h).slice(0, 120);

function snapshot() {
  mkdirSync(LUA_DIR, { recursive: true });
  const state = readwiseState();
  const keyed = Object.fromEntries(Object.entries(state).map(([k, v]) => [k, v.map(highlightKey)]));
  writeFileSync(SNAPSHOT, JSON.stringify(keyed, null, 1) + '\n');
  const total = Object.values(state).reduce((a, v) => a + v.length, 0);
  process.stdout.write(`snapshot: ${Object.keys(state).length} notes, ${total} highlights → ${SNAPSHOT}\n`);
}

// ---------------------------------------------------------------- sources

function sources() {
  const since = arg('--since');
  if (!since) throw new Error('--since YYYY-MM-DD is required');
  const sinceMs = Date.parse(since);
  const out = [];
  out.push(`# New material since ${since}\n`);

  // Readwise: the plugin's notes carry no dates and it rewrites whole files, so
  // "new" is anything not in the snapshot the last successful run left behind.
  out.push('## Readwise (highlights not in the last snapshot)');
  let n = 0;
  if (!existsSync(SNAPSHOT)) {
    out.push(`- no snapshot yet at ${SNAPSHOT} — run \`snapshot\` to start one; Readwise is skipped this time`);
  } else {
    const prev = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
    for (const [rel, highlights] of Object.entries(readwiseState())) {
      const seen = new Set(prev[rel] || []);
      const fresh = highlights.filter((h) => !seen.has(highlightKey(h)));
      if (!fresh.length) continue;
      const p = join(READWISE, rel);
      const author = (readFileSync(p, 'utf8').match(/^- Author: \[\[(.+?)\]\]/m) || [])[1] || '';
      out.push(`- ${dirname(rel)} · **${basename(rel, '.md')}**${author ? ` (${author})` : ''} — ${fresh.length} new highlight${fresh.length === 1 ? '' : 's'}${prev[rel] ? '' : ' (new source)'}\n  ${p}`);
      for (const h of fresh.slice(0, 40)) out.push(`    > ${h}`);
      if (fresh.length > 40) out.push(`    … ${fresh.length - 40} more in the file`);
      n++;
    }
  }
  if (!n && existsSync(SNAPSHOT)) out.push('- none');

  // Recall: every note carries saved: YYYY-MM-DD.
  out.push('\n## Recall (notes saved in the window)');
  n = 0;
  for (const p of walk(RECALL)) {
    if (basename(p) === 'Recall Index.md') continue;
    const text = readFileSync(p, 'utf8');
    const fm = frontmatter(text);
    if (!fm.saved || Date.parse(fm.saved) < sinceMs) continue;
    const tldr = (text.match(/## TL;DR\n+([\s\S]*?)\n\n/) || [])[1]?.replace(/\s+/g, ' ') || '';
    out.push(`- ${fm.theme || basename(dirname(p))} · **${fm.title || basename(p, '.md')}** (${fm.type || '?'}${fm.author ? `, ${fm.author}` : ''}) — saved ${fm.saved}\n  ${p}\n  ${tldr}`);
    n++;
  }
  if (!n) out.push('- none');

  // Captures: "- YYYY-MM-DD HH:MM - text". Empty lines are the shortcut misfiring.
  out.push('\n## Captures (phone, in the window)');
  n = 0;
  if (existsSync(CAPTURES)) {
    for (const line of readFileSync(CAPTURES, 'utf8').split('\n')) {
      const m = line.match(/^-\s*(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) - (.+)$/);
      if (!m || Date.parse(m[1]) < sinceMs || !m[3].trim()) continue;
      out.push(`- ${m[1]} ${m[2]} — ${m[3].trim()}`);
      n++;
    }
  }
  if (!n) out.push('- none');

  // Seeds: everything above "## Processed" is unprocessed, whatever its date.
  out.push('\n## Lua Seeds (unprocessed)');
  n = 0;
  if (existsSync(SEEDS)) {
    const text = readFileSync(SEEDS, 'utf8');
    const open = text.split(/^## Processed/m)[0];
    for (const line of open.split('\n')) {
      if (/^- \S/.test(line)) {
        out.push(line);
        n++;
      }
    }
  }
  if (!n) out.push('- none');

  process.stdout.write(out.join('\n') + '\n');
}

// ---------------------------------------------------------------- check

function check(file) {
  const cands = readCandidates(file);
  const { prompts } = readLibrary();

  // Every sentence of source text we hold locally, for the copy check.
  const sourceLines = [];
  for (const p of [...walk(READWISE), ...walk(RECALL)]) {
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      if (line.trim().length > 30) sourceLines.push({ file: basename(p, '.md'), line });
    }
  }
  const N = 6; // a shared run of this many words is treated as copying
  const shingleIndex = new Map();
  for (const { file: f, line } of sourceLines) {
    for (const s of shingles(line, N)) if (!shingleIndex.has(s)) shingleIndex.set(s, f);
  }

  let failures = 0;
  const report = [];
  const fail = (i, msg) => { failures++; report.push(`  ✗ ${msg}`); };
  const warn = (i, msg) => report.push(`  ~ ${msg}`);

  cands.forEach((c, i) => {
    report.push(`\n[${i + 1}] ${c.en}\n    ${c.pt}\n    ${c.c}/${c.w} · ${c.source || '(no source)'}`);

    // Shape
    if (!c.en || !c.pt) fail(i, 'needs both en and pt');
    if (!CATS.has(c.c)) fail(i, `category must be you|life|world, got ${c.c}`);
    if (![1, 2, 3].includes(c.w)) fail(i, `weight must be 1|2|3, got ${c.w}`);
    if (!c.source) fail(i, 'needs a source');
    if (!c.idea) fail(i, 'needs the idea in one line (your words)');
    for (const [lang, t] of [['en', c.en], ['pt', c.pt]]) {
      if (!t) continue;
      if (!/\?$/.test(t.trim())) fail(i, `${lang} must end with a question mark`);
      if (t.length > MAX_LEN) fail(i, `${lang} is ${t.length} chars; keep it under ${MAX_LEN}`);
      if (/\n/.test(t)) fail(i, `${lang} must be one line`);
      if (/^(do|does|did|is|are|was|were|have|has|can|could|will|would|should) you\b/i.test(t) && !/,|\bor\b|\bwhat\b|\bwhich\b/i.test(t))
        warn(i, `${lang} reads as yes/no — fine only if the obvious answer opens something`);
      if (/should/i.test(t)) warn(i, `${lang} contains "should" — advice in a question's clothing?`);
      if (/\b(according to|as .* says|the book|the author)\b/i.test(t)) fail(i, `${lang} points at a source; the question must stand alone`);
    }

    // Duplicates against the library (English is the authored language).
    if (c.en) {
      const words = contentWords(c.en);
      for (const p of prompts) {
        if (normalize(p.en) === normalize(c.en)) { fail(i, `identical to #${p.id}`); break; }
        const j = jaccard(words, contentWords(p.en));
        if (j >= 0.6) fail(i, `too close to #${p.id} "${p.en}" (overlap ${j.toFixed(2)})`);
        else if (j >= 0.4) warn(i, `near #${p.id} "${p.en}" (overlap ${j.toFixed(2)}) — same question or a genuinely different angle?`);
      }
      // ...and against the other candidates in this batch.
      cands.forEach((o, k) => {
        if (k > i && o.en && jaccard(words, contentWords(o.en)) >= 0.6) fail(i, `too close to candidate [${k + 1}]`);
      });
    }

    // Copying: any run of N words shared with a highlight or Recall note.
    for (const t of [c.en, c.pt]) {
      if (!t) continue;
      for (const s of shingles(t, N)) {
        if (shingleIndex.has(s)) { fail(i, `shares a ${N}-word run with "${shingleIndex.get(s)}": "${s}"`); break; }
      }
    }
    // The idea line is also ours, not theirs.
    if (c.idea) for (const s of shingles(c.idea, N)) {
      if (shingleIndex.has(s)) { fail(i, `the idea line copies "${shingleIndex.get(s)}": "${s}"`); break; }
    }
  });

  process.stdout.write(report.join('\n') + `\n\n${cands.length} candidates, ${failures} failure${failures === 1 ? '' : 's'}.\n`);
  if (failures) process.exit(1);
}

// ---------------------------------------------------------------- append

const q = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

function append(file) {
  const cands = readCandidates(file);
  const dry = flag('--dry-run');
  const { src, maxId, arrayEnd } = readLibrary();
  let id = maxId;
  const lines = cands.map((c) => {
    id++;
    c.id = id;
    return `  { id: ${id}, c: '${c.c}', w: ${c.w}, t: { en: '${q(c.en)}', pt: '${q(c.pt)}' } },`;
  });
  const next = src.slice(0, arrayEnd) + '\n' + lines.join('\n') + src.slice(arrayEnd);
  process.stdout.write(lines.join('\n') + '\n');
  if (dry) {
    process.stdout.write(`(dry run — would assign ids ${maxId + 1}–${id})\n`);
    return;
  }
  writeFileSync(CONTENT, next);
  writeFileSync(file, JSON.stringify(cands, null, 2) + '\n'); // ids back into the file for `log`
  process.stdout.write(`appended ${cands.length} to ${CONTENT} (ids ${maxId + 1}–${id})\n`);
}

// ---------------------------------------------------------------- log

function log(file) {
  const cands = readCandidates(file);
  const pr = arg('--pr', '');
  mkdirSync(LUA_DIR, { recursive: true });
  if (!existsSync(LOG)) {
    writeFileSync(
      LOG,
      `# Question Log\n\nEvery question the weekly task proposed, with where it came from. "proposed" becomes "accepted" when its PR merges and "rejected" when the PR is closed or the line is deleted before merging. The task reads this before proposing, so a rejected question is never proposed twice.\n\n| date | id | status | PR | category/weight | question (en) | source | idea |\n|---|---|---|---|---|---|---|---|\n`,
    );
  }
  const rows = cands.map(
    (c) => `| ${today()} | ${c.id ?? ''} | proposed | ${pr ? `#${pr}` : ''} | ${c.c}/${c.w} | ${c.en.replace(/\|/g, '/')} | ${(c.source || '').replace(/\|/g, '/')} | ${(c.idea || '').replace(/\|/g, '/')} |`,
  );
  appendFileSync(LOG, rows.join('\n') + '\n');
  process.stdout.write(`logged ${rows.length} rows to ${LOG}\n`);
}

// ---------------------------------------------------------------- main

const [cmd, file] = process.argv.slice(2);
try {
  if (cmd === 'sources') sources();
  else if (cmd === 'snapshot') snapshot();
  else if (cmd === 'check' && file) check(file);
  else if (cmd === 'append' && file) append(file);
  else if (cmd === 'log' && file) log(file);
  else {
    process.stderr.write('usage: question-pipeline.mjs sources --since DATE | snapshot | check FILE | append FILE [--dry-run] | log FILE --pr N\n');
    process.exit(2);
  }
} catch (e) {
  process.stderr.write(`error: ${e.message}\n`);
  process.exit(1);
}
