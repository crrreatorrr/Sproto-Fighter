// Behavior checks for the requested reference B throw and mouth-spat Sproto.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=p=>ts.transpileModule(readFileSync(new URL('../'+p,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const {A,FLOOR,COMBAT_STYLES,createState,step,getMove}=await import(url(compile('src/core.ts')));
const tick=(s,n,a=0,b=0)=>{for(let i=0;i<n;i++)step(s,[a,b]);};
let cases=0;
for(const [id,shape]of [['sproto2531','miniSproto'],['sproto3106','referenceB']]){
 const style=COMBAT_STYLES[id].projectile;assert.equal(style.shape,shape);
 for(const face of [-1,1])for(const air of [false,true])for(const direction of [0,A.up,A.down,A.left,A.right,A.up|A.left,A.up|A.right,A.down|A.left,A.down|A.right]){
  const s=createState(id,'cpu','rivet'),f=s.fighters[0];f.x=600;s.fighters[1].x=face===1?1200:80;f.facing=face;s.fighters[1].facing=-face;
  if(air){f.y=FLOOR-250;f.vy=-4;}
  step(s,[A.bolt|direction,0]);let p;
  for(let t=0;t<40&&!p;t++){step(s,[0,0]);p=s.projectiles[0];}
  assert.ok(p,id+' projectile spawns');assert.equal(p.shape,shape);
  let dx=face,dy=0;
  if(id==='sproto3106'&&(direction&(A.up|A.down))){dy=direction&A.up?-1:1;dx=direction&A.left?-1:direction&A.right?1:0;}
  const length=Math.hypot(dx,dy)||1;
  assert.ok(Math.abs(p.vx-dx/length*style.speed)<1e-9);
  assert.ok(Math.abs(p.vy-dy/length*style.speed)<1e-9);
  assert.ok(Math.abs(p.x-f.x-face*style.origin.forward-p.vx)<1e-8,id+' reviewed hand/mouth x origin');
  assert.ok(Math.abs(p.y-(f.y-style.origin.height)-p.vy)<1e-8,id+' reviewed hand/mouth y origin');
  if(!air)assert.equal(f.y,FLOOR,'cast chord must suppress a jump');
  if(id==='sproto2531'){
   assert.equal(p.gravity,0);assert.equal(p.wave,0);const y=p.y;tick(s,5);assert.equal(p.y,y,'mini Sproto spit remains horizontal');
  }
  cases++;
 }
 for(const face of [-1,1])for(const guard of [false,true]){
  const s=createState(id,'cpu','rivet'),f=s.fighters[0];f.x=600;s.fighters[1].x=600+face*260;f.facing=face;s.fighters[1].facing=-face;
  const back=face===1?A.right:A.left;step(s,[A.bolt,guard?back:0]);tick(s,90,0,guard?back:0);
  assert.equal(s.fighters[1].hp,guard?1000:1000-getMove(f,'bolt').damage,id+' one projectile, one hit; guard blocks');
  assert.equal(s.projectiles.length,0);assert.equal(f.pips,0);assert.equal(f.move,null);
 }
}
globalThis.Image=class{set src(value){this.srcValue=value;const b=readFileSync(new URL('../public'+value,import.meta.url));this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);this.complete=true;queueMicrotask(()=>this.onload());}};
const art=await import(url(compile('src/powerArt.ts')));await art.ensurePowerArt();
for(const [shape,file]of [['referenceB','sproto3106-reference-b.png'],['miniSproto','sproto2531-mini.png']]){
 const images=[],boxes=[];const c={save(){},restore(){},drawImage(...args){images.push(args);},fillRect(...args){boxes.push(args);}};
 art.drawPower(c,shape,10,'#00ff00');assert.equal(images.length,1);assert.ok(images[0][0].srcValue.endsWith(file));assert.equal(boxes.length,0,'actual source sprite, no generic recolored substitute');
 const [image,x,y,w,h]=images[0];assert.ok(Math.abs(w/h-image.naturalWidth/image.naturalHeight)<1e-9,'original aspect ratio');assert.equal(x,-w/2);assert.equal(y,-h/2);
}
console.log(`PASS: ${cases} projectile facing/air/aim cases; reviewed hand and mouth origins; eight hit/block outcomes; complete source-image rendering with preserved aspect ratios.`);
