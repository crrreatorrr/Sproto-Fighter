// Every fight background, story scenery, story animation sheet, menu image, power
// sprite and the UI font has a current generated copy, and the game loads the copies.
// If this fails, run: python3 scripts/build-images.py
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { bundle, dataUrl, read } from './lib/load.mjs';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(read('scripts/manifests/media-copies.json'));
const stage = await import(dataUrl(await bundle('src/stage.ts')));
const variants = await import(dataUrl(await bundle('src/stageVariants.ts')));
const { webpCopy } = stage;

const expected = new Set([
  ...stage.STAGES.map(s => stage.stageImageSource(s.id).replace(/^\//, '')),
  ...variants.STORY_LOCATIONS.map(l => l.image.replace(/^\//, '')),
  ...['story-animations', 'menu/higgsfield', 'menu/higgsfield/mystic', 'fighters/powers']
    .flatMap(dir => readdirSync(new URL('public/' + dir, root)).filter(f => f.endsWith('.png')).map(f => `${dir}/${f}`)),
  'fonts/PixelifySans.ttf',
]);
const missing = [], stale = [];
for (const path of expected) {
  const entry = manifest[path];
  if (!entry || !existsSync(new URL('public/' + entry.copy, root))) { missing.push(path); continue; }
  const sha256 = createHash('sha256').update(readFileSync(new URL('public/' + path, root))).digest('hex');
  if (entry.sha256 !== sha256) stale.push(path);
  if (entry.kind !== 'font') assert.equal(entry.copy, webpCopy(path), `${path}: copy is not where the game looks`);
}
assert.deepEqual(missing, [], 'missing copies; run python3 scripts/build-images.py');
assert.deepEqual(stale, [], 'copies older than their originals; run python3 scripts/build-images.py');

// The game requests the copies, never the originals.
const source = ['src/storyBoss.ts', 'src/powerArt.ts', 'src/arcadeSelection.css', 'src/fullscreen.css', 'src/mysticUI.css', 'src/versusScreen.css', 'src/pixelUI.css', 'index.html'].map(p => read(p)).join('\n');
assert.ok(!/\/(menu|fighters\/powers)\/[\w/-]+\.png|-(attacks|projectiles)\.png|PixelifySans\.ttf/.test(source), 'a module still loads an original');
// Every runtime use of a background path goes through webpCopy (the PNG is not in dist/);
// the definition and plain comparisons are the only other uses.
for (const file of readdirSync(new URL('src', root)).filter(f => f.endsWith('.ts'))) {
  const text = read('src/' + file);
  for (const m of text.matchAll(/stageImageSource\(|location\.image\b/g)) {
    const around = text.slice(Math.max(0, m.index - 9), m.index + 40);
    const ok = around.startsWith('webpCopy(') || /^function /.test(text.slice(m.index - 9, m.index)) || /^location\.image===/.test(text.slice(m.index, m.index + 17));
    assert.ok(ok, `src/${file}: a background path is used without webpCopy: ...${text.slice(Math.max(0, m.index - 40), m.index + 40)}...`);
  }
}
const requested = [];
globalThis.document = { querySelector: () => null };
globalThis.Image = class { set src(url) { requested.push(url); queueMicrotask(() => this.onload()); } };
await stage.loadStageArt(['bar', 'nov04-verse-1']);
await variants.loadStoryLocation(variants.STORY_LOCATIONS[0]);
assert.ok(requested.length === 3 && requested.every(url => url.endsWith('.webp')), 'backgrounds load their WebP copies: ' + requested.join(', '));
console.log(`PASS: ${expected.size} originals have current copies (${Object.values(manifest).filter(e => e.kind === 'stage').length} backgrounds, ${Object.values(manifest).filter(e => e.kind === 'lossless').length} lossless sheets and sprites, 1 font); the game loads the copies.`);
