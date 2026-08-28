# What's editor-driven vs hardcoded

> Reference for what an editor can change in Studio versus what needs a code edit. Mark component files accordingly.

## Sanity is the single source of truth

**All content on the site is editor-driven through Sanity, and every content field is populated, so the Studio mirrors the live site exactly.** Page copy, headings, body text, buttons and links, images, the navigation menus, SEO titles/descriptions, the worship service time, and contact details all live in Sanity. To change anything a visitor reads, sees, or clicks, edit it in Sanity Studio; the site rebuilds and the change appears a few minutes later.

The literal strings in `src/pages/*.astro` are **not the content** -- they are safety-net fallbacks that render only if a field is ever left empty, so a section can never go blank. **Do not edit copy in the `.astro` files expecting it to change the live site:** the populated Sanity field overrides it. (To make something brand-new editable, see "The `// Safe to edit by hand` convention" at the bottom.) One exception to this "fallback" framing: identity / contact / social values (church name, email, pastoral email, phone, address, office hours, socials) have **no** hardcoded fallback (see the resolver note below) -- an empty one renders blank or hides rather than showing a stand-in.

**Values that repeat across the site are single-sourced, so changing them is one edit:**
- **Worship service time** -> `siteSettings.worshipService` ({ time, day, start/end 24h }). Drives the header bar, footer, home service band, the "This Sunday" line, the worship-page time, and the Google/JSON-LD opening hours, all derived via `src/lib/serviceTime.ts`. Prose elsewhere is deliberately time-agnostic so the time is never repeated. (The FAQ "what time" answer and the home weekly-rhythms list intentionally still name it, as editable content.)
- **Address / phone / email / pastoral email / office hours** -> `siteSettings`. Each drives every on-page display plus the LocalBusiness JSON-LD and the tap-to-call / map links.
- **Church name, mission, socials, give / watch URLs** -> `siteSettings`.

All identity / contact / social values resolve in ONE place: `src/lib/siteSettings.ts` (`resolveSiteSettings`), which the header, footer, mobile nav, JSON-LD, and every page read from. Components no longer read raw `siteSettings` contact fields or any `src/data/site.ts` constant for these -- the `contact` and `social` blocks in `site.ts` were deleted. There is **no hardcoded fallback**, so clearing a value renders it blank (or hides the element, like office hours) instead of masking it with a stand-in, and the header / footer / pages can never drift apart. Derived-from-Sanity defaults still apply where they make sense: `mission` falls back to the tagline, `pastorEmail` to the public email, and the give / watch links to the `/give` and `/sermons` pages.

> Church build note: the reference build pushed everything to
> editor-driven via the inline-fallback pattern, then seeded every field so the
> Studio shows the live copy. The interior-designer template's modules (portfolio,
> journal, services, testimonials, philosophy, shop, etc.) are not used here; their
> docs under `docs/modules/` remain for template reuse only.

### Editor-driven (Sanity)

- **All page copy** -- every page singleton's eyebrows, headlines, subheads, body, buttons/CTAs, and in-body links are editable fields, and all are populated, so the Studio shows the live copy. An empty field falls back to the built-in verbatim copy (the inline-fallback safety net), so a section can never go blank. Exception: the *What We Believe* statement of faith is reproduced verbatim and owned by leadership -- edit with care.
- **All hero images** -- every `*Page` singleton has a `heroImage` (with alt). The home page also has `heroImages` (one = static, two+ = cross-fading slideshow) and a dated `seasonalHero` override.
- **Navigation** -- the header menu (`siteSettings.navItems`: Links + Dropdown menus) and the footer link columns (`siteSettings.footerColumns`). Both fall back to the built-in menus when empty; the mobile menu inherits the header. The footer "Get in touch" column is derived from contact fields.
- **Favicon** -- `siteSettings.favicon` (browser-tab icon); falls back to the bundled church mark in `/public/favicon.png`.
- **Collections** -- Events, Sermons, Pastors & Staff (`staffMember`), Ministries (`ministry`), FAQ Items (`faqItem`, which drive the FAQ page), Forms (`form`), Announcements (scheduled site banner), Worship Resources (`worshipResource`).
- **Page sections (the page builder)** -- every page singleton plus the generic `page` type has a `flexibleSections[]` array: add / reorder / remove on-brand blocks (rich text, image+text, cards, quote, CTA band, form, feature cards, stats, FAQ, gallery, arched showcase (slideshow/video), steps, logos, media feature, dynamic list), each with a background control (brand tone, or image/video + overlay). See `page-architecture.md`.
- **Per-page lists** -- the structured lists baked into specific pages are editable too: wedding FAQs + pricing, grow community groups, serve "ways to serve", use-our-space uses, contact "who to reach" rows, what-we-believe resource links, and the home service band + weekly rhythms. Each reads its Sanity field and falls back to the built-in list when empty.
- **Custom pages** -- the `page` type publishes a brand-new page at `/<slug>` with the block library, no developer.
- **Site-wide identity & integrations** -- `siteSettings`: church name, tagline, mission, email, **pastoral email** (`pastorEmail`, blank = use the public email), phone, **street address** (`addressLine` + `cityStateZip`), socials, service time, and a "Connect & integrations" group (watch / give / app / directory / registration / prayer URLs). Phone + address feed the LocalBusiness JSON-LD and tap-to-call / map links. All of these resolve through `src/lib/siteSettings.ts` (`resolveSiteSettings`) with no hardcoded fallback: clearing a value renders it blank or hides its element, never a stand-in from `src/data/site.ts`.
- **SEO / social** -- per-page `seoTitle` / `seoDescription` / `seoImage`; a site-default `siteSettings.seoImage`.
- **Section heading script accents** -- `scriptAccent`-style fields render one word of a heading in the handwritten display font. The word must match the heading text exactly; leave empty for no accent. See `polish-layer.md`.
- **404 page** (`notFoundPage`) and **Privacy page** (`privacyPage`) -- editable, each with a hardcoded fallback so it works before the doc exists.

> No live in-Studio preview: the site is a static build, so edits are drafts until you
> Publish, then the site rebuilds and the change appears a few minutes later. The iframe
> "Preview" tab was removed (it showed the last published build, not the draft, which
> misled editors). A true draft preview would need an SSR preview environment.

### Hardcoded in code (intentional)

These are stable design and system decisions that don't belong in editorial:

- **Brand colors / typography tokens** -- declared in `src/styles/globals.css` `@theme` block; the Studio theme mirrors them in `sanity.config.ts`. System-level, not editorial.
- **Page layout & section markup** -- the structure of each page and each block component. Editors change words, images, section order, and backgrounds; the layout is code.
- **Auto-year copyright** -- computed from `new Date()` at render time. No field needed.
- **The "How This Works" help guides** -- repo-based and locked on purpose (`src/sanity/guides/content.tsx` + `src/sanity/components/GuideView.tsx`), so staff can't edit or delete the instructions. This replaces the old `studioGuide` / `studioNotes` / `studioPlaybook` singletons.
- **Built-in menu fallbacks** -- `FALLBACK_NAV_ITEMS` in `Header.astro` and the default columns in `Footer.astro`. These render only when the editor's `navItems` / `footerColumns` are empty.

> Note: the **navigation is no longer hardcoded** -- the header (`navItems`) and footer columns (`footerColumns`) are editor-driven, with the built-in arrays above as the fallback.

### The `// Safe to edit by hand` convention

At the top of each component file, a header comment marks it as either:
- `// Safe to edit by hand` -- a project maintainer can make changes here without risk of breaking the underlying architecture.
- `// Foundation, edit with care` -- changes propagate widely; route through a planned session.

If you ever want to flip something from hardcoded to editor-driven, the pattern is: add a field to the appropriate Sanity schema, run `npm run typegen`, update the component to consume the new field with a fallback to the current hardcoded value, open `/studio` to confirm the field renders, commit (the site deploy carries the Studio). (For a site-wide identity / contact / social value, add it to the resolver in `src/lib/siteSettings.ts` (`resolveSiteSettings`) rather than giving the component its own hardcoded fallback, so it stays single-sourced and an empty field stays visible.)
