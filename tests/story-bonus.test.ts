import { describe, expect, it } from 'vitest';

describe('bonus recruits', () => {
  it('recruits one extra fighter from far down the route on every third clear, and never a protected one', async () => {
    const { BONUS_RECRUIT_EVERY, RELIC_ONLY_RECRUITS, STORY_ENCOUNTERS, STARTER_FIGHTERS, createStoryProgress } = await import('../src/storyProgress');
    const progress = createStoryProgress(undefined), bonuses: string[] = [];
    const lastChapter = Math.max(...STORY_ENCOUNTERS.map(e => e.chapter));
    for (const encounter of STORY_ENCOUNTERS.slice(0, 30)) {
      expect(progress.begin(encounter.index)).toBe(true);
      for (let wave = 0; wave < encounter.opponents.length; wave++) expect(progress.win(encounter.index, wave)).toBe(true);
      const bonus = progress.lastBonus();
      expect(!!bonus, encounter.id).toBe((encounter.index + 1) % BONUS_RECRUIT_EVERY === 0);
      if (bonus) bonuses.push(bonus);
    }
    expect(bonuses).toHaveLength(10);
    expect(new Set(bonuses).size).toBe(10);
    for (const id of bonuses) {
      const home = STORY_ENCOUNTERS.find(e => e.opponents.includes(id as never))!;
      expect(home.index, id).toBeGreaterThan(30);
      expect(home.chapter, id).toBeLessThanOrEqual(lastChapter - 2);
      expect(home.gauntlet).toBeUndefined();
      expect(RELIC_ONLY_RECRUITS).not.toContain(id);
      expect(progress.isUnlocked(id as never)).toBe(true);
      // A bonus recruit is playable early but still has to be beaten to clear their encounter.
      expect(progress.isCleared(home.index)).toBe(false);
    }
    // 30 wins used to recruit 30 fighters; now 40 join the two starters.
    expect(progress.snapshot().unlocked).toHaveLength(STARTER_FIGHTERS.length + 30 + 10);
  });
  it('gives an existing version-3 save its bonus recruits on load, once', async () => {
    const { STORY_ENCOUNTERS, STORY_SAVE_KEY, createStoryProgress } = await import('../src/storyProgress');
    const saved = new Map([[STORY_SAVE_KEY, JSON.stringify({ version: 3, cleared: STORY_ENCOUNTERS.slice(0, 9).map(e => e.id), unlocked: [], godModeUnlocked: false })]]);
    const storage = { getItem: (key: string) => saved.get(key) ?? null, setItem: (key: string, value: string) => { saved.set(key, value); } };
    const first = createStoryProgress(storage).snapshot().unlocked;
    expect(first).toHaveLength(2 + 9 + 3);
    // Loading, syncing and reloading apply the same rule again and add nothing.
    const again = createStoryProgress(storage); again.sync();
    expect(again.snapshot().unlocked.sort()).toEqual([...first].sort());
  });
});
