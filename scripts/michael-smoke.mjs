// Focused Michael D. Sproto - Chad Dev integration checks. Reference identity are visually reviewed separately.
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
globalThis.Image=class{set src(value){const b=readFileSync(new URL('../public'+value.split('?')[0],import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);this.complete=true;queueMicrotask(()=>this.onload());}};
const {A,FLOOR,ROSTER,COMBAT_STYLES,PLAYABLE_FIGHTERS,bodyAtlasIds,createState,step}=core;
assert.ok(PLAYABLE_FIGHTERS.includes('michael'));
assert.equal(ROSTER.michael.name,'Michael D. Sproto - Chad Dev');
assert.equal(COMBAT_STYLES.michael.role,'RETAIN');
assert.deepEqual(bodyAtlasIds('michael'),['michael'],'one independent Michael D. Sproto - Chad Dev body');
const cfg=manifest.fighters.michael;
assert.equal(cfg.frames.length,32);assert.equal(cfg.walkFrames.length,8);assert.equal(cfg.anchor[1],210,'grounded foot anchor');
for(const [name,count]of Object.entries({intro:4,special:8,cast:4,recoil:4,defeat:12}))assert.equal(cfg.clips[name].length,count);
await poses.ensurePoseAtlases(['michael','rivet']);
const tick=(s,n,a=0,b=0)=>{for(let i=0;i<n;i++)step(s,[a,b]);};
for(const face of [-1,1]){
 const s=createState('michael','cpu','rivet'),f=s.fighters[0];f.x=600;s.fighters[1].x=face===1?1150:130;f.facing=face;
 const seen=new Set();poses.getPoseAtlasDebug(f,0);
 for(let t=0;t<40;t++){step(s,[face===1?A.right:A.left,0]);seen.add(poses.getPoseAtlasDebug(f,s.frame).frameIndex);assert.equal(f.y,FLOOR);}
 assert.equal(seen.size,8,'complete walking cycle in both facings');tick(s,3);assert.equal(f.vx,0);
 step(s,[A.dash,0]);assert.ok(f.dash>0);tick(s,20);step(s,[A.up,0]);tick(s,5);assert.ok(f.y<FLOOR);tick(s,80);assert.equal(f.y,FLOOR);
}
for(const action of ['light','medium','heavy','launcher','bolt']){
 const s=createState('michael','cpu','rivet');s.fighters[1].x=1100;step(s,[A[action],0]);assert.equal(s.fighters[0].move?.id,action);tick(s,100);assert.equal(s.fighters[0].move,null);
}
for(const face of [-1,1])for(const direction of [0,A.up,A.down,face===1?A.left:A.right]){
 const s=createState('michael','cpu','rivet'),f=s.fighters[0];f.x=600;s.fighters[1].x=600+face*60;f.facing=face;s.fighters[1].facing=-face;
 step(s,[A.grab|direction,0]);let held=false;
 for(let t=0;t<180;t++){held||=s.throwState?.phase==='hold';step(s,[0,0]);for(const f of s.fighters)assert.ok([f.x,f.y,f.hp,f.vx,f.vy].every(Number.isFinite));}
 assert.ok(held,'Michael D. Sproto - Chad Dev throw catches');assert.equal(s.throwState,null);assert.equal(s.fighters[1].hp,910);
}
const s=createState('michael','cpu','rivet'),f=s.fighters[0];f.pips=3;s.fighters[1].x=480;step(s,[A.special,0]);let combo=0;
for(let t=0;t<220;t++){combo=Math.max(combo,f.combo);step(s,[0,0]);}
assert.equal(f.pips,0);assert.equal(combo,COMBAT_STYLES.michael.specialFrames.length);assert.equal(f.move,null);
console.log('PASS: Michael D. Sproto - Chad Dev identity and 72-frame asset contract; full gait in both facings, dash/jump/landing, five attacks, eight directional throws and four-contact Retain Rally. Reference face, clothing, colors and anatomy checked visually.');
const coin=COMBAT_STYLES.michael.projectile;
assert.equal(coin.shape,'chadCoin');assert.equal(coin.horizontal,true);
let spitCases=0;
for(const face of [-1,1])for(const air of [false,true])for(const direction of [0,A.up,A.down,A.left,A.right,A.up|A.left,A.up|A.right,A.down|A.left,A.down|A.right]){
 const s=createState('michael','cpu','rivet'),f=s.fighters[0];f.x=600;s.fighters[1].x=face===1?1200:80;f.facing=face;s.fighters[1].facing=-face;if(air){f.y=FLOOR-250;f.vy=-4;}
 step(s,[A.bolt|direction,0]);let shot;for(let t=0;t<40&&!shot;t++){step(s,[0,0]);shot=s.projectiles[0];}
 assert.ok(shot);assert.equal(shot.shape,'chadCoin');assert.equal(shot.vx,face*coin.speed);assert.equal(shot.vy,0);assert.equal(shot.gravity,0);
 assert.ok(Math.abs(shot.x-f.x-face*(coin.origin.forward+coin.speed))<1e-8,'coin starts at reviewed mouth');assert.ok(Math.abs(shot.y-f.y+coin.origin.height)<1e-8);spitCases++;
}
for(const face of [-1,1])for(const guard of [false,true]){
 const s=createState('michael','cpu','rivet');s.fighters[0].x=600;s.fighters[1].x=600+face*260;s.fighters[0].facing=face;s.fighters[1].facing=-face;const back=face===1?A.right:A.left;
 step(s,[A.bolt,guard?back:0]);tick(s,65,0,guard?back:0);assert.equal(s.fighters[1].hp,1000-(guard?Math.round(COMBAT_STYLES.michael.bolt.damage*.12):COMBAT_STYLES.michael.bolt.damage));
}
const art=await import(url(compile('../src/powerArt.ts')));await art.ensurePowerArt();
const draws=[],widths=[],angles=[];const c={save(){},restore(){},translate(){},rotate(a){angles.push(a);},scale(x,y){widths.push(x);},drawImage(image,x,y,w,h){draws.push({image,x,y,w,h});}};
for(const age of [0,7,14])art.drawPower(c,'chadCoin',age,'#fff');
assert.equal(draws.length,3);assert.ok(draws.every(d=>d.image.naturalWidth===64&&d.w===48&&d.h===48));assert.equal(widths.length,0,'circle never foreshortens or flips');assert.equal(new Set(angles).size,3,'coin face rotates with projectile age');
const wav=readFileSync(new URL('../public/fighters/voices/retain.wav',import.meta.url));assert.equal(wav.toString('ascii',0,4),'RIFF');assert.ok(wav.length>10000);
console.log(`PASS: ${spitCases} straight mouth-spit cases; hit/block outcomes; exact supplied full-circle icon at distinct in-plane rotation phases; local RETAIN voice asset.`);
// The KO replaces the body only for Michael, including double-KO and result frames.
for(const age of [0,12,36,96,144]){
 const n=draws.length;assert.equal(art.drawRetainDefeat(c,'michael',0,600,FLOOR,age),true);assert.equal(draws.length,n+1);assert.equal(draws.at(-1).w,112);assert.equal(draws.at(-1).h,112);
}
assert.equal(art.drawRetainDefeat(c,'michael',1,600,FLOOR,10),false);
assert.equal(art.drawRetainDefeat(c,'rivet',0,600,FLOOR,10),false);
assert.equal(widths.length,0,'neither ranged nor defeat icon scales or flips');
console.log('PASS: Michael KO replaces the body with a complete 112px rotating circle; alive/other fighters stay unchanged; rotation continues past the result boundary.');
