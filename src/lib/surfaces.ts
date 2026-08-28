// Safe to edit by hand
// =============================================================================
// Section appearance: the designed surface and accent pairs (2026-08-28)
// =============================================================================
// PORTS.md card 26. ONE source of truth for the "how does this section look"
// controls an editor gets. Read by three places that must never drift:
//
//   1. src/components/SectionShell.astro - turns a chosen value into classes.
//   2. src/sanity/components/SwatchInput.tsx - draws the colour dots in the
//      Studio, which cannot reach globals.css at runtime and therefore needs
//      literal hexes.
//   3. src/lib/surfaces.test.ts - the CONTRAST GATE. It resolves every
//      `tokens` entry against the real declarations in src/styles/globals.css,
//      measures each pair in BOTH themes, and fails below WCAG AA. It also
//      asserts that the literal `dot` hexes still equal the resolved token
//      values, so the Studio swatch can never quietly disagree with the site.
//
// A surface is a PAIR, designed as one unit: a background plus the foreground
// treatment that belongs on it. There is no colour picker and no free text.
// Every value here resolves in BOTH themes, either because its tokens are
// theme-aware (`default`, `warm`, `card`) or because the band is deliberately
// theme-static (`chapel`, `chapelDeep`, `ink` - the same slab on a light or a
// dark page, exactly like the footer).
//
// STORED VALUES ARE LOAD-BEARING. `default`, `warm`, `chapel` and `chapelDeep`
// predate this file and are in every dataset built from this template; their
// values and their emitted classes are unchanged. `card` and `ink` are the
// additions. `scripts/page-parity.mjs` is the standing gate on that promise.
//
// THIS FILE IS BRAND-SPECIFIC, not PORTABLE. A fork that runs `npm run rebrand`
// and swaps the @theme palette must revisit the literal hexes here; the
// contrast gate is what tells it to.
// =============================================================================

export type SurfaceValue = 'default' | 'warm' | 'card' | 'chapel' | 'chapelDeep' | 'ink';

export interface SurfacePair {
  value: SurfaceValue;
  /** Editor-facing label (Studio radio + swatch caption). */
  title: string;
  /** One-line plain-language hint under the swatch row. */
  hint: string;
  /** Exactly what SectionShell puts on the <section>. */
  className: string;
  /** Light-theme background, as a literal, for the Studio dot. */
  dot: string;
  /** Dark-theme background, as a literal, for the Studio dot's lower half. */
  dotDark: string;
  /** Literal ink shown ON the dot, so the dot previews the PAIR not the fill. */
  dotInk: string;
  /**
   * CSS custom properties this surface resolves to, by role. The test reads
   * these out of globals.css per theme; nothing here is a copy of a colour.
   */
  tokens: {
    bg: string;
    text: string;
    heading: string;
    link: string;
  };
  /**
   * True when the band is the same colour in both themes (an @theme token with
   * no `.dark` override). The accent pinning in globals.css keys off these, and
   * the block components' DARK_SURFACES sets list exactly these values.
   */
  themeStatic?: boolean;
}

/**
 * The six surfaces, in the order the Studio shows them: three that follow the
 * reader's theme, then three fixed bands from light to dark.
 */
export const SECTION_SURFACES: SurfacePair[] = [
  {
    value: 'default',
    title: 'Paper',
    hint: 'The ordinary page surface.',
    className: 'bg-background text-foreground',
    dot: '#ECE4DA',
    dotDark: '#1C1813',
    dotInk: '#36302A',
    tokens: { bg: '--background', text: '--foreground', heading: '--foreground', link: '--link' },
  },
  {
    value: 'warm',
    title: 'Warm',
    hint: 'A quiet step away from the page, for a change of pace.',
    className: 'surface-warm bg-muted text-foreground',
    dot: '#F1EBE0',
    dotDark: '#262019',
    dotInk: '#36302A',
    tokens: { bg: '--muted', text: '--foreground', heading: '--foreground', link: '--link' },
  },
  {
    value: 'card',
    title: 'Bright card',
    hint: 'The clean raised surface. Good above or below a warm band.',
    className: 'bg-card text-card-foreground',
    dot: '#FBF8F2',
    dotDark: '#2A231B',
    dotInk: '#36302A',
    tokens: {
      bg: '--card',
      text: '--card-foreground',
      heading: '--card-foreground',
      link: '--link',
    },
  },
  {
    value: 'chapel',
    title: 'Chapel green',
    hint: 'The signature green band. Always green, light page or dark.',
    className: 'bg-chapel text-chapel-foreground',
    dot: '#1E423B',
    dotDark: '#1E423B',
    dotInk: '#F1EAD9',
    themeStatic: true,
    tokens: {
      bg: '--color-chapel',
      text: '--color-chapel-foreground',
      heading: '--color-chapel-foreground',
      link: '--color-chapel-foreground',
    },
  },
  {
    value: 'chapelDeep',
    title: 'Chapel deep',
    hint: 'The deepest green. For a closing band you want to feel heavy.',
    className: 'bg-chapel-deep text-chapel-foreground',
    dot: '#16322C',
    dotDark: '#16322C',
    dotInk: '#F1EAD9',
    themeStatic: true,
    tokens: {
      bg: '--color-chapel-deep',
      text: '--color-chapel-foreground',
      heading: '--color-chapel-foreground',
      link: '--color-chapel-foreground',
    },
  },
  {
    value: 'ink',
    title: 'Ink',
    hint: 'A near-black band. Use it once on a page, not twice.',
    className: 'surface-ink text-chapel-foreground',
    dot: '#241F1A',
    dotDark: '#241F1A',
    dotInk: '#F1EAD9',
    themeStatic: true,
    tokens: {
      bg: '--color-accent-dark',
      text: '--color-chapel-foreground',
      heading: '--color-chapel-foreground',
      link: '--color-chapel-foreground',
    },
  },
];

export const SURFACE_BY_VALUE: Record<string, SurfacePair> = Object.fromEntries(
  SECTION_SURFACES.map((s) => [s.value, s]),
);

/** The class list SectionShell emits for a stored tone value. */
export function surfaceClass(value?: string | null): string {
  return (SURFACE_BY_VALUE[String(value ?? '')] ?? SURFACE_BY_VALUE.default).className;
}

/**
 * The tone values that are a FIXED dark slab in both themes.
 *
 * Block components that force their Portable Text body to `text-current` have
 * to test against this set, not against a hand-written list of two greens: the
 * "ink" band joined them on 2026-08-28 and a stale list leaves light-mode ink
 * on a near-black slab.
 */
export const DARK_SURFACES: ReadonlySet<string> = new Set(
  SECTION_SURFACES.filter((s) => s.themeStatic).map((s) => s.value),
);

// -----------------------------------------------------------------------------
// Accents
// -----------------------------------------------------------------------------
// An accent is the section's small colour: the accent word inside a heading and
// the fill on any primary pill inside the section. It is wired ONE place
// (SectionShell adds a class; globals.css redefines the custom properties the
// whole subtree already reads), so no block component needed a colour edit.
//
// `bronze` is the site's existing look and emits NO class, which is what keeps
// every already-published section byte-identical.

export type AccentValue = 'bronze' | 'chapel' | 'ink';

export interface AccentChoice {
  value: AccentValue;
  title: string;
  hint: string;
  /** Class SectionShell adds, or null for the default (emit nothing). */
  className: string | null;
  /** Token the heading accent word reads on theme-aware surfaces. */
  ruleToken: string;
  /** Literal light/dark values of `ruleToken`, for the Studio dot. */
  dot: string;
  dotDark: string;
  /** Pinned accent colour on the theme-static bands (chapel / chapelDeep / ink). */
  onDarkBand: string;
  /** Static pill fill and its hover, and the ink the fill carries. */
  fill: string;
  fillHover: string;
  /**
   * The pill's label colour. Always white here, because the pill renders
   * `text-primary-foreground` and that token is #FFFFFF in both themes; an
   * accent only re-points the FILL.
   */
  fillInk: string;
}

export const SECTION_ACCENTS: AccentChoice[] = [
  {
    value: 'bronze',
    title: 'Bronze',
    hint: 'The house accent.',
    className: null,
    ruleToken: '--primary',
    dot: '#8A6A43',
    dotDark: '#C7A875',
    onDarkBand: '#C7A875',
    fill: '#8A6A43',
    fillHover: '#6B4F2E',
    fillInk: '#FFFFFF',
  },
  {
    value: 'chapel',
    title: 'Chapel green',
    hint: 'The stained-glass green. Quieter and more liturgical than bronze.',
    className: 'accent-chapel',
    ruleToken: '--chapel-ink',
    dot: '#1E423B',
    dotDark: '#6FA99A',
    onDarkBand: '#8FC3B2',
    fill: '#1E423B',
    fillHover: '#16322C',
    fillInk: '#FFFFFF',
  },
  {
    value: 'ink',
    title: 'Ink',
    hint: 'No colour at all. The quietest option.',
    className: 'accent-ink',
    ruleToken: '--foreground',
    dot: '#36302A',
    dotDark: '#ECE4DA',
    onDarkBand: '#F1EAD9',
    fill: '#241F1A',
    fillHover: '#16120F',
    fillInk: '#FFFFFF',
  },
];

export const ACCENT_BY_VALUE: Record<string, AccentChoice> = Object.fromEntries(
  SECTION_ACCENTS.map((a) => [a.value, a]),
);

/** The class SectionShell emits for a stored accent value, or null. */
export function accentClass(value?: string | null): string | null {
  return ACCENT_BY_VALUE[String(value ?? '')]?.className ?? null;
}

/** Studio option lists, so the schema and the swatch input cannot disagree. */
export const SURFACE_OPTIONS = SECTION_SURFACES.map((s) => ({ title: s.title, value: s.value }));
export const ACCENT_OPTIONS = SECTION_ACCENTS.map((a) => ({ title: a.title, value: a.value }));
