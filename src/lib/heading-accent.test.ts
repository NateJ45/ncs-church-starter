import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { splitHeadingAccent } from './heading-accent.ts';
import { hasInlineRich, inlineRichRuns } from './inline-rich.ts';

// The invisible run Sanity's stega encoder hides inside a preview string. Two
// of the ranges plain() strips, so a test that only used one would pass for the
// wrong reason.
const STEGA = '​\u{E0041}\u{E0042}﻿';

describe('splitHeadingAccent', () => {
  it('does nothing when no accent word is set', () => {
    const r = splitHeadingAccent('A church on the corner since 1887.');
    assert.equal(r.found, false);
    assert.equal(r.heading, 'A church on the corner since 1887.');
  });

  it('does nothing when the accent word is not in the heading', () => {
    assert.equal(splitHeadingAccent('Sunday worship', 'Wednesday').found, false);
  });

  it('splits around the FIRST occurrence and leaves the rest alone', () => {
    const r = splitHeadingAccent('Welcome, and welcome again', 'welcome');
    assert.equal(r.found, true);
    assert.equal(r.before, '');
    assert.equal(r.word, 'Welcome');
    assert.equal(r.after, ', and welcome again');
  });

  it('matches case-insensitively but keeps the heading own casing', () => {
    const r = splitHeadingAccent('Grace upon grace', 'GRACE');
    assert.equal(r.found, true);
    assert.equal(r.before, '');
    assert.equal(r.word, 'Grace');
  });

  // THE regression this helper exists for. In the Presentation preview both
  // strings arrive with an invisible marker run inside them; a plain indexOf
  // then never matches and the accent silently does nothing in preview only.
  it('still matches when either side is stega-encoded', () => {
    const r = splitHeadingAccent(`A table for ordinary${STEGA} people`, `ordinary${STEGA}`);
    assert.equal(r.found, true);
    assert.equal(r.word, 'ordinary');
    assert.equal(r.before, 'A table for ');
    assert.equal(r.after, ' people');
    // The rendered halves are clean, so no marker leaks into the page.
    assert.ok(!(r.before + r.word + r.after).includes('​'));
  });
});

describe('inline rich twins', () => {
  const filled = [
    {
      _type: 'block',
      children: [
        { _type: 'span', text: 'Sundays at 11, ', marks: [] },
        { _type: 'span', text: 'come as you are', marks: ['em'] },
        { _type: 'span', text: '.', marks: [] },
      ],
    },
  ];

  it('treats undefined, an empty array and a blank block as empty', () => {
    assert.equal(hasInlineRich(undefined), false);
    assert.equal(hasInlineRich([]), false);
    assert.equal(
      hasInlineRich([{ _type: 'block', children: [{ _type: 'span', text: '  ' }] }]),
      false,
    );
  });

  it('sees text', () => {
    assert.equal(hasInlineRich(filled), true);
  });

  it('flattens to runs carrying only bold and italic', () => {
    const runs = inlineRichRuns(filled);
    assert.equal(runs.length, 3);
    assert.deepEqual(runs[1], { text: 'come as you are', strong: false, em: true });
    assert.equal(runs.map((r) => r.text).join(''), 'Sundays at 11, come as you are.');
  });

  it('ignores a mark the schema does not allow rather than throwing', () => {
    const runs = inlineRichRuns([
      { _type: 'block', children: [{ _type: 'span', text: 'x', marks: ['someAnnotationKey'] }] },
    ]);
    assert.deepEqual(runs, [{ text: 'x', strong: false, em: false }]);
  });
});
