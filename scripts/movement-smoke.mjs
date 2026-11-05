// Focused responsiveness regressions. Uses the actual combat core, no DOM.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=bundledCore();
const {A,FLOOR,WALL,GRAVITY,ROSTER,BALANCE_KITS,fighterWall,createState,step}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
let checks=0;
const check=(name,fn)=>{fn();checks++;console.log('PASS:',name);};
function fresh(id='rivet'){const s=createState(id,'dummy');s.fighters[0].x=Math.max(180,fighterWall(id)+20);s.fighters[1].x=850;return s;}
function tick(s,n=1,input=0){for(let i=0;i<n;i++)step(s,[input,0]);}
check('all installed fighters reach full walk speed in 2 frames, reverse in 2, brake in 2',()=>{
 for(const id of Object.keys(ROSTER)){const s=fresh(id),f=s.fighters[0],speed=ROSTER[id].speed;
 tick(s,1,A.right);assert.ok(f.vx>0&&f.vx<speed,id+' ramps instead of snapping');
 tick(s,1,A.right);assert.equal(f.vx,speed,id+' full speed');tick(s,2,A.left);assert.equal(f.vx,-speed,id+' reverse');
 tick(s,2);assert.equal(f.vx,0,id+' brake');}
});
check('jump release preserves takeoff momentum instead of stopping in midair',()=>{
 const s=fresh(),f=s.fighters[0];tick(s,3,A.right);tick(s,3,A.right|A.up);assert.ok(f.y<FLOOR);const x=f.x,v=f.vx;
 tick(s,8);assert.ok(f.x-x>v*7.5);assert.ok(f.vx>v*.95);
});
check('air attack preserves travel and allows restrained steering',()=>{
 const s=fresh(),f=s.fighters[0];f.y=FLOOR-150;f.vy=-3;f.vx=5;
 tick(s,1,A.light);assert.equal(f.move.id,'airLight');tick(s,7);assert.ok(f.vx>4.7,'attack must not apply exponential .7 braking');
 const before=f.vx;tick(s,3,A.left);assert.ok(f.vx<before&&f.vx>before-1,'air strike steering should remain restrained');
});
check('neutral air steering can reverse travel without instant velocity flip',()=>{
 const s=fresh(),f=s.fighters[0];f.y=FLOOR-160;f.vy=-5;f.vx=5;
 tick(s,1,A.left);assert.ok(f.vx>4&&f.vx<5);tick(s,10,A.left);assert.ok(f.vx<0);
});
check('dash has 3 committed frames then consumes a buffered attack',()=>{
 const s=fresh(),f=s.fighters[0];tick(s,1,A.right|A.dash);assert.equal(f.dash,10);
 tick(s,1,A.light);assert.equal(f.move,null);tick(s);assert.equal(f.move,null);assert.equal(f.dash,8);
 tick(s);assert.equal(f.dash,0);assert.equal(f.move.id,'light');assert.ok(f.dashLock>0);
});
check('dash tap-jump transitions after commitment and retains dash momentum',()=>{
 const s=fresh(),f=s.fighters[0];tick(s,1,A.right|A.dash);tick(s,1,A.up);assert.equal(f.y,FLOOR);
 tick(s);assert.equal(f.y,FLOOR);tick(s);assert.ok(f.y<FLOOR);assert.equal(f.dash,0);assert.ok(f.vx>8);assert.ok(f.dashLock>0);
});
check('last-frame landing strike becomes a grounded attack without disappearing',()=>{
 const s=fresh(),f=s.fighters[0];f.y=FLOOR-2;f.vy=3;tick(s,1,A.light);
 assert.equal(f.y,FLOOR);assert.equal(f.move.id,'light');assert.equal(f.bufferLife,0);
});
check('tap-jump shortly before landing fires on touchdown, held Up never repeats',()=>{
 const s=fresh(),f=s.fighters[0];f.y=FLOOR-12;f.vy=3;tick(s,1,A.up);tick(s,2);
 assert.ok(f.y<FLOOR);assert.ok(f.vy<0,'buffered tap must take off on landing');assert.equal(f.jumpBuffer,0);
 const held=fresh(),g=held.fighters[0];let takeoffs=0,wasGround=true;
 for(let i=0;i<120;i++){tick(held,1,A.up);const ground=g.y>=FLOOR;if(wasGround&&!ground)takeoffs++;wasGround=ground;}
 assert.equal(takeoffs,1);assert.equal(g.y,FLOOR);
});
check('up+attack on touchdown remains a rising attack and suppresses jump',()=>{
 const s=fresh(),f=s.fighters[0];f.y=FLOOR-2;f.vy=3;tick(s,1,A.up|A.light);
 assert.equal(f.y,FLOOR);assert.equal(f.jumpBuffer,0);assert.equal(f.move.aim,'up');tick(s,3);assert.equal(f.y,FLOOR);
});
check('stun and attack recovery cannot be bypassed with dash/jump buffers',()=>{
 const s=fresh(),f=s.fighters[0];f.stun=12;tick(s,3,A.dash|A.up);assert.equal(f.dash,0);assert.equal(f.y,FLOOR);
 const t=fresh(),g=t.fighters[0];tick(t,1,A.heavy);tick(t,3,A.up|A.dash);assert.equal(g.move.id,'heavy');assert.equal(g.dash,0);assert.equal(g.y,FLOOR);
});
check('movement input replay remains deterministic through air, dash, landing and attack',()=>{
 const a=fresh(),b=fresh();const sequence=[A.right,A.right|A.up,0,A.light,A.left,0,A.dash,A.heavy,0,A.up];
 for(let i=0;i<240;i++){const input=sequence[Math.floor(i/4)%sequence.length];tick(a,1,input);tick(b,1,input);assert.deepEqual(a,b);}
});

check('human-paced launcher route retains vertical alignment through finisher',()=>{
 const s=fresh(),a=s.fighters[0],b=s.fighters[1];a.x=840;b.x=900;
 tick(s,10,A.launcher);tick(s,7,A.up);tick(s,8,A.light);tick(s,8,A.medium);tick(s,9,A.heavy);
 let best=a.combo;for(let i=0;i<180;i++){tick(s);best=Math.max(best,a.combo);}
 assert.equal(best,4);assert.equal(a.pips,1);
});


check('hitstop buffers dash direction at press, not at later execution',()=>{
 const s=fresh(),f=s.fighters[0];s.freeze=4;
 tick(s,1,A.left|A.dash);assert.equal(f.dashDirection,-1);tick(s,3,A.right);assert.equal(f.dash,0);
 tick(s,1);assert.ok(f.dash>0);assert.ok(f.vx<0,'released backdash must not become forward dash');
});
check('recovery-buffered dash keeps its world direction across a side change',()=>{
 const s=fresh(),f=s.fighters[0];f.stun=4;tick(s,1,A.right|A.dash);s.fighters[1].x=90;
 tick(s,3);assert.equal(f.facing,-1);assert.ok(f.vx>0);assert.equal(f.dashDirection,1);
});
check('vertical dash chords cannot leak an unintended dash after release',()=>{
 const crouch=fresh(),c=crouch.fighters[0];tick(crouch,1,A.down|A.dash);tick(crouch,5);
 assert.equal(c.dash,0);assert.equal(c.dashBuffer,0);assert.equal(c.x,180);
 const jump=fresh(),j=jump.fighters[0];tick(jump,1,A.up|A.dash);tick(jump,3);
 assert.ok(j.y<FLOOR);assert.equal(j.dash,0);assert.equal(j.dashBuffer,0);assert.equal(j.vx,0);
});
check('attack wins simultaneous dash chord without a delayed second action',()=>{
 const s=fresh(),f=s.fighters[0];tick(s,1,A.light|A.dash);
 assert.equal(f.move.id,'light');assert.equal(f.dash,0);assert.equal(f.dashBuffer,0);
 tick(s,35);assert.equal(f.move,null);assert.equal(f.dash,0);assert.equal(f.x,180);
});
check('tap dash keeps commitment, then opposite input brakes and reverses',()=>{
 const s=fresh(),f=s.fighters[0];tick(s,1,A.right|A.dash);tick(s,2,A.left);
 assert.equal(f.dash,8);assert.ok(f.vx>0);
 tick(s,1,A.left);assert.equal(f.dash,0);tick(s,3,A.left);assert.ok(f.vx<0);assert.ok(f.dashLock>0);
 const t=fresh(),g=t.fighters[0];tick(t,1,A.right|A.dash);tick(t,2);assert.equal(g.dash,8);
 tick(t,5,A.down);assert.equal(g.dash,0);assert.equal(g.vx,0);
});
check('wall collision clears outward dash velocity for immediate departure',()=>{
 const s=fresh(),f=s.fighters[0];f.x=WALL+2;tick(s,1,A.left|A.dash);
 assert.equal(f.x,WALL);assert.equal(f.vx,0);assert.equal(f.dash,0);
 tick(s,1,A.right);assert.ok(f.x>WALL);assert.ok(f.vx>0);
});
check('holding forward in a dash jump preserves the same momentum as neutral',()=>{
 const a=fresh(),b=fresh();for(const s of [a,b]){tick(s,1,A.right|A.dash);tick(s,1,A.up);tick(s,2);}
 tick(a,8,A.right);tick(b,8);assert.equal(a.fighters[0].vx,b.fighters[0].vx);
 assert.equal(a.fighters[0].x,b.fighters[0].x);assert.ok(a.fighters[0].vx>8);
});
check('airborne facing stays stable across opponent, then resolves on touchdown',()=>{
 const s=fresh(),f=s.fighters[0];f.y=FLOOR-100;f.vy=-1;s.fighters[1].x=90;
 tick(s,4);assert.equal(f.facing,1,'airborne guard must not flip each crossing');
 f.y=FLOOR-2;f.vy=3;tick(s,1,A.light);
 assert.equal(f.y,FLOOR);assert.equal(f.facing,-1);assert.equal(f.move.id,'light');assert.equal(f.move.shotX,-1);
});
check('frozen-frame attack tap survives and executes once after hitstop',()=>{
 const s=fresh(),f=s.fighters[0];s.freeze=6;tick(s,1,A.light);tick(s,5);
 assert.equal(f.move,null);assert.equal(f.bufferLife,8);tick(s);assert.equal(f.move.id,'light');
 tick(s,30);assert.equal(f.move,null);assert.equal(f.bufferLife,0);
});


function jumpTrajectory(id){
 const s=fresh(id),f=s.fighters[0];let peak=FLOOR,takeoff=-1,landing=-1;
 for(let i=0;i<100;i++){
  tick(s,1,i===0?A.up:0);peak=Math.min(peak,f.y);
  if(f.y<FLOOR&&takeoff<0)takeoff=i;
  if(takeoff>=0&&f.y===FLOOR){landing=i;break;}
 }
 return {id,height:FLOOR-peak,airFrames:landing-takeoff,takeoff};
}
check('normalized Golden Sproto jump retains a firm 134px, 35-frame arc',()=>{
 const result=jumpTrajectory('rivet');assert.equal(GRAVITY,.85);
 assert.ok(Math.abs(result.height-134.29)<.01,JSON.stringify(result));
 assert.equal(result.airFrames,35);assert.equal(result.takeoff,2,'preserve directional chord window');
 assert.ok(Math.abs(ROSTER.rivet.speed-5.6)<.001);assert.ok(Math.abs(ROSTER.rivet.jump-15.48)<.001);
});
// Phase 1 freezes distinct jump arcs by archetype; Phase 2 keeps the dash impulse.
const archetypeArcs={Zoning:{height:127.65,airFrames:34},Hover:{height:143.65,airFrames:36}};
check('all archetypes retain their reviewed 34–36-frame arcs and dash impulse',()=>{
 for(const id of Object.keys(ROSTER)){
  const result=jumpTrajectory(id),expected=archetypeArcs[BALANCE_KITS[id].archetype]??{height:134.29,airFrames:35};
  assert.equal(result.airFrames,expected.airFrames,JSON.stringify(result));
  assert.ok(Math.abs(result.height-expected.height)<.01,JSON.stringify(result));
  assert.equal(result.takeoff,2,id+' directional chord window');
  const s=fresh(id),f=s.fighters[0];tick(s,1,A.right|A.dash);
  assert.ok(Math.abs(f.vx-(id==='vela'?13:15)*.94)<.00001,id+' dash impulse changed');assert.equal(f.dash,10);
 }
});
check('normalized kits preserve the human-paced four-hit aerial route for all installed fighters',()=>{
 for(const id of Object.keys(ROSTER)){
  const s=fresh(id),a=s.fighters[0],b=s.fighters[1];a.x=840;b.x=900;
  tick(s,10,A.launcher);tick(s,7,A.up);tick(s,8,A.light);tick(s,8,A.medium);tick(s,9,A.heavy);
  let best=a.combo;for(let i=0;i<180;i++){tick(s);best=Math.max(best,a.combo);}
  assert.equal(best,4,id+' aerial route');assert.equal(a.pips,1,id+' finisher charge');
 }
});
console.log('Measured trajectories:',JSON.stringify(['rivet','vela'].map(jumpTrajectory)));

console.log(`${checks} focused movement checks passed.`);
