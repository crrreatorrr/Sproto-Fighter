import { describe, expect, it } from 'vitest';
import { SAVE_MAX_BYTES, createProgressStore, type ProgressCloud, type SaveResult } from '@metaverse/hub-sdk';

type Disk = { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void };
const disk = (seed: Record<string, string> = {}): Disk => {
  const values = new Map(Object.entries(seed));
  return { getItem: k => values.get(k) ?? null, setItem: (k, v) => void values.set(k, v), removeItem: k => void values.delete(k) };
};
/** Cloud saves on a fake hub, one per player. */
const hub = () => {
  const saves = new Map<string, SaveResult>();
  return {
    saves,
    as: (player: string): ProgressCloud => ({
      loadSave: async () => saves.get(player) ?? { data: null, updatedAt: 0 },
      writeSave: async data => { const saved = { data: JSON.parse(JSON.stringify(data)), updatedAt: Date.now() }; saves.set(player, saved); return saved; },
    }),
  };
};

describe('story progress per hub account', () => {
  it('keeps each account apart from the others and from play outside the hub', async () => {
    const { STORY_ENCOUNTERS, STARTER_FIGHTERS, createStoryProgress } = await import('../src/storyProgress');
    const server = hub(), browser = disk(), first = STORY_ENCOUNTERS[0];
    const win = (p: ReturnType<typeof createStoryProgress>, e = first) => {
      expect(p.begin(e.index)).toBe(true);
      for (let wave = 0; wave < e.opponents.length; wave++) expect(p.win(e.index, wave)).toBe(true);
    };

    const p = createStoryProgress(browser, undefined, undefined, createProgressStore);
    win(p);
    expect(p.isUnlocked(first.opponent)).toBe(true);

    await p.attach(server.as('new-account'), 'new-account');
    expect(p.snapshot().owner).toBe('account');
    expect(p.snapshot().cleared).toEqual([]);
    expect(p.snapshot().unlocked).toEqual([...STARTER_FIGHTERS]);
    expect(p.isUnlocked(first.opponent)).toBe(false);

    await p.attach(server.as('alice'), 'alice');
    win(p);
    win(p, STORY_ENCOUNTERS[1]);
    await p.flush();
    expect(server.saves.get('alice')?.data).toMatchObject({ cleared: [first.id, STORY_ENCOUNTERS[1].id] });
    expect(p.snapshot().cloud).toBe('synced');

    p.release();
    expect(p.snapshot().owner).toBe('device');
    expect(p.snapshot().cleared).toEqual([first.id]);
  });

  it('loads an account on another device from its cloud save', async () => {
    const { STORY_ENCOUNTERS, createStoryProgress } = await import('../src/storyProgress');
    const server = hub(), e = STORY_ENCOUNTERS[0];
    const laptop = createStoryProgress(disk(), undefined, undefined, createProgressStore);
    await laptop.attach(server.as('alice'), 'alice');
    expect(laptop.begin(e.index)).toBe(true);
    for (let wave = 0; wave < e.opponents.length; wave++) expect(laptop.win(e.index, wave)).toBe(true);
    await laptop.flush();

    const phone = createStoryProgress(disk(), undefined, undefined, createProgressStore);
    await phone.attach(server.as('alice'), 'alice');
    expect(phone.isCleared(e.index)).toBe(true);
    expect(phone.isUnlocked(e.opponent)).toBe(true);
  });

  it('keeps saves from older versions on this browser only', async () => {
    const { LEGACY_STORY_SAVE_KEY, createStoryProgress } = await import('../src/storyProgress');
    const p = createStoryProgress(disk({ [LEGACY_STORY_SAVE_KEY]: JSON.stringify({ version: 1, cleared: [] }) }), undefined, undefined, createProgressStore);
    expect(p.isUnlocked('rivet' as never)).toBe(true);
    await p.attach(hub().as('alice'), 'alice');
    expect(p.isUnlocked('rivet' as never)).toBe(false);
  });

  it('holds wins made while the hub visit is starting and gives them to the account', async () => {
    const { STORY_ENCOUNTERS, createStoryProgress } = await import('../src/storyProgress');
    const browser = disk(), server = hub(), e = STORY_ENCOUNTERS[0];
    const p = createStoryProgress(browser, undefined, undefined, createProgressStore);
    p.hold();
    expect(p.snapshot().owner).toBe('pending');
    expect(p.begin(e.index)).toBe(true);
    for (let wave = 0; wave < e.opponents.length; wave++) expect(p.win(e.index, wave)).toBe(true);
    await p.attach(server.as('alice'), 'alice');
    expect(p.isCleared(e.index)).toBe(true);
    expect(createStoryProgress(browser, undefined, undefined, createProgressStore).isCleared(e.index)).toBe(false);
  });

  it('fits a fully finished campaign in one cloud save', async () => {
    const { STORY_ENCOUNTERS, createStoryProgress } = await import('../src/storyProgress');
    const { PLAYABLE_FIGHTERS } = await import('../src/core');
    const server = hub(), p = createStoryProgress(disk(), undefined, undefined, createProgressStore);
    await p.attach(server.as('alice'), 'alice');
    p.setOpenRoute(true);
    for (const e of STORY_ENCOUNTERS) {
      expect(p.begin(e.index)).toBe(true);
      for (let wave = 0; wave < e.opponents.length; wave++) expect(p.win(e.index, wave)).toBe(true);
    }
    await p.flush();
    expect(p.snapshot().cloud).toBe('synced');
    const data = server.saves.get('alice')?.data as { cleared: string[]; unlocked: string[] };
    expect(data.cleared).toHaveLength(STORY_ENCOUNTERS.length);
    // Every fighter id unlocked as well, as a worst case.
    const worst = { ...data, unlocked: [...PLAYABLE_FIGHTERS] };
    const bytes = new TextEncoder().encode(JSON.stringify(worst)).length;
    expect(bytes).toBeLessThan(SAVE_MAX_BYTES * 0.75);
  });
});
