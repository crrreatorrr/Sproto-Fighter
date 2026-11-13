import { describe, expect, it } from 'vitest';
import { A, ALL_INPUTS, FLOOR, GETUP_FRAMES, createState, enableMatchDepth, getHitbox, getHurtbox, getMove, step } from '../src/core';
import { beginThrow, damage } from '../src/sim/combat';
import { clashProjectiles, getProjectileHitbox, rectanglesOverlap } from '../src/sim/geometry';
import type { CombatState, Projectile } from '../src/core';

const fresh = () => {
    const s = createState('rivet', 'versus', 'bront');
    s.fighters[0].x = 500; s.fighters[1].x = 560;
    return s;
};
const attack = (s: CombatState, id: 'light' | 'medium' | 'heavy' | 'low' | 'launcher', t?: number) => {
    const f = s.fighters[0];
    f.move = { id, t: t ?? getMove(f, id).startup - 1, hit: false, connected: false, wave: -1 };
};
const hold = () => {
    const s = fresh(), a = s.fighters[0];
    a.move = { id: 'grab', t: 6, hit: false, connected: false, wave: -1 };
    beginThrow(s, 0);
    expect(s.throwState?.phase).toBe('hold');
    return s;
};
const shot = (owner: number, x = 640, y = FLOOR - 70): Projectile => ({ owner, x, y, vx: 0, vy: 0, life: 10, damage: 50 });

describe('numeric hitboxes and hurtboxes', () => {
    it('lets crouch duck a high light, while standing is hit', () => {
        const standing = fresh(); attack(standing, 'light'); step(standing, [0, 0]);
        expect(standing.fighters[1].hp).toBeLessThan(1000);
        const crouched = fresh(); attack(crouched, 'light'); step(crouched, [0, A.down]);
        expect(crouched.fighters[1].hp).toBe(1000);
    });
    it('requires low guard for a low attack', () => {
        const highGuard = fresh(); attack(highGuard, 'low'); step(highGuard, [0, A.right]);
        expect(highGuard.fighters[1].hp).toBeLessThan(1000);
        const lowGuard = fresh(); attack(lowGuard, 'low'); step(lowGuard, [0, A.right | A.down]);
        expect(lowGuard.fighters[1].hp).toBe(1000);
        expect(lowGuard.fighters[1].blockstun).toBe(10);
    });
    it('extends the exposed limb through recovery, allowing a farther punish', () => {
        const s = fresh(), [a, b] = s.fighters;
        b.x = 610; b.facing = -1;
        const light = getMove(a, 'light');
        expect(rectanglesOverlap(getHitbox(a, 'light', light), getHurtbox(b))).toBe(false);
        b.move = { id: 'heavy', t: 25, hit: false, connected: false, wave: -1 };
        expect(rectanglesOverlap(getHitbox(a, 'light', light), getHurtbox(b, getMove(b, 'heavy')))).toBe(true);
        attack(s, 'light'); step(s, [0, 0]);
        expect(b.hp).toBeLessThan(1000);
    });
    it('lets launchers intercept a raised airborne hurtbox', () => {
        const s = fresh(); s.fighters[1].y = FLOOR - 120; s.fighters[1].vy = 0;
        attack(s, 'launcher'); step(s, [0, 0]);
        expect(s.fighters[1].hp).toBeLessThan(1000);
    });
    it('mirrors rectangles without changing reach or vertical coordinates', () => {
        const s = fresh(), a = s.fighters[0], m = getMove(a, 'heavy');
        const right = getHitbox(a, 'heavy', m); a.facing = -1;
        const left = getHitbox(a, 'heavy', m);
        expect(left.left).toBe(2 * a.x - right.right);
        expect(left.right).toBe(2 * a.x - right.left);
        expect(left.top).toBe(right.top);
    });
    it('lets same-frame active limbs trade without a seat-order advantage', () => {
        const s = fresh(); s.fighters[1].x = 600;
        for (const f of s.fighters) f.move = { id: 'light', t: getMove(f, 'light').startup - 1, hit: false, connected: false, wave: -1 };
        step(s, [0, 0]);
        expect(s.fighters[0].hp).toBeLessThan(1000);
        expect(s.fighters[1].hp).toBeLessThan(1000);
    });
});

describe('Block button', () => {
    it('guards like holding away, without any direction held', () => {
        const blocked = fresh(); attack(blocked, 'light'); step(blocked, [0, A.block]);
        expect(blocked.fighters[1].hp).toBe(1000);
        expect(blocked.fighters[1].blockstun).toBeGreaterThan(0);
        const open = fresh(); attack(open, 'light'); step(open, [0, 0]);
        expect(open.fighters[1].hp).toBeLessThan(1000);
    });
    it('guards even while holding toward the rival, and stands still instead of walking in', () => {
        const s = fresh(); attack(s, 'light'); step(s, [0, A.left | A.block]);
        expect(s.fighters[1].hp).toBe(1000);
        const still = fresh(), b = still.fighters[1], x = b.x;
        for (let i = 0; i < 20; i++) step(still, [0, A.left | A.block]);
        expect(b.x).toBe(x);
        const walking = fresh();
        for (let i = 0; i < 20; i++) step(walking, [0, A.left]);
        expect(walking.fighters[1].x).toBeLessThan(x);
    });
    it('needs crouch against lows, like holding away', () => {
        const high = fresh(); attack(high, 'low'); step(high, [0, A.block]);
        expect(high.fighters[1].hp).toBeLessThan(1000);
        const low = fresh(); attack(low, 'low'); step(low, [0, A.block | A.down]);
        expect(low.fighters[1].hp).toBe(1000);
    });
    it('cannot guard while attacking, and stops a run', () => {
        const busy = fresh(), b = busy.fighters[1];
        attack(busy, 'light');
        b.move = { id: 'light', t: 0, hit: false, connected: false, wave: -1 };
        step(busy, [0, A.block]);
        expect(b.hp).toBeLessThan(1000);
        const run = createState('rivet', 'versus', 'bront'), f = run.fighters[0];
        f.x = 300; run.fighters[1].x = 900;
        for (let i = 0; i < 20; i++) step(run, [A.right | A.dash, 0]);
        expect(f.runDirection).toBe(1);
        step(run, [A.right | A.dash | A.block, 0]);
        expect(f.runDirection).toBe(0);
    });
    it('starts a just defend the frame it is pressed, and survives the specials-only rule', () => {
        const s = createState('rivet', 'versus', 'bront'); enableMatchDepth(s, { modifier: 'specials-only' });
        s.fighters[0].x = 500; s.fighters[1].x = 560;
        step(s, [0, A.block]);
        expect(s.matchDepth!.backPressed[1]).toBe(s.frame);
        expect(s.fighters[1].input & A.block).toBeTruthy();
    });
    it('is a valid input bit for match logs', () => {
        expect(ALL_INPUTS).toBe(8191);
        expect(ALL_INPUTS & A.block).toBe(A.block);
    });
});

describe('defensive decisions', () => {
    it('gives heavy and light distinct blockstun and applies nonlethal 12% chip', () => {
        const s = fresh(), b = s.fighters[1]; b.input = A.right;
        const heavy = getMove(s.fighters[0], 'heavy');
        damage(s, 0, heavy, 'heavy');
        expect(b.blockstun).toBe(18); expect(b.hp).toBe(1000 - Math.round(heavy.damage * .12));
        b.hp = 1; damage(s, 0, heavy, 'heavy'); expect(b.hp).toBe(1);
        s.chipKO = true; damage(s, 0, heavy, 'heavy'); expect(b.hp).toBe(0);
    });
    it('allows Team Special guard while retaining active caster immunity', () => {
        const s = fresh(); s.fighters[1].input = A.right;
        damage(s, 0, { ...getMove(s.fighters[0], 'special'), low: false }, 'special');
        expect(s.fighters[1].blockstun).toBe(18);
        const protectedState = fresh();
        protectedState.fighters[1].move = { id: 'special', t: 0, hit: false, connected: false, wave: -1 };
        attack(protectedState, 'heavy'); step(protectedState, [0, 0]);
        expect(protectedState.fighters[1].hp).toBe(1000);
    });
    it('breaks a fresh catch on new grab press, with no damage and outward push', () => {
        const s = hold(); step(s, [0, A.grab]);
        expect(s.throwState).toBeNull(); expect(s.fighters.map(f => f.hp)).toEqual([1000, 1000]);
        expect(s.fighters[0].vx).toBeLessThan(0); expect(s.fighters[1].vx).toBeGreaterThan(0);
    });
    it('accepts the seventh catch tick but rejects the eighth and held grab', () => {
        const last = hold(); last.throwState!.t = 6; step(last, [0, A.grab]); expect(last.throwState).toBeNull();
        const late = hold(); late.throwState!.t = 7; step(late, [0, A.grab]); expect(late.throwState?.phase).toBe('hold');
        const held = hold(); held.fighters[1].prev = A.grab; step(held, [0, A.grab]); expect(held.throwState?.phase).toBe('hold');
    });
    it('discards both catch inputs symmetrically when either seat breaks', () => {
        for (const victim of [0, 1]) {
            const s = fresh(), attacker = 1 - victim, f = s.fighters[attacker];
            f.move = { id: 'grab', t: 6, hit: false, connected: false, wave: -1 };
            beginThrow(s, attacker);
            const inputs: [number, number] = [0, 0];
            inputs[victim] = A.grab; inputs[attacker] = A.light;
            step(s, inputs);
            expect(s.throwState).toBeNull();
            expect(s.fighters.map(x => x.buffer)).toEqual([0, 0]);
            for (let i = 0; i < 13; i++) step(s, [0, 0]);
            expect(s.fighters.map(x => x.move)).toEqual([null, null]);
        }
    });
    it('grants exactly three strike-protected simulation ticks on rise', () => {
        const s = fresh(), b = s.fighters[1];
        b.reaction = { kind: 'knockdown', phase: 'rise', t: GETUP_FRAMES - 1, direction: 1 };
        b.stun = 1; step(s, [0, 0]);
        expect(b.strikeInvuln).toBe(3); expect(b.throwInvuln).toBe(12);
        for (let n = 0; n < 3; n++) {
            expect(damage(s, 0, getMove(s.fighters[0], 'light'), 'light')).toBe(false);
            s.freeze = 0; step(s, [0, 0]);
        }
        expect(b.strikeInvuln).toBe(0);
        expect(damage(s, 0, getMove(s.fighters[0], 'light'), 'light')).toBe(true);
    });
});

describe('projectile geometry and clashes', () => {
    it('cancels opposing shots before fighter collision, preserving allied shots', () => {
        const s = fresh(); s.fighters[0].x = 400; s.fighters[1].x = 900;
        s.projectiles = [shot(0), shot(1)]; step(s, [0, 0]);
        expect(s.projectiles).toHaveLength(0);
        const allies = [shot(0), shot(0)]; clashProjectiles(allies);
        expect(allies.every(p => p.life > 0)).toBe(true);
    });
    it('lets beams beat shots, while two opposing beams cancel', () => {
        const beam = { ...shot(0, 600), beamLength: 200, beamDirection: 1 };
        const opposing = shot(1); clashProjectiles([beam, opposing]);
        expect(beam.life).toBe(10); expect(opposing.life).toBe(0);
        const otherBeam = { ...shot(1, 700), beamLength: 200, beamDirection: -1 };
        clashProjectiles([beam, otherBeam]); expect(beam.life).toBe(0); expect(otherBeam.life).toBe(0);
    });
    it('uses the same state hurtbox to duck high shots and meet low shots', () => {
        const s = fresh(), b = s.fighters[1]; b.input = A.down;
        expect(rectanglesOverlap(getProjectileHitbox(shot(0, b.x, FLOOR - 130)), getHurtbox(b))).toBe(false);
        expect(rectanglesOverlap(getProjectileHitbox(shot(0, b.x, FLOOR - 40)), getHurtbox(b))).toBe(true);
    });
});
