import { EVENT_CLIP_LENGTHS, introFrame, defeatFrame, specialFrame, castFrame, recoilFrame, type EventClipName, type RoundPresentation } from './animationEvents';
import { A, COMBAT_STYLES, DUO_SPREAD, FLOOR, WIDTH, getMove, type Fighter, type ThrowState } from './core';

/** Complete-character frames, never articulated cutouts. Thirty-two authored poses
 * cover shared actions only; this does not invent missing per-character animation. */
export const POSE_SLOTS = {
  guard:0, breathe:1, walkNear:2, passNear:3, walkFar:4, passFar:5,
  dash:6, jumpAnticipation:7, airRise:8, airFall:9, crouchLanding:10,
  punchWindup:11, punchExtended:12, punchRecover:13, upperWindup:14, uppercut:15,
  kickChamber:16, kickHalf:17, kickFull:18, kickRecover:19,
  sweep:20, sweepRecover:21, airKickChamber:22, airKickFull:23,
  hit:24, block:25, grabReach:26, grabHold:27, throwRelease:28,
  powerCharge:29, powerRelease:30, special:31,
} as const;
export type PoseSlot = typeof POSE_SLOTS[keyof typeof POSE_SLOTS];
type Point = [number, number];
export interface PoseFrameConfig {
  url: string;
  width?: number;
  height?: number;
  /** Foot contact point in this frame's source pixels. */
  anchor?: Point;
  /** Opaque pixel bounds [left, top, right, bottom] for floor-safe reactions. */
  bounds?: [number, number, number, number];
  /** Lean of a reaction pose axis; aligns head-to-feet when resting sideways. */
  fallLean?: number;
  /** Convex opaque-pixel outline: rotated bounds alone can leave a body floating. */
  contactHull?: Point[];
}
export interface PoseAtlasConfig {
  frames: (string | PoseFrameConfig)[];
  /** Optional complete-body walk cycle, 2–64 frames, sharing atlas scale. */
  walkFrames?: (string | PoseFrameConfig)[];
  /** Optional complete-body event sequences; each supplied clip must be complete. */
  clips?: Partial<Record<EventClipName, (string | PoseFrameConfig)[]>>;
  width: number;
  height: number;
  anchor: Point;
  /** Choose exactly one: source-pixel scale, or canonical frame world height. */
  scale?: number;
  worldHeight?: number;
  facing?: 1 | -1;
  /** World travel for one complete L/pass/R/pass cycle; defaults to 72. */
  walkCycleDistance?: number;
  /** Inspected contact points: reaching hands (26), victim torso (24). */
  holdContact?: { hand: Point; torso: Point };
}
export interface PoseAtlasManifest {
  version: 1;
  revision?: string;
  fighters: Record<string, PoseAtlasConfig>;
}
interface LoadedFrame { image: HTMLImageElement; anchor: Point; width: number; height: number; bounds: [number,number,number,number]; fallLean:number; contactHull?:Point[] }
interface Atlas { clips: Partial<Record<EventClipName, LoadedFrame[]>>; frames: LoadedFrame[]; walkFrames?: LoadedFrame[]; scale: number; facing: number; cycle: number; holdContact?: { hand:Point; torso:Point } }
export interface PoseAtlasDebug {
  available: boolean;
  slot: PoseSlot;
  name: string;
  walkPhase: number;
  /** Main pose slot remains available even when a walk sequence replaces it. */
  sequence: 'poses' | 'walk' | EventClipName;
  frameIndex: number;
  sequenceLength: number;
  source: 'authored-full-pose';
}
const atlases = new Map<string, Atlas>();
const declaredAtlases = new Set<string>();
/** Declared but loading/broken art must never silently reveal the old rig. */
export const isPoseAtlasDeclared = (id:string) => declaredAtlases.has(id);
let pending: Promise<boolean> | null = null;
let loadState: 'unrequested' | 'loading' | 'absent' | 'ready' | 'error' = 'unrequested';
let loadError: string | null = null;
export const getPoseAtlasClipInventory = () => Object.fromEntries([...atlases].map(([id,a])=>[id,Object.fromEntries(Object.entries(a.clips).map(([name,frames])=>[name,frames.length]))]));
export const getPoseAtlasLoadStatus = () => ({ state: loadState, error: loadError, ids: [...atlases.keys()] });
const positive = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;
const point = (v: unknown): v is Point => Array.isArray(v) && v.length === 2 && v.every(x => typeof x === 'number' && Number.isFinite(x));
const modulo = (n: number, m: number) => ((n % m) + m) % m;
const names = Object.entries(POSE_SLOTS);
function localUrl(path: string, revision?: string): string {
  // Atlas assets are local application files. No external source is fetched.
  if (!path || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path) || path.includes('\\')) throw new Error('Atlas frame must use a local URL');
  const url = path.startsWith('/') ? path : '/fighters/' + path;
  return revision ? url + (url.includes('?') ? '&' : '?') + 'v=' + encodeURIComponent(revision) : url;
}
async function loadAtlas(id: string, cfg: PoseAtlasConfig, revision?: string): Promise<Atlas> {
  if (!cfg || !Array.isArray(cfg.frames) || cfg.frames.length !== 32 || !positive(cfg.width) || !positive(cfg.height) || !point(cfg.anchor)) throw new Error(`Atlas ${id}: expected 32 frames, positive dimensions and foot anchor`);
  if ((cfg.scale !== undefined && cfg.worldHeight !== undefined) || (cfg.scale !== undefined && !positive(cfg.scale)) || (cfg.worldHeight !== undefined && !positive(cfg.worldHeight))) throw new Error(`Atlas ${id}: specify one positive scale or worldHeight`);
  if (cfg.scale === undefined && cfg.worldHeight === undefined) throw new Error(`Atlas ${id}: scale or worldHeight is required`);
  if (cfg.facing !== undefined && cfg.facing !== 1 && cfg.facing !== -1) throw new Error(`Atlas ${id}: facing must be 1 or -1`);
  if (cfg.walkCycleDistance !== undefined && !positive(cfg.walkCycleDistance)) throw new Error(`Atlas ${id}: invalid walkCycleDistance`);
  if(cfg.holdContact && (![cfg.holdContact.hand,cfg.holdContact.torso].every(p=>point(p)&&p[0]>=0&&p[0]<cfg.width&&p[1]>=0&&p[1]<cfg.height)))throw new Error(`Atlas ${id}: invalid hold contact points`);
  if (cfg.walkFrames !== undefined && (!Array.isArray(cfg.walkFrames) || cfg.walkFrames.length < 2 || cfg.walkFrames.length > 64)) throw new Error(`Atlas ${id}: walkFrames must contain 2–64 frames`);
  if(cfg.clips!==undefined && (!cfg.clips || typeof cfg.clips!=='object' || Array.isArray(cfg.clips)))throw new Error(`Atlas ${id}: clips must be an object`);
  for(const [name,entries] of Object.entries(cfg.clips??{})){
    if(!(name in EVENT_CLIP_LENGTHS)||!Array.isArray(entries)||entries.length!==EVENT_CLIP_LENGTHS[name as EventClipName])throw new Error(`Atlas ${id}: invalid ${name} clip length`);
  }
  const loadFrames = (entries: (string | PoseFrameConfig)[], label:string) => Promise.all(entries.map(async (entry, slot): Promise<LoadedFrame> => {
    const f = typeof entry === 'string' ? { url: entry } : entry;
    if (!f || typeof f.url !== 'string') throw new Error(`Atlas ${id}, ${label} frame ${slot}: missing frame URL`);
    const width = f.width ?? cfg.width, height = f.height ?? cfg.height, anchor = f.anchor ?? cfg.anchor;
    if (!positive(width) || !positive(height) || !point(anchor)) throw new Error(`Atlas ${id}, ${label} frame ${slot}: invalid dimensions or anchor`);
    const bounds = f.bounds ?? [0, 0, width, height];
    if (!Array.isArray(bounds) || bounds.length !== 4 || !bounds.every(Number.isFinite) || bounds[0] < 0 || bounds[1] < 0 || bounds[2] > width || bounds[3] > height || bounds[0] >= bounds[2] || bounds[1] >= bounds[3]) throw new Error(`Atlas ${id}, ${label} frame ${slot}: invalid opaque bounds`);
    if(f.fallLean!==undefined&&(!Number.isFinite(f.fallLean)||Math.abs(f.fallLean)>Math.PI/3))throw new Error(`Atlas ${id}: invalid fall lean`);
    if(f.contactHull&&(!Array.isArray(f.contactHull)||f.contactHull.length<3||f.contactHull.length>128||f.contactHull.some(p=>!point(p)||p[0]<0||p[1]<0||p[0]>width||p[1]>height)))throw new Error(`Atlas ${id}: invalid contact hull`);
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Atlas ${id}, ${label} frame ${slot}: failed to load ${f.url}`));
      img.src = localUrl(f.url, revision);
    });
    if (image.naturalWidth !== width || image.naturalHeight !== height) throw new Error(`Atlas ${id}, ${label} frame ${slot}: image dimensions differ from metadata`);
    return { image, width, height, anchor: [...anchor] as Point, bounds: [...bounds] as LoadedFrame['bounds'], fallLean:f.fallLean??0, contactHull:f.contactHull };
  }));
  const [frames, walkFrames, clipEntries] = await Promise.all([loadFrames(cfg.frames, 'poses'), cfg.walkFrames ? loadFrames(cfg.walkFrames, 'walk') : undefined, Promise.all(Object.entries(cfg.clips??{}).map(async ([name,entries])=>[name,await loadFrames(entries!,name)] as const))]);
  return { frames, walkFrames, clips:Object.fromEntries(clipEntries), scale: cfg.scale ?? cfg.worldHeight! / cfg.height, facing: cfg.facing ?? 1, cycle: cfg.walkCycleDistance ?? 72, holdContact:cfg.holdContact };
}
/** Optional installation: 404 or an empty roster returns false. Invalid manifests
 * and failed assets reject and expose an error status; no partial atlas is used.
 * Calling again after absence/error retries, allowing later asset installation. */
export function loadPoseAtlases(): Promise<boolean> {
  if (pending) return pending;
  loadState = 'loading'; loadError = null;
  pending = (async () => {
    const response = await fetch('/fighters/pose-atlas.json', { cache: 'no-store' });
    if (response.status === 404 || (response.ok && response.headers.get('content-type')?.includes('text/html'))) {
      // Development SPA servers can return their HTML shell for missing files.
      atlases.clear(); declaredAtlases.clear(); loadState = 'absent'; return false;
    }
    if (!response.ok) throw new Error(`Pose atlas metadata: HTTP ${response.status}`);
    const manifest = await response.json() as PoseAtlasManifest;
    if (manifest?.version !== 1 || !manifest.fighters || typeof manifest.fighters !== 'object' || Array.isArray(manifest.fighters)) throw new Error('Unsupported pose atlas manifest');
    declaredAtlases.clear(); for(const id of Object.keys(manifest.fighters))declaredAtlases.add(id);
    atlases.clear();
    const loaded = await Promise.all(Object.entries(manifest.fighters).map(async ([id, cfg]) => [id, await loadAtlas(id, cfg, manifest.revision)] as const));
    atlases.clear(); for (const [id, atlas] of loaded) atlases.set(id, atlas);
    loadState = loaded.length ? 'ready' : 'absent';
    return loaded.length > 0;
  })().catch((error: unknown) => {
    loadState = 'error'; loadError = error instanceof Error ? error.message : String(error); throw error;
  }).finally(() => { pending = null; });
  return pending;
}
interface Playback { frame:number; x:number; y:number; travel:number; stamp:string; slot:PoseSlot; landedAt:number; idleSince:number }
const playback = new WeakMap<Fighter, Playback>();
/** Stable full-body actors, not articulated limb cutouts. Formation is fixed in
 * world space, so changing facing cannot exchange the two entities instantly. */
const duos = new WeakMap<Fighter, [Fighter,Fighter]>();
const componentOwner = new WeakMap<Fighter, {owner:Fighter; side:-1|1}>();
const sceneActor = (f:Fighter) => componentOwner.get(f)?.owner ?? f;
function duoLeadSide(owner:Fighter):number {
  return throwScene?.fighters[throwScene.state.attacker]===owner?throwScene.state.facing:owner.facing;
}
function duoActors(owner:Fighter):[Fighter,Fighter] {
  let actors=duos.get(owner);
  if(!actors){actors=[{...owner},{...owner}];duos.set(owner,actors);actors.forEach((actor,i)=>componentOwner.set(actor,{owner,side:i===0?-1:1}));}
  actors.forEach((actor,i)=>{
    const side=i===0?-1:1;
    Object.assign(actor,owner,{x:owner.x+side*DUO_SPREAD});
    // Only the front actor supplies normal melee contact; the other covers.
    // Events, aerial locomotion, recoil and defeat still use each own drawings.
    if(side!==duoLeadSide(owner) && owner.move && owner.move.id!=='special' && owner.move.id!=='bolt')actor.move=null;
  });
  return actors;
}
let throwScene: {state:ThrowState; fighters:readonly Fighter[]}|null = null;
/** Set once per render using actual core fighter objects. */
export function setPoseAtlasThrowState(state:ThrowState|null,fighters:readonly Fighter[]):void { throwScene=state?{state,fighters}:null; }
let presentationScene:{presentation:RoundPresentation;fighters:readonly Fighter[]}|null=null;
/** Stable actual fighter identities prevent presentation clips affecting assists. */
export function setPoseAtlasPresentation(presentation:RoundPresentation|null,fighters:readonly Fighter[]):void {presentationScene=presentation?{presentation,fighters}:null;}
const assistTiming=new WeakMap<Fighter,readonly number[]>();
const floorDefeat=(f:Fighter,p:RoundPresentation)=>p.fromFloor||(f.reaction?.kind==='knockdown'&&f.reaction.phase==='down');
/** The caller updates the stable assist object's move.t from its owner's clock. */
export function setPoseAtlasAssistTiming(f:Fighter,contacts:readonly number[]):void {assistTiming.set(f,contacts);}
function eventSelection(f:Fighter,atlas:Atlas|undefined):{sequence:EventClipName;frameIndex:number}|null {
  if(!atlas)return null;
  const choose=(sequence:EventClipName,frameIndex:number)=>atlas.clips[sequence]?{sequence,frameIndex}:null;
  const owner=sceneActor(f);
  const p=presentationScene?.presentation,index=presentationScene?.fighters.indexOf(owner)??-1;
  if(p&&index>=0){
    if(p.phase==='intro')return choose('intro',introFrame(p.frame));
    if((p.phase==='outro'||p.phase==='result')&&p.winner!==null&&(p.winner===2||index!==p.winner))return choose('defeat',defeatFrame(p.frame,floorDefeat(f,p)));
  }
  // Held/released throw participants retain their authored throw/fall path.
  if(throwScene&&throwScene.fighters.some((actor,i)=>actor===owner&&(i===throwScene!.state.attacker||i===throwScene!.state.victim)))return null;
  if(f.reaction?.kind==='recoil'&&f.y>=FLOOR&&!f.blockstun)return choose('recoil',recoilFrame(f.reaction.t));
  if(f.stun||f.blockstun||f.reaction?.kind==='knockdown')return null;
  if(f.move?.id==='special'){
    const contacts=assistTiming.get(owner)??COMBAT_STYLES[f.id].specialFrames;
    let key=specialFrame(f.move.t,contacts);
    const component=componentOwner.get(f);
    if(component&&f.move.t>=contacts[0]&&f.move.t<contacts[contacts.length-1]+4){
      let beat=0;for(let i=1;i<contacts.length&&contacts[i]<=f.move.t;i++)beat=i;
      // Double Take trades contacts between two whole bodies. The other actor
      // visibly covers/retracts, rather than punching through its teammate.
      const strikingSide=duoLeadSide(owner)*(beat%2?-1:1);
      if(component.side!==strikingSide)key=beat%2?3:5;
    }
    return choose('special',key);
  }
  if(f.move?.id==='bolt'){const move=getMove(f,'bolt');return choose('cast',castFrame(f.move.t,move.startup,move.active));}
  return null;
}
function walking(f: Fighter): boolean { return f.y >= FLOOR && Math.abs(f.vx) > .5 && !f.move && !f.stun && !f.blockstun && !f.dash && !(f.input & A.down); }
function selectSlot(f:Fighter,phase:number,frame:number,landedAt:number,idleSince:number):PoseSlot {
  const S=POSE_SLOTS;
  if(f.reaction?.phase==='rise')return f.reaction.t<4?S.crouchLanding:S.guard;
  // Let the impact silhouette relax into a complete falling pose. A rotated
  // braced hit pose reads as balancing on its palm rather than lying down.
  if(f.reaction?.kind==='knockdown'&&(f.reaction.phase==='down'||f.reaction.t>=6))return S.airFall;
  if(throwScene){
    const {state,fighters}=throwScene;
    // The clasped pose has both fists at the actor's own sternum. The reaching
    // pose actually puts the hands on the opponent rather than hiding them.
    if(sceneActor(f)===fighters[state.attacker]){
      const component=componentOwner.get(f);
      if(component&&component.side!==state.facing)return S.block;
      if(state.phase==='hold')return S.grabReach;
      if(state.t<6)return state.direction==='up'?S.uppercut:S.throwRelease;
      return state.t<10?S.grabHold:S.punchRecover;
    }
    // No invented victim-specific pose: the authored full-body hit reaction is
    // carried at the actual core hold/release position without limb deformation.
    if(sceneActor(f)===fighters[state.victim]&&state.phase==='hold')return S.hit;
  }
  if(f.stun)return S.hit;
  if(f.blockstun)return S.block;
  const attack=f.move;
  if(attack){
    const move=getMove(f,attack.id),t=attack.t;
    const startup=t<move.startup,active=t>=move.startup&&t<move.startup+move.active;
    if(attack.id==='special'){
      const contacts=COMBAT_STYLES[f.id].specialFrames,last=contacts[contacts.length-1];
      if(t<contacts[0])return S.powerCharge;
      if(t>=last&&t<last+3)return S.special;
      if(contacts.some(hit=>t>=hit&&t<hit+3))return S.powerRelease;
      return t>last+2?S.punchRecover:S.powerCharge;
    }
    if(attack.id==='bolt')return startup?S.powerCharge:active?S.powerRelease:S.punchRecover;
    if(attack.id==='launcher')return startup?S.upperWindup:active?S.uppercut:S.punchRecover;
    if(attack.id==='grab')return startup||active?S.grabReach:S.punchRecover;
    if(attack.id==='sweep')return startup?S.kickChamber:active?S.sweep:S.sweepRecover;
    if(attack.id==='airMedium'||attack.id==='airHeavy')return startup?S.airKickChamber:active?S.airKickFull:S.airFall;
    if(attack.id==='medium'){
      if(startup)return t<move.startup*.55?S.kickChamber:S.kickHalf;
      if(active)return S.kickFull;
      const recover=t-move.startup-move.active;
      // Unwind extension, rechamber briefly, then plant. The landing/crouch
      // pose caused an unrelated deep squat after every kick. A grounded
      // recovery pose also keeps commitment visible until the last frames.
      return recover<2?S.kickHalf:recover<5?S.kickRecover:
        recover<move.recovery-3?S.punchRecover:S.guard;
    }
    return startup?S.punchWindup:active?S.punchExtended:S.punchRecover;
  }
  if(f.y<FLOOR)return f.vy<0?S.airRise:S.airFall;
  if(f.jumpDelay>0)return S.jumpAnticipation;
  if((f.input&A.down)||frame-landedAt<3)return S.crouchLanding;
  if(f.dash)return S.dash;
  if(walking(f))return [S.walkNear,S.passNear,S.walkFar,S.passFar][Math.floor(phase*4)%4];
  // Re-enter the authored guard after locomotion/recovery. Using global time
  // could jump straight to a differently posed breath on the stop frame.
  const idleAge=Math.max(0,frame-idleSince);
  if(idleAge<36)return S.guard;
  return Math.floor((idleAge+(componentOwner.get(f)?.side===1?18:0))/36)%2?S.breathe:S.guard;
}
function sample(f:Fighter,frame:number,frozen:boolean,atlasId:string=f.id,phaseOffset=0):PoseAtlasDebug {
  const atlas=atlases.get(atlasId),cycle=atlas?.cycle??72;
  const scene=throwScene?.state;
  const stamp=[f.x,f.y,f.move?.id,f.move?.t,f.stun,f.blockstun,f.dash,scene?.phase,scene?.t].join(':');
  let state=playback.get(f);
  if(!state||frame<state.frame){state={frame,x:f.x,y:f.y,travel:0,stamp:'',slot:0,landedAt:-100,idleSince:frame};playback.set(f,state);}
  if(frame!==state.frame&&!frozen){
    // Backsteps reverse the authored gait instead of moonwalking the forward
    // cycle. This is rendering state only; combat and replay inputs are untouched.
    if(walking(f))state.travel+=(f.x-state.x)*f.facing;
    if(state.y<FLOOR&&f.y>=FLOOR)state.landedAt=frame;
    if(f.move||f.stun||f.blockstun||f.dash||f.y<FLOOR||Math.abs(f.vx)>.5||(f.input&A.down))state.idleSince=frame;
  }
  const phase=modulo(state.travel+cycle*phaseOffset,cycle)/cycle;
  if(!frozen||state.stamp!==stamp)state.slot=selectSlot(f,phase,frame,state.landedAt,state.idleSince);
  state.frame=frame;state.x=f.x;state.y=f.y;state.stamp=stamp;
  const sequence = atlas?.walkFrames && state.slot >= POSE_SLOTS.walkNear && state.slot <= POSE_SLOTS.passFar ? 'walk' : 'poses';
  const sequenceLength = sequence === 'walk' ? atlas!.walkFrames!.length : 32;
  const frameIndex = sequence === 'walk' ? Math.min(sequenceLength - 1, Math.floor(phase * sequenceLength)) : state.slot;
  const event=eventSelection(f,atlas);
  if(event)return {available:true,slot:state.slot,name:event.sequence,walkPhase:phase,...event,sequenceLength:atlas!.clips[event.sequence]!.length,source:'authored-full-pose'};
  return {available:!!atlas,slot:state.slot,name:names.find(([,slot])=>slot===state.slot)![0],walkPhase:phase,sequence,frameIndex,sequenceLength,source:'authored-full-pose'};
}
export function getPoseAtlasDebug(f: Fighter, frame: number, frozen = false): PoseAtlasDebug {
  if(f.id==='duo'){const i=duoLeadSide(f)===1?1:0;return sample(duoActors(f)[i],frame,frozen,i===0?'duo':'duo-blue',i*.5);}
  return sample(f, frame, frozen);
}
/** Review both entities explicitly; the logical fighter debug reports its lead. */
export function getDuoPoseDebug(f:Fighter,frame:number,frozen=false){
  return f.id==='duo'?duoActors(f).map((actor,i)=>({entity:i===0?'red':'blue',x:actor.x,y:actor.y,...sample(actor,frame,frozen,i===0?'duo':'duo-blue',i*.5)})):[];
}
/** One connected body rotates around its opaque center. The core owns throw
 * contact; no secondary hand offset or independently animated limb remains.
 * Bounds keep a knocked-down body on the floor and inside the camera. */
function reactionTransform(f:Fighter,atlas:Atlas,source:LoadedFrame,enabled:boolean) {
  const r=enabled?f.reaction:null;
  let angle=0;
  const restAngle=r?r.direction*Math.PI/2+f.facing*atlas.facing*source.fallLean:0;
  if(r?.phase==='down')angle=restAngle;
  else if(r?.phase==='flight'){
    if(r.kind==='knockdown')angle=restAngle*.96*Math.min(1,r.t/18);
    else if(r.kind==='launch')angle=r.direction*Math.min(.42,r.t*.035);
    else angle=r.direction*.13*Math.sin(Math.PI*Math.min(1,r.t/12));
  }
  if(!angle)return {x:f.x,y:f.y,angle:0,pivotX:0,pivotY:0,corners:[[0,0]]};
  const pivotX=(source.bounds[0]+source.bounds[2])/2-source.anchor[0];
  const pivotY=(source.bounds[1]+source.bounds[3])/2-source.anchor[1];
  const flip=f.facing*atlas.facing,scale=atlas.scale;
  let x=f.x+flip*scale*pivotX,y=f.y+scale*pivotY;
  const corners=(source.contactHull??[[source.bounds[0],source.bounds[1]],[source.bounds[2],source.bounds[1]],[source.bounds[2],source.bounds[3]],[source.bounds[0],source.bounds[3]]]).map(([bx,by])=>{
    const px=(bx-source.anchor[0]-pivotX)*flip*scale,py=(by-source.anchor[1]-pivotY)*scale;
    return [px*Math.cos(angle)-py*Math.sin(angle),px*Math.sin(angle)+py*Math.cos(angle)];
  });
  if(angle){
    const left=Math.min(...corners.map(p=>p[0])),right=Math.max(...corners.map(p=>p[0])),bottom=Math.max(...corners.map(p=>p[1]));
    x=Math.max(6-left,Math.min(WIDTH-6-right,x));
    // A floor knockdown rests on the ground, rather than hovering at the
    // original standing foot anchor. Flight only clamps at floor contact.
    y=r?.kind==='knockdown'?(r.phase==='down'?FLOOR:f.y)-bottom:Math.min(y,FLOOR-bottom);
  }
  return {x,y,angle,pivotX,pivotY,corners};
}
export function getPoseAtlasReactionTransform(f:Fighter,slot?:PoseSlot){
  slot??=f.reaction?.kind==='knockdown'&&(f.reaction.phase==='down'||f.reaction.t>=6)?POSE_SLOTS.airFall:POSE_SLOTS.hit;
  const atlas=atlases.get(f.id);return atlas?reactionTransform(f,atlas,atlas.frames[slot],true):null;
}
function paintData(f:Fighter,slot:PoseSlot,sampled:PoseAtlasDebug|undefined,atlasId:string) {
  const atlas=atlases.get(atlasId);if(!atlas)return null;
  const event=sampled && sampled.sequence!=='poses' && sampled.sequence!=='walk' ? sampled.sequence : null;
  const source = event ? atlas.clips[event]![sampled!.frameIndex] : sampled?.sequence === 'walk' ? atlas.walkFrames![sampled.frameIndex] : atlas.frames[slot];
  // Event drawings already contain their authored body attitude and floor anchor.
  const transform=reactionTransform(f,atlas,source,!!sampled && !event);
  // A knocked-back body already landed head-first in its impact direction.
  // Preserve that whole-body orientation when entering the authored floor rest;
  // otherwise the defeated fighter flips ends at the KO presentation boundary.
  const p=presentationScene?.presentation;
  const facing=event==='defeat'&&p&&floorDefeat(f,p)?f.reaction?.direction??f.facing:f.facing;
  if(event==='defeat'){
    const flip=facing*atlas.facing*atlas.scale;
    const x0=(source.bounds[0]-source.anchor[0])*flip,x1=(source.bounds[2]-source.anchor[0])*flip;
    transform.x=Math.max(Math.ceil(6-Math.min(x0,x1)),Math.min(Math.floor(WIDTH-6-Math.max(x0,x1)),Math.round(transform.x)));
  }
  return {atlas,source,transform,facing};
}
type PaintData=NonNullable<ReturnType<typeof paintData>>;
function paintBounds(data:PaintData):[number,number] {
  const {source,transform:t,atlas,facing}=data;
  const points=source.contactHull??[[source.bounds[0],source.bounds[1]],[source.bounds[2],source.bounds[1]],[source.bounds[2],source.bounds[3]],[source.bounds[0],source.bounds[3]]];
  const xs=points.map(([x,y])=>t.x+(x-source.anchor[0]-t.pivotX)*facing*atlas.facing*atlas.scale*Math.cos(t.angle)-(y-source.anchor[1]-t.pivotY)*atlas.scale*Math.sin(t.angle));
  return [Math.min(...xs),Math.max(...xs)];
}
/** Falling bodies are wider than standing bodies. Separate their complete
 * silhouettes as one camera-bounded formation, without changing hit/throw state.
 * The low feet/floor anchors remain untouched. */
function duoLayout(owner:Fighter,actors:[Fighter,Fighter],samples:PoseAtlasDebug[]) {
  const data=actors.map((actor,i)=>paintData(actor,samples[i].slot,samples[i],i===0?'duo':'duo-blue')!);
  const bounds=data.map(paintBounds),offsets=[0,0];
  const special=owner.move?.id==='special';
  if(owner.reaction?.kind==='knockdown'||samples.some(s=>s.sequence==='defeat'||s.sequence==='recoil')||special){
    let separation=Math.max(0,(bounds[0][1]+12-bounds[1][0])/2);
    if(special){
      // Open a stable formation before impact. Use the whole clip envelope so
      // alternating keys cannot make spacing jump on every contact.
      const envelopes=actors.map((actor,i)=>{
        const atlas=atlases.get(i===0?'duo':'duo-blue')!,flip=actor.facing*atlas.facing*atlas.scale;
        const xs=atlas.clips.special!.flatMap(s=>[(s.bounds[0]-s.anchor[0])*flip+actor.x,(s.bounds[2]-s.anchor[0])*flip+actor.x]);
        return [Math.min(...xs),Math.max(...xs)];
      });
      const move=getMove(owner,'special'),age=owner.move!.t,total=move.startup+move.active+move.recovery;
      const ramp=Math.min(1,age/8,Math.max(0,(total-age)/8));
      separation=Math.max(separation,Math.max(0,(envelopes[0][1]+12-envelopes[1][0])/2)*ramp);
    }
    if(owner.reaction?.phase==='rise'){
      // Keep the return from wide floor rest continuous for the get-up frames.
      const rest=actors.map((actor,i)=>{
        const fallen={...actor,reaction:{...owner.reaction!,phase:'down' as const}};
        return paintBounds(paintData(fallen,POSE_SLOTS.airFall,{...samples[i],sequence:'poses',slot:POSE_SLOTS.airFall,frameIndex:POSE_SLOTS.airFall},i===0?'duo':'duo-blue')!);
      });
      separation=Math.max(separation,Math.max(0,(rest[0][1]+12-rest[1][0])/2)*Math.max(0,1-owner.reaction.t/10));
    }
    offsets[0]=-separation;offsets[1]=separation;
    const left=bounds[0][0]+offsets[0],right=bounds[1][1]+offsets[1];
    const shift=left<6?6-left:right>WIDTH-6?WIDTH-6-right:0;
    offsets[0]+=shift;offsets[1]+=shift;
  }
  return {data,offsets,bounds:bounds.map(([l,r],i)=>[l+offsets[i],r+offsets[i]])};
}
export function getDuoLayoutDebug(f:Fighter,frame:number) {
  const actors=duoActors(f),samples=actors.map((actor,i)=>sample(actor,frame,false,i===0?'duo':'duo-blue',i*.5));
  const {bounds,offsets}=duoLayout(f,actors,samples);return {bounds,offsets};
}
function paint(c: CanvasRenderingContext2D, f: Fighter, slot: PoseSlot, ghost: boolean, sampled?: PoseAtlasDebug, atlasId:string=f.id,offsetX=0): boolean {
  const data=paintData(f,slot,sampled,atlasId);if(!data)return false;
  const {atlas,source,transform,facing}=data;
  c.save(); c.translate(Math.round(transform.x+offsetX),Math.round(transform.y));
  c.rotate(transform.angle); c.scale(facing * atlas.facing * atlas.scale, atlas.scale); c.imageSmoothingEnabled = false;
  if (ghost) c.globalAlpha *= .55;
  if (f.flash > 0 && f.flash % 4 < 2) c.filter = 'brightness(1.8)';
  c.drawImage(source.image, -source.anchor[0]-transform.pivotX, -source.anchor[1]-transform.pivotY); c.restore(); return true;
}
/** False means no installed complete atlas; caller decides the fallback. */
export function drawPoseAtlas(c: CanvasRenderingContext2D, f: Fighter, frame: number, ghost = false, frozen = false): boolean {
  if (!atlases.has(f.id)) return false;
  if(f.id==='duo'){
    if(!atlases.has('duo-blue'))return false;
    const actors=duoActors(f),order=duoLeadSide(f)===1?[0,1]:[1,0];
    const samples=actors.map((actor,i)=>sample(actor,frame,frozen,i===0?'duo':'duo-blue',i*.5));
    const layout=duoLayout(f,actors,samples);
    for(const i of order){const id=i===0?'duo':'duo-blue';paint(c,actors[i],samples[i].slot,ghost,samples[i],id,layout.offsets[i]);}
    return true;
  }
  const sampled = sample(f, frame, frozen);
  return paint(c, f, sampled.slot, ghost, sampled);
}
/** Explicit slot sampling for an atlas review page, or ordinary playback when omitted. */
export function drawPoseAtlasSample(c: CanvasRenderingContext2D, f: Fighter, frame: number, slotOverride?: PoseSlot): boolean {
  if (slotOverride !== undefined && (!Number.isInteger(slotOverride) || slotOverride < 0 || slotOverride > 31)) throw new Error('Pose slot must be 0–31');
  if(f.id==='duo'){
    if(slotOverride===undefined)return drawPoseAtlas(c,f,frame);
    return duoActors(f).map((actor,i)=>paint(c,actor,slotOverride,false,undefined,i===0?'duo':'duo-blue')).every(Boolean);
  }
  const sampled = slotOverride === undefined ? sample(f, frame, false) : undefined;
  return paint(c, f, slotOverride ?? sampled!.slot, false, sampled);
}
