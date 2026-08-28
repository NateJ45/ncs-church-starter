// Rebrand the starter for a new church in one command.
//
// Usage:
//   npm run rebrand              -- CHECK mode (default): prints a per-file
//                                   WOULD-CHANGE report. Nothing is written.
//   npm run rebrand -- --apply   -- APPLY mode: writes all replacements.
//
// Workflow:
//   1. Copy bootstrap.config.example.json -> bootstrap.config.json and fill it in.
//   2. npm run rebrand              (check: see what will change)
//   3. npm run rebrand -- --apply   (write)
//   4. Review `git diff`, then run `npm run typegen` and `npm run og`.
//
// How it works: the template ships with EXACT, unique placeholder strings
// ("First Church of Springfield", "example-church.org", "123 Main Street"...).
// This script replaces them, longest-first, across every text file in the
// project. It is intentionally dumb and reviewable: after --apply, the git
// diff IS the rebrand. Anything the mapping misses (a photo, a color) is in
// docs/bootstrap/setup-checklist.md.
//
// Idempotency: this is a one-shot bootstrap tool. Running it twice will not
// double-replace anything, because the placeholder strings are no longer
// present after the first --apply run.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const configPath = resolve(root, 'bootstrap.config.json');
if (!existsSync(configPath)) {
  console.error('No bootstrap.config.json found at the project root.');
  console.error('Copy bootstrap.config.example.json to bootstrap.config.json and fill it in.');
  process.exit(1);
}
const cfg = JSON.parse(readFileSync(configPath, 'utf-8'));

// ── Required-field presence check ──────────────────────────────────────────
// storageKeyPrefix is no longer required here: site.ts derives it from
// churchName via slugify(), so it never needs to be manually set.
// studioHost is no longer required either: there is no hosted *.sanity.studio
// deploy since the Studio was embedded at /studio (2026-08-28), so sanity.cli.ts
// carries no studioHost to stamp.
for (const key of ['churchName', 'shortName', 'wordmarkLine2', 'domain', 'workerName', 'city', 'addressLine', 'cityStateZip', 'email', 'pastorEmail', 'phone']) {
  if (typeof cfg[key] !== 'string' || cfg[key].trim() === '') {
    console.error(`bootstrap.config.json is missing or empty: "${key}".`);
    process.exit(1);
  }
}

// ── Config value validation ─────────────────────────────────────────────────
// Exit with a clear message on format violations so the script never writes
// invalid values into the codebase.
const validationErrors = [];

// domain: no protocol prefix, must contain at least one dot
if (/^https?:\/\//i.test(cfg.domain)) {
  validationErrors.push(`"domain" must not include a protocol — remove the "https://" prefix. Got: ${cfg.domain}`);
} else if (!cfg.domain.includes('.')) {
  validationErrors.push(`"domain" must include a dot (e.g. "mychurch.org"). Got: ${cfg.domain}`);
}

// workerName: valid Cloudflare Worker name (lowercase letters, digits, hyphens; no leading/trailing hyphens)
if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(cfg.workerName)) {
  validationErrors.push(`"workerName" must be a valid Cloudflare Worker name: lowercase letters, digits, and hyphens only, no leading/trailing hyphens. Got: ${cfg.workerName}`);
}

// email fields must contain @
for (const key of ['email', 'pastorEmail']) {
  if (!cfg[key].includes('@')) {
    validationErrors.push(`"${key}" must be a valid email address (contains "@"). Got: ${cfg[key]}`);
  }
}

if (validationErrors.length > 0) {
  console.error('\nbootstrap.config.json validation failed:\n');
  for (const msg of validationErrors) {
    console.error(`  ✗ ${msg}`);
  }
  console.error('\nFix these values and re-run.');
  process.exit(1);
}

// Ordered longest-first so overlapping placeholders resolve correctly.
const REPLACEMENTS = [
  ['First Church of Springfield', cfg.churchName],
  ['downtown Springfield', `downtown ${cfg.city}`],
  ['Springfield, IL 62701', cfg.cityStateZip],
  ['123 Main Street', cfg.addressLine],
  ['hello@example-church.org', cfg.email],
  ['pastor@example-church.org', cfg.pastorEmail],
  ['(555) 555-0100', cfg.phone],
  ['www.example-church.org', `www.${cfg.domain}`],
  ['example-church.org', cfg.domain],
  // The bare 'example-church' studioHost pair was dropped 2026-08-28 with the
  // hosted Studio: sanity.cli.ts no longer carries a studioHost placeholder.
  ['of Springfield', cfg.wordmarkLine2],
  ['First Church', cfg.shortName],
  ['Springfield', cfg.city],
  // storageKeyPrefix pair removed: site.ts now derives it from churchName via
  // slugify(), so it is always in sync and never needs to be stamped separately.
  ['church-starter', cfg.workerName],
];

// Files swept. sanity.types.ts is skipped (regenerate with `npm run typegen`).
// 2026-08-28: the Studio folded into this package, so its schemas, components
// and guides moved under src/ and are already covered by the 'src' entry.
const INCLUDE_DIRS = ['src', 'modules', 'docs/bootstrap', 'scripts'];
const INCLUDE_FILES = [
  'astro.config.mjs', 'wrangler.jsonc', 'package.json', 'README.md', 'CLAUDE.md',
  // robots.txt is now a build-time endpoint at src/pages/robots.txt.ts and is
  // swept as part of INCLUDE_DIRS (src/). public/robots.txt no longer exists.
  'public/llms.txt',
  // globals.css is swept so the @media print footer ("First Church of Springfield ·
  // example-church.org") is replaced. All replacement pairs have been audited against
  // the CSS: they match only inside string literals and pose no syntax risk.
  'src/styles/globals.css',
  // The Studio config now sits at the repo root (2026-08-28 fold-in);
  // src/sanity/structure.ts is swept via INCLUDE_DIRS.
  'sanity.config.ts',
];
const TEXT_EXT = new Set(['.ts', '.tsx', '.astro', '.mjs', '.js', '.json', '.jsonc', '.txt', '.md', '.xml', '.css', '.ndjson']);
const SKIP = new Set(['node_modules', 'dist', '.astro', '.git', 'sanity.types.ts', 'schema.json']);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (TEXT_EXT.has(extname(name))) yield p;
  }
}

const files = new Set();
for (const d of INCLUDE_DIRS) {
  const p = resolve(root, d);
  if (existsSync(p)) for (const f of walk(p)) files.add(f);
}
for (const f of INCLUDE_FILES) {
  const p = resolve(root, f);
  if (existsSync(p)) files.add(p);
}

if (!APPLY) {
  console.log('\n── CHECK MODE ─────────────────────────────────────────────────────────');
  console.log('Nothing will be written. Re-run with --apply to stamp the changes.');
  console.log('────────────────────────────────────────────────────────────────────────\n');
}

// Per-pattern hit counters — used in check mode to assert every find-pattern
// appears at least once across all files so a silently-renamed placeholder
// cannot go undetected.
const patternHits = new Map(REPLACEMENTS.map(([from]) => [from, 0]));

let totalFiles = 0;
let totalHits = 0;
for (const file of files) {
  if (file.endsWith('sanity.types.ts') || file.endsWith('rebrand.mjs')) continue;
  let text = readFileSync(file, 'utf-8');
  let hits = 0;
  for (const [from, to] of REPLACEMENTS) {
    if (from === to) continue;
    const parts = text.split(from);
    if (parts.length > 1) {
      const count = parts.length - 1;
      hits += count;
      patternHits.set(from, (patternHits.get(from) ?? 0) + count);
      text = parts.join(to);
    }
  }
  if (hits > 0) {
    totalFiles += 1;
    totalHits += hits;
    console.log(`${APPLY ? 'STAMPED' : 'WOULD CHANGE'}  ${file.slice(root.length + 1)}  (${hits} replacement${hits === 1 ? '' : 's'})`);
    if (APPLY) writeFileSync(file, text, 'utf-8');
  }
}

if (!APPLY) {
  console.log(`\nCheck mode: ${totalHits} replacement${totalHits === 1 ? '' : 's'} across ${totalFiles} file${totalFiles === 1 ? '' : 's'} would be made.`);

  // Assert every find-pattern matched at least once across the scanned files.
  // A pattern with zero hits means the placeholder has already been renamed or
  // removed, which would make --apply a no-op for that token. That is usually a
  // mistake (e.g. a placeholder was edited directly instead of via rebrand).
  const missing = REPLACEMENTS
    .filter(([from, to]) => from !== to && (patternHits.get(from) ?? 0) === 0)
    .map(([from]) => from);

  if (missing.length > 0) {
    console.error('\n✗ CHECK FAILED: the following placeholder patterns were not found in any file.');
    console.error('  This means --apply would silently skip them. Investigate before proceeding.\n');
    for (const m of missing) {
      console.error(`  Missing: "${m}"`);
    }
    process.exit(1);
  } else {
    console.log('✓ All placeholder patterns found. Run `npm run rebrand -- --apply` to write the changes.');
  }
} else {
  console.log(`\nDone: ${totalHits} replacements across ${totalFiles} files.`);
  console.log('Now: review `git diff`, then `npm run typegen` and `npm run og`, and finish docs/bootstrap/setup-checklist.md.');
}
