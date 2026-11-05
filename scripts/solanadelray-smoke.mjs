import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=p=>ts.transpileModule(readFileSync(new URL(p,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(bundledCore()),eu=url(compile('../src/animationEvents.ts'));
const core=await import(cu),ev=await import(eu),poses=await import(url(compile('../src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`)));
const manifest=JSON.parse(readFileSync(new URL('../public/fighters/pose-atlas.json',import.meta.url),'utf8'));
const plan=JSON.parse(readFileSync(new URL('../art/solanadelray/plan.json',import.meta.url),'utf8')),ids=plan.filter(x=>!x.id.endsWith('-companion')).map(x=>x.id);
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
const {A,FLOOR,ROSTER,COMBAT_STYLES,PLAYABLE_FIGHTERS,bodyAtlasIds,createState,step}=core;
await poses.ensurePoseAtlases([...ids,'rivet']);
const tick=(s,n,a=0,b=0)=>{for(let i=0;i<n;i++)step(s,[a,b]);};
let checks=0;
for(const id of ids){
 const item=plan.find(x=>x.id===id);assert.ok(PLAYABLE_FIGHTERS.includes(id));assert.equal(ROSTER[id].name,item.name);
 assert.ok(core.isFreePlayAddition(id),id+' retains its legacy roster-addition marker (P1 recruitment is tested by the campaign/selection suites)');
 for(const body of bodyAtlasIds(id)){
  const cfg=manifest.fighters[body];assert.equal(cfg.frames.length,32);assert.equal(cfg.walkFrames.length,8);assert.equal(cfg.anchor[1],210);
  for(const [name,count]of Object.entries({intro:4,special:8,cast:4,recoil:4,defeat:12}))assert.equal(cfg.clips[name].length,count);
  assert.equal(new Set(cfg.clips.cast.map(f=>f.url)).size,4);assert.equal(new Set(cfg.clips.defeat.map(f=>f.url)).size,12);
  for(const frame of cfg.clips.defeat.slice(4))assert.ok(frame.bounds[2]-frame.bounds[0]>frame.bounds[3]-frame.bounds[1],body+' final death cels must lie horizontally');
  if(item.twin)for(const [name,count]of Object.entries({dash:6,jump:6,heavy:8,airKick:6,victory:6}))assert.equal(cfg.clips[name].length,count);
 }
 for(const face of [-1,1]){
  const s=createState(id,'cpu','rivet'),f=s.fighters[0];f.x=640;s.fighters[1].x=face===1?1200:80;f.facing=face;
  const seen=new Set();poses.getPoseAtlasDebug(f,0);
  for(let t=0;t<40;t++){step(s,[face===1?A.right:A.left,0]);seen.add(poses.getPoseAtlasDebug(f,s.frame).frameIndex);assert.equal(f.y,FLOOR);}
  assert.equal(seen.size,8,id+' walking loop both facings');tick(s,3);assert.equal(f.vx,0);step(s,[A.dash,0]);assert.ok(f.dash>0);tick(s,20);step(s,[A.up,0]);tick(s,5);assert.ok(f.y<FLOOR);tick(s,80);assert.equal(f.y,FLOOR);checks++;
 }
 for(const action of ['light','medium','heavy','launcher','bolt']){
  const s=createState(id,'cpu','rivet');s.fighters[1].x=1200;step(s,[A[action],0]);assert.equal(s.fighters[0].move?.id,action);tick(s,100);assert.equal(s.fighters[0].move,null);checks++;
 }
 for(const face of [-1,1])for(const direction of [0,A.down,A.up]){
  const s=createState(id,'cpu','rivet'),f=s.fighters[0];f.x=640;f.facing=face;s.fighters[1].x=face===1?1200:80;step(s,[A.bolt|direction,0]);let shot;
  for(let t=0;t<60&&!shot;t++){step(s,[0,0]);shot=s.projectiles[0];}
  assert.ok(shot,id+' cast emits');assert.equal(shot.shape,COMBAT_STYLES[id].projectile.shape);assert.equal(shot.vy,0);assert.equal(shot.gravity,0);assert.ok(Number.isFinite(shot.x)&&Number.isFinite(shot.y));checks++;
 }
 for(const face of [-1,1]){
  const s=createState(id,'cpu','rivet'),f=s.fighters[0],b=s.fighters[1];f.x=640;f.facing=face;b.x=640+face*300;b.facing=-face;
  step(s,[A.bolt,0]);tick(s,100);assert.equal(b.hp,1000-core.getMove(f,'bolt').damage,id+' one confirmed spit/throw impact in each facing');checks++;
 }
 for(const face of [-1,1])for(const direction of [0,A.up,A.down,face===1?A.left:A.right]){
  const s=createState(id,'cpu','rivet'),f=s.fighters[0];f.x=640;s.fighters[1].x=640+face*(60+core.bodySpread(id));f.facing=face;s.fighters[1].facing=-face;step(s,[A.grab|direction,0]);let held=false;
  for(let t=0;t<180;t++){held||=s.throwState?.phase==='hold';step(s,[0,0]);for(const b of s.fighters)assert.ok([b.x,b.y,b.hp,b.vx,b.vy].every(Number.isFinite));}
  assert.ok(held,id+' throw catches');assert.equal(s.throwState,null);assert.equal(s.fighters[1].hp,910);checks++;
 }
 const s=createState(id,'cpu','rivet'),f=s.fighters[0];f.pips=3;s.fighters[1].x=520;step(s,[A.special,0]);let combo=0;
 for(let t=0;t<220;t++){combo=Math.max(combo,f.combo);step(s,[0,0]);}
 assert.equal(f.pips,0);assert.equal(combo,4);assert.equal(f.move,null);checks++;
 // Verify the renderer actually chooses the custom entrance, spit and death drawings.
 const q=createState(id,'cpu','rivet'),g=q.fighters[0],p=ev.createRoundPresentation();poses.setPoseAtlasPresentation(p,q.fighters);
 assert.equal(poses.getPoseAtlasDebug(g,0).sequence,'intro');p.phase='fight';step(q,[A.bolt,0]);assert.equal(poses.getPoseAtlasDebug(g,q.frame).sequence,'cast');g.move=null;p.phase='outro';p.winner=1;p.frame=70;
 assert.equal(poses.getPoseAtlasDebug(g,q.frame).sequence,'defeat');poses.setPoseAtlasPresentation(null,[]);checks++;
 console.log('PASS:',id,'asset, motion, spit, throw, special, entrance and death contracts');
}
assert.deepEqual(bodyAtlasIds('solanadelray'),['solanadelray','solanadelray-companion']);
assert.equal(manifest.fighters.solanadelray.scale,1.15);assert.equal(manifest.fighters['solanadelray-companion'].scale,1.3);
console.log('PASS: Solana Del Ray, two distinct bodies, '+checks+' runtime cases including custom entrance/spit/death, dynamic motion and confirmed projectiles.');
