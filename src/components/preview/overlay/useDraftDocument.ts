// =============================================================================
// useDraftDocument - reading the frame's own copy of the draft (2026-08-28)
// =============================================================================
// `useDocuments()` from @sanity/visual-editing/react hands back the OPTIMISTIC
// DOCUMENT for an id: the in-memory copy the parent Studio keeps this frame's
// actor fed with over the comlink. Reading it needs no Sanity token and no write
// client, which matters because the preview island is public code in a public
// bundle and must never grow one.
//
// THIS IS THE READING HALF ONLY. The library of record's version (ported from
// presacademy 2026-08-28) also carries `read`, `readAt` and `write`, which exist
// for the IN-CANVAS CONTROLS - the floating swatch / accent / text cards that
// patch the draft from inside the page. This template has no such controls (its
// equivalents are Studio document actions), so the writing half would be dead
// code with a dependency of its own (src/lib/sanity-path.ts) trailing behind it.
// If in-canvas controls are ever ported here, take that file whole rather than
// growing this one back a piece at a time.
//
// The hook is only meaningful inside the <VisualEditing> tree with the
// optimistic actor running, and before a document has streamed in the underlying
// call THROWS. Both are caught here and reported as "not now" rather than
// crashing the preview page - `useInstantText` calls this on every edit, so a
// miss simply means the next edit tries again a moment later.
// =============================================================================
import { useCallback } from 'react';
import { useDocuments } from '@sanity/visual-editing/react';

export interface DraftDocument {
  /**
   * The current draft snapshot, or null when it cannot be read yet. ONE attempt
   * and no console warning: this runs on every edit rather than on a hover, so a
   * retry-and-warn would put a sleep and a log line in a hot path, and there is
   * nothing to recover.
   */
  readNow: () => Promise<Record<string, unknown> | null>;
}

export function useDraftDocument(documentId: string): DraftDocument {
  const { getDocument } = useDocuments();

  const readNow = useCallback(async () => {
    try {
      const doc = getDocument<Record<string, unknown>>(documentId);
      return (await doc.getSnapshot()) as Record<string, unknown> | null;
    } catch {
      return null;
    }
  }, [getDocument, documentId]);

  return { readNow };
}
