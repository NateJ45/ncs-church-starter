// Worship resources: bulletins, orders of worship, liturgy, hymn lists, the
// newsletter (The Record), annual reports. The secretary uploads a PDF (or
// links an external file) each week; the worship page lists the most recent.
// Content-driven so no developer is needed to post a Sunday bulletin.

import { defineType, defineField } from 'sanity';

export const worshipResource = defineType({
  name: 'worshipResource',
  title: 'Worship resource',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Example: "Bulletin — Sunday, June 7" or "The Record — June 2026".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description: 'Used to sort newest first.',
      options: { dateFormat: 'YYYY-MM-DD' },
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Bulletin', value: 'Bulletin' },
          { title: 'Order of Worship', value: 'Order of Worship' },
          { title: 'Liturgy', value: 'Liturgy' },
          { title: 'Hymn list', value: 'Hymn list' },
          { title: 'Newsletter (The Record)', value: 'Newsletter' },
          { title: 'Annual report', value: 'Annual report' },
          { title: 'Other', value: 'Other' },
        ],
      },
      initialValue: 'Bulletin',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'file',
      title: 'File (PDF)',
      type: 'file',
      description: 'Upload the PDF here, OR leave blank and paste an external link below.',
      options: { accept: '.pdf,application/pdf' },
    }),
    defineField({
      name: 'externalUrl',
      title: 'External link',
      type: 'url',
      description: 'Use instead of an upload when the document lives elsewhere (Google Drive, Dropbox).',
    }),
    defineField({
      name: 'description',
      title: 'Description (optional)',
      type: 'text',
      rows: 2,
      description: 'A short note shown under the title.',
    }),
  ],
  preview: {
    select: { title: 'title', type: 'type', date: 'date' },
    prepare: ({ title, type, date }) => ({
      title: title || 'Worship resource',
      subtitle: [type, date ? new Date(date).toLocaleDateString() : null].filter(Boolean).join(' · '),
    }),
  },
  orderings: [
    { title: 'Newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
    { title: 'Type', name: 'type', by: [{ field: 'type', direction: 'asc' }, { field: 'date', direction: 'desc' }] },
  ],
});
