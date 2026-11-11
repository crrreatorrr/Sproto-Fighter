import { describe, expect, it, vi } from 'vitest';
import { HubLink } from '../src/hub/link';
import { isFighterAvailable } from '../src/hub/roster';
import type { HubSdk } from '@metaverse/hub-sdk';

function fakeSdk(granted?: string, tickets?: number): HubSdk & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    redeemTicket: vi.fn(),
    init: vi.fn(),
    reportEvent: vi.fn(async (eventId: string, data: { boss?: string }) => { calls.push(data.boss ? `${eventId}:${data.boss}` : eventId); return { ...(granted && !data.boss ? { granted } : {}), ...(data.boss && tickets !== undefined ? { tickets } : {}) }; }),
    submitScore: vi.fn(),
    earnTickets: vi.fn(async (amount: number, reason: string) => { calls.push(`${reason}:${amount}`); return { balance: 40, capped: false }; }),
    exchange: vi.fn(),
    spendTickets: vi.fn(),
    sellItem: vi.fn(),
    getTicketBalance: vi.fn(),
    exit: vi.fn(),
  } as unknown as HubSdk & { calls: string[] };
}

const win = { winner: 0, mode: 'cpu', storyWorld: 1, stage: 'yacht', fighter: 'rivet' };

describe('HubLink', () => {
  it('reports nothing when standalone', async () => {
    const sdk = fakeSdk('tidebreaker_belt');
    const link = new HubLink(sdk);
    link.attach(null);
    expect(await link.onRoundEnd(win)).toBe(false);
    expect(sdk.calls).toEqual([]);
  });

  it('claims the Belt, adds it to the visit, and never sends the refused fighter_win earn', async () => {
    const sdk = fakeSdk('tidebreaker_belt');
    const link = new HubLink(sdk);
    link.attach({ playerId: 'p', ranked: false, relics: ['cones_tip'], effects: {}, ticketsCapLeft: 200, serverTime: 0 });
    const notes: string[] = [];
    expect(await link.onRoundEnd(win, (t) => notes.push(t))).toBe(true);
    expect(sdk.calls).toEqual(['fighter.story_level_complete']);
    expect(sdk.earnTickets).not.toHaveBeenCalled();
    expect(link.relics).toEqual(['cones_tip', 'tidebreaker_belt']);
    expect(notes).toEqual(['Relic: Tidebreaker Belt']);
  });

  it('keeps a Breakwater Coin from the hub visit so it can unlock Pissing Sproto', async () => {
    const sdk = fakeSdk('tidebreaker_belt');
    const link = new HubLink(sdk);
    link.attach({ playerId: 'p', ranked: false, relics: ['breakwater_coin'], effects: {}, ticketsCapLeft: 200, serverTime: 0 });
    expect(link.relics).toEqual(['breakwater_coin']);
    expect(isFighterAvailable('sproto3152', false, link.relics)).toBe(true);
    expect(await link.onRoundEnd(win)).toBe(true);
    expect(link.relics).toEqual(['breakwater_coin', 'tidebreaker_belt']);
  });

  it('says nothing when the Belt was already owned and no boss was beaten', async () => {
    const sdk = fakeSdk();
    const link = new HubLink(sdk);
    link.attach({ playerId: 'p', ranked: false, relics: ['tidebreaker_belt'], effects: {}, ticketsCapLeft: 200, serverTime: 0 });
    const notes: string[] = [];
    expect(await link.onRoundEnd(win, (t) => notes.push(t))).toBe(false);
    expect(notes).toEqual([]);
  });

  it('reports a story boss and shows the Tickets the server credited', async () => {
    const sdk = fakeSdk(undefined, 20);
    const link = new HubLink(sdk);
    link.attach({ playerId: 'p', ranked: false, relics: [], effects: {}, ticketsCapLeft: 200, serverTime: 0 });
    const notes: string[] = [];
    await link.onRoundEnd({ ...win, storyWorld: null, storyRival: 'vela', chapter: 7, skill: 9 }, (t, sub) => notes.push(`${t} | ${sub}`));
    expect(sdk.calls).toEqual(['fighter.boss_defeated:vela']);
    expect(notes).toEqual(['+20 Tickets | Story boss defeated · pays once per boss per day']);
  });

  it('is honest when a boss has already paid today', async () => {
    const sdk = fakeSdk(undefined, 0);
    const link = new HubLink(sdk);
    link.attach({ playerId: 'p', ranked: false, relics: [], effects: {}, ticketsCapLeft: 200, serverTime: 0 });
    const notes: string[] = [];
    await link.onRoundEnd({ ...win, storyWorld: null, storyRival: 'nick' }, (t, sub) => notes.push(`${t} | ${sub}`));
    expect(notes).toEqual(['Boss defeated | No Tickets this time: each boss pays once per day']);
  });

  it('sends nothing at all for an ordinary CPU win', async () => {
    const sdk = fakeSdk();
    const link = new HubLink(sdk);
    link.attach({ playerId: 'p', ranked: false, relics: [], effects: {}, ticketsCapLeft: 200, serverTime: 0 });
    expect(await link.onRoundEnd({ ...win, storyWorld: null })).toBe(false);
    expect(sdk.calls).toEqual([]);
  });
});
