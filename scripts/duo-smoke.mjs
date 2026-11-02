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
let count=0;
const check=(name,fn)=>{fn();count++;console.log('PASS:',name);};
const ctx=()=>({images:[],translations:[],save(){},restore(){},scale(){},rotate(){},drawImage(img){this.images.push(img.url);},translate(x,y){this.translations.push([x,y]);}});
const fresh=(face=1)=>{setPoseAtlasPresentation(null,[]);setPoseAtlasThrowState(null,[]);const s=createState('duo','cpu','vela');s.fighters[0].x=600;s.fighters[1].x=600+face*110;s.fighters[0].facing=face;s.fighters[1].facing=-face;return s;};
check('one selectable duo, two complete body atlases and one health/input/meter state',()=>{
 assert.equal(PLAYABLE_FIGHTERS.length,22);assert.ok(PLAYABLE_FIGHTERS.includes('duo'));assert.ok(!PLAYABLE_FIGHTERS.includes('duo-blue'));
 for(const id of ['duo','duo-blue']){const cfg=manifest.fighters[id];assert.equal(cfg.frames.length,32);assert.equal(cfg.walkFrames.length,4);for(const[name,n]of Object.entries(events.EVENT_CLIP_LENGTHS))assert.equal(cfg.clips[name].length,n);}
 assert.equal(fresh().fighters.length,2);
});
check('each body retains stable world-side placement across facing changes without core mutation',()=>{
 const s=fresh(),f=s.fighters[0];for(const face of [1,-1,1]){f.facing=face;const before=JSON.stringify(s),c=ctx();drawPoseAtlas(c,f,s.frame);assert.equal(JSON.stringify(s),before);assert.deepEqual(c.translations.map(v=>v[0]).sort((a,b)=>a-b),[600-DUO_SPREAD,600+DUO_SPREAD]);assert.equal(c.images.length,2);assert.ok(c.images.some(u=>u.includes('/duo-blue/')));assert.ok(c.images.some(u=>u.includes('/duo/')));}
});
check('independent half-cycle gait covers both full sequences, freezes and reverses',()=>{
 const s=fresh(),f=s.fighters[0];s.fighters[1].x=1200;const seen=[new Set(),new Set()];getDuoPoseDebug(f,0);
 for(let t=0;t<30;t++){step(s,[A.right,0]);const d=getDuoPoseDebug(f,s.frame);d.forEach((v,i)=>seen[i].add(v.frameIndex));assert.ok(Math.abs((d[1].walkPhase-d[0].walkPhase+1)%1-.5)<1e-8);}
 assert.deepEqual(seen.map(x=>x.size),[4,4]);const before=getDuoPoseDebug(f,s.frame);step(s,[A.left,0]);assert.deepEqual(getDuoPoseDebug(f,s.frame,true).map(v=>v.walkPhase),before.map(v=>v.walkPhase));
 for(let t=0;t<4;t++){step(s,[A.left,0]);getDuoPoseDebug(f,s.frame);}const a=getDuoPoseDebug(f,s.frame)[0].walkPhase;step(s,[A.left,0]);const b=getDuoPoseDebug(f,s.frame)[0].walkPhase;assert.ok((b-a+1)%1>.85);
});
check('contact geometry matches each facing-specific front body, including formation offset',()=>{
 for(const facing of [-1,1]){const id=facing===1?'duo-blue':'duo',cfg=manifest.fighters[id];for(const part of ['hand','torso']){const p=cfg.holdContact[part];assert.deepEqual(getThrowGrip({id:'duo',facing},part),[DUO_SPREAD+(p[0]-112)*1.25,(p[1]-210)*1.25]);}}
});
check('back throw keeps the catching body through release even when attacker facing flips',()=>{
 for(const face of [1,-1]){const s=fresh(face),f=s.fighters[0];step(s,[A.grab|(face===1?A.left:A.right),0]);let hold=false,released=false;
  for(let t=0;t<65;t++){setPoseAtlasThrowState(s.throwState,s.fighters);const d=getDuoPoseDebug(f,s.frame);if(s.throwState?.phase==='hold'){hold=true;assert.equal(d[face===1?1:0].slot,26);assert.equal(d[face===1?0:1].slot,25);}if(s.throwState?.phase==='release'&&s.throwState.t<6){released=true;assert.equal(f.facing,-face);assert.equal(d[face===1?1:0].slot,28);assert.equal(d[face===1?0:1].slot,25);}step(s,[0,0]);}
  assert.ok(hold&&released);assert.equal(s.fighters[1].hp,885);
 }
});
check('intro and floor defeat reach both entity clips only for the actual scene actor',()=>{
 const s=fresh(),f=s.fighters[0],p=events.createRoundPresentation();setPoseAtlasPresentation(p,s.fighters);
 for(let age=0;age<52;age++){assert.ok(getDuoPoseDebug(f,0).every(d=>d.sequence==='intro'));assert.notEqual(getPoseAtlasDebug({...f},0).sequence,'intro');events.advanceRoundPresentation(p);}
 events.beginRoundOutro(p,1,true);f.hp=0;for(let age=0;age<100;age++){const d=getDuoPoseDebug(f,age);assert.ok(d.every(v=>v.sequence==='defeat'&&v.frameIndex>=4));const c=ctx();drawPoseAtlas(c,f,age);assert.ok(c.images.every(u=>!/(?:28|29|30|31)\.png/.test(u)));events.advanceRoundPresentation(p);}
});
check('duo special has its own complete clips, consumes three pips and never doubles contact damage',()=>{
 for(const face of [1,-1]){const s=fresh(face),f=s.fighters[0];f.pips=3;let maxCombo=0,seen=new Set();step(s,[A.special,0]);
  for(let t=0;t<240;t++){setPoseAtlasPresentation(null,[]);setPoseAtlasThrowState(s.throwState,s.fighters);if(f.move?.id==='special'){
   const d=getDuoPoseDebug(f,s.frame);assert.ok(d.every(v=>v.sequence==='special'));d.forEach(v=>seen.add(v.frameIndex));
   const beat=COMBAT_STYLES.duo.specialFrames.indexOf(f.move.t);
   if(beat>=0){const side=face*(beat%2?-1:1),i=side===1?1:0;assert.equal(d[i].frameIndex,beat===3?6:beat%2?4:2);assert.equal(d[1-i].frameIndex,beat%2?3:5);}
   const bounds=getDuoLayoutDebug(f,s.frame).bounds;assert.ok(bounds[1][0]-bounds[0][1]>=11.99);
  }maxCombo=Math.max(maxCombo,f.combo);step(s,[0,0]);}
  assert.equal(f.pips,0);assert.equal(maxCombo,COMBAT_STYLES.duo.specialFrames.length);assert.ok(seen.has(6));assert.equal(s.fighters[1].hp,768);
 }
});
check('a projectile overlapping the shared duo envelope damages its one health pool once',()=>{
 const s=createState('vela','cpu','duo');s.projectiles.push({owner:0,x:s.fighters[1].x,y:FLOOR-65,vx:0,vy:0,life:100,damage:55});step(s,[0,0]);assert.equal(s.fighters[1].hp,945);assert.equal(s.projectiles.length,0);for(let t=0;t<30;t++)step(s,[0,0]);assert.equal(s.fighters[1].hp,945);
});
check('both complete falling bodies stay separated and inside the camera at both walls',()=>{
 for(const facing of [-1,1])for(const direction of [-1,1])for(const x of [100,600,1180]){
  const s=fresh(facing),f=s.fighters[0];f.x=x;
  for(const phase of ['flight','down'])for(const t of [0,6,12,18,30]){
   f.reaction={kind:'knockdown',phase,t,direction};f.stun=30;f.y=phase==='down'?FLOOR:FLOOR-100;
   const before=JSON.stringify(f),layout=getDuoLayoutDebug(f,t);
   assert.equal(JSON.stringify(f),before);assert.ok(layout.bounds[1][0]-layout.bounds[0][1]>=11.99);
   assert.ok(layout.bounds[0][0]>=5.99);assert.ok(layout.bounds[1][1]<=core.WIDTH-5.99);
  }
  f.y=FLOOR;const p=events.createRoundPresentation();events.beginRoundOutro(p,1,true);setPoseAtlasPresentation(p,s.fighters);
  for(let age=0;age<=96;age++){p.frame=age;const b=getDuoLayoutDebug(f,age).bounds;assert.ok(b[1][0]-b[0][1]>=11.99);assert.ok(b[0][0]>=5.99&&b[1][1]<=core.WIDTH-5.99);}
  setPoseAtlasPresentation(null,[]);
 }
});
console.log(`${count} duo contract groups passed. Browser visual review is recorded separately.`);
