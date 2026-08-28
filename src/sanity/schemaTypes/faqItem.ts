// Individual FAQ. Grouped by category on the FAQ page.
// removed interior-designer Process page inclusion flag during church remodel.

import { defineType, defineField, defineArrayMember } from 'sanity';

export const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ Item',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      description: 'The question as a visitor would ask it.',
      options: {
        canvasApp: {
          purpose:
            'The question as a visitor would actually ask it, in plain English, not jargon. Example: "What time are Sunday services?" not "What is the schedule of weekly worship gatherings?"',
        },
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      description: 'The answer in your voice. Paragraphs, lists, and bold are supported.',
      options: {
        canvasApp: {
          purpose:
            'Plain-English answer. Voice: warm, welcoming, clear. Lead with the direct answer, then expand if needed. Stop when done, do not pad. Banned: transformative, curated, elevated, tailored.',
        },
      },
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Sub-heading', value: 'h4' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href', type: 'url', title: 'URL', validation: (R: any) => R.uri({ allowRelative: true }) },
                  { name: 'openInNewTab', type: 'boolean', title: 'Open in new tab', initialValue: false },
                ],
              },
            ],
          },
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    // LEGACY: hardcoded string category. Hidden from editors but preserved so
    // existing documents keep their data (deleting the field from the schema
    // would surface a "Remove field?" prompt in Studio that destroys content).
    // Migration path: set categoryRef below and leave this untouched.
    // The FAQ page query coalesces: coalesce(categoryRef->title, category).
    defineField({
      name: 'category',
      title: 'Category (legacy)',
      type: 'string',
      hidden: true,
      readOnly: true,
      description: 'Legacy hardcoded category string. Preserved for data safety; use Category (reference) below instead.',
      options: {
        list: [
          { title: 'Visiting', value: 'Visiting' },
          { title: 'Worship', value: 'Worship' },
          { title: 'Kids & Family', value: 'Kids & Family' },
          { title: 'Getting Involved', value: 'Getting Involved' },
          { title: 'Giving', value: 'Giving' },
          { title: 'Weddings & Space', value: 'Weddings & Space' },
          { title: 'Food Ministry', value: 'Food Ministry' },
        ],
      },
    }),
    // NEW: reference to the faqCategory document. Overrides the legacy category
    // string when set. The FAQ page query uses:
    //   coalesce(categoryRef->title, category) as `category`
    // so existing items continue grouping correctly until editors migrate them.
    defineField({
      name: 'categoryRef',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'faqCategory' }],
      description: 'Which group this question belongs in. Replaces the legacy category field. Create categories under Content > FAQ Categories.',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers show first within the category.',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    // removed interior-designer alsoShowOnProcessPage field during church remodel
  ],
  preview: {
    select: { question: 'question', category: 'category', displayOrder: 'displayOrder' },
    prepare: ({ question, category, displayOrder }) => ({
      title: question ?? '(no question)',
      subtitle: `${category ?? '?'} · #${displayOrder ?? '?'}`,
    }),
  },
  orderings: [
    {
      title: 'Category, then order',
      name: 'categoryOrder',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'displayOrder', direction: 'asc' },
      ],
    },
  ],
});
