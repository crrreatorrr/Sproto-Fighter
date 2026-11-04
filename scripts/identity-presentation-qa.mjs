// Actual installed entrance8/death16 playback and floor/camera contracts.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import ts from'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8'),compile=p=>ts.transpileModule(read(p),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText,url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(bundledCore()),eu=url(compile('src/animationEvents.ts')),core=await import(cu),ev=await import(eu);
const poses=await import(url(compile('src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`)));
const manifest=JSON.parse(read('public/fighters/pose-atlas.json'));
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){this.url=value;const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
await poses.loadPoseAtlases();
const frames=new Map();for(const[id,cfg]of Object.entries(manifest.fighters))for(const frame of Object.values(cfg.clips??{}).flat())frames.set(frame.url,{id,cfg,frame});
const installed=core.PLAYABLE_FIGHTERS.filter(id=>core.bodyAtlasIds(id).every(body=>manifest.fighters[body].clips?.entrance?.length===8&&manifest.fighters[body].clips?.death?.length===16));
if(process.argv.includes('--require-authored'))assert.equal(installed.length,core.PLAYABLE_FIGHTERS.length,'all owners and companion bodies have authored entrance/death');
function context(){return{angles:[],translations:[],scales:[],images:[],globalAlpha:1,save(){},restore(){},translate(x,y){this.translations.push([x,y]);},rotate(a){this.angles.push(a);},scale(x,y){this.scales.push([x,y]);},drawImage(...a){this.images.push(a);}};}
// Single actors retain a six-pixel margin. Paired bodies additionally shift
// to maintain formation; validate their actual painted pixels stay on camera.
let deathCases=0,entrances=0;
for(const id of installed)for(const facing of[-1,1]){
 const s=core.createState(id,'dummy','rivet'),f=s.fighters[0];f.x=640;f.facing=facing;
 poses.setPoseAtlasThrowState(null,[]);const p=ev.createRoundPresentation();poses.setPoseAtlasPresentation(p,s.fighters);const seen=new Set(),before=JSON.stringify(s);
 for(let t=0;t<ev.INTRO_FRAMES;t++){const d=poses.getPoseAtlasDebug(f,0);assert.equal(d.sequence,'entrance');assert.equal(d.frameIndex,ev.entranceFrame(p.frame));seen.add(d.frameIndex);poses.drawPoseAtlas(context(),f,0);ev.advanceRoundPresentation(p);}
 assert.equal(seen.size,8,id+' all entrance phases');assert.equal(JSON.stringify(s),before);entrances++;
 for(const x of[80,core.WIDTH-80])for(const fromFloor of[false,true])for(const impact of[-1,1]){
  f.x=x;f.hp=0;f.reaction=fromFloor?{kind:'knockdown',phase:'down',t:5,direction:impact}:null;const out=ev.createRoundPresentation();ev.beginRoundOutro(out,1,fromFloor);poses.setPoseAtlasPresentation(out,s.fighters);const visited=new Set(),snapshot=JSON.stringify(s);
  for(let age=0;age<=ev.OUTRO_FRAMES;age++){
   const d=poses.getPoseAtlasDebug(f,0);assert.equal(d.sequence,'death');assert.equal(d.frameIndex,ev.deathFrame(out.frame,fromFloor));assert.ok(d.frameIndex>=(fromFloor?8:0));
   if(!visited.has(d.frameIndex)){
    visited.add(d.frameIndex);const c=context();poses.drawPoseAtlas(c,f,0);assert.ok(c.angles.every(a=>a===0),'new authored death art must not rotate');
    assert.equal(c.images.length,core.bodyAtlasIds(id).length,id+' separate complete body drawings');
    for(let n=0;n<c.images.length;n++){
     const image=c.images[n],path=image[0].url.split('?')[0],data=frames.get(path);assert.ok(data,path+' has declared clip metadata');const margin=core.isPairedFighter(id)?0:6;const{cfg,frame}=data,[tx,ty]=c.translations[n],[sx,sy]=c.scales[n],[,dx,dy]=image;
     assert.equal(ty,core.FLOOR,id+' floor root');const k=image[3]/(frame.width??cfg.width),edges=[frame.bounds[0],frame.bounds[2]].map(b=>tx+(b*k+dx)*sx); // k: reviewed clipRegistration density
     assert.ok(Math.min(...edges)>=margin-1e-9,`${id}/${data.id} death${d.frameIndex} x${x}: left edge ${Math.min(...edges)}`);assert.ok(Math.max(...edges)<=core.WIDTH-margin+1e-9,`${id}/${data.id} death${d.frameIndex} x${x}: right edge ${Math.max(...edges)}`);
     if(d.frameIndex>=8)assert.ok(Math.abs((frame.bounds[3]*k+dy)*sy)<=1,id+' lying rest reaches exact floor');
    }
   }
   assert.equal(JSON.stringify(s),snapshot,id+' presentation is read-only');ev.advanceRoundPresentation(out);
  }
  assert.equal(visited.size,fromFloor?8:16);assert.equal(out.phase,'result');assert.equal(poses.getPoseAtlasDebug(f,0).frameIndex,15,id+' final rest holds');deathCases++;
 }
 poses.setPoseAtlasPresentation(null,[]);
}
console.log(`PASS: ${installed.length} installed owners, ${entrances} facing-specific entrance8 loops, ${deathCases} authored death16 facing/wall/impact/floor cases; exact clocks, separate twin bodies, immutable core, camera bounds and final floor rest.`);
