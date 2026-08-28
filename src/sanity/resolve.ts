// Foundation, edit with care
// =============================================================================
// Presentation Tool location resolver
// (ported from ncs-astro-sanity-starter 2026-08-28; PORTS.md card 10)
// =============================================================================
// Two halves:
//
//  - `mainDocuments` (URL -> document): as you click through the preview iframe
//    like a normal website, Presentation opens the matching document in the
//    editor panel automatically. Routes match the iframe pathname (which lives
//    under /preview). Order matters: the singleton routes come before the
//    catch-all `page` route.
//
//  - `locations` (document -> URL): the reverse, so opening a document from the
//    desk points the preview at the right page. Singletons map to their fixed
//    preview path; `page` docs resolve from the slug. Collection docs
//    (staffMember, ministry, faqItem, event, sermon, ...) have no dedicated
//    draft-preview route, so they land on the page they appear on.
//
// The preview routes themselves live in the site app: src/pages/preview/.
// SINGLETON_PREVIEW_PATHS is the SAME map as SINGLETON_BY_PATH in
// src/pages/preview/[...slug].astro, and as FIRST_SEGMENT_PREVIEWABLE in
// src/layouts/PreviewLayout.astro's click interceptor. Three places, one truth:
// change one and change all three. The third is the one that degrades silently,
// because a missed entry there does not error, it just lets a click escape to
// the live site.
// =============================================================================
import {
  defineDocuments,
  defineLocations,
  type PresentationPluginOptions,
} from 'sanity/presentation';

/** Preview path per singleton type. Mirrors pathForDoc() in ./urls.ts. */
export const SINGLETON_PREVIEW_PATHS: Record<string, string> = {
  homePage: '/preview',
  worshipPage: '/preview/worship',
  aboutPage: '/preview/about',
  beliefsPage: '/preview/what-we-believe',
  musicPage: '/preview/music',
  staffPage: '/preview/pastor-staff',
  growPage: '/preview/grow',
  servePage: '/preview/serve',
  kidsPage: '/preview/kids',
  foodPage: '/preview/food',
  eventsPage: '/preview/events',
  sermonsPage: '/preview/sermons',
  useOurSpacePage: '/preview/use-our-space',
  weddingsPage: '/preview/weddings',
  givePage: '/preview/give',
  faqPage: '/preview/faq',
  contactPage: '/preview/contact',
  privacyPage: '/preview/privacy',
  notFoundPage: '/preview/404',
};

const previewHref = (slug?: string) => (slug === 'home' ? '/preview' : `/preview/${slug}`);

// One static location entry per singleton.
const singletonLocations = Object.fromEntries(
  Object.entries(SINGLETON_PREVIEW_PATHS).map(([type, href]) => [
    type,
    { locations: [{ title: 'Preview', href }] },
  ]),
);

export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    { route: '/preview', filter: '_type == "homePage"' },
    // Singleton routes before the generic :slug catch-all.
    ...Object.entries(SINGLETON_PREVIEW_PATHS)
      .filter(([type]) => type !== 'homePage')
      .map(([type, href]) => ({ route: href, filter: `_type == "${type}"` })),
    { route: '/preview/:slug', filter: '_type == "page" && slug.current == $slug' },
  ]),
  locations: {
    ...singletonLocations,
    page: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => {
        const slug = doc?.slug;
        if (!slug) return { locations: [], message: 'Give this page a slug to preview it.' };
        return { locations: [{ title: doc?.title ?? slug, href: previewHref(slug) }] };
      },
    }),
    // Collection docs have no draft-preview route of their own. Send each to
    // the page it renders on, with a note when a detail page exists live.
    event: {
      locations: [{ title: 'Events', href: '/preview/events' }],
      message: 'Event detail pages preview on the live site after publish.',
    },
    sermon: {
      locations: [{ title: 'Sermons', href: '/preview/sermons' }],
      message: 'Sermon detail pages preview on the live site after publish.',
    },
    staffMember: { locations: [{ title: 'Pastors & Staff', href: '/preview/pastor-staff' }] },
    ministry: { locations: [{ title: 'Grow', href: '/preview/grow' }] },
    faqItem: { locations: [{ title: 'FAQ', href: '/preview/faq' }] },
    faqCategory: { locations: [{ title: 'FAQ', href: '/preview/faq' }] },
    worshipResource: { locations: [{ title: 'Music', href: '/preview/music' }] },
    announcement: { locations: [{ title: 'Home', href: '/preview' }] },
    form: { locations: [{ title: 'Contact', href: '/preview/contact' }] },
    siteSettings: { locations: [{ title: 'Home', href: '/preview' }] },
  },
};
