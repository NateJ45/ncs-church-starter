// Foundation, edit with care
// =============================================================================
// preview-edit-attr - explicit `data-sanity` targets for whole SECTIONS
// (ported from ncs-astro-sanity-starter 2026-08-28; PORTS.md card 17)
// =============================================================================
// Stega markers give click-to-edit on TEXT. A whole section (its band, its
// images, its empty space) has no text of its own to click, so the Presentation
// overlay cannot draw section-level controls from stega alone. An explicit
// `data-sanity` attribute on each section wrapper fixes that: the overlay
// outlines the section as ONE array item and shows the array controls in the
// canvas (insert before/after through the grouped insert menu, duplicate,
// remove, drag to reorder). That is the Squarespace feel.
//
// Three rules, each of which was learned the hard way somewhere in the family:
//
//  1. PREVIEW SURFACES ONLY. The live site never renders these attributes: the
//     static pages pass no `editDoc`, so Sections.astro emits no wrapper and no
//     attribute there. `npm run parity compare` is the gate on that promise.
//  2. The attribute must sit on a REAL block box. The overlay outlines the
//     element's rect, and a `display: contents` element has no rect.
//  3. The field name must be the array the sections actually live in. THIS
//     TEMPLATE HAS TWO, and they are not interchangeable:
//       - `flexibleSections` on every page singleton (homePage, aboutPage, the
//         churchPages set, eventsPage, sermonsPage, faqPage, contactPage,
//         privacyPage), where it is an APPEND zone below the built-in content;
//       - `sections` on the generic `page` document, where it IS the body.
//     Point the overlay at the wrong array and every control silently edits
//     nothing. The caller passes the right one (see src/pages/preview/).
//
// Drag-and-drop needs no extra props in @sanity/visual-editing 5.4.5: it is on
// as soon as the attribute exists.
// =============================================================================
import { createDataAttribute } from '@sanity/visual-editing/create-data-attribute';

export interface EditDoc {
  /** The PUBLISHED document id (no `drafts.` prefix). */
  id: string;
  /** The document _type, e.g. "page" or "aboutPage". */
  type: string;
  /** The array field holding the sections. Two names in this template. */
  field?: 'flexibleSections' | 'sections';
}

/** The `data-sanity` value that targets one section array item on a doc. */
export function sectionEditAttr(doc: EditDoc, key: string): string {
  return createDataAttribute({
    id: doc.id.replace(/^drafts\./, ''),
    type: doc.type,
    baseUrl: '/studio',
  })(`${doc.field ?? 'flexibleSections'}[_key=="${key}"]`).toString();
}
