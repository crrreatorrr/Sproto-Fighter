import { A, FLOOR, getMove, type Fighter, type MoveId } from './core';

/** Reference-based Bitcoin Mandela sprites. The source background and radiating
 * black shapes are deliberately omitted. Clean transparent sprites preserve the
 * rounded blue head, yellow irises, huge crimson nose, red lips/gold muzzle ring,
 * ear bead/hoop, and broad gold collar with a small coin pendant. */
const P={ink:'#11172c',yellow:'#0663d4',sun:'#3486ed',shade:'#06499e',white:'#fffbe5',
 red:'#bd0731',redLight:'#e31b48',redDark:'#740d29',coat:'#0b58bb',coatLight:'#3173d7',
 shoe:'#0755b4',gold:'#ffe344',goldShade:'#c7a82b'};
type Point = [number,number];
type Pose = 'idle'|'walk'|'jump'|'fall'|'crouch'|'dash'|'hit'|'block'|MoveId;
export const MANDELA_ANIMATIONS = {
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
  limb(c,shoulder,elbow,6,back?P.shade:P.yellow);limb(c,elbow,hand,5,back?P.shade:P.yellow);
  oval(c,hand[0]-5,hand[1]-5,11,10,P.ink);oval(c,hand[0]-4,hand[1]-4,9,8,back?P.shade:P.yellow);
  rect(c,hand[0],hand[1]-3,3,2,P.sun);rect(c,hand[0]-3,hand[1]+2,6,1,P.shade);
}
function leg(c:CanvasRenderingContext2D,hip:Point,knee:Point,foot:Point,back=false){
  limb(c,hip,knee,10,P.ink);limb(c,knee,foot,8,P.ink);
  limb(c,hip,knee,7,back?P.shade:P.yellow);limb(c,knee,foot,5,back?P.shade:P.yellow);
  rect(c,foot[0]-5,foot[1]-2,14,5,P.ink);rect(c,foot[0]-4,foot[1]-2,11,3,P.shoe);rect(c,foot[0]+1,foot[1]-2,6,1,P.coatLight);
}
function head(c:CanvasRenderingContext2D,cx:number,cy:number,blink:boolean,hurt=false){
 c.save();c.translate(Math.round(cx),Math.round(cy));
 // Rounded head only: none of the source's black/yellow background rays.
 oval(c,-25,-11,50,55,P.ink);oval(c,-23,-9,46,52,P.yellow);
 oval(c,-21,5,8,27,P.shade);poly(c,[[-15,-5],[-5,-8],[7,-7],[17,-2],[6,-4],[-4,-5]],P.sun);
 // Tiny red ear bead and gold side hoop, kept separate from the face outline.
 oval(c,21,8,8,10,P.ink);oval(c,22,9,6,8,P.red);rect(c,24,10,2,2,P.redLight);
 oval(c,21,18,9,15,P.ink);oval(c,22,19,7,13,P.gold);oval(c,23,21,4,9,P.yellow);
 // White eyes, yellow irises and narrow dark pupils.
 oval(c,-19,0,21,15,P.ink);oval(c,-18,1,19,13,P.white);
 oval(c,3,-1,21,15,P.ink);oval(c,4,0,19,13,P.white);
 if(blink){limb(c,[-17,7],[-1,7],2,P.ink);limb(c,[5,6],[21,6],2,P.ink);}
 else{oval(c,-13,1,12,12,P.gold);oval(c,8,0,12,12,P.gold);oval(c,-9,2,5,hurt?6:10,P.ink);oval(c,12,1,5,hurt?6:10,P.ink);rect(c,-8,2,2,3,P.white);rect(c,13,1,2,3,P.white);}
 poly(c,[[-20,2],[-16,-3],[-8,-5],[-1,-2],[3,3],[1,5],[-2,0],[-8,-2],[-15,0],[-18,4]],P.yellow);
 poly(c,[[2,2],[6,-4],[14,-6],[21,-3],[25,1],[23,3],[19,-1],[13,-3],[7,-1],[4,4]],P.yellow);
 limb(c,[-19,-1],[-14,-5],1,P.ink);limb(c,[-14,-5],[-7,-6],1,P.ink);limb(c,[-7,-6],[0,-3],1,P.ink);
 limb(c,[4,-3],[10,-7],1,P.ink);limb(c,[10,-7],[17,-6],1,P.ink);limb(c,[17,-6],[23,-3],1,P.ink);
 limb(c,[-21,12],[-5,15],1,P.shade);limb(c,[7,14],[22,11],1,P.shade);
 // Oversized bulbous crimson nose is the main identifying feature.
 oval(c,-12,13,27,20,P.ink);oval(c,-11,14,25,18,P.red);
 oval(c,-8,15,7,3,P.redLight);oval(c,-10,26,5,4,P.redDark);rect(c,-8,27,2,2,P.yellow);
 // Yellow chin ring frames the full red lips, rather than facial hair texture.
 oval(c,-15,32,36,19,P.ink);oval(c,-14,33,34,17,P.gold);
 oval(c,-10,32,28,14,P.yellow);
 poly(c,[[-9,36],[-5,31],[1,32],[4,35],[8,32],[14,32],[18,36],[15,43],[7,46],[-4,44],[-11,40]],P.ink);
 poly(c,[[-8,36],[-4,33],[0,34],[4,37],[9,34],[13,34],[16,37],[13,42],[7,44],[-3,42],[-9,39]],P.red);
 limb(c,[-8,38],[-1,36],1,P.redDark);limb(c,[-1,36],[15,38],1,P.redDark);
 limb(c,[-18,28],[-14,26],1,P.ink);limb(c,[-14,26],[-10,27],1,P.ink);
 limb(c,[14,28],[19,26],1,P.ink);limb(c,[19,26],[23,29],1,P.ink);
 if(hurt){limb(c,[-17,4],[-3,8],2,P.ink);limb(c,[7,7],[21,3],2,P.ink);}
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
  // Blue torso and broad gold collar/coin. No copied background silhouette.
  poly(c,[[left-2,top],[left+26,top+2],[hip[0]+17,hip[1]+3],[hip[0]-15,hip[1]+3]],P.ink);
  poly(c,[[left,top+2],[left+23,top+4],[hip[0]+14,hip[1]+1],[hip[0]-12,hip[1]+1]],P.yellow);
  poly(c,[[left+2,top+5],[left+7,top+5],[hip[0]-4,hip[1]],[hip[0]-12,hip[1]]],P.sun);
  poly(c,[[headAt[0]-20,headAt[1]+40],[headAt[0]+22,headAt[1]+40],[headAt[0]+18,headAt[1]+49],[headAt[0]+3,headAt[1]+52],[headAt[0]-15,headAt[1]+48],[headAt[0]-22,headAt[1]+44]],P.ink);
  poly(c,[[headAt[0]-18,headAt[1]+41],[headAt[0]+20,headAt[1]+41],[headAt[0]+16,headAt[1]+47],[headAt[0]+3,headAt[1]+50],[headAt[0]-14,headAt[1]+46],[headAt[0]-20,headAt[1]+44]],P.gold);
  limb(c,[headAt[0]+1,headAt[1]+47],[headAt[0]+2,headAt[1]+56],3,P.gold);
  oval(c,headAt[0]-2,headAt[1]+53,9,10,P.ink);oval(c,headAt[0]-1,headAt[1]+54,7,8,P.white);
  rect(c,headAt[0]+2,headAt[1]+55,1,6,P.ink);rect(c,headAt[0]+1,headAt[1]+56,4,1,P.ink);rect(c,headAt[0]+1,headAt[1]+59,4,1,P.ink);
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
export function drawMandela(c:CanvasRenderingContext2D,f:Fighter,frame:number,ghost=false){
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
export function drawMandelaPortrait(c:CanvasRenderingContext2D,width:number,height:number){
  let portrait=cache.get('portrait');
  if(!portrait){portrait=document.createElement('canvas');portrait.width=96;portrait.height=96;const p=portrait.getContext('2d')!;
    poly(p,[[5,96],[10,76],[25,66],[70,66],[86,78],[93,96]],P.ink);
    poly(p,[[9,96],[14,78],[27,69],[68,69],[82,80],[88,96]],P.yellow);
    poly(p,[[15,80],[30,72],[38,96],[13,96]],P.sun);
    poly(p,[[10,75],[24,66],[72,66],[86,77],[79,86],[54,90],[26,86]],P.ink);
    poly(p,[[13,76],[25,68],[70,68],[83,77],[77,83],[54,87],[27,83]],P.gold);
    p.save();p.translate(45,16);p.scale(1.35,1.35);head(p,0,0,false);p.restore();
    poly(p,[[45,83],[52,83],[57,96],[41,96]],P.gold);
    oval(p,44,89,11,12,P.ink);oval(p,45,90,9,10,P.white);
    rect(p,49,91,1,8,P.ink);rect(p,47,93,5,1,P.ink);rect(p,47,96,5,1,P.ink);
    cache.set('portrait',portrait);
  }
  c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,width,height);const size=Math.min(width,height);c.drawImage(portrait,Math.floor((width-size)/2),Math.floor((height-size)/2),size,size);c.restore();
}
/** Optional sprite-contact-sheet output for visual inspection/export. */
export function drawMandelaSheet(c:CanvasRenderingContext2D):{width:number;height:number}{
  const poses=Object.keys(MANDELA_ANIMATIONS) as Pose[],columns=6;
  for(let row=0;row<poses.length;row++){const pose=poses[row];for(let i=0;i<MANDELA_ANIMATIONS[pose];i++)c.drawImage(sprite(pose,i),i*192,row*120);}
  return {width:columns*192,height:poses.length*120};
}
