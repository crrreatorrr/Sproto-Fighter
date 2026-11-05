// Offline bounded panel; run from repository root. Optional argv[2] sets JSON output.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {bundle,dataUrl} from '../../../scripts/lib/load.mjs';
import {loadBalanceCore,instrumentCombat,sourceMetadata} from '../../../scripts/lib/balance-core.mjs';
import {playMatch,matchSeeds} from '../../../scripts/lib/balance-runner.mjs';
const candidate=await loadBalanceCore();
const baseline=await import(dataUrl(await bundle('src/core.ts',{plugins:[{name:'baseline',setup(build){build.onLoad({filter:/\/src\/(?:core|sim\/(?:combat|cpu))\.ts$/},args=>{let contents=readFileSync(args.path,'utf8');if(args.path.endsWith('/sim/cpu.ts'))contents=execFileSync('git',['show','7b1ab9d19:src/sim/cpu.ts'],{encoding:'utf8'});if(args.path.endsWith('/sim/combat.ts'))contents=instrumentCombat(contents);if(args.path.endsWith('/src/core.ts'))contents+="\nexport {__balanceReset,__balanceRead} from './sim/combat';\n";return {contents,loader:'ts'};});}}]})));
const source=sourceMetadata(), rows=[];
const cases=[];
for(const opp of ['highsproto','rivet','vela','bront','sproto2789'])for(const skill of [4,7])for(let repeat=0;repeat<2;repeat++)for(const reverse of [false,true])cases.push({panel:'mox-vs-representatives',ids:reverse?[opp,'mox']:['mox',opp],skill,repeat,referenceSlot:null});
for(const id of ['mox','vela','rivet','bront','d86','sproto2789'])for(const skill of [1,4,7,10])for(let repeat=0;repeat<2;repeat++)for(const reverse of [false,true])cases.push({panel:'projectile-vs-reference',ids:reverse?['highsproto',id]:[id,'highsproto'],skill,repeat,referenceSlot:reverse?0:1});
for(const [label,core] of [['F',baseline],['J',candidate]]){
let count=0;
for(const c of cases){const controllers=[0,1].map(s=>s===c.referenceSlot?'reference':`cpu-${c.skill}`);const initialSeeds=matchSeeds(20261105,c.ids,controllers,c.repeat,'J-threat-panel');const match=playMatch(core,c.ids,{skill:c.skill,referenceSlot:c.referenceSlot,initialSeeds,maxFrames:3600,repeat:c.repeat});rows.push({label,panel:c.panel,...match});if(++count%32===0)console.error(label,count,cases.length);}
}
writeFileSync(process.argv[2] ?? '/tmp/sproto-projectile-threat-panel.json',JSON.stringify({source,baseline:'7b1ab9d19',candidate:source.commit,seed:20261105,rows},null,2)+'\n');
for(const label of ['F','J'])for(const panel of ['mox-vs-representatives','projectile-vs-reference'])for(const skill of [1,4,7,10]){const group=rows.filter(r=>r.label===label&&r.panel===panel&&r.skill===skill);if(!group.length)continue;let wins=0,losses=0,rawDraws=0;for(const r of group){const slot=panel==='mox-vs-representatives'?r.fighters.indexOf('mox'):r.controllers.indexOf('cpu');if(r.winner===slot)wins++;else if(r.winner!==null)losses++;if(r.rawWinner===null)rawDraws++;}console.log(JSON.stringify({label,panel,skill,n:group.length,wins,losses,rawDraws}));}
