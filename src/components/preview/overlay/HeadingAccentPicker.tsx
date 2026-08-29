// =============================================================================
// HeadingAccentPicker - pick the accent word by clicking it (2026-08-28)
// =============================================================================
// The guide's own steps for the accent word are: write the heading, copy one
// word out of it into a box, and if nothing changes, check the spelling. Three
// steps, one of which is a warning about a typo. Clicking the word removes all
// three: the stored value is a slice of the heading by construction, so it
// cannot miss.
//
// THE PAGE DOM IS NEVER TOUCHED. The words are redrawn INSIDE the card as
// buttons, from the heading as the document stores it. Splitting the real
// heading element into spans would mean editing the rendered page from an
// overlay, and the rendered page is the thing being previewed.
//
// Clicking the word that is already coloured clears it, which is the same
// gesture as un-bolding: press the thing that is on to turn it off.
//
// -----------------------------------------------------------------------------
// WHY THIS HANGS OFF A HANDLE AND NOT OFF THE HEADING
// -----------------------------------------------------------------------------
// The obvious place for this control is the heading element itself. It cannot
// live there, and the reason is written into src/lib/heading-accent.ts: when an
// accent word IS found, the renderer emits the CLEANED heading split into three
// pieces, because the invisible stega markers cannot be re-inserted around a
// split that did not exist when they were placed. A heading with an accent word
// therefore carries no stega at all, so the overlay knows nothing about it and
// no component can mount on it.
//
// Mounting there would give a control that works exactly once: pick a word, and
// the control that could change or clear it disappears. So Sections.astro
// renders a small preview-only handle pointing at the section's own
// `headingAccent` field, which is a real field the schema resolves whatever the
// heading is currently rendering, and this card hangs off THAT.
//
// The open-state reasoning is the same as SectionStyleCard's; read its header.
// =============================================================================
import { useEffect, useRef, useState } from 'react';
import type { OverlayComponentProps } from '@sanity/visual-editing';
import { isAccentedWord, splitHeadingWords } from '../../../lib/heading-accent.ts';
import { resolveAccentTarget, type AccentTarget } from '../../../lib/section-fields.ts';
import { setAt, unsetAt, useDraftDocument } from './useDraftDocument.ts';
import { usePopover } from './usePopover.ts';
import { TOOL, button, closeButton, handleAnchor, note, panel, panelHead } from './styles.ts';

export default function HeadingAccentPicker(props: OverlayComponentProps): React.ReactNode {
  const { node, PointerEvents, element, focused } = props;
  const { read, write } = useDraftDocument(node.id);
  const [loaded, setLoaded] = useState<AccentTarget | null>(null);
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const showing = open && !!loaded;
  const { onKeyDown } = usePopover(showing, cardRef, () => setOpen(false));

  useEffect(() => {
    let alive = true;
    void read().then((doc) => {
      if (!alive || !doc) return;
      setLoaded(resolveAccentTarget(doc, node.path));
    });
    return () => {
      alive = false;
    };
  }, [read, node.path]);

  // The focused TRANSITION opens the card; only our own gestures close it.
  const wasFocused = useRef(false);
  useEffect(() => {
    if (focused && !wasFocused.current) setOpen(true);
    wasFocused.current = !!focused;
  }, [focused]);

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

  if (!showing || !loaded) return null;

  const tokens = splitHeadingWords(loaded.heading);
  if (!tokens.some((token) => token.word)) return null;

  const choose = (value: string, clearing: boolean) => {
    setLoaded((current) => (current ? { ...current, accent: clearing ? '' : value } : current));
    void write(clearing ? unsetAt(loaded.accentPath) : setAt(loaded.accentPath, value));
  };

  return (
    <PointerEvents style={handleAnchor}>
      {/* A div with role="dialog", not a <dialog>: the element carries
          user-agent layout (absolute position, auto margins, 1em padding, a
          solid border) that every card would then have to reset, and a
          non-modal <dialog open> does not handle Escape natively anyway, so
          usePopover is doing that work either way. Same shape as the sibling
          repos' cards. */}
      <div
        ref={cardRef}
        role="dialog"
        aria-label="Choose the accent word"
        tabIndex={-1}
        style={{ ...panel, width: '260px' }}
        onKeyDown={onKeyDown}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={panelHead}>
          <span style={{ font: `600 12px/1.2 ${TOOL.font}` }}>Accent word</span>
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

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2px',
            alignItems: 'baseline',
            padding: '10px',
          }}
        >
          {tokens.map((token, i) =>
            token.word ? (
              <button
                key={i}
                type="button"
                style={{
                  ...button,
                  padding: '2px 6px',
                  font: `600 14px/1.4 ${TOOL.font}`,
                  background: isAccentedWord(token, loaded.accent) ? TOOL.ink : TOOL.paper,
                  color: isAccentedWord(token, loaded.accent) ? TOOL.paper : TOOL.ink,
                  borderColor: isAccentedWord(token, loaded.accent) ? TOOL.ink : TOOL.line,
                }}
                aria-pressed={isAccentedWord(token, loaded.accent)}
                onClick={(event) => {
                  event.stopPropagation();
                  choose(token.value, isAccentedWord(token, loaded.accent));
                }}
              >
                {token.text}
              </button>
            ) : (
              <span key={i} aria-hidden="true" style={{ width: '2px' }} />
            ),
          )}
        </div>

        <p style={note}>
          {loaded.accent
            ? 'Click the coloured word again to make the heading plain.'
            : 'Click a word. It takes the section accent colour. One word per heading.'}
        </p>
      </div>
    </PointerEvents>
  );
}
