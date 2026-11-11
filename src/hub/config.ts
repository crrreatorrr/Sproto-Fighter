/**
 * Hub identity for Sproto Fighter. The game id and the portal slug are the same
 * (`sproto-fighter`), so Return to hub opens `<hub>#from=sproto-fighter` and the
 * plaza puts the player back at the Bar's arcade cabinet.
 */
export const HUB_GAME_ID = 'sproto-fighter';

/** Flat Tickets for a win against a fighting CPU (story or CPU sparring). Practice dummies earn nothing. */
export const TICKETS_PER_WIN = 20;
/** Server earn reason. Migration 0009 caps it at 20 per call. */
export const WIN_REASON = 'fighter_win';
export const TICKETS_PER_VERSE = 10;

/** Relic trigger. The server grants the Tidebreaker Belt for `{ world: 1 }` only. */
export const STORY_EVENT = 'fighter.story_level_complete';
/** Halloween 2008, the first story rival. Keep the existing world-1 wire contract. */
export const BELT_OPPONENT = 'zephyr';
export const BELT_WORLD = 1;
export const BELT_RELIC = 'tidebreaker_belt';
export const BELT_NAME = 'Tidebreaker Belt';
