import { A, FLOOR, MOVES, getMove, type Fighter, type FighterId } from './core';

/** Three independently illustrated reference-based fighters with a shared pose rig.
 * 10: Santa hat / blue face; 11: split yellow/blue face; 12: long-neck blue creature.
 * Native pixel canvases are cached per fighter, move and animation phase. */
const sprites = new Map<string, HTMLCanvasElement>();
const BASE = { outline:'#131839', blue:'#2449ed', light:'#5374ff', shade:'#1731b7', deep:'#142b8c', yellow:'#ffe646', yellowShade:'#d9ae27', red:'#f4232c', redShade:'#b80e27', white:'#fff9df' };
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

function sprite(id:FighterId,kind:string,phase:number,flash=false):HTMLCanvasElement {
  const C={...BASE,...(id==='guest11'?{blue:'#9eb9dc',light:'#c1d8ec',shade:'#e4ba3e',deep:'#846c30'}:{})};
  const key=`${id}:${kind}:${phase}:${flash}`;const cached=sprites.get(key);if(cached)return cached;
  const canvas=document.createElement('canvas');canvas.width=112;canvas.height=96;const c=canvas.getContext('2d')!;c.translate(8,12);
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
  // Garments are individually authored from the supplied portrait references.
  const narrow=id==='guest12';
  ellipse(bx,by,narrow?11:15,17,C.outline);ellipse(bx+1,by,narrow?10:14,16,C.redShade);
  ellipse(bx+4,by-1,narrow?7:10,14,C.red);rect(bx-8,by+11,20,2,C.redShade);
  if(id==='guest10'){
    ellipse(bx+1,by-12,15,6,C.outline);ellipse(bx+1,by-12,14,5,C.yellow);
    rect(bx-9,by-14,22,3,C.yellow);rect(bx+8,by-11,3,4,C.yellowShade);
  }else if(id==='guest11'){
    ellipse(bx+1,by-11,17,6,C.outline);ellipse(bx+1,by-12,16,5,'#4b8ac8');
    rect(bx-12,by-13,24,3,'#72a6d5');
    ellipse(bx+15,by-9,5,6,C.outline);ellipse(bx+15,by-9,4,5,C.yellow);
    ellipse(bx+14,by-9,2,3,C.outline);rect(bx+15,by-7,3,2,C.yellow);
    ellipse(bx-1,by+6,5,5,C.white);ellipse(bx-1,by+6,4,4,'#397648');
    ellipse(bx+6,by+6,5,5,C.white);ellipse(bx+6,by+6,4,4,'#397648');
    rect(bx+1,by+1,3,9,'#dce0d4');rect(bx+2,by+3,1,5,'#697679');
  }else{
    ellipse(bx+2,by-13,8,11,C.outline);ellipse(bx+2,by-14,7,11,C.blue);
    ellipse(bx+1,by-6,10,4,C.redShade);ellipse(bx+1,by-7,8,2,C.red);
  }
  limb(p.legFront);foot(p.legFront[2]);
  const hx=31+p.lean,hy=(narrow?22:25)+p.bob+p.crouch;
  const headBase=(rx:number,ry:number)=>{
    ellipse(hx,hy,rx+1,ry+1,C.outline);ellipse(hx,hy,rx,ry,C.blue);
    ellipse(hx-8,hy+5,Math.max(4,rx-11),ry-5,C.shade);
  };
  if(id==='guest11'){
    // Radial points are split down the centre along with the face.
    const points:Point[]=[];
    for(let i=0;i<28;i++){const angle=-Math.PI/2+i*Math.PI/14;const radius=i%2===0?28:21;points.push([Math.round(hx+Math.cos(angle)*radius),Math.round(hy+Math.sin(angle)*radius)]);}
    poly(points,C.outline);
    const inner=points.map(([x,y])=>[hx+(x-hx)*.91,hy+(y-hy)*.91] as Point);
    poly(inner,'#9eb9dc');c.save();c.beginPath();c.rect(-20,-20,hx+20,120);c.clip();poly(inner,C.yellow);c.restore();
    headBase(21,23);
    c.save();c.beginPath();c.rect(-20,-20,hx+20,120);c.clip();ellipse(hx,hy,21,23,C.yellow);ellipse(hx-9,hy+7,8,13,'#f0cb43');c.restore();
    if(p.eyes==='hit'){
      rect(hx-10,hy-9,3,2,C.outline);rect(hx-7,hy-7,3,2,C.outline);rect(hx+9,hy-7,3,2,C.outline);
    }else if(p.eyes==='blink'){
      rect(hx-14,hy-6,13,2,C.outline);rect(hx+4,hy-6,11,2,C.outline);
    }else{
      ellipse(hx-8,hy-7,9,10,C.outline);ellipse(hx-8,hy-7,8,9,C.yellow);
      ellipse(hx+9,hy-6,8,9,C.outline);ellipse(hx+9,hy-6,7,8,'#adc4e4');
      ellipse(hx-3,hy-6,4,5,C.outline);ellipse(hx-3,hy-6,2,3,C.yellow);rect(hx-2,hy-5,2,2,C.outline);
      ellipse(hx+6,hy-6,4,4,C.yellow);ellipse(hx+4,hy-6,2,3,C.outline);rect(hx+7,hy-5,2,2,C.outline);
      rect(hx-13,hy-19,5,1,C.outline);rect(hx-8,hy-18,3,1,C.outline);rect(hx+7,hy-18,5,1,C.outline);
    }
    ellipse(hx+1,hy+9,18,10,C.outline);ellipse(hx+1,hy+9,17,9,C.redShade);ellipse(hx+1,hy+8,16,8,C.red);
    ellipse(hx+1,hy+10,14,5,C.outline);ellipse(hx+1,hy+9,13,4,C.white);
    rect(hx-11,hy+10,24,2,C.outline);rect(hx-9,hy+11,20,2,C.white);
    rect(hx-6,hy+11,1,3,C.outline);rect(hx+5,hy+11,1,3,C.outline);
    ellipse(hx+1,hy+1,5,6,C.outline);rect(hx,hy-4,2,2,C.white);
  }else if(id==='guest10'){
    poly([[hx-13,hy-17],[hx-30,hy-21],[hx-20,hy-10],[hx-29,hy-6],[hx-19,hy-2],[hx-27,hy+8],[hx-13,hy+8]],C.outline);
    poly([[hx-12,hy-15],[hx-26,hy-18],[hx-17,hy-9],[hx-25,hy-6],[hx-16,hy-1],[hx-23,hy+6],[hx-11,hy+6]],C.blue);
    headBase(19,22);
    // Separate rounded eyes, sleepy lower lids and an unmistakable red nose.
    if(p.eyes==='blink'){rect(hx-6,hy-6,10,2,C.outline);rect(hx+8,hy-6,9,2,C.outline);}
    else{
      ellipse(hx-1,hy-8,10,7,C.outline);ellipse(hx-1,hy-8,9,6,C.yellow);
      ellipse(hx+13,hy-8,8,7,C.outline);ellipse(hx+13,hy-8,7,6,C.yellow);
      ellipse(hx+1,hy-8,3,p.eyes==='hit'?1:3,C.outline);ellipse(hx+13,hy-8,3,p.eyes==='hit'?1:3,C.outline);
      if(p.eyes!=='hit'){rect(hx+1,hy-9,1,1,C.white);rect(hx+13,hy-9,1,1,C.white);}
      rect(hx-7,hy,11,1,C.deep);rect(hx+8,hy,10,1,C.deep);
    }
    ellipse(hx+13,hy+4,10,10,C.outline);ellipse(hx+13,hy+4,9,9,C.redShade);ellipse(hx+14,hy+2,8,7,C.red);
    ellipse(hx+3,hy+15,17,5,C.outline);ellipse(hx+3,hy+15,16,4,C.redShade);ellipse(hx+4,hy+14,15,3,C.red);
    poly([[hx-10,hy+12],[hx-3,hy+15],[hx+12,hy+16],[hx+17,hy+14],[hx+13,hy+17],[hx-2,hy+16]],C.outline);
    // Keep the Christmas hat in every pose, including aerial attacks and hit stun.
    const sway=kind==='walk'||kind==='dash'?phase%2*2:0;
    poly([[hx-22,hy-6],[hx-21,hy-30],[hx-11,hy-33],[hx+3,hy-33],[hx+13,hy-21],[hx+15,hy-16],[hx-10,hy-14]],C.outline);
    poly([[hx-20,hy-9],[hx-19,hy-29],[hx-10,hy-31],[hx+2,hy-31],[hx+11,hy-20],[hx+12,hy-17],[hx-10,hy-16]],C.redShade);
    poly([[hx-17,hy-23],[hx-15,hy-30],[hx-9,hy-30],[hx+1,hy-29],[hx+10,hy-19],[hx-9,hy-17]],C.red);
    for(let i=0;i<8;i++){const x=hx-14+i*4,y=hy-17-(i>1&&i<6?2:0);ellipse(x,y,4,4,C.outline);ellipse(x,y,3,3,'#f8f4ed');}
    ellipse(hx-22-sway,hy-7,6,7,C.outline);ellipse(hx-22-sway,hy-7,5,6,'#f8f4ed');rect(hx-24-sway,hy-10,3,2,'#ffffff');
  }else{
    // Longer head/neck and yellow rear accents reproduce reference 12's silhouette.
    poly([[hx-6,hy-21],[hx-23,hy-24],[hx-13,hy-18],[hx-26,hy-13],[hx-15,hy-8],[hx-27,hy-2],[hx-15,hy+2],[hx-22,hy+9],[hx-10,hy+9]],C.outline);
    poly([[hx-6,hy-19],[hx-19,hy-22],[hx-10,hy-17],[hx-22,hy-13],[hx-11,hy-7],[hx-23,hy-2],[hx-11,hy+3],[hx-18,hy+7],[hx-7,hy+8]],C.blue);
    poly([[hx-16,hy+2],[hx-25,hy+14],[hx-11,hy+12]],C.outline);poly([[hx-16,hy+4],[hx-22,hy+12],[hx-11,hy+10]],C.yellow);
    ellipse(hx-15,hy+22,8,4,C.outline);ellipse(hx-15,hy+22,7,3,C.yellow);
    headBase(17,21);ellipse(hx-17,hy-3,4,5,C.outline);ellipse(hx-17,hy-3,3,4,C.yellow);
    if(p.eyes==='blink'){rect(hx-6,hy-7,10,2,C.outline);rect(hx+7,hy-7,10,2,C.outline);}
    else{
      ellipse(hx-1,hy-7,8,9,C.outline);ellipse(hx-1,hy-7,7,8,C.yellow);
      ellipse(hx+12,hy-7,8,9,C.outline);ellipse(hx+12,hy-7,7,8,C.yellow);
      ellipse(hx+1,hy-6,4,p.eyes==='hit'?1:6,C.outline);ellipse(hx+13,hy-6,4,p.eyes==='hit'?1:6,C.outline);
      if(p.eyes!=='hit'){rect(hx,hy-10,2,3,C.white);rect(hx+12,hy-10,2,3,C.white);rect(hx+3,hy-5,1,1,C.white);rect(hx+15,hy-5,1,1,C.white);}
      rect(hx-6,hy-19,5,1,C.outline);rect(hx-1,hy-18,4,1,C.outline);rect(hx+9,hy-19,5,1,C.outline);
    }
    ellipse(hx+6,hy+7,19,8,C.outline);ellipse(hx+6,hy+7,18,7,C.redShade);ellipse(hx+7,hy+4,17,5,C.red);
    poly([[hx-9,hy+5],[hx-1,hy+8],[hx+14,hy+9],[hx+22,hy+6],[hx+17,hy+10],[hx,hy+10]],C.outline);
    rect(hx-5,hy+7,5,1,C.redShade);
  }
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

export function drawRosterB(ctx:CanvasRenderingContext2D,f:Fighter,frame:number,ghost=false):void{
  const [kind,phase]=animation(f,frame);const img=sprite(f.id,kind,phase,f.flash>0&&Math.floor(f.flash/2)%2===0);
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(f.x),Math.round(f.y));ctx.scale(f.facing,1);if(ghost)ctx.globalAlpha=.55;
  ctx.drawImage(img,-80,-176,224,192);ctx.restore();
}

export function drawRosterBPortrait(ctx:CanvasRenderingContext2D,id:FighterId,width:number,height:number):void{
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,width,height);
  ctx.fillStyle='#15213c';ctx.fillRect(0,0,width,height);
  const size=Math.min(width,height),img=sprite(id,'idle',0);
  ctx.drawImage(img,0,0,72,72,(width-size)/2,(height-size)/2,size,size);
  ctx.restore();
}

/** Number of authored frame slots per state; one row per state on the sheet. */
export const ROSTER_B_ANIMATIONS:Record<string,number>={idle:4,walk:4,jump:2,fall:2,crouch:2,dash:2,hit:2,block:2,light:3,medium:3,heavy:3,low:3,sweep:3,airLight:3,airMedium:3,airHeavy:3,launcher:3,bolt:3,grab:3,special:4};
export function drawRosterBSheet(ctx:CanvasRenderingContext2D,id:FighterId):{width:number;height:number}{
  ctx.save();ctx.imageSmoothingEnabled=false;
  Object.entries(ROSTER_B_ANIMATIONS).forEach(([name,count],row)=>{for(let i=0;i<count;i++)ctx.drawImage(sprite(id,name,i),i*224,row*192,224,192);});
  ctx.restore();return {width:896,height:Object.keys(ROSTER_B_ANIMATIONS).length*192};
}
