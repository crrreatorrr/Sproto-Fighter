// Runtime contracts for authored ranged8, plus an explicit in-memory fallback
// fixture while generation batches are still installing. No visual-art claim.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const compile=p=>ts.transpileModule(read(p),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(bundledCore()),eu=url(compile('src/animationEvents.ts'));
const core=await import(cu);
const poses=await import(url(compile('src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`)));
const original=JSON.parse(read('public/fighters/pose-atlas.json'));
const profiles=JSON.parse(read('art/identity-actions/profiles.json'));
const audit=JSON.parse(read('art/identity-actions/audit.json'));
// Hand-authored throws (e.g. #1601's yellow 8) keep their reviewed cast; sproto1601-eight-smoke covers them.
const rows=audit.filter(r=>profiles[r.id].replaceRanged&&!core.hasAuthoredProjectile(r.id));
const manifest=structuredClone(original);
let installed=0,fixtures=0;
for(const r of rows)for(const id of r.bodies){
 const cfg=manifest.fighters[id];
 if(cfg.clips?.ranged){installed++;assert.equal(cfg.clips.ranged.length,8);}
 else{
  assert.ok(!process.argv.includes('--require-authored'),id+' awaits authored ranged8');
  cfg.clips??={};const cast=cfg.clips.cast??[cfg.frames[29],cfg.frames[29],cfg.frames[30],cfg.frames[0]];cfg.clips.ranged=cfg.clips.signatureCast??[cfg.frames[11],cast[0],cfg.frames[14],cast[1],cast[2],cast[2],cast[3],cfg.frames[0]];fixtures++;
 }
}
assert.equal(profiles.sproto3152.replaceRanged,false);assert.equal(original.fighters.sproto3152.clips.ranged,undefined,'Pissing Sproto excluded from ranged replacement');assert.equal(core.COMBAT_STYLES.sproto3152.projectile.shape,'pelvicStream');
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
await poses.loadPoseAtlases();
const c=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
const {A,FLOOR,createState,step,getMove}=core;
let cases=0,hitstopCases=0;
for(const row of rows)for(const facing of [-1,1])for(const close of [false,true]){
 poses.setPoseAtlasPresentation(null,[]);poses.setPoseAtlasThrowState(null,[]);
 const visual=createState(row.id,'dummy','rivet'),f=visual.fighters[0],b=visual.fighters[1];f.x=640;b.x=640+facing*(close?120:500);f.facing=facing;b.facing=-facing;
 const plain=structuredClone(visual),m=getMove(f,'bolt'),seen=new Set(),spawns=[],plainSpawns=[];let frozen=0,lastDebug=null;
 function observe(state,list){Object.defineProperty(state.projectiles,'push',{configurable:true,enumerable:false,writable:true,value:function(...items){for(const p of items)list.push({age:state.fighters[0].move?.t,projectile:{...p}});return Array.prototype.push.apply(this,items);}});}
 for(let n=0;n<m.startup+m.active+m.recovery+80;n++){
  observe(visual,spawns);observe(plain,plainSpawns);const oldFreeze=visual.freeze,oldAge=f.move?.t;
  step(visual,[n===0?A.bolt:0,0]);step(plain,[n===0?A.bolt:0,0]);
  const before=JSON.stringify(visual),d=poses.getPoseAtlasDebug(f,visual.frame,visual.freeze>0);poses.drawPoseAtlas(c,f,visual.frame,false,visual.freeze>0);assert.equal(JSON.stringify(visual),before,'render is read-only: '+row.id);assert.equal(JSON.stringify(visual),JSON.stringify(plain),'render cannot affect projectile/core simulation: '+row.id);
  if(f.move?.id==='bolt'){
   assert.equal(d.sequence,'ranged',row.id);seen.add(d.frameIndex);
   if(f.move.t===m.startup)assert.equal(d.frameIndex,4,row.id+' release drawing is active on exact spawn age');
   if(oldFreeze>0){assert.equal(f.move.t,oldAge);if(lastDebug)assert.equal(d.frameIndex,lastDebug.frameIndex,row.id+' hitstop holds cast pose');frozen++;}
  }
  lastDebug=d;
 }
 assert.equal(spawns.length,1,row.id+' one projectile per cast');assert.equal(spawns[0].age,m.startup,row.id+' exact core spawn age');assert.deepEqual(spawns,plainSpawns,row.id+' projectile origin/velocity/damage/life unchanged by presentation');
 assert.equal(f.move,null);assert.equal(f.y,FLOOR);assert.equal(seen.size,8,row.id+' all eight authored cast phases reached');
 if(frozen)hitstopCases++;if(close)assert.ok(frozen>0,row.id+' close cast really hit and caused hitstop');cases++;
}
// The already-specialized comic stream must still select its existing cast4.
const p=createState('sproto3152','dummy'),f=p.fighters[0];p.fighters[1].x=1200;step(p,[A.bolt,0]);for(let n=0;n<12;n++){if(f.move?.id==='bolt')assert.equal(poses.getPoseAtlasDebug(f,p.frame).sequence,'cast');step(p,[0,0]);}
console.log(`PASS: ${cases} ranged owner/facing/contact cases; exact single projectile spawn, 8-phase playback, ${hitstopCases} hitstop cases, read-only render and preserved Pissing Sproto. Authored bodies: ${installed}; explicit temporary runtime fixtures: ${fixtures}.`);
