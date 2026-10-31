// Focused responsiveness regressions. Uses the actual combat core, no DOM.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=ts.transpileModule(readFileSync(new URL('../src/core.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const {A,FLOOR,ROSTER,createState,step}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
let checks=0;
const check=(name,fn)=>{fn();checks++;console.log('PASS:',name);};
function fresh(id='rivet'){const s=createState(id,'dummy');s.fighters[0].x=180;s.fighters[1].x=850;return s;}
function tick(s,n=1,input=0){for(let i=0;i<n;i++)step(s,[input,0]);}
check('all 21 fighters reach full run in 3 frames, reverse in 3, brake in 2',()=>{
 for(const id of Object.keys(ROSTER)){const s=fresh(id),f=s.fighters[0],speed=ROSTER[id].speed;
 tick(s,1,A.right);assert.ok(f.vx>0&&f.vx<speed,id+' ramps instead of snapping');
 tick(s,2,A.right);assert.equal(f.vx,speed,id+' full speed');tick(s,3,A.left);assert.equal(f.vx,-speed,id+' reverse');
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

console.log(`${checks} focused movement checks passed.`);
