// Deterministic geometry / playback contracts. This is not visual approval.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=p=>ts.transpileModule(readFileSync(new URL(p,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(compile('../src/core.ts')),eu=url(compile('../src/animationEvents.ts'));
const core=await import(cu),events=await import(eu);
const poses=await import(url(compile('../src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`)));
const manifest=JSON.parse(readFileSync(new URL('../public/fighters/pose-atlas.json',import.meta.url),'utf8'));
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){this.url=value;const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
const {A,FLOOR,DUO_SPREAD,PLAYABLE_FIGHTERS,COMBAT_STYLES,createState,step,getThrowGrip}=core;
const {loadPoseAtlases,getDuoPoseDebug,getDuoLayoutDebug,drawPoseAtlas,setPoseAtlasPresentation,setPoseAtlasThrowState,getPoseAtlasDebug}=poses;
await loadPoseAtlases();

const records=[];
for(const id of PLAYABLE_FIGHTERS.filter(core.isPairedFighter))for(const face of [1,-1]){
 const s=createState(id,'cpu','vela'),f=s.fighters[0];f.x=640;f.facing=face;s.fighters[1].x=640+face*450;s.fighters[1].facing=-face;
 let prior=null,maxJump=0,minGap=1e9,worst=null,values=new Set();
 for(let n=0;n<75;n++){step(s,[n<32?(face===1?A.right:A.left):n<64?(face===1?A.left:A.right):0,0]);setPoseAtlasThrowState(null,[]);const l=getDuoLayoutDebug(f,s.frame);
  if(l.bounds[1][0]-l.bounds[0][1]<minGap){minGap=l.bounds[1][0]-l.bounds[0][1];worst={n,bounds:l.bounds,frames:getDuoPoseDebug(f,s.frame).map(x=>[x.sequence,x.frameIndex])};}values.add(l.offsets.join(','));if(prior)maxJump=Math.max(maxJump,...l.offsets.map((v,i)=>Math.abs(v-prior[i])));prior=l.offsets;
 }records.push({id,face,minGap,maxJump,offsets:values.size,worst});
}
for(const r of records){assert.ok(r.maxJump<1e-7,`${r.id}/${r.face}: gait packing changed by ${r.maxJump}`);assert.ok(r.minGap>=6-1e-7,`${r.id}/${r.face}: gait silhouettes overlap or gap is too narrow (${r.minGap})`);}
console.log(`PASS: ${records.length} paired/facing walk, reversal and stop scenarios; stable offsets and at least six world pixels of clearance.`);
