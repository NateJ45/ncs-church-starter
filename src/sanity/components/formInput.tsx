// Foundation, edit with care.
//
// =============================================================================
// StudioFormInput - the single global form input wrapper (2026-08-28)
// =============================================================================
// Sanity allows exactly ONE `form.components.input` for the whole Studio, and
// this template now wants two things from it, so they are composed here rather
// than tangled into each other:
//
//  1. CharacterCountInput - the live "47 / 60" counter under any capped text
//     field. It passes everything else straight through untouched.
//  2. LiveDraftBridge - mounted ONCE per open document, at the form root, so the
//     editor's keystrokes reach the Presentation preview a network round trip
//     earlier than the listen-driven path can manage. It renders null.
//
// WHY THE ROOT INPUT IS THE MOUNT POINT for (2): it is the one component in this
// Studio that is rendered exactly once per open document AND knows which
// document that is. This template has no Presentation navigator to hang the
// bridge off (the library of record does), and the bridge is harmless where
// there is no preview - see the mounting note in ./LiveDraftBridge.tsx.
//
// The root is `path.length === 0`: every nested field, array item and block has
// a non-empty path, so the bridge cannot be mounted twice for one document.
// =============================================================================
import type { InputProps } from 'sanity';
import { CharacterCountInput } from './CharacterCountInput';
import { LiveDraftBridge } from './LiveDraftBridge';

/** The published id for a form value, whose `_id` may be a draft id. */
function publishedId(value: unknown): string | null {
  const id = (value as { _id?: unknown } | null | undefined)?._id;
  if (typeof id !== 'string' || id === '') return null;
  return id.replace(/^drafts\./, '');
}

export function StudioFormInput(props: InputProps) {
  const documentId = props.path.length === 0 ? publishedId(props.value) : null;

  if (!documentId) return <CharacterCountInput {...props} />;

  return (
    <>
      <LiveDraftBridge documentId={documentId} documentType={props.schemaType.name} />
      <CharacterCountInput {...props} />
    </>
  );
}

export default StudioFormInput;
