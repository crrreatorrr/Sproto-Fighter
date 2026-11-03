import { COMBAT_STYLES, getMove, type CombatState } from './core';

/** Pixel effects are presentation only; beam reach and contacts live in core.ts. */
export function drawMindBeams(c:CanvasRenderingContext2D,s:CombatState){
  for(const f of s.fighters){
    if(f.move?.id!=='bolt'||f.stun||f.blockstun)continue;
    const style=COMBAT_STYLES[f.id].projectile;if(!style.beamLength||!style.origin)continue;
    const start=getMove(f,'bolt').startup,t=f.move.t;if(t>=start)continue;
    c.save();c.translate(Math.round(f.x+f.facing*style.origin.forward),Math.round(f.y-style.origin.height));
    const r=4+Math.floor((1-t/start)*12),pulse=t%4<2;
    c.fillStyle=pulse?'#bc94ff':'#8760e8';
    c.fillRect(-r,-2,3,4);c.fillRect(r-3,-2,3,4);c.fillRect(-2,-r,4,3);c.fillRect(-2,r-3,4,3);
    c.fillStyle='#fff3ff';c.fillRect(-2,-2,4,4);c.restore();
  }
  for(const p of s.projectiles){
    if(!p.beamLength)continue;
    c.save();c.translate(Math.round(p.x),Math.round(p.y));c.scale(p.beamDirection??1,1);
    const length=p.beamLength,age=p.age??0,thickness=p.life<=3?3:age%3?9:7;
    c.globalAlpha=p.life<=2?.65:1;
    c.fillStyle='#5033a8';c.fillRect(0,-thickness-4,length,thickness*2+8);
    c.fillStyle='#a076f5';c.fillRect(0,-thickness,length,thickness*2);
    c.fillStyle='#e4c3ff';c.fillRect(0,-3,length,6);
    c.fillStyle='#fff8ff';c.fillRect(0,-1,length,2);
    for(let x=16+(age*13)%40;x<length;x+=40){
      c.fillStyle='#d9a2ff';c.fillRect(x,-thickness-7,14,3);c.fillRect(x+10,thickness+4,14,3);
    }
    c.fillStyle='#fff8ff';c.fillRect(-3,-5,7,10);
    c.restore();
  }
}
