import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=bundledCore();
const core=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const {A,FLOOR,PLAYABLE_FIGHTERS,isHorizontalSpit,COMBAT_STYLES,createState,step,getMove}=core;
const tick=(s,n,a=0,b=0)=>{for(let i=0;i<n;i++)step(s,[a,b]);};
let total=0;
for(const id of PLAYABLE_FIGHTERS){
 const style=COMBAT_STYLES[id];
 for(const direction of [0,A.up,A.up|A.right,A.down]){
  const s=createState(id,'cpu');s.fighters[0].x=100;s.fighters[1].x=1150;step(s,[direction|A.bolt,0]);let shot;
  for(let i=0;i<60&&!shot;i++){step(s,[0,0]);shot=s.projectiles[0];}
  assert.ok(shot,id+' projectile spawns');assert.equal(shot.shape,style.projectile.shape);assert.ok(Number.isFinite(shot.vx)&&Number.isFinite(shot.vy));if(!isHorizontalSpit(id)||!(direction&A.up))assert.equal(s.fighters[0].y,FLOOR,id+' aimed cast chord must not jump');if(isHorizontalSpit(id)){assert.equal(shot.vy,0);assert.equal(shot.gravity,0);assert.equal(shot.wave,0);}
  total++;
 }
 const s=createState(id,'cpu');s.fighters[0].x=380;s.fighters[1].x=460;s.fighters[0].hp=600;s.fighters[0].pips=3;
 step(s,[A.special,0]);assert.equal(s.fighters[0].move?.id,'special');assert.equal(s.fighters[0].pips,0);
 const contacts=[];let last=-1,maxSlow=0;
 for(let i=0;i<220;i++){step(s,[0,0]);const f=s.fighters[0];if(f.move?.wave!==undefined&&f.move.wave>=0&&f.move.wave!==last){last=f.move.wave;contacts.push(f.move.t);}maxSlow=Math.max(maxSlow,s.fighters[1].slow);}
 assert.deepEqual(contacts,style.specialFrames,id+' exact special contact schedule');assert.ok(s.fighters[1].hp<1000,id+' special damages');assert.equal(s.fighters[0].pips,0,id+' no self charge');assert.equal(s.fighters[0].move,null,id+' recovery ends');
 if(style.power==='drain')assert.ok(s.fighters[0].hp>600,id+' drain heals only confirmed hit');
 if(style.power==='slow')assert.ok(maxSlow>0,id+' slow applies');
 total++;
 console.log(`PASS: ${id}: four directional inputs / ${isHorizontalSpit(id)?'horizontal':'aimed'} ${style.projectile.shape} casts, ${contacts.length}-contact ${style.specialName}, spend/recovery/no self charge`);
}
// Normalization deliberately shares a budget across fighters, replacing intake-order uniqueness.
assert.equal(new Set(PLAYABLE_FIGHTERS.map(id=>core.BALANCE_KITS[id].archetype)).size,8,'all eight normalized archetypes represented');
for(const id of PLAYABLE_FIGHTERS)assert.ok(core.BALANCE_KITS[id],id+' complete effective kit');
for(const id of ['zephyr','guest12','guest10','nate']){const s=createState(id,'cpu');s.fighters[0].x=100;s.fighters[1].x=1200;step(s,[A.bolt,0]);let bounced=false;for(let i=0;i<130;i++){step(s,[0,0]);bounced ||= s.projectiles.some(p=>(p.bounces??0)<COMBAT_STYLES[id].projectile.bounces&&p.vy<0);}assert.ok(bounced,id+' actual floor bounce');}
for(const id of ['guest08','mandela']){const s=createState(id,'cpu');s.fighters[0].x=100;s.fighters[1].x=1200;step(s,[A.bolt,0]);let returned=false;for(let i=0;i<100;i++){step(s,[0,0]);returned ||= s.projectiles.some(p=>p.vx<0);}assert.ok(returned,id+' return reverses');}
for(const id of ['vamp','crapto']){const s=createState(id,'cpu');s.fighters[0].hp=500;s.fighters[1].x=570;step(s,[A.bolt,0]);let applied=false;for(let i=0;i<80;i++){step(s,[0,0]);applied ||= id==='vamp'?s.fighters[1].slow>0:s.fighters[0].hp>500;}assert.ok(applied,id+' projectile power on hit');}
console.log(`PASS: ${total} per-fighter cases, ${PLAYABLE_FIGHTERS.length} assigned kits across eight budgeted archetypes, 8 trajectory/power interaction checks.`);

const lowerTorsoShot = COMBAT_STYLES.lowernipple.projectile;
const emitters = [{ forward: 7.5, height: 50 }, { forward: -16.25, height: 55 }];
assert.deepEqual([lowerTorsoShot.origin, lowerTorsoShot.secondaryOrigin], emitters);

let emitterCases = 0;
for (const facing of [-1, 1]) {
  for (const airborne of [false, true]) {
    for (const aim of [0, A.up, A.down]) {
      const game = createState('lowernipple', 'cpu', 'rivet');
      const [fighter, rival] = game.fighters;
      fighter.x = 600;
      fighter.facing = facing;
      rival.x = fighter.x + facing * 520;
      rival.facing = -facing;
      if (airborne) {
        fighter.y = FLOOR - 250;
        fighter.vy = -4;
      }

      step(game, [A.bolt | aim, 0]);
      const move = getMove(fighter, 'bolt');
      for (let frame = 0; frame < 40 && !game.projectiles.length; frame++) tick(game, 1);

      assert.equal(fighter.move.t, move.startup);
      assert.equal(game.projectiles.length, emitters.length);
      assert.equal(game.projectiles.reduce((total, shot) => total + shot.damage, 0), move.damage);
      for (const [index, shot] of game.projectiles.entries()) {
        const { forward, height } = emitters[index];
        assert.equal(shot.shape, 'lowerTorsoBolt');
        assert.equal(shot.vx, facing * lowerTorsoShot.speed);
        assert.equal(shot.vy, 0);
        assert.equal(shot.x, fighter.x + facing * (forward + lowerTorsoShot.speed));
        assert.equal(shot.y, fighter.y - height);
      }
      emitterCases++;
    }
  }
}
console.log(`PASS: ${emitterCases} SPROTO casts with both authored emitters, mirrored travel, and shared move damage.`);
