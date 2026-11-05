import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { loadBalanceCore } from '/tmp/sproto-curve-diagnosis/scripts/lib/balance-core.mjs';
const before=await loadBalanceCore({entry:'/workspace/Sproto-Balance-I/src/core.ts'}),after=await loadBalanceCore({entry:'/workspace/Sproto-CPU-Own-Kit/src/core.ts'});
let comparisons=0;const paths={};
for(const id of before.PLAYABLE_FIGHTERS){
 const state=before.createState(id,'versus','vela');for(let i=0;i<35;i++)before.step(state,[0,0]);
 const f=state.fighters[0],p=state.fighters[1],m=state.cpu[0];m.intent='zone';m.decisionAt=state.frame;m.comboRoll=0;
 for(const o of m.observations)Object.assign(o,{hp:1000,move:null,age:0,attacks:3,lows:0,projectiles:3,shot:false,y:before.FLOOR,combatTick:m.combatTicks,attackRoll:0,input:0});
 for(const skill of [1,4,7,10])for(const gap of [35,70,120,180,280,400])for(const path of ['close','air','blockstun','incoming','shot','combo','committed']){
  if(path==='close'&&gap>200||path==='incoming'&&gap>=220)continue;
  f.x=300;p.x=f.x+gap+before.bodySpread(id)+before.bodySpread(p.id);f.y=path==='air'?before.FLOOR-100:before.FLOOR;f.blockstun=path==='blockstun'?3:0;f.move=path==='combo'?{id:'light',t:8,connected:true}:path==='committed'?{id:'heavy',t:2,connected:false}:null;
  for(const o of m.observations)Object.assign(o,{x:p.x,shot:path==='shot',move:path==='incoming'?'light':null,startup:100,active:3,recovery:10});
  for(let sample=0;sample<8;sample++){
   m.choice=(sample+.5)/8*(path==='shot'?before.cpuTuning(skill).guard:1);
   assert.equal(after.cpuInput(state,0,skill),before.cpuInput(state,0,skill),`${id}/${skill}/${gap}/${path}/${sample}`);comparisons++;paths[path]=(paths[path]??0)+1;
  }
 }
}
const report={baseline:'efb5829c1230dac84337ba0212d92a84a527563b',actors:before.PLAYABLE_FIGHTERS.length,skills:[1,4,7,10],comparisons,paths,result:'identical inputs for all protected paths'};writeFileSync('/tmp/sproto-own-kit-preservation.json',JSON.stringify(report,null,2)+'\n');console.log(report);
