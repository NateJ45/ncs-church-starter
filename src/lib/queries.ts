// Foundation, edit with care
// GROQ queries per page + church collections. Each function returns the page
// singleton plus any auto-populated collections that page needs.
//
// Remodel note: the interior-designer queries (services, projects/portfolio,
// journal, press, business siteSettings fields, designer homePage/aboutPage
// groups) were removed. Church collections (staff, ministries) were added.
//
// Types: until `sanity typegen generate` runs, return types are `any`.
// Run `npm run typegen` after schema changes to regenerate src/lib/sanity.types.ts.

import { sanityFetch } from './sanity';

// Common Portable Text + image projection shorthand.
// IMAGE_PROJECTION / CTA_PROJECTION / SECTION_MEMBERS are EXPORTED (2026-08-28)
// so the Studio preview route (src/pages/preview/[...slug].astro) builds its
// one-off draft projection out of the SAME pieces the live pages use, instead
// of a second copy that can drift.
export const IMAGE_PROJECTION = `{
  ...,
  asset->,
  "alt": coalesce(alt, asset->altText, "")
}`;

export const CTA_PROJECTION = `{
  ...,
  internalLink->{ _type, "slug": slug.current }
}`;

// Configurable form (native fields or external embed). Dereferenced wherever a
// page references a form.
const FORM_PROJECTION = `{
  _id, title, "slug": slug.current, heading, intro, mode,
  fields[]{ label, name, type, required, placeholder, helpText, options, width },
  submitLabel, successMessage, consentNote,
  provider,
  embedUrl, embedHtml
}`;

// Page-builder block members (flexibleSections[] / page.sections[]). Resolves
// image + form references; other blocks carry their fields via the spread.
export const SECTION_MEMBERS = `{
  ...,
  background{ ..., image${IMAGE_PROJECTION} },
  _type == "sectionImageText" => { image${IMAGE_PROJECTION} },
  _type == "sectionFeatureCards" => { cards[]{ ..., image${IMAGE_PROJECTION} } },
  _type == "sectionGallery" => { images[]${IMAGE_PROJECTION} },
  _type == "sectionArchShowcase" => {
    images[]${IMAGE_PROJECTION},
    video{ asset->{ url, mimeType } },
    videoPoster${IMAGE_PROJECTION}
  },
  _type == "sectionForm" => { form->${FORM_PROJECTION} },
  _type == "sectionFaqList" => {
    // Resolve the optional categoryRef so the block component gets the title.
    "categoryFilter": coalesce(categoryRef->title, categoryString)
  }
}`;

// One menu link (schemaTypes/navLink.ts), as every menu needs it: the label,
// the hand-typed address that older items still carry, and the picked page
// DEREFERENCED down to a type + slug. src/lib/nav-href.ts turns that into an
// href. The field list is separate from the braces so it can also be spread
// into a projection that adds children (navItems' dropdown groups).
const NAV_LINK_FIELDS = `_key, _type, label, linkType, href, externalUrl,
    "slug": internalPage->slug.current,
    "docType": internalPage->_type`;
export const NAV_LINK_PROJECTION = `{ ${NAV_LINK_FIELDS} }`;

// ---- Site settings (used in BaseLayout / Header / Footer) -----------------

// Module-level memoized promise. The first call in a given build process fires
// the actual Sanity fetch; every subsequent call (BaseLayout, Header, Footer,
// JSON-LD schema, each page that needs the address) returns the same promise,
// collapsing N per-page calls into a single network request.
let _siteSettingsPromise: Promise<any> | null = null;

// Exported so the preview shell (src/layouts/PreviewLayout.astro) fetches the
// chrome through the SAME projection. It used to fetch the raw document, which
// left every dereferenced menu link null in the preview.
export const SITE_SETTINGS_PROJECTION = `{
    title,
    tagline,
    mission,
    email,
    pastorEmail,
    phone,
    officeHours,
    favicon${IMAGE_PROJECTION},
    logo${IMAGE_PROJECTION},
    addressLine,
    cityStateZip,
    geoLat,
    geoLng,
    worshipService,
    watchUrl,
    giveUrl,
    appUrl,
    directoryUrl,
    registrationBaseUrl,
    prayerUrl,
    socialInstagram,
    socialFacebook,
    socialYoutube,
    seoImage${IMAGE_PROJECTION},
    footerCredit,
    footerCreditUrl,
    newsletter,
    navItems[]{
      ${NAV_LINK_FIELDS},
      links[]${NAV_LINK_PROJECTION}
    },
    footerColumns[]{
      _key,
      title,
      links[]${NAV_LINK_PROJECTION}
    },
    legalNav[]${NAV_LINK_PROJECTION},
    headerCta{ show, label, link${NAV_LINK_PROJECTION} },
    showEmail,
    showSocials,
    showFooterSocials
  }`;

export async function getSiteSettings() {
  if (_siteSettingsPromise) return _siteSettingsPromise;
  _siteSettingsPromise = sanityFetch(
    `*[_type == "siteSettings"][0]${SITE_SETTINGS_PROJECTION}`,
    {},
    null,
  );
  return _siteSettingsPromise;
}

// ---- Announcement (site-wide banner; collection) --------------------------
// The single active announcement: enabled, started (or no start), not yet
// ended (or no end). Most urgent first, then soonest to end. "now" resolves at
// build time; a scheduled rebuild refreshes the active banner.
export async function getActiveAnnouncement() {
  const now = new Date().toISOString();
  return sanityFetch(
    `*[_type == "announcement" && enabled == true
      && (!defined(startDate) || startDate <= $now)
      && (!defined(endDate) || endDate >= $now)]
      | order(select(style == "urgent" => 0, style == "special" => 1, 2) asc, endDate asc)[0]{
        message, style, link
      }`,
    { now },
    null,
  );
}

// ---- Worship resources (bulletins, orders of worship, The Record) ---------
export async function getWorshipResources(limit = 6) {
  return sanityFetch(
    `*[_type == "worshipResource"] | order(date desc)[0...$limit]{
      _id, title, date, type, externalUrl, description,
      "fileUrl": file.asset->url
    }`,
    { limit },
    [],
  );
}

// ---- Generic per-page hero (church page singletons) -----------------------
// One helper for every per-page singleton (worshipPage, musicPage, growPage,
// etc.). Returns the hero + SEO fields, or null when Sanity is unconfigured or
// the document doesn't exist yet, so pages fall back to their inline copy +
// built-in photo. Pass the singleton's _type, e.g. getPageHero('worshipPage').
export async function getPageHero(type: string) {
  // Spread (...) so any body-copy fields added to a page singleton (via the
  // definePageSingleton factory's extra fields) flow through automatically,
  // without listing each here. Images + flexibleSections are resolved explicitly.
  return sanityFetch(
    `*[_type == $type][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    { type },
    null,
  );
}

// Dedicated spread getters for the pages that carry their own editable list
// fields (grow groups, serve ways, beliefs resources). These mirror
// getWeddingsPage: the spread (...) lets every page-copy field, including the
// new arrays, flow through without listing each one, while images +
// flexibleSections are resolved explicitly. getPageHero would also spread, but
// these named helpers keep the page-to-getter mapping obvious for maintainers.

export async function getGrowPage() {
  return sanityFetch(
    `*[_type == "growPage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

export async function getServePage() {
  return sanityFetch(
    `*[_type == "servePage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

export async function getBeliefsPage() {
  return sanityFetch(
    `*[_type == "beliefsPage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// ---- Home page ------------------------------------------------------------
// Hero + SEO only. The home sections render from inline church copy; the hero
// image (single or slideshow) is the editor-managed override.

export async function getHomePage() {
  return sanityFetch(
    `*[_type == "homePage"][0]{
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION},
    heroEyebrow,
    heroHeadline,
    heroKeyword,
    heroSubhead,
    heroImage${IMAGE_PROJECTION},
    heroImages[]${IMAGE_PROJECTION},
    heroVideo{ asset->{ url, mimeType } },
    heroVideoUrl,
    heroVideoPoster${IMAGE_PROJECTION},
    heroPrimaryCta${CTA_PROJECTION},
    heroSecondaryCta${CTA_PROJECTION},
    heroRotatingWords,
    heroScriptAccent,
    seasonalHero{
      enabled, startDate, endDate, eyebrow, headline, keyword, subhead,
      image${IMAGE_PROJECTION},
      primaryCtaLabel, primaryCtaUrl
    },
    thisSunday,
    serviceBand,
    weeklyRhythms,
    welcomeEyebrow, welcomeHeadline, welcomeBodyP1, welcomeBodyP2,
    welcomeImage${IMAGE_PROJECTION},
    eventsEyebrow, eventsHeadline, eventsIntro,
    inclusiveStatement, inclusiveBody,
    involvedEyebrow, involvedHeadline, involvedSubhead,
    recordEyebrow, recordHeadline, recordBody, recordCtaLabel,
    welcomeCtaPrimary,
    welcomeCtaSecondary,
    serviceBandVisitCta,
    serviceBandWatchCta,
    eventsCalendarCta,
    finalCtaEyebrow, finalCtaHeadline, finalCtaSubhead,
    finalCta${CTA_PROJECTION},
    finalCtaBackgroundImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// ---- About page -----------------------------------------------------------

export async function getAboutPage() {
  return sanityFetch(
    `*[_type == "aboutPage"][0]{
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION},
    heroEyebrow, heroHeadline, heroSubhead, heroKeyword,
    heroImage${IMAGE_PROJECTION},
    heroScriptAccent,
    muralCaption,
    featureImage${IMAGE_PROJECTION},
    buildingEyebrow, buildingHeadline, buildingBodyP1, buildingBodyP2,
    buildingImage${IMAGE_PROJECTION},
    buildingCta,
    whoEyebrow, whoHeadline, whoBodyP1, whoBodyP2,
    whoCtaPrimary,
    whoCtaSecondary,
    finalCtaEyebrow, finalCtaHeadline, finalCtaScriptAccent, finalCtaSubhead,
    finalCtaBackgroundImage${IMAGE_PROJECTION},
    finalCta${CTA_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// ---- FAQ page -------------------------------------------------------------

export async function getFaqPage() {
  return sanityFetch(
    `*[_type == "faqPage"][0]{
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION},
    heroEyebrow, heroHeadline, heroSubhead, heroKeyword,
    heroImage${IMAGE_PROJECTION},
    heroScriptAccent,
    categoryOrder,
    // coalesce: prefer the new categoryRef document title; fall back to the
    // legacy hardcoded string so existing items keep grouping correctly until
    // editors migrate them to the reference field.
    "faqs": *[_type == "faqItem"] | order(coalesce(categoryRef->title, category) asc, displayOrder asc){
      question, answer,
      "category": coalesce(categoryRef->title, category),
      displayOrder
    },
    finalCtaEyebrow, finalCtaHeadline, finalCtaScriptAccent, finalCtaSubhead,
    finalCtaBackgroundImage${IMAGE_PROJECTION},
    finalCta${CTA_PROJECTION},
    secondaryCta${CTA_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// ---- FAQ items (for sectionFaqList page-builder block) -------------------
// Optionally filtered by category string (coalesced from categoryRef or legacy
// field). The block component calls this at build time. Returns [] when Sanity
// is unconfigured so the graceful empty state renders.
export async function getFaqItems(opts: { category?: string; limit?: number } = {}) {
  const { category, limit } = opts;
  // If a category filter is requested, use a parameterised query; otherwise
  // fetch all items ordered by category then display order.
  if (category) {
    return sanityFetch(
      `*[_type == "faqItem" && coalesce(categoryRef->title, category) == $category]
        | order(displayOrder asc)
        [0...$limit]{
          question, answer,
          "category": coalesce(categoryRef->title, category),
          displayOrder
        }`,
      { category, limit: limit ?? 50 },
      [],
    );
  }
  return sanityFetch(
    `*[_type == "faqItem"] | order(coalesce(categoryRef->title, category) asc, displayOrder asc)
      [0...$limit]{
        question, answer,
        "category": coalesce(categoryRef->title, category),
        displayOrder
      }`,
    { limit: limit ?? 50 },
    [],
  );
}

// ---- Contact page ---------------------------------------------------------

export async function getContactPage() {
  return sanityFetch(
    `*[_type == "contactPage"][0]{
    ...,
    seoImage${IMAGE_PROJECTION},
    heroImage${IMAGE_PROJECTION},
    contactForm->${FORM_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// ---- Weddings + Use Our Space pages (hero + dereferenced inquiry form) -----

export async function getWeddingsPage() {
  return sanityFetch(
    `*[_type == "weddingsPage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    inquiryForm->${FORM_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

export async function getUseOurSpacePage() {
  return sanityFetch(
    `*[_type == "useOurSpacePage"][0]{
    ...,
    heroImage${IMAGE_PROJECTION},
    seoImage${IMAGE_PROJECTION},
    inquiryForm->${FORM_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// Standalone form fetch by slug (page-builder formRef block, ad-hoc embeds).
export async function getForm(slug: string) {
  return sanityFetch(
    `*[_type == "form" && slug.current == $slug][0]${FORM_PROJECTION}`,
    { slug },
    null,
  );
}

// ---- Generic custom pages (/[slug], page-builder blocks) ------------------
export async function getPageBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "page" && slug.current == $slug][0]{
    title, "slug": slug.current,
    heroEyebrow, heroHeadline, heroSubhead,
    heroImage${IMAGE_PROJECTION},
    seoTitle, seoDescription, seoImage${IMAGE_PROJECTION},
    sections[]${SECTION_MEMBERS}
  }`,
    { slug },
    null,
  );
}

export async function getAllPageSlugs(): Promise<string[]> {
  const list: Array<{ slug: string }> = await sanityFetch(
    `*[_type == "page" && defined(slug.current)]{ "slug": slug.current }`,
    {},
    [],
  );
  return list.map((p) => p.slug).filter(Boolean);
}

// ---- 404 page -------------------------------------------------------------

export async function getNotFoundPage() {
  return sanityFetch(
    `*[_type == "notFoundPage"][0]{
    seoTitle,
    seoDescription,
    eyebrow,
    headline,
    body,
    heroImage${IMAGE_PROJECTION},
    primaryCtaLabel, primaryCtaHref,
    secondaryCtaLabel, secondaryCtaHref,
    tertiaryCtaLabel, tertiaryCtaHref
  }`,
    {},
    null,
  );
}

// ---- Privacy page ---------------------------------------------------------

export async function getPrivacyPage() {
  return sanityFetch(
    `*[_type == "privacyPage"][0]{
    seoTitle,
    seoDescription,
    seoImage${IMAGE_PROJECTION},
    heroEyebrow, heroHeadline, heroSubhead,
    heroImage${IMAGE_PROJECTION},
    heroScriptAccent,
    lastUpdated,
    body,
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// ---- Pastors & staff collection -------------------------------------------

export async function getStaffMembers() {
  return sanityFetch(
    `*[_type == "staffMember"] | order(displayOrder asc, name asc){
    _id, name, role, email,
    photo${IMAGE_PROJECTION},
    bio,
    favorites[]{ label, value }
  }`,
    {},
    [],
  );
}

// ---- Ministries collection ------------------------------------------------

const MINISTRY_CARD = `{
  _id, title, audience, ageRange, schedule, season, summary, link,
  registrationUrl, contactName, contactEmail,
  "parentMinistry": parentMinistry->{ _id, title },
  image${IMAGE_PROJECTION}
}`;

export async function getMinistries() {
  return sanityFetch(
    `*[_type == "ministry"] | order(displayOrder asc, title asc) ${MINISTRY_CARD}`,
    {},
    [],
  );
}

// Ministries flagged to appear in the home "Get involved" next-step row.
export async function getFeaturedMinistries() {
  return sanityFetch(
    `*[_type == "ministry" && featured == true] | order(displayOrder asc, title asc) ${MINISTRY_CARD}`,
    {},
    [],
  );
}

// ---- Events module --------------------------------------------------------

// Card projection for the events list (no full description body).
const EVENT_CARD = `{
  _id, title, slug, eventType, category, audience, specialService, liturgicalSeason,
  scheduleLabel, start, end, allDay, location,
  summary, cost, registrationUrl, registrationLabel, contactName, contactEmail,
  featured, featuredOnHome,
  image${IMAGE_PROJECTION}
}`;

export async function getEventsPage() {
  return sanityFetch(
    `*[_type == "eventsPage"][0]{
    ...,
    seoImage${IMAGE_PROJECTION},
    heroImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

// Recurring rhythms (weekly worship, Bible study) — always shown, ordered by
// representative start time then title.
export async function getRecurringEvents() {
  return sanityFetch(
    `*[_type == "event" && eventType == "recurring"] | order(start asc, title asc) ${EVENT_CARD}`,
    {},
    [],
  );
}

// One-time events that haven't passed yet (end time if set, else start).
// "now" is resolved at build time; a rebuild refreshes the list.
export async function getUpcomingEvents() {
  const now = new Date().toISOString();
  return sanityFetch(
    `*[_type == "event" && eventType == "oneTime" && coalesce(end, start, "9999-12-31T00:00:00Z") >= $now]
      | order(featured desc, start asc) ${EVENT_CARD}`,
    { now },
    [],
  );
}

// Upcoming special services (Christmas Eve, Ash Wednesday, Easter): one-time
// events flagged specialService that haven't passed. Powers the home + events
// "Special services" band.
export async function getSpecialServices() {
  const now = new Date().toISOString();
  return sanityFetch(
    `*[_type == "event" && specialService == true && coalesce(end, start, "9999-12-31T00:00:00Z") >= $now]
      | order(start asc) ${EVENT_CARD}`,
    { now },
    [],
  );
}

// Events the editor pinned to the home page (upcoming only).
export async function getHomeFeaturedEvents() {
  const now = new Date().toISOString();
  return sanityFetch(
    `*[_type == "event" && featuredOnHome == true && coalesce(end, start, "9999-12-31T00:00:00Z") >= $now]
      | order(start asc) ${EVENT_CARD}`,
    { now },
    [],
  );
}

export async function getEventBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "event" && slug.current == $slug][0]{
      _id, title, slug, eventType, category, audience, specialService, liturgicalSeason,
      scheduleLabel, start, end, allDay, location,
      summary, cost, registrationUrl, registrationLabel, contactName, contactEmail,
      featured, featuredOnHome,
      image${IMAGE_PROJECTION},
      description
    }`,
    { slug },
    null,
  );
}

export async function getAllEventSlugs(): Promise<string[]> {
  const list: Array<{ slug: { current: string } }> = await sanityFetch(
    `*[_type == "event" && defined(slug.current)]{ slug }`,
    {},
    [],
  );
  return list.map((e) => e.slug?.current).filter(Boolean);
}

// ---- Sermons module -------------------------------------------------------

const SERMON_CARD = `{
  _id, title, slug, date, speaker, series, scripture, videoUrl, featured,
  image${IMAGE_PROJECTION}
}`;

export async function getSermonsPage() {
  return sanityFetch(
    `*[_type == "sermonsPage"][0]{
    ...,
    seoImage${IMAGE_PROJECTION},
    heroImage${IMAGE_PROJECTION},
    flexibleSections[]${SECTION_MEMBERS}
  }`,
    {},
    null,
  );
}

export async function getRecentSermons() {
  return sanityFetch(
    `*[_type == "sermon"] | order(featured desc, date desc) ${SERMON_CARD}`,
    {},
    [],
  );
}

export async function getSermonBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "sermon" && slug.current == $slug][0]{
      _id, title, slug, date, speaker, series, scripture, videoUrl, audioUrl, featured,
      image${IMAGE_PROJECTION},
      description,
      liturgicalDay,
      "bulletinUrl": bulletin.asset->url,
      "manuscriptUrl": manuscript.asset->url,
      hymns[]{ _key, title, number },
      serviceMusic[]{ _key, role, title, composer },
      worshipLeaders[]{ _key, role, name }
    }`,
    { slug },
    null,
  );
}

export async function getAllSermonSlugs(): Promise<string[]> {
  const list: Array<{ slug: { current: string } }> = await sanityFetch(
    `*[_type == "sermon" && defined(slug.current)]{ slug }`,
    {},
    [],
  );
  return list.map((s) => s.slug?.current).filter(Boolean);
}
