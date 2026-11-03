#!/usr/bin/env node
// Runs every standalone check under scripts/ in parallel and prints one summary.
//
//   node scripts/run-all.mjs            all checks
//   node scripts/run-all.mjs --fast     skip the slow roster-wide audits
//   node scripts/run-all.mjs -j 2       limit parallel processes (default: CPU count)
//   node scripts/run-all.mjs throw duo  only checks whose file name contains a filter
//
// Exit status is non-zero when any check fails. Each failing check's output is
// printed in full after the summary; passing output is kept quiet.
import { spawn } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// Over a minute each on a laptop. `--fast` leaves them out for quick local loops.
const SLOW = new Set(['game-qa.mjs', 'throw-smoke.mjs', 'sprite-scale-qa.mjs']);
// Not checks: this runner and shared helpers.
const NOT_CHECKS = new Set(['run-all.mjs', 'build-sim-bundle.mjs']);

const args = process.argv.slice(2);
let jobs = availableParallelism();
const filters = [];
let fast = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--fast') fast = true;
  else if (args[i] === '-j' || args[i] === '--jobs') jobs = Math.max(1, Number(args[++i]) || 1);
  else filters.push(args[i]);
}

// A file imported or spawned by an aggregate check (story-smoke.mjs,
// motion-fix-smoke.mjs) runs as part of that aggregate, so it is not started a
// second time.
const all = readdirSync(here).filter(f => f.endsWith('.mjs') && !NOT_CHECKS.has(f)).sort();
const imported = new Set();
for (const f of all) {
  const source = readFileSync(join(here, f), 'utf8');
  for (const m of source.matchAll(/import\(\s*['"]\.\/([\w.-]+\.mjs)['"]\s*\)/g)) imported.add(m[1]);
  for (const m of source.matchAll(/['"]scripts\/([\w.-]+\.mjs)['"]/g)) if (m[1] !== f) imported.add(m[1]);
}
const checks = all.filter(f => !imported.has(f) && !(fast && SLOW.has(f)) && (!filters.length || filters.some(x => f.includes(x))));
if (!checks.length) {
  console.error('No checks match.');
  process.exit(2);
}

const started = Date.now();
const results = [];
let next = 0;
function run(file) {
  return new Promise(resolve => {
    const t0 = Date.now();
    const child = spawn(process.execPath, [join('scripts', file)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', d => { output += d; });
    child.stderr.on('data', d => { output += d; });
    child.on('close', code => {
      const seconds = (Date.now() - t0) / 1000;
      results.push({ file, code, seconds, output });
      console.log(`${code === 0 ? 'PASS' : 'FAIL'}  ${seconds.toFixed(1).padStart(6)}s  ${file}`);
      resolve();
    });
  });
}
async function worker() {
  while (next < checks.length) await run(checks[next++]);
}
console.log(`Running ${checks.length} checks with ${Math.min(jobs, checks.length)} parallel jobs${fast ? ' (--fast)' : ''}.`);
await Promise.all(Array.from({ length: Math.min(jobs, checks.length) }, worker));

const failed = results.filter(r => r.code !== 0);
for (const r of failed) {
  console.log(`\n===== ${r.file} (exit ${r.code}) =====\n${r.output.trimEnd()}`);
}
console.log(`\n${results.length - failed.length}/${results.length} checks passed in ${((Date.now() - started) / 1000).toFixed(0)}s.`);
if (failed.length) {
  console.log('Failed: ' + failed.map(r => r.file).join(', '));
  process.exit(1);
}
