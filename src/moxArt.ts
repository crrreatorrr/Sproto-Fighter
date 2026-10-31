import { A, FLOOR, getMove, type Fighter, type MoveId } from './core';

/** Authored pixel sprites. Every silhouette is rasterized on an integer grid,
 * then cached and enlarged without smoothing. The reference is not embedded. */
const P = { ink:'#191520', yellow:'#5967cb', sun:'#8290ec', shade:'#36448e',
  green:'#708e32', greenLight:'#a3b842', greenDark:'#425c29', white:'#fff8d6',
  red:'#871e2c', redLight:'#bd3c45', redDark:'#4c1728', coat:'#111723',
  coatLight:'#283447', shoe:'#35448b', gold:'#ffe84b', goldShade:'#c7ae2b' };
type Point = [number,number];
type Pose = 'idle'|'walk'|'jump'|'fall'|'crouch'|'dash'|'hit'|'block'|MoveId;
export const MOX_ANIMATIONS = {
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
  // Scruffy indigo silhouette and long muzzle are unique to the supplied Mox reference.
  poly(c,[[-18,0],[-27,-9],[-11,-6],[-2,-9],[9,-7],[21,-9],[16,1],[25,8],[21,9],[29,17],[24,17],[24,28],[15,33],[-1,35],[-10,32],[-18,36],[-17,28],[-24,31],[-21,23],[-26,20],[-22,12],[-25,10]],P.ink);
  poly(c,[[-17,2],[-23,-6],[-10,-3],[-2,-6],[8,-4],[17,-6],[13,2],[21,7],[18,8],[25,15],[21,16],[22,26],[14,30],[-1,32],[-10,29],[-15,32],[-14,26],[-21,28],[-18,22],[-23,19],[-19,12],[-22,10]],P.yellow);
  poly(c,[[-23,-6],[-16,0],[-11,-2]],P.shade);poly(c,[[8,-4],[17,-6],[13,0]],P.sun);
  limb(c,[-14,1],[-7,-1],1,P.sun);limb(c,[-7,-1],[4,0],1,P.sun);
  // Long yellow half-lidded eyes with a deliberately sideways, unimpressed gaze.
  oval(c,-18,3,19,11,P.ink);oval(c,-17,5,17,7,P.gold);
  oval(c,-1,5,27,12,P.ink);oval(c,0,7,24,8,P.gold);
  if(!blink){oval(c,-6,5,4,7,P.ink);oval(c,12,7,5,8,P.ink);rect(c,13,8,1,2,'#ffffff');}
  else{limb(c,[-16,9],[-2,9],2,P.ink);limb(c,[2,11],[21,11],2,P.ink);}
  poly(c,[[-19,5],[-13,2],[-6,2],[1,6],[0,8],[-7,5],[-13,5],[-17,7]],P.yellow);
  poly(c,[[0,7],[7,3],[15,4],[24,8],[23,10],[15,7],[8,6],[2,9]],P.yellow);
  limb(c,[-18,4],[-11,1],1,P.ink);limb(c,[-11,1],[-2,4],1,P.ink);
  limb(c,[1,6],[9,3],1,P.ink);limb(c,[9,3],[23,7],1,P.ink);
  // Protruding indigo muzzle, black nose, a red mouth and three small white fangs.
  poly(c,[[9,14],[22,14],[29,19],[29,24],[20,28],[5,27],[-2,23],[5,21]],P.yellow);
  oval(c,21,13,9,10,P.ink);rect(c,23,14,2,1,'#343343');rect(c,24,21,1,4,P.ink);
  oval(c,4,22,22,8,P.ink);oval(c,5,25,19,4,P.red);
  poly(c,[[6,22],[10,23],[8,27]],P.white);poly(c,[[14,23],[17,23],[15,27]],P.white);poly(c,[[21,23],[24,22],[22,26]],P.white);
  limb(c,[-9,22],[-3,20],1,P.shade);limb(c,[-3,20],[3,21],1,P.shade);
  limb(c,[-8,25],[-3,24],1,P.shade);limb(c,[-3,24],[1,25],1,P.shade);
  poly(c,[[-15,28],[-10,29],[-14,32]],P.sun);rect(c,-3,29,6,1,P.sun);
  if(hurt){limb(c,[-15,7],[-4,9],2,P.ink);limb(c,[5,9],[17,11],2,P.ink);}
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
  // Indigo torso with a short black side-buttoned vest, as in the reference.
  poly(c,[[left,top],[left+24,top+2],[hip[0]+15,hip[1]+2],[hip[0]-13,hip[1]+3]],P.ink);
  poly(c,[[left+2,top+2],[left+20,top+4],[hip[0]+12,hip[1]],[hip[0]-10,hip[1]+1]],P.yellow);
  poly(c,[[left+3,top+6],[left+8,top+5],[hip[0]-3,hip[1]-1],[hip[0]-10,hip[1]]],P.sun);
  poly(c,[[left+18,top+2],[left+24,top+5],[hip[0]+15,hip[1]+2],[hip[0]+5,hip[1]+3]],P.coat);
  poly(c,[[left+20,top+5],[left+23,top+6],[hip[0]+13,hip[1]],[hip[0]+10,hip[1]+1]],P.coatLight);
  oval(c,left+16,top+13,5,6,P.ink);oval(c,left+17,top+14,3,4,P.white);
  oval(c,hip[0]+7,hip[1]-4,4,5,P.ink);oval(c,hip[0]+8,hip[1]-3,2,3,P.white);
  // A thick golden collar is the only bright costume accent.
  poly(c,[[headAt[0]-16,headAt[1]+29],[headAt[0]+18,headAt[1]+29],[headAt[0]+15,headAt[1]+37],[headAt[0]-9,headAt[1]+38],[headAt[0]-18,headAt[1]+33]],P.ink);
  poly(c,[[headAt[0]-14,headAt[1]+30],[headAt[0]+16,headAt[1]+30],[headAt[0]+13,headAt[1]+35],[headAt[0]-8,headAt[1]+36],[headAt[0]-16,headAt[1]+33]],P.gold);
  limb(c,[headAt[0]-8,headAt[1]+35],[headAt[0]+10,headAt[1]+35],1,P.goldShade);
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
  return ['idle',Math.floor(frame/13)%4];
}
/** Draw in world coordinates. Atlas origin is the character's grounded feet. */
export function drawMox(c:CanvasRenderingContext2D,f:Fighter,frame:number,ghost=false){
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
export function drawMoxPortrait(c:CanvasRenderingContext2D,width:number,height:number){
  let portrait=cache.get('portrait');
  if(!portrait){portrait=document.createElement('canvas');portrait.width=96;portrait.height=96;const p=portrait.getContext('2d')!;
    poly(p,[[10,96],[17,78],[29,66],[64,65],[78,76],[87,96]],P.ink);
    poly(p,[[14,96],[20,80],[31,69],[62,68],[74,79],[82,96]],P.yellow);
    poly(p,[[25,78],[35,74],[38,96],[18,96]],P.sun);
    poly(p,[[66,69],[76,78],[86,96],[60,96]],P.coat);
    poly(p,[[72,79],[77,82],[82,96],[76,96]],P.coatLight);
    oval(p,61,79,8,10,P.ink);oval(p,63,81,5,7,P.white);oval(p,66,93,6,7,P.white);
    p.save();p.translate(45,21);p.scale(1.55,1.55);head(p,0,0,false);p.restore();
    poly(p,[[20,68],[39,76],[68,73],[78,66],[76,76],[62,84],[35,85],[17,77]],P.ink);
    poly(p,[[21,70],[39,78],[68,75],[76,69],[73,75],[61,81],[36,82],[20,76]],P.gold);
    cache.set('portrait',portrait);
  }
  c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,width,height);const size=Math.min(width,height);c.drawImage(portrait,Math.floor((width-size)/2),Math.floor((height-size)/2),size,size);c.restore();
}
/** Optional sprite-contact-sheet output for visual inspection/export. */
export function drawMoxSheet(c:CanvasRenderingContext2D):{width:number;height:number}{
  const poses=Object.keys(MOX_ANIMATIONS) as Pose[],columns=6;
  for(let row=0;row<poses.length;row++){const pose=poses[row];for(let i=0;i<MOX_ANIMATIONS[pose];i++)c.drawImage(sprite(pose,i),i*192,row*120);}
  return {width:columns*192,height:poses.length*120};
}
