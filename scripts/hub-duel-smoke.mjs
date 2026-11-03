// End-to-end online duels against a running hub (Nakama + Postgres):
// matchmaking, a real rollback match over the server input relay, the server
// simulating the match from both players' input streams and settling the
// 10-Ticket wager, plus quitting, a player who stops streaming, and an
// insufficient balance.
//
//   NAKAMA_URL=http://127.0.0.1:7350 HUB_DATABASE_URL=postgres://postgres:...@127.0.0.1:5432/nakama \
//     node scripts/hub-duel-smoke.mjs
// Skipped (passes) without NAKAMA_URL and HUB_DATABASE_URL. Seeds test users' Tickets directly.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { bundle, dataUrl } from './lib/load.mjs';

const base = process.env.NAKAMA_URL, db = process.env.HUB_DATABASE_URL;
if (!base || !db) { console.log('SKIP: set NAKAMA_URL and HUB_DATABASE_URL to run hub duel checks.'); process.exit(0); }
const serverKey = process.env.NAKAMA_SERVER_KEY ?? 'defaultkey';
const net = await import(dataUrl(await bundle('scripts/lib/duel-entry.mjs', { platform: 'node' })));
const { createState, cpuInput, RollbackSession, encodePacket, decodePacket, encodeInputs, replayMatch, HubDuel, Client, SIM_VERSION } = net;

const sql = q => execFileSync('psql', [db, '-tAc', q], { encoding: 'utf8' }).trim();
const url = new URL(base);
const client = () => new Client(serverKey, url.hostname, url.port, false);

async function player(name, tickets, cpuWins) {
  const s = await client().authenticateDevice('sproto-duel-smoke-' + randomUUID(), true, name.slice(0, 20) + Math.floor(Math.random() * 1e6));
  sql(`INSERT INTO game.tickets_balance VALUES ('${s.user_id}','sproto-fighter',${tickets}) ON CONFLICT (user_id, game_id) DO UPDATE SET balance=${tickets}`);
  for (let i = 0; i < cpuWins; i++) sql(`INSERT INTO game.tickets_ledger (event_id,user_id,game_id,delta,balance_after,reason,kind) VALUES (gen_random_uuid(),'${s.user_id}','sproto-fighter',0,${tickets},'fighter_win','earn')`);
  return s;
}
const balance = id => Number(sql(`SELECT balance FROM game.tickets_balance WHERE user_id='${id}' AND game_id='sproto-fighter'`));

/**
 * Two players queue for a wagered duel and play it. `behaviour[i]` may be
 * 'honest', 'silent' (keeps playing peer-to-peer but stops streaming inputs to
 * the server) or 'quit' (leaves mid-match).
 */
async function duel(sessions, fighters, behaviour = ['honest', 'honest']) {
  const outcomes = [], starts = [];
  const sides = sessions.map((session, i) => {
    const side = { session, i, rollback: null, start: null, timer: null, sentLog: false, koFrame: null };
    side.duel = new HubDuel(client(), session, {
      onStart: start => { side.start = start; starts.push(start); },
      onSignal: () => {},
      onRelay: bytes => { const p = decodePacket(bytes); if (p && side.rollback) side.rollback.receivePacket(p, Date.now()); },
      onOutcome: outcome => { outcomes[i] = outcome; },
      onError: () => {},
    });
    return side;
  });
  for (const s of sides) await s.duel.connect(false);
  for (const [i, s] of sides.entries()) await s.duel.queue({ wager: true, fighter: fighters[i], stage: 'ranch' });
  const deadline = Date.now() + 60000;
  while (sides.some(s => !s.start) && !outcomes.some(Boolean)) { assert.ok(Date.now() < deadline, 'matchmaking timed out'); await new Promise(r => setTimeout(r, 100)); }
  if (outcomes.some(Boolean)) return { outcomes: await settle(outcomes, 2000), starts };
  for (const s of sides) {
    const seat = s.start.seat;
    const state = createState(s.start.fighters[0], 'versus', s.start.fighters[1]);
    const observer = { before: st => st.winner, after: (st, before) => before === null && st.winner !== null ? ['ko'] : [] };
    s.rollback = new RollbackSession(state, { localSlot: seat, inputDelay: 2 }, observer, (frame, events) => { if (events.includes('ko')) s.koFrame = frame; });
    let ticks = 0;
    s.timer = setInterval(() => {
      ticks++;
      if (behaviour[s.i] === 'quit' && ticks === 90) { clearInterval(s.timer); void s.duel.leave(); return; }
      s.rollback.addLocalInput(cpuInput(s.rollback.state, seat));
      s.rollback.advance();
      s.duel.sendRelay(encodePacket(s.rollback.makePacket(Date.now())));
      const stream = s.rollback.takeInputsForServer();
      if (!(behaviour[s.i] === 'silent' && ticks > 60)) s.duel.sendInputs(stream.start, stream.masks);
      if (s.koFrame !== null && !s.log) {
        const pairs = s.rollback.confirmedInputs.slice(0, s.koFrame + 1);
        s.log = { v: 1, sim: SIM_VERSION, fighters: s.start.fighters, frames: pairs.length, inputs: encodeInputs(pairs) };
      }
    }, 16);
  }
  const result = await settle(outcomes, 90000, behaviour.includes('quit') ? 1 : 2);
  // The server can see the KO before a client confirms it; let the clients catch up.
  const until = Date.now() + 5000;
  while (behaviour.every(b => b === 'honest') && sides.some(s => s.koFrame === null) && Date.now() < until) await new Promise(r => setTimeout(r, 50));
  for (const s of sides) { clearInterval(s.timer); await s.duel.leave(); }
  return { outcomes: result, starts, sides };
}
async function settle(outcomes, ms, needed = 2) {
  const deadline = Date.now() + ms;
  while (outcomes.filter(Boolean).length < needed && Date.now() < deadline) await new Promise(r => setTimeout(r, 100));
  return outcomes;
}

let checks = 0;
const check = async (name, fn) => { await fn(); checks++; console.log('PASS:', name); };

await check('wagered duel over the server relay: verified winner takes the 20-Ticket pot', async () => {
  const a = await player('alpha', 50, 3), b = await player('bravo', 50, 3);
  const { outcomes, starts, sides } = await duel([a, b], ['rune', 'bront']);
  assert.deepEqual(starts.map(s => s.seat).sort(), [0, 1], 'one seat each');
  assert.deepEqual(starts[0].wager, { stake: 10, pot: 20 });
  const local = replayMatch(sides[0].log);
  assert.ok(local.winner === 0 || local.winner === 1 || local.winner === 2, 'match ended');
  for (const o of outcomes) assert.equal(o.reason, local.winner === 2 ? 'draw' : 'verified');
  const seats = Object.fromEntries(sides.map(s => [s.start.seat, s.session.user_id]));
  if (local.winner === 0 || local.winner === 1) {
    assert.equal(outcomes[0].status, 'settled');
    assert.equal(outcomes[0].winnerSeat, local.winner);
    assert.equal(balance(seats[local.winner]), 60, 'winner +10 net');
    assert.equal(balance(seats[1 - local.winner]), 40, 'loser -10');
    assert.equal(outcomes[0].deltas[seats[local.winner]], 10);
  } else {
    assert.equal(balance(a.user_id), 50); assert.equal(balance(b.user_id), 50);
  }
  console.log(`  ${sides[0].log.frames} confirmed frames, winner seat ${local.winner}, rollback frames ${sides.map(s => s.rollback.totalRollbackFrames).join('/')}`);
});

await check('a player who stops streaming inputs to the server forfeits, even while still connected', async () => {
  const a = await player('charlie', 50, 3), b = await player('delta', 50, 3);
  const { outcomes, sides } = await duel([a, b], ['vela', 'mox'], ['silent', 'honest']);
  assert.equal(outcomes[1].status, 'settled');
  assert.equal(outcomes[1].reason, 'forfeit');
  assert.equal(outcomes[1].winnerSeat, 1 - sides[0].start.seat);
  assert.equal(balance(a.user_id), 40); assert.equal(balance(b.user_id), 60);
});

await check('quitting mid-match forfeits the stake to the opponent', async () => {
  const a = await player('echo', 50, 3), b = await player('foxtrot', 50, 3);
  const { outcomes, sides } = await duel([a, b], ['zephyr', 'rivet'], ['quit', 'honest']);
  const o = outcomes[1];
  assert.equal(o.status, 'settled'); assert.equal(o.reason, 'forfeit');
  const quitterSeat = sides[0].start.seat;
  assert.equal(o.winnerSeat, 1 - quitterSeat);
  assert.equal(balance(a.user_id), 40); assert.equal(balance(b.user_id), 60);
});

await check('a player without 10 Tickets cancels the match before anything is held', async () => {
  const a = await player('golf', 5, 3), b = await player('hotel', 50, 3);
  const { outcomes } = await duel([a, b], ['vamp', 'duo']);
  const o = outcomes.find(Boolean);
  assert.equal(o.status, 'cancelled'); assert.equal(o.reason, 'insufficient_tickets');
  assert.equal(balance(a.user_id), 5); assert.equal(balance(b.user_id), 50);
});
console.log(`${checks} hub duel groups passed.`);
process.exit(0);
