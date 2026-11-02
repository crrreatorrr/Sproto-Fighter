/** Presentation clocks never alter the fixed-step combat state or replay inputs. */
export const EVENT_CLIP_LENGTHS = { intro:4, special:8, cast:4, recoil:4, defeat:12 } as const;
export type EventClipName = keyof typeof EVENT_CLIP_LENGTHS;
/** Optional richer motion for new twin bodies; legacy atlases remain valid. */
export const ACTION_CLIP_LENGTHS = {dash:6,jump:6,heavy:8,airKick:6,victory:6,signatureCast:8} as const;
export const ASSIST_CLIP_LENGTHS = {assistEnter:6,assistAttack:16,assistExit:6,assistVictory:4} as const;
export const IDENTITY_CLIP_LENGTHS = {entrance:8,death:16,ranged:8} as const;
export type AtlasClipName = EventClipName | keyof typeof ACTION_CLIP_LENGTHS | keyof typeof ASSIST_CLIP_LENGTHS | keyof typeof IDENTITY_CLIP_LENGTHS;
export const INTRO_FRAMES = 52, OUTRO_FRAMES = 96;
export interface RoundPresentation {
  phase:'intro'|'fight'|'outro'|'result';
  frame:number;
  winner:0|1|2|null;
  /** A lethal-hit flight has already landed; skip the upright collapse drawings. */
  fromFloor:boolean;
}
export const createRoundPresentation = ():RoundPresentation => ({phase:'intro',frame:0,winner:null,fromFloor:false});
export function advanceRoundPresentation(p:RoundPresentation,skipIntro=false):void {
  if(p.phase==='intro'){
    if(skipIntro||++p.frame>=INTRO_FRAMES){p.phase='fight';p.frame=0;}
  }else if(p.phase==='outro'&&++p.frame>=OUTRO_FRAMES){p.phase='result';p.frame=OUTRO_FRAMES;}
}
export function beginRoundOutro(p:RoundPresentation,winner:0|1|2,fromFloor:boolean):void {
  if(p.phase==='outro'||p.phase==='result')return;
  p.phase='outro';p.frame=0;p.winner=winner;p.fromFloor=fromFloor;
}
const timed=(age:number,durations:readonly number[])=>{
  age=Math.max(0,age);
  for(let i=0;i<durations.length;i++){if(age<durations[i])return i;age-=durations[i];}
  return durations.length-1;
};
export const entranceFrame=(age:number)=>timed(age,[5,6,7,7,7,7,6,7]);
export const deathFrame=(age:number,fromFloor:boolean)=>fromFloor
  ?8+timed(age,[8,8,10,12,12,14,14,18])
  :timed(age,[4,4,5,5,5,5,5,7,6,6,6,6,7,7,8,10]);
export const introFrame=(age:number)=>timed(age,[12,14,14,12]);
export const recoilFrame=(age:number)=>timed(age,[3,5,6,8]);
export const defeatFrame=(age:number,fromFloor:boolean)=>fromFloor
  ?4+timed(age,[8,10,10,12,12,12,14,18])
  :timed(age,[6,6,8,8,8,8,8,8,8,8,10,10]);
/** Every damaging contact uses a contact pose; intervening poses retract.
 * Reuse alternating key drawings deliberately for four/six-hit specials. */
export function specialFrame(age:number,contacts:readonly number[]):number {
  if(!contacts.length)return 0;
  const first=contacts[0],last=contacts[contacts.length-1];
  if(age<first)return age<first*.55?0:1;
  if(age>=last)return age<last+4?6:7;
  let hit=0;for(let i=1;i<contacts.length&&contacts[i]<=age;i++)hit=i;
  return age<contacts[hit]+3?(hit%2?4:2):(hit%2?5:3);
}
export function castFrame(age:number,startup:number,active:number):number {
  // A one-tick spawn window is too brief to read visually. Hold the release
  // drawing into early recovery without moving the projectile/hit timing.
  return age<startup?(age<startup*.55?0:1):age<startup+Math.max(4,active)?2:3;
}
