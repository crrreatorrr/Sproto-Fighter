import type { PlayableFighterId } from '../core';

/**
 * Which Sproto Fighter characters other games' Relics unlock.
 *
 * Same rule as the hub's item matrix: a Relic unlocks things in the other games, never in its
 * own. The Tidebreaker Belt is earned here, so it unlocks nothing here. Every other fighter is
 * always playable. The CPU may use any fighter, locked or not, so you meet them before you own them.
 */
export interface RelicUnlock {
  relic: string;
  relicName: string;
  game: string;
}

export const RELIC_FIGHTERS: Readonly<Record<string, PlayableFighterId>> = {
  hpos10i_core: 'zephyr',
  genesis_shard: 'guest12',
  cones_tip: 'bigswole',
  tinubu_crown: 'rune',
};

const RELIC_SOURCES: Readonly<Record<string, Omit<RelicUnlock, 'relic'>>> = {
  hpos10i_core: { relicName: 'HPOS10I Core', game: 'HPOS10I' },
  genesis_shard: { relicName: 'Genesis Block Shard', game: "The People's Bitcoin" },
  cones_tip: { relicName: "Cone's Tip", game: 'NOBU: Saviour Dog' },
  tinubu_crown: { relicName: "Tinubu's Crown", game: 'Sproto Duel' },
};

/** Sproto Duo needs all four of these. */
export const DUO_RELICS = ['hpos10i_core', 'genesis_shard', 'cones_tip', 'tinubu_crown'] as const;

/** The Relics a locked fighter needs, or an empty list when the fighter is always playable. */
export function requiredRelics(id: PlayableFighterId): RelicUnlock[] {
  if (id === 'duo') return DUO_RELICS.map((relic) => ({ relic, ...RELIC_SOURCES[relic] }));
  const relic = Object.keys(RELIC_FIGHTERS).find((key) => RELIC_FIGHTERS[key] === id);
  return relic ? [{ relic, ...RELIC_SOURCES[relic] }] : [];
}

export function isUnlocked(id: PlayableFighterId, relics: readonly string[]): boolean {
  const owned = new Set(relics);
  return requiredRelics(id).every((need) => owned.has(need.relic));
}

/** Short player-facing reason, or null when the fighter is playable. */
export function lockReason(id: PlayableFighterId, relics: readonly string[]): string | null {
  const owned = new Set(relics);
  const missing = requiredRelics(id).filter((need) => !owned.has(need.relic));
  if (missing.length === 0) return null;
  if (id === 'duo') return `Own all four Four Lights Relics in the hub (${missing.length} still missing)`;
  return `Earn ${missing[0].relicName} in ${missing[0].game}`;
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
