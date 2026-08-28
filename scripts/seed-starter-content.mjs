// Import the starter content into a fresh Sanity project.
//
//   node scripts/seed-starter-content.mjs            (dry run: lists the docs)
//   node scripts/seed-starter-content.mjs --apply    (imports)
//
// Reads scripts/starter-content.ndjson, and if a bootstrap.config.json exists
// at the project root (see scripts/rebrand.mjs), applies the SAME placeholder
// replacements to the content first, so the dataset arrives already carrying
// the new church's name, address, and contact details. Without a config, the
// generic "First Church of Springfield" placeholders import as-is (fine for
// trying the Studio; editors replace them later).
//
// Idempotent: import runs with --replace, so re-running overwrites the same
// starter _ids without duplicating. Your own documents are never touched.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

let ndjson = readFileSync(resolve(root, 'scripts/starter-content.ndjson'), 'utf-8');

const configPath = resolve(root, 'bootstrap.config.json');
if (existsSync(configPath)) {
  const cfg = JSON.parse(readFileSync(configPath, 'utf-8'));
  const REPLACEMENTS = [
    ['First Church of Springfield', cfg.churchName],
    ['downtown Springfield', `downtown ${cfg.city}`],
    ['Springfield, IL 62701', cfg.cityStateZip],
    ['123 Main Street', cfg.addressLine],
    ['hello@example-church.org', cfg.email],
    ['pastor@example-church.org', cfg.pastorEmail],
    ['(555) 555-0100', cfg.phone],
    ['First Church', cfg.shortName],
    ['Springfield', cfg.city],
  ];
  for (const [from, to] of REPLACEMENTS) {
    if (typeof to === 'string' && to.trim()) ndjson = ndjson.split(from).join(to);
  }
  console.log('Applied bootstrap.config.json identity to the starter content.');
} else {
  console.log('No bootstrap.config.json found: importing generic placeholders.');
}

const docs = ndjson.trim().split('\n').map((l) => JSON.parse(l));
console.log(`\nStarter documents (${docs.length}):`);
for (const d of docs) console.log(`  ${d._type.padEnd(14)} ${d._id}`);

if (!APPLY) {
  console.log('\nDry run only. Re-run with --apply to import into the dataset');
  console.log('configured in .env / sanity.cli.ts (requires the Sanity CLI login or token).');
  process.exit(0);
}

const outDir = resolve(root, 'tmp');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, 'starter-content.ndjson');
writeFileSync(outPath, ndjson, 'utf-8');

console.log('\nRunning sanity dataset import...\n');
const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['sanity', 'dataset', 'import', outPath, 'production', '--replace'],
  // 2026-08-28: the nested studio/ package is gone; sanity.cli.ts lives at the
  // repo root now, so the CLI runs from the root.
  { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' },
);
process.exit(result.status ?? 0);
