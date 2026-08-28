# Module: Sermons

**What it adds:** Routes `/sermons` (a featured latest message + an archive grid + a persistent Watch Live link, with a graceful "watch online" fallback when empty) and `/sermons/[slug]` (embedded YouTube/Vimeo player + date/speaker/series/scripture + optional audio + Portable Text notes). Studio schemas: `sermonsPage` (singleton: hero copy + livestream URL) and `sermon` (collection: title, date, speaker, series, scripture, videoUrl, audioUrl, description, image, featured).
**Depends on (already in core):** `Hero.astro`, `SectionHeading.astro`, `FinalCta.astro`, `SanityImage.astro`, `PortableText.tsx`, `breadcrumbSchema`.
**Env/config:** No extra env beyond the standard `PUBLIC_SANITY_*`.

---

## Enable

### Step 1 -- Copy schemas

```powershell
Copy-Item modules/sermons/studio/*.ts src/sanity/schemaTypes/
```

### Step 2 -- Register in `src/sanity/schemaTypes/index.ts`

```ts
import { sermon } from './sermon';
import { sermonsPage } from './sermonsPage';

export const schemaTypes = [
  // ... Singletons ...
  sermonsPage,
  // ... Reusable content collections ...
  sermon,
];
```

### Step 3 -- Register in `src/sanity/structure.ts`

a) Add `'sermonsPage'` to `SINGLETON_TYPES` and `'sermon'` to `HIDDEN_FROM_DEFAULT`.
b) Add `PlayIcon` to the `@sanity/icons` import.
c) Add the index singleton inside the Pages list:

```ts
singletonWithPreview(S, 'sermonsPage', 'Sermons (index page)', PlayIcon),
```

d) Add the collection as a top-level desk item:

```ts
S.documentTypeListItem('sermon').title('Sermons').icon(PlayIcon),
```

### Step 4 -- Copy app files

```powershell
Copy-Item -Recurse -Force modules/sermons/src/* src/
```

### Step 4b -- Add query functions to `src/lib/queries.ts`

Add `getSermonsPage`, `getRecentSermons`, `getSermonBySlug`, and `getAllSermonSlugs` (see the Sermons section in `src/lib/queries.ts`).

### Step 5 -- Add the nav entry in `src/components/Header.astro`

```ts
{ kind: 'flat' as const, label: 'Watch', href: '/sermons' },
```

### Step 6 -- Seed placeholder content

```powershell
node modules/sermons/seed.mjs
```

Creates the `sermonsPage` singleton (with the livestream URL) and two example sermons. Idempotent.

### Step 7 -- Verify

```powershell
npm run typegen   # expect PASS
npm run build     # expect PASS; /sermons appears, /sermons/[slug] builds per sermon
```

---

## Verify

- `/sermons` renders in both light and dark mode at ~375px and ~1280px. With sermons present it shows the featured + archive; with none it shows the "watch online" fallback.
- `/sermons/[slug]` embeds the video when a YouTube/Vimeo URL is set, and renders cleanly without one.
- `npm run typegen` and `npm run build` pass.
