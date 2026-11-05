// Verify offline measurement provenance and real single/paired renderer coverage.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const directory = mkdtempSync(join(tmpdir(), 'sproto-hull-measurements-'));
try {
  const prefix = join(directory, 'report');
  execFileSync(process.execPath, ['scripts/hitbox-measurements.mjs', '--fighters', 'rivet,duo', '--moves', 'light,heavy', '--out', prefix], { stdio: 'pipe' });
  const report = JSON.parse(readFileSync(prefix + '.json', 'utf8'));
  assert.equal(report.schemaVersion, 1);
  assert.equal(report.counts.scenarios, 8);
  assert.ok(report.counts.bodyDraws > report.counts.activeSamples, 'paired companions must both be measured');
  assert.ok(report.counts.pngsDecodedForAlpha > 0, 'missing contact hulls use decoded alpha, not transparent padding');
  for (const hash of [report.toolSha256, report.manifestSha256, report.imageContentSha256, ...Object.values(report.sourceHashes)]) assert.match(hash, /^[a-f0-9]{64}$/);
  const lines = readFileSync(prefix + '.csv', 'utf8').trim().split('\n');
  assert.equal(lines.length, 9);
  const columns = lines[0].split(',').map(s => s.slice(1, -1));
  for (const line of lines.slice(1)) {
    const row = Object.fromEntries(line.split(',').map((s, i) => [columns[i], s.slice(1, -1)]));
    for (const field of ['forwardMin', 'forwardMax', 'heightMin', 'heightMax', 'hitboxForwardMin', 'hitboxForwardMax']) assert.ok(Number.isFinite(Number(row[field])), field);
    assert.ok(Number(row.forwardMax) > Number(row.forwardMin));
    assert.ok(Number(row.heightMax) > Number(row.heightMin));
    assert.ok(row.cells.length);
    if (row.fighter === 'rivet' && row.move === 'light') assert.ok(Number(row.forwardMax) < 150, 'decoded active hull excludes full-canvas transparent padding');
  }
  console.log('PASS: offline active-pose measurements retain source hashes, both facings, paired bodies, finite envelopes and alpha fallback.');
} finally { rmSync(directory, { recursive: true, force: true }); }
