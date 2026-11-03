import { type FighterId } from './core';
// Mount-aware public URL, same rule as poseAtlas.ts and stage.ts.
const asset=(path:string)=>{
 const base=typeof document==='undefined'?'/':(document.querySelector?.('meta[name="sproto-asset-base"]') as HTMLMetaElement|null)?.content||'/';
 return base+path.replace(/^\/+/, '');
};
/**
 * Downloadable fighter portraits, generated from the originals listed in
 * originalPortraits.ts by scripts/build-portraits.py. The originals are mostly
 * 1000 px PNGs (about 83 MB together); these WebP copies total about 5 MB.
 */
/** 192 px: selection grid and campaign map (shown at about 96 px). */
export const portraitThumb=(id:FighterId)=>asset(`/portraits/thumb/${id}.webp`);
/** 640 px: versus screen and selection echoes (shown up to about 340 px). */
export const portraitLarge=(id:FighterId)=>asset(`/portraits/large/${id}.webp`);
