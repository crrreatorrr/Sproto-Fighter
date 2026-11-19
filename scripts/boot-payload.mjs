#!/usr/bin/env node
// Measures what a cold first visit downloads (not a pass/fail check).
//
//   node scripts/boot-payload.mjs dist [--out file.json] [--settle 6000]
//
// Serves the build, opens it in Chromium with an empty cache and counts every
// response: up to the moment START FIGHT is enabled ("ready"), and in total once
// the network has been quiet for --settle ms after that ("idle"), which includes
// anything the page keeps fetching in the background (music, effects, previews).
// Then it presses START FIGHT and counts what the first fight downloads ("fight").
// Bytes are transfer sizes. Grouped by top-level public folder.
import { chromium } from 'playwright';
import http from 'node:http';
import { createReadStream, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

const dir = resolve(process.argv[2] ?? 'dist');
const arg = name => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const settle = Number(arg('--settle') ?? 6000);
if (!existsSync(join(dir, 'index.html'))) { console.error(`no build at ${dir}`); process.exit(2); }
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let path = decodeURIComponent(req.url.split('?')[0]); if (path.endsWith('/')) path += 'index.html';
  const file = join(dir, path);
  if (!file.startsWith(dir) || !existsSync(file) || statSync(file).isDirectory()) { res.statusCode = 404; return res.end(); }
  const size = statSync(file).size, range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '');
  res.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
  res.setHeader('Accept-Ranges', 'bytes');
  if (range) {
    const start = range[1] ? Number(range[1]) : 0, end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    res.statusCode = 206; res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`); res.setHeader('Content-Length', end - start + 1);
    return createReadStream(file, { start, end }).pipe(res);
  }
  res.setHeader('Content-Length', size);
  createReadStream(file).pipe(res);
}).listen(0, '127.0.0.1');
await new Promise(r => server.on('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Network.enable');
const urls = new Map(); const log = []; let last = Date.now(), inflight = 0;
cdp.on('Network.requestWillBeSent', e => { urls.set(e.requestId, e.request.url); inflight++; last = Date.now(); });
const done = (e, failed) => { inflight = Math.max(0, inflight - 1); last = Date.now(); const url = urls.get(e.requestId) ?? ''; log.push({ url, bytes: failed ? 0 : e.encodedDataLength, at: Date.now(), failed }); };
cdp.on('Network.loadingFinished', e => done(e, false));
cdp.on('Network.loadingFailed', e => done(e, true));
const summary = entries => {
  const groups = {};
  for (const e of entries) {
    const path = new URL(e.url, base).pathname.replace(/^\/+/, ''); const key = path.includes('/') ? path.split('/')[0] : (path || 'index.html');
    groups[key] ??= { requests: 0, mb: 0 }; groups[key].requests++; groups[key].mb += e.bytes / 1e6;
  }
  for (const g of Object.values(groups)) g.mb = +g.mb.toFixed(2);
  return { requests: entries.length, mb: +(entries.reduce((n, e) => n + e.bytes, 0) / 1e6).toFixed(2), failed: entries.filter(e => e.failed).length, groups };
};
const quiet = async () => { while (inflight > 0 || Date.now() - last < settle) await new Promise(r => setTimeout(r, 200)); };

const t0 = Date.now();
await page.goto(base + '/', { waitUntil: 'commit' });
await page.waitForFunction(() => { const b = document.getElementById('start-fight'); return b && !b.disabled && b.textContent.includes('START'); }, null, { timeout: 120000, polling: 50 });
const readyAt = Date.now(); const ready = summary(log.filter(e => e.at <= readyAt));
// A user gesture unlocks audio, as a real first click would.
await page.mouse.click(5, 5);
await quiet();
const idleCount = log.length; const idle = summary(log);
await page.click('#start-fight');
await page.click('#partner-confirm').catch(() => {});
await page.waitForFunction(() => !document.getElementById('fight-view')?.hidden, null, { timeout: 120000, polling: 50 });
await quiet();
const fight = summary(log.slice(idleCount));
const result = { build: dir, readyMs: readyAt - t0, ready, idle, fight, failedUrls: log.filter(e => e.failed).map(e => e.url) };
console.log(JSON.stringify(result, null, 1));
const out = arg('--out'); if (out) writeFileSync(out, JSON.stringify(result, null, 1) + '\n');
await browser.close(); server.close();
