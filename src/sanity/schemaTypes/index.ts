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
import { formQuestion } from './formQuestion';
import { homePage } from './homePage';
import { ministry } from './ministry';
import { navLink } from './navLink';
import { notFoundPage } from './notFoundPage';
import { page } from './page';
import { privacyPage } from './privacyPage';
import { redirect } from './redirect';
import { sectionPreset } from './sectionPreset';
import { sermon } from './sermon';
import { sermonsPage } from './sermonsPage';
import { siteSettings } from './siteSettings';
import { staffMember } from './staffMember';
import { worshipResource } from './worshipResource';

export const schemaTypes = [
  // Object types (embedded) first so they're defined before docs that reference them
  ctaBlock,
  embed,
  // Shared menu link (header menu, footer columns, small print, header button)
  navLink,
  // One editor-written form question (sectionForm.fields). Named formQuestion,
  // not formField: the `form` document already owns a `formField` array member.
  formQuestion,
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

  // One saved section, kept for reuse on other pages. Not content: nothing
  // about a preset reaches the live site until it is added to a page.
  sectionPreset,

  // Old address -> new address forwards, filed by hand or automatically when a
  // page's web address changes (see components/slugRedirect.tsx).
  redirect,
];
