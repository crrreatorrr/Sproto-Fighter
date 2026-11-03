// Current-update QA: deterministic interaction matrix, not a proof of every input sequence.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=bundledCore();
const {A,FLOOR,WALL,WIDTH,PLAYABLE_FIGHTERS,createState,step}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
let checks=0,frames=0;
const check=(name,fn)=>{fn();checks++;console.log('PASS:',name);};
const tick=(s,n,a=0,b=0)=>{for(let i=0;i<n;i++)step(s,[a,b]);};
check('KO resolves either side and simultaneous zero health draws; completed rounds are immutable',()=>{
 for(const [a,b,w] of [[0,1000,1],[1000,0,0],[0,0,2]]){const s=createState();s.fighters[0].hp=a;s.fighters[1].hp=b;step(s,[0,0]);assert.equal(s.winner,w);assert.equal(s.throwState,null);const ended=JSON.stringify(s);tick(s,60,4095,4095);assert.equal(JSON.stringify(s),ended);}
});
check('every mode continues beyond the old 99-second boundary regardless of health advantage',()=>{
 for(const mode of ['cpu','dummy','guard'])for(const hp of [1000,999]){
  const s=createState('rivet',mode),replay=createState('rivet',mode);s.fighters[0].hp=replay.fighters[0].hp=hp;
  assert.equal('clock' in s,false);tick(s,12000);tick(replay,12000);
  assert.equal(s.frame,12000);assert.equal(s.winner,null);assert.equal(s.fighters[0].hp,hp);assert.deepEqual(s,replay);
  // Unlimited duration must not disable subsequent knockout resolution.
  s.fighters[1].hp=0;step(s,[0,0]);assert.equal(s.winner,0);
 }
});
check('held attack triggers once, released/repressed attack repeats',()=>{
 const s=createState('rivet','dummy');let starts=0,last=null;
 for(let i=0;i<180;i++){step(s,[A.light,0]);if(s.fighters[0].move&&!last)starts++;last=s.fighters[0].move;}assert.equal(starts,1);step(s,[0,0]);step(s,[A.light,0]);assert.equal(s.fighters[0].move.id,'light');
});
check('special without three charges is rejected; whiffs grant no charge',()=>{
 const s=createState('rivet','dummy');tick(s,120,A.special);assert.equal(s.fighters[0].move,null);assert.equal(s.fighters[0].pips,0);tick(s,1);tick(s,120,A.heavy);assert.equal(s.fighters[0].pips,0);
});
check('horizontal spit hits standing target and passes over grounded crouch',()=>{
 for(const crouch of [false,true]){const s=createState('rivet','cpu');s.fighters[1].x=600;step(s,[A.bolt,crouch?A.down:0]);tick(s,65,0,crouch?A.down:0);assert.equal(s.fighters[1].hp<1000,!crouch);}
});
check('all roster player/opponent combinations across CPU/dummy/guard retain finite bounded state and replay identically',()=>{
 const pattern=[0,A.right,A.left,A.up,A.down,A.light,A.medium,A.heavy,A.launcher,A.bolt,A.grab,A.special,A.dash,A.left|A.right,A.up|A.down,4095,A.up|A.right|A.medium,A.down|A.heavy];
 for(const [ai,id] of PLAYABLE_FIGHTERS.entries())for(const [bi,opponent] of PLAYABLE_FIGHTERS.entries())for(const mode of ['cpu','dummy','guard']){
  const s=createState(id,mode,opponent),r=createState(id,mode,opponent);s.fighters[1].x=r.fighters[1].x=455;
  for(let t=0;t<360;t++){const input=[pattern[(Math.floor(t/4)+ai)%pattern.length],pattern[(Math.floor(t/7)+bi+3)%pattern.length]];step(s,input);step(r,input);frames++;
   for(const f of s.fighters){for(const k of ['x','y','vx','vy','hp','pips'])assert.ok(Number.isFinite(f[k]),`${id}/${opponent}/${mode}/${k}`);assert.ok(f.x>=WALL&&f.x<=WIDTH-WALL);assert.ok(f.y<=FLOOR);assert.ok(f.hp>=0&&f.hp<=1000);assert.ok(f.pips>=0&&f.pips<=3);}
   if(s.throwState)assert.notEqual(s.throwState.attacker,s.throwState.victim);
  }assert.deepEqual(s,r,`${id}/${opponent}/${mode} replay`);
 }
});
console.log(`PASS: ${checks} broad QA groups; ${frames.toLocaleString()} scripted interaction frames plus focused outcomes. Physical input and visual quality require browser checks.`);
