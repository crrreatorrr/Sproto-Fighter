#!/usr/bin/env node
// Offline measurements of the real renderer's selected active poses. Advisory:
// full-body contact hulls are not semantic fist/blade attack hitboxes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPoses } from './lib/load.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2), options = {};
for (let i = 0; i < args.length; i++) {
  assert.ok(['--out', '--fighters', '--moves'].includes(args[i]), 'Usage: hitbox-measurements.mjs [--out PREFIX] [--fighters ID,ID] [--moves ID,ID]');
  assert.ok(args[i + 1] && !args[i + 1].startsWith('--'), args[i] + ' needs a value');
  options[args[i].slice(2)] = args[++i];
}
const out = resolve(root, options.out ?? 'docs/balance/hitbox-measurements');
const sha = value => createHash('sha256').update(value).digest('hex');
const round = n => Math.round(n * 10000) / 10000;
const { core, poses, manifest } = await loadPoses();
const ids = options.fighters ? options.fighters.split(',') : [...core.PLAYABLE_FIGHTERS].sort();
const moveIds = options.moves ? options.moves.split(',') : Object.keys(core.MOVES);
assert.ok(ids.length && new Set(ids).size === ids.length && ids.every(id => core.PLAYABLE_FIGHTERS.includes(id)), 'known unique fighter IDs');
assert.ok(moveIds.length && new Set(moveIds).size === moveIds.length && moveIds.every(id => id in core.MOVES), 'known unique move IDs');
const manifestText = readFileSync(resolve(root, 'public/fighters/pose-atlas.json'));
const sourcePaths = ['src/core.ts', 'src/poseAtlas.ts', 'src/animationEvents.ts', ...readdirSync(resolve(root, 'src/sim')).filter(p => p.endsWith('.ts')).map(p => 'src/sim/' + p), ...readdirSync(resolve(root, 'src/sim/data')).filter(p => p.endsWith('.json')).map(p => 'src/sim/data/' + p)].sort();
const sourceHashes = Object.fromEntries(sourcePaths.map(path => [path, sha(readFileSync(resolve(root, path)))]));
const imageFiles = new Map(), selectedCells = new Set(), pendingDraws = [], fallbackSources = new Set();
const local = url => { const path = url.split('?')[0]; assert.ok(path.startsWith('/') && !path.includes('..') && !path.includes('\\')); return path; };
// Read and hash actual source PNGs. Image pixels are never injected into combat.
// This tool measures existing metadata hulls and the actual composed draw transform.
// Missing hulls are decoded offline from PNG alpha after collecting active samples.
class LocalImage {
  set src(value) {
    this.url = local(value);
    let info = imageFiles.get(this.url);
    if (!info) {
      const bytes = readFileSync(resolve(root, 'public' + this.url));
      assert.equal(bytes.toString('ascii', 1, 4), 'PNG', this.url + ' is PNG');
      info = { sha256: sha(bytes), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
      imageFiles.set(this.url, info);
    }
    this.naturalWidth = this.width = info.width; this.naturalHeight = this.height = info.height;
    this.complete = true; queueMicrotask(() => this.onload());
  }
}
globalThis.Image = LocalImage;
globalThis.fetch = async () => ({ ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => manifest });
const byUrl = new Map();
for (const [body, cfg] of Object.entries(manifest.fighters)) {
  for (const [sequence, frames] of Object.entries({ poses: cfg.frames, ...(cfg.walkFrames ? { walk: cfg.walkFrames } : {}), ...cfg.clips })) {
    for (const [index, entry] of frames.entries()) {
      const frame = typeof entry === 'string' ? { url: entry } : entry;
      const url = frame.url.startsWith('/') ? frame.url : '/fighters/' + frame.url;
      const cell = { key: `${body}/${sequence}/${index}`, body, sequence, index, frame, cfg, url };
      if (!byUrl.has(url)) byUrl.set(url, []);
      byUrl.get(url).push(cell);
    }
  }
}
const multiply = (a, b) => [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1], a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3], a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]];
const point = (m, x, y) => [m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5]];
function context() {
  return {
    matrix: [1, 0, 0, 1, 0, 0], stack: [], draws: [], globalAlpha: 1,
    save() { this.stack.push([...this.matrix]); },
    restore() { assert.ok(this.stack.length); this.matrix = this.stack.pop(); },
    translate(x, y) { this.matrix = multiply(this.matrix, [1, 0, 0, 1, x, y]); },
    rotate(a) { const c = Math.cos(a), s = Math.sin(a); this.matrix = multiply(this.matrix, [c, s, -s, c, 0, 0]); },
    scale(x, y) { this.matrix = multiply(this.matrix, [x, 0, 0, y, 0, 0]); },
    drawImage(image, ...v) {
      assert.ok([2, 4, 8].includes(v.length), 'supported drawImage overload');
      let sx = 0, sy = 0, sw = image.width, sh = image.height, dx, dy, dw = sw, dh = sh;
      if (v.length === 8) [sx, sy, sw, sh, dx, dy, dw, dh] = v;
      else if (v.length === 4) [dx, dy, dw, dh] = v;
      else [dx, dy] = v;
      assert.ok([...this.matrix, sx, sy, sw, sh, dx, dy, dw, dh].every(Number.isFinite));
      this.draws.push({ url: image.url, matrix: multiply(this.matrix, [dw/sw, 0, 0, dh/sh, dx-sx*dw/sw, dy-sy*dh/sh]) });
    },
  };
}
const rows = [], missingHullCells = new Set();
for (const id of ids) {
  await poses.ensurePoseAtlases([id]);
  for (const move of moveIds) for (const facing of [-1, 1]) {
    const s = core.createState(id, 'versus', 'rivet'), f = s.fighters[0];
    const airborne = move.startsWith('air');
    f.x = 640; f.y = core.FLOOR - (airborne ? 180 : 0); f.facing = facing;
    f.move = { id: move, t: 0, hit: false, connected: false, wave: -1, aim: move === 'launcher' ? 'up' : 'level' };
    const m = core.getMove(f, move);
    const ages = move === 'special' ? [...core.COMBAT_STYLES[id].specialFrames] : Array.from({ length: m.active }, (_, i) => m.startup + i);
    const envelope = { forwardMin: Infinity, forwardMax: -Infinity, heightMin: Infinity, heightMax: -Infinity };
    const cells = new Set(), rowDraws = []; let hullSamples = 0, decodedAlphaSamples = 0, drawCount = 0;
    for (const age of ages) {
      f.move.t = age; f.move.wave = core.COMBAT_STYLES[id].specialFrames.indexOf(age);
      const samples = core.isPairedFighter(id) ? poses.getDuoPoseDebug(f, age) : [{ entity: id, ...poses.getPoseAtlasDebug(f, age) }];
      assert.ok(samples.every(sample => sample.available), id + ' installed active poses');
      const before = JSON.stringify(s), c = context();
      assert.equal(poses.drawPoseAtlas(c, f, age), true, id + ' uses installed renderer');
      assert.equal(JSON.stringify(s), before, 'renderer must not mutate simulation');
      assert.equal(c.stack.length, 0); assert.deepEqual(c.matrix, [1, 0, 0, 1, 0, 0]);
      assert.equal(c.draws.length, samples.length, 'every companion contributes one complete body');
      for (const draw of c.draws) {
        const candidates = byUrl.get(draw.url) ?? [];
        const cell = candidates.find(cell => samples.some(sample => sample.entity === cell.body && sample.sequence === cell.sequence && sample.frameIndex === cell.index));
        assert.ok(cell, id + ' draw matches selected active cell ' + draw.url);
        const b = cell.frame.bounds ?? [0, 0, cell.frame.width ?? cell.cfg.width, cell.frame.height ?? cell.cfg.height];
        const hull = cell.frame.contactHull ?? [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]];
        if (cell.frame.contactHull) hullSamples++; else { decodedAlphaSamples++; missingHullCells.add(cell.key); fallbackSources.add(cell.url); }
        rowDraws.push({ matrix: draw.matrix, url: cell.url, hull: cell.frame.contactHull });
        for (const [x, y] of hull) {
          const [wx, wy] = point(draw.matrix, x, y), forward = (wx - f.x) * facing, height = f.y - wy;
          envelope.forwardMin = Math.min(envelope.forwardMin, forward); envelope.forwardMax = Math.max(envelope.forwardMax, forward);
          envelope.heightMin = Math.min(envelope.heightMin, height); envelope.heightMax = Math.max(envelope.heightMax, height);
        }
        cells.add(cell.key); selectedCells.add(cell.key); drawCount++;
      }
    }
    const box = core.getHitbox(f, move, core.getMove(f, move));
    const hitboxForward = [(box.left-f.x)*facing, (box.right-f.x)*facing].sort((a, b) => a-b);
    assert.ok(Object.values(envelope).every(Number.isFinite), id + '/' + move + ' finite envelope');
    rows.push({ fighter: id, move, facing, stance: airborne ? 'air' : 'ground', aim: f.move.aim,
      activeSamples: ages.length, bodyDraws: drawCount, hullSamples, decodedAlphaSamples,
      ...Object.fromEntries(Object.entries(envelope).map(([key, value]) => [key, round(value)])),
      hitboxForwardMin: round(hitboxForward[0]), hitboxForwardMax: round(hitboxForward[1]),
      hitboxHeightMin: round(f.y-box.bottom), hitboxHeightMax: round(f.y-box.top),
      hullBeyondHitboxForward: round(envelope.forwardMax-hitboxForward[1]), cells: [...cells].sort().join(';') });
    pendingDraws.push({ x: f.x, y: f.y, facing, draws: rowDraws });
  }
}
// Decode only active cells without supplied hulls. Whole source-pixel squares
// contribute to a convex alpha hull; no canvas padding enters the measurement.
const decoded = spawnSync('python3', ['-c', String.raw`
import json,sys
from pathlib import Path
from PIL import Image
root=Path(sys.argv[1]); result={}
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
for url in json.load(sys.stdin):
    with Image.open(root/'public'/url.lstrip('/')) as im:
        alpha=im.convert('RGBA').getchannel('A'); width,height=alpha.size; raw=alpha.tobytes(); points=[]
        for y in range(height):
            row=raw[y*width:(y+1)*width]; left=width-len(row.lstrip(b'\0')); right=len(row.rstrip(b'\0'))
            if left<right:points.extend(((left,y),(right,y),(left,y+1),(right,y+1)))
        points=sorted(set(points)); lo=[]; hi=[]
        for p in points:
            while len(lo)>1 and cross(lo[-2],lo[-1],p)<=0:lo.pop()
            lo.append(p)
        for p in reversed(points):
            while len(hi)>1 and cross(hi[-2],hi[-1],p)<=0:hi.pop()
            hi.append(p)
        if len(points)<3:raise ValueError('empty active source '+url)
        result[url]=lo[:-1]+hi[:-1]
print(json.dumps(result,separators=(',',':')))
`, root], { input: JSON.stringify([...fallbackSources].sort()), encoding: 'utf8', maxBuffer: 32*1024*1024 });
assert.equal(decoded.status, 0, 'Pillow alpha-hull decoding failed: ' + decoded.stderr);
const alphaHulls = JSON.parse(decoded.stdout);
for (const [index, pending] of pendingDraws.entries()) {
  const row = rows[index], envelope = { forwardMin: Infinity, forwardMax: -Infinity, heightMin: Infinity, heightMax: -Infinity };
  for (const draw of pending.draws) for (const [x, y] of draw.hull ?? alphaHulls[draw.url]) {
    const [wx, wy] = point(draw.matrix, x, y), forward = (wx-pending.x)*pending.facing, height = pending.y-wy;
    envelope.forwardMin=Math.min(envelope.forwardMin,forward); envelope.forwardMax=Math.max(envelope.forwardMax,forward);
    envelope.heightMin=Math.min(envelope.heightMin,height); envelope.heightMax=Math.max(envelope.heightMax,height);
  }
  assert.ok(Object.values(envelope).every(Number.isFinite));
  Object.assign(row, Object.fromEntries(Object.entries(envelope).map(([key, value]) => [key, round(value)])), { hullBeyondHitboxForward: round(envelope.forwardMax-row.hitboxForwardMax) });
}

// Refuse a mixed-source report if another task changed simulation or rendering.
for (const [path, value] of Object.entries(sourceHashes)) assert.equal(sha(readFileSync(resolve(root, path))), value, 'source changed during measurements: ' + path);
assert.equal(sha(readFileSync(resolve(root, 'public/fighters/pose-atlas.json'))), sha(manifestText), 'manifest changed during measurements');
const selectedImages = new Set(pendingDraws.flatMap(row => row.draws.map(draw => draw.url)));
const imageHashes = Object.fromEntries([...imageFiles.entries()].filter(([path]) => selectedImages.has(path)).sort(([a], [b]) => a.localeCompare(b)).map(([path, info]) => [path, info.sha256]));
for (const [path, value] of Object.entries(imageHashes)) assert.equal(sha(readFileSync(resolve(root, 'public' + path))), value, 'active PNG changed during measurements: ' + path);
const report = {
  schemaVersion: 1, toolSha256: sha(readFileSync(fileURLToPath(import.meta.url))), sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  manifestSha256: sha(manifestText), sourceHashes, imageContentSha256: sha(JSON.stringify(imageHashes)),
  command: { fighters: ids, moves: moveIds, facings: [-1, 1], aim: 'level (launcher up)', airMovesAtHeight: 180 },
  counts: { fighters: ids.length, moves: moveIds.length, scenarios: rows.length, activeSamples: rows.reduce((n, r) => n+r.activeSamples, 0), bodyDraws: rows.reduce((n, r) => n+r.bodyDraws, 0), selectedCells: selectedCells.size, sourceImagesRead: imageFiles.size, activeSourceImages: selectedImages.size, cellsWithoutContactHull: missingHullCells.size, pngsDecodedForAlpha: fallbackSources.size },
  limits: ['Offline advisory measurements only; no combat geometry is rewritten.', 'Measures existing whole-body contactHull metadata through the real renderer draw matrix, including registration, facing, hover motion and paired formations.', 'A silhouette envelope includes the body, weapon and authored effects; it is not a semantic fist/blade hit region.', 'Missing contactHull is decoded offline with Pillow into a convex alpha hull, and is explicitly counted. Supplied metadata hulls remain metadata; this tool does not revalidate their interior shape against pixels.', 'Only level attacks (launcher up) are sampled. Directional variants, Special partner cameos, projectile artwork, wall placement and human visual review remain outside this report.', 'Sources are synthetic active-phase samples at center stage, not proof of real-match contact or attack reach.'],
  missingHullCells: [...missingHullCells].sort(),
};
mkdirSync(dirname(out), { recursive: true });
const columns = Object.keys(rows[0]);
const csv = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
writeFileSync(out + '.csv', columns.map(csv).join(',') + '\n' + rows.map(row => columns.map(key => csv(row[key])).join(',')).join('\n') + '\n');
writeFileSync(out + '.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.counts));
console.log(`Wrote ${out}.json and ${out}.csv; measurements are advisory and do not modify hitboxes.`);
