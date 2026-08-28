// Reusable object type: a CTA button + link.
// Embedded by page singletons wherever a primary/secondary CTA appears.
//
// Internal link targets: every document type listed in `internalLink.to[]`
// must have a corresponding entry in CtaLink.astro's TYPE_TO_PATH table, or
// the link will fall back to the fallbackHref. Keep the two in sync.

import { defineType, defineField } from 'sanity';

export const ctaBlock = defineType({
  name: 'ctaBlock',
  title: 'CTA Block',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Button text',
      type: 'string',
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: 'linkType',
      title: 'Link type',
      type: 'string',
      options: {
        list: [
          { title: 'Internal page', value: 'internal' },
          { title: 'External URL', value: 'external' },
          { title: 'Email', value: 'email' },
          { title: 'Phone', value: 'phone' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'internalLink',
      title: 'Page to link to',
      type: 'reference',
      to: [
        // Core singletons (always present)
        { type: 'homePage' },
        { type: 'aboutPage' },
        { type: 'faqPage' },
        { type: 'contactPage' },
        { type: 'eventsPage' },
        { type: 'sermonsPage' },
        // Church page singletons — each resolves to a fixed route in CtaLink.astro.
        { type: 'worshipPage' },
        { type: 'beliefsPage' },
        { type: 'musicPage' },
        { type: 'staffPage' },
        { type: 'growPage' },
        { type: 'servePage' },
        { type: 'kidsPage' },
        { type: 'foodPage' },
        { type: 'useOurSpacePage' },
        { type: 'weddingsPage' },
        { type: 'givePage' },
        // Generic pages created by the editor (slug-based route /[slug]).
        { type: 'page' },
      ],
      hidden: ({ parent }) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'externalUrl',
      title: 'Link (full URL or site path)',
      type: 'url',
      description:
        'A full URL like https://example.com, or an internal site path starting with "/" (e.g. /worship, /events). Paths stay in the same tab; full URLs open in a new tab.',
      // allowRelative lets this double as an internal-link field (paths like
      // "/worship"). CtaLink.astro is built to accept relative external hrefs;
      // the default url type would reject them as "Not a valid URL".
      validation: (Rule) => Rule.uri({ allowRelative: true }),
      hidden: ({ parent }) => parent?.linkType !== 'external',
    }),
    defineField({
      name: 'emailAddress',
      title: 'Email address',
      type: 'string',
      validation: (Rule) =>
        Rule.custom((value, ctx: any) => {
          if (ctx.parent?.linkType !== 'email') return true;
          if (!value) return 'Email is required';
          return /.+@.+\..+/.test(value) ? true : 'Must be a valid email';
        }),
      hidden: ({ parent }) => parent?.linkType !== 'email',
    }),
    defineField({
      name: 'phoneNumber',
      title: 'Phone number',
      type: 'string',
      hidden: ({ parent }) => parent?.linkType !== 'phone',
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { label: 'label', linkType: 'linkType' },
    prepare: ({ label, linkType }) => ({ title: label || '(no label)', subtitle: linkType }),
  },
});
