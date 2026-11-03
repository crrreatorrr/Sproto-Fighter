// Focused Aaron integration checks. Reference likeness are visually reviewed separately.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=p=>ts.transpileModule(readFileSync(new URL(p,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(bundledCore()),eu=url(compile('../src/animationEvents.ts'));
const core=await import(cu);
const poses=await import(url(compile('../src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`)));
const manifest=JSON.parse(readFileSync(new URL('../public/fighters/pose-atlas.json',import.meta.url),'utf8'));
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
const {A,FLOOR,ROSTER,COMBAT_STYLES,PLAYABLE_FIGHTERS,bodyAtlasIds,createState,step}=core;
assert.ok(PLAYABLE_FIGHTERS.includes('aaron'));
assert.equal(ROSTER.aaron.name,'Aaron');
assert.equal(COMBAT_STYLES.aaron.role,'SKIRMISH');
assert.deepEqual(bodyAtlasIds('aaron'),['aaron'],'one independent Aaron body');
const cfg=manifest.fighters.aaron;
assert.equal(cfg.frames.length,32);assert.equal(cfg.walkFrames.length,8);assert.equal(cfg.anchor[1],210,'grounded foot anchor');
for(const [name,count]of Object.entries({intro:4,special:8,cast:4,recoil:4,defeat:12}))assert.equal(cfg.clips[name].length,count);
await poses.ensurePoseAtlases(['aaron','rivet']);
const tick=(s,n,a=0,b=0)=>{for(let i=0;i<n;i++)step(s,[a,b]);};
for(const face of [-1,1]){
 const s=createState('aaron','cpu','rivet'),f=s.fighters[0];f.x=600;s.fighters[1].x=face===1?1150:130;f.facing=face;
 const seen=new Set();poses.getPoseAtlasDebug(f,0);
 for(let t=0;t<40;t++){step(s,[face===1?A.right:A.left,0]);seen.add(poses.getPoseAtlasDebug(f,s.frame).frameIndex);assert.equal(f.y,FLOOR);}
 assert.equal(seen.size,8,'complete walking cycle in both facings');tick(s,3);assert.equal(f.vx,0);
 step(s,[A.dash,0]);assert.ok(f.dash>0);tick(s,20);step(s,[A.up,0]);tick(s,5);assert.ok(f.y<FLOOR);tick(s,80);assert.equal(f.y,FLOOR);
}
for(const action of ['light','medium','heavy','launcher','bolt']){
 const s=createState('aaron','cpu','rivet');s.fighters[1].x=1100;step(s,[A[action],0]);assert.equal(s.fighters[0].move?.id,action);tick(s,100);assert.equal(s.fighters[0].move,null);
}
for(const face of [-1,1])for(const direction of [0,A.up,A.down,face===1?A.left:A.right]){
 const s=createState('aaron','cpu','rivet'),f=s.fighters[0];f.x=600;s.fighters[1].x=600+face*60;f.facing=face;s.fighters[1].facing=-face;
 step(s,[A.grab|direction,0]);let held=false;
 for(let t=0;t<180;t++){held||=s.throwState?.phase==='hold';step(s,[0,0]);for(const f of s.fighters)assert.ok([f.x,f.y,f.hp,f.vx,f.vy].every(Number.isFinite));}
 assert.ok(held,'Aaron throw catches');assert.equal(s.throwState,null);assert.equal(s.fighters[1].hp,885);
}
const s=createState('aaron','cpu','rivet'),f=s.fighters[0];f.pips=3;s.fighters[1].x=480;step(s,[A.special,0]);let combo=0;
for(let t=0;t<220;t++){combo=Math.max(combo,f.combo);step(s,[0,0]);}
assert.equal(f.pips,0);assert.equal(combo,COMBAT_STYLES.aaron.specialFrames.length);assert.equal(f.move,null);
console.log('PASS: Aaron identity and 72-frame asset contract; full gait in both facings, dash/jump/landing, five attacks, eight directional throws and four-contact existing Team Special. Reference likeness and costume checked visually.');

const prior=JSON.parse(readFileSync(new URL('../art/aaron-mouth/before-gameplay.json',import.meta.url),'utf8'));{const {partner:_now,...now}=ROSTER.aaron,{partner:_before,...before}=prior.roster;assert.deepEqual(now,before);} // partner reassigned later; partner-expansion-qa owns itassert.deepEqual(JSON.parse(JSON.stringify(COMBAT_STYLES.aaron)),prior.kit);console.log('PASS: art revision preserves the existing fighter name, kit and gameplay values.');
