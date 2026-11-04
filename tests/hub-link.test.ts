import { describe, expect, it, vi } from 'vitest';
import { HubLink } from '../src/hub/link';
import { isFighterAvailable } from '../src/hub/roster';
import type { HubSdk } from '@metaverse/hub-sdk';

function fakeSdk(granted?: string): HubSdk & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    redeemTicket: vi.fn(),
    init: vi.fn(),
    reportEvent: vi.fn(async (eventId: string) => { calls.push(eventId); return granted ? { granted } : {}; }),
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

  it('earns Tickets, then claims the Belt and adds it to the visit', async () => {
    const sdk = fakeSdk('tidebreaker_belt');
    const link = new HubLink(sdk);
    link.attach({ playerId: 'p', ranked: false, relics: ['cones_tip'], effects: {}, ticketsCapLeft: 200, serverTime: 0 });
    const notes: string[] = [];
    expect(await link.onRoundEnd(win, (t) => notes.push(t))).toBe(true);
    expect(sdk.calls).toEqual(['fighter_win:20', 'fighter.story_level_complete']);
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

  it('keeps Tickets news when the Belt was already owned', async () => {
    const sdk = fakeSdk();
    const link = new HubLink(sdk);
    link.attach({ playerId: 'p', ranked: false, relics: ['tidebreaker_belt'], effects: {}, ticketsCapLeft: 200, serverTime: 0 });
    const notes: string[] = [];
    expect(await link.onRoundEnd(win, (t) => notes.push(t))).toBe(false);
    expect(notes).toEqual(['+20 Tickets']);
  });
});
