// Read-only source expansion with exact pilot reuse and atomic per-level checkpoints.
// node /tmp/expand-sproto-panel.mjs PILOT.json FROZEN_ROOT SAMPLES OUT_PREFIX [--validate-only]
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const [pilotFile,repo,sampleText,out,...flags]=process.argv.slice(2),samples=Number(sampleText);
assert.ok(pilotFile&&repo&&out&&Number.isSafeInteger(samples)&&samples>0,'need pilot, frozen checkout, target samples and output prefix');
const bytes=readFileSync(pilotFile),pilot=JSON.parse(bytes),hash=x=>createHash('sha256').update(x).digest('hex');
const helperSha256=hash(readFileSync(fileURLToPath(import.meta.url)));
const root=resolve(repo),own=await import(pathToFileURL(root+'/scripts/lib/balance-core.mjs').href);
const runner=await import(pathToFileURL(root+'/scripts/lib/balance-runner.mjs').href);
const { markdown }=await import(pathToFileURL(root+'/scripts/balance-tournament.mjs').href);
const source={...own.sourceMetadata(),cpuHasSkillParameter:true};
const guard=()=>{const now=own.sourceMetadata();for(const k of ['sourceSha256','simVersion','harnessSha256'])assert.equal(now[k],source[k],`frozen ${k} changed during expansion`);};
for(const k of ['sourceSha256','simVersion','harnessSha256'])assert.equal(source[k],pilot.source[k],`pilot and source differ: ${k}`);
assert.equal(pilot.config.bot,'cpu');assert.equal(pilot.config.matchDepth??false,false);assert.equal(pilot.config.repeats,2);assert.equal(pilot.config.seed,20261105);assert.equal(pilot.config.maxFrames,3600);
assert.deepEqual(pilot.config.skills,[4,7]);assert.ok(samples>=pilot.config.samples,'expansion cannot remove pilot coverage');
const core=await own.loadBalanceCore();assert.ok(core.CPU_SKILLS?.includes(4)&&core.CPU_SKILLS.includes(7));
assert.deepEqual([...core.PLAYABLE_FIGHTERS].sort(),pilot.config.roster);
const schedule=runner.makeSchedule(pilot.config.roster,samples,pilot.config.seed),pairKey=p=>[...p].sort().join(':');
const fullPairs=new Set(schedule.map(pairKey));for(const p of pilot.config.schedule)assert.ok(fullPairs.has(pairKey(p)),'pilot pair absent from expanded panel');
const key=m=>JSON.stringify([m.skill,m.fighters,m.controllers,m.repeat,m.initialSeeds]);
function verify(m,skill){
 assert.equal(m.skill,skill);assert.ok(fullPairs.has(pairKey(m.fighters)));assert.deepEqual(m.controllers,['cpu','cpu']);
 assert.ok(Number.isSafeInteger(m.repeat)&&m.repeat>=0&&m.repeat<pilot.config.repeats);
 assert.deepEqual(m.initialSeeds,runner.matchSeeds(pilot.config.seed,m.fighters,m.controllers,m.repeat),'recorded initial seeds must exactly match current stream derivation');
 assert.ok(Number.isSafeInteger(m.inputHash)&&Number.isSafeInteger(m.finalHash),'reused input/state hashes required');
}
const configs={...pilot.config,samples,schedule};
const pilotCaches=new Map();for(const l of pilot.levels){const map=new Map();for(const m of l.matches){verify(m,l.skill);assert.ok(!map.has(key(m)),'duplicate pilot key');map.set(key(m),m);}assert.equal(map.size,pilot.config.schedule.length*pilot.config.repeats*2);pilotCaches.set(l.skill,map);}
console.log(JSON.stringify({mode:flags.includes('--validate-only')?'validation':'expansion',source,pilotSha256:hash(bytes),helperSha256,pilotPairs:pilot.config.schedule.length,targetPairs:schedule.length,missingPairs:schedule.length-pilot.config.schedule.length,reusedBouts:[...pilotCaches.values()].reduce((n,m)=>n+m.size,0),newBouts:(schedule.length-pilot.config.schedule.length)*pilot.config.repeats*2*pilot.config.skills.length}));
if(flags.includes('--validate-only'))process.exit(0);
const atomic=(path,value)=>{const temporary=path+'.tmp';writeFileSync(temporary,JSON.stringify(value,null,2)+'\n');renameSync(temporary,path);};
const levels=[],reuse=[];
for(const skill of pilot.config.skills){
 guard();const cache=new Map(pilotCaches.get(skill)),original=pilotCaches.get(skill),checkpoint=out+`.checkpoint-skill-${skill}.json`;
 let checkpointReused=0,newBouts=0;
 if(existsSync(checkpoint)){
  const saved=JSON.parse(readFileSync(checkpoint));assert.equal(saved.helperSha256,helperSha256,'checkpoint helper differs');
  for(const k of ['sourceSha256','simVersion','harnessSha256'])assert.equal(saved.source[k],source[k]);
  assert.deepEqual(saved.config,configs);assert.equal(saved.skill,skill);
  for(const m of saved.matches){verify(m,skill);const k=key(m);if(cache.has(k))assert.equal(JSON.stringify(cache.get(k)),JSON.stringify(m),'checkpoint altered pilot record');else{cache.set(k,m);checkpointReused++;}}
 }
 const matches=[];
 for(let index=0;index<schedule.length;index++){
  const pair=schedule[index],reverse=[...pair].reverse();
  for(let repeat=0;repeat<pilot.config.repeats;repeat++){
   const initialSeeds=runner.matchSeeds(pilot.config.seed,pair,['cpu','cpu'],repeat);
   const aKey=key({skill,fighters:pair,controllers:['cpu','cpu'],repeat,initialSeeds});
   const bKey=key({skill,fighters:reverse,controllers:['cpu','cpu'],repeat,initialSeeds:[...initialSeeds].reverse()});
   assert.equal(cache.has(aKey),cache.has(bKey),'incomplete reverse-seat pair in saved data');
   let first=cache.get(aKey),second=cache.get(bKey);
   if(!first){
    first=runner.playMatch(core,pair,{maxFrames:pilot.config.maxFrames,skill,repeat,initialSeeds});
    second=runner.playMatch(core,reverse,{maxFrames:pilot.config.maxFrames,skill,repeat,initialSeeds:[...initialSeeds].reverse()});
    runner.resolveSeatPair(first,second);verify(first,skill);verify(second,skill);cache.set(aKey,first);cache.set(bKey,second);newBouts+=2;
   }
   matches.push(first,second);
  }
  if((index+1)%100===0)console.error(`${out} skill${skill}: ${index+1}/${schedule.length} pairs; new${newBouts}, checkpointReuse${checkpointReused}`);
  if((index+1)%250===0){guard();atomic(checkpoint,{source,helperSha256,config:configs,skill,matches});}
 }
 assert.equal(matches.length,schedule.length*pilot.config.repeats*2);
 const finalMap=new Map(matches.map(m=>[key(m),m]));for(const [k,m]of original)assert.equal(JSON.stringify(finalMap.get(k)),JSON.stringify(m),'pilot record changed during expansion');
 guard();atomic(checkpoint,{source,helperSha256,config:configs,skill,matches});
 const level={skill,summary:runner.summarize(core,matches),matches};levels.push(level);reuse.push({skill,pilotBouts:original.size,checkpointReusedBouts:checkpointReused,newlySimulatedBouts:newBouts,finalBouts:matches.length});
 atomic(out+`.skill-${skill}.json`,{source,helperSha256,config:{...configs,skills:[skill]},levels:[level],pilotSha256:hash(bytes)});
 console.log(`Completed skill${skill}: ${matches.length} bouts; new${newBouts}; reused pilot${original.size}`);
}
guard();const report={...pilot,source,config:configs,levels,expansion:{pilotFile,pilotSha256:hash(bytes),pilotSource:pilot.source,pilotConfig:pilot.config,helperSha256,command:process.argv.join(' '),method:'Only missing pair/repetition streams simulated; original pilot records retained byte-equivalently after JSON parse; source/harness/version guards and atomic checkpoints',levels:reuse}};
atomic(out+'.json',report);writeFileSync(out+'.md',markdown(report));
console.log(`Completed expanded panel ${out}.{json,md}`);
