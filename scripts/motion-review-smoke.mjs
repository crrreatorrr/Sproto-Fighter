// Exercise the actual lab itinerary/input code through the real combat core.
// This verifies that a review really reaches its advertised states; it does
// not mark the resulting animation as visually inspected.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=bundledCore();
const core=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const html=read('art/pose-atlas-lab.html');
const itineraryCode=html.slice(html.indexOf('const motionReview=['),html.indexOf('// Expose every itinerary action'));
const itinerary=new Function(itineraryCode+';return motionReview;')();
const begin=html.slice(html.indexOf('function beginScenario()'),html.indexOf('function reset()'));
const input=html.slice(html.indexOf('function direction(f)'),html.indexOf('function advance()'));
const makeRunner=new Function('core','entry','values',`
 const {A,FLOOR,WALL,WIDTH,bodySpread,fighterWall,createState}=core;
 let s,age=0;const keys=new Set(),$=id=>({value:values[id]}),scenario=()=>entry;
 function draw(){} function gallery(){}
 ${begin}
 ${input}
 beginScenario();return {get state(){return s},input:()=>input(),tick(){age++;},settled};
`);
assert.equal(itinerary.length,52,'keep the documented review-state count explicit');
for(const move of Object.keys(core.MOVES))assert.ok(itinerary.some(s=>s.expectedMove===move),'review must include '+move);
const report={owners:core.PLAYABLE_FIGHTERS.length,scenarios:itinerary.length,facings:[-1,1],cases:[],failures:[],limits:['Core/input scenario checks only. No browser playback or aesthetic approval.','Center scenarios cover all owners; five-position corner fixtures are not all visually inspected.','Entrance/defeat/partner effects remain separate real-match review.']};
for(const fighter of core.PLAYABLE_FIGHTERS)for(const facing of [-1,1])for(const entry of itinerary){
 const runner=makeRunner(core,entry,{fighter,target:'rivet',facing:String(facing),position:'center'}),s=runner.state,f=s.fighters[0];
 const seen=new Set(),throws=new Set();let airborne=false,sawDash=false,sawBlock=false,sawHit=false,takeoffs=0,ground=true,frames=0;
 try{
  for(;frames<900;frames++){
   core.step(s,runner.input());runner.tick();
   if(f.move)seen.add(f.move.id);
   if(s.throwState)throws.add(s.throwState.direction);
   if(f.blockstun)sawBlock=true;if(f.stun)sawHit=true;if(f.dash)sawDash=true;
   const nowGround=f.y>=core.FLOOR;if(ground&&!nowGround)takeoffs++;ground=nowGround;airborne ||= !nowGround;
   if(frames>=149&&runner.settled())break;
  }
  assert.ok(frames<900,'scenario must return control, not silently stall');
  if(entry.expectedMove)assert.ok(seen.has(entry.expectedMove),`expected ${entry.expectedMove}; saw ${[...seen]}`);
  if(entry.action.startsWith('air')||entry.action.startsWith('jump'))assert.ok(airborne,'actual takeoff required');
  if(entry.action==='jumpHeld')assert.equal(takeoffs,1,'held jump cannot retrigger');
  if(entry.action==='dash')assert.ok(sawDash,'actual dash required');
  if(entry.action.endsWith('Block')||entry.action==='block')assert.ok(sawBlock,'actual guard contact required');
  if(['hit','heavyHit','launchHit'].includes(entry.action))assert.ok(sawHit,'actual hit reaction required');
  if(['grab','victimThrow'].includes(entry.action))assert.ok(throws.has(entry.direction),'actual directional grab required');
  assert.equal(f.y,core.FLOOR,'recovered fighter returns to floor');
  report.cases.push({fighter,facing,scenario:entry.label,frames:frames+1,moves:[...seen],throws:[...throws],status:'core-pass',visual:'not checked by this script'});
 }catch(e){report.failures.push({fighter,facing,scenario:entry.label,error:e.message});}
}
if(process.argv[2]){mkdirSync(process.argv[2],{recursive:true});writeFileSync(process.argv[2]+'/itinerary-check.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({owners:report.owners,scenarios:report.scenarios,facings:report.facings,casesPassed:report.cases.length,failed:report.failures.length}));
for(const failure of report.failures.slice(0,16))console.error(failure);
if(report.failures.length)process.exitCode=1;
