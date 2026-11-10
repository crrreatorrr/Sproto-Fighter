// Source registration and real renderer sampling checks; no visual approval.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';

const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
const dataUrl=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const compile=p=>ts.transpileModule(read(p).toString(),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const coreUrl=dataUrl(bundledCore()),eventsUrl=dataUrl(compile('src/animationEvents.ts'));
const core=await import(coreUrl);
const poses=await import(dataUrl(compile('src/poseAtlas.ts').replace("from './core'",`from '${coreUrl}'`).replace("from './animationEvents'",`from '${eventsUrl}'`)));
const manifest=JSON.parse(read('public/fighters/pose-atlas.json'));
const review=JSON.parse(read('art/movement-followup-20261102/hly3-blue/review.json'));
const cfg=manifest.fighters[review.body];
for(const [key,value]of Object.entries(review.baseGeometry))assert.deepEqual(cfg[key],value,'base geometry must not change');
assert.deepEqual(cfg.frames[0],review.coreIdle,'core idle remains unchanged');
assert.equal(hash(read('public'+review.coreIdle.url)),review.coreIdleSha256);
for(const [source,expected]of Object.entries(review.reviewedSourceHashes))assert.equal(hash(read('public'+source)),expected,source+' source pixels must remain unchanged');
for(const [clip,before]of Object.entries(review.before)){
  assert.deepEqual(cfg.clips[clip],review.sourceIndices[clip].map(i=>before[i]),clip+' exact reviewed mapping');
  // The paired dash has its own horizontal origin. Jump and attacks retain the reviewed sheet origin.
  const registration=clip==='dash'?{...review.registration,anchorOffset:[15,0]}:review.registration;
  assert.deepEqual(cfg.clipRegistration[clip],registration,clip+' uses one fixed sheet registration');
}
assert.deepEqual(cfg.clips.heavy[4],cfg.clips.heavy[3],'heavy contact holds the extended leg');
assert.deepEqual(cfg.clips.airKick[3],cfg.clips.airKick[2],'air contact holds the extended leg');

globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>manifest});
globalThis.Image=class {
  set src(value){this.url=value;const b=read('public'+value.split('?')[0]);this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}
};
await poses.ensurePoseAtlases([review.owner]);
const seen=new Map(Object.keys(review.before).map(n=>[n,new Set()]));
let samples=0,contacts=0,recoveries=0;
const nearly=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<1e-8,`${message}: ${actual} vs ${expected}`);
function inspect(s,expectedClip=null){
  const f=s.fighters[0],before=JSON.stringify(s),draws=[];
  let currentScale=[1,1];const scales=[];
  const c={save(){scales.push([...currentScale]);},restore(){currentScale=scales.pop();},translate(){},rotate(){},scale(x,y){currentScale=[currentScale[0]*x,currentScale[1]*y];},drawImage(image,dx,dy,w,h){draws.push({url:image.url.split('?')[0],dx,dy,w,h,scale:[...currentScale]});}};
  const debug=poses.getDuoPoseDebug(f,s.frame).find(d=>d.entity===review.body);
  if(expectedClip)assert.equal(debug.sequence,expectedClip,'selected review state uses expected clip');
  poses.drawPoseAtlas(c,f,s.frame);
  assert.equal(JSON.stringify(s),before,'renderer and debug sampling must not mutate combat');
  assert.equal(draws.length,2,'both whole bodies must remain visible');
  const painted=draws.find(d=>d.url.includes('/'+review.body+'/'));
  assert.ok(painted,'blue body drawn exactly once');
  const source=debug.sequence==='poses'?cfg.frames[debug.frameIndex]:debug.sequence==='walk'?cfg.walkFrames[debug.frameIndex]:cfg.clips[debug.sequence][debug.frameIndex];
  assert.equal(painted.url,source.url,'actual paint matches real sampled frame');
  const registration=cfg.clipRegistration?.[debug.sequence],density=registration?.pixelScale??1,offset=registration?.anchorOffset??[0,0];
  const anchor=source.anchor??cfg.anchor;
  nearly(painted.w,(source.width??cfg.width)*density,'constant source width');
  nearly(painted.h,(source.height??cfg.height)*density,'constant source height');
  nearly(painted.dx,-(anchor[0]+offset[0])*density,'registered horizontal origin');
  nearly(painted.dy,-(anchor[1]+offset[1])*density,'registered floor origin');
  nearly(Math.abs(painted.scale[0]),cfg.scale,'world horizontal scale unchanged');
  nearly(painted.scale[1],cfg.scale,'world vertical scale unchanged');
  if(seen.has(debug.sequence))seen.get(debug.sequence).add(debug.frameIndex);
  const layout=poses.getDuoLayoutDebug(f,s.frame);
  assert.ok(layout.bounds.flat().every(Number.isFinite)&&layout.offsets.every(Number.isFinite),'paired packing remains finite');
  samples++;
  return debug;
}
function fixture(facing){
  poses.setPoseAtlasPresentation(null,[]);
  const s=core.createState(review.owner,'dummy'),f=s.fighters[0];f.x=640;f.facing=facing;return s;
}
for(const facing of [-1,1]){
  let s=fixture(facing),f=s.fighters[0];inspect(s,'poses');
  for(let t=0;t<10;t++){s.frame++;f.dash=10-t;inspect(s,'dash');}
  s=fixture(facing);f=s.fighters[0];f.y=core.FLOOR-120;
  for(let index=0;index<6;index++){s.frame++;f.vy=-core.ROSTER[f.id].jump+(index+.5)/6*2*core.ROSTER[f.id].jump;inspect(s,'jump');}
  for(const action of ['heavy','airMedium','airHeavy']){
    s=fixture(facing);f=s.fighters[0];f.y=action==='heavy'?core.FLOOR:core.FLOOR-120;
    const move=core.getMove(f,action),clip=action==='heavy'?'heavy':'airKick';
    for(let age=0;age<move.startup+move.active+move.recovery;age++){
      s.frame++;f.move={id:action,t:age,hit:false,connected:false,wave:-1,aim:'level'};
      const debug=inspect(s,facing===1?clip:null);
      if(facing===1&&age>=move.startup&&age<move.startup+move.active){
        assert.equal(cfg.clips[clip][debug.frameIndex].url,review.approvedContacts[clip].url,'every active interval uses inspected full leg contact');contacts++;
      }
    }
    f.move=null;f.y=core.FLOOR;f.vy=0;f.vx=0;
    for(let t=0;t<12;t++){core.step(s,[0,0]);poses.getDuoPoseDebug(f,s.frame);}
    for(const d of poses.getDuoPoseDebug(f,s.frame))assert.ok(d.sequence==='poses'&&[0,1].includes(d.slot),'both members recover to guard/breathing');
    recoveries++;
  }
  s=fixture(facing);f=s.fighters[0];
  for(let age=0;age<72;age++){
    s.frame++;poses.setPoseAtlasPresentation({phase:'outro',frame:age,winner:0,fromFloor:false},s.fighters);inspect(s,'victory');
  }
}
poses.setPoseAtlasPresentation(null,[]);
for(const [clip,indices]of seen)assert.equal(indices.size,review.before[clip].length,clip+' every timing slot sampled');
const calibratedMid=(review.measuredSources.heavy7.feetMidpoint-cfg.anchor[0]-review.registration.anchorOffset[0])*review.registration.pixelScale;
const idleMid=review.measuredSources.idle.feetMidpoint-cfg.anchor[0];
assert.ok(Math.abs(calibratedMid-idleMid)<=1,'neutral source origin aligns within one logical pixel');
console.log(`PASS: ${samples} actual renderer samples, all 32 motion timing slots, ${contacts} inspected active contacts, ${recoveries} recoveries, both facings and both entities drawn. Source pixels/world scale unchanged; static proportion residuals remain documented. No live-motion approval.`);
