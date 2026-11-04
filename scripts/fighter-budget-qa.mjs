#!/usr/bin/env node
// Per-character size budgets, so a new fighter cannot quietly undo load-time and
// memory work. Blocking: a body or portrait over budget fails the check.
//
//   node scripts/fighter-budget-qa.mjs
//
// Per body (public/fighters/pose-atlas.json):
//   - at most MAX_FRAMES unique frame images (largest today: 168);
//   - at most MAX_TRIMMED_MB decoded once trimmed. Estimated from each frame's
//     opaque `bounds` plus the packer's padding (an upper bound: bounds always
//     contain every visible pixel); frames without bounds count in full. Largest
//     today is about 14.7 MB. scripts/build-sheets.py separately fails any packed
//     sheet over 20 MB.
//   - every frame inside the declared frame size, so trimming has an edge to work to.
// Per playable fighter: a thumbnail and a large portrait, each under its size budget.
import assert from 'node:assert/strict';
import { readFileSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const MAX_FRAMES = 176, MAX_TRIMMED_MB = 16, PAD = 4;
const PORTRAIT_KB = { thumb: 24, large: 96 };
const manifest = JSON.parse(readFileSync(join(root, 'public/fighters/pose-atlas.json'), 'utf8'));
const failures = [];
let largest = { id: '', mb: 0 }, most = { id: '', frames: 0 };
for (const [id, cfg] of Object.entries(manifest.fighters)) {
  const frames = new Map();
  for (const entry of [...cfg.frames, ...(cfg.walkFrames ?? []), ...Object.values(cfg.clips ?? {}).flat()]) {
    const f = typeof entry === 'string' ? { url: entry } : entry;
    if (frames.has(f.url)) continue;
    const w = f.width ?? cfg.width, h = f.height ?? cfg.height, [l, t, r, b] = f.bounds ?? [0, 0, w, h];
    if (l < 0 || t < 0 || r > w || b > h) failures.push(`${id}: ${f.url} bounds outside its ${w}x${h} frame`);
    frames.set(f.url, (Math.min(w, r + PAD) - Math.max(0, l - PAD)) * (Math.min(h, b + PAD) - Math.max(0, t - PAD)) * 4);
  }
  const mb = [...frames.values()].reduce((sum, bytes) => sum + bytes, 0) / 2 ** 20;
  if (frames.size > MAX_FRAMES) failures.push(`${id}: ${frames.size} unique frames (budget ${MAX_FRAMES})`);
  if (mb > MAX_TRIMMED_MB) failures.push(`${id}: about ${mb.toFixed(1)} MB decoded after trimming (budget ${MAX_TRIMMED_MB} MB); trim transparent margins or reuse frames`);
  if (mb > largest.mb) largest = { id, mb };
  if (frames.size > most.frames) most = { id, frames: frames.size };
}
const portraits = JSON.parse(readFileSync(join(root, 'public/portraits/manifest.json'), 'utf8'));
const ids = Array.isArray(portraits) ? portraits : Object.keys(portraits.fighters ?? portraits);
assert.ok(ids.length > 100, 'portrait manifest lists the roster');
for (const id of ids) for (const [size, kb] of Object.entries(PORTRAIT_KB)) {
  const file = join(root, 'public/portraits', size, `${id}.webp`);
  if (!existsSync(file)) { failures.push(`${id}: missing ${size} portrait`); continue; }
  const bytes = statSync(file).size;
  if (bytes > kb * 1024) failures.push(`${id}: ${size} portrait ${(bytes / 1024).toFixed(0)} KB (budget ${kb} KB)`);
}
if (failures.length) {
  for (const f of failures) console.error('OVER BUDGET', f);
  console.error(`FAIL: ${failures.length} budget violations`);
  process.exit(1);
}
console.log(`PASS: ${Object.keys(manifest.fighters).length} bodies and ${ids.length} portraits within budget; largest body ${largest.id} about ${largest.mb.toFixed(1)}/${MAX_TRIMMED_MB} MB trimmed, most frames ${most.id} ${most.frames}/${MAX_FRAMES}.`);
