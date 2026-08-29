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
  ClockIcon,
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
  CopyIcon,
  SearchIcon,
  ArrowRightIcon,
  CommentIcon,
  SparkleIcon,
  UndoIcon,
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
  | {
      kind: 'callout';
      tone?: 'primary' | 'positive' | 'caution' | 'default';
      title?: string;
      text: string;
    }
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
        text: 'When you click **Publish**, the website rebuilds itself and your change appears a few minutes later, not the instant you publish. You do not have to guess in the meantime: open **Preview** (the eye icon at the top of a page) and you get the page as visitors will see it, beside the fields, with your unpublished draft already in it.',
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
      {
        kind: 'seealso',
        items: ["Edit a page's words & photos", 'Do it yourself vs. call Nathan'],
      },
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
        items: [
          'Open the announcement, turn **Enabled** off (or set the **End** date to today), and Publish.',
        ],
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
        items: [
          'Open **Pages**, then **FAQ**, and find **Category order**.',
          'Drag the categories into the order you want. Publish.',
        ],
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
        items: [
          'Open **Pages**, then **Sermons (index page)**.',
          'Check the watch / livestream link is correct. Publish.',
        ],
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

  // 8a ---------------------------------------------------------------------
  {
    slug: 'copy-or-put-away',
    title: 'Copy a page, or put one away',
    icon: CopyIcon,
    lead: 'Start a new page from one you already like, and take an old page off the site without losing it.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Pages', 'Custom Pages', 'open a page', 'the publish menu'] },
      { kind: 'h', text: 'Copy a page' },
      {
        kind: 'p',
        text: "Last year's Vacation Bible School page is the fastest way to make this year's. Copying gives you the whole layout, so you only change the words and the dates.",
      },
      {
        kind: 'steps',
        items: [
          'Open the page you want to copy.',
          'Click the small arrow next to the **Publish** button, then **Duplicate**.',
          'The copy opens straight away. It is called "... copy" and it sits at a new web address ending in "-copy".',
          'Change the title, the web address, and anything else you want.',
          'Publish when you are ready.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'A copy is never live by accident',
        text: 'The copy starts as a draft. Nobody can see it until you press Publish, so you can take as long as you like over it.',
      },

      { kind: 'h', text: 'Put a page away (Archive)' },
      {
        kind: 'p',
        text: 'When an event is over, you rarely want the page deleted. You want it off the site, and back next year. That is Archive.',
      },
      {
        kind: 'steps',
        items: [
          'Open the page.',
          'Click the small arrow next to the **Publish** button, then **Archive**.',
          'Press **Publish**. The page comes off the site at the next update, and any menu link to it disappears too.',
        ],
      },
      {
        kind: 'h',
        text: 'Bring it back (Restore)',
      },
      {
        kind: 'steps',
        items: [
          'Open the page. It is still in **Custom Pages**, marked "Archived".',
          'Click the arrow next to **Publish**, then **Restore**.',
          'Press **Publish**. The page is back exactly as it was.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Archive, do not delete',
        text: 'Deleting throws the words and the layout away for good, and it is refused while anything still links to the page. Archiving keeps everything and can be undone in two clicks.',
      },
      { kind: 'seealso', items: ['Build a brand-new page', 'Renamed links keep working'] },
    ],
  },

  // 8b ---------------------------------------------------------------------
  {
    slug: 'search-and-sharing',
    title: 'How your page looks in Google',
    icon: SearchIcon,
    lead: 'Set the title and the sentence people read in search results, and see both before you publish.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Pages', 'Custom Pages', 'open a page', 'Search & sharing'] },
      {
        kind: 'p',
        text: 'Every page has a **Search & sharing** tab. At the top of it is a picture of your page as Google shows it, and as a text message or a Facebook post shows it. Both update as you type.',
      },
      {
        kind: 'bullets',
        items: [
          '**SEO title**: the blue line in Google and the name on the browser tab. Around 60 characters. Leave it blank to use the page title.',
          '**SEO description**: the grey sentence under it. Around 160 characters. Write it for a person, not for a search engine.',
          '**Social share image**: the picture people see when the page is shared. A wide photo works best.',
          '**Keep this page out of Google**: see below.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'The counter is there to help',
        text: 'Each of those two boxes shows how many characters you have used. Green is healthy, amber is close to the limit, red means Google will cut the end off.',
      },
      { kind: 'h', text: 'Keeping a page out of Google' },
      {
        kind: 'p',
        text: 'Turn on **Keep this page out of Google** for a page that should exist but should not be found by searching, like a form you only send by email.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'It is not a lock',
        text: 'The page is still on the site, and anyone who has the address can still open it. It only asks search engines to skip it.',
      },
      { kind: 'seealso', items: ['Photos & images', 'Build a brand-new page'] },
    ],
  },

  // 8c ---------------------------------------------------------------------
  {
    slug: 'renamed-links',
    title: 'Renamed links keep working',
    icon: ArrowRightIcon,
    lead: 'Change a page address and the old one still takes people to the right place.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Pages', 'Custom Pages', 'Redirects (old links)'] },
      {
        kind: 'p',
        text: 'A web address that has been printed on a bulletin, saved as a bookmark, or listed in Google does not change when you rename the page. Without help it would land on a "page not found".',
      },
      { kind: 'h', text: 'This happens for you' },
      {
        kind: 'steps',
        items: [
          'Change the **Slug** on a page that is already live.',
          'Press **Publish**.',
          'A note appears saying the old link was kept working. Nothing else to do.',
        ],
      },
      {
        kind: 'p',
        text: 'You can see every forward under **Pages**, then **Redirects (old links)**. Each one says where people used to go and where they are sent now.',
      },
      { kind: 'h', text: 'Adding one by hand' },
      {
        kind: 'p',
        text: 'Do this for an address that never existed on this site: a link from an old website, or one printed on a card.',
      },
      {
        kind: 'steps',
        items: [
          'Open **Redirects (old links)**, then **+**.',
          'In **Old address**, type the address people are still using, starting with a slash, like "/vbs2025".',
          'In **Send them to**, type the page it should go to, like "/vbs", or a full https:// link.',
          'Leave **Permanent move?** on unless the forward is only for a few weeks.',
          'Publish.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'It takes effect on the next site update',
        text: 'Forwards are built into the site, so a new one is live a couple of minutes after you publish, like any other change.',
      },
      { kind: 'seealso', items: ['Copy a page, or put one away', 'Build a brand-new page'] },
    ],
  },

  // 9 ---------------------------------------------------------------------- (editable nav)
  {
    slug: 'top-menu',
    title: 'Edit the top menu & footer',
    icon: MenuIcon,
    lead: 'Add, rename, reorder, or remove the links in the website header and footer, including dropdown menus, the header button, a logo, and the small print at the bottom.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Site Settings', 'Navigation (menus)'] },
      { kind: 'h', text: 'Add or change a menu link' },
      {
        kind: 'steps',
        items: [
          'Open **Site Settings** (top of the menu), then the **Navigation (menus)** tab.',
          'Under **Top menu links**, click **Add item**.',
          'Choose **Link** for a single page, or **Dropdown menu** to group several links under one label.',
          'For a link, type the **Label** (what people see), then choose where it goes: **A page on this site** lets you pick the page from a list, and **Another website** takes a full web address.',
          'Drag items by the dots to reorder them. Use the three dots on an item to remove it.',
          'The header fits about **seven** links, so keep the list short.',
          'Click **Publish**. The header updates across the site.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Picking the page is safer than typing the address',
        text: 'When you pick a page from the list, the link follows that page. If its web address ever changes, the menu link changes with it and can never go dead. Older links here still show an **Address (typed by hand)** box, and that typed address is what the site uses. Clear it if you would rather pick the page.',
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
          'In the same **Navigation (menus)** tab, scroll to **Footer link columns**.',
          'Click **Add item**, choose **Column**, and give it a **Column heading**, for example "Visit".',
          'Add a **Link** for each item in that column. Aim for three columns so the footer stays balanced; four is the most that fits.',
          'Publish. The "Get in touch" column (email, phone, social) is added for you automatically.',
        ],
      },
      { kind: 'h', text: 'The small print at the very bottom' },
      {
        kind: 'p',
        text: 'The little links beside the copyright line (Give, Privacy policy) are **Footer small-print links**, in the same **Navigation (menus)** tab. Leave it empty to keep those two, or add your own to replace them.',
      },
      { kind: 'h', text: 'The button at the right of the header' },
      {
        kind: 'steps',
        items: [
          'In **Navigation (menus)**, open **Header button**.',
          'Type **Button text** to change what it says, and set **Where the button goes** to change where it leads. Leave both blank for the built-in "Plan a Visit" pointing at the Worship page.',
          'Turn **Show the header button** off to remove the button from the header and from the phone menu.',
        ],
      },
      { kind: 'h', text: 'Use a logo instead of the typed name' },
      {
        kind: 'p',
        text: 'In **Identity & contact**, upload a **Logo** and it takes the place of the typed wordmark at the top of every page. Add **Alt text** so screen readers can read it. Trim the spare space around the image before you upload, because the site scales the whole picture to the header height. Remove the logo and the typed wordmark comes back.',
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Empty means the built-in menus',
        text: 'The top menu, the footer columns, the small-print links and the header button all fall back to the built-in ones while they are empty, so you only change what you fill in. The same goes for the three switches here (the email and social buttons in the phone menu, the social buttons in the footer): leave them alone and everything shows as it does today.',
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
          'In **Preview**, do the same on the page itself: right-click a section for its menu (insert, duplicate, move, remove), or drag its corner tag to a new spot.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'On the page picture: right-click, not hover',
        text: 'Open **Preview** and hover a section on the page picture. It outlines, and that is all hovering does. **Right-click inside the outline** and a menu appears: **insert a section before or after it** (a picture picker of every kind), **duplicate** it, **move** it, or **remove** it. The small tag at the outline’s corner is a handle you can drag. That is usually the quickest way, because you are looking at the thing you are moving. The `Page sections` list above does all the same jobs, and is the place to go when a page has no sections yet.',
      },
      { kind: 'h', text: "Change a section's background" },
      {
        kind: 'p',
        text: 'Each section has a **Background** control so it sits nicely on the page.',
      },
      {
        kind: 'bullets',
        items: [
          '**Surface**: pick a background from a row of colored dots (Paper, Warm, Bright card, Chapel green, Chapel deep, Ink). The text color comes with it, so it always stays readable.',
          '**Accent colour**: the small colour inside the section, for the button and an accent word.',
          '**Image or video**: put a photo or video behind the section. A darkening slider keeps the words readable on top.',
          '**Vertical spacing**: make the section more or less tall.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'It stays on-brand',
        text: 'You are choosing from set brand options, not raw colors, so whatever you pick looks like it belongs. There is a whole guide on this one panel: **Change how a section looks**.',
      },
      {
        kind: 'seealso',
        items: [
          'Undo a change',
          'Change how a section looks',
          'The brand: colors & fonts',
          'Photos & images',
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: 'section-appearance',
    title: 'Change how a section looks',
    icon: SparkleIcon,
    lead: 'Give a section a different background, a different accent colour, a bolded word, one word of the heading picked out in colour, or a different arrangement. All of it from the page picture, all of it on-brand.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Every section carries a **Section background** panel, collapsed at the bottom of its fields. Open it and there are two rows of coloured dots. Nothing in here is a colour picker, and that is on purpose: each dot is a pairing somebody designed, a background together with the text colour that belongs on it. You cannot land on an unreadable combination, because the unreadable combinations are not offered.',
      },

      { kind: 'h', text: 'Surface: the background of the whole band' },
      {
        kind: 'bullets',
        items: [
          '**Paper** is the ordinary page. Most sections should be this.',
          '**Warm** is one quiet step away from Paper. Use it to break a long page into chapters.',
          '**Bright card** is the clean raised surface. It reads well directly above or below a Warm band.',
          '**Chapel green** is the signature band, the same green as the footer.',
          '**Chapel deep** is the heavier green, for a closing band you want to feel final.',
          '**Ink** is a near-black slab. Use it once on a page, never twice.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Why the first three dots are split diagonally',
        text: 'Paper, Warm and Bright card follow the reader’s own light or dark setting, so their dots show both halves. Chapel green, Chapel deep and Ink are the same colour whatever the reader has chosen, so their dots are solid. The `Aa` inside each dot is the text colour that comes with that background.',
      },

      { kind: 'h', text: 'Accent colour: the small colour inside the section' },
      {
        kind: 'p',
        text: 'The accent is the button fill and the accent word in the heading. **Bronze** is the house look and is what every section has today, so leaving this alone changes nothing at all. **Chapel green** is quieter and more liturgical. **Ink** is no colour at all, for a section you want to feel plain.',
      },

      { kind: 'h', text: 'Bold and italic in a subhead' },
      {
        kind: 'p',
        text: 'The short support lines under a heading (Subhead, Intro, Body on the media feature) now come in two boxes. The lower one has a **B** and an *i* button. Type there and you can emphasise a word; the plain box above hides itself once you do, so you are never looking at two boxes that both claim to be the subhead. Leave the rich box empty and nothing changes.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'One emphasis, not three',
        text: 'Bold works because it is rare. A sentence with three bolded phrases in it reads as a ransom note, not as emphasis.',
      },

      { kind: 'h', text: 'One word of the heading in colour' },
      {
        kind: 'steps',
        items: [
          'Find **Accent word in the heading**, just under the heading box.',
          'Type a word or a short phrase that already appears in the heading. Capitals do not matter.',
          'Publish. That word renders in the section’s accent colour.',
        ],
      },
      {
        kind: 'p',
        text: 'The first match is the one that gets coloured, and one is the limit by design. Two coloured words in one heading stop reading as emphasis and start reading as decoration. This is the colour sibling of the handwritten **script accent** on the big headlines: pick one device per heading, not both.',
      },

      { kind: 'h', text: 'Layout: how the section is arranged' },
      {
        kind: 'p',
        text: 'Two more controls sit on the section itself rather than in the background panel, and they change the arrangement rather than the colour. Not every section has them, because not every section has more than one arrangement worth putting your name on.',
      },
      {
        kind: 'bullets',
        items: [
          '**Which side is the picture on?** on the image + text section, and **Which side is the video or photo on?** on the media feature. Two choices, left or right. Use it to alternate down a long page so two picture sections in a row do not face the same way.',
          '**How many across** on the card grid, feature cards, stats, the photo gallery, numbered steps and the dynamic list. Pick two, three or four (steps and the dynamic list offer two or three, because a step is a paragraph and does not survive a quarter-width column). Two is the one to reach for when a section holds exactly two things and a three-across row is leaving an empty gap.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Phones are not part of the choice',
        text: 'Every one of these is about the widest screen. On a phone the words always come first and the picture underneath, and the grids always stack (the photo gallery always shows two across). So there is no setting here that can make the site awkward on a phone.',
      },

      { kind: 'h', text: 'The rest of the background panel' },
      {
        kind: 'bullets',
        items: [
          '**Background image or video**: put a photo or a video behind the section. The **Overlay darkness** slider dims it so the words stay readable on top.',
          '**Vertical spacing**: Compact, Normal or Spacious, to make the section shorter or taller. This is the density control: Compact when a short section is floating in too much room, Spacious for a band you want to feel like a pause.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Do it from the page picture',
        text: 'All of this is easier in **Preview**, where you can see the band change as you pick. Right-click a section on the page picture to reach its menu, or just click the section and its fields open beside it.',
      },
      {
        kind: 'seealso',
        items: [
          'Change a section on the page picture',
          'Add & arrange sections',
          'The brand: colors & fonts',
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: 'in-canvas-controls',
    title: 'Change a section on the page picture',
    icon: ColorWheelIcon,
    lead: 'Three things you can change without leaving the page picture: how a section looks, which word of a heading is coloured, and the words themselves.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'Open **Preview** (the eye icon at the top of a page). The page picture on the right is the real page, and in **Edit** mode you can change three things right on it. You are still editing a draft, so nothing is public until you press **Publish**.',
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Everything here is also in the fields',
        text: 'Not one of these buttons can do something the form on the left cannot. They are the same three fields, put where you are already looking. If a button ever confuses you, close it and use the fields.',
      },

      { kind: 'h', text: '1. How this section looks' },
      {
        kind: 'steps',
        items: [
          'Move your pointer over a section on the page picture. A small round **palette** button appears in its top right corner.',
          'Click it. A card opens with two lists: **Surface** (the background of the whole band) and **Accent colour** (the small colour inside it).',
          'Click a colour. The band changes under your pointer straight away.',
          'Close the card with its ✕, with the **Esc** key, or by clicking anywhere else on the page.',
        ],
      },
      {
        kind: 'p',
        text: 'The colours are the same six surfaces and three accents the **Section background** panel offers in the fields, described one by one in **Change how a section looks**. Nothing here is a colour picker: each choice is a pairing somebody designed, so you cannot land on an unreadable combination.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'A photo behind the section wins',
        text: 'If the section has a background photo or video, the words are always shown in white over the picture and the surface colour is not used at all. The card says so, and offers only the accent. Take the photo out if you want a surface colour back.',
      },
      {
        kind: 'p',
        text: 'The palette button appears only on sections that have a background to change. The **Form** section and an **Embed** do not have one, so they have no button.',
      },

      { kind: 'h', text: '2. The accent word in a heading' },
      {
        kind: 'steps',
        items: [
          'On a section that has a heading, a small round **A** button sits beside the palette button.',
          'Click it. The card shows the heading again, one button per word.',
          'Click the word you want. It takes the section accent colour on the page.',
          'Click the same word again to make the heading plain.',
        ],
      },
      {
        kind: 'p',
        text: 'This is the same **Accent word in the heading** field you can type into, with the typing taken out. Because you click a word out of the heading itself, the word always matches and there is no spelling to check. One word per heading is the rule: two coloured words stop reading as emphasis and start reading as decoration.',
      },
      {
        kind: 'p',
        text: 'Five kinds of section carry an accent word: **Text section**, **Card grid**, **Call-to-action band**, **Feature cards** and **Media feature**. The **A** button only appears once the heading has something in it.',
      },

      { kind: 'h', text: '3. Edit the words where they are' },
      {
        kind: 'steps',
        items: [
          'Click the words you want to change on the page picture. A small **Edit here** button appears in the corner of that line.',
          'Click it. A box opens with the words already in it.',
          'Type. Press **Enter** to save, or **Esc** to leave it as it was. Clicking away from the box saves it too.',
        ],
      },
      {
        kind: 'bullets',
        items: [
          'On a **subhead**, **intro** or **body** line the box has a **B** button and an *i* button, so you can bold or italicise part of the sentence. That is all the formatting there is, on purpose.',
          'On the three **hero** lines at the top of a page (the eyebrow, the headline and the subhead) the box is plain text. **Shift+Enter** makes a new line there.',
          'Pasting is cleaned as it lands: bold and italic survive, and fonts, colours, sizes and tables are dropped. What you see in the box is what gets saved.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Emptying the box does not delete the line',
        text: 'Clear a bold-and-italic box and the plain wording that was there before comes back. Nothing is lost. The plain box and the rich box are two halves of the same line.',
      },

      { kind: 'h', text: 'When a button does not appear' },
      {
        kind: 'bullets',
        items: [
          'You are in **Browse** mode, not **Edit** mode. Switch at the top of the preview.',
          'The section does not have that field. Not every section has a background, and only five have an accent word.',
          'The line is not one of the lines this offers. Long body text with its headings, lists and links is still edited in the fields, where it has its full toolbar.',
        ],
      },
      {
        kind: 'seealso',
        items: ['Change how a section looks', 'Add & arrange sections', 'Undo a change'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: 'saved-sections',
    title: 'Save a section and use it again',
    icon: CopyIcon,
    lead: 'Build a section once, keep it, and drop a copy of it on any other page.',
    diy: 'self',
    body: [
      {
        kind: 'p',
        text: 'You spend twenty minutes getting a **Join us Sunday** band exactly right, and then you want the same band on four more pages. You do not have to build it again. Keep it as a **saved section** and add a copy wherever you need one.',
      },
      { kind: 'h', text: 'Keep a section you have built' },
      { kind: 'path', items: ['Open the page', 'Publish menu', 'Save a section as preset'] },
      {
        kind: 'steps',
        items: [
          'Open the page that already has the section you like.',
          'Click the small arrow next to the **Publish** button, then **Save a section as preset**.',
          'Pick the section from the list. The words inside it are shown so you can tell two of a kind apart.',
          'Give it a name you will recognise later, then click **Save section**.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'Nothing on the site changes',
        text: 'Saving a section only makes a copy for your own use. The page you saved it from is untouched, and no visitor sees anything new.',
      },
      { kind: 'h', text: 'Put it on another page' },
      { kind: 'path', items: ['Pages', 'Saved sections', 'Publish menu', 'Add to a page'] },
      {
        kind: 'steps',
        items: [
          'Go to **Pages**, then **Saved sections**, and open the one you want.',
          'Click the small arrow next to **Publish**, then **Add to a page**.',
          'Pick the page. A copy is added to the bottom of that page as a draft.',
          'Open that page, drag the section where you want it, and **Publish**.',
        ],
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'A copy, not a link',
        text: "Once a saved section is on a page it is that page's own. Changing the saved section later does not change the pages that already have it, and editing one of those pages does not change the saved section.",
      },
      { kind: 'h', text: 'Tidying up' },
      {
        kind: 'p',
        text: 'Delete a saved section you no longer use. Nothing on the website depends on it, so deleting one never breaks a page.',
      },
      { kind: 'seealso', items: ['Add & arrange sections', 'Copy a page, or put one away'] },
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: 'check-a-page',
    title: 'Check a page before you publish',
    icon: SearchIcon,
    lead: 'A quick second pair of eyes: missing photo descriptions, empty sections, and links that may go nowhere.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Open the page', 'Publish menu', 'Check this page'] },
      {
        kind: 'steps',
        items: [
          'Open the page you are about to publish.',
          'Click the small arrow next to the **Publish** button, then **Check this page**.',
          'Read what it found, fix anything you agree with, and publish when you are happy.',
        ],
      },
      { kind: 'h', text: 'The three things it looks for' },
      {
        kind: 'bullets',
        items: [
          '**Photos without a description.** Alt text is the sentence a screen reader says out loud, and what shows if the photo does not load.',
          '**Sections with nothing in them.** A section you added and never filled in shows up blank on the page.',
          '**Links worth a look.** A link to our own site whose address no page seems to own.',
        ],
      },
      {
        kind: 'callout',
        tone: 'positive',
        title: 'It never stops you publishing',
        text: 'This is a courtesy read-through, not a rule. Everything it lists is a suggestion, and you can publish with the list on screen.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'It can be wrong',
        text: 'Some photos are decoration and genuinely need no description. A link it questions may be perfectly fine. It also skips sections that fill themselves from a list (an FAQ list, a dynamic list, a form), because their words live elsewhere, so it will never tell you one of those is empty.',
      },
      { kind: 'seealso', items: ['Photos & images', 'Add & arrange sections'] },
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: 'undo-a-change',
    title: 'Undo a change',
    icon: UndoIcon,
    lead: 'Dragged a section to the wrong place, removed the wrong one, or picked a background you regret? Step it back.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['a page', 'the arrow beside Publish', 'Undo last change'] },
      {
        kind: 'p',
        text: 'Click the small arrow beside `Publish` and choose **Undo last change**. The page goes back to how it was one step ago. Choose **Redo** to put it back again if you change your mind.',
      },
      { kind: 'h', text: 'Ctrl+Z works too, outside text boxes' },
      {
        kind: 'p',
        text: 'With a page open, press **Ctrl+Z** (**Cmd+Z** on a Mac) to undo and **Ctrl+Shift+Z** to redo. Press it more than once to go back more than one step.',
      },
      {
        kind: 'callout',
        tone: 'default',
        title: 'Inside a text box, the text box wins',
        text: 'If your cursor is in a heading, a paragraph or any other box you type in, Ctrl+Z undoes your typing, the way it does everywhere else. That is on purpose. Click outside the box first if you want to undo the bigger thing, like the section you just dragged.',
      },
      { kind: 'h', text: 'What it can and cannot reach' },
      {
        kind: 'bullets',
        items: [
          'It works on your **unpublished draft** only. The live website is never touched, so undo can never break what visitors see.',
          'It covers everything, not just typing: sections added, dragged, duplicated or removed, photos swapped or cleared, backgrounds and options changed.',
          'It **cannot undo a Publish**. Publishing is its own step. To take a published page back, use **Version history**.',
          'It forgets everything when you close or reload the tab. Undo is for the last few minutes, not for last week.',
        ],
      },
      { kind: 'h', text: 'When it politely refuses' },
      {
        kind: 'bullets',
        items: [
          '**"Nothing to undo yet"**: this page has no unpublished change for undo to step back to.',
          '**"Someone else edited since"**: the page changed after the last thing you did, so undo left it alone rather than writing over somebody. Reload the page and look at it before doing anything else.',
          '**"This would remove the only copy"**: stepping back that far would delete a page that has never been published, so there would be nothing left. If you really do want it gone, delete it on purpose.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Version history is still the deep one',
        text: 'Undo is the quick step back for the thing you just did. To go back hours or days, or to recover something after publishing, open the page and use **Version history** in the top right. Nothing here replaces it.',
      },
      { kind: 'seealso', items: ['Add & arrange sections', 'Change how a section looks'] },
    ],
  },

  // -------------------------------------------------------------------------
  {
    slug: 'build-a-form',
    title: 'Build your own form',
    icon: CommentIcon,
    lead: 'Ask visitors your own questions on any page, without asking anyone to build a form for you.',
    diy: 'self',
    body: [
      { kind: 'path', items: ['Edit a page', 'Sections', 'Add item', 'Form'] },
      {
        kind: 'p',
        text: 'A **Form** section can work two ways. The quick way is to write your questions right there in the section. The other way is to point it at a saved **Form** document, which is worth doing when the same form belongs on several pages.',
      },
      { kind: 'h', text: 'Write your own questions' },
      {
        kind: 'steps',
        items: [
          'Open the page, scroll to **Sections**, and click **Add item**, then **Form**.',
          'Give it a **Heading** and an **Intro** if you want words above the form.',
          'Under **Your own questions**, click **Add item**.',
          'Type the **Question**, for example "Which service do you usually attend?".',
          'Pick the **Answer type**: short text, email address, phone number, long text, a list to choose from, or a yes / no tick box.',
          'If you picked a list, add your **Choices**, one per line.',
          'Turn on **Must be answered** if the visitor cannot send the form without it.',
          'Add up to 12 questions, then **Publish**.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Name, email, and phone are always there',
        text: 'You never have to add them. Every form starts with those three boxes, so you always have a way to reply. Your questions come after them.',
      },
      { kind: 'h', text: 'Where the answers go' },
      {
        kind: 'p',
        text: 'The answers arrive in the same email as every other form on the site, one line per question. Nothing has to be set up again when you add a question.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Twelve questions is the limit',
        text: 'That is on purpose. A long form is the fastest way to lose the person filling it in. If you need more than twelve, it is usually two forms, or a conversation.',
      },
      { kind: 'h', text: 'Change or remove a question' },
      {
        kind: 'steps',
        items: [
          'Open the page and find the **Form** section.',
          'Click the question to edit its words, drag it by the handle to reorder, or use the menu on the right to remove it.',
          'Click **Publish**. The form on the site changes right away.',
        ],
      },
      {
        kind: 'p',
        text: `Stuck, or want a form that does something the questions here cannot? Email ${CHURCH.contactName} at ${CHURCH.contactEmail}.`,
      },
      { kind: 'seealso', items: ['Sections: build a page', 'Edit a page'] },
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
    slug: 'publish-later-and-share',
    title: 'Publish later, and show someone first',
    icon: ClockIcon,
    lead: 'Two ways to take the pressure off publishing: set a page to go live on its own at a time you choose, and send a private link so someone can read it before anyone else can.',
    diy: 'self',
    body: [
      { kind: 'h', text: 'Publish later' },
      {
        kind: 'p',
        text: 'Say the stewardship page should go live Monday morning, but you are writing it on Friday night. You do not have to be at a computer on Monday.',
      },
      {
        kind: 'steps',
        items: [
          'Finish your edits as usual. Do **not** click Publish.',
          'Open the **Publishing** tab on the page and find **Publish automatically at**.',
          'Pick the date and time. The clock is your own local time, the one on your phone.',
          'Leave the page as a draft and close it. That is all.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        title: 'Within about half an hour',
        text: 'The site checks for scheduled pages every thirty minutes, so a page set for 9:00 goes live somewhere between 9:00 and 9:30. Pick a time a little earlier than the moment you actually need it.',
      },
      {
        kind: 'bullets',
        items: [
          'Changed your mind? Clear the date before it arrives and nothing happens.',
          'Want it live right now instead? Just click Publish as usual.',
          'Once the page publishes itself, the date clears on its own, so it never publishes twice.',
        ],
      },
      { kind: 'h', text: 'Share a draft with someone' },
      {
        kind: 'p',
        text: 'Sometimes a pastor or a committee chair needs to read a page **before** it is public. You do not have to publish it and you do not have to make them a Studio account.',
      },
      {
        kind: 'steps',
        items: [
          'Open the page you want them to see.',
          'Click the **three dots** beside the Publish button and choose **Copy share link**.',
          'Paste the link into an email or a text message.',
        ],
      },
      {
        kind: 'p',
        text: 'They open it and see the page exactly as your draft has it, with no login. The public website has not changed at all.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'The link stops working after about an hour',
        text: 'That is on purpose, so an old link cannot circulate. If they get to it late and it says the link is invalid, just click **Copy share link** again and send a fresh one. There is no limit on how many you make.',
      },
      {
        kind: 'callout',
        tone: 'caution',
        title: 'Treat it like a private link',
        text: 'Anyone holding the link can read that draft. Send it to the person who needs it, not to a public group.',
      },
      {
        kind: 'seealso',
        items: ['Start here: how it all works', "Edit a page's words & photos"],
      },
    ],
  },

  // 13 ---------------------------------------------------------------------
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
          'The domain itself, or email and DNS settings. (Changing one page address is now yours: see Renamed links keep working.)',
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
