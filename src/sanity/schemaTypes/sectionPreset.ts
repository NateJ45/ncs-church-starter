// =============================================================================
// sectionPreset - a saved section, ready to drop onto another page
// =============================================================================
// THE PROBLEM. The secretary spends twenty minutes getting a "Join us Sunday"
// band right, then wants the same band on four more pages and rebuilds it by
// hand each time (or copies a whole page to get at one strip of it).
//
// THE SHAPE. `section` is an ARRAY of every block type, capped at one. A
// single-object field would need a union type Sanity has no syntax for, and a
// per-type field would mean seventeen fields. The array gets us three things
// for free: the same grouped "+ Add" picker the page builder uses, the normal
// block FORM (so a saved section can be edited in place, not just replayed),
// and the ordinary preview of whichever type it holds.
//
// The member list is FLEXIBLE_SECTION_MEMBERS, the same union every page uses,
// and the insert menu is the shared one, so the picker reads the same here as
// it does on a page.
//
// `sectionType` is the type name copied out of that array when the preset is
// captured. It is read-only and exists so the list can label a preset without
// opening it.
//
// HOW ONE IS MADE. Usually not here: open a page and use "Save a section as
// preset..." in the publish menu (src/sanity/actions/saveSectionPreset.tsx).
// Creating one from scratch in this list works too.
//
// HOW ONE IS USED. Open it and use "Add to a page..." in its publish menu
// (src/sanity/actions/addPresetToPage.tsx). This template has no navigator
// panel beside the preview, so the action is the insert surface; a page's own
// "+ Add" picker can only offer schema TYPES, never documents.
//
// A preset is a COPY, not a link. Editing a preset never changes the pages it
// was already added to, and editing one of those pages never changes the preset.
//
// No field groups on purpose: an undefined group name is a fatal Studio-runtime
// error in Sanity 6.4 that a build does not catch, and four fields need none.
// =============================================================================

import { defineType, defineField } from 'sanity';
import { BlockElementIcon } from '@sanity/icons';
import { FLEXIBLE_SECTION_MEMBERS, sectionArrayOptions } from './blocks';

export const sectionPreset = defineType({
  name: 'sectionPreset',
  title: 'Saved section',
  type: 'document',
  icon: BlockElementIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Name',
      type: 'string',
      description: 'Name this saved section so you can find it again.',
      validation: (R) => R.required().error('Give it a name so you can find it again.'),
    }),
    defineField({
      name: 'sectionType',
      title: 'Kind of section',
      type: 'string',
      readOnly: true,
      description: 'Filled in for you when the section is saved.',
    }),
    defineField({
      name: 'section',
      title: 'The section',
      type: 'array',
      of: FLEXIBLE_SECTION_MEMBERS,
      options: sectionArrayOptions,
      description:
        'The saved section itself. Change it here and the next page you add it to gets the new version; pages that already have it are not touched.',
      validation: (R) => R.max(1).error('A saved section holds one section. Remove the extra one.'),
    }),
    defineField({
      name: 'note',
      title: 'Note (optional)',
      type: 'text',
      rows: 2,
      description: 'A reminder for whoever finds this later, e.g. "use on ministry pages only".',
    }),
  ],
  preview: {
    select: { title: 'title', sectionType: 'sectionType', note: 'note' },
    prepare({ title, sectionType, note }) {
      return {
        title: title || '(unnamed saved section)',
        subtitle: [sectionType ? prettySectionType(sectionType) : null, note]
          .filter(Boolean)
          .join(' - '),
      };
    },
  },
});

/** `sectionImageText` -> "Image text". Same rule as src/lib/page-checks.ts. */
function prettySectionType(type: string): string {
  const bare = type.replace(/^section(?=[A-Z])/, '').replace(/Section$|Object$/, '');
  const words = bare.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
