// Cross-engine determinism: the same scripted matches must produce identical
// state checksums in Node (V8) and in every available browser engine. Online
// play depends on this. See scripts/lib/determinism-scenario.mjs.
//
// Browser engines that are not installed are skipped. Set
// DETERMINISM_BROWSERS=chromium,firefox,webkit to require them (CI does).
import assert from 'node:assert/strict';
import { bundle, dataUrl } from './lib/load.mjs';

const source = await bundle('scripts/lib/determinism-entry.mjs');
const reference = (await import(dataUrl(source))).default;
const { stats } = reference;
assert.ok(stats.waveFrames > 100, 'scenario exercises wave projectiles');
assert.ok(stats.diagonalShots > 5, 'scenario exercises diagonal aimed shots');
assert.ok(stats.throws > 0, 'scenario exercises throws');
const fingerprint = r => r.results.map(m => m.matchup + ':' + m.hashes.join(',')).join('\n');
const expected = fingerprint(reference);

const required = (process.env.DETERMINISM_BROWSERS ?? '').split(',').map(s => s.trim()).filter(Boolean);
let playwright = null;
try { playwright = await import('playwright'); } catch { /* optional locally */ }
const checked = ['node'];
for (const engine of ['chromium', 'firefox', 'webkit']) {
  let browser;
  try {
    if (!playwright) throw new Error('playwright is not installed');
    browser = await playwright[engine].launch(engine === 'chromium' && process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  } catch (error) {
    assert.ok(!required.includes(engine), `${engine} is required but could not launch: ${error.message.split('\n')[0]}`);
    console.log(`SKIP ${engine}: not available`);
    continue;
  }
  try {
    const page = await browser.newPage();
    await page.setContent('<!doctype html><title>determinism</title>');
    const result = await page.evaluate(async code => {
      const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
      try { return (await import(url)).default; } finally { URL.revokeObjectURL(url); }
    }, source);
    const actual = fingerprint(result);
    if (actual !== expected) {
      const a = actual.split('\n'), e = expected.split('\n');
      const i = a.findIndex((line, n) => line !== e[n]);
      assert.fail(`${engine} diverged from Node in ${e[i].split(':')[0]}`);
    }
    checked.push(engine);
  } finally {
    await browser.close();
  }
}
const checkpoints = reference.results.reduce((n, m) => n + m.hashes.length, 0);
console.log(`PASS: identical state checksums at ${checkpoints} checkpoints across ${reference.results.length} matchups on ${checked.join(', ')} (${stats.waveFrames} wave-projectile frames, ${stats.diagonalShots} diagonal shots, ${stats.throws} throw-hold frames).`);
