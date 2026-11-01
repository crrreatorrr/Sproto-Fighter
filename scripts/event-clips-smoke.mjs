// Mechanical/metadata checks only. Stub Image reads PNG headers; no visual approval.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=p=>ts.transpileModule(readFileSync(new URL(p,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(compile('../src/core.ts')),eu=url(compile('../src/animationEvents.ts'));
const core=await import(cu),events=await import(eu);
const poses=await import(url(compile('../src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`)));
const original=JSON.parse(readFileSync(new URL('../public/fighters/pose-atlas.json',import.meta.url),'utf8'));
let manifest=structuredClone(original);
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){this.url=value;try{const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}catch{queueMicrotask(()=>this.onerror());}}};
const {A,FLOOR,WIDTH,createState,step,getMove,COMBAT_STYLES}=core;
const {loadPoseAtlases,getPoseAtlasDebug:debug,drawPoseAtlas:draw,setPoseAtlasPresentation:present,setPoseAtlasThrowState:throwScene,setPoseAtlasAssistTiming:assistTiming}=poses;
const {EVENT_CLIP_LENGTHS,createRoundPresentation,advanceRoundPresentation,beginRoundOutro,specialFrame,castFrame,recoilFrame,defeatFrame}=events;
await loadPoseAtlases();const installed=Object.keys(original.fighters).filter(id=>Object.keys(original.fighters[id].clips??{}).length);
assert.ok(installed.length,'No installed event clips to test');
let count=0;const check=async(name,fn)=>{await fn();count++;console.log('PASS:',name);};
function fresh(id,face=1,distance=60){present(null,[]);throwScene(null,[]);const s=createState(id,'dummy');const[a,b]=s.fighters;a.x=640;b.x=640+face*distance;a.facing=face;b.facing=-face;return s;}
function ctx(){return {angles:[],translations:[],scales:[],images:[],globalAlpha:1,save(){},restore(){},translate(x,y){this.translations.push([x,y]);},rotate(a){this.angles.push(a);},scale(x,y){this.scales.push([x,y]);},drawImage(...a){this.images.push(a);}};}
const each=(clip,fn)=>{for(const id of installed)if(original.fighters[id].clips[clip])for(const face of [1,-1])fn(id,face);};
await check('installed optional clips have exact current counts and inventory; absent roster entries remain absent',()=>{
 const inv=poses.getPoseAtlasClipInventory();for(const[id,cfg]of Object.entries(original.fighters))for(const[name,n]of Object.entries(EVENT_CLIP_LENGTHS)){if(cfg.clips?.[name]){assert.equal(cfg.clips[name].length,n);assert.equal(inv[id][name],n);}else assert.equal(inv[id][name],undefined);}
});
await check('intro clocks cover four frames without core mutation; identity excludes same-ID assist',()=>each('intro',(id,face)=>{
 const s=fresh(id,face),f=s.fighters[0],copy=structuredClone(f),p=createRoundPresentation(),before=JSON.stringify(s),seen=new Set();present(p,s.fighters);
 for(let t=0;t<events.INTRO_FRAMES;t++){const d=debug(f,s.frame);assert.equal(d.sequence,'intro');seen.add(d.frameIndex);draw(ctx(),f,s.frame);assert.notEqual(debug(copy,0).sequence,'intro');advanceRoundPresentation(p);}
 assert.equal(seen.size,4);assert.equal(p.phase,'fight');assert.equal(JSON.stringify(s),before);present(null,[]);
}));
await check('actual special inputs select contact poses on every own-kit contact and hold through real hitstop',()=>each('special',(id,face)=>{
 const s=fresh(id,face),f=s.fighters[0];f.pips=3;const contacts=COMBAT_STYLES[id].specialFrames,seen=new Set();let frozen=0;
 for(let t=0;t<300;t++){const oldAge=f.move?.t,oldFreeze=s.freeze,oldFrame=s.frame;step(s,[t===0?A.special:0,0]);if(!f.move)continue;const before=JSON.stringify(s),d=debug(f,s.frame,s.freeze>0);assert.equal(d.sequence,'special');assert.equal(d.frameIndex,specialFrame(f.move.t,contacts));draw(ctx(),f,s.frame,false,s.freeze>0);assert.equal(JSON.stringify(s),before);
 if(contacts.includes(f.move.t)){seen.add(f.move.t);assert.ok([2,4,6].includes(d.frameIndex));}if(oldFreeze>0){assert.equal(f.move.t,oldAge);assert.equal(s.frame,oldFrame+1);frozen++;}}
 assert.deepEqual([...seen],contacts,id);assert.ok(frozen>0,id+' actual hitstop');assert.equal(f.pips,0);
}));
await check('cast release lasts at least four simulation ages; rendering preserves projectile spawn and mouth origins',()=>each('cast',(id,face)=>{
 const visual=fresh(id,face,450),plain=structuredClone(visual),f=visual.fighters[0],m=getMove(f,'bolt');const release=new Set();let spawnAge=null;
 for(let t=0;t<m.startup+m.active+m.recovery+5;t++){step(visual,[t===0?A.bolt:0,0]);step(plain,[t===0?A.bolt:0,0]);const d=debug(f,visual.frame);draw(ctx(),f,visual.frame);assert.deepEqual(visual,plain);
 if(f.move){assert.equal(d.frameIndex,castFrame(f.move.t,m.startup,m.active));if(d.frameIndex===2)release.add(f.move.t);}
 if(spawnAge===null&&visual.projectiles.length){spawnAge=f.move.t;const p=visual.projectiles[0];if(id==='rivet'||id==='vela'){assert.equal(p.vy,0);assert.equal(p.y,f.y-(id==='rivet'?109:103));assert.ok(Math.abs(p.x-(f.x+face*(id==='rivet'?44:59)))<=Math.abs(p.vx)+.01);}}}
 assert.equal(spawnAge,m.startup);assert.ok(release.size>=4);assert.ok(release.has(m.startup));
}));
await check('real grounded light recoil samples correctly; block, throw, airborne and knockdown suppress recoil',()=>each('recoil',(id,face)=>{
 const s=fresh(id,face),f=s.fighters[0];let seen=new Set();for(let t=0;t<70;t++){step(s,[0,t===0?A.light:0]);if(f.reaction?.kind==='recoil'&&f.y>=FLOOR){const d=debug(f,s.frame);assert.equal(d.sequence,'recoil');assert.equal(d.frameIndex,recoilFrame(f.reaction.t));seen.add(d.frameIndex);}}
 assert.equal(seen.size,EVENT_CLIP_LENGTHS.recoil);
 f.reaction={kind:'recoil',phase:'flight',t:5,direction:face};f.stun=10;f.blockstun=5;assert.notEqual(debug(f,100).sequence,'recoil');f.blockstun=0;f.y=FLOOR-1;assert.notEqual(debug(f,101).sequence,'recoil');f.y=FLOOR;f.reaction.kind='knockdown';assert.notEqual(debug(f,102).sequence,'recoil');f.reaction.kind='recoil';
 throwScene({attacker:1,victim:0,phase:'hold',t:4,direction:'forward',facing:-face},s.fighters);assert.notEqual(debug(f,103).sequence,'recoil');throwScene(null,[]);const c=ctx();draw(c,f,104);assert.deepEqual(c.angles,[0]);
}));
await check('defeat floor starts at4+, never rotates authored art, rests at source floor baseline, final result holds',()=>each('defeat',(id,face)=>{
 for(const fromFloor of [false,true]){const s=fresh(id,face),f=s.fighters[0],p=createRoundPresentation();f.hp=0;f.reaction=fromFloor?{kind:'knockdown',phase:'down',t:5,direction:-face}:null;beginRoundOutro(p,1,fromFloor);present(p,s.fighters);const seen=new Set();
 for(let t=0;t<140;t++){const d=debug(f,s.frame),c=ctx();assert.equal(d.sequence,'defeat');assert.equal(d.frameIndex,defeatFrame(p.frame,fromFloor));if(fromFloor)assert.ok(d.frameIndex>=4);seen.add(d.frameIndex);draw(c,f,s.frame);assert.deepEqual(c.angles,[0]);assert.equal(c.translations[0][1],FLOOR);const cfg=original.fighters[id],frame=cfg.clips.defeat[d.frameIndex],anchor=frame.anchor??cfg.anchor,scale=cfg.scale??cfg.worldHeight/cfg.height;assert.deepEqual(c.scales,[[(fromFloor?-face:face)*(cfg.facing??1)*scale,scale]],id+' floor impact direction / standing facing');assert.equal(c.images[0][2],-anchor[1]);if(d.frameIndex>=4){assert.ok(Math.abs((frame.bounds[3]-anchor[1])*(cfg.scale??cfg.worldHeight/cfg.height))<=1,id+' authored floor bound');}advanceRoundPresentation(p);}
 assert.equal(p.phase,'result');assert.equal(debug(f,1).frameIndex,11);assert.ok(seen.has(11));assert.equal(debug(s.fighters[1],0).sequence,'poses');p.winner=2;assert.equal(debug(f,0).sequence,'defeat');present(null,[]);}
}));
await check('mixed-state double-KO presentation detect prone losers individually and retain opposite impact orientation',()=>each('defeat',(id,face)=>{
 for(const proneIndex of [0,1]){
  const s=fresh(id,face);s.fighters[1].id=id;const p=createRoundPresentation();const prone=s.fighters[proneIndex],upright=s.fighters[1-proneIndex];prone.reaction={kind:'knockdown',phase:'down',t:8,direction:-prone.facing};upright.reaction=null;
  // Global false is intentional: only one participant is already on the floor.
  beginRoundOutro(p,2,false);present(p,s.fighters);const before=JSON.stringify(s),cfg=original.fighters[id],scale=cfg.scale??cfg.worldHeight/cfg.height;
  assert.equal(debug(prone,0).frameIndex,4);assert.equal(debug(upright,0).frameIndex,0);
  for(let age=0;age<120;age++){
   for(const f of s.fighters){const isProne=f===prone,d=debug(f,s.frame),c=ctx();assert.equal(d.sequence,'defeat');assert.equal(d.frameIndex,defeatFrame(p.frame,isProne));if(isProne)assert.ok(d.frameIndex>=4,'prone participant must never replay upright collapse');draw(c,f,s.frame);assert.deepEqual(c.scales,[[(isProne?f.reaction.direction:f.facing)*(cfg.facing??1)*scale,scale]]);assert.deepEqual(c.angles,[0]);assert.equal(c.translations[0][1],FLOOR);}
   advanceRoundPresentation(p);
  }
  assert.equal(debug(prone,0).frameIndex,11);assert.equal(debug(upright,0).frameIndex,11);assert.equal(JSON.stringify(s),before);present(null,[]);
 }
}));
await check('explicit floor presentation without reaction safely uses current facing',()=>each('defeat',(id,face)=>{
 const s=fresh(id,face),f=s.fighters[0],p=createRoundPresentation();assert.equal(f.reaction,null);beginRoundOutro(p,1,true);present(p,s.fighters);const c=ctx(),cfg=original.fighters[id],scale=cfg.scale??cfg.worldHeight/cfg.height;
 assert.equal(debug(f,0).frameIndex,4);draw(c,f,0);assert.deepEqual(c.scales,[[face*(cfg.facing??1)*scale,scale]]);assert.deepEqual(c.angles,[0]);present(null,[]);
}));
await check('all defeat frames stay inside six-pixel horizontal margins at both walls without core-position mutation',()=>each('defeat',(id,face)=>{
 const cfg=original.fighters[id];
 for(const x of [80,WIDTH-80])for(const fromFloor of [false,true])for(const direction of [-1,1]){
  const s=fresh(id,face),f=s.fighters[0],p=createRoundPresentation();f.x=x;f.hp=0;f.reaction=fromFloor?{kind:'knockdown',phase:'down',t:5,direction}:null;beginRoundOutro(p,1,fromFloor);present(p,s.fighters);const seen=new Set(),before=JSON.stringify(s);
  for(let age=0;age<=events.OUTRO_FRAMES;age++){
   const d=debug(f,s.frame);if(!seen.has(d.frameIndex)){
    seen.add(d.frameIndex);const c=ctx();draw(c,f,s.frame);const source=cfg.clips.defeat[d.frameIndex];assert.ok(source.bounds,id+' defeat bounds required for wall test');
    const [tx]=c.translations[0],[sx]=c.scales[0],[,dx]=c.images[0];const edges=[source.bounds[0],source.bounds[2]].map(b=>tx+(b+dx)*sx),left=Math.min(...edges),right=Math.max(...edges);
    assert.ok(left>=6-1e-9,`${id} frame${d.frameIndex} x${x} facing${face} impact${direction} floor${fromFloor}: left ${left} <6`);
    assert.ok(right<=WIDTH-6+1e-9,`${id} frame${d.frameIndex} x${x} facing${face} impact${direction} floor${fromFloor}: right ${right} >${WIDTH-6}`);
    assert.equal(f.x,x);assert.deepEqual(c.angles,[0]);assert.equal(JSON.stringify(s),before);
   }advanceRoundPresentation(p);
  }
  assert.equal(seen.size,fromFloor?EVENT_CLIP_LENGTHS.defeat-4:EVENT_CLIP_LENGTHS.defeat);present(null,[]);
 }
}));
await check('stable assist identity follows owner contacts rather than its own kit; same-ID object unaffected',()=>each('special',(id,face)=>{
 const s=fresh(id,face),f=s.fighters[0],other=structuredClone(f);const contacts=[9,21,33,45,57,69];assistTiming(f,contacts);for(let t=0;t<=75;t++){f.move={id:'special',t};other.move={id:'special',t};assert.equal(debug(f,t).frameIndex,specialFrame(t,contacts));assert.equal(debug(other,t).frameIndex,specialFrame(t,COMBAT_STYLES[id].specialFrames));}
}));
for(const failure of ['length','missing'])await check(failure+' rejects atomically without old-art fallback',async()=>{
 manifest=structuredClone(original);const id=installed[0],name=Object.keys(manifest.fighters[id].clips)[0];if(failure==='length')manifest.fighters[id].clips[name].pop();else manifest.fighters[id].clips[name][0]={url:'/fighters/never-installed-event.png',width:256,height:256};
 await assert.rejects(loadPoseAtlases());assert.equal(poses.getPoseAtlasLoadStatus().state,'error');assert.equal(poses.getPoseAtlasLoadStatus().ids.length,0);assert.equal(poses.isPoseAtlasDeclared(id),true);assert.deepEqual(poses.getPoseAtlasClipInventory(),{});manifest=structuredClone(original);await loadPoseAtlases();
});
console.log(`${count} event-clip groups passed for installed IDs: ${installed.join(', ')} (both facings). Mechanical/metadata coverage only; no visual claim.`);
