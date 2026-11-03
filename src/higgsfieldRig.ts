/** Resolve public art under the build's HTML base; Node/diagnostic fixtures use root paths. */
const asset=(path:string)=>{
 const base=typeof document==='undefined'?'/':(document.querySelector?.('meta[name="sproto-asset-base"]') as HTMLMetaElement|null)?.content||'/';
 return base+path.replace(/^\/+/, '');
};
import { HIGGSFIELD_REVISION } from './higgsfieldRevision';
import { A, FLOOR, getMove, COMBAT_STYLES, type Fighter } from './core';

/** Source-derived cutout rigs. The head is kept intact; every limb has its own
 * upper/lower/terminal image and parented pivots. Rendering never mutates combat. */
type Vec = [number, number];
interface Part { url: string; rect: number[]; pivot: Vec; bindPivot: Vec; end: Vec|null; bindAngle: number; image?: HTMLImageElement }
interface Rig { colors:{arm:string;leg:string;hand:string}; neckColor?:string; ground: number; root: Vec; neck: Vec; shoulders: [Vec,Vec]; elbows: [Vec,Vec]; wrists: [Vec,Vec]; hips: [Vec,Vec]; knees: [Vec,Vec]; ankles: [Vec,Vec]; parts: Record<string,Part> }
interface RigFile { version:number; fighters: Record<string,Rig> }
interface Pose { root:Vec; bodyAngle:number; lean:number; headTilt:number; hands:[Vec,Vec]; feet:[Vec,Vec]; footAngles:[number,number]; handAngles:[number,number]; air:boolean; reach:number; kick:number; rearFront:boolean }
const rigs = new Map<string,Rig>();
let loading:Promise<void>|null=null;
const SCALE=1.35;
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(x:number)=>{x=clamp(x);return x*x*(3-2*x);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const mix=(a:Vec,b:Vec,t:number):Vec=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
const add=(a:Vec,b:Vec):Vec=>[a[0]+b[0],a[1]+b[1]];
const sub=(a:Vec,b:Vec):Vec=>[a[0]-b[0],a[1]-b[1]];
const length=(a:Vec)=>Math.hypot(a[0],a[1]);
const rotate=(a:Vec,r:number):Vec=>[a[0]*Math.cos(r)-a[1]*Math.sin(r),a[0]*Math.sin(r)+a[1]*Math.cos(r)];
const mod=(n:number,m:number)=>(n%m+m)%m;

/** Call once at startup; rejection identifies an asset that failed to load. */
export function loadHiggsfieldRigs():Promise<void>{
  if(loading)return loading;
  loading=(async()=>{
    const response=await fetch(asset('/fighters/rig-data.json?v=')+HIGGSFIELD_REVISION,{cache:'no-store'});
    if(!response.ok)throw new Error(`Rig metadata: HTTP ${response.status}`);
    const data:RigFile=await response.json();
    await Promise.all(Object.entries(data.fighters).map(async([id,rig])=>{
      await Promise.all(Object.values(rig.parts).map(part=>new Promise<void>((resolve,reject)=>{
        const image=new Image();image.onload=()=>{part.image=image;resolve();};
        image.onerror=()=>reject(new Error(`Rig asset failed: ${part.url}`));image.src=asset(part.url)+'?v='+HIGGSFIELD_REVISION;
      })));
      rigs.set(id,rig);
    }));
  })();
  loading.catch(()=>{loading=null;});return loading;
}
export const isHiggsfieldRigReady=(id:string)=>rigs.has(id);
export const loadedHiggsfieldRigIds=()=>Array.from(rigs.keys());

/** Two-bone inverse kinematics clamps unreachable goals without separating joints. */
function chain(start:Vec,goal:Vec,l1:number,l2:number,bend:number):[Vec,Vec,Vec]{
  const delta=sub(goal,start),distance=length(delta),d=clamp(distance,.001,l1+l2-.02);
  const direction=Math.atan2(delta[1],delta[0]);
  const angle=direction+bend*Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));
  const middle:Vec=[start[0]+Math.cos(angle)*l1,start[1]+Math.sin(angle)*l1];
  const end:Vec=[start[0]+Math.cos(direction)*d,start[1]+Math.sin(direction)*d];
  return [start,middle,end];
}
function sourceLength(r:Rig,name:string){const p=r.parts[name];return p.end?length(sub(p.end,p.bindPivot)):0;}
function armLength(r:Rig,name:string){
  const side=name.startsWith('back')?'back':'front';
  const upper=sourceLength(r,side+'UpperArm'),lower=sourceLength(r,side+'Forearm');
  // The input is a foreshortened three-quarter guard, not anatomical bone lengths.
  // Restore a stable upper/lower ratio rather than letting a tiny painted wrist
  // constrain every punch. These lengths remain constant throughout animation.
  const total=Math.max(upper+lower,sourceLength(r,'torso')*1.12);
  return total*(name.endsWith('UpperArm')?.52:.48);
}
// Authored choreography: gameplay owns damage/projectiles; these profiles only
// describe attached limb targets. Each entry has a distinct guard and movement.
interface Choreography { guard:[Vec,Vec]; lean:number; lift:number; stride:number; strike:'jab'|'hook'|'palm'|'hammer'|'elbow'|'claw'; kick:'side'|'round'|'knee'|'stomp'|'heel'; cast:'palm'|'twoHand'|'overhead'|'underhand'|'cross'; rear:boolean }
const choreography:Record<string,Choreography>={
  rivet:{guard:[[-8,-25],[18,-29]],lean:.04,lift:8,stride:1,strike:'jab',kick:'side',cast:'palm',rear:false},
  vela:{guard:[[-13,-8],[23,-17]],lean:-.04,lift:6,stride:.91,strike:'palm',kick:'heel',cast:'twoHand',rear:false},
  bront:{guard:[[-18,-15],[22,-14]],lean:.09,lift:5,stride:.85,strike:'hammer',kick:'stomp',cast:'underhand',rear:false},
  zephyr:{guard:[[-17,-20],[17,-34]],lean:.01,lift:14,stride:1.06,strike:'claw',kick:'round',cast:'overhead',rear:true},
  mox:{guard:[[-5,-31],[26,-24]],lean:.07,lift:7,stride:1.08,strike:'jab',kick:'knee',cast:'palm',rear:true},
  rune:{guard:[[5,-20],[16,-19]],lean:-.06,lift:5,stride:.83,strike:'elbow',kick:'heel',cast:'cross',rear:false},
  guest07:{guard:[[-20,-10],[16,-24]],lean:.1,lift:12,stride:1.03,strike:'hook',kick:'knee',cast:'underhand',rear:false},
  guest08:{guard:[[-16,-24],[23,-12]],lean:-.03,lift:10,stride:.96,strike:'hook',kick:'round',cast:'cross',rear:true},
  guest09:{guard:[[-5,-30],[19,-31]],lean:.12,lift:8,stride:1.1,strike:'jab',kick:'side',cast:'cross',rear:true},
  guest10:{guard:[[-19,-17],[13,-32]],lean:-.08,lift:11,stride:.88,strike:'hammer',kick:'heel',cast:'overhead',rear:false},
  guest11:{guard:[[0,-23],[16,-23]],lean:-.07,lift:5,stride:.86,strike:'palm',kick:'knee',cast:'twoHand',rear:true},
  guest12:{guard:[[-10,-18],[25,-31]],lean:.02,lift:7,stride:1.02,strike:'palm',kick:'side',cast:'palm',rear:false},
  guest13:{guard:[[-17,-8],[20,-33]],lean:.05,lift:9,stride:.9,strike:'claw',kick:'round',cast:'underhand',rear:true},
  guest14:{guard:[[-23,-20],[26,-20]],lean:-.01,lift:13,stride:1.12,strike:'elbow',kick:'heel',cast:'palm',rear:false},
  dumpstar:{guard:[[-23,-9],[24,-9]],lean:.14,lift:6,stride:.84,strike:'hammer',kick:'stomp',cast:'underhand',rear:true},
  crapto:{guard:[[-12,-30],[13,-35]],lean:.11,lift:9,stride:.94,strike:'claw',kick:'stomp',cast:'cross',rear:false},
  vamp:{guard:[[-13,-4],[19,-7]],lean:-.1,lift:4,stride:.8,strike:'palm',kick:'heel',cast:'twoHand',rear:true},
  alpha777:{guard:[[-14,-28],[23,-26]],lean:.08,lift:10,stride:1.09,strike:'jab',kick:'round',cast:'cross',rear:false},
  mandela:{guard:[[-21,-17],[24,-27]],lean:.03,lift:6,stride:.93,strike:'hook',kick:'side',cast:'twoHand',rear:true},
  bigswole:{guard:[[-21,-24],[23,-24]],lean:.06,lift:5,stride:.82,strike:'hammer',kick:'stomp',cast:'overhead',rear:false},
  nate:{guard:[[-11,-15],[16,-20]],lean:.16,lift:15,stride:1.04,strike:'elbow',kick:'knee',cast:'underhand',rear:true},
};
const styleOf=(f:Fighter)=>choreography[f.id]??choreography.rivet;
function specialChoreography(pose:Pose,r:Rig,f:Fighter,frame:number):Pose{
  const a=f.move!,m=getMove(f,a.id),style=styleOf(f),t=a.t,y=pose.root[1];
  const hits=COMBAT_STYLES[f.id].specialFrames,last=hits[hits.length-1];
  const contact=hits.reduce((q,h)=>Math.max(q,t<h?smooth((t-h+7)/7):1-smooth((t-h)/10)),0);
  const beat=Math.max(0,hits.findIndex(h=>t<=h+5)),phase=clamp(t/(last+6));
  const envelope=t<m.startup?smooth(t/Math.max(1,m.startup)):t>last+8?1-smooth((t-last-8)/Math.max(1,m.startup+m.active+m.recovery-last-8)):1;
  const base:Pose={...pose,hands:pose.hands.map(v=>[...v]) as [Vec,Vec],feet:pose.feet.map(v=>[...v]) as [Vec,Vec]};
  let hands:[Vec,Vec]=[[-18,y-30],[22,y-32]],lean=0,head=0;
  const q=contact;
  switch(f.id){
    case 'rivet': hands=beat%2?[[55,y-25],[15,y-32]]:[[-12,y-29],[69,y-24]];lean=.1+.15*q;break;
    case 'vela': hands=[[35,y-23],[64,y-24]];lean=-.13+.08*q;head=.06;pose.feet=[[-28,-7],[23,-7]];break;
    case 'bront': hands=t<30?[[-18,y-20],[28,y-79]]:[[-20,y-30],[49,y+15]];lean=t<30?-.12:.28*q;pose.root[1]+=t<30?-3*q:8*q;pose.feet[1]=t<30?[24,-12-10*q]:[29,-7];break;
    case 'zephyr': hands=beat%2?[[38,y-75],[16,y-30]]:[[-18,y-31],[48,y-76]];lean=-.14*q;pose.feet[0]=[-20,-14-12*q];break;
    case 'mox': hands=beat%2?[[64,y-32],[21,y-35]]:[[-5,y-34],[70,y-14]];lean=.2*q;head=-.13*q;break;
    case 'rune': hands=phase<.45?[[14,y-26],[20,y-26]]:[[-38,y-48],[54,y-48]];lean=phase<.45?.13:-.12*q;pose.root[1]+=5*(1-q);break;
    case 'guest07': hands=beat===1?[[24,y-79],[15,y-28]]:[[-19,y-13],[32,y-80]];lean=-.12*q;pose.feet[1]=[23,-11-8*q];break;
    case 'guest08': hands=beat%2?[[48,y-10],[-4,y-26]]:[[-21,y-26],[62,y-35]];lean=(beat%2?-.16:.17)*q;pose.feet[1]=[30+15*q,-7];break;
    case 'guest09': hands=beat%2?[[59,y-24],[19,y-31]]:[[-7,y-32],[71,y-29]];lean=.29*q;pose.feet=[[-29,-7],[27,-7]];break;
    case 'guest10': hands=beat%2?[[-20,y-73],[42,y-60]]:[[-28,y-57],[25,y-80]];lean=-.1*q;head=.09;break;
    case 'guest11': hands=phase<.5?[[13,y-26],[22,y-26]]:[[36,y-31],[51,y-30]];lean=-.13*q;pose.root[1]-=2*q;break;
    case 'guest12': hands=beat===1?[[43,y-58],[21,y-31]]:[[-13,y-21],[56,y-66]];lean=.12*q;head=-.08;break;
    case 'guest13': hands=phase<.5?[[37,y-12],[48,y-13]]:[[16,y-70],[35,y-79]];lean=phase<.5?.18:-.13;pose.root[1]+=5*(1-q);break;
    case 'guest14': hands=beat%2?[[-30,y-37],[57,y-58]]:[[-23,y-20],[69,y-24]];lean=.3*q;pose.feet=[[-28,-7],[25,-7]];head=-.2*q;break;
    case 'dumpstar': hands=beat%2?[[51,y+4],[20,y-9]]:[[-22,y-8],[58,y+12]];lean=.29*q;pose.root[1]+=9;pose.feet[1]=[40,-7];break;
    case 'crapto': hands=[[-24,y-23],[24,y-34]];lean=.3*q;head=.15*q;pose.root[1]+=4*q;break;
    case 'vamp': hands=[[-30,y-8-20*q],[46,y-8-20*q]];lean=-.16;head=.13;pose.root[1]+=3*(1-q);break;
    case 'alpha777': hands=beat%3===0?[[-8,y-32],[67,y-23]]:beat%3===1?[[55,y-33],[16,y-31]]:[[33,y-44],[60,y-43]];lean=.17*q;break;
    case 'mandela': hands=phase<.55?[[39-25*q,y-22],[57-35*q,y-23]]:[[42,y-22],[65,y-22]];lean=phase<.55?-.2*q:.23*q;break;
    case 'bigswole': hands=t<32?[[-17,y-85],[24,y-85]]:[[35,y+20],[47,y+22]];lean=t<32?-.15:.32*q;pose.root[1]+=t<32?-4*q:10*q;break;
    case 'nate': hands=[[-19,y-8],[49,y+5]];lean=.34*q;pose.root[1]+=9*(1-q);pose.feet[0]=[-27,-7-13*q];pose.feet[1]=[23,-7-8*q];break;
  }
  // Pulse target extension at actual contact frames; return through each guard.
  const energy=.45+.55*q;
  pose.hands=[mix(base.hands[0],hands[0],envelope*energy),mix(base.hands[1],hands[1],envelope*energy)];
  pose.lean=lerp(base.lean,lean,envelope);pose.headTilt=lerp(base.headTilt,head-lean*.35,envelope);
  pose.root=mix(base.root,pose.root,envelope);pose.feet=[mix(base.feet[0],pose.feet[0],envelope),mix(base.feet[1],pose.feet[1],envelope)];
  pose.handAngles=hands.map(h=>Math.atan2(h[1]-y+24,h[0]-10)) as [number,number];
  return pose;
}
interface Gait { x:number; travel:number; frame:number }
const gait=new WeakMap<Fighter,Gait>();
function strideTravel(f:Fighter,frame:number){
  let g=gait.get(f);
  if(!g||frame<g.frame){g={x:f.x,travel:f.x*f.facing/SCALE,frame};gait.set(f,g);}
  else if(frame!==g.frame){
    // Preserve phase when facing changes; advance only for actual travel, so
    // pushing into a wall does not cycle the feet in place.
    if(f.y>=FLOOR&&!f.move&&!f.stun&&!f.blockstun&&!f.dash)g.travel+=(f.x-g.x)*f.facing/SCALE;g.x=f.x;g.frame=frame;
  }
  return g.travel;
}
function basePose(r:Rig,f:Fighter,frame:number):Pose{
  const hipY=r.root[1]-r.ground,style=styleOf(f);
  const breathing=Math.sin(frame*Math.PI/75);
  const stanceSpread=8;
  const restY=Math.max(hipY,...r.hips.map((hip,i)=>{
    const side=i===0?'back':'front',leg=sourceLength(r,side+'Thigh')+sourceLength(r,side+'Shin')-1;
    return -7-(hip[1]-r.root[1])-Math.sqrt(Math.max(1,leg*leg-stanceSpread*stanceSpread));
  }));
  const frontShoulder=sub(r.shoulders[1],r.root),backShoulder=sub(r.shoulders[0],r.root);
  const frontReach=armLength(r,'frontUpperArm')+armLength(r,'frontForearm'),backReach=armLength(r,'backUpperArm')+armLength(r,'backForearm');
  const pose:Pose={root:[0,restY+Math.max(0,breathing)*.3],bodyAngle:0,lean:breathing*.012,headTilt:-breathing*.008,
    hands:[[backShoulder[0]-Math.min(7,backReach*.2),hipY+backShoulder[1]+Math.min(14,backReach*.5)],[frontShoulder[0]+Math.min(14,frontReach*.43),hipY+frontShoulder[1]+frontReach*.25]],
    feet:[[r.hips[0][0]-r.root[0]-stanceSpread,-7],[r.hips[1][0]-r.root[0]+stanceSpread,-7]],footAngles:[0,0],handAngles:[-.2,-.2],air:f.y<FLOOR,reach:0,kick:0,rearFront:false};
  pose.hands=[mix(pose.hands[0],[style.guard[0][0],hipY+style.guard[0][1]],.7),mix(pose.hands[1],[style.guard[1][0],hipY+style.guard[1][1]],.7)];
  // Keep neutral hands outside the torso silhouette. The source guard was
  // frontal; simply copying its wrist targets hides the far hand behind clothes.
  pose.hands[0][0]=Math.min(pose.hands[0][0],backShoulder[0]-10);
  pose.hands[1][0]=Math.max(pose.hands[1][0],frontShoulder[0]+7);
  pose.lean+=style.lean;
  strideTravel(f,frame);
  const moving=Math.abs(f.vx)>1&&!f.move&&!f.stun&&!f.blockstun&&!pose.air;
  if(moving){
    // During stance footX = constant - traveled distance, so feet stay planted
    // in world space. Only the swing foot follows the raised return arc.
    pose.root[1]=restY+3;
    const reach=[0,1].map(i=>{const side=i===0?'back':'front',leg=sourceLength(r,side+'Thigh')+sourceLength(r,side+'Shin')-.3,vertical=Math.abs(pose.root[1]+r.hips[i][1]-r.root[1]+7);return Math.sqrt(Math.max(0,leg*leg-vertical*vertical));});
    const stride=clamp(Math.min(...reach)*.88*style.stride,3,22),cycle=Math.max(stride*4,72*style.stride),stance=2*stride/cycle;
    const phase=mod(strideTravel(f,frame),cycle)/cycle;
    for(let i=0;i<2;i++){
      const p=mod(phase+i*.5,1),center=r.hips[i][0]-r.root[0];
      if(p<stance){pose.feet[i]=[center+stride-p*cycle,-7];}
      else{const t=(p-stance)/(1-stance);pose.feet[i]=[center-stride+stride*2*smooth(t),-7-Math.sin(Math.PI*t)*Math.max(10,style.lift)];pose.footAngles[i]=Math.sin(Math.PI*t)*-.2;}
    }
    // Fast travel uses a run cadence with short planted contacts and a longer
    // raised return. Avoid the old 8-frame shuffling cycle on short-legged rigs.
    const inFlight=phase>stance&&phase<.5||phase>.5+stance;
    if(inFlight)pose.root[1]-=2*Math.sin(Math.PI*(mod(phase,.5)-stance)/(.5-stance));
    pose.lean=style.lean+.06*Math.sign(f.vx*f.facing);
    pose.hands[0][0]+=Math.sin(phase*Math.PI*2)*7;pose.hands[1][0]-=Math.sin(phase*Math.PI*2)*7;
  }
  if((f.input&A.down)&&!pose.air&&!f.move){pose.root[1]+=10;pose.lean=.1;pose.hands[0][1]+=10;pose.hands[1][1]+=7;pose.feet=[[pose.feet[0][0]-3,-7],[pose.feet[1][0]+3,-7]];}
  if(f.jumpDelay>0&&!pose.air){pose.root[1]+=4;pose.lean=-.05;pose.hands[0][1]+=3;pose.hands[1][1]+=3;}
  if(pose.air){
    const rise=clamp(-f.vy/14,-1,1);pose.root[1]=hipY+2;pose.lean=-.04*rise;
    pose.feet=[[-21,-17+rise*3],[24,-12-rise*5]];pose.footAngles=[-.22,.18];
    pose.hands[0][1]-=5;pose.hands[1][1]-=7;
  }
  if(f.dash>0){pose.root[1]+=7;pose.lean=.23;pose.headTilt=-.17;pose.hands=[[-25,hipY-4],[-13,hipY]];pose.feet=[[pose.feet[0][0]-4,-7],[pose.feet[1][0]+4,-7]];}
  if(f.blockstun>0){pose.lean=-.08;pose.headTilt=.04;pose.hands=[[15,hipY-33],[27,hipY-38]];pose.handAngles=[-.65,-.8];}
  if(f.stun>0){const recoil=clamp(f.stun/18);pose.lean=-.14*recoil;pose.headTilt=-.07;pose.hands=[[-26,hipY-8],[27,hipY-9]];}
  return pose;
}
function attackPose(r:Rig,f:Fighter,frame:number):Pose{
  const pose=basePose(r,f,frame),attack=f.move;if(!attack)return pose;
  const m=getMove(f,attack.id),t=attack.t;
  const prep=smooth(t/Math.max(1,m.startup));
  const active=t>=m.startup&&t<m.startup+m.active;
  const recovery=smooth((t-m.startup-m.active)/Math.max(1,m.recovery));
  // Load, accelerate over the last three startup frames, then recoil before
  // returning to guard. Contact still coincides with simulation startup.
  const extension=t<m.startup?smooth((t-m.startup+3)/3):active?1:1-recovery;
  const anticipation=t<m.startup?prep:0;
  const bodyY=pose.root[1],idleFront:Vec=[...pose.hands[1]];
  pose.hands[1]=mix(idleFront,[-2,bodyY-15],anticipation*.6);
  pose.lean-=anticipation*.08;
  const id=attack.id,style=styleOf(f);
  pose.reach=extension;pose.rearFront=style.rear||id==='grab'||id==='bolt';
  let goal:Vec=[64,bodyY-23];
  if(id==='low'){pose.root[1]+=8;goal=[58,bodyY-3];}
  if(id==='launcher')goal=[29,bodyY-74];
  if(id==='bolt'){
    goal=attack.aim==='up'?[15,bodyY-78]:attack.aim==='upForward'?[58,bodyY-65]:attack.aim==='down'?[46,bodyY+26]:[66,bodyY-23];
  }
  if(id==='airHeavy')goal=[58,bodyY+4];
  if(id!=='launcher'&&id!=='special'&&id!=='grab'&&id!=='low'){
    if(attack.aim==='up')goal=[18,bodyY-77];
    if(attack.aim==='upForward')goal=[57,bodyY-64];
    if(attack.aim==='down')goal=[43,bodyY+22];
  }
  if(id==='bolt'&&attack.shotX!==undefined&&attack.shotY!==undefined){
    const dx=attack.shotX*f.facing,dy=attack.shotY,d=Math.hypot(dx,dy)||1;
    goal=[18+dx/d*65,bodyY-25+dy/d*65];
  }
  if(id==='grab'){goal=[49,bodyY-19];pose.hands[0]=mix(pose.hands[0],[43,bodyY-13],extension);}
  if(id==='special'){pose.rearFront=true;pose.reach=.8;return specialChoreography(pose,r,f,frame);}
  pose.hands[1]=mix(pose.hands[1],goal,extension);
  pose.lean+=extension*(id==='launcher'?-.06:id==='heavy'?.24:.15);
  pose.headTilt-=extension*.1;
  pose.handAngles[1]=id==='launcher'?-1.6:attack.aim==='up'?-1.5:attack.aim==='upForward'?-.7:attack.aim==='down'?.7:0;
  if(id==='medium'||id==='airMedium'||id==='sweep'||id==='airHeavy'){
    let target:Vec=id==='sweep'?[66,-7]:id==='airHeavy'?[59,bodyY+15]:[62,bodyY-21];
    if(attack.aim==='up')target=[28,bodyY-57];
    if(attack.aim==='upForward')target=[57,bodyY-44];
    if(attack.aim==='down'&&pose.air)target=[30,bodyY+32];
    pose.feet[1]=mix(pose.feet[1],target,extension);
    pose.footAngles[1]=lerp(0,id==='sweep'?.05:id==='airHeavy'?.35:-.25,extension);
    pose.lean-=extension*.18;pose.hands[1]=mix(pose.hands[1],[25,bodyY-34],extension);
  }
  // Per-fighter attack paths are distinct while contact remains locked to core timing.
  const ordinary=!['grab','launcher','special'].includes(id),level=!attack.aim||attack.aim==='level';
  if(ordinary&&level){
    const hand=style.rear&&id!=='bolt'?0:1,other=1-hand;
    if(id==='bolt'){
      if(style.cast==='twoHand')pose.hands[0]=mix(pose.hands[0],[goal[0]-14,goal[1]+3],extension);
      if(style.cast==='overhead'){pose.hands[1]=mix(pose.hands[1],[24,bodyY-72],anticipation);pose.handAngles[1]=-.6*extension;}
      if(style.cast==='underhand'){pose.hands[1]=mix(pose.hands[1],[53,bodyY-2],extension);pose.lean+=.08*extension;}
      if(style.cast==='cross')pose.hands[0]=mix(pose.hands[0],[25,bodyY-35],extension);
    }else if(!['medium','airMedium','sweep','airHeavy'].includes(id)){
      let target:Vec=[65,bodyY-23];
      if(style.strike==='hook')target=[46,bodyY-38+extension*9];
      if(style.strike==='palm')target=[61,bodyY-30];
      if(style.strike==='hammer')target=[49,bodyY-8];
      if(style.strike==='elbow')target=[37,bodyY-28];
      if(style.strike==='claw')target=[56,bodyY-39];
      if(id==='low')target[1]=bodyY+2;
      if(hand===0){pose.hands[1]=mix(pose.hands[1],[19,bodyY-31],extension);}
      pose.hands[hand]=mix(pose.hands[hand],target,extension);
      pose.hands[other]=mix(pose.hands[other],[style.guard[other][0],bodyY+style.guard[other][1]],extension);
      if(style.strike==='hammer')pose.hands[hand]=mix(pose.hands[hand],[8,bodyY-68],anticipation);
      if(style.strike==='hook')pose.hands[hand]=mix(pose.hands[hand],[-23,bodyY-29],anticipation);
      if(style.strike==='claw')pose.handAngles[hand]=.7*extension;
      if(style.strike==='elbow')pose.handAngles[hand]=-1.1*extension;
    }
    if(['medium','airMedium','airHeavy'].includes(id)){
      let foot:Vec=[62,bodyY-21];
      if(style.kick==='round')foot=[54,bodyY-38];
      if(style.kick==='knee')foot=[36,bodyY-15];
      if(style.kick==='stomp')foot=[42,bodyY+22];
      if(style.kick==='heel')foot=[57,bodyY-7];
      pose.feet[1]=mix(pose.feet[1],foot,extension);pose.footAngles[1]=(style.kick==='stomp'?.5:style.kick==='heel'?-.5:0)*extension;
    }
  }
  const kicking=['medium','airMedium','sweep','airHeavy'].includes(id);
  if(kicking){
    pose.kick=extension;pose.reach=extension*.2;
    const chamber=smooth(t/Math.max(1,m.startup-3));
    const rest=basePose(r,f,frame);
    // Lift knee first; extend only once the supporting hip has accepted weight.
    // Early recovery folds the knee before placing the foot back on the floor.
    const chamberFoot:Vec=[19,bodyY+8];
    const end=pose.feet[1];
    if(t<m.startup)pose.feet[1]=mix(mix(rest.feet[1],chamberFoot,chamber),end,extension);
    else if(!active){
      const q=clamp((t-m.startup-m.active)/Math.max(1,m.recovery));
      pose.feet[1]=q<.45?mix(end,chamberFoot,smooth(q/.45)):mix(chamberFoot,rest.feet[1],smooth((q-.45)/.55));
    }
    pose.root[0]+=8*extension;pose.root[1]+=4*extension; // transfer through the planted support hip
    pose.lean-=.16*extension;
    const knee=style.kick==='knee';
    pose.hands=[mix(rest.hands[0],[-24,bodyY-18],extension),mix(rest.hands[1],knee?[4,bodyY-40]:[20,bodyY-34],extension)];
  }else if(id!=='bolt'){
    // Transfer weight into the strike; do not ask IK for an impossible arm.
    pose.root[0]+=10*extension;pose.hands[0][0]+=10*extension;pose.hands[1][0]+=10*extension;
  }
  return pose;
}
export interface HiggsfieldThrowState { attacker:number; victim:number; phase:'hold'|'release'; t:number; direction:'forward'|'back'|'up'|'down'; facing:number }
let throwScene:{state:HiggsfieldThrowState;fighters:readonly Fighter[]}|null=null;
/** Set once before drawing a combat frame; pass null when the throw has ended. */
export function setHiggsfieldThrowState(state:HiggsfieldThrowState|null,fighters:readonly Fighter[]){throwScene=state?{state,fighters}:null;}
function evaluatedPose(r:Rig,f:Fighter,frame:number):Pose{
  const pose=attackPose(r,f,frame),scene=throwScene;if(!scene)return pose;
  const {state,fighters}=scene,attacker=fighters[state.attacker],victim=fighters[state.victim];
  if(f===attacker){
    pose.rearFront=true;pose.reach=1;
    const y=pose.root[1];
    if(state.phase==='hold'){
      const vx=(victim.x-f.x)*f.facing/SCALE,vy=(victim.y-f.y)/SCALE+(rigs.get(victim.id)?.root[1]??88)-(rigs.get(victim.id)?.ground??125);
      pose.hands=[[vx-17,vy-8],[vx+8,vy-12]];pose.lean=.12;pose.headTilt=-.08;pose.feet=[[pose.feet[0][0]-2,-7],[pose.feet[1][0]+2,-7]];
    }else{
      const q=1-smooth(state.t/18),goal:Vec=state.direction==='back'?[-54,y-24]:state.direction==='up'?[6,y-78]:state.direction==='down'?[43,y+15]:[67,y-15];
      pose.hands[0]=mix(pose.hands[0],[goal[0]-12,goal[1]+5],q);pose.hands[1]=mix(pose.hands[1],goal,q);pose.lean=(state.direction==='back'?-.18:.2)*q;
    }
  }else if(f===victim){
    pose.root[1]+=3;pose.hands=[[-26,pose.root[1]-34],[27,pose.root[1]-32]];
    pose.feet=[[-19,-21],[23,-18]];pose.footAngles=[-.3,.35];pose.headTilt=.12;
    if(state.phase==='hold')pose.bodyAngle=-.35*(state.direction==='back'?-1:1);
    else{const sign=state.direction==='back'?-1:1;pose.bodyAngle=sign*(.3+state.t*.065);if(f.y>=FLOOR)pose.bodyAngle*=1-smooth(state.t/18);}
  }
  return pose;
}
interface Memory { combatStamp?:string; signature:string; frame:number; changed:number; current:Pose; from:Pose }
const memory=new WeakMap<Fighter,Memory>();
function poseSignature(f:Fighter){if(throwScene&&(f===throwScene.fighters[throwScene.state.attacker]||f===throwScene.fighters[throwScene.state.victim]))return 'throw:'+throwScene.state.phase;return f.move?`move:${f.move.id}:${f.move.aim??'level'}`:f.stun?'hit':f.blockstun?'block':f.dash?'dash':f.y<FLOOR?'air':f.input&A.down?'crouch':Math.abs(f.vx)>1?'walk':'idle';}
function blendPose(a:Pose,b:Pose,t:number):Pose{return {root:mix(a.root,b.root,t),bodyAngle:lerp(a.bodyAngle,b.bodyAngle,t),lean:lerp(a.lean,b.lean,t),headTilt:lerp(a.headTilt,b.headTilt,t),hands:[mix(a.hands[0],b.hands[0],t),mix(a.hands[1],b.hands[1],t)],feet:[mix(a.feet[0],b.feet[0],t),mix(a.feet[1],b.feet[1],t)],footAngles:[lerp(a.footAngles[0],b.footAngles[0],t),lerp(a.footAngles[1],b.footAngles[1],t)],handAngles:[lerp(a.handAngles[0],b.handAngles[0],t),lerp(a.handAngles[1],b.handAngles[1],t)],air:b.air,reach:lerp(a.reach,b.reach,t),kick:lerp(a.kick,b.kick,t),rearFront:b.rearFront};}
function sample(r:Rig,f:Fighter,frame:number):Pose{
  const target=evaluatedPose(r,f,frame),signature=poseSignature(f);let previous=memory.get(f);
  if(!previous||frame<previous.frame){previous={signature,frame,changed:frame-5,current:target,from:target};memory.set(f,previous);}
  if(frame===previous.frame)return previous.current;
  if(signature!==previous.signature){previous.from=previous.current;previous.changed=frame;previous.signature=signature;}
  previous.current=blendPose(previous.from,target,smooth((frame-previous.changed+1)/(f.move?2:3)));previous.frame=frame;return previous.current;
}
function part(c:CanvasRenderingContext2D,r:Rig,name:string,position:Vec,angle=0,stretch=1){
  const p=r.parts[name];if(!p?.image)return;
  c.save();c.translate(position[0],position[1]);c.rotate(angle);c.scale(stretch,1);c.drawImage(p.image,-p.pivot[0],-p.pivot[1]);c.restore();
}
function support(c:CanvasRenderingContext2D,a:Vec,b:Vec,color:string,width:number){
  c.save();c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.restore();
}
function segment(c:CanvasRenderingContext2D,r:Rig,name:string,a:Vec,b:Vec){
  const p=r.parts[name];if(!p.image)return;
  const angle=Math.atan2(b[1]-a[1],b[0]-a[0]),stretch=length(sub(b,a))/Math.max(.01,sourceLength(r,name));
  // Short painted forearms are foreshortened. Stretching their whole texture
  // threefold turns sleeve edges into ribbons. Keep the distal source detail at
  // bounded scale; the source-colored joint support bridges the hidden surface.
  const textureScale=Math.min(stretch,1.45),offset=Math.max(0,length(sub(b,a))-sourceLength(r,name)*textureScale);
  c.save();c.translate(a[0],a[1]);c.rotate(angle);c.translate(offset,0);c.scale(textureScale,1);c.rotate(-p.bindAngle);c.drawImage(p.image,-p.pivot[0],-p.pivot[1]);c.restore();
}
function rigChains(r:Rig,pose:Pose){
  const root=pose.root;
  const attach=(source:Vec)=>add(root,rotate(sub(source,r.root),pose.lean));
  const arms:[Vec,Vec,Vec][]=[],legs:[Vec,Vec,Vec][]=[];
  for(let i=0;i<2;i++){
    const side=i===0?'back':'front';
    const shoulder=attach(r.shoulders[i]);
    // Shoulder girdle rotates/protracts with a crossing punch. A rear fist must
    // not be anchored behind the entire chest while it attacks in front.
    shoulder[0]+=(i===0?24:5)*pose.reach;
    arms.push(chain(shoulder,pose.hands[i],armLength(r,side+'UpperArm'),armLength(r,side+'Forearm'),i===0?-1:1));
    legs.push(chain(add(root,sub(r.hips[i],r.root)),pose.feet[i],sourceLength(r,side+'Thigh'),sourceLength(r,side+'Shin'),i===0?1:-1));
  }
  return {root,neck:attach(r.neck),arms,legs};
}
function drawRig(c:CanvasRenderingContext2D,r:Rig,f:Fighter,pose:Pose){
  const {root,neck,arms,legs}=rigChains(r,pose);
  c.save();c.translate(root[0],root[1]);c.rotate(pose.bodyAngle);c.translate(-root[0],-root[1]);
  const leg=(i:number)=>{const side=i===0?'back':'front',[a,b,end]=legs[i];support(c,root,a,r.colors.leg,8);support(c,a,b,r.colors.leg,7);support(c,b,end,r.colors.leg,6);segment(c,r,side+'Thigh',a,b);segment(c,r,side+'Shin',b,end);part(c,r,side+'Foot',end,pose.footAngles[i]);};
  const upperArm=(i:number)=>{const side=i===0?'back':'front',[a,b]=arms[i];support(c,a,b,r.colors.arm,6);segment(c,r,side+'UpperArm',a,b);};
  const forearm=(i:number)=>{const side=i===0?'back':'front',[,b,end]=arms[i];support(c,b,end,r.colors.arm,5);segment(c,r,side+'Forearm',b,end);part(c,r,side+'Hand',end,pose.handAngles[i]);};
  leg(0);upperArm(0);if(!pose.rearFront)forearm(0);
  if(pose.kick<.05)leg(1);
  support(c,add(neck,rotate([0,-3],pose.lean)),add(neck,rotate([0,11],pose.lean)),r.neckColor??r.colors.arm,11);
  part(c,r,'pelvis',root);part(c,r,'torso',root,pose.lean);
  if(pose.kick>=.05)leg(1);
  // Head remains above shoulder roots; working forearms and hands cross in front.
  upperArm(1);part(c,r,'head',neck,pose.lean+pose.headTilt);
  if(pose.rearFront){upperArm(0);forearm(0);}forearm(1);c.restore();
}
/** Returns false while missing/loading, so the caller can show a loading state. */
export function drawHiggsfieldFighter(c:CanvasRenderingContext2D,f:Fighter,frame:number,ghost=false,frozen=false):boolean{
  const r=rigs.get(f.id);if(!r)return false;
  const stamp=[f.x,f.y,f.move?.id,f.move?.t,f.stun,f.blockstun,f.dash].join(':');
  let pose:Pose;
  if(frozen){
    const previous=memory.get(f);
    if(previous?.combatStamp===stamp)pose=previous.current;
    else{pose=evaluatedPose(r,f,frame);memory.set(f,{signature:poseSignature(f),frame,changed:frame-5,current:pose,from:pose,combatStamp:stamp});}
  }else{pose=sample(r,f,frame);const current=memory.get(f);if(current)current.combatStamp=stamp;}
  c.save();c.translate(Math.round(f.x),Math.round(f.y));c.scale(f.facing*SCALE,SCALE);c.imageSmoothingEnabled=false;
  if(ghost)c.globalAlpha=.55;
  if(f.flash>0&&f.flash%4<2)c.filter='brightness(1.8)';
  drawRig(c,r,f,pose);c.restore();return true;
}
/** Portrait uses the intact generated head, independently from the animated body. */
export function drawHiggsfieldPortrait(c:CanvasRenderingContext2D,id:string,w:number,h:number):boolean{
  const r=rigs.get(id),p=r?.parts.head;if(!r||!p?.image)return false;
  c.save();c.imageSmoothingEnabled=false;c.clearRect(0,0,w,h);
  const scale=Math.min(w/(p.image.width+8),h/(p.image.height+5));
  const dw=p.image.width*scale,dh=p.image.height*scale;c.drawImage(p.image,(w-dw)/2,(h-dh)/2,dw,dh);c.restore();return true;
}
/** Fresh sample for contact sheets: bypasses temporal blending, retains articulation. */
export function drawHiggsfieldRigSample(c:CanvasRenderingContext2D,f:Fighter,frame:number):boolean{
  const r=rigs.get(f.id);if(!r)return false;c.save();c.translate(f.x,f.y);c.scale(f.facing*SCALE,SCALE);c.imageSmoothingEnabled=false;drawRig(c,r,f,evaluatedPose(r,f,frame));c.restore();return true;
}

/** Optional QA overlay; follows the exact same solved hierarchy as the cutouts. */
export function drawHiggsfieldRigDebug(c:CanvasRenderingContext2D,f:Fighter,frame:number,instant=false){
  const r=rigs.get(f.id);if(!r)return;const pose=instant?evaluatedPose(r,f,frame):sample(r,f,frame),j=rigChains(r,pose);
  c.save();c.translate(f.x,f.y);c.scale(f.facing*SCALE,SCALE);c.translate(pose.root[0],pose.root[1]);c.rotate(pose.bodyAngle);c.translate(-pose.root[0],-pose.root[1]);
  c.lineWidth=.7;c.strokeStyle='#7dffac';c.fillStyle='#fff8b0';
  for(const chain of [...j.arms,...j.legs,[j.root,j.neck]]){c.beginPath();chain.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();for(const p of chain){c.beginPath();c.arc(p[0],p[1],1.6,0,Math.PI*2);c.fill();}}
  c.restore();
}
