// Studio Desk structure. Pins Site Settings at the top, then ALL page singletons
// (one document each) under "Pages", then the reusable content collections.
// Every document type is placed explicitly so nothing floats loose at the desk
// root. The trailing default-list filter is a safety net for any future type
// that hasn't been placed (and hides sanity-plugin-media's media.tag type).
//
// "Pages" is one list (so the rule for editors is simple: every page lives here).
//
// Remodel note: the interior-designer "Start Here" handbook, the Journal section,
// and the Philosophy/Testimonials lists were removed. Pastors & Staff and
// Ministries collections were added under "Content".
//
// Preview pane: singletons explicitly attach a form + preview iframe view via the
// singletonWithPreview helper. Other types pick up preview from defaultDocumentNode
// in sanity.config.ts.

import type { StructureBuilder, StructureResolverContext } from 'sanity/structure';
import GuideView from './components/GuideView';
import { guides } from './guides/content';
import {
  CogIcon,
  HomeIcon,
  UserIcon,
  UsersIcon,
  HelpCircleIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  CalendarIcon,
  PlayIcon,
  StarIcon,
  HeartIcon,
  ThListIcon,
  BookIcon,
  LockIcon,
  PresentationIcon,
  BellIcon,
  DocumentsIcon,
  ArrowRightIcon,
} from '@sanity/icons';

const SINGLETON_TYPES = [
  'siteSettings',
  // Core pages
  'homePage',
  'aboutPage',
  'faqPage',
  'contactPage',
  'eventsPage',
  'sermonsPage',
  'notFoundPage',
  'privacyPage',
  // Per-page church singletons
  'worshipPage',
  'beliefsPage',
  'musicPage',
  'staffPage',
  'growPage',
  'servePage',
  'kidsPage',
  'foodPage',
  'useOurSpacePage',
  'weddingsPage',
  'givePage',
] as const;

const HIDDEN_FROM_DEFAULT = new Set<string>([
  ...SINGLETON_TYPES,
  // Collections placed explicitly below (so they don't double-show at the root).
  'faqCategory',
  'faqItem',
  'staffMember',
  'ministry',
  'event',
  'sermon',
  'form',
  'announcement',
  'worshipResource',
  'page',
  'redirect', // placed explicitly under "Pages" -> Redirects
  // sanity-plugin-media registers this tag type; keep it out of the desk root
  // (the "Media" tool in the top sidebar is where tags belong).
  'media.tag',
]);

/**
 * A singleton desk item: one document, form view only. The static site has no
 * live draft preview, so we do NOT attach an iframe "Preview" view (it would
 * load the last published build, not the editor's draft, and mislead editors).
 */
function singleton(S: StructureBuilder, schemaType: string, title: string, icon: any) {
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(schemaType).documentId(schemaType));
}

/**
 * "How This Works" — a pinned, read-only help center built from repo data
 * (src/sanity/guides/content.tsx), rendered by GuideView. Lives in code so staff
 * can't edit or delete it and every future client site inherits it. Each guide
 * is a navigable item that opens its own component pane.
 */
function howThisWorks(S: StructureBuilder) {
  return S.listItem()
    .id('how-this-works')
    .title('How This Works')
    .icon(BookIcon)
    .child(
      S.list()
        .id('how-this-works-list')
        .title('How This Works')
        .items(
          guides.map((g) =>
            S.listItem()
              .id(`guide-${g.slug}`)
              .title(g.title)
              .icon(g.icon)
              .child(
                S.component(GuideView)
                  .id(`guide-view-${g.slug}`)
                  .title(g.title)
                  .options({ guideSlug: g.slug }),
              ),
          ),
        ),
    );
}

export const deskStructure = (S: StructureBuilder, _context: StructureResolverContext) =>
  S.list()
    .title('First Church')
    .items([
      // How This Works — pinned help center (first thing editors see).
      howThisWorks(S),

      S.divider(),

      // Site Settings — pinned singleton (no preview; not a page)
      singleton(S, 'siteSettings', 'Site Settings', CogIcon),

      S.divider(),

      // Pages — every page singleton lives here.
      S.listItem()
        .title('Pages')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              singleton(S, 'homePage', 'Home', HomeIcon),
              singleton(S, 'worshipPage', "I'm New / Worship", StarIcon),
              singleton(S, 'aboutPage', 'About', UserIcon),
              singleton(S, 'beliefsPage', 'What We Believe', BookIcon),
              singleton(S, 'musicPage', 'Music', PlayIcon),
              singleton(S, 'staffPage', 'Pastors & Staff', UsersIcon),

              S.divider(),

              singleton(S, 'growPage', 'Grow', HeartIcon),
              singleton(S, 'servePage', 'Serve', HeartIcon),
              singleton(S, 'kidsPage', 'Kids', HeartIcon),
              singleton(S, 'foodPage', 'Food Ministry', HeartIcon),

              S.divider(),

              singleton(S, 'eventsPage', 'Events (index page)', CalendarIcon),
              singleton(S, 'sermonsPage', 'Sermons (index page)', PlayIcon),

              S.divider(),

              singleton(S, 'useOurSpacePage', 'Use Our Space', PresentationIcon),
              singleton(S, 'weddingsPage', 'Weddings', StarIcon),
              singleton(S, 'givePage', 'Give', HeartIcon),

              S.divider(),

              singleton(S, 'faqPage', 'FAQ', HelpCircleIcon),
              singleton(S, 'contactPage', 'Contact', EnvelopeIcon),
              singleton(S, 'notFoundPage', '404 Page', DocumentTextIcon),
              singleton(S, 'privacyPage', 'Privacy Policy Page', LockIcon),

              S.divider(),

              // Custom pages (collection): build new pages at /<slug> with blocks.
              S.documentTypeListItem('page').title('Custom Pages').icon(DocumentTextIcon),

              S.divider(),

              // Redirects: old address -> new address. Most entries are filed
              // automatically when a page's web address changes on publish
              // (src/sanity/components/slugRedirect.tsx); the secretary adds one
              // by hand for an address that never existed on this site.
              S.documentTypeListItem('redirect')
                .title('Redirects (old links)')
                .icon(ArrowRightIcon),
            ]),
        ),

      S.divider(),

      // Content — reusable collections.
      S.listItem()
        .title('Content')
        .icon(ThListIcon)
        .child(
          S.list()
            .title('Content')
            .items([
              S.documentTypeListItem('staffMember').title('Pastors & Staff').icon(UsersIcon),
              S.documentTypeListItem('ministry').title('Ministries').icon(HeartIcon),
              S.documentTypeListItem('faqCategory').title('FAQ Categories').icon(HelpCircleIcon),
              S.documentTypeListItem('faqItem').title('FAQ Items').icon(HelpCircleIcon),
              S.documentTypeListItem('form').title('Forms').icon(EnvelopeIcon),
              S.documentTypeListItem('worshipResource')
                .title('Worship Resources')
                .icon(DocumentsIcon),
              S.documentTypeListItem('announcement').title('Announcements').icon(BellIcon),
            ]),
        ),

      S.divider(),

      // Events — recurring rhythms + one-time dated events shown on /events
      S.documentTypeListItem('event').title('Events').icon(CalendarIcon),

      // Sermons — messages shown on /sermons
      S.documentTypeListItem('sermon').title('Sermons').icon(PlayIcon),

      // Safety net: surface any document type we have NOT explicitly placed above
      // (and keep the hidden set, including media.tag, out of the desk root).
      ...S.documentTypeListItems().filter(
        (item) => !HIDDEN_FROM_DEFAULT.has(item.getId() as string),
      ),
    ]);
