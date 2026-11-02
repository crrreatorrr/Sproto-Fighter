// Stance-height, jump-input and real collision checks against the combat step.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = ts.transpileModule(readFileSync(new URL('../src/core.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const { A, FLOOR, HORIZONTAL_SPIT_FIGHTERS, createState, step, getMove, isCrouchingSpit } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
let checks=0;
const check=(name,fn)=>{fn();checks++;console.log('PASS:',name);};
function fresh(id='rivet',face=1){const s=createState(id,'cpu');s.fighters[0].x=face===1?200:1080;s.fighters[1].x=face===1?1100:180;s.fighters[0].facing=face;return s;}
function tick(s,n=1,a=0,b=0){for(let i=0;i<n;i++)step(s,[a,b]);}
function shot(s,input=0,opponent=0){tick(s,1,input,opponent);for(let i=0;i<70&&!s.projectiles.length;i++)tick(s,1,0,opponent);assert.ok(s.projectiles.length,'projectile spawns');return s.projectiles[0];}
for(const id of HORIZONTAL_SPIT_FIGHTERS)for(const face of [1,-1]){
 check(`${id}/${face}: crouched mouth is lower; every directional shot stays horizontal`,()=>{
  const neutral=fresh(id,face),normal=shot(neutral,A.bolt),normalY=normal.y;
  for(const horizontal of [0,A.left,A.right,A.left|A.right]){
   const s=fresh(id,face),p=shot(s,A.down|horizontal|A.bolt);
   assert.equal(isCrouchingSpit(s.fighters[0]),true);assert.ok(p.y>normalY+9);
   assert.equal(p.vy,0);assert.equal(Math.sign(p.vx),face);const y=p.y;
   for(let i=0;i<25&&s.projectiles.includes(p);i++){tick(s);assert.equal(p.y,y);}
  }
 });
 check(`${id}/${face}: Up + spit across the chord window jumps; no grounded high aim or repeat jump`,()=>{
  for(const delay of [0,1,2,5]){
   const s=fresh(id,face);tick(s,delay,A.up);const p=shot(s,A.up|A.bolt);
   assert.ok(s.fighters[0].y<FLOOR,'Up must actually jump');assert.equal(p.vy,0);assert.equal(Math.sign(p.vx),face);
   assert.ok(p.y<FLOOR-115,'high lane comes from jump altitude');
  }
  const s=fresh(id,face);tick(s,60,A.up);assert.equal(s.fighters[0].y,FLOOR);
  const p=shot(s,A.up|A.bolt);assert.equal(s.fighters[0].y,FLOOR);assert.equal(p.y,shot(fresh(id,face),A.bolt).y);
 });
 check(`${id}/${face}: Down in flight uses normal mouth; a landing cast cannot keep an airborne high offset`,()=>{
  const normal=fresh(id,face),down=fresh(id,face);
  for(const s of [normal,down]){tick(s,10,A.up);assert.ok(s.fighters[0].y<FLOOR);}
  assert.equal(shot(down,A.down|A.bolt).y,shot(normal,A.bolt).y);
  assert.equal(isCrouchingSpit(down.fighters[0]),false);
  const s=fresh(id,face),f=s.fighters[0];f.y=FLOOR-1;f.vy=4;f.prev=A.up;f.input=A.up;
  const p=shot(s,A.up|A.bolt);assert.equal(f.y,FLOOR);assert.equal(p.y,shot(fresh(id,face),A.bolt).y);
 });
 check(`${id}/${face}: low spit hits standing/crouching opponents, neutral is ducked, jumping spit clears ground`,()=>{
  for(const [input,crouch,hit] of [[A.bolt,false,true],[A.bolt,true,false],[A.down|A.bolt,false,true],[A.down|A.bolt,true,true],[A.up|A.bolt,false,false],[A.up|A.bolt,true,false]]){
   const s=fresh(id,face);s.fighters[1].x=s.fighters[0].x+face*300;
   tick(s,1,input,crouch?A.down:0);tick(s,90,0,crouch?A.down:0);
   assert.equal(s.fighters[1].hp<1000,hit,`${id} input=${input} target crouched=${crouch}`);
  }
 });
}
check('crouched intent survives releasing Down, attack buffering, and hit-stop',()=>{
 for(const freeze of [0,5]){
  const s=fresh(),f=s.fighters[0];s.freeze=freeze;
  const p=shot(s,A.down|A.bolt);assert.ok(p.y>FLOOR-90);assert.equal(isCrouchingSpit(f),true);
 }
 const s=fresh(),f=s.fighters[0];f.move={id:'light',t:getMove(f,'light').startup+getMove(f,'light').active+getMove(f,'light').recovery-5,hit:false,connected:false,wave:-1};
 const p=shot(s,A.down|A.bolt);assert.ok(p.y>FLOOR-90);assert.equal(isCrouchingSpit(f),true);
});
check('jump-and-spit input survives hit-stop; opposing vertical inputs retain Up priority',()=>{
 for(const input of [A.up|A.bolt,A.up|A.down|A.bolt]){
  const s=fresh();s.freeze=5;const p=shot(s,input);assert.ok(s.fighters[0].y<FLOOR);assert.ok(p.y<FLOOR-115);assert.equal(p.vy,0);
 }
});
check('jump-height spit can actually hit an airborne opponent at its lane',()=>{
 const s=fresh();s.fighters[1].x=420;s.fighters[1].id='rivet';
 tick(s,1,A.up|A.bolt);tick(s,13);tick(s,1,0,A.up);tick(s,65);assert.ok(s.fighters[1].hp<1000);
});
console.log(`PASS: ${checks} directional spit groups across all five organic-spit fighters and both facings.`);
