// Theme-token contrast gate (added 2026-08-27 alongside src/lib/contrast.ts;
// pattern from ncs-astro-sanity-starter, PORTS.md card 9 - adapted to this
// template's palette, which carries a Chapel-green and gold family the starter
// does not have).
//
// WHY: this is a TEMPLATE. Every fork runs `npm run rebrand` and swaps the
// @theme palette in src/styles/globals.css for a real church's colours, and
// nothing else in the gate chain notices when that swap pushes body text under
// 4.5:1. axe audits the resting DOM of a built page and has no rule for token
// pairs; Lighthouse can sit at 100 while a heading is unreadable on its own
// surface. This test reads the real tokens out of globals.css and asserts the
// pairs the design system actually puts on screen, so a bad reskin fails
// `npm test` before anyone looks at a screenshot.
//
// SCOPE: the light @theme block only. Those tokens are plain hex, so the check
// is nearly free. The shadcn :root/.dark overrides are authored in oklch with
// alpha and would need a colour-space conversion to check the same way; that is
// a bigger job and is deliberately NOT attempted here. Dark-mode pairs stay
// covered by the visual pass.
//
// DELIBERATELY NOT ASSERTED, and why:
//   --color-secondary (#B9A590) and --color-tertiary (#A89A86) on paper. These
//     are hairline dividers and eyebrow rules, ~1.9:1 and ~2.2:1 by design.
//     They are not UI component boundaries and not text.
//   --color-gold (#A07D45) as text. globals.css says so in its own comment: the
//     static gold token is for decorative hairlines and small rules, and the
//     theme-aware --color-gold-ink (declared in @theme inline, resolved per
//     theme in :root/.dark) is the readable-as-text variant. Gold sits at
//     ~3.0:1 on paper - fine as a rule, not as a label.
//   --color-primary as BODY TEXT. It is 3.95:1 on paper: the interactive
//     accent, not a text colour. globals.css names --color-primary-dark the
//     "anchor/link text" for exactly this reason, and that pair IS asserted
//     below. --color-primary is instead held to AA_NON_TEXT, because it is also
//     the --ring focus-indicator colour.
//
// If a fork introduces a token used for a FOCUS RING or a control edge, add it
// here with AA_NON_TEXT. If it introduces a text colour, add it with
// AA_BODY_TEXT. A token that renders and is not in this file is unguarded.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  contrastRatio,
  hexToRgb,
  relativeLuminance,
  flatten,
  rgbToHex,
  AA_BODY_TEXT,
  AA_NON_TEXT,
} from './contrast.ts';

const CSS = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'styles', 'globals.css');

/** Pull the hex `--color-*` declarations out of the @theme block. */
function readTokens(): Record<string, string> {
  const css = readFileSync(CSS, 'utf8');
  const tokens: Record<string, string> = {};
  for (const m of css.matchAll(/--(color-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    tokens[m[1]] = m[2];
  }
  return tokens;
}

const tokens = readTokens();

/** Read a token, failing loudly rather than silently skipping a pair. */
function token(name: string): string {
  const value = tokens[name];
  assert.ok(value, `globals.css @theme is missing --${name}`);
  return value;
}

test('contrast math matches the WCAG reference points', () => {
  assert.equal(contrastRatio('#000000', '#ffffff'), 21);
  assert.equal(contrastRatio('#ffffff', '#ffffff'), 1);
  // Shorthand hex expands.
  assert.equal(contrastRatio('#fff', '#000'), 21);
  // Luminance is symmetric in the ratio, order must not matter.
  assert.equal(contrastRatio('#36302A', '#ECE4DA'), contrastRatio('#ECE4DA', '#36302A'));
  assert.throws(() => hexToRgb('not-a-colour'));
  assert.ok(relativeLuminance(hexToRgb('#ffffff')) > relativeLuminance(hexToRgb('#000000')));
});

test('flatten composites a translucent colour over its backdrop', () => {
  // White at 12% over near-black is what a dark-theme hairline really is.
  const composited = flatten(hexToRgb('#ffffff'), 0.12, hexToRgb('#000000'));
  assert.equal(rgbToHex(composited), '#1f1f1f');
  // Fully opaque returns the foreground untouched.
  assert.deepEqual(flatten(hexToRgb('#36302A'), 1, hexToRgb('#ffffff')), hexToRgb('#36302A'));
});

// --- Text on the paper surfaces ---------------------------------------------
// The two light surfaces the page alternates between: --color-bg (Paper) and
// --color-bg-soft (Soft Paper). Every colour that carries words on them.
const TEXT_ON_SURFACE: Array<[string, string]> = [
  ['color-accent', 'color-bg'], // Espresso Ink: headings + body on paper
  ['color-accent', 'color-bg-soft'], // same on the alternating surface
  ['color-accent-dark', 'color-bg'],
  ['color-accent-dark', 'color-bg-soft'],
  ['color-primary-dark', 'color-bg'], // the documented anchor/link colour
  ['color-primary-dark', 'color-bg-soft'],
  ['color-chapel', 'color-bg'], // keyword emphasis in headlines
  ['color-chapel', 'color-bg-soft'],
  ['color-chapel-deep', 'color-bg'],
];

for (const [fg, bg] of TEXT_ON_SURFACE) {
  test(`--${fg} on --${bg} meets AA body text`, () => {
    const ratio = contrastRatio(token(fg), token(bg));
    assert.ok(
      ratio >= AA_BODY_TEXT,
      `--${fg} (${token(fg)}) on --${bg} (${token(bg)}) is ${ratio}:1, needs ${AA_BODY_TEXT}:1`,
    );
  });
}

// --- Reversed-out text -------------------------------------------------------
// Pure white on the dark brand surfaces, plus white on the bronze CTA pill.
// --color-primary is in this list on purpose: bg-primary stays the static
// bronze in BOTH themes, so white (not ink) is what keeps the primary button
// readable on a dark page too - the reason globals.css sets
// --primary-foreground to #FFFFFF in .dark.
const WHITE_ON_DARK: string[] = [
  'color-primary',
  'color-primary-dark',
  'color-accent',
  'color-accent-dark',
];

for (const bg of WHITE_ON_DARK) {
  test(`--color-white-pure on --${bg} meets AA body text`, () => {
    const ratio = contrastRatio(token('color-white-pure'), token(bg));
    assert.ok(
      ratio >= AA_BODY_TEXT,
      `white on --${bg} (${token(bg)}) is ${ratio}:1, needs ${AA_BODY_TEXT}:1`,
    );
  });
}

// --- The Chapel surfaces -----------------------------------------------------
// The utility bar, footer and closing CTA are the same deep green on a light or
// a dark page (the chapel tokens are static in both themes), and the text on
// them is always the warm cream --color-chapel-foreground. That makes this pair
// the single most-rendered text/surface combination on the site, and the one a
// rebrand is most likely to break by recolouring only half of it.
const CHAPEL_SURFACES: string[] = ['color-chapel', 'color-chapel-deep'];

for (const bg of CHAPEL_SURFACES) {
  test(`--color-chapel-foreground on --${bg} meets AA body text`, () => {
    const ratio = contrastRatio(token('color-chapel-foreground'), token(bg));
    assert.ok(
      ratio >= AA_BODY_TEXT,
      `--color-chapel-foreground (${token('color-chapel-foreground')}) on --${bg} ` +
        `(${token(bg)}) is ${ratio}:1, needs ${AA_BODY_TEXT}:1`,
    );
  });

  test(`--color-white-pure on --${bg} meets AA body text`, () => {
    const ratio = contrastRatio(token('color-white-pure'), token(bg));
    assert.ok(
      ratio >= AA_BODY_TEXT,
      `white on --${bg} (${token(bg)}) is ${ratio}:1, needs ${AA_BODY_TEXT}:1`,
    );
  });
}

// --- Non-text: focus rings and control edges --------------------------------
// --ring is --color-primary (globals.css :root). A focus indicator under 3:1 is
// invisible, and no other gate in this repo can see that: axe has no
// focus-indicator contrast rule, and it audits the resting DOM anyway.
const NON_TEXT_ON_SURFACE: Array<[string, string]> = [
  ['color-primary', 'color-bg'],
  ['color-primary', 'color-bg-soft'],
];

for (const [fg, bg] of NON_TEXT_ON_SURFACE) {
  test(`--${fg} on --${bg} meets AA non-text (focus ring / control edge)`, () => {
    const ratio = contrastRatio(token(fg), token(bg));
    assert.ok(
      ratio >= AA_NON_TEXT,
      `--${fg} (${token(fg)}) on --${bg} (${token(bg)}) is ${ratio}:1, needs ${AA_NON_TEXT}:1`,
    );
  });
}
