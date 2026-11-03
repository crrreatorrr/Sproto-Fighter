// Check the installed remap through the real renderer. This is not visual QA.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import { bundledCore } from '../../../../scripts/lib/load.mjs';
const root=new URL('../../../../',import.meta.url);
const compile=p=>ts.transpileModule(readFileSync(new URL(p,root),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const coreUrl=data(bundledCore()),eventsUrl=data(compile('src/animationEvents.ts'));
const core=await import(coreUrl);
const poses=await import(data(compile('src/poseAtlas.ts').replace("from './core'",`from '${coreUrl}'`).replace("from './animationEvents'",`from '${eventsUrl}'`)));
const manifest=JSON.parse(readFileSync(new URL('public/fighters/pose-atlas.json',root),'utf8'));
const review=JSON.parse(readFileSync(new URL('virtuagram-air-kick-review.json',import.meta.url),'utf8'));
const cfg=manifest.fighters.guest14;
assert.deepEqual(cfg.frames[23],review.replacement,'Installed aerial contact must use the reviewed extended kick');
for(const [url,expected] of Object.entries(review.sourceHashes)){
  assert.equal(createHash('sha256').update(readFileSync(new URL('public'+url,root))).digest('hex'),expected,'Reviewed source pixels changed; inspect them again');
}
manifest.fighters={guest14:cfg};
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){this.url=value;try{const b=readFileSync(new URL('public'+value.split('?')[0],root));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}catch{queueMicrotask(()=>this.onerror());}}};
await poses.loadPoseAtlases();let checked=0;
for(const facing of [1,-1])for(const button of [core.A.medium,core.A.heavy]){
 const s=core.createState('guest14','dummy'),f=s.fighters[0];f.x=600;f.facing=facing;s.fighters[1].x=facing===1?1100:100;
 core.step(s,[core.A.up,0]);for(let t=1;t<8;t++)core.step(s,[0,0]);core.step(s,[button,0]);
 let saw=false;
 for(let t=0;t<45;t++){
  const debug=poses.getPoseAtlasDebug(f,s.frame),before=JSON.stringify(s);let image;
  poses.drawPoseAtlas({save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(im){image=im}},f,s.frame);
  assert.equal(JSON.stringify(s),before,'Renderer must not mutate simulation geometry');
  if(debug.slot===23){assert.ok(image.url.split('?')[0]===review.replacement.url);assert.deepEqual(cfg.frames[23].anchor,cfg.frames[18].anchor);saw=true;checked++;}
  core.step(s,[0,0]);
 }
 assert.ok(saw,'Expected actual aerial kick contact in both facings');
}
console.log(`PASS: ${checked} production-render contact frames use reviewed extended kick; all states nonmutating. Visual QA still required.`);
