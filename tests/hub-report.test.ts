import { describe, expect, it } from 'vitest';
import { STORY_BOSSES, difficultyTier } from '../src/hub/config';
import { planFighterWin, type FighterWin } from '../src/hub/report';
import { STORY_OPPONENTS } from '../src/storyProgress';

const base: FighterWin = { winner: 0, mode: 'cpu', storyWorld: null, stage: 'ranch', fighter: 'rivet', matchId: 'm1' };

describe('planFighterWin', () => {
  it('sends nothing for a CPU win the hub has no rule for', () => {
    // The server's fighter_win ceiling is 0, so the old flat earn was always refused.
    expect(planFighterWin(base)).toEqual([]);
    expect(planFighterWin({ ...base, storyRival: 'mox', chapter: 1, skill: 4 })).toEqual([]);
  });

  it('reports nothing for a loss, a draw, practice or an assisted round', () => {
    const boss = { ...base, storyRival: 'vela', storyWorld: 1 };
    expect(planFighterWin({ ...boss, winner: 1 })).toEqual([]);
    expect(planFighterWin({ ...boss, winner: 2 })).toEqual([]);
    expect(planFighterWin({ ...boss, mode: 'dummy' })).toEqual([]);
    expect(planFighterWin({ ...boss, mode: 'guard' })).toEqual([]);
    expect(planFighterWin({ ...boss, assisted: true })).toEqual([]);
  });

  it('reports the boss event the server pays, with difficulty and first clear as data', () => {
    expect(planFighterWin({ ...base, storyRival: 'vaudream', chapter: 7, skill: 10, firstClear: true, stage: 'gate' })).toEqual([{
      kind: 'event',
      eventId: 'fighter.boss_defeated',
      data: { boss: 'vaudream', stage: 'gate', fighter: 'rivet', world: 7, difficulty: 'expert', skill: 10, firstClear: true },
      key: 'fighter.boss_defeated:vaudream:m1',
    }]);
    expect(planFighterWin({ ...base, storyRival: 'nick', skill: 8.84 })[0].data).toMatchObject({ boss: 'nick', difficulty: 'hard', skill: 8.8, firstClear: false });
  });

  it('knows exactly the ten bosses the server lists, all of them story rivals', () => {
    expect(STORY_BOSSES).toEqual(['sproto3215', 'sproto2616', 'sproto3152', 'rivet', 'sproto865', 'sproto943', 'nick', 'guest07', 'vela', 'vaudream']);
    for (const boss of STORY_BOSSES) {
      expect(STORY_OPPONENTS, boss).toContain(boss);
      expect(planFighterWin({ ...base, storyRival: boss }).map((call) => call.eventId)).toEqual(['fighter.boss_defeated']);
    }
  });

  it('names the difficulty by the published CPU anchors', () => {
    expect([1, 3.9, 4, 6.9, 7, 9.9, 10].map(difficultyTier)).toEqual(['easy', 'easy', 'normal', 'normal', 'hard', 'hard', 'expert']);
  });

  it('reports the Relic event for the Halloween 2008 win and no other world', () => {
    expect(planFighterWin({ ...base, storyWorld: 1, storyRival: 'zephyr', stage: 'yacht' })).toEqual([{
      kind: 'event',
      eventId: 'fighter.story_level_complete',
      data: { world: 1, stage: 'yacht', fighter: 'rivet' },
      key: 'fighter.story_level_complete:m1',
    }]);
    for (const world of [2, 3, 4]) expect(planFighterWin({ ...base, storyWorld: world })).toEqual([]);
  });
});
