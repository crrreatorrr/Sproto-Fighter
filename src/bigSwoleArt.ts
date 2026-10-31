import { A, FLOOR, getMove, type Fighter, type MoveId } from './core';

/** Authored pixel sprites. Every silhouette is rasterized on an integer grid,
 * then cached and enlarged without smoothing. The reference is not embedded. */
const P = { ink:'#191520', yellow:'#1167db', sun:'#5196ef', shade:'#0b43a3',
  green:'#708e32', greenLight:'#a3b842', greenDark:'#425c29', white:'#fffefa',
  red:'#eb202d', redLight:'#ff6252', redDark:'#9b192b', coat:'#1049ad',
  coatLight:'#4489ed', shoe:'#163d8a', gold:'#ffeb32', goldShade:'#c2a924' };
type Point = [number,number];
type Pose = 'idle'|'walk'|'jump'|'fall'|'crouch'|'dash'|'hit'|'block'|MoveId;
export const BIG_SWOLE_ANIMATIONS = {
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
  limb(c,shoulder,elbow,16,P.ink);limb(c,elbow,hand,13,P.ink);
  limb(c,shoulder,elbow,13,back?P.shade:P.yellow);limb(c,elbow,hand,10,back?P.shade:P.yellow);
  oval(c,shoulder[0]-8,shoulder[1]-8,16,15,back?P.shade:P.yellow);
  if(!back){limb(c,[shoulder[0]-2,shoulder[1]-5],[elbow[0]-2,elbow[1]-3],3,P.sun);}
  // Red wrist wraps separate bare yellow forearms from oversized fists.
  rect(c,hand[0]-7,hand[1]-6,7,12,P.redDark);rect(c,hand[0]-6,hand[1]-5,5,10,P.red);
  oval(c,hand[0]-4,hand[1]-7,14,14,P.ink);oval(c,hand[0]-3,hand[1]-6,12,12,back?P.shade:P.yellow);
  rect(c,hand[0]+2,hand[1]-5,5,2,P.sun);rect(c,hand[0]+1,hand[1]+3,6,1,P.shade);
}
function leg(c:CanvasRenderingContext2D,hip:Point,knee:Point,foot:Point,back=false){
  limb(c,hip,knee,15,P.ink);limb(c,knee,foot,12,P.ink);
  limb(c,hip,knee,12,back?P.shade:P.yellow);limb(c,knee,foot,9,back?P.shade:P.yellow);
  if(!back)limb(c,[hip[0]-2,hip[1]],[knee[0]-2,knee[1]-1],3,P.sun);
  rect(c,foot[0]-7,foot[1]-4,18,7,P.ink);rect(c,foot[0]-6,foot[1]-3,16,5,P.shoe);rect(c,foot[0]-4,foot[1]-3,12,2,P.coatLight);
}
function head(c:CanvasRenderingContext2D,cx:number,cy:number,blink:boolean,hurt=false){
  c.save();c.translate(Math.round(cx),Math.round(cy));
  // Swept-back cobalt spikes, cheerful white eyes and a conspicuous red round nose.
  poly(c,[[-23,-2],[-14,-10],[-3,-13],[-6,-17],[8,-14],[18,-9],[23,-1],[28,8],[26,22],[19,30],[5,34],[-10,32],[-18,26],[-22,16],[-31,25],[-28,11],[-20,4],[-33,9],[-29,0]],P.ink);
  poly(c,[[-22,-2],[-13,-8],[-1,-11],[-3,-14],[7,-12],[16,-7],[21,0],[25,8],[23,21],[17,28],[5,31],[-9,30],[-16,24],[-20,13],[-28,22],[-25,12],[-17,2],[-29,6],[-26,1]],P.yellow);
  poly(c,[[-14,-6],[-3,-10],[6,-10],[13,-6],[2,-8],[-8,-6]],P.sun);
  oval(c,-12,0,22,22,P.ink);oval(c,-10,2,19,18,P.white);
  oval(c,10,0,21,22,P.ink);oval(c,12,2,17,18,P.white);
  if(!blink){oval(c,-2,5,7,10,P.ink);oval(c,19,5,7,10,P.ink);rect(c,0,6,2,2,'#ffffff');rect(c,21,6,2,2,'#ffffff');}
  else{limb(c,[-8,11],[6,11],2,P.ink);limb(c,[14,11],[27,11],2,P.ink);}
  limb(c,[-12,-1],[-7,-5],1,P.ink);limb(c,[-7,-5],[1,-6],1,P.ink);limb(c,[1,-6],[7,-2],1,P.ink);
  limb(c,[13,-3],[20,-5],1,P.ink);limb(c,[20,-5],[27,-2],1,P.ink);
  limb(c,[-18,6],[-12,5],1,P.shade);limb(c,[-18,8],[-12,8],1,P.shade);
  oval(c,-13,21,40,11,P.ink);oval(c,-11,22,36,8,P.red);
  limb(c,[-9,24],[0,27],1,P.redDark);limb(c,[0,27],[15,28],1,P.redDark);limb(c,[15,28],[23,26],1,P.redDark);
  rect(c,-8,22,7,1,P.redLight);
  oval(c,4,12,17,16,P.ink);oval(c,6,13,13,13,P.red);rect(c,9,14,4,2,P.redLight);
  // Large yellow crescent earring, attached behind the left jaw.
  oval(c,-25,15,5,7,P.ink);oval(c,-24,16,3,5,P.red);
  poly(c,[[-25,20],[-19,23],[-24,31],[-34,36],[-36,32],[-33,24],[-30,23],[-31,29],[-27,27]],P.ink);
  poly(c,[[-25,22],[-22,24],[-26,29],[-33,33],[-34,31],[-32,26],[-32,30],[-28,29]],P.gold);
  if(hurt){limb(c,[-8,6],[5,9],2,P.ink);limb(c,[14,9],[27,6],2,P.ink);}
  c.restore();
}
function drawPose(c:CanvasRenderingContext2D,pose:Pose,frame:number){
  let hip:Point=[0,-24],headAt:Point=[0,-70],ls:Point=[-20,-43],rs:Point=[20,-42];
  let rearElbow:Point=[-30,-32],rearHand:Point=[-26,-23],elbow:Point=[32,-32],hand:Point=[34,-43];
  let knee1:Point=[-12,-13],foot1:Point=[-15,-2],knee2:Point=[10,-13],foot2:Point=[15,-2];
  const active=frame===1, recovering=frame===2;
  const isCrouch=pose==='crouch'||pose==='low'||pose==='sweep';
  const bodyBob=pose==='idle'?[0,1,0,-1][frame%4]:pose==='walk'?[0,-2,-1,0,-2,-1][frame%6]:0;
  if(isCrouch){hip=[0,-17];headAt=[0,-51];ls=[-19,-29];rs=[20,-28];rearElbow=[-18,-23];rearHand=[-11,-18];elbow=[23,-24];hand=[25,-32];knee1=[-17,-10];foot1=[-20,-2];knee2=[17,-9];foot2=[22,-2];}
  if(pose==='walk'){
    const strides=[-12,-6,5,12,6,-5],stride=strides[frame%6];
    knee1=[-5+stride*.5,-15];foot1=[-8+stride,-2];knee2=[6-stride*.5,-14];foot2=[11-stride,frame===1||frame===4?-7:-2];
    rearHand=[-15-stride*.4,-31];hand=[22+stride*.3,-42];
  }
  if(pose==='jump'||pose==='fall'||pose.startsWith('air')){knee1=[-14,-16];foot1=[-22,-12];knee2=[15,-18];foot2=[23,-7];rearHand=[-20,-47];elbow=[21,-49];hand=[18,-59];if(pose==='fall'){foot1=[-13,-6-frame*2];foot2=[16,-2];headAt[1]+=frame;}}
  if(pose==='dash'){hip=[-5,-23];headAt=[14,-65];ls=[-8,-42];rs=[26,-40];rearElbow=[-25,-34];rearHand=[-32,-28];elbow=[-1,-30];hand=[-11,-24];knee1=[-21,-13];foot1=[-30,-2];knee2=[18,-17];foot2=[28,-3];}
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
  const top=isCrouch?-40:pose==='dash'?-53:-55, center=pose==='dash'?5:0;
  // Broad bare chest, deltoids, pec separation and abdominal planes.
  poly(c,[[center-21,top],[center+21,top],[center+27,top+10],[hip[0]+16,hip[1]+3],[hip[0]-16,hip[1]+3],[center-27,top+10]],P.ink);
  poly(c,[[center-19,top+2],[center+19,top+2],[center+23,top+10],[hip[0]+13,hip[1]+1],[hip[0]-13,hip[1]+1],[center-23,top+10]],P.yellow);
  poly(c,[[center-20,top+8],[center-12,top+5],[center-2,top+8],[center-2,top+15],[center-15,top+16]],P.sun);
  poly(c,[[center+2,top+8],[center+12,top+5],[center+20,top+9],[center+15,top+16],[center+2,top+15]],P.sun);
  limb(c,[center,top+8],[center,top+18],1,P.shade);
  limb(c,[center-17,top+17],[center-3,top+18],1,P.shade);limb(c,[center+3,top+18],[center+17,top+17],1,P.shade);
  rect(c,hip[0]-7,hip[1]-7,6,3,P.sun);rect(c,hip[0]+2,hip[1]-7,6,3,P.sun);
  // Cobalt wrestling trunks and a red belt echo the supplied red/blue palette.
  poly(c,[[hip[0]-15,hip[1]-2],[hip[0]+16,hip[1]-2],[hip[0]+13,hip[1]+8],[hip[0]+3,hip[1]+9],[hip[0],hip[1]+4],[hip[0]-4,hip[1]+9],[hip[0]-14,hip[1]+7]],P.ink);
  poly(c,[[hip[0]-13,hip[1]],[hip[0]+14,hip[1]],[hip[0]+11,hip[1]+6],[hip[0]+4,hip[1]+7],[hip[0],hip[1]+2],[hip[0]-5,hip[1]+7],[hip[0]-12,hip[1]+5]],P.coat);
  rect(c,hip[0]-13,hip[1]-2,27,3,P.red);rect(c,hip[0]-2,hip[1]-2,5,3,P.yellow);
  // Broad red neck ring from the reference, over the blue muscular torso.
  poly(c,[[headAt[0]-15,headAt[1]+28],[headAt[0]+17,headAt[1]+28],[headAt[0]+23,headAt[1]+37],[headAt[0]+17,headAt[1]+44],[headAt[0]-4,headAt[1]+46],[headAt[0]-22,headAt[1]+39],[headAt[0]-23,headAt[1]+33]],P.ink);
  poly(c,[[headAt[0]-14,headAt[1]+30],[headAt[0]+16,headAt[1]+30],[headAt[0]+20,headAt[1]+37],[headAt[0]+15,headAt[1]+41],[headAt[0]-3,headAt[1]+43],[headAt[0]-19,headAt[1]+38],[headAt[0]-20,headAt[1]+34]],P.red);
  limb(c,[headAt[0]-13,headAt[1]+37],[headAt[0]-2,headAt[1]+40],1,P.redLight);
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
export function drawBigSwole(c:CanvasRenderingContext2D,f:Fighter,frame:number,ghost=false){
  const [pose,index]=animation(f,frame),atlas=sprite(pose,index),scale=1.8;
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
export function drawBigSwolePortrait(c:CanvasRenderingContext2D,width:number,height:number){
  let portrait=cache.get('portrait');
  if(!portrait){portrait=document.createElement('canvas');portrait.width=96;portrait.height=96;const p=portrait.getContext('2d')!;
    poly(p,[[1,96],[4,78],[18,65],[32,62],[64,62],[80,66],[92,78],[96,96]],P.ink);
    poly(p,[[4,96],[7,80],[20,68],[34,65],[62,65],[78,69],[89,81],[93,96]],P.yellow);
    oval(p,6,74,24,22,P.shade);oval(p,8,74,21,18,P.yellow);oval(p,68,74,24,22,P.shade);oval(p,69,74,20,18,P.yellow);
    poly(p,[[27,76],[43,74],[46,79],[45,89],[26,88],[22,82]],P.sun);
    poly(p,[[50,79],[55,74],[70,77],[74,83],[69,89],[51,89]],P.sun);
    limb(p,[48,78],[48,94],2,P.shade);limb(p,[28,91],[44,92],1,P.shade);limb(p,[52,92],[68,91],1,P.shade);
    p.save();p.translate(49,21);p.scale(1.4,1.4);head(p,0,0,false);p.restore();
    poly(p,[[25,66],[66,66],[77,73],[76,81],[63,88],[38,88],[20,79],[18,72]],P.ink);
    poly(p,[[27,68],[64,68],[73,74],[73,79],[61,85],[39,85],[23,78],[22,73]],P.red);
    limb(p,[29,77],[42,82],2,P.redLight);
    cache.set('portrait',portrait);
  }
  c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,width,height);const size=Math.min(width,height);c.drawImage(portrait,Math.floor((width-size)/2),Math.floor((height-size)/2),size,size);c.restore();
}
/** Optional sprite-contact-sheet output for visual inspection/export. */
export function drawBigSwoleSheet(c:CanvasRenderingContext2D):{width:number;height:number}{
  const poses=Object.keys(BIG_SWOLE_ANIMATIONS) as Pose[],columns=6;
  for(let row=0;row<poses.length;row++){const pose=poses[row];for(let i=0;i<BIG_SWOLE_ANIMATIONS[pose];i++)c.drawImage(sprite(pose,i),i*192,row*120);}
  return {width:columns*192,height:poses.length*120};
}
