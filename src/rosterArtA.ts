import { A, FLOOR, getMove, type Fighter, type MoveId } from './core';


export type RosterAId='guest07'|'guest08'|'guest09';
function makeArt(id:RosterAId){
/** Authored pixel sprites. Every silhouette is rasterized on an integer grid,
 * then cached and enlarged without smoothing. The reference is not embedded. */
const P = id==='guest07' ? {ink:'#151523',yellow:'#2063cf',sun:'#4e8beb',shade:'#104694',white:'#fffce4',red:'#dc1b24',redLight:'#fa4939',redDark:'#8a1827',coat:'#2063cf',coatLight:'#4e8beb',shoe:'#134894',gold:'#ffdf30',goldShade:'#be9519'} : id==='guest08' ? {ink:'#171722',yellow:'#ffe62d',sun:'#fff78c',shade:'#ccaa16',white:'#fffdf0',red:'#c51e2c',redLight:'#ee493d',redDark:'#81182b',coat:'#c51e2c',coatLight:'#ec453e',shoe:'#bb202d',gold:'#ffe62d',goldShade:'#ccaa16'} : {ink:'#16151f',yellow:'#e52b2f',sun:'#ff5850',shade:'#9c1829',white:'#fffdeb',red:'#df2529',redLight:'#fb5147',redDark:'#8c1427',coat:'#13151e',coatLight:'#343745',shoe:'#222332',gold:'#ffe842',goldShade:'#c9ae23'};
type Point = [number,number];
type Pose = 'idle'|'walk'|'jump'|'fall'|'crouch'|'dash'|'hit'|'block'|MoveId;
const ANIMATIONS = {
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
  limb(c,hip,knee,7,back?P.coat:P.coatLight);limb(c,knee,foot,5,back?P.coat:P.coatLight);
  rect(c,foot[0]-5,foot[1]-2,14,5,P.ink);rect(c,foot[0]-4,foot[1]-2,11,3,P.shoe);rect(c,foot[0]+1,foot[1]-2,6,1,P.coatLight);
}
function head(c:CanvasRenderingContext2D,cx:number,cy:number,blink:boolean,hurt=false){
  c.save();c.translate(Math.round(cx),Math.round(cy));
  if(id==='guest07'){
    // Juicy: swept-back blue spikes, wrinkles and an oversized red pout.
    poly(c,[[-25,-5],[-14,-12],[3,-14],[17,-10],[24,-3],[26,11],[23,23],[13,33],[-5,36],[-17,30],[-22,19],[-30,24],[-24,8],[-32,11],[-22,-2]],P.ink);
    poly(c,[[-23,-5],[-13,-10],[3,-12],[16,-8],[22,-2],[24,11],[21,22],[12,31],[-5,34],[-15,28],[-20,16],[-27,21],[-21,5],[-28,8],[-19,-3]],P.yellow);
    for(let row=0;row<4;row++){limb(c,[-15+row,-7+row*4],[-7,-9+row*4],1,P.shade);limb(c,[-7,-9+row*4],[8,-8+row*4],1,P.shade);limb(c,[8,-8+row*4],[18,-4+row*4],1,P.shade);}
    oval(c,-15,3,22,18,P.ink);oval(c,-13,5,19,14,P.gold);oval(c,7,5,18,18,P.ink);oval(c,9,7,14,14,P.gold);
    if(!blink){oval(c,-5,5,8,12,P.ink);oval(c,13,8,7,11,P.ink);rect(c,-3,6,2,3,'#ffffff');rect(c,15,9,2,2,'#ffffff');}else{limb(c,[-11,12],[3,12],2,P.ink);limb(c,[11,14],[21,14],2,P.ink);}
    poly(c,[[1,16],[10,13],[16,16],[21,17],[27,22],[24,30],[11,35],[-9,34],[-18,29],[-11,23]],P.ink);
    poly(c,[[2,18],[10,15],[15,18],[20,19],[25,23],[22,29],[10,33],[-8,32],[-15,28],[-9,25]],P.red);
    limb(c,[-13,28],[8,28],1,P.redDark);limb(c,[8,28],[23,25],1,P.redDark);limb(c,[1,22],[11,24],1,P.redDark);limb(c,[11,24],[22,23],1,P.redDark);
    limb(c,[-17,20],[-12,21],1,P.shade);limb(c,[-17,23],[-14,23],1,P.shade);rect(c,3,18,4,1,P.redLight);
  }else{
    const spikes:Point[]=id==='guest08'?[[-25,-9],[-11,-10],[-16,-15],[0,-12],[13,-7],[21,1],[24,10],[21,20],[29,31],[17,29],[7,34],[-10,33],[-24,39],[-21,24],[-31,30],[-24,11],[-32,13],[-24,0],[-32,-1]]:[[-29,-3],[-19,-7],[-26,-12],[-12,-10],[-15,-18],[-4,-11],[1,-20],[6,-11],[18,-17],[15,-8],[28,-10],[21,-2],[32,1],[23,7],[31,15],[22,16],[25,27],[15,26],[9,33],[-9,33],[-18,28],[-28,27],[-23,19],[-31,17],[-23,10],[-33,8],[-22,2]];
    poly(c,spikes,P.ink);poly(c,spikes.map(([x,y])=>[x*.9,y*.9] as Point),P.yellow);
    oval(c,-21,0,25,25,P.ink);oval(c,-19,2,22,21,P.gold);oval(c,3,2,23,23,P.ink);oval(c,5,4,20,19,P.gold);
    if(!blink){oval(c,-10,5,10,15,P.ink);oval(c,9,6,10,14,P.ink);rect(c,-7,7,3,3,'#ffffff');rect(c,12,8,3,3,'#ffffff');}else{limb(c,[-16,13],[0,13],2,P.ink);limb(c,[8,14],[21,14],2,P.ink);}
    limb(c,[-20,1],[-11,-4],1,P.ink);limb(c,[-11,-4],[1,1],1,P.ink);limb(c,[5,0],[13,-3],1,P.ink);limb(c,[13,-3],[24,3],1,P.ink);
    if(id==='guest08'){
      // Yoyo: broad red muzzle, uneven buck teeth and small red nose.
      oval(c,-24,18,53,20,P.ink);oval(c,-22,19,49,17,P.red);
      oval(c,-17,23,40,10,P.ink);oval(c,-16,24,38,8,P.redDark);
      poly(c,[[-13,24],[-7,25],[-8,30],[-11,31],[-13,29]],P.white);poly(c,[[3,25],[9,25],[8,32],[5,33],[3,30]],P.white);poly(c,[[14,24],[20,23],[19,29],[16,30]],P.white);
      limb(c,[-18,23],[-7,25],1,P.gold);limb(c,[-7,25],[9,25],1,P.gold);limb(c,[9,25],[23,21],1,P.gold);
      poly(c,[[0,19],[5,16],[10,20],[8,23],[3,23]],P.ink);poly(c,[[2,19],[5,18],[8,20],[7,22],[4,22]],P.red);
    }else{
      // Red Kev: wide black grin edged in yellow, with a full row of rounded teeth.
      oval(c,-24,18,52,20,P.ink);oval(c,-22,19,48,17,P.red);
      oval(c,-19,21,42,13,P.gold);oval(c,-17,22,38,10,P.ink);
      for(let i=0;i<8;i++)oval(c,-15+i*4,26+(i<2||i>5?-1:1),4,4,P.white);
      oval(c,-16,23,5,4,P.white);oval(c,15,23,5,4,P.white);
      poly(c,[[0,18],[7,19],[4,22],[1,21]],P.ink);
    }
  }
  if(hurt){limb(c,[-14,8],[-3,11],2,P.ink);limb(c,[8,10],[20,7],2,P.ink);}
  c.restore();
}
function printDigits(c:CanvasRenderingContext2D,x:number,y:number){
 const digits=['111','001','111','100','111','000','111','001','111','001','111'];
 for(let d=0;d<3;d++){const rows=d===0?digits.slice(0,5):digits.slice(6);rows.forEach((r,j)=>[...r].forEach((v,i)=>{if(v==='1')rect(c,x+d*5+i,y+j,1,1,P.gold);}));}
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
  poly(c,[[left,top],[left+24,top+2],[hip[0]+16,hip[1]+3],[hip[0]-15,hip[1]+3]],P.ink);
  poly(c,[[left+2,top+2],[left+21,top+4],[hip[0]+13,hip[1]+1],[hip[0]-12,hip[1]+1]],P.coat);
  poly(c,[[left+2,top+5],[left+7,top+4],[hip[0]-5,hip[1]],[hip[0]-12,hip[1]]],P.coatLight);
  if(id==='guest07'){
    // Unclothed blue neck/body visible in the reference, with small wrinkle accents.
    limb(c,[-10,hip[1]-10],[-5,hip[1]-8],1,P.shade);limb(c,[-3,hip[1]-5],[6,hip[1]-6],1,P.shade);
    limb(c,[-7,hip[1]+1],[4,hip[1]+1],1,P.shade);
  }else{
    const collar=id==='guest08'?P.white:P.gold,shade=id==='guest08'?'#c7cfdb':P.goldShade;
    poly(c,[[headAt[0]-18,headAt[1]+31],[headAt[0]+22,headAt[1]+31],[headAt[0]+19,headAt[1]+42],[headAt[0]+3,headAt[1]+46],[headAt[0]-16,headAt[1]+42],[headAt[0]-21,headAt[1]+36]],P.ink);
    poly(c,[[headAt[0]-17,headAt[1]+33],[headAt[0]+20,headAt[1]+33],[headAt[0]+17,headAt[1]+40],[headAt[0]+3,headAt[1]+43],[headAt[0]-14,headAt[1]+40],[headAt[0]-18,headAt[1]+36]],collar);
    limb(c,[headAt[0]-12,headAt[1]+40],[headAt[0]+10,headAt[1]+41],1,shade);
    if(id==='guest09'){printDigits(c,hip[0]-7,hip[1]-2);rect(c,left+1,top+12,4,3,P.gold);rect(c,left+20,top+12,3,4,P.gold);}
  }
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
function draw(c:CanvasRenderingContext2D,f:Fighter,frame:number,ghost=false){
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
function drawPortrait(c:CanvasRenderingContext2D,width:number,height:number){
  let portrait=cache.get('portrait');
  if(!portrait){portrait=document.createElement('canvas');portrait.width=96;portrait.height=96;const p=portrait.getContext('2d')!;
    poly(p,[[6,96],[11,78],[24,66],[65,64],[82,75],[91,96]],P.ink);
    poly(p,[[9,96],[14,80],[26,69],[64,67],[79,77],[88,96]],P.coat);
    poly(p,[[12,91],[21,76],[29,73],[25,96],[10,96]],P.coatLight);
    p.save();p.translate(46,24);p.scale(1.45,1.45);head(p,0,0,false);p.restore();
    if(id==='guest07'){limb(p,[29,80],[39,83],1,P.shade);limb(p,[35,88],[52,89],1,P.shade);limb(p,[57,83],[66,80],1,P.shade);}
    else{
      const scarf=id==='guest08'?P.white:P.gold,shade=id==='guest08'?'#c7cfdb':P.goldShade;
      poly(p,[[16,70],[35,79],[65,78],[81,69],[78,81],[61,89],[35,89],[16,81]],P.ink);
      poly(p,[[19,73],[35,81],[65,80],[78,73],[75,80],[60,86],[35,86],[19,80]],scarf);
      limb(p,[31,85],[64,85],1,shade);
      if(id==='guest09'){p.save();p.translate(34,90);p.scale(2,1);printDigits(p,0,0);p.restore();rect(p,17,87,7,4,P.gold);rect(p,75,85,5,6,P.gold);}
    }
    cache.set('portrait',portrait);
  }
  c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,width,height);const size=Math.min(width,height);c.drawImage(portrait,Math.floor((width-size)/2),Math.floor((height-size)/2),size,size);c.restore();
}
/** Optional sprite-contact-sheet output for visual inspection/export. */
function sheet(c:CanvasRenderingContext2D):{width:number;height:number}{
  const poses=Object.keys(ANIMATIONS) as Pose[],columns=6;
  for(let row=0;row<poses.length;row++){const pose=poses[row];for(let i=0;i<ANIMATIONS[pose];i++)c.drawImage(sprite(pose,i),i*192,row*120);}
  return {width:columns*192,height:poses.length*120};
}

return {draw,portrait:drawPortrait,sheet};
}
const art={guest07:makeArt('guest07'),guest08:makeArt('guest08'),guest09:makeArt('guest09')};
export function drawRosterA(c:CanvasRenderingContext2D,f:Fighter,frame:number,ghost=false){art[f.id as RosterAId].draw(c,f,frame,ghost);}
export function drawRosterAPortrait(c:CanvasRenderingContext2D,id:RosterAId,w:number,h:number){art[id].portrait(c,w,h);}
export function drawRosterASheet(c:CanvasRenderingContext2D,id:RosterAId){return art[id].sheet(c);}
