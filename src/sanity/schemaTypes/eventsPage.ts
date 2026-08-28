// Events index page singleton. Drives the hero copy + SEO on /events.

import { defineType, defineField } from 'sanity';
import { FLEXIBLE_SECTION_MEMBERS, sectionArrayOptions } from './blocks';

export const eventsPage = defineType({
  name: 'eventsPage',
  title: 'Events (index page)',
  type: 'document',
  fields: [
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 2 }),
    defineField({
      name: 'seoImage',
      title: 'Social share image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string' }),
    defineField({ name: 'heroHeadline', title: 'Hero headline', type: 'string' }),
    defineField({ name: 'heroSubhead', title: 'Hero subhead', type: 'text', rows: 2 }),
    defineField({
      name: 'heroKeyword',
      title: 'Hero keyword (gold emphasis)',
      type: 'string',
      description:
        'One word or short phrase from the headline to set in liturgical gold. It must match the headline exactly, including capitals. Leave empty for a single-color headline.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'specialEyebrow', title: 'Special services eyebrow', type: 'string' }),
    defineField({ name: 'specialHeadline', title: 'Special services headline', type: 'string' }),
    defineField({ name: 'upcomingEyebrow', title: 'Upcoming events eyebrow', type: 'string' }),
    defineField({ name: 'upcomingHeadline', title: 'Upcoming events headline', type: 'string' }),
    defineField({ name: 'upcomingEmpty', title: 'Upcoming empty-state text', type: 'text', rows: 2 }),
    defineField({ name: 'rhythmsEyebrow', title: 'Weekly rhythms eyebrow', type: 'string' }),
    defineField({ name: 'rhythmsHeadline', title: 'Weekly rhythms headline', type: 'string' }),
    defineField({ name: 'finalCtaEyebrow', title: 'Closing CTA eyebrow', type: 'string' }),
    defineField({ name: 'finalCtaHeadline', title: 'Closing CTA headline', type: 'string' }),
    defineField({ name: 'finalCtaSubhead', title: 'Closing CTA subhead', type: 'text', rows: 2 }),
    defineField({ name: 'finalCta', title: 'Closing CTA button', type: 'ctaBlock', description: 'The button in the closing call-to-action band. Leave empty to use the built-in default button.' }),
    defineField({ name: 'detailFinalCtaEyebrow', title: 'Event detail — closing CTA eyebrow', type: 'string', description: 'Shown in the closing band at the bottom of every individual event page. Leave empty to use the built-in default.' }),
    defineField({ name: 'detailFinalCtaHeadline', title: 'Event detail — closing CTA headline', type: 'string', description: 'Shown in the closing band at the bottom of every individual event page. Leave empty to use the built-in default.' }),
    defineField({ name: 'detailFinalCtaSubhead', title: 'Event detail — closing CTA subhead', type: 'text', rows: 2, description: 'Shown in the closing band at the bottom of every individual event page. Leave empty to use the built-in default.' }),
    defineField({ name: 'detailFinalCta', title: 'Event detail — closing CTA button', type: 'ctaBlock', description: 'The button in the closing band at the bottom of every individual event page. Leave empty to use the built-in default button.' }),
    defineField({
      name: 'flexibleSections',
      title: 'Page sections',
      type: 'array',
      description: 'Add on-brand sections below the hero (text, image + text, cards, quote, CTA band, form, embed). Drag to reorder.',
      of: FLEXIBLE_SECTION_MEMBERS,
      // PORTS.md card 17: the grouped, searchable insert menu shared by every
      // sections array, so the in-canvas + control in the Studio preview opens
      // plain-language groups instead of one flat list of type names.
      options: sectionArrayOptions,
    }),
  ],
  preview: { prepare: () => ({ title: 'Events (index page)' }) },
});
