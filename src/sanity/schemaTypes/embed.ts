// Reusable embed object. Drop a Subsplash player, a Planning Center sign-up, a
// Google calendar/form, or a map into Portable Text or (Phase 4) the page
// builder. Two modes mirror the form embed: a plain iframe URL, or pasted
// markup whose <script> tags are re-created on the client so they execute.
// Rendered by EmbedBlock.astro, which mounts the shared Embed.tsx island.

import { defineType, defineField } from 'sanity';

export const embed = defineType({
  name: 'embed',
  title: 'Embed',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title (optional)',
      type: 'string',
      description: 'Shown above the embed and used as its accessible label.',
    }),
    defineField({
      name: 'mode',
      title: 'Embed type',
      type: 'string',
      options: {
        list: [
          { title: 'URL (simple iframe)', value: 'url' },
          { title: 'Pasted snippet (HTML)', value: 'html' },
        ],
        layout: 'radio',
      },
      initialValue: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'A page to show in an iframe (Google Form/Calendar, a map, a simple player).',
      hidden: ({ parent }) => parent?.mode !== 'url',
    }),
    defineField({
      name: 'html',
      title: 'Embed snippet (HTML)',
      type: 'text',
      rows: 6,
      description: 'Paste the full embed code (Subsplash, Planning Center, Jotform). Scripts run safely.',
      hidden: ({ parent }) => parent?.mode !== 'html',
    }),
    defineField({
      name: 'aspect',
      title: 'Aspect ratio (optional)',
      type: 'string',
      description: 'For URL embeds, e.g. "16/9" for video. Leave blank for a tall default.',
    }),
  ],
  preview: {
    select: { title: 'title', mode: 'mode', url: 'url' },
    prepare: ({ title, mode, url }) => ({
      title: title || 'Embed',
      subtitle: mode === 'html' ? 'Pasted snippet' : url || 'URL',
    }),
  },
});
