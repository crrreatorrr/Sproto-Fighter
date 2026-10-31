// Focused local smoke checks, not an exhaustive combat or browser test suite.
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const out = mkdtempSync(join(tmpdir(), 'sproto-smoke-'));
try {
  const build = spawnSync(process.execPath, [resolve('node_modules/typescript/bin/tsc'), 'src/core.ts', '--outDir', out, '--module', 'commonjs', '--target', 'ES2022', '--skipLibCheck'], { stdio: 'inherit' });
  assert.equal(build.status, 0, 'combat compilation');
  const { createState, step, A, FLOOR, PLAYABLE_FIGHTERS, cpuInput } = createRequire(import.meta.url)(join(out, 'core.js'));
  const tick = (s, n, input = 0, opponent = 0) => { for (let i = 0; i < n; i++) step(s, [input, opponent]); };
  function chain(s) {
    s.fighters[0].x = 380; s.fighters[1].x = 440;
    step(s, [A.light, 0]); let stage = 0;
    for (let t = 0; t < 150; t++) {
      const n = s.fighters[0].combo; let input = 0;
      if (n === 1 && stage === 0) { input = A.medium; stage = 1; }
      else if (n === 2 && stage === 1) { input = A.heavy; stage = 2; }
      step(s, [input, 0]);
    }
  }
  for (const id of PLAYABLE_FIGHTERS) {
    const s = createState(id, 'dummy'); chain(s);
    assert.equal(s.fighters[0].best, 3, id + ' three-hit combo');
    assert.equal(s.fighters[0].pips, 1, id + ' one earned pip');
  }
  const s = createState('crapto', 'dummy');
  tick(s, 10, A.right); assert.ok(s.fighters[0].x > 380, 'move');
  tick(s, 3, A.up); assert.ok(s.fighters[0].y < FLOOR, 'jump');
  tick(s, 80); assert.equal(s.fighters[0].y, FLOOR, 'land');
  chain(s); chain(s); chain(s);
  assert.equal(s.fighters[0].pips, 3, 'three combos charge special');
  step(s, [A.special, 0]); assert.equal(s.fighters[0].move?.id, 'special');
  assert.equal(s.fighters[0].pips, 0, 'special consumes charge');
  tick(s, 150); assert.equal(s.fighters[0].pips, 0, 'special cannot charge itself');
  const guard = createState('rivet', 'guard'); guard.fighters[1].x = 440;
  tick(guard, 45, A.light, A.right); assert.equal(guard.fighters[1].hp, 1000, 'guard blocks');
  assert.equal(guard.fighters[0].pips, 0, 'blocked hit grants no pip');
  tick(guard, 1); guard.fighters[1].x = guard.fighters[0].x + 60;
  tick(guard, 45, A.grab, A.right); assert.ok(guard.fighters[1].hp < 1000, 'grab beats guard');
  const match = createState('crapto', 'cpu', 'guest10'), replay = createState('crapto', 'cpu', 'guest10');
  for (let i = 0; i < 6500 && match.winner === null; i++) {
    const input = [i % 80 < 35 ? A.right : i % 23 === 0 ? A.light : i % 31 === 0 ? A.bolt : 0, cpuInput(match)];
    step(match, input); step(replay, input);
  }
  assert.notEqual(match.winner, null, 'representative round resolves');
  assert.deepEqual(match, replay, 'frame replay');
  const fresh = createState('crapto', 'cpu', 'guest10');
  assert.equal(fresh.fighters[0].hp, 1000); assert.equal(fresh.frame, 0); assert.equal(fresh.winner, null);
  console.log(`PASS: ${PLAYABLE_FIGHTERS.length} roster combos; movement/jump; three-combo special; guard/grab; CPU round and replay; fresh round.`);
} finally { rmSync(out, { recursive: true, force: true }); }
