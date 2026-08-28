# TESTING

A map of which gate covers what in `ncs-church-starter`, so nobody writes a
fifth suite that duplicates the third. Created 2026-08-27 during this repo's
first sync session against the library of record (`ncs-astro-sanity-starter`;
see its `PORTS.md`). Revised 2026-08-28 for the Astro 7 / Sanity 6.4 /
embedded-Studio upgrade.

**This repo is a dormant template.** The gates below run against the example
dataset and the built-in fallback content, with no Sanity project configured.
That is deliberate: everything here must stay green in a fresh clone with an
empty `.env`, because that is the state every fork starts in.

---

## The gates

| Command                  | What it actually proves                                                                                                                                                                                                                                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`           | ESLint over the repo (`src`, `scripts`, astro files). Style and obvious footguns only.                                                                                                                                                                                                                                                                                 |
| `npm run typegen`        | `sanity schema extract --force && sanity typegen generate`. Regenerates `schema.json` and `src/lib/sanity.types.ts`. Also a schema smoke test: the extract fails loudly on a malformed schema type.                                                                                                                                                                    |
| `npm run build`          | The whole site renders with **no Sanity credentials**, AND the embedded Studio bundles. `sanityFetch()` detects the unset `PUBLIC_SANITY_PROJECT_ID` and returns empty-state fallbacks, so a green build proves every page survives its own empty state. `prebuild` runs `free-dist.mjs` first (Windows only); `build` goes through `with-workerd.mjs` (Windows only). |
| `npm test`               | Node's built-in runner over `src/lib/*.test.ts`. 72 tests as of 2026-08-28 (60, plus the 12 in `redirects.test.ts` that pin the path arithmetic the Studio and the build must agree on).                                                                                                                                                                               |
| `npm run parity compare` | Rendered HTML is unchanged versus the committed baseline.                                                                                                                                                                                                                                                                                                              |
| `npm run sync-check`     | This repo's canonical copies have not drifted from the library of record.                                                                                                                                                                                                                                                                                              |

There is no separate Studio build step any more: `astro build` builds the Studio
as part of the site (`@sanity/astro` mounts it at `/studio`). A standalone
`sanity build` would write to `./dist` and clobber the Astro output.

CI (`.github/workflows/ci.yml`) runs one install, typegen, the **stale-types
guard**, build, and `npm test`, on push and pull request. The stale-types guard
fails the run if regenerating the types produced a diff, i.e. if a schema change
was committed without its regenerated types.

---

## The invariant checks (`npm run build`, then look)

Three greps that a green build does NOT give you. Run them after any Sanity
dependency work, any adapter or wrangler bump, and before believing a fix:

```
find node_modules -path "*@sanity/ui/package.json"   # must print exactly ONE line
grep -l "errors.md#" dist/client/_astro/*.js         # must list exactly ONE file
grep -o "legacy_env" dist/server/wrangler.json       # must print NOTHING
```

The first two are the same invariant seen from two sides: **one module instance
of the Sanity stack**. Two instances of `styled-components` / `@sanity/ui` means
two React contexts, so the ThemeProvider mounted by one is invisible to
`useTheme` in the other, and the desk dies on its first custom-component render
(styled-components error #18, then `Cannot read properties of undefined (reading
'v2')`) while the LOGIN screen, which is core code only, renders fine. That was
a real production outage in a sibling repo. Verify on DISK: a lockfile read and
an install's output both lie, because npm keeps an already-resolved nested tree.
If a dedupe or an `overrides` entry appears not to work, delete
`package-lock.json` and `node_modules` and re-resolve clean, then re-check.

The third is PORTS.md card 14: wrangler 4.126+ rejects `legacy_env` outright,
and adapter 14 can emit it into the generated config.

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
- **`redirects.test.ts`** - the path arithmetic behind Pages -> Redirects
  (PORTS.md card 22). `src/lib/redirects.ts` is imported by BOTH the build
  (`astro.config.mjs`, which turns published `redirect` documents into Astro's
  redirects map) and the Studio (the publish action that files a redirect when a
  page's web address changes). If the two disagreed about what `/old-page/`
  means, an auto-filed redirect would sit in the Studio looking correct and never
  fire, which no other gate would notice.

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

- Baselines live in `scripts/.parity/` and **are committed**. **20 routes**
  captured 2026-08-28 against `dist/client`; capture, rebuild, compare = 20/20
  PASS, twice. (19 site routes plus `/studio`: routes are auto-discovered by
  walking the built HTML root, and the embedded Studio's shell page joined that
  set when it landed. The library of record's baselines include its `/studio`
  for the same reason.)
- **Why they were re-captured twice on 2026-08-28**, with the diff classes
  enumerated first each time, because a silent re-capture defeats the harness:
  1. _The Astro 6.4.2 -> 7.2.9 upgrade._ Five classes, all build churn: the
     `generator` meta string; `<astro-island uid>` (Astro 7 derives it
     differently; the normalizer folds `prefix` but not `uid`); the minified
     inline module scripts (new bundler and minifier: different identifier
     names, template literals, comma sequences); text-node whitespace, since
     Astro 7 emits `<a>Give</a>` where 6 emitted `<a>\nGive\n</a>`; and `&`
     serialized as `&amp;` inside attribute values, which is what Tailwind's
     arbitrary variants (`[&_button]:...`) contain. Checked before accepting:
     the per-page element histograms are identical, the visible text with tags
     stripped is byte-identical on all 19 pages, and every `class` attribute
     matches once `&amp;` is decoded. Nothing structural moved.
  2. _The clean lockfile re-resolve that came with Sanity 6.4._ Two classes: a
     `data-react-aria-top-layer` attribute on `sonner`'s notification region
     (react-aria floated forward), and the `uid` of that one island.
- **The in-canvas section controls are gated by this harness.** `Sections.astro`
  wraps each section in a `data-sanity` div ONLY when the preview passes
  `editDoc`; on the live pages the wrapper is a `Fragment`, which renders
  nothing. 20/20 PASS with the feature installed is the proof.
- Re-capture whenever a markup change is _intended_, and say so in the commit
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
- **Studio runtime.** Schema errors are **fatal at browser runtime**, not at
  build time, and so is the two-module-instance failure. A green build does not
  mean a working desk. Open `/studio` in a real browser after any schema or
  Sanity-dependency change. Verified this way 2026-08-28: under `npm run
preview`, `/studio` mounts and renders Sanity's own "Project not found" screen
  for `placeholder-project-id`, which is the correct behaviour for a template
  with no project and is also proof the React shell and its theme context came
  up.
- **The live preview against real content.** With no project id and no
  `SANITY_TOKEN`, all that can be gated is that the stack FAILS CLOSED, and it
  does: `/preview` and `/preview/*` answer **503** naming both missing pieces
  plus the `sanity cors add` step, `/api/draft-mode/enable` answers 503, and
  `/preview/live` answers **403** on the cookie gate (which comes first on
  purpose, so an anonymous caller learns nothing about the deployment's
  configuration). Rendering a draft, the click-to-edit overlay, the SSE
  auto-refresh and the in-canvas insert / duplicate / remove / drag controls all
  need a configured project. See `docs/PENDING.md`.
- **Dark mode contrast.** `theme-tokens.test.ts` covers the light `@theme` block
  only. The shadcn `:root`/`.dark` overrides are authored in oklch with alpha and
  would need a colour-space conversion; that is deliberately not attempted.
- **Live Sanity content.** Every gate runs credential-free against fallbacks.
  Nothing here proves a real dataset renders.
