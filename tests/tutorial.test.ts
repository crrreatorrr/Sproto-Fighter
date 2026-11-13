import { describe, expect, it } from 'vitest';
import { A, FLOOR, PLAYABLE_FIGHTERS, createState, grounded, hashState, step, type Action, type CombatState } from '../src/core';
import { TUTORIAL_CLEAR_FRAMES, TUTORIAL_LESSONS, TutorialCoach } from '../src/tutorial';
import { fighterMoves, sharedTechniques } from '../src/moveList';

const prompt = (action: Action) => action.toUpperCase();
/** A tutorial round as main sets it up: practice dummy, player kept alive with a full meter. */
function round(lesson = 0) {
    const s = createState('highsproto', 'dummy', 'vela'), coach = new TutorialCoach();
    s.godMode = true; s.fighters[0].pips = 3;
    coach.begin(); coach.skipTo(lesson);
    const frame = (player: number) => { step(s, [player, coach.input(s, player, 0)]); };
    const run = (frames: number, player: number | ((s: CombatState, n: number) => number) = 0) => {
        for (let n = 0; n < frames; n++) frame(typeof player === 'function' ? player(s, n) : player);
    };
    return { s, coach, run, done: () => coach.view(prompt).goals.map(goal => goal.done) };
}
/** Press once, then release: the simulation acts on fresh presses. */
const tap = (button: number, every: number) => (_: CombatState, n: number) => n % every === 0 ? button : 0;
const towards = (s: CombatState) => s.fighters[1].x > s.fighters[0].x ? A.right : A.left;
const gap = (s: CombatState) => Math.abs(s.fighters[1].x - s.fighters[0].x);

describe('tutorial lessons', () => {
    it('has the six lessons of the plan, each with a hint and at least one goal', () => {
        expect(TUTORIAL_LESSONS.map(lesson => lesson.title)).toEqual(['MOVE AND BLOCK', 'CHAIN TO A FINISHER', 'THROW AND TECH', 'DASH CANCEL', 'JUMP CANCEL AND QUICK RISE', 'TEAM SPECIAL']);
        for (const lesson of TUTORIAL_LESSONS) { expect(lesson.hint(prompt).length).toBeGreaterThan(20); expect(lesson.goals.length).toBeGreaterThan(0); }
    });
    it('never writes combat state: the coach only reads it and returns the dummy input', () => {
        const { s, coach } = round(0);
        for (let n = 0; n < 300; n++) {
            const before = hashState(s), input = coach.input(s, 0, 0);
            expect(hashState(s)).toBe(before);
            step(s, [n % 40 < 20 ? A.left : A.right, input]);
        }
    });
    it('lesson 1: walking, then two blocked jabs from the dummy', () => {
        const { s, run, done, coach } = round(0);
        run(30, A.right); run(30, A.left);
        expect(done()).toEqual([true, false]);
        // Holding away while the dummy walks in and jabs.
        run(900, s2 => s2.fighters[0].blockstun || gap(s2) < 150 ? A.left : 0);
        expect(coach.lesson > 0 || done()[1]).toBe(true);
        expect(s.fighters[0].hp).toBe(1000);
    });
    it('lesson 2: light, medium, finisher as one combo', () => {
        const { s, run, coach } = round(1);
        run(120, s2 => gap(s2) > 70 ? towards(s2) : 0);
        const chain = [A.light, A.medium, A.heavy];
        let index = 0, last: unknown = null;
        run(120, (s2, n) => { const f = s2.fighters[0]; if (f.move && f.move !== last) { last = f.move; index++; } return n % 2 && index < 3 ? chain[index] : 0; });
        expect(s.fighters[0].best).toBeGreaterThanOrEqual(3);
        expect(coach.view(prompt).cleared > 0 || coach.lesson > 1).toBe(true);
    });
    it('lesson 3: a throw, then a throw break against the dummy', () => {
        const { s, run, done, coach } = round(2);
        run(120, s2 => gap(s2) > 60 ? towards(s2) : 0);
        run(90, tap(A.grab, 30));
        expect(done()[0]).toBe(true);
        // Stand still; mash grab only once caught, which breaks the throw.
        run(900, s2 => s2.throwState?.phase === 'hold' && s2.throwState.victim === 0 && s2.throwState.t % 2 === 0 ? A.grab : 0);
        expect(coach.lesson > 2 || done()[1]).toBe(true);
    });
    it('lesson 4: a hit, a dash cancel, and another hit in the same combo', () => {
        const { s, run, coach } = round(3);
        run(120, s2 => gap(s2) > 70 ? towards(s2) : 0);
        run(200, (s2, n) => {
            const f = s2.fighters[0], press = (button: number) => n % 2 ? button : 0;
            if (f.combo === 0) return f.move ? 0 : press(A.light);
            if (!f.dashCanceled) return towards(s2) | press(A.dash);
            return press(A.medium);
        });
        expect(coach.view(prompt).cleared > 0 || coach.lesson > 3).toBe(true);
        expect(s.fighters[0].hp).toBe(1000);
    });
    it('lesson 5: a launcher chase, then a quick rise from the dummy sweep', () => {
        const { s, run, done, coach } = round(4);
        run(120, s2 => gap(s2) > 70 ? towards(s2) : 0);
        run(120, (s2, n) => { const f = s2.fighters[0]; return f.move?.id === 'launcher' ? (f.move.hitConfirmed ? A.up : 0) : !f.move && grounded(f) && n % 2 ? A.launcher : 0; });
        expect(done()[0]).toBe(true);
        // Crouch without blocking: the sweep lands, and Down is still held on landing.
        run(900, A.down);
        expect(coach.lesson > 4 || done()[1]).toBe(true);
    });
    it('lesson 6: the Team Special is charged and landing it finishes the tutorial', () => {
        const { s, run, coach } = round(5);
        run(60, s2 => gap(s2) > 200 ? towards(s2) : 0);
        expect(s.fighters[0].pips).toBe(3);
        run(120, tap(A.special, 60));
        expect(coach.view(prompt).cleared).toBeGreaterThan(0);
        run(TUTORIAL_CLEAR_FRAMES + 2);
        expect(coach.complete).toBe(true);
        expect(coach.input(s, 0, 0)).toBe(0);
    });
    it('keeps the dummy passive whenever the open goal needs no attack', () => {
        for (const lesson of [1, 3, 5]) {
            const { s, coach } = round(lesson);
            s.fighters[1].x = s.fighters[0].x + 70;
            for (let n = 0; n < 200; n++) expect(coach.input(s, 0, 0)).toBe(0);
            expect(s.fighters[1].y).toBe(FLOOR);
        }
    });
});

describe('pause move list', () => {
    it('lists every fighter with bindings, frame data and the Team Special by name', () => {
        for (const id of PLAYABLE_FIGHTERS.filter((_, index) => index % 9 === 0)) {
            const rows = fighterMoves(id, prompt);
            expect(rows.map(row => row.name.split(':')[0])).toEqual(['Light', 'Low jab', 'Medium', 'Finisher', 'Sweep', 'Launcher', 'Air attacks', 'Ranged', 'Throw', 'Team Special']);
            for (const row of rows) { expect(row.input.length).toBeGreaterThan(0); expect(row.detail).toMatch(/\d/); }
            expect(rows[0].input).toBe('LIGHT');
        }
    });
    it('teaches the shared techniques the fight screen never explains', () => {
        expect(sharedTechniques(prompt).map(row => row.name)).toEqual(['Block', 'Dash', 'Chain', 'Dash cancel', 'Jump cancel', 'Throw tech', 'Quick rise']);
    });
});
