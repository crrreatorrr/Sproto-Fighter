// Exercise new fighters against the actual combat and atlas implementations.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const compile=p=>ts.transpileModule(read(p),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(bundledCore()),eu=url(compile('src/animationEvents.ts')),core=await import(cu);
const poses=await import(url(compile('src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`)));
const manifest=JSON.parse(read('public/fighters/pose-atlas.json')),plan=JSON.parse(read('art/buddhashadow/plan.json'));
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
await poses.ensurePoseAtlases([...plan.map(p=>p.id),'rivet']);
const {A,FLOOR,ROSTER,COMBAT_STYLES,PLAYABLE_FIGHTERS,bodyAtlasIds,createState,step,getMove}=core;
const tick=(s,n,a=0,b=0)=>{for(let t=0;t<n;t++)step(s,[a,b]);};
const hashes=new Set();let casts=0,throws=0;
for(const info of plan){
 const id=info.id,cfg=manifest.fighters[id];assert.ok(PLAYABLE_FIGHTERS.includes(id));assert.equal(ROSTER[id].name,info.name);assert.deepEqual(bodyAtlasIds(id),[id]);
 assert.equal(cfg.frames.length,32);assert.equal(cfg.walkFrames.length,8);
 for(const cell of cfg.walkFrames)assert.deepEqual(cell.anchor,[142,210],'walk uses inspected whole-sheet root registration');
 for(const cells of Object.values(cfg.clips))for(const cell of cells)if(cell.url.startsWith('/fighters/events/buddhashadow/')){const slot=Number(cell.url.split('/').pop().split('.')[0]);assert.deepEqual(cell.anchor??cfg.anchor,[slot<23?128:112,210],'standing events preserve their root; floor-rest registration remains centered');}
 for(const[name,n]of Object.entries({intro:4,special:8,cast:4,recoil:4,defeat:12,entrance:8,ranged:8,death:16})){
  assert.equal(cfg.clips[name].length,n);const hash=createHash('sha256');for(const frame of cfg.clips[name])hash.update(readFileSync(new URL('../public'+frame.url,import.meta.url)));
  const value=hash.digest('hex');assert.ok(!hashes.has(value),id+' unique '+name+' sequence');hashes.add(value);
 }
 for(const facing of [-1,1]){
  const s=createState(id,'cpu','rivet'),f=s.fighters[0];f.x=600;s.fighters[1].x=facing===1?1200:80;f.facing=facing;
  const entrance=new Set();for(let age=0;age<52;age++){poses.setPoseAtlasPresentation({phase:'intro',frame:age,winner:null,fromFloor:false},s.fighters);const before=JSON.stringify(s),d=poses.getPoseAtlasDebug(f,age);assert.equal(d.sequence,'entrance');entrance.add(d.frameIndex);assert.equal(JSON.stringify(s),before);}assert.equal(entrance.size,8);
  for(const fromFloor of [false,true]){const seen=new Set();for(let age=0;age<96;age++){poses.setPoseAtlasPresentation({phase:'outro',frame:age,winner:1,fromFloor},s.fighters);const d=poses.getPoseAtlasDebug(f,age);assert.equal(d.sequence,'death');seen.add(d.frameIndex);if(fromFloor)assert.ok(d.frameIndex>=8);}assert.equal(seen.size,fromFloor?8:16);}
  poses.setPoseAtlasPresentation(null,[]);const walk=new Set();for(let t=0;t<40;t++){step(s,[facing===1?A.right:A.left,0]);walk.add(poses.getPoseAtlasDebug(f,s.frame).frameIndex);assert.equal(f.y,FLOOR);}assert.equal(walk.size,8);
  tick(s,3);assert.equal(f.vx,0);step(s,[A.dash,0]);assert.ok(f.dash>0);tick(s,20);step(s,[A.up,0]);tick(s,5);assert.ok(f.y<FLOOR);tick(s,80);assert.equal(f.y,FLOOR);
 }
 for(const action of ['light','medium','heavy','launcher','bolt']){const s=createState(id,'cpu','rivet');s.fighters[1].x=1200;step(s,[A[action],0]);assert.equal(s.fighters[0].move?.id,action);tick(s,110);assert.equal(s.fighters[0].move,null);}
 for(const facing of [-1,1])for(const direction of [0,A.up,A.down,facing===1?A.left:A.right]){
  const s=createState(id,'cpu','rivet'),[a,b]=s.fighters;a.x=600;b.x=600+facing*60;a.facing=facing;b.facing=-facing;step(s,[A.grab|direction,0]);let held=false;
  for(let n=0;n<180;n++){held||=s.throwState?.phase==='hold';step(s,[0,0]);for(const f of s.fighters)assert.ok([f.x,f.y,f.hp,f.vx,f.vy].every(Number.isFinite));}assert.ok(held);assert.equal(b.hp,885);assert.equal(s.throwState,null);throws++;
 }
 for(const facing of [-1,1])for(const air of [false,true])for(const direction of [0,A.up,A.down,A.left,A.right,A.up|A.left,A.up|A.right,A.down|A.left,A.down|A.right]){
  const s=createState(id,'cpu','rivet'),[a,b]=s.fighters;a.x=600;b.x=facing===1?1200:80;a.facing=facing;b.facing=-facing;if(air){a.y=FLOOR-250;a.vy=-4;}
  const style=COMBAT_STYLES[id],move=getMove(a,'bolt');let shot;step(s,[A.bolt|direction,0]);const seen=new Set();
  for(let n=0;n<move.startup+move.recovery+10;n++){
   const before=JSON.stringify(s),d=poses.getPoseAtlasDebug(a,s.frame);assert.equal(JSON.stringify(s),before);if(a.move?.id==='bolt'){assert.equal(d.sequence,'ranged');seen.add(d.frameIndex);if(a.move.t===move.startup)assert.equal(d.frameIndex,4);}
   if(!shot&&s.projectiles.length){shot=s.projectiles[0];assert.equal(a.move.t,move.startup);assert.equal(shot.shape,style.projectile.shape);assert.equal(shot.vx,facing*style.projectile.speed);assert.equal(shot.vy,0);assert.equal(shot.gravity,0);assert.equal(shot.wave,0);assert.equal(shot.damage,move.damage);assert.ok(Math.abs(shot.x-a.x-facing*(info.mouthOrigin.forward+style.projectile.speed))<1e-8);assert.ok(Math.abs(shot.y-(a.y-info.mouthOrigin.height))<1e-8);}
   step(s,[0,0]);
  }assert.ok(shot);assert.equal(seen.size,8);assert.equal(a.move,null);casts++;
 }
 for(const facing of [-1,1])for(const guard of [false,true]){const s=createState(id,'cpu','rivet'),[a,b]=s.fighters;a.x=600;b.x=600+facing*260;a.facing=facing;b.facing=-facing;const back=facing===1?A.right:A.left;step(s,[A.bolt,guard?back:0]);tick(s,70,0,guard?back:0);assert.equal(b.hp,guard?1000:1000-getMove(a,'bolt').damage,id+' single hit or block');}
 const s=createState(id,'cpu','rivet'),a=s.fighters[0];a.pips=3;s.fighters[1].x=480;step(s,[A.special,0]);let combo=0;for(let n=0;n<220;n++){combo=Math.max(combo,a.combo);step(s,[0,0]);}assert.equal(combo,4);assert.equal(a.pips,0);assert.equal(a.move,null);
 console.log('PASS:',info.name,'104-frame contract, distinct entrance8/spit8/death16 playback, both-facing movement, attacks, throws and four-contact special.');
}
console.log(`PASS: ${casts} ground/air/facing/aim mouth-spit cases; ${throws} directional throws; exact spawn/release, single hit/block, full recovery and read-only presentation.`);
assert.equal(COMBAT_STYLES.buddhashadow.projectile.shape,'darkRing');
const art=await import(url(compile('src/powerArt.ts')));
for(const age of [0,8,24,60]){
 const pixels=[],c={save(){},restore(){},rotate(){},fillRect(x,y,w,h){pixels.push({x,y,w,h,color:this.fillStyle});}};
 art.drawPower(c,'darkRing',age,'#ffff00');assert.ok(pixels.length>70);
 assert.ok(pixels.every(p=>!(p.x<=0&&p.x+p.w>=0&&p.y<=0&&p.y+p.h>=0)),'dark ring has an open center');
 assert.ok(pixels.every(p=>Math.max(...p.color.slice(1).match(/../g).map(h=>parseInt(h,16)))<=116),'ring uses dark inks regardless of fighter HUD color');
}
console.log('PASS: dark-ring projectile has an open center and fixed charcoal/black palette throughout rotation.');
