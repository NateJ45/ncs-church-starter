// Registers every schema type with the Studio.
// Order doesn't affect runtime; grouped here for readability.
//
// Remodel note: the interior-designer types (service, servicesPage, testimonial,
// philosophyPoint, journal*, studio* "Start Here" helpers) were removed. The
// church collections staffMember + ministry were added.

import { aboutPage } from './aboutPage';
import { announcement } from './announcement';
import { sectionBlocks } from './blocks';
import { churchPageSingletons } from './churchPages';
import { contactPage } from './contactPage';
import { ctaBlock } from './ctaBlock';
import { embed } from './embed';
import { event } from './event';
import { eventsPage } from './eventsPage';
import { faqCategory } from './faqCategory';
import { faqItem } from './faqItem';
import { faqPage } from './faqPage';
import { form } from './form';
import { homePage } from './homePage';
import { ministry } from './ministry';
import { notFoundPage } from './notFoundPage';
import { page } from './page';
import { privacyPage } from './privacyPage';
import { sermon } from './sermon';
import { sermonsPage } from './sermonsPage';
import { siteSettings } from './siteSettings';
import { staffMember } from './staffMember';
import { worshipResource } from './worshipResource';

export const schemaTypes = [
  // Object types (embedded) first so they're defined before docs that reference them
  ctaBlock,
  embed,
  // Page-builder block library (flexibleSections members)
  ...sectionBlocks,

  // Reusable documents referenced by pages (define before the singletons that point at them)
  form,

  // Singletons
  siteSettings,
  homePage,
  aboutPage,
  faqPage,
  contactPage,
  eventsPage,
  sermonsPage,
  notFoundPage,
  privacyPage,
  // Per-page church singletons (worship, what-we-believe, music, pastors & staff,
  // grow, serve, kids, food, use-our-space, weddings, give).
  ...churchPageSingletons,

  // Reusable content collections
  faqCategory,
  faqItem,
  staffMember,
  ministry,
  event,
  sermon,
  announcement,
  worshipResource,

  // Generic page (build new pages at /<slug> with the block library)
  page,
];
