import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=bundledCore();
const {A,FLOOR,WALL,WIDTH,createState,step,getMove,PLAYABLE_FIGHTERS,KNOCKDOWN_FRAMES,GETUP_FRAMES}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
let count=0,failures=0;
function check(name,fn){try{fn();count++;console.log('PASS:',name);}catch(e){failures++;console.error('FAIL:',name,'—',e.message);}}
function fresh(id='rivet',face=1){const s=createState(id,'cpu');const [a,b]=s.fighters;a.x=600;b.x=600+face*60;a.facing=face;b.facing=-face;return s;}
const tick=(s,n=1,a=0,b=0)=>{for(let t=0;t<n;t++)step(s,[a,b]);};
function until(s,p,max=180){for(let t=0;t<max&&!p();t++)tick(s);assert.ok(p(),'state condition not reached');}
check('light contacts visibly move the target away, with finite recoil and no knockdown',()=>{for(const face of [1,-1]){const s=fresh('rivet',face),b=s.fighters[1],start=b.x;tick(s,1,A.light);until(s,()=>b.hp<1000);assert.equal(b.reaction.kind,'recoil');assert.equal(b.reaction.direction,face);tick(s,16);assert.ok((b.x-start)*face>10);assert.equal(b.y,FLOOR);tick(s,70);assert.equal(b.reaction,null);assert.equal(b.stun,0);}});
check('all roster heavy finishers launch/pop, fall, lie down and recover in both facings',()=>{for(const id of PLAYABLE_FIGHTERS)for(const face of [1,-1]){
 const s=fresh(id,face),[a,b]=s.fighters;tick(s,1,A.heavy);until(s,()=>b.hp<1000);assert.equal(b.reaction.kind,'knockdown',id);assert.ok(b.y<FLOOR);let rise=false,down=false,fall=false,up=false;for(let t=0;t<170;t++){tick(s);up ||= b.vy<0;fall ||= b.vy>0;down ||= b.reaction?.phase==='down';rise ||= b.reaction?.phase==='rise';}assert.ok(up&&fall&&down&&rise,id+' phases');assert.equal(b.stun,0,id);assert.equal(b.reaction,null,id);assert.equal(a.pips,0);
}});
check('launcher ascends then falls, remains juggleable, and clears without permanent lock',()=>{const s=fresh(),b=s.fighters[1];tick(s,1,A.launcher);until(s,()=>b.hp<1000);assert.equal(b.reaction.kind,'launch');assert.ok(b.vy<0);let up=false,fall=false;for(let t=0;t<120;t++){tick(s);up ||= b.y<FLOOR-100;fall ||= b.vy>0;}assert.ok(up&&fall);assert.equal(b.y,FLOOR);assert.equal(b.stun,0);assert.equal(b.reaction,null);});
check('downed bodies keep floor space at either wall instead of hiding under the standing fighter',()=>{
 for(const face of [1,-1])for(const index of [0,1]){
  const s=fresh(),b=s.fighters[index],a=s.fighters[1-index];b.x=face===1?WALL:WIDTH-WALL;a.x=b.x+face*55;
  b.reaction={kind:'knockdown',phase:'down',t:0,direction:-face};b.stun=30;
  for(let t=0;t<10;t++){const before=a.x;tick(s);assert.ok(Math.abs(a.x-before)<=8,'floor expansion must not pop the standing actor');}
  assert.ok((a.x-b.x)*face>114);assert.equal(b.reaction.phase,'down');
  for(const f of s.fighters)assert.ok(f.x>=WALL&&f.x<=WIDTH-WALL);
 }
});
check('sweep gives low knockdown; downward air-heavy slams into the floor',()=>{for(const air of [false,true]){const s=fresh(),[a,b]=s.fighters;if(air){a.y=FLOOR-100;a.vy=-2;}tick(s,1,A.down|A.heavy);until(s,()=>b.hp<1000);assert.equal(b.reaction.kind,'knockdown');if(air)assert.ok(b.vy>0);let down=false;for(let t=0;t<100;t++){tick(s);down ||= b.reaction?.phase==='down';}assert.ok(down);assert.equal(b.stun,0);}});
check('floor/get-up phases reject followup damage and throw loops; recovery input is responsive',()=>{
 const control=fresh(),awake=control.fighters[1];
 control.projectiles.push({owner:0,x:awake.x,y:awake.y-65,vx:0,vy:0,life:2,damage:55});tick(control);
 assert.equal(awake.hp,945,'the stationary probe must actually damage an awake target');
 const s=fresh(),[a,b]=s.fighters;tick(s,1,A.down|A.heavy);until(s,()=>b.reaction?.phase==='down');const hp=b.hp;let phases=0;
 // Force a stationary opposing projectile each frame to target the actual down
 // body. This isolates invulnerability, independent of projectile travel/spacing.
 while(b.reaction){if(!(b.reaction.phase==='rise'&&b.reaction.t===GETUP_FRAMES-1))s.projectiles.push({owner:0,x:b.x,y:b.y-65,vx:0,vy:0,life:2,damage:55});tick(s);assert.equal(b.hp,hp);phases++;assert.ok(phases<50);}
 assert.equal(phases,KNOCKDOWN_FRAMES+GETUP_FRAMES);assert.ok(b.throwInvuln>0);
 // Regrabs cannot begin during the grace window, but movement can.
 a.x=b.x-60;a.facing=1;tick(s,1,A.grab,A.right);tick(s,8,0,A.right);assert.equal(s.throwState,null);assert.ok(b.vx>0);
});
check('finisher combo pays exactly one pip after knockdown recovery, never on block',()=>{
 const s=fresh(),a=s.fighters[0];for(const key of [A.light,A.medium,A.heavy]){const next=a.combo+1;tick(s,1,key);until(s,()=>a.combo>=next);}
 assert.equal(a.pips,0);until(s,()=>a.combo===0);assert.equal(a.pips,1);tick(s,150);assert.equal(a.pips,1);
 const g=fresh();g.mode='guard';tick(g,1,A.heavy,A.right);for(let t=0;t<80;t++)tick(g,1,0,A.right);assert.equal(g.fighters[1].hp,1000-Math.round(getMove(g.fighters[0],'heavy').damage*.12),'blocked heavy deals chip without a hit reaction or relay reward');assert.equal(g.fighters[1].reaction,null);assert.equal(g.fighters[0].pips,0);
});
check('all special final contacts give a finite knockdown and spend all meter',()=>{for(const id of PLAYABLE_FIGHTERS){const s=fresh(id),[a,b]=s.fighters;a.pips=3;tick(s,1,A.special);let knock=false,down=false;for(let t=0;t<240;t++){tick(s);knock ||= b.reaction?.kind==='knockdown';down ||= b.reaction?.phase==='down';}assert.ok(knock&&down,id);assert.equal(b.reaction,null,id);assert.equal(a.pips,0);assert.equal(a.move,null);}});
console.log(`${count} reaction groups passed; ${failures} failed.`);if(failures)process.exitCode=1;
