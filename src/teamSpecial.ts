import {drawPower,drawPelvicStream} from './powerArt';
import { FLOOR, WIDTH, ROSTER, COMBAT_STYLES, specialPartnerIds, bodyOffsets, type FighterId, type CombatState, type Fighter } from './core';
import { drawSprite } from './spriteRoster';
import { setPoseAtlasAssistTiming } from './poseAtlas';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{n=clamp(n);return n*n*(3-2*n);};
const assists=new WeakMap<Fighter,Map<FighterId,Fighter>>();
const entries=new WeakMap<Fighter,{move:Fighter['move'];side:number}>();
function actorFor(owner:Fighter,id:FighterId){let group=assists.get(owner);if(!group){group=new Map();assists.set(owner,group);}let actor=group.get(id);if(!actor){actor={...owner};group.set(id,actor);}return actor;}
interface AssistBeat{id:FighterId;contacts:readonly number[];start:number;rank:number}
function schedule(f:Fighter):AssistBeat[]{
 const ids=specialPartnerIds(f.id),hits=COMBAT_STYLES[f.id].specialFrames;
 if(ids.includes('sproto3152')&&ids.includes('vaudream')&&ids.includes('sproto3181')&&hits.length>=4)return[
  {id:'sproto3152',contacts:[hits[0]],start:4,rank:0},
  {id:'vaudream',contacts:[hits[1]],start:Math.max(4,hits[1]-12),rank:1},
  {id:'sproto3181',contacts:[hits[2],hits[3]],start:Math.max(4,hits[2]-12),rank:2},
 ];
 if(['sproto3152','vaudream','sproto3181'].includes(ids[0]))return[{id:ids[0],contacts:hits,start:4,rank:0}];
 return[];
}
/** A wall-side decision persists through the entire relay, avoiding teleports. */
export function getTeamSpecialAssistPlan(f:Fighter){
 if(f.move?.id!=='special')return[];
 let entry=entries.get(f);
 if(!entry||entry.move!==f.move){const behind=f.x-f.facing*200;entry={move:f.move,side:behind<150||behind>WIDTH-150?-1:1};entries.set(f,entry);}
 const t=f.move.t;
 return schedule(f).flatMap(beat=>{
  const first=beat.contacts[0],last=beat.contacts.at(-1)!,retreat=beat.id==='sproto3181'?18:12,end=last+10+retreat;
  if(t<beat.start||t>end)return[];
  const into=ease((t-beat.start)/Math.max(1,first-beat.start)),out=ease((t-last-10)/retreat);
  const spread=beat.id==='sproto3181'?180:beat.id==='vaudream'?160:110;
  const offset=entry.side*(-(spread+140)+into*140-out*220),margin=beat.id==='sproto3181'?160:90;
  const x=Math.max(margin,Math.min(WIDTH-margin,f.x+f.facing*offset)),y=FLOOR-(beat.id==='vaudream'?85:0);
  const source=beat.id==='vaudream'?{x:x+f.facing*35,y:y-125}:{x:x+f.facing*30,y:y-50};
  const attack=beat.id==='sproto3181'?(t>=last&&t<=last+9?'stomachSlam':t>=first&&t<=first+9?'yellowStrike':null):null;
  return[{...beat,x,y,facing:f.facing,t,opacity:clamp(into*(1-out))*.93,source,attack,impactScale:attack==='stomachSlam'?2.6:.7,
   reach:Math.max(40,(COMBAT_STYLES[f.id].special.range??480)+(f.x-x)*f.facing-30)}];
 });
}
export function getTeamSpecialAssistDebug(f:Fighter){return getTeamSpecialAssistPlan(f).find(a=>a.id===ROSTER[f.id].partner)??null;}
/** Partners share the lead fighter's contact schedule; these effects add no damage. */
export function drawTeamSpecialBack(c:CanvasRenderingContext2D,s:CombatState){
 for(const f of s.fighters){
  if(f.move?.id!=='special')continue;
  const t=f.move.t,fade=clamp((70-t)/16),strength=t<12?ease(t/12):fade;
  c.save();c.fillStyle=`rgba(8,12,27,${.30*strength})`;c.fillRect(0,160,1280,445);
  const color=ROSTER[f.id].color;c.strokeStyle=color;c.lineWidth=2;c.globalAlpha=.22*strength;
  for(let n=0;n<9;n++){const y=220+n*35,travel=(t*23+n*79)%1280;c.beginPath();c.moveTo(f.facing===1?travel:1280-travel,y);c.lineTo(f.facing===1?travel-110:1390-travel,y);c.stroke();}c.restore();
  if(schedule(f).length){
   for(const a of getTeamSpecialAssistPlan(f)){
    const teammate=actorFor(f,a.id);
    Object.assign(teammate,f,{id:a.id,x:a.x,y:a.y,hp:1000,flash:0,stun:0,blockstun:0,reaction:null,vx:0,vy:0,move:{...f.move,t}});
    setPoseAtlasAssistTiming(teammate,a.contacts,a.start);
    c.save();c.globalAlpha=a.opacity;drawSprite(c,teammate,s.frame,false,s.freeze>0);
    for(const [i,hit]of a.contacts.entries()){
     const age=t-hit;if(age<0||age>9)continue;const foe=s.fighters.find(actor=>actor!==f)!;
     c.save();c.globalAlpha=a.opacity*(1-age/10);
     if(a.id==='sproto3152'){
      c.translate(Math.round(a.source.x),Math.round(a.source.y));c.scale(f.facing,1);drawPelvicStream(c,a.reach,age+i*3);
     }else if(a.id==='vaudream'){
      for(const[width,stroke]of [[16,'#185a96'],[8,'#38dcff'],[3,'#f3ffff']]as const){c.lineWidth=width;c.strokeStyle=stroke;c.beginPath();c.moveTo(a.source.x,a.source.y);c.lineTo(foe.x,foe.y-65);c.stroke();}
      c.fillStyle='#f3ffff';c.fillRect(Math.round(a.source.x)-5,Math.round(a.source.y)-5,10,10);
     }else if(a.id==='sproto3181'){
      const big=i===a.contacts.length-1,r=(22+age*4)*(big?2.6:.7),cx=foe.x,cy=foe.y-65;
      c.strokeStyle=big?'#111a34':'#ffe26a';c.lineWidth=big?15:4;c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.stroke();
      if(big){c.strokeStyle='#ffe26a';c.lineWidth=4;c.beginPath();c.arc(cx,cy,r+7,0,Math.PI*2);c.stroke();for(let k=0;k<8;k++){const angle=k*Math.PI/4;c.fillStyle='#ffe26a';c.fillRect(Math.round(cx+Math.cos(angle)*r),Math.round(cy+Math.sin(angle)*r),8,8);}}
     }
     c.restore();
    }
    c.restore();
   }
   continue;
  }
  if(t<4||t>65)continue;
  const entry=ease((t-4)/8),exit=ease((t-48)/17),offset=-250+entry*160+(t>=27?ease((t-27)/12)*65:0)-exit*220;
  const teammate=actorFor(f,ROSTER[f.id].partner);
  Object.assign(teammate,f,{id:ROSTER[f.id].partner,x:f.x+f.facing*offset,y:FLOOR,hp:1000,flash:0,stun:0,blockstun:0,reaction:null,vx:0,vy:0,move:{...f.move,t}});
  setPoseAtlasAssistTiming(teammate,COMBAT_STYLES[f.id].specialFrames);
  c.save();c.globalAlpha=clamp(entry*(1-exit))*.93;drawSprite(c,teammate,s.frame,false,s.freeze>0);c.restore();
 }
}
export function drawTeamSpecialFront(c:CanvasRenderingContext2D,s:CombatState){
 for(const f of s.fighters){
  if(f.move?.id!=='special')continue;const t=f.move.t,color=ROSTER[f.id].color;
  for(const [i,hit] of COMBAT_STYLES[f.id].specialFrames.entries()){
   const age=t-hit;if(age<0||age>10)continue;const progress=age/10;
   c.save();c.globalAlpha=(1-progress)*.72;c.strokeStyle=color;c.lineWidth=(i===2?10:6)*(1-progress)+1;
   const style=COMBAT_STYLES[f.id];
   if(style.projectile.shape==='pelvicStream'){c.restore();continue;}
   const reachNow=70+progress*(style.special.range??580),x=f.x+f.facing*reachNow,y=style.special.low?FLOOR-22:f.y-80;
   c.save();c.translate(x,y);c.scale(2+progress,2+progress);drawPower(c,style.projectile.shape,t, color);c.restore();
   if(style.power==='slow'){c.fillStyle='#78608b';for(let k=0;k<9;k++)c.fillRect(f.x+f.facing*(k*65+30),250+(t*8+k*21)%280,3,14);}
   if(style.power==='pull'){c.beginPath();c.moveTo(f.x,y);c.lineTo(x,y);c.setLineDash([10,7]);c.stroke();c.setLineDash([]);}
   if(style.power==='slam'){c.beginPath();c.moveTo(x-65,FLOOR);c.lineTo(x,FLOOR-110*(1-progress));c.lineTo(x+65,FLOOR);c.stroke();}
   c.beginPath();c.moveTo(f.x+f.facing*30,y+(i===1?45:-30));c.lineTo(x,y-(i===1?90:-20));c.stroke();
   c.beginPath();c.arc(x,y,20+progress*(i===2?100:65),-.8,Math.PI+.8);c.stroke();
   c.fillStyle='#f7ffe4';for(let j=0;j<7;j++){const angle=j*Math.PI*2/7;c.fillRect(x+Math.cos(angle)*progress*85,y+Math.sin(angle)*progress*85,4,4);}c.restore();
  }
  if(t<55){c.save();c.globalAlpha=Math.min(ease((t+1)/6),clamp((55-t)/10));c.fillStyle='#101725ed';c.fillRect(365,157,550,62);c.fillStyle=color;c.font='900 19px "Pixelify Sans", monospace';c.textAlign='center';c.fillText(ROSTER[f.id].special,640,183);c.fillStyle='#e5e9e2';c.font='600 11px "Pixelify Sans", monospace';c.fillText(`${[f.id,...specialPartnerIds(f.id)].map(id=>ROSTER[id].name).join(" + ")} / TEAM RELAY`,640,205);c.restore();}
 }
}
