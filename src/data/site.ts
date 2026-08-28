// Safe to edit by hand
// Static identity values that don't change between deploys.
// REPLACE the two placeholders below before launch (or run `node scripts/rebrand.mjs`
// with your bootstrap.config.json — see docs/bootstrap/NEW-PROJECT.md).
// Content editors update everything else through Sanity — see src/sanity/ and src/lib/queries.ts.

/**
 * Derive a localStorage key prefix from the church name.
 * "First Church of Springfield" -> "first-church-of-springfield"
 *
 * This keeps storageKeyPrefix and themeStorageKey in sync with the name
 * automatically. rebrand.mjs does not need to stamp these fields separately
 * and they can never drift apart across reskins.
 */
function slugifyName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// rebrand.mjs rewrites the two quoted strings on `name:` and `domain:` below.
// All derived fields (studio, url, storageKeyPrefix, themeStorageKey) are
// computed from those two values at module load time and are never rewritten
// by the script.
const _name   = "First Church of Springfield";
const _domain = "example-church.org";
const _slug   = slugifyName(_name);

export const site = {
  name: _name,
  /** Short alias kept for any consumer that accessed the old `site.studio` property. */
  studio: _name,
  domain: _domain,
  url: `https://www.${_domain}`,
  /**
   * localStorage key prefix derived from the church name — e.g.
   * "first-church-of-springfield". Never needs to be touched by rebrand.mjs;
   * updates automatically when the name is stamped.
   */
  storageKeyPrefix: _slug,
  /**
   * localStorage key for theme preference — e.g.
   * "first-church-of-springfield-theme". Derived from name; always in sync.
   */
  themeStorageKey: _slug + '-theme',

  // BCP 47 language tag for the <html lang> attribute.
  // Change to match the site's primary language if not English.
  lang: "en",

  // The text wordmark rendered in the header, footer, and mobile menu.
  // Two stacked lines (e.g. "First Presbyterian" / "Church of Springfield").
  // Set line2 to an empty string for a single-line wordmark.
  wordmark: {
    line1: "First Church",
    line2: "of Springfield",
  },

  // NOTE: contact details (email, pastoral email, phone, address, office hours)
  // and social profile URLs intentionally do NOT live here. They live ONLY in
  // Sanity siteSettings and resolve through src/lib/siteSettings.ts
  // (resolveSiteSettings). A second hardcoded copy is exactly what lets an
  // empty or changed Sanity field get silently masked on the live site.

  // Brand colors are declared in src/styles/globals.css (@theme block).
  // Mirrored here for scripts that need them outside CSS (OG generator,
  // structured data). Keep the two in sync when you reskin.
  brandColors: {
    primary: "#8A6A43",       // Bronze
    primaryDark: "#6B4F2E",   // Bronze Dark
    accent: "#36302A",        // Espresso Ink
    accentDark: "#241F1A",    // Espresso Dark
    secondary: "#B9A590",     // Clay
    tertiary: "#A89A86",      // Warm Stone
    bg: "#ECE4DA",            // Paper (warm cream)
    bgSoft: "#F6F3EC",        // Paper Soft
    border: "#DED6C8",        // Warm Border
    chapel: "#1E423B",        // Chapel green — utility bar, footer, CTA
    chapelDeep: "#16322C",    // Chapel green, deepest base
    gold: "#A07D45",          // Liturgical gold accent
  },

  // Static asset paths under public/
  assets: {
    ogDefault: "/og-default.png",
    favicon: "/favicon.png",
  },

  // Public repo URL (used in footer credit if shown)
  repo: "",
} as const;

export type Site = typeof site;
