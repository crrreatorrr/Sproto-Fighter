import {describe,expect,it} from 'vitest';
import {A,createState,FLOOR} from '../src/core';
import {BOSS_BALL,BOSS_BEAM,BOSS_SHIELD,startStoryBoss,stepStoryBoss,type BossForm} from '../src/storyBoss';

function fight(form:BossForm='giant'){
    const state=createState('highsproto','cpu','vela');
    const boss=startStoryBoss(state,form);
    return {state,boss,tick:(input=0)=>stepStoryBoss(state,boss,input)};
}

describe('fixed-screen story bosses',()=>{
    it('auto-fires and locks the missile trajectory before launch',()=>{
        const {state,boss,tick}=fight();
        while(state.frame<24)tick();
        expect(state.projectiles.some(p=>p.shape==='bossAutoShot')).toBe(true);
        const plan=boss.warning!.shots[0];
        while(state.frame<76)tick(A.right);
        const missile=state.projectiles.find(p=>p.shape==='bossHazard')!;
        expect(missile).toMatchObject({art:'missile',vx:plan.vx,vy:plan.vy});
    });

    it('uses Arcade ground speed, jump, double jump and one air dash',()=>{
        const {state,tick}=fight();
        const p=state.fighters[0];
        tick(A.left|A.up);
        expect(p.x).toBe(785);expect(p.vy).toBeCloseTo(-12.35);
        tick();tick(A.up);
        expect(p.airJumps).toBe(1);expect(p.vy).toBeCloseTo(-12.35);
        tick();tick(A.up);
        expect(p.vy).toBeCloseTo(-11.05);
        tick(A.dash|A.right);expect(p.vx).toBe(22);expect(p.vy).toBe(0);
        for(let i=0;i<75;i++)tick();
        expect(p.y).toBe(FLOOR);expect(p.airJumps).toBe(0);
    });

    it('uses independent cooldowns, piercing beam and bouncing ball',()=>{
        const {state,boss,tick}=fight();
        tick(BOSS_BEAM|BOSS_BALL|BOSS_SHIELD);tick(BOSS_BEAM|BOSS_BALL);
        expect(boss).toMatchObject({beamReadyAt:91,ballReadyAt:121,shieldReadyAt:151});
        expect(state.projectiles.filter(p=>p.shape==='bossBeam')).toHaveLength(1);
        const ball=state.projectiles.find(p=>p.shape==='bossBall')!;
        while(state.frame<23)tick();
        const beam=state.projectiles.find(p=>p.shape==='bossBeam')!;
        expect(beam).toMatchObject({hit:true});
        expect(ball.bounces).toBe(2);expect(ball.vy).toBeLessThan(0);
    });

    it('VMU alternates lasers and explosive bombs with six staggered slow missiles',()=>{
        const {state,boss,tick}=fight('vmu');
        state.godMode=true;
        while(state.frame<77)tick(A.right);
        expect(state.projectiles).toContainEqual(expect.objectContaining({owner:1,art:'laser'}));
        while(state.frame<221)tick();
        expect(state.projectiles).toContainEqual(expect.objectContaining({owner:1,explodes:true}));
        while(state.frame<365)tick();
        expect(boss.pending).toHaveLength(5);
        expect(state.projectiles).toContainEqual(expect.objectContaining({owner:1,art:'missile',vx:2.8}));
        while(state.frame<417)tick();
        expect(state.projectiles.filter(shot=>shot.owner===1&&shot.vx===2.8)).toHaveLength(6);
    });

    it.each(['giant','mecha','dragon','juicy','art','vmu'] as const)('%s can be cleared and can defeat the player',form=>{
        const attacking=fight(form);attacking.state.godMode=true;
        while(attacking.state.winner===null&&attacking.state.frame<2500){
            const t=attacking.state.frame;
            attacking.tick((t%90===0?BOSS_BEAM:0)|(t%120===0?BOSS_BALL:0));
        }
        expect(attacking.state.winner).toBe(0);
        const retreating=fight(form);
        while(retreating.state.winner===null&&retreating.state.frame<3500)retreating.tick(A.right);
        expect(retreating.state.winner).toBe(1);
    });
});
