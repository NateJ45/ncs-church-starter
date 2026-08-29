// =============================================================================
// SectionStyleCard - the appearance card that opens off the handle (2026-08-28)
// =============================================================================
// "Change how this section looks" already exists as a form: open the section,
// scroll to the collapsed Section background panel, open it, click a swatch.
// This is the SAME six surfaces and three accents offered in the corner of the
// band itself, so the gesture is look-at-the-band then click-the-colour instead
// of look-at-the-band, find its row in the list, open it, open the panel, click,
// look back.
//
// It is the SAME source either way (src/lib/surfaces.ts, whose contrast gate
// measures every pair), so there is no second list of colours to go stale. The
// registry that says WHICH sections have the fields is src/lib/section-fields.ts
// and its drift gate reads the schema.
//
// GATING, TWICE.
//  1. BY TYPE. `sectionForm` and `embed` carry no `bgField()` at all, so the
//     handle is never rendered for them and the card refuses them anyway.
//  2. PER INSTANCE. A section with a background PHOTO or VIDEO does not wear its
//     surface classes: SectionShell paints `text-white` over the media and never
//     calls `surfaceClass`. So on those the surface half is replaced by one line
//     saying why, and only the accent half is offered. A control must never
//     promise what the renderer will not honour.
//
// -----------------------------------------------------------------------------
// WHY THE CARD KEEPS ITS OWN OPEN STATE
// -----------------------------------------------------------------------------
// A card drawn only while the host says `focused` vanishes while the editor
// moves the mouse toward it. `focused` is not ours to lean on: the host clears
// it on `overlay/blur` (any click that is not on overlay chrome, and any
// Escape) and RECOMPUTES it on every `presentation/focus` the Studio sends
// back, keeping it only for the element whose path matches the Studio's focus
// path exactly. So the moment the Studio's form focus settles anywhere other
// than this exact field, which it does on its own a beat after the click, the
// card would disappear mid-gesture.
//
// What the host does NOT do is unmount us for that: it renders an element's
// overlay for `activated || focused`, and `activated` means "in the viewport".
// The handle is pinned to the top-right of the band the editor is looking at, so
// it stays activated and this component stays MOUNTED with its state intact.
//
// Hence: `focused` turning truthy OPENS the card, and only our own three
// gestures close it (the close button, Escape, or a pointer press outside). The
// card is also anchored flush to the handle, so the pointer never crosses
// unowned pixels on the way to a row.
// =============================================================================
import { useEffect, useRef, useState } from 'react';
import type { OverlayComponentProps } from '@sanity/visual-editing';
import {
  ACCENT_FIELD,
  BACKGROUND_FIELD,
  SECTION_ARRAY_FIELDS,
  SURFACE_FIELD,
  accentChoices,
  hasAppearance,
  storedAccent,
  storedSurface,
  surfaceApplies,
  surfaceChoices,
} from '../../../lib/section-fields.ts';
import { readSectionPath, sectionByKey } from '../../../lib/sanity-path.ts';
import { ACCENT_BY_VALUE, SURFACE_BY_VALUE } from '../../../lib/surfaces.ts';
import { setInside, useDraftDocument } from './useDraftDocument.ts';
import { usePopover } from './usePopover.ts';
import {
  TOOL,
  closeButton,
  groupLabel,
  handleAnchor,
  note,
  optionDot,
  optionRow,
  panel,
  panelHead,
} from './styles.ts';

/**
 * The fill for one swatch dot, split light-over-dark when the value differs
 * between themes so a surface that follows the reader's setting LOOKS like it
 * does. The canonical `optionDot` takes a finished CSS background string, which
 * is what keeps that shared style free of this repo's swatch vocabulary.
 */
function dotFill(choice: { dot: string; dotDark: string }): string {
  return choice.dot === choice.dotDark
    ? choice.dot
    : `linear-gradient(135deg, ${choice.dot} 0 50%, ${choice.dotDark} 50% 100%)`;
}

interface Chosen {
  type: string;
  /** The raw section item, for the per-instance gate. */
  raw: Record<string, unknown> | null;
  surface: string;
  accent: string;
}

/** Class tokens, deduped, from a registry entry's `className`. */
function tokensOf(className: string | null | undefined): string[] {
  return (className ?? '').split(/\s+/).filter(Boolean);
}

/**
 * The <section> the handle belongs to. Sections.astro renders the handle as the
 * last child of the preview-only wrapper whose other child is the band itself,
 * so the band is the wrapper's first <section>. Null when the shape is anything
 * else, which simply turns the optimistic recolour off.
 */
function bandFor(handle: Element): HTMLElement | null {
  return handle.parentElement?.querySelector('section') ?? null;
}

/**
 * Swap one class list for another on the band, so it recolours on click rather
 * than on the soft refresh a second later. Returns an undo, or null when the
 * band is NOT wearing the classes we expected - a section painting something we
 * did not predict must be left alone rather than half-rewritten.
 */
function applyClasses(
  band: HTMLElement | null,
  from: string | null | undefined,
  to: string | null | undefined,
): (() => void) | null {
  if (!band) return null;
  const remove = tokensOf(from);
  const add = tokensOf(to);
  if (remove.some((cls) => !band.classList.contains(cls))) return null;
  band.classList.remove(...remove);
  band.classList.add(...add);
  return () => {
    band.classList.remove(...add);
    band.classList.add(...remove);
  };
}

export default function SectionStyleCard(props: OverlayComponentProps): React.ReactNode {
  const { node, PointerEvents, focused, element } = props;
  const section = readSectionPath(node.path, SECTION_ARRAY_FIELDS);
  const array = section?.array;
  const key = section?.key;
  const { read, write } = useDraftDocument(node.id);
  const [chosen, setChosen] = useState<Chosen | null>(null);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // The card only exists once the document read has told us this section HAS a
  // background object, so the autofocus that makes Escape reachable has to wait.
  const showing = open && !!section && !!chosen && hasAppearance(chosen.type);
  const { onKeyDown } = usePopover(showing, cardRef, () => setOpen(false));

  // One read on open. Every later value is the one this card just set, so the
  // tick moves the instant it is clicked rather than after a round trip.
  useEffect(() => {
    if (!array || !key) return undefined;
    let alive = true;
    void read().then((doc) => {
      if (!alive || !doc) return;
      const found = sectionByKey(doc, array, key);
      const type = typeof found?._type === 'string' ? found._type : '';
      setChosen({
        type,
        raw: found,
        surface: storedSurface(type, found),
        accent: storedAccent(found),
      });
    });
    return () => {
      alive = false;
    };
  }, [read, array, key]);

  // Clicking the handle is what selects this node, so the host telling us we
  // just became focused IS the open gesture. Only the TRANSITION opens: a later
  // `presentation/focus` for some other path drops `focused` again and must not
  // take the card with it.
  const wasFocused = useRef(false);
  useEffect(() => {
    if (focused && !wasFocused.current) setOpen(true);
    wasFocused.current = !!focused;
  }, [focused]);

  // Our own outside-press close, so the host's blur cannot do it for us. A press
  // on the handle re-opens rather than closes: `focused` is already true by
  // then, so the effect above would never fire a second time.
  useEffect(() => {
    if (!open) return undefined;
    const doc = element.ownerDocument;
    const onPointerDown = (event: Event) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (element.contains(target)) {
        setOpen(true);
        return;
      }
      if (cardRef.current?.contains(target)) return;
      setOpen(false);
    };
    doc.addEventListener('pointerdown', onPointerDown, true);
    return () => doc.removeEventListener('pointerdown', onPointerDown, true);
  }, [open, element]);

  if (!showing || !section || !chosen) return null;

  const canSurface = surfaceApplies(chosen.type, chosen.raw);
  const container = [...section.itemPath, BACKGROUND_FIELD];

  const chooseSurface = (value: string) => {
    if (chosen.surface === value) return;
    // Recolour the band NOW, reconcile behind. The soft refresh that follows the
    // patch re-renders the section from the draft and replaces these classes
    // with the real ones. If the patch never lands, the undo puts them back.
    const undo = applyClasses(
      bandFor(element),
      SURFACE_BY_VALUE[chosen.surface]?.className,
      SURFACE_BY_VALUE[value]?.className,
    );
    const previous = chosen.surface;
    setChosen((current) => (current ? { ...current, surface: value } : current));
    void write(setInside(container, SURFACE_FIELD, value)).then((ok) => {
      if (ok) return;
      undo?.();
      setChosen((current) => (current ? { ...current, surface: previous } : current));
    });
  };

  const chooseAccent = (value: string) => {
    if (chosen.accent === value) return;
    // The accent is one class on the same <section> (bronze emits none), so the
    // same optimistic swap works, with the same refusal when the band is not
    // wearing what we expected.
    const undo = applyClasses(
      bandFor(element),
      ACCENT_BY_VALUE[chosen.accent]?.className,
      ACCENT_BY_VALUE[value]?.className,
    );
    const previous = chosen.accent;
    setChosen((current) => (current ? { ...current, accent: value } : current));
    void write(setInside(container, ACCENT_FIELD, value)).then((ok) => {
      if (ok) return;
      undo?.();
      setChosen((current) => (current ? { ...current, accent: previous } : current));
    });
  };

  return (
    <PointerEvents style={handleAnchor}>
      {/* A div with role="dialog", not a <dialog>: the element carries
          user-agent layout every card would then have to reset, and a
          non-modal <dialog open> does not handle Escape natively anyway, so
          usePopover is doing that work either way. */}
      <div
        ref={cardRef}
        role="dialog"
        aria-label="How this section looks"
        tabIndex={-1}
        style={{ ...panel, maxHeight: '70vh', overflowY: 'auto' }}
        onKeyDown={onKeyDown}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={panelHead}>
          <span style={{ font: `600 12px/1.2 ${TOOL.font}` }}>How this section looks</span>
          <button
            type="button"
            style={closeButton}
            aria-label="Close"
            title="Close"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
            }}
          >
            &#10005;
          </button>
        </div>

        {/* The canonical groupLabel draws its own top rule, so the first group
            gets it suppressed rather than the second group adding one. */}
        <span style={{ ...groupLabel, borderTop: 'none' }}>Surface</span>
        {canSurface ? (
          surfaceChoices().map((pair) => {
            const selected = chosen.surface === pair.value;
            return (
              <button
                key={pair.value}
                type="button"
                title={pair.hint}
                aria-pressed={selected}
                style={optionRow(selected, hovered === `s:${pair.value}`)}
                onMouseEnter={() => setHovered(`s:${pair.value}`)}
                onMouseLeave={() => setHovered((was) => (was === `s:${pair.value}` ? null : was))}
                onFocus={() => setHovered(`s:${pair.value}`)}
                onBlur={() => setHovered((was) => (was === `s:${pair.value}` ? null : was))}
                onClick={(event) => {
                  event.stopPropagation();
                  chooseSurface(pair.value);
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    ...optionDot(dotFill(pair), 18),
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: pair.dotInk,
                    font: `600 9px/1 ${TOOL.font}`,
                  }}
                >
                  Aa
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>{pair.title}</span>
                <span aria-hidden="true" style={{ color: TOOL.ink, width: '10px' }}>
                  {selected ? '✓' : ''}
                </span>
              </button>
            );
          })
        ) : (
          <p style={note}>
            This section has a photo or a video behind it, so it paints white text over the picture
            and the surface colour is not used. Remove the background media to pick a surface.
          </p>
        )}

        <span style={groupLabel}>Accent colour</span>
        {accentChoices().map((choice) => {
          const selected = chosen.accent === choice.value;
          return (
            <button
              key={choice.value}
              type="button"
              title={choice.hint}
              aria-pressed={selected}
              style={optionRow(selected, hovered === `a:${choice.value}`)}
              onMouseEnter={() => setHovered(`a:${choice.value}`)}
              onMouseLeave={() => setHovered((was) => (was === `a:${choice.value}` ? null : was))}
              onFocus={() => setHovered(`a:${choice.value}`)}
              onBlur={() => setHovered((was) => (was === `a:${choice.value}` ? null : was))}
              onClick={(event) => {
                event.stopPropagation();
                chooseAccent(choice.value);
              }}
            >
              <span aria-hidden="true" style={optionDot(dotFill(choice), 18)} />
              <span style={{ flex: 1, minWidth: 0 }}>{choice.title}</span>
              <span aria-hidden="true" style={{ color: TOOL.ink, width: '10px' }}>
                {selected ? '✓' : ''}
              </span>
            </button>
          );
        })}
      </div>
    </PointerEvents>
  );
}
