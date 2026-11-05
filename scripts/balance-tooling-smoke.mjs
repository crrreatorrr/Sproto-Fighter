#!/usr/bin/env node
// Verify measurement honesty, instrumentation transparency, and reproducibility.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCore } from './lib/load.mjs';
import { instrumentCombat, loadBalanceCore, root } from './lib/balance-core.mjs';
import { makeSchedule, matchSeeds, playMatch, resolveSeatPair, runTournament, SOURCES } from './lib/balance-runner.mjs';
import { createReferenceBot } from './lib/balance-bots.mjs';
import { runCurve, winInterval } from './lib/balance-curve.mjs';
import { frameRows, toCsv } from './frame-data.mjs';
import { parseOptions } from './balance-tournament.mjs';

const [original, observed] = await Promise.all([loadCore(), loadBalanceCore()]);
const { A, step, createState } = original;
const combatSource = readFileSync(root + 'src/sim/combat.ts', 'utf8');
assert.throws(() => instrumentCombat(''), /exactly one/);
assert.throws(() => instrumentCombat(combatSource + combatSource), /exactly one/);
assert.throws(() => parseOptions(['--seed', '-1']), /uint32/);
assert.throws(() => parseOptions(['--samples', 'NaN']), /positive integer/);
assert.throws(() => parseOptions(['--repeats', '0']), /positive integer/);
assert.throws(() => parseOptions(['--skills', '11']), /between 1 and 10/);

const ids = original.PLAYABLE_FIGHTERS.slice(0, 12);
const schedule = makeSchedule(ids, 2, 44);
assert.deepEqual(schedule, makeSchedule([...ids].reverse(), 2, 44), 'input ordering does not affect schedule');
assert.notDeepEqual(schedule, makeSchedule(ids, 2, 45), 'seed affects sampled schedule');
assert.equal(new Set(schedule.map(p => p.join(':'))).size, schedule.length, 'deduplicated pairs');
for (const id of ids) assert.ok(schedule.filter(p => p.includes(id)).length >= 2, 'each fighter has requested opponent exposure');
const seeds = matchSeeds(77, ['rivet','vela'], ['reference','cpu'], 0);
assert.deepEqual([...seeds].reverse(), matchSeeds(77,['vela','rivet'],['cpu','reference'],0), 'reverse seats retain fighter streams');
assert.notDeepEqual(seeds, matchSeeds(77,['rivet','vela'],['reference','cpu'],1), 'independent repetitions change streams');
assert.notDeepEqual(seeds, matchSeeds(77,['rivet','vela'],['cpu','reference'],0), 'controller assignment changes streams');
assert.ok(seeds.every(s=>s>0&&s<2147483647));

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

// Wrapper observes every branch, including chip after Phase 3, without changing guard state.
{
  const plain = createState('rivet','versus','vela');
  plain.fighters[0].x=500;plain.fighters[1].x=550;
  const measured=structuredClone(plain);
  observed.__balanceReset();
  for(let frame=0;frame<120;frame++) {
    const inputs=[frame===0?A.heavy:0,A.right];
    step(plain,inputs);observed.step(measured,inputs);
    assert.equal(original.hashState(plain),observed.hashState(measured),'guard/chip observation is transparent');
  }
  const lost=1000-measured.fighters[1].hp;
  assert.equal(observed.__balanceRead().reduce((n,e)=>n+e.amount,0),lost,'guarded HP loss fully observed');
  if(original.getMove(plain.fighters[0],'heavy').chip>0)assert.ok(lost>0,'active chip fixture deals guarded damage');
}

// Guard intent persists on nondecision ticks; startup never inherits a retreat direction.
{
  const state=createState('rivet','versus','vela'),bot=createReferenceBot(original);
  state.fighters[0].x=500;state.fighters[1].x=600;state.frame=40;
  assert.equal(bot(state,0),A.left);
  state.frame++;assert.equal(bot(state,0),A.left);
  state.frame++;state.fighters[0].move={id:'light',t:1,hit:false,connected:false,wave:-1};
  assert.equal(bot(state,0),0,'committed startup stays planted');
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
const repeated=await runTournament(observed,{...config,repeats:2});
assert.equal(repeated.levels[0].matches.length,one.levels[0].matches.length*2,'repetition counts reported');
if(observed.CPU_SKILLS) {
  const first=repeated.levels[0].matches[0],second=repeated.levels[0].matches[2];
  assert.notDeepEqual(first.initialSeeds,second.initialSeeds,'recorded match seeds differ per repetition');
  assert.notEqual(first.finalHash,second.finalHash,'seeded CPU state differs per repetition');
  const direct=playMatch(observed,first.fighters,{maxFrames:config.maxFrames,initialSeeds:first.initialSeeds,repeat:first.repeat});
  assert.equal(direct.finalHash,first.finalHash,'recorded initial seeds reproduce final state');
  assert.equal(direct.inputHash,first.inputHash,'recorded seeds reproduce complete input-stream hash');
}
for (const report of [one, referenceOne]) {
  const summary = report.levels[0].summary;
  assert.equal(summary.seats[0].matches, summary.seats[1].matches, 'balanced seat exposure');
  assert.equal(summary.seats.reduce((n, seat) => n + seat.matches, 0), summary.matches * 2);
  for (const source of SOURCES) assert.ok(summary.seats.every(seat => seat.damage[source] >= 0));
}

const rows = frameRows(original);
assert.equal(new Set(rows.map(row => row.fighter)).size, original.PLAYABLE_FIGHTERS.length, 'every fighter exported');
if(original.BALANCE_KITS)for(const row of rows)assert.equal(row.archetype,original.BALANCE_KITS[row.fighter].archetype,'frame reports use canonical production kit assignments');
if(original.BALANCE_KITS)for(const [id,stats] of Object.entries(one.levels[0].summary.fighters))assert.equal(stats.archetype,original.BALANCE_KITS[id].archetype,'tournament reports use canonical production kit assignments');
for (const id of original.PLAYABLE_FIGHTERS) {
  const contacts = rows.filter(row => row.fighter === id && row.move === 'special');
  assert.deepEqual(contacts.map(row => row.contactTick), original.COMBAT_STYLES[id].specialFrames, 'every actual Special contact exported');
}
const csv = toCsv(rows);
assert.equal(csv.split('\n').length, rows.length + 2, 'one CSV line per data row');
assert.ok(csv.includes('nominalOnBlockAdvantage'));
assert.ok(rows.some(row => row.projectile && row.nominalOnHitAdvantage === ''), 'projectile advantage is not misreported as fixed');
const fixtureRoute=[{id:'first',index:0,chapter:0,opponents:['rivet']},{id:'pair',index:1,chapter:0,opponents:['vela','gpm']}];
const curve=await runCurve(observed,fixtureRoute,e=>e.index+1,{maxFrames:1,repeats:2,fighter:'highsproto'});
assert.equal(curve.encounters.length,2);
assert.ok(curve.encounters.every(e=>e.summary.trials===4&&e.summary.rawDraws===4&&e.trials.every(t=>t.bouts.length===1)),'raw curve draws stop encounters rather than inventing wins');
assert.deepEqual(curve,await runCurve(observed,fixtureRoute,e=>e.index+1,{maxFrames:1,repeats:2,fighter:'highsproto'}),'curve reproducibility');
assert.equal(winInterval(0,0),null);assert.ok(winInterval(1,1)[0]<.5&&winInterval(1,1)[1]>.5,'uncertainty visible');
console.log(`PASS: headless observer matches production at 840 frame checkpoints; guard/chip branch, four damage sources, overkill, paired-seat draws, recorded CPU seeds, independent repetitions, persistent reference intent, raw curve outcomes, and ${rows.length} effective frame rows verified.`);
