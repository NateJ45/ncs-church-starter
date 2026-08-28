// Site-wide singleton. Header utility bar, footer, contact info, worship times,
// giving link, mission line, and an optional announcement banner.
// One instance only; singleton enforcement happens in sanity.config.ts.
//
// Remodel note: the interior-designer fields (availability status, service
// areas, travel fees, Google Business / reviews, satisfaction guarantee, and
// the module section-visibility toggles) were removed. Church fields replace them.

import { defineType, defineField, defineArrayMember } from 'sanity';
import { LinkIcon, ChevronDownIcon, ListIcon } from '@sanity/icons';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Configuration, not prose — don't surface in Canvas's AI-assisted writing UI.
  options: { canvasApp: { exclude: true } },
  groups: [
    { name: 'identity', title: 'Identity & contact' },
    { name: 'navigation', title: 'Navigation (menus)' },
    { name: 'worship', title: 'Worship times' },
    { name: 'connect', title: 'Connect & integrations' },
    { name: 'social', title: 'Social & footer' },
    { name: 'newsletter', title: 'Newsletter' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Church name',
      type: 'string',
      description: 'Used in the browser tab and search results.',
      initialValue: 'First Church of Springfield',
      group: 'identity',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short tagline shown under the wordmark in the footer.',
      group: 'identity',
      validation: (Rule) => Rule.required().max(140),
    }),
    defineField({
      name: 'mission',
      title: 'Mission line',
      type: 'text',
      rows: 2,
      description: 'One-sentence mission shown in the footer. Example: "Serving and celebrating Jesus for the good of the world."',
      group: 'identity',
    }),
    defineField({
      name: 'email',
      title: 'Public email',
      type: 'string',
      description: 'Public email address shown on the Contact page and footer.',
      group: 'identity',
      validation: (Rule) =>
        Rule.required().regex(/.+@.+\..+/, { name: 'email', invert: false }),
    }),
    defineField({
      name: 'pastorEmail',
      title: 'Pastoral care email (optional)',
      type: 'string',
      description:
        'Email for pastoral care, shown on the Contact, Pastors & Staff, and Use Our Space pages. Leave blank to use the public email above.',
      group: 'identity',
    }),
    defineField({
      name: 'phone',
      title: 'Phone (optional)',
      type: 'string',
      description: 'Public phone number. Leave blank to hide.',
      group: 'identity',
    }),
    defineField({
      name: 'officeHours',
      title: 'Office hours (optional)',
      type: 'string',
      description: 'Shown on the Contact page. Example: "Tuesday-Friday, 10am-2pm". Leave blank to hide.',
      group: 'identity',
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon (browser tab icon)',
      type: 'image',
      group: 'identity',
      description:
        'The small icon shown in the browser tab and in bookmarks. Use a simple, roughly square logo mark, at least 128 by 128 pixels (fine detail disappears at tiny sizes). Leave blank to use the built-in church mark.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'addressLine',
      title: 'Street address',
      type: 'string',
      group: 'identity',
      description:
        'Street line, e.g. "123 Main Street". Shown in the header bar, footer, contact + give pages, and the map links.',
    }),
    defineField({
      name: 'cityStateZip',
      title: 'City, state, ZIP',
      type: 'string',
      group: 'identity',
      description: 'e.g. "Springfield, IL 62701".',
    }),
    defineField({
      name: 'geoLat',
      title: 'Latitude (optional)',
      type: 'number',
      group: 'identity',
      description:
        'Decimal latitude of your building. Right-click your building in Google Maps and click the coordinates at the top of the context menu to copy them. Example: 39.7817. Leave blank to omit the geo block from structured data.',
    }),
    defineField({
      name: 'geoLng',
      title: 'Longitude (optional)',
      type: 'number',
      group: 'identity',
      description:
        'Decimal longitude of your building. Right-click your building in Google Maps and click the coordinates at the top of the context menu to copy them. Example: -89.6501. Leave blank to omit the geo block from structured data.',
    }),

    // ── Navigation (top menu) ─────────────────────────────────────────────────
    // The website header menu. When this is empty the header renders its
    // built-in default menu (see src/components/Header.astro). As soon as any
    // items are added here, this list becomes the ENTIRE menu.
    defineField({
      name: 'navItems',
      title: 'Top menu links',
      type: 'array',
      group: 'navigation',
      description:
        'The links in the website header. Drag to reorder. Add a "Link" for a single page, or a "Dropdown menu" to group several links under one label. Leave this empty to use the built-in default menu. Once you add items here, they replace the whole menu, so include every link you want.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'navLink',
          title: 'Link',
          icon: LinkIcon,
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'What visitors see, e.g. "Events".',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'Address',
              type: 'string',
              description: 'A page on this site like /worship, or a full web address like https://example.com.',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        }),
        defineArrayMember({
          type: 'object',
          name: 'navGroup',
          title: 'Dropdown menu',
          icon: ChevronDownIcon,
          fields: [
            defineField({
              name: 'label',
              title: 'Menu label',
              type: 'string',
              description: 'The dropdown heading, e.g. "About Us".',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'links',
              title: 'Menu links',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'navSubLink',
                  title: 'Link',
                  icon: LinkIcon,
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'href',
                      title: 'Address',
                      type: 'string',
                      description: 'A page on this site like /grow, or a full web address.',
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'href' } },
                }),
              ],
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
          preview: {
            select: { title: 'label', links: 'links' },
            prepare: ({ title, links }) => ({
              title: title ?? '(no label)',
              subtitle: `Dropdown · ${Array.isArray(links) ? links.length : 0} link(s)`,
            }),
          },
        }),
      ],
    }),

    // Footer link columns. When empty the footer renders its built-in columns
    // (see src/components/Footer.astro). The "Get in touch" column (email, phone,
    // social) is always shown automatically and is not configured here.
    defineField({
      name: 'footerColumns',
      title: 'Footer link columns',
      type: 'array',
      group: 'navigation',
      description:
        'The titled link columns in the footer, for example "Visit", "Get Involved", "Connect". Drag to reorder. Leave empty to use the built-in default columns. The "Get in touch" column (email, phone, social) always shows automatically. Aim for three columns so the footer grid stays balanced.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerColumn',
          title: 'Column',
          icon: ListIcon,
          fields: [
            defineField({
              name: 'title',
              title: 'Column heading',
              type: 'string',
              description: 'The small heading above the links, e.g. "Visit".',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'footerLink',
                  title: 'Link',
                  icon: LinkIcon,
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'href',
                      title: 'Address',
                      type: 'string',
                      description: 'A page on this site like /give, or a full web address.',
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'href' } },
                }),
              ],
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
          preview: {
            select: { title: 'title', links: 'links' },
            prepare: ({ title, links }) => ({
              title: title ?? '(no heading)',
              subtitle: `Column · ${Array.isArray(links) ? links.length : 0} link(s)`,
            }),
          },
        }),
      ],
    }),

    // ── Worship times ─────────────────────────────────────────────────────────
    // SINGLE SOURCE OF TRUTH for the service time. Every structured place that
    // shows it (header bar, footer, home service band, worship "when we gather",
    // the "This Sunday" line) and the Google/JSON-LD opening hours derive from
    // these values via src/lib/serviceTime.ts. Change the time here once and it
    // updates everywhere. Prose sentences elsewhere are kept time-agnostic on
    // purpose, so the time never has to be repeated.
    defineField({
      name: 'worshipService',
      title: 'Worship service time',
      type: 'object',
      group: 'worship',
      description:
        'The one place to set your Sunday service time. It updates the header, footer, home page, worship page, and your Google listing automatically. Leave a field blank to use the built-in default.',
      options: { collapsible: false },
      fields: [
        defineField({ name: 'time', title: 'Time', type: 'string', description: 'How the time reads on the site. Example: "11am".' }),
        defineField({ name: 'day', title: 'Day', type: 'string', description: 'The day of the week, singular. Example: "Sunday". The site adds "s" or "every" where needed.' }),
        defineField({ name: 'startTime24', title: 'Start time, 24-hour (for search engines)', type: 'string', description: 'Used in the data Google reads. 24-hour clock. Example: "11:00".' }),
        defineField({ name: 'endTime24', title: 'End time, 24-hour (for search engines)', type: 'string', description: 'Used in the data Google reads. 24-hour clock. Example: "12:15".' }),
      ],
    }),

    // ── Connect & integrations ────────────────────────────────────────────────
    // Generic "URL or embed" hooks so any church can point at its own tools
    // (Vanco, Subsplash, Planning Center, Mailchimp) without code. Each is
    // optional and only surfaces in the UI when set.
    defineField({
      name: 'watchUrl',
      title: 'Livestream / Watch URL',
      type: 'url',
      description: 'Where "Watch Live" points (YouTube channel or livestream). Leave blank to use the Sermons page.',
      group: 'connect',
    }),
    defineField({
      name: 'giveUrl',
      title: 'Giving link',
      type: 'url',
      description: 'Online giving portal (e.g. Vanco, Subsplash Giving). Leave blank to use the Give page.',
      group: 'connect',
    }),
    defineField({
      name: 'appUrl',
      title: 'Church app link',
      type: 'url',
      description: 'Link to your church app (e.g. Subsplash). Surfaces in the footer when set.',
      group: 'connect',
    }),
    defineField({
      name: 'directoryUrl',
      title: 'Member directory link',
      type: 'url',
      description: 'Link to an online member directory (e.g. Planning Center, Instant Church Directory). Leave blank to hide.',
      group: 'connect',
    }),
    defineField({
      name: 'registrationBaseUrl',
      title: 'Registration / sign-up base link',
      type: 'url',
      description: 'Default place to register for events when an event has no link of its own (e.g. a Planning Center or Eventbrite organizer page).',
      group: 'connect',
    }),
    defineField({
      name: 'prayerUrl',
      title: 'Prayer / connection card link',
      type: 'url',
      description: 'Link to a prayer-request or connection-card form. Surfaces as a footer link when set.',
      group: 'connect',
    }),

    // ── Social & footer ───────────────────────────────────────────────────────
    defineField({ name: 'socialInstagram', title: 'Instagram URL', type: 'url', group: 'social' }),
    defineField({ name: 'socialFacebook', title: 'Facebook URL', type: 'url', group: 'social' }),
    defineField({ name: 'socialYoutube', title: 'YouTube URL', type: 'url', group: 'social' }),
    defineField({
      name: 'seoImage',
      title: 'Default social share image',
      type: 'image',
      description: 'The image shown when any page is shared on social media (the Open Graph image). Use a wide image, about 1200 by 630 pixels. Individual pages can override this. Leave blank to use the auto-generated branded cards.',
      options: { hotspot: true },
      group: 'social',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'footerCredit',
      title: 'Footer credit',
      type: 'string',
      description: 'Optional credit line in the footer (e.g., "Site by Nixon Creative Studio").',
      group: 'social',
    }),
    defineField({
      name: 'footerCreditUrl',
      title: 'Footer credit URL',
      type: 'url',
      description: 'Optional. When set, the footer credit becomes a link to this URL (opens in a new tab).',
      group: 'social',
    }),

    // ── Newsletter ──────────────────────────────────────────────────────────
    defineField({
      name: 'newsletter',
      title: 'Newsletter signup',
      type: 'object',
      group: 'newsletter',
      description:
        'Connect an email provider (MailerLite, Buttondown, Mailchimp). Paste the embedded-form action URL and list ID; the secret key goes in env as NEWSLETTER_API_KEY.',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enable newsletter signup',
          type: 'boolean',
          description: 'When off, the newsletter block does not render anywhere on the site.',
          initialValue: false,
        }),
        defineField({ name: 'providerLabel', title: 'Provider label', type: 'string', description: 'Internal label only. Example: "MailerLite". Not shown to visitors.' }),
        defineField({ name: 'formActionUrl', title: 'Form action URL', type: 'url', description: "The embedded-form POST endpoint from your email provider's dashboard." }),
        defineField({ name: 'audienceId', title: 'Audience / list ID', type: 'string', description: 'Your provider list or audience ID.' }),
        defineField({ name: 'heading', title: 'Heading', type: 'string', description: 'Headline above the signup form. Example: "Get our newsletter in your inbox."' }),
        defineField({ name: 'blurb', title: 'Blurb', type: 'text', rows: 3, description: 'One or two sentences under the heading explaining what subscribers get.' }),
        defineField({ name: 'buttonLabel', title: 'Button label', type: 'string', initialValue: 'Subscribe' }),
        defineField({ name: 'successMessage', title: 'Success message', type: 'text', rows: 2, description: 'Message shown after a successful signup.' }),
        defineField({ name: 'consentNote', title: 'Consent note', type: 'text', rows: 2, description: 'Small-print consent line near the submit button. Link to /privacy included automatically.' }),
      ],
    }),

    // Note: the announcement banner moved from a single object here to its own
    // "Announcement" collection (so the secretary can queue several by date).
    // The old siteSettings.announcement field is cleared by
    // scripts/cleanup-orphaned-fields.mjs.
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
