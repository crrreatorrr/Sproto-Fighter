// Playback/asset-contract checks. Fake image loading is NOT visual/browser QA.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=(path)=>ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const coreUrl=url(compile('../src/core.ts'));
const core=await import(coreUrl);
const poses=await import(url(compile('../src/poseAtlas.ts').replace("from './core'",`from '${coreUrl}'`)));
const original=JSON.parse(readFileSync(new URL('../public/fighters/pose-atlas.json',import.meta.url),'utf8'));
let manifest=structuredClone(original);
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class {
  set src(value){this.url=value;try{const p=value.split('?')[0];const b=readFileSync(new URL('../public'+p,import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}catch{queueMicrotask(()=>this.onerror());}}
};
const {A,FLOOR,createState,step,PLAYABLE_FIGHTERS}=core;
const {loadPoseAtlases,getPoseAtlasDebug,drawPoseAtlas,setPoseAtlasThrowState,getPoseAtlasLoadStatus,isPoseAtlasDeclared}=poses;
await loadPoseAtlases();assert.equal(getPoseAtlasLoadStatus().ids.length,21);
let count=0;
const check=(name,fn)=>{fn();count++;console.log('PASS:',name);};
check('all 21: forward/reverse gait, hitstop, and neutral guard after stopping',()=>{
 for(const id of PLAYABLE_FIGHTERS){
  const s=createState(id,'dummy');s.fighters[1].x=1100;const f=s.fighters[0];
  getPoseAtlasDebug(f,0);const seen=new Set();
  for(let t=0;t<24;t++){step(s,[A.right,0]);seen.add(getPoseAtlasDebug(f,s.frame).frameIndex);}
  assert.equal(seen.size,8,id+' complete gait');const before=getPoseAtlasDebug(f,s.frame);
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
check('all 441 held pairs: contact transform finite/bounded, floor-safe, no core mutation',()=>{
 for(const aid of PLAYABLE_FIGHTERS)for(const bid of PLAYABLE_FIGHTERS){
  const s=createState(aid,'dummy',bid),[a,b]=s.fighters;a.x=500;b.x=548;b.y=FLOOR-26;b.facing=-1;
  const scene={attacker:0,victim:1,phase:'hold',t:0,direction:'forward',facing:1};setPoseAtlasThrowState(scene,s.fighters);
  let translation;const ctx={save(){},restore(){},scale(){},drawImage(){},translate(x,y){translation=[x,y]}};
  const before=JSON.stringify(s);drawPoseAtlas(ctx,b,1);assert.equal(JSON.stringify(s),before);
  assert.ok(translation.every(Number.isFinite));assert.ok(Math.abs(translation[0]-b.x)<=61);assert.ok(Math.abs(translation[1]-b.y)<=27);assert.ok(translation[1]<=FLOOR);
  assert.equal(getPoseAtlasDebug(a,1).slot,26,'reaching hands must contact opponent');
  scene.phase='release';scene.t=8;drawPoseAtlas(ctx,b,2);assert.deepEqual(translation,[Math.round(b.x),Math.round(b.y)],'release must return to core trajectory');
 }
 setPoseAtlasThrowState(null,[]);
});
for(const [name,mutate] of [
 ['missing image',m=>{m.fighters.rivet.frames[0].url='/fighters/poses/missing.png';}],
 ['invalid walk count',m=>{m.fighters.rivet.walkFrames=[];}],
 ['out-of-bounds contact',m=>{m.fighters.rivet.holdContact.hand=[999,2];}],
]){
 manifest=structuredClone(original);mutate(manifest);await assert.rejects(loadPoseAtlases());assert.equal(getPoseAtlasLoadStatus().state,'error');assert.equal(getPoseAtlasLoadStatus().ids.length,0);assert.ok(isPoseAtlasDeclared('rivet'));count++;console.log('PASS: '+name+' fails atomically and retains declared-art no-fallback guard');
}
manifest=structuredClone(original);await loadPoseAtlases();assert.equal(getPoseAtlasLoadStatus().state,'ready');
console.log(`PASS: ${count} pose playback/contract groups. No visual-quality claim from these checks.`);
