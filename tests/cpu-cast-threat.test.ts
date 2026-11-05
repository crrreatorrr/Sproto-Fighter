import { describe, it, expect } from 'vitest';
import { A, FLOOR, createState, step, cpuInput, hashState, getMove } from '../src/core';
import { cpuProjectileThreat } from '../src/sim/cpu';
import type { CpuObservation } from '../src/sim/types';
function setup(id: 'mox'|'vela'|'rivet'='mox', gap=400) {
    const s=createState(id,'versus','rivet');
    for(let i=0;i<35;i++)step(s,[0,0]);
    s.fighters[0].x=100;s.fighters[1].x=100+gap;
    const m=getMove(s.fighters[0],'bolt'), memory=s.cpu![1];
    memory.choice=.99;memory.decisionAt=s.frame-5;
    for(const o of memory.observations)Object.assign(o,{x:100,y:FLOOR,move:'bolt',age:0,startup:m.startup,active:m.active,recovery:m.recovery,input:0,attackRoll:0,attacks:1,projectiles:1,low:false});
    return s;
}
describe('delayed public-profile projectile threats',()=>{
    it('recognizes a long beam at400 and ducks only the certified high lane',()=>{
        const s=setup();
        expect(cpuInput(s,1,7)).toBe(A.right|A.down);
        s.fighters[1].x=760;expect(cpuInput(s,1,7)).not.toBe(A.right|A.down);
    });
    it('uses attack-roll guard anchor without rerolling or modifying state',()=>{
        const s=setup(),before=hashState(s);
        expect(cpuInput(s,1,7)).toBe(A.right|A.down);expect(hashState(s)).toBe(before);
        for(const o of s.cpu![1].observations)o.attackRoll=.71;
        expect(cpuInput(s,1,7)).not.toBe(A.right|A.down);
    });
    it('keeps a traveling shot threatening after the emission active window',()=>{
        const s=setup('vela',500),o=s.cpu![1].observations.find(o=>o.frame>=s.frame-28)!;
        o.age=o.startup+o.active+2;
        expect(cpuProjectileThreat(o,'vela',s.fighters[1],s.cpu![1].combatTicks).incoming).toBe(true);
        expect(cpuInput(s,1,1)).toBe(A.right|A.down);
    });
    it('expires beams by unfrozen clock and excludes shots already past the body',()=>{
        const s=setup(),o=s.cpu![1].observations[0];
        o.age=o.startup+12;expect(cpuProjectileThreat(o,'mox',s.fighters[1],o.combatTick).incoming).toBe(false);
        const shot=setup('vela',100),so=shot.cpu![1].observations[0];
        so.age=so.startup+80;expect(cpuProjectileThreat(so,'vela',shot.fighters[1],so.combatTick).incoming).toBe(false);
    });
    it('ignores fresh enemy position, input, move, projectile arrays and unobserved habits',()=>{
        const s=setup(),before=cpuInput(s,1,7);
        Object.assign(s.fighters[0],{x:900,y:100,input:A.down,move:null});s.projectiles=[];
        s.cpu![1].habits.projectiles=1000;
        expect(cpuInput(s,1,7)).toBe(before);
    });
    it('does not invent a cast from an unobserved current rival attack',()=>{
        const s=setup();for(const o of s.cpu![1].observations){o.move=null;o.attacks=0;o.projectiles=0;}
        s.fighters[0].move={id:'bolt',t:17,hit:false,connected:false,wave:0};
        expect(cpuInput(s,1,7)).not.toBe(A.right|A.down);
    });
    it('does not claim safe duck for uncertified default or airborne lanes',()=>{
        const s=setup('rivet'),o=s.cpu![1].observations[0];
        expect(cpuProjectileThreat(o,'rivet',s.fighters[1],o.combatTick).duck).toBe(false);
        const high=setup(),ho=high.cpu![1].observations[0];ho.y=FLOOR-20;
        expect(cpuProjectileThreat(ho,'mox',high.fighters[1],ho.combatTick).duck).toBe(false);
    });
    it('mirrors beam defense across seats and preserves reaction delay',()=>{
        const s=setup();s.fighters[1].x=100;
        for(const o of s.cpu![1].observations)o.x=500;
        expect(cpuInput(s,1,7)).toBe(A.left|A.down);
        s.frame=5;expect(cpuInput(s,1,7)).toBe(0);
    });
});
