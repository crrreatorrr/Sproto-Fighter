import type { PlayableFighterId } from '../core';

/**
 * Which Sproto Fighter characters other games' Relics unlock.
 *
 * Same rule as the hub's item matrix: a Relic unlocks things in the other games, never in its
 * own. The Tidebreaker Belt is earned here, so it unlocks nothing here. The Breakwater Coin
 * (Sproto Arcade) gives the same award as Cone's Tip, so either one unlocks Pissing Sproto; it is not
 * a Four Lights Relic and does not count towards Error 333.
 *
 * The five Relic fighters remain Hub-only for player recruitment. Captain Green, Sun God
 * and Pissing Sproto also appear as story guardians; beating them does not grant a Relic. Every other
 * fighter, including the earlier Relic picks (Halloween 2008, $Bitcoin Obama, Big Swole,
 * Bongraker, Sproto Duo), is recruited through the campaign. The CPU may still use any fighter.
 */
export interface RelicUnlock {
  relic: string;
  relicName: string;
  game: string;
}

/** One requirement of a locked fighter. Owning `relic` or any of `alternatives` meets it. */
export interface RelicRequirement extends RelicUnlock {
  alternatives: RelicUnlock[];
}

export const RELIC_FIGHTERS: Readonly<Record<string, PlayableFighterId>> = {
  hpos10i_core: 'sproto2616', // Sun God
  genesis_shard: 'sproto3215', // Captain Green
  cones_tip: 'sproto3152', // Pissing Sproto
  tinubu_crown: 'captain', // Yelnacio Globulous
};

/** Error 333 needs all four Four Lights Relics. */
export const ALL_RELICS_FIGHTER: PlayableFighterId = 'sproto1870';

/** Fighters only the hub can newly recruit; three can be challenged in the story. */
/**
 * Relics that give the same single-fighter award as another Relic. Owner rule: the Breakwater Coin
 * gives, in every other game, whatever Cone's Tip gives there. Error 333 ignores these.
 */
export const RELIC_ALTERNATIVES: Readonly<Record<string, readonly string[]>> = {
  cones_tip: ['breakwater_coin'],
};

export const RELIC_ONLY_FIGHTERS: readonly PlayableFighterId[] = [...Object.values(RELIC_FIGHTERS), ALL_RELICS_FIGHTER];

const RELIC_SOURCES: Readonly<Record<string, Omit<RelicUnlock, 'relic'>>> = {
  hpos10i_core: { relicName: 'HPOS10I Core', game: 'HPOS10I' },
  genesis_shard: { relicName: 'Genesis Block Shard', game: "The People's Bitcoin" },
  cones_tip: { relicName: "Cone's Tip", game: 'NOBU: Saviour Dog' },
  tinubu_crown: { relicName: "Tinubu's Crown", game: 'Sproto Duel' },
  breakwater_coin: { relicName: 'Breakwater Coin', game: 'Sproto Arcade' },
};

function source(relic: string): RelicUnlock {
  return { relic, ...RELIC_SOURCES[relic] };
}

/** Error 333 needs all four of these. */
export const ALL_FOUR_RELICS = ['hpos10i_core', 'genesis_shard', 'cones_tip', 'tinubu_crown'] as const;

/** The Relics a locked fighter needs, or an empty list when the fighter is always playable. */
export function requiredRelics(id: PlayableFighterId): RelicRequirement[] {
  if (id === ALL_RELICS_FIGHTER) return ALL_FOUR_RELICS.map((relic) => ({ ...source(relic), alternatives: [] }));
  const relic = Object.keys(RELIC_FIGHTERS).find((key) => RELIC_FIGHTERS[key] === id);
  return relic ? [{ ...source(relic), alternatives: (RELIC_ALTERNATIVES[relic] ?? []).map(source) }] : [];
}

function met(need: RelicRequirement, owned: ReadonlySet<string>): boolean {
  return owned.has(need.relic) || need.alternatives.some((alt) => owned.has(alt.relic));
}

export function isUnlocked(id: PlayableFighterId, relics: readonly string[]): boolean {
  const owned = new Set(relics);
  return requiredRelics(id).every((need) => met(need, owned));
}

/** Short player-facing reason, or null when the fighter is playable. */
export function lockReason(id: PlayableFighterId, relics: readonly string[]): string | null {
  const owned = new Set(relics);
  const missing = requiredRelics(id).filter((need) => !met(need, owned));
  if (missing.length === 0) return null;
  if (id === ALL_RELICS_FIGHTER) return `Own all four Four Lights Relics in the hub (${missing.length} still missing)`;
  return 'Earn ' + [missing[0], ...missing[0].alternatives].map((r) => `${r.relicName} in ${r.game}`).join(' or ');
}

/** Local copy of the last hub visit's Relics, so a standalone launch keeps what the hub confirmed. */
export const RELIC_CACHE_KEY = 'sproto-fighter-hub-relics';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function readRelicCache(store: KeyValueStore | null): string[] {
  try {
    const raw = store?.getItem(RELIC_CACHE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

/** Only a hub visit writes the cache. It replaces the list, so a revoked Relic locks again. */
export function writeRelicCache(store: KeyValueStore | null, relics: readonly string[]): void {
  try {
    store?.setItem(RELIC_CACHE_KEY, JSON.stringify([...relics]));
  } catch {
    /* Storage may be disabled. The hub list still applies for this visit. */
  }
}

/**
 * Relic fighters come from the hub; everyone else from the story. A save that already recruited a
 * Relic fighter in an older campaign keeps it (an earned recruit is never revoked).
 */
export function isFighterAvailable(id:PlayableFighterId, storyUnlocked:boolean, relics:readonly string[]):boolean {
  return storyUnlocked || (requiredRelics(id).length > 0 && isUnlocked(id,relics));
}
export function fighterLockReason(id:PlayableFighterId, storyUnlocked:boolean, relics:readonly string[]):string|null {
  if(isFighterAvailable(id,storyUnlocked,relics))return null;
  const relic=lockReason(id,relics);
  if(relic)return relic+' (hub Relic only for player selection).';
  return 'Defeat this fighter in story mode to recruit them.';
}
