import { describe, it, expect } from 'vitest';
import { A, FLOOR, createState, step, cpuInput, hashState, getMove, COMBAT_STYLES } from '../src/core';
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
        expect(cpuInput(s,1,1)).toBe(A.right);
    });
    it('reacts to a real delayed cast while its shot is still traveling, before first contact',()=>{
        const s=createState('vela','versus','rivet');
        s.fighters[0].x=100;s.fighters[1].x=600;
        step(s,[A.bolt,0]);for(let i=0;i<28;i++)step(s,[0,0]);
        expect(s.projectiles.length).toBeGreaterThan(0);expect(s.fighters[1].hp).toBe(1000);
        const memory=s.cpu![1];memory.decisionAt=s.frame-5;memory.choice=.99;
        for(const o of memory.observations)o.attackRoll=0;
        expect(cpuInput(s,1,1)).toBe(A.right);
        const guarded=structuredClone(s);
        for(let i=0;i<60;i++){
            step(s,[0,0]);step(guarded,[0,A.right|A.down]);
        }
        expect(s.fighters[1].hp).toBeLessThan(1000);
        expect(guarded.fighters[1].hp).toBe(1000);
    });
    it('never certifies a duck from current buttons when an earlier cast may have latched a low mouth',()=>{
        const s=setup('vela',500),o=s.cpu![1].observations[0];
        for(const input of [0,A.down]) {
            o.input=input;
            expect(cpuProjectileThreat(o,'vela',s.fighters[1],o.combatTick)).toMatchObject({incoming:true,duck:false});
        }
    });
    it('retains latched crouch-spit uncertainty after the attacker releases down in real play',()=>{
        const s=createState('vela','versus','rivet');s.fighters[0].x=100;s.fighters[1].x=600;
        step(s,[A.down|A.bolt,0]);for(let n=0;n<28;n++)step(s,[0,0]);
        expect(s.fighters[0].move?.aim).toBe('down');
        const o=s.cpu![1].observations.find(o=>o.frame>=s.frame-12)!;
        expect(o.input).toBe(0);expect(s.projectiles[0].y).toBe(FLOOR-85);
        expect(cpuProjectileThreat(o,'vela',s.fighters[1],s.cpu![1].combatTicks)).toMatchObject({incoming:true,duck:false});
    });
    it('expires beams by unfrozen clock and excludes shots already past the body',()=>{
        const s=setup(),o=s.cpu![1].observations[0];
        o.age=o.startup+12;expect(cpuProjectileThreat(o,'mox',s.fighters[1],o.combatTick).incoming).toBe(false);
        const shot=setup('vela',100),so=shot.cpu![1].observations[0];
        so.age=so.startup+80;expect(cpuProjectileThreat(so,'vela',shot.fighters[1],so.combatTick).incoming).toBe(false);
    });
    it('retains returning-shot threats rather than applying outbound straight-line expiry',()=>{
        const entry=Object.entries(COMBAT_STYLES).find(([,style])=>style.projectile.returnAt && style.projectile.horizontal);
        expect(entry).toBeDefined();
        const [id,style]=entry!;
        const s=setup(),o=s.cpu![1].observations[0];
        o.age=o.startup+style.projectile.returnAt!+8;
        expect(cpuProjectileThreat(o,id as keyof typeof COMBAT_STYLES,s.fighters[1],o.combatTick).incoming).toBe(true);
    });
    it('keeps the authored wide retainer shot threatening while its trailing edge overlaps',()=>{
        const [id,style]=Object.entries(COMBAT_STYLES).find(([,style])=>style.projectile.shape==='retain')!;
        const s=setup(),o=s.cpu![1].observations[0];
        const profile=style.projectile;
        o.age=o.startup+40;
        s.fighters[1].x=o.x+(profile.origin?.forward??34)+40*profile.speed-25-15;
        expect(cpuProjectileThreat(o,id as keyof typeof COMBAT_STYLES,s.fighters[1],o.combatTick).incoming).toBe(true);
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

describe('seeded learned instant-ray anticipation',()=>{
    const learned=()=>{
        const s=setup();s.cpu![1].choice=.1;
        for(const o of s.cpu![1].observations)Object.assign(o,{move:null,age:0,attacks:2,projectiles:2});
        return s;
    };
    it('uses only an already visible projectile-majority habit at delays too slow for the public startup',()=>{
        const s=learned();expect(cpuInput(s,1,4)).toBe(A.right|A.down);
        expect(cpuInput(s,1,1)).toBe(A.right|A.down);
        expect(cpuInput(s,1,7)).not.toBe(A.right|A.down);
        for(const o of s.cpu![1].observations){o.projectiles=0;o.attacks=0;}
        s.cpu![1].habits.projectiles=100;
        expect(cpuInput(s,1,4)).not.toBe(A.right|A.down);
    });
    it('respects seeded forecast intervals and is pure without observing a hidden new cast',()=>{
        const s=learned(),before=hashState(s);
        expect(cpuInput(s,1,4)).toBe(A.right|A.down);expect(hashState(s)).toBe(before);
        s.fighters[0].move={id:'bolt',t:17,connected:false,hit:false,wave:0};
        expect(cpuInput(s,1,4)).toBe(A.right|A.down);
        s.cpu![1].choice=.9;expect(cpuInput(s,1,4)).not.toBe(A.right|A.down);
    });
    it('does not extend instantaneous-ray anticipation to ordinary shots or unreachable rays',()=>{
        const s=learned();s.fighters[1].x=1000;expect(cpuInput(s,1,4)).not.toBe(A.right|A.down);
        s.fighters[1].x=500;s.fighters[0].id='vela';expect(cpuInput(s,1,4)).not.toBe(A.right|A.down);
    });
});
