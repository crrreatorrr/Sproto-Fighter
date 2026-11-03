import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=bundledCore();
const {A,FLOOR,COMBAT_STYLES,createState,step}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
let count=0;function check(name,fn){fn();count++;console.log('PASS:',name);}
function fresh(face=1,gap=350){const s=createState('mox','cpu','vela');const[a,b]=s.fighters;a.x=face===1?200:1080;b.x=a.x+face*gap;a.facing=face;b.facing=-face;return s;}
function run(s,first=A.bolt,defender=0,n=90){let max=0,beams=0,origin=[];for(let t=0;t<n;t++){step(s,[t===0?first:0,defender]);max=Math.max(max,s.fighters[0].combo);for(const p of s.projectiles){beams++;assert.equal(p.shape,'mindBeam');assert.equal(p.vy,0);assert.ok(p.vx===0);assert.equal(p.y,s.fighters[0].y-COMBAT_STYLES.mox.projectile.origin.height);origin.push([p.x,p.y]);}}return{max,beams,origin};}
check('forehead beam reaches distant standing targets once in either facing',()=>{for(const face of [1,-1]){const s=fresh(face),r=run(s);assert.equal(s.fighters[1].hp,948);assert.equal(r.max,1);assert.ok(r.beams>=12);assert.equal(s.projectiles.length,0);assert.equal(s.fighters[0].pips,0);}});
check('horizontal directional chords never accidentally jump',()=>{for(const face of [1,-1])for(const d of [0,A.up,A.down,A.left,A.right,A.up|A.left,A.up|A.right]){const s=fresh(face);run(s,A.bolt|d);assert.equal(s.fighters[0].y,FLOOR);assert.equal(s.fighters[1].hp,948);}});
check('crouch ducks the high beam, block guards it, neither grants combo or meter',()=>{for(const face of [1,-1])for(const input of [A.down,face===1?A.right:A.left]){const s=fresh(face),r=run(s,A.bolt,input);assert.equal(s.fighters[1].hp,1000);assert.equal(r.max,0);assert.equal(s.fighters[0].pips,0);}});
check('finite range leaves far opponents unharmed',()=>{const s=fresh(1,650),r=run(s);assert.equal(s.fighters[1].hp,1000);assert.equal(r.max,0);});
check('air beam tracks the moving forehead, stays horizontal and misses a grounded target below',()=>{for(const face of [1,-1]){const s=fresh(face);s.fighters[0].y=FLOOR-250;s.fighters[0].vy=-8;const r=run(s);assert.ok(r.beams>0);assert.ok(new Set(r.origin.map(x=>x[1])).size>1);assert.equal(s.fighters[1].hp,1000);}});
check('interruption extinguishes the beam instead of leaving a damaging detached effect',()=>{const s=fresh(1,650);while(!s.projectiles.length)step(s,[s.frame===0?A.bolt:0,0]);s.fighters[0].stun=8;s.fighters[0].move=null;step(s,[0,0]);assert.equal(s.projectiles.length,0);});
check('frame-indexed replay is identical and other projectile styles are unchanged',()=>{const a=fresh(),b=fresh();run(a);run(b);assert.deepEqual(a,b);assert.equal(COMBAT_STYLES.zephyr.projectile.shape,'pumpkin');assert.equal(COMBAT_STYLES.vela.projectile.beamLength,undefined);});
console.log(`${count} Yannix beam groups passed; visual verification is separate.`);
