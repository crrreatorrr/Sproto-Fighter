// Phase 2/3: retimed template recovery/damage and 12% guarded chip; artwork contracts retained.
import { assertProjectileKit } from './lib/gameplay-fixtures.mjs';
// Phase 1 deliberately updates numeric combat expectations; authored art contracts remain pinned.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=p=>ts.transpileModule(readFileSync(new URL(p,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const core=await import(url(bundledCore())),art=await import(url(compile('../src/powerArt.ts')));
assertProjectileKit(core,'vela');
const {A,FLOOR,ROSTER,COMBAT_STYLES,isHorizontalSpit,createState,step,getMove}=core;
assert.equal(ROSTER.vela.name,'Morelight');assert.ok(isHorizontalSpit('vela'));const egg=COMBAT_STYLES.vela.projectile;
assert.equal(egg.shape,'egg');assert.equal(egg.speed,12);assert.equal(egg.horizontal,true);assert.deepEqual(egg.origin,{forward:59,height:103});
const tick=(s,n,a=0,b=0)=>{for(let t=0;t<n;t++)step(s,[a,b]);};
let cases=0;
for(const facing of [-1,1])for(const air of [false,true])for(const direction of [0,A.up,A.down,A.left,A.right,A.up|A.left,A.up|A.right,A.down|A.left,A.down|A.right]){
 const s=createState('vela','dummy','rivet'),f=s.fighters[0];f.x=600;s.fighters[1].x=facing===1?1200:80;f.facing=facing;s.fighters[1].facing=-facing;if(air){f.y=FLOOR-250;f.vy=-4;}
 step(s,[A.bolt|direction,0]);let shot;for(let t=0;t<40&&!shot;t++){step(s,[0,0]);shot=s.projectiles[0];}
 assert.ok(shot);assert.equal(f.move.t,20);assert.equal(shot.shape,'egg');assert.equal(shot.damage,43);assert.equal(shot.vx,facing*12);assert.equal(shot.vy,0);assert.equal(shot.gravity,0);assert.equal(shot.wave,0);
 const crouched=!air&&(direction&A.down);
 if(crouched){assert.ok(shot.y>f.y-103,'crouched egg leaves the lower crouched mouth');assert.ok(Math.sign(shot.x-f.x)===facing);}
 else{assert.ok(Math.abs(shot.x-f.x-facing*(59+12))<1e-8,'egg starts at the mouth before first movement');assert.ok(Math.abs(shot.y-(f.y-103))<1e-8);}
 const y=shot.y;tick(s,5);assert.equal(shot.y,y);tick(s,90);assert.equal(f.move,null);cases++;
}
for(const facing of [-1,1])for(const guard of [false,true]){
 const s=createState('vela','dummy','rivet'),[a,b]=s.fighters;a.x=600;b.x=600+facing*260;a.facing=facing;b.facing=-facing;const back=facing===1?A.right:A.left;
 step(s,[A.bolt,guard?back:0]);tick(s,65,0,guard?back:0);assert.equal(b.hp,1000-(guard?Math.round(getMove(a,'bolt').damage*.12):getMove(a,'bolt').damage),'one egg gives one normalized hit; guard blocks it');
}
for(const facing of [-1,1]){
 const s=createState('vela','dummy','rivet'),[a,b]=s.fighters;a.x=600;b.x=600+facing*260;a.facing=facing;b.facing=-facing;step(s,[A.bolt,A.down]);tick(s,65,0,A.down);assert.equal(b.hp,1000,'crouching ducks the egg');
}
const s=createState('vela','dummy','rivet');s.fighters[0].x=100;s.fighters[1].x=1200;
for(let i=0;i<3;i++){step(s,[A.bolt,0]);for(let t=0;t<60&&!s.projectiles.length;t++)tick(s,1);assert.ok(s.projectiles.some(p=>p.shape==='egg'&&p.age===1));while(s.projectiles.length||s.fighters[0].move||s.fighters[0].combo||s.freeze)tick(s,1);}
const calls=[],angles=[];const c={save(){},restore(){},rotate(angle){angles.push(angle);},fillRect(x,y,w,h){calls.push({x,y,w,h,color:this.fillStyle});}};
for(const age of [0,7])art.drawPower(c,'egg',age,'#6ba9ff');
assert.ok(calls.some(p=>p.color==='#fffef7'));assert.ok(calls.some(p=>p.color==='#293042'));assert.ok(calls.some(p=>p.color==='#d5bf91'));assert.ok(calls.every(p=>p.w===2&&p.h===2));assert.notEqual(angles[0],angles[1]);
const f=createState('vela','dummy','rivet').fighters[0];assert.equal(getMove(f,'bolt').startup,20);assert.equal(getMove(f,'bolt').recovery,21);
console.log(`PASS: ${cases} Morelight egg ground/air/facing/aim cases; mouth emission, straight travel, four hit/block outcomes, crouch evasion, repeat casts and crisp tumbling egg rendering.`);
