import {drawPower} from './powerArt';
import { FLOOR, ROSTER, COMBAT_STYLES, type CombatState, type Fighter } from './core';
import { drawSprite } from './spriteRoster';
import { getDuoLayoutDebug, setPoseAtlasAssistTiming } from './poseAtlas';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{n=clamp(n);return n*n*(3-2*n);};
// Retain object identity so complete-body playback and event clocks do not reset
// on every draw. Assists follow the owner's contacts, not their own kit's clock.
const assists=new WeakMap<Fighter,Fighter>();
const assistLanes=new WeakMap<Fighter,{attack:Fighter['move'];raised:boolean}>();
/** Runtime choreography follows each kit's actual contact frames. */
export function drawTeamSpecialBack(c:CanvasRenderingContext2D,s:CombatState){
 for(const f of s.fighters){
  if(f.move?.id!=='special')continue;
  const t=f.move.t,fade=clamp((70-t)/16),strength=t<12?ease(t/12):fade;
  c.save();c.fillStyle=`rgba(8,12,27,${.30*strength})`;c.fillRect(0,160,1280,445);
  const color=ROSTER[f.id].color;c.strokeStyle=color;c.lineWidth=2;c.globalAlpha=.22*strength;
  for(let n=0;n<9;n++){const y=220+n*35,travel=(t*23+n*79)%1280;c.beginPath();c.moveTo(f.facing===1?travel:1280-travel,y);c.lineTo(f.facing===1?travel-110:1390-travel,y);c.stroke();}
  c.restore();
  if(t<4||t>65)continue;
  const entry=ease((t-4)/8),exit=ease((t-48)/17);
  const offset=-250+(entry*160)+(t>=27?ease((t-27)/12)*65:0)-exit*220;
  let teammate=assists.get(f);
  if(!teammate){teammate={...f};assists.set(f,teammate);}
  let assistX=f.x+f.facing*offset,assistY=FLOOR;
  if(f.id==='duo'){
   // The single-body entrance swept the cameo through the rear twin. Keep
   // it behind both complete silhouettes, with an elevated assist at a wall.
   const bounds=getDuoLayoutDebug(f,s.frame).bounds;
   const rear=f.facing===1?bounds[0][0]:bounds[1][1];
   const margin=125+(1-entry)*45+exit*45;
   assistX=rear-f.facing*margin;
   let lane=assistLanes.get(f);
   if(!lane||lane.attack!==f.move){lane={attack:f.move,raised:assistX<105||assistX>1175};assistLanes.set(f,lane);}
   // Retain the entrance lane through recovery instead of popping vertically
   // when forward movement crosses the available-space threshold.
   // The inset sky lane also clears the left combo readout and upper banner.
   if(lane.raised){assistX=Math.max(385,Math.min(895,f.x));assistY=FLOOR-190;}
  }
  Object.assign(teammate,f,{id:ROSTER[f.id].partner,x:assistX,y:assistY,hp:1000,flash:0,stun:0,blockstun:0,reaction:null,vx:0,vy:0,move:{...f.move,t}});
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
   const reachNow=70+progress*(style.special.range??580),x=f.x+f.facing*reachNow,y=style.special.low?FLOOR-22:f.y-80;
   c.save();c.translate(x,y);c.scale(2+progress,2+progress);drawPower(c,style.projectile.shape,t, color);c.restore();
   if(style.power==='slow'){c.fillStyle='#78608b';for(let k=0;k<9;k++)c.fillRect(f.x+f.facing*(k*65+30),250+(t*8+k*21)%280,3,14);}
   if(style.power==='pull'){c.beginPath();c.moveTo(f.x,y);c.lineTo(x,y);c.setLineDash([10,7]);c.stroke();c.setLineDash([]);}
   if(style.power==='slam'){c.beginPath();c.moveTo(x-65,FLOOR);c.lineTo(x,FLOOR-110*(1-progress));c.lineTo(x+65,FLOOR);c.stroke();}
   c.beginPath();c.moveTo(f.x+f.facing*30,y+(i===1?45:-30));c.lineTo(x,y-(i===1?90:-20));c.stroke();
   c.beginPath();c.arc(x,y,20+progress*(i===2?100:65),-.8,Math.PI+.8);c.stroke();
   c.fillStyle='#f7ffe4';for(let j=0;j<7;j++){const angle=j*Math.PI*2/7;c.fillRect(x+Math.cos(angle)*progress*85,y+Math.sin(angle)*progress*85,4,4);}c.restore();
  }
  if(t<55){c.save();c.globalAlpha=Math.min(ease((t+1)/6),clamp((55-t)/10));c.fillStyle='#101725ed';c.fillRect(365,157,550,62);c.fillStyle=color;c.font='900 19px system-ui';c.textAlign='center';c.fillText(ROSTER[f.id].special,640,183);c.fillStyle='#e5e9e2';c.font='600 11px system-ui';c.fillText(`${ROSTER[f.id].name} + ${ROSTER[ROSTER[f.id].partner].name} / TEAM RELAY`,640,205);c.restore();}
 }
}
