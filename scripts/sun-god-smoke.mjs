import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=p=>ts.transpileModule(readFileSync(new URL(p,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const cu=url(bundledCore()),eu=url(compile('../src/animationEvents.ts'));
const core=await import(cu),art=await import(url(compile('../src/powerArt.ts')));
const poses=await import(url(compile('../src/poseAtlas.ts').replace("from './core'",`from '${cu}'`).replace("from './animationEvents'",`from '${eu}'`)));
const manifest=JSON.parse(readFileSync(new URL('../public/fighters/pose-atlas.json',import.meta.url),'utf8'));
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>structuredClone(manifest)});
globalThis.Image=class{set src(value){const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
const {A,FLOOR,ROSTER,COMBAT_STYLES,createState,step,getMove}=core;
assert.equal(ROSTER.sproto2616.name,'sun god');const power=COMBAT_STYLES.sproto2616.projectile;
assert.equal(power.shape,'sun');assert.equal(power.speed,11);assert.deepEqual(power.origin,{forward:157.5,height:80});
const tick=(s,n,a=0,b=0)=>{for(let t=0;t<n;t++)step(s,[a,b]);};let cases=0;
for(const facing of [-1,1])for(const air of [false,true])for(const direction of [0,A.up,A.down,A.left,A.right,A.up|A.left,A.up|A.right,A.down|A.left,A.down|A.right]){
 const s=createState('sproto2616','dummy','rivet'),f=s.fighters[0];f.x=600;s.fighters[1].x=facing===1?1200:80;f.facing=facing;s.fighters[1].facing=-facing;if(air){f.y=FLOOR-250;f.vy=-4;}
 step(s,[A.bolt|direction,0]);let shot;for(let t=0;t<40&&!shot;t++){step(s,[0,0]);shot=s.projectiles[0];}
 assert.ok(shot);assert.equal(f.move.t,16);assert.equal(shot.shape,'sun');assert.equal(shot.damage,58);
 const dy=direction&A.up?-1:direction&A.down?1:0,dx=dy?(direction&A.left?-1:direction&A.right?1:0):facing,length=Math.hypot(dx,dy);
 assert.ok(Math.abs(shot.vx-dx/length*11)<1e-8);assert.ok(Math.abs(shot.vy-dy/length*11)<1e-8);
 assert.ok(Math.abs(shot.x-(f.x+facing*157.5+shot.vx))<1e-8,'sun begins at the staff tip');assert.ok(Math.abs(shot.y-(f.y-80+shot.vy))<1e-8);
 if(!air)assert.equal(f.y,FLOOR,'cast chord does not jump');tick(s,100);assert.equal(f.move,null);cases++;
}
for(const facing of [-1,1])for(const guard of [false,true]){
 const s=createState('sproto2616','dummy','rivet'),[a,b]=s.fighters;a.x=600;b.x=600+facing*260;a.facing=facing;b.facing=-facing;const back=facing===1?A.right:A.left;
 step(s,[A.bolt,guard?back:0]);tick(s,65,0,guard?back:0);assert.equal(b.hp,guard?1000:942,'one sun gives one 58HP hit; guard blocks it');
}
for(const facing of [-1,1]){
 const s=createState('sproto2616','dummy','rivet'),[a,b]=s.fighters;a.x=600;b.x=600+facing*260;a.facing=facing;b.facing=-facing;step(s,[A.bolt,A.down]);tick(s,65,0,A.down);assert.equal(b.hp,1000,'crouching ducks the level sun');
}
await poses.ensurePoseAtlases(['sproto2616','rivet']);
const s=createState('sproto2616','dummy','rivet');s.fighters[1].x=1200;step(s,[A.bolt,0]);tick(s,21);const debug=poses.getPoseAtlasDebug(s.fighters[0],s.frame);assert.equal(debug.sequence,'cast');assert.equal(debug.frameIndex,2,'staff casting follow-through stays visible while the sun clears its tip');
const calls=[],angles=[];const c={save(){},restore(){},rotate(angle){angles.push(angle);},fillRect(x,y,w,h){calls.push({x,y,w,h,color:this.fillStyle});}};
art.drawPower(c,'sun',0,'#60aaff');assert.ok(calls.some(r=>r.color==='#ffdf36'));assert.ok(calls.some(r=>r.color==='#ffc52e'));assert.ok(calls.some(r=>r.x>25)&&calls.some(r=>r.x<-25),'rays surround the solar disc');art.drawPower(c,'sun',7,'#60aaff');assert.notEqual(angles[0],angles[1],'rays turn in flight');
const f=createState('sproto2616','dummy','rivet').fighters[0];assert.equal(getMove(f,'bolt').startup,16);assert.equal(getMove(f,'bolt').damage,58);assert.equal(getMove(f,'bolt').recovery,27);
console.log(`PASS: ${cases} sun ground/air/facing/aim cases; staff-tip emission, four hit/block outcomes, crouch evasion, rotating rays and casting follow-through.`);
