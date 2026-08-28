import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  COLUMN_VARIANTS,
  columnFallback,
  columnOptions,
  columnsClass,
  sideOptions,
} from './layout-variants.ts';

// The class strings each block rendered BEFORE src/lib/layout-variants.ts
// existed, copied out of the components by hand. This block is the parity gate:
// if someone "tidies" the registry into a formula, the default of every live
// section moves and this fails first, in milliseconds, instead of showing up as
// a diff in the page-parity harness minutes later.
const BEFORE: Record<string, Record<string, string>> = {
  sectionCardGrid: {
    '2': 'sm:grid-cols-2',
    '3': 'sm:grid-cols-2 lg:grid-cols-3',
    '4': 'sm:grid-cols-2 lg:grid-cols-4',
  },
  sectionFeatureCards: {
    '2': 'sm:grid-cols-2',
    '3': 'sm:grid-cols-2 lg:grid-cols-3',
    '4': 'sm:grid-cols-2 lg:grid-cols-4',
  },
  sectionStats: {
    '2': 'sm:grid-cols-2',
    '3': 'sm:grid-cols-3',
    '4': 'grid-cols-2 sm:grid-cols-4',
  },
  sectionGallery: {
    '2': 'grid-cols-2',
    '3': 'grid-cols-2 sm:grid-cols-3',
    '4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  },
};

describe('columnsClass', () => {
  it('emits the exact classes each block rendered before the registry existed', () => {
    for (const [type, byValue] of Object.entries(BEFORE)) {
      for (const [value, cls] of Object.entries(byValue)) {
        assert.equal(columnsClass(type, value), cls, `${type} / ${value}`);
      }
    }
  });

  it('falls back to the block default for an unset value', () => {
    for (const type of Object.keys(COLUMN_VARIANTS)) {
      const fallback = columnsClass(type, COLUMN_VARIANTS[type].fallback);
      assert.equal(columnsClass(type, undefined), fallback, type);
      assert.equal(columnsClass(type, null), fallback, type);
      assert.equal(columnsClass(type, ''), fallback, type);
      // A number, which is what a hand-written patch script can leave behind.
      assert.equal(columnsClass(type, 3), fallback, type);
    }
  });

  it('falls back for a value outside the offered list', () => {
    // Steps offers two and three only. A stray "4" must not render an empty
    // class attribute, it must render the section the editor already had.
    assert.equal(columnsClass('sectionSteps', '4'), columnsClass('sectionSteps', '3'));
  });

  it('returns nothing for a block that has no column control', () => {
    assert.equal(columnsClass('sectionQuote', '2'), '');
    assert.equal(columnOptions('sectionQuote').length, 0);
    assert.equal(columnFallback('sectionQuote'), '');
  });
});

describe('COLUMN_VARIANTS', () => {
  it('offers every option a class, and defaults to an offered value', () => {
    for (const [type, spec] of Object.entries(COLUMN_VARIANTS)) {
      const offered = spec.options.map((o) => o.value);
      assert.ok(offered.includes(spec.fallback), `${type}: default is not in the list`);
      for (const value of offered) {
        assert.ok(spec.classes[value], `${type} / ${value}: no classes`);
      }
      assert.deepEqual(
        Object.keys(spec.classes).sort(),
        [...offered].sort(),
        `${type}: classes and options disagree`,
      );
    }
  });

  it('never varies the phone layout', () => {
    // THE REFLOW INVARIANT. Replay what a 320px browser actually does: take the
    // block's own base grid class, apply the option's UNPREFIXED classes over
    // it (`sm:` and `lg:` do not apply at 320px), and check the result is the
    // block's declared phoneColumns every time. While this holds, a reflow
    // sweep over the live pages covers every option, because no option can
    // produce a 320px layout the sweep has not already measured.
    for (const [type, spec] of Object.entries(COLUMN_VARIANTS)) {
      for (const option of spec.options) {
        const applied = [spec.baseColumns, ...spec.classes[option.value].split(' ')]
          .filter((c) => c.startsWith('grid-cols-'))
          .at(-1);
        assert.equal(
          applied,
          spec.phoneColumns,
          `${type} / ${option.value}: a column choice moves the phone layout`,
        );
      }
    }
  });

  it('records the base grid class each component really carries', () => {
    // `baseColumns` is a copy of something that lives in an .astro file, and a
    // copy that nothing checks is a copy that goes stale. So read the component
    // and pull the base classes out of the element that interpolates colClass,
    // the same way surfaces.test.ts resolves its tokens against globals.css.
    const COMPONENT: Record<string, string> = {
      sectionCardGrid: 'CardGridBlock',
      sectionFeatureCards: 'FeatureCardsBlock',
      sectionStats: 'StatsBlock',
      sectionGallery: 'GalleryBlock',
      sectionSteps: 'StepsBlock',
      sectionDynamicList: 'DynamicListBlock',
    };
    for (const [type, spec] of Object.entries(COLUMN_VARIANTS)) {
      const file = new URL(`../components/blocks/${COMPONENT[type]}.astro`, import.meta.url);
      const src = readFileSync(file, 'utf8');
      const match = src.match(/class=\{`([^`]*)\$\{colClass\}/);
      assert.ok(match, `${COMPONENT[type]}: no element interpolates colClass`);
      const base = match[1]
        .split(/\s+/)
        .filter((c) => c.startsWith('grid-cols-'))
        .join(' ');
      assert.equal(base, spec.baseColumns, `${type}: baseColumns is out of date`);
    }
  });

  it('gives every option a plain-language title', () => {
    for (const spec of Object.values(COLUMN_VARIANTS)) {
      for (const option of spec.options) {
        assert.match(option.title, /across$/);
        assert.notEqual(option.title, option.value);
      }
    }
  });
});

describe('sideOptions', () => {
  it('stores left and right, and says what moves', () => {
    assert.deepEqual(sideOptions('Picture'), [
      { title: 'Picture on the left', value: 'left' },
      { title: 'Picture on the right', value: 'right' },
    ]);
    assert.deepEqual(
      sideOptions('Video or photo').map((o) => o.value),
      ['left', 'right'],
    );
  });
});
