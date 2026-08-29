import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SECTION_ACCENTS, SECTION_SURFACES } from './surfaces.ts';
import { isAccentedWord, splitHeadingAccent, splitHeadingWords } from './heading-accent.ts';
import {
  ACCENT_FIELD,
  APPEARANCE_SECTION_TYPES,
  BACKGROUND_FIELD,
  DEFAULT_SURFACE_BY_TYPE,
  HEADING_ACCENT_FIELD,
  HEADING_FIELD_BY_TYPE,
  HERO_LINES,
  RICH_TWINS,
  SECTION_ARRAY_FIELDS,
  SURFACE_FIELD,
  accentApplies,
  defaultSurfaceFor,
  hasAppearance,
  hasMediaBackground,
  headingAccentApplies,
  headingFieldFor,
  overlayControlsForPath,
  resolveAccentTarget,
  resolveTextTarget,
  storedAccent,
  storedSurface,
  surfaceApplies,
} from './section-fields.ts';

// =============================================================================
// THE DRIFT GATE for the in-canvas control layer (2026-08-28, card 28)
// =============================================================================
// src/lib/section-fields.ts is a COPY of knowledge that really lives in the
// Sanity schema and in the renderers. The overlay cannot read either at runtime
// (it runs in the preview iframe, in the site's bundle; the schema lives in the
// parent window), so a copy is the only option. The price of the copy is this
// file: it parses the schema, Sections.astro, SectionShell.astro and every block
// component, and FAILS the moment the copy and the source disagree.
//
// If this test fails, the schema moved. Fix the REGISTRY, not the assertion.
// =============================================================================

const here = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

const blocksSrc = here('../sanity/schemaTypes/blocks.ts');
const sectionsSrc = here('../components/Sections.astro');
const shellSrc = here('../components/SectionShell.astro');
const previewSrc = here('./cms-preview.ts');

/**
 * Split blocks.ts into one chunk per `export const x = defineType({...})`, keyed
 * by the type's `name`. Cheap, and exact enough: every section type in this
 * template is declared exactly that way, and a type declared some new way shows
 * up here as a MISSING type rather than as a silent pass.
 */
function sectionSources(): Record<string, string> {
  const out: Record<string, string> = {};
  const starts = [...blocksSrc.matchAll(/^export const \w+ = defineType\(\{/gm)];
  starts.forEach((match, i) => {
    const from = match.index ?? 0;
    const to = i + 1 < starts.length ? (starts[i + 1].index ?? blocksSrc.length) : blocksSrc.length;
    const chunk = blocksSrc.slice(from, to);
    const name = chunk.match(/name:\s*'([^']+)'/)?.[1];
    if (name) out[name] = chunk;
  });
  return out;
}

const SECTIONS = sectionSources();
const NAMES = Object.keys(SECTIONS);

describe('the schema is still shaped the way the registry says', () => {
  it('finds every section type declared in blocks.ts', () => {
    // A sanity check on the parser itself: if this drops to a handful, every
    // assertion below is passing for the wrong reason.
    assert.ok(NAMES.length >= 16, `only found ${NAMES.length} section types`);
    assert.ok(NAMES.includes('sectionRichText'));
    assert.ok(NAMES.includes('sectionFaqList'));
  });

  it('APPEARANCE_SECTION_TYPES is exactly the set carrying bgField()', () => {
    const withBg = NAMES.filter((name) => /\bbgField\(\)/.test(SECTIONS[name]));
    assert.deepEqual(
      [...APPEARANCE_SECTION_TYPES].sort(),
      withBg.sort(),
      'a section gained or lost its Section background panel',
    );
  });

  it('the background object still holds the two fields the card writes', () => {
    const bg = blocksSrc.slice(blocksSrc.indexOf('export function bgField()'));
    assert.match(bg, new RegExp(`name: '${BACKGROUND_FIELD}'`));
    assert.match(bg, new RegExp(`name: '${SURFACE_FIELD}'`));
    assert.match(bg, new RegExp(`name: '${ACCENT_FIELD}'`));
    // And they are still driven from src/lib/surfaces.ts rather than a second
    // list, which is why this layer never re-lists a colour.
    assert.match(bg, /SURFACE_OPTIONS/);
    assert.match(bg, /ACCENT_OPTIONS/);
  });

  it('HEADING_FIELD_BY_TYPE names every type with headingAccent, and its own heading field', () => {
    const withAccent = NAMES.filter((name) => /\bheadingAccentField\(\)/.test(SECTIONS[name]));
    assert.deepEqual(
      Object.keys(HEADING_FIELD_BY_TYPE).sort(),
      withAccent.sort(),
      'a section gained or lost its accent word',
    );
    // The heading it is matched against is NOT always called `heading`:
    // sectionCtaBand calls its `headline`. The block component is the authority.
    const BLOCK: Record<string, string> = {
      sectionRichText: 'RichTextBlock',
      sectionCardGrid: 'CardGridBlock',
      sectionCtaBand: 'CtaBandBlock',
      sectionFeatureCards: 'FeatureCardsBlock',
      sectionMediaFeature: 'MediaFeatureBlock',
    };
    for (const [type, field] of Object.entries(HEADING_FIELD_BY_TYPE)) {
      assert.match(SECTIONS[type], new RegExp(`name: '${field}'`), `${type} has no ${field} field`);
      const file = BLOCK[type];
      assert.ok(file, `${type} has no block component in this test's map`);
      const src = here(`../components/blocks/${file}.astro`);
      const call = src.match(/splitHeadingAccent\(\s*block\?\.(\w+)\s*,\s*block\?\.(\w+)\s*\)/);
      assert.ok(call, `${file} no longer calls splitHeadingAccent`);
      assert.equal(call[1], field, `${file} matches the accent against a different heading`);
      assert.equal(call[2], HEADING_ACCENT_FIELD, `${file} reads a different accent field`);
    }
  });

  it('RICH_TWINS names every twin, on the type that owns it', () => {
    const found: Record<string, { plain: string; rich: string }> = {};
    for (const name of NAMES) {
      const twin = SECTIONS[name].match(/richTwin\('(\w+)',/);
      if (!twin) continue;
      const rich = twin[1];
      const plain = rich.replace(/Rich$/, '');
      found[name] = { plain, rich };
      // The plain half must still exist, and must still hide behind the twin -
      // that pairing is what lets the card seed the twin from the string.
      assert.match(SECTIONS[name], new RegExp(`name: '${plain}'`), `${name}: no ${plain} field`);
      assert.match(
        SECTIONS[name],
        new RegExp(`hideWhenRich\\('${rich}'\\)`),
        `${name}: ${plain} no longer hides behind ${rich}`,
      );
      // No section declares two twins; the registry keys by type and could not
      // hold a second one.
      assert.equal(
        (SECTIONS[name].match(/richTwin\(/g) ?? []).length,
        1,
        `${name} declares more than one rich twin`,
      );
    }
    assert.deepEqual(Object.keys(RICH_TWINS).sort(), Object.keys(found).sort());
    for (const [type, twin] of Object.entries(RICH_TWINS)) {
      assert.equal(twin.plain, found[type].plain, type);
      assert.equal(twin.rich, found[type].rich, type);
    }
  });

  it('every twin is still rendered from the twin, with the string as the fallback', () => {
    const BLOCK: Record<string, string> = {
      sectionCardGrid: 'CardGridBlock',
      sectionCtaBand: 'CtaBandBlock',
      sectionFeatureCards: 'FeatureCardsBlock',
      sectionAccordion: 'AccordionBlock',
      sectionSteps: 'StepsBlock',
      sectionMediaFeature: 'MediaFeatureBlock',
      sectionDynamicList: 'DynamicListBlock',
    };
    for (const [type, twin] of Object.entries(RICH_TWINS)) {
      const src = here(`../components/blocks/${BLOCK[type]}.astro`);
      assert.match(
        src,
        new RegExp(`hasInlineRich\\(block\\?\\.${twin.rich}\\)`),
        `${BLOCK[type]} no longer prefers ${twin.rich}`,
      );
    }
  });

  it('the hero lines the text card offers are real fields on the preview projection', () => {
    const route = here('../pages/preview/[...slug].astro');
    for (const line of HERO_LINES) {
      assert.match(
        route,
        new RegExp(`\\b${line.field}\\b`),
        `${line.field} is no longer previewed`,
      );
    }
  });

  it('the values this layer reads are still excluded from stega', () => {
    // storedSurface, storedAccent and the accent-word matcher all compare exact
    // strings. An encoded value would never match its own name.
    for (const field of [SURFACE_FIELD, ACCENT_FIELD, HEADING_ACCENT_FIELD]) {
      assert.match(previewSrc, new RegExp(`'${field}',`), `${field} left NON_STEGA_FIELDS`);
    }
  });
});

describe('the renderers still paint what the card swaps', () => {
  it('SHELL_AWARE in Sections.astro matches the types with a background', () => {
    const list = sectionsSrc.match(/const SHELL_AWARE = new Set\(\[([\s\S]*?)\]\)/)?.[1];
    assert.ok(list, 'SHELL_AWARE is gone from Sections.astro');
    const shellAware = [...list.matchAll(/'([^']+)'/g)].map((m) => m[1]);
    assert.deepEqual(
      [...APPEARANCE_SECTION_TYPES].sort(),
      shellAware.sort(),
      'a section carries a background but no longer renders through SectionShell (or the reverse)',
    );
  });

  it('DEFAULT_TONE in Sections.astro matches DEFAULT_SURFACE_BY_TYPE', () => {
    const list = sectionsSrc.match(
      /const DEFAULT_TONE: Record<string, string> = \{([\s\S]*?)\}/,
    )?.[1];
    assert.ok(list, 'DEFAULT_TONE is gone from Sections.astro');
    const found: Record<string, string> = {};
    for (const m of list.matchAll(/(\w+):\s*'([^']+)'/g)) found[m[1]] = m[2];
    assert.deepEqual(found, { ...DEFAULT_SURFACE_BY_TYPE });
  });

  it('SectionShell still emits surfaceClass and accentClass from surfaces.ts', () => {
    assert.match(shellSrc, /import \{ accentClass, surfaceClass/);
    assert.match(shellSrc, /surfaceClass\(tone\)/);
    assert.match(shellSrc, /accentClass\(background\?\.accent\)/);
  });

  it('SectionShell STILL bypasses the surface when there is media behind it', () => {
    // This is the premise of the per-instance gate. If the media branch ever
    // starts painting the surface too, `surfaceApplies` is wrong and the card is
    // hiding a control that would work.
    assert.match(shellSrc, /hasMedia \? 'text-white' : surfaceClass\(tone\)/);
    assert.match(shellSrc, /const hasMedia = hasImage \|\| !!videoUrl/);
  });

  it('the handles Sections.astro renders point at the fields this layer writes', () => {
    assert.match(
      sectionsSrc,
      new RegExp(
        `sectionFieldEditAttr\\(editDoc, key, \`\\$\\{BACKGROUND_FIELD\\}\\.\\$\\{SURFACE_FIELD\\}\``,
      ),
    );
    assert.match(sectionsSrc, /sectionFieldEditAttr\(editDoc, key, HEADING_ACCENT_FIELD\)/);
    // And they are gated on the SAME editDoc as the section wrapper, so they can
    // never reach the live site. scripts/page-parity.mjs is the other half.
    assert.match(sectionsSrc, /editDoc && key && hasAppearance\(block\._type\)/);
    assert.match(sectionsSrc, /editDoc && key && headingAccentApplies\(block\._type, block\)/);
  });
});

// -----------------------------------------------------------------------------
// The decisions themselves
// -----------------------------------------------------------------------------

const section = (over: Record<string, unknown> = {}) => ({
  _key: 'k1',
  _type: 'sectionCardGrid',
  ...over,
});

describe('hasAppearance / surfaceApplies / accentApplies', () => {
  it('refuses the two types with no background object', () => {
    assert.equal(hasAppearance('sectionForm'), false);
    assert.equal(hasAppearance('embed'), false);
    assert.equal(hasAppearance(''), false);
    assert.equal(hasAppearance(null), false);
  });

  it('accepts every type that carries one', () => {
    for (const type of APPEARANCE_SECTION_TYPES) assert.equal(hasAppearance(type), true, type);
  });

  it('PER INSTANCE: a photo or a video behind the section turns the surface off', () => {
    assert.equal(hasMediaBackground(section()), false);
    assert.equal(surfaceApplies('sectionCardGrid', section()), true);

    const withImage = section({ background: { tone: 'warm', image: { asset: { _ref: 'x' } } } });
    assert.equal(hasMediaBackground(withImage), true);
    assert.equal(surfaceApplies('sectionCardGrid', withImage), false);
    // The accent is still painted on a media section, so that half stays.
    assert.equal(accentApplies('sectionCardGrid'), true);

    const withVideo = section({ background: { videoUrl: 'https://x/y.mp4' } });
    assert.equal(surfaceApplies('sectionCardGrid', withVideo), false);
  });

  it('an EMPTY image or video field is not media', () => {
    assert.equal(hasMediaBackground(section({ background: { image: {} } })), false);
    assert.equal(hasMediaBackground(section({ background: { videoUrl: '' } })), false);
    assert.equal(hasMediaBackground(section({ background: {} })), false);
  });
});

describe('storedSurface / storedAccent', () => {
  it('falls back to the default the RENDERER uses, not to Paper', () => {
    // The quote and the CTA band were green bands before the control existed and
    // still are. A card ticking "Paper" on a green band would be lying.
    assert.equal(defaultSurfaceFor('sectionQuote'), 'chapel');
    assert.equal(defaultSurfaceFor('sectionCtaBand'), 'chapel');
    assert.equal(defaultSurfaceFor('sectionCardGrid'), 'default');
    assert.equal(storedSurface('sectionQuote', { _type: 'sectionQuote' }), 'chapel');
    assert.equal(storedSurface('sectionCardGrid', section()), 'default');
  });

  it('reads a stored value, and ignores one the palette no longer offers', () => {
    assert.equal(storedSurface('sectionCardGrid', section({ background: { tone: 'ink' } })), 'ink');
    assert.equal(
      storedSurface('sectionQuote', { _type: 'sectionQuote', background: { tone: 'navy' } }),
      'chapel',
    );
  });

  it('every offered surface and accent is a value the registry can read back', () => {
    for (const pair of SECTION_SURFACES) {
      assert.equal(
        storedSurface('sectionCardGrid', section({ background: { tone: pair.value } })),
        pair.value,
      );
    }
    for (const choice of SECTION_ACCENTS) {
      assert.equal(storedAccent(section({ background: { accent: choice.value } })), choice.value);
    }
  });

  it('defaults the accent to bronze, the house look', () => {
    assert.equal(storedAccent(section()), 'bronze');
    assert.equal(storedAccent(section({ background: { accent: 'nope' } })), 'bronze');
    assert.equal(storedAccent(null), 'bronze');
  });
});

describe('the accent word', () => {
  const cta = {
    _key: 'k2',
    _type: 'sectionCtaBand',
    headline: 'Come and see',
    headingAccent: 'see',
  };
  const grid = { _key: 'k1', _type: 'sectionCardGrid', heading: 'Grace for all' };

  it('knows which field is the heading on each type', () => {
    assert.equal(headingFieldFor('sectionCtaBand'), 'headline');
    assert.equal(headingFieldFor('sectionCardGrid'), 'heading');
    assert.equal(headingFieldFor('sectionStats'), '');
  });

  it('PER INSTANCE: an empty heading offers no words, so no handle', () => {
    assert.equal(headingAccentApplies('sectionCardGrid', grid), true);
    assert.equal(headingAccentApplies('sectionCardGrid', { ...grid, heading: '' }), false);
    assert.equal(headingAccentApplies('sectionCardGrid', { ...grid, heading: '   ' }), false);
    assert.equal(headingAccentApplies('sectionStats', { heading: 'Numbers' }), false);
  });

  it('resolves the handle path to the right heading and the right accent field', () => {
    const doc = { flexibleSections: [grid, cta] };
    const target = resolveAccentTarget(doc, 'flexibleSections[_key=="k2"].headingAccent');
    assert.ok(target);
    assert.deepEqual(target.headingPath, ['flexibleSections', { _key: 'k2' }, 'headline']);
    assert.deepEqual(target.accentPath, ['flexibleSections', { _key: 'k2' }, 'headingAccent']);
    assert.equal(target.heading, 'Come and see');
    assert.equal(target.accent, 'see');
  });

  it('resolves nothing for a type with no accent word, or a path that is not the handle', () => {
    const doc = { sections: [{ _key: 'k3', _type: 'sectionStats', heading: 'Numbers' }] };
    assert.equal(resolveAccentTarget(doc, 'sections[_key=="k3"].headingAccent'), null);
    assert.equal(resolveAccentTarget({ sections: [grid] }, 'sections[_key=="k1"].heading'), null);
    assert.equal(resolveAccentTarget({}, 'heroHeadline'), null);
  });

  it('agrees with this repo’s own renderer about which slice gets coloured', () => {
    // splitHeadingWords / isAccentedWord are canonical in heading-accent.ts and
    // fully covered there. The one thing THIS repo has to prove is the round
    // trip: a value the picker would store is a value splitHeadingAccent then
    // finds in the same heading. If those two ever disagree, an editor clicks a
    // word and nothing happens.
    const heading = 'Come, and see. Grace for all';
    for (const token of splitHeadingWords(heading)) {
      if (!token.word) continue;
      const hit = splitHeadingAccent(heading, token.value);
      assert.ok(hit.found, `picker offers "${token.value}", renderer does not find it`);
      assert.equal(hit.word.toLowerCase(), token.value.toLowerCase());
      assert.ok(isAccentedWord(token, token.value));
    }
  });
});

describe('resolveTextTarget', () => {
  const doc = {
    heroHeadline: 'Come as you are',
    heroSubhead: 'Sundays at 11am',
    sections: [
      { _key: 'k1', _type: 'sectionCardGrid', subhead: 'Plain words' },
      {
        _key: 'k2',
        _type: 'sectionMediaFeature',
        body: 'Fallback',
        bodyRich: [
          {
            _type: 'block',
            _key: 'b',
            children: [{ _type: 'span', _key: 'c', text: 'Rich words', marks: ['strong'] }],
          },
        ],
      },
      { _key: 'k3', _type: 'sectionStats', intro: 'No twin here' },
    ],
  };

  it('offers the hero lines as plain strings, with their own box height', () => {
    const target = resolveTextTarget(doc, 'heroSubhead');
    assert.ok(target);
    assert.equal(target.kind, 'plain');
    assert.equal(target.text, 'Sundays at 11am');
    assert.deepEqual(target.path, ['heroSubhead']);
    assert.equal(target.rows, 3);
    assert.equal(resolveTextTarget(doc, 'heroHeadline')?.rows, 2);
  });

  it('does NOT offer a document field it was never given', () => {
    assert.equal(resolveTextTarget(doc, 'seoTitle'), null);
    assert.equal(resolveTextTarget(doc, 'heroKeyword'), null);
    assert.equal(resolveTextTarget(doc, ''), null);
  });

  it('writes the TWIN even when the section is showing its plain string', () => {
    const target = resolveTextTarget(doc, 'sections[_key=="k1"].subhead');
    assert.ok(target);
    assert.equal(target.kind, 'rich');
    assert.deepEqual(target.path, ['sections', { _key: 'k1' }, 'subheadRich']);
    // Seeded from the plain string, so a first bold keeps the words already there.
    assert.deepEqual(target.runs, [{ text: 'Plain words', strong: false, em: false }]);
  });

  it('reads the twin when it holds text', () => {
    const target = resolveTextTarget(doc, 'sections[_key=="k2"].bodyRich');
    assert.ok(target);
    assert.deepEqual(target.runs, [{ text: 'Rich words', strong: true, em: false }]);
  });

  it('treats a click on a span inside the twin as a click on the twin', () => {
    const deep = resolveTextTarget(
      doc,
      'sections[_key=="k2"].bodyRich[_key=="b"].children[_key=="c"].text',
    );
    assert.deepEqual(deep, resolveTextTarget(doc, 'sections[_key=="k2"].bodyRich'));
  });

  it('refuses a field with a twin-like NAME on a type that has no twin', () => {
    assert.equal(resolveTextTarget(doc, 'sections[_key=="k3"].intro'), null);
    assert.equal(resolveTextTarget(doc, 'sections[_key=="zz"].subhead'), null);
  });
});

describe('SECTION_ARRAY_FIELDS', () => {
  it('names both of this template’s page-builder arrays', () => {
    // `readSectionPath` is canonical and takes these names rather than baking
    // any in, so this list is the only place that knows them. Singletons use
    // `flexibleSections`, the generic `page` type uses `sections`, and
    // src/lib/preview-edit-attr.ts makes the same split for the attributes.
    assert.deepEqual([...SECTION_ARRAY_FIELDS], ['flexibleSections', 'sections']);
    for (const array of SECTION_ARRAY_FIELDS) {
      assert.deepEqual(overlayControlsForPath(`${array}[_key=="k"].background.tone`), [
        'appearance',
      ]);
    }
    // And an array this repo does NOT use resolves to nothing at all.
    assert.deepEqual(overlayControlsForPath('pageBuilder[_key=="k"].background.tone'), []);
  });
});

describe('overlayControlsForPath', () => {
  it('offers the appearance card on either half of the background handle', () => {
    assert.deepEqual(overlayControlsForPath('sections[_key=="k"].background.tone'), ['appearance']);
    assert.deepEqual(overlayControlsForPath('flexibleSections[_key=="k"].background.accent'), [
      'appearance',
    ]);
  });

  it('offers the word picker on the accent handle', () => {
    assert.deepEqual(overlayControlsForPath('sections[_key=="k"].headingAccent'), [
      'headingAccent',
    ]);
  });

  it('offers the text card on either half of a twin, and on a hero line', () => {
    assert.deepEqual(overlayControlsForPath('sections[_key=="k"].subheadRich'), ['text']);
    assert.deepEqual(overlayControlsForPath('sections[_key=="k"].intro'), ['text']);
    assert.deepEqual(overlayControlsForPath('heroEyebrow'), ['text']);
  });

  it('offers NOTHING on a bare array item', () => {
    // The host never even asks - an array item resolves to no field, so the
    // resolver is not called for it. The registry says the same thing anyway,
    // because a branch that can never fire is a branch somebody will trust.
    assert.deepEqual(overlayControlsForPath('sections[_key=="k"]'), []);
  });

  it('offers nothing on a heading, a nonsense path, or a field this layer skips', () => {
    for (const path of [
      'sections[_key=="k"].heading',
      'sections[_key=="k"].headline',
      'sections[_key=="k"].eyebrow',
      'sections[_key=="k"].background.overlay',
      'heroKeyword',
      'title',
      'cards[_key=="k"].title',
      'sections[_key=="k"',
      '',
      null,
    ]) {
      assert.deepEqual(overlayControlsForPath(path), [], String(path));
    }
  });

  it('never returns more than one control for one element', () => {
    // Each control renders as a strip in the same corner of the outline, so two
    // would sit on top of each other.
    for (const path of [
      'sections[_key=="k"].background.tone',
      'sections[_key=="k"].headingAccent',
      'sections[_key=="k"].subheadRich',
      'heroHeadline',
    ]) {
      assert.equal(overlayControlsForPath(path).length, 1, path);
    }
  });
});
