// Pastors & staff collection. Replaces the hardcoded staff array on
// /pastor-staff so a church admin can add, edit, and reorder people without
// code. Photos pipe through the same image pipeline as the rest of the site.

import { defineType, defineField, defineArrayMember } from 'sanity';

export const staffMember = defineType({
  name: 'staffMember',
  title: 'Pastor / Staff member',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role / title',
      type: 'string',
      description: 'Example: "Pastor", "Director of Music", "Office Administrator".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Headshot',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'email',
      title: 'Email (optional)',
      type: 'string',
      description: 'Shown as a contact link on the staff page. Leave blank to hide.',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Paragraph', value: 'normal' }],
          lists: [],
          marks: { decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }] },
        }),
      ],
    }),
    defineField({
      name: 'favorites',
      title: 'A few favorites (optional)',
      type: 'array',
      description: 'Light personal details shown under the bio, e.g. a favorite hymn or passage.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'favoriteItem',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'value', title: 'Value', type: 'string', validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        }),
      ],
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first (lead pastor = 1).',
      initialValue: 10,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
  orderings: [
    { title: 'Display order', name: 'displayOrder', by: [{ field: 'displayOrder', direction: 'asc' }, { field: 'name', direction: 'asc' }] },
  ],
});
