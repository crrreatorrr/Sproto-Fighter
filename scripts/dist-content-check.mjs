#!/usr/bin/env node
// Every playable fighter and every stage resolves in a built game.
//
//   node scripts/dist-content-check.mjs            check ./dist (skips when there is no dist)
//   node scripts/dist-content-check.mjs other/dir  check another build
//   node scripts/dist-content-check.mjs dist --release
//                                                  also require a stripped release build: every body
//                                                  packed, standing previews as WebP, no loose frame
//                                                  PNGs or full manifest, and dist under DIST_BUDGET_MB
//                                                  (default 700)
//   DIST_CHECK_REQUIRE=1 ...                      fail instead of skipping when dist is missing
//
// It enumerates the roster and stages from the runtime modules themselves
// (src/core.ts, src/stage.ts, src/stageVariants.ts, src/combatSfx.ts), so a new
// fighter or stage is covered without editing this file, and checks that each
// one's files exist in the build:
//
// - fighters: every body of the fighter and its Team Special partner has a split
//   atlas file, a sprite sheet with a cell for every frame (when the build was
//   packed) or every frame image (when it was not, or when loose frames are
//   still shipped), and a standing-pose preview; both portraits; the Team
//   Special recording when the fighter has one.
// - stages: the full background (the WebP copy the game loads) and the menu
//   preview of every stage, and every story scenery panorama.
// - every root-relative asset path written in the built JS, CSS and HTML.
//
// It prints the counts so before/after runs can be compared.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { bundle, loadCore, dataUrl } from './lib/load.mjs';

const release = process.argv.includes('--release');
const dist = resolve(process.argv.slice(2).find(a => !a.startsWith('--')) ?? 'dist');
if (!existsSync(join(dist, 'index.html'))) {
  if (process.env.DIST_CHECK_REQUIRE) throw new Error(`no build at ${dist} (run npm run build)`);
  console.log(`dist-content-check: skipped, no build at ${dist} (run npm run build first)`);
  process.exit(0);
}

const core = await loadCore();
const stageModule = await import(dataUrl(await bundle('src/stage.ts')));
const variants = await import(dataUrl(await bundle('src/stageVariants.ts')));
const sfx = await import(dataUrl(await bundle('src/combatSfx.ts')));
const { webpCopy } = stageModule;

const missing = [];
const file = path => join(dist, path.split('?')[0].replace(/^\/+/, ''));
const need = (path, what) => { if (!existsSync(file(path))) missing.push(`${what}: ${path}`); };

// --- Fighters -------------------------------------------------------------
const playable = [...core.PLAYABLE_FIGHTERS];
const bodies = new Set(playable.flatMap(id => [...core.bodyAtlasIds(id), ...core.specialPartnerIds(id).flatMap(core.bodyAtlasIds)]));
const index = JSON.parse(readFileSync(file('/fighters/pose-atlas/index.json'), 'utf8'));
let sheets = 0, looseFrames = 0, previews = 0;
const frameUrls = cfg => {
  const urls = new Set();
  const add = entry => { const url = typeof entry === 'string' ? entry : entry?.url; if (url) urls.add(url); };
  for (const entry of cfg.frames ?? []) add(entry);
  for (const entry of cfg.walkFrames ?? []) add(entry);
  for (const entries of Object.values(cfg.clips ?? {})) for (const entry of entries) add(entry);
  return urls;
};
const atlasPath = url => url.startsWith('/') ? url : '/fighters/' + url;
for (const id of bodies) {
  const listed = index.fighters?.[id];
  if (!listed) { missing.push(`atlas index entry: ${id}`); continue; }
  const preview = listed.preview?.frame;
  const previewUrl = typeof preview === 'string' ? preview : preview?.url;
  if (!previewUrl) missing.push(`standing preview entry: ${id}`); else { need(atlasPath(previewUrl), `standing preview of ${id}`); previews++; }
  if (release && !previewUrl?.startsWith('/fighters/previews/')) missing.push(`standing preview of ${id} is not the WebP copy: ${previewUrl}`);
  const bodyFile = file(`/fighters/pose-atlas/${id}.json`);
  if (!existsSync(bodyFile)) { missing.push(`atlas body file: ${id}`); continue; }
  const cfg = JSON.parse(readFileSync(bodyFile, 'utf8')).fighters?.[id];
  if (!cfg?.frames?.length) { missing.push(`atlas body config: ${id}`); continue; }
  const urls = frameUrls(cfg);
  if (release && !cfg.sheet) missing.push(`sprite sheet entry: ${id}`);
  if (cfg.sheet) {
    need(cfg.sheet.url, `sprite sheet of ${id}`);
    for (const url of urls) if (!cfg.sheet.cells?.[url]) missing.push(`sheet cell of ${id}: ${url}`);
    sheets++;
  }
  // Loose frames are required when there is no sheet, and checked whenever the build still ships them.
  const shipsFrames = existsSync(join(dist, 'fighters', 'poses'));
  if (!cfg.sheet || shipsFrames) for (const url of urls) { need(atlasPath(url), `frame of ${id}`); looseFrames++; }
}
for (const id of playable) {
  need(`/portraits/thumb/${id}.webp`, `portrait thumb of ${id}`);
  need(`/portraits/large/${id}.webp`, `portrait of ${id}`);
}
for (const [id, name] of Object.entries(sfx.FIGHTER_SPECIAL_FILES)) need(sfx.COMBAT_SFX_DIR + name, `Team Special recording of ${id}`);
for (const path of sfx.combatClipPaths()) need(path, 'combat clip');

// --- Stages ---------------------------------------------------------------
const stages = stageModule.STAGES;
for (const stage of stages) {
  need(webpCopy(stageModule.stageImageSource(stage.id)), `background of ${stage.id}`);
  need(stageModule.stagePreviewSource(stage.id), `menu preview of ${stage.id}`);
}
for (const location of variants.STORY_LOCATIONS) need(webpCopy(location.image), `story scenery ${location.id}`);

// --- Paths written in the built code --------------------------------------
const roots = ['fighters', 'stages', 'audio', 'story', 'story-animations', 'menu', 'fonts', 'portraits'];
const pattern = new RegExp(`["'\`(]\\.?/((?:${roots.join('|')})/[\\w./-]+\\.(?:png|webp|jpg|jpeg|json|mp3|ogg|wav|woff2?|ttf))`, 'g');
const codeFiles = [join(dist, 'index.html'), ...readdirSync(join(dist, 'assets')).filter(f => /\.(js|css)$/.test(f)).map(f => join(dist, 'assets', f))];
const literal = new Set();
for (const path of codeFiles) for (const m of readFileSync(path, 'utf8').matchAll(pattern)) literal.add(m[1]);
// A PNG path in the code is fine when the build ships the WebP copy the game loads instead.
// The full manifest is the code's fallback for builds without split atlas files; release builds drop it on purpose.
const fallbackOnly = new Set(['fighters/pose-atlas.json']);
for (const path of literal) if (!(release && fallbackOnly.has(path)) && !existsSync(file('/' + path)) && !existsSync(file('/' + webpCopy(path)))) missing.push(`path in built code: /${path}`);

// --- Release build -------------------------------------------------------
const budgetMb = Number(process.env.DIST_BUDGET_MB ?? 700);
if (release) {
  for (const d of ['poses', 'events', 'motion', 'identity', 'walk', 'assist']) if (existsSync(join(dist, 'fighters', d))) missing.push(`loose frames still shipped: fighters/${d}/`);
  if (existsSync(join(dist, 'fighters', 'pose-atlas.json'))) missing.push('full manifest still shipped: fighters/pose-atlas.json');
}

// --- Report ---------------------------------------------------------------
const bytes = dir => { let n = 0, files = 0; const walk = d => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else { n += statSync(p).size; files++; } } }; walk(dir); return { n, files }; };
const total = bytes(dist);
console.log(`dist-content-check: ${playable.length} playable fighters (${bodies.size} bodies: ${sheets} sheets, ${previews} previews, ${looseFrames} loose frames checked), `
  + `${stages.length} stages, ${variants.STORY_LOCATIONS.length} story sceneries, ${literal.size} code paths; `
  + `dist ${(total.n / 1e6).toFixed(1)} MB in ${total.files} files`);
if (release && total.n / 1e6 > budgetMb) missing.push(`dist is ${(total.n / 1e6).toFixed(1)} MB, over the ${budgetMb} MB budget`);
if (missing.length) {
  console.error(`${missing.length} missing:\n  ` + missing.slice(0, 60).join('\n  ') + (missing.length > 60 ? `\n  ... and ${missing.length - 60} more` : ''));
  process.exit(1);
}
// Floors, not exact counts: adding fighters or stages is fine, losing one is not.
assert.ok(playable.length >= 254, `playable roster shrank to ${playable.length}`);
assert.ok(stages.length >= 121, `stage list shrank to ${stages.length}`);
console.log('dist-content-check: every fighter and stage resolves');
