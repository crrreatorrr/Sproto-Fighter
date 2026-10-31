import { A, FLOOR, getMove, type Fighter, type MoveId } from './core';

/** Authored pixel sprites. Every silhouette is rasterized on an integer grid,
 * then cached and enlarged without smoothing. The reference is not embedded. */
const P = { ink:'#191520', yellow:'#1558d3', sun:'#4887ef', shade:'#0b389c',
  green:'#708e32', greenLight:'#a3b842', greenDark:'#425c29', white:'#fff8d6',
  red:'#cf212d', redLight:'#f34e44', redDark:'#7e1829', coat:'#1d2b4a',
  coatLight:'#3f5276', shoe:'#172138', gold:'#fff083', goldShade:'#d4b74b' };
type Point = [number,number];
type Pose = 'idle'|'walk'|'jump'|'fall'|'crouch'|'dash'|'hit'|'block'|MoveId;
export const DUMPSTAR_ANIMATIONS = {
  idle:4, walk:6, jump:2, fall:2, crouch:2, dash:3, hit:2, block:2,
  light:3, medium:3, heavy:3, low:3, sweep:3, airLight:3, airMedium:3,
  airHeavy:3, launcher:3, bolt:3, grab:3, special:4,
} as const;
const cache = new Map<string, HTMLCanvasElement>();
function rect(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){
  c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
}
function poly(c:CanvasRenderingContext2D,pts:Point[],color:string){
  const low=Math.floor(Math.min(...pts.map(p=>p[1]))), high=Math.ceil(Math.max(...pts.map(p=>p[1])));
  for(let y=low;y<high;y++){
    const xs:number[]=[];
    for(let i=0;i<pts.length;i++){const [x1,y1]=pts[i],[x2,y2]=pts[(i+1)%pts.length];
      if((y1<=y+.5&&y2>y+.5)||(y2<=y+.5&&y1>y+.5))xs.push(x1+(y+.5-y1)*(x2-x1)/(y2-y1));}
    xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)rect(c,Math.ceil(xs[i]-.5),y,Math.floor(xs[i+1]-.5)-Math.ceil(xs[i]-.5)+1,1,color);
  }
}
function oval(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){
  for(let row=0;row<h;row++){const yy=(row+.5-h/2)/(h/2),rx=Math.sqrt(Math.max(0,1-yy*yy))*w/2;rect(c,Math.ceil(x+w/2-rx),y+row,Math.max(1,Math.floor(rx*2)),1,color);}
}
function limb(c:CanvasRenderingContext2D,a:Point,b:Point,w:number,color:string){
  const n=Math.ceil(Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1])));
  for(let i=0;i<=n;i++){const t=n?i/n:0;rect(c,a[0]+(b[0]-a[0])*t-w/2,a[1]+(b[1]-a[1])*t-w/2,w,w,color);}
}
function arm(c:CanvasRenderingContext2D,shoulder:Point,elbow:Point,hand:Point,back=false){
  limb(c,shoulder,elbow,9,P.ink);limb(c,elbow,hand,8,P.ink);
  limb(c,shoulder,elbow,6,back?P.goldShade:P.gold);limb(c,elbow,hand,5,back?P.shade:P.yellow);
  oval(c,hand[0]-5,hand[1]-5,11,10,P.ink);oval(c,hand[0]-4,hand[1]-4,9,8,back?P.shade:P.yellow);
  rect(c,hand[0],hand[1]-3,3,2,P.sun);rect(c,hand[0]-3,hand[1]+2,6,1,P.shade);
}
function leg(c:CanvasRenderingContext2D,hip:Point,knee:Point,foot:Point,back=false){
  limb(c,hip,knee,10,P.ink);limb(c,knee,foot,8,P.ink);
  limb(c,hip,knee,7,back?P.coat:P.coatLight);limb(c,knee,foot,5,back?P.coat:P.coatLight);
  rect(c,foot[0]-5,foot[1]-2,14,5,P.ink);rect(c,foot[0]-4,foot[1]-2,11,3,P.shoe);rect(c,foot[0]+1,foot[1]-2,6,1,P.coatLight);
}
function head(c:CanvasRenderingContext2D,cx:number,cy:number,blink:boolean,hurt=false){
  c.save();c.translate(Math.round(cx),Math.round(cy));
  // Face and attire only: no shoulder companions or background objects are drawn.
  poly(c,[[-17,-3],[-25,0],[-18,-7],[-9,-12],[-13,-15],[1,-13],[13,-9],[20,-3],[23,6],[22,18],[18,28],[10,33],[-8,33],[-16,28],[-19,19],[-25,23],[-21,11],[-26,12],[-22,3]],P.ink);
  poly(c,[[-16,-1],[-22,-1],[-16,-6],[-7,-11],[-9,-13],[1,-11],[12,-7],[18,-2],[21,6],[20,17],[16,27],[9,31],[-7,31],[-14,27],[-17,16],[-22,20],[-18,9],[-23,10],[-19,2]],P.yellow);
  poly(c,[[-12,-6],[-5,-10],[2,-9],[10,-6],[1,-7],[-6,-7]],P.sun);
  limb(c,[-19,8],[-15,7],1,P.shade);limb(c,[-20,11],[-15,10],1,P.shade);
  limb(c,[-17,18],[-14,20],1,P.shade);limb(c,[-14,20],[-12,25],1,P.shade);
  // Open round yellow eyes rather than the previous fighters' half-lidded gaze.
  oval(c,-14,2,19,17,P.ink);oval(c,-12,4,16,13,P.gold);
  oval(c,5,2,18,17,P.ink);oval(c,7,4,14,13,P.gold);
  if(!blink){oval(c,-5,5,6,10,P.ink);oval(c,12,5,6,10,P.ink);rect(c,-3,6,2,2,'#ffffff');rect(c,14,6,2,2,'#ffffff');}
  else{limb(c,[-10,11],[1,11],2,P.ink);limb(c,[9,11],[19,11],2,P.ink);}
  limb(c,[-15,3],[-11,-1],1,P.ink);limb(c,[-11,-1],[-5,-2],1,P.ink);limb(c,[-5,-2],[2,1],1,P.ink);
  limb(c,[7,0],[13,-2],1,P.ink);limb(c,[13,-2],[20,1],1,P.ink);
  // The reference's red teardrop nose and wide red smiling lips.
  oval(c,-16,18,38,11,P.ink);oval(c,-14,19,34,8,P.red);
  poly(c,[[-13,20],[-7,23],[6,25],[16,23],[19,21],[17,25],[6,28],[-5,26]],P.redDark);
  limb(c,[-12,21],[-4,24],1,P.ink);limb(c,[-4,24],[9,25],1,P.ink);limb(c,[9,25],[18,22],1,P.ink);
  poly(c,[[3,15],[8,13],[14,17],[13,23],[10,25],[6,24],[3,20]],P.ink);
  poly(c,[[5,16],[8,15],[12,18],[11,22],[9,23],[6,22]],P.red);
  rect(c,6,16,3,2,P.redLight);rect(c,-12,19,7,1,P.redLight);
  if(hurt){limb(c,[-11,6],[1,9],2,P.ink);limb(c,[9,8],[20,6],2,P.ink);}
  c.restore();
}
function drawPose(c:CanvasRenderingContext2D,pose:Pose,frame:number){
  let hip:Point=[0,-24],headAt:Point=[0,-70],ls:Point=[-7,-44],rs:Point=[9,-43];
  let rearElbow:Point=[-17,-34],rearHand:Point=[-12,-27],elbow:Point=[20,-35],hand:Point=[25,-45];
  let knee1:Point=[-12,-13],foot1:Point=[-15,-2],knee2:Point=[10,-13],foot2:Point=[15,-2];
  const active=frame===1, recovering=frame===2;
  const isCrouch=pose==='crouch'||pose==='low'||pose==='sweep';
  const bodyBob=pose==='idle'?[0,1,0,-1][frame%4]:pose==='walk'?[0,-2,-1,0,-2,-1][frame%6]:0;
  if(isCrouch){hip=[0,-17];headAt=[0,-51];ls=[-7,-29];rs=[9,-28];rearElbow=[-18,-23];rearHand=[-11,-18];elbow=[23,-24];hand=[25,-32];knee1=[-17,-10];foot1=[-20,-2];knee2=[17,-9];foot2=[22,-2];}
  if(pose==='walk'){
    const strides=[-12,-6,5,12,6,-5],stride=strides[frame%6];
    knee1=[-5+stride*.5,-15];foot1=[-8+stride,-2];knee2=[6-stride*.5,-14];foot2=[11-stride,frame===1||frame===4?-7:-2];
    rearHand=[-15-stride*.4,-31];hand=[22+stride*.3,-42];
  }
  if(pose==='jump'||pose==='fall'||pose.startsWith('air')){knee1=[-14,-16];foot1=[-22,-12];knee2=[15,-18];foot2=[23,-7];rearHand=[-20,-47];elbow=[21,-49];hand=[18,-59];if(pose==='fall'){foot1=[-13,-6-frame*2];foot2=[16,-2];headAt[1]+=frame;}}
  if(pose==='dash'){hip=[-5,-23];headAt=[14,-65];ls=[0,-42];rs=[17,-40];rearElbow=[-25,-34];rearHand=[-32,-28];elbow=[-1,-30];hand=[-11,-24];knee1=[-21,-13];foot1=[-30,-2];knee2=[18,-17];foot2=[28,-3];}
  if(pose==='jump'){foot1[1]-=frame*3;knee2[0]+=frame*2;hand[1]-=frame*2;}
  if(pose==='dash'){headAt[1]-=frame%2;foot1[0]-=frame*2;foot2[1]-=frame===1?3:0;}
  if(pose==='crouch')headAt[1]+=frame;
  if(pose==='hit'){headAt=[-7-frame*2,-67];hip=[-3,-23];rearHand=[-24,-48];hand=[22,-36];elbow=[23,-44];}
  if(pose==='block'){headAt=[-3,-69];elbow=[21,-45];hand=[18+frame,-65+frame];rearElbow=[9,-35];rearHand=[25,-52];}
  if(['light','medium','heavy','airLight','airMedium','airHeavy','low'].includes(pose)){
    const reach=pose.includes('Heavy')||pose==='heavy'?71:pose.includes('Medium')||pose==='medium'?57:45;
    const y=pose==='low'?-25:pose==='airHeavy'?-25:-43;
    if(active){elbow=[reach*.58,y-2];hand=[reach,y];headAt[0]+=4;}
    else if(recovering){elbow=[28,y];hand=[34,y-2];}else{elbow=[5,-32];hand=[-3,-39];headAt[0]-=3;}
    if(pose==='medium'||pose==='airMedium'){if(active){knee2=[32,-33];foot2=[59,-39];hand=[20,-52];elbow=[17,-40];}}
    if(pose==='airHeavy'&&active){knee2=[38,-10];foot2=[67,-1];}
  }
  if(pose==='sweep'&&active){knee2=[42,-7];foot2=[73,-5];hand=[18,-34];}
  if(pose==='launcher'){if(active){elbow=[22,-66];hand=[30,-98];headAt=[7,-72];knee2=[18,-16];foot2=[24,-2];}else if(!recovering){headAt=[-3,-60];elbow=[5,-30];hand=[2,-23];}}
  if(pose==='bolt'){elbow=active?[28,-44]:[18,-37];hand=active?[47,-46]:[20,-43];rearHand=active?[42,-39]:[17,-40];}
  if(pose==='grab'){elbow=active?[27,-40]:[18,-41];hand=active?[43,-41]:[30,-43];rearElbow=[22,-34];rearHand=active?[42,-31]:[28,-32];}
  if(pose==='special'){headAt=[2,-72];rearElbow=[-23,-51];rearHand=[-28,-66];elbow=[28,-52];hand=[32,-69];if(frame%2){rearHand[1]-=3;hand[1]-=3;}}
  c.save();c.translate(0,bodyBob);
  arm(c,ls,rearElbow,rearHand,true);
  leg(c,[-5,hip[1]],knee1,foot1,true);leg(c,[6,hip[1]],knee2,foot2);
  const top=isCrouch?-39:pose==='dash'?-51:-54, left=pose==='dash'?-1:-12;
  // Pale-yellow short-sleeved collared shirt; no unrelated props from the reference.
  poly(c,[[left,top],[left+24,top+2],[hip[0]+16,hip[1]+3],[hip[0]-15,hip[1]+3]],P.ink);
  poly(c,[[left+2,top+2],[left+21,top+4],[hip[0]+13,hip[1]+1],[hip[0]-12,hip[1]+1]],P.gold);
  poly(c,[[left+2,top+5],[left+7,top+4],[hip[0]-5,hip[1]],[hip[0]-12,hip[1]]],P.goldShade);
  limb(c,[hip[0]+11,hip[1]-7],[hip[0]+12,hip[1]],1,P.goldShade);
  // Blue neck and two pale shirt collar points frame the red tie.
  poly(c,[[headAt[0]-10,headAt[1]+27],[headAt[0]+12,headAt[1]+27],[headAt[0]+9,headAt[1]+37],[headAt[0],headAt[1]+40],[headAt[0]-8,headAt[1]+36]],P.ink);
  poly(c,[[headAt[0]-8,headAt[1]+28],[headAt[0]+10,headAt[1]+28],[headAt[0]+7,headAt[1]+36],[headAt[0],headAt[1]+38],[headAt[0]-6,headAt[1]+35]],P.yellow);
  poly(c,[[headAt[0]-10,headAt[1]+32],[headAt[0],headAt[1]+39],[headAt[0]-7,headAt[1]+45],[headAt[0]-14,headAt[1]+35]],P.ink);
  poly(c,[[headAt[0]-10,headAt[1]+34],[headAt[0]-2,headAt[1]+39],[headAt[0]-7,headAt[1]+42],[headAt[0]-12,headAt[1]+35]],P.gold);
  poly(c,[[headAt[0]+11,headAt[1]+32],[headAt[0],headAt[1]+39],[headAt[0]+8,headAt[1]+44],[headAt[0]+14,headAt[1]+35]],P.ink);
  poly(c,[[headAt[0]+11,headAt[1]+34],[headAt[0]+3,headAt[1]+39],[headAt[0]+8,headAt[1]+41],[headAt[0]+12,headAt[1]+35]],P.gold);
  poly(c,[[hip[0]-3,hip[1]-7],[hip[0]+3,hip[1]-7],[hip[0]+4,hip[1]-4],[hip[0]+1,hip[1]-1],[hip[0]+4,hip[1]+3],[hip[0]-3,hip[1]+3],[hip[0]-1,hip[1]-1],[hip[0]-4,hip[1]-4]],P.redDark);
  rect(c,hip[0]-2,hip[1]-6,4,3,P.red);rect(c,hip[0],hip[1]-2,2,5,P.red);
  rect(c,hip[0]-13,hip[1]+2,26,3,P.coat);rect(c,hip[0]-2,hip[1]+2,4,2,P.goldShade);
  head(c,headAt[0],headAt[1],pose==='idle'&&frame===3,pose==='hit');
  arm(c,rs,elbow,hand);
  if(pose==='special'){for(let i=0;i<3;i++){const x=hand[0]+6+i*5,y=hand[1]-5+(i+frame)%3*4;rect(c,x,y,2,2,P.sun);}}
  c.restore();
}
function sprite(pose:Pose,frame:number):HTMLCanvasElement{
  const key=`${pose}:${frame}`;let canvas=cache.get(key);if(canvas)return canvas;
  canvas=document.createElement('canvas');canvas.width=192;canvas.height=120;
  const c=canvas.getContext('2d')!;c.translate(80,110);drawPose(c,pose,frame);cache.set(key,canvas);return canvas;
}
function animation(f:Fighter,frame:number):[Pose,number]{
  if(f.stun>0)return ['hit',Math.floor(frame/6)%2];
  if(f.blockstun>0)return ['block',Math.floor(frame/6)%2];
  if(f.move){const m=getMove(f,f.move.id),t=f.move.t;
    if(f.move.id==='special')return ['special',Math.floor(t/6)%4];
    return [f.move.id,t<m.startup?0:t<m.startup+m.active?1:2];}
  if(f.dash>0)return ['dash',Math.floor(frame/3)%3];
  if(f.y<FLOOR)return [f.vy<0?'jump':'fall',Math.floor(frame/8)%2];
  if(f.input&A.down)return ['crouch',Math.floor(frame/12)%2];
  if(Math.abs(f.vx)>1)return ['walk',Math.floor(frame/5)%6];
  return ['idle',frame%180>=176?3:Math.floor(frame/18)%3];
}
/** Draw in world coordinates. Atlas origin is the character's grounded feet. */
export function drawDumpstar(c:CanvasRenderingContext2D,f:Fighter,frame:number,ghost=false){
  const [pose,index]=animation(f,frame),atlas=sprite(pose,index),scale=1.65;
  c.save();c.translate(Math.round(f.x),Math.round(f.y));c.scale(f.facing,1);c.imageSmoothingEnabled=false;
  if(ghost)c.globalAlpha=.55;
  c.drawImage(atlas,-80*scale,-110*scale,192*scale,120*scale);
  if(f.flash>0&&f.flash%4<2){c.globalAlpha=ghost?.22:.55;c.globalCompositeOperation='source-atop';
    // A tinted atlas avoids painting unrelated scene pixels.
    const flashKey=`flash:${pose}:${index}`;let flash=cache.get(flashKey);
    if(!flash){flash=document.createElement('canvas');flash.width=192;flash.height=120;const fc=flash.getContext('2d')!;fc.drawImage(atlas,0,0);fc.globalCompositeOperation='source-in';fc.fillStyle='#fff8bc';fc.fillRect(0,0,192,120);cache.set(flashKey,flash);}
    c.globalCompositeOperation='source-over';c.drawImage(flash,-80*scale,-110*scale,192*scale,120*scale);
  }
  c.restore();
}
/** A separately composed bust sprite for roster/menu canvases. */
export function drawDumpstarPortrait(c:CanvasRenderingContext2D,width:number,height:number){
  let portrait=cache.get('portrait');
  if(!portrait){portrait=document.createElement('canvas');portrait.width=96;portrait.height=96;const p=portrait.getContext('2d')!;
    poly(p,[[6,96],[11,78],[24,66],[65,64],[82,75],[91,96]],P.ink);
    poly(p,[[9,96],[14,80],[26,69],[64,67],[79,77],[88,96]],P.gold);
    poly(p,[[12,91],[21,76],[29,73],[25,96],[10,96]],P.goldShade);
    p.save();p.translate(47,23);p.scale(1.65,1.65);head(p,0,0,false);p.restore();
    poly(p,[[31,68],[64,68],[59,81],[47,85],[35,79]],P.ink);
    poly(p,[[34,69],[61,69],[56,79],[47,82],[38,77]],P.yellow);
    poly(p,[[29,70],[47,83],[35,94],[24,75]],P.ink);poly(p,[[29,73],[43,83],[35,90],[27,76]],P.gold);
    poly(p,[[66,69],[47,83],[60,94],[72,75]],P.ink);poly(p,[[66,72],[51,83],[60,90],[69,76]],P.gold);
    poly(p,[[44,83],[51,83],[55,88],[51,94],[54,96],[43,96],[46,93],[41,88]],P.redDark);
    poly(p,[[44,85],[50,85],[52,88],[49,92],[47,92],[44,88]],P.red);rect(p,47,93,4,3,P.red);
    cache.set('portrait',portrait);
  }
  c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,width,height);const size=Math.min(width,height);c.drawImage(portrait,Math.floor((width-size)/2),Math.floor((height-size)/2),size,size);c.restore();
}
/** Optional sprite-contact-sheet output for visual inspection/export. */
export function drawDumpstarSheet(c:CanvasRenderingContext2D):{width:number;height:number}{
  const poses=Object.keys(DUMPSTAR_ANIMATIONS) as Pose[],columns=6;
  for(let row=0;row<poses.length;row++){const pose=poses[row];for(let i=0;i<DUMPSTAR_ANIMATIONS[pose];i++)c.drawImage(sprite(pose,i),i*192,row*120);}
  return {width:columns*192,height:poses.length*120};
}
