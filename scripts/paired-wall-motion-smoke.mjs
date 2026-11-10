// Deterministic geometry / playback contracts. This is not visual approval.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=p=>ts.transpileModule(readFileSync(new URL(p,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(bundledCore()),eu=url(compile('../src/animationEvents.ts'));
const core=await import(cu),events=await import(eu);
const poses=await import(url(compile('../src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`)));
const manifest=JSON.parse(readFileSync(new URL('../public/fighters/pose-atlas.json',import.meta.url),'utf8'));
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){this.url=value;const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
const {A,FLOOR,DUO_SPREAD,PLAYABLE_FIGHTERS,COMBAT_STYLES,createState,step,getThrowGrip}=core;
const {loadPoseAtlases,getDuoPoseDebug,getDuoLayoutDebug,drawPoseAtlas,setPoseAtlasPresentation,setPoseAtlasThrowState,getPoseAtlasDebug}=poses;
await loadPoseAtlases();

let checks=0,worst=0;const bad=[];
for(const id of PLAYABLE_FIGHTERS.filter(core.isPairedFighter))for(const facing of [1,-1])for(const edge of ['left','right']){
 const s=createState(id,'cpu','vela'),[f,b]=s.fighters,gap=480;f.facing=facing;b.facing=-facing;f.x=640-facing*gap/2;b.x=f.x+facing*gap;
 const lo=Math.max(core.fighterWall(f.id),core.fighterWall(b.id)-(b.x-f.x)),hi=Math.min(core.WIDTH-core.fighterWall(f.id),core.WIDTH-core.fighterWall(b.id)-(b.x-f.x));f.x=edge==='left'?lo:hi;b.x=f.x+facing*gap;
 for(let age=0;age<100;age++){const forward=f.facing===1?A.right:A.left,back=f.facing===1?A.left:A.right;step(s,[age===0?forward|A.dash:age===38?back|A.dash:0,0]);setPoseAtlasThrowState(null,[]);const before=JSON.stringify(s),l=getDuoLayoutDebug(f,s.frame),left=Math.min(...l.bounds.map(b=>b[0])),right=Math.max(...l.bounds.map(b=>b[1])),bleed=Math.max(0,6-left,right-(core.WIDTH-6));assert.equal(JSON.stringify(s),before);if(bleed>worst)worst=bleed;if(bleed>.01)bad.push({id,facing,edge,age,bleed,dash:f.dash,bounds:l.bounds,offsets:l.offsets});checks++;}
}
console.log(JSON.stringify({checks,worst,outside:bad.length,examples:bad.sort((a,b)=>b.bleed-a.bleed).slice(0,5)},null,2));assert.equal(bad.length,0,'paired dash silhouettes must stay inside the arena');

// Guard and walk share a compact footprint. Dash can open the formation,
// but the lead anchor stays fixed and the full silhouettes stay separated.
for(const id of PLAYABLE_FIGHTERS.filter(core.isPairedFighter))for(const facing of [-1,1])for(const edge of [-1,0,1]){
 const f=createState(id,'dummy').fighters[0];
 f.facing=facing;
 f.x=edge===-1?core.fighterWall(id):edge===1?core.WIDTH-core.fighterWall(id):core.WIDTH/2;
 const start=getDuoLayoutDebug(f,0).offsets;
 for(let dash=11;dash>=0;dash--){
  f.dash=dash;
  const layout=getDuoLayoutDebug(f,12-dash);
  const lead=facing===1?layout.offsets.length-1:0;
  assert.ok(Math.abs(layout.offsets[lead]-start[lead])<1e-7,`${id}: dash keeps the lead anchor`);
  if(dash===0)assert.deepEqual(layout.offsets,start,`${id}: returns to compact guard after dash`);
  assert.ok(layout.bounds.every(([l,r])=>l>=6-.01&&r<=core.WIDTH-6+.01),
    `${id} facing ${facing}, edge ${edge}: silhouettes stay in frame`);
  if(layout.dashClearance!==undefined)assert.ok(layout.dashClearance>=6.99,`${id}: synchronized dash outlines stay apart`);
  else assert.ok(layout.bounds.every(([l],i)=>i===0||l>=layout.bounds[i-1][1]+5.99),`${id}: guard bodies stay apart`);
 }
 if(edge===0){
  for(let frame=14;frame<=42;frame++){
   f.vx=frame<28?4:-4;
   f.x+=f.vx;
   assert.deepEqual(getDuoLayoutDebug(f,frame).offsets,start,`${id}: stable formation through walk and reversal`);
  }
 }
}
console.log('Stable guard/walk spacing and clear, synchronized dash outlines across the paired roster.');

// Step real dashes at center and at distances that pin the visual anchor
// during different active cels. Neither body should move against the dash.
const dashStarts=[...Array.from({length:33},(_,i)=>5*i),480];
for(const id of PLAYABLE_FIGHTERS.filter(core.isPairedFighter))for(const facing of [-1,1])for(const dir of [-1,1])for(const margin of dashStarts){
 const s=createState(id,'dummy','rivet'),[f,b]=s.fighters;
 const wall=core.fighterWall(id);
 // At the wall, face inward so the rival can stay outside push range.
 f.x=margin===480?core.WIDTH/2:facing===1?wall+margin:core.WIDTH-wall-margin;
 f.facing=facing;
 const rivalWall=core.fighterWall(b.id);
 b.x=Math.max(rivalWall,Math.min(core.WIDTH-rivalWall,f.x+facing*490));
 let prior=getDuoLayoutDebug(f,0).offsets.map(offset=>f.x+offset);
 for(let t=0;t<12;t++){
  step(s,[t===0?(dir===1?A.right:A.left)|A.dash:0,0]);
  const x=getDuoLayoutDebug(f,s.frame).offsets.map(offset=>f.x+offset);
  // Check both boundaries too for the Sproto 3181 facing that can ease
  // without sacrificing clearance.
  if((t>0&&f.dash>0)||(margin===480&&id==='sproto3181'&&facing===1)){
   assert.ok(x.every((body,i)=>(body-prior[i])*dir>=-1e-7),
    `${id} facing ${facing}, dash ${dir}, ${margin}px from wall, tick ${t}: dash bodies must travel together`);
  }
  prior=x;
  if(f.dash===0)break;
 }
}
// The committed backdash keeps its direction when a new forward dash is
// buffered before the cancel window opens.
{
 const s=createState('sproto282','versus','rivet'),[f,b]=s.fighters;
 f.x=core.fighterWall(f.id)+100;b.x=f.x+490;f.facing=1;
 let prior;
 for(let t=0;t<10;t++){
  step(s,[t===0?A.left|A.dash:t===2?A.right|A.dash:0,0]);
  if(!f.dash)break;
  const positions=getDuoLayoutDebug(f,s.frame).offsets.map(offset=>f.x+offset);
  if(prior)assert.ok(positions.every((x,i)=>x<=prior[i]+1e-7),'buffered forward dash must not reverse the active backdash');
  prior=positions;
 }
}
// A head-on dash can stop both leads before either reaches an arena wall.
// The teammate should still close the formation in the dash direction.
for(const id of PLAYABLE_FIGHTERS.filter(core.isPairedFighter))for(const dir of [-1,1])for(const gap of [180,223,270]){
 const s=createState(id,'versus','rivet'),[f,b]=s.fighters;
 f.x=core.WIDTH/2-dir*gap/2;b.x=f.x+dir*gap;f.facing=dir;b.facing=-dir;
 let prior;
 for(let t=0;t<11;t++){
  const left=A.left|A.dash,right=A.right|A.dash;
  step(s,t===0?dir===1?[right,left]:[left,right]:[0,0]);
  if(!f.dash)break;
  const positions=getDuoLayoutDebug(f,s.frame).offsets;
  const support=dir===1?0:positions.length-1;
  const lead=positions.length-1-support;
  const relative=positions[support]-positions[lead];
  if(prior!==undefined)assert.ok((relative-prior)*dir>=-1e-7,`${id}: a collision must not reverse the support relative to the lead`);
  prior=relative;
 }
}
// A full backdash, a backdash interrupted by a wall, and a crouch brake
// all ease the extra space out before returning to the compact formation.
for(const [id,start,dir,brake] of [['sproto282',640,-1,-1],['sproto282',252,-1,-1],['sproto282',272,-1,11],['sproto3224',170,1,3]]){
 const s=createState(id,'versus','rivet'),[f,b]=s.fighters;
 f.x=start;b.x=Math.min(core.WIDTH-core.fighterWall(b.id),start+490);f.facing=1;
 let prior,release;
 for(let t=0;t<30;t++){
  step(s,[t===0?(dir===1?A.right:A.left)|A.dash:t===brake?A.down:0,0]);
  const {offsets,bounds}=getDuoLayoutDebug(f,s.frame);
  const separation=offsets[1]-offsets[0];
  if(!f.dash&&prior!==undefined){
   release??=separation;
   assert.ok(prior-separation<=7+1e-7,`${id}: the support must close dash spacing gradually`);
   assert.ok(bounds[0][0]>=6-.01&&bounds[1][1]<=core.WIDTH-6+.01,`${id}: recovery stays inside the arena`);
  }
  prior=separation;
 }
 assert.ok(release>prior,`${id}: the fixture must exercise dash recovery`);
}
{
 const s=createState('sproto282','versus','rivet'),[f,b]=s.fighters;
 f.x=640;b.x=1130;
 for(let t=0;t<5;t++){
  step(s,[t===0?A.left|A.dash:0,0]);
  getDuoLayoutDebug(f,s.frame);
 }
 const presentation=events.createRoundPresentation();
 events.beginRoundOutro(presentation,0,false);
 setPoseAtlasPresentation(presentation,s.fighters);
 for(let t=0;t<8;t++){
  events.advanceRoundPresentation(presentation);
  const fresh={...f};
  setPoseAtlasPresentation(presentation,[fresh,b]);
  const expected=getDuoLayoutDebug(fresh,s.frame);
  setPoseAtlasPresentation(presentation,s.fighters);
  assert.deepEqual(getDuoLayoutDebug(f,s.frame),expected,'victory presentation ignores the previous dash formation');
 }
 setPoseAtlasPresentation(null,[]);
}
for(const id of PLAYABLE_FIGHTERS.filter(core.isPairedFighter))for(const side of [-1,1]){
 const s=createState(id,'dummy','rivet'),[f,b]=s.fighters;
 f.x=side===-1?core.fighterWall(id):core.WIDTH-core.fighterWall(id);
 f.facing=-side;
 b.x=side===-1?1130:150;
 const lead=side===-1?core.bodyAtlasIds(id).length-1:0;
 const guard=getDuoLayoutDebug(f,0).offsets[lead];
 let airborne=false;
 for(let t=0;t<50;t++){
  step(s,[t===0?A.up:0,0]);
  airborne ||= f.y<FLOOR;
  assert.ok(Math.abs(getDuoLayoutDebug(f,s.frame).offsets[lead]-guard)<1e-7,
    `${id}: wall jump keeps the lead anchor through anticipation, takeoff and landing`);
 }
 assert.ok(airborne,`${id}: the wall-jump fixture must leave the ground`);
}
