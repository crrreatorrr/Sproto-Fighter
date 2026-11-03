import {STAGES, type StageId} from './stage';
import {STORY_LOCATIONS} from './stageVariants';

/** Menu families follow the story regions; Ranch countryside also appears in the opening campaign. */
export const STAGE_ZONES = [
 {id:'trenches',name:'The Trenches'}, {id:'circuit',name:'The City'},
 {id:'yacht',name:'The Yacht'}, {id:'throne',name:'The Castle'},
 {id:'bar',name:'The Bar'}, {id:'verse',name:'The Verse'},
 {id:'hatchery',name:'The Hatchery'}, {id:'ranch',name:'The Ranch'},
] as const;
export type StageZoneId = typeof STAGE_ZONES[number]['id'];
export function stageZone(id:StageId):StageZoneId {
 const parent=STAGES.find(stage=>stage.id===id)?.parent;if(parent)return stageZone(parent);
 if(id==='retro')return 'circuit';
 if(id==='castle')return 'throne';
 if(STAGE_ZONES.some(zone=>zone.id===id))return id as StageZoneId;
 const location=STORY_LOCATIONS.find(location=>location.image===`/stages/higgsfield/${id}.png`);
 if(location&&STAGE_ZONES.some(zone=>zone.id===location.stage))return location.stage as StageZoneId;
 throw new Error(`Stage has no menu zone: ${id}`);
}
export const stagesInZone=(zone:StageZoneId)=>STAGES.filter(stage=>stageZone(stage.id)===zone);
