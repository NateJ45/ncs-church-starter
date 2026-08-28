// Foundation, edit with care
// Single source of truth for resolving the Sanity siteSettings document into the
// identity / contact / social values the header, footer, pages, and JSON-LD all
// render.
//
// Why this exists: every consumer used to re-implement its own
// `siteSettings?.field ?? site.contact.field` resolution. Four copies drifted
// (the footer office-hours never read Sanity at all; the JSON-LD YouTube link was
// hardcoded; the header showed two socials, the footer three). Worse, the
// `?? site.*` fallbacks meant an empty Sanity field silently rendered the
// hardcoded value in src/data/site.ts, so you could never tell from the page
// whether Sanity was actually driving the content.
//
// Rule now: NO component or page reads siteSettings identity/contact/social fields
// directly, and NOTHING imports site.contact / site.social (both deleted). Call
// resolveSiteSettings(raw) and read from the returned object. There is exactly one
// place — here — that decides what each field resolves to:
//
//   - Required identity (church name, email, phone, address, socials): read
//     straight from Sanity. Empty stays empty (renders blank) so a missing value
//     is visible, never masked by a hardcoded default.
//   - Hide-when-empty (officeHours): undefined when blank; callers hide the
//     element rather than show a stand-in.
//   - Derived-from-Sanity defaults (mission -> tagline, pastorEmail -> public
//     email, give link -> /give page, watch link -> /sermons page): a sensible
//     value computed from OTHER Sanity fields or an internal route, never from a
//     hardcoded church-specific literal.
//
// brandName is the one exception that still falls back to src/data/site.ts
// (site.name): the church name is a required Sanity field, so the fallback is an
// unreachable crash-guard, and site.name remains the static identity used by
// <title>/OG meta in BaseLayout.

//
// The MENUS resolve here too. The header and the footer each used to carry
// their own FALLBACK_* table and their own "map Sanity into the render shape"
// function, which is the same drift trap the identity fields were in: two
// copies of "what the menu is when Sanity is empty". Now there is one, and a
// component reads settings.headerNav / settings.footerColumns /
// settings.legalNav / settings.headerCta and renders.

import { site } from '@/data/site';
import type { WorshipService } from './serviceTime';
import { navHref, resolveNavLinks, type RawNavLink, type ResolvedNavLink } from '@/lib/nav-href';

/** One header menu entry: a plain link, or a dropdown group of links. */
export type NavItem =
  | { kind: 'flat'; label: string; href: string }
  | { kind: 'dropdown'; label: string; items: ResolvedNavLink[] };

/** One titled column of footer links. */
export interface FooterColumn {
  title: string;
  links: (ResolvedNavLink & { external?: boolean })[];
}

/** The header's single button. */
export interface HeaderCta {
  show: boolean;
  label: string;
  href: string;
}

/** A header menu entry as it comes from Sanity: a navLink, or a navGroup. */
export interface RawNavItem extends RawNavLink {
  links?: (RawNavLink | null)[] | null;
}

/** A footer column as it comes from Sanity. */
export interface RawFooterColumn {
  title?: string | null;
  links?: (RawNavLink | null)[] | null;
}

/**
 * Built-in default menu. Renders when Site Settings -> Top menu links is empty,
 * so a fresh clone of the template still has a sensible header.
 */
export const FALLBACK_NAV_ITEMS: NavItem[] = [
  { kind: 'flat', label: "I'm New", href: '/worship' },
  {
    kind: 'dropdown',
    label: 'About Us',
    items: [
      { label: 'What We Believe', href: '/what-we-believe' },
      { label: 'Music', href: '/music' },
      { label: 'Pastors & Staff', href: '/pastor-staff' },
    ],
  },
  {
    kind: 'dropdown',
    label: 'Get Involved',
    items: [
      { label: 'Grow', href: '/grow' },
      { label: 'Serve', href: '/serve' },
      { label: 'Kids', href: '/kids' },
      { label: 'Food Ministry', href: '/food' },
    ],
  },
  { kind: 'flat', label: 'Watch', href: '/sermons' },
  { kind: 'flat', label: 'Events', href: '/events' },
  {
    kind: 'dropdown',
    label: 'Space',
    items: [
      { label: 'Use Our Space', href: '/use-our-space' },
      { label: 'Weddings', href: '/weddings' },
      { label: 'Friends of the Church', href: 'https://example.org' },
    ],
  },
  { kind: 'flat', label: 'Contact', href: '/contact' },
];

/** Built-in header button. One unambiguous ask. */
export const FALLBACK_HEADER_CTA: HeaderCta = {
  show: true,
  label: 'Plan a Visit',
  href: '/worship',
};

/** The raw siteSettings fields this resolver consumes (from getSiteSettings()). */
export interface RawSiteSettings {
  title?: string | null;
  tagline?: string | null;
  mission?: string | null;
  email?: string | null;
  pastorEmail?: string | null;
  phone?: string | null;
  officeHours?: string | null;
  addressLine?: string | null;
  cityStateZip?: string | null;
  /** Decimal latitude of the building. Set in Studio via right-click on Google Maps. */
  geoLat?: number | null;
  /** Decimal longitude of the building. Set in Studio via right-click on Google Maps. */
  geoLng?: number | null;
  worshipService?: WorshipService | null;
  giveUrl?: string | null;
  watchUrl?: string | null;
  /** Optional integrations appended to the built-in "Connect" footer column. */
  appUrl?: string | null;
  directoryUrl?: string | null;
  prayerUrl?: string | null;
  socialInstagram?: string | null;
  socialFacebook?: string | null;
  socialYoutube?: string | null;
  /** Optional logo image. When set it replaces the typed wordmark. */
  logo?: { asset?: { _ref?: string; _id?: string } | null; alt?: string | null } | null;
  navItems?: RawNavItem[] | null;
  footerColumns?: RawFooterColumn[] | null;
  legalNav?: (RawNavLink | null)[] | null;
  headerCta?: { show?: boolean | null; label?: string | null; link?: RawNavLink | null } | null;
  /** Undefined means YES: an untouched site keeps showing these. */
  showEmail?: boolean | null;
  showSocials?: boolean | null;
  showFooterSocials?: boolean | null;
}

export interface ResolvedSiteSettings {
  /** Church name. Required in Sanity; site.name is an unreachable crash-guard. */
  brandName: string;
  tagline: string;
  /** Footer mission line. Falls back to the tagline when unset. */
  mission: string;
  /** Public email. Empty string when unset (callers guard with `email &&`). */
  email: string;
  /** Pastoral-care email. Falls back to the public email when unset. */
  pastorEmail: string;
  /** Public phone. Empty string when unset (callers guard with `phone &&`). */
  phone: string;
  /** Office hours. undefined when unset — hide the element, don't substitute. */
  officeHours?: string;
  addressLine: string;
  cityStateZip: string;
  /** "123 Main Street, Springfield, IL 62701" for maps + structured data. */
  fullAddress: string;
  /** Google Maps directions link built from the resolved address. */
  mapHref: string;
  /**
   * Parsed city from cityStateZip (format "City, ST 12345"). undefined when
   * the string is absent or does not match the expected format. Used only for
   * structured data; callers should handle undefined gracefully.
   */
  addressLocality?: string;
  /**
   * Parsed two-letter state code from cityStateZip. undefined when absent or
   * unparseable.
   */
  addressRegion?: string;
  /**
   * Parsed ZIP/postal code from cityStateZip. undefined when absent or
   * unparseable.
   */
  postalCode?: string;
  /**
   * Latitude from Sanity siteSettings.geoLat. undefined when not set.
   * The structured-data builder omits the geo block entirely when this is absent.
   */
  geoLat?: number;
  /**
   * Longitude from Sanity siteSettings.geoLng. undefined when not set.
   * The structured-data builder omits the geo block entirely when this is absent.
   */
  geoLng?: number;
  /** Passed straight through to serviceTime() for the display strings. */
  worshipService: WorshipService | null;
  /** Where the "Give" button points: the giving portal, else the /give page. */
  giveHref: string;
  /** Where "Watch" points: the livestream URL, else the /sermons page. */
  watchHref: string;
  social: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  /** Logo image for the header. undefined keeps the typed wordmark. */
  logo?: { asset?: { _ref?: string; _id?: string } | null; alt?: string | null };
  /** Header menu. Falls back to FALLBACK_NAV_ITEMS when Sanity has none. */
  headerNav: NavItem[];
  /** The header's single button, already resolved to a label + href. */
  headerCta: HeaderCta;
  /** Show the email row at the foot of the phone menu. Unset means yes. */
  showEmail: boolean;
  /** Show the social buttons in the header bar + phone menu. Unset means yes. */
  showSocials: boolean;
  /** Footer link columns. Falls back to the built-in Visit/Involved/Connect. */
  footerColumns: FooterColumn[];
  /**
   * Small-print row at the very bottom. EMPTY when unset — the footer keeps its
   * own built-in markup there, because its two built-in links (Give, Privacy
   * policy) carry different link styles and a mapped list would change the
   * rendered bytes of an untouched site.
   */
  legalNav: ResolvedNavLink[];
  /** Show the footer's social buttons. Unset means yes. */
  showFooterSocials: boolean;
}

const DEFAULT_TAGLINE = 'Loving God and loving our neighbors in the heart of Springfield.';

/** Trim a Sanity string; treat blank/whitespace-only/missing as "unset". */
function clean(value?: string | null): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * Parse a "City, ST 12345" string into its three parts.
 * The expected format is: one or more words, a comma, a space, exactly two
 * uppercase letters, a space, and five (or five-plus-four) digits.
 * Returns undefined for each part that cannot be reliably derived.
 *
 * Examples:
 *   "Springfield, IL 62701"  → { locality: "Springfield", region: "IL", postal: "62701" }
 *   "New York, NY 10001-0001"→ { locality: "New York",    region: "NY", postal: "10001-0001" }
 *   "Downtown"               → { locality: undefined,     region: undefined, postal: undefined }
 */
function parseCityStateZip(raw?: string): { locality?: string; region?: string; postal?: string } {
  if (!raw) return {};
  // Accepts "City Name, XX 12345" or "City Name, XX 12345-6789"
  const match = raw.match(/^(.+?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
  if (!match) return {};
  return { locality: match[1].trim(), region: match[2], postal: match[3] };
}

/**
 * A toggle that is ON until someone turns it off. Sanity `initialValue` only
 * fills NEW documents, so a live singleton has no value for these fields at
 * all — undefined has to mean "yes" in code or the header would quietly lose
 * its email and socials the moment the field was added.
 */
function onUnlessOff(value?: boolean | null): boolean {
  return value !== false;
}

/**
 * Map the editor-managed top menu into the {kind} shape the header render and
 * MobileNav both consume. navGroup -> dropdown, navLink -> flat. Entries with
 * no label, or whose destination resolves to nothing, are dropped so a
 * half-filled row can't put a dead link in the menu. Returns null when nothing
 * usable is set, so the caller falls back to the built-in menu.
 */
function navFromSettings(items?: RawNavItem[] | null): NavItem[] | null {
  if (!Array.isArray(items) || items.length === 0) return null;
  const mapped: NavItem[] = [];
  for (const item of items) {
    if (item?._type === 'navGroup') {
      const children = resolveNavLinks(item.links);
      if (item.label && children.length > 0) {
        mapped.push({ kind: 'dropdown', label: item.label, items: children });
      }
      continue;
    }
    const href = navHref(item);
    if (item?.label && href) {
      mapped.push({ kind: 'flat', label: item.label, href });
    }
  }
  return mapped.length > 0 ? mapped : null;
}

/** Same idea for the footer's titled columns. */
function footerColumnsFromSettings(cols?: RawFooterColumn[] | null): FooterColumn[] | null {
  if (!Array.isArray(cols) || cols.length === 0) return null;
  const mapped: FooterColumn[] = [];
  for (const col of cols) {
    const links = resolveNavLinks(col?.links);
    if (col?.title && links.length > 0) mapped.push({ title: col.title, links });
  }
  return mapped.length > 0 ? mapped : null;
}

/**
 * Built-in footer index, grouped to mirror the header IA. It is a function
 * rather than a constant because the "Connect" column grows by whatever
 * optional integrations (church app, member directory, prayer card) the same
 * settings document carries.
 */
function fallbackFooterColumns(s: RawSiteSettings): FooterColumn[] {
  return [
    {
      title: 'Visit',
      links: [
        { label: 'Plan a Visit', href: '/worship' },
        { label: 'Watch Sermons', href: '/sermons' },
        { label: 'What We Believe', href: '/what-we-believe' },
        { label: 'Music', href: '/music' },
        { label: 'Events', href: '/events' },
      ],
    },
    {
      title: 'Get Involved',
      links: [
        { label: 'Grow', href: '/grow' },
        { label: 'Serve', href: '/serve' },
        { label: 'Kids', href: '/kids' },
        { label: 'Food Ministry', href: '/food' },
      ],
    },
    {
      title: 'Connect',
      links: [
        { label: 'Pastors & Staff', href: '/pastor-staff' },
        { label: 'Use Our Space', href: '/use-our-space' },
        { label: 'Weddings', href: '/weddings' },
        { label: 'Contact', href: '/contact' },
        { label: 'Give', href: '/give' },
        ...(s.appUrl ? [{ label: 'Church App', href: s.appUrl, external: true }] : []),
        ...(s.directoryUrl
          ? [{ label: 'Member Directory', href: s.directoryUrl, external: true }]
          : []),
        ...(s.prayerUrl ? [{ label: 'Prayer Request', href: s.prayerUrl, external: true }] : []),
      ],
    },
  ];
}

export function resolveSiteSettings(raw?: RawSiteSettings | null): ResolvedSiteSettings {
  const s = raw ?? {};

  const tagline = clean(s.tagline) ?? DEFAULT_TAGLINE;
  const email = clean(s.email) ?? '';
  const addressLine = clean(s.addressLine) ?? '';
  const cityStateZip = clean(s.cityStateZip) ?? '';
  const fullAddress = [addressLine, cityStateZip].filter(Boolean).join(', ');

  // Parse city/state/ZIP for structured data. Omit fields that cannot be parsed
  // rather than emitting placeholder values.
  const parsed = parseCityStateZip(cityStateZip || undefined);

  // Geo coordinates: only include when both lat and lng are finite numbers.
  const geoLat = typeof s.geoLat === 'number' && isFinite(s.geoLat) ? s.geoLat : undefined;
  const geoLng = typeof s.geoLng === 'number' && isFinite(s.geoLng) ? s.geoLng : undefined;

  return {
    brandName: clean(s.title) ?? site.name,
    tagline,
    mission: clean(s.mission) ?? tagline,
    email,
    pastorEmail: clean(s.pastorEmail) ?? email,
    phone: clean(s.phone) ?? '',
    officeHours: clean(s.officeHours),
    addressLine,
    cityStateZip,
    fullAddress,
    mapHref: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`,
    addressLocality: parsed.locality,
    addressRegion: parsed.region,
    postalCode: parsed.postal,
    geoLat,
    geoLng,
    worshipService: s.worshipService ?? null,
    giveHref: clean(s.giveUrl) ?? '/give',
    watchHref: clean(s.watchUrl) ?? '/sermons',
    social: {
      instagram: clean(s.socialInstagram),
      facebook: clean(s.socialFacebook),
      youtube: clean(s.socialYoutube),
    },
    logo: s.logo?.asset ? s.logo : undefined,
    headerNav: navFromSettings(s.navItems) ?? FALLBACK_NAV_ITEMS,
    headerCta: {
      show: onUnlessOff(s.headerCta?.show),
      label: clean(s.headerCta?.label) ?? FALLBACK_HEADER_CTA.label,
      href: navHref(s.headerCta?.link) ?? FALLBACK_HEADER_CTA.href,
    },
    showEmail: onUnlessOff(s.showEmail),
    showSocials: onUnlessOff(s.showSocials),
    footerColumns: footerColumnsFromSettings(s.footerColumns) ?? fallbackFooterColumns(s),
    legalNav: resolveNavLinks(s.legalNav),
    showFooterSocials: onUnlessOff(s.showFooterSocials),
  };
}
