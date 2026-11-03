// Verify the additive four-panel review uses the established lab's real-core
// fixtures and inputs. This is not visual approval of any rendered animation.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const coreSource=bundledCore();
const core=await import('data:text/javascript;base64,'+Buffer.from(coreSource).toString('base64'));
const old=read('art/pose-atlas-lab.html'),wall=read('art/motion-roster-lab.html');
const itinerary=html=>new Function(html.slice(html.indexOf('const motionReview=['),html.indexOf('];',html.indexOf('const motionReview=['))+2)+';return motionReview;')();
assert.deepEqual(itinerary(wall),itinerary(old),'wall must preserve all 52 advertised scenarios');
const oldBegin=old.slice(old.indexOf('function beginScenario()'),old.indexOf('function reset()'));
const oldInputs=old.slice(old.indexOf('function direction(f)'),old.indexOf('function advance()'));
const original=new Function('core','entry','values',`
 const {A,FLOOR,WALL,WIDTH,bodySpread,fighterWall,createState}=core;let s,age=0;const keys=new Set(),$=id=>({value:values[id]}),scenario=()=>entry;
 function draw(){}function gallery(){}${oldBegin}${oldInputs}
 beginScenario();return {state:s,input,settled,tick(){age++}};
`);
const wallCode=wall.slice(wall.indexOf('function createFixture('),wall.indexOf('function beginScenario()'));
const parallel=new Function('core','entry','values',`
 const {A,FLOOR,WIDTH,bodySpread,fighterWall,createState}=core;let age=0;const scenario=()=>entry;${wallCode}
 const state=createFixture(values.fighter,Number(values.facing),values.target,values.position);
 return {state,input:()=>input(state),settled:()=>settled(state),tick(){age++}};
`);
let cases=0,frames=0;
for(const fighter of core.PLAYABLE_FIGHTERS)for(const facing of [-1,1])for(const entry of itinerary(wall)){
 const values={fighter,target:'rivet',facing:String(facing),position:'center'};
 const a=original(core,entry,values),b=parallel(core,entry,values);assert.deepEqual(b.state,a.state);
 for(let n=0;n<900;n++){
  const x=a.input(),y=b.input();assert.deepEqual(y,x,`${fighter}/${facing}/${entry.label}/${n} input parity`);
  core.step(a.state,x);core.step(b.state,y);a.tick();b.tick();frames++;
  assert.equal(b.settled(),a.settled());
  if(n>=149&&a.settled())break;
  if(n===899)throw new Error(`${fighter}/${entry.label} failed to settle`);
 }
 assert.deepEqual(b.state,a.state,`${fighter}/${facing}/${entry.label} final state parity`);cases++;
}
// The wall's five-position fixture also preserves paired spacing at both edges.
for(const fighter of ['sproto704','sproto2210','bront','sproto1815'])for(const facing of [-1,1])for(const position of ['left corner','right corner','left wall','right wall'])for(const entry of itinerary(wall)){
 const values={fighter,target:'rivet',facing:String(facing),position};assert.deepEqual(parallel(core,entry,values).state,original(core,entry,values).state);cases++;
}
assert.ok(wall.includes('getDuoPoseDebug(f,s.frame,s.freeze>0)'),'both members must be identified in visible debug output');
assert.ok(wall.includes('c.scale(.72,.72)'),'camera does not fit/scale individual animation frames');
assert.ok(wall.includes('COMPLETE (not visually approved)'),'no automatic visual pass claim');
console.log(JSON.stringify({cases,coreFramesCompared:frames,owners:core.PLAYABLE_FIGHTERS.length,scenarios:itinerary(wall).length,status:'fixture/input parity passed',visual:'not performed by this script'}));
