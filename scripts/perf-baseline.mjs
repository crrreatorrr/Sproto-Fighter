#!/usr/bin/env node
// Measures fighter-art loading in a built game (not a pass/fail check).
//
//   node scripts/perf-baseline.mjs dist [--label name] [--out docs/perf/after.json]
//
// Serves the given build, throttles the network to a typical connection
// (20 Mbit/s down, 40 ms latency) and drives the real selection screen with a
// fresh cache:
//   boot     page load until START FIGHT is enabled
//   browse   eight rival picks 150 ms apart, then until START FIGHT is enabled
//   settle   pick the default rival again and wait 2 s (any prefetch runs here)
//   start    press START FIGHT until the fight view shows
// For each step: wall time, requests and bytes. Decoded fighter-art memory comes
// from the game's own counter (`?perf`) when the build has it; older builds are
// estimated as 256x256x4 bytes per frame of every body file they fetched (they
// decoded each frame into its own full-size bitmap, keeping up to 16 bodies).
import { chromium } from 'playwright';
import http from 'node:http';
import { createReadStream, existsSync, statSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname, dirname, resolve } from 'node:path';

const dir = resolve(process.argv[2] ?? 'dist');
const outArg = process.argv.indexOf('--out'), labelArg = process.argv.indexOf('--label');
const label = labelArg > 0 ? process.argv[labelArg + 1] : process.argv[2] ?? 'dist';
if (!existsSync(join(dir, 'index.html'))) { console.error(`usage: node scripts/perf-baseline.mjs <built dir>; ${dir}/index.html not found`); process.exit(2); }
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.wav': 'audio/wav', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let path = decodeURIComponent(req.url.split('?')[0]); if (path.endsWith('/')) path += 'index.html';
  const file = join(dir, path);
  if (!file.startsWith(dir) || !existsSync(file) || statSync(file).isDirectory()) { res.statusCode = 404; return res.end(); }
  res.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(res);
}).listen(0, '127.0.0.1');
await new Promise(r => server.on('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 20e6 / 8, uploadThroughput: 5e6 / 8 });
let requests = 0, bytes = 0; const bodyFiles = [];
cdp.on('Network.loadingFinished', e => { requests++; bytes += e.encodedDataLength; });
cdp.on('Network.requestWillBeSent', e => { const m = /\/fighters\/pose-atlas\/([^/?]+)\.json/.exec(e.request.url); if (m && m[1] !== 'index') bodyFiles.push(m[1]); });
const steps = {};
async function measure(name, action, until) {
  const r0 = requests, b0 = bytes, t0 = Date.now();
  await action();
  await page.waitForFunction(until, null, { timeout: 300000, polling: 50 });
  steps[name] = { ms: Date.now() - t0, requests: requests - r0, mb: +((bytes - b0) / 2 ** 20).toFixed(2) };
}
const ready = () => { const b = document.getElementById('start-fight'); return b && !b.disabled && b.textContent.includes('START'); };
await measure('boot', () => page.goto(`${base}/?perf`, { waitUntil: 'commit' }), ready);
const picks = await page.$$eval('.portrait-choice', buttons => buttons.map(b => b.dataset.fighter).filter(id => id !== 'highsproto' && id !== 'vela').slice(20, 28));
// Browse the rival slot: any fighter can be a rival, while P1 picks may be story-locked.
await page.click('#choose-rival');
await measure('browse', async () => { for (const id of picks) { await page.click(`.portrait-choice[data-fighter="${id}"]`); await page.waitForTimeout(150); } }, ready);
await measure('settle', async () => { await page.click('.portrait-choice[data-fighter="vela"]'); await page.waitForTimeout(2000); }, ready);
await measure('start', () => page.click('#start-fight'), () => !document.getElementById('fight-view').hidden);
await page.waitForTimeout(1500);
const counter = await page.evaluate(() => window.sprotoAtlasStatus?.());
let decodedMB, how;
if (counter) { decodedMB = counter.decodedBytes / 2 ** 20; how = `game counter, ${counter.ids.length} bodies held`; }
else {
  const kept = [...new Set(bodyFiles.reverse())].slice(0, 16);
  decodedMB = kept.reduce((sum, id) => {
    const cfg = JSON.parse(readFileSync(join(dir, 'fighters/pose-atlas', `${id}.json`), 'utf8')).fighters[id];
    const frames = new Set([...cfg.frames, ...(cfg.walkFrames ?? []), ...Object.values(cfg.clips ?? {}).flat()].map(e => typeof e === 'string' ? e : e.url));
    return sum + frames.size * 256 * 256 * 4 / 2 ** 20;
  }, 0);
  how = `estimated, ${kept.length} bodies held`;
}
const report = { build: label, network: '20 Mbit/s, 40 ms', picks, steps, bodyFilesFetched: bodyFiles.length, decodedMB: +decodedMB.toFixed(1), decodedHow: how };
await browser.close(); server.close();
console.log(JSON.stringify(report, null, 2));
if (outArg > 0) { const out = process.argv[outArg + 1]; mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, JSON.stringify(report, null, 2) + '\n'); }
