import { describe, expect, it } from 'vitest';
import { PLAYABLE_FIGHTERS } from '../src/core';
import {
  DUO_RELICS,
  RELIC_CACHE_KEY,
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

describe('Relic-locked fighters', () => {
  it('locks exactly the four Relic fighters and Sproto Duo', () => {
    const locked = PLAYABLE_FIGHTERS.filter((id) => !isUnlocked(id, []));
    expect(locked.sort()).toEqual(['bigswole', 'duo', 'guest12', 'rune', 'zephyr']);
    expect(PLAYABLE_FIGHTERS.length - locked.length).toBe(PLAYABLE_FIGHTERS.length - 5);
  });

  it('maps each other-game Relic to one fighter', () => {
    expect(RELIC_FIGHTERS).toEqual({
      hpos10i_core: 'zephyr',
      genesis_shard: 'guest12',
      cones_tip: 'bigswole',
      tinubu_crown: 'rune',
    });
    for (const [relic, fighter] of Object.entries(RELIC_FIGHTERS)) {
      expect(isUnlocked(fighter, [relic])).toBe(true);
      expect(lockReason(fighter, [relic])).toBeNull();
    }
  });

  it('never unlocks a fighter with its own Tidebreaker Belt', () => {
    for (const id of PLAYABLE_FIGHTERS) {
      expect(requiredRelics(id).some((need) => need.relic === 'tidebreaker_belt')).toBe(false);
    }
    expect(PLAYABLE_FIGHTERS.filter((id) => !isUnlocked(id, ['tidebreaker_belt'])).length).toBe(5);
  });

  it('needs all four Four Lights Relics for Sproto Duo', () => {
    expect(isUnlocked('duo', DUO_RELICS.slice(0, 3))).toBe(false);
    expect(lockReason('duo', DUO_RELICS.slice(0, 3))).toContain('1 still missing');
    expect(isUnlocked('duo', [...DUO_RELICS])).toBe(true);
  });

  it('names the Relic and game a locked fighter needs', () => {
    expect(lockReason('bigswole', [])).toBe("Earn Cone's Tip in NOBU: Saviour Dog");
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

  it('preserves every story recruit and leaves every other recruit locked without a matching Relic', () => {
    for(const id of PLAYABLE_FIGHTERS){
      expect(isFighterAvailable(id,true,[])).toBe(true);
      expect(fighterLockReason(id,true,[])).toBeNull();
      expect(isFighterAvailable(id,false,[])).toBe(false);
      expect(fighterLockReason(id,false,[])).toContain('story mode');
    }
  });

  it('adds only the intended Relic recruits and does not grant unrelated fighters', () => {
    expect(PLAYABLE_FIGHTERS.filter(id=>isFighterAvailable(id,false,DUO_RELICS)).sort())
      .toEqual(['bigswole','duo','guest12','rune','zephyr']);
    expect(isFighterAvailable('duo',false,DUO_RELICS.slice(0,3))).toBe(false);
    expect(isFighterAvailable('duo',true,DUO_RELICS.slice(0,3))).toBe(true);
    expect(isFighterAvailable('bigswole',false,['cones_tip'])).toBe(true);
    expect(isFighterAvailable('bigswole',true,[])).toBe(true);
    expect(fighterLockReason('bigswole',false,[])).toContain("Cone's Tip");
  });
});
