// =============================================================================
// pageBuilderConfig - what this repo's pages are shaped like
// =============================================================================
// Three canonical Studio files need to know where a page keeps its sections and
// which addresses the site code owns: the "Check this page" action, the "Save a
// section as preset" action, and the "Add to a page" action on a saved section.
// Those files are byte-identical across every repo in the family, so the
// repo-specific answers arrive from HERE, at a path every repo shares.
//
// NOT canonical on purpose. Editing this file is how a fork adapts the feature;
// editing the canonical files is drift.
// =============================================================================

import type { PageCheckConfig } from '../lib/page-checks';

/**
 * Every document type that carries a page-builder array, and the field a new
 * section is appended to. The "Save a section as preset" action is offered on
 * these types, and "Add to a page" lists them.
 *
 * The generic `page` type builds its whole body from `sections`; every page
 * singleton keeps its own hero and body and carries `flexibleSections` as an
 * append zone underneath. The church singletons come from the factory in
 * schemaTypes/churchPages.ts, so a new one is added to this list too.
 */
export const SECTION_HOST_TYPES: Readonly<Record<string, string>> = {
  page: 'sections',
  homePage: 'flexibleSections',
  aboutPage: 'flexibleSections',
  contactPage: 'flexibleSections',
  faqPage: 'flexibleSections',
  privacyPage: 'flexibleSections',
  eventsPage: 'flexibleSections',
  sermonsPage: 'flexibleSections',
  worshipPage: 'flexibleSections',
  beliefsPage: 'flexibleSections',
  musicPage: 'flexibleSections',
  staffPage: 'flexibleSections',
  growPage: 'flexibleSections',
  servePage: 'flexibleSections',
  kidsPage: 'flexibleSections',
  foodPage: 'flexibleSections',
  useOurSpacePage: 'flexibleSections',
  weddingsPage: 'flexibleSections',
  givePage: 'flexibleSections',
};

/** The same list as a set, for the document-actions resolver. */
export const PAGE_BUILDER_TYPES = new Set<string>(Object.keys(SECTION_HOST_TYPES));

/**
 * Blocks that fill THEMSELVES from a collection or from a Form document. An
 * auto list with no heading is not an empty section: its words are the events
 * or the sermons it names.
 *
 * Keep roughly in step with src/sanity/schemaTypes/blocks.ts. A name that
 * drifts off the list only costs a false "worth a look", never a wrong page.
 */
const SELF_FILLING_SECTIONS = ['sectionDynamicList', 'sectionFaqList', 'sectionForm'];

export const PAGE_CHECK_CONFIG: PageCheckConfig = {
  // The generic page's body, then the singletons' append zone. A document that
  // has only one of them contributes the one.
  sectionArrays: ['sections', 'flexibleSections'],
  // Both page shapes keep the hero as loose fields on the document rather than
  // a nested object, so the header unit is built from the field names. It is
  // not checked for emptiness: a page whose hero is one photo over the
  // built-in copy is a normal page here.
  header: {
    label: 'Hero (top banner)',
    fields: ['heroEyebrow', 'heroHeadline', 'heroSubhead', 'heroImage'],
  },
  selfFillingSections: SELF_FILLING_SECTIONS,
  // Every built-in route (see src/pages/), plus the folders the build writes
  // into. A link to /events/harvest-supper is fine even though no `page`
  // document owns it: the route is built from the Events collection.
  codeOwnedPaths: [
    '404',
    '_astro',
    'about',
    'api',
    'contact',
    'events',
    'faq',
    'food',
    'give',
    'grow',
    'kids',
    'music',
    'og',
    'pastor-staff',
    'preview',
    'privacy',
    'robots.txt',
    'sermons',
    'serve',
    'sitemap-index.xml',
    'studio',
    'use-our-space',
    'weddings',
    'what-we-believe',
    'worship',
  ],
};
