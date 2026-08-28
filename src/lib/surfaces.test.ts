import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AA_BODY_TEXT, AA_LARGE_TEXT, contrastRatio } from './contrast.ts';
import { DARK_SURFACES, SECTION_ACCENTS, SECTION_SURFACES } from './surfaces.ts';

// =============================================================================
// The contrast gate for the section appearance controls (2026-08-28)
// =============================================================================
// Every surface an editor can pick is a PAIR: a background plus the foreground
// treatment designed for it. This walks every pair in src/lib/surfaces.ts,
// resolves its tokens against the REAL declarations in src/styles/globals.css,
// and measures. Body text, headings and links must clear AA 4.5:1; the accent
// word inside a heading is display-size text and must clear 3:1.
//
// It also pins the literal hexes the Studio swatch dots draw with to the
// resolved token values. The Studio cannot read globals.css at runtime, so the
// dots have to carry literals; without this assertion a `npm run rebrand`
// palette swap would leave the editor picking from a row of colours the site no
// longer uses.
//
// This is the PAIR-level sibling of theme-tokens.test.ts, which checks the raw
// @theme palette. That one covers light only, on purpose; this one resolves the
// shadcn :root / .dark hex overrides too, which is where the surfaces live.
//
// If a candidate pair fails here, fix the PAIR. Do not lower a threshold.
// =============================================================================

const css = readFileSync(new URL('../styles/globals.css', import.meta.url), 'utf8');

/** Brace-counted extraction of `--name: #hex | var(--other)` from matching blocks. */
function tokensMatching(header: RegExp): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of css.matchAll(header)) {
    let depth = 0;
    let i = css.indexOf('{', m.index);
    if (i === -1) continue;
    const open = i;
    for (; i < css.length; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}' && --depth === 0) break;
    }
    const decl = /(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8}|var\(\s*--[\w-]+\s*\))\s*;/g;
    for (const d of css.slice(open, i).matchAll(decl)) out[d[1]] = d[2];
  }
  return out;
}

// `@theme`, `@theme inline` and `:root` are all the light scope. `.dark` is the
// dark scope, and the header pattern deliberately requires `{` right after the
// class so the `.dark .surface-warm` style rules further down are not swept in.
const light = tokensMatching(/(?:^|\n)\s*(?:@theme[^{]*|:root)\s*\{/g);
const dark = tokensMatching(/(?:^|\n)\s*\.dark\s*\{/g);

function resolve(value: string | undefined, scope: Record<string, string>, seen = 0): string {
  if (!value) throw new Error('Token has no value');
  if (seen > 5) throw new Error(`Alias loop resolving "${value}"`);
  const alias = value.match(/^var\(\s*(--[\w-]+)\s*\)$/);
  if (!alias) return value;
  return resolve(scope[alias[1]] ?? light[alias[1]], scope, seen + 1);
}

const themes = [
  ['light', (n: string) => resolve(light[n], light)],
  ['dark', (n: string) => resolve(dark[n] ?? light[n], dark)],
] as const;

/** #FFF and #ffffff are the same colour; compare on the expanded lowercase form. */
function norm(hex: string): string {
  const h = hex.trim().replace(/^#/, '').toLowerCase();
  return `#${h.length === 3 ? h.replace(/./g, (c) => c + c) : h}`;
}

describe('surface pairs resolve', () => {
  it('every surface names tokens that exist in globals.css', () => {
    for (const s of SECTION_SURFACES) {
      for (const [role, token] of Object.entries(s.tokens)) {
        assert.ok(
          light[token],
          `${s.value}.${role} names ${token}, which @theme/:root never declares`,
        );
      }
    }
  });

  it('the Studio swatch dots still match the tokens they stand for', () => {
    for (const s of SECTION_SURFACES) {
      assert.equal(
        norm(s.dot),
        norm(themes[0][1](s.tokens.bg)),
        `surface "${s.value}" dot is stale against ${s.tokens.bg} (light)`,
      );
      assert.equal(
        norm(s.dotDark),
        norm(themes[1][1](s.tokens.bg)),
        `surface "${s.value}" dotDark is stale against ${s.tokens.bg} (dark)`,
      );
      assert.equal(
        norm(s.dotInk),
        norm(themes[0][1](s.tokens.text)),
        `surface "${s.value}" dotInk is stale against ${s.tokens.text} (light)`,
      );
    }
  });

  it('a theme-static band really is the same colour in both themes', () => {
    for (const s of SECTION_SURFACES.filter((x) => x.themeStatic)) {
      assert.equal(
        norm(themes[0][1](s.tokens.bg)),
        norm(themes[1][1](s.tokens.bg)),
        `surface "${s.value}" claims themeStatic but ${s.tokens.bg} flips with the theme`,
      );
    }
  });

  it('DARK_SURFACES is exactly the theme-static list', () => {
    // The block components force `text-current` on their Portable Text body for
    // these values and only these. A drift here is a light-ink-on-near-black bug.
    assert.deepEqual(
      [...DARK_SURFACES].sort(),
      SECTION_SURFACES.filter((s) => s.themeStatic)
        .map((s) => s.value)
        .sort(),
    );
  });
});

describe('surface pairs clear WCAG AA', () => {
  for (const s of SECTION_SURFACES) {
    for (const [theme, v] of themes) {
      const bg = () => v(s.tokens.bg);

      it(`"${s.value}" body text clears AA in ${theme}`, () => {
        const ratio = contrastRatio(v(s.tokens.text), bg());
        assert.ok(ratio >= AA_BODY_TEXT, `${s.tokens.text} on ${s.tokens.bg} is ${ratio}:1`);
      });

      it(`"${s.value}" headings clear AA in ${theme}`, () => {
        const ratio = contrastRatio(v(s.tokens.heading), bg());
        assert.ok(ratio >= AA_BODY_TEXT, `${s.tokens.heading} on ${s.tokens.bg} is ${ratio}:1`);
      });

      it(`"${s.value}" links clear AA in ${theme}`, () => {
        const ratio = contrastRatio(v(s.tokens.link), bg());
        assert.ok(ratio >= AA_BODY_TEXT, `${s.tokens.link} on ${s.tokens.bg} is ${ratio}:1`);
      });
    }
  }
});

describe('accents', () => {
  it('the Studio accent dots still match the tokens they stand for', () => {
    for (const a of SECTION_ACCENTS) {
      assert.equal(
        norm(a.dot),
        norm(themes[0][1](a.ruleToken)),
        `accent "${a.value}" dot is stale`,
      );
      assert.equal(
        norm(a.dotDark),
        norm(themes[1][1](a.ruleToken)),
        `accent "${a.value}" dotDark is stale`,
      );
    }
  });

  it('exactly one accent is the default and it emits no class', () => {
    const defaults = SECTION_ACCENTS.filter((a) => a.className === null);
    assert.equal(defaults.length, 1, 'the default accent must be unique');
    assert.equal(defaults[0].value, 'bronze');
  });

  // The pill fill is a STATIC hex per accent (like the site's existing primary
  // pill, which keeps one bronze in both themes), so its label ink is measured
  // against the fill itself and against the hover fill.
  for (const a of SECTION_ACCENTS) {
    it(`accent "${a.value}" pill label clears AA on its fill`, () => {
      const ratio = contrastRatio(a.fillInk, a.fill);
      assert.ok(ratio >= AA_BODY_TEXT, `${a.fillInk} on ${a.fill} is ${ratio}:1`);
    });

    it(`accent "${a.value}" pill label clears AA on its hover fill`, () => {
      const ratio = contrastRatio(a.fillInk, a.fillHover);
      assert.ok(ratio >= AA_BODY_TEXT, `${a.fillInk} on ${a.fillHover} is ${ratio}:1`);
    });
  }

  // The accent WORD inside a heading is the accent AS A MARK on the section's
  // own surface: display-size text, SC 1.4.3 large, 3:1. Measured for every
  // accent on every surface, which is the combination an editor can produce.
  for (const a of SECTION_ACCENTS) {
    for (const s of SECTION_SURFACES) {
      if (s.themeStatic) {
        it(`accent "${a.value}" reads on the fixed "${s.value}" band`, () => {
          const ratio = contrastRatio(a.onDarkBand, themes[0][1](s.tokens.bg));
          assert.ok(ratio >= AA_LARGE_TEXT, `${a.onDarkBand} on ${s.tokens.bg} is ${ratio}:1`);
        });
        continue;
      }
      for (const [theme, v] of themes) {
        it(`accent "${a.value}" reads on "${s.value}" in ${theme}`, () => {
          const ratio = contrastRatio(v(a.ruleToken), v(s.tokens.bg));
          assert.ok(ratio >= AA_LARGE_TEXT, `${a.ruleToken} on ${s.tokens.bg} is ${ratio}:1`);
        });
      }
    }
  }
});
