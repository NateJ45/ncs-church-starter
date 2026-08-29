// =============================================================================
// section-fields - which sections carry which in-canvas controls (2026-08-28)
// =============================================================================
// The in-canvas overlay (the floating controls that hover over a section in the
// Presentation preview) has to answer one question before it draws anything:
// DOES THIS SECTION ACTUALLY HAVE THIS FIELD? A surface card over a section
// whose type has no `background` field would write a field the schema does not
// know about, and an editor would click a colour and see nothing happen.
//
// The overlay cannot ask the Studio's schema for the answer. It runs inside the
// preview iframe, in the site's own bundle, and the schema lives in the parent
// window. So the answer is a REGISTRY, here, and the registry is kept honest by
// src/lib/section-fields.test.ts, which reads the schema file, Sections.astro,
// SectionShell.astro and every block component, and FAILS if a section gains or
// loses one of these fields, or if a surface stops painting the classes this
// layer swaps. Same discipline as the contrast gate in surfaces.test.ts: the
// duplicated knowledge is allowed only because a test measures the duplicate.
//
// This file also holds the PURE decisions the in-canvas controls make - which
// control an element gets, which field a text card writes to, which heading an
// accent word is matched against - so that the React components in
// src/components/preview/overlay/ are left holding only what a browser has to
// do.
//
// THIS TEMPLATE'S OWN VOCABULARY. It is not WCP's and it is not presacademy's:
//   - the surface and the accent are TWO fields on ONE object, `background`,
//     from `bgField()` in src/sanity/schemaTypes/blocks.ts. Their paths are
//     `...background.tone` and `...background.accent`, one level deeper than a
//     section field. The values come from src/lib/surfaces.ts and are never
//     re-listed here;
//   - `sectionForm` and `embed` carry no `bgField()` at all, so they get no
//     card;
//   - `headingAccent` sits on five section types, and `sectionCtaBand` calls
//     its heading `headline` while the other four call it `heading`;
//   - seven plain-string support fields have a `<name>Rich` twin, all of them
//     directly on the section object (this schema has no nested row twins);
//   - the hero is a set of FLAT document fields (`heroEyebrow`,
//     `heroHeadline`, `heroSubhead`), not a `hero` object.
// =============================================================================

// Explicit .ts extensions: this module is reached by `node --test` (see
// section-fields.test.ts), which resolves ESM specifiers literally.
import { plain } from './nav-href.ts';
import { hasInlineRich, inlineRichRuns, type InlineRun } from './inline-rich.ts';
import { normalizeRuns } from './inline-rich-write.ts';
import {
  ACCENT_BY_VALUE,
  SECTION_ACCENTS,
  SECTION_SURFACES,
  SURFACE_BY_VALUE,
  type AccentChoice,
  type SurfacePair,
} from './surfaces.ts';
import { parseSanityPath, readSectionPath, sectionByKey, type PathSegment } from './sanity-path.ts';

// -----------------------------------------------------------------------------
// The page-builder arrays
// -----------------------------------------------------------------------------

/**
 * THIS TEMPLATE HAS TWO. Page singletons keep their sections in
 * `flexibleSections`; the generic `page` document keeps them in `sections`.
 * Both are real, both reach the same renderer, and src/lib/preview-edit-attr.ts
 * makes the same split for the `data-sanity` attributes.
 *
 * `readSectionPath` is canonical and TAKES these names rather than baking any
 * in, so the repo's own list lives here with the rest of its vocabulary.
 */
export const SECTION_ARRAY_FIELDS: readonly string[] = ['flexibleSections', 'sections'];

// -----------------------------------------------------------------------------
// The section background object
// -----------------------------------------------------------------------------

/** The object `bgField()` declares, and the two fields inside it this layer sets. */
export const BACKGROUND_FIELD = 'background';
export const SURFACE_FIELD = 'tone';
export const ACCENT_FIELD = 'accent';

/**
 * Every section type carrying `bgField()`, in the order it appears in
 * src/sanity/schemaTypes/blocks.ts.
 *
 * `sectionForm` is NOT here and neither is `embed`: they have no background
 * object, and Sections.astro renders them unwrapped, outside SectionShell.
 */
export const APPEARANCE_SECTION_TYPES: readonly string[] = [
  'sectionRichText',
  'sectionImageText',
  'sectionCardGrid',
  'sectionQuote',
  'sectionCtaBand',
  'sectionFeatureCards',
  'sectionStats',
  'sectionAccordion',
  'sectionGallery',
  'sectionSteps',
  'sectionLogos',
  'sectionMediaFeature',
  'sectionDynamicList',
  'sectionArchShowcase',
  'sectionFaqList',
];

/**
 * The surface a section wears when nobody has picked one. Sections.astro passes
 * `defaultTone` into SectionShell, and the quote and the CTA band were green
 * bands before the control existed, so they still are. A card that showed
 * "Paper" ticked on a green band would be lying about what the page renders.
 */
export const DEFAULT_SURFACE_BY_TYPE: Readonly<Record<string, string>> = {
  sectionQuote: 'chapel',
  sectionCtaBand: 'chapel',
};

/** The surface a type falls back to. */
export function defaultSurfaceFor(type?: string | null): string {
  return DEFAULT_SURFACE_BY_TYPE[String(type ?? '')] ?? 'default';
}

/** True when this section type has a background object an editor may set. */
export function hasAppearance(type?: string | null): boolean {
  return APPEARANCE_SECTION_TYPES.includes(String(type ?? ''));
}

/** The `background` object as stored, or null. */
function backgroundOf(section?: Record<string, unknown> | null): Record<string, unknown> | null {
  const value = section?.[BACKGROUND_FIELD];
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

/**
 * True when this INSTANCE is painting a photo or a video behind itself.
 *
 * THE PER-INSTANCE GATE. SectionShell reads `hasMedia ? 'text-white' :
 * surfaceClass(tone)`, so a section with a background image or video does not
 * wear its surface classes at all: the surface is stored, and ignored. Offering
 * the six surfaces there would put a knob on something that cannot wear it, so
 * the card hides that half and says why. The ACCENT is unaffected - SectionShell
 * emits `accentClass` either way - so that half stays.
 */
export function hasMediaBackground(section?: Record<string, unknown> | null): boolean {
  const background = backgroundOf(section);
  if (!background) return false;
  const image = background.image as { asset?: unknown } | null | undefined;
  const videoUrl = background.videoUrl;
  return Boolean(image?.asset) || (typeof videoUrl === 'string' && plain(videoUrl) !== '');
}

/** Does the SURFACE half of the card apply to this section instance? */
export function surfaceApplies(
  type?: string | null,
  section?: Record<string, unknown> | null,
): boolean {
  return hasAppearance(type) && !hasMediaBackground(section);
}

/** Does the ACCENT half apply? Carrying the field is enough; it always paints. */
export function accentApplies(type?: string | null): boolean {
  return hasAppearance(type);
}

/** The surface this section renders right now, resolved through its default. */
export function storedSurface(
  type?: string | null,
  section?: Record<string, unknown> | null,
): string {
  const raw = plain(backgroundOf(section)?.[SURFACE_FIELD] as string | undefined);
  return raw && SURFACE_BY_VALUE[raw] ? raw : defaultSurfaceFor(type);
}

/** The accent this section renders right now. Bronze is the house default. */
export function storedAccent(section?: Record<string, unknown> | null): string {
  const raw = plain(backgroundOf(section)?.[ACCENT_FIELD] as string | undefined);
  return raw && ACCENT_BY_VALUE[raw] ? raw : 'bronze';
}

/** The six surfaces, straight from src/lib/surfaces.ts. Never re-listed here. */
export function surfaceChoices(): readonly SurfacePair[] {
  return SECTION_SURFACES;
}

/** The three accents, straight from src/lib/surfaces.ts. */
export function accentChoices(): readonly AccentChoice[] {
  return SECTION_ACCENTS;
}

// -----------------------------------------------------------------------------
// The accent word in a heading
// -----------------------------------------------------------------------------
// `headingAccentField()` is on five section types. Four of them call the heading
// it is matched against `heading`; `sectionCtaBand` calls its `headline`. The
// hero's long-standing `heroKeyword` and `heroScriptAccent` are the same idea
// under different names on a different document, and are deliberately NOT
// offered here: this layer covers the field card 26 added, and the drift gate
// counts it, so a sixth one cannot appear without somebody deciding to add it.

/** Section type -> the heading field its accent word is matched against. */
export const HEADING_FIELD_BY_TYPE: Readonly<Record<string, string>> = {
  sectionRichText: 'heading',
  sectionCardGrid: 'heading',
  sectionCtaBand: 'headline',
  sectionFeatureCards: 'heading',
  sectionMediaFeature: 'heading',
};

/** The accent field's name, the same on all five. */
export const HEADING_ACCENT_FIELD = 'headingAccent';

/** The heading field on this type, or '' when the type carries no accent word. */
export function headingFieldFor(type?: string | null): string {
  return HEADING_FIELD_BY_TYPE[String(type ?? '')] ?? '';
}

/**
 * Does the word picker apply to this section instance?
 *
 * A SECOND PER-INSTANCE GATE. `splitHeadingAccent` needs a heading to search,
 * and every one of the five blocks renders its heading only when the field
 * holds something. An empty heading means there are no words to offer, so the
 * handle must not appear over a section where the control would open onto an
 * empty card.
 */
export function headingAccentApplies(
  type?: string | null,
  section?: Record<string, unknown> | null,
): boolean {
  const field = headingFieldFor(type);
  if (!field || !section) return false;
  return plain(section[field] as string | undefined) !== '';
}

/** What the word picker edits, once the document has said what this is. */
export interface AccentTarget {
  /** Where the heading text is read from. */
  headingPath: PathSegment[];
  /** Where the chosen word is written. */
  accentPath: PathSegment[];
  /** The heading as the document stores it. */
  heading: string;
  /** The word currently stored, or ''. */
  accent: string;
}

/**
 * Work out which section an accent handle belongs to, and where its word is
 * stored. Returns null for everything else, which is what makes the control
 * disappear rather than write somewhere unexpected.
 */
export function resolveAccentTarget(
  doc: Record<string, unknown>,
  path?: string | null,
): AccentTarget | null {
  const section = readSectionPath(path, SECTION_ARRAY_FIELDS);
  if (!section) return null;
  if (section.rest.length !== 1 || section.rest[0] !== HEADING_ACCENT_FIELD) return null;

  const item = sectionByKey(doc, section.array, section.key);
  if (!item) return null;
  const type = typeof item._type === 'string' ? item._type : '';
  const field = headingFieldFor(type);
  if (!field) return null;

  return {
    headingPath: [...section.itemPath, field],
    accentPath: [...section.itemPath, HEADING_ACCENT_FIELD],
    heading: plain(item[field] as string | undefined),
    accent: plain(item[HEADING_ACCENT_FIELD] as string | undefined),
  };
}

// THE WORD SPLITTER LIVES IN src/lib/heading-accent.ts, beside the matcher it
// has to agree with: `splitHeadingWords` and `isAccentedWord` are canonical
// there (PORTABLE, library of record ncs-astro-sanity-starter) and the picker
// imports them from there directly. A second copy here was written before that
// half landed upstream and is gone; two implementations of "which words may be
// clicked" is exactly the drift this registry exists to prevent.

// -----------------------------------------------------------------------------
// The rich twins
// -----------------------------------------------------------------------------
// Seven plain-string fields grew a sibling of type "restricted portable text" in
// card 26. All seven sit directly on the section object, so a twin is described
// by the section type alone.

/** A curated plain-string field and the rich twin that supersedes it. */
export interface RichTwin {
  /** The plain string field, still stored and still the fallback. */
  plain: string;
  /** The rich twin. */
  rich: string;
  /** The field's name as the card shows it. */
  label: string;
}

/** The seven twins, keyed by the section type that owns them. */
export const RICH_TWINS: Readonly<Record<string, RichTwin>> = {
  sectionCardGrid: { plain: 'subhead', rich: 'subheadRich', label: 'Subhead' },
  sectionCtaBand: { plain: 'subhead', rich: 'subheadRich', label: 'Subhead' },
  sectionFeatureCards: { plain: 'intro', rich: 'introRich', label: 'Intro' },
  sectionAccordion: { plain: 'intro', rich: 'introRich', label: 'Intro' },
  sectionSteps: { plain: 'intro', rich: 'introRich', label: 'Intro' },
  sectionMediaFeature: { plain: 'body', rich: 'bodyRich', label: 'Body' },
  sectionDynamicList: { plain: 'intro', rich: 'introRich', label: 'Intro' },
};

/** Every field name either half of a twin can be called, as one flat set. */
export const RICH_TWIN_FIELD_NAMES: ReadonlySet<string> = new Set(
  Object.values(RICH_TWINS).flatMap((twin) => [twin.plain, twin.rich]),
);

// -----------------------------------------------------------------------------
// The hero's own lines
// -----------------------------------------------------------------------------
// FLAT DOCUMENT FIELDS, not an object. Every page singleton and the generic
// `page` document carry the same three, and src/pages/preview/[...slug].astro
// renders exactly these three through Hero.astro.
//
// `heroKeyword`, `heroScriptAccent` and `heroRotatingWords` are deliberately
// left out: they are not lines an editor reads on the page, they are devices
// applied to one. The 404 page's `headline`/`eyebrow` are left out too - the
// preview projection renames them, so a card there would need a document-type
// gate for one page.

/** One hero line the text card offers, and how tall its box should be. */
export interface HeroLine {
  field: string;
  label: string;
  rows: number;
}

export const HERO_LINES: readonly HeroLine[] = [
  { field: 'heroEyebrow', label: 'Hero eyebrow', rows: 1 },
  { field: 'heroHeadline', label: 'Hero headline', rows: 2 },
  { field: 'heroSubhead', label: 'Hero subhead', rows: 3 },
];

const HERO_BY_FIELD: Readonly<Record<string, HeroLine>> = Object.fromEntries(
  HERO_LINES.map((line) => [line.field, line]),
);

// -----------------------------------------------------------------------------
// What a text card is editing
// -----------------------------------------------------------------------------

/** The resolved subject of the text card. */
export interface TextTarget {
  kind: 'plain' | 'rich';
  /** Where the value is written. */
  path: PathSegment[];
  /** Plain kind: the current string. */
  text: string;
  /** Rich kind: the current value, as runs. */
  runs: InlineRun[];
  /** The field's name as the card shows it. */
  label: string;
  /** Rows for the textarea. */
  rows: number;
}

/**
 * Work out what a clicked element edits, from the path it carries and the
 * document as it currently stands. Returns null for anything the card does not
 * offer, which is what makes the pencil disappear rather than write somewhere
 * unexpected.
 *
 * A path may run PAST the field, into a span inside a rich twin
 * (`...subheadRich[_key="b"].children[_key="c"].text`). Clicking the rendered
 * words and clicking the field are the same gesture, so both open the same card.
 */
export function resolveTextTarget(
  doc: Record<string, unknown>,
  path?: string | null,
): TextTarget | null {
  const section = readSectionPath(path, SECTION_ARRAY_FIELDS);

  if (!section) {
    // A document field. Only the hero's three lines are offered.
    const segments = parseSanityPath(path);
    if (segments.length !== 1 || typeof segments[0] !== 'string') return null;
    const line = HERO_BY_FIELD[segments[0]];
    if (!line) return null;
    return {
      kind: 'plain',
      path: [line.field],
      text: plain(doc?.[line.field] as string | undefined),
      runs: [],
      label: line.label,
      rows: line.rows,
    };
  }

  const item = sectionByKey(doc, section.array, section.key);
  if (!item) return null;
  const type = typeof item._type === 'string' ? item._type : '';
  const twin = RICH_TWINS[type];
  if (!twin) return null;

  const first = section.rest[0];
  if (first !== twin.plain && first !== twin.rich) return null;

  const stored = item[twin.rich];
  const fallback = item[twin.plain];
  return {
    kind: 'rich',
    path: [...section.itemPath, twin.rich],
    text: '',
    // A twin that is still empty is seeded from the PLAIN string it falls back
    // to, so an editor's first bold keeps the words that were already there.
    runs: hasInlineRich(stored)
      ? inlineRichRuns(stored)
      : normalizeRuns([{ text: plain(fallback as string | undefined), strong: false, em: false }]),
    label: twin.label,
    rows: 3,
  };
}

// -----------------------------------------------------------------------------
// What the in-canvas layer offers on a given element
// -----------------------------------------------------------------------------
// The overlay resolver runs SYNCHRONOUSLY, the instant an element is hovered,
// and all it holds is the element's path. That is enough to decide which control
// is even a CANDIDATE. Each control then confirms against the section's real
// `_type` once the document snapshot arrives, and renders nothing if the answer
// is no. Two gates, in that order, because the cheap one runs on every hover and
// the accurate one costs a read.

/** The controls this layer can put on one element. */
export type OverlayControl = 'appearance' | 'headingAccent' | 'text';

/**
 * Which control a path is a candidate for. An empty list means the element gets
 * nothing and the host's own overlay is left exactly as it was.
 *
 * ONE control per element, on purpose: each renders as an absolutely positioned
 * strip in the same corner of the element's outline, so two would sit on top of
 * each other.
 */
export function overlayControlsForPath(path?: string | null): OverlayControl[] {
  const section = readSectionPath(path, SECTION_ARRAY_FIELDS);

  if (!section) {
    const segments = parseSanityPath(path);
    if (segments.length !== 1 || typeof segments[0] !== 'string') return [];
    return HERO_BY_FIELD[segments[0]] ? ['text'] : [];
  }

  // NOTE, learned in a deployed Studio (presacademy, 2026-08-28): a BARE
  // array-item path (`sections[_key=="..."]`, nothing after it) gets no control,
  // and cannot. The host builds the resolver context through `getField(node)`
  // and bails when there is no field, and the Studio schema resolves no FIELD
  // for an array item on its own - so the resolver is never called for the
  // section wrapper at all. The first version of that layer put its swatches
  // there and it never mounted.
  //
  // The fix is to give each card a real field to hang on: Sections.astro renders
  // small preview-only handles inside each section, carrying `data-sanity` for
  // `...[_key=="..."].background.tone` and `...[_key=="..."].headingAccent`. Both
  // ARE object fields, so the context builds. The bare-item case is deliberately
  // NOT kept as a fallback: it can never fire, and a branch that can never fire
  // is a branch somebody will one day trust.
  const [first, second] = section.rest;

  if (
    section.rest.length === 2 &&
    first === BACKGROUND_FIELD &&
    (second === SURFACE_FIELD || second === ACCENT_FIELD)
  ) {
    return ['appearance'];
  }

  if (section.rest.length === 1 && first === HEADING_ACCENT_FIELD) return ['headingAccent'];

  // Either half of a rich twin, and any span inside the rich half.
  if (typeof first === 'string' && RICH_TWIN_FIELD_NAMES.has(first)) return ['text'];

  return [];
}
