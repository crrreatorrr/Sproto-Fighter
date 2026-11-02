import { COMBAT_STYLES, getMove, isDown, type CombatState } from './core';
import { drawPelvicStream, drawPower } from './powerArt';

/** Shared by the match and atlas lab so emitting points are reviewable. */
export function drawPelvicAttacks(c:CanvasRenderingContext2D,s:CombatState){
 for(const p of s.projectiles){
  if(p.shape!=='pelvicStream')continue;
  const f=s.fighters[p.owner],origin=COMBAT_STYLES[f.id].projectile.origin!;
  const x=f.x+f.facing*origin.forward,reach=(p.x-x)*f.facing,move=getMove(f,'bolt');
  c.save();
  if(f.move?.id==='bolt'&&f.move.t<move.startup+move.active+move.recovery-7&&!isDown(f)&&reach>=0){
   c.translate(Math.round(x),Math.round(f.y-origin.height));c.scale(f.facing,1);drawPelvicStream(c,reach,p.age??0);
  }else{c.translate(Math.round(p.x),Math.round(p.y));drawPower(c,'pelvicStream',p.age??0,'#ffe65b');}
  c.restore();
 }
 for(const f of s.fighters){
  const style=COMBAT_STYLES[f.id];
  if(f.move?.id!=='special'||style.projectile.shape!=='pelvicStream')continue;
  const origin=style.projectile.origin!;
  for(const [i,hit] of style.specialFrames.entries()){
   const age=f.move.t-hit;if(age<0||age>10)continue;
   c.save();c.globalAlpha=(1-age/10)*.85;
   c.translate(Math.round(f.x+f.facing*origin.forward),Math.round(f.y-origin.height));c.scale(f.facing,1);
   drawPelvicStream(c,(style.special.range??480)-origin.forward,age+i*3);c.restore();
  }
 }
}
