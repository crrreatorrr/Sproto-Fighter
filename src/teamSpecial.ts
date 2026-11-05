import {drawSpecialSprite} from './powerArt';
import { FLOOR, WIDTH, ROSTER, COMBAT_STYLES, fighterPartner, PARTNER_ATTACKS, hashText, isPairedFighter, bodySpread, type FighterId, type CombatState, type Fighter } from './core';
import { drawSprite } from './spriteRoster';
import { getDuoLayoutDebug, getPartnerAssistBodyPlan, setPoseAtlasAssistTiming } from './poseAtlas';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{n=clamp(n);return n*n*(3-2*n);};
const assists=new WeakMap<Fighter,Map<FighterId,Fighter>>();
const entries=new WeakMap<Fighter,{move:Fighter['move'];side:number}>();
function actorFor(owner:Fighter,id:FighterId){let group=assists.get(owner);if(!group){group=new Map();assists.set(owner,group);}let actor=group.get(id);if(!actor){actor={...owner};group.set(id,actor);}return actor;}
interface AssistBeat{id:FighterId;contacts:readonly number[];start:number;rank:number}
function schedule(f:Fighter):AssistBeat[]{
 const id=fighterPartner(f),hits=COMBAT_STYLES[f.id].specialFrames;
 if(PARTNER_ATTACKS[id]||['sproto3152','vaudream','sproto3181'].includes(id))return[{id,contacts:hits,start:4,rank:0}];
 return[];
}
/** A wall-side decision persists through the entire special, avoiding teleports. */
export function getTeamSpecialAssistPlan(f:Fighter,targetX=f.x+f.facing*240){
 if(f.move?.id!=='special')return[];
 let entry=entries.get(f);
 if(!entry||entry.move!==f.move){const behind=f.x-f.facing*200;entry={move:f.move,side:behind<150||behind>WIDTH-150?-1:1};entries.set(f,entry);}
 const t=f.move.t;
 return schedule(f).flatMap(beat=>{
  const first=beat.contacts[0],last=beat.contacts.at(-1)!,retreat=beat.id==='sproto3181'?18:12,end=last+10+retreat;
  if(t<beat.start||t>end)return[];
  const into=ease((t-beat.start)/Math.max(1,first-beat.start)),out=ease((t-last-10)/retreat);
  const profile=PARTNER_ATTACKS[beat.id];
  const spread=profile?(isPairedFighter(beat.id)?320:200):beat.id==='sproto3181'?180:beat.id==='vaudream'?160:110;
  const offset=entry.side*(-(spread+155)+into*115-out*180),margin=beat.id==='sproto3181'?160:90;
  let x=Math.max(margin,Math.min(WIDTH-margin,f.x+f.facing*offset)),y=FLOOR-(beat.id==='vaudream'?85:0);
  if(profile){
   const drive=Math.max(...beat.contacts.map(hit=>t<hit?ease((t-hit+8)/8):1-ease((t-hit)/8)));
   if(profile.motion==='rush'||profile.motion==='dive')x+=(Math.max(100,Math.min(WIDTH-100,targetX-f.facing*85))-x)*drive;
   if(profile.motion==='hover')y-=55;
   if(profile.motion==='orbit')x+=Math.sin(t*.13)*30;
   x=Math.max(margin,Math.min(WIDTH-margin,x));
  }
  const source=beat.id==='vaudream'?{x:x+f.facing*35,y:y-125}:{x:x+f.facing*30,y:y-50};
  let contact=-1;for(let i=0;i<beat.contacts.length;i++)if(t>=beat.contacts[i]&&t<=beat.contacts[i]+9)contact=i;
  const attack=beat.id==='sproto3181'&&contact>=0?(contact%2===0?'yellowStrike':'stomachSlam'):null;
  return[{...beat,x,y,facing:f.facing,t,opacity:clamp(Math.sqrt(into)*(1-out)),source,attack,impactScale:attack==='stomachSlam'?2.6:.7,
   reach:Math.max(40,(COMBAT_STYLES[f.id].special.range??480)+(f.x-x)*f.facing-30)}];
 });
}
export function getTeamSpecialAssistDebug(f:Fighter){return getTeamSpecialAssistPlan(f).find(a=>a.id===fighterPartner(f))??null;}
export function getTeamSpecialBodyDebug(f:Fighter){const actor=assists.get(f)?.get(fighterPartner(f));return actor?getPartnerAssistBodyPlan(actor):[];}
function drawAssist(c:CanvasRenderingContext2D,actor:Fighter,s:CombatState,opacity:number){
 c.save();
 c.globalAlpha*=opacity;
 c.translate(actor.x,actor.y);
 const scale=isPairedFighter(actor.id)?1.08:1.16;
 c.scale(scale,scale);
 c.translate(-actor.x,-actor.y);
 drawSprite(c,actor,s.frame,false,s.freeze>0);
 c.restore();
}
/** Partners share the lead fighter's contact schedule; these effects add no damage. */
const assistLanes=new WeakMap<Fighter,{attack:Fighter['move'];raised:boolean}>();
export function drawTeamSpecialBack(c:CanvasRenderingContext2D,s:CombatState){
 for(const f of s.fighters){
  if(f.move?.id!=='special')continue;
  const t=f.move.t,fade=clamp((70-t)/16),strength=t<12?ease(t/12):fade;
  c.save();c.fillStyle=`rgba(8,12,27,${.30*strength})`;c.fillRect(0,160,1280,445);
  const color=ROSTER[f.id].color;c.strokeStyle=color;c.lineWidth=2;c.globalAlpha=.22*strength;
  for(let n=0;n<9;n++){const y=220+n*35,travel=(t*23+n*79)%1280;c.beginPath();c.moveTo(f.facing===1?travel:1280-travel,y);c.lineTo(f.facing===1?travel-110:1390-travel,y);c.stroke();}c.restore();
  if(schedule(f).length){
   for(const a of getTeamSpecialAssistPlan(f,s.fighters.find(actor=>actor!==f)!.x)){
    const teammate=actorFor(f,a.id);
    Object.assign(teammate,f,{id:a.id,x:a.x,y:a.y,hp:1000,flash:0,stun:0,blockstun:0,reaction:null,vx:0,vy:0,move:{...f.move,t}});
    setPoseAtlasAssistTiming(teammate,a.contacts,a.start);
    drawAssist(c,teammate,s,a.opacity);

   }
   continue;
  }
  if(t<4||t>65)continue;
  const entry=ease((t-4)/8),exit=ease((t-48)/17);
  const offset=-260+entry*96-exit*150;
  const teammate=actorFor(f,fighterPartner(f));
  let assistX=f.x+f.facing*offset,assistY=FLOOR;
  if(!isPairedFighter(f.id)){
   const signature=hashText('team-special:'+fighterPartner(f));
   const motion=Math.sin(Math.PI*clamp((t-9)/40));
   assistX+=f.facing*motion*((signature%31)-15);
   assistY-=motion*((signature>>>7)%4)*12;
   let lane=assistLanes.get(f);
   if(!lane||lane.attack!==f.move){
    lane={attack:f.move,raised:assistX<95||assistX>WIDTH-95};
    assistLanes.set(f,lane);
   }
   if(lane.raised){
    assistX=Math.max(95,Math.min(WIDTH-95,f.x-f.facing*65));
    assistY-=148;
   }
  }
  if(isPairedFighter(f.id)){
   // Keep the cameo outside the whole paired formation, not inside its rear body.
   const bounds=getDuoLayoutDebug(f,s.frame).bounds;
   const rear=f.facing===1?bounds[0][0]:bounds.at(-1)![1];
   const margin=125+bodySpread(fighterPartner(f))+(1-entry)*45+exit*45;
   assistX=rear-f.facing*margin;
   let lane=assistLanes.get(f);
   if(!lane||lane.attack!==f.move){lane={attack:f.move,raised:assistX<105||assistX>1175};assistLanes.set(f,lane);}
   if(lane.raised){assistX=Math.max(385,Math.min(895,f.x));assistY=FLOOR-190;}
  }
  Object.assign(teammate,f,{id:fighterPartner(f),x:assistX,y:assistY,hp:1000,flash:0,stun:0,blockstun:0,reaction:null,vx:0,vy:0,move:{...f.move,t}});
  setPoseAtlasAssistTiming(teammate,COMBAT_STYLES[f.id].specialFrames);
  drawAssist(c,teammate,s,clamp(Math.sqrt(entry)*(1-exit)));
 }
}
export function drawTeamSpecialFront(c:CanvasRenderingContext2D,s:CombatState){
 for(const f of s.fighters){
  if(f.move?.id!=='special')continue;const t=f.move.t,color=ROSTER[f.id].color;
  const partner=fighterPartner(f);
  const style=COMBAT_STYLES[f.id],foe=s.fighters.find(actor=>actor!==f)!;
  const seed=hashText('team-special:'+partner);
  const palette=seed%4;
  const direction=seed&1?1:-1,pattern=(seed>>>4)%4;
  const teammate=assists.get(f)?.get(partner);
  const sourceX=(teammate?.x??f.x)+f.facing*26,sourceY=(teammate?.y??f.y)-85;
  const impactX=foe.x;
  const impactY=style.special.low?FLOOR-26:foe.y-74;
  for(const [beat,contact]of style.specialFrames.entries()){
   const age=t-contact;
   if(age<-7||age>12)continue;
   if(age<0){
    const u=(age+7)/7;
    for(let echo=0;echo<3;echo++){
     const progress=u-echo*.17;
     if(progress<.14)continue;
     const arc=Math.sin(Math.PI*progress)*(26+(seed>>>12)%46)*direction;
     const x=sourceX+(impactX-sourceX)*progress;
     const y=sourceY+(impactY-sourceY)*progress+(pattern%2===0?-arc:arc);
     const frame=Math.min(3,Math.floor(progress*4));
     const bearing=Math.atan2(impactY-sourceY,impactX-sourceX);
     drawSpecialSprite(c,palette*4+frame,x,y,52-echo*10,bearing,1-echo*.25);
    }
    continue;
   }
   if(!f.move.connected||foe.move?.id==='special')continue;
   const progress=age/12;
   const frame=Math.min(3,Math.floor(age/3));
   const size=[58,104,122,136][frame]+pattern*4;
   const impactPalette=(palette+beat)%4;
   drawSpecialSprite(c,16+impactPalette*4+frame,impactX,impactY,size,0,1-progress*.88);
  }
  if(t<55){c.save();c.globalAlpha=Math.min(ease((t+1)/6),clamp((55-t)/10));c.fillStyle='#101725ed';c.fillRect(365,157,550,62);c.fillStyle=color;c.font='900 19px "Pixelify Sans", monospace';c.textAlign='center';c.fillText(PARTNER_ATTACKS[fighterPartner(f)]?.name??ROSTER[f.id].special,640,183);c.fillStyle='#e5e9e2';c.font='600 11px "Pixelify Sans", monospace';c.fillText(`${[f.id,fighterPartner(f)].map(id=>ROSTER[id].name).join(" + ")} / TEAM RELAY`,640,205);c.restore();}
 }
}
