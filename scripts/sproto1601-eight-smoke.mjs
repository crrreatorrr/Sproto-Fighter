// Phase 2/3: retimed template recovery/damage and 12% guarded chip; artwork contracts retained.
import { assertProjectileKit } from './lib/gameplay-fixtures.mjs';
// Phase 1 deliberately updates numeric combat expectations; authored art contracts remain pinned.
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
assertProjectileKit(core,'sproto1601');
const {A,FLOOR,ROSTER,COMBAT_STYLES,createState,step,getMove}=core;
assert.equal(ROSTER.sproto1601.name,'888');assert.equal(ROSTER.sproto1601.partner,'vaudream');const power=COMBAT_STYLES.sproto1601.projectile;
assert.equal(power.shape,'yellowEight');assert.equal(power.speed,12);assert.deepEqual(power.origin,{forward:77.5,height:105});
const tick=(s,n,a=0,b=0)=>{for(let t=0;t<n;t++)step(s,[a,b]);};let cases=0;
for(const facing of [-1,1])for(const air of [false,true])for(const direction of [0,A.up,A.down,A.left,A.right,A.up|A.left,A.up|A.right,A.down|A.left,A.down|A.right]){
 const s=createState('sproto1601','dummy','rivet'),f=s.fighters[0];f.x=600;s.fighters[1].x=facing===1?1200:80;f.facing=facing;s.fighters[1].facing=-facing;if(air){f.y=FLOOR-250;f.vy=-4;}
 step(s,[A.bolt|direction,0]);let shot;for(let t=0;t<40&&!shot;t++){step(s,[0,0]);shot=s.projectiles[0];}
 assert.ok(shot);assert.equal(f.move.t,20);assert.equal(shot.shape,'yellowEight');assert.equal(shot.damage,43);
 const dy=direction&A.up?-1:direction&A.down?1:0,dx=dy?(direction&A.left?-1:direction&A.right?1:0):facing,length=Math.hypot(dx,dy);
 assert.ok(Math.abs(shot.vx-dx/length*12)<1e-8);assert.ok(Math.abs(shot.vy-dy/length*12)<1e-8);
 assert.ok(Math.abs(shot.x-(f.x+facing*77.5+shot.vx))<1e-8,'digit begins at the throwing hand');assert.ok(Math.abs(shot.y-(f.y-105+shot.vy))<1e-8);
 if(!air)assert.equal(f.y,FLOOR,'cast chord does not jump');tick(s,100);assert.equal(f.move,null);cases++;
}
for(const facing of [-1,1])for(const guard of [false,true]){
 const s=createState('sproto1601','dummy','rivet'),[a,b]=s.fighters;a.x=600;b.x=600+facing*260;a.facing=facing;b.facing=-facing;const back=facing===1?A.right:A.left;
 step(s,[A.bolt,guard?back:0]);tick(s,65,0,guard?back:0);assert.equal(b.hp,1000-(guard?Math.round(getMove(a,'bolt').damage*.12):getMove(a,'bolt').damage),'one thrown 8 gives one normalized hit; guard blocks it');
}
for(const facing of [-1,1]){
 const s=createState('sproto1601','dummy','rivet'),[a,b]=s.fighters;a.x=600;b.x=600+facing*260;a.facing=facing;b.facing=-facing;step(s,[A.bolt,A.down]);tick(s,65,0,A.down);assert.equal(b.hp,1000,'crouching ducks the level throw');
}
await poses.ensurePoseAtlases(['sproto1601','rivet']);
const s=createState('sproto1601','dummy','rivet');s.fighters[1].x=1200;step(s,[A.bolt,0]);tick(s,20);const debug=poses.getPoseAtlasDebug(s.fighters[0],s.frame);assert.equal(debug.sequence,'cast');assert.equal(debug.frameIndex,2,'throw follow-through stays visible while the number clears the hand');
const calls=[],angles=[];const c={save(){},restore(){},rotate(angle){angles.push(angle);},fillRect(x,y,w,h){calls.push({x,y,w,h,color:this.fillStyle});}};
art.drawPower(c,'yellowEight',0,'#60aaff');const covered=(x,y)=>calls.some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
assert.ok(calls.some(r=>r.color==='#ffe23b'));assert.ok(calls.some(r=>r.color==='#111828'));assert.ok(!covered(1.5,-10.5)&&!covered(1.5,10.5),'both holes remain transparent and readable');
art.drawPower(c,'yellowEight',7,'#60aaff');assert.ok(Math.abs(angles[1])<=.12,'gentle wobble preserves upright digit');
const f=createState('sproto1601','dummy','rivet').fighters[0];assert.equal(getMove(f,'bolt').startup,20);assert.equal(getMove(f,'bolt').damage,43);assert.equal(getMove(f,'bolt').recovery,21);
console.log(`PASS: ${cases} yellow-8 ground/air/facing/aim cases; hand emission, four hit/block outcomes, crouch evasion, readable two-hole glyph and throw follow-through.`);
