import{writeFileSync}from'node:fs';
import{loadBalanceCore}from'/workspace/Sproto-Metrics/scripts/lib/balance-core.mjs';
import{playMatch,matchSeeds}from'/workspace/Sproto-Metrics/scripts/lib/balance-runner.mjs';
for(const[name,entry]of[['T','/workspace/Sproto-CPU-Hold-Crouch/src/core.ts']]){
 const core=await loadBalanceCore({entry}),pairs=[];let wins=0,losses=0,draws=0,mismatch=0;
 for(let repeat=0;repeat<256;repeat++){
  const seats=[];
  for(const referenceSlot of[0,1]){
   const ids=referenceSlot===0?['highsproto','zephyr']:['zephyr','highsproto'];
   const controllers=referenceSlot===0?['reference','cpu']:['cpu','reference'];
   const initialSeeds=matchSeeds(20261105,ids,controllers,repeat,'story-v1-zephyr:0');
   const bout=playMatch(core,ids,{maxFrames:3600,skill:1,referenceSlot,initialSeeds,repeat});
   const outcome=bout.rawWinner===1-referenceSlot?'cpu-win':bout.rawWinner===referenceSlot?'reference-win':'draw';
   seats.push({referenceSlot,outcome,...bout});
  }
  if(seats[0].outcome==='cpu-win')wins++;else if(seats[0].outcome==='reference-win')losses++;else draws++;
  if(seats[0].outcome!==seats[1].outcome)mismatch++;
  pairs.push({repeat,seats});
 }
 const report={entry,reference:'reference-v2-persistent-delay18',config:{seed:20261105,repeats:256,maxFrames:3600,context:'story-v1-zephyr:0',referenceFighter:'highsproto',opponent:'zephyr',skill:1,actualMarkedBoss:false},summary:{wins,losses,draws,rate:wins/(wins+losses),reverseSeatMismatches:mismatch},pairs};
 writeFileSync('/tmp/sproto-T-first-'+name+'.json',JSON.stringify(report,null,2)+'\n');console.log(name,report.summary);
}
