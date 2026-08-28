// Site-wide announcement banner, as a collection so the secretary can queue
// several notices ahead of time (Christmas services, a closure, a special
// guest) and let them switch on/off by date. The active one shows at the very
// top of every page. Replaces the single siteSettings.announcement object.
//
// "Active" = enabled AND (no start date or start has passed) AND (no end date
// or end is still in the future). BaseLayout picks the most urgent / soonest to
// end. Build-time evaluation; a scheduled rebuild refreshes the window.

import { defineType, defineField } from 'sanity';

export const announcement = defineType({
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal name',
      type: 'string',
      description: 'For your reference in the Studio (e.g. "Christmas Eve services"). Not shown on the site.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'string',
      description: 'The text shown in the banner. Example: "Join us for Christmas Eve worship at 5pm and 11pm."',
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      description: 'Info = calm green. Special = gold, for seasonal good news. Urgent = red, for closures.',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Special', value: 'special' },
          { title: 'Urgent', value: 'urgent' },
        ],
        layout: 'radio',
      },
      initialValue: 'info',
    }),
    defineField({
      name: 'link',
      title: 'Link (optional)',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'label', title: 'Link label', type: 'string' }),
        defineField({
          name: 'url',
          title: 'Link URL',
          type: 'string',
          description: 'Internal path like "/events" or a full https:// URL.',
        }),
      ],
    }),
    defineField({
      name: 'startDate',
      title: 'Show from (optional)',
      type: 'datetime',
      description: 'Leave blank to show immediately. Set to schedule the banner ahead of time.',
    }),
    defineField({
      name: 'endDate',
      title: 'Hide after (optional)',
      type: 'datetime',
      description: 'Leave blank to show until you turn it off. Set to auto-expire the banner.',
    }),
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      description: 'Master on/off. When off, this announcement never shows regardless of dates.',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'message', style: 'style', enabled: 'enabled', start: 'startDate', end: 'endDate' },
    prepare: ({ title, style, enabled, start, end }) => {
      const window = [start ? new Date(start).toLocaleDateString() : null, end ? new Date(end).toLocaleDateString() : null]
        .filter(Boolean)
        .join(' to ');
      return {
        title: title || 'Announcement',
        subtitle: `${enabled ? '' : 'OFF · '}${style ?? 'info'}${window ? ` · ${window}` : ''}`,
      };
    },
  },
  orderings: [
    { title: 'Soonest to end', name: 'endAsc', by: [{ field: 'endDate', direction: 'asc' }] },
    { title: 'Newest', name: 'createdDesc', by: [{ field: '_createdAt', direction: 'desc' }] },
  ],
});
