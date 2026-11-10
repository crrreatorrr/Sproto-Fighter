/** Resolve public art under the build's HTML base; Node/diagnostic fixtures use root paths. */
const asset=(path:string)=>{
 const base=typeof document==='undefined'?'/':(document.querySelector?.('meta[name="sproto-asset-base"]') as HTMLMetaElement|null)?.content||'/';
 return base+path.replace(/^\/+/, '');
};
import { EVENT_CLIP_LENGTHS, ACTION_CLIP_LENGTHS, ASSIST_CLIP_LENGTHS, IDENTITY_CLIP_LENGTHS, entranceFrame, deathFrame, introFrame, defeatFrame, specialFrame, castFrame, recoilFrame, type AtlasClipName, type RoundPresentation } from './animationEvents';
import { A, ROSTER, COMBAT_STYLES, hasAuthoredProjectile, CHARACTER_ACTIONS, DUO_SPREAD, FLOOR, WIDTH, getMove, bodyAtlasIds, bodyOffsets, specialPartnerIds, PARTNER_ATTACKS, partnerContactIndex, isPairedFighter, isCrouchingSpit, type Fighter, type ThrowState } from './core';

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
  /** Added by scripts/build-sheets.py in built games: one image holding every frame.
   * A cell is [x, y] (the whole frame at that top-left) or [x, y, w, h, offsetX, offsetY]:
   * the frame with its transparent margin trimmed, where (offsetX, offsetY) is the
   * trimmed rectangle's top-left in the frame's own source pixels. The crop lives only
   * here, so frame metadata (anchor, bounds, hull, holdContact) never changes and the
   * individual-PNG fallback stays correct. */
  sheet?: { url: string; cells: Record<string, SheetCell> };
  frames: (string | PoseFrameConfig)[];
  /** Optional complete-body walk cycle, 2–64 frames, sharing atlas scale. */
  walkFrames?: (string | PoseFrameConfig)[];
  /** Optional complete-body event sequences; each supplied clip must be complete. */
  clips?: Partial<Record<AtlasClipName, (string | PoseFrameConfig)[]>>;
  /** Reviewed source-sheet calibration, constant for every cel in a clip.
   * Corrects a differently drawn pixel density/origin; never auto-fits a pose.
   * Raw PNGs and their metadata stay in source pixels. */
  clipRegistration?: Partial<Record<AtlasClipName, { pixelScale:number; anchorOffset:Point }>>;
  /** The same reviewed source-sheet calibration for an independently drawn walk cycle. */
  walkRegistration?: { pixelScale:number; anchorOffset:Point };
  /** Explicitly reviewed source-density correction for an older standalone
   * pose. Never inferred from the current silhouette or changed during play. */
  poseRegistration?: Partial<Record<keyof typeof POSE_SLOTS, { pixelScale:number; anchorOffset:Point }>>;
  width: number;
  height: number;
  anchor: Point;
  /** Choose exactly one: source-pixel scale, or canonical frame world height. */
  scale?: number;
  /** Presentation multiplier. Authored gameplay grips still use the base scale. */
  visualScale?:number;
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
export type SheetCell = [number, number] | [number, number, number, number, number, number];
/** A decoded frame: its own image, or a region of the body's one sprite-sheet bitmap. */
type FrameImage = HTMLImageElement | ImageBitmap;
const imageSize = (image: FrameImage) => 'naturalWidth' in image ? [image.naturalWidth, image.naturalHeight] : [image.width, image.height];
/** Sheet region [sx, sy, sw, sh, offsetX, offsetY]: source rectangle in the sheet and its
 * top-left within the frame's own source pixels. Absent when the frame is its own image. */
type FrameRegion = readonly [number, number, number, number, number, number];
interface LoadedFrame { image: FrameImage; region?: FrameRegion; density: number; anchor: Point; width: number; height: number; bounds: [number,number,number,number]; fallLean:number; contactHull?:Point[] }
interface Atlas { clips: Partial<Record<AtlasClipName, LoadedFrame[]>>; frames: LoadedFrame[]; walkFrames?: LoadedFrame[]; scale: number; facing: number; cycle: number; holdContact?: { hand:Point; torso:Point };
  /** Decoded RGBA bytes this body holds, and the bitmaps to release when it is evicted. */
  bytes: number; bitmaps: ImageBitmap[] }
export interface PoseAtlasDebug {
  available: boolean;
  slot: PoseSlot;
  name: string;
  walkPhase: number;
  /** Main pose slot remains available even when a walk sequence replaces it. */
  sequence: 'poses' | 'walk' | AtlasClipName;
  frameIndex: number;
  sequenceLength: number;
  source: 'authored-full-pose';
}
const atlases = new Map<string, Atlas>();
const movementFormations = new Map<string, MovementFormation>();
const dashFormations = new Map<string, DashFormation>();
const declaredAtlases = new Set<string>();
/** Declared but loading/broken art must never silently reveal the old rig. */
export const isPoseAtlasDeclared = (id:string) => declaredAtlases.has(id);
let pending: Promise<boolean> | null = null;
let loadState: 'unrequested' | 'loading' | 'absent' | 'ready' | 'error' = 'unrequested';
let loadError: string | null = null;
export const getPoseAtlasClipInventory = () => Object.fromEntries([...atlases].map(([id,a])=>[id,Object.fromEntries(Object.entries(a.clips).map(([name,frames])=>[name,frames.length]))]));
export const getPoseAtlasLoadStatus = () => ({ state: loadState, error: loadError, ids: [...atlases.keys()],
  decodedBytes: [...atlases.values()].reduce((sum, a) => sum + a.bytes, 0), sheets: [...atlases.values()].filter(a => a.bitmaps.length).length });
/** Field kill switch: `?atlas=frames` ignores built sprite sheets and loads every frame PNG. */
const sheetsDisabled = () => typeof location !== 'undefined' && new URLSearchParams(location.search).get('atlas') === 'frames';
const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error(`failed to load ${url}`));
  img.src = url;
});
/** The only two places that read a frame's pixels. Frames loaded as their own image keep
 * the exact Canvas calls the game always made; sheet regions place the trimmed rectangle
 * where it sat inside the full frame, so the drawn result is identical. */
function drawFrame(c: CanvasRenderingContext2D, f: LoadedFrame, dx: number, dy: number, natural = false): void {
  const r = f.region;
  if (!r) { if (natural) c.drawImage(f.image, dx, dy); else c.drawImage(f.image, dx, dy, f.width, f.height); return; }
  if (f.image.width === 0) return; // released by eviction: never drawn, but never throw mid-frame
  const k = natural ? 1 : f.density;
  c.drawImage(f.image, r[0], r[1], r[2], r[3], dx + r[4] * k, dy + r[5] * k, r[2] * k, r[3] * k);
}
/** Draw part (sx, sy, sw, sh) of a frame, in its own source pixels, into (dx, dy, dw, dh). */
function drawFrameRect(c: CanvasRenderingContext2D, f: LoadedFrame, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void {
  const r = f.region;
  if (!r) { c.drawImage(f.image, sx, sy, sw, sh, dx, dy, dw, dh); return; }
  const x0 = Math.max(sx, r[4]), y0 = Math.max(sy, r[5]), x1 = Math.min(sx + sw, r[4] + r[2]), y1 = Math.min(sy + sh, r[5] + r[3]);
  if (x1 <= x0 || y1 <= y0) return; // only trimmed transparent pixels were requested
  const kx = dw / sw, ky = dh / sh;
  c.drawImage(f.image, r[0] + x0 - r[4], r[1] + y0 - r[5], x1 - x0, y1 - y0, dx + (x0 - sx) * kx, dy + (y0 - sy) * ky, (x1 - x0) * kx, (y1 - y0) * ky);
}
const positive = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;
const point = (v: unknown): v is Point => Array.isArray(v) && v.length === 2 && v.every(x => typeof x === 'number' && Number.isFinite(x));
const modulo = (n: number, m: number) => ((n % m) + m) % m;
const names = Object.entries(POSE_SLOTS);
function localUrl(path: string, revision?: string): string {
  // Atlas assets are local application files. No external source is fetched.
  if (!path || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path) || path.includes('\\')) throw new Error('Atlas frame must use a local URL');
  const url = asset(path.startsWith('/') ? path : '/fighters/' + path);
  return revision ? url + (url.includes('?') ? '&' : '?') + 'v=' + encodeURIComponent(revision) : url;
}
async function loadAtlas(id: string, cfg: PoseAtlasConfig, revision?: string): Promise<Atlas> {
  if (!cfg || !Array.isArray(cfg.frames) || cfg.frames.length !== 32 || !positive(cfg.width) || !positive(cfg.height) || !point(cfg.anchor)) throw new Error(`Atlas ${id}: expected 32 frames, positive dimensions and foot anchor`);
  if ((cfg.scale !== undefined && cfg.worldHeight !== undefined) || (cfg.scale !== undefined && !positive(cfg.scale)) || (cfg.worldHeight !== undefined && !positive(cfg.worldHeight))) throw new Error(`Atlas ${id}: specify one positive scale or worldHeight`);
  if(cfg.visualScale!==undefined&&!positive(cfg.visualScale))throw new Error(`Atlas ${id}: invalid visual scale`);
  if (cfg.scale === undefined && cfg.worldHeight === undefined) throw new Error(`Atlas ${id}: scale or worldHeight is required`);
  if (cfg.facing !== undefined && cfg.facing !== 1 && cfg.facing !== -1) throw new Error(`Atlas ${id}: facing must be 1 or -1`);
  if (cfg.walkCycleDistance !== undefined && !positive(cfg.walkCycleDistance)) throw new Error(`Atlas ${id}: invalid walkCycleDistance`);
  if(cfg.holdContact && (![cfg.holdContact.hand,cfg.holdContact.torso].every(p=>point(p)&&p[0]>=0&&p[0]<cfg.width&&p[1]>=0&&p[1]<cfg.height)))throw new Error(`Atlas ${id}: invalid hold contact points`);
  if (cfg.walkFrames !== undefined && (!Array.isArray(cfg.walkFrames) || cfg.walkFrames.length < 2 || cfg.walkFrames.length > 64)) throw new Error(`Atlas ${id}: walkFrames must contain 2–64 frames`);
  if(cfg.clips!==undefined && (!cfg.clips || typeof cfg.clips!=='object' || Array.isArray(cfg.clips)))throw new Error(`Atlas ${id}: clips must be an object`);
  for(const [name,entries] of Object.entries(cfg.clips??{})){
    if(!(name in {...EVENT_CLIP_LENGTHS,...ACTION_CLIP_LENGTHS,...ASSIST_CLIP_LENGTHS,...IDENTITY_CLIP_LENGTHS})||!Array.isArray(entries)||entries.length!==({...EVENT_CLIP_LENGTHS,...ACTION_CLIP_LENGTHS,...ASSIST_CLIP_LENGTHS,...IDENTITY_CLIP_LENGTHS})[name as AtlasClipName])throw new Error(`Atlas ${id}: invalid ${name} clip length`);
  }
  if(cfg.clipRegistration!==undefined && (!cfg.clipRegistration || typeof cfg.clipRegistration!=='object' || Array.isArray(cfg.clipRegistration)))throw new Error(`Atlas ${id}: clipRegistration must be an object`);
  for(const [name,registration] of Object.entries(cfg.clipRegistration??{})){
    if(!cfg.clips?.[name as AtlasClipName] || !registration || !positive(registration.pixelScale) || registration.pixelScale<.5 || registration.pixelScale>2 || !point(registration.anchorOffset))throw new Error(`Atlas ${id}: invalid ${name} source registration`);
  }
  if(cfg.walkRegistration!==undefined && (!cfg.walkFrames || !cfg.walkRegistration || typeof cfg.walkRegistration!=='object' || !positive(cfg.walkRegistration.pixelScale) || cfg.walkRegistration.pixelScale<.5 || cfg.walkRegistration.pixelScale>2 || !point(cfg.walkRegistration.anchorOffset)))throw new Error(`Atlas ${id}: invalid walk source registration`);
  if(cfg.poseRegistration!==undefined && (!cfg.poseRegistration || typeof cfg.poseRegistration!=='object' || Array.isArray(cfg.poseRegistration)))throw new Error(`Atlas ${id}: poseRegistration must be an object`);
  for(const [name,registration] of Object.entries(cfg.poseRegistration??{})){
    if(!Object.hasOwn(POSE_SLOTS,name) || !registration || !positive(registration.pixelScale) || registration.pixelScale<.5 || registration.pixelScale>2 || !point(registration.anchorOffset))throw new Error(`Atlas ${id}: invalid ${name} pose registration`);
  }
  // One request for the whole body when the build packed a sprite sheet; individual frames otherwise or if it fails.
  // The sheet is decoded once into one bitmap that every frame draws a region of: no
  // per-frame copies, and the browser cannot discard and re-decode it mid-fight.
  const sheetImage: Promise<ImageBitmap | null> | null = cfg.sheet && typeof createImageBitmap === 'function' && !sheetsDisabled()
    ? loadImage(asset(cfg.sheet.url)).then(img => createImageBitmap(img)).catch(() => {
      console.warn(`Atlas ${id}: sprite sheet failed to load; using individual frames`); return null;
    })
    : null;
  const ownImages = new Set<HTMLImageElement>();
  const loadFrames = (entries: (string | PoseFrameConfig)[], label:string) => Promise.all(entries.map(async (entry, slot): Promise<LoadedFrame> => {
    const f = typeof entry === 'string' ? { url: entry } : entry;
    if (!f || typeof f.url !== 'string') throw new Error(`Atlas ${id}, ${label} frame ${slot}: missing frame URL`);
    const width = f.width ?? cfg.width, height = f.height ?? cfg.height, anchor = f.anchor ?? cfg.anchor;
    if (!positive(width) || !positive(height) || !point(anchor)) throw new Error(`Atlas ${id}, ${label} frame ${slot}: invalid dimensions or anchor`);
    const bounds = f.bounds ?? [0, 0, width, height];
    if (!Array.isArray(bounds) || bounds.length !== 4 || !bounds.every(Number.isFinite) || bounds[0] < 0 || bounds[1] < 0 || bounds[2] > width || bounds[3] > height || bounds[0] >= bounds[2] || bounds[1] >= bounds[3]) throw new Error(`Atlas ${id}, ${label} frame ${slot}: invalid opaque bounds`);
    if(f.fallLean!==undefined&&(!Number.isFinite(f.fallLean)||Math.abs(f.fallLean)>Math.PI/3))throw new Error(`Atlas ${id}: invalid fall lean`);
    if(f.contactHull&&(!Array.isArray(f.contactHull)||f.contactHull.length<3||f.contactHull.length>128||f.contactHull.some(p=>!point(p)||p[0]<0||p[1]<0||p[0]>width||p[1]>height)))throw new Error(`Atlas ${id}: invalid contact hull`);
    const cell = cfg.sheet?.cells[f.url];
    const sheet = cell && sheetImage ? await sheetImage : null;
    let image: FrameImage, region: FrameRegion | undefined;
    if (sheet && cell) {
      const r: FrameRegion = cell.length === 2 ? [cell[0], cell[1], width, height, 0, 0] : cell;
      if (r.length !== 6 || !r.every(Number.isInteger) || r[2] <= 0 || r[3] <= 0 || r[0] < 0 || r[1] < 0 || r[0] + r[2] > sheet.width || r[1] + r[3] > sheet.height
        || r[4] < 0 || r[5] < 0 || r[4] + r[2] > width || r[5] + r[3] > height) throw new Error(`Atlas ${id}, ${label} frame ${slot}: invalid sprite-sheet cell`);
      image = sheet; region = r;
    } else {
      image = await loadImage(localUrl(f.url, revision)).catch(() => { throw new Error(`Atlas ${id}, ${label} frame ${slot}: failed to load ${f.url}`); });
      const [naturalWidth, naturalHeight] = imageSize(image);
      if (naturalWidth !== width || naturalHeight !== height) throw new Error(`Atlas ${id}, ${label} frame ${slot}: image dimensions differ from metadata`);
      ownImages.add(image);
    }
    const registration=label==='poses'?cfg.poseRegistration?.[names[slot][0] as keyof typeof POSE_SLOTS]:label==='walk'?cfg.walkRegistration:cfg.clipRegistration?.[label as AtlasClipName], density=registration?.pixelScale??1, offset=registration?.anchorOffset??[0,0];
    // All geometry uses the same calibrated coordinates as the drawn bitmap.
    // Keeping the foot origin, bounds and hull together also preserves camera
    // packing and floor/throw placement. Combat never reads this registration.
    return { image, region, density, width:width*density, height:height*density,
      anchor:[(anchor[0]+offset[0])*density,(anchor[1]+offset[1])*density],
      bounds:bounds.map(v=>v*density) as LoadedFrame['bounds'], fallLean:f.fallLean??0,
      contactHull:f.contactHull?.map(([x,y])=>[x*density,y*density]) };
  }));
  const [frames, walkFrames, clipEntries] = await Promise.all([loadFrames(cfg.frames, 'poses'), cfg.walkFrames ? loadFrames(cfg.walkFrames, 'walk') : undefined, Promise.all(Object.entries(cfg.clips??{}).map(async ([name,entries])=>[name,await loadFrames(entries!,name)] as const))]);
  const sheet = sheetImage ? await sheetImage : null, bitmaps = sheet ? [sheet] : [];
  const bytes = [...bitmaps, ...ownImages].reduce((sum, image) => { const [w, h] = imageSize(image); return sum + w * h * 4; }, 0);
  const scale=(cfg.scale ?? cfg.worldHeight! / cfg.height)*(cfg.visualScale??1);
  return { frames, walkFrames, clips:Object.fromEntries(clipEntries), scale, facing: cfg.facing ?? 1, cycle: cfg.walkCycleDistance ?? 72, holdContact:cfg.holdContact, bytes, bitmaps };
}
/** Optional installation: 404 or an empty roster returns false. Invalid manifests
 * and failed assets reject and expose an error status; no partial atlas is used.
 * Calling again after absence/error retries, allowing later asset installation. */
export function loadPoseAtlases(): Promise<boolean> {
  if (pending) return pending;
  loadState = 'loading'; loadError = null;
  pending = (async () => {
    const response = await fetch(asset('/fighters/pose-atlas.json'), { cache: 'no-store' });
    if (response.status === 404 || (response.ok && response.headers.get('content-type')?.includes('text/html'))) {
      // Development SPA servers can return their HTML shell for missing files.
      atlases.clear(); movementFormations.clear(); dashFormations.clear(); declaredAtlases.clear(); loadState = 'absent'; return false;
    }
    if (!response.ok) throw new Error(`Pose atlas metadata: HTTP ${response.status}`);
    const manifest = await response.json() as PoseAtlasManifest;
    if (manifest?.version !== 1 || !manifest.fighters || typeof manifest.fighters !== 'object' || Array.isArray(manifest.fighters)) throw new Error('Unsupported pose atlas manifest');
    declaredAtlases.clear(); for(const id of Object.keys(manifest.fighters))declaredAtlases.add(id);
    atlases.clear(); movementFormations.clear(); dashFormations.clear();
    const loaded = await Promise.all(Object.entries(manifest.fighters).map(async ([id, cfg]) => [id, await loadAtlas(id, cfg, manifest.revision)] as const));
    atlases.clear(); for (const [id, atlas] of loaded) atlases.set(id, atlas);
    loadState = loaded.length ? 'ready' : 'absent';
    return loaded.length > 0;
  })().catch((error: unknown) => {
    loadState = 'error'; loadError = error instanceof Error ? error.message : String(error); throw error;
  }).finally(() => { pending = null; });
  return pending;
}
let selectionManifest:Promise<PoseAtlasManifest>|null=null;
const bodyLoads=new Map<string,Promise<Atlas>>();
const bodyConfigs=new Map<string,Promise<PoseAtlasConfig>>();
let latestSelectionBodies=new Set<string>();
/** Bodies of the match being played (or about to be): never evicted, so a frame
 * on screen can never be released. Replaced by the next pinned request. */
let pinnedBodies=new Set<string>();
/** Recent-body cache limits: older bodies are released, least recently requested
 * first, while more than 16 bodies or this many decoded bytes are held. The pinned
 * and currently requested bodies are always kept, even past the limits. */
export const POSE_ATLAS_CACHE_BYTES=160*1024*1024;
const expandBodies=(ids:readonly Fighter['id'][])=>new Set(ids.flatMap(id=>[...bodyAtlasIds(id),...specialPartnerIds(id).flatMap(bodyAtlasIds)]));
function evictAtlases():void{
  const keep=(id:string)=>latestSelectionBodies.has(id)||pinnedBodies.has(id);
  let bytes=[...atlases.values()].reduce((sum,a)=>sum+a.bytes,0);
  // Map order is least recently requested first.
  for(const [id,atlas] of [...atlases]){
    if(atlases.size<=16&&bytes<=POSE_ATLAS_CACHE_BYTES)break;
    if(keep(id))continue;
    atlases.delete(id);bytes-=atlas.bytes;
    movementFormations.clear(); dashFormations.clear();
    for(const bitmap of atlas.bitmaps)bitmap.close();
  }
}
/**
 * The full manifest is several MB. Builds and the dev server also publish it
 * split (see poseAtlasSplit in vite.config.ts): a small index listing every
 * body with its standing (first) pose, and one file per body under
 * /fighters/pose-atlas/. A body's config is fetched only when a match needs it,
 * from a URL keyed by the revision so the browser can cache it. Without the
 * split files (another static server) this falls back to the full manifest.
 */
async function loadSelectionManifest():Promise<PoseAtlasManifest>{
  let response=await fetch(asset('/fighters/pose-atlas/index.json'),{cache:'no-cache'});
  if(response.status===404||(response.ok&&response.headers.get('content-type')?.includes('text/html')))
    // Revalidate rather than refetch: an unchanged manifest costs one 304, not several MB.
    response=await fetch(asset('/fighters/pose-atlas.json'),{cache:'no-cache'});
  if(!response.ok)throw new Error(`Pose atlas metadata: HTTP ${response.status}`);
  const manifest=await response.json() as PoseAtlasManifest;
  if(manifest.version!==1||!manifest.fighters)throw new Error('Unsupported pose atlas manifest');
  for(const id of Object.keys(manifest.fighters))declaredAtlases.add(id);
  return manifest;
}
function bodyConfig(manifest:PoseAtlasManifest,id:string):Promise<PoseAtlasConfig>{
  const listed=manifest.fighters[id];if(!listed)throw new Error(`Missing complete body atlas: ${id}`);
  if(listed.frames)return Promise.resolve(listed);
  if(!bodyConfigs.has(id))bodyConfigs.set(id,(async()=>{
    const response=await fetch(asset(`/fighters/pose-atlas/${encodeURIComponent(id)}.json`)+`?v=${encodeURIComponent(manifest.revision??'')}`);
    if(!response.ok)throw new Error(`Pose atlas ${id}: HTTP ${response.status}`);
    const cfg=(await response.json() as PoseAtlasManifest).fighters?.[id];
    if(!cfg?.frames)throw new Error(`Pose atlas ${id}: missing body config`);
    return cfg;
  })().catch(error=>{bodyConfigs.delete(id);throw error;}));
  return bodyConfigs.get(id)!;
}
/** Load the selected match and assists on demand. The large expansion must not
 * allocate every fighter's decoded animation images before the menu opens.
 * `pin` marks these bodies as the match being played: they stay loaded until
 * another pinned request replaces them. */
export async function ensurePoseAtlases(ids:readonly Fighter['id'][],options:{pin?:boolean}={}):Promise<void>{
  selectionManifest??=loadSelectionManifest().catch(error=>{selectionManifest=null;throw error;});
  try{
    const manifest=await selectionManifest;
    const needed=expandBodies(ids);
    latestSelectionBodies=needed;
    if(options.pin)pinnedBodies=needed;
    const loaded=await Promise.all([...needed].map(async id=>{
      if(atlases.has(id))return [id,atlases.get(id)!] as const;
      if(!bodyLoads.has(id))bodyLoads.set(id,bodyConfig(manifest,id).then(cfg=>loadAtlas(id,cfg,manifest.revision)).finally(()=>bodyLoads.delete(id)));
      return [id,await bodyLoads.get(id)!] as const;
    }));
    for(const[id,atlas]of loaded){atlases.delete(id);atlases.set(id,atlas);}
    // In-flight menu requests cannot evict the currently requested or pinned
    // bodies; bodyLoads releases resolved promises as well.
    evictAtlases();
    loadState='ready';loadError=null;
  }catch(error){loadError=error instanceof Error?error.message:String(error);loadState='error';throw error;}
}
/** Selection-menu previews need only each body's standing pose: one small image
 * instead of 100-140 decoded frames. Full bodies load when the pick settles. */
interface PreviewEntry { frame: string | PoseFrameConfig; width: number; height: number; anchor: Point; facing?: 1 | -1 }
const previews=new Map<string,{source:LoadedFrame;facing:number}>();
const previewLoads=new Map<string,Promise<void>>();
function previewEntry(manifest:PoseAtlasManifest,id:string):PreviewEntry{
  const listed=manifest.fighters[id] as PoseAtlasConfig & {preview?:PreviewEntry};
  if(!listed)throw new Error(`Missing complete body atlas: ${id}`);
  if(listed.preview)return listed.preview;
  if(listed.frames)return {frame:listed.frames[0],width:listed.width,height:listed.height,anchor:listed.anchor,facing:listed.facing};
  throw new Error(`Pose atlas ${id}: index has no preview pose`);
}
export async function ensurePosePreviews(ids:readonly Fighter['id'][]):Promise<void>{
  selectionManifest??=loadSelectionManifest().catch(error=>{selectionManifest=null;throw error;});
  const manifest=await selectionManifest;
  await Promise.all([...expandBodies(ids)].map(id=>{
    if(atlases.has(id)||previews.has(id))return undefined;
    if(!previewLoads.has(id))previewLoads.set(id,(async()=>{
      const entry=previewEntry(manifest,id),f=typeof entry.frame==='string'?{url:entry.frame}:entry.frame;
      const width=f.width??entry.width,height=f.height??entry.height,anchor=f.anchor??entry.anchor;
      const image=await loadImage(localUrl(f.url,manifest.revision)).catch(()=>{throw new Error(`Atlas ${id}: failed to load preview ${f.url}`);});
      const [w,h]=imageSize(image);if(w!==width||h!==height)throw new Error(`Atlas ${id}: preview dimensions differ from metadata`);
      previews.set(id,{facing:entry.facing??1,source:{image,density:1,anchor,width,height,bounds:f.bounds??[0,0,width,height],fallLean:0}});
      // Each preview is one standing pose; keep the most recent few dozen.
      for(const key of previews.keys()){if(previews.size<=48)break;previews.delete(key);}
    })().finally(()=>previewLoads.delete(id)));
    return previewLoads.get(id);
  }));
}
interface Playback { frame:number; x:number; y:number; travel:number; stamp:string; slot:PoseSlot; landedAt:number; idleSince:number; advancing:boolean }
const playback = new WeakMap<Fighter, Playback>();
/** Stable full-body actors, not articulated limb cutouts. Formation is fixed in
 * world space, so changing facing cannot exchange the two entities instantly. */
const duos = new WeakMap<Fighter, Fighter[]>();
const componentOwner = new WeakMap<Fighter, {owner:Fighter; side:number; index:number}>();
const sceneActor = (f:Fighter) => componentOwner.get(f)?.owner ?? f;
function duoLeadSide(owner:Fighter):number {
  return throwScene?.fighters[throwScene.state.attacker]===owner?throwScene.state.facing:owner.facing;
}
function duoLeadIndex(owner:Fighter):number {
  if(owner.id==='sproto3181'&&owner.move&&['medium','heavy','sweep','airMedium','airHeavy'].includes(owner.move.id))return 0;
  return duoLeadSide(owner)===1?bodyAtlasIds(owner.id).length-1:0;
}
function duoActors(owner:Fighter):Fighter[] {
  let actors=duos.get(owner);
  if(!actors){actors=bodyAtlasIds(owner.id).map(()=>({...owner}));duos.set(owner,actors);actors.forEach((actor,i)=>componentOwner.set(actor,{owner,index:i,side:Math.sign(i-(actors!.length-1)/2)}));}
  actors.forEach((actor,i)=>{
    const side=Math.sign(i-(actors!.length-1)/2);
    Object.assign(actor,owner,{x:owner.x+bodyOffsets(owner.id)[i]});
    // Only the front actor supplies normal melee contact; the other covers.
    // Events, aerial locomotion, recoil and defeat still use each own drawings.
    if(i!==duoLeadIndex(owner) && owner.move && owner.move.id!=='special' && owner.move.id!=='bolt'&&!(owner.id==='sproto3181'&&['medium','heavy','sweep','airMedium','airHeavy'].includes(owner.move.id)))actor.move=null;
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
const assistStarts=new WeakMap<Fighter,number>();
/** Each twin's fixed identity owns alternating contacts in either facing. */
export function getPartnerAssistBodyPlan(f:Fighter){
 const owner=sceneActor(f),profile=PARTNER_ATTACKS[owner.id],contacts=assistTiming.get(owner);
 if(!profile||!contacts||owner.move?.id!=='special')return[];
 const t=owner.move.t,beat=partnerContactIndex(t,contacts),age=t-contacts[beat],count=bodyAtlasIds(owner.id).length;
 return bodyAtlasIds(owner.id).map((entity,index)=>{
  const selected=index===beat%count,active=selected&&age>=0&&age<=8;
  let y=0;
  const arc=Math.max(0,...contacts.filter((_,i)=>i%count===index).map(hit=>t<hit?Math.sin(Math.max(0,Math.min(1,(t-hit+10)/10))*Math.PI):0));
  if(profile.motion==='dive'||profile.kind==='quakeDive'&&index===0)y=-arc*145;
  else if(selected&&profile.motion==='rise')y=-Math.max(0,1-Math.abs(age)/10)*38;
  else if(selected&&profile.motion==='pulse')y=-Math.sin(Math.max(0,age)*.4)*4;
  return {entity,index,beat,age,active,y,action:profile.bodyAttacks?.[index]??profile.name};
 });
}
const floorDefeat=(f:Fighter,p:RoundPresentation)=>p.fromFloor||(f.reaction?.kind==='knockdown'&&f.reaction.phase==='down');
/** The caller updates the stable assist object's move.t from its owner's clock. */
export function setPoseAtlasAssistTiming(f:Fighter,contacts:readonly number[],start=4):void {assistTiming.set(f,contacts);assistStarts.set(f,start);}
function eventSelection(f:Fighter,atlas:Atlas|undefined):{sequence:AtlasClipName;frameIndex:number}|null {
  if(!atlas)return null;
  const choose=(sequence:AtlasClipName,frameIndex:number)=>atlas.clips[sequence]?{sequence,frameIndex}:null;
  const owner=sceneActor(f);
  const assistContacts=assistTiming.get(owner);
  if(assistContacts&&f.move?.id==='special'&&atlas.clips.assistEnter){
    const t=f.move.t,first=assistContacts[0],last=assistContacts.at(-1)!;
    const start=assistStarts.get(owner)??4;
    if(t<first)return choose('assistEnter',Math.min(5,Math.floor(Math.max(0,t-start)*6/Math.max(1,first-start))));
    if(t>last+9)return choose('assistExit',Math.min(5,Math.floor((t-last-10)/3)));
    let beat=0;for(let i=1;i<assistContacts.length&&assistContacts[i]<=t;i++)beat=i;
    const age=t-assistContacts[beat],phase=age<3?1:age<6?2:age<9?3:0;
    const component=componentOwner.get(f);
    if(owner.id==='sproto3181'&&component){
      const yellow=component.index===1,active=yellow?beat%2===0:beat%2===1;
      return choose('assistAttack',active?(yellow?0:12)+phase:0);
    }
    return choose('assistAttack',(beat%4)*4+phase);
  }
  if(assistContacts&&f.move?.id==='special'&&PARTNER_ATTACKS[owner.id]){
    const body=componentOwner.get(f)?.index??0,plan=getPartnerAssistBodyPlan(owner)[body],t=f.move.t;
    const first=assistContacts[0],last=assistContacts.at(-1)!,start=assistStarts.get(owner)??4;
    if(t<first)return choose('intro',Math.min(3,Math.floor(Math.max(0,t-start)*4/Math.max(1,first-start))));
    if(t>last+9)return choose('intro',Math.max(0,3-Math.floor((t-last-10)/3)));
    if(!plan.active)return choose('special',0);
    const profile=PARTNER_ATTACKS[owner.id]!,age=plan.age;
    if(profile.kind==='quakeDive')return body===0?choose('airKick',Math.min(5,2+Math.floor(age/3)))??choose('special',2):choose('heavy',Math.min(7,3+Math.floor(age/2)))??choose('special',4);
    if(profile.kind==='crossfire'&&body===0)return choose('signatureCast',age<3?4:5)??choose('special',2);
    return choose('special',specialFrame(t,assistContacts));
  }
  const p=presentationScene?.presentation,index=presentationScene?.fighters.indexOf(owner)??-1;
  if(p&&index>=0){
    if(p.phase==='intro')return choose('entrance',entranceFrame(p.frame))??choose('intro',introFrame(p.frame));
    if((p.phase==='outro'||p.phase==='result')&&p.winner!==null&&(p.winner===2||index!==p.winner))return choose('death',deathFrame(p.frame,floorDefeat(f,p)))??choose('defeat',defeatFrame(p.frame,floorDefeat(f,p)));
    if((p.phase==='outro'||p.phase==='result')&&p.winner===index)return choose('victory',Math.min(5,Math.floor(p.frame/12)))??choose('assistVictory',Math.min(3,Math.floor(p.frame/15)));
  }
  // Held/released throw participants retain their authored throw/fall path.
  if(throwScene&&throwScene.fighters.some((actor,i)=>actor===owner&&(i===throwScene!.state.attacker||i===throwScene!.state.victim)))return null;
  if(f.reaction?.kind==='recoil'&&f.y>=FLOOR&&!f.blockstun)return choose('recoil',recoilFrame(f.reaction.t));
  if(f.stun||f.blockstun||f.reaction?.kind==='knockdown')return null;
  // The blue actor's attached stomach monster supplies these contacts; the
  // small yellow partner covers instead of performing a simultaneous kick.
  if(owner.id==='sproto3181'&&componentOwner.get(f)?.index===1&&f.move&&['medium','heavy','sweep','airMedium','airHeavy'].includes(f.move.id))return null;
  if(f.move?.id==='special'){
    const contacts=assistTiming.get(owner)??COMBAT_STYLES[f.id].specialFrames;
    let key=specialFrame(f.move.t,contacts);
    if(COMBAT_STYLES[f.id].projectile.shape==='pelvicStream'&&f.move.t>=contacts.at(-1)!&&f.move.t<contacts.at(-1)!+10)key=6;
    const component=componentOwner.get(f);
    if(component&&f.move.t>=contacts[0]&&f.move.t<contacts[contacts.length-1]+4){
      let beat=0;for(let i=1;i<contacts.length&&contacts[i]<=f.move.t;i++)beat=i;
      // Double Take trades contacts between two whole bodies. The other actor
      // visibly covers/retracts, rather than punching through its teammate.
      const count=bodyAtlasIds(owner.id).length;
      const strikingIndex=(duoLeadIndex(owner)+(duoLeadSide(owner)===1?-beat:beat)+count*2)%count;
      if(component.index!==strikingIndex)key=beat%2?3:5;
    }
    return choose('special',key);
  }
  if(isCrouchingSpit(f))return null;
  if(f.move?.id==='bolt'){
    const move=getMove(f,'bolt');
    if(atlas.clips.ranged&&COMBAT_STYLES[f.id].projectile.shape!=='sun'&&!hasAuthoredProjectile(f.id)){const age=f.move.t,start=move.startup,end=start+move.active+move.recovery;return choose('ranged',age<start?Math.min(3,Math.floor(age/start*4)):age<start+5?4:age<end-8?5:age<end-4?6:7);}
    if(atlas.clips.signatureCast&&COMBAT_STYLES[f.id].projectile.shape!=='sun'){const age=f.move.t,start=move.startup,end=start+move.active+move.recovery;return choose('signatureCast',age<start?Math.min(3,Math.floor(age/start*4)):age<start+5?4:age<end-8?5:age<end-4?6:7);}
    if(COMBAT_STYLES[f.id].projectile.shape==='pelvicStream'){
      const t=f.move.t,total=move.startup+move.active+move.recovery;
      return choose('cast',t<move.startup*.5?0:t<move.startup?1:t<total-7?2:3);
    }
    // Both custom projectiles and mind beams retain their authored release hold.
    const style=COMBAT_STYLES[f.id].projectile;
    const releaseWindow=style.beamFrames??(['miniSproto','yellowEight','sun'].includes(style.shape)?Math.max(8,move.active):move.active);
    return choose('cast',castFrame(f.move.t,move.startup,releaseWindow));
  }
  if(f.move?.id==='heavy'||f.move?.id==='airMedium'||f.move?.id==='airHeavy'){
    const move=getMove(f,f.move.id),age=f.move.t,heavy=f.move.id==='heavy';
    const frame=age<move.startup
      ?Math.min(heavy?2:1,Math.floor(age/Math.max(1,move.startup)*(heavy?3:2)))
      :age<move.startup+move.active
      ?(heavy?3:2)+Math.min(1,Math.floor((age-move.startup)/Math.max(1,move.active)*2))
      :(heavy?5:4)+Math.min(heavy?2:1,Math.floor((age-move.startup-move.active)/Math.max(1,move.recovery)*(heavy?3:2)));
    return choose(heavy?'heavy':'airKick',frame);
  }
  if(f.dash>0)return choose('dash',dashCel(f.dash));
  if(f.y<FLOOR&&!f.move){
    const impulse=ROSTER[f.id].jump;
    return choose('jump',Math.max(0,Math.min(5,Math.floor((f.vy+impulse)/(2*impulse)*6))));
  }
  return null;
}
function walking(f: Fighter): boolean { return f.y >= FLOOR && Math.abs(f.vx) > .5 && !f.move && !f.stun && !f.blockstun && !f.dash && !(f.input & A.down); }
function selectSlot(f:Fighter,phase:number,frame:number,state:Playback):PoseSlot {
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
      if(component&&component.index!==duoLeadIndex(component.owner))return S.block;
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
    if(sceneActor(f).id==='sproto3181'&&componentOwner.get(f)?.index===1&&['medium','heavy','sweep','airMedium','airHeavy'].includes(attack.id))return S.crouchLanding;
    const move=getMove(f,attack.id),t=attack.t;
    const startup=t<move.startup,active=t>=move.startup&&t<move.startup+move.active;
    if(attack.id==='special'){
      const contacts=COMBAT_STYLES[f.id].specialFrames,last=contacts[contacts.length-1];
      if(t<contacts[0])return S.powerCharge;
      if(t>=last&&t<last+3)return S.special;
      if(contacts.some(hit=>t>=hit&&t<hit+3))return S.powerRelease;
      return t>last+2?S.punchRecover:S.powerCharge;
    }
    if(isCrouchingSpit(f))return S.crouchLanding;
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
  if(f.dash)return S.dash;
  if(f.y<FLOOR)return f.vy<0?S.airRise:S.airFall;
  if(f.jumpDelay>0)return S.jumpAnticipation;
  if((f.input&A.down)||frame-state.landedAt<3)return S.crouchLanding;
  if(state.advancing&&walking(f))return [S.walkNear,S.passNear,S.walkFar,S.passFar][Math.floor(phase*4)%4];
  // Re-enter the authored guard after locomotion/recovery. Using global time
  // could jump straight to a differently posed breath on the stop frame.
  const idleAge=Math.max(0,frame-state.idleSince);
  if(idleAge<36)return S.guard;
  return Math.floor((idleAge+(componentOwner.get(f)?.side===1?18:0))/36)%2?S.breathe:S.guard;
}
function sample(f:Fighter,frame:number,frozen:boolean,atlasId:string=f.id,phaseOffset=0):PoseAtlasDebug {
  const atlas=atlases.get(atlasId),cycle=atlas?.cycle??72;
  const scene=throwScene?.state;
  const stamp=[f.x,f.y,f.move?.id,f.move?.t,f.stun,f.blockstun,f.dash,scene?.phase,scene?.t].join(':');
  let state=playback.get(f);
  if(!state||frame<state.frame){state={frame,x:f.x,y:f.y,travel:0,stamp:'',slot:0,landedAt:-100,idleSince:frame,advancing:walking(f)};playback.set(f,state);}
  if(frame!==state.frame&&!frozen){
    // Backsteps reverse the authored gait instead of moonwalking the forward
    // cycle. This is rendering state only; combat and replay inputs are untouched.
    // Use post-collision travel in the intended direction. A pinned actor
    // may still have input velocity, or even be pushed backward by a rival.
    const dx=f.x-state.x;
    state.advancing=walking(f)&&dx*Math.sign(f.vx)>.5;
    if(state.advancing&&state.y>=FLOOR)state.travel+=dx*f.facing;
    if(state.y<FLOOR&&f.y>=FLOOR)state.landedAt=frame;
    if(f.move||f.stun||f.blockstun||f.dash||f.y<FLOOR||state.advancing||(f.input&A.down))state.idleSince=frame;
  }
  const phase=modulo(state.travel+cycle*phaseOffset,cycle)/cycle;
  if(!frozen||state.stamp!==stamp)state.slot=selectSlot(f,phase,frame,state);
  state.frame=frame;state.x=f.x;state.y=f.y;state.stamp=stamp;
  const sequence = atlas?.walkFrames && state.slot >= POSE_SLOTS.walkNear && state.slot <= POSE_SLOTS.passFar ? 'walk' : 'poses';
  const sequenceLength = sequence === 'walk' ? atlas!.walkFrames!.length : 32;
  const frameIndex = sequence === 'walk' ? Math.min(sequenceLength - 1, Math.floor(phase * sequenceLength)) : state.slot;
  const event=eventSelection(f,atlas);
  if(event)return {available:true,slot:state.slot,name:event.sequence,walkPhase:phase,...event,sequenceLength:atlas!.clips[event.sequence]!.length,source:'authored-full-pose'};
  return {available:!!atlas,slot:state.slot,name:names.find(([,slot])=>slot===state.slot)![0],walkPhase:phase,sequence,frameIndex,sequenceLength,source:'authored-full-pose'};
}
export function getPoseAtlasDebug(f: Fighter, frame: number, frozen = false): PoseAtlasDebug {
  if(isPairedFighter(f.id)){const i=duoLeadIndex(f);return sample(duoActors(f)[i],frame,frozen,bodyAtlasIds(f.id)[i],i/bodyAtlasIds(f.id).length);}
  return sample(f, frame, frozen);
}
/** Review both entities explicitly; the logical fighter debug reports its lead. */
export function getDuoPoseDebug(f:Fighter,frame:number,frozen=false){
  return isPairedFighter(f.id)?duoActors(f).map((actor,i)=>({entity:bodyAtlasIds(f.id)[i],x:actor.x,y:actor.y,...sample(actor,frame,frozen,bodyAtlasIds(f.id)[i],i/bodyAtlasIds(f.id).length)})):[];
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
/** Authored ram poses travel as one connected floating body. Combat owns range. */
export function getHoverMeleeOffset(f:Fighter):{x:number;y:number}{
  const attack=f.move;
  if((f.id!=='sproto1870'&&f.id!=='vaudream')||!attack||f.stun||f.blockstun||f.reaction||throwScene?.fighters.includes(f))return {x:0,y:0};
  if(!['light','medium','heavy','low','sweep','launcher','airLight','airMedium','airHeavy'].includes(attack.id))return {x:0,y:0};
  const move=getMove(f,attack.id),t=attack.t,heavy=attack.id==='heavy'||attack.id==='airHeavy';
  const reach=heavy?48:attack.id==='light'?24:36;
  let drive:number;
  if(t<move.startup){const u=t/Math.max(1,move.startup);drive=u<.65?-14*Math.sin(u/.65*Math.PI/2):-14+(reach+14)*((u-.65)/.35)**2;}
  else if(t<move.startup+move.active)drive=reach;
  else{const u=Math.min(1,(t-move.startup-move.active)/Math.max(1,move.recovery));drive=reach*(1-u)**2;}
  const rising=attack.id==='launcher'||attack.aim==='up',low=attack.id==='low'||attack.id==='sweep';
  return {x:f.facing*drive,y:rising?-Math.max(0,drive)*.6:low?Math.max(0,drive)*.25:attack.id.startsWith('air')?Math.max(0,drive)*.22:-Math.max(0,drive)*.12};
}
function paintData(f:Fighter,slot:PoseSlot,sampled:PoseAtlasDebug|undefined,atlasId:string) {
  const atlas=atlases.get(atlasId);if(!atlas)return null;
  const event=sampled && sampled.sequence!=='poses' && sampled.sequence!=='walk' ? sampled.sequence : null;
  const source = event ? atlas.clips[event]![sampled!.frameIndex] : sampled?.sequence === 'walk' ? atlas.walkFrames![sampled.frameIndex] : atlas.frames[slot];
  // Event drawings already contain their authored body attitude and floor anchor.
  const transform=reactionTransform(f,atlas,source,!!sampled && !event);
  const ram=getHoverMeleeOffset(f);transform.x+=ram.x;transform.y+=ram.y;
  const assistBody=getPartnerAssistBodyPlan(sceneActor(f))[componentOwner.get(f)?.index??0];
  if(assistBody)transform.y+=assistBody.y;
  // A knocked-back body already landed head-first in its impact direction.
  // Preserve that whole-body orientation when entering the authored floor rest;
  // otherwise the defeated fighter flips ends at the KO presentation boundary.
  const p=presentationScene?.presentation;
  const facing=(event==='defeat'||event==='death')&&p&&floorDefeat(f,p)?f.reaction?.direction??f.facing:f.facing;
  if(event==='defeat'||event==='death'){
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
const dashCel=(remaining:number)=>Math.min(5,Math.floor(Math.max(0,10-remaining)*.6));
const dashGap=7; // Includes one pixel for rounding the two draw origins.
const dashSpacingPerTick=7; // A normal dash still travels 7.59 px on its last tick.
function dashOutline(atlas:Atlas,frame:LoadedFrame,facing:number,x:number):Point[] {
  const hull=frame.contactHull;
  const [l,t,r,b]=frame.bounds;
  const points:Point[]=hull??[[l,t],[r,t],[r,b],[l,b]];
  return points.map(([px,py])=>[x+(px-frame.anchor[0])*facing*atlas.facing*atlas.scale,
    (py-frame.anchor[1])*atlas.scale]);
}

/** Gap measured only where both silhouettes occupy the same height. A raised
 * elbow can pass above the other actor's leg without either body intersecting. */
function silhouetteGap(left:Point[],right:Point[]):number {
  const rows=[...left,...right].map(([,y])=>y);
  const edge=(outline:Point[],y:number,rightSide:boolean)=>{
    let x=rightSide?-Infinity:Infinity;
    for(let i=0;i<outline.length;i++){
      const [ax,ay]=outline[i],[bx,by]=outline[(i+1)%outline.length];
      if(y<Math.min(ay,by)||y>Math.max(ay,by))continue;
      const hit=ay===by?(rightSide?Math.max(ax,bx):Math.min(ax,bx)):ax+(bx-ax)*(y-ay)/(by-ay);
      x=rightSide?Math.max(x,hit):Math.min(x,hit);
    }
    return x;
  };
  return Math.min(...rows.map(y=>edge(right,y,false)-edge(left,y,true)));
}
interface DashFormation { opening:number[]; closing:number[]; rawGaps:number[]; left:number; right:number }
function pairedDashFormation(owner:Fighter,neutral:MovementFormation):DashFormation {
  const key=owner.id+':'+owner.facing;
  const cached=dashFormations.get(key);
  if(cached)return cached;
  const sources=bodyAtlasIds(owner.id).map(id=>atlases.get(id)!);
  const positions=bodyOffsets(owner.id),lead=duoLeadIndex(owner);
  const sign=lead===0?1:-1,support=1-lead;
  const idle=neutral.offsets[support]*sign;
  const outlines=Array.from({length:11},(_,i)=>sources.map((atlas,body)=>dashOutline(
    atlas,atlas.clips.dash?.[dashCel(11-i)]??atlas.frames[POSE_SLOTS.dash],owner.facing,positions[body],
  )));
  const rawGaps=outlines.map(([left,right])=>silhouetteGap(left,right));
  const required=rawGaps.map(gap=>Math.max(idle,dashGap-gap));
  // The support can close in on a forward dash or spread on a backdash.
  // Spacing changes then carry it in the dash direction even at a hard stop.
  const opening=required.map((_,i)=>Math.max(...required.map((value,j)=>value-dashSpacingPerTick*Math.max(0,j-i))));
  const closing=required.map((_,i)=>Math.max(...required.map((value,j)=>value-dashSpacingPerTick*Math.max(0,i-j))));
  const widest=Math.max(...required);
  const xs=outlines.flatMap(pair=>pair.flatMap((outline,body)=>outline.map(([x])=>x+(body===support?widest*sign:0))));
  const result={opening,closing,rawGaps,left:Math.min(...xs),right:Math.max(...xs)};
  dashFormations.set(key,result);
  return result;
}
interface MovementFormation {
  envelopes: number[][];
  offsets: number[];
}
/** Keep guard and walk compact. Dash uses its own envelope because wide
 * silhouettes would spread a standing team farther apart than necessary. */
function pairedMovementFormation(owner:Fighter,dashing:boolean):MovementFormation {
  const key=owner.id+':'+owner.facing+':'+dashing;
  const cached=movementFormations.get(key);
  if(cached)return cached;
  const sources=bodyAtlasIds(owner.id).map(id=>atlases.get(id)!);
  const positions=bodyOffsets(owner.id);
  const envelopes=sources.map((atlas,i)=>{
    const flip=owner.facing*atlas.facing*atlas.scale;
    const walk=atlas.walkFrames??atlas.frames.slice(POSE_SLOTS.walkNear,POSE_SLOTS.passFar+1);
    const dash=atlas.clips.dash??[atlas.frames[POSE_SLOTS.dash]];
    const frames=dashing?dash:[atlas.frames[POSE_SLOTS.guard],atlas.frames[POSE_SLOTS.breathe],...walk];
    const xs=frames.flatMap(frame=>[
      positions[i]+(frame.bounds[0]-frame.anchor[0])*flip,
      positions[i]+(frame.bounds[2]-frame.anchor[0])*flip,
    ]);
    return [Math.min(...xs),Math.max(...xs)];
  });
  const lead=duoLeadIndex(owner),gap=sources.length>2?12:6;
  const offsets=sources.map(()=>0);
  for(let i=lead-1;i>=0;i--){
    const clearance=envelopes[i+1][0]+offsets[i+1]-envelopes[i][1]-gap;
    offsets[i]=Math.min(60,clearance);
  }
  for(let i=lead+1;i<sources.length;i++){
    const clearance=envelopes[i][0]-envelopes[i-1][1]-offsets[i-1]-gap;
    offsets[i]=-Math.min(60,clearance);
  }
  const formation={envelopes,offsets};
  movementFormations.set(key,formation);
  return formation;
}
/** Cover both formations and their small easing range even during a jump
 * beside a wall, so swapping pose families cannot move the lead anchor. */
function pairedMovementLimits(owner:Fighter,neutral:MovementFormation,dash:MovementFormation):[number,number] {
  if(neutral.offsets.length===2){
    const schedule=pairedDashFormation(owner,neutral);
    return [
      Math.min(schedule.left,...neutral.envelopes.map(([l],i)=>l+neutral.offsets[i])),
      Math.max(schedule.right,...neutral.envelopes.map(([,r],i)=>r+neutral.offsets[i])),
    ];
  }
  return [
    Math.min(...neutral.envelopes.map(([left],i)=>
      Math.min(left,dash.envelopes[i][0])+Math.min(neutral.offsets[i],dash.offsets[i]))),
    Math.max(...neutral.envelopes.map(([,right],i)=>
      Math.max(right,dash.envelopes[i][1])+Math.max(neutral.offsets[i],dash.offsets[i]))),
  ];
}
/** Falling bodies are wider than standing bodies. Separate their complete
 * silhouettes as one camera-bounded formation, without changing hit/throw state.
 * The low feet/floor anchors remain untouched. */
function baseDuoLayout(owner:Fighter,actors:Fighter[],samples:PoseAtlasDebug[]) {
  const data=actors.map((actor,i)=>paintData(actor,samples[i].slot,samples[i],bodyAtlasIds(owner.id)[i])!);
  const bounds=data.map(paintBounds),offsets=actors.map(()=>0);
  const locomotion=!owner.move&&!owner.stun&&!owner.blockstun&&!owner.reaction&&!throwScene?.fighters.includes(owner);
  const usesMovementFormation=samples.every(sample=>sample.sequence==='walk'||sample.sequence==='dash'||
    (sample.sequence==='poses'&&sample.slot<=POSE_SLOTS.dash));
  if(locomotion&&usesMovementFormation){
    const neutral=pairedMovementFormation(owner,false),dash=pairedMovementFormation(owner,true);
    if(owner.dash>0&&offsets.length===2){
      const schedule=pairedDashFormation(owner,neutral);
      const earlier=Math.max(0,Math.min(10,Math.floor(11-owner.dash)));
      // The pose lab can scrub between ticks. Its layout must use the same
      // authored cel as the renderer, even across a fractional boundary.
      const phase=dashCel(11-earlier)===dashCel(owner.dash)?earlier:Math.min(10,earlier+1);
      const [l,r]=pairedMovementLimits(owner,neutral,dash);
      const left=6-l,right=WIDTH-6-r;
      const x=Math.max(left,Math.min(right,owner.x));
      // A second dash input can buffer another direction while this dash is
      // still committed. Only the current dash's velocity drives its layout.
      const direction=Math.sign(owner.vx)||owner.dashDirection;
      const distance=(direction===owner.facing?schedule.closing:schedule.opening)[phase];
      const shift=x-owner.x;
      const positions=duoLeadIndex(owner)===0?[shift,shift+distance]:[shift-distance,shift];
      return {data,offsets:positions,bounds:bounds.map(([l,r],i)=>[l+positions[i],r+positions[i]]),dashClearance:schedule.rawGaps[phase]+distance};
    }
    // Large silhouette differences cannot be eased across a short dash
    // without making the trailing body travel opposite the lead. Establish
    // those formations on the first dash cel, then keep them together.
    const travel=Math.max(...offsets.map((_,i)=>Math.abs(dash.offsets[i]-neutral.offsets[i])));
    // A linear ramp spreads a modest opening over three frames without
    // concentrating its largest shift at the slow end of the dash.
    const blend=owner.dash>0?(travel<=22?Math.min(1,(11-owner.dash)/3,owner.dash/3):1):0;
    for(let i=0;i<offsets.length;i++)offsets[i]=neutral.offsets[i]+(dash.offsets[i]-neutral.offsets[i])*blend;
    // Start and end close to the walking formation, but give a wider cel
    // room immediately when it would otherwise cover the lead or teammate.
    const lead=duoLeadIndex(owner),gap=offsets.length>2?12:6;
    for(let i=lead-1;i>=0;i--)offsets[i]=Math.min(offsets[i],bounds[i+1][0]+offsets[i+1]-bounds[i][1]-gap);
    for(let i=lead+1;i<offsets.length;i++)offsets[i]=Math.max(offsets[i],bounds[i-1][1]+offsets[i-1]-bounds[i][0]+gap);
    // Reserve room for both footprints, including the blend between their
    // offsets. A cel change should not move the lead at a wall.
    const [limitLeft,limitRight]=pairedMovementLimits(owner,neutral,dash);
    const left=Math.min(owner.x+limitLeft,...bounds.map(([l],i)=>l+offsets[i]));
    const right=Math.max(owner.x+limitRight,...bounds.map(([,r],i)=>r+offsets[i]));
    const shift=left<6?6-left:right>WIDTH-6?WIDTH-6-right:0;
    return {data,offsets:offsets.map(offset=>offset+shift),bounds:bounds.map(([l,r],i)=>[l+offsets[i]+shift,r+offsets[i]+shift])};
  }
  const finish=()=>{
    // Preserve contact on the lead body. Broader special cels can limit how
    // far a supporting body packs inward, even before the impact frame.
    {
      const lead=duoLeadIndex(owner),gap=6,maxShift=60;
      const specialEnvelope=owner.move?.id==='special' ? actors.map((actor,i)=>{
        const atlas=atlases.get(bodyAtlasIds(owner.id)[i])!,flip=actor.facing*atlas.facing*atlas.scale;
        const xs=(assistTiming.has(owner)?atlas.clips.assistAttack??atlas.clips.special??[]:atlas.clips.special??[]).flatMap(s=>[(s.bounds[0]-s.anchor[0])*flip+actor.x,(s.bounds[2]-s.anchor[0])*flip+actor.x]);
        return xs.length?[Math.min(...xs),Math.max(...xs)] as [number,number]:bounds[i];
      }):bounds;
      for(let i=lead-1;i>=0;i--){const clear=bounds[i+1][0]+offsets[i+1]-bounds[i][1]-offsets[i];offsets[i]-=Math.max(0,gap-clear);}
      for(let i=lead+1;i<actors.length;i++){const clear=bounds[i][0]+offsets[i]-bounds[i-1][1]-offsets[i-1];offsets[i]+=Math.max(0,gap-clear);}
      for(let i=lead-1;i>=0;i--){
        const available=Math.min(bounds[i+1][0]-bounds[i][1],specialEnvelope[i+1][0]-specialEnvelope[i][1])+offsets[i+1]-offsets[i]-gap;
        offsets[i]+=Math.max(0,Math.min(maxShift,available));
      }
      for(let i=lead+1;i<actors.length;i++){
        const available=Math.min(bounds[i][0]-bounds[i-1][1],specialEnvelope[i][0]-specialEnvelope[i-1][1])+offsets[i]-offsets[i-1]-gap;
        offsets[i]-=Math.max(0,Math.min(maxShift,available));
      }
    }
    if(locomotion||owner.reaction||owner.move?.id==='special'){
      let left=Math.min(...bounds.map((b,i)=>b[0]+offsets[i])),right=Math.max(...bounds.map((b,i)=>b[1]+offsets[i]));
      if(locomotion){
        const neutral=pairedMovementFormation(owner,false),dash=pairedMovementFormation(owner,true);
        const [limitLeft,limitRight]=pairedMovementLimits(owner,neutral,dash);
        left=Math.min(left,owner.x+limitLeft);
        right=Math.max(right,owner.x+limitRight);
      }
      const shift=left<6?6-left:right>WIDTH-6?WIDTH-6-right:0;
      for(let i=0;i<offsets.length;i++)offsets[i]+=shift;
    }
    return {data,offsets,bounds:bounds.map(([l,r],i)=>[l+offsets[i],r+offsets[i]])};
  };
  if(actors.length>2){
    // Keep a three-body team ordered and camera-bounded during broad motions.
    for(let i=1;i<actors.length;i++)offsets[i]=Math.max(0,bounds[i-1][1]+offsets[i-1]+12-bounds[i][0]);
    const center=(offsets[0]+offsets.at(-1)!)/2;for(let i=0;i<offsets.length;i++)offsets[i]-=center;
    const left=bounds[0][0]+offsets[0],right=bounds.at(-1)![1]+offsets.at(-1)!;
    const shift=left<6?6-left:right>WIDTH-6?WIDTH-6-right:0;
    for(let i=0;i<offsets.length;i++)offsets[i]+=shift;
    return finish();
  }
  const special=owner.move?.id==='special';
  if(owner.reaction?.kind==='knockdown'||samples.some(s=>s.sequence==='defeat'||s.sequence==='death'||s.sequence==='recoil')||special){
    let separation=Math.max(0,(bounds[0][1]+12-bounds[1][0])/2);
    if(special){
      // Open a stable formation before impact. Use the whole clip envelope so
      // alternating keys cannot make spacing jump on every contact.
      const envelopes=actors.map((actor,i)=>{
        const atlas=atlases.get(bodyAtlasIds(owner.id)[i])!,flip=actor.facing*atlas.facing*atlas.scale;
        const xs=(assistTiming.has(owner)?atlas.clips.assistAttack??atlas.clips.special??[]:atlas.clips.special??[]).flatMap(s=>[(s.bounds[0]-s.anchor[0])*flip+actor.x,(s.bounds[2]-s.anchor[0])*flip+actor.x]);
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
        return paintBounds(paintData(fallen,POSE_SLOTS.airFall,{...samples[i],sequence:'poses',slot:POSE_SLOTS.airFall,frameIndex:POSE_SLOTS.airFall},bodyAtlasIds(owner.id)[i])!);
      });
      separation=Math.max(separation,Math.max(0,(rest[0][1]+12-rest[1][0])/2)*Math.max(0,1-owner.reaction.t/10));
    }
    offsets[0]=-separation;offsets[1]=separation;
    const left=bounds[0][0]+offsets[0],right=bounds[1][1]+offsets[1];
    const shift=left<6?6-left:right>WIDTH-6?WIDTH-6-right:0;
    offsets[0]+=shift;offsets[1]+=shift;
  }
  return finish();
}
interface DashSpacingSample { frame:number; id:Fighter['id']; facing:number; distance:number; keepUntil:number }
const dashSpacingPlayback=new WeakMap<Fighter,DashSpacingSample>();

function duoLayout(owner:Fighter,actors:Fighter[],samples:PoseAtlasDebug[],frame:number) {
  const layout=baseDuoLayout(owner,actors,samples);
  const last=dashSpacingPlayback.get(owner);
  if(actors.length!==2||(!last&&layout.dashClearance===undefined))return layout;
  const lead=duoLeadIndex(owner),support=1-lead,sign=lead===0?1:-1;
  const distance=(layout.offsets[support]-layout.offsets[lead])*sign;
  if(layout.dashClearance!==undefined){
    if(owner.vx)dashSpacingPlayback.set(owner,{frame,id:owner.id,facing:owner.facing,distance,keepUntil:frame+3});
    else dashSpacingPlayback.delete(owner);
    return layout;
  }
  if(!last||last.id!==owner.id||last.facing!==owner.facing||last.frame>frame||
    owner.move||owner.stun||owner.blockstun||owner.reaction||throwScene?.fighters.includes(owner)){
    dashSpacingPlayback.delete(owner);
    return layout;
  }
  // Close the extra dash space over several cels after a brake or a wall
  // stop. The lead keeps its authored anchor, and the support stays in frame.
  const [left,right]=layout.bounds[support];
  const room=sign===1?WIDTH-6-right:left-6;
  const extra=Math.min(room,last.distance-distance-(frame-last.frame)*dashSpacingPerTick);
  if(extra>0){
    const dx=extra*sign;
    layout.offsets[support]+=dx;
    layout.bounds[support]=[left+dx,right+dx];
  }
  // A braking crouch can briefly require more room than the dash itself.
  // Keep that extra room for the following guard cel as well.
  if(extra>0||frame<=last.keepUntil)dashSpacingPlayback.set(owner,{...last,frame,distance:distance+Math.max(0,extra)});
  else dashSpacingPlayback.delete(owner);
  return layout;
}

export function getDuoLayoutDebug(f:Fighter,frame:number) {
  const actors=duoActors(f),samples=actors.map((actor,i)=>sample(actor,frame,false,bodyAtlasIds(f.id)[i],i/bodyAtlasIds(f.id).length));
  const {bounds,offsets,dashClearance}=duoLayout(f,actors,samples,frame);return {bounds,offsets,dashClearance};
}
/** QA only (scripts/sheet-render-qa.mjs): a sub-pixel offset added to every fighter
 * sprite, so a render comparison can move fighters without moving the stage. Always 0 in play. */
let qaNudge:[number,number]=[0,0],qaNudgeOnly:string|undefined;
/** `only` limits the nudge to one fighter id, so overlapping fighters can be moved independently. */
export function setPoseAtlasQaNudge(x:number,y:number,only?:string):void{qaNudge=[x,y];qaNudgeOnly=only;}
function paint(c: CanvasRenderingContext2D, f: Fighter, slot: PoseSlot, ghost: boolean, sampled?: PoseAtlasDebug, atlasId:string=f.id,offsetX=0): boolean {
  const data=paintData(f,slot,sampled,atlasId);if(!data)return false;
  const {atlas,source,transform,facing}=data;
  const nudge=qaNudgeOnly===undefined||qaNudgeOnly===sceneActor(f).id?qaNudge:[0,0];
  c.save(); c.translate(Math.round(transform.x+offsetX)+nudge[0],Math.round(transform.y)+nudge[1]);
  c.rotate(transform.angle); c.scale(facing * atlas.facing * atlas.scale, atlas.scale); c.imageSmoothingEnabled = false;
  const owner=sceneActor(f),scene=presentationScene,q=CHARACTER_ACTIONS[owner.id as keyof typeof CHARACTER_ACTIONS];
  if(scene?.fighters.includes(owner)&&scene.presentation.phase==='outro'&&scene.presentation.winner!==scene.fighters.indexOf(owner)&&owner.id==='sprotosales'&&!atlas.clips.death){
    const base=atlas.frames[0],u=Math.min(1,Math.max(0,scene.presentation.frame-12)/48);
    const parts=[[0,0,256,125,0,34],[0,125,94,51,-70,34],[94,125,42,51,0,34],[136,125,120,51,70,34],[0,176,112,80,-48,0],[112,176,144,80,48,0]];
    for(const[x,y,w,h,dx,dy]of parts){c.save();c.translate(dx*u,dy*u);drawFrameRect(c,base,x,y,w,h,x-base.anchor[0],y-base.anchor[1],w,h);c.restore();}c.restore();return true;
  }
  if(q?.replaceRanged&&f.move?.id==='bolt'&&!atlas.clips.ranged){
    const m=getMove(f,'bolt'),u=Math.min(1,f.move.t/(m.startup+m.active+m.recovery)),wave=Math.sin(u*Math.PI);
    c.translate((q.ranged%3-1)*wave*(3+q.ranged),-wave*(q.ranged%4));c.rotate((q.ranged%2?1:-1)*wave*.015*q.ranged);
  }
  if (ghost) c.globalAlpha *= .55;
  // Hit flash keeps the filter: an additive second draw is cheaper, but sprite-sheet
  // regions drawn with 'lighter' sample differently from whole PNGs in Chromium, so
  // it would change the flash's pixels (scripts/sheet-render-qa.mjs caught this).
  if (f.flash > 0 && f.flash % 4 < 2) c.filter = 'brightness(1.8)';
  drawFrame(c, source, -source.anchor[0]-transform.pivotX, -source.anchor[1]-transform.pivotY); c.restore(); return true;
}
/** False means no installed complete atlas; caller decides the fallback. */
export function drawPoseAtlas(c: CanvasRenderingContext2D, f: Fighter, frame: number, ghost = false, frozen = false): boolean {
  if (!atlases.has(f.id)) return false;
  if(isPairedFighter(f.id)){
    if(bodyAtlasIds(f.id).some(id=>!atlases.has(id)))return false;
    const actors=duoActors(f),order=actors.map((_,i)=>i);if(duoLeadSide(f)===-1)order.reverse();
    const samples=actors.map((actor,i)=>sample(actor,frame,frozen,bodyAtlasIds(f.id)[i],i/bodyAtlasIds(f.id).length));
    const layout=duoLayout(f,actors,samples,frame);
    for(const i of order){const id=bodyAtlasIds(f.id)[i];paint(c,actors[i],samples[i].slot,ghost,samples[i],id,layout.offsets[i]);}
    return true;
  }
  const sampled = sample(f, frame, frozen);
  return paint(c, f, sampled.slot, ghost, sampled);
}
/** Explicit slot sampling for an atlas review page, or ordinary playback when omitted. */
export function drawPoseAtlasSample(c: CanvasRenderingContext2D, f: Fighter, frame: number, slotOverride?: PoseSlot): boolean {
  if (slotOverride !== undefined && (!Number.isInteger(slotOverride) || slotOverride < 0 || slotOverride > 31)) throw new Error('Pose slot must be 0–31');
  if(isPairedFighter(f.id)){
    if(slotOverride===undefined)return drawPoseAtlas(c,f,frame);
    return duoActors(f).map((actor,i)=>paint(c,actor,slotOverride,false,undefined,bodyAtlasIds(f.id)[i])).every(Boolean);
  }
  const sampled = slotOverride === undefined ? sample(f, frame, false) : undefined;
  return paint(c, f, slotOverride ?? sampled!.slot, false, sampled);
}

/** Cache actual opaque standing bounds, including atlases without bounds metadata.
 * Reading alpha here leaves the combat atlas, anchors and scale untouched. */
const menuBounds=new WeakMap<LoadedFrame,readonly number[]>();
function selectionBounds(source:LoadedFrame):readonly number[] {
  let bounds=menuBounds.get(source);if(bounds)return bounds;
  // A sheet region reads only its trimmed rectangle; everything outside it is transparent.
  const region=source.region,[ox,oy]=region?[region[4],region[5]]:[0,0];
  const canvas=document.createElement('canvas');[canvas.width,canvas.height]=region?[region[2],region[3]]:imageSize(source.image);
  const context=canvas.getContext('2d',{willReadFrequently:true})!;
  if(region)context.drawImage(source.image,region[0],region[1],region[2],region[3],0,0,region[2],region[3]);else context.drawImage(source.image,0,0);
  const {data}=context.getImageData(0,0,canvas.width,canvas.height);
  let l=canvas.width,t=canvas.height,r=0,b=0;
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(data[(y*canvas.width+x)*4+3]>0){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x+1);b=Math.max(b,y+1);}
  bounds=r>l&&b>t?[l+ox,t+oy,r+ox,b+oy]:source.bounds;menuBounds.set(source,bounds);return bounds;
}
/** Menu-only framing: every visible body has the same standing height.
 * Pack opaque silhouettes, then fit the complete team within its preview area. */
export function drawSelectionPose(c:CanvasRenderingContext2D,f:Fighter,scale:number,maxWidth:number):boolean {
  // The full body when loaded, otherwise its standing-pose preview: the same image either way.
  const ids=bodyAtlasIds(f.id),standing=ids.map(id=>{const loaded=atlases.get(id);return loaded?{facing:loaded.facing,source:loaded.frames[0]}:previews.get(id);});
  if(standing.some(s=>!s))return false;
  const bodies=standing.map(s=>{
    const atlas={facing:s!.facing},source=s!.source,bounds=selectionBounds(source);
    const zoom=160/(bounds[3]-bounds[1]);
    return {atlas,source,bounds,zoom,width:(bounds[2]-bounds[0])*zoom};
  });
  const gap=6,width=bodies.reduce((sum,b)=>sum+b.width,0)+gap*(bodies.length-1);
  const fitted=Math.min(scale,maxWidth/Math.max(1,width));
  c.save();c.scale(fitted,fitted);c.imageSmoothingEnabled=false;
  let left=-width/2;
  for(const {atlas,source,bounds,zoom,width:bodyWidth} of bodies){
    c.save();c.translate(left+bodyWidth/2,0);c.scale(f.facing*atlas.facing*zoom,zoom);
    drawFrame(c,source,-(bounds[0]+bounds[2])/2,-bounds[3],true);c.restore();left+=bodyWidth+gap;
  }
  c.restore();return true;
}
/** QA (scripts/sheet-render-qa.mjs): draw every loaded frame of one body through the
 * same two helpers the game uses, in a grid, so a packed-sheet build can be compared
 * pixel for pixel with the individual PNGs. `pieces` splits each frame into the six
 * rectangles of the defeat break-apart. Returns the number of frames drawn. */
export function drawPoseAtlasFramesForQa(c:CanvasRenderingContext2D,id:string,cell:number,transform:{scale:number;angle:number;flip:1|-1;pieces?:boolean;seams?:boolean}):number{
  const atlas=atlases.get(id);if(!atlas)return 0;
  const all=[...atlas.frames,...(atlas.walkFrames??[]),...Object.values(atlas.clips).flat()] as LoadedFrame[];
  const perRow=Math.max(1,Math.floor(c.canvas.width/cell));
  all.forEach((f,i)=>{
    c.save();c.translate((i%perRow+.5)*cell,(Math.floor(i/perRow)+.5)*cell);c.rotate(transform.angle);c.scale(transform.flip*transform.scale,transform.scale);c.imageSmoothingEnabled=false;
    // `seams` strokes the cut lines instead, so a comparison can tell edge pixels of a cut apart.
    if(transform.pieces)for(const[x,y,w,h,dx]of[[0,0,256,125,0],[0,125,94,51,-9],[94,125,42,51,0],[136,125,120,51,9],[0,176,112,80,-6],[112,176,144,80,6]]){
      if(transform.seams){c.lineWidth=2/transform.scale;c.strokeStyle='#fff';c.strokeRect(x-f.anchor[0]+dx,y-f.anchor[1],w,h);}
      else drawFrameRect(c,f,x,y,w,h,x-f.anchor[0]+dx,y-f.anchor[1],w,h);
    }
    else drawFrame(c,f,-f.anchor[0],-f.anchor[1]);
    c.restore();
  });
  return all.length;
}
