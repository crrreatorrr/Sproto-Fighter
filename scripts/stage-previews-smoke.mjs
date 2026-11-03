// Every stage has a current 640x360 menu preview generated from the background
// the fight uses. If this fails, run: python3 scripts/build-images.py
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { bundle, dataUrl, read } from './lib/load.mjs';

const stage = await import(dataUrl(await bundle('src/stage.ts')));
const manifest = JSON.parse(read('public/stages/previews/manifest.json'));
const root = new URL('../', import.meta.url);
const missing = [], stale = [];
for (const { id } of stage.STAGES) {
  if (!existsSync(new URL('public' + stage.stagePreviewSource(id), root))) missing.push(id);
  const source = 'public' + stage.stageImageSource(id), entry = manifest[id];
  const sha256 = createHash('sha256').update(readFileSync(new URL(source, root))).digest('hex');
  if (!entry || entry.source !== source || entry.sha256 !== sha256) stale.push(id);
}
assert.deepEqual(missing, [], 'missing stage previews; run python3 scripts/build-images.py');
assert.deepEqual(stale, [], 'stage previews older than their backgrounds; run python3 scripts/build-images.py');

// The menu must draw from a loaded preview without the full background.
const requested = [];
globalThis.document = { querySelector: () => null, createElement: () => ({ getContext: () => null }) };
globalThis.Image = class { set src(url) { requested.push(url); this.naturalWidth = 640; this.naturalHeight = 360; queueMicrotask(() => this.onload()); } };
await stage.loadStagePreviews(['castle']);
const draws = [];
const ctx = new Proxy({}, { get: (_, key) => key === 'drawImage' ? (image) => draws.push(image) : () => {} });
stage.drawStagePreview(ctx, 'castle', 320, 180);
assert.deepEqual(requested, ['/stages/previews/castle.webp'], 'menu loads only the preview');
assert.ok(draws.length > 0 && draws.every(image => image.naturalWidth === 640), 'preview drawn from the small image');
console.log(`PASS: ${stage.STAGES.length} stages have current 640x360 previews; the menu draws them without full backgrounds.`);
