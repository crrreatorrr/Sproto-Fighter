import { drawHiggsfieldFighter } from './higgsfieldRig';
import { animationFrame } from './animationClock';
import { drawBigSwole, drawBigSwolePortrait } from './bigSwoleArt';
import { drawNate, drawNatePortrait } from './nateArt';
import { drawVamp, drawVampPortrait } from './vampArt';
import { drawAlpha777, drawAlpha777Portrait } from './alpha777Art';
import { drawMandela, drawMandelaPortrait } from './mandelaArt';
import { type Fighter, type FighterId } from './core';
import { drawRivet, drawRivetPortrait } from './fighterArt';
import { drawVela, drawVelaPortrait } from './velaArt';
import { drawBront, drawBrontPortrait } from './brontArt';
import { drawZephyr, drawZephyrPortrait } from './zephyrArt';
import { drawMox, drawMoxPortrait } from './moxArt';
import { drawRune, drawRunePortrait } from './runeArt';
import { drawDumpstar, drawDumpstarPortrait } from './dumpstarArt';
import { drawRosterA, drawRosterAPortrait, type RosterAId } from './rosterArtA';
import { drawRosterB, drawRosterBPortrait } from './rosterArtB';
import { drawRosterC, drawRosterCPortrait } from './rosterArtC';
const original = {bigswole:[drawBigSwole,drawBigSwolePortrait],nate:[drawNate,drawNatePortrait],vamp:[drawVamp,drawVampPortrait],alpha777:[drawAlpha777,drawAlpha777Portrait],mandela:[drawMandela,drawMandelaPortrait],rivet:[drawRivet,drawRivetPortrait],vela:[drawVela,drawVelaPortrait],bront:[drawBront,drawBrontPortrait],zephyr:[drawZephyr,drawZephyrPortrait],mox:[drawMox,drawMoxPortrait],rune:[drawRune,drawRunePortrait],dumpstar:[drawDumpstar,drawDumpstarPortrait]} as const;
export function drawSprite(c:CanvasRenderingContext2D,f:Fighter,frame:number,ghost=false,frozen=false){
 if(drawHiggsfieldFighter(c,f,frame,ghost,frozen))return;
 frame=animationFrame(f,frame,frozen);
 if(f.id in original) original[f.id as keyof typeof original][0](c,f,frame,ghost);
 else if(['guest07','guest08','guest09'].includes(f.id))drawRosterA(c,f,frame,ghost);
 else if(['guest10','guest11','guest12'].includes(f.id))drawRosterB(c,f,frame,ghost);
 else drawRosterC(c,f,frame,ghost);
}
export function drawPortrait(c:CanvasRenderingContext2D,id:FighterId,w:number,h:number){
 if(id in original)original[id as keyof typeof original][1](c,w,h);
 else if(['guest07','guest08','guest09'].includes(id))drawRosterAPortrait(c,id as RosterAId,w,h);
 else if(['guest10','guest11','guest12'].includes(id))drawRosterBPortrait(c,id,w,h);
 else drawRosterCPortrait(c,id,w,h);
}
