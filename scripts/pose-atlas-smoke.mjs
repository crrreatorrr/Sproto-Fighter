// Playback/asset-contract checks. Fake image loading is NOT visual/browser QA.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=(path)=>ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const coreUrl=url(bundledCore());
const eventsUrl=url(compile('../src/animationEvents.ts'));
const core=await import(coreUrl);
const poses=await import(url(compile('../src/poseAtlas.ts').replace("from './core'",`from '${coreUrl}'`).replace("from './animationEvents'",`from '${eventsUrl}'`)));
const original=JSON.parse(readFileSync(new URL('../public/fighters/pose-atlas.json',import.meta.url),'utf8'));
let manifest=structuredClone(original);
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class {
  set src(value){this.url=value;try{const p=value.split('?')[0];const b=readFileSync(new URL('../public'+p,import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}catch{queueMicrotask(()=>this.onerror());}}
};
const {A,FLOOR,createState,step,PLAYABLE_FIGHTERS,THROW_GRIPS,WIDTH,bodySpread,isPairedFighter}=core;
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
check('ground gait stops at contact and resumes without advancing during knockback or landing',()=>{
 for(const id of PLAYABLE_FIGHTERS)for(const facing of [-1,1]){
  const f=createState(id,'dummy').fighters[0];
  Object.assign(f,{x:600,y:FLOOR,facing,vx:facing*5});
  getPoseAtlasDebug(f,0);
  f.x+=f.vx;
  const moving=getPoseAtlasDebug(f,1);
  assert.equal(moving.sequence,'walk',id+' actual forward travel');
  const blocked=getPoseAtlasDebug(f,2);
  assert.equal(blocked.slot,0,id+' blocked by contact');
  assert.equal(blocked.walkPhase,moving.walkPhase,id+' blocked phase');
  f.x-=f.vx;
  assert.equal(getPoseAtlasDebug(f,3).walkPhase,moving.walkPhase,id+' displaced against intent');
  f.y=FLOOR-20;
  f.x+=f.vx;
  getPoseAtlasDebug(f,4);
  f.y=FLOOR;
  f.x+=f.vx;
  const landed=getPoseAtlasDebug(f,5);
  assert.equal(landed.slot,10,id+' landing pose');
  assert.equal(landed.walkPhase,moving.walkPhase,id+' airborne distance excluded');
 }
});
check('air dashes use the dash pose with or without a dedicated animation clip',()=>{
 for(const id of PLAYABLE_FIGHTERS)for(const facing of [-1,1]){
  const f=createState(id,'dummy').fighters[0];
  Object.assign(f,{x:600,y:FLOOR-60,facing,vy:-3,dash:8});
  const dashing=getPoseAtlasDebug(f,1);
  assert.equal(dashing.sequence==='dash'||dashing.name==='dash',true,id+' airborne dash pose');
  f.dash=0;
  const released=getPoseAtlasDebug(f,2);
  assert.notEqual(released.name,'dash',id+' return to jump pose');
 }
});
check('organic crouched casts retain the complete crouch pose instead of the standing cast clip',()=>{
 for(const id of core.HORIZONTAL_SPIT_FIGHTERS)for(const face of [1,-1]){
  const s=createState(id,'cpu'),f=s.fighters[0];f.x=face===1?200:1080;s.fighters[1].x=face===1?1100:180;f.facing=face;
  step(s,[A.down|A.bolt,0]);let sawRelease=false;
  while(f.move){
   const before=JSON.stringify(s),d=getPoseAtlasDebug(f,s.frame);
   assert.equal(d.sequence,'poses');assert.equal(d.slot,10,id+' crouched cast');
   drawPoseAtlas({save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(){}},f,s.frame);
   assert.equal(JSON.stringify(s),before,'rendering cannot change collision geometry');
   sawRelease ||= s.projectiles.length>0;step(s,[0,0]);
  }
  assert.ok(sawRelease,id+' actual crouched projectile');
 }
});
check('all roster core grips agree with installed per-fighter hand/torso art metadata',()=>{
 for(const id of PLAYABLE_FIGHTERS.filter(id=>id!=='duo')){const cfg=original.fighters[id];for(const [label,slot]of [['hand',26],['torso',24]]){
  const point=cfg.holdContact[label],anchor=cfg.frames[slot].anchor??cfg.anchor,reg=cfg.poseRegistration?.[label==='hand'?'grabReach':'hit'],density=reg?.pixelScale??1,offset=reg?.anchorOffset??[0,0];
  const expected=point.map((v,i)=>(v-anchor[i]-offset[i])*cfg.scale*density);
  assert.ok(THROW_GRIPS[id][label].every((v,i)=>Math.abs(v-expected[i])<1e-8),id+' '+label);
 }}
});
check('all single-body held pairs: draw uses actual core placement without secondary offsets or core mutation',()=>{
 for(const aid of PLAYABLE_FIGHTERS.filter(id=>!isPairedFighter(id)))for(const bid of PLAYABLE_FIGHTERS.filter(id=>!isPairedFighter(id))){
  const s=createState(aid,'dummy',bid);s.fighters[0].x=500;s.fighters[1].x=560+bodySpread(aid)+bodySpread(bid);step(s,[A.grab,0]);
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
