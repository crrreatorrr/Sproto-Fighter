// Focused catch/throw/release checks; no browser or exhaustive balance suite.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source=ts.transpileModule(readFileSync(new URL('../src/core.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const {A,FLOOR,createState,step,THROW_HOLD_FRAMES,THROW_RECOVERY_FRAMES}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
let count=0;
function check(name,fn){fn();count++;console.log('PASS:',name);}
function fresh(){const s=createState('rivet','cpu');s.fighters[0].x=380;s.fighters[1].x=440;return s;}
function tick(s,n=1,a=0,b=0){for(let i=0;i<n;i++)step(s,[a,b]);}
function until(s,predicate,max=150){for(let i=0;i<max&&!predicate();i++)tick(s);assert.ok(predicate(),'phase condition not reached');}
function catchTarget(s,input=A.grab,guard=0){tick(s,1,input,guard);for(let i=0;i<20&&!s.throwState;i++)tick(s,1,0,guard);assert.equal(s.throwState?.phase,'hold');}
check('forward grab visibly holds first, damages once on release, then recovers',()=>{
 const s=fresh();catchTarget(s);const a=s.fighters[0],b=s.fighters[1];assert.equal(b.hp,1000);assert.equal(b.y,FLOOR-26);assert.equal(s.throwState.t,0);
 let held=0,lastT=0;while(s.throwState.phase==='hold'){assert.equal(b.hp,1000);assert.ok(Math.abs(b.x-a.x-48)<1e-8);tick(s,1,A.right|A.light,A.up|A.heavy);if(s.throwState?.phase==='hold'&&s.throwState.t!==lastT){held++;lastT=s.throwState.t;}}
 assert.equal(lastT,THROW_HOLD_FRAMES-1);assert.equal(b.hp,885);assert.equal(b.vx,14);assert.equal(b.vy,-8);assert.equal(a.combo,1);assert.equal(a.pips,0);assert.equal(s.throwState.phase,'release');
 until(s,()=>s.throwState===null);assert.equal(a.move,null);tick(s,80);assert.equal(b.hp,885);assert.equal(a.pips,0);assert.ok(held>=10);
});
check('back + grab throws behind the captured facing',()=>{const s=fresh();catchTarget(s,A.left|A.grab);assert.equal(s.throwState.direction,'back');until(s,()=>s.throwState?.phase==='release');assert.ok(s.fighters[1].x<s.fighters[0].x);assert.equal(s.fighters[1].vx,-14);});
check('down + grab lifts then slams downward',()=>{const s=fresh();catchTarget(s,A.down|A.grab);assert.equal(s.throwState.direction,'down');until(s,()=>s.throwState?.phase==='release');assert.equal(s.fighters[1].vy,15);assert.equal(s.fighters[1].hp,885);until(s,()=>s.freeze===0);tick(s,4);assert.equal(s.fighters[1].y,FLOOR);});
check('up + grab suppresses jump and launches victim upward',()=>{const s=fresh();catchTarget(s,A.up|A.grab);assert.equal(s.throwState.direction,'up');assert.equal(s.fighters[0].y,FLOOR);until(s,()=>s.throwState?.phase==='release');assert.equal(s.fighters[0].y,FLOOR);assert.equal(s.fighters[1].vy,-18);assert.equal(s.fighters[1].stun,42);});
check('grab beats standing guard and still earns no single-hit charge',()=>{const s=fresh();s.mode='guard';catchTarget(s,A.grab,A.right);until(s,()=>s.throwState?.phase==='release');assert.equal(s.fighters[1].hp,885);tick(s,100,0,A.right);assert.equal(s.fighters[0].pips,0);});
check('missed grab completes ordinary recovery with no latch or damage',()=>{const s=fresh();s.fighters[1].x=700;tick(s,1,A.grab);tick(s,60);assert.equal(s.throwState,null);assert.equal(s.fighters[0].move,null);assert.equal(s.fighters[1].hp,1000);});
check('cannot grab an airborne or hit-stunned target',()=>{for(const airborne of [false,true]){const s=fresh();if(airborne){s.fighters[1].y=FLOOR-100;s.fighters[1].vy=-4;}else s.fighters[1].stun=12;tick(s,1,A.grab);tick(s,12);assert.equal(s.throwState,null);assert.equal(s.fighters[1].hp,1000);}});
check('opponent projectile interrupts hold and aborts pending throw damage',()=>{const s=fresh();catchTarget(s);until(s,()=>s.freeze===0);const a=s.fighters[0],b=s.fighters[1];s.projectiles.push({owner:1,x:a.x,y:a.y-65,vx:0,vy:0,life:3,damage:55});tick(s);assert.equal(s.throwState,null);assert.equal(a.hp,945);assert.equal(a.move,null);assert.equal(b.hp,1000);tick(s,80);assert.equal(b.hp,1000);});
check('held victim is protected from incidental attacker projectiles',()=>{const s=fresh();catchTarget(s);until(s,()=>s.freeze===0);const b=s.fighters[1];s.projectiles.push({owner:0,x:b.x,y:b.y-65,vx:0,vy:0,life:3,damage:55});tick(s);assert.equal(b.hp,1000);assert.equal(s.throwState?.phase,'hold');until(s,()=>s.throwState?.phase==='release');assert.equal(b.hp,885);assert.equal(s.fighters[0].combo,1);});
check('simultaneous grabs break evenly without a latch',()=>{const s=fresh();tick(s,1,A.grab,A.grab);tick(s,10);assert.equal(s.throwState,null);assert.equal(s.fighters[0].hp,1000);assert.equal(s.fighters[1].hp,1000);assert.equal(s.fighters[0].move,null);assert.equal(s.fighters[1].move,null);});
check('throw state stays serializable and replayable',()=>{const a=fresh(),b=fresh();for(let i=0;i<130;i++){const input=[i===0?A.left|A.grab:0,0];step(a,input);step(b,input);assert.deepEqual(JSON.parse(JSON.stringify(a)),b);}assert.equal(a.throwState,null);assert.equal(a.fighters[0].pips,0);});
console.log(`${count} focused throw checks passed (${THROW_HOLD_FRAMES}-frame hold, ${THROW_RECOVERY_FRAMES}-frame recovery).`);
