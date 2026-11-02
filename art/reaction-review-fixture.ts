import {A,FLOOR,bodySpread,createState,step,type FighterId} from '../src/core';

export const REACTION_COLUMNS=['neutral','impact','late recoil','launch impact','apex','falling','tumble','floor rest','get-up','recovered'] as const;
export const REACTION_CASES=['light','launcher','heavy'] as const;
export function reactionFixture(id:FighterId,facing:1|-1,kind:typeof REACTION_CASES[number]) {
  const s=createState(id,'dummy','rivet'),f=s.fighters[0],a=s.fighters[1];
  f.x=600;f.facing=facing;a.facing=-facing;a.x=600+facing*(60+bodySpread(id)+bodySpread(a.id));
  let age=0,hit=false;
  return {state:s,kind,get age(){return age;},get hit(){return hit;},advance(){
    step(s,[0,age===0?A[kind]:0]);age++;hit ||= f.hp<1000;
    const r=f.reaction,keys:string[]=[];
    if(kind==='light'&&r?.kind==='recoil'){keys.push('impact');if(r.t>=14)keys.push('late recoil');}
    if(kind==='launcher'&&r?.kind==='launch'){
      keys.push('launch impact');if(f.vy>=0&&f.y<FLOOR)keys.push('apex');
      if(f.vy>0&&f.y>FLOOR-45&&f.y<FLOOR)keys.push('falling');
    }
    if(kind==='heavy'&&r?.kind==='knockdown'){
      if(r.phase==='flight'&&r.t>=10)keys.push('tumble');
      if(r.phase==='down')keys.push('floor rest');
      if(r.phase==='rise')keys.push('get-up');
    }
    if(kind==='heavy'&&hit&&!r&&!f.stun&&f.y===FLOOR)keys.push('recovered');
    return keys;
  }};
}
