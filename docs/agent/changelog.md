# Change history

> Running change log, moved out of CLAUDE.md so it does not load on every task.
> Each client project starts its own history from the extraction entry below.

*2026-08-28 — the floating in-canvas control layer (library of record PORTS.md
card 28).* Three gestures inside the Presentation canvas, all preview-only and
all writing through the optimistic document API, so an edit lands in the draft
with the editor's own session and no token ever reaches the public island:

**An appearance card off a palette handle** in each section's top-right corner:
the six designed surfaces and the three accents, applied to the band under the
cursor. Both lists come from `src/lib/surfaces.ts`, the same source the Studio
swatch input and the contrast gate read, so no colour is listed twice.

**An accent-word picker off an `A` handle:** the heading is redrawn inside the
card as one button per word, and clicking one stores that exact slice, so the
match cannot miss. The splitter itself lives in `src/lib/heading-accent.ts`,
beside the matcher it has to agree with, and is canonical upstream. Clicking the coloured word again clears it. It hangs off a
handle rather than off the heading on purpose: `splitHeadingAccent` renders the
CLEANED heading when it finds a match, so a heading that already has an accent
word carries no stega and nothing can mount on it.

**An "Edit here" text card** on the seven rich twins and the three hero lines: a
textarea for a plain string, a bold/italic-only contenteditable for a twin, with
an allow-list paste that keeps emphasis and drops fonts, colours and tables.

The pure half is `src/lib/section-fields.ts` (the registry of which section has
which field), `src/lib/sanity-path.ts` (the studio-path parser) and
`src/lib/inline-rich-write.ts` (the HTML to portable-text serializer), each with
a `node --test` suite; 360 tests became 442. `section-fields.test.ts` is a DRIFT
GATE: it parses `blocks.ts`, `Sections.astro`, `SectionShell.astro` and every
block component, and fails when a section gains or loses one of these fields.
Two per-instance gates are the interesting part: a section with a background
photo does not wear its surface classes at all, so the card hides that half and
says why, and a section with an empty heading gets no accent handle. The whole
layer is `client:only` preview code, so the public bundle is unchanged and
`npm run parity compare` still reads 20/20.

Six of these files are PORTABLE and owned by `ncs-astro-sanity-starter`, which
landed its own card 28 the same day: `sanity-path.ts`, `inline-rich-write.ts`,
`heading-accent.ts`, `overlay/styles.ts`, `overlay/usePopover.ts` and
`overlay/useDraftDocument.ts` are its bytes verbatim. Two things went the other
way and are recorded there as card 28a: a double space `normalizeRuns` stored
across a mark boundary, and the `note` style this repo's surface card needs to
explain itself. `sync-check` reads 50 SAME / 0 drift.

*2026-08-28 — the modern-stack upgrade (library of record PORTS.md cards 10,
11, 13, 14 and 17), done in five gated phases.*

**A. Astro 6.3 -> 7.2.9, `@astrojs/cloudflare` 13.5.5 -> exactly 14.2.4,
wrangler `^4.95` -> `~4.110.0`.** `with-workerd.mjs` was wired into `build`
(card 1: on Astro 7 the prerender boots workerd through
`@cloudflare/vite-plugin`, and on Windows that plugin's pinned workerd dies
instantly, so the wrapper points `MINIFLARE_WORKERD_PATH` at wrangler's newer
copy). react/react-dom pinned EXACT at 19.2.7 with react-is added (card 13).
`session: false` in astro.config, `nodejs_compat` in wrangler.jsonc, the assets
directory moved to `dist/client`, and `not_found_handling` REMOVED: with
`"404-page"` set, Cloudflare answers navigation requests that miss the asset
store from the static 404 without invoking the Worker, which silently 404s
every SSR route for real browsers while curl still sees them working. Parity
baselines re-captured with the five Astro-7 churn classes enumerated first (see
docs/TESTING.md).

**B. Sanity 5.28 -> the 6.4.0 pin set, and the studio folded into this
package.** `studio/` is gone: schemas, components, guides and structure moved
to `src/sanity/`, the config to the repo-root `sanity.config.ts` /
`sanity.cli.ts`, the starter dataset to `scripts/starter-content.ndjson`, and
the extracted schema to `schema.json`. The Studio is now EMBEDDED at `/studio`
via `@sanity/astro` 3.4.2 and built by `astro build`, so there is one Studio
that rebuilds on every deploy; `studioHost`, the `deployment` block and the
`studio:deploy` / `studio:dev` scripts were deleted so a stray `sanity deploy`
cannot recreate the split. Lockfile and node_modules were deleted and
re-resolved clean, then verified on DISK: exactly one `@sanity/ui` (3.3.5) and
one `styled-components` (6.4.3), one `errors.md#` chunk in the build. The
Studio theme moved from `buildLegacyTheme` (light-only, which left every panel
white in Dark) to `@sanity/ui`'s `buildTheme`; the brand now lives in the logo
and the serif fonts. `npm run typegen` became
`sanity schema extract --force && sanity typegen generate` and reproduced the
committed types byte-for-byte.

**C. The live draft preview (card 10), template-framed.** `/preview/**`,
`/preview/live` (an SSE proxy over Sanity's listen API, never a poll),
`/api/draft-mode/*`, `PreviewLayout` with the click interceptor (card 11), and
the `VisualEditingOverlay`. It FAILS CLOSED LEGIBLY: with no project id and no
`SANITY_TOKEN` every entry point answers 503 naming the missing pieces and the
`sanity cors add` step, rather than a bare 500 with a Sanity stack trace that
reads like a broken template. This repo's page model is the mirror of the
library of record's: only the generic `page` type is a builder page, and every
page singleton previews its editable surface (hero, the `flexibleSections`
append zone, the closing CTA) with a note on the page saying so.

**D. In-canvas section controls (card 17).** Each previewed section carries a
`data-sanity` attribute so the Presentation overlay outlines it and offers
insert / duplicate / remove / drag-to-reorder in the canvas, with a new grouped,
searchable insert menu (`SECTION_INSERT_MENU`, four plain-language groups)
shared by every sections array. Two field names here, not one:
`flexibleSections` on the singletons, `sections` on `page`. The wrapper is a
`Fragment` on the live site, so the static build stays byte-identical, which
`npm run parity compare` proves at 20/20.

**E. Docs.** CLAUDE.md, OPERATIONS.md, README.md, TESTING.md, PENDING.md, the
bootstrap runbook (with a new "Turn the live preview on" fork-activation
section) and every `studio/` path reference across docs/ and the module guides.
`scripts/lib/loadEnv.mjs` was replaced with the library of record's
PORTABLE-marked copy, so sync-check now polices it: 6/6 SAME. The
`public/_headers` CSP gained the origins the embedded Studio needs, each
annotated with what breaks without it.

*Not verified here, and the first job of any fork that becomes a real site:*
this template has no Sanity project, so the preview could only be proven to
fail closed. Rendering a real draft, click-to-edit, the SSE auto-refresh and
the in-canvas controls all need a configured project and a `SANITY_TOKEN`. The
steps are in docs/bootstrap/NEW-PROJECT.md, section 4b.

*2026-06-12 — ncs-church-starter extracted from the Second Presbyterian Church
of Chicago build. Everything that made that site good ships here: the full
page set, the Sanity content model (singletons + collections + page builder +
configurable forms), the worship-time single-sourcing, the sermons module with
per-service records, the events module, the design system (documented in
design.md) with its Lighthouse 100/100/100/100 baseline, the themed Studio
with its editor help center, and the agent tooling (.claude/commands,
scripts/sanity-audit.mjs, OPERATIONS runbook). New for the template: identity
placeholders throughout ("First Church of Springfield"), scripts/rebrand.mjs
(config-driven identity stamp), scripts/starter-content.ndjson +
scripts/seed-starter-content.mjs (a pre-stamped starter dataset including
connect-card and prayer-request forms), site.ts-driven wordmark (no hardcoded
church name in components), docs/bootstrap/NEW-PROJECT.md + setup-checklist.md
(the spin-up runbook), and a blanked docs/brand/voice.md template. Client
secrets, Sanity project IDs, deploy hosts, and one-off content seed scripts
were removed. Reference-build photography remains in src/assets/ as
placeholder-only imagery: replace before any client launch.*
