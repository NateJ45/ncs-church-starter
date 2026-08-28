# NCS Church Starter

A production-ready church website starter: **Astro 7 + Sanity 6 + Cloudflare Workers**, by [Nixon Creative Studio](https://nixoncreativestudio.com). Fork it, stamp a new church's identity onto it, import the starter content, and you have a polished, editor-friendly church site in an afternoon instead of a month.

---

## Why it exists

Churches need real websites and rarely have a developer on staff. This starter was extracted from a finished, live church build (a historic congregation in Chicago) and keeps everything that made that site good, so the next church gets a strong site without paying to discover the same lessons again.

It is not a minimal scaffold. It ships with a **Lighthouse 100/100/100/100 baseline**, a warm editorial design system with light and dark themes, a complete Sanity content model where the Studio mirrors the live site exactly, and production gotchas documented where you will trip on them.

## What a church gets out of the box

- **The full page set:** home, plan-a-visit ("I'm New"), what we believe, music, pastor and staff, grow, serve, kids, food ministry, events (+ detail), sermons (+ detail), weddings, use our space, give, contact, FAQ, privacy, 404, plus a generic page-builder for anything else.
- **Worship plumbing:** one canonical service time that updates the header, footer, home, visit page, and Google's structured data together; a "This Sunday" module; a seasonal hero for Christmas and Easter.
- **Sermons:** livestream call to action, optional podcast links, a featured message, and a per-service archive (bulletin PDF, notes, hymns, who served, liturgical day).
- **Events:** recurring rhythms and one-time events with categories and registration links.
- **Connect:** configurable forms (general contact, connect card, prayer request ship as examples), newsletter hooks, and an announcement banner.
- **Editor experience:** an embedded Sanity Studio at `/studio` with an in-Studio help center, status badges, singleton enforcement, a live draft preview with click-to-edit, and every visible string editable.

## Design

A serif editorial type system, an arch-top image signature, structural accent color bands, restrained CSS-only motion, all documented in `design.md`. The point is a site that looks made for the congregation, not stamped from a template.

## Provenance

Extracted from the live [Second Presbyterian Church of Chicago](https://github.com/NateJ45/2ndpreschicago) build. The same lineage was later pivoted into a school site ([The Presbyterian Academy](https://github.com/NateJ45/presacademy)), which is why the content model is proven under real use.

---

## Stack

- **Astro 7.2** (static output, plus a few SSR routes) + TypeScript strict mode
- **Sanity 6.4** headless CMS (schemas in `src/sanity/schemaTypes/`), with the **Studio embedded at `/studio`** in this same package: one Studio, rebuilt on every deploy, so it can never drift stale
- **Live draft preview** at `/preview/**` with click-to-edit and Squarespace-style in-canvas section controls (insert, duplicate, remove, drag to reorder). Off until a fork supplies a project id and a `SANITY_TOKEN`; see `docs/bootstrap/NEW-PROJECT.md`.
- **Tailwind 4** via `@tailwindcss/vite` (brand tokens in `src/styles/globals.css`)
- **Cloudflare Workers** hosting via `npm run deploy`

## Quick start

```sh
npm install
npm run dev
```

Then follow the new-project runbook in `docs/` to rebrand, seed, and deploy.

---

Maintained by [Nixon Creative Studio](https://nixoncreativestudio.com).
