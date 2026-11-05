// Integration contract shared by the single-body fighters added in the named
// roster batches: identity, 72-frame asset layout, gait in both facings,
// dash/jump/landing, five attacks, eight directional throws and the Team Special.
// Likeness and costume are reviewed visually, not here.
// Replaces the former per-fighter copies (erik-smoke.mjs, mlk-smoke.mjs, ...).
import assert from 'node:assert/strict';
import { loadPoses } from './lib/load.mjs';

/** [id, roster name, combat role, foot anchor y]. Vmudream's chassis hovers above the root. */
const FIGHTERS = [
  ['erik', 'Erik Stevens', 'FORMAL', 210],
  ['bimba', 'BIMBA', 'POISE', 210],
  ['blorfo', 'Blorfo', 'LONG REACH', 210],
  ['freshprince', 'FreshPrinceOfBellend', 'REGAL', 210],
  ['gpm', 'GPM', 'BULWARK', 210],
  ['leviosa', 'Bitcoinium Leviosa', 'APLOMB', 210],
  ['lifeisameme', 'Lifeisameme', 'QUIRK', 210],
  ['mlk', 'Bitcoin MLK', 'RESOLVE', 210],
  ['nick', 'Nick', 'BARE HANDS', 210],
  ['rlarsson', 'rlarsson.eth', 'STEADY', 210],
  ['thxobama', 'thxObama', 'DRY WIT', 210],
  ['vaudream', 'ᐯᕬᑌᗞᖇᕮᗋᕬ', 'HOVER', 234],
];

const { core, poses, manifest } = await loadPoses();
const { A, FLOOR, ROSTER, COMBAT_STYLES, PLAYABLE_FIGHTERS, bodyAtlasIds, createState, step } = core;
const tick = (s, n, a = 0, b = 0) => { for (let i = 0; i < n; i++) step(s, [a, b]); };

for (const [id, name, role, anchorY] of FIGHTERS) {
  const at = message => `${id}: ${message}`;
  assert.ok(PLAYABLE_FIGHTERS.includes(id), at('playable'));
  assert.equal(ROSTER[id].name, name, at('roster name'));
  assert.equal(COMBAT_STYLES[id].role, role, at('combat role'));
  assert.deepEqual(bodyAtlasIds(id), [id], at('one independent body'));

  const cfg = manifest.fighters[id];
  assert.equal(cfg.frames.length, 32, at('32 pose slots'));
  assert.equal(cfg.walkFrames.length, 8, at('8 walk frames'));
  assert.equal(cfg.anchor[1], anchorY, at('foot anchor'));
  for (const [clip, count] of Object.entries({ intro: 4, special: 8, cast: 4, recoil: 4, defeat: 12 })) assert.equal(cfg.clips[clip].length, count, at(clip + ' clip length'));
  await poses.ensurePoseAtlases([id, 'rivet']);

  for (const face of [-1, 1]) {
    const s = createState(id, 'cpu', 'rivet'), f = s.fighters[0];
    f.x = 600; s.fighters[1].x = face === 1 ? 1150 : 130; f.facing = face;
    const seen = new Set(); poses.getPoseAtlasDebug(f, 0);
    for (let t = 0; t < 40; t++) {
      step(s, [face === 1 ? A.right : A.left, 0]);
      seen.add(poses.getPoseAtlasDebug(f, s.frame).frameIndex);
      assert.equal(f.y, FLOOR, at('walk stays grounded'));
    }
    assert.equal(seen.size, 8, at(`complete walk cycle facing ${face}`));
    tick(s, 3); assert.equal(f.vx, 0, at('stops'));
    step(s, [A.dash, 0]); assert.ok(f.dash > 0, at('dash'));
    tick(s, 20); step(s, [A.up, 0]); tick(s, 5); assert.ok(f.y < FLOOR, at('jump'));
    tick(s, 80); assert.equal(f.y, FLOOR, at('lands'));
  }

  for (const action of ['light', 'medium', 'heavy', 'launcher', 'bolt']) {
    const s = createState(id, 'cpu', 'rivet'); s.fighters[1].x = 1100;
    step(s, [A[action], 0]); assert.equal(s.fighters[0].move?.id, action, at(action + ' starts'));
    tick(s, 100); assert.equal(s.fighters[0].move, null, at(action + ' recovers'));
  }

  for (const face of [-1, 1]) for (const direction of [0, A.up, A.down, face === 1 ? A.left : A.right]) {
    const s = createState(id, 'cpu', 'rivet'), f = s.fighters[0];
    f.x = 600; s.fighters[1].x = 600 + face * 60; f.facing = face; s.fighters[1].facing = -face;
    step(s, [A.grab | direction, 0]); let held = false;
    for (let t = 0; t < 180; t++) {
      held ||= s.throwState?.phase === 'hold'; step(s, [0, 0]);
      for (const x of s.fighters) assert.ok([x.x, x.y, x.hp, x.vx, x.vy].every(Number.isFinite), at('finite throw state'));
    }
    assert.ok(held, at('throw catches')); assert.equal(s.throwState, null, at('throw clears'));
    assert.equal(s.fighters[1].hp, 910, at('throw damage'));
  }

  const s = createState(id, 'cpu', 'rivet'), f = s.fighters[0];
  f.pips = 3; s.fighters[1].x = 480; step(s, [A.special, 0]); let combo = 0;
  for (let t = 0; t < 220; t++) { combo = Math.max(combo, f.combo); step(s, [0, 0]); }
  assert.equal(f.pips, 0, at('special spends pips'));
  assert.equal(combo, COMBAT_STYLES[id].specialFrames.length, at('every special contact lands'));
  assert.equal(f.move, null, at('special recovers'));
}
console.log(`PASS: ${FIGHTERS.length} single-body fighters — identity, 72-frame asset contract, gait in both facings, dash/jump/landing, five attacks, eight directional throws and Team Special contacts.`);
