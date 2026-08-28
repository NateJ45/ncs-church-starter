# Stack and Astro config

> Full stack/version notes and the astro.config.mjs levers that look tempting but break things.

## Stack

Pinned versions reflect what's known to work together as of May 2026. Bump deliberately, not casually.

- Astro 7.2.x with TypeScript in strict mode and `output: 'static'`. A handful of routes opt out with `prerender = false`: the embedded Studio at `/studio`, the draft preview at `/preview/**`, and `/api/draft-mode/*`. Requires Node 22.12+. (Upgraded from Astro 6.3 on 2026-08-28.)
- **Sanity 6.4.0** as the headless CMS, pinned as part of a combination that only works TOGETHER (see `CLAUDE.md` rule 9). Schemas in `src/sanity/schemaTypes/`, written with `defineType`/`defineField`/`defineArrayMember` from `'sanity'`. Sanity TypeGen generates TypeScript types from the schemas (`npm run typegen`). All editable content lives in Sanity (services, testimonials, FAQs, projects, page singletons). The Studio is EMBEDDED in this package and served at `/studio` by `@sanity/astro`, reading the repo-root `sanity.config.ts`. There is no nested `studio/` package and no hosted `*.sanity.studio` deploy: one Studio, rebuilt by every site deploy, so it cannot drift stale.
- **Env-driven Sanity config:** the Sanity project ID and dataset are read from `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` at build time. `src/lib/sanity.ts` exposes a `sanityFetch(query, params, fallback)` wrapper that returns the fallback value when no project is configured (either env var absent or empty), so `npm run build` succeeds with no Sanity project set up. Pages render their empty-state fallback content rather than erroring. This is intentional: you can build and verify the site skeleton before wiring up Sanity.
- Tailwind 4 via `@tailwindcss/vite`. Brand tokens declared in `@theme` blocks inside `src/styles/globals.css`. There is no `tailwind.config.mjs` file.
- React 19 islands for anything interactive (mobile nav drawer, contact form, lightbox, theme toggle, back-to-top). Astro components for everything static.
- shadcn/ui primitives in `src/components/ui/` (Nova preset, Radix base). Extend Button with project-specific marketing variants only when the standard variants don't carry the brand.
- Motion (formerly Framer Motion), Astro View Transitions, Lenis smooth scroll (respecting `prefers-reduced-motion`).
- sharp for image processing. Sanity handles its own image transformation pipeline for content images; sharp is for any locally-bundled assets (logo, OG image generator).
- opentype.js (dev-only) for the OG image generator at `scripts/generate-og-default.mjs`.
- `@astrojs/rss` reserved for `/rss.xml` (not wired at launch by default).
- `@astrojs/sitemap` for `sitemap-index.xml` (production sitemap).
- Three-state dark/light/system theme system: `ThemeToggle.tsx` React island plus an anti-FOUC bootstrap script in BaseLayout, persisted to `localStorage["theme"]`. The site is light-primary; dark mode is supported for visitor preference but not the primary read of the brand.
- `src/data/site.ts` as the single source of truth for hardcoded site identity (brand name, domain, asset paths, social URL strings the build needs at compile time). Editor-controlled content goes through Sanity.
- **Web3Forms** for the contact form (NCS standard pattern). Free tier covers 250 submissions/month.
- Cloudflare Web Analytics for privacy-friendly traffic (no cookie banner needed).
- **Cloudflare Workers** for hosting (not Pages). The two products merged in early 2026; Pages is in maintenance mode, Workers gets all new investment. Deploy with `npm run deploy`, i.e. `wrangler deploy -c dist/server/wrangler.json`: a plain `wrangler deploy` against the root config 404s every SSR sub-route. `wrangler.jsonc` also carries `nodejs_compat` (the SSR render graph touches `process.env`) and deliberately NO `not_found_handling`, because with `"404-page"` set Cloudflare answers navigation requests that miss the asset store straight from the static 404 WITHOUT invoking the Worker, silently 404ing every SSR route for real browsers while curl still sees them working. Astro adapter config is `cloudflare({ imageService: 'compile' })` so image processing stays at build-time via Sharp -- never reaches the Cloudflare Images runtime binding (avoids surprise per-transform fees, no Workers binding required).
- **`@astrojs/cloudflare` is pinned to exactly `14.2.4` and `wrangler` to `~4.110.0`, as a matched pair.** Adapter and wrangler versions are a matched pair verified by a real build, and this family has hit three separate landmines proving it: 13.6.0 regressed the image optimizer (optimized assets written to `dist/client/_astro/` but read back from `dist/_astro/`); adapter 14 can write `legacy_env: true` into the generated `dist/server/wrangler.json`, which wrangler 4.126+ rejects outright; and adapter 14.2.5 peers `wrangler ^4.125.0`, one minor from that rejection, while 14.2.4 peers `^4.83.0`. Moving either is deliberate: bump both, rebuild, grep the generated config for `legacy_env`, and run a real `wrangler dev`. Verified 2026-08-28 on this combination: no `legacy_env` is emitted at all, and `wrangler dev` serves every route.
- GitHub for version control.

### Astro config don'ts

A few `astro.config.mjs` levers that look tempting but break things -- left documented here so a future agent doesn't waste a cycle rediscovering them:

- **`security.csp` is disabled on purpose.** Astro 6 has a hash-based CSP feature that auto-generates SHA-256 hashes for inline scripts + styles. Enabling it satisfies Lighthouse's `csp-xss` audit on paper, but in practice the build-time hash pass misses at least one runtime-generated inline script (ClientRouter's view-transitions runtime emits one) and one inline style from the astro-island markup. The browser then blocks them -- theme bootstrap breaks, Lenis init breaks, polish observer breaks. Re-enabling would need either nonce-based SSR (doesn't apply to our `output: 'static'`) or an audit of every inline script Astro and React might emit at runtime. Not worth chasing for an unscored audit. Astro's `security.csp` remains disabled for the same reason on Astro 7. The real CSP ships in `public/_headers`, and since 2026-08-28 it carries the origins the embedded Studio needs (api.sanity.io and its websocket, sanity-cdn.com, the Studio font host, `worker-src blob:`); that file's header comment lists each one and what breaks without it. `frame-ancestors 'self'` is now exactly right, because the Presentation tool iframes `/preview/*` from the SAME origin.

- **`crossorigin="anonymous"` on Sanity CDN images breaks them.** Sanity's CDN doesn't send `Access-Control-Allow-Origin` for credential-less image requests, so the browser refuses the response and the image fails to render. Lighthouse's third-party-cookie warning about `sanitySession` is a real cookie, but the only known fix would proxy every image through a Cloudflare Worker -- not worth the engineering for an unscored Best Practices flag.

### Build order: typegen before build

Run `npm run typegen` before `npm run build` whenever schemas change. The TypeScript types generated from Sanity schemas are consumed by page-level GROQ queries; a stale type file causes `astro check` and `tsc` to surface type errors that disappear once types are regenerated. `npm run build` does NOT chain typegen (`npm run build:full` does), so run `npm run typegen` yourself after a schema change and commit the result. CI regenerates and fails the run if that produces a diff, which is the real guard.

### Sitemap `/404` filter

`astro.config.mjs` passes a `filter` function to `@astrojs/sitemap` that excludes `/404` from the generated sitemap. Without the filter, Astro includes the 404 page in `sitemap-index.xml`, which tells crawlers to index a page that should never appear in search results. The filter is one line and should stay.
