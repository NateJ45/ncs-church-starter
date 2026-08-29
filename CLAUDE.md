# NCS Church Starter — CLAUDE.md

This is the always-loaded reference for the `ncs-church-starter` codebase: the conventions and landmines an agent needs on every task. Deep detail for specific areas (theme, components, SEO, performance, Sanity, deployment) lives under `docs/agent/` and is read on demand. The topic index at the bottom is the map.

> **This repository is a reusable church-website starter** (Astro + Sanity + Cloudflare Workers), extracted from a finished, live church build. It ships with placeholder identity ("First Church of Springfield", example-church.org) that `scripts/rebrand.mjs` stamps with a real church's details, a starter Sanity dataset (`npm run seed`), and the **Events** and **Sermons** modules enabled. **Sanity is the single source of truth for all site content** (see the callout below). New-project flow: `README.md` quick start, then `docs/bootstrap/NEW-PROJECT.md`.
>
> **Content model — Sanity is the single source of truth.** Every piece of visible content (page copy, headings, buttons/links, images, the nav menus, SEO titles/descriptions, the worship service time, contact details) is a Sanity field; on a launched site every field should be populated so Sanity Studio mirrors the live site exactly. The literal strings in `src/pages/*.astro` are **safety-net fallbacks** (in the template they carry the placeholder-church example copy) that render only when a field is empty; on a live project they are NOT the live content. **Change content in Studio (the site rebuilds), not in the `.astro` files** — a populated Sanity field overrides the inline string. Values that repeat are single-sourced: the worship time is `siteSettings.worshipService` (derived everywhere via `src/lib/serviceTime.ts`); identity / contact / social (church name, email, pastoral email, phone, address, office hours, socials, give/watch links) resolve through `src/lib/siteSettings.ts` (`resolveSiteSettings`), read by the header, footer, nav, JSON-LD, and every page. There is deliberately no hardcoded contact/social fallback in `src/data/site.ts`, so an empty Sanity field renders blank or hides rather than showing a stand-in. Full map: `docs/agent/editor-vs-hardcoded.md`.

Companion tactical runbook: `OPERATIONS.md`. New-project setup entry point: `docs/bootstrap/NEW-PROJECT.md` with `docs/bootstrap/setup-checklist.md` as the launch gate.

Project slash commands (in `.claude/commands/`): `/sanity-audit` (ground truth on the dataset: counts, gaps, drafts — run it before debugging any "content looks wrong" report), `/rebuild` (trigger the production rebuild that makes published Sanity content live), `/visual-verify` (the both-themes-both-viewports screenshot loop). The design system summary for visual work is `design.md` at the repo root.

---

## About this starter

`ncs-church-starter` is a production-ready Astro + Sanity + Cloudflare Workers church-website template extracted from a finished client build. The infrastructure — build pipeline, CMS integration, deploy hooks, polish layer, component library, the full church page set (visit, believe, music, staff, grow, serve, kids, food, events, sermons, weddings, space, give, contact, FAQ), and a Lighthouse 100/100/100/100 baseline — is already standing. A new project stamps in its identity (`npm run rebrand`), seeds the starter content (`npm run seed`), and pours in its own design seam: colors, fonts, mark, photography, copy.

This starter is not a minimal scaffold. It ships with real patterns and real gotchas documented from production. The point is to skip the month of discovering them.

_Provenance: Reid Design build → ncs-astro-sanity-starter → Second Presbyterian Church of Chicago build (2026-06) → this church starter. Reference-build photography in `src/assets/` is placeholder-only: replace before any client launch._

---

## Stack essentials

Full stack notes and the `astro.config.mjs` landmines are in `docs/agent/stack-and-config.md`. The must-knows:

- **Astro 7.2.x**, TypeScript strict, `output: 'static'` (with a handful of `prerender = false` SSR routes: `/studio`, `/preview/**`, `/api/draft-mode/*`). Node 22.12+.
- **Sanity 6.4.0** is the CMS (schemas in `src/sanity/schemaTypes/`). All editable content lives in Sanity. `npm run typegen` regenerates types from the schemas.
- **ONE Studio, embedded at `/studio`.** It lives in this package (repo-root `sanity.config.ts`) and is built by `astro build`, so it rebuilds on every deploy and can never drift stale. There is no nested `studio/` package and no hosted `*.sanity.studio` deploy. Do not run `npx sanity deploy`.
- **Tailwind 4 via `@tailwindcss/vite`.** There is no `tailwind.config.mjs`. Brand tokens live in `@theme` blocks in `src/styles/globals.css`.
- **React 19 islands** for interactivity; Astro components for everything static. `react`, `react-dom` and `react-is` are pinned EXACT at `19.2.7`.
- **Cloudflare Workers** for hosting, not Pages (Pages is in maintenance mode). Deploy with `npm run deploy`, which is `wrangler deploy -c dist/server/wrangler.json`. A plain `wrangler deploy` against the root config 404s every SSR sub-route.
- **Web3Forms** contact form, **Calendly** discovery call, **Cloudflare Web Analytics** (cookieless, no banner).
- **`sanityFetch(query, params, fallback)`** in `src/lib/sanity.ts` is the single chokepoint for all Sanity reads. When `PUBLIC_SANITY_PROJECT_ID` is absent or set to the placeholder value, it returns the fallback without any network call, so `npm run build` succeeds with no Sanity project configured — pages render empty-state content.

### The rules that bite if you forget them

1. **After ANY schema change: `npm run typegen`, then commit the regenerated `src/lib/sanity.types.ts`, then deploy the site.** The Studio is embedded, so deploying the site IS deploying the Studio; there is no separate studio deploy to forget. What has not changed is the danger on the other side: if a live Studio is ever ahead of or behind its schema, editors see "unknown fields" next to a "Remove field" prompt. **Never click "Remove field":** it deletes that field's data across every document and cannot be undone without a dataset restore. And schema errors are fatal at BROWSER runtime while passing the build, so open `/studio` after every schema change.
2. **No em-dashes in public-facing site copy** (the text visitors read: page copy, component text, Sanity content). Use commas, colons, or restructure. Code comments, commit messages, plans, specs, and internal docs are exempt.
3. **Build in both light AND dark mode** on every UI change. Detail in `docs/agent/theme-and-color.md`.
4. **Desktop nav is server-rendered** in `Header.astro`. Do not regress it to a client-only island. Detail in `docs/agent/page-architecture.md`.
5. **The Lenis scroll reset on navigation** (forward goes to top, back/forward restores) lives in the BaseLayout Lenis init. Do not remove it. Detail in `docs/agent/polish-layer.md`.
6. **Content is statically built.** A Sanity edit only goes live after a rebuild (push to `main`, or the publish webhook). Detail in `docs/agent/deployment.md`.
7. **`npm run build` does NOT chain typegen** (`npm run build:full` does). `src/lib/sanity.types.ts` and `schema.json` are committed, so collaborators see the schema types without running typegen. Run `npm run typegen` locally after any schema change and commit the result: CI regenerates and fails the run if that produces a diff.
8. **`@astrojs/cloudflare` is pinned to exactly `14.2.4` and `wrangler` to `~4.110.0`, as a MATCHED PAIR.** Adapter 14.2.4 peers `wrangler ^4.83.0`; 14.2.5 peers `^4.125.0`, one minor away from 4.126, which rejects the `legacy_env` field adapter 14 can emit into `dist/server/wrangler.json`. Moving either is a deliberate act: bump both, rebuild, inspect the generated config for `legacy_env`, and run a real `wrangler dev` before believing it. (Verified 2026-08-28: this combination emits no `legacy_env` at all.)
9. **The Sanity dependency set is a pinned combination that only works together:** `sanity` 6.4.0, `@sanity/ui` **3.3.5**, `styled-components` 6.4.3, react/react-dom/react-is 19.2.7, plus `sanity-plugin-media` 5.0.11, `sanity-plugin-asset-source-unsplash` 7.0.15, and `@sanity/visual-editing` 5.4.5 pinned through `overrides` (not just as a dependency: `@sanity/astro` depends on it by caret and npm will otherwise nest a newer copy that drags a second `@sanity/ui` in). "Latest v3" is not close enough: `@sanity/ui` 3.5.3 fails differently, from inside styled-components' theme init. After ANY Sanity dependency work, verify on DISK, not in the lockfile: `find node_modules -path "*@sanity/ui/package.json"` must print exactly ONE line, and `grep -l "errors.md#" dist/client/_astro/*.js` exactly one file. If an override "does not work", delete `package-lock.json` and `node_modules` and re-resolve clean.
10. **`sanity build` writes to `./dist` by default**, which would clobber the Astro build. There is deliberately no `studio:build` script. A standalone bundle needs an explicit dir: `npx sanity build .studio-dist`.

---

## Build pipeline

`npm run build` is a chain:

1. `prebuild` runs `scripts/free-dist.mjs` (Windows only): a still-running `wrangler dev` or preview server holds a handle on `dist/`, and Astro empties dist at the start of every build, so the next build dies with an `EPERM` that reads like a permissions problem and is really "something is still serving the last build". It kills only `node.exe` / `workerd.exe` whose command line mentions BOTH this project directory AND a known dev server.
2. `build` runs `scripts/with-workerd.mjs astro build`. On Astro 7 with adapter 14, `astro build` prerenders by booting workerd through `@cloudflare/vite-plugin`, and on Windows that plugin's pinned workerd dies instantly behind a `MiniflareCoreError`. The wrapper points `MINIFLARE_WORKERD_PATH` at wrangler's newer copy first. Windows only; Linux CI stays on the stock path.
3. `astro build` then builds BOTH the static site and the embedded Studio, and emits the SSR bundle (`/studio`, `/preview/**`, `/api/draft-mode/*`) plus its generated `dist/server/wrangler.json`. Pages fetch content from Sanity at build time via the `sanityFetch` wrapper in `src/lib/sanity.ts`. When no Sanity project is configured, `sanityFetch` returns the provided fallback for every query, and the build still completes successfully with empty-state pages.

Note that `build` does NOT chain typegen (`build:full` does). `src/lib/sanity.types.ts` is committed, and CI fails the run if regenerating it produces a diff.

Standalone scripts:

- `npm run typegen` — `sanity schema extract --force && sanity typegen generate`. Regenerates `schema.json` and `src/lib/sanity.types.ts` after editing schemas. `--force` is what makes it re-runnable; without it the second run fails on "Schema file already exists".
- `npm run og` to re-run `scripts/generate-og-default.mjs` and regenerate `public/og-default.png` (after changing brand colors, tagline, or the wordmark in the script's inputs block).
- `npm run dev` — Astro's dev server, which serves the embedded Studio at `/studio` too. There is no separate `studio:dev` any more.
- `npm run preview` — `wrangler dev -c dist/server/wrangler.json`, the only way to exercise the SSR routes, `public/_headers`, and the runtime secrets locally. A plain static file server proves nothing about them.
- `npm run parity capture | compare` — the rendered-HTML regression net. See `docs/TESTING.md`.
- `npm run sync-check` — drift check of this repo's canonical copies against the library of record.

`public/og-default.png` is committed to the repo because it is a real asset shipped to visitors. `src/lib/sanity.types.ts` is also committed so collaborators don't need to run typegen to see what the schemas look like in code.

---

## Code conventions

- TypeScript strict mode. No `any`.
- Comment generously, especially in components that a future maintainer might edit by hand.
- At the top of each component file, add a header comment marking it `// Safe to edit by hand` or `// Foundation, edit with care`.
- Astro components for static content. React islands only where interactivity is required (lightbox, mobile nav, form handler, before/after slider, accordions).
- Prefer Astro's built-in `<Image />` and `<Picture />` components over plain `<img>` tags for any locally-bundled assets. For Sanity-hosted images, use the project's `<SanityImage />` wrapper (see image handling section).
- Tailwind utility classes inline. Pull into `@apply` only when a pattern repeats four or more times.
- Use `clsx` or `class-variance-authority` for conditional classes once components get state-dependent styling.

---

## Routes summary

Core routes that ship with the starter (always on, not toggleable):

| Path | Source | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | Home page singleton from Sanity |
| `/about` | `src/pages/about.astro` | About page singleton |
| `/faq` | `src/pages/faq.astro` | FAQ page + faqItem collection grouped by category |
| `/contact` | `src/pages/contact.astro` | Contact details + map (church build removed the Web3Forms form) |
| `/events` | `src/pages/events/index.astro` | Events module: upcoming + recurring rhythms |
| `/events/[slug]` | `src/pages/events/[slug].astro` | Event detail |
| `/sermons` | `src/pages/sermons/index.astro` | Sermons module: featured + archive + livestream |
| `/sermons/[slug]` | `src/pages/sermons/[slug].astro` | Sermon detail (embedded video) |
| `/worship` | `src/pages/worship.astro` | The "I'm New / Plan a Visit" page (first-visit info) |
| `/privacy` | `src/pages/privacy.astro` | Privacy policy from singleton, with static fallback when doc is absent |
| `/[slug]` | `src/pages/[slug].astro` | Custom `page` documents built in the Studio from the block library. The ONLY page whose body is a sections array. |
| `/sitemap-index.xml` | `@astrojs/sitemap` (auto) | Production sitemap |
| `/404` | `src/pages/404.astro` | Custom 404 |

There are also the church page singletons at `/worship`, `/what-we-believe`, `/music`, `/pastor-staff`, `/grow`, `/serve`, `/kids`, `/food`, `/use-our-space`, `/weddings` and `/give`, each one `src/pages/<slug>.astro` against its own singleton in `src/sanity/schemaTypes/churchPages.ts`.

**SSR routes (`prerender = false`), Studio plumbing, all noindex:**

| Path | Source | Notes |
|---|---|---|
| `/studio` | `@sanity/astro` + repo-root `sanity.config.ts` | The embedded Studio. Built by `astro build`. |
| `/preview` and `/preview/*` | `src/pages/preview/[...slug].astro` | Draft-aware pages for the Presentation tool. Fails closed with a 503 naming the missing config. |
| `/preview/live` | `src/pages/preview/live.ts` | SSE proxy over Sanity's listen API, so the preview auto-refreshes on an edit. Never replace with a poll. |
| `/api/draft-mode/enable` and `/disable` | `src/pages/api/draft-mode/` | Sets / clears the preview cookie. |

Additional routes come from opt-in modules staged under `modules/`. Each module is documented under `docs/modules/`. Modules: `events` and `sermons` (both ENABLED on this site, see their docs in `docs/modules/`), `portfolio`, `process`, `newsletter`, `lead-magnets`, `style-quiz`, `budget-calculator`, `shop`, `e-design`, `gift-certificates`, `press`, `resources`.

---

## Safe to edit by hand

These are the files where a project maintainer can make changes without risk of breaking the underlying architecture:

- Inline **fallback** copy inside `src/pages/*.astro` — but note this is the safety-net default, NOT the live content. The live content is the (populated) Sanity field, which overrides it. Edit live copy in Studio; editing a fallback here only changes what shows if that field is ever cleared.
- `src/data/site.ts` — static identity constants (site name, domain, brand color mirrors for scripts, asset paths). Replace all placeholder values before launch.
- The design seam — files that define the visual identity of the project:
  - `src/styles/globals.css` `@theme` block: palette tokens (`--color-primary`, `--color-ink`, `--color-paper`, etc.), the `--tint-rgb` token (controls polish-layer tint color across card-lift, surface-warm, and branded overlays), and font-family tokens
  - Font imports at the top of `src/styles/globals.css` (swap `@fontsource/libre-baskerville` and `@fontsource-variable/inter` for a project's chosen fonts; update `--font-display` and `--font-body` tokens accordingly)
  - `src/data/site.ts` brand color mirrors and identity values
  - `public/favicon.png` + `public/apple-touch-icon.png` (the church mark; also overridable per-site via `siteSettings.favicon`), `public/og-default.png` (regenerate OG via `npm run og` after changing brand inputs in `scripts/generate-og-default.mjs`)
  - Logo files in `src/assets/` (imported by `Header.astro` / `Footer.astro` via `getImage()`)
- Images in `src/assets/` (logo variants, OG image)
- Copy strings and `href` values in static page components
- Tailwind utility classes on existing components when content needs different visual weight
- Brand colors, tagline, and wordmark inputs in `scripts/generate-og-default.mjs` (re-run `npm run og` after editing)

**Enabling the script accent (opt-in):** The calligraphic script accent is OFF by default. No script font loads unless you opt in. To enable it for a project: (1) add a `@fontsource` import for your chosen calligraphic face (e.g. `@fontsource/great-vibes/400.css`), and (2) update `--font-script` in the `@theme` block to name that face first. Components using the `font-script` utility class will then render the calligraphic accent.

## Foundation, edit with care (route through a planned session)

- `src/styles/globals.css` — the full file beyond the design seam tokens: shadcn `:root` / `.dark` overrides, **polish-layer utilities** (`.card-lift`, `.press-tactile`, `.nav-underline`, `.site-header`, `.reading-progress`, `.surface-warm`, `[data-reveal]`), base resets, paper-grain `body::before`, print stylesheet
- `src/sanity/schemaTypes/*.ts` — Sanity schemas. Changing fields can break existing content. See gotcha #1 above.
- `src/lib/sanity.ts` — Sanity client, `sanityFetch` wrapper, `urlFor`, `parseSanityAssetDimensions`. The `isSanityUnconfigured` guard and graceful-fallback behavior are load-bearing for fresh-clone builds.
- `src/lib/queries.ts`, `src/lib/sanity.types.ts` — GROQ queries and generated types
- `src/lib/scriptAccent.ts` — shared helper `splitScriptAccent(headline, accent)` used by `Hero.astro`, `SectionHeading.astro`, and `FinalCta.astro`
- `src/lib/sectionVisibility.ts` — `getSectionVisibility(raw)` converts the raw `siteSettings.sectionVisibility` Sanity object into a flat boolean map. Rule: `value !== false` (unset/null/true = visible; only explicit false = hidden). Every toggleable page imports this. See [Section visibility](docs/agent/page-architecture.md#section-visibility).
- `src/layouts/BaseLayout.astro` — anti-FOUC theme bootstrap, skip link, header/main/footer wiring, View Transitions ClientRouter, Lenis init, **scroll-reveal observer**, **sticky-header scroll listener**, Cloudflare Analytics, OG meta, JSON-LD, title-suffix-doubling guard
- `src/components/ui/` shadcn primitives — **note: `accordion.tsx` is customized** (removed `h-(--radix-accordion-content-height)` lock + dropped `text-sm font-medium` from trigger). If you reinstall via `npx shadcn add` it will revert; reapply the changes.
- React islands: `MobileNav.tsx`, `ThemeToggle.tsx`, `BackToTop.tsx`, `ContactForm.tsx`, `BeforeAfterSlider.tsx`, `FaqAccordion.tsx`, `CalendlyInline.tsx`, `StickyCTAChip.tsx`, `CopyEmailButton.tsx`, `PortableText.tsx`, `JournalPortableText.tsx`, `StatsCounter.tsx`, `NewsletterSignup.tsx`
- Astro wrappers: `SanityImage.astro`, `StructuredData.astro` (if present), `SectionHeading.astro`, `SectionDivider.astro`, `ServiceAreaCue.astro`, `ReadingProgress.astro`, `ProcessStepIllustration.astro`, `Hero.astro`, `HeroBackground.astro`, `FinalCta.astro`, `CtaLink.astro`, `StatsRow.astro`, `FeaturedWork.astro`, `FeaturedJournal.astro`, `PressStrip.astro`
- `scripts/generate-og-default.mjs`, `scripts/generate-og-pages.mjs`, `scripts/generate-llms-full.mjs`, `scripts/generate-logo-variants.mjs`, `scripts/optimize-logo-files.mjs`, `scripts/import-content.mjs` — reusable generator and import scripts
- **The live-preview stack** (added 2026-08-28; the library of record's PORTS.md cards 10, 11 and 17 are the reasoning). Five parts that only work together, so change them as a set: `sanity.config.ts`'s `presentationTool`, `src/sanity/resolve.ts`, `src/lib/cms-preview.ts`, `src/lib/preview-auth.ts`, `src/pages/preview/**`, `src/pages/api/draft-mode/*`, `src/layouts/PreviewLayout.astro` and `src/components/preview/VisualEditingOverlay.tsx`. Three things in it will bite:
  - **`NON_STEGA_FIELDS` in `src/lib/cms-preview.ts` is not optional.** Stega hides ~1KB of invisible markers inside every string it touches, so an exact comparison like `tone === 'chapel'` is FALSE on an encoded value and the component takes the wrong branch **in preview only**, while the live site is fine. Add every new logic-driving dropdown field to that list the day you add the field.
  - **The preview route map lives in THREE files that must agree:** `SINGLETON_PREVIEW_PATHS` (`src/sanity/resolve.ts`), `SINGLETON_BY_PATH` (`src/pages/preview/[...slug].astro`) and `FIRST_SEGMENT_PREVIEWABLE` (the click interceptor in `PreviewLayout.astro`). The third degrades silently: a missed entry does not error, it just lets a click escape the preview to the live site.
  - **The in-canvas controls must stay live-neutral.** `Sections.astro` renders the wrapper `div` carrying `data-sanity`, and the two floating handles inside it, only when the preview passes `editDoc`; otherwise the wrapper is a `Fragment` and emits nothing. `npm run parity compare` is the standing gate on that.
- **The floating in-canvas control layer** (added 2026-08-28; the library of record's PORTS.md card 28). Three gestures inside the Presentation canvas: an appearance card off a palette handle (the six surfaces and three accents, read from `src/lib/surfaces.ts` and never re-listed), an accent-word picker off an `A` handle, and an "Edit here" text card on the seven rich twins and the three hero lines. The pure half is `src/lib/section-fields.ts` (the registry), `src/lib/sanity-path.ts` (the studio-path parser) and `src/lib/inline-rich-write.ts` (the allow-list HTML to portable-text serializer); the React half is `src/components/preview/overlay/*.tsx`, wired through the `components` prop on `<VisualEditing>`. **Most of this layer is PORTABLE and owned upstream** - `sanity-path.ts`, `inline-rich-write.ts`, `heading-accent.ts` (which owns `splitHeadingWords` / `isAccentedWord`), `overlay/styles.ts`, `overlay/usePopover.ts` and `overlay/useDraftDocument.ts` all carry the canonical marker, so edit them in `ncs-astro-sanity-starter` and re-sync, never here. What IS this repo's own: `section-fields.ts` and its drift gate, `overlay/index.ts`, `overlay/tool-theme.ts` (the six-value palette `styles.ts` reads) and the three card components. Writes go through `useDraftDocument`'s `write()`, which patches over the comlink, so every edit lands in the draft with the editor's own session and no token ever reaches the island. Five things will bite:
  - **`src/lib/section-fields.test.ts` is a DRIFT GATE, not a unit test.** It parses `blocks.ts`, `Sections.astro`, `SectionShell.astro` and every block component, and fails when a section gains or loses `bgField()`, `headingAccentField()` or a `richTwin()`. If it fails, fix the registry, not the assertion.
  - **A custom overlay component only mounts on a node the schema resolves to a FIELD.** A bare array-item path (`sections[_key=="x"]`) gets no resolver context, so the cards hang off preview-only handles pointing at `background.tone` and `headingAccent` (`sectionFieldEditAttr`). Do not "simplify" them onto the section wrapper; it silently never mounts.
  - **A card cannot be gated on `focused`.** The host recomputes it on every `presentation/focus` the Studio sends, so a card gated on it unmounts a beat after opening. Each card keeps its own open state and closes only on its close button, Escape, or a press outside.
  - **Two per-instance gates.** A section with a background photo or video does not wear its surface classes at all (`SectionShell` paints `text-white` instead), so the card hides the surface half and says why; and a section with an empty heading gets no accent handle. A control must never promise what the renderer will not honour.
  - **The accent picker deliberately does NOT mount on the heading.** `splitHeadingAccent` renders the CLEANED heading when it finds a match, so a heading that already has an accent word carries no stega and no overlay component can mount on it. Mounting there would give a control that works exactly once.
- `astro.config.mjs`, `wrangler.jsonc`, `package.json`, `tsconfig.json`, `components.json`, `sanity.config.ts`, `sanity.cli.ts`
- `public/_headers` (security response headers shipped with the deploy; its CSP now also carries the origins the embedded Studio needs, and its header comment says which and why)
- `public/robots.txt` (allow-all + sitemap reference)
- `public/llms.txt` (AI/LLM crawler index — update if major pages change)

**Modules:** files under `modules/` each contain the page, islands, and schema additions for an opt-in feature. Activate a module by following its own `README.md` (authored per module in `docs/modules/`). Do not edit module internals without reading its doc first.

If a change requires editing the foundation set, do it in a planned session, write the change deliberately, and update this doc when the architecture shifts.

---

## Visual verification workflow

Every UI change is verified visually before being reported done. The build that ships first-time-right is the one where the person who wrote the code saw it rendering correctly in every state that matters. This is a rule, not a habit.

### What to verify

For any change touching components, layouts, styles, or copy that affects layout:

1. **Both themes.** Light AND dark. Toggle in the running site via the header `ThemeToggle`, or use Chrome DevTools' "Emulate CSS prefers-color-scheme" while testing system mode. Light is primary, but dark must read as the brand, not as broken.
2. **Both viewports.** Mobile (~375px wide) and desktop (~1280px wide). Most visitors arrive on mobile. Never ship desktop-only.
3. **Interactive states.** Hover, focus (keyboard Tab), active. Test with mouse AND keyboard.
4. **Adjacent regressions.** Look at the sections immediately before and after the change. Cascading styles wreck neighbors more often than expected.

### How to verify

Use the Playwright MCP for screenshot-and-compare loops:

1. `npm run dev` (or hit the deployed URL for deployed changes)
2. Open the page via Playwright MCP at both viewports
3. Take screenshots, light and dark
4. Compare against the intent (spec, mockup, or prior screenshot)
5. If something's off, fix and re-screenshot. Don't ship a change you haven't seen rendered.

For accessibility-affecting changes, run Lighthouse on the changed page before opening a PR. Targets: 100/100/100/100 desktop. Defend them — when a score drops, find out why before merging.

For Sanity Studio testing (schema or structure changes), run `npm run dev` and open `/studio` as a content editor would. Schema errors are FATAL at browser runtime while passing the build, so a green build is not evidence the desk works. The Studio is the editor's UI; broken Studio = broken editor workflow.

### When NOT to skip this

Even "tiny" changes — a color tweak, a spacing nudge, a copy edit — go through the same loop. The smallest changes are where regressions hide because no one looks at them.

---

## Working with Claude

- Use Claude Code from the desktop app, not the terminal. Show diffs clearly so they read well in that UI.
- Prefer Plan Mode for any multi-file change, especially when touching Sanity schemas (schema changes propagate to live content).
- Pause for confirmation before installing new dependencies.
- When proposing design changes, describe the visual outcome in plain language, not just the code.
- For browser-based verification, prefer the Playwright MCP. See the [Visual verification workflow](#visual-verification-workflow) section above for what to verify and when.
- For Sanity Studio testing, run `npm run dev` and open `/studio` to check the editor experience as a content editor would see it.
- Don't report a UI change as done without screenshots in both themes and both viewports.

---

## Communication style

These apply to everything written: code comments, PR descriptions, commit messages, and copy on the site itself.

- Warm, conversational tone. Not stiff or corporate.
- Step-by-step structure for any process or how-to.
- No em-dashes in public-facing site copy. Use commas, periods, colons, or restructure the sentence. This rule is scoped to site copy only: code comments, commit messages, plans, specs, and internal docs may use em-dashes.
- No AI-tell phrases: delve, navigate (as a verb), leverage, robust, seamless, meticulous, tapestry, realm, landscape, testament to, ever-evolving, crucial, pivotal.
- No AI-tell sentence patterns: "It's not just X, it's Y," "Not only... but also," "It's important to note that," "When it comes to," "In the realm of," "That said" or "With that being said" as transitions.
- Don't open replies with filler like "Certainly!", "Absolutely!", "Great question!", or "I'd be happy to help."
- Don't close replies with "I hope this helps!" or "Let me know if you have any questions." End on the actual content.
- Avoid three-item lists where the third item is filler. Two items is fine if two is the truth.
- Use bold for genuine emphasis or list labels only, never random nouns mid-sentence.
- Default to prose, not headers and bullets, unless content is genuinely a list or step-by-step.
- Comment code generously so future maintainers can follow without reverse-engineering.

### Site copy voice (for copy that appears on the live site)

The church's specific voice, tone, and banned words live in `docs/brand/voice.md` (read it before writing site copy). The general patterns below still apply.

1. **Say it plainly. Especially about money.** Don't apologize, don't pad, don't soften prices with hedging language.
2. **Sound like a smart friend, not a brochure.** No "transformative experiences" or "elevated living."
3. **Show the thinking, not the credentials.** Specific reasoning beats generic claims of expertise.
4. **Stop talking when you're done.** End the paragraph. Don't tack on a closing line that restates the point.
5. **Be specific.** Concrete details beat generic descriptors.

Banned vocabulary: "transformative," "curated experience," "investment in your space," "elevated living," "tailored solutions."

---

## Topic index

Read these on demand. They are NOT auto-loaded, and they are referenced as plain paths so they stay lazy. Open with the Read tool when a task touches the area.

**Note:** the `docs/agent/` deep-dives are being genericized in a later pass. Some may still contain client-specific examples until that pass completes. Trust the patterns; ignore client-specific nouns.

`docs/bootstrap/NEW-PROJECT.md` is the setup entry point for adapting this starter to a new church, with `setup-checklist.md` as the launch gate.

| Area | Doc |
|---|---|
| **Design brief (one-file system: palette, type, motion, idioms, hard rules)** | `design.md` — attach it (plus screenshots) for any visual work |
| Stack detail + astro.config landmines | `docs/agent/stack-and-config.md` |
| Page + section architecture, nav, visibility toggles | `docs/agent/page-architecture.md` |
| Brand colors + theme system (light/dark discipline) | `docs/agent/theme-and-color.md` |
| Polish layer (brand stripe, card-lift, scroll, Lenis, script accents) | `docs/agent/polish-layer.md` |
| Animation layer (Lenis, motion, scroll-reveal, script accent) | `docs/agent/animation.md` |
| Typography + spacing tokens | `docs/agent/design-tokens.md` |
| Component catalog + long-read layout | `docs/agent/components.md` |
| Component sourcing guide (approved sources, token-remap cheat sheet, bundle flags) | `docs/agent/component-sources.md` |
| Error + empty states | `docs/agent/error-states.md` |
| Image handling | `docs/agent/images.md` |
| Accessibility | `docs/agent/accessibility.md` |
| SEO + JSON-LD | `docs/agent/seo.md` |
| Performance budgets + Lighthouse | `docs/agent/performance.md` |
| Content data + Sanity integration | `docs/agent/sanity.md` |
| Deployment + env vars + rebuild model | `docs/agent/deployment.md` |
| Editor-driven vs hardcoded | `docs/agent/editor-vs-hardcoded.md` |
| Change history | `docs/agent/changelog.md` |
| New-project setup runbook + pre-launch checklist | `docs/bootstrap/NEW-PROJECT.md`, `docs/bootstrap/setup-checklist.md` |
| Per-module enable guides | `docs/modules/<module-name>.md` |
| Church-website research (peer audit + gold-standard study) | `docs/research/` |

---

*Structure: this file is the always-loaded constitution. Deep reference lives under `docs/agent/` (see the topic index above). Change history is in `docs/agent/changelog.md`.*

See `OPERATIONS.md` for the tactical playbook (deploy, patch content, run audits, common gotchas).
