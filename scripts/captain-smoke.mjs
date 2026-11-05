// Phase 2/3: retimed template recovery/damage and 12% guarded chip; artwork contracts retained.
import { assertProjectileKit } from './lib/gameplay-fixtures.mjs';
// Phase 1 deliberately updates numeric combat expectations; authored art contracts remain pinned.
// Focused Yelnacio Globulous integration checks. Laser appearance is reviewed in the browser.
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
assertProjectileKit(core,'captain');
const {A,FLOOR,ROSTER,COMBAT_STYLES,PLAYABLE_FIGHTERS,bodyAtlasIds,createState,step,getMove}=core;
assert.ok(PLAYABLE_FIGHTERS.includes('captain'));
assert.equal(ROSTER.captain.name,'Yelnacio Globulous');
assert.equal(COMBAT_STYLES.captain.role,'LASER CAPTAIN');
assert.deepEqual(bodyAtlasIds('captain'),['captain'],'one independent Yelnacio Globulous body');
const cfg=manifest.fighters.captain;
assert.equal(cfg.frames.length,32);assert.equal(cfg.walkFrames.length,8);assert.equal(cfg.anchor[1],210,'grounded foot anchor');
for(const [name,count]of Object.entries({intro:4,special:8,cast:4,recoil:4,defeat:12}))assert.equal(cfg.clips[name].length,count);
await poses.ensurePoseAtlases(['captain','rivet']);
const tick=(s,n,a=0,b=0)=>{for(let i=0;i<n;i++)step(s,[a,b]);};
for(const face of [-1,1]){
 const s=createState('captain','cpu','rivet'),f=s.fighters[0];f.x=600;s.fighters[1].x=face===1?1150:130;f.facing=face;
 const seen=new Set();poses.getPoseAtlasDebug(f,0);
 for(let t=0;t<40;t++){step(s,[face===1?A.right:A.left,0]);seen.add(poses.getPoseAtlasDebug(f,s.frame).frameIndex);assert.equal(f.y,FLOOR);}
 assert.equal(seen.size,8,'complete walking cycle in both facings');tick(s,3);assert.equal(f.vx,0);
 step(s,[A.dash,0]);assert.ok(f.dash>0);tick(s,20);step(s,[A.up,0]);tick(s,5);assert.ok(f.y<FLOOR);tick(s,80);assert.equal(f.y,FLOOR);
}
for(const action of ['light','medium','heavy','launcher','bolt']){
 const s=createState('captain','cpu','rivet');s.fighters[1].x=1100;step(s,[A[action],0]);assert.equal(s.fighters[0].move?.id,action);tick(s,100);assert.equal(s.fighters[0].move,null);
}
for(const face of [-1,1])for(const direction of [0,A.up,A.down,face===1?A.left:A.right]){
 const s=createState('captain','cpu','rivet'),f=s.fighters[0];f.x=600;s.fighters[1].x=600+face*60;f.facing=face;s.fighters[1].facing=-face;
 step(s,[A.grab|direction,0]);let held=false;
 for(let t=0;t<180;t++){held||=s.throwState?.phase==='hold';step(s,[0,0]);for(const f of s.fighters)assert.ok([f.x,f.y,f.hp,f.vx,f.vy].every(Number.isFinite));}
 assert.ok(held,'Captain throw catches');assert.equal(s.throwState,null);assert.equal(s.fighters[1].hp,910);
}
const s=createState('captain','cpu','rivet'),f=s.fighters[0];f.pips=3;s.fighters[1].x=480;step(s,[A.special,0]);let combo=0;
for(let t=0;t<220;t++){combo=Math.max(combo,f.combo);step(s,[0,0]);}
assert.equal(f.pips,0);assert.equal(combo,COMBAT_STYLES.captain.specialFrames.length);assert.equal(f.move,null);
console.log('PASS: Yelnacio Globulous identity and 72-frame asset contract; full gait in both facings, dash/jump/landing, five attacks, eight directional throws and four-contact Solar Salvo. Laser checks also run below.');

const laser=COMBAT_STYLES.captain.projectile;
assert.equal(laser.shape,'eyeLaser');assert.equal(laser.speed,12);assert.equal(laser.horizontal,true);assert.ok(laser.origin.forward>0&&laser.origin.height>0);
let cases=0;
for(const face of [-1,1])for(const air of [false,true])for(const direction of [0,A.up,A.down,A.left,A.right,A.up|A.left,A.up|A.right,A.down|A.left,A.down|A.right]){
 const s=createState('captain','cpu','rivet'),f=s.fighters[0];f.x=600;s.fighters[1].x=face===1?1200:80;f.facing=face;s.fighters[1].facing=-face;
 if(air){f.y=FLOOR-250;f.vy=-4;}
 step(s,[A.bolt|direction,0]);let shot;
 for(let t=0;t<40&&!shot;t++){step(s,[0,0]);shot=s.projectiles[0];}
 assert.ok(shot,'laser spawns');assert.equal(shot.shape,'eyeLaser');assert.equal(shot.vx,face*12);assert.equal(shot.vy,0);assert.equal(shot.gravity,0);assert.equal(shot.wave,0);
 assert.ok(Math.abs(shot.x-f.x-face*(laser.origin.forward+12))<1e-8,'beam starts at reviewed eyes before first movement');assert.ok(Math.abs(shot.y-(f.y-laser.origin.height))<1e-8);
 const y=shot.y;for(let t=0;t<5;t++){step(s,[0,0]);assert.equal(shot.y,y,'laser never droops or curves');}
 cases++;
}
for(const face of [-1,1])for(const guard of [false,true]){
 const s=createState('captain','cpu','rivet');s.fighters[0].x=600;s.fighters[1].x=600+face*260;s.fighters[0].facing=face;s.fighters[1].facing=-face;
 const back=face===1?A.right:A.left;step(s,[A.bolt,guard?back:0]);tick(s,65,0,guard?back:0);assert.equal(s.fighters[1].hp,1000-(guard?Math.round(getMove(s.fighters[0],'bolt').damage*.12):getMove(s.fighters[0],'bolt').damage),'one laser causes one normalized hit, guard blocks it');
}
const visual=await import(url(compile('../src/powerArt.ts')));const boxes=[];
const context={save(){},restore(){},fillRect(x,y,w,h){boxes.push({x,y,w,h,color:this.fillStyle});}};
visual.drawPower(context,'eyeLaser',0,'#ef473b');assert.ok(boxes.some(r=>r.w>=60&&r.h<=12));assert.ok(boxes.some(r=>r.color==='#fffbe2'),'bright beam core');
console.log(`PASS: ${cases} laser ground/air/facing/aim cases; eye emission, straight fast travel, 4 hit/block outcomes and distinct bright beam rendering.`);
assert.ok(laser.origin.height>=100&&laser.origin.height<=130,'eye-line origin, above the lowered hands');
for(const face of [-1,1]){
 const s=createState('captain','cpu','rivet');s.fighters[0].x=600;s.fighters[1].x=600+face*260;s.fighters[0].facing=face;s.fighters[1].facing=-face;step(s,[A.bolt,A.down]);tick(s,65,0,A.down);assert.equal(s.fighters[1].hp,1000,'crouching ducks the high eye laser');
}
console.log('PASS: eye-line source and crouch evasion in both facings.');
