// Home page singleton. Content for hero and final CTA.
// removed interior-designer sections (meet founder, featured work, featured journal,
// process preview, testimonials, services grid, service-area cue) during church remodel.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { FLEXIBLE_SECTION_MEMBERS, sectionArrayOptions } from './blocks';

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  // Marketing copy is locked and structural — edit fields directly in Studio, not Canvas.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
    { name: 'seasonal', title: 'Seasonal hero' },
    { name: 'sunday', title: 'This Sunday' },
    { name: 'content', title: 'Page copy' },
    { name: 'sections', title: 'Page sections' },
    // removed interior-designer groups (meetFounder, featuredWork, featuredJournal, process, testimonials, services) during church remodel
    { name: 'final', title: 'Final CTA' },
  ],
  fields: [
    // SEO
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

    // Hero
    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero' }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'string',
      group: 'hero',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'heroSubhead', title: 'Hero subhead', type: 'text', rows: 3, group: 'hero' }),
    defineField({
      name: 'heroKeyword',
      title: 'Headline keyword (set in green)',
      type: 'string',
      group: 'hero',
      description:
        'One word from the headline to highlight in chapel green (e.g. "Jesus"). Must match a word in the headline exactly (case-sensitive). Leave blank for no highlight.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image (legacy)',
      type: 'image',
      group: 'hero',
      hidden: true,
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (R) => R.required() }),
      ],
    }),
    defineField({
      name: 'heroImages',
      title: 'Hero images',
      type: 'array',
      group: 'hero',
      description:
        'The home hero. Add one photo for a single static hero. Add two or more for a slow cross-fading slideshow with a subtle zoom. Drag to set the order they appear in.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero video (optional, plays instead of the photos)',
      type: 'file',
      group: 'hero',
      options: { accept: 'video/mp4,video/webm' },
      description:
        'Optional. Upload a short, silent video (MP4 or WebM) for the arched hero. When set, it loops quietly inside the arch INSTEAD of the photo slideshow. Keep it short and small (a few seconds, under ~10 MB) so the page stays fast. Leave empty to use the photos above.',
    }),
    defineField({
      name: 'heroVideoUrl',
      title: 'Hero video link (alternative to uploading)',
      type: 'url',
      group: 'hero',
      description:
        'Optional. Instead of uploading, paste a direct link to an MP4 or WebM file (for example one hosted on your own service). Used only when no video is uploaded above. This is not a YouTube or Vimeo link.',
    }),
    defineField({
      name: 'heroVideoPoster',
      title: 'Hero video still image (optional)',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      description: 'Optional. A still image shown while the video loads. Used only when a hero video is set.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'heroPrimaryCta', title: 'Primary CTA', type: 'ctaBlock', group: 'hero' }),
    defineField({ name: 'heroSecondaryCta', title: 'Secondary CTA', type: 'ctaBlock', group: 'hero' }),
    defineField({
      name: 'heroRotatingWords',
      title: 'Rotating first-word swap (optional)',
      type: 'array',
      group: 'hero',
      description:
        'On the first visit per session, the FIRST word of the headline cycles through this list once before locking back to the original. Leave empty (or with fewer than 2 alternates) to skip the effect. Example: ["Lived-in", "Considered", "Quiet"]. Honors prefers-reduced-motion.',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'heroScriptAccent',
      title: 'Script-font accent word (optional)',
      type: 'string',
      group: 'hero',
      description:
        'A single word from the headline to render in handwritten Pinyon Script for editorial flourish. Must match the word exactly (case-sensitive). The first occurrence wins. Leave blank to skip. Note: when "rotating words" is also set, the rotation wins and this is ignored.',
    }),

    // Seasonal hero — a dated override of the home hero for Holy Week, Christmas,
    // etc. When enabled and today falls in the window, the home page swaps the
    // default hero for this one. Build-time check; a scheduled rebuild refreshes it.
    defineField({
      name: 'seasonalHero',
      title: 'Seasonal hero override',
      type: 'object',
      group: 'seasonal',
      options: { collapsible: true, collapsed: false },
      description: 'Temporarily replace the home hero for a season (Advent, Christmas, Holy Week, Easter).',
      fields: [
        defineField({ name: 'enabled', title: 'Enable seasonal hero', type: 'boolean', initialValue: false }),
        defineField({ name: 'startDate', title: 'Show from', type: 'datetime' }),
        defineField({ name: 'endDate', title: 'Hide after', type: 'datetime' }),
        defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
        defineField({ name: 'headline', title: 'Headline', type: 'string' }),
        defineField({
          name: 'keyword',
          title: 'Headline keyword (set in green)',
          type: 'string',
          description: 'One word from the seasonal headline to highlight. Must match exactly.',
        }),
        defineField({ name: 'subhead', title: 'Subhead', type: 'text', rows: 3 }),
        defineField({
          name: 'image',
          title: 'Hero image',
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
        }),
        defineField({ name: 'primaryCtaLabel', title: 'Primary button label', type: 'string', description: 'Optional. Defaults to "Plan a Visit".' }),
        defineField({ name: 'primaryCtaUrl', title: 'Primary button link', type: 'string', description: 'Internal path like "/events" or a full URL.' }),
      ],
    }),

    // "This Sunday" — an at-a-glance card for the coming service. When enabled it
    // replaces the small "This Sunday: 11am" line under the hero and shows on /worship.
    defineField({
      name: 'thisSunday',
      title: 'This Sunday',
      type: 'object',
      group: 'sunday',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'enabled', title: 'Show "This Sunday"', type: 'boolean', initialValue: false }),
        defineField({ name: 'dateLabel', title: 'Date label', type: 'string', description: 'Example: "Sunday, June 7" or "This Sunday".' }),
        defineField({ name: 'sermonTitle', title: 'Sermon / message title', type: 'string' }),
        defineField({ name: 'scripture', title: 'Scripture', type: 'string', description: 'Example: "John 1:1-14".' }),
        defineField({ name: 'preacher', title: 'Preacher', type: 'string' }),
        defineField({ name: 'note', title: 'Note', type: 'string', description: 'Optional extra line (e.g. "Communion Sunday").' }),
      ],
    }),

    // removed interior-designer process preview, testimonials, and services grid field blocks during church remodel

    // Final CTA
    // removed interior-designer serviceAreaCue field during church remodel
    defineField({ name: 'finalCtaEyebrow', title: 'Final CTA eyebrow', type: 'string', group: 'final', initialValue: 'Ready to Begin?' }),
    defineField({ name: 'finalCtaHeadline', title: 'Final CTA headline', type: 'string', group: 'final', initialValue: 'Whoever you are, you are welcome here.' }),
    defineField({
      name: 'finalCtaScriptAccent',
      title: 'Final CTA heading script accent (optional)',
      type: 'string',
      group: 'final',
      description:
        'Optional. One word or short phrase from the headline to render in handwritten Pinyon Script. Must match the headline text exactly (case-sensitive). Leave blank to skip. Use sparingly, one accent per heading.',
    }),
    defineField({ name: 'finalCtaSubhead', title: 'Final CTA subhead', type: 'text', rows: 2, group: 'final', initialValue: "Let's start with a conversation." }),
    defineField({ name: 'finalCta', title: 'Final CTA button', type: 'ctaBlock', group: 'final' }),
    defineField({
      name: 'finalCtaBackgroundImage',
      title: 'Final CTA background image (optional)',
      type: 'image',
      group: 'final',
      options: { hotspot: true },
      description:
        'Optional. A photo behind the closing call-to-action. The site automatically darkens it so the headline and button stay readable. Leave empty to keep the solid charcoal panel.',
    }),
    // Page copy — the home page's built-in section text. Each field falls back
    // to the current wording in index.astro when left empty, so the design is
    // unchanged until an editor overrides it.
    defineField({ name: 'welcomeEyebrow', title: 'Welcome — eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'welcomeHeadline', title: 'Welcome — headline', type: 'string', group: 'content' }),
    defineField({ name: 'welcomeBodyP1', title: 'Welcome — paragraph 1', type: 'text', rows: 3, group: 'content' }),
    defineField({ name: 'welcomeBodyP2', title: 'Welcome — paragraph 2', type: 'text', rows: 3, group: 'content' }),
    defineField({
      name: 'welcomeImage',
      title: 'Welcome — photo',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      description: 'The arched photo beside the Welcome text. Leave empty to use the built-in sanctuary-interior photo.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'serviceBand',
      title: 'Service-times band',
      type: 'object',
      group: 'content',
      options: { collapsible: true, collapsed: false },
      description:
        'The green "when and where" band under the hero. Leave any field empty to use the built-in default wording. The "Where" address comes from Site Settings and is not edited here.',
      fields: [
        defineField({ name: 'worshipLabel', title: 'Worship label', type: 'string', description: 'Example: "Sunday Worship".' }),
        // worshipTime removed: the service time now derives from the single
        // canonical "Worship service time" setting (siteSettings.worshipService).
        defineField({ name: 'joinLabel', title: 'How-to-join label', type: 'string', description: 'Example: "How to join".' }),
        defineField({ name: 'joinNote', title: 'How-to-join note', type: 'text', rows: 2, description: 'Example: "In person and online. Communion the first Sunday of each month."' }),
        defineField({ name: 'whereLabel', title: 'Where label', type: 'string', description: 'Example: "Where". The address itself comes from Site Settings.' }),
      ],
    }),
    defineField({
      name: 'weeklyRhythms',
      title: 'Weekly rhythms list',
      type: 'array',
      group: 'content',
      description:
        'The short "weekly rhythms" list in the events teaser. Each row is an activity and when it happens. Drag to reorder. Leave empty to use the built-in default list.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'weeklyRhythm',
          fields: [
            defineField({ name: 'label', title: 'Activity', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'time', title: 'When', type: 'string', description: 'Example: "Sundays, 11am".', validation: (R) => R.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'time' } },
        }),
      ],
    }),
    defineField({ name: 'eventsEyebrow', title: 'Events teaser — eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'eventsHeadline', title: 'Events teaser — headline', type: 'string', group: 'content' }),
    defineField({ name: 'eventsIntro', title: 'Events teaser — intro', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'inclusiveStatement', title: 'Inclusive welcome — statement', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'inclusiveBody', title: 'Inclusive welcome — body', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'involvedEyebrow', title: 'Get involved — eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'involvedHeadline', title: 'Get involved — headline', type: 'string', group: 'content' }),
    defineField({ name: 'involvedSubhead', title: 'Get involved — subhead', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'recordEyebrow', title: 'The Record — eyebrow', type: 'string', group: 'content' }),
    defineField({ name: 'recordHeadline', title: 'The Record — headline', type: 'string', group: 'content' }),
    defineField({ name: 'recordBody', title: 'The Record — body', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'recordCtaLabel', title: 'The Record — button label', type: 'string', group: 'content' }),

    // In-body buttons made editable. Each falls back to the current literal
    // label/href in index.astro when left empty, so the page is unchanged
    // until an editor overrides it.
    defineField({ name: 'welcomeCtaPrimary', title: 'Welcome button 1', type: 'ctaBlock', group: 'content' }),
    defineField({ name: 'welcomeCtaSecondary', title: 'Welcome button 2', type: 'ctaBlock', group: 'content' }),
    defineField({ name: 'serviceBandVisitCta', title: 'Service band — Plan a Visit button', type: 'ctaBlock', group: 'content' }),
    defineField({ name: 'serviceBandWatchCta', title: 'Service band — Watch button', type: 'ctaBlock', group: 'content' }),
    defineField({ name: 'eventsCalendarCta', title: 'Events teaser — calendar button', type: 'ctaBlock', group: 'content' }),

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
  preview: { prepare: () => ({ title: 'Home Page' }) },
});
