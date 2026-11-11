/**
 * Hub identity for Sproto Fighter. The game id and the portal slug are the same
 * (`sproto-fighter`), so Return to hub opens `<hub>#from=sproto-fighter` and the
 * plaza puts the player back at the Bar's arcade cabinet.
 */
export const HUB_GAME_ID = 'sproto-fighter';

/**
 * What the hub pays for (checked against metaverse-hub's server rules, migration
 * `0031_story_boss_tickets`): the event `fighter.boss_defeated` with `{ boss }` set to one of
 * ten story bosses pays 20 Tickets, once per boss per player per UTC day. The old
 * `tickets.earn` reason `fighter_win` has had a ceiling of 0 since that migration, so the
 * server answers any positive amount with `amount_over_rule`; the client no longer sends it.
 */
export const BOSS_EVENT = 'fighter.boss_defeated';
/** The server's boss allowlist: the three Relic guardians, then the campaign's closing fights in route order. */
export const STORY_BOSSES: readonly string[] = [
  'sproto3215', 'sproto2616', 'sproto3152',
  'rivet', 'sproto865', 'sproto943', 'nick', 'guest07', 'vela', 'vaudream',
];
/** What the server pays per boss today. Shown only as a fallback: the toast uses the amount the server reports. */
export const TICKETS_PER_BOSS = 20;
export const TICKETS_PER_VERSE = 10;

/** CPU skill as the hub should see it, so a per-difficulty rule can be added server-side without a client change. */
export type DifficultyTier = 'easy' | 'normal' | 'hard' | 'expert';
export const difficultyTier = (skill: number): DifficultyTier => skill >= 10 ? 'expert' : skill >= 7 ? 'hard' : skill >= 4 ? 'normal' : 'easy';

/** Relic trigger. The server grants the Tidebreaker Belt for `{ world: 1 }` only. */
export const STORY_EVENT = 'fighter.story_level_complete';
/** Halloween 2008, the first story rival. Keep the existing world-1 wire contract. */
export const BELT_OPPONENT = 'zephyr';
export const BELT_WORLD = 1;
export const BELT_RELIC = 'tidebreaker_belt';
export const BELT_NAME = 'Tidebreaker Belt';
