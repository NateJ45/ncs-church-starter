// Safe to edit by hand
// =============================================================================
// Section layout variants: the designed column counts and media sides
// (Appearance controls, 2026-08-28)
// =============================================================================
// ONE source of truth for the "how is this section laid out" controls, the way
// src/lib/surfaces.ts is the one source for how it is coloured. Read by three
// kinds of caller that must never drift:
//
//   1. the grid blocks in src/components/blocks/ - they ask for a class string
//      and put it on the grid element, nothing else,
//   2. src/sanity/schemaTypes/blocks.ts - the Studio radio list and the stored
//      default both come from here, so the list an editor sees and the classes
//      the site emits can never disagree,
//   3. src/lib/layout-variants.test.ts - asserts the fallback of every entry
//      emits the class string that block rendered BEFORE this file existed.
//
// THE PARITY RULE, and why this file is shaped the way it is. Four blocks
// already had a `columns` field with three hand-written class maps, and no two
// of those maps were the same: a four-across gallery starts two-up on a phone,
// four-across stats start two-up as well but skip the lg step, and four-across
// cards stay one-up until sm. Collapsing them into one formula would have been
// a visual change on live pages. So this is a REGISTRY, keyed by block type,
// holding each block's real classes verbatim. Nothing here is derived.
//
// Every `fallback` below is the value that block already defaulted to, and its
// entry in `classes` is that block's existing class string character for
// character. A section already in the dataset therefore renders byte-identical
// HTML; scripts/page-parity.mjs is what holds that line.
//
// MOBILE IS NEVER THE VARIABLE, and it is asserted rather than assumed. Each
// entry records the block's own base grid class (`baseColumns`) and what a
// 320px phone therefore resolves to (`phoneColumns`); the test replays the two
// together for EVERY option and fails if any option lands somewhere else. That
// is what lets a reflow sweep over the live pages stand in for the non-default
// values: no column choice can change what a phone renders, so there is no
// untested 320px layout hiding behind a radio button.
//
// DENSITY is deliberately NOT here. The background object's existing "Vertical
// spacing" field (compact / normal / spacious, mapped in SectionShell.astro) is
// already the density knob; a second one would be two controls fighting over
// one <section>'s padding. It is documented in the Studio guide instead.
// =============================================================================

/** One entry in a Studio radio list: what the editor reads, what gets stored. */
export interface LayoutOption {
  title: string;
  value: string;
}

interface ColumnSpec {
  /** The stored value a section with no choice renders. Emits today's classes. */
  fallback: string;
  /** The Studio radio list, in the order it is shown. */
  options: LayoutOption[];
  /** Exactly what the block puts on its grid element, per stored value. */
  classes: Record<string, string>;
  /**
   * The UNPREFIXED grid class the block's own markup already carries, copied
   * from the component. Empty where the component leaves the phone layout
   * entirely to the strings above (the gallery). Not read at runtime: it is the
   * other half of the reflow invariant below, and the test needs both halves.
   */
  baseColumns: string;
  /**
   * What a 320px phone resolves to, at EVERY option. This is the reflow
   * promise, and layout-variants.test.ts proves it by replaying
   * `baseColumns` + each option's unprefixed classes.
   */
  phoneColumns: string;
}

/** Plain-language labels. "Across" reads better to a volunteer than "columns". */
const TWO = { title: 'Two across', value: '2' };
const THREE = { title: 'Three across', value: '3' };
const FOUR = { title: 'Four across', value: '4' };

export const COLUMN_VARIANTS: Readonly<Record<string, ColumnSpec>> = {
  // --- Already had a columns field. Classes copied verbatim, defaults kept. ---
  sectionCardGrid: {
    fallback: '3',
    options: [TWO, THREE, FOUR],
    classes: {
      '2': 'sm:grid-cols-2',
      '3': 'sm:grid-cols-2 lg:grid-cols-3',
      '4': 'sm:grid-cols-2 lg:grid-cols-4',
    },
    baseColumns: 'grid-cols-1',
    phoneColumns: 'grid-cols-1',
  },
  sectionFeatureCards: {
    fallback: '3',
    options: [TWO, THREE, FOUR],
    classes: {
      '2': 'sm:grid-cols-2',
      '3': 'sm:grid-cols-2 lg:grid-cols-3',
      '4': 'sm:grid-cols-2 lg:grid-cols-4',
    },
    baseColumns: 'grid-cols-1',
    phoneColumns: 'grid-cols-1',
  },
  sectionStats: {
    fallback: '3',
    options: [TWO, THREE, FOUR],
    classes: {
      '2': 'sm:grid-cols-2',
      '3': 'sm:grid-cols-3',
      // Four numbers open two-up on a phone rather than one enormous column.
      '4': 'grid-cols-2 sm:grid-cols-4',
    },
    // StatsBlock's own element is `grid grid-cols-2 ...`, so the repeat inside
    // the four-across string is redundant. It stays because it is what the
    // block already emitted, and parity outranks tidiness here.
    baseColumns: 'grid-cols-2',
    phoneColumns: 'grid-cols-2',
  },
  sectionGallery: {
    fallback: '3',
    options: [TWO, THREE, FOUR],
    classes: {
      '2': 'grid-cols-2',
      '3': 'grid-cols-2 sm:grid-cols-3',
      '4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    },
    // GalleryBlock's own element is just `grid ...`: every option below spells
    // out the phone layout itself, and all three spell out the same one.
    baseColumns: '',
    phoneColumns: 'grid-cols-2',
  },

  // --- New here. Both grids were hard-wired to the three-across form. -------
  // Three stays the default and emits the exact string that was inline in the
  // component, so no published section moves. Two is offered because these two
  // grids commonly hold two items, and a three-across row with one empty cell
  // is the layout complaint this control exists to answer. Four is NOT offered:
  // a numbered step is a badge beside a paragraph, and a fetched card carries a
  // title, a meta line and a summary. Neither survives a quarter-width column.
  sectionSteps: {
    fallback: '3',
    options: [TWO, THREE],
    classes: {
      '2': 'sm:grid-cols-2',
      '3': 'sm:grid-cols-2 lg:grid-cols-3',
    },
    baseColumns: 'grid-cols-1',
    phoneColumns: 'grid-cols-1',
  },
  sectionDynamicList: {
    fallback: '3',
    options: [TWO, THREE],
    classes: {
      '2': 'sm:grid-cols-2',
      '3': 'sm:grid-cols-2 lg:grid-cols-3',
    },
    baseColumns: 'grid-cols-1',
    phoneColumns: 'grid-cols-1',
  },
};

/**
 * The responsive column classes for one section, for the value an editor chose.
 *
 * Unknown block type, unset value, or a value outside the list all resolve to
 * that block's fallback, which is what an already-published section stores
 * (nothing) and therefore what it renders.
 */
export function columnsClass(type: string, value: unknown): string {
  const spec = COLUMN_VARIANTS[type];
  if (!spec) return '';
  const key = typeof value === 'string' ? value : '';
  return spec.classes[key] ?? spec.classes[spec.fallback];
}

/** The Studio radio list for one section's column control. */
export function columnOptions(type: string): LayoutOption[] {
  return COLUMN_VARIANTS[type]?.options ?? [];
}

/** The stored default for one section's column control. */
export function columnFallback(type: string): string {
  return COLUMN_VARIANTS[type]?.fallback ?? '';
}

/**
 * The two-value radio for a block that pairs one piece of media with text.
 *
 * The stored values ('left' / 'right') and the field names (`imageSide` on the
 * image + text block, `mediaSide` on the media feature) predate this file and
 * are in the dataset, so neither changes. What comes from here is the WORDING,
 * so the two blocks stop offering a bare "Left / Right" that does not say what
 * moves. Labels are Studio-only and touch no rendered markup.
 */
export function sideOptions(noun: string): LayoutOption[] {
  return [
    { title: `${noun} on the left`, value: 'left' },
    { title: `${noun} on the right`, value: 'right' },
  ];
}
