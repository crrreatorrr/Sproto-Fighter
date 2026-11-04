// Every playable fighter has generated WebP portraits, and each was made from
// the current original listed in src/originalPortraits.ts. If this fails, run
//   python3 scripts/build-portraits.py
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { loadCore, read } from './lib/load.mjs';

const { PLAYABLE_FIGHTERS } = await loadCore();
const manifest = JSON.parse(read('public/portraits/manifest.json'));
const portraitEntries = /^\s*(?:([A-Za-z_$][\w$]*)|["']([\w$-]+)["'])\s*:\s*new URL\('\.\.\/(art\/[^']+)'/gm;
const listed = new Map([...read('src/originalPortraits.ts').matchAll(portraitEntries)].map(m => [m[1] ?? m[2], m[3]]));
const root = new URL('../', import.meta.url);
const missing = [], stale = [];
for (const id of PLAYABLE_FIGHTERS) {
  assert.ok(listed.has(id), `${id}: no original portrait in src/originalPortraits.ts`);
  for (const size of ['thumb', 'large']) if (!existsSync(new URL(`public/portraits/${size}/${id}.webp`, root))) missing.push(`${size}/${id}`);
  const source = listed.get(id), entry = manifest[id];
  const sha256 = createHash('sha256').update(readFileSync(new URL(source, root))).digest('hex');
  if (!entry || entry.source !== source || entry.sha256 !== sha256) stale.push(id);
}
assert.deepEqual(missing, [], 'missing generated portraits; run python3 scripts/build-portraits.py');
assert.deepEqual(stale, [], 'portraits older than their originals; run python3 scripts/build-portraits.py');
console.log(`PASS: ${PLAYABLE_FIGHTERS.length} fighters have current 192 px and 640 px WebP portraits.`);
