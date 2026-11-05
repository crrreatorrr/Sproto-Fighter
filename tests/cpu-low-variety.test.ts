import { describe, expect, it } from 'vitest';
import { A, FLOOR, createState, cpuInput, cpuTuning, hashState, step } from '../src/core';

function neutralPressure(lowHabit=false) {
    const state=createState('rivet','versus','vela');
    for(let frame=0;frame<35;frame++)step(state,[0,0]);
    state.fighters[1].x=state.fighters[0].x+66;
    const memory=state.cpu![0];memory.intent='defend';memory.decisionAt=state.frame-5;
    for(const observation of memory.observations){
        observation.x=state.fighters[1].x;observation.y=FLOOR;
        observation.move=null;observation.input=0;observation.shot=false;
        observation.attacks=2;observation.lows=lowHabit?2:0;
        observation.low=false;observation.lowRoll=1;
    }
    return state;
}

describe('low variety within a selected neutral jab plan',()=>{
    for(const skill of [1,4,7,10])for(const lowHabit of [false,true])for(const intent of ['defend','pressure'] as const){
        it(`keeps one quarter of jab decisions low at skill ${skill}, low habit ${lowHabit}, label ${intent}`,()=>{
            const state=neutralPressure(lowHabit),memory=state.cpu![0];
            memory.intent=intent;
            const grabShare=lowHabit?.30:.16;
            const lower=cpuTuning(skill).guard*(1-grabShare)*.9,upper=1-grabShare;
            let lows=0,highs=0;
            for(let sample=0;sample<400;sample++){
                memory.choice=lower+(sample+.5)/400*(upper-lower);
                const input=cpuInput(state,0,skill);
                expect(input&A.light).toBe(A.light);expect(input&A.grab).toBe(0);
                if(input&A.down)lows++;else highs++;
            }
            expect(lows).toBe(100);expect(highs).toBe(300);
        });
    }
    it('does not move guard or throw boundaries and never consumes state on a read',()=>{
        for(const skill of [1,4,7,10]){
            const state=neutralPressure(),memory=state.cpu![0];
            const guardShare=cpuTuning(skill).guard*.84*.9;
            memory.choice=guardShare/2;
            const before=hashState(state);expect(cpuInput(state,0,skill)).toBe(A.left);expect(hashState(state)).toBe(before);
            memory.choice=.92;const after=hashState(state);
            expect(cpuInput(state,0,skill)).toBe(A.grab);expect(hashState(state)).toBe(after);
        }
    });
    it('preserves airborne attack variants outside grounded low selection',()=>{
        const state=neutralPressure(),memory=state.cpu![0];state.fighters[0].y=FLOOR-100;
        memory.choice=.4;expect(cpuInput(state,0,4)).toBe(A.light);
        for(const observation of memory.observations)observation.attacks=0;
        memory.intent='pressure';memory.choice=.1;memory.decisionAt=state.frame;
        expect(cpuInput(state,0,4)).toBe(A.down|A.light);
    });
    it('preserves earlier off-plan jab behavior before pressure habits are known',()=>{
        const state=neutralPressure(),memory=state.cpu![0];
        for(const observation of memory.observations)observation.attacks=0;
        memory.choice=.1;memory.decisionAt=state.frame;memory.intent='pressure';
        expect(cpuInput(state,0,10)).toBe(A.down|A.light);
        memory.intent='defend';expect(cpuInput(state,0,10)).toBe(A.light);
    });
    it('replays grounded low/high choices from the same recorded inputs',()=>{
        const live=createState('rivet','versus','vela'),replay=createState('rivet','versus','vela');
        for(let frame=0;frame<1000 && live.winner===null;frame++){
            const pair:[number,number]=[cpuInput(live,0,7),cpuInput(live,1,10)];
            step(live,pair);step(replay,pair);
        }
        expect(hashState(replay)).toBe(hashState(live));
    });
});
