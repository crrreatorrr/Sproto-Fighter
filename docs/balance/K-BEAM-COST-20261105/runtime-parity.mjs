import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {loadBalanceCore,sourceMetadata} from '/workspace/Sproto-Balance-K/scripts/lib/balance-core.mjs';
const old=await loadBalanceCore({entry:'/workspace/Sproto-Balance-I/src/core.ts'}),next=await loadBalanceCore({entry:'/workspace/Sproto-Balance-K/src/core.ts'});
let frames=0,moves=0,actors=0;
for(const id of old.PLAYABLE_FIGHTERS){
 assert.deepEqual(next.COMBAT_STYLES[id].projectile,old.COMBAT_STYLES[id].projectile,id+' geometry');
 if(old.COMBAT_STYLES[id].projectile.beamLength)continue;
 assert.deepEqual(next.COMBAT_STYLES[id],old.COMBAT_STYLES[id],id+' combat style');
 assert.deepEqual(next.ROSTER[id],old.ROSTER[id],id+' roster');
 const a=old.createState(id,'versus','rivet'),b=next.createState(id,'versus','rivet');
 for(const move of Object.keys(old.MOVES)){assert.deepEqual(next.getMove(b.fighters[0],move),old.getMove(a.fighters[0],move),id+' '+move);moves++;}
 for(let t=0;t<180;t++){
  const attack=[old.A.light,old.A.medium,old.A.heavy,old.A.bolt,old.A.grab,old.A.partner,old.A.special][Math.floor(t/23)%7]??0;
  const inputs=[t%23===0?attack:t%40<20?old.A.right:old.A.left,t%31===0?old.A.light:t%45<20?old.A.left:0];
  old.step(a,inputs);next.step(b,inputs);assert.deepEqual(b,a,id+' tick '+t);frames++;
 }
 actors++;
}
const report={candidate:sourceMetadata(),nonbeamActors:actors,moveComparisons:moves,identicalScriptedStateTicks:frames,all254GeometryIdentical:true};
writeFileSync('/tmp/sproto-K-runtime-parity.json',JSON.stringify(report,null,2)+'\n');console.log(report);
