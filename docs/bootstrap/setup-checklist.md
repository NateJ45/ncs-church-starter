# Setup checklist — new church launch

Tick-box companion to `NEW-PROJECT.md`. Copy into the project tracker per
client. Every item checked or explicitly deferred with a reason before DNS
cutover.

## Identity & code
- [ ] `bootstrap.config.json` filled; `npm run rebrand` (check mode) reviewed; `npm run rebrand -- --apply` run; diff reviewed
- [ ] `npm run typegen` after rebrand (and after any schema change)
- [ ] Grep for leftover placeholders: `First Church`, `Springfield`, `example-church`, `555-0100` → zero hits outside docs examples
- [ ] Palette tokens reskinned in `globals.css` + mirrored in `site.ts` (or the reference palette consciously kept)
- [ ] Fonts confirmed (or swapped + tokens updated)
- [ ] Favicon + apple-touch-icon replaced; `npm run og` rerun; OG card checked
- [ ] Every photo in `src/assets/` replaced (reference-build placeholders are NOT licensed for other clients)
- [ ] Wordmark lines read right in header, footer, mobile menu (`site.ts` → `wordmark`)

## Sanity
- [ ] Project created; `.env` filled (`PUBLIC_SANITY_PROJECT_ID` + `SANITY_STUDIO_PROJECT_ID` + the read/write tokens); tokens marked Secret in Cloudflare. There is no `studio/.env`.
- [ ] `npm run seed -- --apply` imported the starter content
- [ ] Site Settings fully populated (identity, socials, give/watch URLs, worship time, nav, footer)
- [ ] Geo coordinates set in Site Settings (Latitude + Longitude): right-click the building in Google Maps and copy the coordinates from the context menu. These power the `geo` block in the Church structured-data schema (JSON-LD). Leave blank to omit the geo block rather than shipping wrong coordinates.
- [ ] Real page copy in (home, visit, believe, staff bios, ministries)
- [ ] Forms: Web3Forms key set; contact + connect card + prayer request tested end-to-end
- [ ] `/studio` opens on the DEPLOYED site and the desk renders (not just the login screen). There is no separate Studio deploy: the site deploy is the Studio deploy.
- [ ] Editor accounts invited; help-center guides walked through

## Live preview (fork activation)
- [ ] `SANITY_TOKEN` set as a Worker runtime secret (`npx wrangler secret put SANITY_TOKEN`) AND locally in `.dev.vars`
- [ ] `npx sanity cors add <origin> --credentials` run for localhost, the workers.dev host, and the custom domain
- [ ] Under `npm run preview`: Presentation shows DRAFT content, click-to-edit jumps the edit panel to the right field, and an autosave refreshes the preview on its own
- [ ] Hovering a section in the preview shows the in-canvas insert / duplicate / remove / drag controls, and the insert menu opens the plain-language groups
- [ ] Before any of the above is configured, `/preview` answers 503 naming what is missing (not a 500) — a quick way to confirm the fail-closed path still works
- [ ] `node scripts/sanity-audit.mjs --fields` reviewed: no unexpected empty fields, zero stray drafts

## Cloudflare & launch
- [ ] Repo on GitHub; Workers build from repo green
- [ ] Env vars set in Cloudflare (build section)
- [ ] Sanity publish → Cloudflare rebuild webhook wired AND tested (edit, publish, watch the deploy)
- [ ] Custom domain + DNS cutover plan; `astro.config.mjs` site URL correct (robots.txt is auto-generated from `site.url` at build time)
- [ ] Lighthouse 100/100/100/100 on `/` and one content page (defend per `docs/agent/performance.md`)
- [ ] Both themes × both viewports eyeballed on home, visit, sermons, events, contact (`/visual-verify`)
- [ ] Privacy page reviewed against actual data practices; analytics token set (or consciously omitted)
- [ ] 404 page reads right; `public/llms.txt` regenerated
- [ ] Footer credit set in Site Settings (footerCredit + footerCreditUrl → your studio site)

## Aftercare
- [ ] Editor knows: edit → Publish → live in ~2 min (and what to do if not: OPERATIONS gotchas)
- [ ] `docs/agent/changelog.md` started for this client
- [ ] Backup/export cadence decided (`sanity dataset export`)
