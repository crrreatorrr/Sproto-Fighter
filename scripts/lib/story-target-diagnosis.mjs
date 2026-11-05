// Diagnostic instruments, never a balance gate or a human-skill certification.
// node scripts/lib/story-target-diagnosis.mjs CORE_ROOT FIXED_HARNESS_ROOT OUT.json panel|endpoints|opening-sweep [REPEATS] [SOURCE_COMMIT]
// opening-sweep defaults to 64 independent seed pairs per skill; other defaults remain 8.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
const [coreArg, harnessArg, out, mode, repeatArg, sourceCommit] = process.argv.slice(2);
assert.ok(coreArg && harnessArg && out && ['panel','endpoints','opening-sweep'].includes(mode), 'supply core root, fixed harness root, output, panel|endpoints|opening-sweep, repetitions, source commit');
const coreRoot=resolve(coreArg), harnessRoot=resolve(harnessArg), repeats=Number(repeatArg??(mode==='opening-sweep'?64:8));
assert.ok(Number.isSafeInteger(repeats)&&repeats>0,'positive independent seed repetitions');
const at=name=>import(pathToFileURL(join(harnessRoot,'scripts/lib',name)).href);
const {loadBalanceCore}=await at('balance-core.mjs');
const {playMatch,matchSeeds}=await at('balance-runner.mjs');
const {runCurve,winInterval}=await at('balance-curve.mjs');
const {REFERENCE_BOT_VERSION}=await at('balance-bots.mjs');
const {bundle,dataUrl}=await at('load.mjs');
const sha=b=>createHash('sha256').update(b).digest('hex');
const referenceSha256=sha(readFileSync(join(harnessRoot,'scripts/lib/balance-bots.mjs')));
assert.equal(REFERENCE_BOT_VERSION,'reference-v2-persistent-delay18');
assert.equal(referenceSha256,'2aada800cc5ac2e80c41942a14db8a9a6bb8f541a8a9bc4cbdf5d640a364f4ff','fixed reference changed');
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);
const files=[join(coreRoot,'src/core.ts'),...walk(join(coreRoot,'src/sim'))].sort((a,b)=>relative(coreRoot,a).localeCompare(relative(coreRoot,b),'en'));
const sourceHash=createHash('sha256');
for(const path of files)sourceHash.update(relative(coreRoot,path)+'\0').update(readFileSync(path)).update('\0');
const core=await loadBalanceCore({entry:join(coreRoot,'src/core.ts')});
const {STORY_ENCOUNTERS:route}=await import(dataUrl(await bundle(join(coreRoot,'src/storyProgress.ts'))));
const {storyDifficulty}=await import(dataUrl(await bundle(join(coreRoot,'src/difficulty.ts'))));
const provenance={declaredSourceCommit:sourceCommit??null,simulationSourceSha256:sourceHash.digest('hex'),simVersion:readFileSync(join(coreRoot,'src/net/simVersion.ts'),'utf8').match(/SIM_VERSION = '([^']+)'/)[1],referenceBotVersion:REFERENCE_BOT_VERSION,referenceSha256,routeSha256:sha(JSON.stringify(route)),coreRoot,harnessRoot};
const seed=20261105,referenceFighter='highsproto',maxFrames=3600;
let report,naturalSeatAnalysis,resultSha256;
if(mode==='opening-sweep'){
 const first=route[0],skills=Array.from({length:10},(_,i)=>i+1),levels=[];
 assert.ok(first,'installed route must have an opening encounter');
 const actualMarkedBoss=!!first.gauntlet||first.index>=route.length-15;
 naturalSeatAnalysis=[];
 for(const skill of skills){
  // Reuse the actual-route encounter/wave seed namespace at every skill. The
  // override is diagnostic only; storyDifficulty and the product stay untouched.
  const curve=await runCurve(core,[first],()=>skill,{fighter:referenceFighter,seed,repeats,maxFrames});
  // Native runCurve's subset-length boss marker is not valid for this one row.
  const encounter={...curve.encounters[0],markedBoss:actualMarkedBoss};
  levels.push({skill,encounter});
  const trials=encounter.trials.filter(t=>t.referenceSlot===0),wins=trials.filter(t=>t.outcome==='cpu-win').length,losses=trials.filter(t=>t.outcome==='reference-win').length;
  const pairs=new Map();for(const t of encounter.trials){if(!pairs.has(t.repeat))pairs.set(t.repeat,[]);pairs.get(t.repeat).push(t.outcome);}
  naturalSeatAnalysis.push({id:first.id,index:first.index,skill,actualMarkedBoss,independentSeeds:repeats,cpuWins:wins,referenceWins:losses,draws:trials.length-wins-losses,rawCpuWinRate:wins/trials.length,decidedCpuWinRate:wins+losses?wins/(wins+losses):null,pointwiseWilson95:winInterval(wins,losses),discordantReverseSeats:[...pairs.values()].filter(p=>p[0]!==p[1]).length});
 }
 report={schemaVersion:1,config:{referenceFighter,seed,repeats,maxFrames,sourceRouteLength:route.length,firstEncounter:first,plannedStorySkill:storyDifficulty(first,route),testedSkills:skills,skillOverrideDiagnosticOnly:true,seedContext:'actual encounter.id + : + wave; common streams across skills',primaryReferenceSeat:0,reverseSeats:'paired bias audit, not extra independent repetitions'},levels,
  limitations:['Fixed reference v2 is an independent instrument, not a validated human model.','No story mapping or product CPU was modified.','Natural-seat pointwise intervals do not certify a scalar remap or simultaneous skill/route targets.','Reference and CPU seat swaps share streams; repeated skill levels also share common seed pairs.','Regular fighter waves only; dedicated transformed boss controllers are excluded.']};
 resultSha256=sha(JSON.stringify(levels));
}else if(mode==='endpoints'){
 report=await runCurve(core,[route[0],route.at(-1)],e=>storyDifficulty(e,route),{fighter:referenceFighter,seed,repeats,maxFrames});
 resultSha256=sha(JSON.stringify(report.encounters));
 naturalSeatAnalysis=report.encounters.map(e=>{
  const trials=e.trials.filter(t=>t.referenceSlot===0),wins=trials.filter(t=>t.outcome==='cpu-win').length,losses=trials.filter(t=>t.outcome==='reference-win').length;
  const pairs=new Map();for(const t of e.trials){if(!pairs.has(t.repeat))pairs.set(t.repeat,[]);pairs.get(t.repeat).push(t.outcome);}
  return {id:e.id,index:e.index,skill:e.skill,actualMarkedBoss:!!route[e.index].gauntlet||e.index>=route.length-15,independentSeeds:repeats,cpuWins:wins,referenceWins:losses,draws:trials.length-wins-losses,rawCpuWinRate:wins/trials.length,decidedCpuWinRate:wins+losses?wins/(wins+losses):null,pointwiseWilson95:winInterval(wins,losses),discordantReverseSeats:[...pairs.values()].filter(p=>p[0]!==p[1]).length};
 });
}else{
 const opponents=['highsproto','rivet','vela','bront','mox','sproto1815','duo','sirbitcoin','bigal','vaudream','zephyr'],skills=[1,4,7,10],rows=[],records=[];
 for(const opponent of opponents)for(const skill of skills){
  const row={opponent,archetype:core.BALANCE_KITS[opponent].archetype,skill,bySeat:[],seedPairs:[]};
  for(let repeat=0;repeat<repeats;repeat++){
   const pair=[];
   for(const referenceSlot of [0,1]){
    const ids=referenceSlot===0?[referenceFighter,opponent]:[opponent,referenceFighter],controllers=referenceSlot===0?['reference','cpu']:['cpu','reference'];
    const initialSeeds=matchSeeds(seed,ids,controllers,repeat,'curve-diagnosis-fixed-panel-v1');
    const bout=playMatch(core,ids,{skill,referenceSlot,initialSeeds,repeat,maxFrames});
    const result=bout.rawWinner===1-referenceSlot?'cpu-win':bout.rawWinner===referenceSlot?'reference-win':'draw';
    pair.push({referenceSlot,result,cpuHp:bout.hp[1-referenceSlot],cpuDamage:bout.totalDamage[1-referenceSlot],frames:bout.frames});records.push({opponent,skill,referenceSlot,result,...bout});
   }
   row.seedPairs.push({repeat,results:pair});
  }
  for(const referenceSlot of [0,1]){
   const bouts=row.seedPairs.flatMap(p=>p.results).filter(b=>b.referenceSlot===referenceSlot),wins=bouts.filter(b=>b.result==='cpu-win').length,losses=bouts.filter(b=>b.result==='reference-win').length;
   row.bySeat.push({referenceSlot,trials:bouts.length,cpuWins:wins,referenceWins:losses,draws:bouts.length-wins-losses,cpuWinRate:wins/bouts.length,meanCpuDamage:bouts.reduce((n,b)=>n+b.cpuDamage,0)/bouts.length});
  }
  rows.push(row);
 }
 report={opponents,skills,repeats,seed,referenceFighter,maxFrames,rows,records};resultSha256=sha(JSON.stringify(records));
}
writeFileSync(out,JSON.stringify({provenance,mode,repeats,diagnosticNotAcceptance:true,resultSha256,naturalSeatAnalysis,report},null,2)+'\n');
console.log(JSON.stringify({out,provenance,mode,repeats,resultSha256,naturalSeatAnalysis},null,2));
