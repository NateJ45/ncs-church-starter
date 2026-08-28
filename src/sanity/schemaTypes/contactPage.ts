// Contact page singleton. Email, social links, service area come from siteSettings.
// Form field options (project types) are wired in the Astro component, not Sanity.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { FLEXIBLE_SECTION_MEMBERS, sectionArrayOptions } from './blocks';

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  // Marketing copy is locked and structural — edit fields directly in Studio, not Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
    { name: 'form', title: 'Form intro + expectations' },
    { name: 'content', title: 'Page copy' },
    { name: 'sections', title: 'Page sections' },
    // removed empty interior-designer scheduling group during church remodel
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

    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero', initialValue: 'Contact' }),
    defineField({ name: 'heroHeadline', title: 'Hero headline', type: 'string', group: 'hero', initialValue: 'Start the Conversation.' }),
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
      name: 'formIntroNote',
      title: 'Form intro note',
      type: 'text',
      rows: 3,
      group: 'form',
      description: 'Pre-submit expectation note shown above the form.',
    }),
    defineField({
      name: 'contactForm',
      title: 'Contact form',
      type: 'reference',
      to: [{ type: 'form' }],
      group: 'form',
      description: 'The form shown on the contact page. Leave empty to show direct contact links only.',
    }),
    // removed interior-designer contact form dropdown option fields (formProjectTypeOptions, formLocationOptions, formBudgetOptions, formTimelineOptions, formSourceOptions) during church remodel
    defineField({
      name: 'whatToExpectEyebrow',
      title: '"What to expect" eyebrow',
      type: 'string',
      group: 'form',
      initialValue: 'What to Expect.',
    }),
    // removed orphaned whatToExpectHeadline + whatToExpectContent (designer-era
    // "what to expect" block; contact.astro never rendered them) during the
    // content-editability audit. whatToExpectEyebrow IS used (form-section eyebrow).
    // removed interior-designer postInquiryRoadmap field during church remodel

    // removed interior-designer scheduling fields (schedulingLink, schedulingLinkLabel, availabilityNote) during church remodel

    defineField({
      name: 'note',
      title: 'Editor note (not shown on the site)',
      type: 'text',
      rows: 3,
      description: 'Internal-only reminder for editors. Anything you write here stays in Studio and never renders on the live page.',
    }),
    defineField({ name: 'whoToReachLabel', title: 'Who to reach label', type: 'string', group: 'content' }),
    defineField({
      name: 'contactReasons',
      title: 'Who to reach rows',
      type: 'array',
      group: 'content',
      description:
        'The rows under "Who to reach". Each row has a label, the text shown on the right, and where it links. For an email, set the link to "mailto:office@example.org". For a page, use a path like "/weddings". Drag to reorder. Leave empty to use the built-in default rows.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'contactReason',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'value', title: 'Shown text', type: 'string', description: 'The text shown on the right, e.g. an email address or "See wedding details".', validation: (R) => R.required() }),
            defineField({ name: 'href', title: 'Link', type: 'string', description: 'A "mailto:" email link, an internal path like "/weddings", or a full URL.', validation: (R) => R.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        }),
      ],
    }),
    defineField({ name: 'gettingHereLabel', title: 'Getting here label', type: 'string', group: 'content' }),
    defineField({ name: 'gettingHereBody', title: 'Getting here body', type: 'text', rows: 3, group: 'content' }),
    defineField({ name: 'formSectionHeadline', title: 'Form section headline', type: 'string', group: 'content' }),
    defineField({ name: 'finalCtaEyebrow', title: 'Closing CTA eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'finalCtaHeadline', title: 'Closing CTA headline', type: 'string', group: 'content' }),
    defineField({ name: 'finalCtaSubhead', title: 'Closing CTA subhead', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'finalCta', title: 'Closing CTA button', type: 'ctaBlock', group: 'content', description: 'The button in the closing call-to-action band. Leave empty to use the built-in default button.' }),
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
  preview: { prepare: () => ({ title: 'Contact Page' }) },
});
