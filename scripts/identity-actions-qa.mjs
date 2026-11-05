import { bundledCore } from './lib/load.mjs';
import { assertProjectileKit } from './lib/gameplay-fixtures.mjs';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const compile=p=>ts.transpileModule(read(p),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(bundledCore()),eu=url(compile('src/animationEvents.ts')),core=await import(cu),ev=await import(eu);
const poses=await import(url(compile('src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`)));
const manifest=JSON.parse(read('public/fighters/pose-atlas.json')),audit=JSON.parse(read('art/identity-actions/audit.json'));
const profiles=JSON.parse(read('art/identity-actions/profiles.json'));
// Projectiles deliberately redesigned after this audit, each covered by its own smoke.
const LATER_REDESIGNED=new Set(['mox']); // Yannix mind beam: scripts/yannix-smoke.mjs
const preserved=new Map(audit.filter(r=>!profiles[r.id].replaceRanged&&!LATER_REDESIGNED.has(r.id)).map(r=>[r.id,r.kit.projectile]));
// Speed is deliberately template-normalized; historical shape, origin and trajectory stay pinned.
for(const[id,p]of preserved){assertProjectileKit(core,id);assert.deepEqual({...core.COMBAT_STYLES[id].projectile,speed:p.speed},p,id+' signature projectile geometry preserved');}
assert.equal(core.COMBAT_STYLES.sproto651.projectile.shape,'painting');
assert.equal(ev.entranceFrame(51),7);assert.equal(ev.deathFrame(95,false),15);assert.equal(ev.deathFrame(0,true),8);assert.equal(ev.deathFrame(95,true),15);
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
await poses.loadPoseAtlases();let bodies=0,ranged=0;const signatures=new Set();
for(const row of audit){
 const state=core.createState(row.id,'dummy'),f=state.fighters[0];
 for(const body of row.bodies){const cfg=manifest.fighters[body];for(const[name,n]of [['entrance',8],['death',16],...(profiles[row.id].replaceRanged?[['ranged',8]]:[])]){
  assert.equal(cfg.clips?.[name]?.length,n,body+' '+name);const hash=createHash('sha256');for(const frame of cfg.clips[name]){assert.ok(existsSync(new URL('../public'+frame.url,import.meta.url)));hash.update(readFileSync(new URL('../public'+frame.url,import.meta.url)));}const digest=hash.digest('hex');assert.ok(!signatures.has(digest),'distinct authored sequence '+body+'/'+name);signatures.add(digest);
 }bodies++;if(profiles[row.id].replaceRanged)ranged++;}
 for(const frame of [0,5,13,26,39,51]){poses.setPoseAtlasPresentation({phase:'intro',frame,winner:null,fromFloor:false},state.fighters);const before=JSON.stringify(state);assert.equal(poses.getPoseAtlasDebug(f,0).sequence,'entrance');assert.equal(JSON.stringify(state),before);}
 for(const fromFloor of [false,true])for(const frame of [0,18,40,70,95]){poses.setPoseAtlasPresentation({phase:'outro',frame,winner:1,fromFloor},state.fighters);const d=poses.getPoseAtlasDebug(f,0);assert.equal(d.sequence,'death');assert.ok(d.frameIndex>= (fromFloor?8:0));}
 poses.setPoseAtlasPresentation(null,[]);
}
console.log(`PASS: ${audit.length} fighters / ${bodies} body entrances and deaths, ${ranged} ranged sequences, preserved signature projectile contracts, distinct sprite-sequence hashes and intro/defeat playback clocks.`);
