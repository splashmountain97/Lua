# Lua

A shake-to-reveal daily reflection prompt — a mobile web app (installable as a PWA).

Press and hold the moon (or shake, once motion permission is granted) to reveal today's
question. Filter by category (Self / Life / World) and weight (Light / Firm / Heavy).

Ported from an interactive design prototype (`Lua.dc.html`) built on the Nocturne design
system, front-end only with local state — no backend, no account, nothing stored beyond
this device's own local storage (streak, unlock status, filter preferences).

## Development

```
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run lint     # oxlint
```

## Assets

`src/assets/moon-body.png` and `src/assets/glass-swirl.png` are the two source images the
whole app is built from (photographed object + a live CSS glass layer registered on top).
`scripts/generate-icons.mjs` composites them into the PWA icons under `public/` — rerun it
after replacing either source asset:

```
node scripts/generate-icons.mjs
```
