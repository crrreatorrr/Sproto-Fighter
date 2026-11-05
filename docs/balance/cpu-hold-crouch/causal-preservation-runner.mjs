import assert from 'node:assert/strict';
import {writeFileSync}from'node:fs';
import {loadBalanceCore}from'/tmp/sproto-curve-diagnosis/scripts/lib/balance-core.mjs';
const base=await loadBalanceCore({entry:'/workspace/Sproto-Balance-I/src/core.ts'}),next=await loadBalanceCore({entry:'/workspace/Sproto-CPU-Hold-Crouch/src/core.ts'});
const causal=[];
for(const[label,core]of[['I',base],['T',next]]){
 const s=core.createState('rivet','versus','bront');for(let i=0;i<35;i++)core.step(s,[0,0]);s.fighters[0].x=500;s.fighters[1].x=560;
 for(const m of s.cpu)for(const o of m.observations){o.x=500;o.move=null;o.shot=false;}
 core.step(s,[core.A.light,0]);core.step(s,[0,core.A.down|core.A.light]);
 const frames=[];
 for(let i=0;i<5;i++){const input=core.cpuInput(s,1,4);core.step(s,[0,input]);const f=s.fighters[1];frames.push({frame:s.frame,input,hp:f.hp,move:f.move?.id,age:f.move?.t,hurtbox:core.getHurtbox(f)});}
 causal.push({label,highStartup:core.getMove(s.fighters[0],'light').startup,frames,hp:s.fighters[1].hp});
}
assert.ok(causal[0].hp<1000);assert.equal(causal[1].hp,1000);assert.equal(causal[0].frames[0].input,0);assert.equal(causal[1].frames[0].input,next.A.down);
let unchanged=0,stanceChanges=0;
for(const id of base.PLAYABLE_FIGHTERS){
 const s=base.createState(id,'versus','vela');for(let i=0;i<35;i++)base.step(s,[0,0]);const f=s.fighters[0],m=s.cpu[0];
 for(const skill of [1,2,3,4,5,6,7,8,9,10])for(const move of Object.keys(base.MOVES))for(const air of[false,true])for(const connected of[false,true])for(const status of['normal','stun','blockstun']){
  f.y=air?base.FLOOR-30:base.FLOOR;f.stun=status==='stun'?3:0;f.blockstun=status==='blockstun'?3:0;f.move={id:move,t:2,connected,hit:false,wave:-1};m.comboRoll=0;
  const before=base.hashState(s),a=base.cpuInput(s,0,skill),b=next.cpuInput(s,0,skill);assert.equal(base.hashState(s),before);
  if(a!==b){assert.equal(a,0);assert.equal(b,base.A.down);assert.ok(!air&&status==='normal'&&(move==='low'||move==='sweep'));stanceChanges++;}else unchanged++;
 }
}
const report={baseline:'efb5829c1230dac84337ba0212d92a84a527563b',causal,unchanged,stanceChanges,total:unchanged+stanceChanges,actors:base.PLAYABLE_FIGHTERS.length,result:'only grounded low/sweep commitment changes; protected paths identical; reads pure'};
writeFileSync('/tmp/sproto-T-causal-preservation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
