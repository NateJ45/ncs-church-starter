// FAQ page singleton. Questions auto-populate from faqItem collection,
// grouped by category in the order specified by categoryOrder.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { FLEXIBLE_SECTION_MEMBERS, sectionArrayOptions } from './blocks';

export const faqPage = defineType({
  name: 'faqPage',
  title: 'FAQ Page',
  type: 'document',
  // Marketing copy is locked and structural — edit fields directly in Studio, not Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
    { name: 'list', title: 'Category order' },
    { name: 'sections', title: 'Page sections' },
    { name: 'final', title: 'Final CTA' },
  ],
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      description: 'Browser tab and Google result title. Aim for 50 to 60 characters. Front-load the location or service.',
      validation: (Rule) => Rule.max(60).warning('Titles longer than about 60 characters get cut off in Google search results.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'The sentence under the title in Google results. Aim for 150 to 160 characters. Write it for a person, not a search engine.',
      validation: (Rule) => Rule.max(160).warning('Descriptions longer than about 160 characters get cut off in Google search results.'),
    }),
    defineField({
      name: 'seoImage',
      title: 'Social share image (this page)',
      type: 'image',
      group: 'seo',
      description: 'Optional. The image shown when this page is shared on social media or in a text. Overrides the site default in Site Settings. Use a wide image, about 1200 by 630 pixels. Leave blank to use the site default.',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
    }),

    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero', initialValue: 'Common Questions.' }),
    defineField({ name: 'heroHeadline', title: 'Hero headline', type: 'string', group: 'hero', initialValue: 'Everything You Want to Know.' }),
    defineField({ name: 'heroSubhead', title: 'Hero subhead', type: 'text', rows: 2, group: 'hero' }),
    defineField({
      name: 'heroKeyword',
      title: 'Hero keyword (gold emphasis)',
      type: 'string',
      group: 'hero',
      description:
        'One word or short phrase from the headline to set in liturgical gold. It must match the headline exactly, including capitals. Leave empty for a single-color headline.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero background image',
      type: 'image',
      group: 'hero',
      description: 'Full-bleed photo behind the hero text. Pick a landscape shot; the page applies a dark gradient over the bottom for readability.',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() }),
      ],
    }),
    defineField({
      name: 'heroScriptAccent',
      title: 'Script-font accent word (optional)',
      type: 'string',
      group: 'hero',
      description:
        'A single word from the headline to render in handwritten Pinyon Script. Must match exactly (case-sensitive). Leave blank to skip.',
    }),

    defineField({
      name: 'categoryOrder',
      title: 'Category order',
      type: 'array',
      group: 'list',
      description: 'Drag to reorder. Must match the option values on faqItem.category.',
      of: [defineArrayMember({ type: 'string' })],
      initialValue: ['Visiting', 'Worship', 'Kids & Family', 'Getting Involved', 'Giving', 'Weddings & Space', 'Food Ministry'],
    }),

    defineField({ name: 'finalCtaEyebrow', title: 'Final CTA eyebrow', type: 'string', group: 'final', initialValue: 'Not Finding Your Answer?' }),
    defineField({ name: 'finalCtaHeadline', title: 'Final CTA headline', type: 'string', group: 'final', initialValue: 'Just ask.' }),
    defineField({
      name: 'finalCtaScriptAccent',
      title: 'Final CTA heading script accent (optional)',
      type: 'string',
      group: 'final',
      description:
        'Optional. One word or short phrase from the headline to render in handwritten Pinyon Script. Must match the headline text exactly (case-sensitive). Leave blank to skip. Use sparingly, one accent per heading.',
    }),
    defineField({ name: 'finalCtaSubhead', title: 'Final CTA subhead', type: 'text', rows: 2, group: 'final' }),
    defineField({ name: 'finalCta', title: 'Final CTA button (primary)', type: 'ctaBlock', group: 'final' }),
    defineField({
      name: 'finalCtaBackgroundImage',
      title: 'Final CTA background image (optional)',
      type: 'image',
      group: 'final',
      options: { hotspot: true },
      description:
        'Optional. A photo behind the closing call-to-action. The site automatically darkens it so the headline and button stay readable. Leave empty to keep the solid charcoal panel.',
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary CTA (optional)',
      type: 'ctaBlock',
      group: 'final',
      description: 'Optional second button next to the primary CTA. Use for "plan a visit" / "explore ministries" style secondary actions.',
    }),

    defineField({
      name: 'note',
      title: 'Editor note (not shown on the site)',
      type: 'text',
      rows: 3,
      description: 'Internal-only reminder for editors. Anything you write here stays in Studio and never renders on the live page.',
    }),
    defineField({
      name: 'flexibleSections',
      title: 'Page sections',
      type: 'array',
      group: 'sections',
      description: 'Add on-brand sections to this page (text, image + text, cards, quote, CTA band, form, embed). They render below the built-in content. Drag to reorder.',
      of: FLEXIBLE_SECTION_MEMBERS,
      // PORTS.md card 17: the grouped, searchable insert menu shared by every
      // sections array, so the in-canvas + control in the Studio preview opens
      // plain-language groups instead of one flat list of type names.
      options: sectionArrayOptions,
    }),
  ],
  preview: { prepare: () => ({ title: 'FAQ Page' }) },
});
