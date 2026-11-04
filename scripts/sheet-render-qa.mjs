#!/usr/bin/env node
// Proves the packed, trimmed sprite sheets draw what the individual frame PNGs draw.
//
//   npm run build && python3 scripts/build-sheets.py dist    (once)
//   node scripts/sheet-render-qa.mjs            representative bodies (a few minutes)
//   node scripts/sheet-render-qa.mjs --all      every installed body
//
// It serves the game's source modules with the built dist/ as the public folder and
// renders the same cases in two Chromium pages: one drawing from the trimmed sprite
// sheets (what ships), one with `?atlas=frames` (each frame from its own PNG, exactly
// as authored). Cases:
//   - every frame of each body: unscaled, at the smallest in-game scale mirrored,
//     enlarged and rotated, and split into the defeat break-apart rectangles;
//   - selection-menu standing poses, from the preview image and from the full body;
//   - CPU-vs-CPU matches (walks, attacks, throws, holds) every 10 ticks for 600 ticks.
// The sim never reads art, so both pages play the same match tick for tick.
//
// What "the same" means. With pixel-art (nearest) sampling, a screen pixel whose
// sample point falls exactly on the line between two source pixels may take either
// one, and the browser's float rounding decides. Drawing a rectangle of a sheet
// instead of a whole PNG changes that rounding, so a few such ties flip. Every
// pixel must therefore either match the PNG rendering exactly, or match a PNG
// rendering moved by at most 1/64 px (within 4 levels per channel: blending two
// semi-transparent layers rounds twice). GPUs resolve texture positions to about 1/256 of a source pixel, so a
// finer shift would not reach every tie. A real defect (an offset, a trimmed or
// missing pixel, a neighbouring cell bleeding in) moves content by at least half a
// pixel, over 30 times further, and fails.
// Without a packed dist it skips, except under CI where that is a failure.
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const all = process.argv.includes('--all');
// `--only <text>` runs just the cases whose label contains text (for debugging).
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const index = join(dist, 'fighters', 'pose-atlas', 'index.json');
if (!existsSync(index) || !existsSync(join(dist, 'fighters', 'sheets'))) {
  const message = 'sheet-render-qa: no packed dist (run `npm run build && python3 scripts/build-sheets.py dist`).';
  if (process.env.CI) { console.error('FAIL: ' + message); process.exit(1); }
  console.log('SKIP: ' + message); process.exit(0);
}
const manifest = JSON.parse(readFileSync(index, 'utf8'));
const bodies = Object.keys(manifest.fighters);
// Bodies with unusual registration, pairing, partners or clips, then a fixed sample.
const featured = ['highsproto', 'vela', 'rivet', 'duo', 'duo-blue', 'sprotosales', 'buddhashadow', 'hly3-blue', 'sproto3181', 'sproto832-companion', 'michael', 'alpha777', 'theo'];
let seed = 7; const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const sample = featured.filter(id => bodies.includes(id));
while (sample.length < 30) { const id = bodies[Math.floor(rand() * bodies.length)]; if (!sample.includes(id)) sample.push(id); }
const gridBodies = all ? bodies : sample;
const matches = [['highsproto', 'vela'], ['duo', 'sprotosales'], ['sproto3181', 'michael'], ['rivet', 'buddhashadow'], ['theo', 'sproto832']];
const menuFighters = ['highsproto', 'duo', 'sprotosales', 'sproto3181', 'theo'];

const harness = `<!doctype html><meta charset="utf-8"><canvas id="c"></canvas>
<script type="module">
import { ensurePoseAtlases, ensurePosePreviews, drawPoseAtlasFramesForQa, drawSelectionPose, getPoseAtlasLoadStatus, setPoseAtlasQaNudge } from '/src/poseAtlas.ts';
import { createState, step, cpuInput, ROSTER, bodyAtlasIds } from '/src/core.ts';
import { render } from '/src/render.ts';
import { setStage, loadStageArt } from '/src/stage.ts';
const canvas = document.getElementById('c'), c = canvas.getContext('2d', { willReadFrequently: true });
const E = 1 / 64, JITTER = [[0, 0], [E, 0], [-E, 0], [0, E], [0, -E], [E, E], [E, -E], [-E, E], [-E, -E]];
const TRANSFORMS = [
  { scale: 1, angle: 0, flip: 1 }, { scale: .55, angle: 0, flip: -1 },
  { scale: 1.3, angle: .37, flip: 1 }, { scale: .8, angle: -1.1, flip: -1, pieces: true },
];
const owner = {};
for (const fighter of Object.keys(ROSTER)) for (const body of bodyAtlasIds(fighter)) owner[body] ??= fighter;
const reset = (w, h, [jx, jy]) => { canvas.width = w; canvas.height = h; c.setTransform(1, 0, 0, 1, jx, jy); c.clearRect(-1, -1, w + 2, h + 2); };
const pixels = () => c.getImageData(0, 0, canvas.width, canvas.height).data;
// Each case returns a function that draws its image at a given sub-pixel jitter.
const draws = {
  async grid(id, k) {
    if (!owner[id]) throw new Error('no fighter uses body ' + id);
    await ensurePoseAtlases([owner[id]]);
    const t = TRANSFORMS[k];
    reset(1280, 128, [0, 0]); const n = drawPoseAtlasFramesForQa(c, id, 128, t);
    const draw = j => { reset(1280, Math.ceil(n / 10) * 128, j); drawPoseAtlasFramesForQa(c, id, 128, t); };
    // The break-apart cuts run through visible pixels; the 2 px along each cut are
    // anti-aliased edges whose sampling legitimately differs, so they are set aside.
    if (t.pieces) draw.mask = () => { reset(1280, Math.ceil(n / 10) * 128, [0, 0]); drawPoseAtlasFramesForQa(c, id, 128, { ...t, seams: true }); return pixels(); };
    return draw;
  },
  async menu(fighter, full) {
    const f = createState(fighter, 'cpu').fighters[0];
    await (full ? ensurePoseAtlases([fighter]) : ensurePosePreviews([fighter]));
    return j => { reset(640, 260, j); c.translate(320, 230); if (!drawSelectionPose(c, f, 1, 600)) throw new Error('menu pose not drawn: ' + fighter); };
  },
};
// A match is stepped in place across calls, so only one frame is in flight at a time.
let match = null;
async function startMatch(a, b) {
  await loadStageArt(['ranch']); setStage('ranch');
  await ensurePoseAtlases([a, b], { pin: true });
  match = createState(a, 'cpu', b);
}
const advance = ticks => { for (let t = 0; t < ticks; t++) step(match, [cpuInput(match, 0), cpuInput(match, 1)]); };
// Only the fighter sprites move: shifting the smoothed stage would change every
// semi-transparent fighter edge blended over it.
const drawMatch = j => { setPoseAtlasQaNudge(j[0], j[1], j[2]); reset(1280, 720, [0, 0]); render(c, match); setPoseAtlasQaNudge(0, 0); };
// Each fighter is also nudged on its own: overlapping fighters can both sit on a tie.
drawMatch.jitter = () => [...JITTER, ...match.fighters.flatMap(f => JITTER.slice(1).map(([x, y]) => [x, y, f.id]))];
async function decode(url) {
  const img = new Image(); img.src = url; await img.decode();
  const scratch = document.createElement('canvas'); scratch.width = img.width; scratch.height = img.height;
  const x = scratch.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
  return x.getImageData(0, 0, img.width, img.height).data;
}
// Compare a sheets-page image with this (frames) page's renderings.
async function judge(url, draw) {
  const S = await decode(url), mask = draw.mask?.(), F = (draw.jitter?.() ?? JITTER).map(j => { draw(j); return pixels(); });
  const stats = { pixels: S.length / 4, ink: 0, exact: 0, tie: 0, bad: 0, seam: 0, size: S.length === F[0].length };
  if (!stats.size) { stats.bad = stats.pixels; return stats; }
  for (let p = 0; p < S.length; p += 4) {
    if (mask?.[p + 3]) { if (F[0][p + 3]) stats.seam++; continue; }
    if (F[0][p + 3]) stats.ink++;
    if (S[p] === F[0][p] && S[p + 1] === F[0][p + 1] && S[p + 2] === F[0][p + 2] && S[p + 3] === F[0][p + 3]) { stats.exact++; continue; }
    const near = F.some(Q => Math.abs(S[p] - Q[p]) <= 4 && Math.abs(S[p + 1] - Q[p + 1]) <= 4 && Math.abs(S[p + 2] - Q[p + 2]) <= 4 && Math.abs(S[p + 3] - Q[p + 3]) <= 4);
    if (near) { stats.tie++; continue; }
    stats.bad++;
    if ((stats.where ??= []).length < 12) { const i = p / 4; stats.where.push([i % canvas.width, Math.floor(i / canvas.width), [...S.slice(p, p + 4)], [...F[0].slice(p, p + 4)]]); }
  }
  return stats;
}
window.qa = {
  status: () => getPoseAtlasLoadStatus(),
  async render(kind, args) { const draw = await draws[kind](...args); draw([0, 0]); return canvas.toDataURL('image/png'); },
  async judge(kind, args, url) { const draw = await draws[kind](...args); return judge(url, draw); },
  startMatch,
  png: () => { drawMatch([0, 0]); return canvas.toDataURL('image/png'); },
  renderMatch(ticks) { advance(ticks); drawMatch([0, 0]); return canvas.toDataURL('image/png'); },
  judgeMatch(ticks, url) { advance(ticks); return judge(url, drawMatch); },
};
window.ready = true;
</script>`;

const server = await createServer({
  root, configFile: false, publicDir: dist, logLevel: 'error',
  server: { host: '127.0.0.1', port: 0, watch: { ignored: ['**/art/**', '**/docs/**', '**/public/**', '**/dist/**'] } },
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [{
    name: 'sheet-render-qa-harness',
    configureServer(s) {
      s.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__sheet-render-qa')) return next();
        res.setHeader('Content-Type', 'text/html');
        res.end(await s.transformIndexHtml(req.url, harness));
      });
    },
  }],
});
await server.listen();
const base = server.resolvedUrls.local[0].replace(/\/$/, '');
const browser = await chromium.launch();
const open = async query => {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${base}/__sheet-render-qa.html${query}`);
  await page.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
  return { page, errors };
};
const sheets = await open(''), frames = await open('?atlas=frames');
const out = join(dist, 'sheet-render-qa');
const total = { cases: 0, pixels: 0, ink: 0, exact: 0, tie: 0, bad: 0, seam: 0 }, failures = [];
function tally(label, stats, url) {
  total.cases++;
  for (const k of ['pixels', 'ink', 'exact', 'tie', 'bad', 'seam']) total[k] += stats[k] ?? 0;
  if (stats.bad || !stats.size) {
    failures.push(`${label}: ${stats.bad} pixels differ beyond a 1/64 px shift` + (stats.size ? '' : ' (image size differs)') + (stats.where ? ' e.g. ' + JSON.stringify(stats.where.slice(0, 4)) : ''));
    if (failures.length <= 6) { mkdirSync(out, { recursive: true }); writeFileSync(join(out, label.replace(/\W+/g, '_') + '-sheets.png'), Buffer.from(url.split(',')[1], 'base64')); }
  }
}
async function check(label, kind, args) {
  if (only && !label.includes(only)) return;
  const url = await sheets.page.evaluate(([kind, args]) => window.qa.render(kind, args), [kind, args]);
  const before = failures.length;
  tally(label, await frames.page.evaluate(([kind, args, url]) => window.qa.judge(kind, args, url), [kind, args, url]), url);
  if (failures.length > before && failures.length <= 6)
    writeFileSync(join(out, label.replace(/\W+/g, '_') + '-frames.png'), Buffer.from((await frames.page.evaluate(([kind, args]) => window.qa.render(kind, args), [kind, args])).split(',')[1], 'base64'));
}
const t0 = Date.now();
for (const id of gridBodies) for (let k = 0; k < 4; k++) await check(`grid ${id} t${k}`, 'grid', [id, k]);
for (const id of menuFighters) { await check(`menu preview ${id}`, 'menu', [id, false]); await check(`menu full ${id}`, 'menu', [id, true]); }
for (const [a, b] of matches) {
  if (only && !`match ${a} v ${b}`.includes(only)) continue;
  await Promise.all([sheets, frames].map(side => side.page.evaluate(([a, b]) => window.qa.startMatch(a, b), [a, b])));
  for (let tick = 10; tick <= 600; tick += 10) {
    const url = await sheets.page.evaluate(() => window.qa.renderMatch(10));
    const before = failures.length;
    tally(`match ${a} v ${b} tick ${tick}`, await frames.page.evaluate(url => window.qa.judgeMatch(10, url), url), url);
    if (failures.length > before && failures.length <= 6)
      writeFileSync(join(out, `match_${a}_v_${b}_tick_${tick}-frames.png`), Buffer.from((await frames.page.evaluate(() => window.qa.png())).split(',')[1], 'base64'));
  }
}
const status = await sheets.page.evaluate(() => window.qa.status());
const errors = [...sheets.errors, ...frames.errors];
await browser.close(); await server.close();
for (const e of errors) console.error('PAGE ERROR', e);
for (const f of failures.slice(0, 60)) console.error('MISMATCH', f);
const pct = n => (100 * n / Math.max(1, total.ink)).toFixed(3) + '%';
const summary = `${total.cases} images (${gridBodies.length} bodies x4 transforms, ${menuFighters.length * 2} menu poses, ${matches.length} matches x60) in ${((Date.now() - t0) / 1000).toFixed(0)}s; `
  + `of ${total.ink} drawn pixels, ${pct(total.ink - total.tie - total.bad)} identical, ${pct(total.tie)} sampling ties, ${pct(total.bad)} wrong (plus ${total.seam} break-apart cut-line pixels set aside); sheet page held ${status.sheets} sheet bitmaps`;
if (failures.length || errors.length || !status.sheets) {
  console.error(`FAIL: ${failures.length} images differ, ${errors.length} page errors${status.sheets ? '' : ', sheets never loaded'}. ${summary}` + (failures.length ? `; first images saved in ${out}` : ''));
  process.exit(1);
}
console.log(`PASS: sheets draw the frame PNGs. ${summary}`);
