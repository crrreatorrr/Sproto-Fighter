// Deterministic geometry / playback contracts. This is not visual approval.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=p=>ts.transpileModule(readFileSync(new URL(p,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(compile('../src/core.ts')),eu=url(compile('../src/animationEvents.ts'));
const core=await import(cu);
const poses=await import(url(compile('../src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`)));
const manifest=JSON.parse(readFileSync(new URL('../public/fighters/pose-atlas.json',import.meta.url),'utf8'));
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){this.url=value;const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
await poses.loadPoseAtlases();
let probes=0,minPoseGap=Infinity;const results=[];
for(const id of core.PLAYABLE_FIGHTERS.filter(core.isPairedFighter))for(const face of [-1,1]){
 const state=core.createState(id,'dummy','rivet'),f=state.fighters[0];f.x=640;f.facing=face;
 const initial=JSON.stringify(state),idle=poses.getDuoLayoutDebug(f,0);
 assert.equal(JSON.stringify(state),initial,'rendering must not change simulation');
 const idleGaps=idle.bounds.slice(1).map((v,i)=>v[0]-idle.bounds[i][1]);
 // Full-cycle packing may leave more idle space than one narrow standing cel.
 // The paired gait probe separately requires zero frame-dependent body drift.
 assert.ok(idleGaps.every(g=>g>=6&&g<=45),id+' stable full-gait standing clearance');
 for(const action of [0,core.A.left,core.A.right,core.A.light,core.A.medium,core.A.heavy,core.A.special]){
  const s=core.createState(id,'dummy','rivet'),a=s.fighters[0];a.x=640;a.facing=face;a.pips=3;s.fighters[1].x=1200;
  for(let t=0;t<60;t++){
   core.step(s,[t===0||action===core.A.left||action===core.A.right?action:0,0]);
   const before=JSON.stringify(s),d=poses.getDuoLayoutDebug(a,s.frame);
   assert.equal(JSON.stringify(s),before);
   assert.ok(d.bounds.flat().every(Number.isFinite));
   minPoseGap=Math.min(minPoseGap,...d.bounds.slice(1).map((v,i)=>v[0]-d.bounds[i][1]));
   assert.ok(d.bounds.slice(1).every((v,i)=>v[0]-d.bounds[i][1]>=5.99),`${id}/${face}/${action}/${t} opaque bodies crossed`);
   probes++;
  }
 }
 results.push({id,face,idleGaps});
}
console.log(JSON.stringify({probes,minPoseGap,results},null,2));
