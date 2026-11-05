import { describe, expect, it } from 'vitest';
import { A, BALANCE_KITS, COMBAT_STYLES, FLOOR, PLAYABLE_FIGHTERS, bodySpread, createState, cpuInput, hashState, step } from '../src/core';
import { advanceCpuState } from '../src/sim/cpu';

const meleeRoles=['Pressure','Footwork','Brawler','Weapon','Paired','Counter'] as const;
const roleActor=(role:string)=>PLAYABLE_FIGHTERS.find(id=>BALANCE_KITS[id].archetype===role && !COMBAT_STYLES[id].projectile.beamLength)!;
function fixture(actor=roleActor('Brawler'),gap=400,lead=0) {
    const state=createState(actor,'versus','vela');
    for(let i=0;i<35;i++)step(state,[0,0]);
    const f=state.fighters[0],p=state.fighters[1],memory=state.cpu![0];
    f.hp=900+Math.min(lead,0);p.hp=900-Math.max(lead,0);
    p.x=f.x+gap+bodySpread(f.id)+bodySpread(p.id);
    memory.choice=.4;memory.decisionAt=state.frame;memory.nextDecision=state.frame+20;
    for(const seen of memory.observations)Object.assign(seen,{x:p.x,y:FLOOR,hp:p.hp,move:null,input:0,shot:false,attacks:1,lows:0,projectiles:1});
    // One already-observed projectile causes the existing strategic label.
    advanceCpuState(state);if(gap>250)expect(memory.intent).toBe('zone');
    return state;
}

describe('own-kit interpretation of delayed zoning intent',()=>{
    for(const role of meleeRoles)for(const lead of [-100,0]){
        it(`${role} approaches ranged habits while ${lead<0?'behind':'tied'}`,()=>{
            const state=fixture(roleActor(role),400,lead);
            expect(cpuInput(state,0,4)).toBe(A.right);
            state.cpu![0].choice=.9;state.cpu![0].decisionAt=state.frame-5;
            expect(cpuInput(state,0,4)).toBe(A.right);
        });
    }
    it('does not retreat from an observed projectile habit at neutral range',()=>{
        const state=fixture(roleActor('Brawler'),280,-100);
        state.cpu![0].choice=.9;state.cpu![0].decisionAt=state.frame-5;
        expect(cpuInput(state,0,4)).toBe(A.right);
    });
    it('permits a meaningful delayed life lead, not a one-HP lead, to protect space',()=>{
        for(const lead of [1,99,100]){
            const state=fixture(roleActor('Brawler'),400,lead);
            state.cpu![0].choice=.9;state.cpu![0].decisionAt=state.frame-5;
            expect(cpuInput(state,0,4)).toBe(lead>=100?0:A.right);
        }
    });
    it('retains long-range zoning for Zoning and public beam profiles',()=>{
        for(const actor of [roleActor('Zoning'),PLAYABLE_FIGHTERS.find(id=>!!COMBAT_STYLES[id].projectile.beamLength)!]){
            const state=fixture(actor,400,-100);
            expect(cpuInput(state,0,4)).toBe(A.bolt);
            state.cpu![0].choice=.9;state.cpu![0].decisionAt=state.frame-5;
            expect(cpuInput(state,0,4)).toBe(0);
        }
    });
    it('reserves 20% neutral long-range bolt choices for melee kits and 65% for ranged kits',()=>{
        for(const [actor,expected] of [[roleActor('Brawler'),200],[roleActor('Zoning'),650]] as const){
            const state=fixture(actor);let bolts=0;
            for(let sample=0;sample<1000;sample++){
                state.cpu![0].choice=(sample+.5)/1000;
                if(cpuInput(state,0,4)&A.bolt)bolts++;
            }
            expect(bolts).toBe(expected);
        }
    });
    it('uses only delayed HP rather than the current unseen rival life lead',()=>{
        const state=fixture(roleActor('Brawler'),400,0);
        state.fighters[1].hp=100;state.cpu![0].choice=.9;state.cpu![0].decisionAt=state.frame-5;
        expect(cpuInput(state,0,4)).toBe(A.right);
    });
    it('keeps visible guard, projectile defense, blockstun and close jab/throw unchanged',()=>{
        const state=fixture(roleActor('Brawler'),100);
        const memory=state.cpu![0];
        for(const seen of memory.observations)Object.assign(seen,{move:'light',age:0,startup:5,active:3,recovery:10,attackRoll:0,combatTick:memory.combatTicks});
        expect(cpuInput(state,0,4)).toBe(A.left);
        for(const seen of memory.observations)Object.assign(seen,{move:null,shot:true});
        expect(cpuInput(state,0,4)).toBe(A.left);
        state.fighters[0].blockstun=3;expect(cpuInput(state,0,4)).toBe(A.left);
        state.fighters[0].blockstun=0;
        for(const seen of memory.observations)Object.assign(seen,{shot:false,x:state.fighters[0].x+60});
        memory.choice=.7;expect(cpuInput(state,0,4)).toBe(A.light);
        memory.choice=.95;expect(cpuInput(state,0,4)).toBe(A.grab);
    });
    it('preserves airborne long-range policy',()=>{
        const state=fixture();state.fighters[0].y=FLOOR-100;
        expect(cpuInput(state,0,4)).toBe(A.bolt);
    });
    it('never consumes RNG or mutates observations on repeated input reads',()=>{
        const state=fixture();const before=hashState(state);
        for(let i=0;i<20;i++)expect(cpuInput(state,0,4)).toBe(A.right);
        expect(hashState(state)).toBe(before);
    });
    it('replays from recorded inputs including policy memory and hitstop',()=>{
        const live=createState(roleActor('Brawler'),'versus','vela'),replay=createState(roleActor('Brawler'),'versus','vela');
        for(let frame=0;frame<1200 && live.winner===null;frame++){
            const inputs:[number,number]=[cpuInput(live,0,4),cpuInput(live,1,7)];
            step(live,inputs);step(replay,inputs);expect(hashState(replay)).toBe(hashState(live));
        }
    });
});
