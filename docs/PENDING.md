# PENDING

The open-patch and waiting-on-a-human queue for `ncs-church-starter`. Created
2026-08-27 during this repo's first sync session against the library of record
(`ncs-astro-sanity-starter`; see its `PORTS.md`). Last revised 2026-08-28, the
session that took cards 10 + 17 (Astro 7 / adapter 14 / Sanity 6.4 / embedded
Studio / preview stack / in-canvas section controls).

This is a **registry, not a changelog**: it is authoritative, it gets edited in
the same commit as the thing it tracks, and an item leaves by being deleted when
it is done. The narrative ledger is `docs/agent/changelog.md`.

**This repo is a dormant template.** Several items below are deliberately parked
rather than blocked: they only become real work in a fork that is a live site.

---

## Waiting on a human

- **`.gitignore` needs four lines, and still has two stale ones.** It was dirty
  in the working tree at the start of both sync sessions and was left untouched
  by agreement, so this is the second session to record rather than edit it.
  Under "generated artifacts": ADD `schema.json` (the extracted schema, now at
  the repo root), `.sanity/` (the Sanity CLI's local runtime cache), `.dev.vars`
  (the Worker runtime SECRETS file: it must never be committed) and
  `scripts/.asset-map.json` (`scripts/lib/sanity-lib.mjs` caches uploaded Sanity
  asset ids there so a re-run of a seed script never re-uploads). REMOVE
  `studio/schema.json` and `studio/dist/`: the nested `studio/` package no longer
  exists.

- **Enable the backup and uptime workflows in each fork.**
  `.github/workflows/sanity-backup.yml` and `uptime.yml` ship with their
  `schedule:` blocks commented out: this template has no deployed site to ping
  and an example dataset not worth exporting. Each fork uncomments the schedule
  and sets its own `SANITY_AUTH_TOKEN` secret + `SANITY_PROJECT_ID` and
  `SITE_URL` repo variables. Both gates are intact, so a fork that forgets gets
  a skipped run with a warning, never a false alarm. Full steps are in the
  header comment of each file.

- **The live preview has never been exercised against a real dataset.** This
  template has no Sanity project, so 2026-08-28 could only prove the stack
  FAILS CLOSED: `/preview` and `/preview/about` answer 503 naming the two
  missing pieces, `/preview/live` answers 403 without the Studio cookie, and
  `/studio` mounts in a real browser and renders Sanity's own "Project not
  found" screen for `placeholder-project-id`. What is NOT verified: a rendered
  draft, the click-to-edit overlay, the SSE auto-refresh, and the in-canvas
  insert / duplicate / remove / drag controls. **A fork that becomes a real site
  must run that check for real, in a browser, before trusting any of it** (see
  `docs/bootstrap/NEW-PROJECT.md`, "Turn the live preview on").

---

## Open patches

- **The Studio's brand chrome was traded for a working dark mode.** The nested
  Studio used `buildLegacyTheme()` with the church palette (Bronze accent, cream
  Paper surfaces, a Chapel-green top bar). That builder is LIGHT-ONLY: it
  hard-codes white component backgrounds, so the Studio's Dark appearance
  setting left every panel white. `sanity.config.ts` now uses `@sanity/ui`'s
  `buildTheme()`, which ships both schemes; the brand survives in the logo
  (`StudioLogo`) and the serif fonts (`StudioLayout` injects them). If a fork
  wants tinted Studio chrome back, it needs a real `buildTheme` palette in
  oklch, not a return to the legacy builder.

- **No Playwright / axe / reflow suite.** PORTS.md card 8. Accessibility and
  320-1440 reflow are still a manual pass here. This is the largest known gap,
  and it grew on 2026-08-28: the preview routes and the embedded Studio are new
  surfaces no automated gate touches. A fork that becomes a real site should
  install the suite.

- **`sanity-plugin-utils` is pinned in `overrides` but nothing installs it.**
  The entry is carried verbatim from the library of record because that is the
  shape that ports; on this repo's dependency set it currently resolves to
  nothing (`npm ls sanity-plugin-utils` is empty). Keep it: the day a fork adds
  a plugin that pulls it, the default 2.0.17 would drag `@sanity/ui` v4 in and
  break the one-instance invariant.

---

## Upstream (the library of record, not this repo)

- **Tick the `ncs-church-starter` column in the starter's `PORTS.md` matrix.**
  As of 2026-08-28 this repo has cards 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14,
  15 and 17. Cards 8 (browser suite), 12 (page-builder conversion) and 16
  (quarterly slop sweep) are the remaining gaps. No files in
  `ncs-astro-sanity-starter` were modified from here.

- **Card 3 (parity harness) is a PATTERN, not a canonical file.** This repo's
  `scripts/page-parity.mjs` therefore carries a `PORTED` header rather than the
  `PORTABLE` marker, and `sync-check` does not police it. Real fixes to the
  normalizer get carried back by hand.

- **Card 17's array-field note has a second shape now.** The library of record
  holds every page's sections in ONE array (`pageBuilder`), and presacademy
  splits singletons (`flexibleSections`) from custom pages (`sections`). THIS
  repo matches presacademy's split, and adds a wrinkle neither has: its
  `flexibleSections` is an APPEND ZONE below hand-built page bodies, not the
  body itself, so only the generic `page` type previews full-fidelity. Worth
  folding back into the card as the third case.
