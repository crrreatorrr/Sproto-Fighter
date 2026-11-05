import { describe, expect, it } from 'vitest';
import { A, createState, cpuInput, cpuTuning, hashState, loadState, saveState, step } from '../src/core';
import { createDifficultyRetry, storyDifficulty } from '../src/difficulty';
import { STORY_ENCOUNTERS } from '../src/storyProgress';

describe('seeded CPU controller', () => {
    const neutralRead = (gap = 80) => {
        const state=createState('rivet','cpu','vela');
        for(let frame=0;frame<35;frame++)step(state,[0,0]);
        state.fighters[1].x=state.fighters[0].x+gap;
        const memory=state.cpu![0];memory.choice=.1;memory.decisionAt=state.frame-5;
        memory.nextDecision=state.frame+8;memory.intent='pressure';
        for(const observation of memory.observations){
            observation.x=state.fighters[1].x;observation.move=null;observation.input=0;
            observation.low=false;observation.lowRoll=0;observation.attacks=2;observation.lows=0;
        }
        return state;
    };
    it('keeps reads pure and replays input masks without controller calls', () => {
        const played = createState('rivet', 'versus', 'vela'), replay = createState('rivet', 'versus', 'vela');
        for (let frame = 0; frame < 700 && played.winner === null; frame++) {
            const before = hashState(played);
            const pair: [number, number] = [cpuInput(played, 0, 7), cpuInput(played, 1, 4)];
            expect(cpuInput(played, 0, 7)).toBe(pair[0]);
            expect(hashState(played)).toBe(before);
            step(played, pair); step(replay, pair);
        }
        expect(hashState(replay)).toBe(hashState(played));
        expect(played.cpu![0].observations).toHaveLength(30);
    });
    it('restores queued observations, intent and RNG across rollback', () => {
        const state = createState('bront', 'versus', 'rivet');
        for (let n = 0; n < 120; n++) step(state, [cpuInput(state, 0, 1), cpuInput(state, 1, 10)]);
        const saved = saveState(state), hashes: number[] = [];
        for (let n = 0; n < 100; n++) { step(state, [cpuInput(state, 0, 1), cpuInput(state, 1, 10)]); hashes.push(hashState(state)); }
        loadState(state, saved);
        for (const hash of hashes) { step(state, [cpuInput(state, 0, 1), cpuInput(state, 1, 10)]); expect(hashState(state)).toBe(hash); }
    });
    it('interpolates each published skill anchor and clamps invalid input', () => {
        expect(cpuTuning(1)).toMatchObject({ reaction: 28, guard: .25, tech: 0, combo: .4 });
        expect(cpuTuning(4)).toMatchObject({ reaction: 18, guard: .5, tech: .2, combo: .7 });
        expect(cpuTuning(7)).toMatchObject({ reaction: 12, guard: .7, tech: .5, combo: .9 });
        expect(cpuTuning(10)).toMatchObject({ reaction: 8, guard: .85, tech: .75, combo: 1 });
        expect(cpuTuning(5.5).reaction).toBe(15);
        expect(cpuTuning(NaN).skill).toBe(4);
        expect(cpuTuning(20).skill).toBe(10);
    });
    it('recognizes a tech separately from visual delay and preserves practice modes', () => {
        const state = createState('rivet', 'cpu', 'vela');
        state.throwState = { attacker: 0, victim: 1, phase: 'hold', t: 3 } as any;
        state.cpu![1].throwRoll = .1;
        expect(cpuInput(state, 1, 1)).toBe(0);
        expect(cpuInput(state, 1, 10)).toBe(A.grab);
        state.mode = 'dummy'; expect(cpuInput(state, 1, 10)).toBe(0);
        state.mode = 'guard'; state.fighters[0].input = A.down;
        expect(cpuInput(state, 1, 10)).toBe(A.right | A.down);
    });
    it('does not mutate health, damage or meter to increase difficulty', () => {
        const state = createState('rivet', 'cpu', 'vela'), before = structuredClone(state.fighters);
        for (const skill of [1, 4, 7, 10]) cpuInput(state, 1, skill);
        expect(state.fighters).toEqual(before);
    });
    it('uses delayed facing for a cross-up and keeps guard during blockstun', () => {
        const state = createState('rivet','cpu','vela');
        for (let n=0;n<35;n++)step(state,[0,0]);
        state.fighters[1].x=200;
        state.cpu![0].decisionAt=state.frame-5;
        expect(cpuInput(state,0,4)).toBe(A.right);
        for (let n=0;n<18;n++)step(state,[0,0]);
        state.cpu![0].decisionAt=state.frame-5;
        expect(cpuInput(state,0,4)).toBe(A.left);
        state.fighters[0].blockstun=10;
        for(const observation of state.cpu![0].observations){observation.low=true;observation.lowRoll=0;}
        expect(cpuInput(state,0,4)).toBe(A.right|A.down);
    });
    it('anticipates learned pressure throughout a seeded guard interval without new attack information', () => {
        const state=neutralRead(),memory=state.cpu![0];
        memory.habits={attacks:2,lows:2,jumps:0,projectiles:0};
        for(const observation of memory.observations)observation.lows=2;
        for(let frame=0;frame<8;frame++){
            const before=hashState(state),input=cpuInput(state,0,1);
            expect(input).toBe(A.left|A.down);expect(cpuInput(state,0,1)).toBe(input);
            expect(hashState(state)).toBe(before);step(state,[input,0]);
        }
    });
    it('does not anticipate attacks from habit counts still hidden behind the reaction queue', () => {
        const state=neutralRead(90),memory=state.cpu![0];
        for(const observation of memory.observations){observation.attacks=0;observation.lows=0;}
        memory.habits.attacks=100;memory.habits.lows=100;
        expect(cpuInput(state,0,4)).toBe(A.right);
    });
    it('buffers a tactile punish at guard recovery, not during the committed part of blockstun', () => {
        const state=neutralRead();state.fighters[0].blockstun=8;
        expect(cpuInput(state,0,4)&A.light).toBe(0);
        state.fighters[0].blockstun=2;expect(cpuInput(state,0,4)).toBe(A.left|A.light);
        expect(cpuInput(state,0,1)&A.light).toBe(0);
    });
    it('does not treat a delayed opening as fresh after its observed commitment expires', () => {
        const state=neutralRead();
        for(const observation of state.cpu![0].observations){
            observation.move='light';observation.age=1;observation.startup=5;observation.active=4;observation.recovery=11;
        }
        expect(cpuInput(state,0,4)).toBe(A.left);
    });
    it('closes a seeded throw read beyond jab spacing and commits when in legal grab reach', () => {
        const state=neutralRead(76),memory=state.cpu![0];memory.choice=.95;
        expect(cpuInput(state,0,4)).toBe(A.right);
        state.fighters[1].x=state.fighters[0].x+66;
        for(const observation of memory.observations)observation.x=state.fighters[1].x;
        expect(cpuInput(state,0,4)).toBe(A.grab);
    });
    it('takes initiative when a pressure plan is already in jab range', () => {
        const state=neutralRead(70);state.cpu![0].choice=.6;
        expect(cpuInput(state,0,4)).toBe(A.light);
    });
});

describe('story difficulty and optional retry', () => {
    it('uses the actual route and reaches skill ten without unmarked jumps', () => {
        const skills = STORY_ENCOUNTERS.map(encounter => storyDifficulty(encounter, STORY_ENCOUNTERS));
        expect(skills[0]).toBe(1); expect(skills.at(-1)).toBe(10);
        for (let n = 1; n < skills.length; n++) {
            expect(skills[n]).toBeGreaterThanOrEqual(skills[n - 1]);
            const marked = !!STORY_ENCOUNTERS[n].gauntlet || n >= STORY_ENCOUNTERS.length - 15;
            expect(skills[n] - skills[n - 1]).toBeLessThan(marked ? 1.5 : .2);
        }
        expect(storyDifficulty(STORY_ENCOUNTERS.at(-1)!, STORY_ENCOUNTERS, true)).toBe(9);
    });
    it('offers help after three losses, never activates it, and resets on another encounter or a draw', () => {
        const retry = createDifficultyRetry();retry.begin('first');
        for (let n = 0; n < 2; n++) retry.record('first', 1);
        expect(retry.offered('first')).toBe(false);
        retry.record('first', 1);expect(retry.offered('first')).toBe(true);
        retry.record('first', 2);expect(retry.offered('first')).toBe(false);
        for (let n = 0; n < 3; n++) retry.record('first', 1);
        retry.begin('second');expect(retry.offered('first')).toBe(false);expect(retry.snapshot().losses).toBe(0);
    });
    it('counts complete gauntlet losses despite winning the first bout on each attempt', () => {
        const retry = createDifficultyRetry();
        for (let attempt = 0; attempt < 3; attempt++) {
            retry.begin('gauntlet');retry.record('gauntlet',0,false);retry.record('gauntlet',1);
        }
        expect(retry.offered('gauntlet')).toBe(true);
        retry.record('gauntlet',0,true);expect(retry.offered('gauntlet')).toBe(false);
    });
});
