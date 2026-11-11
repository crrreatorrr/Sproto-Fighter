// Golden state-hash fixture: the scripted determinism scenario plus long seeded
// CPU-vs-CPU matches. tests/golden-state-hashes.test.ts recomputes these and
// compares them with tests/fixtures/golden-state-hashes.json, so a change to any
// simulated state fails even when every engine agrees with the others. The hash is
// FNV-1a of the state's JSON, so it also covers field names and key order:
// renaming or reordering state fields moves every hash even when behaviour is the
// same. It proves neutrality only for refactors that leave the state shape alone.
// Pure: no clocks, no Math.random, no DOM. Takes the sim through `core`.
import { runScenario } from './determinism-scenario.mjs';

export const GOLDEN_VERSION = 1;
export const CPU_CHECK_EVERY = 120;

/** Long CPU-vs-CPU fights. Seeds replace the CPU memories' Park-Miller seeds; the
 * third match plays best-of-three match-depth rounds. Each covers different kits:
 * melee, projectiles and paired fighters. */
export const CPU_MATCHES = [
  { id: 'cpu-rivet-vela-s4s7', p1: 'rivet', p2: 'vela', skills: [4, 7], seeds: [7919, 104723], maxFrames: 7200 },
  { id: 'cpu-rune-duo-s10s10', p1: 'rune', p2: 'duo', skills: [10, 10], seeds: [2147483629, 65537], maxFrames: 7200 },
  { id: 'cpu-vamp-guest11-depth-s7s10', p1: 'vamp', p2: 'guest11', skills: [7, 10], seeds: [31337, 271828], maxFrames: 10800, matchDepth: true },
];

const fnv = (h, n) => {
  for (let shift = 0; shift < 32; shift += 8) { h ^= (n >>> shift) & 0xff; h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
};

export function runCpuMatch(core, spec) {
  const { createState, step, cpuInput, hashState } = core;
  const s = createState(spec.p1, 'versus', spec.p2);
  if (spec.matchDepth) core.enableMatchDepth(s);
  s.cpu.forEach((memory, slot) => { memory.seed = spec.seeds[slot]; });
  const done = () => spec.matchDepth ? s.matchDepth.complete : s.winner !== null;
  const hashes = [];
  let inputs = 0x811c9dc5, frame = 0;
  for (; frame < spec.maxFrames && !done(); frame++) {
    const pair = [cpuInput(s, 0, spec.skills[0]), cpuInput(s, 1, spec.skills[1])];
    inputs = fnv(fnv(inputs, pair[0]), pair[1]);
    step(s, pair);
    if ((frame + 1) % CPU_CHECK_EVERY === 0) hashes.push(hashState(s));
  }
  return {
    id: spec.id, frames: frame, simFrame: s.frame, winner: s.winner,
    hp: s.fighters.map(f => f.hp), inputHash: inputs, finalHash: hashState(s), hashes,
  };
}

/** Everything the fixture records, in a stable JSON-friendly shape. */
export function computeGoldens(core) {
  const scenario = runScenario(core);
  return {
    version: GOLDEN_VERSION,
    scenario: { stats: scenario.stats, results: scenario.results },
    cpu: CPU_MATCHES.map(spec => runCpuMatch(core, spec)),
  };
}
