import { describe, expect, it } from 'vitest';
import { A, COMBAT_STYLES, FLOOR, PLAYABLE_FIGHTERS, archetypeFor, bodySpread, createState, cpuInput, cpuTuning, getMove, hashState, isPairedFighter, step } from '../src/core';

const actors=(['Brawler','Paired'] as const).map(role=>PLAYABLE_FIGHTERS.find(id=>archetypeFor(COMBAT_STYLES[id].role,isPairedFighter(id))===role)!);
function fixture(id:typeof actors[number],skill=7,variant=.1){
    const state=createState(id,'versus','rivet');
    for(let frame=0;frame<35;frame++)step(state,[0,0]);
    const f=state.fighters[0],memory=state.cpu![0];
    const highGap=getMove(f,'light').range-bodySpread(id)-4,lowGap=getMove(f,'low').range-bodySpread(id)-4;
    expect(lowGap).toBeGreaterThan(highGap);
    const gap=(highGap+lowGap)/2;
    state.fighters[1].x=f.x+bodySpread(id)+bodySpread(state.fighters[1].id)+gap;
    const lower=cpuTuning(skill).guard*.84*.9;
    memory.choice=lower+variant*(.84-lower);memory.intent='defend';memory.decisionAt=state.frame-5;
    for(const seen of memory.observations){
        seen.x=state.fighters[1].x;seen.y=FLOOR;seen.move=null;seen.input=0;
        seen.attacks=2;seen.lows=0;seen.shot=false;seen.low=false;seen.lowRoll=1;
    }
    return {state,highGap,lowGap};
}
describe('range belongs to the selected neutral attack',()=>{
    for(const id of actors)for(const skill of [1,4,7,10]){
        it(`${id} skill ${skill} uses a selected low before entering high-jab range`,()=>{
            const {state}=fixture(id,skill);const before=hashState(state);
            expect(cpuInput(state,0,skill)).toBe(A.down|A.light);
            expect(hashState(state)).toBe(before);
        });
    }
    it('the selected low really connects through the ordinary simulation at that spacing',()=>{
        for(const id of actors){
            const {state}=fixture(id);const input=cpuInput(state,0,7),before=state.fighters[1].hp;
            step(state,[input,0]);expect(state.fighters[0].move?.id).toBe('low');
            for(let frame=0;frame<15;frame++)step(state,[0,0]);
            expect(state.fighters[1].hp).toBeLessThan(before);
        }
    });
    it('continues approaching when the chosen high jab is out of reach',()=>{
        for(const id of actors)expect(cpuInput(fixture(id,7,.6).state,0,7)).toBe(A.right);
    });
    it('does not move guard or throw-read boundaries',()=>{
        for(const id of actors){
            const {state}=fixture(id),memory=state.cpu![0];
            memory.choice=cpuTuning(7).guard*.84*.9/2;expect(cpuInput(state,0,7)).toBe(A.left);
            memory.choice=.92;expect(cpuInput(state,0,7)).toBe(A.right);
        }
    });
    it('preserves confirmed-combo movement rather than reusing an unrelated low plan',()=>{
        const {state}=fixture(actors[0]);state.fighters[0].move={id:'light',t:6,hit:true,connected:true,wave:-1};
        state.fighters[0].combo=1;state.cpu![0].comboRoll=0;
        expect(cpuInput(state,0,7)).toBe(A.right|A.medium);
    });
    it('does not grant airborne jabs the ground low reach',()=>{
        const {state}=fixture(actors[0]);state.fighters[0].y=FLOOR-100;
        expect(cpuInput(state,0,7)).toBe(A.right);
    });
    it('preserves input-only replay with reachable low choices',()=>{
        const live=createState(actors[0],'versus',actors[1]),replay=createState(actors[0],'versus',actors[1]);
        for(let frame=0;frame<1000 && live.winner===null;frame++){
            const pair:[number,number]=[cpuInput(live,0,4),cpuInput(live,1,7)];step(live,pair);step(replay,pair);
        }
        expect(hashState(replay)).toBe(hashState(live));
    });
});
