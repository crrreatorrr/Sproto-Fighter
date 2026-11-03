// Rollback netcode: two sessions over a simulated network with latency,
// jitter, loss and reordering must reach exactly the states of an offline
// replay of the same inputs, and release each side effect exactly once.
import assert from 'node:assert/strict';
import { bundle, dataUrl } from './lib/load.mjs';
import { MATCHUPS } from './lib/determinism-scenario.mjs';

const net = await import(dataUrl(await bundle('scripts/lib/net-entry.mjs')));
const { A, createState, step, hashState, saveState, loadState, RollbackSession, encodePacket, decodePacket } = net;
let checks = 0;
const check = (name, fn) => { fn(); checks++; console.log('PASS:', name); };

check('packet codec round-trips and rejects malformed data', () => {
  const p = { start: 70000, frame: 70004, ack: 69990, advantage: -3, inputs: [0, A.light | A.right, 4095, 2048], checksums: [[59, 0xdeadbeef]], stamp: 123456, echo: 4294967295 };
  const bytes = encodePacket(p);
  assert.equal(bytes.byteLength, 1 + 4 + 4 + 4 + 1 + 1 + 8 + 1 + 8 + 8);
  assert.deepEqual(decodePacket(bytes), p);
  assert.equal(decodePacket(new ArrayBuffer(3)), null);
  assert.equal(decodePacket(bytes.slice(0, bytes.byteLength - 1)), null);
  const bad = new Uint8Array(bytes.slice(0)); bad[0] = 9;
  assert.equal(decodePacket(bad.buffer), null);
});

check('loadState restores in place and keeps fighter identity', () => {
  const s = createState('duo', 'versus', 'vela');
  const fighters = [...s.fighters], array = s.fighters;
  const snap = saveState(s);
  for (let i = 0; i < 120; i++) step(s, [A.right | (i % 9 === 0 ? A.light : 0), A.left | (i % 13 === 0 ? A.bolt : 0)]);
  const after = hashState(s);
  loadState(s, snap);
  assert.equal(hashState(s), hashState(createState('duo', 'versus', 'vela')));
  assert.ok(s.fighters === array && s.fighters.every((f, i) => f === fighters[i]), 'same objects');
  for (let i = 0; i < 120; i++) step(s, [A.right | (i % 9 === 0 ? A.light : 0), A.left | (i % 13 === 0 ? A.bolt : 0)]);
  assert.equal(hashState(s), after, 're-simulation reproduces the state');
});

/** Deterministic input script per player. */
function script(seed) {
  const moves = [A.right, A.left, A.right | A.light, A.medium, A.heavy, A.up | A.right, A.bolt, A.grab, A.down | A.light, A.dash, 0, A.launcher];
  let s = seed >>> 0, held = 0;
  return tick => { if (tick % 6 === 0) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; held = moves[s % moves.length]; } return held; };
}

/** Network that delivers each packet after latency ± jitter ticks, may drop it, and so reorders. */
function link({ latency, jitter, loss }, seed) {
  let s = seed >>> 0; const rand = () => (s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296;
  const queue = [];
  return {
    send(tick, bytes) { if (rand() < loss) return; queue.push({ at: tick + latency + Math.round((rand() * 2 - 1) * jitter), bytes }); },
    receive(tick) { const due = queue.filter(p => p.at <= tick); for (const p of due) queue.splice(queue.indexOf(p), 1); return due.sort(() => rand() - .5).map(p => p.bytes); },
  };
}

const hitObserver = { before: s => s.fighters.map(f => f.hp), after: (s, hp) => s.fighters.flatMap((f, i) => f.hp < hp[i] ? [`hit:${i}:${s.frame}:${hp[i] - f.hp}`] : []) };

function playOnline(p1, p2, conditions, frames) {
  const delay = 2;
  const make = slot => {
    const events = [];
    const session = new RollbackSession(createState(p1, 'versus', p2), { localSlot: slot, inputDelay: delay }, hitObserver, (f, e) => events.push(...e));
    return { session, events, sent: [], inputs: new Map(), script: script(slot ? 0xbeef : 0xcafe), fighters: [...session.state.fighters] };
  };
  const sides = [make(0), make(1)];
  const links = [link(conditions, 11), link(conditions, 29)]; // links[i]: from side i to the other
  let maxRollback = 0, skips = 0;
  for (let tick = 0; tick < frames * 4; tick++) {
    const done = sides.every(x => x.session.confirmedFrame >= frames - 1);
    if (done) break;
    for (const [i, x] of sides.entries()) {
      for (const bytes of links[1 - i].receive(tick)) { const p = decodePacket(bytes); assert.ok(p); x.session.receivePacket(p, tick * 16); }
      // Time sync: a side running ahead sits out a tick now and then.
      if (x.session.framesAhead >= 2 && tick % 4 === 0) { skips++; } else if (x.session.frame < frames + 8) {
        const mask = x.session.frame < frames ? x.script(tick) : 0;
        const f = x.session.addLocalInput(mask);
        if (!x.inputs.has(f)) x.inputs.set(f, mask);
        x.session.advance();
        maxRollback = Math.max(maxRollback, x.session.lastRollback);
      }
      const packet = x.session.makePacket(tick * 16);
      x.sent.push(...packet.checksums);
      links[i].send(tick, encodePacket(packet));
    }
  }
  for (const x of sides) {
    assert.ok(x.session.confirmedFrame >= frames - 1, `confirmed ${x.session.confirmedFrame} of ${frames}`);
    assert.equal(x.session.desync, null, 'no desync');
    assert.ok(x.session.state.fighters.every((f, i) => f === x.fighters[i]), 'fighter identity survives rollbacks');
  }
  // Offline reference with the same per-frame inputs.
  const ref = createState(p1, 'versus', p2), refEvents = [], refHashes = new Map();
  for (let f = 0; f < frames; f++) {
    const hp = hitObserver.before(ref);
    step(ref, [sides[0].inputs.get(f) ?? 0, sides[1].inputs.get(f) ?? 0]);
    refEvents.push(...hitObserver.after(ref, hp));
    if ((f + 1) % 30 === 0) refHashes.set(f, hashState(ref));
  }
  for (const x of sides) {
    const within = x.sent.filter(([f]) => f < frames);
    assert.ok(within.length >= Math.floor(frames / 30) - 1, 'checksums exchanged');
    for (const [f, h] of within) assert.equal(h, refHashes.get(f), `checksum at frame ${f} matches offline replay`);
    assert.deepEqual(x.events.filter(e => Number(e.split(':')[2]) <= frames), refEvents, 'each side effect released exactly once, in order');
  }
  return { maxRollback, rollbackFrames: sides[0].session.totalRollbackFrames + sides[1].session.totalRollbackFrames, skips, events: refEvents.length };
}

const CONDITIONS = [
  { name: 'LAN', latency: 0, jitter: 0, loss: 0 },
  { name: '50 ms', latency: 3, jitter: 0, loss: 0 },
  { name: '100 ms ±50, 10% loss', latency: 6, jitter: 3, loss: .1 },
  { name: '200 ms ±66, 20% loss', latency: 12, jitter: 4, loss: .2 },
];
check('online matches equal offline replays at every checksum across latency, jitter and loss', () => {
  const summary = [];
  for (const conditions of CONDITIONS) for (const [p1, p2] of MATCHUPS) {
    const r = playOnline(p1, p2, conditions, 1200);
    assert.ok(r.maxRollback <= 8, 'rollback window respected');
    if (conditions.latency >= 3) assert.ok(r.rollbackFrames > 0, 'latency actually causes rollbacks');
    summary.push(`${conditions.name} ${p1}/${p2}: ${r.rollbackFrames} rollback frames, max ${r.maxRollback}, ${r.events} hits`);
  }
  console.log('  ' + summary.filter((_, i) => i % 5 === 0).join('\n  '));
});
console.log(`${checks} rollback groups passed.`);
