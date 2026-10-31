import { A, FLOOR, MOVES, getMove, type Fighter, type FighterId } from './core';
/** Individually authored sprites from inspected reference 13 (Jahon), reference
 * 14 (Virtuagram), and Crapto. They share pose timing, not their face or outfit.
 * Rasterized on an integer grid; no source-reference pixels are embedded. */
export type RosterCId = 'guest13' | 'guest14' | 'crapto';
const sprites = new Map<string, HTMLCanvasElement>();
const C={outline:'#11162d',blue:'#194be7',light:'#446aff',shade:'#1538ae',deep:'#102876',yellow:'#ffe83d',yellowShade:'#cba620',red:'#e91722',redShade:'#a8081b',white:'#fffbe4'};
type Point = [number,number];
type Pose = { lean:number; bob:number; crouch:number; armBack:Point[]; armFront:Point[]; legBack:Point[]; legFront:Point[]; eyes:'normal'|'blink'|'hit'; mouth:'smile'|'open'; orb?:boolean; };

function poseFor(kind:string,phase:number):Pose {
  const p:Pose={lean:0,bob:0,crouch:0,armBack:[[22,43],[15,51],[19,56]],armFront:[[40,44],[47,48],[49,42]],legBack:[[27,57],[23,65],[19,73]],legFront:[[36,58],[41,66],[45,73]],eyes:'normal',mouth:'smile'};
  const punch=(reach:number,height:number)=>{p.lean=2;p.armFront=[[42,44],[Math.round((43+reach)/2),height+2],[reach,height]];p.armBack=[[23,43],[17,47],[23,42]];};
  if(kind==='idle'){p.bob=phase%2;p.lean=phase===2?1:0;p.eyes=phase===3?'blink':'normal';}
  if(kind==='walk'){
    const stride=[-5,0,5,0][phase%4];p.bob=phase%2;
    p.legFront=[[36,58],[36+stride,65],[39+stride*2,73]];p.legBack=[[27,57],[27-stride,65],[25-stride*2,73]];
    p.armFront=[[40,44],[44-stride,49],[47-stride,53]];p.armBack=[[22,44],[18+stride,49],[16+stride,53]];
  }
  if(kind==='jump'){p.lean=1;p.legBack=[[27,57],[17,62],[24,64]];p.legFront=[[36,57],[43,61],[40,67]];p.armBack=[[22,43],[17,34],[20,28]];p.armFront=[[40,43],[47,35],[47,28]];}
  if(kind==='fall'){p.legBack=[[27,57],[23,65],[19,69]];p.legFront=[[36,57],[39,65],[44,70]];p.armBack=[[22,43],[14,41],[9,36]];p.armFront=[[40,43],[49,40],[53,34]];}
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

function sprite(id:RosterCId,kind:string,phase:number,flash=false):HTMLCanvasElement {
  const key=`${id}:${kind}:${phase}:${flash}`,cached=sprites.get(key);if(cached)return cached;
  const canvas=document.createElement('canvas');canvas.width=104;canvas.height=90;const c=canvas.getContext('2d')!;
  const p=poseFor(kind,phase),jahon=id==='guest13',virtu=id==='guest14',bare=id==='crapto';
  const coat=jahon?'#dc0715':bare?C.blue:'#11131c',coatLight=jahon?'#f02928':bare?C.light:'#363b4e';
  const color=(value:string)=>flash&&value!==C.outline?'#fff3cc':value;
  const rect=(x:number,y:number,w:number,h:number,fill:string)=>{c.fillStyle=color(fill);c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const ellipse=(cx:number,cy:number,rx:number,ry:number,fill:string)=>{for(let y=-ry;y<=ry;y++){const w=Math.floor(rx*Math.sqrt(Math.max(0,1-y*y/(ry*ry))));rect(cx-w,cy+y,w*2+1,1,fill);}};
  const poly=(points:Point[],fill:string)=>{const min=Math.ceil(Math.min(...points.map(a=>a[1]))),max=Math.floor(Math.max(...points.map(a=>a[1])));for(let y=min;y<=max;y++){const xs:number[]=[];for(let i=0;i<points.length;i++){const [x1,y1]=points[i],[x2,y2]=points[(i+1)%points.length];if((y1<=y&&y2>y)||(y2<=y&&y1>y))xs.push(x1+(y-y1)*(x2-x1)/(y2-y1));}xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)rect(Math.ceil(xs[i]),y,Math.floor(xs[i+1])-Math.ceil(xs[i])+1,1,fill);}};
  const limb=(points:Point[],back=false)=>{for(let layer=0;layer<2;layer++)for(let j=0;j<points.length-1;j++){const a=points[j],b=points[j+1],n=Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));for(let i=0;i<=n;i++){const t=n?i/n:0;ellipse(Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t),layer?(bare?2:3):(bare?3:4),layer?3:4,layer?(back?(bare?C.shade:jahon?'#9c0918':'#11121e'):coat):C.outline);}}};
  const hand=(point:Point,back=false)=>{ellipse(point[0]+1,point[1],5,4,C.outline);ellipse(point[0]+1,point[1],4,3,back?C.shade:C.blue);rect(point[0]+1,point[1]-2,3,1,C.light);};
  const foot=(point:Point,back=false)=>{ellipse(point[0]+2,point[1],7,3,C.outline);ellipse(point[0]+2,point[1]-1,6,2,bare?(back?C.shade:C.blue):'#242735');rect(point[0]+2,point[1]-2,4,1,bare?C.light:'#555d76');};
  limb(p.legBack,true);foot(p.legBack[2],true);limb(p.armBack,true);hand(p.armBack[2],true);
  const bx=31+p.lean,by=48+p.bob+p.crouch*.5;
  ellipse(bx,by,bare?11:jahon?16:15,18,C.outline);ellipse(bx,by,bare?10:jahon?15:14,17,coat);
  if(bare){ellipse(bx-5,by+2,4,12,C.shade);rect(bx+5,by-7,2,6,C.light);}
  else{
    poly([[bx-12,by-12],[bx-7,by-15],[bx-4,by+14],[bx-11,by+14]],coatLight);
    if(jahon){poly([[bx-7,by-15],[bx-3,by-6],[bx+1,by+17],[bx+4,by+17],[bx+2,by-6],[bx+8,by-15],[bx+5,by-17],[bx-5,by-17]],C.yellow);poly([[bx-3,by-14],[bx+5,by-14],[bx+1,by+10]],C.blue);ellipse(bx+2,by+11,3,4,C.white);ellipse(bx+2,by+11,2,2,C.red);}
    else{poly([[bx-9,by-15],[bx+9,by-15],[bx+3,by-6],[bx-3,by-6]],C.white);poly([[bx-8,by-6],[bx-2,by-3],[bx,by-6],[bx+2,by-3],[bx+9,by-6],[bx+5,by+1],[bx+2,by],[bx+3,by+13],[bx-3,by+13],[bx-2,by],[bx-5,by+1]],'#fffdf0');rect(bx-1,by-4,3,3,C.red);}
  }
  limb(p.legFront);foot(p.legFront[2]);
  const hx=32+p.lean,hy=28+p.bob+p.crouch-(bare?2:0);
  const skin=jahon?'#3e50ec':C.blue,light=jahon?'#6576ff':C.light;
  // All three keep distinct head contours, ear shapes and reference eye designs.
  poly([[hx-11,hy-17],[hx-23,hy-22],[hx-17,hy-15],[hx-29,hy-14],[hx-21,hy-8],[hx-31,hy-3],[hx-21,hy+1],[hx-29,hy+10],[hx-18,hy+9],[hx-23,hy+18],[hx-7,hy+15]],C.outline);
  poly([[hx-11,hy-15],[hx-20,hy-20],[hx-14,hy-13],[hx-26,hy-13],[hx-18,hy-7],[hx-28,hy-3],[hx-18,hy+2],[hx-26,hy+8],[hx-16,hy+7],[hx-20,hy+16],[hx-6,hy+13]],skin);
  ellipse(hx,hy,21,20,C.outline);ellipse(hx,hy,20,19,skin);ellipse(hx-10,hy+7,8,11,jahon?'#3344bf':C.shade);
  poly([[hx-13,hy-13],[hx-5,hy-18],[hx+6,hy-17],[hx+13,hy-12],[hx+5,hy-14],[hx-6,hy-14]],light);
  if(jahon){
    // Long yellow inner ear, angular red brow-mask, half-lidded yellow eyes.
    poly([[hx-21,hy+1],[hx-17,hy-16],[hx-8,hy-28],[hx-11,hy-8],[hx-13,hy+4],[hx-18,hy+7]],C.outline);
    poly([[hx-20,hy+1],[hx-16,hy-15],[hx-10,hy-24],[hx-13,hy-8],[hx-14,hy+3],[hx-18,hy+5]],C.yellow);
    rect(hx-16,hy-4,3,1,C.yellowShade);
    ellipse(hx+1,hy-3,10,8,C.outline);ellipse(hx+1,hy-3,9,7,C.yellow);
    ellipse(hx+17,hy-3,9,8,C.outline);ellipse(hx+17,hy-3,8,7,C.yellow);
    if(p.eyes==='blink'){rect(hx-7,hy-6,15,6,skin);rect(hx+10,hy-6,15,6,skin);rect(hx-6,hy,13,1,C.outline);rect(hx+11,hy,12,1,C.outline);}
    else{ellipse(hx+3,hy-3,3,p.eyes==='hit'?2:4,C.outline);ellipse(hx+18,hy-3,3,p.eyes==='hit'?2:4,C.outline);rect(hx+2,hy-6,2,2,C.white);rect(hx+17,hy-6,2,2,C.white);}
    poly([[hx-9,hy-14],[hx-1,hy-19],[hx+9,hy-17],[hx+13,hy-12],[hx+20,hy-17],[hx+27,hy-17],[hx+28,hy-13],[hx+20,hy-13],[hx+13,hy-7],[hx+8,hy-13],[hx,hy-15],[hx-7,hy-11]],C.redShade);
    poly([[hx-7,hy-14],[hx,hy-17],[hx+8,hy-15],[hx+13,hy-9],[hx+20,hy-15],[hx+26,hy-15],[hx+26,hy-13],[hx+19,hy-12],[hx+13,hy-6],[hx+7,hy-12],[hx,hy-14]],C.red);
    ellipse(hx+8,hy+11,20,9,C.outline);ellipse(hx+8,hy+10,19,8,C.red);
    poly([[hx-11,hy+7],[hx-6,hy+10],[hx+11,hy+13],[hx+25,hy+7],[hx+23,hy+13],[hx+12,hy+16],[hx-5,hy+14]],C.redShade);
    rect(hx-7,hy+10,22,1,'#760d23');rect(hx-6,hy+20,12,1,C.outline);rect(hx+2,hy+24,10,1,C.shade);
  }else if(virtu){
    // Catlike yellow ears, joined yellow eyewear, four pupils, white muzzle.
    poly([[hx-19,hy-9],[hx-22,hy-27],[hx-7,hy-18],[hx-16,hy-7]],C.outline);poly([[hx-18,hy-11],[hx-20,hy-24],[hx-10,hy-18],[hx-16,hy-10]],C.yellow);
    poly([[hx+15,hy-14],[hx+29,hy-25],[hx+25,hy-5]],C.outline);poly([[hx+17,hy-14],[hx+27,hy-22],[hx+24,hy-8]],C.yellow);
    rect(hx-19,hy-21,2,6,C.yellowShade);rect(hx+24,hy-18,1,5,C.yellowShade);
    ellipse(hx-3,hy-2,15,12,C.outline);ellipse(hx-3,hy-2,14,11,C.yellow);ellipse(hx-3,hy-1,12,9,C.white);
    ellipse(hx+20,hy-4,14,12,C.outline);ellipse(hx+20,hy-4,13,11,C.yellow);ellipse(hx+20,hy-3,11,9,C.white);
    rect(hx+8,hy-7,3,4,C.yellow);rect(hx-20,hy-7,4,3,C.yellow);
    for(const x of [-8,2,14,23]){if(p.eyes==='blink')rect(hx+x-3,hy-2,5,2,C.outline);else{ellipse(hx+x,hy-1,3,p.eyes==='hit'?3:5,C.outline);rect(hx+x-1,hy-4,1,2,C.white);}}
    ellipse(hx+7,hy+15,24,11,C.outline);ellipse(hx+7,hy+15,23,10,C.white);
    ellipse(hx+8,hy+10,22,7,C.outline);ellipse(hx+8,hy+9,21,6,C.white);
    ellipse(hx+12,hy+8,6,6,'#060b13');rect(hx+10,hy+4,2,2,'#333840');
    poly([[hx-11,hy+13],[hx-4,hy+16],[hx+16,hy+18],[hx+29,hy+13],[hx+27,hy+18],[hx+13,hy+22],[hx-3,hy+20]],C.redShade);
    poly([[hx-10,hy+14],[hx-4,hy+17],[hx+15,hy+19],[hx+28,hy+14],[hx+26,hy+17],[hx+13,hy+21],[hx-3,hy+19]],C.red);
    rect(hx-7,hy+9,1,2,C.outline);rect(hx+27,hy+9,1,2,C.outline);
  }else{
    // Crapto's oversized yellow goggles, green arms, red irises and long lips.
    ellipse(hx-1,hy-3,13,13,C.outline);ellipse(hx-1,hy-3,12,12,C.yellow);ellipse(hx-1,hy-3,10,10,'#ffef54');
    ellipse(hx+21,hy-8,13,13,C.outline);ellipse(hx+21,hy-8,12,12,C.yellow);ellipse(hx+21,hy-8,10,10,'#ffef54');
    rect(hx+10,hy-9,3,5,C.yellowShade);poly([[hx-14,hy-6],[hx-21,hy-3],[hx-21,hy],[hx-14,hy-2]],'#288557');
    for(const [x,y] of [[-1,-2],[21,-7]]){if(p.eyes==='blink'){rect(hx+x-7,hy+y,14,2,C.outline);}else{ellipse(hx+x,hy+y,5,7,C.outline);ellipse(hx+x,hy+y,4,6,C.red);ellipse(hx+x+1,hy+y+1,2,3,'#6e081c');rect(hx+x-2,hy+y-4,2,2,C.white);rect(hx+x,hy+y-8,1,2,C.outline);}}
    ellipse(hx+7,hy+15,25,7,C.outline);ellipse(hx+7,hy+14,24,6,C.redShade);ellipse(hx+8,hy+12,23,4,C.red);
    poly([[hx-16,hy+15],[hx-5,hy+17],[hx+17,hy+15],[hx+29,hy+11],[hx+29,hy+14],[hx+17,hy+18],[hx-5,hy+20],[hx-16,hy+17]],'#b4091c');
    rect(hx-12,hy+15,25,1,'#780a22');rect(hx+5,hy+13,15,1,'#f53b34');
  }
  limb(p.armFront);hand(p.armFront[2]);
  if(p.orb){const [x,y]=p.armFront[2],r=phase===1?7:5;ellipse(x+7,y-1,r,r,'#234cce');ellipse(x+7,y-1,r-2,r-2,'#74c8ff');rect(x+6,y-3,3,4,'#e3f4ff');}
  sprites.set(key,canvas);return canvas;
}
function animation(f:Fighter,frame:number):[string,number]{
  if(f.stun>0)return ['hit',Math.floor(frame/4)%2];if(f.blockstun>0)return ['block',Math.floor(frame/6)%2];
  if(f.move){const m=getMove(f,f.move.id),t=f.move.t;let phase=t<m.startup?0:t<m.startup+m.active?1:2;if(f.move.id==='special'&&phase===1)phase=1+Math.floor((t-m.startup)/7)%3;return [f.move.id,phase];}
  if(f.dash>0)return ['dash',Math.floor(frame/3)%2];if(f.y<FLOOR)return [f.vy<0?'jump':'fall',Math.floor(frame/6)%2];if(f.input&A.down)return ['crouch',Math.floor(frame/12)%2];if(Math.abs(f.vx)>1)return ['walk',Math.floor(frame/6)%4];return ['idle',Math.floor(frame/18)%4];
}
function identity(id:FighterId):RosterCId{return id==='guest13'||id==='guest14'?id:'crapto';}
export function drawRosterC(ctx:CanvasRenderingContext2D,f:Fighter,frame:number,ghost=false):void{
  const [kind,phase]=animation(f,frame),img=sprite(identity(f.id),kind,phase,f.flash>0&&Math.floor(f.flash/2)%2===0);
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(f.x),Math.round(f.y));ctx.scale(f.facing,1);if(ghost)ctx.globalAlpha=.55;ctx.drawImage(img,-64,-152,208,180);ctx.restore();
}
export function drawRosterCPortrait(ctx:CanvasRenderingContext2D,id:FighterId,width:number,height:number):void{
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,width,height);const size=Math.min(width,height),img=sprite(identity(id),'idle',0);
  ctx.drawImage(img,0,0,68,66,Math.floor((width-size)/2),Math.floor((height-size)/2),size,size);ctx.restore();
}
export const ROSTER_C_ANIMATIONS:Record<string,number>={idle:4,walk:4,jump:2,fall:2,crouch:2,dash:2,hit:2,block:2,light:3,medium:3,heavy:3,low:3,sweep:3,airLight:3,airMedium:3,airHeavy:3,launcher:3,bolt:3,grab:3,special:4};
export function drawRosterCSheet(ctx:CanvasRenderingContext2D,id:FighterId):{width:number;height:number}{
  ctx.save();ctx.imageSmoothingEnabled=false;Object.entries(ROSTER_C_ANIMATIONS).forEach(([name,count],row)=>{for(let i=0;i<count;i++)ctx.drawImage(sprite(identity(id),name,i),i*208,row*180,208,180);});ctx.restore();return {width:832,height:3600};
}
