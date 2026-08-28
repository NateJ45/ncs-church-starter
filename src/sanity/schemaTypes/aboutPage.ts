// About page singleton.
// removed interior-designer philosophy, personal, and stats sections during church remodel.

import { defineType, defineField } from 'sanity';
import { FLEXIBLE_SECTION_MEMBERS, sectionArrayOptions } from './blocks';

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  // Marketing copy is locked and structural — edit fields directly in Studio, not Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
    { name: 'content', title: 'Page copy' },
    { name: 'sections', title: 'Page sections' },
    // removed interior-designer groups (philosophy, personal, stats) during church remodel
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

    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero', initialValue: 'About' }),
    defineField({ name: 'heroHeadline', title: 'Hero headline', type: 'string', group: 'hero', initialValue: 'A historic church with an open door' }),
    defineField({ name: 'heroSubhead', title: 'Hero subhead', type: 'text', rows: 2, group: 'hero', initialValue: "Here's who you'd be working with." }),
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

    // removed orphaned storyEyebrow/storyHeadline/storyContent (designer-era
    // "Our Story" block; about.astro renders the building + who-we-are sections
    // instead and never used these) during the content-editability audit.
    // removed interior-designer story fields (founderPhoto, founderAttribution, backgroundLine, serviceAreaMention) during church remodel

    // removed interior-designer philosophy, personal, and stats field blocks during church remodel

    defineField({ name: 'finalCtaEyebrow', title: 'Final CTA eyebrow', type: 'string', group: 'final', initialValue: 'Come and See' }),
    defineField({ name: 'finalCtaHeadline', title: 'Final CTA headline', type: 'string', group: 'final', initialValue: 'Ready to Start?' }),
    defineField({
      name: 'finalCtaScriptAccent',
      title: 'Final CTA heading script accent (optional)',
      type: 'string',
      group: 'final',
      description:
        'Optional. One word or short phrase from the headline to render in handwritten Pinyon Script. Must match the headline text exactly (case-sensitive). Leave blank to skip. Use sparingly, one accent per heading.',
    }),
    defineField({ name: 'finalCtaSubhead', title: 'Final CTA subhead', type: 'text', rows: 2, group: 'final' }),
    defineField({ name: 'finalCta', title: 'Final CTA button', type: 'ctaBlock', group: 'final' }),
    defineField({
      name: 'finalCtaBackgroundImage',
      title: 'Final CTA background image (optional)',
      type: 'image',
      group: 'final',
      options: { hotspot: true },
      description:
        'Optional. A photo behind the closing call-to-action. The site automatically darkens it so the headline and button stay readable. Leave empty to keep the solid charcoal panel.',
    }),
    // Page copy — the About body sections (feature caption, "The building",
    // "Who we are"). Each falls back to the current wording in about.astro.
    defineField({
      name: 'featureImage',
      title: 'Feature photo',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      description: 'The large arched photo near the top. Leave empty to use the built-in photo.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'muralCaption', title: 'Feature photo caption', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'buildingEyebrow', title: 'Building — eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'buildingHeadline', title: 'Building — headline', type: 'string', group: 'content' }),
    defineField({ name: 'buildingBodyP1', title: 'Building — paragraph 1', type: 'text', rows: 3, group: 'content' }),
    defineField({ name: 'buildingBodyP2', title: 'Building — paragraph 2', type: 'text', rows: 3, group: 'content' }),
    defineField({
      name: 'buildingImage',
      title: 'Building — photo',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      description: 'The arched photo beside "The building" text (the nave). Leave empty to use the built-in photo.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'whoEyebrow', title: 'Who we are — eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'whoHeadline', title: 'Who we are — headline', type: 'string', group: 'content' }),
    defineField({ name: 'whoBodyP1', title: 'Who we are — paragraph 1', type: 'text', rows: 3, group: 'content' }),
    defineField({ name: 'whoBodyP2', title: 'Who we are — paragraph 2', type: 'text', rows: 3, group: 'content' }),

    // In-body buttons made editable. Each falls back to the current literal
    // label/href in about.astro when left empty, so the page is unchanged
    // until an editor overrides it.
    defineField({ name: 'buildingCta', title: 'Building — Visit/Use the Space button', type: 'ctaBlock', group: 'content' }),
    defineField({ name: 'whoCtaPrimary', title: 'Who we are button 1', type: 'ctaBlock', group: 'content' }),
    defineField({ name: 'whoCtaSecondary', title: 'Who we are button 2', type: 'ctaBlock', group: 'content' }),

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
  preview: { prepare: () => ({ title: 'About Page' }) },
});
