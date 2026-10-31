import { A, FLOOR, MOVES, getMove, type Fighter } from './core';

/** Original fourth-fighter sprite adaptation: long blue spines, sleepy yellow/red
 * eyes, red smile, red shirt and broad yellow collar. The separate mini pumpkin
 * in the reference is deliberately omitted. Pumpkins here are conjured weapons. */
const sprites = new Map<string, HTMLCanvasElement>();
const C = { outline:'#171b37', blue:'#1253d9', light:'#437deb', shade:'#0c3ca7', deep:'#112a76', yellow:'#ffe343', yellowShade:'#bc9b28', red:'#ef202b', redShade:'#a80b22', white:'#fff9df' };
type Point = [number,number];
type Pose = { lean:number; bob:number; crouch:number; armBack:Point[]; armFront:Point[]; legBack:Point[]; legFront:Point[]; eyes:'normal'|'blink'|'hit'; mouth:'smile'|'open'; orb?:boolean; };

function poseFor(kind:string,phase:number):Pose {
  const p:Pose={lean:0,bob:0,crouch:0,armBack:[[22,43],[15,51],[19,56]],armFront:[[40,44],[47,48],[49,42]],legBack:[[27,57],[23,65],[19,73]],legFront:[[36,58],[41,66],[45,73]],eyes:'normal',mouth:'smile'};
  const punch=(reach:number,height:number)=>{p.lean=2;p.armFront=[[42,44],[Math.round((43+reach)/2),height+2],[reach,height]];p.armBack=[[23,43],[17,47],[23,42]];};
  if(kind==='idle'){p.bob=phase%2;p.lean=phase===2?1:0;p.eyes=phase===3?'blink':'normal';}
  if(kind==='walk'){
    const stride=[-7,-2,7,2][phase%4];p.bob=phase%2;
    p.legFront=[[36,58],[36+stride,65],[39+stride*2,73]];p.legBack=[[27,57],[27-stride,65],[25-stride*2,73]];
    p.armFront=[[40,44],[44-stride,49],[47-stride,53]];p.armBack=[[22,44],[18+stride,49],[16+stride,53]];
  }
  if(kind==='jump'){p.lean=1;p.legBack=[[27,57],[17,62],[24,64]];p.legFront=[[36,57],[43,61],[40,67]];p.armBack=[[22,43],[11,35],[5,31]];p.armFront=[[40,43],[51,34],[57,27]];}
  if(kind==='fall'){p.legBack=[[27,57],[23,65],[19,69]];p.legFront=[[36,57],[39,65],[44,70]];p.armBack=[[22,43],[12,41],[4,36]];p.armFront=[[40,43],[51,40],[59,34]];}
  if(kind==='crouch'){p.crouch=12;p.legBack=[[25,60],[16,68],[20,73]];p.legFront=[[37,60],[49,66],[43,73]];p.armBack=[[22,51],[15,57],[20,61]];p.armFront=[[41,51],[48,55],[49,49]];}
  if(kind==='dash'){p.lean=8;p.bob=6;p.legBack=[[25,60],[15,65],[7,70]];p.legFront=[[37,60],[43,67],[50,73]];p.armBack=[[24,46],[13,43],[8,39]];p.armFront=[[43,45],[33,50],[26,47]];}
  if(kind==='hit'){p.lean=-5;p.bob=phase%2*2;p.eyes='hit';p.mouth='open';p.armBack=[[19,43],[12,36],[10,30]];p.armFront=[[37,43],[43,39],[48,34]];}
  if(kind==='block'){p.lean=-2;p.armFront=[[40,44],[46,36],[42,25]];p.armBack=[[22,44],[36,40],[43,32]];p.eyes='blink';}
  const attack=phase===1||phase===3;
  if(kind==='light'||kind==='airLight'){
    if(attack)punch(65,39);else{p.armFront=[[40,44],[37,46],[33,39]];p.lean=phase===0?-2:0;}
  }
  if(kind==='medium'||kind==='airMedium'){
    if(attack){punch(69,45);p.lean=4;p.legFront=[[37,58],[47,64],[53,73]];}else{p.lean=-3;p.armFront=[[40,44],[31,47],[27,39]];}
  }
  if(kind==='heavy'||kind==='airHeavy'){
    if(attack){p.lean=-2;p.armFront=[[40,42],[46,38],[49,32]];p.legFront=[[36,57],[54,52],[74,47]];p.legBack=[[27,57],[23,65],[20,73]];}
    else{p.legFront=[[36,57],[45,53],[42,60]];p.armFront=[[40,43],[45,36],[42,30]];}
  }
  if(kind==='low'){p.crouch=10;if(attack){p.lean=4;p.armFront=[[42,53],[53,58],[65,59]];}else p.armFront=[[40,52],[44,56],[38,57]];p.legFront=[[36,60],[46,67],[47,73]];}
  if(kind==='sweep'){p.crouch=14;p.lean=-2;p.legBack=[[26,60],[16,66],[20,73]];p.legFront=attack?[[35,61],[53,68],[76,70]]:[[35,61],[44,65],[42,73]];p.armFront=[[39,54],[45,49],[46,44]];}
  if(kind==='launcher'){
    if(attack){p.lean=3;p.bob=-3;p.armFront=[[42,43],[49,27],[49,10]];p.armBack=[[23,42],[20,49],[27,51]];p.legFront=[[36,57],[42,65],[46,73]];}
    else{p.crouch=6;p.armFront=[[40,48],[45,54],[37,56]];}
  }
  if(kind==='bolt'){p.lean=attack?3:-1;p.armFront=attack?[[41,44],[54,43],[66,41]]:[[40,44],[45,46],[50,39]];p.armBack=attack?[[23,44],[44,46],[61,44]]:[[23,43],[34,47],[45,42]];p.orb=phase!==2;}
  if(kind==='grab'){p.lean=attack?5:1;p.armFront=attack?[[41,43],[55,37],[64,35]]:[[41,43],[49,43],[55,38]];p.armBack=attack?[[23,43],[49,52],[61,49]]:[[23,43],[38,49],[49,48]];if(phase===2){p.armFront=[[41,43],[45,29],[33,19]];p.armBack=[[23,43],[26,31],[30,22]];p.lean=-3;}}
  if(kind==='special'){p.mouth='open';p.bob=phase%2?-2:0;p.armBack=[[22,43],[11,33],[6,22]];p.armFront=[[40,43],[51,32],[56,20]];if(attack){p.armBack=[[23,43],[43,45],[60,39]];p.armFront=[[41,43],[57,37],[72,31]];}p.orb=true;}
  if(kind.startsWith('air')){p.legBack=[[27,57],[18,62],[22,66]];if(kind!=='airHeavy')p.legFront=[[36,57],[43,60],[41,67]];p.bob=-2;}
  if(['jump','fall','crouch','dash','block'].includes(kind)&&phase%2){p.bob+=1;p.armFront=p.armFront.map(([x,y])=>[x,y+1] as Point);}
  if(Object.prototype.hasOwnProperty.call(MOVES,kind)&&phase===2&&kind!=='grab'){p.lean+=1;p.armFront=p.armFront.map(([x,y],i)=>[x-(i?2:0),y+2] as Point);}
  return p;
}

function sprite(kind:string,phase:number,flash=false):HTMLCanvasElement {
  const key=`${kind}:${phase}:${flash}`;const cached=sprites.get(key);if(cached)return cached;
  const canvas=document.createElement('canvas');canvas.width=112;canvas.height=88;const c=canvas.getContext('2d')!;c.translate(10,4);
  const p=poseFor(kind,phase);
  const color=(value:string)=>flash&&value!==C.outline&&value!==C.redShade?'#fff4d5':value;
  const rect=(x:number,y:number,w:number,h:number,fill:string)=>{c.fillStyle=color(fill);c.fillRect(Math.round(x),Math.round(y),w,h);};
  const ellipse=(cx:number,cy:number,rx:number,ry:number,fill:string)=>{for(let y=-ry;y<=ry;y++){const w=Math.floor(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry))));rect(cx-w,cy+y,w*2+1,1,fill);}};
  // Scan-converted polygons and discrete limbs avoid antialiased vector edges.
  const poly=(points:Point[],fill:string)=>{const min=Math.ceil(Math.min(...points.map(a=>a[1]))),max=Math.floor(Math.max(...points.map(a=>a[1])));for(let y=min;y<=max;y++){const hits:number[]=[];for(let i=0;i<points.length;i++){const [x1,y1]=points[i],[x2,y2]=points[(i+1)%points.length];if((y1<=y&&y2>y)||(y2<=y&&y1>y))hits.push(x1+(y-y1)*(x2-x1)/(y2-y1));}hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2)rect(Math.ceil(hits[i]),y,Math.floor(hits[i+1])-Math.ceil(hits[i])+1,1,fill);}};
  const limb=(points:Point[],back=false)=>{for(let layer=0;layer<2;layer++)for(let j=0;j<points.length-1;j++){const a=points[j],b=points[j+1],steps=Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));for(let i=0;i<=steps;i++){const t=steps?i/steps:0;ellipse(Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t),layer?3:4,layer?3:4,layer?(back?C.shade:C.blue):C.outline);}}};
  const hand=(point:Point,back=false)=>{ellipse(point[0]+1,point[1],5,4,C.outline);ellipse(point[0]+1,point[1],4,3,back?C.shade:C.blue);rect(point[0]+1,point[1]-2,3,1,C.light);rect(point[0]+4,point[1],1,2,C.deep);};
  const foot=(point:Point,back=false)=>{ellipse(point[0]+2,point[1],7,3,C.outline);ellipse(point[0]+2,point[1]-1,6,2,back?C.shade:C.blue);rect(point[0]+2,point[1]-2,4,1,C.light);};
  limb(p.legBack,true);foot(p.legBack[2],true);limb(p.armBack,true);hand(p.armBack[2],true);
  const bx=31+p.lean,by=47+p.bob+p.crouch*.5;
  // Red shirt is part of the main reference; the yellow band is a broad collar.
  ellipse(bx,by,14,17,C.outline);ellipse(bx,by,13,16,C.redShade);
  ellipse(bx+3,by-1,10,15,C.red);rect(bx-7,by+10,20,3,C.redShade);
  ellipse(bx+1,by-9,14,7,C.outline);ellipse(bx+1,by-10,13,5,C.yellowShade);
  ellipse(bx+2,by-11,12,4,C.yellow);rect(bx-8,by-12,21,3,C.yellow);
  // Small white/green chest mark adapted from the partially visible emblem.
  ellipse(bx+4,by+5,4,5,C.outline);ellipse(bx+4,by+5,3,4,C.white);
  ellipse(bx+4,by+5,1,3,'#28804a');rect(bx+4,by+3,1,1,'#c6f1a0');
  limb(p.legFront);foot(p.legFront[2]);
  const hx=31+p.lean,hy=25+p.bob+p.crouch;
  // Long swept-back head spines distinguish this fighter from rounder Vela.
  poly([[hx-9,hy-15],[hx-23,hy-23],[hx-37,hy-21],[hx-24,hy-15],[hx-15,hy-10],[hx-30,hy-12],[hx-39,hy-8],[hx-23,hy-5],[hx-16,hy-2],[hx-30,hy+1],[hx-36,hy+9],[hx-20,hy+6],[hx-13,hy+10],[hx-23,hy+17],[hx-7,hy+12]],C.outline);
  poly([[hx-8,hy-13],[hx-23,hy-21],[hx-33,hy-20],[hx-22,hy-14],[hx-13,hy-9],[hx-29,hy-10],[hx-35,hy-8],[hx-22,hy-4],[hx-13,hy-1],[hx-28,hy+3],[hx-32,hy+7],[hx-19,hy+5],[hx-10,hy+10],[hx-20,hy+15],[hx-6,hy+11]],C.blue);
  ellipse(hx,hy,20,18,C.outline);ellipse(hx,hy,19,17,C.blue);ellipse(hx-8,hy+6,9,10,C.shade);
  poly([[hx-12,hy-12],[hx-5,hy-16],[hx+6,hy-15],[hx+13,hy-10],[hx+5,hy-12],[hx-6,hy-12]],C.light);
  if(p.eyes==='hit'){
    rect(hx-3,hy-6,2,2,C.outline);rect(hx-1,hy-4,2,2,C.outline);rect(hx-3,hy-2,2,2,C.outline);
    rect(hx+10,hy-6,2,2,C.outline);rect(hx+8,hy-4,2,2,C.outline);rect(hx+10,hy-2,2,2,C.outline);
  }else if(p.eyes==='blink'){
    rect(hx-5,hy-4,8,2,C.outline);rect(hx+6,hy-4,8,2,C.outline);
  }else{
    // Half-lidded yellow eyes and vivid red irises are the key reference detail.
    ellipse(hx-1,hy-4,8,6,C.outline);ellipse(hx-1,hy-4,7,5,C.yellow);
    ellipse(hx+12,hy-4,8,6,C.outline);ellipse(hx+12,hy-4,7,5,C.yellow);
    ellipse(hx+1,hy-3,3,5,C.redShade);ellipse(hx+1,hy-3,2,4,C.red);
    ellipse(hx+13,hy-3,3,5,C.redShade);ellipse(hx+13,hy-3,2,4,C.red);
    rect(hx+1,hy-6,1,2,C.white);rect(hx+13,hy-6,1,2,C.white);
    poly([[hx-10,hy-8],[hx-5,hy-12],[hx+3,hy-11],[hx+7,hy-6],[hx-9,hy-4]],C.outline);
    poly([[hx-9,hy-8],[hx-4,hy-10],[hx+3,hy-9],[hx+5,hy-7],[hx-8,hy-5]],C.blue);
    poly([[hx+5,hy-7],[hx+10,hy-11],[hx+17,hy-10],[hx+21,hy-5],[hx+6,hy-4]],C.outline);
    poly([[hx+7,hy-7],[hx+11,hy-9],[hx+17,hy-8],[hx+19,hy-6],[hx+7,hy-5]],C.light);
    rect(hx-7,hy-14,6,1,C.outline);rect(hx-1,hy-13,4,1,C.outline);rect(hx+11,hy-14,6,1,C.outline);
  }
  // Broad red lips are the reference's signature, not a mask or garment.
  ellipse(hx+4,hy+7,19,8,C.outline);ellipse(hx+4,hy+7,18,7,C.redShade);ellipse(hx+4,hy+5,18,5,C.red);
  rect(hx-11,hy+2,4,2,'#ff5b48');rect(hx+16,hy+2,4,2,'#ff5b48');
  if(p.mouth==='open'){ellipse(hx+5,hy+7,10,4,C.outline);ellipse(hx+6,hy+9,6,2,C.red);}
  else{poly([[hx-12,hy+4],[hx-5,hy+7],[hx+10,hy+8],[hx+20,hy+4],[hx+17,hy+7],[hx+8,hy+10],[hx-4,hy+9]],C.redShade);rect(hx-8,hy+5,4,1,C.outline);rect(hx-4,hy+6,15,1,C.outline);rect(hx+11,hy+5,5,1,C.outline);}
  limb(p.armFront);hand(p.armFront[2]);
  const pumpkin=(x:number,y:number,r:number)=>{
    ellipse(x,y,r+1,Math.max(3,r-1),C.outline);
    ellipse(x,y,r,Math.max(2,r-2),'#b24a16');
    ellipse(x-r/2,y,Math.max(2,Math.floor(r/2)),Math.max(2,r-2),'#f18825');
    ellipse(x+r/2,y,Math.max(2,Math.floor(r/2)),Math.max(2,r-2),'#d76b18');
    ellipse(x,y,Math.max(2,Math.floor(r/3)),Math.max(2,r-2),'#ffb23d');
    rect(x-1,y-r-2,2,4,'#3b6c37');rect(x,y-r-3,3,2,'#85a44b');
    rect(x-r+2,y-r+3,2,1,'#ffd36e');
  };
  const seed=(x:number,y:number)=>{rect(x,y,3,1,'#ffd28b');rect(x+1,y-1,1,3,'#ffe4ae');};
  const active=phase===1||phase===3;
  if(kind==='bolt'){
    const [x,y]=p.armFront[2];
    if(phase===0)pumpkin(x+6,y-2,7);
    if(active){seed(x+8,y-4);seed(x+16,y-8);seed(x+23,y-7);}
  }else if(kind==='special'){
    const [x,y]=p.armFront[2];pumpkin(x+7,y-2,active?9:7);
    const [bx,by]=p.armBack[2];pumpkin(bx-4,by-2,6);
    for(let i=0;i<4;i++)seed(52+i*7,17+((phase+i)%3)*4);
  }else if(active&&['light','medium','airLight','airMedium','low','launcher'].includes(kind)){
    const [x,y]=p.armFront[2];pumpkin(x+3,y,kind==='launcher'?8:6);
    seed(x-8,y-8);seed(x-13,y-4);
  }else if(active&&['heavy','airHeavy','sweep'].includes(kind)){
    const [x,y]=p.legFront[2];pumpkin(x+3,y-1,7);seed(x-9,y-7);seed(x-15,y-3);
  }else if(kind==='grab'){
    const [x,y]=p.armFront[2];
    poly([[x,y],[x+9,y-5],[x+15,y-3],[x+18,y+2],[x+16,y+7],[x+13,y+6],[x+15,y+2],[x+13,y-1],[x+9,y-2],[x+1,y+2]],'#73934a');
    if(active)pumpkin(x+12,y+7,5);
  }
  sprites.set(key,canvas);return canvas;
}

function animation(f:Fighter,frame:number):[string,number]{
  if(f.stun>0)return ['hit',Math.floor(frame/4)%2];
  if(f.blockstun>0)return ['block',Math.floor(frame/6)%2];
  if(f.move){const m=getMove(f,f.move.id);const startup=m.startup;let phase=f.move.t<startup?0:f.move.t<startup+m.active?1:2;if(f.move.id==='special'&&phase===1)phase=1+(Math.floor((f.move.t-startup)/7)%3);return [f.move.id,phase];}
  if(f.dash>0)return ['dash',Math.floor(frame/3)%2];
  if(f.y<FLOOR)return [f.vy<0?'jump':'fall',Math.floor(frame/6)%2];
  if(f.input&A.down)return ['crouch',Math.floor(frame/12)%2];
  if(Math.abs(f.vx)>1)return ['walk',Math.floor(frame/6)%4];
  return ['idle',Math.floor(frame/18)%4];
}

export function drawZephyr(ctx:CanvasRenderingContext2D,f:Fighter,frame:number,ghost=false):void{
  const [kind,phase]=animation(f,frame);const img=sprite(kind,phase,f.flash>0&&Math.floor(f.flash/2)%2===0);
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(f.x),Math.round(f.y));ctx.scale(f.facing,1);if(ghost)ctx.globalAlpha=.55;
  ctx.drawImage(img,-84,-160,224,176);ctx.restore();
}

export function drawZephyrPortrait(ctx:CanvasRenderingContext2D,width:number,height:number):void{
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,width,height);
  ctx.fillStyle='#15213c';ctx.fillRect(0,0,width,height);
  const size=Math.min(width,height),img=sprite('idle',0);
  ctx.drawImage(img,0,0,72,72,(width-size)/2,(height-size)/2,size,size);
  ctx.restore();
}

/** Number of authored frame slots per state; one row per state on the sheet. */
export const ZEPHYR_ANIMATIONS:Record<string,number>={idle:4,walk:4,jump:2,fall:2,crouch:2,dash:2,hit:2,block:2,light:3,medium:3,heavy:3,low:3,sweep:3,airLight:3,airMedium:3,airHeavy:3,launcher:3,bolt:3,grab:3,special:4};
export function drawZephyrSheet(ctx:CanvasRenderingContext2D):{width:number;height:number}{
  ctx.save();ctx.imageSmoothingEnabled=false;
  Object.entries(ZEPHYR_ANIMATIONS).forEach(([name,count],row)=>{for(let i=0;i<count;i++)ctx.drawImage(sprite(name,i),i*224,row*176,224,176);});
  ctx.restore();return {width:896,height:Object.keys(ZEPHYR_ANIMATIONS).length*176};
}
