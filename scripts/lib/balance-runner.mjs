import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReferenceBot, REFERENCE_BOT_VERSION } from './balance-bots.mjs';
import { archetype } from './balance-core.mjs';

export const HARNESS_VERSION = 'balance-v2-seeded-repeats';
export const SOURCES = ['melee', 'projectile', 'special', 'throw'];
export function seededRandom(seed) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => ((state = state * 16807 % 2147483647) - 1) / 2147483646;
}

export function makeSchedule(ids, samples, seed) {
  const sorted = [...ids].sort(), random = seededRandom(seed), pairs = new Map();
  for (const id of sorted) {
    const pool = sorted.filter(x => x !== id);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    for (const opponent of pool.slice(0, samples)) {
      const pair = [id, opponent].sort();
      pairs.set(pair.join(':'), pair);
    }
  }
  return [...pairs].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([, pair]) => pair);
}

const emptyDamage = () => Object.fromEntries(SOURCES.map(s => [s, 0]));
/** Match streams are independent by repetition and controller assignment; reverse seats reuse the same fighter streams. */
export function matchSeeds(seed, ids, controllers, repeat = 0, context = '') {
  const lineup = ids.map((id, i) => [id, controllers[i]]).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), 'en'));
  return ids.map((id, i) => {
    const bytes = createHash('sha256').update(JSON.stringify([seed, lineup, repeat, context, id, controllers[i]])).digest();
    return bytes.readUInt32BE(0) % 2147483646 + 1;
  });
}

export function playMatch(core, ids, { matchDepth = false, maxFrames = matchDepth ? 10800 : 3600, skill = null, referenceSlot = null, initialSeeds = null, repeat = 0 } = {}) {
  const state = core.createState(ids[0], 'versus', ids[1]);
  if (matchDepth) {
    assert.equal(typeof core.enableMatchDepth, 'function', 'match-depth requires optional match rules in the selected core');
    core.enableMatchDepth(state);
  }
  if (initialSeeds && state.cpu) {
    assert.ok(initialSeeds.length === 2 && initialSeeds.every(seed => Number.isSafeInteger(seed) && seed > 0 && seed < 2147483647), 'valid Park–Miller initial seeds');
    state.cpu.forEach((memory, slot) => { memory.seed = initialSeeds[slot]; });
  }
  const actualInitialSeeds = state.cpu?.map(memory => memory.seed) ?? null;
  const reference = referenceSlot === null ? null : createReferenceBot(core);
  const recoveryFrames = [0, 0], damage = [emptyDamage(), emptyDamage()];
  const rounds = [];
  let roundStartFrame = 0;
  let inputHash = 0x811c9dc5;
  core.__balanceReset();
  const complete = () => matchDepth ? state.matchDepth.complete : state.winner !== null;
  for (let frame = 0; frame < maxFrames && !complete(); frame++) {
    if (state.freeze === 0) for (const [slot, fighter] of state.fighters.entries()) {
      if (fighter.move) {
        const move = core.getMove(fighter, fighter.move.id);
        if (fighter.move.t >= move.startup + move.active) recoveryFrames[slot]++;
      }
    }
    const inputs = [0, 1].map(slot => referenceSlot === slot ? reference(state, slot) : core.cpuInput(state, slot, skill ?? 4));
    for (const input of inputs) inputHash = Math.imul(inputHash ^ input, 0x01000193) >>> 0;
    core.step(state, inputs);
    if (state.winner !== null && (!matchDepth || state.matchDepth.roundRecorded) && rounds.at(-1)?.round !== (state.matchDepth?.round ?? 1)) {
      rounds.push({ round:state.matchDepth?.round ?? 1, complete:true, frames:state.frame-roundStartFrame,
        winner:state.winner < 2 ? state.winner : null, outcome:state.matchDepth?.remaining === 0 ? 'timer' : state.winner === 2 ? 'double-ko' : 'ko',
        hp:state.fighters.map(f=>f.hp) });
      roundStartFrame=state.frame;
    }
  }
  if (state.frame > roundStartFrame) rounds.push({ round:state.matchDepth?.round ?? 1, complete:false,
    frames:state.frame-roundStartFrame, winner:null, outcome:'frame-cap', hp:state.fighters.map(f=>f.hp) });
  const events = core.__balanceRead();
  for (const event of events) {
    assert.ok(SOURCES.includes(event.source) && Number.isFinite(event.amount) && event.amount >= 0, 'valid observed damage event');
    damage[event.owner][event.source] += event.amount;
  }
  const hp = state.fighters.map(f => f.hp);
  const rawWinner = complete() && (state.winner === 0 || state.winner === 1) ? state.winner : null;
  const totalDamage = damage.map(sources => Object.values(sources).reduce((a, b) => a + b, 0));
  const score = state.matchDepth?.wins;
  const scoreWinner = score && score[0] !== score[1] ? score[0] > score[1] ? 0 : 1 : null;
  const winner = rawWinner ?? scoreWinner ?? (hp[0] !== hp[1] ? (hp[0] > hp[1] ? 0 : 1) : totalDamage[0] !== totalDamage[1] ? (totalDamage[0] > totalDamage[1] ? 0 : 1) : null);
  return { fighters:ids, controllers:[0, 1].map(slot => slot === referenceSlot ? 'reference' : 'cpu'), skill, repeat,
    initialSeeds:actualInitialSeeds,
    matchDepth:matchDepth ? { complete:state.matchDepth.complete, wins:[...score], modifier:state.matchDepth.modifier } : null, rounds,
    frames:state.frame, hp, rawWinner, rawOutcome:!complete() ? 'timeout' : state.winner === 2 ? 'double-ko' : rounds.at(-1)?.outcome === 'timer' ? 'timer' : 'ko',
    winner, resolution:rawWinner !== null ? 'game-result' : scoreWinner !== null ? 'round-score' : hp[0] !== hp[1] ? 'hp' : winner !== null ? 'damage' : 'unresolved',
    damage, totalDamage, recoveryFrames, inputHash, finalHash:core.hashState(state) };
}

/** A tied bout inherits its paired reverse-seat result, only when that result is decisive. */
export function resolveSeatPair(first, reverse) {
  for (const [current, other] of [[first, reverse], [reverse, first]]) {
    if (current.winner === null && other.winner !== null) {
      const id = other.fighters[other.winner];
      current.winner = current.fighters.indexOf(id);
      current.resolution = 'seat-swap';
    }
  }
}

const rate = (wins, losses) => wins + losses ? wins / (wins + losses) : null;
const emptyStats = () => ({ matches:0, wins:0, losses:0, draws:0, rawWins:0, rawLosses:0, rawDraws:0, frames:0, recoveryFrames:0, damage:emptyDamage() });
function add(stats, match, slot) {
  stats.matches++;
  if (match.winner === null) stats.draws++; else stats[match.winner === slot ? 'wins' : 'losses']++;
  if (match.rawWinner === null) stats.rawDraws++; else stats[match.rawWinner === slot ? 'rawWins' : 'rawLosses']++;
  stats.frames += match.frames;
  stats.recoveryFrames += match.recoveryFrames[slot];
  for (const source of SOURCES) stats.damage[source] += match.damage[slot][source];
}
function finish(stats) {
  return { ...stats, decidedWinRate:rate(stats.wins, stats.losses), rawDecidedWinRate:rate(stats.rawWins, stats.rawLosses),
    drawRate:stats.draws / stats.matches, rawDrawRate:stats.rawDraws / stats.matches,
    meanSeconds:stats.frames / stats.matches / 60, meanRecoverySeconds:stats.recoveryFrames / stats.matches / 60 };
}

export function summarize(core, matches) {
  const fighters = {}, archetypes = {}, controllers = {}, seats = [emptyStats(), emptyStats()], matchups = {};
  for (const match of matches) for (const slot of [0, 1]) {
    const id = match.fighters[slot], group = archetype(core, id);
    add(fighters[id] ??= emptyStats(), match, slot);
    add(archetypes[group] ??= emptyStats(), match, slot);
    add(controllers[match.controllers[slot]] ??= emptyStats(), match, slot);
    add(seats[slot], match, slot);
    const pair = [...match.fighters].sort();
    // Each matchup aggregate records the alphabetically first fighter once per bout.
    if (id === pair[0]) add(matchups[pair.join(':')] ??= { ...emptyStats(), fighters:pair }, match, slot);
  }
  const frames = matches.map(m => m.frames).sort((a, b) => a - b);
  const rawDraws = matches.filter(m => m.rawWinner === null).length;
  const unresolved = matches.filter(m => m.winner === null).length;
  const completedRounds = matches.flatMap(m=>m.rounds??[]).filter(r=>r.complete);
  return { matches:matches.length, rawDraws, rawDrawRate:rawDraws / matches.length, unresolved, drawRate:unresolved / matches.length,
    rounds:{ completed:completedRounds.length, partial:matches.flatMap(m=>m.rounds??[]).filter(r=>!r.complete).length,
      draws:completedRounds.filter(r=>r.winner===null).length, timerDecisions:completedRounds.filter(r=>r.outcome==='timer').length,
      wins:[0,1].map(slot=>completedRounds.filter(r=>r.winner===slot).length),
      meanSeconds:completedRounds.length ? completedRounds.reduce((n,r)=>n+r.frames,0)/completedRounds.length/60 : null },
    timeouts:matches.filter(m => m.rawOutcome === 'timeout').length,
    meanSeconds:frames.reduce((a, b) => a + b, 0) / frames.length / 60,
    medianSeconds:frames.length % 2 ? frames[(frames.length - 1) / 2] / 60 : (frames[frames.length / 2 - 1] + frames[frames.length / 2]) / 120,
    fighters:Object.fromEntries(Object.entries(fighters).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([id, stats]) => [id, { archetype:archetype(core, id), ...finish(stats) }])),
    archetypes:Object.fromEntries(Object.entries(archetypes).map(([id, stats]) => [id, finish(stats)])),
    controllers:Object.fromEntries(Object.entries(controllers).map(([id, stats]) => [id, finish(stats)])),
    seats:seats.map(finish),
    worstMatchups:Object.entries(matchups).map(([key, stats]) => ({ key, ...finish(stats) }))
      .sort((a, b) => Math.abs((b.decidedWinRate ?? .5) - .5) - Math.abs((a.decidedWinRate ?? .5) - .5) || a.key.localeCompare(b.key, 'en')).slice(0, 30),
  };
}

export async function runTournament(core, { ids = core.PLAYABLE_FIGHTERS, samples = 40, seed = 20261105, matchDepth = false, maxFrames = matchDepth ? 10800 : 3600, skills = [null], bot = 'cpu', repeats = 1, progress } = {}) {
  assert.ok(ids.length >= 2, 'at least two fighters');
  assert.ok(Number.isSafeInteger(repeats) && repeats > 0, 'positive independent repetition count');
  const schedule = makeSchedule(ids, samples, seed), levels = [];
  for (const skill of skills) {
    const matches = [];
    for (let index = 0; index < schedule.length; index++) {
      const pair = schedule[index];
      // Cross both controller assignments as well as both seats for reference comparisons.
      for (let repeat = 0; repeat < repeats; repeat++) for (const referenceId of bot === 'reference' ? pair : [null]) {
        const controllers = pair.map(id => id === referenceId ? 'reference' : 'cpu');
        const initialSeeds = matchSeeds(seed, pair, controllers, repeat);
        const first = playMatch(core, pair, { maxFrames, skill, repeat, initialSeeds, matchDepth, referenceSlot:referenceId === null ? null : pair.indexOf(referenceId) });
        const reverseIds = [...pair].reverse();
        const reverse = playMatch(core, reverseIds, { maxFrames, skill, repeat, initialSeeds:[...initialSeeds].reverse(), matchDepth, referenceSlot:referenceId === null ? null : reverseIds.indexOf(referenceId) });
        resolveSeatPair(first, reverse);
        matches.push(first, reverse);
      }
      if (progress && (index + 1) % 100 === 0) progress({ skill, pairs:index + 1, total:schedule.length });
    }
    levels.push({ skill, summary:summarize(core, matches), matches });
  }
  return { harnessVersion:HARNESS_VERSION, referenceBotVersion:REFERENCE_BOT_VERSION,
    config:{ seed, samples, maxFrames, skills, bot, repeats, matchDepth, roster:[...ids].sort(), schedule }, levels };
}
