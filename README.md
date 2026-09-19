# Lua

A shake-to-reveal daily reflection prompt — a mobile web app (installable as a PWA),
served at https://luadaily.com/app/. The root of luadaily.com is the marketing site
(see "The site" below).

Press and hold the moon (or shake, once motion permission is granted) to reveal today's
question. Filter by category (Self / Life / World) and weight (Light / Firm / Heavy).

Ported from an interactive design prototype (`Lua.dc.html`) built on the Nocturne design
system, front-end only with local state — no backend, no account, nothing stored beyond
this device's own local storage (streak, unlock status, filter preferences).

## Development

```
npm install
npm run dev      # local dev server — the app is at http://localhost:5173/app/
npm run build    # type-check + production build of the app, the share pages and the site
npm run lint     # oxlint
npm run serve    # serve the built dist/ the way Vercel will, at http://localhost:4173
```

The app is built with `base: '/app/'` into `dist/app/`; everything else in `dist/` is
written by `scripts/build-site.mjs`. `vercel.json` redirects the old `/q/<id>` links
to `/app/q/<id>` and rewrites unmatched `/app/q/*` to the app. A worker at `/sw.js`
retires the one that cached the app at `/` before the move; the site's pages send
anything opened in standalone mode (an old home-screen install) on to `/app/`.

## The site

`site/` holds the marketing pages: plain HTML rendered at build time from the
templates in `site/pages`, in English at `/` and Portuguese under `/pt/`, from the one
string table in `site/strings.mjs` (pairs adjacent, like `src/lib/strings.ts`).
`site/config.mjs` carries the store links (empty until the apps are published — the
badges then say "coming soon") and the placeholders the legal pages print.

Generated inputs, committed so the deploy does not redo them:

- `site/img/` — responsive AVIF/WebP/JPEG of the drawings, from `node scripts/generate-site-images.mjs`
- `site/screens/` — real screenshots of the app, from `node scripts/capture-screens.mjs`
  (needs the dev server running and Chrome installed)
- `site/img/og.png` — the preview card, from `node scripts/capture-og.mjs`

`.well-known/` files for app links are placeholders until the store release.

## Assets

`src/assets/moon-body.png` and `src/assets/glass-swirl.png` are the two source images the
whole app is built from (photographed object + a live CSS glass layer registered on top).
`scripts/generate-icons.mjs` composites them into the PWA icons under `public/` — rerun it
after replacing either source asset:

```
node scripts/generate-icons.mjs
```

## The unlock screen

`src/components/Unlock.tsx` is in the tree but nothing routes to it. It was reached from
the "Another" button, and it is parked rather than deleted because the screen itself is
finished — what is missing is anything behind it:

- it takes no payment. `doUnlock()` writes a local-storage flag and returns, so the
  "$8.99 once" button hands over everything for free
- its offer describes an app that does not exist yet: six hundred questions against the
  42 in `src/data/content.ts`, and a one-a-day limit nothing enforces

Put it back by restoring the guard at the top of `again()` in `src/hooks/useLua.ts`, once
there is a real payment integration and the copy matches what ships.

## Share links

Sharing a question produces `/q/<id>`, and `scripts/generate-share-pages.mjs` writes one
static page per question under `dist/q/` at build time. Each carries its own title and
Open Graph tags, so the question itself appears in the chat app's preview — the crawlers
that build those previews do not run the app's JavaScript, so it has to be in the served
markup. They are plain static files: no server, no database, nothing stored.

The running app reads the id back out of the path and holds that question for the next
reveal, so the same URL serves both the crawler and the person. An id that no longer
exists falls through to the normal flow, and `vercel.json` rewrites unmatched `/q/*` to
the app rather than a 404.

`Prompt.id` is the stable identity this depends on. **Assign once, never reuse, never
renumber** — array position does not survive an edit to the library, and a link shared
today has to resolve to the same question next year. New questions take the next number
above the current highest.
