import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { describe, expect, it } from 'vitest';
import * as core from '../src/core';
import { SIM_VERSION } from '../src/net/simVersion';
import { computeGoldens } from '../scripts/lib/golden-matches.mjs';

/**
 * Golden state hashes. The scripted determinism scenario (scripts/lib/determinism-scenario.mjs)
 * and three long seeded CPU-vs-CPU matches (scripts/lib/golden-matches.mjs) must reproduce the
 * committed hashState values exactly. determinism-smoke.mjs proves the engines agree with each
 * other; this proves today's sim agrees with yesterday's, so a refactor that should be neutral
 * (a code rename or move, a derived selector) can show that it is. hashState is FNV-1a of the
 * state's JSON, so it also covers state field names and key order: renaming, adding or
 * reordering fields of the stored state moves every hash even when behaviour is identical.
 * Such a change needs a deliberate regeneration, not this test's blessing.
 *
 * A deliberate behaviour change regenerates the fixture locally (refused in CI):
 *   UPDATE_GOLDENS=1 npx vitest run tests/golden-state-hashes.test.ts
 * and ships with a SIM_VERSION bump and a hub sim refresh (README hub notes).
 */
const fixture = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'golden-state-hashes.json');
const inCi = !!process.env.CI && process.env.CI !== 'false' && process.env.CI !== '0';
const update = !!process.env.UPDATE_GOLDENS && process.env.UPDATE_GOLDENS !== '0';

describe('golden state hashes', () => {
  const actual = computeGoldens(core);
  const missing = !existsSync(fixture);
  if (!inCi && (update || missing)) writeFileSync(fixture, JSON.stringify(actual, null, 2) + '\n');
  const expected: typeof actual = existsSync(fixture) ? JSON.parse(readFileSync(fixture, 'utf8')) : { version: -1, scenario: { stats: {}, results: [] }, cpu: [] };

  it('is committed and not regenerated in CI', () => {
    expect(update && inCi, 'UPDATE_GOLDENS must not be set in CI: regenerate the fixture locally and commit it').toBe(false);
    expect(missing && inCi, 'tests/fixtures/golden-state-hashes.json is missing: generate it locally and commit it').toBe(false);
  });

  it('covers the scripted scenario and long CPU-vs-CPU matches', () => {
    expect(expected.version).toBe(actual.version);
    expect(expected.scenario.results.length).toBeGreaterThanOrEqual(11);
    expect(expected.cpu.length).toBeGreaterThanOrEqual(3);
    for (const match of expected.cpu) {
      expect(match.frames, match.id).toBeGreaterThanOrEqual(1500);
      expect(new Set(match.hashes).size, match.id).toBeGreaterThanOrEqual(12);
    }
  });

  it('reproduces every scripted-scenario checkpoint', () => {
    expect(actual.scenario.results.map(r => r.matchup)).toEqual(expected.scenario.results.map(r => r.matchup));
    for (const [i, want] of expected.scenario.results.entries()) {
      expect(actual.scenario.results[i].hashes, `scenario ${want.matchup}`).toEqual(want.hashes);
    }
    expect(actual.scenario.stats).toEqual(expected.scenario.stats);
  });

  it('reproduces every seeded CPU-vs-CPU match', () => {
    expect(actual.cpu.map(m => m.id)).toEqual(expected.cpu.map(m => m.id));
    for (const [i, want] of expected.cpu.entries()) expect(actual.cpu[i], want.id).toEqual(want);
  });
});

/**
 * The hub runs the ES2015 IIFE bundle of src/net/serverEntry.ts, not the Vite build. Build it with
 * the options of scripts/build-sim-bundle.mjs, prove it is the fingerprinted bundle, and replay the
 * goldens through its createState, step and hashState. serverEntry exports no CPU or input
 * constants, so the CPU, the input bits and the match-depth setup come from src/core; they only
 * choose inputs and set plain state fields.
 */
describe('golden state hashes on the hub server bundle', () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const code = esbuild.buildSync({
    entryPoints: [join(root, 'src/net/serverEntry.ts')], bundle: true, write: false, format: 'iife', globalName: 'SprotoSim',
    target: 'es2015', platform: 'neutral', logLevel: 'silent', legalComments: 'none', absWorkingDir: root,
  }).outputFiles[0].text;

  it('is the bundle SIM_VERSION fingerprints', () => {
    expect(createHash('sha256').update(code).digest('hex').slice(0, 16)).toBe(SIM_VERSION);
  });

  it('reproduces the committed scenario and CPU-vs-CPU hashes', () => {
    const server = new Function(code + '\nreturn SprotoSim;')() as Pick<typeof core, 'createState' | 'step' | 'hashState'>;
    const hub = { ...core, createState: server.createState, step: server.step, hashState: server.hashState };
    const expected = JSON.parse(readFileSync(fixture, 'utf8'));
    const actual = computeGoldens(hub);
    expect(actual.scenario).toEqual(expected.scenario);
    expect(actual.cpu).toEqual(expected.cpu);
  }, 60_000);
});
