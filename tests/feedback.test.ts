import { describe, expect, it } from 'vitest';
import { feedbackContext, feedbackMode, lazyFeedbackTransport, type FeedbackFighter, type FeedbackSnapshot } from '../src/feedback';

const fighter = (character: string, x: number): FeedbackFighter => ({ character, x, y: 0, health: 640, meter: 2, combo: 0, bestCombo: 5, move: null });
const snapshot = (over: Partial<FeedbackSnapshot> = {}): FeedbackSnapshot => ({
  screen: 'fight', mode: 'cpu', story: null, online: null, stage: 'ranch', stageName: 'AMBER RANCH', frame: 900,
  player: fighter('highsproto', 312.44), opponent: fighter('vela', 900), round: null, wins: null, winner: null,
  phase: 'fight', running: true, paused: false, cpuSkill: 4, assisted: false, godMode: false, boss: null, modifier: null, ...over,
});

describe('feedback context', () => {
  it('reports stage, mode, position, round time and both fighters', () => {
    const context = feedbackContext(snapshot());
    expect(context).toMatchObject({ level: 'ranch', mode: 'arcade', position: { x: 312.4, y: 0 }, gameTime: 15 });
    expect(context.player).toMatchObject({ character: 'highsproto', health: 640, meter: 2 });
    expect(context.extra).toMatchObject({ opponent: { character: 'vela', health: 640 }, difficulty: 4, state: 'fighting' });
  });
  it('names every mode', () => {
    expect(feedbackMode(snapshot({ mode: 'versus' }))).toBe('versus');
    expect(feedbackMode(snapshot({ mode: 'guard' }))).toBe('training-guard');
    expect(feedbackMode(snapshot({ mode: 'dummy' }))).toBe('training-combo');
    expect(feedbackMode(snapshot({ story: { stage: 'ranch', encounter: 2, bout: 1 } }))).toBe('story');
    expect(feedbackMode(snapshot({ screen: 'menu' }))).toBe('menu');
  });
  it('reports the online seat and round wins from the local side', () => {
    const context = feedbackContext(snapshot({ mode: 'versus', cpuSkill: null, round: 2, wins: [0, 1], online: { seat: 1, wager: false, phase: 'playing', link: 'direct', pingMs: 31, rollback: 2 } }));
    expect(context.mode).toBe('online');
    expect(context.player).toMatchObject({ round: 2, wins: 1 });
    expect(context.extra).toMatchObject({ online: { role: 'p2', link: 'direct' }, opponent: { wins: 0 } });
    expect(context.extra).not.toHaveProperty('difficulty');
  });
});

describe('feedback transport', () => {
  it('answers standalone without a hub session', async () => {
    const transport = lazyFeedbackTransport(Promise.resolve(null));
    expect(await transport.access()).toEqual({ ok: false, reason: 'standalone' });
    await expect(transport.submit({ categories: ['other'], note: '', image: '', clientTime: '', source: 'manual', meta: {} })).rejects.toThrow();
  });
});
