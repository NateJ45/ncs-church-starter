// Foundation, edit with care
// =============================================================================
// CMS content client - for the Studio-only PREVIEW path (/preview/*)
// (ported from ncs-astro-sanity-starter 2026-08-28; lineage: presacademy, WCP)
// =============================================================================
// Unlike src/lib/sanity.ts (which reads once at BUILD time for the static
// public pages), this client runs per request on `prerender = false` preview
// routes and must read live DRAFT content, so the token comes from the Worker
// runtime env (`cloudflare:workers`), never from a build-time var. Never import
// this from a prerendered page.
//
// perspective/stega both switch on `draftMode`, which callers derive from the
// presence of the Presentation Tool's perspective cookie. There is deliberately
// no fallback argument here (unlike sanityFetch): a preview page should show
// real Sanity state, including empty and missing fields, so an editor notices a
// gap instead of silently seeing built-in fallback copy.
//
// FAILS CLOSED with no SANITY_TOKEN: the client is built without credentials
// and Sanity refuses the draft perspective, so the preview route errors rather
// than quietly serving published content dressed as a draft.
// =============================================================================
import { createClient, type SanityClient } from '@sanity/client';
import { env } from 'cloudflare:workers';

export const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string;
export const dataset = (import.meta.env.PUBLIC_SANITY_DATASET as string) || 'production';
export const apiVersion = (import.meta.env.PUBLIC_SANITY_API_VERSION as string) || '2026-05-01';

// -----------------------------------------------------------------------------
// Fresh-clone guard: FAIL CLOSED, but say why
// -----------------------------------------------------------------------------
// A clone of this template with no Sanity project and no runtime token still
// builds and still serves the whole public site (src/lib/sanity.ts falls back to
// the inline empty-state copy). The preview stack cannot fall back to anything:
// with no project id the Sanity client constructor throws, and with no token the
// draft perspective is refused. Left alone that surfaces as a bare 500 with a
// stack trace in the Worker log, which reads like a bug in the template rather
// than "you have not set this up yet".
//
// So every preview entry point checks this first and answers with the setup
// steps instead. Keep it a 503: the route is fine, the service behind it is not
// configured.
//
// The placeholder list must stay in step with isSanityUnconfigured in
// src/lib/sanity.ts, plus astro.config.mjs's 'placeholder-project-id' default.
const PLACEHOLDER_IDS = new Set(['', 'your-project-id', 'placeholder', 'placeholder-project-id']);

/** Whether the preview routes can do anything at all in this environment. */
export function previewConfig(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!projectId || PLACEHOLDER_IDS.has(projectId.trim())) {
    missing.push('PUBLIC_SANITY_PROJECT_ID (build-time, .env)');
  }
  if (!(env as { SANITY_TOKEN?: string }).SANITY_TOKEN) {
    missing.push('SANITY_TOKEN (Worker runtime secret, .dev.vars locally)');
  }
  return { ok: missing.length === 0, missing };
}

/** The 503 every preview entry point returns when setup is incomplete. */
export function previewUnconfiguredResponse(missing: string[]): Response {
  return new Response(
    'Live preview is not configured yet.\n\n' +
      'Missing:\n' +
      missing.map((m) => `  - ${m}`).join('\n') +
      '\n\nSee .env.example and .dev.vars.example. The embedded Studio also needs\n' +
      'this origin on the project CORS allow list:\n' +
      '  npx sanity cors add <origin> --credentials\n',
    { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
}

// -----------------------------------------------------------------------------
// NON_STEGA_FIELDS - the single most important list in the preview stack
// -----------------------------------------------------------------------------
// Fields chosen from a fixed dropdown or radio in the schema. NEVER free text an
// editor types, and never displayed as prose. They drive class and component
// selection in the renderers (Sections.astro branches on `_type`, SectionShell
// on the background `tone`, and the block components on `align`, `columns`,
// `imageSide`, `mediaSide`, `mediaType`, `padding`, `width`, ...).
//
// Stega encodes a ~1KB run of INVISIBLE marker characters into every string it
// touches so click-to-edit knows which field to open. On a display string that
// is the whole point; on one of these it silently breaks the exact-string
// comparison (`"chapel" + <markers>` !== `"chapel"`), so the preview mis-renders
// while the live static site is fine. Excluding them costs nothing: you pick
// these from a list, there is no text to click into.
//
// ADD ANY NEW LOGIC-DRIVING DROPDOWN FIELD HERE THE DAY YOU ADD THE FIELD.
// The list below was derived by scanning every `options: { list: ... }` field in
// src/sanity/schemaTypes/ on 2026-08-28, then padded with the names the rest of
// the site family uses, so a section ported in from a sibling repo is covered on
// arrival.
// -----------------------------------------------------------------------------
const NON_STEGA_FIELDS = new Set([
  // Present in this template's schemas today (blocks.ts, churchPages.ts,
  // ctaBlock.ts, embed.ts, event.ts, sermon.ts, form.ts, siteSettings.ts,
  // worshipResource.ts, staffMember.ts, ministry.ts, faqItem.ts).
  'align',
  'audience',
  'category',
  'columns',
  'eventType',
  'imageSide',
  'linkType',
  'liturgicalSeason',
  'mediaSide',
  'mediaType',
  'mode',
  'padding',
  'season',
  'service',
  'source',
  'style',
  'tone',
  'type',
  'width',
  // Not in this template yet, but standard enum names across the site family.
  // Carried so a block ported from a sibling repo is not a preview-only bug
  // waiting to be found.
  'businessModel',
  'businessType',
  'heightHint',
  'layout',
  'navGroup',
  'platform',
  'size',
  'sourceType',
  'variant',
  'overlay',
  'surface',
  'headingLevel',
  'format',
  'icon',
  'aspect',
  'ratio',
  // Appearance controls, 2026-08-28 (PORTS.md card 26). Audited field by field:
  //   accent         NEW, and exactly the classic case. SectionShell looks it
  //                  up in a map to pick a class; encoded, it would miss and
  //                  every section would silently render the default accent in
  //                  the preview while the live page showed the chosen one.
  //   headingAccent  NEW, and the sharper case: it is matched against the
  //                  heading with indexOf, so an encoded value would never find
  //                  its own word. src/lib/heading-accent.ts ALSO strips both
  //                  sides with plain() -- belt and braces, because that helper
  //                  runs on the live site too, where this list does not exist.
  //   tone           already listed above; unchanged, and now carries two more
  //                  values ("card", "ink") that select classes the same way.
  //   columns        already listed above, and it is what the two NEW column
  //                  controls (sectionSteps, sectionDynamicList) are named.
  //   imageSide / mediaSide / padding  already listed above; the wave rewords
  //                  their Studio labels and touches nothing else.
  // Nothing else in this wave drives logic from a string: the rich twins are
  // portable text meant to be clicked into, so they KEEP their stega.
  'accent',
  'headingAccent',
]);

export function getPreviewClient(draftMode: boolean): SanityClient {
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: (env as { SANITY_TOKEN?: string }).SANITY_TOKEN,
    perspective: draftMode ? 'drafts' : 'published',
    stega: {
      enabled: draftMode,
      studioUrl: '/studio',
      // Encode display strings (click-to-edit) but skip the dropdown fields
      // above, whose exact values are used in rendering logic.
      filter: (props) =>
        NON_STEGA_FIELDS.has(String(props.sourcePath.at(-1))) ? false : props.filterDefault(props),
    },
  });
}

/** Run a GROQ query with the draft-aware preview client. */
export async function previewFetch<T>(
  draftMode: boolean,
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return getPreviewClient(draftMode).fetch<T>(query, params);
}
