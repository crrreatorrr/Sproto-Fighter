// Source-density/origin regression; fake image loading is not visual approval.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const compile=p=>ts.transpileModule(read(p).toString(),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const coreUrl=url(bundledCore()),eventsUrl=url(compile('src/animationEvents.ts'));
const core=await import(coreUrl);
const poses=await import(url(compile('src/poseAtlas.ts').replace("from './core'",`from '${coreUrl}'`).replace("from './animationEvents'",`from '${eventsUrl}'`)));
const source=JSON.parse(read('public/fighters/pose-atlas.json'));
let manifest={...source,fighters:Object.fromEntries(['sproto704','sproto704-companion','sproto2210','sproto2210-companion'].map(id=>[id,structuredClone(source.fighters[id])]))};
const baseline=structuredClone(manifest);
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class {set src(value){this.url=value;const b=read('public'+value.split('?')[0]);this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
await poses.loadPoseAtlases();
let checked=0;
for(const owner of ['sproto704','sproto2210'])for(const facing of [-1,1])for(const action of ['heavy','airMedium','airHeavy']){
  const s=core.createState(owner,'dummy'),f=s.fighters[0];f.facing=facing;f.x=640;f.y=action==='heavy'?core.FLOOR:core.FLOOR-100;
  const m=core.getMove(f,action);
  for(let t=0;t<m.startup+m.active+m.recovery;t++){
    f.move={id:action,t,hit:false,connected:false,wave:-1,aim:'level'};s.frame++;
    const before=JSON.stringify(s),draws=[];
    poses.drawPoseAtlas({save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(image,x,y,w,h){draws.push({path:image.url.split('?')[0],x,y,w,h});}},f,s.frame);
    assert.equal(JSON.stringify(s),before,'registration must not alter combat state');
    assert.equal(draws.length,2,'both twin bodies stay present');
    for(const draw of draws){
      const body=Object.entries(baseline.fighters).find(([,cfg])=>Object.values(cfg.clips??{}).flat().some(entry=>entry.url===draw.path)||cfg.frames.some(entry=>entry.url===draw.path));
      assert.ok(body,'draw uses declared source art');
      const [id,cfg]=body;
      const clip=Object.entries(cfg.clips??{}).find(([,frames])=>frames.some(entry=>entry.url===draw.path));
      const entry=clip?.[1].find(entry=>entry.url===draw.path)??cfg.frames.find(entry=>entry.url===draw.path);
      const registration=clip?cfg.clipRegistration?.[clip[0]]:undefined,density=registration?.pixelScale??1;
      assert.equal(draw.w,(entry.width??cfg.width)*density,id+' calibrated width');
      assert.equal(draw.h,(entry.height??cfg.height)*density,id+' calibrated height');
      assert.ok(Number.isFinite(draw.x)&&Number.isFinite(draw.y),'finite pivot placement');
      if(registration){assert.equal(density,.9);assert.deepEqual(registration.anchorOffset,[31,0]);}
    }
    checked++;
  }
}
for(const mutate of [
  cfg=>cfg.clipRegistration=null,
  cfg=>cfg.clipRegistration=[],
  cfg=>cfg.clipRegistration={heavy:{pixelScale:NaN,anchorOffset:[0,0]}},
  cfg=>cfg.clipRegistration={heavy:{pixelScale:0,anchorOffset:[0,0]}},
  cfg=>cfg.clipRegistration={heavy:{pixelScale:.1,anchorOffset:[0,0]}},
  cfg=>cfg.clipRegistration={heavy:{pixelScale:3,anchorOffset:[0,0]}},
  cfg=>cfg.clipRegistration={heavy:{pixelScale:.9,anchorOffset:[NaN,0]}},
  cfg=>cfg.clipRegistration={missing:{pixelScale:.9,anchorOffset:[0,0]}},
]){
  manifest=structuredClone(baseline);mutate(manifest.fighters.sproto704);
  await assert.rejects(poses.loadPoseAtlases());
  assert.equal(poses.getPoseAtlasLoadStatus().state,'error','invalid registration fails atomically');
}
manifest=structuredClone(baseline);await poses.loadPoseAtlases();
assert.equal(poses.getPoseAtlasLoadStatus().state,'ready');
console.log(`PASS: ${checked} paired attack phase frames, both lead facings; calibrated draw geometry and nonmutation; eight invalid-registration cases and recovery. Visual quality assessed separately.`);
