import {describe,expect,it} from 'vitest';
import {A,createState,FLOOR} from '../src/core';
import {BOSS_BALL,BOSS_BEAM,BOSS_SHIELD,bossFightInput,bossKeyInput,startStoryBoss,stepStoryBoss,storyBossPlayerPose,type BossForm} from '../src/storyBoss';

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

    it('keeps Nick’s dragon shots visible through empty space until they reach the sprite',()=>{
        const {state,boss,tick}=fight('dragon');
        const target=state.fighters[1];
        state.projectiles.push({owner:0,shape:'bossAutoShot',art:'seed',x:705,y:FLOOR-89,vx:-16,vy:0,damage:17,life:60} as typeof state.projectiles[number]);
        tick();
        expect(target.hp).toBe(1000);
        expect(state.projectiles[0].x).toBe(689);
        while(!boss.impacts.length&&state.frame<40)tick();
        expect(target.hp).toBe(983);
        expect(boss.impacts[0].x).toBeLessThan(330);
    });

    it('uses the cinematic spawn for the first playable frame and restores health there',()=>{
        const state=createState('highsproto','cpu','vela');
        state.fighters[0].hp=240;
        const pose=storyBossPlayerPose(state.fighters[0]);
        startStoryBoss(state,'giant');
        expect(state.fighters[0]).toMatchObject({x:pose.x,y:pose.y,facing:pose.facing,hp:1000});
        expect(pose.hp).toBe(240);
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

    it.each(['dragon','giant','mecha','juicy','art','vmu'] as const)('%s launches eight slow missiles on varied paths early in the fight',form=>{
        const {state,tick}=fight(form);
        state.godMode=true;
        while(state.frame<310)tick(A.right);
        const missiles=state.projectiles.filter(p=>p.owner===1&&p.vx<3);
        expect(missiles).toHaveLength(8);
        expect(new Set(missiles.map(p=>p.vy)).size).toBeGreaterThan(3);
        expect(missiles.every(p=>p.life>0)).toBe(true);
    });

    it('VMU uses custom laser and explosive bomb attacks between slow missile waves',()=>{
        const {state,tick}=fight('vmu');
        state.godMode=true;
        while(state.frame<77)tick(A.right);
        expect(state.projectiles).toContainEqual(expect.objectContaining({owner:1,art:'laser',variant:0}));
        while(state.frame<365)tick(A.right);
        expect(state.projectiles).toContainEqual(expect.objectContaining({owner:1,explodes:true,variant:1}));
    });

    it.each(['giant','mecha','dragon','juicy','art','vmu'] as const)('%s restores full health and records the refill starting point',form=>{
        const state=createState('highsproto','cpu','vela');
        state.fighters[0].hp=240;
        const boss=startStoryBoss(state,form);
        expect(state.fighters[0].hp).toBe(1000);
        expect(boss.entryHp).toBe(240);
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

describe('boss-form controls from the fight bindings',()=>{
    const keys={left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS',light:'KeyJ',medium:'KeyK',heavy:'KeyL',launcher:'KeyU',bolt:'KeyI',grab:'KeyO',special:'KeyP',dash:'ShiftLeft'};
    it('maps Light/Ranged to the beam, Medium to the ball, Finisher to the shield and Launcher to a jump',()=>{
        expect(bossFightInput(A.light)).toBe(BOSS_BEAM);
        expect(bossFightInput(A.bolt)).toBe(BOSS_BEAM);
        expect(bossFightInput(A.medium)).toBe(BOSS_BALL);
        expect(bossFightInput(A.heavy)).toBe(BOSS_SHIELD);
        expect(bossFightInput(A.launcher)).toBe(A.up);
        expect(bossFightInput(A.left|A.dash|A.grab|A.special)).toBe(A.left|A.dash);
    });
    it('keeps the fixed boss keys and adds the fight keys alongside them',()=>{
        expect(['KeyX','KeyC','KeyV','KeyW','ArrowUp','ShiftRight'].map(code=>bossKeyInput(code,keys))).toEqual([BOSS_SHIELD,BOSS_BEAM,BOSS_BALL,A.up,A.up,A.dash]);
        expect(['KeyJ','KeyK','KeyL','KeyU','KeyI','KeyP','KeyZ'].map(code=>bossKeyInput(code,keys))).toEqual([BOSS_BEAM,BOSS_BALL,BOSS_SHIELD,A.up,BOSS_BEAM,0,0]);
        // A remapped fight key follows the player's binding; a fixed boss key keeps its meaning.
        expect(bossKeyInput('KeyX',{...keys,light:'KeyX'})).toBe(BOSS_SHIELD);
        expect(bossKeyInput('KeyN',{...keys,medium:'KeyN'})).toBe(BOSS_BALL);
    });
});
