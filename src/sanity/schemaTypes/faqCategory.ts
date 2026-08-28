// faqCategory — a taxonomy document for grouping FAQ items.
// Editors can create named categories here, then reference them from faqItem
// via the `categoryRef` field (added in the same pass). The legacy faqItem
// `category` string field remains hidden + read-only so existing content is
// never broken; the coalesced query on the FAQ page merges both.

import { defineType, defineField } from 'sanity';

export const faqCategory = defineType({
  name: 'faqCategory',
  title: 'FAQ Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Category title',
      type: 'string',
      description: 'The heading shown above this group of questions on the FAQ page, e.g. "Visiting" or "Kids & Family".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (optional)',
      type: 'slug',
      description: 'Optional. An auto-generated URL fragment for future deep-link use. Not used on the FAQ page yet.',
      options: { source: 'title' },
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first when categories are listed. Leave blank to rely on the faqPage categoryOrder list instead.',
    }),
  ],
  preview: {
    select: { title: 'title', displayOrder: 'displayOrder' },
    prepare: ({ title, displayOrder }) => ({
      title: title ?? '(no title)',
      subtitle: displayOrder != null ? `Order: ${displayOrder}` : '',
    }),
  },
  orderings: [
    {
      title: 'Display order',
      name: 'displayOrderAsc',
      by: [{ field: 'displayOrder', direction: 'asc' }, { field: 'title', direction: 'asc' }],
    },
  ],
});
