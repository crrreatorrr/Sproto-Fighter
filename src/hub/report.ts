import { BELT_WORLD, BOSS_EVENT, STORY_BOSSES, STORY_EVENT, difficultyTier, type DifficultyTier } from './config';

export interface FighterWin {
  /** Round winner from the combat state: 0 player, 1 CPU, 2 draw. */
  winner: number;
  /** God Mode keeps local progress, but assisted rounds earn no hub currency or Relic. */
  assisted?: boolean;
  /** `cpu` fights back. `dummy` and `guard` are practice and report nothing. */
  mode: string;
  /** Legacy world-1 reward marker for the Halloween 2008 encounter; null otherwise. */
  storyWorld: number | null;
  /** The story rival just defeated, or null outside story mode. */
  storyRival?: string | null;
  /** The story chapter that rival belongs to. */
  chapter?: number;
  /** The CPU skill the round was played at (1 to 10). */
  skill?: number;
  /** True when this win cleared the story encounter for the first time on this save. */
  firstClear?: boolean;
  stage: string;
  fighter: string;
  /** Stable for retries of this win, new for the next win. */
  matchId: string;
}

export interface EventCall {
  kind: 'event';
  eventId: string;
  data: { stage: string; fighter: string; world?: number; boss?: string; difficulty?: DifficultyTier; skill?: number; firstClear?: boolean };
  key: string;
}

export type HubCall = EventCall;

/**
 * What a finished round reports to the hub. Losses, draws, practice and assisted rounds report nothing.
 *
 * The client sends only what the server pays for. Defeating one of the ten story bosses reports
 * `fighter.boss_defeated`; the server pays Tickets for it once per boss per day. Defeating Halloween
 * 2008 reports the Relic event; the server decides whether that grants the Tidebreaker Belt.
 * Other CPU wins report nothing: the hub has no rule that pays them.
 *
 * Difficulty and first-clear travel as event data. The server ignores them today; a rule that
 * scales Tickets by difficulty or adds a first-clear bonus can read them without a client change.
 */
export function planFighterWin(win: FighterWin): HubCall[] {
  if (win.winner !== 0 || win.mode !== 'cpu' || win.assisted) return [];
  const calls: HubCall[] = [];
  if (win.storyRival && STORY_BOSSES.includes(win.storyRival)) {
    calls.push({
      kind: 'event',
      eventId: BOSS_EVENT,
      data: {
        boss: win.storyRival, stage: win.stage, fighter: win.fighter,
        ...(win.chapter === undefined ? {} : { world: win.chapter }),
        ...(win.skill === undefined ? {} : { difficulty: difficultyTier(win.skill), skill: Math.round(win.skill * 10) / 10 }),
        firstClear: !!win.firstClear,
      },
      key: `${BOSS_EVENT}:${win.storyRival}:${win.matchId}`,
    });
  }
  if (win.storyWorld === BELT_WORLD) {
    calls.push({
      kind: 'event',
      eventId: STORY_EVENT,
      data: { world: win.storyWorld, stage: win.stage, fighter: win.fighter },
      key: `${STORY_EVENT}:${win.matchId}`,
    });
  }
  return calls;
}
