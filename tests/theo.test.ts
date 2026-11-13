import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import { A, COMBAT_STYLES, FLOOR, createState, getMove, step } from '../src/core';
import { ensurePoseAtlases, getPoseAtlasDebug, setPoseAtlasPresentation } from '../src/poseAtlas';
import { STORY_ENCOUNTERS, STORY_SAVE_KEY, createStoryProgress } from '../src/storyProgress';

const manifest = JSON.parse(readFileSync(new URL('../public/fighters/pose-atlas.json', import.meta.url), 'utf8'));

beforeAll(async () => {
  vi.stubGlobal('fetch', async () => ({
    ok: true, headers: { get: () => 'application/json' }, json: async () => manifest,
  }));
  vi.stubGlobal('Image', class {
    onload?: () => void;
    naturalWidth = 0;
    naturalHeight = 0;
    set src(url: string) {
      const png = readFileSync(new URL('../public' + url.split('?')[0], import.meta.url));
      this.naturalWidth = png.readUInt32BE(16);
      this.naturalHeight = png.readUInt32BE(20);
      queueMicrotask(() => this.onload?.());
    }
  });
  await ensurePoseAtlases(['theo', 'rivet']);
});

afterAll(() => vi.unstubAllGlobals());

function bout(facing: 1 | -1, gap = 480) {
  const state = createState('theo', 'cpu', 'rivet');
  const [theo, rival] = state.fighters;
  theo.x = 640;
  theo.facing = facing;
  rival.x = theo.x + facing * gap;
  rival.facing = facing === 1 ? -1 : 1;
  return state;
}

it('recruits Theo from a single encounter and saves the unlock', () => {
  const encounters = STORY_ENCOUNTERS.filter(e => e.opponents.includes('theo'));
  expect(encounters).toHaveLength(1);
  const [encounter] = encounters;
  expect(encounter).toMatchObject({ id: 'story-v1-theo', opponents: ['theo'] });
  const saved = new Map([[STORY_SAVE_KEY, JSON.stringify({
    version: 3, cleared: STORY_ENCOUNTERS.slice(0, encounter.index).map(e => e.id), unlocked: [],
  })]]);
  const storage = { getItem: (key: string) => saved.get(key) ?? null, setItem: (key: string, value: string) => saved.set(key, value) };
  const progress = createStoryProgress(storage);
  expect(progress.isUnlocked('theo')).toBe(false);
  expect(progress.begin(encounter.index)).toBe(true);
  expect(progress.win(encounter.index)).toBe(true);
  expect(createStoryProgress(storage).isUnlocked('theo')).toBe(true);
});

it.each([1, -1] as const)('plays Theo’s gait, jump, dash, recoil and KO facing %s', facing => {
  const state = bout(facing);
  const [theo] = state.fighters;
  const forward = facing === 1 ? A.right : A.left;
  const walked = new Set<number>();
  for (let frame = 0; frame < 40; frame++) {
    step(state, [forward, 0]);
    const pose = getPoseAtlasDebug(theo, state.frame);
    if (pose.sequence === 'walk') walked.add(pose.frameIndex);
    expect(theo.y).toBe(FLOOR);
  }
  expect(walked.size).toBe(8);
  step(state, [A.dash, 0]);
  expect(getPoseAtlasDebug(theo, state.frame).sequence).toBe('dash');
  for (let frame = 0; frame < 20; frame++) step(state, [0, 0]);
  step(state, [A.up, 0]);
  for (let frame = 0; frame < 5; frame++) step(state, [0, 0]);
  expect(theo.y).toBeLessThan(FLOOR);
  expect(getPoseAtlasDebug(theo, state.frame).sequence).toBe('jump');
  for (let frame = 0; frame < 75; frame++) step(state, [0, 0]);
  expect(theo.y).toBe(FLOOR);

  const reactionState = bout(facing, 57);
  const victim = reactionState.fighters[0];
  step(reactionState, [0, A.medium]);
  const recoil = new Set<number>();
  for (let frame = 0; frame < 85; frame++) {
    step(reactionState, [0, 0]);
    const pose = getPoseAtlasDebug(victim, reactionState.frame);
    if (pose.sequence === 'recoil') recoil.add(pose.frameIndex);
  }
  expect(victim.hp).toBeLessThan(1000);
  expect([...recoil]).toEqual([0, 1, 2, 3]);
  expect(victim.reaction).toBeNull();
  const death = new Set<number>();
  for (let frame = 0; frame < 96; frame++) {
    setPoseAtlasPresentation({ phase: 'outro', frame, winner: 1, fromFloor: false }, reactionState.fighters);
    const pose = getPoseAtlasDebug(victim, frame);
    expect(pose.sequence).toBe('defeat');
    death.add(pose.frameIndex);
  }
  setPoseAtlasPresentation(null, []);
  expect(death.size).toBe(12);
});

it.each([1, -1] as const)('fires Captain’s laser from Theo’s chest and resolves once facing %s', facing => {
  const captain = COMBAT_STYLES.captain;
  const kit = COMBAT_STYLES.theo;
  expect(kit.bolt).toEqual(captain.bolt);
  expect(kit.projectile).toMatchObject({ speed: captain.projectile.speed, shape: 'eyeLaser', horizontal: true });
  const origin = kit.projectile.origin!;
  for (const defense of ['none', 'block', 'duck']) {
    const state = bout(facing, 260);
    const [theo, rival] = state.fighters;
    const input = defense === 'block' ? (facing === 1 ? A.right : A.left) : defense === 'duck' ? A.down : 0;
    const startup = getMove(theo, 'bolt').startup;
    step(state, [A.bolt, input]);
    while (theo.move!.t < startup) step(state, [0, input]);
    expect(state.projectiles).toHaveLength(1);
    const [laser] = state.projectiles;
    expect(laser.x).toBeCloseTo(theo.x + facing * (origin.forward + kit.projectile.speed));
    expect(laser.y).toBeCloseTo(theo.y - origin.height);
    expect(laser.vx).toBe(facing * kit.projectile.speed);
    expect(laser.vy).toBe(0);
    expect(getPoseAtlasDebug(theo, state.frame)).toMatchObject({ sequence: 'ranged', frameIndex: 4 });
    for (let frame = 0; frame < 80; frame++) step(state, [0, input]);
    const damage = getMove(theo, 'bolt').damage;
    expect(rival.hp).toBe(1000 - (defense === 'none' ? damage : defense === 'block' ? Math.round(damage * .12) : 0));
    expect(theo.move).toBeNull();
  }
});
