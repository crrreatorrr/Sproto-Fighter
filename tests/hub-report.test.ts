import { describe, expect, it } from 'vitest';
import { planFighterWin, type FighterWin } from '../src/hub/report';

const base: FighterWin = { winner: 0, mode: 'cpu', storyWorld: null, stage: 'ranch', fighter: 'rivet', matchId: 'm1' };

describe('planFighterWin', () => {
  it('earns flat Tickets for a CPU win', () => {
    expect(planFighterWin(base)).toEqual([{ kind: 'earn', amount: 20, reason: 'fighter_win', key: 'fighter:win:m1' }]);
  });

  it('reports nothing for a loss, a draw or practice', () => {
    expect(planFighterWin({ ...base, winner: 1 })).toEqual([]);
    expect(planFighterWin({ ...base, winner: 2 })).toEqual([]);
    expect(planFighterWin({ ...base, mode: 'dummy' })).toEqual([]);
    expect(planFighterWin({ ...base, mode: 'guard', storyWorld: 1 })).toEqual([]);
  });

  it('reports the Relic event for a Story World 1 win', () => {
    const calls = planFighterWin({ ...base, storyWorld: 1, stage: 'yacht' });
    expect(calls).toHaveLength(2);
    expect(calls[1]).toEqual({
      kind: 'event',
      eventId: 'fighter.story_level_complete',
      data: { world: 1, stage: 'yacht', fighter: 'rivet' },
      key: 'fighter.story_level_complete:m1',
    });
  });

  it('does not report the Relic event for later worlds', () => {
    for (const world of [2, 3, 4]) {
      expect(planFighterWin({ ...base, storyWorld: world }).map((c) => c.kind)).toEqual(['earn']);
    }
  });
});
