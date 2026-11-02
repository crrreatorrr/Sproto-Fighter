import {PLAYABLE_FIGHTERS,isPairedFighter,type PlayableFighterId} from './core';
import {STORY_STAGE_IDS,type StageId} from './stage';

// Each historical save remains untouched. Older tabs cannot overwrite this revision.
export const LEGACY_STORY_SAVE_KEY='sproto-arena-story-v1';
export const PREVIOUS_STORY_SAVE_KEY='sproto-arena-story-v2';
export const STORY_SAVE_KEY='sproto-arena-story-v3';
export const STORY_TARGET_ROSTER=150;
export const STARTER_FIGHTERS:readonly PlayableFighterId[]=['highsproto','bront'];
// Optional user-supplied rivals stay late in Verse only when actually registered.
// String pins keep this module compatible with the original 102-fighter registry.
export const CAMPAIGN_RECRUITS:readonly string[]=['satoshi','xalt','potocaicai'];
// Frozen orders are migration schemas, never the source of the live campaign roster.
export const LEGACY_STORY_OPPONENTS:readonly PlayableFighterId[]=['zephyr', 'mox', 'rune', 'guest07', 'guest08', 'guest09', 'guest10', 'guest11', 'guest12', 'guest13', 'guest14', 'dumpstar', 'crapto', 'vamp', 'alpha777', 'mandela', 'bigswole', 'nate', 'nick', 'captain', 'highsproto', 'erik', 'bimba', 'gpm', 'leviosa', 'lifeisameme', 'thxobama', 'rlarsson', 'blorfo', 'michael', 'freshprince', 'mlk', 'sproto102', 'sproto215', 'sproto313', 'sproto651', 'sproto763', 'sproto818', 'sproto831', 'sproto834', 'sproto837', 'sproto865', 'sproto943', 'sproto999', 'sproto1011', 'sproto1093', 'sproto1187', 'sproto1335', 'sproto1345', 'sproto1414', 'sproto1477', 'sproto1601', 'sproto1668', 'sproto1815', 'sproto1870', 'sproto2101', 'sproto2177', 'sproto2322', 'sproto2381', 'sproto2531', 'sproto2569', 'sproto2616', 'sproto2789', 'sproto2884', 'sproto3106', 'sproto3152', 'sproto3215', 'uncmasterflex', 'vitaliketh', 'urmometh', 'chaton', 'loadthebags', 'sisma', 'captainhowdy', 'sprotosales', 'sprog', 'jasper', 'aaron', 'brainsprot', 'sober', 'olnoname', 'greatcharly', 'sproto282', 'sproto704', 'sproto832', 'sproto1499', 'sproto1625', 'sproto2010', 'sproto2075', 'sproto2210', 'sproto2344', 'sproto3181', 'sproto3224', 'sproto3235', 'gryph', 'godmod3d', 'nosmileclown', 'duo', 'vela', 'vaudream'];

const previousReturning=LEGACY_STORY_OPPONENTS.filter(id=>id!=='highsproto');
export const PREVIOUS_STORY_OPPONENTS:readonly PlayableFighterId[]=[...previousReturning.slice(0,-2),'rivet',...previousReturning.slice(-2)];
export interface Encounter {
    id:string;index:number;opponent:PlayableFighterId;opponents:readonly PlayableFighterId[];
    stage:StageId;chapter:number;gauntlet?:'art'|'final';
}
const singleId=(id:string)=>`story-v1-${id}`;
const groupId=(ids:readonly string[])=>ids.length===1?singleId(ids[0]):`story-v3-gauntlet-${ids.join('+')}`;

/** Every registered non-starter appears once; missing references never become fake rivals. */
export function campaignForStages(stages:readonly StageId[]=STORY_STAGE_IDS,registered:readonly PlayableFighterId[]=PLAYABLE_FIGHTERS):Encounter[]{
    if(stages.length<3)throw new Error('Campaign requires at least three story locations.');
    const available=new Set(registered),starters=new Set<PlayableFighterId>(STARTER_FIGHTERS);
    const pinned=CAMPAIGN_RECRUITS.flatMap(pin=>{const id=registered.find(candidate=>candidate===pin);return id?[id]:[];});
    const tail=new Set<PlayableFighterId>([...pinned,'rivet','sproto865','sproto943','vela','vaudream']);
    const ordered=[...new Set([...PREVIOUS_STORY_OPPONENTS,...registered])].filter(id=>available.has(id)&&!starters.has(id));
    const regular=ordered.filter(id=>!tail.has(id)&&!isPairedFighter(id));
    const paired=ordered.filter(id=>!tail.has(id)&&isPairedFighter(id));
    const route:Encounter[]=[];
    function append(opponents:readonly PlayableFighterId[],chapter:number,gauntlet?:Encounter['gauntlet']){
        const present=opponents.filter(id=>available.has(id)&&!starters.has(id));if(!present.length)return;
        route.push({id:groupId(present),index:route.length,opponent:present[0],opponents:present,stage:stages[chapter],chapter:chapter+1,...(present.length>1&&gauntlet?{gauntlet}:{})});
    }
    regular.forEach((id,index)=>append([id],Math.min(stages.length-3,Math.floor(index*(stages.length-2)/Math.max(1,regular.length)))));
    for(const id of paired)append([id],stages.length-2);
    for(const id of pinned)append([id],stages.length-2);
    append(['rivet'],stages.length-2);
    append(['sproto865','sproto943'],stages.length-2,'art');
    append(['vela','vaudream'],stages.length-1,'final');
    return route;
}
export const STORY_ENCOUNTERS=campaignForStages();
export const STORY_OPPONENTS:readonly PlayableFighterId[]=STORY_ENCOUNTERS.flatMap(e=>e.opponents);
export const TWIN_ENCOUNTER_START=STORY_ENCOUNTERS.findIndex(e=>isPairedFighter(e.opponent));
export const ART_GAUNTLET_INDEX=STORY_ENCOUNTERS.findIndex(e=>e.gauntlet==='art');
export const FINALE_START=STORY_ENCOUNTERS.findIndex(e=>e.gauntlet==='final');
export const STORY_ROSTER_COUNTS={installed:PLAYABLE_FIGHTERS.length,target:STORY_TARGET_ROSTER,missing:Math.max(0,STORY_TARGET_ROSTER-PLAYABLE_FIGHTERS.length),rivals:STORY_OPPONENTS.length,encounters:STORY_ENCOUNTERS.length} as const;

type Save={version:3;cleared:string[];unlocked:string[];godModeUnlocked:boolean};
export type SaveStorage=Pick<Storage,'getItem'|'setItem'>;
const fighterToken=(value:unknown):value is string=>typeof value==='string'&&/^[a-z0-9_-]{1,100}$/.test(value);
const encounterToken=(value:unknown):value is string=>typeof value==='string'&&/^story-(?:v1-[a-z0-9_-]+|v3-gauntlet-[a-z0-9_+\-]+)$/.test(value)&&value.length<=300;
function record(value:unknown,version:number){
    return value&&typeof value==='object'&&(value as {version?:unknown}).version===version
        ?value as {cleared?:unknown;unlocked?:unknown;godModeUnlocked?:unknown}:null;
}

/** The optional route/registry parameters support isolated migration and expansion checks. */
export function createStoryProgress(storage?:SaveStorage,encounters:readonly Encounter[]=STORY_ENCOUNTERS,registered:readonly PlayableFighterId[]=PLAYABLE_FIGHTERS){
    const available=new Set<string>(registered),starterIds=STARTER_FIGHTERS.filter(id=>available.has(id));
    const isAvailable=(id:string):id is PlayableFighterId=>available.has(id);
    const empty=():Save=>({version:3,cleared:[],unlocked:[...starterIds],godModeUnlocked:false});
    const routeComplete=(cleared:ReadonlySet<string>)=>encounters.length>0&&encounters.every(e=>cleared.has(e.id));
    function normalize(value:unknown):Save{
        const data=record(value,3);if(!data)return empty();
        // Retain syntactically valid future IDs in storage so a stale tab cannot erase
        // progress earned by a newer roster. Only registered IDs are exposed by snapshot.
        const cleared=new Set<string>((Array.isArray(data.cleared)?data.cleared:[]).filter(encounterToken));
        const unlocked=new Set<string>([...starterIds,...(Array.isArray(data.unlocked)?data.unlocked:[]).filter(fighterToken)]);
        for(const encounter of encounters)if(cleared.has(encounter.id))for(const id of encounter.opponents)unlocked.add(id);
        return {version:3,cleared:[...cleared],unlocked:[...unlocked],godModeUnlocked:data.godModeUnlocked===true||routeComplete(cleared)};
    }
    function migrate(value:unknown,version:1|2):Save{
        const data=record(value,version);if(!data)return empty();
        const order=version===1?LEGACY_STORY_OPPONENTS:PREVIOUS_STORY_OPPONENTS;
        const cleared=new Set(Array.isArray(data.cleared)?data.cleared:[]),won=new Set<string>(),unlocked=new Set<string>(starterIds);
        let prefixLength=0;
        for(const id of order){if(!cleared.has(singleId(id)))break;won.add(id);unlocked.add(id);prefixLength++;}
        // Old Morelight wins recruited him but never saved the midpoint of that finale.
        if(prefixLength===order.length-1)won.delete('vela');
        for(const id of (Array.isArray(data.unlocked)?data.unlocked:[]).filter(fighterToken))unlocked.add(id);
        if(version===1)unlocked.add('rivet');
        const completed=prefixLength===order.length;
        if(completed)won.add('rivet');
        const migrated=encounters.filter(e=>e.opponents.every(id=>won.has(id))).map(e=>e.id);
        return normalize({version:3,cleared:migrated,unlocked:[...unlocked],godModeUnlocked:completed});
    }
    function combine(...saves:Save[]):Save{
        return normalize({version:3,cleared:saves.flatMap(s=>s.cleared),unlocked:saves.flatMap(s=>s.unlocked),godModeUnlocked:saves.some(s=>s.godModeUnlocked)});
    }
    let save=empty(),persistent=!!storage,run:{id:string;wave:number}|null=null;
    const listeners=new Set<()=>void>();
    function read(){
        if(!storage)return empty();
        const get=(key:string)=>{try{const raw=storage!.getItem(key);try{return JSON.parse(raw||'null');}catch{return null;}}catch{persistent=false;return null;}};
        return combine(normalize(get(STORY_SAVE_KEY)),migrate(get(PREVIOUS_STORY_SAVE_KEY),2),migrate(get(LEGACY_STORY_SAVE_KEY),1));
    }
    save=read();
    const merge=()=>{save=combine(save,read());};
    const emit=()=>{for(const notify of listeners)notify();};
    function write(){try{if(!storage)throw new Error('Storage unavailable');storage.setItem(STORY_SAVE_KEY,JSON.stringify(save));persistent=true;}catch{persistent=false;}emit();}
    const isCleared=(index:number)=>!!encounters[index]&&save.cleared.includes(encounters[index].id);
    const nextIndex=()=>{const index=encounters.findIndex((_,i)=>!isCleared(i));return index<0?null:index;};
    const canPlay=(index:number)=>Number.isInteger(index)&&index>=0&&index<encounters.length&&(isCleared(index)||index===nextIndex());
    const currentWave=(index:number)=>run&&run.id===encounters[index]?.id?run.wave:0;
    function abandonRun(){run=null;emit();}
    return {
        snapshot:()=>({version:3 as const,cleared:encounters.filter((_,i)=>isCleared(i)).map(e=>e.id),unlocked:save.unlocked.filter(isAvailable),persistent,completed:routeComplete(new Set(save.cleared)),godModeUnlocked:save.godModeUnlocked,nextIndex:nextIndex(),activeRun:run?{...run}:null,finaleReady:!!run&&run.wave>0&&encounters.find(e=>e.id===run!.id)?.gauntlet==='final'}),
        isUnlocked:(id:PlayableFighterId)=>available.has(id)&&save.unlocked.includes(id),isCleared,canPlay,currentWave,
        currentOpponent:(index:number)=>encounters[index]?.opponents[currentWave(index)],
        begin(index:number){merge();if(!canPlay(index))return false;run={id:encounters[index].id,wave:0};return true;},
        win(index:number,wave=0){
            merge();const encounter=encounters[index];if(!canPlay(index)||!encounter||!Number.isInteger(wave)||wave<0||wave>=encounter.opponents.length)return false;
            if(wave===0){if(run?.id===encounter.id&&run.wave!==0)return false;run={id:encounter.id,wave:0};}
            else if(run?.id!==encounter.id||run.wave!==wave)return false;
            const opponent=encounter.opponents[wave];if(!save.unlocked.includes(opponent))save.unlocked.push(opponent);
            if(wave===encounter.opponents.length-1){if(!save.cleared.includes(encounter.id))save.cleared.push(encounter.id);run=null;save.godModeUnlocked||=routeComplete(new Set(save.cleared));}
            else run={id:encounter.id,wave:wave+1};
            write();return true;
        },
        abandonRun,abandonFinale:abandonRun,
        sync(){merge();emit();},
        subscribe(listener:()=>void){listeners.add(listener);return ()=>listeners.delete(listener);},
    };
}
let browserStorage:SaveStorage|undefined;
try{browserStorage=globalThis.localStorage;}catch{/* The UI reports session-only progress. */}
export const storyProgress=createStoryProgress(browserStorage);
if(typeof window!=='undefined'){
    window.addEventListener('storage',event=>{if([STORY_SAVE_KEY,PREVIOUS_STORY_SAVE_KEY,LEGACY_STORY_SAVE_KEY,null].includes(event.key))storyProgress.sync();});
    window.addEventListener('focus',()=>storyProgress.sync());
    window.addEventListener('pageshow',()=>storyProgress.sync());
}
export type StoryProgress=ReturnType<typeof createStoryProgress>;
