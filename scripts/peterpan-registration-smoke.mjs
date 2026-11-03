// Geometry/mapping regression, not a substitute for browser visual review.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const compile=p=>ts.transpileModule(read(p).toString(),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const coreUrl=url(bundledCore()),eventsUrl=url(compile('src/animationEvents.ts'));
const core=await import(coreUrl);
const poses=await import(url(compile('src/poseAtlas.ts').replace("from './core'",`from '${coreUrl}'`).replace("from './animationEvents'",`from '${eventsUrl}'`)));
const source=JSON.parse(read('public/fighters/pose-atlas.json'));
const review=JSON.parse(read('art/movement-followup-20261102/peterpan-yellow/review.json'));
const cfg=source.fighters[review.body];
for(const [key,value] of Object.entries(review.baseGeometry))assert.deepEqual(cfg[key],value,'base geometry remains unchanged');
assert.deepEqual(cfg.frames[0],review.coreIdle);
for(const [path,hash] of Object.entries({...review.reviewedSourceHashes,[review.coreIdle.url]:review.coreIdleSha256}))assert.equal(createHash('sha256').update(read('public'+path)).digest('hex'),hash,'source PNG unchanged');
for(const [name,before] of Object.entries(review.before)){
  assert.deepEqual(cfg.clips[name],review.sourceIndices[name].map(i=>before[i]));
  assert.deepEqual(cfg.clipRegistration[name],{pixelScale:1,anchorOffset:[33,0]});
}
assert.equal(cfg.clips.heavy[3].url,'/fighters/motion/peterpan-companion/16.png');
const manifest={...source,fighters:Object.fromEntries(['peterpan','peterpan-companion'].map(id=>[id,source.fighters[id]]))};
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class {set src(value){this.url=value;const b=read('public'+value.split('?')[0]);this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
await poses.loadPoseAtlases();
const seen=new Map();let checked=0;
function inspect(s){
  const before=JSON.stringify(s),draws=[];
  poses.drawPoseAtlas({save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(image,x,y,w,h){draws.push({path:image.url.split('?')[0],x,y,w,h});}},s.fighters[0],s.frame);
  assert.equal(JSON.stringify(s),before,'presentation does not alter collision/combat state');
  assert.equal(draws.length,2,'both members rendered');
  for(const d of draws){
    if(!d.path.includes('/peterpan-companion/'))continue;
    assert.equal(d.w,256);assert.equal(d.h,256);
    const clip=Object.keys(review.before).find(name=>cfg.clips[name].some(f=>f.url===d.path));
    if(clip){assert.equal(d.x,-145,'constant source origin');assert.equal(d.y,-210,'feet retain vertical anchor');seen.set(clip,(seen.get(clip)??0)+1);}
  }
  checked++;
}
for(const facing of [-1,1]){
  for(const action of ['heavy','airMedium','airHeavy']){
    const s=core.createState('peterpan','dummy'),f=s.fighters[0];f.facing=facing;f.x=640;f.y=action==='heavy'?core.FLOOR:core.FLOOR-100;
    const m=core.getMove(f,action);
    for(let t=0;t<m.startup+m.active+m.recovery;t++){f.move={id:action,t,hit:false,connected:false,wave:-1,aim:'level'};s.frame++;inspect(s);}
  }
  for(const clip of ['dash','jump','victory']){
    const s=core.createState('peterpan','dummy'),f=s.fighters[0];f.facing=facing;f.x=640;
    for(let i=0;i<6;i++){
      f.dash=clip==='dash'?10-i*1.6:0;
      if(clip==='jump'){f.y=core.FLOOR-100;f.vy=-core.ROSTER.peterpan.jump+2*core.ROSTER.peterpan.jump*(i+.3)/6;}
      poses.setPoseAtlasPresentation(clip==='victory'?{phase:'outro',frame:i*12,winner:0,fromFloor:false}:null,s.fighters);
      s.frame++;inspect(s);
    }
    poses.setPoseAtlasPresentation(null,s.fighters);
  }
}
assert.deepEqual([...seen.keys()].sort(),Object.keys(review.before).sort());
console.log(`PASS: ${checked} render frames, both facings, five optional clips; contact mapping, fixed origin, source hashes and combat-state nonmutation. Browser review remains separate.`);
