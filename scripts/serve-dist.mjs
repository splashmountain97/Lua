// A static server for the built dist/, for looking at the site locally.
// It does what Vercel will do with vercel.json: directory indexes, the
// /q/<id> redirects, and the /app/q/* rewrite to the app shell.
//
//   npm run build && npm run serve   → http://localhost:4173
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT || 4173);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain', '.xml': 'application/xml',
};

createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const q = /^\/q\/(pt\/)?(\d+)\/?$/.exec(path);
  if (q) { res.writeHead(301, { Location: `/app/q/${q[1] ?? ''}${q[2]}` }); return res.end(); }
  if (path === '/app') { res.writeHead(302, { Location: '/app/' }); return res.end(); }
  let file = normalize(join(DIST, path));
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file) && path.startsWith('/app/')) file = join(DIST, 'app', 'index.html');
  if (!existsSync(file)) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('not found'); }
  const headers = { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' };
  if (path.startsWith('/.well-known/')) headers['Content-Type'] = 'application/json';
  res.writeHead(200, headers);
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`dist served at http://localhost:${PORT}`));
