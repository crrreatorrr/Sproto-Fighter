import { A, FLOOR, type Fighter } from './core';
type Clock = { state:string; age:number; frame:number; stun:number; block:number };
const clocks = new WeakMap<Fighter, Clock>();
/** Presentation only: start clips at their first pose and hold them through hit-stop.
 * Combat state and recorded inputs stay untouched. Attack art still follows move.t. */
export function animationFrame(f:Fighter,frame:number,frozen=false):number {
 const state=f.stun?'hit':f.blockstun?'block':f.move?f.move.id:f.dash?'dash':f.y<FLOOR?(f.vy<0?'jump':'fall'):f.input&A.down?'crouch':Math.abs(f.vx)>1?'walk':'idle';
 let clock=clocks.get(f);
 if(!clock||clock.state!==state||frame<clock.frame||f.stun>clock.stun||f.blockstun>clock.block){clock={state,age:0,frame,stun:f.stun,block:f.blockstun};clocks.set(f,clock);}
 else {if(!frozen)clock.age+=Math.max(0,frame-clock.frame);clock.frame=frame;clock.stun=f.stun;clock.block=f.blockstun;}
 // Reactions and crouch settle into their held pose, instead of vibrating forever.
 return state==='hit'||state==='block'?Math.min(clock.age,6):state==='crouch'?Math.min(clock.age,12):clock.age;
}
