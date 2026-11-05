import { expect, it } from 'vitest';
import { A, createState, getMove, hashState, step, type CombatState } from '../src/core';
import { trainingReadout } from '../src/training';

function contact(move: 'light' | 'heavy', block: boolean): CombatState {
    const s = createState('rivet', 'versus', 'vela');
    s.fighters[0].x = 550;
    s.fighters[1].x = 600;
    for (let tick = 0; tick < 100; tick++) {
        step(s, [tick === 0 ? A[move] : 0, block ? A.right : 0]);
        if (s.fighters[1].stun || s.fighters[1].blockstun) return s;
    }
    throw new Error('Attack failed to contact');
}

// Probe actual input acceptance in independent forks. Grab cannot cancel the
// original move; refreshing its buffer avoids measuring a missed button press.
function nextGrabTick(s: CombatState, seat: 0 | 1): number {
    const probe = structuredClone(s);
    for (let tick = 1; tick <= 250; tick++) {
        const inputs: [number, number] = [0, 0];
        inputs[seat] = tick % 2 ? A.grab : 0;
        step(probe, inputs);
        if (probe.fighters[seat].move?.id === 'grab') return tick;
    }
    throw new Error('Fighter did not accept grab');
}
const advantage = (s: CombatState): string => trainingReadout(s).split('\n')[0].match(/uncancelled advantage ([^|]+)/)![1].trim();
const signed = (n: number): string => `${n >= 0 ? '+' : ''}${n}f`;

it.each([
    ['light', false, 7],
    ['light', true, -5],
    ['heavy', true, -12],
] as const)('matches actual next actionable ticks for %s (block=%s)', (move, block, expected) => {
    const s = contact(move, block);
    expect(nextGrabTick(s, 1) - nextGrabTick(s, 0)).toBe(expected);
    const before = hashState(s);
    expect(advantage(s)).toBe(signed(expected));
    expect(hashState(s)).toBe(before);
    // Hitstop consumes neither move age nor stun; both probes share the pause.
    while (s.freeze) {
        step(s, [0, 0]);
        expect(advantage(s)).toBe(signed(expected));
    }
    // Follow the countdown through the move-clearing tick and first neutral tick.
    while (s.fighters[1].stun || s.fighters[1].blockstun) {
        expect(advantage(s)).toBe(signed(nextGrabTick(s, 1) - nextGrabTick(s, 0)));
        step(s, [0, 0]);
    }
    expect(advantage(s)).toBe('—');
});

it('keeps commitment as move age remaining, separate from next action timing', () => {
    const s = contact('light', false), f = s.fighters[0], m = getMove(f, 'light');
    expect(trainingReadout(s)).toContain(`commitment ${m.startup + m.active + m.recovery - f.move!.t}f`);
});

it('does not label changing knockdown stun or a throw hold as numeric advantage', () => {
    const s = contact('heavy', false);
    expect(s.fighters[1].reaction?.kind).toBe('knockdown');
    expect(nextGrabTick(s, 1) - nextGrabTick(s, 0)).toBe(6);
    expect(advantage(s)).toBe('—');
    const hold = createState('rivet', 'versus', 'vela');
    hold.fighters[0].x = 550;
    hold.fighters[1].x = 600;
    for (let tick = 0; tick < 30 && !hold.throwState; tick++) step(hold, [tick === 0 ? A.grab : 0, 0]);
    expect(hold.throwState?.phase).toBe('hold');
    expect(trainingReadout(hold).split('\n').every(line => line.includes('advantage —'))).toBe(true);
});

it('uses observed projectile contact timing rather than a fixed travel advantage', () => {
    const readings: number[] = [];
    for (const gap of [150, 300]) {
        const s = createState('rivet', 'versus', 'vela');
        s.fighters[0].x = 350;
        s.fighters[1].x = 350 + gap;
        expect(advantage(s)).toBe('—');
        for (let tick = 0; tick < 120 && !s.fighters[1].stun; tick++) step(s, [tick === 0 ? A.bolt : 0, 0]);
        expect(s.fighters[1].stun).toBeGreaterThan(0);
        const observed = nextGrabTick(s, 1) - nextGrabTick(s, 0);
        readings.push(observed);
        expect(advantage(s)).toBe(signed(observed));
    }
    expect(readings[1]).toBeGreaterThan(readings[0]);
});

it('does not report dash commitment as an immediately actionable neutral state', () => {
    const s = contact('light', false);
    step(s, [A.dash, 0]);
    while (s.freeze) step(s, [0, 0]);
    step(s, [0, 0]);
    expect(s.fighters[0].move).toBeNull();
    expect(s.fighters[0].dash).toBe(10);
    expect(nextGrabTick(s, 0)).toBe(3);
    expect(nextGrabTick(s, 1)).toBe(22);
    expect(advantage(s)).toBe('—');
});

it('does not predict airborne commitment when landing can clear the move early', () => {
    const s = createState('rivet', 'versus', 'vela');
    s.fighters[0].x = 550;
    s.fighters[1].x = 600;
    for (let tick = 0; tick < 90 && !s.fighters[1].stun; tick++) {
        step(s, [tick === 0 ? A.up : tick === 30 ? A.light : 0, 0]);
    }
    const f = s.fighters[0], move = getMove(f, 'airLight');
    expect(f.move?.id).toBe('airLight');
    expect(f.vy).toBeGreaterThan(0);
    // The no-cancel probe can grab on touchdown, before airLight's listed end.
    expect(nextGrabTick(s, 0) - s.freeze).toBeLessThan(move.startup + move.active + move.recovery - f.move!.t + 1);
    expect(advantage(s)).toBe('—');
});


it.each([A.dash, A.up])('does not predict a pending movement buffer during hitstop (%s)', input => {
    const s = contact('light', false);
    step(s, [input, 0]);
    expect(s.freeze).toBeGreaterThan(0);
    expect(s.fighters[0].dashBuffer || s.fighters[0].jumpBuffer).toBeGreaterThan(0);
    expect(advantage(s)).toBe('—');
});

it('does not report action timing after the match has ended', () => {
    const s = contact('light', false);
    s.winner = 0;
    expect(advantage(s)).toBe('—');
});

it('does not predict advantage before later Special waves refresh stun', () => {
    const s = createState('rivet', 'versus', 'vela');
    s.fighters[0].x = 550;
    s.fighters[1].x = 600;
    s.fighters[0].pips = 3;
    for (let tick = 0; tick < 100 && !s.fighters[1].stun; tick++) step(s, [tick === 0 ? A.special : 0, 0]);
    expect(s.fighters[0].move?.wave).toBe(0);
    expect(s.fighters[1].reaction?.kind).toBe('recoil');
    expect(nextGrabTick(s, 0)).toBe(86);
    expect(nextGrabTick(s, 1)).toBe(90);
    expect(advantage(s)).toBe('—');
});

it('does not predict advantage while the next projectile in a volley can still hit', () => {
    const s = createState('d86', 'versus', 'vela');
    s.fighters[0].x = 350;
    s.fighters[1].x = 650;
    for (let tick = 0; tick < 120 && !s.fighters[1].stun; tick++) step(s, [tick === 0 ? A.bolt : 0, 0]);
    expect(s.fighters[1].stun).toBeGreaterThan(0);
    expect(s.projectiles.some(p => p.life > 0 && !p.beamHit)).toBe(true);
    expect(advantage(s)).toBe('—');
    const hp = s.fighters[1].hp;
    for (let tick = 0; tick < 100 && s.fighters[1].hp === hp; tick++) step(s, [0, 0]);
    expect(s.fighters[1].hp).toBeLessThan(hp);
    expect(s.projectiles).toHaveLength(0);
    expect(advantage(s)).toBe(signed(nextGrabTick(s, 1) - nextGrabTick(s, 0)));
});
