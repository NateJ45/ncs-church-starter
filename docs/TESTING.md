# TESTING

A map of which gate covers what in `ncs-church-starter`, so nobody writes a
fifth suite that duplicates the third. Created 2026-08-27 during this repo's
first sync session against the library of record (`ncs-astro-sanity-starter`;
see its `PORTS.md`).

**This repo is a dormant template.** The gates below run against the example
dataset and the built-in fallback content, with no Sanity project configured.
That is deliberate: everything here must stay green in a fresh clone with an
empty `.env`, because that is the state every fork starts in.

---

## The gates

| Command | What it actually proves |
|---|---|
| `npm run lint` | ESLint over the repo (`src`, `scripts`, astro files). Style and obvious footguns only. |
| `npm run typegen` | Regenerates `src/lib/sanity.types.ts` from the Studio schema. Also a schema smoke test: `sanity schema extract` fails loudly on a malformed schema type. |
| `npm run build` | The whole site renders with **no Sanity credentials**. `sanityFetch()` detects the unset `PUBLIC_SANITY_PROJECT_ID` and returns empty-state fallbacks, so a green build proves every page survives its own empty state. `prebuild` runs `free-dist.mjs` first (Windows only). |
| `npm --prefix studio run build` | The Studio compiles. Note the limit below. |
| `npm test` | Node's built-in runner over `src/lib/*.test.ts`. |
| `npm run parity compare` | Rendered HTML is unchanged versus the committed baseline. |
| `npm run sync-check` | This repo's canonical copies have not drifted from the library of record. |

CI (`.github/workflows/ci.yml`) runs install, typegen, the **stale-types
guard**, build, studio build, and `npm test`, on push and pull request. The
stale-types guard fails the run if regenerating the types produced a diff, i.e.
if a schema change was committed without its regenerated types.

---

## The unit suites (`npm test`)

One file per concern, all under `src/lib/`. Node's `--experimental-strip-types`
runs the `.ts` directly; there is no build step and no test framework.

- **`theme-tokens.test.ts`** - the contrast gate. Parses the real hex tokens out
  of `src/styles/globals.css` and asserts the text/surface and focus-ring pairs
  the design system actually renders, including the Chapel-green surfaces. This
  exists because **no other gate can see this bug class**: axe has no rule for
  focus-indicator or custom-border contrast and audits only the resting DOM, and
  Lighthouse can sit at 100 while a heading is unreadable. It is the gate that
  catches a bad rebrand. Scope, and the pairs deliberately not asserted
  (`--color-secondary`, `--color-tertiary`, `--color-gold` as text), are
  documented in the file's own header. Backed by `src/lib/contrast.ts`, the
  WCAG 2.x contrast math.
- **`sectionVisibility.test.ts`** - the one rule that must never invert: an unset
  visibility flag counts as VISIBLE; only an explicit `false` hides a section.
- **`slugify.test.ts`** - URL slug generation.
- **`utils.test.ts`** - reading-time estimation from Portable Text, and `tel:`
  href construction.

Add a new suite as `src/lib/<name>.test.ts` and it is picked up automatically by
the glob.

---

## The parity harness (`npm run parity`)

`scripts/page-parity.mjs` snapshots every built page's rendered HTML and diffs a
later build against it. It is the regression net for any change that is supposed
to be **render-neutral**: extracting a component, reordering imports, swapping a
wrapper, bumping a dependency.

```
npm run build            # you build; the harness never builds
npm run parity capture   # snapshot every built page
...change something...
npm run build
npm run parity compare   # PASS/DIFF per page, exit 1 on any diff
```

- Baselines live in `scripts/.parity/` and **are committed**. 19 routes captured
  2026-08-27 against `dist/client`; capture, rebuild, compare = 19/19 PASS.
- Re-capture whenever a markup change is *intended*, and say so in the commit
  message. A silent re-capture defeats the entire harness.
- The normalizer strips exactly four classes of build-varying value (`/_astro/`
  content hashes, `data-astro-cid-*` and transition-scope hashes, the
  `<astro-island>` render-order prefix, and inter-tag whitespace). Everything
  else, including text, classes, ids, aria, inline styles and JSON-LD, is
  compared byte-faithfully.
- This file is a **pattern**, not a canonical copy: it carries a `PORTED` header
  rather than the `PORTABLE` marker, and `sync-check` does not police it. Each
  repo's normalizer grows its own rules.

---

## The drift check (`npm run sync-check`)

`scripts/sync-check.mjs` walks this repo for files carrying the
`PORTABLE: canonical copy` first-line marker and diffs each against the library
of record's copy of the same path. Line endings are normalized; everything else
is byte-exact.

```
NCS_STARTER_DIR=<path-to-ncs-astro-sanity-starter> npm run sync-check
```

Without `NCS_STARTER_DIR` it looks for a sibling `ncs-astro-sanity-starter`
directory. `DRIFT` means reconcile before shipping: either port this repo's
improvement back into the starter (with a `PORTS.md` card in the same commit) or
pull the starter's copy forward.

---

## What is deliberately NOT covered

- **No browser suite.** There is no Playwright/axe/reflow sweep here yet
  (PORTS.md card 8). Accessibility and 320-1440 reflow are currently a manual
  pass. This is the largest known gap; a fork that becomes a real site should
  install one.
- **Studio runtime.** `sanity build` compiles a Studio whose schema errors are
  **fatal at browser runtime**, not at build time. A green studio build does not
  mean a working desk. Open `/studio` after any schema change.
- **Dark mode contrast.** `theme-tokens.test.ts` covers the light `@theme` block
  only. The shadcn `:root`/`.dark` overrides are authored in oklch with alpha and
  would need a colour-space conversion; that is deliberately not attempted.
- **Live Sanity content.** Every gate runs credential-free against fallbacks.
  Nothing here proves a real dataset renders.
