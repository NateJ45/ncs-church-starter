// Safe to edit by hand
// =============================================================================
// tool-theme - the ONE per-repo thing about the in-canvas controls (card 28)
// =============================================================================
// `styles.ts` beside this file is canonical: every repo in the family draws the
// same tool chrome, and the shapes, radii, shadows and spacing are shared. The
// only thing that is genuinely this project's own is the six values below, so
// they live here, alone, and a fork edits this file and nothing else.
//
// FIXED, AND THEME-INDEPENDENT ON PURPOSE. These controls float over the page,
// so they have to read as TOOLS rather than as content: a white card on a
// chapel-green band still reads as a control, a green card on a green band
// reads as part of the design. The values are written as LITERALS rather than
// `var(--foreground)` for the same reason - the site's tokens flip in dark mode,
// and a tool that flipped with them would disappear against the band it sits on.
//
// The hexes are this site's LIGHT-MODE tokens from src/styles/globals.css:
// `--card` (#FBF8F2) reads as paper without the glare of pure white on a cream
// page, `--foreground` (#36302A) is the ink, and `--muted-foreground` (#635849)
// is the warm gray. The shadow is tinted with the chapel green rather than with
// neutral black, so a card lifting off a green band does not look grimy.
//
// THE FONT IS THE ONE DELIBERATE DEPARTURE from "the site's own type". Both site
// faces are serifs (Instrument Serif for display, Newsreader for body); a serif
// tool reads as a pull quote that somebody has stuck buttons on, and these are
// buttons. `npm run rebrand` does NOT rewrite this file; a rebrand that changes
// the ink or the paper should update it by hand in the same pass, and nothing
// breaks if it does not - the controls simply stay in the old neutral.
// =============================================================================

/** The palette and type the canonical `styles.ts` draws every control with. */
export interface ToolTheme {
  /** Card and button background. */
  paper: string;
  /** Text, and the filled state of a pressed control. */
  ink: string;
  /** Captions and secondary text. */
  muted: string;
  /** Hairline borders. */
  line: string;
  /** The drop shadow that lifts a floating card off the page. */
  shadow: string;
  /** The font stack. */
  font: string;
}

export const TOOL: ToolTheme = {
  paper: '#FBF8F2',
  ink: '#36302A',
  muted: '#635849',
  line: 'rgba(54, 48, 42, 0.16)',
  shadow: '0 6px 20px rgba(22, 50, 44, 0.24), 0 1px 2px rgba(54, 48, 42, 0.16)',
  font: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};
