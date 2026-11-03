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
