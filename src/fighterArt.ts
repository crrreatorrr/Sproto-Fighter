import { A, FLOOR, MOVES, type Fighter, type MoveId } from './core';

/** Authored pixel sprites. Every silhouette is rasterized on an integer grid,
 * then cached and enlarged without smoothing. The reference is not embedded. */
const P = { ink:'#191520', yellow:'#ffd32a', sun:'#ffe874', shade:'#cf951b',
  green:'#708e32', greenLight:'#a3b842', greenDark:'#425c29', white:'#fff8d6',
  red:'#c72e32', redLight:'#ed5750', redDark:'#7c202c', coat:'#22212b',
  coatLight:'#45414e', shoe:'#242332' };
type Point = [number,number];
type Pose = 'idle'|'walk'|'jump'|'fall'|'crouch'|'dash'|'hit'|'block'|MoveId;
export const RIVET_ANIMATIONS = {
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
  limb(c,shoulder,elbow,6,back?P.coat:P.coatLight);limb(c,elbow,hand,5,back?P.shade:P.yellow);
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
  const outline:Point[]=[[-20,3],[-23,-8],[-11,-3],[-3,-5],[9,-4],[20,-9],[18,3],[25,3],[20,9],[20,20],[15,28],[5,31],[-10,30],[-18,25],[-26,24],[-21,17],[-23,10],[-29,5]];
  poly(c,outline,P.ink);
  poly(c,[[-18,4],[-20,-5],[-11,0],[-3,-3],[8,-2],[17,-6],[16,5],[22,5],[18,9],[18,19],[13,26],[4,29],[-9,28],[-16,24],[-22,23],[-18,17],[-20,9],[-24,6]],P.yellow);
  poly(c,[[-18,5],[-19,-3],[-14,0]],P.shade);rect(c,-21,7,5,2,P.sun);rect(c,-7,-1,13,2,P.sun);
  poly(c,[[-19,18],[-15,26],[-8,28],[5,28],[14,24],[16,21],[11,26],[-7,26]],P.shade);
  // Reference face: drooping green eyelids, oversized white eyes, black nose and broad red lips.
  oval(c,-19,5,21,15,P.ink);oval(c,0,5,20,15,P.ink);
  oval(c,-18,6,19,13,P.green);oval(c,1,6,17,13,P.green);
  if(!blink){oval(c,-17,10,18,9,P.white);oval(c,2,10,16,9,P.white);
    oval(c,-10,10,7,9,P.ink);oval(c,7,10,7,9,P.ink);rect(c,-8,11,2,2,'#ffffff');rect(c,9,11,2,2,'#ffffff');}
  poly(c,[[-18,11],[-16,7],[-11,6],[-6,7],[0,11],[-1,13],[-8,10],[-12,9],[-16,11]],P.greenDark);
  poly(c,[[1,11],[4,7],[10,6],[15,8],[18,12],[16,13],[11,10],[7,9],[3,11]],P.greenDark);
  limb(c,[-16,7],[-9,7],1,P.greenLight);limb(c,[6,7],[12,7],1,P.greenLight);
  if(blink){limb(c,[-16,14],[-3,15],2,P.ink);limb(c,[4,15],[15,14],2,P.ink);}
  oval(c,-18,19,36,9,P.ink);oval(c,-17,20,33,6,P.red);rect(c,-14,20,8,1,P.redLight);
  limb(c,[-15,23],[9,25],1,P.redDark);limb(c,[9,25],[15,23],1,P.redDark);
  oval(c,-3,15,10,10,P.ink);rect(c,-1,16,3,1,'#37302e');
  rect(c,-3,2,3,1,P.ink);if(hurt){rect(c,-15,10,7,2,P.ink);rect(c,7,10,7,2,P.ink);}
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
  poly(c,[[left,top],[left+23,top+2],[hip[0]+16,hip[1]+1],[hip[0]+2,hip[1]+5],[hip[0]-16,hip[1]+1]],P.ink);
  poly(c,[[left+2,top+2],[left+9,top+4],[hip[0]+1,hip[1]+1],[hip[0]-13,hip[1]-1]],P.coatLight);
  poly(c,[[left+10,top+3],[left+21,top+4],[hip[0]+13,hip[1]-1],[hip[0]+1,hip[1]+1]],P.coat);
  poly(c,[[left+7,top+1],[left+18,top+2],[hip[0]+3,hip[1]-4]],P.yellow);
  poly(c,[[left+13,top+5],[left+17,top+8],[hip[0]+5,hip[1]-3],[hip[0]+1,hip[1]-7]],P.red);
  rect(c,hip[0]-12,hip[1],23,3,P.ink);rect(c,hip[0]-2,hip[1],4,2,P.shade);
  // Scarf knot and tail move independently to reinforce acceleration.
  poly(c,[[headAt[0]-14,headAt[1]+27],[headAt[0]+16,headAt[1]+27],[headAt[0]+11,headAt[1]+34],[headAt[0]-8,headAt[1]+35],[headAt[0]-17,headAt[1]+30]],P.redDark);
  poly(c,[[headAt[0]-13,headAt[1]+28],[headAt[0]+14,headAt[1]+28],[headAt[0]+9,headAt[1]+32],[headAt[0]-7,headAt[1]+33]],P.red);
  if(pose==='dash'||pose==='walk'||pose==='jump')poly(c,[[headAt[0]-12,headAt[1]+30],[-31,headAt[1]+29-frame%2*3],[-27,headAt[1]+35],[-14,headAt[1]+35]],P.red);
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
  if(f.move){const m=MOVES[f.move.id],t=f.move.t;
    if(f.move.id==='special')return ['special',Math.floor(t/6)%4];
    return [f.move.id,t<m.startup?0:t<m.startup+m.active?1:2];}
  if(f.dash>0)return ['dash',Math.floor(frame/3)%3];
  if(f.y<FLOOR)return [f.vy<0?'jump':'fall',Math.floor(frame/8)%2];
  if(f.input&A.down)return ['crouch',Math.floor(frame/12)%2];
  if(Math.abs(f.vx)>1)return ['walk',Math.floor(frame/5)%6];
  return ['idle',Math.floor(frame/13)%4];
}
/** Draw in world coordinates. Atlas origin is the character's grounded feet. */
export function drawRivet(c:CanvasRenderingContext2D,f:Fighter,frame:number,ghost=false){
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
export function drawRivetPortrait(c:CanvasRenderingContext2D,width:number,height:number){
  let portrait=cache.get('portrait');
  if(!portrait){portrait=document.createElement('canvas');portrait.width=96;portrait.height=96;const p=portrait.getContext('2d')!;
    poly(p,[[7,96],[11,75],[23,64],[69,64],[85,76],[92,96]],P.ink);
    poly(p,[[17,96],[22,77],[35,71],[43,96]],P.coatLight);poly(p,[[61,96],[69,73],[81,81],[85,96]],P.coat);
    poly(p,[[32,73],[63,73],[49,96]],P.yellow);poly(p,[[47,80],[53,80],[57,96],[43,96]],P.red);
    p.save();p.translate(48,22);p.scale(1.65,1.65);head(p,0,0,false);p.restore();
    poly(p,[[18,67],[33,75],[65,75],[78,66],[75,78],[52,85],[30,80],[18,73]],P.redDark);
    poly(p,[[20,68],[35,75],[64,75],[76,68],[72,76],[51,81],[31,77]],P.red);
    cache.set('portrait',portrait);
  }
  c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,width,height);const size=Math.min(width,height);c.drawImage(portrait,Math.floor((width-size)/2),Math.floor((height-size)/2),size,size);c.restore();
}
/** Optional sprite-contact-sheet output for visual inspection/export. */
export function drawRivetSheet(c:CanvasRenderingContext2D):{width:number;height:number}{
  const poses=Object.keys(RIVET_ANIMATIONS) as Pose[],columns=6;
  for(let row=0;row<poses.length;row++){const pose=poses[row];for(let i=0;i<RIVET_ANIMATIONS[pose];i++)c.drawImage(sprite(pose,i),i*192,row*120);}
  return {width:columns*192,height:poses.length*120};
}
