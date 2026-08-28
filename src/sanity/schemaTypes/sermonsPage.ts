// Sermons index page singleton. Hero copy + SEO for /sermons.

import { defineType, defineField } from 'sanity';
import { FLEXIBLE_SECTION_MEMBERS, sectionArrayOptions } from './blocks';

export const sermonsPage = defineType({
  name: 'sermonsPage',
  title: 'Sermons (index page)',
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
      name: 'livestreamUrl',
      title: 'Livestream URL',
      type: 'url',
      description: 'Where Sunday worship streams (e.g. the church YouTube). Shown as the Watch Live button.',
    }),
    // Podcast links. Optional; when set they render as small outline pills next
    // to the Watch Live button, so listeners can subscribe where they already
    // listen. Hidden entirely while empty (the church has no podcast feed yet).
    defineField({
      name: 'podcastAppleUrl',
      title: 'Apple Podcasts URL (optional)',
      type: 'url',
      description: 'Link to the sermon podcast on Apple Podcasts. Leave empty to hide the button.',
    }),
    defineField({
      name: 'podcastSpotifyUrl',
      title: 'Spotify URL (optional)',
      type: 'url',
      description: 'Link to the sermon podcast on Spotify. Leave empty to hide the button.',
    }),
    defineField({ name: 'watchLiveLabel', title: 'Watch Live button label', type: 'string', description: 'Label for the Watch Live button. The button link stays the livestream URL above. Leave empty to use the built-in default.' }),
    defineField({ name: 'watchYoutubeLabel', title: 'Watch on YouTube button label', type: 'string', description: 'Label for the Watch on YouTube button in the empty-state. Leave empty to use the built-in default.' }),
    defineField({ name: 'emptyVisitCta', title: 'Empty-state "Plan a Visit" button', type: 'ctaBlock', description: 'The Plan a Visit button shown when no sermons are loaded. Leave empty to use the built-in default button.' }),
    defineField({ name: 'latestEyebrow', title: 'Latest message label', type: 'string' }),
    defineField({ name: 'watchEyebrow', title: 'Watch online eyebrow', type: 'string' }),
    defineField({ name: 'watchHeadline', title: 'Watch online headline', type: 'string' }),
    defineField({ name: 'watchBody', title: 'Watch online body', type: 'text', rows: 3 }),
    defineField({ name: 'finalCtaEyebrow', title: 'Closing CTA eyebrow', type: 'string' }),
    defineField({ name: 'finalCtaHeadline', title: 'Closing CTA headline', type: 'string' }),
    defineField({ name: 'finalCtaSubhead', title: 'Closing CTA subhead', type: 'text', rows: 2 }),
    defineField({ name: 'finalCta', title: 'Closing CTA button', type: 'ctaBlock', description: 'The button in the closing call-to-action band. Leave empty to use the built-in default button.' }),
    defineField({ name: 'detailFinalCtaEyebrow', title: 'Sermon detail — closing CTA eyebrow', type: 'string', description: 'Shown in the closing band at the bottom of every individual sermon page. Leave empty to use the built-in default.' }),
    defineField({ name: 'detailFinalCtaHeadline', title: 'Sermon detail — closing CTA headline', type: 'string', description: 'Shown in the closing band at the bottom of every individual sermon page. Leave empty to use the built-in default.' }),
    defineField({ name: 'detailFinalCtaSubhead', title: 'Sermon detail — closing CTA subhead', type: 'text', rows: 2, description: 'Shown in the closing band at the bottom of every individual sermon page. Leave empty to use the built-in default.' }),
    defineField({ name: 'detailFinalCta', title: 'Sermon detail — closing CTA button', type: 'ctaBlock', description: 'The button in the closing band at the bottom of every individual sermon page. Leave empty to use the built-in default button.' }),
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
  preview: { prepare: () => ({ title: 'Sermons (index page)' }) },
});
