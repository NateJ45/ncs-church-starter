# NEW-PROJECT.md — Spin up a church site from this starter

The runbook for taking this starter to a new church client. Worked through in
order, a comfortable first pass is an afternoon; launch-ready is a few working
days depending on how fast the church supplies content and photos.

Companion: `setup-checklist.md` (the tick-box version of this file). Read
`CLAUDE.md` first for the Foundation-vs-Safe-to-edit taxonomy; it tells you
which files change freely and which need a planned session.

---

## 0. Prerequisites

- Node 22.12+, a GitHub account, a Cloudflare account, a Sanity account.
- From the church: name, address, service time(s), contact details, social
  URLs, giving-portal URL, photography (or a plan to shoot it), and whoever
  will edit content (the Studio is built for a church secretary, not a dev).

## 1. Fork and verify

```bash
git clone <this-starter> <church-name> && cd <church-name>
npm install
npm run build
```

One package, one install: the Studio lives in this repo and is built by
`astro build` (there has been no nested `studio/` package since 2026-08-28).

The build MUST pass with no `.env` at all: pages render placeholder
empty-state content. If it doesn't, stop and fix before customizing
(`sanityFetch` fallbacks are load-bearing; see CLAUDE.md).

## 2. Stamp the identity

```bash
cp bootstrap.config.example.json bootstrap.config.json
# fill in: church name, short name, wordmark line 2, domain, city, address,
# emails, phone, worker name
# (no studio host: there is no hosted *.sanity.studio deploy any more)
npm run rebrand              # CHECK mode: see what would change (nothing written)
npm run rebrand -- --apply   # APPLY mode: writes all replacements
git diff                     # the diff IS the rebrand; review it
npm run typegen
```

`rebrand.mjs` replaces the template's exact placeholder strings ("First Church
of Springfield", "123 Main Street", "example-church.org"...) across the code,
schemas, and docs. Anything it can't know (photos, colors, denomination
wording) is in the checklist.

Note: `storageKeyPrefix` is NOT in bootstrap.config.json — `src/data/site.ts`
derives it automatically from the church name via `slugifyName()`, so it stays
in sync without a separate config field.

## 3. Design seam (optional but probably yes)

The starter ships the reference palette (warm cream paper, espresso ink,
bronze, deep chapel green, liturgical gold) and serif pairing (Instrument
Serif + Newsreader). To reskin for the new church:

1. `src/styles/globals.css` `@theme` block: palette tokens + `--tint-rgb`.
2. Mirror the colors in `src/data/site.ts` `brandColors`.
3. Swap `@fontsource` imports + `--font-display`/`--font-body` if changing type.
4. `scripts/generate-og-default.mjs` inputs, then `npm run og`.
5. Favicon + apple-touch-icon in `public/`, church mark in
   `src/sanity/components/church-mark.png`.
6. Read `design.md` first; it explains the signature moves (arch images,
   structural color bands, keyword emphasis) so a reskin keeps the system.

Build in BOTH light and dark mode (CLAUDE.md rule #3).

## 4. Sanity project

1. Create a project at sanity.io/manage; dataset `production`.
2. `cp .env.example .env` → fill `PUBLIC_SANITY_PROJECT_ID`, create a Viewer
   token (`SANITY_API_READ_TOKEN`) and an Editor token
   (`SANITY_API_WRITE_TOKEN`).
3. In that same `.env`, set `SANITY_STUDIO_PROJECT_ID` to the same project ID.
   The embedded Studio reads `PUBLIC_SANITY_PROJECT_ID` when Astro bundles it;
   the `SANITY_STUDIO_*` pair is what the `sanity` CLI reads (typegen, dataset
   import, cors). There is no `studio/.env` any more.
4. Seed the starter content (pre-stamped with the bootstrap identity):

```bash
npm run seed             # dry run, lists the documents
npm run seed -- --apply  # imports: siteSettings, home/visit/contact pages,
                         # example FAQ/events/sermon/ministries, and three
                         # ready-made forms (contact, connect card, prayer request)
```

5. `npm run dev` → open `/studio` and walk it as an editor would. Fill the
   remaining Site Settings (socials, give URL, worship time) and publish.
   There is NO separate Studio deploy: the Studio is served from the site at
   `/studio` and rebuilds with every deploy, so it can never fall behind the
   schema. Do not run `npx sanity deploy`; it would publish a second, stale
   Studio at `<host>.sanity.studio` pointed at the same production data.

## 4b. Turn the live preview on (fork activation)

The draft preview and the Squarespace-style in-canvas section controls need
three things beyond the project id, and until all three are in place every
preview entry point answers **503 naming exactly what is missing** rather than
failing with a stack trace. Nothing else on the site is affected: the public
pages build and serve fine without any of this.

1. **`PUBLIC_SANITY_PROJECT_ID`** in `.env` — the build-time id above. With the
   placeholder value the preview stays off.
2. **A `SANITY_TOKEN` Worker RUNTIME secret** (not a build variable, and not the
   same thing as `SANITY_API_READ_TOKEN`). Create a token with read access to
   drafts at sanity.io/manage → API → Tokens; Viewer is enough. Locally:
   `cp .dev.vars.example .dev.vars` and paste it in. In production:
   `npx wrangler secret put SANITY_TOKEN`.
3. **CORS for every origin the Studio runs on**, because the embedded Studio
   talks to the Sanity API from the browser:

```bash
npx sanity cors add http://localhost:4321 --credentials
npx sanity cors add https://<your-worker>.workers.dev --credentials
npx sanity cors add https://www.<your-domain> --credentials
```

Then verify it FOR REAL, in a browser, under `npm run preview` (which is
`wrangler dev`; Astro's dev server does not read `.dev.vars` and a static file
server sends none of the `public/_headers`):

- `/studio` loads and the desk renders (not just the login screen).
- Open Presentation, and the preview iframe shows DRAFT content.
- Click a heading in the preview: the edit panel jumps to that field.
- Hover a section: the overlay outlines it and offers insert / duplicate /
  remove / drag. Only custom `page` documents preview their whole body; every
  page singleton previews its editable surface (see the page-model note at the
  top of `src/pages/preview/[...slug].astro`).
- Edit and autosave in the Studio: the preview refreshes on its own within a
  second or two. If it does not, the SSE stream is down; check `/preview/live`.

Rotating `SANITY_TOKEN` invalidates every preview cookie. Editors just reopen
Presentation.

## 5. Content load

Sanity is the single source of truth (CLAUDE.md content-model callout): every
visible string is a field, and the goal is every field populated so the Studio
mirrors the live site. The starter dataset gives the skeleton; the church's
real copy goes in via Studio (or write a one-off seed script per
OPERATIONS.md → "Patch Sanity content programmatically").

Photos: replace EVERY image in `src/assets/` (they are reference-build
placeholders, not licensed for reuse) and upload the church's photography in
Studio. Authentic people-photography beats building shots; see the church
website audit in `docs/research/` — it is the #1 differentiator.

## 6. Cloudflare

1. Push to GitHub. Cloudflare → Workers & Pages → create from repo.
   Build command `npm run build`, output `dist/client` (adapter 14 splits the
   build into `dist/client` for assets and `dist/server` for the SSR bundle).
   Set the env vars from `.env.example` (mark tokens Secret), and add the
   `SANITY_TOKEN` runtime secret from step 4b.
   Deploying by hand is `npm run deploy`, i.e.
   `wrangler deploy -c dist/server/wrangler.json`. A plain `wrangler deploy`
   against the root config 404s every SSR sub-route, `/studio` included.
2. `wrangler.jsonc` name was stamped by rebrand; add the custom domain when
   DNS is ready.
3. **Publish-to-live webhook** (do not skip; without it editors wait for the
   next code push): Cloudflare build hook + Sanity webhook with the deny-list
   GROQ filter, exactly as written in `docs/agent/deployment.md`.

## 7. Pre-launch

Run `docs/bootstrap/setup-checklist.md` top to bottom. Highlights: Lighthouse
100s on home + a content page, both themes + both viewports eyeballed
(`/visual-verify`), `node scripts/sanity-audit.mjs --fields` shows no
unexpected gaps, privacy page reviewed, analytics token set, OG image
regenerated, 404 reads right, forms deliver (Web3Forms key set + a test
submission), DNS cutover plan.

## 8. Hand off to the editor

The Studio has a built-in "How This Works" help center written for
non-technical church staff. Walk the editor through: edit → Publish → the
site rebuilds in ~2 minutes. Leave them `OPERATIONS.md` § "When something
feels wrong" and your support contact.
