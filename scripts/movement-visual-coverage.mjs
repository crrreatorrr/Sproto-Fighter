// Summarize explicit reviewer records, never infer a visual pass from a test.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import ts from 'typescript';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const evidence='docs/evidence/movement-followup-20261102/';
const load=name=>JSON.parse(read(evidence+name+'.json'));
const code=bundledCore();
const core=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const lab=read('art/pose-atlas-lab.html');
const itinerary=new Function(lab.slice(lab.indexOf('const motionReview=['),lab.indexOf('// Expose every itinerary action'))+';return motionReview;')();
const rows=new Map();
const facingValues=value=>value==='both'?[-1,1]:[value==='left'?-1:value==='right'?1:Number(value)];
function add(id,reviewer,facings,states,count,unit,gaps,findings,status='sampled browser observations; not every-frame or full-match approval'){
  assert.ok(core.PLAYABLE_FIGHTERS.includes(id),`Unknown reviewed owner ${id}`);
  assert.ok(!rows.has(id),`Duplicate owner ${id}`);
  rows.set(id,{id,name:core.ROSTER[id].name,bodies:core.bodyAtlasIds(id),reviewer,
    status,
    facings:[...new Set(facings.flatMap(facingValues))].sort(),states:[...new Set(states)],observationCount:count,countUnit:unit,
    gaps,findings,record:evidence+reviewer+'.json'});
}
const a=load('live-roster-a');
for(const f of a.fighters)if(!f.paired){
  const narrative=f.states.some(s=>s.scenario===undefined);
  add(f.id,'live-roster-a',f.states.map(s=>s.facing),f.states.flatMap(s=>s.scenario===undefined?s.observed:[itinerary[s.scenario].label]),narrative?f.states.length:f.states.reduce((n,s)=>n+s.capturedSamples,0),narrative?'narrative facing records':'listed scenario samples',f.gaps??a.limitations,f.findings);
}
const b=load('live-roster-b');
for(const f of b.fighters)if(!f.paired)add(f.id,'live-roster-b',f.actualFacingsObserved,f.observedStates,f.observations.length,'inspected phase observations',f.remainingGaps??b.limitations,f.findings);
const c=load('live-roster-c');
for(const f of c.fighters)if(!f.paired)add(f.id,'live-roster-c',f.actualFacingsObserved,f.observed.map(s=>itinerary[s.scenario].label),f.observed.length,'inspected phase observations',f.notChecked??c.limitations,f.findings);
const r=load('live-pairs-root');
for(const [id,f]of Object.entries(r.fighters))add(id,'live-pairs-root',f.actualFacings,f.observedScenarios,f.captures.length,'inspected owner screenshot samples',r.limits,f.findings);
const pb=load('live-pairs-b');
for(const f of pb.owners)add(f.id,'live-pairs-b',f.actualLeadFacingsInspected,f.inspectedStateFamilies,pb.inspections.filter(s=>s.visualInspection==='inspected'&&s.owners.includes(f.id)).length,'inspected owner screenshot samples',f.remaining,f.notes);
const pc=load('live-pairs-c');
for(const f of pc.fighters){
  const seen=f.actual_facing_visually_sampled;
  add(f.id,'live-pairs-c',Object.keys(seen).filter(k=>seen[k].length).map(Number),Object.values(seen).flat().map(i=>itinerary[i].label),Object.values(seen).reduce((n,s)=>n+s.length,0),'scenario/facing combinations with visual samples',[...pc.limitations,...(pc.captured_only_or_unobserved??[])],[...f.observations,...(f.unresolved_contact_findings??[]),...(pc.residuals??[])]);
}
const theo=load('live-theo');
add('theo','live-theo',theo.facings,theo.states,theo.observationCount,theo.countUnit,theo.gaps,theo.findings);
const batch=load('live-batch-nov03');
for(const entry of [...batch.fighters,...batch.mergeBaseFighters]){
  add(entry.id,'live-batch-nov03',[-1,1],batch.states,entry.samples,'inspected atlas samples',
    batch.limits,entry.findings,'atlas samples inspected; runtime transform audit covers both facings');
}
const late=load('live-batch-nov03-late');
for(const entry of late.fighters){
  add(entry.id,'live-batch-nov03-late',[-1,1],late.states,entry.samples,'inspected atlas samples',
    late.limits,entry.findings,'atlas samples inspected; runtime transform audit covers both facings');
}
const pending=core.PLAYABLE_FIGHTERS.filter(id=>!rows.has(id));
const ordered=core.PLAYABLE_FIGHTERS.filter(id=>rows.has(id)).map(id=>rows.get(id));
for(const row of ordered)assert.deepEqual(row.facings,[-1,1],`${row.name}: review coverage must include both facings`);
const summary={date:batch.date,pending,owners:ordered.length,singleBodyOwners:ordered.filter(r=>r.bodies.length===1).length,pairedOwners:ordered.filter(r=>r.bodies.length===2).length,bodyAtlases:ordered.reduce((n,r)=>n+r.bodies.length,0),everyFrameVisuallyApproved:0,limits:['Counts use different explicit units; do not add them as comparable frames.','Each record names observed samples and unobserved states. Capturing an automatic sweep is not a visual pass.','Normal-match event effects and all opponent/stage permutations were not reviewed for every owner.'],fighters:ordered};
writeFileSync(new URL('../'+evidence+'live-coverage.json',import.meta.url),JSON.stringify(summary,null,2)+'\n');
const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const columns=['id','name','body atlases','reviewer','actual facings','count','count unit','observed states','gaps','record'];
const lines=ordered.map(r=>[r.id,r.name,r.bodies.join('; '),r.reviewer,r.facings.join('; '),r.observationCount,r.countUnit,r.states.join('; '),JSON.stringify(r.gaps),r.record].map(quote).join(','));
writeFileSync(new URL('../'+evidence+'live-coverage.csv',import.meta.url),[columns.map(quote).join(','),...lines].join('\n')+'\n');
console.log(`Recorded ${summary.owners} individually reviewed owners: ${summary.singleBodyOwners} singles, ${summary.pairedOwners} pairs, ${summary.bodyAtlases} body atlases; both facings covered. Every-frame approval:0.`);
assert.equal(pending.length,0,`Missing individual review records: ${pending.join(', ')}`);
