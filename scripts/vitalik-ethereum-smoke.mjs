// Phase 1 deliberately updates numeric combat expectations; authored art contracts remain pinned.
import { bundledCore } from './lib/load.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const load=async p=>import('data:text/javascript;base64,'+Buffer.from(compile(read(p))).toString('base64'));
const core=await import('data:text/javascript;base64,'+Buffer.from(bundledCore()).toString('base64'));
const {A,FLOOR,COMBAT_STYLES,createState,step,getMove}=core;
assert.equal(COMBAT_STYLES.vitaliketh.projectile.shape,'ethereum');
assert.equal(COMBAT_STYLES.vitaliketh.projectile.speed,10);assert.equal(COMBAT_STYLES.vitaliketh.bolt.damage,54);assert.equal(COMBAT_STYLES.vitaliketh.bolt.startup,18);
assert.deepEqual(COMBAT_STYLES.vitaliketh.specialFrames,[14,25,35,46]);
let cases=0;
for(const face of [-1,1])for(const air of [false,true])for(const direction of [0,A.up,A.down,A.left,A.right,A.up|A.left,A.up|A.right,A.down|A.left,A.down|A.right]){
 const s=createState('vitaliketh','cpu','rivet'),f=s.fighters[0];f.x=600;f.facing=face;s.fighters[1].x=face===1?1200:80;
 if(air){f.y=FLOOR-250;f.vy=-4;}
 step(s,[A.bolt|direction,0]);let p;
 for(let t=0;t<40&&!p;t++){step(s,[0,0]);p=s.projectiles[0];}
 assert.ok(p);assert.equal(p.shape,'ethereum');assert.equal(p.owner,0);
 let dx=face,dy=0;if(direction&(A.up|A.down)){dy=direction&A.up?-1:1;dx=direction&A.left?-1:direction&A.right?1:0;}
 const length=Math.hypot(dx,dy)||1;assert.ok(Math.abs(p.vx-dx/length*10)<1e-9);assert.ok(Math.abs(p.vy-dy/length*10)<1e-9);
 assert.ok(Math.abs(p.x-f.x-face*100-p.vx)<1e-8,'hand-origin x');assert.ok(Math.abs(p.y-(f.y-100)-p.vy)<1e-8,'hand-origin y');
 if(!air)assert.equal(f.y,FLOOR);cases++;
}
for(const face of [-1,1])for(const blocked of [false,true]){
 const s=createState('vitaliketh','cpu','rivet'),f=s.fighters[0],b=s.fighters[1];f.x=600;f.facing=face;b.x=600+face*280;b.facing=-face;const away=face===1?A.right:A.left;
 step(s,[A.bolt,blocked?away:0]);for(let t=0;t<100;t++)step(s,[0,blocked?away:0]);
 assert.equal(b.hp,1000-(blocked?Math.round(getMove(f,'bolt').damage*.12):getMove(f,'bolt').damage));assert.equal(f.move,null);assert.equal(s.projectiles.length,0);assert.equal(f.pips,0);
}
globalThis.Image=class{set src(value){this.srcValue=value;const b=readFileSync(new URL('../public'+value,import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);this.complete=true;queueMicrotask(()=>this.onload());}};
const art=await load('src/powerArt.ts');await art.ensurePowerArt();
const recorder=()=>{const images=[],texts=[],rotations=[];const c=new Proxy({images,texts,rotations,drawImage(...a){images.push(a)},fillText(...a){texts.push(a)},rotate(a){rotations.push(a)}},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});return c;};
for(const age of [0,7]){
 const c=recorder();art.drawPower(c,'ethereum',age,'#ff0000');assert.equal(c.images.length,1);const [image,x,y,w,h]=c.images[0];
 assert.ok(image.srcValue.endsWith('/vitalik-ethereum.png'));assert.equal(h,48);assert.equal(w/h,2000/3258);assert.equal(x,-w/2);assert.equal(y,-h/2);assert.ok(c.rotations.includes(age*.11));
}
const line='HarryPotterObamaSonic10Inu is not a scam';assert.equal(art.VITALIK_DEFEAT_LINE,line);
for(const [fighters,expected]of [
 [[{id:'vitaliketh',hp:1000},{id:'rivet',hp:0}],false],
 [[{id:'vitaliketh',hp:0},{id:'rivet',hp:1000}],true],
 [[{id:'rivet',hp:1000},{id:'vitaliketh',hp:0}],true],
 [[{id:'vitaliketh',hp:0},{id:'vitaliketh',hp:0}],true],
 [[{id:'rivet',hp:0},{id:'vela',hp:0}],false],
]){const c=recorder();assert.equal(art.drawVitalikDefeatCaption(c,fighters),expected);assert.equal(c.texts.filter(x=>x[0]===line).length,expected?1:0);}
const revived=[{id:'vitaliketh',hp:0}];art.drawVitalikDefeatCaption(recorder(),revived);revived[0].hp=1000;assert.equal(art.drawVitalikDefeatCaption(recorder(),revived),false,'restart clears caption');
// Exercise the real renderer with neutral stubs for unrelated stage/body systems.
const noop=()=>{};const context={...core,...art,drawActiveStoryLocation:()=>false,drawStage:noop,drawTeamSpecialBack:noop,drawTeamSpecialFront:noop,drawSprite:noop,drawPelvicAttacks:noop,drawMindBeams:noop,setHiggsfieldThrowState:noop,setPoseAtlasThrowState:noop,setPoseAtlasPresentation:noop};
const source=read('src/render.ts').replace(/^import[^;]*;\n/gm,'');vm.createContext(context);vm.runInContext(compile(source).replace(/^export /gm,''),context);
for(const side of [0,1])for(const phase of ['fight','outro','result']){
 const s=createState(side?'rivet':'vitaliketh','dummy',side?'vitaliketh':'rivet');s.fighters[side].hp=0;const c=recorder();context.render(c,s,{phase,frame:35,winner:1-side,fromFloor:false});assert.equal(c.texts.filter(t=>t[0]===line).length,1,'actual render caption for either losing side throughout KO/result');
}
const s=createState('vitaliketh','dummy','rivet');step(s,[A.bolt,0]);const held=recorder();context.render(held,s);assert.equal(held.images.length,1,'symbol held during anticipation');
while(!s.projectiles.length)step(s,[0,0]);const released=recorder();context.render(released,s);assert.equal(released.images.length,1,'one released symbol, no duplicate held copy');
console.log(`PASS: ${cases} facing/air/aim casts, four hit/block outcomes, exact source-image drawing and tumble, held/released hand item, exact death text on either side, double-KO deduplication and restart clearing.`);
