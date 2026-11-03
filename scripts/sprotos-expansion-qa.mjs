// Expansion-specific mechanics, two-body playback and bounded loading checks.
// Visual anatomy and normal-speed motion are reviewed separately in the lab.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const compile=p=>ts.transpileModule(read(p),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(bundledCore()),eu=url(compile('src/animationEvents.ts'));
const core=await import(cu),events=await import(eu);
const poseCode=compile('src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`);
const poses=await import(url(poseCode));
const inventory=JSON.parse(read('art/sprotos-expansion/inventory.json'));
const folderInventory=inventory.filter(r=>/^sproto\d+$/.test(r.id));
const requirements=JSON.parse(read('art/sprotos-expansion/user-requirements.json'));
const manifest=JSON.parse(read('public/fighters/pose-atlas.json'));
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){this.url=value;const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
const {A,FLOOR,ROSTER,PLAYABLE_FIGHTERS,COMBAT_STYLES,bodyAtlasIds,isPairedFighter,createState,step}=core;
let checks=0;
const check=(name,fn)=>{fn();checks++;console.log('PASS:',name);};
check('all 47 supplied PNGs retain exact bytes and a distinct playable selection',()=>{
 assert.equal(folderInventory.length,47);assert.ok(PLAYABLE_FIGHTERS.length>=69);
 for(const ref of inventory){assert.ok(PLAYABLE_FIGHTERS.includes(ref.id));assert.equal(ROSTER[ref.id].name,ref.name);assert.equal(createHash('sha256').update(readFileSync(new URL('../'+ref.reference,import.meta.url))).digest('hex'),ref.sha256);for(const body of ref.entities)assert.ok(manifest.fighters[body.id]);}
 assert.equal(folderInventory.reduce((n,r)=>n+r.entities.length,0),requirements.expectedSprotoBodyCount);
});
await poses.loadPoseAtlases();
check('all new bodies have 32 complete poses, reviewed walk counts and full action/event clips',()=>{
 for(const ref of inventory)for(const body of ref.entities){const cfg=manifest.fighters[body.id];assert.equal(cfg.frames.length,32);const coherentMainWalk=['sproto1815','sproto2616','sproto2789'].includes(body.id);assert.equal(cfg.walkFrames.length,coherentMainWalk?4:8);if(coherentMainWalk)assert.deepEqual(cfg.walkFrames,cfg.frames.slice(2,6),'reviewed full-body gait retains the main-pose proportions');for(const [name,n] of Object.entries(events.EVENT_CLIP_LENGTHS))assert.equal(cfg.clips[name].length,n);if(ref.entities.length>=2||ref.extraMotion)for(const[name,n]of Object.entries(events.ACTION_CLIP_LENGTHS).filter(([name])=>name!=='signatureCast'))assert.equal(cfg.clips[name].length,n);for(const frame of [...cfg.frames,...cfg.walkFrames,...Object.values(cfg.clips).flat()])assert.ok(existsSync(new URL('../public'+frame.url,import.meta.url)));}
 const jessica=manifest.fighters.sproto1815;assert.equal(jessica.scale,1.25);
 for(const name of Object.keys(events.EVENT_CLIP_LENGTHS))for(const frame of jessica.clips[name]){assert.equal(frame.width,384);assert.equal(frame.height,384);assert.deepEqual(frame.anchor,[160,300]);assert.ok(frame.url.includes('/scale-body-128/'));assert.ok(frame.bounds[0]>0&&frame.bounds[1]>0&&frame.bounds[2]<384&&frame.bounds[3]<384,'complete halberd/effects fit the padded canvas');}
});
for(const ref of inventory.filter(r=>r.entities.length>=2))check(`${ref.name}: separate bodies, both facings, full gaits, dynamic attacks and single contact damage`,()=>{
 assert.ok(isPairedFighter(ref.id));assert.deepEqual(bodyAtlasIds(ref.id),ref.entities.map(b=>b.id));
 for(const face of [-1,1]){
  const s=createState(ref.id,'cpu','vela'),f=s.fighters[0];f.x=600;s.fighters[1].x=600+face*132;f.facing=face;s.fighters[1].facing=-face;
  poses.setPoseAtlasPresentation(null,[]);poses.setPoseAtlasThrowState(null,[]);
  const stationary=poses.getDuoPoseDebug(f,0);assert.equal(stationary.length,ref.entities.length);assert.ok(stationary[0].x<stationary[1].x);
  f.facing=-face;assert.deepEqual(poses.getDuoPoseDebug(f,0).map(x=>x.x),stationary.map(x=>x.x));f.facing=face;
  const walk=createState(ref.id,'dummy'),w=walk.fighters[0];w.x=300;walk.fighters[1].x=1150;const seen=ref.entities.map(()=>new Set());poses.getDuoPoseDebug(w,0);
  for(let t=0;t<45;t++){step(walk,[A.right,0]);poses.getDuoPoseDebug(w,walk.frame).forEach((d,i)=>seen[i].add(d.frameIndex));}
  assert.deepEqual(seen.map(x=>x.size),ref.entities.map(()=>8));const frozen=poses.getDuoPoseDebug(w,walk.frame);step(walk,[A.left,0]);assert.deepEqual(poses.getDuoPoseDebug(w,walk.frame,true).map(x=>x.walkPhase),frozen.map(x=>x.walkPhase));
  step(s,[A.heavy,0]);let heavy=false;
  for(let t=0;t<90;t++){heavy||=poses.getDuoPoseDebug(f,s.frame).some(d=>d.sequence==='heavy');step(s,[0,0]);}assert.ok(heavy);assert.equal(f.move,null);
  const special=createState(ref.id,'cpu','vela'),a=special.fighters[0];a.x=600;special.fighters[1].x=600+face*132;a.facing=face;special.fighters[1].facing=-face;a.pips=3;step(special,[A.special,0]);let maxCombo=0;
  for(let t=0;t<180;t++){const before=JSON.stringify(special);const d=poses.getDuoPoseDebug(a,special.frame);assert.equal(JSON.stringify(special),before);if(a.move?.id==='special')assert.ok(d.every(x=>x.sequence==='special'));maxCombo=Math.max(maxCombo,a.combo);step(special,[0,0]);}
  assert.equal(maxCombo,COMBAT_STYLES[ref.id].specialFrames.length);assert.equal(a.pips,0);assert.equal(special.fighters.length,2);
 }
});
const lazy=await import(url(poseCode+'\n// Independent lazy-loader test module.'));
await lazy.ensurePoseAtlases(['sproto282','sproto313']);
assert.ok(lazy.getPoseAtlasLoadStatus().ids.length<10,'startup loads only this match and assists');
for(const ref of inventory){await lazy.ensurePoseAtlases([ref.id,'rivet']);assert.ok(lazy.getPoseAtlasLoadStatus().ids.includes(ref.id));assert.ok(lazy.getPoseAtlasLoadStatus().ids.length<=16,'bounded recent-body cache');}
check('legless melee winds back, lunges, rises and returns without changing combat state',()=>{
 poses.setPoseAtlasThrowState(null,[]);
 for(const id of ['sproto1870','vaudream'])for(const facing of [-1,1])for(const action of ['light','medium','heavy','launcher','sweep','airHeavy']){
  const s=createState(id,'cpu','vela'),f=s.fighters[0];f.facing=facing;
  const m=core.getMove(f,action);f.move={id:action,t:Math.floor(m.startup*.5),hit:false,connected:false,wave:-1,aim:'level'};
  const before=JSON.stringify(s),wind=poses.getHoverMeleeOffset(f);assert.equal(JSON.stringify(s),before);assert.ok(wind.x*facing<0);
  f.move.t=m.startup;const hit=poses.getHoverMeleeOffset(f);assert.ok(hit.x*facing>=24);assert.ok(Math.abs(hit.x)<=48);
  if(action==='launcher')assert.ok(hit.y<0);
  f.move.t=m.startup+m.active+m.recovery;const rest=poses.getHoverMeleeOffset(f);assert.equal(Math.abs(rest.x)+Math.abs(rest.y),0);
  f.move=null;assert.deepEqual(poses.getHoverMeleeOffset(f),{x:0,y:0});
 }
});
check('3181 has exactly two fighters and a much smaller yellow partner',()=>{
 assert.deepEqual(bodyAtlasIds('sproto3181'),['sproto3181','sproto3181-companion']);
 assert.ok(!manifest.fighters['sproto3181-companion2']);
 assert.ok(manifest.fighters['sproto3181-companion'].scale<manifest.fighters.sproto3181.scale/2);
 for(const face of [-1,1])for(const action of ['medium','heavy','sweep','airMedium','airHeavy']){
  const s=createState('sproto3181','cpu','vela'),f=s.fighters[0];f.facing=face;
  f.move={id:action,t:core.getMove(f,action).startup,hit:false,connected:false,wave:-1,aim:'level'};
  const d=poses.getDuoPoseDebug(f,s.frame);
  assert.equal(d[1].slot,poses.POSE_SLOTS.crouchLanding,'yellow partner ducks while the belly monster attacks');
  assert.notEqual(d[0].slot,poses.POSE_SLOTS.crouchLanding,'blue monster supplies the attack in both facings');
 }
});
check('3152 emits a horizontal stream from the pelvis in both facings and all aim inputs',()=>{
 const style=COMBAT_STYLES.sproto3152.projectile;
 assert.equal(style.shape,'pelvicStream');assert.ok(style.origin.height>=35&&style.origin.height<=60);
 for(const facing of [-1,1])for(const aim of [0,A.up,A.down]){
  const s=createState('sproto3152','cpu','vela'),[a,b]=s.fighters;
  a.x=facing===1?250:1050;b.x=facing===1?1150:80;a.facing=facing;b.facing=-facing;
  step(s,[A.bolt|aim,0]);for(let t=0;t<40&&!s.projectiles.length;t++)step(s,[0,0]);
  assert.equal(s.projectiles.length,1);const p=s.projectiles[0];
  assert.equal(p.y,a.y-style.origin.height);assert.equal(p.vy,0);assert.equal(Math.sign(p.vx),facing);
  assert.equal(p.x,a.x+facing*style.origin.forward+p.vx);
  const y=p.y;for(let t=0;t<8;t++){step(s,[0,0]);assert.equal(p.y,y);}
 }
});
check('requested single bodies, tiny clown scale and readable horizontal RETAIN attacks',()=>{
 for(const id of ['sproto313','sproto999','sproto1870','sprog','loadthebags','olnoname','greatcharly'])assert.deepEqual(bodyAtlasIds(id),[id]);
 assert.equal(manifest.fighters.sproto1870.locomotion,'hover');
 assert.ok(manifest.fighters['nosmileclown-companion'].scale<manifest.fighters.nosmileclown.scale/2);
 assert.equal(PLAYABLE_FIGHTERS.filter(x=>x==='captainhowdy').length,1);
 for(const facing of [-1,1])for(const aim of [0,A.up,A.down]){
  const s=createState('sisma','dummy'),[a,b]=s.fighters;a.x=facing===1?250:1100;b.x=facing===1?1200:80;a.facing=facing;b.facing=-facing;
  step(s,[A.bolt|aim,0]);for(let t=0;t<50&&!s.projectiles.length;t++)step(s,[0,0]);
  assert.equal(s.projectiles.length,1);const p=s.projectiles[0],y=p.y;assert.equal(p.shape,'retain');assert.equal(p.vy,0);assert.equal(Math.sign(p.vx),facing);
  for(let t=0;t<10;t++){step(s,[0,0]);assert.equal(p.y,y);}
 }
});
console.log(`PASS: bounded lazy loading through all ${inventory.length} selections. ${checks} expansion groups; visual review remains separate.`);
