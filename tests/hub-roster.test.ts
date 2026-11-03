import { describe, expect, it } from 'vitest';
import { PLAYABLE_FIGHTERS } from '../src/core';
import { RELIC_ONLY_RECRUITS, STORY_OPPONENTS } from '../src/storyProgress';
import {
  ALL_FOUR_RELICS,
  ALL_RELICS_FIGHTER,
  RELIC_CACHE_KEY,
  RELIC_ONLY_FIGHTERS,
  RELIC_FIGHTERS,
  isUnlocked,
  lockReason,
  readRelicCache,
  requiredRelics,
  writeRelicCache,
  isFighterAvailable,
  fighterLockReason,
  type KeyValueStore,
} from '../src/hub/roster';

function memory(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

const RELIC_FIVE = ['captain', 'sproto1870', 'sproto2616', 'sproto3152', 'sproto3215'];

describe('Relic-locked fighters', () => {
  it('the five Relic fighters are the registered Captain Sproto, Sun God, Pissing Sproto, Captain Green and Error 333', () => {
    for (const id of RELIC_FIVE) expect(PLAYABLE_FIGHTERS).toContain(id);
    expect([...RELIC_ONLY_FIGHTERS].sort()).toEqual(RELIC_FIVE);
    const locked = PLAYABLE_FIGHTERS.filter((id) => !isUnlocked(id, []));
    expect(locked.sort()).toEqual(RELIC_FIVE);
  });

  it('maps each other-game Relic to one fighter, and all four to Error 333', () => {
    expect(RELIC_FIGHTERS).toEqual({
      hpos10i_core: 'sproto2616',
      genesis_shard: 'sproto3215',
      cones_tip: 'sproto3152',
      tinubu_crown: 'captain',
    });
    expect(ALL_RELICS_FIGHTER).toBe('sproto1870');
    for (const [relic, fighter] of Object.entries(RELIC_FIGHTERS)) {
      expect(isUnlocked(fighter, [relic])).toBe(true);
      expect(lockReason(fighter, [relic])).toBeNull();
    }
  });

  it('keeps the Relic fighters out of story mode (story list matches the hub list)', () => {
    expect([...RELIC_ONLY_RECRUITS].sort()).toEqual([...RELIC_ONLY_FIGHTERS].sort());
    for (const id of RELIC_FIVE) expect(STORY_OPPONENTS).not.toContain(id);
    // The earlier Relic picks are story recruits now.
    for (const id of ['zephyr', 'guest12', 'bigswole', 'rune', 'duo']) {
      expect(STORY_OPPONENTS).toContain(id);
      expect(requiredRelics(id as never)).toEqual([]);
    }
  });

  it('never unlocks a fighter with its own Tidebreaker Belt', () => {
    for (const id of PLAYABLE_FIGHTERS) {
      expect(requiredRelics(id).some((need) => need.relic === 'tidebreaker_belt')).toBe(false);
    }
    expect(PLAYABLE_FIGHTERS.filter((id) => !isUnlocked(id, ['tidebreaker_belt'])).length).toBe(5);
  });

  it('needs all four Four Lights Relics for Error 333', () => {
    expect(isUnlocked('sproto1870', ALL_FOUR_RELICS.slice(0, 3))).toBe(false);
    expect(lockReason('sproto1870', ALL_FOUR_RELICS.slice(0, 3))).toContain('1 still missing');
    expect(isUnlocked('sproto1870', [...ALL_FOUR_RELICS])).toBe(true);
  });

  it('names the Relic and game a locked fighter needs', () => {
    expect(lockReason('sproto3152', [])).toBe("Earn Cone's Tip in NOBU: Saviour Dog");
    expect(lockReason('captain', [])).toBe("Earn Tinubu's Crown in Sproto Duel");
    expect(lockReason('rivet', [])).toBeNull();
  });

  it('caches the last hub list and tolerates bad storage', () => {
    const store = memory();
    expect(readRelicCache(store)).toEqual([]);
    writeRelicCache(store, ['cones_tip']);
    expect(readRelicCache(store)).toEqual(['cones_tip']);
    writeRelicCache(store, []);
    expect(readRelicCache(store)).toEqual([]);
    store.data.set(RELIC_CACHE_KEY, '{not json');
    expect(readRelicCache(store)).toEqual([]);
    store.data.set(RELIC_CACHE_KEY, JSON.stringify(['cones_tip', 7]));
    expect(readRelicCache(store)).toEqual(['cones_tip']);
    expect(readRelicCache(null)).toEqual([]);
    const throwing: KeyValueStore = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } };
    expect(readRelicCache(throwing)).toEqual([]);
    expect(() => writeRelicCache(throwing, ['cones_tip'])).not.toThrow();
  });

  it('preserves every story recruit; story fighters say story mode, Relic fighters name their Relic', () => {
    for(const id of PLAYABLE_FIGHTERS){
      expect(isFighterAvailable(id,true,[])).toBe(true);
      expect(fighterLockReason(id,true,[])).toBeNull();
      expect(isFighterAvailable(id,false,[])).toBe(false);
      expect(fighterLockReason(id,false,[])).toContain(RELIC_FIVE.includes(id) ? 'hub Relic only' : 'story mode');
    }
  });

  it('adds only the intended Relic recruits and does not grant unrelated fighters', () => {
    expect(PLAYABLE_FIGHTERS.filter(id=>isFighterAvailable(id,false,ALL_FOUR_RELICS)).sort()).toEqual(RELIC_FIVE);
    expect(isFighterAvailable('sproto1870',false,ALL_FOUR_RELICS.slice(0,3))).toBe(false);
    expect(isFighterAvailable('sproto1870',true,ALL_FOUR_RELICS.slice(0,3))).toBe(true);
    expect(isFighterAvailable('sproto3152',false,['cones_tip'])).toBe(true);
    expect(isFighterAvailable('bigswole',false,['cones_tip'])).toBe(false);
    expect(fighterLockReason('sproto3152',false,[])).toContain("Cone's Tip");
  });
});
