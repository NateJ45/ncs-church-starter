// Safe to edit by hand
// =============================================================================
// SwatchInput — the colour-dot pickers for a section's surface and accent
// (PORTS.md card 26, 2026-08-28)
//
// NOT PORTABLE, on purpose. The component SHAPE is identical in every repo in
// the family, but the dot map it draws from is this template's palette, so a
// canonical copy would have to take the two maps as config. Left as a per-repo
// file until a third repo wants it; the seam is the two `*Swatches` adapters
// and the two exported wrappers at the bottom.
// =============================================================================
// Registered as `components.input` on the two enum fields inside a section's
// background object, so they render as a row of designed swatches instead of a
// list of radio labels. This is a FIELD input, which means it runs inside the
// Presentation edit panel as well as the full document form, and both get the
// same control.
//
// The colours come from src/lib/surfaces.ts, the same map the site's CSS
// classes and the contrast gate read. Nothing here is a colour literal, and the
// gate asserts those literals still match the tokens in globals.css, so the
// dots can never quietly disagree with what the page renders.
//
// Deliberately NOT a colour picker. Every option is a pair somebody designed:
// a background with the text treatment that belongs on it, or an accent with a
// button fill that carries its label. There is no free text and no hex entry.
//
// @sanity/ui only, no new dependency. The dot itself is a plain div with inline
// styles because it is a two-tone diagonal chip, which no @sanity/ui primitive
// draws.

import { useCallback } from 'react';
import { Box, Card, Flex, Stack, Text } from '@sanity/ui';
import { set, unset, type StringInputProps } from 'sanity';
import {
  SECTION_ACCENTS,
  SECTION_SURFACES,
  type AccentChoice,
  type SurfacePair,
} from '../../lib/surfaces';

/** What the row needs from either map, so one component serves both fields. */
interface Swatch {
  value: string;
  title: string;
  hint: string;
  /** Light-theme fill (upper-left half of the chip). */
  light: string;
  /** Dark-theme fill (lower-right half). Equal to `light` on a fixed band. */
  dark: string;
  /** The ink the chip previews on top of its fill. */
  ink: string;
}

const surfaceSwatches = (s: SurfacePair): Swatch => ({
  value: s.value,
  title: s.title,
  hint: s.hint,
  light: s.dot,
  dark: s.dotDark,
  ink: s.dotInk,
});

const accentSwatches = (a: AccentChoice): Swatch => ({
  value: a.value,
  title: a.title,
  hint: a.hint,
  light: a.dot,
  dark: a.dotDark,
  ink: a.fillInk,
});

function Chip({ swatch, selected }: { swatch: Swatch; selected: boolean }) {
  const twoTone = swatch.light.toLowerCase() !== swatch.dark.toLowerCase();
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: '50%',
        // A fixed band shows one colour; a theme-aware surface is split on the
        // diagonal so an editor can see it follows the reader's light/dark mode.
        background: twoTone
          ? `linear-gradient(135deg, ${swatch.light} 0 50%, ${swatch.dark} 50% 100%)`
          : swatch.light,
        boxShadow: selected
          ? '0 0 0 2px var(--card-bg-color, #fff), 0 0 0 4px var(--card-focus-ring-color, #556)'
          : 'inset 0 0 0 1px rgba(127,127,127,0.35)',
        transition: 'box-shadow 120ms ease',
      }}
    >
      <span
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 15,
          lineHeight: 1,
          color: swatch.ink,
        }}
      >
        Aa
      </span>
    </span>
  );
}

function SwatchRow(props: StringInputProps & { swatches: Swatch[]; fallback: string }) {
  const { swatches, fallback, value, onChange, readOnly, elementProps } = props;
  const current = value ?? fallback;

  const pick = useCallback(
    (next: string) => {
      // Storing the default explicitly is harmless and makes the choice visible
      // in the document; clearing back to nothing is what `unset` is for.
      onChange(next === current ? unset() : set(next));
    },
    [onChange, current],
  );

  return (
    <Stack space={3}>
      {/* elementProps is spread selectively: it carries a `readOnly` key that a
          <div> must not receive, and a ref typed for an <input>. The id is what
          the field label's htmlFor points at, so that one has to be kept. */}
      <Flex
        gap={2}
        wrap="wrap"
        role="radiogroup"
        id={elementProps?.id}
        aria-label={props.schemaType.title}
        onFocus={elementProps?.onFocus}
        onBlur={elementProps?.onBlur}
      >
        {swatches.map((s) => {
          const selected = s.value === current;
          return (
            <Card
              key={s.value}
              as="button"
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={readOnly}
              onClick={() => pick(s.value)}
              padding={2}
              radius={2}
              tone={selected ? 'primary' : 'default'}
              border={selected}
              style={{
                cursor: readOnly ? 'not-allowed' : 'pointer',
                minWidth: 84,
                textAlign: 'center',
              }}
            >
              <Stack space={2}>
                <Flex justify="center">
                  <Chip swatch={s} selected={selected} />
                </Flex>
                <Text size={0} weight={selected ? 'semibold' : 'regular'} align="center">
                  {s.title}
                </Text>
              </Stack>
            </Card>
          );
        })}
      </Flex>
      <Box>
        <Text size={1} muted>
          {swatches.find((s) => s.value === current)?.hint ?? ''}
        </Text>
      </Box>
    </Stack>
  );
}

const SURFACES = SECTION_SURFACES.map(surfaceSwatches);
const ACCENTS = SECTION_ACCENTS.map(accentSwatches);

export function SurfaceSwatchInput(props: StringInputProps) {
  return <SwatchRow {...props} swatches={SURFACES} fallback="default" />;
}

export function AccentSwatchInput(props: StringInputProps) {
  return <SwatchRow {...props} swatches={ACCENTS} fallback="bronze" />;
}

export default SurfaceSwatchInput;
