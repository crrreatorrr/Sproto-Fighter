import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { loadBalanceCore } from '/tmp/sproto-curve-diagnosis/scripts/lib/balance-core.mjs';
import { playMatch, matchSeeds } from '/tmp/sproto-curve-diagnosis/scripts/lib/balance-runner.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
function source(root,commit){const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):[join(d,e.name)]),h=createHash('sha256');for(const f of [join(root,'src/core.ts'),...walk(join(root,'src/sim'))].sort((a,b)=>relative(root,a).localeCompare(relative(root,b),'en')))h.update(relative(root,f)+'\0').update(readFileSync(f)).update('\0');return{commit,sourceSha256:h.digest('hex'),simVersion:readFileSync(join(root,'src/net/simVersion.ts'),'utf8').match(/SIM_VERSION = '([^']+)'/)[1]};}
const roots=[['I','/workspace/Sproto-Balance-I','efb5829c1230dac84337ba0212d92a84a527563b'],['K','/workspace/Sproto-CPU-Own-Kit','531c32cae']];
const cores=await Promise.all(roots.map(async([label,root,commit])=>({label,core:await loadBalanceCore({entry:join(root,'src/core.ts')}),source:source(root,commit)})));
const base=cores[0].core,roles=['Pressure','Footwork','Brawler','Weapon','Paired','Counter','Hover','Zoning'];
const fighters=roles.map(role=>base.PLAYABLE_FIGHTERS.find(id=>base.BALANCE_KITS[id].archetype===role&&!base.COMBAT_STYLES[id].projectile.beamLength));
fighters.push(base.PLAYABLE_FIGHTERS.find(id=>!!base.COMBAT_STYLES[id].projectile.beamLength));
const rows=[];
for(const {label,core}of cores){
 for(const skill of [4,7])for(let a=0;a<fighters.length;a++)for(let b=a+1;b<fighters.length;b++)for(let repeat=0;repeat<2;repeat++)for(const reverse of [false,true]){
  const ids=reverse?[fighters[b],fighters[a]]:[fighters[a],fighters[b]],initialSeeds=matchSeeds(20261105,ids,['cpu','cpu'],repeat,'own-kit-freefight-diagnostic-v1');
  rows.push({label,...playMatch(core,ids,{skill,repeat,initialSeeds,maxFrames:3600})});
 }
 console.log(label,'completed',rows.filter(r=>r.label===label).length,'bouts');
}
const summaries=[];
for(const {label}of cores)for(const skill of [4,7]){
 const bouts=rows.filter(r=>r.label===label&&r.skill===skill),byFighter=fighters.map(id=>{const matches=bouts.filter(b=>b.fighters.includes(id));let wins=0,losses=0,draws=0;for(const b of matches){const slot=b.fighters.indexOf(id);if(b.rawWinner===slot)wins++;else if(b.rawWinner!==null)losses++;else draws++;}return{id,archetype:base.BALANCE_KITS[id].archetype,beam:!!base.COMBAT_STYLES[id].projectile.beamLength,n:matches.length,rawWins:wins,rawLosses:losses,rawDraws:draws,rawWinRate:wins/matches.length};});
 summaries.push({label,skill,bouts:bouts.length,rawDraws:bouts.filter(b=>b.rawWinner===null).length,meanSeconds:bouts.reduce((s,b)=>s+b.frames,0)/bouts.length/60,byFighter});
}
const report={diagnosticNotAcceptance:true,source:cores.map(({label,source})=>({label,...source})),instrument:{seed:20261105,context:'own-kit-freefight-diagnostic-v1',skills:[4,7],repeats:2,cap:3600,fighters,selection:'first public non-beam fighter in each archetype plus first public beam profile',bothSeats:'paired common fighter seed streams, not independent repetitions',controllers:'production CPU in both seats; no reference'},summaries,rows};
writeFileSync('/tmp/sproto-own-kit-panel.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(summaries,null,2));
