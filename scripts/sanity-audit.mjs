// Read-only audit of the live Sanity dataset. Answers, in one run:
//   1. What document types exist, and how many of each?
//   2. Are any expected singletons or collections missing entirely?
//   3. Which fields are empty or absent on each document (vs the extracted schema)?
//   4. Are there unpublished drafts that differ from the published docs?
//
// Run: node scripts/sanity-audit.mjs            (summary: counts + gaps + drafts)
//      node scripts/sanity-audit.mjs --fields   (adds the per-document field diff)
//      node scripts/sanity-audit.mjs --doc siteSettings   (dump one full document)
//
// Read-only: uses SANITY_API_READ_TOKEN, never writes. Safe to run any time.
// Born from a real incident: a field LOOKED empty in a Studio tab while the
// published dataset had the value all along (see OPERATIONS.md gotchas).
// This script is the ground truth for "what is actually in the dataset."

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Same .env parse pattern as the other scripts (see OPERATIONS.md).
const env = Object.fromEntries(
  readFileSync(resolve(root, '.env'), 'utf-8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; }),
);

const PROJECT = env.PUBLIC_SANITY_PROJECT_ID;
const DATASET = env.PUBLIC_SANITY_DATASET ?? 'production';
const API = env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01';
const TOKEN = env.SANITY_API_READ_TOKEN;
if (!PROJECT || !TOKEN) {
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_READ_TOKEN in .env');
  process.exit(1);
}

// Expected document types. Keep in sync with SINGLETON_TYPES in
// sanity.config.ts and the collection schemas in src/sanity/schemaTypes/.
const EXPECTED_SINGLETONS = [
  'siteSettings', 'homePage', 'aboutPage', 'faqPage', 'contactPage', 'notFoundPage', 'privacyPage',
  'eventsPage', 'sermonsPage', 'worshipPage', 'beliefsPage', 'musicPage', 'staffPage',
  'growPage', 'servePage', 'kidsPage', 'foodPage', 'useOurSpacePage', 'weddingsPage', 'givePage',
];
const EXPECTED_COLLECTIONS = ['staffMember', 'ministry', 'event', 'sermon', 'faqItem', 'worshipResource', 'announcement', 'form'];

const SYS = new Set(['_id', '_type', '_rev', '_createdAt', '_updatedAt', '_key', '_originalId']);

async function groq(query) {
  const url = `https://${PROJECT}.api.sanity.io/v${API}/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) { console.error('Query failed', res.status, await res.text()); process.exit(1); }
  return (await res.json()).result;
}

// "Empty" = null/undefined, blank string, empty array, or an object whose
// every non-system leaf is empty. Numbers and booleans (incl. false) count as set.
function isEmpty(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') {
    const keys = Object.keys(v).filter((k) => !SYS.has(k));
    return keys.length === 0 || keys.every((k) => isEmpty(v[k]));
  }
  return false;
}

const args = process.argv.slice(2);
const FIELDS_MODE = args.includes('--fields');
const DOC_ARG = args.includes('--doc') ? args[args.indexOf('--doc') + 1] : null;

// --doc <id>: dump one document and exit.
if (DOC_ARG) {
  const doc = await groq(`*[_id == "${DOC_ARG}"][0]`);
  console.log(doc ? JSON.stringify(doc, null, 2) : `No document with _id "${DOC_ARG}"`);
  process.exit(0);
}

console.log(`Sanity audit — project ${PROJECT}, dataset ${DATASET}, API v${API}\n`);

// ---- 1+2: published docs, counts, missing types --------------------------
const docs = await groq(
  `*[ !(_id in path("drafts.**")) && !(_type match "sanity*") && !(_type match "system*") && _type != "media.tag" ]`,
);
const byType = {};
for (const d of docs) (byType[d._type] ||= []).push(d);

console.log(`Published content documents: ${docs.length}`);
console.log('\n== Counts by type ==');
for (const t of Object.keys(byType).sort()) console.log(`  ${t}: ${byType[t].length}`);

const present = new Set(Object.keys(byType));
const missingS = EXPECTED_SINGLETONS.filter((t) => !present.has(t));
const missingC = EXPECTED_COLLECTIONS.filter((t) => !present.has(t));
console.log('\n== Missing expected types ==');
console.log(missingS.length ? `  Singletons with no published doc: ${missingS.join(', ')}` : '  Singletons: all present');
console.log(missingC.length ? `  Collections with zero docs:      ${missingC.join(', ')}` : '  Collections: all have docs');

// ---- 4: drafts (unpublished edits overlay the published docs in Studio) ---
const drafts = await groq(`*[_id in path("drafts.**")]{ _id, _type, _updatedAt }`);
console.log(`\n== Unpublished drafts: ${drafts.length} ==`);
for (const d of drafts) console.log(`  ${d._type}  ${d._id}  (updated ${d._updatedAt})`);
if (drafts.length) console.log('  NOTE: Studio shows the draft; the live build uses the published version.');

// ---- 3: per-document field diff (only with --fields; it is verbose) -------
if (FIELDS_MODE) {
  // The extracted schema (schema.json at the repo root since the 2026-08-28
  // studio fold-in, written by `npm run typegen`) gives the complete field list
  // per type. Without it, fall back to keys present on the doc (catches EMPTY
  // but not ABSENT fields).
  const schemaPath = resolve(root, 'schema.json');
  let fieldsByType = null;
  if (existsSync(schemaPath)) {
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    fieldsByType = {};
    for (const t of schema) {
      if (t.type !== 'document') continue;
      fieldsByType[t.name] = Object.keys(t.attributes ?? {}).filter((k) => !SYS.has(k));
    }
  } else {
    console.log('\n(schema.json not found — run `npm run typegen` for the full absent-field diff)');
  }

  console.log('\n== Field-level audit ==');
  for (const t of Object.keys(byType).sort()) {
    for (const d of byType[t]) {
      const schemaFields = fieldsByType?.[t] ?? Object.keys(d).filter((k) => !SYS.has(k));
      const absent = schemaFields.filter((f) => !(f in d));
      const empty = schemaFields.filter((f) => f in d && isEmpty(d[f]));
      if (!absent.length && !empty.length) continue;
      const label = d.title || d.name || d.question || d.slug?.current || d._id;
      console.log(`\n  [${t}] ${label}`);
      if (empty.length) console.log(`    empty:  ${empty.join(', ')}`);
      if (absent.length) console.log(`    absent: ${absent.join(', ')}`);
    }
  }
  console.log('\nReminder: many absent fields are intentional optionals (seoImage,');
  console.log('flexibleSections, script accents, integration URLs). Check the schema');
  console.log('description before treating a gap as a problem.');
}
