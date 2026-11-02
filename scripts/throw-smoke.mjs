// Repeatable lifecycle checks; visual contact still requires browser inspection.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source=ts.transpileModule(readFileSync(new URL('../src/core.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const {A,FLOOR,WALL,WIDTH,PLAYABLE_FIGHTERS,THROW_GRIPS,getThrowGrip,bodySpread,fighterWall,createState,step,THROW_HOLD_FRAMES,THROW_CATCH_FRAMES,THROW_RECOVERY_FRAMES}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
let count=0,failures=0;
function check(name,fn){try{fn();count++;console.log('PASS:',name);}catch(e){failures++;console.error('FAIL:',name,'—',e.message);}}
function fresh(a='rivet',b='vela',facing=1,location='center'){
 const s=createState(a,'cpu',b),[p,q]=s.fighters;
 const gap=60+bodySpread(a)+bodySpread(b),aw=fighterWall(a),bw=fighterWall(b);
 const min=Math.max(aw,bw-facing*gap),max=Math.min(WIDTH-aw,WIDTH-bw-facing*gap);
 p.x=location==='left'?min:location==='right'?max:600;
 q.x=p.x+facing*gap;p.facing=facing;q.facing=-facing;
 for(const f of s.fighters)assert.ok(f.x>=fighterWall(f.id)&&f.x<=WIDTH-fighterWall(f.id),'fixture must begin inside its own formation bounds');
 return s;
}
function tick(s,n=1,a=0,b=0){for(let i=0;i<n;i++)step(s,[a,b]);}
function until(s,predicate,max=200){for(let i=0;i<max&&!predicate();i++)tick(s);assert.ok(predicate(),'phase condition not reached');}
const button=(d,f)=>A.grab|(d==='up'?A.up:d==='down'?A.down:d==='back'?(f===1?A.left:A.right):0);
function catchTarget(s,input=A.grab,guard=0){tick(s,1,input,guard);for(let i=0;i<20&&!s.throwState;i++)tick(s,1,0,guard);assert.equal(s.throwState?.phase,'hold');}
check('catch eases to authored grip, damages only at release, then fully recovers',()=>{
 const s=fresh();catchTarget(s);const [a,b]=s.fighters;assert.equal(b.hp,1000);assert.equal(b.y,FLOOR);assert.equal(s.throwState.t,0);assert.equal(s.freeze,0,'do not freeze the initial overlapping reach');
 until(s,()=>s.throwState.t===THROW_CATCH_FRAMES);assert.equal(s.freeze,3,'contact freeze occurs at the settled grip');
 const gap=THROW_GRIPS[a.id].hand[0]+THROW_GRIPS[b.id].torso[0];assert.equal(b.x-a.x,gap);
 until(s,()=>s.throwState.t===THROW_HOLD_FRAMES-1);const position=[b.x,b.y];
 tick(s,1,A.right|A.light,A.up|A.heavy);
 assert.deepEqual([b.x,b.y],position,'no release teleport');assert.equal(b.hp,885);assert.equal(b.vx,14);assert.equal(b.vy,-8);assert.equal(a.combo,1);assert.equal(s.throwState.phase,'release');
 until(s,()=>s.throwState===null);assert.equal(a.move,null);tick(s,100);assert.equal(b.hp,885);assert.equal(a.pips,0);assert.equal(b.reaction,null);assert.equal(b.stun,0);
});
for(const direction of ['forward','back','up','down'])check(`${direction} release, trajectory, knockdown and recovery in both facings`,()=>{
 for(const facing of [1,-1]){const s=fresh('rivet','bront',facing);catchTarget(s,button(direction,facing));until(s,()=>s.throwState.phase==='release');const [a,b]=s.fighters;
  assert.equal(a.facing,direction==='back'?-facing:facing);assert.equal(b.vy,direction==='up'?-18:direction==='down'?12:direction==='back'?-22:-8);assert.equal(a.y,FLOOR);
  let flewUp=false,fell=false,down=false,rise=false,crossed=false;
  for(let i=0;i<150;i++){tick(s);flewUp ||= b.y<FLOOR-80;fell ||= b.vy>0;down ||= b.reaction?.phase==='down';rise ||= b.reaction?.phase==='rise';crossed ||= (b.x-a.x)*facing<0;}
  assert.ok(fell&&down&&rise,'flight/down/rise observed');if(direction==='back')assert.ok(crossed,'must cross behind');if(direction==='up')assert.ok(flewUp);assert.equal(b.reaction,null);assert.equal(b.stun,0);assert.equal(s.throwState,null);
 }
});
check('all roster pairs × 4 directions × 2 facings × 3 locations: bounded finite catch and recovery',()=>{
 let probes=0;
 for(const a of PLAYABLE_FIGHTERS)for(const b of PLAYABLE_FIGHTERS)for(const d of ['forward','back','up','down'])for(const f of [1,-1])for(const location of ['center','left','right']){
  const s=fresh(a,b,f,location);catchTarget(s,button(d,f));until(s,()=>s.throwState.t===THROW_CATCH_FRAMES);
  const [p,q]=s.fighters,gap=getThrowGrip(p,'hand')[0]+getThrowGrip(q,'torso')[0];
  assert.ok(Math.abs((q.x-p.x)*f-gap)<1e-7,`${a}/${b}/${d}/${f}/${location} grip`);
  let crossed=false;
  for(let t=0;t<150;t++){tick(s);for(const x of s.fighters){assert.ok([x.x,x.y,x.vx,x.vy].every(Number.isFinite));assert.ok(x.x>=fighterWall(x.id)&&x.x<=WIDTH-fighterWall(x.id),`${a}/${b}/${d}/${f}/${location} tick ${t}: ${x.id} x=${x.x} bounds=${fighterWall(x.id)}..${WIDTH-fighterWall(x.id)}`);assert.ok(x.y<=FLOOR);}crossed ||= (q.x-p.x)*f<0;}
  assert.equal(s.throwState,null);assert.equal(q.stun,0);assert.equal(q.reaction,null);assert.equal(q.hp,885);
  // Corner-facing-away back throws hit the wall, so a side swap is impossible.
  if(d==='back' && location==='center')assert.ok(crossed,`${a}/${b} back must cross`);
  probes++;
 }
 assert.equal(probes,PLAYABLE_FIGHTERS.length**2*4*2*3);
});
check('guard loses to grab; misses and airborne/stunned targets do not latch',()=>{
 const s=fresh();s.mode='guard';catchTarget(s,A.grab,A.right);until(s,()=>s.throwState.phase==='release');assert.equal(s.fighters[1].hp,885);
 for(const condition of ['far','air','stun']){const s=fresh();if(condition==='far')s.fighters[1].x=1000;if(condition==='air'){s.fighters[1].y=FLOOR-100;s.fighters[1].vy=-4;}if(condition==='stun')s.fighters[1].stun=12;tick(s,1,A.grab);tick(s,12);assert.equal(s.throwState,null);assert.equal(s.fighters[1].hp,1000);tick(s,60);assert.equal(s.fighters[0].move,null);}
});
check('projectile interrupts held attacker even while away is held, without teleport/damage to victim',()=>{
 const s=fresh();catchTarget(s);until(s,()=>s.freeze===0);const [a,b]=s.fighters;
 s.projectiles.push({owner:1,x:a.x,y:a.y-65,vx:0,vy:0,life:3,damage:55});const before=[b.x,b.y];tick(s,1,A.left);
 assert.equal(s.throwState,null);assert.equal(a.hp,945);assert.equal(a.move,null);assert.equal(b.hp,1000);assert.ok(Math.hypot(b.x-before[0],b.y-before[1])<25);tick(s,100);assert.equal(b.hp,1000);assert.equal(b.reaction,null);
});
check('held victim is protected from incidental projectiles',()=>{const s=fresh();catchTarget(s);until(s,()=>s.freeze===0);const b=s.fighters[1];s.projectiles.push({owner:0,x:b.x,y:b.y-65,vx:0,vy:0,life:3,damage:55});tick(s);assert.equal(b.hp,1000);assert.equal(s.throwState?.phase,'hold');until(s,()=>s.throwState?.phase==='release');assert.equal(b.hp,885);assert.equal(s.fighters[0].combo,1);});
check('simultaneous grabs break evenly; opposite directions cancel to forward',()=>{
 const s=fresh();tick(s,1,A.grab,A.grab);tick(s,10);assert.equal(s.throwState,null);for(const f of s.fighters){assert.equal(f.hp,1000);assert.equal(f.move,null);}
 for(const input of [A.left|A.right,A.up|A.down,A.up|A.down|A.left|A.right]){const s=fresh();catchTarget(s,input|A.grab);assert.equal(s.throwState.direction,'forward');}
});
check('late recovery input buffers but early presses do not leak after a hold',()=>{
 const s=fresh();catchTarget(s);until(s,()=>s.throwState.phase==='release'&&s.throwState.t===THROW_RECOVERY_FRAMES-5);tick(s,1,A.light);until(s,()=>s.throwState===null);tick(s);assert.equal(s.fighters[0].move?.id,'light');
 const e=fresh();catchTarget(e);tick(e,1,A.heavy);until(e,()=>e.throwState===null);tick(e,2);assert.equal(e.fighters[0].move,null);
});
check('KO throw finishes visible flight and clears latch before result; restart is fresh',()=>{
 for(const d of ['forward','back','up','down']){const s=fresh();s.fighters[1].hp=50;catchTarget(s,button(d,1));until(s,()=>s.throwState?.phase==='release');assert.equal(s.fighters[1].hp,0);assert.equal(s.winner,null);until(s,()=>s.winner!==null);assert.equal(s.winner,0);assert.equal(s.throwState,null);assert.equal(s.fighters[1].y,FLOOR);assert.equal(s.fighters[1].reaction?.phase,'down');}
 const s=createState();assert.equal(s.throwState,null);assert.ok(s.fighters.every(f=>f.reaction===null&&f.throwInvuln===0));
});
check('flush-wall back throws swap sides for all attackers, both player indices and walls',()=>{
 for(const id of PLAYABLE_FIGHTERS)for(const index of [0,1])for(const face of [1,-1]){
  const s=createState(id,'cpu','bront');if(index===1)s.fighters.reverse();const a=s.fighters[index],b=s.fighters[1-index];a.x=face===1?fighterWall(a.id):WIDTH-fighterWall(a.id);a.facing=face;b.x=a.x+face*(60+bodySpread(a.id)+bodySpread(b.id));b.facing=-face;
  const inputs=[0,0];inputs[index]=button('back',face);step(s,inputs);until(s,()=>!!s.throwState);
  for(let t=0;t<150;t++){const before=a.x;tick(s);assert.ok(Math.abs(a.x-before)<=8,`${id}: landing collision must not pop the holder`);}
  assert.ok((b.x-a.x)*face< -50,`${id}/index${index}/face${face}: ${(b.x-a.x)*face}`);assert.equal(s.throwState,null);assert.equal(b.stun,0);
 }
});
check('KO during hold cancels the latch without teleporting or damaging the victim',()=>{
 const s=fresh();catchTarget(s);until(s,()=>s.throwState.t===6);const beforeY=s.fighters[1].y;s.fighters[0].hp=0;tick(s);assert.equal(s.winner,1);assert.equal(s.throwState,null);const b=s.fighters[1];assert.ok(Math.abs(b.y-beforeY)<4);assert.ok(b.y<=FLOOR);assert.equal(b.hp,1000);assert.equal(b.reaction?.kind,'recoil');assert.equal(s.fighters[0].move,null);
});
check('throw state remains deterministic through JSON snapshot and replay',()=>{const a=fresh(),b=fresh();for(let i=0;i<160;i++){const input=[i===0?A.left|A.grab:0,0];step(a,input);step(b,input);assert.deepEqual(JSON.parse(JSON.stringify(a)),b);}assert.equal(a.throwState,null);});
console.log(`${count} throw groups passed; ${failures} failed.`);if(failures)process.exitCode=1;
