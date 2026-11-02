import { BELT_WORLD, STORY_EVENT, TICKETS_PER_WIN, WIN_REASON } from './config';

export interface FighterWin {
  /** Round winner from the combat state: 0 player, 1 CPU, 2 draw. */
  winner: number;
  /** `cpu` fights back. `dummy` and `guard` are practice and report nothing. */
  mode: string;
  /** Story world number for a story match, or null for free play. */
  storyWorld: number | null;
  stage: string;
  fighter: string;
  /** Stable for retries of this win, new for the next win. */
  matchId: string;
}

export interface EarnCall {
  kind: 'earn';
  amount: number;
  reason: string;
  key: string;
}

export interface EventCall {
  kind: 'event';
  eventId: string;
  data: { world: number; stage: string; fighter: string };
  key: string;
}

export type HubCall = EarnCall | EventCall;

/**
 * What a finished round reports to the hub. Losses, draws and practice dummies report nothing.
 * A win against the CPU earns flat Tickets. Winning Story World 1 also reports the Relic event;
 * the server decides whether that grants the Tidebreaker Belt (it does once per player).
 * Other story worlds only earn Tickets.
 */
export function planFighterWin(win: FighterWin): HubCall[] {
  if (win.winner !== 0 || win.mode !== 'cpu') return [];
  const calls: HubCall[] = [
    { kind: 'earn', amount: TICKETS_PER_WIN, reason: WIN_REASON, key: `fighter:win:${win.matchId}` },
  ];
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
