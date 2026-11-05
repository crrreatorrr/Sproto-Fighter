import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const roots={I:'/workspace/Sproto-Balance-I',K:'/workspace/Sproto-Balance-K'};
const expected={I:'612b5e933e3e5b268ecef90db543d1572e8f4827a6d3db5a3fc1da7606d1bf3f',K:'d346b96d7f6b2f6463507c09d87052c560418a1c5b27c06bab6708272538a3ab'};
const sha=b=>createHash('sha256').update(b).digest('hex');
const own={},cores={};for(const [label,root]of Object.entries(roots)){own[label]=await import(pathToFileURL(root+'/scripts/lib/balance-core.mjs'));assert.equal(own[label].sourceMetadata().sourceSha256,expected[label]);cores[label]=await own[label].loadBalanceCore();}
const {playMatch,resolveSeatPair,matchSeeds,summarize}=await import(pathToFileURL(roots.I+'/scripts/lib/balance-runner.mjs'));
const beam=(core,id)=>(core.COMBAT_STYLES[id].projectile.beamLength??0)>0;
const ids=[...cores.I.PLAYABLE_FIGHTERS].sort(),beams=ids.filter(id=>beam(cores.I,id));assert.ok(beams.length>0);
const groups={};for(const id of ids.filter(id=>!beam(cores.I,id)))(groups[cores.I.BALANCE_KITS[id].archetype]??=[]).push(id);
assert.equal(Object.keys(groups).length,8);
const selected=Object.keys(groups).sort().map(archetype=>{const all=groups[archetype];assert.ok(all.length>=2);return {archetype,eligibleCount:all.length,indices:[0,Math.floor(all.length/2)],opponents:[all[0],all[Math.floor(all.length/2)]]};});
const opponents=selected.flatMap(g=>g.opponents);assert.equal(new Set(opponents).size,16);assert.deepEqual(ids,[...cores.K.PLAYABLE_FIGHTERS].sort());for(const id of ids){assert.equal(beam(cores.I,id),beam(cores.K,id));assert.equal(cores.I.BALANCE_KITS[id].archetype,cores.K.BALANCE_KITS[id].archetype);}
const selection={protocol:'Existing beam leads versus first and floor(N/2) lexically sorted nonbeam per canonical archetype; selection saved before outcomes',sources:Object.fromEntries(Object.entries(own).map(([k,v])=>[k,v.sourceMetadata()])),seed:20261105,skills:[4,7],repeats:8,bothSeats:true,maxFrames:3600,beamLeads:beams,groups:selected,opponents,helperSha256:sha(readFileSync(new URL(import.meta.url)))};
const selectionFile='/tmp/sproto-K-beam-preselection.json';
if(process.argv.includes('--select')){writeFileSync(selectionFile,JSON.stringify(selection,null,2)+'\n');console.log(JSON.stringify(selection,null,2));process.exit(0);}
const bytes=readFileSync(selectionFile);assert.deepEqual(JSON.parse(bytes),selection,'frozen preselection must match before simulating');
const result={selection,selectionSha256:sha(bytes),cells:{}};
for(const label of ['I','K']){
 const core=cores[label],levels=[];
 for(const skill of selection.skills){
  const matches=[];
  for(const lead of beams)for(const opponent of opponents)for(let repeat=0;repeat<selection.repeats;repeat++){
   const pair=[lead,opponent],initialSeeds=matchSeeds(selection.seed,pair,['cpu','cpu'],repeat),reverse=[opponent,lead];
   const a=playMatch(core,pair,{maxFrames:selection.maxFrames,skill,repeat,initialSeeds});
   const b=playMatch(core,reverse,{maxFrames:selection.maxFrames,skill,repeat,initialSeeds:[...initialSeeds].reverse()});resolveSeatPair(a,b);matches.push(a,b);
  }
  assert.equal(matches.length,beams.length*16*8*2);levels.push({skill,summary:summarize(core,matches),matches});assert.equal(own[label].sourceMetadata().sourceSha256,expected[label]);console.error(`${label} skill${skill}: ${matches.length} bouts`);
 }
 result.cells[label]={source:own[label].sourceMetadata(),levels};
}
const key=m=>JSON.stringify([m.skill,m.fighters,m.controllers,m.repeat,m.initialSeeds]);for(let i=0;i<2;i++)assert.deepEqual(result.cells.I.levels[i].matches.map(key),result.cells.K.levels[i].matches.map(key));
writeFileSync('/tmp/sproto-K-beam-counterfactual.json',JSON.stringify(result,null,2)+'\n');console.log('Wrote /tmp/sproto-K-beam-counterfactual.json');
