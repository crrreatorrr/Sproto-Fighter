import { describe, expect, it } from 'vitest';
import { A, FLOOR, MOVES, createState, cpuInput, getHurtbox, getMove, hashState, step } from '../src/core';
import type { MoveId } from '../src/core';
function fresh(){
    const state=createState('rivet','versus','bront');
    for(let i=0;i<35;i++)step(state,[0,0]);
    state.fighters[0].x=500;state.fighters[1].x=560;
    for(const memory of state.cpu!)for(const observation of memory.observations){
        observation.x=state.fighters[0].x;observation.move=null;observation.shot=false;
    }
    return state;
}
function committed(id:MoveId,t=1){
    const state=fresh();state.fighters[1].move={id,t,hit:false,connected:false,wave:-1};return state;
}
describe('CPU stance during selected low commitment',()=>{
    for(const id of ['low','sweep'] as const)for(const skill of [1,4,7,10]){
        it(`holds only down through ${id} startup/active/recovery at skill ${skill}`,()=>{
            const state=committed(id),f=state.fighters[1],move=getMove(f,id);
            for(const age of [1,move.startup,move.startup+move.active,move.startup+move.active+move.recovery-1]){
                f.move!.t=age;expect(cpuInput(state,1,skill)).toBe(A.down);
            }
        });
    }
    for(const id of Object.keys(MOVES) as MoveId[]){
        it(`preserves airborne/other committed ${id} input`,()=>{
            const state=committed(id);
            state.fighters[1].y=FLOOR-20;expect(cpuInput(state,1,4)).toBe(0);
            if(id!=='low'&&id!=='sweep'){state.fighters[1].y=FLOOR;expect(cpuInput(state,1,4)).toBe(0);}
        });
    }
    it('retains connected-low combo cancels before the stance branch',()=>{
        const state=committed('low');state.fighters[1].move!.connected=true;state.cpu![1].comboRoll=0;
        expect(cpuInput(state,1,10)&A.medium).toBe(A.medium);
        expect(cpuInput(state,1,10)&A.down).toBe(0);
    });
    it('retains stun, guardstun, dummy and practice guard precedence',()=>{
        const state=committed('low');state.fighters[1].stun=2;expect(cpuInput(state,1,10)).toBe(0);
        state.fighters[1].stun=0;state.fighters[1].blockstun=3;
        expect(cpuInput(state,1,10)).toBe(A.right);
        state.mode='dummy';expect(cpuInput(state,1,10)).toBe(0);
        state.mode='guard';expect(cpuInput(state,1,10)).toBe(A.right);
    });
    it('ducks an actual five-frame high jab during low startup; releasing down is hit',()=>{
        const released=fresh(),held=fresh();
        expect(getMove(held.fighters[0],'light').startup).toBe(5);
        for(const state of [released,held]){
            step(state,[A.light,0]);step(state,[0,A.down|A.light]);
            expect(state.fighters[1].move?.id).toBe('low');
        }
        step(released,[0,0]);step(held,[0,cpuInput(held,1,4)]);
        expect(held.fighters[1].move?.t).toBe(2);
        expect(getHurtbox(held.fighters[1]).top).toBeGreaterThan(getHurtbox(released.fighters[1]).top);
        for(let i=0;i<3;i++){step(released,[0,0]);step(held,[0,cpuInput(held,1,4)]);}
        expect(released.fighters[1].hp).toBeLessThan(1000);
        expect(held.fighters[1].hp).toBe(1000);
    });
    it('keeps input reads pure including random state and rollback snapshots',()=>{
        const state=committed('sweep'),snapshot=structuredClone(state),before=hashState(state);
        for(let i=0;i<50;i++)expect(cpuInput(state,1,7)).toBe(A.down);
        expect(hashState(state)).toBe(before);expect(state).toEqual(snapshot);
    });
    it('replays CPU-selected stances using recorded masks only',()=>{
        const live=fresh(),replay=structuredClone(live);
        for(let i=0;i<1000&&live.winner===null;i++){
            const pair:[number,number]=i===0?[0,A.down|A.light]:[cpuInput(live,0,7),cpuInput(live,1,4)];
            step(live,pair);step(replay,pair);expect(hashState(replay)).toBe(hashState(live));
        }
    });
});
