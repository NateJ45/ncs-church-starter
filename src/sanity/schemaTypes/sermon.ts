// Sermons collection. A sermon/message with video (and optional audio),
// speaker, series, and scripture, plus an optional per-service archive
// (bulletin, manuscript, hymns, music, leaders). Powers /sermons and
// /sermons/[slug].

import { defineType, defineField, defineArrayMember } from 'sanity';

export const sermon = defineType({
  name: 'sermon',
  title: 'Sermon',
  type: 'document',
  // Two tabs: the message itself, and the service-record archive. No default
  // group so the form opens on "All fields" (the project convention).
  groups: [
    { name: 'message', title: 'Message' },
    { name: 'record', title: 'Service record' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'message',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'message',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date preached',
      type: 'datetime',
      group: 'message',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'speaker', title: 'Speaker', type: 'string', group: 'message' }),
    defineField({
      name: 'series',
      title: 'Series',
      type: 'string',
      group: 'message',
      description: 'Optional. Groups sermons that belong to a teaching series.',
    }),
    defineField({
      name: 'scripture',
      title: 'Scripture',
      type: 'string',
      group: 'message',
      description: 'Primary passage, e.g. "John 1:1-14".',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      group: 'message',
      description: 'YouTube or Vimeo link. Used for the embedded player and the watch link.',
    }),
    defineField({
      name: 'audioUrl',
      title: 'Audio URL (optional)',
      type: 'url',
      group: 'message',
      description: 'Direct link to an audio file or podcast episode.',
    }),
    defineField({
      name: 'description',
      title: 'Summary / notes',
      group: 'message',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Heading', value: 'h3' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: { decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }] },
        }),
      ],
    }),
    defineField({
      name: 'image',
      title: 'Thumbnail image (optional)',
      type: 'image',
      group: 'message',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      group: 'message',
      description: 'Pin to the top of the sermons page.',
      initialValue: false,
    }),

    // ── Service record ──────────────────────────────────────────────────────
    // The per-service archive. Every field is optional; the sermon page shows
    // a "From this service" panel only when at least one of these is filled,
    // so an empty record changes nothing. Together with date/speaker/scripture
    // above, this makes each sermon a complete record of the service.
    defineField({
      name: 'liturgicalDay',
      title: 'Liturgical day (optional)',
      type: 'string',
      group: 'record',
      description: 'The day in the church year, e.g. "Third Sunday after Pentecost" or "Christmas Eve". Shown with the date.',
    }),
    defineField({
      name: 'bulletin',
      title: 'Bulletin / order of worship (PDF)',
      type: 'file',
      group: 'record',
      options: { accept: '.pdf' },
      description:
        'The printed bulletin for this service. Shows as a "Bulletin (PDF)" download on the sermon page. (Standalone bulletins not tied to a sermon can also live under Worship Resources; attaching here keeps the whole service together.)',
    }),
    defineField({
      name: 'manuscript',
      title: 'Sermon text / notes (PDF)',
      type: 'file',
      group: 'record',
      options: { accept: '.pdf' },
      description: 'The written sermon or preaching notes. Shows as a "Sermon notes (PDF)" download on the sermon page.',
    }),
    defineField({
      name: 'hymns',
      title: 'Hymns sung',
      type: 'array',
      group: 'record',
      description: 'The congregational hymns from this service, in order. Add the hymnal number if you have it.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'hymn',
          fields: [
            defineField({ name: 'title', title: 'Hymn title', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'number', title: 'Hymnal number (optional)', type: 'string', description: 'e.g. "Glory to God 401".' }),
          ],
          preview: { select: { title: 'title', subtitle: 'number' } },
        }),
      ],
    }),
    defineField({
      name: 'serviceMusic',
      title: 'Choir and organ music',
      type: 'array',
      group: 'record',
      description: 'The prelude, anthem, offertory, and postlude from this service.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'musicPiece',
          fields: [
            defineField({ name: 'role', title: 'Part of the service', type: 'string', description: 'e.g. "Prelude", "Anthem", "Offertory", "Postlude".' }),
            defineField({ name: 'title', title: 'Piece', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'composer', title: 'Composer (optional)', type: 'string' }),
          ],
          preview: { select: { title: 'title', subtitle: 'role' } },
        }),
      ],
    }),
    defineField({
      name: 'worshipLeaders',
      title: 'Serving in worship',
      type: 'array',
      group: 'record',
      description: 'Who led the service: liturgist, organist, soloists, readers. The preacher is already the Speaker field.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'worshipLeader',
          fields: [
            defineField({ name: 'role', title: 'Role', type: 'string', validation: (R) => R.required(), description: 'e.g. "Liturgist", "Organist", "Soloist".' }),
            defineField({ name: 'name', title: 'Name', type: 'string', validation: (R) => R.required() }),
          ],
          preview: { select: { title: 'name', subtitle: 'role' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', speaker: 'speaker', date: 'date', media: 'image' },
    prepare: ({ title, speaker, date, media }) => ({
      title: title ?? 'Untitled sermon',
      subtitle: [speaker, date ? new Date(date).toLocaleDateString() : null].filter(Boolean).join(' · '),
      media,
    }),
  },
  orderings: [
    { title: 'Newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
    { title: 'Series', name: 'series', by: [{ field: 'series', direction: 'asc' }, { field: 'date', direction: 'desc' }] },
  ],
});
