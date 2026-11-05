import { describe, expect, it } from 'vitest';
import { A, COMBAT_STYLES, FLOOR, PLAYABLE_FIGHTERS, ROSTER, WIDTH, createState, cpuInput, getMove, hashState, step } from '../src/core';
import { cpuCastHasLane, cpuTrackingBounds, projectCpuMotion } from '../src/sim/cpuTracking';
import { getProjectileOrigin } from '../src/sim/projectileOrigin';

function movingApproach() {
    const state=createState('bront','versus','stonkyleg69');
    state.fighters[0].x=200;state.fighters[1].x=1080;
    for(let frame=0;frame<35;frame++)step(state,[A.right,A.left]);
    return state;
}
function perceivedAt(state:ReturnType<typeof createState>,slot:0|1,delay=18) {
    return state.cpu![slot].observations.find(observation=>observation.frame>=state.frame-delay)!;
}

describe('delayed CPU motion tracking',()=>{
    it('removes stale-position distance error during known unequal-speed approach',()=>{
        const state=movingApproach(),self=state.fighters[0],target=state.fighters[1],seen=perceivedAt(state,0);
        expect(ROSTER[target.id].speed).toBeGreaterThan(ROSTER[self.id].speed);
        const staleGap=seen.x-self.x;
        const tracked=projectCpuMotion(seen,state.cpu![0].combatTicks-seen.combatTick,cpuTrackingBounds(self,target.id));
        expect(staleGap-(target.x-self.x)).toBeGreaterThan(70);
        expect(tracked.x).toBeCloseTo(target.x,9);
    });
    it('does not peek at a newly changed velocity, direction or position',()=>{
        const state=movingApproach(),before=cpuInput(state,0,4);
        const oldSeen=structuredClone(perceivedAt(state,0));
        state.fighters[1].x+=80;state.fighters[1].vx=12;state.fighters[1].input=A.right;
        const unchanged=hashState(state);
        expect(cpuInput(state,0,4)).toBe(before);expect(hashState(state)).toBe(unchanged);
        expect(perceivedAt(state,0)).toEqual(oldSeen);
    });
    it('keeps a direction reversal hidden for the full visual reaction delay',()=>{
        const control=movingApproach(),changed=structuredClone(control);
        changed.fighters[1].vx=ROSTER[changed.fighters[1].id].speed;
        for(let frame=0;frame<17;frame++){
            step(control,[0,A.left]);step(changed,[0,A.right]);
            expect(cpuInput(changed,0,4)).toBe(cpuInput(control,0,4));
        }
        expect(perceivedAt(changed,0).vx).toBeLessThan(0);
        step(changed,[0,A.right]);expect(perceivedAt(changed,0).vx).toBeGreaterThan(0);
    });
    it('bounds known grounded continuation by walls and occupied body space',()=>{
        const state=movingApproach(),f=state.fighters[0],id=state.fighters[1].id,seen=structuredClone(perceivedAt(state,0));
        seen.x=f.x+200;seen.vx=-20;seen.vxDamping=1;seen.y=FLOOR;
        const bounds=cpuTrackingBounds(f,id),near=projectCpuMotion(seen,30,bounds);
        expect(near.x).toBe(f.x+bounds.minimumGap);expect(near.vx).toBe(0);
        seen.vx=20;const far=projectCpuMotion(seen,100,bounds);
        expect(far.x).toBe(WIDTH-bounds.wall);expect(far.vx).toBe(0);
        seen.vx=-20;seen.y=FLOOR-100;
        expect(projectCpuMotion(seen,20,bounds).x).toBeLessThan(f.x);
    });
    it('does not move its forecast forward during hitstop',()=>{
        const state=movingApproach(),seen=structuredClone(perceivedAt(state,0)),f=state.fighters[0],id=state.fighters[1].id;
        state.freeze=12;const tick=state.cpu![0].combatTicks;
        const before=projectCpuMotion(seen,tick-seen.combatTick,cpuTrackingBounds(f,id));
        for(let frame=0;frame<12;frame++)step(state,[0,0]);
        expect(state.cpu![0].combatTicks).toBe(tick);
        expect(projectCpuMotion(seen,state.cpu![0].combatTicks-seen.combatTick,cpuTrackingBounds(f,id))).toEqual(before);
    });
    it('replays changing movement and casts without calling the controller on playback',()=>{
        const live=createState('bront','versus','stonkyleg69'),replay=structuredClone(live);
        for(let frame=0;frame<900 && live.winner===null;frame++){
            const pair:[number,number]=[cpuInput(live,0,7),frame<180?A.left:frame<300?A.right:cpuInput(live,1,4)];
            step(live,pair);step(replay,pair);
        }
        expect(hashState(replay)).toBe(hashState(live));
    });
});

describe('generic projectile release planning',()=>{
    const caster=PLAYABLE_FIGHTERS.filter(id=>!COMBAT_STYLES[id].projectile.beamLength)
        .sort((a,b)=>getProjectileOrigin(createState(b).fighters[0]).forward-getProjectileOrigin(createState(a).fighters[0]).forward)[0];
    function fixture() {
        const state=createState(caster,'cpu','stonkyleg69');
        for(let frame=0;frame<35;frame++)step(state,[0,0]);
        state.fighters[0].x=380;state.fighters[1].x=630;
        const memory=state.cpu![0];memory.choice=.5;memory.decisionAt=state.frame;
        memory.intent='approach';
        for(const seen of memory.observations){
            seen.x=630;seen.vx=0;seen.vxDamping=1;seen.y=FLOOR;seen.move=null;
            seen.attacks=0;seen.lows=0;seen.projectiles=0;seen.input=0;
        }
        return state;
    }
    it('keeps a stationary target cast and rejects a continued closing release behind the target',()=>{
        const still=fixture(),closing=structuredClone(still),seen=perceivedAt(still,0);
        expect(getProjectileOrigin(still.fighters[0]).forward).toBeGreaterThan(120);
        expect(cpuCastHasLane(still,0,seen,still.cpu![0].combatTicks-seen.combatTick)).toBe(true);
        expect(cpuInput(still,0,4)&A.bolt).toBe(A.bolt);
        const speed=ROSTER[closing.fighters[1].id].speed;
        for(const observation of closing.cpu![0].observations){
            observation.vx=-speed;observation.input=A.left;
            observation.x=630+speed*(closing.cpu![0].combatTicks-observation.combatTick);
        }
        const movingSeen=perceivedAt(closing,0),elapsed=closing.cpu![0].combatTicks-movingSeen.combatTick;
        expect(cpuCastHasLane(closing,0,movingSeen,elapsed)).toBe(false);
        const before=hashState(closing);expect(cpuInput(closing,0,4)&A.bolt).toBe(0);expect(hashState(closing)).toBe(before);
    });
    it('shares the exact numeric release origin with the projectile simulation',()=>{
        const state=createState(caster,'versus','stonkyleg69'),f=state.fighters[0],origin=getProjectileOrigin(f),style=COMBAT_STYLES[caster].projectile;
        step(state,[A.bolt,0]);
        for(let frame=0;frame<getMove(f,'bolt').startup+2 && !state.projectiles.length;frame++)step(state,[0,0]);
        expect(state.projectiles.length).toBeGreaterThan(0);
        expect(state.projectiles[0].x).toBeCloseTo(f.x+origin.forward+style.speed+(style.accel??0),8);
    });
});
