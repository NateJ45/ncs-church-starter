# Content data and Sanity integration

> Static identity in site.ts, everything editable in Sanity, Studio config, queries, and the typed-client flow.

## Content data and Sanity integration

The starter has two parallel content sources:

### `src/data/site.ts` — static identity (rare edits)

Hardcoded constants that don't change between deploys: domain name, GitHub repo URL, Web3Forms access key reference, Calendly URL template, brand asset paths, the `localStorage` key prefix for the theme system. A developer edits these in code when something structural shifts.

```ts
// rebrand.mjs stamps `_name` and `_domain`; derived fields auto-update.
const _name = 'First Church of Springfield';
const _domain = 'example-church.org';
const _slug = slugifyName(_name); // "first-church-of-springfield"

export const site = {
  name: _name,
  domain: _domain,
  url: `https://www.${_domain}`,
  storageKeyPrefix: _slug, // derived — never needs manual editing
  themeStorageKey: _slug + '-theme',
  // ... etc
} as const;
```

`rebrand.mjs` only needs to stamp the two quoted `_name` and `_domain` literals.
`storageKeyPrefix` and `themeStorageKey` are derived from `_name` at module load
time, so they are always in sync and do not appear in `bootstrap.config.json`.
The domain feeds the canonical URL, OG tags, and the sitemap reference in `robots.txt`.

### Sanity — the single source of truth for all content

**All publicly-visible content lives in Sanity, and every content field is populated, so the Studio mirrors the live site exactly.** Page copy, headings, buttons/links, images, the nav menus, SEO, the worship service time, and contact details are all Sanity fields. Editors change content in Studio (the static site rebuilds and the change goes live); they never touch code for routine copy updates.

The inline strings in `src/pages/*.astro` are **safety-net fallbacks** (the inline-fallback pattern) that render only if a field is ever left empty, so a section can never go blank. They are not the live content — a populated Sanity field always overrides them. Repeated values are single-sourced (worship time via `siteSettings.worshipService` + `src/lib/serviceTime.ts`; address/phone/email via `siteSettings`), so a change is one edit. The audit + field-by-field map is in `docs/agent/editor-vs-hardcoded.md` and `docs/agent/content-audit-2026-06-01.md`.

> Church build note: the schema set below is the church-starter schema, not the
> generic starter's. The interior-designer schemas (service, testimonial, philosophyPoint,
> journal*) were removed in the remodel; the opt-in module schemas under `docs/modules/`
> are not active for this project.

**Settings and globals:**

- `siteSettings` (singleton) — church name, tagline, mission, public email + phone, **street address** (`addressLine` + `cityStateZip`), social links, service time; a **Navigation (menus)** group (`navItems` header menu + `footerColumns` footer columns); a **`favicon`** image; a **Connect & integrations** group (watch / give / app / directory / registration / prayer URLs); and a newsletter config. Phone + address surface site-wide (tap-to-call, header bar, footer, map links) and feed the LocalBusiness JSON-LD. Every field falls back to `src/data/site.ts` when blank.

**Reusable collections:**

- `event` — calendar + special/seasonal services (audience, cost, registration, contact, `featuredOnHome`, `specialService` + `liturgicalSeason`).
- `sermon` — messages shown on `/sermons` (date, speaker, scripture, series string, video link).
- `staffMember` — pastors & staff (drives `/pastor-staff`).
- `ministry` — programs, with `parentMinistry` for nesting (e.g. Youth → Confirmation/VBS).
- `faqItem` — FAQ questions (question, Portable Text answer, category, displayOrder); drive the FAQ page, grouped by `faqPage.categoryOrder`.
- `form` — configurable contact/inquiry forms (native field builder OR external embed); referenced from contact / weddings / use-our-space and droppable as a page block.
- `announcement` — scheduled site banner (enabled + date window, info/special/urgent style).
- `worshipResource` — bulletins, orders of worship, The Record, annual reports (PDF upload or external link).
- `ctaBlock` — reusable object type (label + linkType + target) embedded in other schemas.

**Page singletons:**

- Core: `homePage`, `aboutPage`, `faqPage`, `contactPage`, `eventsPage`, `sermonsPage`, `privacyPage`, `notFoundPage`.
- Per-page church singletons (via the `definePageSingleton` factory): `worshipPage` (I'm New), `beliefsPage` (What We Believe), `musicPage`, `staffPage`, `growPage`, `servePage`, `kidsPage`, `foodPage`, `useOurSpacePage`, `weddingsPage`, `givePage`.
- `page` — generic type for brand-new pages at `/<slug>`, built entirely from the block library.

All page singletons have `seoTitle`/`seoDescription`, a `heroImage` (with alt), editable body-copy fields (with verbatim fallbacks), editable `finalCta*` closing copy, and a `flexibleSections[]` page-builder array. The block library (`src/sanity/schemaTypes/blocks.ts`) and the background/media system are shared across every page; see `page-architecture.md`. Several pages also carry editable structured lists, each with a built-in fallback: weddings (`weddingFaqs` + `weddingPricing`), grow (`groups`), serve (`ways`), use-our-space (`uses`), contact (`contactReasons`), what-we-believe (`resources`), and home (`serviceBand` + `weeklyRhythms`).

**In-Studio help** ("How This Works") is NOT a Sanity singleton — it's repo-based, locked code (`src/sanity/guides/content.tsx` + `src/sanity/components/GuideView.tsx`), which replaces the old `studioGuide`/`studioNotes`/`studioPlaybook` singletons.

### The deploy rule (read this first)

**There is no separate Studio deploy.** Since 2026-08-28 the Studio is embedded at `/studio` and built by `astro build`, so the site deploy carries the schema and the Studio together and they cannot disagree. Do NOT run `npx sanity deploy`: it would publish a second, standalone Studio that silently falls behind. Correct sequence after a schema edit: edit the schema, `npm run typegen`, open `/studio` in a real browser (schema errors are fatal at BROWSER runtime while passing the build), commit. If a Studio ever does show "unknown fields" next to a "Remove field" prompt, **never click "Remove field":** it deletes that field's data across every document and cannot be undone without a dataset restore.

### Env-driven config and the graceful-empty build

The Sanity client is configured entirely from environment variables:

```
PUBLIC_SANITY_PROJECT_ID=your-project-id
PUBLIC_SANITY_DATASET=production
```

`src/lib/sanity.ts` exports `sanityFetch(query, params, fallback)`. When `PUBLIC_SANITY_PROJECT_ID` is absent or set to the placeholder value `"your-project-id"`, `sanityFetch` returns the fallback without any network call. This means `npm run build` succeeds on a fresh clone with no Sanity project configured -- pages render empty-state content. Configure the env vars when you have a real Sanity project; until then the build is safe to run.

```ts
// src/lib/sanity.ts (abbreviated)
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  fallback: T,
): Promise<T> {
  if (isSanityUnconfigured()) return fallback;
  return client.fetch<T>(query, params);
}
```

The `isSanityUnconfigured` guard and the fallback pattern are load-bearing. Do not remove them.

### Typed client and committed types

The Sanity client is at `src/lib/sanity.ts`. It exports both `client` (the typed CDN client for queries) and `urlFor()` (for building image URLs from asset references).

`npm run typegen` runs `sanity typegen generate` against the schemas in `src/sanity/schemaTypes/` and writes `src/lib/sanity.types.ts`. That file is committed to the repo so collaborators get full type safety without needing to run typegen themselves. Run `npm run typegen` locally after any schema change before testing.

All GROQ queries live in `src/lib/queries.ts`. Each page has a typed query function that pulls the singleton plus any auto-populated collections it needs.

### Section visibility rule

`siteSettings` has a `sectionVisibility` object field. `src/lib/sectionVisibility.ts` exports `getSectionVisibility(raw)`, which converts the raw Sanity object into a flat boolean map. The critical rule: `value !== false`. Undefined, null, or true all produce true (visible). Only an explicit false produces false (hidden). This rule is what makes a freshly-configured project safe to deploy before all optional sections have content.

### Studio configuration notes

**All-fields default.** The `default: true` property is removed from every schema field group definition. Without it, Studio opens documents on the "All fields" tab instead of a single group, so editors see everything without needing to know which group a field lives in.

**Studio branding.** `sanity.config.ts` sets the Studio title, the brand theme (Bronze / Paper / Ink + the site's serif fonts), a logo (`studio.components.logo` = the church mark + wordmark), and a layout wrapper (`studio.components.layout` = `StudioLayout`, which injects the brand web fonts). Replace the title / theme / logo for each project.

**No document preview.** This is a static site (`output: 'static'`) with no draft-preview environment, so documents show the **form only** — there is no iframe "Preview" tab. The old one loaded the last PUBLISHED build (not the editor's draft) and only changed after a rebuild, which misled editors. `urlForDoc` / `SITE_URL_FOR_PREVIEW` stay in `sanity.config.ts` as hooks if a real preview (SSR deploy + Sanity's Presentation tool + draft-mode `sanityFetch`) is added later.

**SEO length warnings.** `.warning()` validations on `seoTitle` (warns around 60 characters) and `seoDescription` (warns around 160 characters) across all page singletons and `journalEntry`. Editors see an amber warning if the text is getting too long for Google to show in full. A warning, not an error, so it does not block publishing.

**Vision/GROQ plugin gating.** The `visionTool()` plugin (the in-Studio GROQ query runner) is conditionally registered only when `process.env.NODE_ENV !== 'production'`. The Vision tab appears in local dev Studio but does not clutter the hosted editor.

### Auto-populated lists

Several pages pull their content from collections automatically:

- Events on `/events`: upcoming `event` documents by date; `specialService` ones surface in the Special Services band; `featuredOnHome` ones appear on the home page.
- Sermons on `/sermons`: recent `sermon` documents, newest first (the latest is featured).
- FAQs on the FAQ page: `faqItem` documents grouped by `category`, in the order defined in `faqPage.categoryOrder`.
- Pastors & Staff on `/pastor-staff`: `staffMember` documents.
- Worship resources on `/worship`: `worshipResource` documents.
- The "Dynamic list" page-builder block: latest sermons / events / ministries / staff / worship resources, chosen per block.
- The site banner: the single enabled `announcement` within its date window (resolved at build).

This means adding an `event` with `featuredOnHome: true` makes it appear on both `/events` and the home page without touching any other document.

### Canvas (AI-assisted writing)

[Sanity Canvas](https://www.sanity.io/docs/canvas) is a separate workspace from Studio -- an AI-assisted free-form drafting tool that creates drafts in the production dataset. Editors use it for longer content; drafts flow into Studio for review and publish.

Two schema-level controls govern what Canvas sees:

**Excluded from Canvas entirely** (`options.canvasApp.exclude: true`):

- All page singletons + the generic `page` -- marketing copy is structural; edit fields directly in Studio.
- `siteSettings` -- configuration, not prose.

**Available in Canvas with per-field voice hints** (`options.canvasApp.purpose`):

- `faqItem` -- question, answer (the `purpose` strings carry the warm, plain-English church voice).

The `purpose` strings carry compressed voice guidance for each field. These are NOT a hard guardrail -- editors should still apply the project voice in review.

**Deploying Canvas annotation changes:** deploy the site. Canvas reads the deployed Studio schema, and the Studio deploys with the site now, so new `canvasApp.purpose` or `exclude` changes take effect on the next site deploy.

**Activating Canvas** for the project (one-time): the toggle lives in [manage.sanity.io](https://manage.sanity.io) under the project's Canvas section.

## Pages as first-class objects (PORTS.md cards 21 and 22)

The `page` document type carries three verbs and one extra field beyond its content:

- **Duplicate** and **Archive / Restore** live in the publish menu
  (`src/sanity/components/pageActions.tsx`), backed by plain functions in
  `src/sanity/pageOps.ts`. Duplicate makes a DRAFT copy at a free web address with every
  nested array `_key` regenerated; the stock Sanity `duplicate` action is filtered out for
  `page` because it copies the slug and produces two documents at one address.
- **`archived`** is a boolean, not a delete. Every live-site query tests `archived != true`
  (never `== false`, so a page made before the field existed stays visible): the route list
  in `getAllPageSlugs`, the nav-link projection plus `navHref`, and the sitemap read in
  `astro.config.mjs`. Archive and Restore both need a **Publish** afterwards, because the
  site is rebuilt from published content. Archiving patches both the draft and the
  published twin, and only the twins that actually exist (a patch against a missing id
  fails the whole transaction).
- The **`redirect`** document type (Pages -> Redirects) holds old-address forwards. They
  are read at build time and emitted as real 301/302s by the Cloudflare adapter, and one is
  filed automatically whenever a published page's web address changes
  (`src/sanity/components/slugRedirect.tsx`, which wraps the stock Publish action and never
  blocks it). See `docs/agent/seo.md`.

Page SINGLETONS deliberately get none of this: one-per-site means duplicating or archiving
one would leave the site with a route and no document.
