import {PLAYABLE_FIGHTERS, type PlayableFighterId} from './core';
import {STORY_STAGE_IDS, type StageId} from './stage';

export const STORY_SAVE_KEY='sproto-arena-story-v1';
export const STARTER_FIGHTERS:readonly PlayableFighterId[]=['rivet','bront'];
// Fixed v1 order: adding or reordering the menu roster must never change saved encounters.
export const STORY_OPPONENTS:readonly PlayableFighterId[]=['zephyr', 'mox', 'rune', 'guest07', 'guest08', 'guest09', 'guest10', 'guest11', 'guest12', 'guest13', 'guest14', 'dumpstar', 'crapto', 'vamp', 'alpha777', 'mandela', 'bigswole', 'nate', 'nick', 'captain', 'highsproto', 'erik', 'bimba', 'gpm', 'leviosa', 'lifeisameme', 'thxobama', 'rlarsson', 'blorfo', 'michael', 'freshprince', 'mlk', 'sproto102', 'sproto215', 'sproto313', 'sproto651', 'sproto763', 'sproto818', 'sproto831', 'sproto834', 'sproto837', 'sproto865', 'sproto943', 'sproto999', 'sproto1011', 'sproto1093', 'sproto1187', 'sproto1335', 'sproto1345', 'sproto1414', 'sproto1477', 'sproto1601', 'sproto1668', 'sproto1815', 'sproto1870', 'sproto2101', 'sproto2177', 'sproto2322', 'sproto2381', 'sproto2531', 'sproto2569', 'sproto2616', 'sproto2789', 'sproto2884', 'sproto3106', 'sproto3152', 'sproto3215', 'uncmasterflex', 'vitaliketh', 'urmometh', 'chaton', 'loadthebags', 'sisma', 'captainhowdy', 'sprotosales', 'sprog', 'jasper', 'aaron', 'brainsprot', 'sober', 'olnoname', 'greatcharly', 'sproto282', 'sproto704', 'sproto832', 'sproto1499', 'sproto1625', 'sproto2010', 'sproto2075', 'sproto2210', 'sproto2344', 'sproto3181', 'sproto3224', 'sproto3235', 'gryph', 'godmod3d', 'nosmileclown', 'duo', 'vela', 'vaudream'];
export const TWIN_ENCOUNTER_START=82;
export const FINALE_START=98;
export interface Encounter {id:string;index:number;opponent:PlayableFighterId;stage:StageId;chapter:number}
export function campaignForStages(stages:readonly StageId[]=STORY_STAGE_IDS):Encounter[]{
    if(stages.length<3||stages.length>TWIN_ENCOUNTER_START+2)throw new Error('Campaign requires at least three story locations.');
    return STORY_OPPONENTS.map((opponent,index)=>{const chapter=index>=FINALE_START?stages.length-1:index>=TWIN_ENCOUNTER_START?stages.length-2:Math.floor(index*(stages.length-2)/TWIN_ENCOUNTER_START);return {id:`story-v1-${opponent}`,index,opponent,stage:stages[chapter],chapter:chapter+1};});
}
export const STORY_ENCOUNTERS=campaignForStages();
type Save={version:1;cleared:string[];unlocked:PlayableFighterId[]};
export type SaveStorage=Pick<Storage,'getItem'|'setItem'>;
const empty=():Save=>({version:1,cleared:[],unlocked:[...STARTER_FIGHTERS]});
function normalize(value:unknown):Save{
    if(!value||typeof value!=='object'||(value as Save).version!==1)return empty();
    const data=value as Save,cleared=new Set(Array.isArray(data.cleared)?data.cleared:[]),unlocked=new Set<PlayableFighterId>(STARTER_FIGHTERS),prefix:string[]=[];
    // A malformed or partial save cannot open a later stage by skipping its predecessors.
    for(const encounter of STORY_ENCOUNTERS){if(!cleared.has(encounter.id))break;prefix.push(encounter.id);unlocked.add(encounter.opponent);}
    // Morelight alone is never a reload checkpoint for the two-boss finale.
    if(prefix.length===99)prefix.pop();
    for(const id of Array.isArray(data.unlocked)?data.unlocked:[])if(PLAYABLE_FIGHTERS.includes(id))unlocked.add(id);
    return {version:1,cleared:prefix,unlocked:[...unlocked]};
}
export function createStoryProgress(storage?:SaveStorage){
    let save=empty(),persistent=!!storage,finaleReady=false;const listeners=new Set<()=>void>();
    function read(){if(!storage)return empty();let raw:string|null;try{raw=storage.getItem(STORY_SAVE_KEY);}catch{persistent=false;return empty();}try{return normalize(JSON.parse(raw||'null'));}catch{return empty();}}
    save=read();
    function merge(){const disk=read();save=normalize({version:1,cleared:save.cleared.length>=disk.cleared.length?save.cleared:disk.cleared,unlocked:[...save.unlocked,...disk.unlocked]});}
    function emit(){for(const notify of listeners)notify();}
    function write(){try{if(!storage)throw new Error('Storage unavailable');storage.setItem(STORY_SAVE_KEY,JSON.stringify(save));persistent=true;}catch{persistent=false;}emit();}
    return {
        snapshot:()=>({...save,cleared:[...save.cleared],unlocked:[...save.unlocked],persistent,completed:save.cleared.length===STORY_ENCOUNTERS.length,finaleReady}),
        isUnlocked:(id:PlayableFighterId)=>save.unlocked.includes(id),
        canPlay:(index:number)=>Number.isInteger(index)&&index>=0&&index<STORY_ENCOUNTERS.length&&((index<=save.cleared.length&&index!==99)||(index===99&&finaleReady)),
        win(index:number){
            merge();const encounter=STORY_ENCOUNTERS[index];if(!encounter)return false;
            if(index===99){if(!finaleReady||save.cleared.length<FINALE_START)return false;if(save.cleared.length===FINALE_START)save.cleared.push(STORY_ENCOUNTERS[98].id,encounter.id);finaleReady=false;}
            else if(index===FINALE_START){if(save.cleared.length<FINALE_START)return false;finaleReady=true;}
            else {if(index>save.cleared.length)return false;if(index===save.cleared.length)save.cleared.push(encounter.id);}
            if(!save.unlocked.includes(encounter.opponent))save.unlocked.push(encounter.opponent);write();return true;
        },
        abandonFinale(){finaleReady=false;},
        sync(){merge();emit();},
        subscribe(listener:()=>void){listeners.add(listener);return ()=>listeners.delete(listener);},
    };
}
let browserStorage:SaveStorage|undefined;
try{browserStorage=globalThis.localStorage;}catch{/* The UI reports session-only progress. */}
export const storyProgress=createStoryProgress(browserStorage);
if(typeof window!=='undefined')window.addEventListener('storage',event=>{if(event.key===STORY_SAVE_KEY||event.key===null)storyProgress.sync();});
export type StoryProgress=ReturnType<typeof createStoryProgress>;
