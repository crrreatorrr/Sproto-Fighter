// Player symmetry and local versus rules in the simulation.
import assert from 'node:assert/strict';
import { loadCore } from './lib/load.mjs';

const { A, createState, step, cpuInput, hashState } = await loadCore();
let checks = 0;
const check = (name, fn) => { fn(); checks++; console.log('PASS:', name); };

check('the CPU decides identically from either slot', () => {
  for (const [p1, p2] of [['vela', 'bront'], ['duo', 'rune'], ['peterpan', 'sproto1601']]) {
    const s = createState(p1, 'cpu', p2);
    for (let t = 0; t < 900; t++) {
      // The same situation with the fighters' slots swapped.
      const swapped = structuredClone(s); swapped.fighters.reverse();
      assert.equal(cpuInput(s, 1), cpuInput(swapped, 0), `${p1} vs ${p2} frame ${t}`);
      assert.equal(cpuInput(s, 0), cpuInput(swapped, 1), `${p1} vs ${p2} frame ${t}`);
      step(s, [cpuInput(s, 0), cpuInput(s, 1)]);
    }
  }
});

check('two CPUs can play a whole versus match to a result, deterministically', () => {
  const play = () => {
    const s = createState('bront', 'versus', 'zephyr');
    for (let t = 0; t < 60 * 60 * 5 && s.winner === null; t++) step(s, [cpuInput(s, 0), cpuInput(s, 1)]);
    return s;
  };
  const a = play(), b = play();
  assert.notEqual(a.winner, null, 'match ends');
  assert.equal(hashState(a), hashState(b));
});

check('versus has no practice health refill', () => {
  const s = createState('rivet', 'versus', 'bront');
  s.fighters[0].x = 380; s.fighters[1].x = 440;
  step(s, [A.heavy, 0]);
  for (let t = 0; t < 200; t++) step(s, [0, 0]);
  assert.ok(s.fighters[1].hp < 1000, 'damage stays');
  const practice = createState('rivet', 'dummy', 'bront');
  practice.fighters[0].x = 380; practice.fighters[1].x = 440;
  step(practice, [A.heavy, 0]);
  for (let t = 0; t < 200; t++) step(practice, [0, 0]);
  assert.equal(practice.fighters[1].hp, 1000, 'practice dummy still refills');
});

check('combo notices reach both players in versus and only player 1 against the CPU', () => {
  const comboBy = (mode, attacker) => {
    const s = createState('rivet', mode, 'bront');
    const [a, b] = attacker === 0 ? [0, 1] : [1, 0];
    s.fighters[a].x = 380; s.fighters[b].x = 440; s.fighters[a].facing = 1; s.fighters[b].facing = -1;
    const press = mask => attacker === 0 ? [mask, 0] : [0, mask];
    step(s, press(A.light)); let stage = 0;
    for (let t = 0; t < 150; t++) {
      const n = s.fighters[a].combo; let mask = 0;
      if (n === 1 && stage === 0) { mask = A.medium; stage = 1; } else if (n === 2 && stage === 1) { mask = A.heavy; stage = 2; }
      step(s, press(mask));
    }
    return s.notice;
  };
  assert.match(comboBy('versus', 0), /^P1 CLEAN FINISH/);
  assert.match(comboBy('versus', 1), /^P2 CLEAN FINISH/);
  assert.match(comboBy('cpu', 0), /^CLEAN FINISH/);
  assert.doesNotMatch(comboBy('dummy', 1), /CLEAN FINISH|RELAY READY/, 'the CPU slot gets no notice outside versus');
});
console.log(`${checks} local versus groups passed.`);
