// Content for the in-Studio "How This Works" help guides. Plain data, no JSX, so
// the copy is easy to edit. The renderer is ../components/GuideView.tsx and the
// nav wiring is in ../structure.ts. See the design doc:
// docs/superpowers/specs/2026-06-01-studio-how-this-works-design.md
//
// Editing tips:
//   - Use **double asterisks** for bold inside any text, step, or bullet.
//   - No em-dashes (house style). Define jargon in plain words.
//   - Church-specific values (contact, worship time) live in CHURCH below, so a
//     new client site only edits one place.

import type { ComponentType } from 'react';
import {
  RocketIcon,
  CalendarIcon,
  StarIcon,
  BellIcon,
  HelpCircleIcon,
  PlayIcon,
  EditIcon,
  AddDocumentIcon,
  BlockElementIcon,
  ImageIcon,
  ColorWheelIcon,
  InfoOutlineIcon,
  MenuIcon,
} from '@sanity/icons';

// The only church-specific copy. Swap these when reusing the template.
export const CHURCH = {
  contactName: 'Nathan',
  contactEmail: 'nathan@nixoncreativestudio.com',
  worshipTime: 'Sundays at 11am',
};

export type GuideBlock =
  | { kind: 'h'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'steps'; items: string[] }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'path'; items: string[] }
  | { kind: 'callout'; tone?: 'primary' | 'positive' | 'caution' | 'default'; title?: string; text: string }
  | { kind: 'seealso'; items: string[] };

export interface Guide {
  slug: string;
  title: string;
  icon: ComponentType;
  lead: string;
  diy?: 'self' | 'nathan' | 'mixed';
  body: GuideBlock[];
}

export const guides: Guide[] = [
  // 1 ----------------------------------------------------------------------
  {
    slug: 'start-here',
    title: 'Start here: how it all works',
    icon: RocketIcon,
    lead: "The big picture: what this Studio is, how your changes reach the live website, and the words you'll see along the way.",
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'This **Studio** is your control room. The **website** is what visitors see. You make changes here, and they appear on the website after you publish them. The Studio is private. The website is public.',
      },
      { kind: 'h', text: 'The one rule: nothing is live until you Publish' },
      {
        kind: 'p',
        text: 'While you type, your changes are saved as a **draft** that only you can see. The website does not change yet. When you are happy, click the **Publish** button at the bottom right. That is the moment your change goes live.',
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Take your time',
        text: 'Because nothing is public until you publish, you cannot break the live site just by editing. Click around, try things, and only publish when it looks right.',
      },
      { kind: 'h', text: 'When your change shows up on the website' },
      {
        kind: 'p',
        text: 'When you click **Publish**, the website rebuilds itself and your change appears a few minutes later, not the instant you publish. There is no live preview of a draft inside Sanity, so re-read your text here before you publish. To see it on the real site, open the website in another browser tab after the rebuild.',
      },
      { kind: 'h', text: 'How the Studio is organized' },
      {
        kind: 'bullets',
        items: [
          '**Pages**: the fixed pages of your site (Home, About, Worship, and so on). One of each.',
          '**Content**: reusable lists you add to over time (Events, FAQ Items, Pastors & Staff, Announcements, and more).',
          '**Events** and **Sermons**: your two busiest lists, kept near the top for quick access.',
          '**Media**: every photo you have uploaded, in one place (the icon in the top bar).',
        ],
      },
      { kind: 'h', text: "Words you'll see" },
      {
        kind: 'bullets',
        items: [
          '**Publish**: make your change live. **Unpublish**: take it off the live site (it stays saved as a draft).',
          '**Draft**: a saved change that is not live yet. A colored dot means there are unpublished edits.',
          '**Slug**: the end of a web address. The slug "about" makes the page live at yoursite.org/about.',
          '**Section** (or block): a stackable chunk of a page, like a photo row or a list of cards. You add, reorder, and remove them.',
          '**Alt text**: a short sentence describing a photo, read aloud to blind visitors and read by Google.',
        ],
      },
      { kind: 'seealso', items: ["Edit a page's words & photos", 'Do it yourself vs. call Nathan'] },
    ],
  },

  // 2 ----------------------------------------------------------------------
  {
    slug: 'post-event',
    title: 'Post or edit an event',
    icon: CalendarIcon,
    lead: 'Add a one-time event or update an existing one. New events show on the Events page automatically.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Events', 'New event (the + button)'] },
      { kind: 'h', text: 'Add an event' },
      {
        kind: 'steps',
        items: [
          'In the left menu, click **Events**, then the **+** button to start a new one.',
          'Fill in the **Title**, **Date and time**, and **Location**. If it runs all day, turn on **All day** and the time disappears.',
          'Add a short **Description** so people know what to expect.',
          'Pick a **Category**, and if you like, the **Audience** (for example Everyone, Families, Youth).',
          'If there is a cost or a sign-up, fill in **Cost** and the **Registration link**. Add a **Contact name and email** if people may have questions.',
          'Want it on the home page too? Turn on **Feature on home page**.',
          'Click **Publish**. It now appears on the Events page (yoursite.org/events).',
        ],
      },
      { kind: 'h', text: 'Edit or cancel an event' },
      {
        kind: 'steps',
        items: [
          'Click **Events**, then click the event in the list.',
          'Change whatever you need, then click **Publish** again.',
          'To take it down, open it and choose **Unpublish** (keeps a saved copy) or **Delete** (removes it).',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Special church services',
        text: 'For Christmas Eve, Holy Week, or Easter, see the next guide. There is a special flag that groups them in their own section.',
      },
      { kind: 'seealso', items: ['Special & seasonal service times'] },
    ],
  },

  // 3 ----------------------------------------------------------------------
  {
    slug: 'special-services',
    title: 'Special & seasonal service times',
    icon: StarIcon,
    lead: 'Christmas Eve, Holy Week, Easter and other special services, plus the seasonal banner on the home page.',
    diy: 'self',
    body: [
      { kind: 'h', text: 'A special service (one date)' },
      { kind: 'path', items: ['Events', 'New event', 'Special service'] },
      {
        kind: 'steps',
        items: [
          'Make an event the normal way (see Post or edit an event).',
          'Turn on the **Special service** flag, and pick the **Season** (for example Holy Week, Christmas, Easter).',
          'Publish. It now shows in the **Special services** section on the Events page, set apart from the regular calendar.',
        ],
      },
      { kind: 'h', text: 'The seasonal banner on the home page' },
      { kind: 'path', items: ['Pages', 'Home', 'Seasonal hero'] },
      {
        kind: 'p',
        text: 'The home page can switch to a seasonal look for a set stretch of dates, then switch back on its own.',
      },
      {
        kind: 'steps',
        items: [
          'Open **Pages**, then **Home**, and find **Seasonal hero**.',
          'Set the **Start** and **End** dates for the season.',
          'Fill in the seasonal **Eyebrow**, **Headline**, **Subhead**, and a seasonal **Image** if you have one.',
          'Publish. Between those dates the home page shows your seasonal banner, then returns to normal automatically.',
        ],
      },
      { kind: 'h', text: 'Changing the regular weekly time' },
      {
        kind: 'p',
        text: `Your standing worship time (currently ${CHURCH.worshipTime}) lives in the page wording, not in an event. To change it, edit the text on the **Home** and **I'm New / Worship** pages. See Edit a page's words and photos.`,
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Want something new?',
        text: `A brand-new kind of seasonal banner, or a new section just for a season, is a design change. Email ${CHURCH.contactName} at ${CHURCH.contactEmail}.`,
      },
    ],
  },

  // 4 ----------------------------------------------------------------------
  {
    slug: 'announcements',
    title: 'Announcement banners',
    icon: BellIcon,
    lead: 'The slim banner at the very top of every page. Use it for short, timely notices.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Content', 'Announcements', 'New announcement'] },
      { kind: 'h', text: 'Put up an announcement' },
      {
        kind: 'steps',
        items: [
          'Open **Content**, then **Announcements**, then **+**.',
          'Type your **Message**. Keep it to one short line.',
          'Add a **Link** if people should click through (optional).',
          'Pick a **Style**: Info for normal notices, Special for good news, Urgent for closings or weather.',
          'Set a **Start** and **End** date so it appears and disappears on its own.',
          'Turn on **Enabled** and click **Publish**.',
        ],
      },
      { kind: 'h', text: 'Take it down' },
      {
        kind: 'steps',
        items: ['Open the announcement, turn **Enabled** off (or set the **End** date to today), and Publish.'],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Only one shows at a time',
        text: 'If several are enabled, the site shows the current one based on the dates. You do not have to delete old announcements, just disable them.',
      },
    ],
  },

  // 5 ----------------------------------------------------------------------
  {
    slug: 'faqs',
    title: 'Add or edit an FAQ',
    icon: HelpCircleIcon,
    lead: 'The questions and answers on the FAQ page. Add new ones, edit answers, and control the order.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Content', 'FAQ Items', 'New FAQ item'] },
      { kind: 'h', text: 'Add a question' },
      {
        kind: 'steps',
        items: [
          'Open **Content**, then **FAQ Items**, then **+**.',
          'Write the **Question** the way a visitor would actually ask it.',
          'Write the **Answer**. You can use **bold**, links, and lists.',
          'Choose a **Category** (Visiting, Worship, Kids & Family, Giving, and so on).',
          'Set a **Display order** number. Lower numbers show first within the category.',
          'Publish. It appears on the FAQ page, grouped under its category.',
        ],
      },
      { kind: 'h', text: 'Change the order of the categories' },
      { kind: 'path', items: ['Pages', 'FAQ', 'Category order'] },
      {
        kind: 'steps',
        items: ['Open **Pages**, then **FAQ**, and find **Category order**.', 'Drag the categories into the order you want. Publish.'],
      },
      {
        kind: 'callout',
        tone: 'primary',
        text: 'A category only appears on the page when at least one question uses it. Empty categories never show.',
      },
    ],
  },

  // 6 ----------------------------------------------------------------------
  {
    slug: 'sermons',
    title: 'Sermons & the livestream link',
    icon: PlayIcon,
    lead: 'Post a recorded message, or just keep the Watch Live link pointed at your livestream.',
    diy: 'self',
    body: [
      { kind: 'h', text: 'The simplest option: the Watch Live link' },
      { kind: 'path', items: ['Pages', 'Sermons (index page)'] },
      {
        kind: 'p',
        text: 'If you livestream on YouTube, you may not need to post anything. The Sermons page shows a **Watch Live** button. Just make sure its link points at your channel.',
      },
      {
        kind: 'steps',
        items: ['Open **Pages**, then **Sermons (index page)**.', 'Check the watch / livestream link is correct. Publish.'],
      },
      { kind: 'h', text: 'Post a recorded message' },
      { kind: 'path', items: ['Sermons', 'New sermon'] },
      {
        kind: 'steps',
        items: [
          'In the left menu click **Sermons**, then **+**.',
          'Add the **Title**, **Date**, **Speaker**, and **Scripture**. Add a **Series** name if it is part of one.',
          'Paste the **Video link** (YouTube or Vimeo).',
          'Publish. The newest message shows at the top of the Sermons page.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'It is never empty',
        text: 'No sermons posted yet? The page still works. It shows a friendly watch-online message and your live link.',
      },
    ],
  },

  // 7 ----------------------------------------------------------------------
  {
    slug: 'edit-page',
    title: "Edit a page's words & photos",
    icon: EditIcon,
    lead: 'Change the words and photos on any existing page, like Home, About, or Worship.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Pages', '(choose a page)'] },
      { kind: 'h', text: 'Make an edit' },
      {
        kind: 'steps',
        items: [
          'Open **Pages** and click the page you want, for example **About**.',
          'Fields are grouped into tabs at the top (Hero, the page copy, SEO, Page sections). Click a tab to find what you want.',
          'Change the text, or swap a photo.',
          'Re-read your change here to make sure it reads right.',
          'Click **Publish**. The website rebuilds and your change appears in a few minutes.',
        ],
      },
      { kind: 'h', text: 'The empty-box rule (friendly and important)' },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Empty is fine',
        text: 'Many text boxes are blank on purpose. When a box is empty, the website shows its built-in wording. Only type in a box when you want to change that wording. Leaving it blank is perfectly safe.',
      },
      { kind: 'h', text: 'One thing to leave alone' },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'What We Believe',
        text: 'The statement of faith on the What We Believe page is set by church leadership. Please do not reword it. If it needs to change, that comes from leadership.',
      },
      { kind: 'seealso', items: ['Photos & images', 'Do it yourself vs. call Nathan'] },
    ],
  },

  // 8 ----------------------------------------------------------------------
  {
    slug: 'new-page',
    title: 'Build a brand-new page',
    icon: AddDocumentIcon,
    lead: 'Create a new page from scratch, like a campaign or a new ministry, without a designer.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Pages', 'Custom Pages', 'New page'] },
      { kind: 'h', text: 'Build a page' },
      {
        kind: 'steps',
        items: [
          'Open **Pages**, then **Custom Pages**, then **+**.',
          'Give it a **Title**.',
          'Set the **Slug**, which is the web address. A slug of "vbs" makes the page live at yoursite.org/vbs.',
          'Add **Sections** to build the body (see the next guide).',
          'Publish. Your page is now live at its web address.',
        ],
      },
      { kind: 'h', text: 'Linking to your new page' },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'You can add it to the menu yourself',
        text: 'To put your new page in the top menu or the footer, see the next guide, Edit the top menu & footer.',
      },
      { kind: 'seealso', items: ['Edit the top menu & footer', 'Add & arrange sections'] },
    ],
  },

  // 9 ---------------------------------------------------------------------- (editable nav)
  {
    slug: 'top-menu',
    title: 'Edit the top menu & footer',
    icon: MenuIcon,
    lead: 'Add, rename, reorder, or remove the links in the website header and footer, including dropdown menus.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Site Settings', 'Navigation'] },
      { kind: 'h', text: 'Add or change a menu link' },
      {
        kind: 'steps',
        items: [
          'Open **Site Settings** (top of the menu), then the **Navigation** tab.',
          'Under **Top menu links**, click **Add item**.',
          'Choose **Link** for a single page, or **Dropdown menu** to group several links under one label.',
          'For a link, type the **Label** (what people see) and the **Address** (a page on this site like /worship, or a full web address).',
          'Drag items by the dots to reorder them. Use the three dots on an item to remove it.',
          'Click **Publish**. The header updates across the site.',
        ],
      },
      { kind: 'h', text: 'Build a dropdown menu' },
      {
        kind: 'steps',
        items: [
          'Add a **Dropdown menu** item and give it a **Menu label**, for example "About Us".',
          'Inside it, add a **Link** for each page in the dropdown.',
          'Publish.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Your list becomes the whole menu',
        text: 'While Top menu links is empty, the site shows the built-in menu. As soon as you add any items, they become the entire menu, so include every link you want in the header, not just the new one.',
      },
      { kind: 'h', text: 'Footer link columns' },
      {
        kind: 'steps',
        items: [
          'In the same **Navigation** tab, scroll to **Footer link columns**.',
          'Click **Add item**, choose **Column**, and give it a **Column heading**, for example "Visit".',
          'Add a **Link** for each item in that column. Add up to three columns.',
          'Publish. The "Get in touch" column (email, phone, social) is added for you automatically.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Empty means the built-in menus',
        text: 'Both the top menu and the footer columns fall back to the built-in menus while they are empty, so you only change what you fill in.',
      },
      { kind: 'seealso', items: ['Build a brand-new page'] },
    ],
  },

  // 10 ---------------------------------------------------------------------
  {
    slug: 'sections',
    title: 'Add & arrange sections',
    icon: BlockElementIcon,
    lead: 'Sections are the building blocks of a page. Mix and match them, reorder them, and set their backgrounds.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['(any page)', 'Page sections'] },
      { kind: 'h', text: 'Add a section' },
      {
        kind: 'steps',
        items: [
          'Open a page and find **Page sections**.',
          'Click **Add item** and choose a section type.',
          'Fill in its fields.',
          'Publish. The new section appears on the site after it rebuilds (a few minutes).',
        ],
      },
      { kind: 'h', text: 'The sections you can choose from' },
      {
        kind: 'bullets',
        items: [
          '**Rich text**: headings and paragraphs.',
          '**Image + text**: a photo beside words.',
          '**Cards** and **Feature cards**: a row of linked or highlighted boxes.',
          '**Quote**: a pulled quote or scripture.',
          '**Stats**: big numbers (years, meals served, and so on).',
          '**Steps**: a numbered how-it-works list.',
          '**FAQ accordion**: expandable questions.',
          '**Photo gallery**: a grid of images.',
          '**Logos**: partner or sponsor logos.',
          '**Media feature**: a large video or image.',
          '**CTA band**: a strip with a button (a call to action).',
          '**Form**: a contact or sign-up form.',
          '**Dynamic list**: automatically shows your latest sermons, events, ministries, staff, or worship resources. It keeps itself up to date.',
        ],
      },
      { kind: 'h', text: 'Reorder or remove' },
      {
        kind: 'steps',
        items: [
          'Drag a section by the dots on its left to move it.',
          'Click the three dots on a section and choose **Remove** to delete it.',
        ],
      },
      { kind: 'h', text: "Change a section's background" },
      { kind: 'p', text: 'Each section has a **Background** control so it sits nicely on the page.' },
      {
        kind: 'bullets',
        items: [
          '**Tone**: pick a brand mood (Default, Warm, Chapel green, Chapel deep). The text color adjusts on its own to stay readable.',
          '**Image or video**: put a photo or video behind the section. A darkening slider keeps the words readable on top.',
          '**Spacing**: make the section more or less tall.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'It stays on-brand',
        text: 'You are choosing from set brand options, not raw colors, so whatever you pick looks like it belongs. More on that in the brand guide.',
      },
      { kind: 'seealso', items: ['The brand: colors & fonts', 'Photos & images'] },
    ],
  },

  // 10 ---------------------------------------------------------------------
  {
    slug: 'photos',
    title: 'Photos & images',
    icon: ImageIcon,
    lead: 'How to upload, crop, and describe photos so they look sharp and work for everyone.',
    diy: 'self',
    body: [
      { kind: 'h', text: 'Add a photo' },
      {
        kind: 'steps',
        items: [
          'Click an image field and either drag a photo in, upload one, or pick from the **Media** library.',
          'Set the **focal point** (the hotspot): click the spot that matters, like a face. The site keeps that spot in view when it crops the photo for phones and wide screens.',
          'Add **Alt text**: one short sentence describing the photo. Publish.',
        ],
      },
      { kind: 'h', text: 'Alt text, briefly' },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Why it matters',
        text: 'Alt text is read aloud to blind visitors and read by Google. Describe what is in the photo, for example "Choir singing in the sanctuary on Easter morning." Skip phrases like "photo of".',
      },
      { kind: 'h', text: 'Good photos to use' },
      {
        kind: 'bullets',
        items: [
          'Use large, sharp images. A wide hero photo looks best around 2000 pixels wide.',
          'A social share image (the picture shown when a page is texted or posted) works best at 1200 by 630 pixels.',
          'Avoid tiny, blurry, or screenshot images in big spots.',
        ],
      },
      { kind: 'h', text: 'The Media library' },
      {
        kind: 'p',
        text: 'The **Media** icon in the top bar holds every photo you have uploaded. Search, tag, and reuse photos there instead of uploading the same picture twice.',
      },
    ],
  },

  // 11 ---------------------------------------------------------------------
  {
    slug: 'brand',
    title: 'The brand: colors & fonts',
    icon: ColorWheelIcon,
    lead: 'Why the site always looks consistent, what you can change, and what is locked on purpose.',
    diy: 'mixed',
    body: [
      { kind: 'h', text: 'Colors and fonts are set for you' },
      {
        kind: 'p',
        text: 'Your site uses a fixed set of brand colors and a chosen pair of fonts. This is what makes every page look professional and consistent without hiring a designer for each change.',
      },
      { kind: 'h', text: 'You choose tones, not raw colors' },
      {
        kind: 'p',
        text: 'When you set a section background, you pick a **tone** (Warm, Chapel green, and so on), not a color code. Each tone already knows the right text color to stay readable. That is why you cannot pick a random color, and why you do not need to.',
      },
      { kind: 'h', text: 'What you can change yourself' },
      {
        kind: 'bullets',
        items: [
          'Section background tones, and background photos or videos.',
          '**The script accent word**: many headlines let you mark one word to appear in the elegant handwritten font. Type the word exactly as it appears in the headline.',
          'All the words and photos, of course.',
        ],
      },
      { kind: 'h', text: 'What is locked (and why)' },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Fonts and exact colors',
        text: `Changing the fonts or the actual color values would affect the whole site and is easy to get wrong, so it stays a code change on purpose. If a campaign needs a special color or font, email ${CHURCH.contactName} at ${CHURCH.contactEmail} and they will set it up properly.`,
      },
      { kind: 'seealso', items: ['Add & arrange sections'] },
    ],
  },

  // 12 ---------------------------------------------------------------------
  {
    slug: 'diy-vs-nathan',
    title: 'Do it yourself vs. call Nathan',
    icon: InfoOutlineIcon,
    lead: 'A quick map of what is safe to do on your own, what to bring to Nathan, and the one button never to click.',
    diy: 'mixed',
    body: [
      { kind: 'h', text: 'Do these yourself, anytime' },
      {
        kind: 'bullets',
        items: [
          "Edit any page's words and photos.",
          'Post and edit events and sermons.',
          'Add and edit FAQs.',
          'Put up and take down announcement banners.',
          'Add, reorder, and remove sections on a page.',
          'Build new Custom Pages.',
          'Add, rename, and reorder the top menu and footer links.',
          'Change section background tones and images.',
          'Update service times and the seasonal home banner.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'You cannot break the live site by editing',
        text: 'Remember, nothing is public until you publish. Explore freely.',
      },
      { kind: 'h', text: 'Bring these to Nathan' },
      {
        kind: 'bullets',
        items: [
          'Needing a new kind of field, or a new kind of section that does not exist yet.',
          'Web address changes, redirects, the domain, or email and DNS settings.',
          'Adding a new outside tool (a new giving, calendar, or streaming embed).',
          'The What We Believe statement of faith (that comes from leadership).',
          'Anything that shows an error, or any screen that looks like code.',
        ],
      },
      { kind: 'h', text: 'The one hard rule' },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Never click "Remove field"',
        text: 'If you ever see a button called **Remove field**, do not click it. It does not just clear one box, it erases that field on every document, and it cannot be undone easily. Clearing the text inside a box is fine. Removing the field is not.',
      },
      { kind: 'h', text: 'Reaching Nathan' },
      {
        kind: 'p',
        text: `Email ${CHURCH.contactName} at ${CHURCH.contactEmail}. When something is confusing or looks broken, a quick note with a screenshot is the fastest way to get help. There is no silly question.`,
      },
    ],
  },
];
