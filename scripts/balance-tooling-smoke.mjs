#!/usr/bin/env node
// Verify measurement honesty, instrumentation transparency, and reproducibility.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCore } from './lib/load.mjs';
import { instrumentCombat, loadBalanceCore, root } from './lib/balance-core.mjs';
import { makeSchedule, playMatch, resolveSeatPair, runTournament, SOURCES } from './lib/balance-runner.mjs';
import { frameRows, toCsv } from './frame-data.mjs';
import { parseOptions } from './balance-tournament.mjs';

const [original, observed] = await Promise.all([loadCore(), loadBalanceCore()]);
const { A, step, createState } = original;
const combatSource = readFileSync(root + 'src/sim/combat.ts', 'utf8');
assert.throws(() => instrumentCombat(''), /exactly one/);
assert.throws(() => instrumentCombat(combatSource + combatSource), /exactly one/);
assert.throws(() => parseOptions(['--seed', '-1']), /uint32/);
assert.throws(() => parseOptions(['--samples', 'NaN']), /positive integer/);
assert.throws(() => parseOptions(['--skills', '11']), /between 1 and 10/);

const ids = original.PLAYABLE_FIGHTERS.slice(0, 12);
const schedule = makeSchedule(ids, 2, 44);
assert.deepEqual(schedule, makeSchedule([...ids].reverse(), 2, 44), 'input ordering does not affect schedule');
assert.notDeepEqual(schedule, makeSchedule(ids, 2, 45), 'seed affects sampled schedule');
assert.equal(new Set(schedule.map(p => p.join(':'))).size, schedule.length, 'deduplicated pairs');
for (const id of ids) assert.ok(schedule.filter(p => p.includes(id)).length >= 2, 'each fighter has requested opponent exposure');

// Every source uses the real step and damage function. Observer must leave state identical.
for (const [source, button] of [['melee', A.light], ['projectile', A.bolt], ['special', A.special], ['throw', A.grab]]) {
  const plain = createState('rivet', 'versus', 'vela');
  plain.fighters[0].x = 500;
  plain.fighters[1].x = source === 'projectile' ? 700 : 560;
  plain.fighters[0].pips = 3;
  const measured = structuredClone(plain);
  observed.__balanceReset();
  for (let frame = 0; frame < 180; frame++) {
    const inputs = [frame === 0 ? button : 0, 0];
    step(plain, inputs);
    observed.step(measured, inputs);
    assert.equal(original.hashState(plain), observed.hashState(measured), `${source}: instrumentation transparent at frame ${frame}`);
  }
  const events = observed.__balanceRead();
  assert.ok(events.some(e => e.source === source && e.amount > 0), `${source}: actual damage observed`);
  assert.equal(events.reduce((n, e) => n + e.amount, 0), 1000 - measured.fighters[1].hp, `${source}: all HP loss accounted for`);
}

// Multiple projectiles can hit in one tick; cap observation at actual HP lost.
{
  const state = observed.createState('rivet', 'versus', 'vela');
  state.fighters[1].hp = 50;
  const target = state.fighters[1];
  state.projectiles = [0, 1].map(() => ({ owner:0, x:target.x, y:target.y - 65, vx:0, vy:0, life:10, damage:40 }));
  observed.__balanceReset();
  observed.step(state, [0, 0]);
  const events = observed.__balanceRead();
  assert.equal(events.length, 2, 'both same-frame contacts recorded');
  assert.equal(events.reduce((n, e) => n + e.amount, 0), 50, 'overkill is not reported as HP damage');
  assert.ok(events.every(e => e.source === 'projectile'));
}

// A timeout remains a raw draw even when HP resolves a measurement result.
{
  const match = playMatch(observed, ['rivet', 'vela'], { maxFrames:1 });
  assert.equal(match.rawOutcome, 'timeout');
  assert.equal(match.rawWinner, null);
  assert.equal(match.winner, null, 'no arbitrary seat win');
  const first = { fighters:['rivet', 'vela'], winner:null, resolution:'unresolved' };
  const reverse = { fighters:['vela', 'rivet'], winner:1, resolution:'hp' };
  resolveSeatPair(first, reverse);
  assert.equal(first.winner, 0);
  assert.equal(first.resolution, 'seat-swap');
}

const config = { ids:['rivet', 'vela', 'gpm'], samples:2, seed:88, maxFrames:300 };
const one = await runTournament(observed, config), two = await runTournament(observed, config);
assert.deepEqual(one, two, 'same seed/config produces byte-equivalent report data');
const referenceOne = await runTournament(observed, { ...config, bot:'reference' });
const referenceTwo = await runTournament(observed, { ...config, bot:'reference' });
assert.deepEqual(referenceOne, referenceTwo, 'reference bot memory resets and reproduces');
assert.equal(referenceOne.levels[0].matches.length, one.levels[0].matches.length * 2, 'reference controller identities crossed');
for (const report of [one, referenceOne]) {
  const summary = report.levels[0].summary;
  assert.equal(summary.seats[0].matches, summary.seats[1].matches, 'balanced seat exposure');
  assert.equal(summary.seats.reduce((n, seat) => n + seat.matches, 0), summary.matches * 2);
  for (const source of SOURCES) assert.ok(summary.seats.every(seat => seat.damage[source] >= 0));
}

const rows = frameRows(original);
assert.equal(new Set(rows.map(row => row.fighter)).size, original.PLAYABLE_FIGHTERS.length, 'every fighter exported');
for (const id of original.PLAYABLE_FIGHTERS) {
  const contacts = rows.filter(row => row.fighter === id && row.move === 'special');
  assert.deepEqual(contacts.map(row => row.contactTick), original.COMBAT_STYLES[id].specialFrames, 'every actual Special contact exported');
}
const csv = toCsv(rows);
assert.equal(csv.split('\n').length, rows.length + 2, 'one CSV line per data row');
assert.ok(csv.includes('nominalOnBlockAdvantage'));
assert.ok(rows.some(row => row.projectile && row.nominalOnHitAdvantage === ''), 'projectile advantage is not misreported as fixed');
console.log(`PASS: headless observer matches production at 720 frame checkpoints; four damage sources, overkill, paired-seat draws, seeded schedules, repeatable CPU/reference reports, and ${rows.length} effective frame rows verified.`);
