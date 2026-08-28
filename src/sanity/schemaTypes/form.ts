// Configurable contact/inquiry form. A church admin builds a form here (native
// fields submitted via Web3Forms/Formspree/email) OR pastes an external embed
// (Subsplash sign-up, Google Form, Planning Center). Referenced from pages
// (contact, weddings, use-our-space) and, in Phase 4, droppable as a page block.

import { defineType, defineField, defineArrayMember } from 'sanity';

export const form = defineType({
  name: 'form',
  title: 'Form',
  type: 'document',
  groups: [
    // No `default: true` → the form opens on the implicit "All fields" tab.
    { name: 'content', title: 'Heading + intro' },
    { name: 'fields', title: 'Fields' },
    { name: 'provider', title: 'Where submissions go' },
    { name: 'embed', title: 'External embed' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Internal name',
      type: 'string',
      description: 'For your reference in the Studio, e.g. "Wedding Inquiry". Not shown on the site.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'heading', title: 'Heading (shown above the form)', type: 'string', group: 'content' }),
    defineField({ name: 'intro', title: 'Intro text', type: 'text', rows: 3, group: 'content' }),
    defineField({
      name: 'mode',
      title: 'Form type',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Build fields here (native)', value: 'native' },
          { title: 'Paste an external embed', value: 'embed' },
        ],
        layout: 'radio',
      },
      initialValue: 'native',
      validation: (Rule) => Rule.required(),
    }),

    // ---- Native mode ----
    defineField({
      name: 'fields',
      title: 'Fields',
      type: 'array',
      group: 'fields',
      hidden: ({ parent }) => parent?.mode === 'embed',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'formField',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (R) => R.required() }),
            defineField({
              name: 'name',
              title: 'Field key',
              type: 'string',
              description: 'Sent with the submission, e.g. "email", "eventDate". Lowercase, no spaces.',
              validation: (R) => R.required().regex(/^[a-zA-Z0-9_]+$/, { name: 'letters, numbers, underscore' }),
            }),
            defineField({
              name: 'type',
              title: 'Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Short text', value: 'text' },
                  { title: 'Email', value: 'email' },
                  { title: 'Phone', value: 'tel' },
                  { title: 'Long text', value: 'textarea' },
                  { title: 'Dropdown', value: 'select' },
                  { title: 'Checkbox', value: 'checkbox' },
                  { title: 'Date', value: 'date' },
                ],
              },
              initialValue: 'text',
              validation: (R) => R.required(),
            }),
            defineField({ name: 'required', title: 'Required', type: 'boolean', initialValue: false }),
            defineField({ name: 'placeholder', title: 'Placeholder', type: 'string' }),
            defineField({ name: 'helpText', title: 'Help text', type: 'string' }),
            defineField({
              name: 'options',
              title: 'Dropdown options',
              type: 'array',
              of: [{ type: 'string' }],
              hidden: ({ parent }) => parent?.type !== 'select',
            }),
            defineField({
              name: 'width',
              title: 'Width',
              type: 'string',
              options: {
                list: [
                  { title: 'Full', value: 'full' },
                  { title: 'Half', value: 'half' },
                ],
                layout: 'radio',
              },
              initialValue: 'full',
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'type' } },
        }),
      ],
    }),
    defineField({
      name: 'submitLabel',
      title: 'Submit button label',
      type: 'string',
      group: 'fields',
      initialValue: 'Send',
      hidden: ({ parent }) => parent?.mode === 'embed',
    }),
    defineField({
      name: 'successMessage',
      title: 'Success message',
      type: 'text',
      rows: 2,
      group: 'fields',
      initialValue: 'Thank you. We will be in touch soon.',
      hidden: ({ parent }) => parent?.mode === 'embed',
    }),
    defineField({
      name: 'consentNote',
      title: 'Consent note (small print)',
      type: 'text',
      rows: 2,
      group: 'fields',
      description: 'Shown under the button. If it contains "privacy policy", that phrase links to /privacy.',
      hidden: ({ parent }) => parent?.mode === 'embed',
    }),

    // ---- Provider ----
    defineField({
      name: 'provider',
      title: 'Where submissions go',
      type: 'object',
      group: 'provider',
      hidden: ({ parent }) => parent?.mode === 'embed',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'service',
          title: 'Service',
          type: 'string',
          options: {
            list: [
              { title: 'Web3Forms (email delivery, free)', value: 'web3forms' },
              { title: 'Formspree', value: 'formspree' },
              { title: 'Open visitor email app (mailto)', value: 'email' },
            ],
          },
          initialValue: 'web3forms',
        }),
        defineField({
          name: 'accessKey',
          title: 'Access key / form ID',
          type: 'string',
          description:
            'Web3Forms: your access key from web3forms.com. Formspree: the form ID. Leave blank to fall back to the site default or the visitor email app.',
        }),
        defineField({
          name: 'notifyEmail',
          title: 'Notification email',
          type: 'string',
          description: 'Where replies should go. Used as the mailto target when Service is "Open visitor email app".',
        }),
      ],
    }),

    // ---- Embed mode ----
    defineField({
      name: 'embedUrl',
      title: 'Embed URL (simple iframe)',
      type: 'url',
      group: 'embed',
      description:
        'A page URL to show in an iframe (e.g. a Google Form). For Subsplash/Planning Center script embeds, paste the snippet below instead.',
      hidden: ({ parent }) => parent?.mode !== 'embed',
    }),
    defineField({
      name: 'embedHtml',
      title: 'Embed snippet (HTML)',
      type: 'text',
      rows: 6,
      group: 'embed',
      description: 'Paste the full embed code from Subsplash, Planning Center, Jotform, etc. Scripts are executed safely.',
      hidden: ({ parent }) => parent?.mode !== 'embed',
    }),
  ],
  preview: {
    select: { title: 'title', mode: 'mode' },
    prepare: ({ title, mode }) => ({
      title: title || 'Form',
      subtitle: mode === 'embed' ? 'External embed' : 'Native form',
    }),
  },
});
