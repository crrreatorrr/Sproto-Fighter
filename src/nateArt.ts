import { A, FLOOR, MOVES, getMove, type Fighter } from './core';

/** Little Foot Nate: original reference-based pixel sprites. Blue round head,
 * yellow triangular spines, red grin, blue teeth, black nose and yellow hood.
 * Shared combat pose rig; all drawing is cached and independent of simulation. */
const sprites = new Map<string, HTMLCanvasElement>();
const C = { outline:'#131839', blue:'#075fce', light:'#4092e7', shade:'#0646a0', deep:'#073776', yellow:'#ffe646', yellowShade:'#d9ae27', red:'#f4232c', redShade:'#b80e27', white:'#fff9df' };
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

function sprite(kind:string,phase:number,flash=false):HTMLCanvasElement {
  const key=`${kind}:${phase}:${flash}`;const cached=sprites.get(key);if(cached)return cached;
  const canvas=document.createElement('canvas');canvas.width=112;canvas.height=96;const c=canvas.getContext('2d')!;c.translate(8,12);
  const p=poseFor(kind,phase);
  const color=(value:string)=>flash&&value!==C.outline&&value!==C.redShade?'#fff4d5':value;
  const rect=(x:number,y:number,w:number,h:number,fill:string)=>{c.fillStyle=color(fill);c.fillRect(Math.round(x),Math.round(y),w,h);};
  const ellipse=(cx:number,cy:number,rx:number,ry:number,fill:string)=>{for(let y=-ry;y<=ry;y++){const w=Math.floor(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry))));rect(cx-w,cy+y,w*2+1,1,fill);}};
  // Scan-converted polygons and discrete limbs avoid antialiased vector edges.
  const poly=(points:Point[],fill:string)=>{const min=Math.ceil(Math.min(...points.map(a=>a[1]))),max=Math.floor(Math.max(...points.map(a=>a[1])));for(let y=min;y<=max;y++){const hits:number[]=[];for(let i=0;i<points.length;i++){const [x1,y1]=points[i],[x2,y2]=points[(i+1)%points.length];if((y1<=y&&y2>y)||(y2<=y&&y1>y))hits.push(x1+(y-y1)*(x2-x1)/(y2-y1));}hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2)rect(Math.ceil(hits[i]),y,Math.floor(hits[i+1])-Math.ceil(hits[i])+1,1,fill);}};
  const limb=(points:Point[],back=false)=>{for(let layer=0;layer<2;layer++)for(let j=0;j<points.length-1;j++){const a=points[j],b=points[j+1],steps=Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));for(let i=0;i<=steps;i++){const t=steps?i/steps:0;ellipse(Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t),layer?3:4,layer?3:4,layer?(back?C.shade:C.blue):C.outline);}}};
  const hand=(point:Point,back=false)=>{ellipse(point[0]+1,point[1],5,4,C.outline);ellipse(point[0]+1,point[1],4,3,back?C.shade:C.blue);rect(point[0]+1,point[1]-2,3,1,C.light);rect(point[0]+4,point[1],1,2,C.deep);};
  const foot=(point:Point,back=false)=>{ellipse(point[0]+2,point[1],5,3,C.outline);ellipse(point[0]+2,point[1]-1,4,2,back?C.shade:C.blue);rect(point[0]+2,point[1]-2,4,1,C.light);};
  limb(p.legBack,true);foot(p.legBack[2],true);limb(p.armBack,true);hand(p.armBack[2],true);
  const bx=31+p.lean,by=47+p.bob+p.crouch*.5;
  // Yellow hooded top with the partial blue chest motif from the reference.
  ellipse(bx,by,15,17,C.outline);ellipse(bx,by,14,16,'#d3ad16');
  ellipse(bx+3,by-2,11,14,'#ffdb1c');rect(bx-8,by+10,19,3,'#f0c816');
  poly([[bx+1,by+8],[bx+5,by+1],[bx+9,by+8],[bx+7,by+10],[bx+3,by+10]],C.outline);
  poly([[bx+3,by+8],[bx+5,by+4],[bx+7,by+8],[bx+6,by+9],[bx+4,by+9]],C.light);
  ellipse(bx,by-12,20,9,C.outline);ellipse(bx,by-13,19,8,'#ffda17');
  ellipse(bx+2,by-15,15,5,'#d6af17');rect(bx-10,by-10,24,3,'#ffe95c');
  limb(p.legFront);foot(p.legFront[2]);
  const hx=31+p.lean,hy=23+p.bob+p.crouch;
  // Individually placed yellow spikes surround a broad blue, unspiked face.
  const spikes:Point[][]=[
    [[hx-18,hy-14],[hx-33,hy-21],[hx-22,hy-6]],
    [[hx-11,hy-20],[hx-23,hy-29],[hx-15,hy-11]],
    [[hx-2,hy-22],[hx-3,hy-31],[hx+5,hy-20]],
    [[hx+8,hy-20],[hx+17,hy-29],[hx+16,hy-12]],
    [[hx+17,hy-12],[hx+28,hy-19],[hx+22,hy-3]],
    [[hx-23,hy-5],[hx-35,hy],[hx-21,hy+4]],
    [[hx-22,hy+5],[hx-34,hy+13],[hx-18,hy+13]]
  ];
  for(const triangle of spikes){poly(triangle,C.outline);const cx=triangle.reduce((a,p)=>a+p[0],0)/3,cy=triangle.reduce((a,p)=>a+p[1],0)/3;poly(triangle.map(([x,y])=>[cx+(x-cx)*.76,cy+(y-cy)*.76] as Point),'#ffdf20');}
  ellipse(hx,hy,24,24,C.outline);ellipse(hx,hy,23,23,C.blue);ellipse(hx-12,hy+5,9,15,C.shade);
  poly([[hx-16,hy-17],[hx-8,hy-22],[hx+3,hy-22],[hx+12,hy-16],[hx+1,hy-19],[hx-8,hy-18]],C.light);
  // One eye sits taller, producing the eager asymmetry in the original portrait.
  if(p.eyes==='blink'){
    rect(hx-6,hy-5,10,2,C.outline);rect(hx+8,hy-3,11,2,C.outline);
  }else if(p.eyes==='hit'){
    rect(hx-5,hy-7,3,2,C.outline);rect(hx-2,hy-5,3,2,C.outline);rect(hx+12,hy-4,3,2,C.outline);
  }else{
    ellipse(hx-2,hy-6,9,13,C.outline);ellipse(hx-2,hy-6,8,12,'#ffe027');
    ellipse(hx+13,hy-3,9,11,C.outline);ellipse(hx+13,hy-3,8,10,'#ffe027');
    ellipse(hx+2,hy-4,2,3,C.outline);ellipse(hx+15,hy-2,2,3,C.outline);
    rect(hx+2,hy-5,1,1,C.white);rect(hx+15,hy-3,1,1,C.white);
    // A blue brow arches down between the yellow eyes.
    poly([[hx-11,hy-16],[hx-7,hy-21],[hx,hy-23],[hx+4,hy-19],[hx+8,hy-9],[hx+6,hy-3],[hx+3,hy-7],[hx+1,hy-16],[hx-4,hy-19]],C.blue);
    rect(hx-8,hy-22,6,1,C.outline);rect(hx-11,hy-20,3,1,C.outline);rect(hx+13,hy-17,5,1,C.outline);
  }
  // Long, curved red muzzle with a blue segmented tooth row, not white teeth.
  ellipse(hx+6,hy+12,23,11,C.outline);ellipse(hx+6,hy+12,22,10,'#ba251e');
  ellipse(hx+8,hy+9,21,7,'#d93426');rect(hx-11,hy+6,5,1,'#f06c41');
  poly([[hx-13,hy+8],[hx-8,hy+11],[hx+3,hy+14],[hx+18,hy+14],[hx+26,hy+10],[hx+23,hy+16],[hx+15,hy+19],[hx+2,hy+18],[hx-8,hy+14]],C.outline);
  poly([[hx-11,hy+9],[hx-7,hy+11],[hx+3,hy+15],[hx+18,hy+15],[hx+24,hy+12],[hx+22,hy+16],[hx+15,hy+17],[hx+2,hy+16],[hx-7,hy+13]],'#70c0e4');
  rect(hx-5,hy+12,1,4,C.outline);rect(hx+2,hy+14,1,3,C.outline);rect(hx+9,hy+15,1,3,C.outline);rect(hx+16,hy+15,1,3,C.outline);rect(hx+21,hy+13,1,3,C.outline);
  rect(hx-4,hy+20,18,1,'#ec4930');
  // Small black bulb nose sits high on the top lip.
  ellipse(hx+11,hy+2,5,6,C.outline);rect(hx+8,hy+6,8,2,C.outline);
  rect(hx+9,hy-1,2,2,'#36414a');
  limb(p.armFront);hand(p.armFront[2]);
  if(p.orb){const [x,y]=p.armFront[2];const r=phase===1?7:5;ellipse(x+7,y-1,r,r,'#234cce');ellipse(x+7,y-1,r-2,r-2,'#74c8ff');rect(x+6,y-3,3,4,'#e3f4ff');rect(x+2,y-7,2,2,'#b0ddff');rect(x+11,y+4,2,2,'#b0ddff');}
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

export function drawNate(ctx:CanvasRenderingContext2D,f:Fighter,frame:number,ghost=false):void{
  const [kind,phase]=animation(f,frame);const img=sprite(kind,phase,f.flash>0&&Math.floor(f.flash/2)%2===0);
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(f.x),Math.round(f.y));ctx.scale(f.facing,1);if(ghost)ctx.globalAlpha=.55;
  ctx.drawImage(img,-80,-176,224,192);ctx.restore();
}

export function drawNatePortrait(ctx:CanvasRenderingContext2D,width:number,height:number):void{
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,width,height);
  ctx.fillStyle='#15213c';ctx.fillRect(0,0,width,height);
  const size=Math.min(width,height),img=sprite('idle',0);
  ctx.drawImage(img,0,0,72,72,(width-size)/2,(height-size)/2,size,size);
  ctx.restore();
}

/** Number of authored frame slots per state; one row per state on the sheet. */
export const NATE_ANIMATIONS:Record<string,number>={idle:4,walk:4,jump:2,fall:2,crouch:2,dash:2,hit:2,block:2,light:3,medium:3,heavy:3,low:3,sweep:3,airLight:3,airMedium:3,airHeavy:3,launcher:3,bolt:3,grab:3,special:4};
export function drawNateSheet(ctx:CanvasRenderingContext2D):{width:number;height:number}{
  ctx.save();ctx.imageSmoothingEnabled=false;
  Object.entries(NATE_ANIMATIONS).forEach(([name,count],row)=>{for(let i=0;i<count;i++)ctx.drawImage(sprite(name,i),i*224,row*192,224,192);});
  ctx.restore();return {width:896,height:Object.keys(NATE_ANIMATIONS).length*192};
}
