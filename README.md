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
