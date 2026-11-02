// Playback/asset-contract checks. Fake image loading is NOT visual/browser QA.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=(path)=>ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const coreUrl=url(compile('../src/core.ts'));
const eventsUrl=url(compile('../src/animationEvents.ts'));
const core=await import(coreUrl);
const poses=await import(url(compile('../src/poseAtlas.ts').replace("from './core'",`from '${coreUrl}'`).replace("from './animationEvents'",`from '${eventsUrl}'`)));
const original=JSON.parse(readFileSync(new URL('../public/fighters/pose-atlas.json',import.meta.url),'utf8'));
let manifest=structuredClone(original);
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class {
  set src(value){this.url=value;try{const p=value.split('?')[0];const b=readFileSync(new URL('../public'+p,import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}catch{queueMicrotask(()=>this.onerror());}}
};
const {A,FLOOR,createState,step,PLAYABLE_FIGHTERS,THROW_GRIPS,WIDTH}=core;
const {loadPoseAtlases,getPoseAtlasDebug,drawPoseAtlas,setPoseAtlasThrowState,getPoseAtlasLoadStatus,isPoseAtlasDeclared,getPoseAtlasReactionTransform}=poses;
await loadPoseAtlases();assert.equal(getPoseAtlasLoadStatus().ids.length,Object.keys(original.fighters).length);
let count=0;
const check=(name,fn)=>{fn();count++;console.log('PASS:',name);};
check('all selectable fighters: complete forward/reverse gait, hitstop, and neutral guard after stopping',()=>{
 for(const id of PLAYABLE_FIGHTERS){
  const s=createState(id,'dummy');s.fighters[1].x=1100;const f=s.fighters[0];
  getPoseAtlasDebug(f,0);const seen=new Set();
  for(let t=0;t<44;t++){step(s,[A.right,0]);seen.add(getPoseAtlasDebug(f,s.frame).frameIndex);}
  assert.equal(seen.size,original.fighters[id].walkFrames.length,id+' complete gait');const before=getPoseAtlasDebug(f,s.frame);
  step(s,[A.left,0]);const frozen=getPoseAtlasDebug(f,s.frame,true);assert.equal(frozen.walkPhase,before.walkPhase,id+' frozen travel');
  for(let t=0;t<4;t++){step(s,[A.left,0]);getPoseAtlasDebug(f,s.frame);}
  const reverseBefore=getPoseAtlasDebug(f,s.frame).walkPhase;
  step(s,[A.left,0]);const reverseAfter=getPoseAtlasDebug(f,s.frame).walkPhase;
  const wrappedDelta=(reverseAfter-reverseBefore+1)%1;
  assert.ok(wrappedDelta>.85&&wrappedDelta<1,id+' backward movement must reverse the gait phase');
  for(let t=0;t<95;t++){step(s,[A.left,0]);getPoseAtlasDebug(f,s.frame);}
  for(let t=0;t<3;t++){step(s,[0,0]);getPoseAtlasDebug(f,s.frame);}
  assert.equal(f.vx,0);assert.equal(getPoseAtlasDebug(f,s.frame).slot,0,id+' stop must enter guard, not global-clock breath');
 }
});
check('all 21 core grips agree with installed per-fighter hand/torso art metadata',()=>{
 for(const id of PLAYABLE_FIGHTERS.filter(id=>id!=='duo')){const cfg=original.fighters[id];for(const [label,slot]of [['hand',26],['torso',24]]){
  const point=cfg.holdContact[label],anchor=cfg.frames[slot].anchor??cfg.anchor;
  assert.deepEqual(THROW_GRIPS[id][label],[(point[0]-anchor[0])*cfg.scale,(point[1]-anchor[1])*cfg.scale],id+' '+label);
 }}
});
check('all 441 held pairs: draw uses actual core placement without secondary offsets or core mutation',()=>{
 for(const aid of PLAYABLE_FIGHTERS.filter(id=>id!=='duo'))for(const bid of PLAYABLE_FIGHTERS.filter(id=>id!=='duo')){
  const s=createState(aid,'dummy',bid);s.fighters[0].x=500;s.fighters[1].x=560;step(s,[A.grab,0]);
  for(let t=0;t<50&&!(s.throwState?.phase==='hold'&&s.throwState.t===5);t++)step(s,[0,0]);
  assert.equal(s.throwState?.phase,'hold');setPoseAtlasThrowState(s.throwState,s.fighters);
  const [a,b]=s.fighters;let translation;const ctx={save(){},restore(){},scale(){},rotate(){},drawImage(){},translate(x,y){translation=[x,y]}};
  const before=JSON.stringify(s);drawPoseAtlas(ctx,b,s.frame);assert.equal(JSON.stringify(s),before);
  assert.deepEqual(translation,[Math.round(b.x),Math.round(b.y)],'no presentation-only contact correction');
  assert.equal(getPoseAtlasDebug(a,s.frame).slot,26);
 }
 setPoseAtlasThrowState(null,[]);
});
check('all 21 knockdown transforms: both facings, flight/down/rise, floor/camera bounds and nonmutation',()=>{
 for(const id of PLAYABLE_FIGHTERS.filter(id=>id!=='duo'))for(const facing of [1,-1])for(const x of [80,600,1200])for(const phase of ['flight','down','rise'])for(const t of [0,4,10,18,35]){
  const s=createState(id,'cpu'),f=s.fighters[0];f.x=x;f.facing=facing;f.y=phase==='flight'?FLOOR-80:FLOOR;f.stun=20;f.reaction={kind:'knockdown',phase,t,direction:-facing};
  const before=JSON.stringify(s);const transform=getPoseAtlasReactionTransform(f);assert.equal(JSON.stringify(s),before);assert.ok([transform.x,transform.y,transform.angle].every(Number.isFinite));
  if(transform.angle){for(const [cx,cy]of transform.corners){assert.ok(transform.y+cy<=FLOOR+1e-8,id+' floor');assert.ok(transform.x+cx>=5.999&&transform.x+cx<=WIDTH-5.999,id+' camera');}}
  if(phase==='down')assert.ok(Math.abs(Math.max(...transform.corners.map(p=>transform.y+p[1]))-FLOOR)<1e-7,'body rests on floor');
  if(phase==='rise')assert.equal(getPoseAtlasDebug(f,t).slot,t<4?10:0);
 }
});
for(const [name,mutate] of [
 ['missing image',m=>{m.fighters.rivet.frames[0].url='/fighters/poses/missing.png';}],
 ['invalid opaque bounds',m=>{m.fighters.rivet.frames[24].bounds=[10,5,2,0];}],
 ['invalid walk count',m=>{m.fighters.rivet.walkFrames=[];}],
 ['out-of-bounds contact',m=>{m.fighters.rivet.holdContact.hand=[999,2];}],
]){
 manifest=structuredClone(original);mutate(manifest);await assert.rejects(loadPoseAtlases());assert.equal(getPoseAtlasLoadStatus().state,'error');assert.equal(getPoseAtlasLoadStatus().ids.length,0);assert.ok(isPoseAtlasDeclared('rivet'));count++;console.log('PASS: '+name+' fails atomically and retains declared-art no-fallback guard');
}
manifest=structuredClone(original);await loadPoseAtlases();assert.equal(getPoseAtlasLoadStatus().state,'ready');
console.log(`PASS: ${count} pose playback/contract groups. No visual-quality claim from these checks.`);
