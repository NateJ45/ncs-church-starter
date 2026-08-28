# Module: Events

**What it adds:** Routes `/events` (upcoming one-time events plus the weekly/recurring rhythms of the church) and `/events/[slug]` (event detail with schedule, location, optional image, Portable Text description, and an optional registration link). Studio schemas: `eventsPage` (singleton driving the index hero) and `event` (collection supporting both `recurring` and `oneTime` events). The index falls back to a known list of recurring rhythms when no events exist in Sanity, so the page is never empty.
**Depends on (already in core):** `Hero.astro`, `SectionHeading.astro`, `FinalCta.astro`, `SanityImage.astro`, `PortableText.tsx`, and `breadcrumbSchema` from `@/lib/schemas`.
**Env/config:** No additional env vars beyond the standard `PUBLIC_SANITY_*` set.

---

## Enable

### Step 1 -- Copy schemas into the Studio

```powershell
Copy-Item modules/events/studio/*.ts src/sanity/schemaTypes/
```

### Step 2 -- Register schemas in `src/sanity/schemaTypes/index.ts`

```ts
import { event } from './event';
import { eventsPage } from './eventsPage';

export const schemaTypes = [
  // ... Singletons ...
  eventsPage,   // add with the other singletons
  // ... Reusable content collections ...
  event,        // add with the other collections
];
```

### Step 3 -- Register in `src/sanity/structure.ts`

a) Add `'eventsPage'` to `SINGLETON_TYPES` and `'event'` to `HIDDEN_FROM_DEFAULT`.
b) Add `CalendarIcon` to the `@sanity/icons` import.
c) Add the index singleton inside the Pages list:

```ts
singletonWithPreview(S, 'eventsPage', 'Events (index page)', CalendarIcon),
```

d) Add the collection as a top-level desk item (after Journal):

```ts
S.documentTypeListItem('event').title('Events').icon(CalendarIcon),
```

### Step 4 -- Copy app files

```powershell
Copy-Item -Recurse -Force modules/events/src/* src/
```

### Step 4b -- Add query functions to `src/lib/queries.ts`

Add `getEventsPage`, `getRecurringEvents`, `getUpcomingEvents`, `getEventBySlug`, and `getAllEventSlugs` (see the Events section in `src/lib/queries.ts`). They reuse the shared `IMAGE_PROJECTION`.

### Step 5 -- Add the nav entry in `src/components/Header.astro`

```ts
{ kind: 'flat' as const, label: 'Events', href: '/events' },
```

### Step 6 -- Seed placeholder content

```powershell
node modules/events/seed.mjs
```

Creates the `eventsPage` singleton, seven recurring rhythms, and one example one-time event. Idempotent.

### Step 7 -- Verify the build

```powershell
npm run typegen   # expect PASS
npm run build     # expect PASS; /events appears, /events/[slug] builds for each seeded event
```

---

## Verify

- `/events` renders in both light and dark mode at ~375px and ~1280px, showing the recurring rhythms (from Sanity, or the built-in fallback list).
- One-time events appear under "Upcoming events" until their end date passes; past ones drop off on the next build.
- `/events/[slug]` renders each seeded event with its schedule, description, and registration link when set.
- With no `event` documents, the recurring section still shows the fallback rhythms and the upcoming section shows its empty state.
- `npm run typegen` and `npm run build` both pass.
