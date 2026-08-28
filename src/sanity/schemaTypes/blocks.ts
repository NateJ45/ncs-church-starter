// Shared "page builder" block library. These object types are the building
// blocks for flexibleSections[] on the generic `page` type (and, later, any page
// singleton). Each renders on-brand via a matching component in
// src/components/blocks/. Editors add/remove/reorder them with no developer.
//
// Naming: all block types are prefixed `section` so they read clearly in the
// Studio "Add item" menu and never collide with document types. The shared
// `embed` object (embed.ts) is also allowed in flexibleSections.

import { defineType, defineField, defineArrayMember } from 'sanity';

// Reusable rich-text body (paragraphs, headings, lists, links).
const richBody = {
  type: 'array' as const,
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        { title: 'Heading', value: 'h3' },
        { title: 'Subheading', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
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
              { name: 'openInNewTab', type: 'boolean', title: 'Open in new tab' },
            ],
          },
        ],
      },
    }),
  ],
};

// Shared "section background" control: a design-token tone, OR an image/video
// behind the section with a darkening overlay so text stays readable. Added to
// blocks that opt into backgrounds; rendered by SectionShell.astro.
export function bgField() {
  return defineField({
    name: 'background',
    title: 'Section background',
    type: 'object',
    options: { collapsible: true, collapsed: true },
    description: 'Optional. Set a brand color tone, or drop in a background photo/video with a dark overlay so text stays readable.',
    fields: [
      defineField({
        name: 'tone',
        title: 'Color tone',
        type: 'string',
        options: {
          list: [
            { title: 'Default (paper)', value: 'default' },
            { title: 'Warm', value: 'warm' },
            { title: 'Chapel green', value: 'chapel' },
            { title: 'Chapel deep', value: 'chapelDeep' },
          ],
          layout: 'radio',
        },
        initialValue: 'default',
      }),
      defineField({
        name: 'image',
        title: 'Background image (optional)',
        type: 'image',
        options: { hotspot: true },
        fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
        description: 'Sits behind the section under a dark overlay. Text is shown in white over it.',
      }),
      defineField({
        name: 'videoUrl',
        title: 'Background video URL (optional)',
        type: 'url',
        description: 'A direct .mp4 or .webm file URL. Plays muted, looped, behind the section. Overrides the image.',
      }),
      defineField({
        name: 'overlay',
        title: 'Overlay darkness (%)',
        type: 'number',
        initialValue: 55,
        validation: (R) => R.min(0).max(90),
        description: 'Only applies when an image or video is set. Higher = darker, for better text contrast.',
      }),
      defineField({
        name: 'padding',
        title: 'Vertical spacing',
        type: 'string',
        options: {
          list: [
            { title: 'Compact', value: 'compact' },
            { title: 'Normal', value: 'normal' },
            { title: 'Spacious', value: 'spacious' },
          ],
          layout: 'radio',
        },
        initialValue: 'normal',
      }),
    ],
  });
}

export const sectionRichText = defineType({
  name: 'sectionRichText',
  title: 'Text section',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'body', title: 'Body', ...richBody }),
    defineField({
      name: 'align',
      title: 'Alignment',
      type: 'string',
      options: { list: [{ title: 'Left', value: 'left' }, { title: 'Center', value: 'center' }], layout: 'radio' },
      initialValue: 'left',
    }),
    bgField(),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Text section' }) },
});

export const sectionImageText = defineType({
  name: 'sectionImageText',
  title: 'Image + text',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'imageSide',
      title: 'Image side',
      type: 'string',
      options: { list: [{ title: 'Left', value: 'left' }, { title: 'Right', value: 'right' }], layout: 'radio' },
      initialValue: 'right',
    }),
    defineField({ name: 'arched', title: 'Arched image (church motif)', type: 'boolean', initialValue: true }),
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'body', title: 'Body', ...richBody }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string' }),
    defineField({ name: 'ctaUrl', title: 'Button link', type: 'string', description: 'Internal path like "/give" or a full URL.' }),
    bgField(),
  ],
  preview: { select: { title: 'heading', media: 'image' }, prepare: ({ title, media }) => ({ title: title || 'Image + text', media }) },
});

export const sectionCardGrid = defineType({
  name: 'sectionCardGrid',
  title: 'Card grid',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'subhead', title: 'Subhead', type: 'text', rows: 2 }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'string',
      options: { list: ['2', '3', '4'], layout: 'radio' },
      initialValue: '3',
    }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'card',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
            defineField({ name: 'link', title: 'Link', type: 'string', description: 'Optional. Makes the card clickable.' }),
          ],
          preview: { select: { title: 'title', subtitle: 'body' } },
        }),
      ],
    }),
    bgField(),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Card grid' }) },
});

export const sectionQuote = defineType({
  name: 'sectionQuote',
  title: 'Quote / scripture',
  type: 'object',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: (R) => R.required() }),
    defineField({ name: 'attribution', title: 'Attribution', type: 'string', description: 'e.g. a person or a scripture reference.' }),
    bgField(),
  ],
  preview: { select: { title: 'quote', subtitle: 'attribution' } },
});

export const sectionCtaBand = defineType({
  name: 'sectionCtaBand',
  title: 'Call-to-action band',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'headline', title: 'Headline', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'subhead', title: 'Subhead', type: 'text', rows: 2 }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string' }),
    defineField({ name: 'ctaUrl', title: 'Button link', type: 'string', description: 'Internal path like "/worship" or a full URL.' }),
    bgField(),
  ],
  preview: { select: { title: 'headline' }, prepare: ({ title }) => ({ title: title || 'CTA band' }) },
});

// A Form section has two ways to ask a question, and it uses the simpler one
// first. Write questions in "Your own questions" and the section builds the form
// for you, always starting with the name, email, and phone boxes. Leave that
// list empty and the section behaves exactly as before: it shows the Form
// document you point it at. Shaping and caps: src/lib/custom-form-fields.ts.
export const sectionForm = defineType({
  name: 'sectionForm',
  title: 'Form',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'fields',
      title: 'Your own questions',
      type: 'array',
      description:
        'Write the questions you want to ask. The name, email, and phone boxes always come first, so you can always reply. Maximum 12 questions. Leave this empty to use a Form document instead.',
      of: [defineArrayMember({ type: 'formQuestion' })],
      validation: (R) => R.max(12),
    }),
    defineField({
      name: 'form',
      title: 'Form',
      type: 'reference',
      to: [{ type: 'form' }],
      description: 'Only needed when you have not written your own questions above.',
      hidden: ({ parent }) => Array.isArray(parent?.fields) && parent.fields.length > 0,
      // Was plainly required. Now one of the two ways must be filled in, so a
      // section built from questions alone is valid and one built the old way
      // still cannot be left empty.
      validation: (R) =>
        R.custom((value, context) => {
          const parent = context.parent as { fields?: unknown[] } | undefined;
          const questions = Array.isArray(parent?.fields) ? parent.fields.length : 0;
          if (questions > 0 || value) return true;
          return 'Pick a Form, or write your own questions above.';
        }),
    }),
  ],
  preview: {
    select: { title: 'heading', form: 'form.title', fields: 'fields' },
    prepare: ({ title, form, fields }) => {
      const count = Array.isArray(fields) ? fields.length : 0;
      return {
        title: title || form || 'Form',
        subtitle: count > 0 ? `${count} question${count === 1 ? '' : 's'}` : undefined,
      };
    },
  },
});

export const sectionFeatureCards = defineType({
  name: 'sectionFeatureCards',
  title: 'Feature cards (detailed)',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'string',
      options: { list: ['2', '3', '4'], layout: 'radio' },
      initialValue: '3',
    }),
    defineField({ name: 'arched', title: 'Arched card images (church motif)', type: 'boolean', initialValue: false }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'featureCard',
          fields: [
            defineField({
              name: 'image',
              title: 'Image (optional)',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
            }),
            defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
            defineField({ name: 'badge', title: 'Badge (optional)', type: 'string', description: 'Small tag, e.g. "New" or "Weekly".' }),
            defineField({ name: 'ctaLabel', title: 'Link label', type: 'string' }),
            defineField({ name: 'ctaUrl', title: 'Link URL', type: 'string' }),
          ],
          preview: { select: { title: 'title', subtitle: 'eyebrow', media: 'image' } },
        }),
      ],
    }),
    bgField(),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Feature cards' }) },
});

export const sectionStats = defineType({
  name: 'sectionStats',
  title: 'Stats / numbers',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'string',
      options: { list: ['2', '3', '4'], layout: 'radio' },
      initialValue: '3',
    }),
    defineField({
      name: 'items',
      title: 'Stats',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          fields: [
            defineField({ name: 'value', title: 'Value', type: 'string', description: 'e.g. "1901", "600", "9". Free text so you can write "600+".', validation: (R) => R.required() }),
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'note', title: 'Note (optional)', type: 'string' }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
    }),
    bgField(),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Stats' }) },
});

export const sectionAccordion = defineType({
  name: 'sectionAccordion',
  title: 'FAQ / accordion',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'items',
      title: 'Questions',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'qa',
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 4, validation: (R) => R.required() }),
          ],
          preview: { select: { title: 'question' } },
        }),
      ],
    }),
    bgField(),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'FAQ / accordion' }) },
});

export const sectionGallery = defineType({
  name: 'sectionGallery',
  title: 'Photo gallery',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'string',
      options: { list: ['2', '3', '4'], layout: 'radio' },
      initialValue: '3',
    }),
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
            defineField({ name: 'caption', title: 'Caption (optional)', type: 'string' }),
          ],
        }),
      ],
      options: { layout: 'grid' },
    }),
    bgField(),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Photo gallery' }) },
});

export const sectionSteps = defineType({
  name: 'sectionSteps',
  title: 'Steps (numbered)',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'title', subtitle: 'body' } },
        }),
      ],
    }),
    bgField(),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Steps' }) },
});

export const sectionLogos = defineType({
  name: 'sectionLogos',
  title: 'Logos / partners',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({ name: 'grayscale', title: 'Grayscale logos', type: 'boolean', initialValue: true, description: 'Show logos in grayscale, full color on hover.' }),
    defineField({
      name: 'items',
      title: 'Logos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Name / alt text', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'url', title: 'Link (optional)', type: 'url' }),
          ],
        }),
      ],
      options: { layout: 'grid' },
    }),
    bgField(),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Logos / partners' }) },
});

export const sectionMediaFeature = defineType({
  name: 'sectionMediaFeature',
  title: 'Media feature (video / image + text)',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
    defineField({
      name: 'mediaSide',
      title: 'Media side',
      type: 'string',
      options: { list: [{ title: 'Left', value: 'left' }, { title: 'Right', value: 'right' }], layout: 'radio' },
      initialValue: 'left',
    }),
    defineField({ name: 'videoUrl', title: 'Video URL (YouTube/Vimeo)', type: 'url', description: 'Shows an embedded player. Takes priority over the image.' }),
    defineField({
      name: 'image',
      title: 'Image (used if no video)',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'ctaLabel', title: 'Button label', type: 'string' }),
    defineField({ name: 'ctaUrl', title: 'Button link', type: 'string' }),
    bgField(),
  ],
  preview: { select: { title: 'heading', media: 'image' }, prepare: ({ title, media }) => ({ title: title || 'Media feature', media }) },
});

export const sectionDynamicList = defineType({
  name: 'sectionDynamicList',
  title: 'Dynamic list (latest content)',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'source',
      title: 'Show',
      type: 'string',
      options: {
        list: [
          { title: 'Latest sermons', value: 'latestSermons' },
          { title: 'Upcoming events', value: 'upcomingEvents' },
          { title: 'Ministries', value: 'ministries' },
          { title: 'Pastors & staff', value: 'staff' },
          { title: 'Worship resources', value: 'worshipResources' },
        ],
      },
      initialValue: 'upcomingEvents',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'count', title: 'How many', type: 'number', initialValue: 3, validation: (R) => R.min(1).max(12) }),
    bgField(),
  ],
  preview: { select: { title: 'heading', source: 'source' }, prepare: ({ title, source }) => ({ title: title || 'Dynamic list', subtitle: source }) },
});

export const sectionArchShowcase = defineType({
  name: 'sectionArchShowcase',
  title: 'Arched showcase (slideshow / video)',
  type: 'object',
  description:
    'One arched photo frame, like the home hero. It either cross-fades through several photos (a slow slideshow with a gentle zoom) or loops a short, silent video. Choose which below.',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'mediaType',
      title: 'What goes in the arched frame?',
      type: 'string',
      options: {
        list: [
          { title: 'Photo slideshow', value: 'slideshow' },
          { title: 'Looping video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'slideshow',
    }),
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      hidden: ({ parent }) => parent?.mediaType === 'video',
      description:
        'Add one photo for a single image, or two or more for a slow cross-fading slideshow with a gentle zoom. Drag to set the order.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
        }),
      ],
      options: { layout: 'grid' },
    }),
    defineField({
      name: 'video',
      title: 'Video (upload)',
      type: 'file',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      options: { accept: 'video/mp4,video/webm' },
      description:
        'Upload a short, silent MP4 or WebM. It loops quietly inside the arch. Keep it small (a few seconds, under ~10 MB) so the page stays fast.',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video link (alternative to uploading)',
      type: 'url',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      description:
        'Optional. A direct link to an MP4 or WebM file, used only when nothing is uploaded above. This is not a YouTube or Vimeo link.',
    }),
    defineField({
      name: 'videoPoster',
      title: 'Video still image (optional)',
      type: 'image',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      options: { hotspot: true },
      description: 'Optional. A still image shown while the video loads.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    bgField(),
  ],
  preview: {
    select: { title: 'heading', media: 'images.0' },
    prepare: ({ title, media }) => ({ title: title || 'Arched showcase', media }),
  },
});

export const sectionFaqList = defineType({
  name: 'sectionFaqList',
  title: 'FAQ list (from collection)',
  type: 'object',
  description:
    'Pulls FAQ items from the faqItem collection into the page. Optionally filtered to one category. Use this when you want to embed a subset of the FAQ collection (e.g. Weddings questions on the Weddings page) rather than authoring inline Q+As.',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'headline', title: 'Headline', type: 'string' }),
    defineField({ name: 'subhead', title: 'Subhead', type: 'text', rows: 2 }),
    // Category filter. A reference to an faqCategory document takes priority;
    // if only a string is provided (legacy or convenience), it is matched
    // against the coalesced category value (categoryRef->title or legacy string).
    defineField({
      name: 'categoryRef',
      title: 'Filter by category (reference)',
      type: 'reference',
      to: [{ type: 'faqCategory' }],
      description: 'Optional. Show only FAQ items in this category. Takes priority over the plain text filter below.',
    }),
    defineField({
      name: 'categoryString',
      title: 'Filter by category (plain text)',
      type: 'string',
      description: 'Optional. Used only when the reference above is not set. Match the exact category name, e.g. "Giving".',
    }),
    defineField({
      name: 'limit',
      title: 'How many to show',
      type: 'number',
      description: 'Maximum number of FAQ items to display. Leave empty to show all in the category.',
      validation: (R) => R.min(1).max(50),
    }),
    defineField({ name: 'ctaLabel', title: 'Link label (optional)', type: 'string', description: 'Shows a text link at the bottom, e.g. "See all FAQ".' }),
    defineField({ name: 'ctaUrl', title: 'Link URL (optional)', type: 'string', description: 'Internal path like "/faq" or a full URL.' }),
    bgField(),
  ],
  preview: {
    select: { title: 'headline', cat: 'categoryRef.title', catStr: 'categoryString' },
    prepare: ({ title, cat, catStr }) => ({
      title: title || 'FAQ list',
      subtitle: cat ?? catStr ?? 'All categories',
    }),
  },
});

// All block types collected for registration in index.ts.
export const sectionBlocks = [
  sectionRichText,
  sectionImageText,
  sectionCardGrid,
  sectionQuote,
  sectionCtaBand,
  sectionForm,
  sectionFeatureCards,
  sectionStats,
  sectionAccordion,
  sectionGallery,
  sectionSteps,
  sectionLogos,
  sectionMediaFeature,
  sectionDynamicList,
  sectionArchShowcase,
  sectionFaqList,
];

// The array members allowed in a flexibleSections[] field (includes the shared
// embed object). Used by the generic `page` type and any page that opts in.
export const FLEXIBLE_SECTION_MEMBERS = [
  { type: 'sectionRichText' },
  { type: 'sectionImageText' },
  { type: 'sectionFeatureCards' },
  { type: 'sectionCardGrid' },
  { type: 'sectionStats' },
  { type: 'sectionArchShowcase' },
  { type: 'sectionGallery' },
  { type: 'sectionAccordion' },
  { type: 'sectionMediaFeature' },
  { type: 'sectionSteps' },
  { type: 'sectionDynamicList' },
  { type: 'sectionLogos' },
  { type: 'sectionQuote' },
  { type: 'sectionCtaBand' },
  { type: 'sectionForm' },
  { type: 'sectionFaqList' },
  { type: 'embed' },
];

// =============================================================================
// The grouped insert menu (PORTS.md card 17, installed 2026-08-28)
// =============================================================================
// Card 17 turns each rendered section into an array item the Presentation
// overlay can outline, with insert-before/after, duplicate, remove and
// drag-to-reorder IN THE CANVAS. The insert control opens THIS menu, so without
// it an editor adding a section in the preview would face one flat, unlabelled
// list of sixteen type names.
//
// `filter: true` adds the search box. The group names are plain language on
// purpose: a church secretary picks "Words and pictures", not "sectionCardGrid".
//
// Shared by EVERY sections array in this template (the `flexibleSections`
// append zone on all the page singletons, and `sections` on the generic `page`
// type), including any curated per-page subset a fork might introduce: a group
// whose types are all absent from a given array simply does not render.
export const SECTION_INSERT_MENU = {
  filter: true,
  groups: [
    {
      name: 'basics',
      title: 'Words and pictures',
      of: ['sectionRichText', 'sectionImageText', 'sectionMediaFeature', 'sectionGallery'],
    },
    {
      name: 'lists',
      title: 'Lists and cards',
      of: [
        'sectionCardGrid',
        'sectionFeatureCards',
        'sectionSteps',
        'sectionAccordion',
        'sectionFaqList',
        'sectionDynamicList',
      ],
    },
    {
      name: 'highlight',
      title: 'Highlights',
      of: ['sectionQuote', 'sectionStats', 'sectionLogos', 'sectionArchShowcase'],
    },
    {
      name: 'action',
      title: 'Ask people to do something',
      of: ['sectionCtaBand', 'sectionForm', 'embed'],
    },
  ],
} as const;

/** The `options` block every sections array should carry. */
export const sectionArrayOptions = { insertMenu: SECTION_INSERT_MENU };
