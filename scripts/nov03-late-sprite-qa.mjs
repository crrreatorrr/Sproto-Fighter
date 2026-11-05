import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { loadPoses, read } from './lib/load.mjs';

const plan = JSON.parse(read('art/roster-intake-nov03-late/plan.json'));
const { core, poses, manifest } = await loadPoses();
const { A, FLOOR, ROSTER, COMBAT_STYLES, PLAYABLE_FIGHTERS, createState, getMove, step } = core;
await poses.ensurePoseAtlases(plan.map(({ id }) => id));

const expectedClips = {
  intro: 4, special: 8, cast: 4, recoil: 4, defeat: 12,
  entrance: 8, ranged: 8, death: 16,
  dash: 6, jump: 6, heavy: 8, airKick: 6, victory: 6,
};
const snapshot = fighter => JSON.stringify(fighter);
const frames = new Set();
const frameHashes = new Map();
let casts = 0, throws = 0, slots = 0;
const paintProbe = {
  images: 0,
  save() {}, restore() {},
  translate(x, y) { assert.ok(Number.isFinite(x) && Number.isFinite(y)); },
  rotate(angle) { assert.ok(Number.isFinite(angle)); },
  scale(x, y) { assert.ok(Number.isFinite(x) && Number.isFinite(y)); },
  drawImage() { this.images++; },
};

function state(id, facing, distance = 480) {
  const game = createState(id, 'versus', 'rivet');
  const [fighter, rival] = game.fighters;
  fighter.x = 640;
  rival.x = 640 + facing * distance;
  fighter.facing = facing;
  rival.facing = -facing;
  return game;
}

function sample(game, fighter = game.fighters[0]) {
  const before = snapshot(fighter);
  const pose = poses.getPoseAtlasDebug(fighter, game.frame);
  assert.ok(pose.available, fighter.id + ' atlas available');
  paintProbe.images = 0;
  assert.equal(poses.drawPoseAtlas(paintProbe, fighter, game.frame), true);
  assert.equal(paintProbe.images, 1, fighter.id + ' drew one complete actor');
  assert.equal(snapshot(fighter), before, fighter.id + ' playback does not change simulation');
  return pose;
}

function clock(game, p1 = 0, p2 = 0) {
  step(game, [p1, p2]);
  for (const actor of game.fighters) {
    assert.ok([actor.x, actor.y, actor.vx, actor.vy, actor.hp].every(Number.isFinite));
    assert.ok(actor.y <= FLOOR);
  }
  return sample(game);
}

function observe(set, pose, sequence) {
  if (pose.sequence === sequence) set.add(pose.frameIndex);
}

for (const { id, name, existingFighter } of plan) {
  assert.ok(PLAYABLE_FIGHTERS.includes(id), name + ' registered');
  assert.equal(ROSTER[id].name, name);
  const atlas = manifest.fighters[id];
  assert.equal(atlas.frames.length, 32);
  const walkLength = id === 'gluttony' ? 4 : 8;
  assert.equal(atlas.walkFrames.length, walkLength);
  for (const [clip, length] of Object.entries(expectedClips)) {
    if (existingFighter && !atlas.clips[clip]) continue;
    assert.equal(atlas.clips[clip].length, length, id + ' ' + clip);
  }
  for (const cel of [...atlas.frames, ...atlas.walkFrames, ...Object.values(atlas.clips).flat()]) {
    if (frames.has(cel.url)) continue;
    const png = read('public' + cel.url, null);
    assert.equal(png.readUInt32BE(16), atlas.width, cel.url);
    assert.equal(png.readUInt32BE(20), atlas.height, cel.url);
    assert.ok(cel.bounds[0] >= 0 && cel.bounds[2] <= atlas.width, cel.url);
    assert.ok(cel.bounds[1] >= 0 && cel.bounds[3] <= atlas.height, cel.url);
    frames.add(cel.url);
    const hash = createHash('sha256').update(png).digest('hex');
    const otherOwner = frameHashes.get(hash);
    assert.ok(!otherOwner || otherOwner === id, id + ' reused another fighter’s drawing');
    frameHashes.set(hash, id);
  }
  for (const facing of [-1, 1]) {
    const presentation = state(id, facing);
    const f = presentation.fighters[0];
    const ctx = {
      images: 0, save() {}, restore() {}, translate() {}, rotate() {}, scale() {},
      drawImage() { this.images++; },
    };
    for (let index = 0; index < 32; index++) {
      assert.equal(poses.drawPoseAtlasSample(ctx, f, 0, index), true);
      slots++;
    }
    assert.equal(ctx.images, 32, id + ' all combat slots draw');

    for (const [sequence, winner, fromFloor, duration, length] of [
      ['entrance', null, false, 52, 8], ['death', 1, false, 96, 16],
      ['death', 1, true, 96, 8], ['victory', 0, false, 96, 6],
    ]) {
      if (!atlas.clips[sequence]) continue;
      const seen = new Set();
      for (let frame = 0; frame < duration; frame++) {
        poses.setPoseAtlasPresentation({ phase: winner === null ? 'intro' : 'outro',
          winner, fromFloor, frame }, presentation.fighters);
        const pose = sample(presentation);
        assert.equal(pose.sequence, sequence, id);
        if (fromFloor) assert.ok(pose.frameIndex >= 8, id + ' starts on the floor');
        seen.add(pose.frameIndex);
      }
      assert.equal(seen.size, length, id + ' ' + sequence);
    }
    poses.setPoseAtlasPresentation(null, []);

    const forward = facing === 1 ? A.right : A.left;
    const backward = facing === 1 ? A.left : A.right;
    const idle = state(id, facing);
    const idleSlots = new Set();
    for (let t = 0; t < 80; t++) idleSlots.add(clock(idle).slot);
    assert.deepEqual([...idleSlots], [poses.POSE_SLOTS.guard, poses.POSE_SLOTS.breathe], id + ' idle');
    for (const direction of [forward, backward]) {
      const game = state(id, facing);
      const seen = new Set();
      for (let t = 0; t < 44; t++) observe(seen, clock(game, direction), 'walk');
      assert.equal(seen.size, walkLength, id + ' complete walk and backstep cycles');
      for (let t = 0; t < 6; t++) clock(game);
      assert.equal(game.fighters[0].vx, 0, id + ' stops in guard');
    }
    const dash = state(id, facing);
    const dashFrames = new Set();
    for (let t = 0; t < 20; t++) observe(dashFrames, clock(dash, t === 0 ? A.dash : 0), 'dash');
    if (atlas.clips.dash) assert.equal(dashFrames.size, 6, id + ' dash phases');
    assert.equal(dash.fighters[0].dash, 0);

    const jump = state(id, facing);
    const jumpFrames = new Set();
    let airborne = false, landing = false;
    for (let t = 0; t < 65; t++) {
      const pose = clock(jump, t === 0 ? A.up : 0);
      observe(jumpFrames, pose, 'jump');
      airborne ||= jump.fighters[0].y < FLOOR;
      landing ||= airborne && pose.slot === poses.POSE_SLOTS.crouchLanding;
    }
    assert.ok(airborne && landing, id + ' jumps and lands');
    if (atlas.clips.jump) assert.equal(jumpFrames.size, 6, id + ' jump phases');
    assert.equal(clock(jump, A.down).slot, poses.POSE_SLOTS.crouchLanding, id + ' crouch');

    for (const [input, action, air, clip] of [
      [A.light, 'light', false], [A.medium, 'medium', false],
      [A.heavy, 'heavy', false, 'heavy'], [A.launcher, 'launcher', false],
      [A.down | A.light, 'low', false], [A.down | A.heavy, 'sweep', false],
      [A.light, 'airLight', true], [A.medium, 'airMedium', true, 'airKick'],
      [A.heavy, 'airHeavy', true, 'airKick'],
    ]) {
      const game = state(id, facing);
      const fighter = game.fighters[0];
      if (air) { fighter.y = FLOOR - 285; fighter.vy = -4; }
      const seen = new Set();
      observe(seen, clock(game, input), clip);
      assert.equal(fighter.move?.id, action, id + ' ' + action);
      for (let t = 0; t < 110; t++) observe(seen, clock(game), clip);
      assert.equal(fighter.move, null, id + ' recovers ' + action);
      if (atlas.clips[clip]) assert.equal(seen.size, atlas.clips[clip].length, id + ' ' + clip);
    }

    for (const dir of [0, backward, A.up, A.down]) {
      const game = state(id, facing, 62);
      const fighter = game.fighters[0];
      let hold = false, release = false;
      for (let t = 0; t < 180; t++) {
        step(game, [t === 0 ? A.grab | dir : 0, 0]);
        poses.setPoseAtlasThrowState(game.throwState, game.fighters);
        const pose = sample(game);
        if (game.throwState?.phase === 'hold') {
          hold = true;
          assert.equal(pose.slot, poses.POSE_SLOTS.grabReach);
        }
        release ||= game.throwState?.phase === 'release';
      }
      poses.setPoseAtlasThrowState(null, []);
      assert.ok(hold && release, id + ' throw catch, hold and release');
      assert.equal(fighter.move, null);
      assert.ok(game.fighters[1].hp < 1000);
      throws++;
    }

    for (const air of [false, true]) for (const aim of [0, A.up, A.down, backward]) {
      const game = state(id, facing);
      const fighter = game.fighters[0];
      if (air) { fighter.y = FLOOR - 285; fighter.vy = -4; }
      const style = COMBAT_STYLES[id].projectile;
      const move = getMove(fighter, 'bolt');
      const seen = new Set();
      let shots = null;
      for (let t = 0; t < 80; t++) {
        const pose = clock(game, t === 0 ? A.bolt | aim : 0);
        observe(seen, pose, 'ranged');
        if (shots || !game.projectiles.length) continue;
        assert.equal(fighter.move.t, move.startup, id + ' release timing');
        if (pose.sequence === 'ranged') assert.equal(pose.frameIndex, 4);
        shots = [...game.projectiles];
        assert.equal(shots.length, id === 'd86' ? 2 : 1);
        assert.equal(shots.reduce((damage, shot) => damage + shot.damage, 0), move.damage);
        if (id === 'd86' || id === 'sprotopia') {
          for (const [index, point] of [style.origin, style.secondaryOrigin].filter(Boolean).entries()) {
            assert.equal(shots[index].x - shots[index].vx, fighter.x + facing * point.forward);
            assert.equal(shots[index].y, fighter.y - point.height);
            assert.equal(shots[index].vx, facing * style.speed);
            assert.equal(shots[index].vy, 0);
          }
        }
      }
      assert.ok(shots, id + ' projectile spawns');
      assert.equal(fighter.move, null, id + ' ranged recovery');
      if (!existingFighter) assert.equal(seen.size, 8, id + ' all ranged phases');
      casts++;
    }

    const special = state(id, facing, 70);
    special.fighters[0].pips = 3;
    const specialFrames = new Set();
    let combo = 0;
    for (let t = 0; t < 200; t++) {
      observe(specialFrames, clock(special, t === 0 ? A.special : 0), 'special');
      combo = Math.max(combo, special.fighters[0].combo);
    }
    assert.equal(combo, 4, id + ' all four contacts');
    assert.equal(specialFrames.size, 8, id + ' all special phases');
    assert.equal(special.fighters[0].pips, 0);
    assert.equal(special.fighters[0].move, null);

    for (const guard of [false, true]) {
      const game = state(id, facing, guard ? 44 : 68);
      const seen = new Set();
      let blocked = false;
      for (let t = 0; t < 55; t++) {
        const pose = clock(game, guard ? backward : 0, t === 0 ? A.light : 0);
        blocked ||= pose.slot === poses.POSE_SLOTS.block;
        observe(seen, pose, 'recoil');
      }
      if (guard) assert.ok(blocked && game.fighters[0].hp === 1000, id + ' block');
      else assert.ok(seen.size >= 3 && game.fighters[0].hp < 1000, id + ' hit recoil');
    }
  }
  console.log('PASS:', name, 'both facings, ground and air moves, throws, ranged, reactions and round animations.');
}
for (const facing of [-1, 1]) for (const guard of [false, true]) {
  const game = state('d86', facing, 225);
  const [fighter, rival] = game.fighters;
  const defense = guard ? A.down | (facing === 1 ? A.right : A.left) : 0;
  let hits = 0;
  for (let frame = 0; frame < 90; frame++) {
    const hp = rival.hp;
    step(game, [frame === 0 ? A.bolt : 0, defense]);
    if (rival.hp < hp) {
      hits++;
      assert.ok(guard ? rival.blockstun > 0 : rival.stun > 0, 'each D86 contact resolves as the requested guard or hit');
    }
  }
  assert.equal(hits, 2, 'D86 sends two independently blockable contacts, including chip on guard');
  const damage = getMove(fighter, 'bolt').damage;
  if (guard) assert.equal(1000 - rival.hp, Math.round(Math.ceil(damage / 2) * .12) + Math.round(Math.floor(damage / 2) * .12), 'each half-damage shot deals its own guarded chip');
  else assert.ok(1000 - rival.hp <= damage);
}
console.log(`PASS: ${plan.length} fighters, ${frames.size} referenced PNGs, ${slots} combat slot draws, ${casts} ranged and ${throws} directional throw cases.`);
