import { expect, it } from 'vitest';
import { A, createState, cpuInput, hashState, step } from '../src/core';

it('starts neutral movement from public spawn without opening attack or an idle reaction tax',()=>{
    for(const skill of [1,4,7,10]){
        const state=createState('rivet','versus','vela');
        expect(cpuInput(state,0,skill)).toBe(A.right);expect(cpuInput(state,1,skill)).toBe(A.left);
    }
});
it('does not expose post-start position, velocity, input or attacks through its known spawn',()=>{
    const state=createState('rivet','versus','vela'),before=hashState(state);
    expect(cpuInput(state,0,1)).toBe(A.right);expect(hashState(state)).toBe(before);
    state.fighters[1].x=150;state.fighters[1].vx=-15;state.fighters[1].input=A.light;
    state.fighters[1].move={id:'light',t:0,hit:false,connected:false,wave:-1};
    expect(cpuInput(state,0,1)).toBe(A.right);
    expect(state.cpu![0].observations[0].x).toBe(900);
});
it('keeps post-start observations delayed by the published reaction time',()=>{
    const state=createState('rivet','versus','vela');
    state.fighters[1].x=160;state.fighters[1].vx=0;
    for(let frame=0;frame<28;frame++){
        expect(cpuInput(state,0,1)).toBe(A.right);step(state,[0,0]);
    }
    // At frame28 the known frame0 sample still precedes the first post-start sample.
    expect(cpuInput(state,0,1)).toBe(A.right);step(state,[0,0]);
    expect(state.cpu![0].observations.find(observation=>observation.frame>=state.frame-28)?.knownSpawn).not.toBe(true);
    expect(cpuInput(state,0,1)&A.right).toBe(0);
});
it('reproduces primed controller state from inputs alone throughout the opening',()=>{
    const played=createState('bront','versus','stonkyleg69'),replay=createState('bront','versus','stonkyleg69');
    for(let frame=0;frame<350 && played.winner===null;frame++){
        const pair:[number,number]=[cpuInput(played,0,1),cpuInput(played,1,7)];
        step(played,pair);step(replay,pair);expect(hashState(replay)).toBe(hashState(played));
    }
});
