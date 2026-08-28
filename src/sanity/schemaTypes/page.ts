// Generic page. Lets the secretary build a brand-new page (a stewardship
// campaign, a new ministry, an info page) with the shared block library and
// publish it at /<slug> with no developer. Existing fixed pages keep their own
// singletons; this is for one-off additions.

import { defineType, defineField } from 'sanity';
import { FLEXIBLE_SECTION_MEMBERS, sectionArrayOptions } from './blocks';
import { PUBLISH_AT_GROUP, publishAtField } from './_publishAt';

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  groups: [
    // No `default: true` → the form opens on the implicit "All fields" tab.
    { name: 'hero', title: 'Hero' },
    { name: 'content', title: 'Sections' },
    { name: 'seo', title: 'SEO' },
    PUBLISH_AT_GROUP,
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Page title',
      type: 'string',
      group: 'hero',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'hero',
      description: 'The page address, e.g. "stewardship" makes /stewardship.',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero' }),
    defineField({ name: 'heroHeadline', title: 'Hero headline', type: 'string', group: 'hero' }),
    defineField({
      name: 'heroSubhead',
      title: 'Hero subhead',
      type: 'text',
      rows: 3,
      group: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero background image',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'content',
      description: 'Build the page from blocks. Add, remove, and drag to reorder.',
      of: FLEXIBLE_SECTION_MEMBERS,
      // PORTS.md card 17: the grouped, searchable insert menu shared by every
      // sections array, so the in-canvas + control in the Studio preview opens
      // plain-language groups instead of one flat list of type names.
      options: sectionArrayOptions,
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      group: 'seo',
      validation: (Rule) =>
        Rule.max(60).warning('Titles longer than ~60 characters get cut off in Google.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (Rule) =>
        Rule.max(160).warning('Descriptions longer than ~160 characters get cut off in Google.'),
    }),
    defineField({
      name: 'seoImage',
      title: 'Social share image',
      type: 'image',
      group: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),

    // Free-tier scheduled publishing; see ./_publishAt.ts.
    publishAtField(),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare: ({ title, slug }) => ({
      title: title || 'Page',
      subtitle: slug ? `/${slug}` : 'no slug yet',
    }),
  },
});
