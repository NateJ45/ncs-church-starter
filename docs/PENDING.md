# PENDING

The open-patch and waiting-on-a-human queue for `ncs-church-starter`. Created
2026-08-27 during this repo's first sync session against the library of record
(`ncs-astro-sanity-starter`; see its `PORTS.md`).

This is a **registry, not a changelog**: it is authoritative, it gets edited in
the same commit as the thing it tracks, and an item leaves by being deleted when
it is done. The narrative ledger is `docs/agent/changelog.md`.

**This repo is a dormant template.** Several items below are deliberately parked
rather than blocked: they only become real work in a fork that is a live site.

---

## Waiting on a human

- **`.gitignore` needs `scripts/.asset-map.json`.** `scripts/lib/sanity-lib.mjs`
  caches uploaded Sanity asset ids there so a re-run of a seed script never
  re-uploads. It must not be committed. Not added in the sync session because
  `.gitignore` was already dirty in the working tree and was left untouched by
  agreement. One line, under "generated artifacts".

- **Enable the backup and uptime workflows in each fork.**
  `.github/workflows/sanity-backup.yml` and `uptime.yml` ship with their
  `schedule:` blocks commented out: this template has no deployed site to ping
  and an example dataset not worth exporting. Each fork uncomments the schedule
  and sets its own `SANITY_AUTH_TOKEN` secret + `SANITY_PROJECT_ID` and
  `SITE_URL` repo variables. Both gates are intact, so a fork that forgets gets
  a skipped run with a warning, never a false alarm. Full steps are in the
  header comment of each file.

---

## Open patches

- **`scripts/lib/loadEnv.mjs` carries no PORTABLE marker.** It is a canonical
  file by every other measure (`sanity-lib.mjs` imports it and cannot work
  without it), but the library of record's own copy is unmarked, and
  `sync-check.mjs` compares marked files **byte-exactly including the marker
  line**. Marking only this repo's copy would report permanent DRIFT against an
  unmarked upstream. Correct order: add the marker to the starter's copy first,
  then pull it forward here. Until then this file is copied verbatim and
  unpoliced.

- **`scripts/with-workerd.mjs` is installed but not wired.** Deliberate. The
  wrapper works around a Windows workerd crash that only occurs on Astro 7 /
  `@astrojs/cloudflare` 14, where the prerender is routed through
  `@cloudflare/vite-plugin`. This repo is Astro 6.3 / adapter 13.5.5, so the
  crash does not happen and the wrapper is a no-op safety net. Wire it on the
  Astro 7 upgrade: `"build": "node scripts/with-workerd.mjs astro build"`.

- **`react` / `react-dom` are on carets.** PORTS.md card 13: they must be the
  **exact** same version in every package or the build dies inside workerd
  behind a wall of Miniflare frames (the real message,
  `Incompatible React versions`, prints *above* the wrapper). Not a live failure
  here today; it becomes one the moment this repo installs a package that pulls
  react. Pin both exact on the Astro 7 upgrade at the latest.

---

## Upstream (the library of record, not this repo)

- **Tick the `ncs-church-starter` column in the starter's `PORTS.md` matrix.**
  As of this session this repo has cards 1, 2, 3, 4, 5, 6, 7, 9 and 15. No files
  in `ncs-astro-sanity-starter` were modified from here.

- **Card 3 (parity harness) is a PATTERN, not a canonical file.** This repo's
  `scripts/page-parity.mjs` therefore carries a `PORTED` header rather than the
  `PORTABLE` marker, matching the call WCP made on 2026-08-27. Real fixes to the
  normalizer get carried back by hand.
