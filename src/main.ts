import { enableMatchDepth, nextMatchRound, chapterBossModifier, type MatchModifier } from './core';
import { TrainingRecorder, drawTrainingGeometry, trainingReadout } from './training';
import { TutorialCoach, drawTutorial } from './tutorial';
import { fighterMoves, sharedTechniques, type MoveRow } from './moveList';
import { ensurePoseAtlases, ensurePosePreviews, getPoseAtlasLoadStatus } from './poseAtlas';
import { createSelectionMenu, type MenuMode, type SelectionSetup } from './selectionMenu';
import './style.css';
import './arcadeSelection.css';
import './pixelUI.css';
import './mysticUI.css';
import './campaignMap.css';
import './versusScreen.css';
import {createVersusScreen} from './versusScreen';
import {createFightCountdown} from './fightCountdown';
import {mountCampaignMap} from './campaignMap';
import { FEEDBACK_KEY, P2_KEYS, PAD_DEFAULTS, UNBOUND, keyboardMask, menuKeyDirection, pressedMask, padMask, rebindKey, rebindPad, resolveKeyConflicts } from './localInput';
import { PAD, PadInput, MenuRepeat, menuDirection, padButtonName, canBindPadButton, type MenuDirection, type PadView } from './gamepad';
import { A, ROSTER, PLAYABLE_FIGHTERS, createState, cpuInput, step, type Action, type PlayableFighterId as FighterId, type Mode, type CombatState } from './core';
import { render } from './render';
import { ensurePowerArt } from './powerArt';
import { playRetainCallout } from './characterVoice';
import { createRoundPresentation, advanceRoundPresentation, beginRoundOutro, type RoundPresentation } from './animationEvents';
import { STAGES, setStage, loadStageArt, loadStagePreviews, getStageArtStatus, type StageId } from './stage';
import { stageZone } from './stageGroups';
import {storyProgress,STORY_ENCOUNTERS} from './storyProgress';
import {storyLocationForEncounter,loadStoryLocation,setActiveStoryLocation} from './stageVariants';
import {bossFightInput,bossKeyInput,drawMovingStoryBoss,drawStoryBossAttacks,drawStoryBossPose,loadStoryBossArt,startStoryBoss,stepStoryBoss,storyBossPlayerPose,storyBossTitle,type StoryBoss,type BossForm} from './storyBoss';
import {createStoryAnimation,storyAnimationPlan} from './storyAnimation';
import { createStoryMode } from './storyMode';
import {createPartnerPicker} from './partnerPicker';
import { connectHub, hubConfigured, type HubLink } from './hub/link';
import { BELT_OPPONENT, BELT_WORLD } from './hub/config';
import { OnlineMatch } from './net/onlineMatch';
import type { DuelOutcome } from './net/hubDuel';
import { isFighterAvailable, fighterLockReason, readRelicCache, writeRelicCache } from './hub/roster';
import { crashGuard, createFrameLoop } from './crash';
import { createAudio, fightMusicCue } from './audio';
import { SoundTracker } from './audioEvents';
import { showCrashPanel } from './crashPanel';
import { setupFeedback, type FeedbackFighter, type FeedbackSnapshot } from './feedback';
// Uncaught errors and rejections share the frame loop's counter; the panel opens once the game pauses.
crashGuard.install(window, document);
crashGuard.onFatal(report => showCrashPanel(report));
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('game'), ctx = canvas.getContext('2d')!;
/** The footer names the round rule in force: the menu's choice while choosing, the match's own once it starts. */
function updateFooter(timed:boolean){
    const text=`${PLAYABLE_FIGHTERS.length} FIGHTERS · ${STAGES.length} STAGES · ${timed?'BEST OF 3 · 60-SECOND ROUNDS':'UNLIMITED ROUND TIME'}`,footer=$('roster-count');
    if(footer.textContent!==text)footer.textContent=text;
}
updateFooter(false);
const defaults: Record<Action, string> = { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', light: 'KeyJ', medium: 'KeyK', heavy: 'KeyL', launcher: 'KeyU', bolt: 'KeyI', grab: 'KeyO', special: 'KeyP', dash: 'ShiftLeft' };
// Controller defaults for both players; see PAD_DEFAULTS for the reasoning.
const padDefaults: Partial<Record<Action, number>> = PAD_DEFAULTS;
const labels: Record<Action, string> = { left: 'Move left', right: 'Move right', up: 'Jump', down: 'Crouch', light: 'Light', medium: 'Medium', heavy: 'Finisher', launcher: 'Launcher', bolt: 'Ranged power', grab: 'Grab', special: 'Team special', dash: 'Dash' };
// Player 1 and player 2 (local versus) each have their own keyboard and gamepad mappings.
let keys = { ...defaults }, padKeys = { ...padDefaults };
let keys2: Record<Action, string> = { ...P2_KEYS }, padKeys2 = { ...padDefaults };
// Saved under the project's old working name until this release; read it once
// so remapped controls survive, then save under the new key.
const CONTROLS_KEY = 'sproto-arena-controls', LEGACY_CONTROLS_KEY = 'neon-relay-controls';
try {
    const saved = JSON.parse(localStorage.getItem(CONTROLS_KEY) ?? localStorage.getItem(LEGACY_CONTROLS_KEY) ?? 'null');
    if (saved) {
        for (const a of Object.keys(defaults) as Action[])
            if (typeof saved.keys?.[a] === 'string')
                keys[a] = saved.keys[a];
        for (const a of Object.keys(padDefaults) as Action[])
            if (Number.isInteger(saved.padKeys?.[a]))
                padKeys[a] = saved.padKeys[a];
        if ((saved.controlsVersion??0)<3 && ['Space','ArrowUp'].includes(keys.up) && !Object.entries(keys).some(([a,k]) => a !== 'up' && k === 'KeyW')) keys.up = 'KeyW';
        for (const a of Object.keys(defaults) as Action[])
            if (typeof saved.keys2?.[a] === 'string')
                keys2[a] = saved.keys2[a];
        for (const a of Object.keys(padDefaults) as Action[])
            if (Number.isInteger(saved.padKeys2?.[a]))
                padKeys2[a] = saved.padKeys2[a];
    }
}
catch { /* Storage may be disabled. Defaults still work. */ }
// N twice opens feedback: a saved mapping can never hold it.
for (const a of Object.keys(defaults) as Action[]) if (keys[a] === FEEDBACK_KEY) keys[a] = defaults[a];
resolveKeyConflicts(keys, keys2);
const depthParams = new URLSearchParams(location.search);
const depthEnabled = depthParams.has('matchDepth');
const depthModifiers: MatchModifier[] = ['none','double-meter','low-gravity','specials-only','sudden-death','reflect-projectiles'];
const depthModifier = depthModifiers.find(m => m === depthParams.get('modifier')) ?? 'none';
const depthRoundStarts: number[] = [];
// Training (hitbox overlay, input and advantage readouts, route recording) is a menu entry; `?training` still turns it on for every practice round.
const trainingFlag = depthParams.has('training'), trainingRecorder = new TrainingRecorder();
const tutorialCoach = new TutorialCoach();
/** What drives the practice dummy this round: the recorder in Training, the coach in the Tutorial, otherwise null. */
let training: TrainingRecorder | TutorialCoach | null = trainingFlag ? trainingRecorder : null;
let matchDepthOptions: { rounds: boolean; modifier: MatchModifier } | null = null;
let state = createState('highsproto'), chosen: FighterId = 'highsproto', mode: Mode = 'cpu', opponent: FighterId | undefined = 'vela', running = false, started = false, remapping: {
    action: Action;
    device: 'key' | 'pad';
    player: 1 | 2;
} | null = null;
/** Which player's mappings the Controls panel is showing. */
let controlsPlayer: 1 | 2 = 1;
let matchCpuSkill=4,matchDifficultyAssist=false;
/** True while the story encounter being played has never been cleared on this save. */
let matchFirstClear=false;
let matchGodMode=false, matchEarnedGodMode=false, testingGodMode=false, matchTesting=false;
let presentation = createRoundPresentation();
let padNeedsRelease=true;
/** Every connected controller, read once per frame: sticky P1/P2 assignment and latch-on-connect. */
const padInput = new PadInput(), menuRepeat = new MenuRepeat();
/** Player 2's controller as of the last poll (local versus). */
let padP2: PadView | null = null;
/** The device the player last used; decides which prompts the fight screen shows. */
let lastDevice: 'key' | 'pad' = 'key';
let resumeAfterSettings = false, accumulator = 0, lastTime = 0, previousPad: number[] = [], previousPad2: number[] = [], previousStart = false;
let visualFrame = 0;
/** Presentation only: the final hit plays at reduced speed. Fixed steps and replay inputs are unchanged. */
const KO_SLOW_FRAMES = 20, KO_SLOW_RATE = .4;
let koSlow = 0, koSeen = false;
const held = new Set<string>();
const blockedKeys = new Set<string>();
let queued = 0, queued2 = 0; // presses since the last frame, per playerqueued2=0;
const storyAnimation=createStoryAnimation();
let storyBoss:StoryBoss|null=null;
let storyBossArt:Awaited<ReturnType<typeof loadStoryBossArt>>|null=null;
const bossStarts:{frame:number;form:BossForm}[]=[];
const godModeChanges:{frame:number;enabled:boolean}[]=[];
const sceneSkip=document.createElement('button');
sceneSkip.className='quiet';sceneSkip.textContent='Skip animation';sceneSkip.hidden=true;sceneSkip.id='story-animation-skip';
sceneSkip.onclick=()=>{if(running&&!dialog.open&&!story.isOpen)storyAnimation.skip();};
canvas.parentElement!.append(sceneSkip);
const countdown=createFightCountdown(canvas.parentElement!);
const versus=createVersusScreen($('fight-view'),()=>{
    // Dismissing a preview must never become an attack, jump or pause in combat.
    for(const code of held)blockedKeys.add(code);
    held.clear();queued=0;queued2=0;padNeedsRelease=true;
    if(!storyAnimation.start('intro'))countdown.show();
    if(running&&!dialog.open&&!story.isOpen)canvas.focus();
});
const frames: [
    number,
    number
][] = [];
const storage = (() => { try { return window.localStorage; } catch { return null; } })();
let hubRelics: string[] = readRelicCache(storage);
// ---- Sound (src/audio.ts): recorded menu theme, UI click, combat clips, and the Trenches fight theme. ----
const audio = createAudio(storage), sounds = new SoundTracker();
let soundPhase: RoundPresentation['phase'] | null = null, lastMenuSound = 0;
for (const type of ['keydown', 'pointerdown'] as const) window.addEventListener(type, () => { audio.unlock(); }, { capture: true });
/** Same recorded click for every menu action. A second event in the same turn (focus, then the click that caused it) is one press. */
const UI_CHAIN_MS = 16;
function menuSound(name: 'menuMove' | 'menuConfirm' | 'menuBack') {
    if (feedbackHold) return;
    lastMenuSound = performance.now(); audio.play(name, { volume: .8 });
}
const chainedUi = () => performance.now() - lastMenuSound < UI_CHAIN_MS;
let pointerArmed = false, focusedByPointer: EventTarget | null = null;
document.addEventListener('pointerdown', () => { pointerArmed = true; focusedByPointer = null; }, true);
document.addEventListener('focusin', e => {
    if (!(e.target instanceof HTMLElement) || !e.target.matches('button,select,input') || chainedUi()) return;
    if (pointerArmed) focusedByPointer = e.target;
    menuSound('menuMove');
});
document.addEventListener('click', e => {
    const button = e.target instanceof Element ? e.target.closest('button') : null;
    const fromPress = pointerArmed && button !== null && button === focusedByPointer;
    pointerArmed = false;
    if (!button || fromPress || chainedUi()) return;
    menuSound('menuConfirm');
});
document.addEventListener('change', e => {
    const target = e.target;
    const ui = target instanceof HTMLSelectElement || (target instanceof HTMLInputElement && (target.type === 'checkbox' || target.type === 'radio'));
    if (!ui || chainedUi()) return;
    menuSound('menuMove');
});
document.addEventListener('sproto-menu-ui', () => { if (!chainedUi()) menuSound('menuBack'); });
/** Once per rendered frame: pick the music and voice whatever the fight just did. */
function updateAudio() {
    // The feedback window freezes a local match: the music stops with it and returns when it closes.
    // A finished fight fades out; the story map and the menus keep their own tracks.
    const musicCue = fightMusicCue({
        feedbackHold, selectionOpen: selection.isOpen, storyOpen: story.isOpen,
        fightOver: started && presentation.phase === 'result' && !storyAnimation.active,
        trenches: stageZone(currentStage) === 'trenches',
    });
    audio.fightBed(musicCue.bed);
    audio.music(musicCue.track);
    if (!started || selection.isOpen) { sounds.reset(); soundPhase = null; return; }
    if (presentation.phase === 'fight' && soundPhase !== null && soundPhase !== 'fight') audio.play('roundStart');
    soundPhase = presentation.phase;
    // Against the CPU the player is seat 0; online it is the local seat; in local versus the winner hears the win.
    const listener = online?.start ? online.start.seat : mode === 'versus' ? state.winner ?? 0 : 0;
    for (const cue of sounds.collect(state, listener)) audio.play(cue.name, cue);
}
for (const key of ['master', 'sfx', 'music'] as const) {
    const slider = document.getElementById(`volume-${key}`) as HTMLInputElement | null;
    if (!slider) continue;
    slider.value = String(Math.round(audio.volume()[key] * 100));
    let lastSliderSound = 0;
    slider.oninput = () => {
        audio.setVolume({ [key]: Number(slider.value) / 100 });
        // The music slider is the music. Other sliders click, but not on every pointer sample.
        if (key === 'music') return;
        const now = performance.now();
        if (now - lastSliderSound < 120) return;
        lastSliderSound = now;
        menuSound('menuMove');
    };
}
let hub: HubLink | null = null;
/** The current online duel, from queue to result; null in every local mode. */
let online: OnlineMatch | null = null;
/** Keeps an online match ticking while the tab is hidden (browsers pause requestAnimationFrame). */
let hiddenClock: Worker | null = null;
const canPlayFighter=(id:FighterId)=>isFighterAvailable(id,storyProgress.isUnlocked(id),hubRelics);
const lockedFighter=(id:FighterId)=>fighterLockReason(id,storyProgress.isUnlocked(id),hubRelics);
/** Browsing the roster loads only each pick's standing pose. The full bodies start
 * loading once a pick has settled for a moment, so they are usually ready by Start;
 * picks the player has already moved past are never loaded. */
const PICK_SETTLE_MS=300;
let pickPrefetch:ReturnType<typeof setTimeout>|undefined,pickGeneration=0;
async function prepareSelectionArt(ids:FighterId[]):Promise<void>{
    const generation=++pickGeneration;
    clearTimeout(pickPrefetch);
    await ensurePosePreviews(ids);
    // An earlier pick's preview can finish after a later pick started: only the latest arms the prefetch.
    if(generation!==pickGeneration)return;
    pickPrefetch=setTimeout(()=>{void ensurePoseAtlases(ids).catch(error=>console.warn('Fighter art prefetch failed; Start will retry.',error));},PICK_SETTLE_MS);
}
const partnerPicker=createPartnerPicker(canPlayFighter);
const selection = createSelectionMenu({
    start:setup=>{void chooseFightPartner(setup);},
    prepare:prepareSelectionArt,canPlay:canPlayFighter,locked:lockedFighter,
});
async function chooseFightPartner(setup:SelectionSetup){
    if(setup.mode==='online'||setup.mode==='online-wager'){await launchSelection(setup);return;}
    const partner=await partnerPicker.choose(setup.fighter,setup.partner);
    if(partner)await launchSelection({...setup,partner});
}
let toastTimer=0;
function hubToast(title:string,sub:string){
 const toast=$('hub-toast');toast.replaceChildren();
 const heading=document.createElement('b');heading.textContent=title;
 toast.append(heading,document.createTextNode(sub));toast.hidden=false;
 clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>{toast.hidden=true;},6000);
}
$('return-hub').onclick=$('overlay-hub').onclick=()=>{if(hub)hub.exitHub();};
if(hubConfigured())$('return-hub').hidden=false;
const hubLink=connectHub();
void hubLink.then(link=>{
 hub=link;
 if(link.connected){
  hubRelics=link.relics;writeRelicCache(storage,hubRelics);selection.refreshLocks();
  $('return-hub').hidden=false;$('hub-label').textContent='● HUB LINKED / BAR ARCADE';$('hub-label').classList.add('linked');
 }else if(link.error){$('hub-label').textContent='● HUB OFFLINE / 1V1';console.warn('Hub connection unavailable:',link.error);}
});
// ---- In-game feedback: N twice, or the pause menu's button (src/feedback.ts) ----
/** True while the feedback window has frozen a local match. No pause overlay is shown for it. */
let feedbackHold = false;
/**
 * Freeze for the feedback window. A running local match stops through the loop's own `running`
 * flag, without the pause overlay; a match that is already paused, finished or behind a menu is
 * left exactly as it is. Online matches cannot pause: `false` tells the window so.
 */
function pauseForFeedback(): false | { resume: boolean } {
    // Keys held as the window opens never reach keyup here (the window takes the keyboard).
    held.clear(); blockedKeys.clear(); queued = 0; queued2 = 0;
    if (online) return false;
    const resume = running;
    feedbackHold = true;
    if (running) { running = false; versus.suspend(true); countdown.suspend(true); }
    return { resume };
}
function resumeFromFeedback(token: unknown) {
    feedbackHold = false;
    held.clear(); blockedKeys.clear(); queued = 0; queued2 = 0; padNeedsRelease = true;
    previousPad = []; previousPad2 = []; previousStart = true;
    if (!(token as { resume?: boolean } | null)?.resume) return;
    // Only a match this window stopped is restarted, and only if nothing else took over meanwhile.
    if (running || !started || online || selection.isOpen || !$('overlay').hidden || crashGuard.paused) return;
    running = true; accumulator = 0;
    versus.suspend(false); countdown.suspend(false);
    if (document.activeElement === document.body || document.activeElement === null) canvas.focus();
    // The tab lost focus while the window was up: hand over to the normal pause instead of fighting unseen.
    if (document.hidden || !document.hasFocus()) pause();
}
function feedbackFighter(index: number): FeedbackFighter {
    const f = state.fighters[index];
    return { character: f.id, partner: f.partner, x: f.x, y: f.y, health: Math.round(f.hp), meter: f.pips, combo: f.combo, bestCombo: f.best, move: f.move?.id ?? null };
}
function feedbackSnapshot(): FeedbackSnapshot {
    const seat = online?.start?.seat ?? 0, journey = story.snapshot(), net = online?.phase === 'playing' ? online.status() : null;
    const paused = !running && started && !online && !(presentation.phase === 'result' && !storyAnimation.active);
    return {
        screen: selection.isOpen ? 'menu' : 'fight', mode,
        story: story.isActive && journey.encounter ? { stage: journey.encounter.stage, encounter: journey.encounter.index + 1, bout: journey.wave + 1 } : null,
        online: online ? { seat, wager: !!online.start?.wager, phase: online.phase, ...(net ? { link: net.link, pingMs: net.pingMs === null ? null : Math.round(net.pingMs), rollback: net.rollback } : {}) } : null,
        stage: selection.isOpen ? selection.getSetup().stage : currentStage,
        stageName: $('stage-title').textContent ?? '',
        frame: state.frame,
        player: feedbackFighter(seat), opponent: feedbackFighter(1 - seat),
        round: state.matchDepth?.round ?? null, wins: state.matchDepth ? [...state.matchDepth.wins] : null,
        winner: state.winner, phase: storyAnimation.active ? `scene:${storyAnimation.active}` : presentation.phase,
        // Taken before the window freezes anything, so this is the state the player was looking at.
        running, paused,
        cpuSkill: mode === 'cpu' && !online ? matchCpuSkill : null, assisted: matchDifficultyAssist,
        godMode: !!state.godMode, boss: storyBoss?.form ?? null, modifier: state.matchDepth?.modifier ?? null,
    };
}
const feedback = setupFeedback({
    sdk: hubLink.then(link => (link.connected ? link.sdk : null)),
    canvas,
    pause: pauseForFeedback,
    resume: resumeFromFeedback,
    snapshot: feedbackSnapshot,
    // The Controls remapper is waiting for a key: let it see N and refuse it.
    enabled: () => !(dialog.open && remapping?.device === 'key'),
});
$('overlay-feedback').onclick = () => feedback.open();
/**
 * Breadcrumbs for feedback notes, read off the page's own state once per rendered frame, so the
 * match flow and the simulation carry no feedback calls. The SDK keeps the last 24.
 */
const crumbs = { menu: true, match: '', frame: 0, round: 0, winner: null as number | null, phase: '', boss: '', paused: false };
function trackFeedbackEvents() {
    const inMatch = started && !selection.isOpen;
    if (selection.isOpen !== crumbs.menu) { crumbs.menu = selection.isOpen; if (crumbs.menu) { crumbs.match = ''; feedback.breadcrumb('fighter_select', { fighter: selection.getSetup().fighter }); } }
    if (!inMatch) return;
    const seat = online?.start?.seat ?? 0, kind = online ? (online.start?.wager ? 'online-wager' : 'online') : story.isActive ? 'story' : mode === 'cpu' ? 'arcade' : mode;
    const match = [kind, currentStage, state.fighters[0].id, state.fighters[1].id, seat].join('|'), round = state.matchDepth?.round ?? 1;
    if (match !== crumbs.match) {
        Object.assign(crumbs, { match, frame: state.frame, round, winner: null, phase: '', boss: '', paused: false });
        feedback.breadcrumb('match_start', { mode: kind, stage: currentStage, fighter: state.fighters[seat].id, opponent: state.fighters[1 - seat].id, ...(online ? { seat } : kind === 'arcade' || kind === 'story' ? { cpuSkill: matchCpuSkill } : {}) });
    } else if (state.frame < crumbs.frame || round !== crumbs.round) {
        // A restart or rematch begins a new state at frame 0; a match-depth round keeps counting.
        Object.assign(crumbs, { round, winner: null, phase: '', boss: '' });
        feedback.breadcrumb('round_start', { round, ...(state.matchDepth ? { wins: state.matchDepth.wins.join('-') } : {}) });
    }
    crumbs.frame = state.frame;
    const boss = storyBoss?.form ?? '';
    if (boss !== crumbs.boss) { crumbs.boss = boss; if (boss) feedback.breadcrumb('boss_start', { form: boss, frame: state.frame }); }
    if (state.winner !== crumbs.winner) { crumbs.winner = state.winner; if (state.winner !== null) feedback.breadcrumb('ko', { winner: state.winner, frame: state.frame, health: state.fighters.map(f => Math.round(f.hp)).join('-') }); }
    if (presentation.phase !== crumbs.phase) { crumbs.phase = presentation.phase; if (presentation.phase === 'result') feedback.breadcrumb('round_end', { winner: state.winner, frame: state.frame }); }
    const paused = !running && !feedbackHold && !online && presentation.phase !== 'result';
    if (paused !== crumbs.paused) { crumbs.paused = paused; feedback.breadcrumb(paused ? 'pause' : 'resume', { frame: state.frame }); }
}
/** Called exactly once at result; story saves are already settled at KO. */
function reportRound(){
 if(!hub?.connected||state.winner===null)return;
 const current=story.snapshot(),encounter=current.encounter;
 const beltVictory=encounter?.opponent===BELT_OPPONENT&&current.wave===0;
 // The rival actually beaten this round; a gauntlet reports each of its fighters in turn.
 const rival=encounter?state.fighters?.[1]?.id:undefined;
 void hub.onRoundEnd({winner:state.winner,mode,storyWorld:beltVictory?BELT_WORLD:null,
  storyRival:rival&&encounter!.opponents.includes(rival)?rival:null,chapter:encounter?.chapter,skill:matchCpuSkill,firstClear:matchFirstClear,
  stage:current.active??selection.getSetup().stage,fighter:chosen,assisted:matchGodMode||godModeChanges.some(change=>change.enabled)},hubToast);
}
let currentStage:StageId=STAGES[0].id;
function updateStage(stage:StageId) {
    currentStage=stage;
    setStage(stage);setActiveStoryLocation(null);
    const location=STAGES.find(s=>s.id===stage)!;
    $('stage-title').textContent=location.name.toUpperCase();
    $('stage-subtitle').textContent=stage==='ranch'?' / BONUS STAGE':' / '+location.theme.toUpperCase();
}
async function launchSelection(setup:SelectionSetup,isStory=false,difficulty?:{skill:number;assisted:boolean}) {
    // Best of 3 is the menu's Rules choice; `?matchDepth` still forces it for every CPU and local versus round.
    let requestedMatchDepthOptions = (depthEnabled || setup.rules === 'bo3') && !isStory && (setup.mode === 'cpu' || setup.mode === 'versus') ? { rounds: true, modifier: depthModifier } : null;
    if(!isStory&&(setup.mode==='online'||setup.mode==='online-wager')){void queueOnline(setup);return true;}
    // Reconcile wins from another tab or a restored page before the final P1 gate.
    storyProgress.sync();
    if(!canPlayFighter(setup.fighter)){
        $('selection-announcement').textContent=`${ROSTER[setup.fighter]?.name??'This fighter'} is not recruited for P1 yet. ${lockedFighter(setup.fighter)} Or choose an unlocked P1 fighter.`;
        return false;
    }
    await loadStageArt([setup.stage]);
    if(getStageArtStatus().errors[setup.stage]){
        $('selection-loading').textContent='Selected stage art could not load. Choose another stage or press Start Fight to retry.';
        return false;
    }
    const encounter=isStory?STORY_ENCOUNTERS.find(e=>e.opponents.includes(setup.opponent)):undefined;
    // Standard chapter-end encounters carry their chapter's rule (double meter, low gravity, specials only,
    // sudden death, reflected projectiles) and a 60-second clock. Transformed boss forms
    // use a separate combat controller and keep their existing campaign rules.
    if(encounter && STORY_ENCOUNTERS.filter(e=>e.chapter===encounter.chapter && !storyAnimationPlan(e.opponents.at(-1)!,true).form).at(-1)?.index===encounter.index && setup.opponent===encounter.opponents.at(-1))
        requestedMatchDepthOptions = { rounds: false, modifier: chapterBossModifier(encounter.chapter-1) };
    const requiredFighters=[setup.fighter,...(encounter?.opponents??[setup.opponent])];
    const selectedPartner=setup.partner;
    if(selectedPartner&&selectedPartner!==ROSTER[setup.fighter].partner&&PLAYABLE_FIGHTERS.includes(selectedPartner as FighterId))requiredFighters.push(selectedPartner as FighterId);
    // Usually already prefetched; otherwise the rest of the bodies load now.
    $('selection-loading').textContent='Loading selected fighters…';
    try{await Promise.all([ensurePoseAtlases(requiredFighters,{pin:true}),ensurePowerArt()]);}catch(error){selection.setReady(false,'Selected fighter art could not load. Choose again to retry.');console.error(error);return false;}
    let scenery=encounter?storyLocationForEncounter(encounter,STORY_ENCOUNTERS,encounter.opponents.indexOf(setup.opponent)):null;
    if(scenery){try{await loadStoryLocation(scenery);}catch(error){console.warn('Story scenery unavailable; using the original arena.',error);scenery=null;}}
    try{
        const plan=storyAnimationPlan(setup.opponent,isStory);
        const bossArt=plan.form?await loadStoryBossArt(plan.form):null;
        await storyAnimation.load(plan);
        storyBossArt=bossArt;
    }
    catch(error){$('selection-loading').textContent='Story animation could not load. Retry this encounter to load it again.';console.error(error);return false;}
    matchDepthOptions = requestedMatchDepthOptions;
    matchEarnedGodMode=storyProgress.snapshot().godModeUnlocked&&!!setup.godMode;
    const trainingRound=!isStory&&setup.mode==='training';
    const tutorialRound=!isStory&&setup.mode==='tutorial';
    trainingRecorder.stop();training=tutorialRound?tutorialCoach:trainingFlag||trainingRound?trainingRecorder:null;
    if(tutorialRound)tutorialCoach.begin();
    chosen=setup.fighter;opponent=setup.opponent;mode=isStory?'cpu':trainingRound||tutorialRound?'dummy':setup.mode as Mode;
    matchCpuSkill=difficulty?.skill??setup.cpuSkill??4;matchDifficultyAssist=!!difficulty?.assisted;
    matchFirstClear=!!encounter&&!storyProgress.isCleared(encounter.index);
    if(!isStory){story.leaveStory();freePlayMode=null;}
    updateStage(setup.stage);setActiveStoryLocation(scenery);
    if(scenery)$('stage-subtitle').textContent=' / '+scenery.title.toUpperCase();
    selection.setSetup({...setup,mode:trainingRound?'training':tutorialRound?'tutorial':mode});selection.hide();$('fight-view').hidden=false;
    started=false;restart();
    delete state.fighters[0].partner;
    if(selectedPartner&&selectedPartner!==ROSTER[chosen].partner)state.fighters[0].partner=selectedPartner;
    start();
    $('mode-label').textContent=isStory?'STORY / WORLD '+STAGES.find(s=>s.id===setup.stage)!.chapter:mode==='cpu'?'CPU SPARRING':mode==='versus'?'LOCAL VERSUS':mode==='guard'?'GUARD PRACTICE':trainingRound?'TRAINING':tutorialRound?'TUTORIAL':'COMBO PRACTICE';
    if(encounter&&encounter.opponents.length>1){
        const bout=encounter.opponents.indexOf(setup.opponent)+1;
        const gauntletName=encounter.gauntlet==='art'?'ART DUO':encounter.gauntlet==='nick-juicy'?'NICK → JUICY':'FINAL GAUNTLET';
        $('mode-label').textContent+=` / ${gauntletName} / BOUT ${bout} OF ${encounter.opponents.length}${bout>1?' / HEALTH REFILLED':''}`;
    }
    if(mode==='cpu')$('mode-label').textContent+=` / CPU SKILL ${matchCpuSkill.toFixed(1)}${matchDifficultyAssist?' / EASIER RETRY':''}`;
    updateGodModeLabel();
    return true;
}
function returnToSelection() {
    if(online){if(online.phase==='playing'&&!window.confirm('Leave this online match? Leaving forfeits it.'))return;void online.leave();online=null;stopHiddenClock();}
    storyAnimation.clear();storyBoss=null;storyBossArt=null;bossStarts.length=0;
    versus.hide();
    countdown.hide();
    story.leaveStory();
    running=false;started=false;held.clear();queued=0;queued2=0;accumulator=0;qaSingleStep=false;
    resumeAfterSettings=false;resumeAfterJourney=false;
    $('fight-view').hidden=true;$('overlay').hidden=true;
    selection.show();
}
$('back-select').onclick=returnToSelection;$('overlay-select').onclick=returnToSelection;
const KEY_SYMBOLS: Record<string, string> = { ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', BracketLeft: '[', BracketRight: ']', Comma: ',', Period: '.', Slash: '/', Backslash: '\\', Semicolon: ';', Quote: "'", Backquote: '`', Minus: '-', Equal: '=', ShiftLeft: 'L-Shift', ShiftRight: 'R-Shift', ControlLeft: 'L-Ctrl', ControlRight: 'R-Ctrl', AltLeft: 'L-Alt', AltRight: 'R-Alt', Space: 'Space', Enter: 'Enter' };
function keyName(code: string) { return KEY_SYMBOLS[code] ?? code.replace('Key', '').replace('Digit', '').replace('Numpad', 'Num '); }
function save() {
    try {
        localStorage.setItem(CONTROLS_KEY, JSON.stringify({ controlsVersion: 4, keys, padKeys, keys2, padKeys2 }));
        localStorage.removeItem(LEGACY_CONTROLS_KEY);
    }
    catch { /* Nonpersistent mode. */ }
}
/** Player 1's control for `action` in the current prompt device (keyboard key or controller button). */
function controlPrompt(action: Action): string {
    if (lastDevice === 'key') return keyName(keys[action]);
    if (action === 'left' || action === 'right') return 'Stick / D-pad ' + (action === 'left' ? '←' : '→');
    if (action === 'up' || action === 'down') return action === 'up' ? '↑' : '↓';
    return padButtonName(padKeys[action]);
}
/** The fight screen's prompts, which follow the device the player last used. */
function updatePrompts() {
    const p = controlPrompt;
    $('directional-help').textContent = `${p('up')} + ${p('light')}: Rising strike · ${p('up')} + forward + ${p('medium')}: Diagonal · ${p('down')} + ${p('medium')}/${p('heavy')}: Low / dive · ${p('bolt')}: Horizontal spit (${p('down')}: crouch low / ${p('up')}: jump high) / aim other powers · ${p('dash')} after hit: Dash cancel`;

    $('controls-strip').innerHTML = `<span class="control"><kbd>${lastDevice === 'pad' ? 'Stick / D-pad' : keyName(keys.left) + ' ' + keyName(keys.right)}</kbd> Move / block</span>` + (['up', 'down', 'light', 'medium', 'heavy', 'launcher', 'bolt', 'grab', 'special', 'dash'] as Action[]).map(a => `<span class="control"><kbd>${lastDevice === 'pad' && (a === 'up' || a === 'down') ? 'Stick ' + p(a) : p(a)}</kbd>${labels[a]}</span>`).join('') + (lastDevice === 'pad' ? '<span class="control"><kbd>Start</kbd>Pause</span>' : '');
    $('controls-strip').setAttribute('aria-label', lastDevice === 'pad' ? 'Current controller bindings' : 'Current keyboard bindings');
    $('pause').innerHTML = `Pause <kbd>${lastDevice === 'pad' ? 'Start' : 'Esc'}</kbd>`;
}
function updateControls() {
    updatePrompts();
    document.querySelectorAll<HTMLElement>('[data-key]').forEach(el => el.textContent = keyName(keys[el.dataset.key as Action]));
    const playerKeys = controlsPlayer === 1 ? keys : keys2, playerPad = controlsPlayer === 1 ? padKeys : padKeys2;
    for (const p of [1, 2] as const) { const tab = $(`controls-p${p}`); tab.setAttribute('aria-selected', String(controlsPlayer === p)); tab.tabIndex = controlsPlayer === p ? 0 : -1; }
    $('controls-panel').dataset.player = String(controlsPlayer);
    $('controls-player-note').textContent = controlsPlayer === 1 ? 'Player 1 plays every mode and drives the menus with the first controller.' : 'Player 2 plays in Local versus with these keys or the second controller connected.';
    $('defaults').textContent = `Restore player ${controlsPlayer} defaults`;
    const pending = (a: string, device: 'key' | 'pad') => remapping?.player === controlsPlayer && remapping.action === a && remapping.device === device;
    // Rebuilding the rows must not drop keyboard or controller focus from the binding being changed.
    const focused = document.activeElement instanceof HTMLElement && document.activeElement.dataset.map ? document.activeElement : null;
    $('bindings').innerHTML = Object.entries(labels).map(([a, label]) => `<div class="binding-row ${remapping?.player === controlsPlayer && remapping.action === a ? 'pending' : ''}"><span>${label}</span><button class="quiet" data-map="${a}" data-device="key">${pending(a, 'key') ? 'Press a key…' : playerKeys[a as Action] === UNBOUND ? '—' : keyName(playerKeys[a as Action])}</button>${a in padDefaults ? `<button class="quiet" data-map="${a}" data-device="pad">${pending(a, 'pad') ? 'Press a button…' : padButtonName(playerPad[a as Action])}</button>` : '<span class="micro">D-pad / left stick</span>'}</div>`).join('');
    document.querySelectorAll<HTMLButtonElement>('[data-map]').forEach(b => b.onclick = () => { remapping = { action: b.dataset.map as Action, device: b.dataset.device as 'key' | 'pad', player: controlsPlayer }; $('binding-status').textContent = b.dataset.device === 'pad' ? 'Start cancels. A button another action uses is swapped.' : 'Escape cancels. A key another action or player uses is swapped.'; updateControls(); });
    if (focused) document.querySelector<HTMLButtonElement>(`[data-map="${focused.dataset.map}"][data-device="${focused.dataset.device}"]`)?.focus();
}
function bind(value: string | number) {
    if (!remapping)
        return;
    const { action, device, player } = remapping;
    if (device === 'key')
        rebindKey([keys, keys2], player - 1, action, String(value));
    else
        rebindPad(player === 1 ? padKeys : padKeys2, action, Number(value));
    remapping = null;
    held.clear();
    queued = 0;queued2=0;
    save();
    updateControls();
    $('binding-status').textContent = 'Saved on this browser.';
}
function showOverlay(title: string, copy: string, button: string, kicker = 'COMBAT LAB / PAUSED', moveList = false) {
    // Buttons held as the overlay opens (attacks mashed through a KO, the Start that paused) act only after release.
    padInput.holdCurrent(Array.from(navigator.getGamepads?.() || []));
    // The pause and result screens offer the hub wherever the header does; online screens leave through fighter select.
    $('overlay-hub').hidden = $('return-hub').hidden || !!online;
    // Restart sits in the pause menu of a local round in progress (the footer's Restart, reachable by controller).
    $('overlay-restart').hidden = !started || !!online || (presentation.phase === 'result' && !storyAnimation.active);
    const moves = document.getElementById('overlay-moves'); if (moves) moves.hidden = true;
    if (moveList) showMoveList();
    // A special action (online queue, tutorial replay) belongs to the overlay that set it; callers set theirs after this.
    overlayAction = null;
    running = false; versus.suspend(true);countdown.suspend(true);held.clear(); queued = 0;queued2=0; $('overlay').hidden = false; $('overlay-title').textContent = title; $('overlay-copy').textContent = copy; $('start').textContent = button; $('overlay-kicker').textContent = kicker; $('overlay-hint').textContent = state.matchDepth ? (state.matchDepth.rounds ? 'First to two round wins · 60-second combat clock' : 'Chapter rule · 60-second combat clock') : 'Play your way · No round timer'; if(!selection.isOpen)$('start').focus(); }
/** The pause / result overlay's buttons that can be used right now, top to bottom. */
function overlayChoices(): HTMLButtonElement[] {
    const choices = ['start', 'overlay-restart', 'overlay-select', 'overlay-feedback', 'overlay-hub'].map(id => $<HTMLButtonElement>(id)).filter(b => b && !b.hidden && !b.disabled);
    // While an unsettled online match is up, Fighter select would forfeit through a browser confirm; the controller skips it.
    return online?.phase === 'playing' ? choices.filter(b => b.id !== 'overlay-select') : choices;
}
/** Menu-style focus movement between the overlay's buttons (keyboard arrows / W S, controller D-pad / stick). */
function moveOverlayFocus(direction: MenuDirection) {
    const choices = overlayChoices();
    if (!direction || !choices.length) return;
    const index = choices.indexOf(document.activeElement as HTMLButtonElement), step = direction === 'up' || direction === 'left' ? -1 : 1;
    choices[index < 0 ? 0 : (index + step + choices.length) % choices.length].focus();
}
function start() {
    if (selection.isOpen || story.isOpen || dialog.open || ($('start') as HTMLButtonElement).disabled) return;
    if (presentation.phase === 'result'&&!storyAnimation.active)
        restart();
    started = true;
    running = true;
    versus.suspend(false);countdown.suspend(false);
    padNeedsRelease = true;
    accumulator = 0;
    held.clear();
    queued = 0;queued2=0;
    $('overlay').hidden = true;
    canvas.focus();
}
function pause() {
    if (!started || (presentation.phase === 'result'&&!storyAnimation.active) || online)
        return;
    if (running)
        showOverlay('Take a breath.', 'Your round is paused. Resume when you’re ready.', 'Resume', 'COMBAT LAB / PAUSED', true);
    else
        start();
}
/** The pause menu's move list: the player's fighter with the current bindings, then the shared techniques. */
function showMoveList() {
    const panel = document.getElementById('overlay-moves');
    if (!panel || storyBoss) return;
    const fighter = state.fighters[0].id;
    const table = (heading: string, rows: MoveRow[]) => {
        const section = document.createElement('section'), title = document.createElement('h3'), list = document.createElement('dl');
        title.textContent = heading;
        for (const row of rows) {
            const name = document.createElement('dt'), detail = document.createElement('dd'), keys = document.createElement('kbd');
            name.textContent = row.name; keys.textContent = row.input;
            detail.append(keys, document.createTextNode(' ' + row.detail));
            list.append(name, detail);
        }
        section.append(title, list);
        return section;
    };
    panel.replaceChildren(table(`${ROSTER[fighter].name} · MOVES`.toUpperCase(), fighterMoves(fighter, controlPrompt)), table('EVERY FIGHTER', sharedTechniques(controlPrompt)));
    panel.hidden = false;
}
function restart() {
    storyAnimation.reset();storyBoss=null;bossStarts.length=0;godModeChanges.length=0;
    matchTesting=testingGodMode&&mode!=='versus';// The tutorial keeps the player alive with a full meter: a practice God Mode, recorded like any other for replays.
    matchGodMode=(testingGodMode||matchEarnedGodMode||!!(training&&'invulnerable' in training))&&mode!=='versus';
    const partner=state.fighters[0].id===chosen?state.fighters[0].partner:undefined;
    state = createState(chosen, mode, opponent);
    depthRoundStarts.length = 0;
    if (matchDepthOptions) enableMatchDepth(state, matchDepthOptions);
    if(partner)state.fighters[0].partner=partner;
    if(matchGodMode){state.godMode=true;state.fighters[0].pips=3;}
    presentation = createRoundPresentation();
    koSlow = 0; koSeen = false;
    countdown.hide();
    versus.show(chosen,state.fighters[1].id);
    frames.length = 0;
    qaEvents.length = 0;
    accumulator = 0;
    held.clear();
    queued = 0;queued2=0;
    updateGodModeLabel();
    if (started)
        start();
}
function updateGodModeLabel(){
    const label=$('mode-label'),lesson=!!(training&&'invulnerable' in training);label.textContent=(label.textContent??'').replace(/ \/ GOD MODE(?: TEST)?$/,'')+(state.godMode&&!lesson?(matchTesting?' / GOD MODE TEST':' / GOD MODE'):'');
}
function applyGodMode(target:CombatState,enabled:boolean){
    if(enabled)target.godMode=true;
    else delete target.godMode;
}
function setTestingGodMode(enabled:boolean){
    testingGodMode=enabled;
    if(!started||selection.isOpen||online||mode==='versus'||state.winner!==null)return;
    applyGodMode(state,enabled);
    godModeChanges.push({frame:state.frame,enabled});
    matchTesting=enabled;updateGodModeLabel();
}
let resumeAfterJourney = false, freePlayMode: MenuMode | null = null;
const story = createStoryMode({
    beforeStory:async()=>{
        held.clear();queued=0;queued2=0;padNeedsRelease=true;
        const setup=selection.getSetup();
        const partner=await partnerPicker.choose(setup.fighter,setup.partner);
        if(!partner)return false;
        selection.setSetup({partner});
        return true;
    },
    map:mountCampaignMap,
    selectedFighter:()=>selection.getSetup().fighter,
    canPlayFighter,
    testing:()=>matchTesting,
    godMode:()=>testingGodMode||(storyProgress.snapshot().godModeUnlocked&&!!selection.getSetup().godMode),
    ready: () => !($('start') as HTMLButtonElement).disabled,
    pause: () => { resumeAfterJourney = running; showOverlay('Choose your next destination.', 'Your current round is paused while you browse worlds and levels.', 'Resume'); },
    resume: () => { if (resumeAfterJourney && started && (presentation.phase !== 'result'||storyAnimation.active)) start(); },
    launch: (stage, isStory, storyOpponent, difficulty) => {
        if(isStory)freePlayMode??=selection.getSetup().mode;
        const setup=selection.getSetup();
        if(storyOpponent)setup.opponent=storyOpponent;
        setup.stage=stage;setup.mode=isStory?'cpu':freePlayMode??setup.mode;
        if(!isStory)freePlayMode=null;
        return launchSelection(setup,isStory,difficulty);
    },
});
$('start').onclick = () => overlayAction ? overlayAction() : start();
$('pause').onclick = pause;
$('reset').onclick = ()=>{storyAnimation.cancel();if(training===tutorialCoach&&tutorialCoach.complete)tutorialCoach.begin();if(!story.retryMatch())restart();};
$('overlay-restart').onclick = () => $('reset').click();
const dialog = $<HTMLDialogElement>('controls-dialog');
$('testing-god-mode').onchange=()=>setTestingGodMode($<HTMLInputElement>('testing-god-mode').checked);
$('settings').onclick = () => {
    const godMode=$<HTMLInputElement>('testing-god-mode');
    godMode.checked=started&&!selection.isOpen?!!state.godMode:testingGodMode;
    godMode.disabled=!!online||(started&&!selection.isOpen&&mode==='versus');
    resumeAfterSettings = running;
    if (running)
        pause();
    held.clear();
    queued = 0;queued2=0;
    dialog.showModal();
};
function closeSettings(fromCancel = false) {
    // The close button already clicks. Escape and the controller's Back arrive as cancel.
    if (fromCancel) menuSound('menuBack');
    remapping = null;
    dialog.close();
    updateControls();
    if (resumeAfterSettings)
        start();
}
$('close-settings').onclick = () => closeSettings();
dialog.addEventListener('cancel', e => {
    e.preventDefault();
    if (remapping) {
        remapping = null;
        updateControls();
    }
    else
        closeSettings(true);
});
$('defaults').onclick = () => {
    if (controlsPlayer === 1) { keys = { ...defaults }; padKeys = { ...padDefaults }; }
    else { keys2 = { ...P2_KEYS }; padKeys2 = { ...padDefaults }; }
    resolveKeyConflicts(keys, keys2); remapping = null; save(); updateControls();
};
for (const p of [1, 2] as const) $(`controls-p${p}`).onclick = () => { controlsPlayer = p; remapping = null; updateControls(); };
$('controls-tabs').onkeydown = e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); controlsPlayer = controlsPlayer === 1 ? 2 : 1; remapping = null; updateControls(); $(`controls-p${controlsPlayer}`).focus(); } };
window.addEventListener('keydown', e => {
    if (story.isOpen||(typeof document!=='undefined'&&document.querySelector?.('#partner-picker:not([hidden])'))) return;
    if (dialog.open) {
        if (remapping?.device === 'key') {
            e.preventDefault();
            if (e.code === 'Escape') {
                remapping = null;
                updateControls();
            }
            else if (e.code === FEEDBACK_KEY)
                $('binding-status').textContent = 'N is reserved: press it twice to send feedback. Choose another key.';
            else if (!['Tab', 'Enter'].includes(e.code))
                bind(e.code);
        }
        return;
    }
    if (selection.isOpen) return;
    if (e.code === 'Escape') {
        e.preventDefault();
        if (!e.repeat) {
            menuSound('menuBack');
            pause();
        }
        return;
    }
    if (!running) {
        // Paused and result screens: arrows or W/S move between the buttons; Enter or Space presses one.
        const direction = menuKeyDirection(e.code);
        if (direction && !$('overlay').hidden && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); moveOverlayFocus(direction); }
        return;
    }
    if(blockedKeys.has(e.code)){e.preventDefault();return;}
    if(versus.isOpen){
        e.preventDefault();if(e.code==='Enter'&&!e.repeat){blockedKeys.add(e.code);versus.skip();}return;
    }
    if(storyBoss){
        if(e.code==='KeyR'&&!e.repeat){e.preventDefault();$('reset').click();return;}
        const action=bossKeyInput(e.code,keys);
        if(action){
            e.preventDefault();
            if(!held.has(e.code))queued|=action;
            held.add(e.code);
        }
        return;
    }
    if (Object.values(keys).includes(e.code)) {
        e.preventDefault();
        if (!held.has(e.code)) {
            for (const a of Object.keys(A) as Action[])
                if (keys[a] === e.code)
                    queued |= A[a];
        }
        held.add(e.code);
    }
    else if (mode === 'versus' && e.code !== UNBOUND && Object.values(keys2).includes(e.code)) {
        e.preventDefault();
        if (!held.has(e.code)) queued2 |= pressedMask(e.code, keys2);
        held.add(e.code);
    }
});
window.addEventListener('keyup', e => {held.delete(e.code);blockedKeys.delete(e.code);});
window.addEventListener('blur', () => {
    blockedKeys.clear();
    held.clear();
    queued = 0;queued2=0;
    if (running)
        pause();
});
document.addEventListener('visibilitychange', () => {
    if (document.hidden && running)
        pause();
    if (online) document.hidden ? startHiddenClock() : stopHiddenClock();
});
canvas.addEventListener('pointerdown', () => canvas.focus());
function pollPad(): number {
    const pads = Array.from(navigator.getGamepads?.() || []);
    // Outside a match a lone player 2 pad moves up to player 1; inside one, assignments stay put.
    const frame = padInput.poll(pads, !started || selection.isOpen);
    padP2 = frame.p2;
    if (frame.active) noteDevice('pad');
    // A controller unplugged mid-round pauses it (player 2's only matters in local versus).
    if (running && started && (frame.lost.includes(1) || (mode === 'versus' && frame.lost.includes(2)))) pause();
    const pad = frame.p1, second = frame.p2;
    const wasSelection=selection.isOpen,wasModal=story.isOpen||dialog.open,wasOverlay=!running&&!selection.isOpen;
    const wasPartnerOpen=!!document.querySelector?.('#partner-picker:not([hidden])');
    selection.pollPad(pad);
    if (!pad) {
        if (!online) $('device').textContent = 'KEYBOARD READY';
        previousPad = [];
        return 0;
    }
    if (!online) $('device').textContent = frame.count > 1 ? '2 CONTROLLERS CONNECTED' : 'CONTROLLER CONNECTED';
    const buttons = pad.buttons.map(b => b.pressed ? 1 : 0);
    // `typeof` so the versus harness can run this function without the audio module.
    if ((buttons.some(Boolean) || menuDirection(buttons, pad.axes)) && typeof audio !== 'undefined') audio.unlock();
    if(document.querySelector?.('#partner-picker:not([hidden])')){
        if(wasPartnerOpen)partnerPicker.pollPad(pad,buttons,previousPad);
        previousPad=buttons;
        previousStart=!!buttons[PAD.start];
        padNeedsRelease=true;
        return 0;
    }
    let boundPadThisFrame=false;
    // Remapping listens to the remapped player's own controller: player 2's is
    // the second one connected (falling back to the first if there is only one).
    // Start cancels a controller remap.
    const secondButtons = second ? second.buttons.map(b => b.pressed ? 1 : 0) : [];
    if (remapping?.device === 'pad') {
        const fromSecond = remapping.player === 2 && !!second;
        const source = fromSecond ? secondButtons : buttons, before = fromSecond ? previousPad2 : previousPad;
        const index = source.findIndex((b, i) => b && !before[i]);
        if (index === PAD.start) { remapping = null; updateControls(); boundPadThisFrame = true; }
        else if (index >= 0 && canBindPadButton(index)) { bind(index); boundPadThisFrame = true; }
    }
    else if (remapping?.device === 'key' && ((buttons[PAD.b] && !previousPad[PAD.b]) || (buttons[PAD.start] && !previousPad[PAD.start]))) {
        // A key remap started from the controller can be cancelled from it too.
        remapping = null; updateControls(); boundPadThisFrame = true;
    }
    // Either player's Start pauses local versus.
    const secondStart = mode === 'versus' && !!secondButtons[PAD.start] && !previousPad2[PAD.start];
    previousPad2 = secondButtons;
    if(wasModal&&(story.isOpen||dialog.open)&&!remapping&&!boundPadThisFrame){
        const activeDialog=document.querySelector<HTMLDialogElement>('dialog[open]')!;
        const direction=menuDirection(buttons,pad.axes);
        if(menuRepeat.next(direction,performance.now()))navigateDialog(activeDialog,direction);
        if(buttons[PAD.b]&&!previousPad[PAD.b])activeDialog.dispatchEvent(new Event('cancel',{cancelable:true}));
        else if(buttons[PAD.a]&&!previousPad[PAD.a]&&document.activeElement instanceof HTMLElement){
            if(document.activeElement.matches('button,input[type=checkbox]'))document.activeElement.click();
        }
    }else if(!wasOverlay)menuRepeat.reset();
    if(wasOverlay&&!wasModal&&!dialog.open&&!story.isOpen&&!document.querySelector?.('#partner-picker:not([hidden])')){
        const direction=menuDirection(buttons,pad.axes);
        if(menuRepeat.next(direction,performance.now()))moveOverlayFocus(direction);
        // B backs out: from a pause it resumes; from a result or online screen it returns to fighter select.
        // Leaving an online match the hub has not settled asks a browser confirm a controller cannot answer, so B waits.
        const paused=started&&!online&&!(presentation.phase==='result'&&!storyAnimation.active);
        if(buttons[PAD.b]&&!previousPad[PAD.b]){if(paused)start();else if(online?.phase!=='playing')returnToSelection();}
        else if((buttons[PAD.start]&&!previousPad[PAD.start])||secondStart)start();
        else if(buttons[PAD.a]&&!previousPad[PAD.a]){const active=document.activeElement as HTMLButtonElement,choices=overlayChoices();if(choices.includes(active))active.click();else (choices[0]??$('start')).focus();}
    }
    if(wasSelection||wasModal||wasOverlay||selection.isOpen||story.isOpen||dialog.open){padNeedsRelease=true;previousStart=!!buttons[PAD.start];previousPad=buttons;return 0;}
    if(padNeedsRelease){previousStart=!!buttons[PAD.start];previousPad=buttons;if(!buttons.some(Boolean)&&pad.axes.every(axis=>Math.abs(axis)<.3))padNeedsRelease=false;return 0;}
    if(versus.isOpen){
        const skip=!!buttons[PAD.a]&&!previousPad[PAD.a];
        previousStart=!!buttons[PAD.start];previousPad=buttons;
        if(skip)versus.skip();
        return 0;
    }
    const menu = !!buttons[PAD.start];
    if (((menu && !previousStart) || secondStart) && !dialog.open && !story.isOpen) {
        if (!started || (presentation.phase === 'result'&&!storyAnimation.active))
            start();
        else
            pause();
    }
    previousStart = menu;
    previousPad = buttons;
    return padMask(pad, padKeys);
}
/**
 * Controller focus inside an open dialog. Up/down step through the tabbable
 * controls (so the campaign map's roving rivals count once); left/right cycle a
 * select, nudge a slider, or act as arrow keys for widgets that handle their
 * own (campaign rivals, player tabs), and otherwise step like up/down.
 */
function navigateDialog(dialog: HTMLDialogElement, direction: MenuDirection) {
    const active = document.activeElement instanceof HTMLElement && dialog.contains(document.activeElement) ? document.activeElement : null;
    const step = direction === 'up' || direction === 'left' ? -1 : 1;
    if (active && (direction === 'left' || direction === 'right')) {
        if (active instanceof HTMLSelectElement) {
            if (!active.options.length) return;
            active.selectedIndex = (active.selectedIndex + step + active.options.length) % active.options.length;
            active.dispatchEvent(new Event('change', { bubbles: true }));
            return;
        }
        if (active instanceof HTMLInputElement && active.type === 'range') {
            if (step > 0) active.stepUp(); else active.stepDown();
            active.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }
        const handled = !active.dispatchEvent(new KeyboardEvent('keydown', { key: step > 0 ? 'ArrowRight' : 'ArrowLeft', code: step > 0 ? 'ArrowRight' : 'ArrowLeft', bubbles: true, cancelable: true }));
        if (handled) return;
    }
    const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), select:not(:disabled), input:not(:disabled)'))
        .filter(el => el.offsetParent !== null && el.tabIndex >= 0);
    if (!controls.length) return;
    const index = active ? controls.indexOf(active) : -1;
    controls[index < 0 ? (step > 0 ? 0 : controls.length - 1) : (index + step + controls.length) % controls.length].focus();
}
/** Switch on-screen prompts between keyboard keys and controller buttons. */
function noteDevice(device: 'key' | 'pad') {
    if (device === lastDevice) return;
    lastDevice = device;
    updatePrompts();
}
window.addEventListener('keydown', () => noteDevice('key'));
// Optional, visible read-only diagnostics for manual QA; never changes combat state.
const qaPanel = new URLSearchParams(location.search).has('qa') ? document.createElement('pre') : null;
const trainingPanel = document.createElement('pre'), trainingControls = document.createElement('div');
let trainingPlayButton: HTMLButtonElement | null = null;
{
    const controls = trainingControls; controls.id = 'training-controls';
    for (const [label, action] of [['Record P1 route', () => trainingRecorder.record()], ['Stop', () => trainingRecorder.stop()], ['Loop on standing dummy', () => { if(mode==='dummy')trainingRecorder.play(); }]] as const) {
        const button = document.createElement('button'); button.textContent = label; button.onclick = action; if(label==='Loop on standing dummy')trainingPlayButton=button; controls.append(button);
    }
    trainingPanel.id = 'training-readout'; trainingPanel.style.cssText = 'white-space:pre-wrap;font:14px monospace;padding:12px';
    controls.hidden = trainingPanel.hidden = true;
    document.querySelector('#app')!.append(controls, trainingPanel);
}
/** Training tools show only in a practice round (standing or guard dummy) outside story and online. */
const trainingActive = () => training === trainingRecorder && !selection.isOpen && !online && !story.isActive && (mode === 'dummy' || mode === 'guard');

// `?perf`: read-only art-loading status for scripts/perf-baseline.mjs.
if (new URLSearchParams(location.search).has('perf')) (window as unknown as {sprotoAtlasStatus:typeof getPoseAtlasLoadStatus}).sprotoAtlasStatus = getPoseAtlasLoadStatus;
let qaFrozen=false,qaSingleStep=false;
let qaStopAtOutro=()=>{};
const qaEvents:string[]=[];
if(qaPanel){
    const bar=document.createElement('div');bar.style.cssText='display:flex;flex-wrap:wrap;gap:8px;padding:12px';
    const freeze=document.createElement('button'),single=document.createElement('button');
    freeze.textContent='Freeze QA frame';single.textContent='Advance QA frame';
    freeze.onclick=()=>{qaFrozen=!qaFrozen;freeze.textContent=qaFrozen?'Resume QA playback':'Freeze QA frame';accumulator=0;};
    single.onclick=()=>{qaFrozen=true;qaSingleStep=true;freeze.textContent='Resume QA playback';};
    const koLabel=document.createElement('label'),koStop=document.createElement('input');koStop.type='checkbox';
    koLabel.append(koStop,document.createTextNode(' Freeze on KO presentation'));
    qaStopAtOutro=()=>{if(koStop.checked){qaFrozen=true;accumulator=0;freeze.textContent='Resume QA playback';}};
    bar.append(freeze,single,koLabel);document.querySelector('#app')!.append(bar);
    qaPanel.id='qa-status';qaPanel.style.cssText='white-space:pre-wrap;color:#dceafa;background:#13202d;padding:16px;font:12px monospace';document.querySelector('#app')!.append(qaPanel);}
function qaRecord(before:string){
    if(!qaPanel)return;
    const f=state.fighters[0],after=[f.move?.id,f.combo,f.pips,f.hp,state.fighters[1].hp,state.throwState?.phase,state.fighters[1].reaction?.phase].join('|');
    if(before!==after){qaEvents.push(`f${state.frame}: ${f.move?.id??'neutral'} ${f.move?.aim??''} hits=${f.combo} pips=${f.pips} hp=${f.hp}/${state.fighters[1].hp} x=${Math.round(f.x)} y=${Math.round(f.y)} input=${f.input} throw=${state.throwState?.direction??'-'}/${state.throwState?.phase??'-'} reaction2=${state.fighters[1].reaction?.kind??'-'}/${state.fighters[1].reaction?.phase??'-'}`);if(qaEvents.length>48)qaEvents.shift();}
}
// A presentation frame never enters the deterministic combat/replay stream.
// ---- Online duels (src/net/onlineMatch.ts; hub match sproto_duel) ----
/** Overlay button action while an online overlay is up (queue, failure, result). */
let overlayAction: (() => void) | null = null;
let tutorialCleared = -1;
const ONLINE_DELAY_KEY = 'sproto-arena-online-delay';
$<HTMLSelectElement>('online-delay').value = String(onlineInputDelay());
$<HTMLSelectElement>('online-delay').onchange = e => { try { localStorage.setItem(ONLINE_DELAY_KEY, (e.target as HTMLSelectElement).value); } catch { /* not saved */ } };
function onlineInputDelay(): number {
    try { const v = Number(localStorage.getItem(ONLINE_DELAY_KEY)); return v >= 1 && v <= 4 ? v : 2; } catch { return 2; }
}
async function queueOnline(setup: SelectionSetup, rematchOf?: string) {
    storyAnimation.clear();storyBoss=null;storyBossArt=null;bossStarts.length=0;
    if (online) { await online.leave(); online = null; }
    const wager = setup.mode === 'online-wager';
    const match = new OnlineMatch({
        onPhase: (phase, detail) => {
            if (match !== online) return;
            if (phase === 'queued' && rematchOf) {
                showOnlineOverlay('Rematch requested', 'Waiting for your opponent to choose Rematch too…', 'Waiting…', 'ONLINE', null);
                setTimeout(() => {
                    if (match !== online || match.phase !== 'queued') return;
                    void match.leave(); online = null;
                    showOnlineOverlay('No rematch', 'Your opponent didn’t choose Rematch.', 'Find another opponent', 'ONLINE', () => void queueOnline(setup));
                }, 30000);
            }
            else if (phase === 'queued') showOnlineOverlay('Finding an opponent…', wager ? 'Both players stake 10 Tickets; the winner takes 20. The hub verifies the result before paying.' : 'Looking for another player. Pick “Fighter select” to stop searching.', 'Searching…', 'ONLINE', null);
            if (phase === 'failed' && presentation.phase !== 'result') showOnlineOverlay('Online match unavailable', onlineFailureText(detail), 'Back to fighter select', 'ONLINE', returnToSelection);
        },
        onStart: start => { if (match === online) void beginOnline(match, start.fighters as [FighterId, FighterId], start.stage, !!start.wager); },
        onEvent: event => {
            if (match !== online || event.kind !== 'move') return;
            const f = state.fighters[event.slot];
            if (f?.id === 'michael' && (event.move === 'bolt' || event.move === 'special')) playRetainCallout();
        },
        onOutcome: outcome => {
            if (match !== online) return;
            // The opponent forfeited (left or stopped sending) before any KO: end the round now.
            if (presentation.phase !== 'result' && outcome.status === 'settled' && outcome.reason === 'forfeit') { showOnlineResult(); return; }
            if (presentation.phase === 'result') showOnlineResult();
        },
    }, onlineInputDelay());
    online = match;
    selection.hide(); $('fight-view').hidden = false;
    showOnlineOverlay('Connecting to the hub…', '', 'Connecting…', 'ONLINE', null);
    await match.queue({ wager, fighter: setup.fighter, stage: setup.stage, rematchOf });
}
function onlineFailureText(reason?: string) {
    const known: Record<string, string> = {
        insufficient_tickets: 'One player has fewer than 10 Tickets. Story bosses pay Tickets.',
        not_eligible: 'This account cannot place wagers yet. Unwagered online play is open.',
        pair_limit: 'You two have played 5 wagered matches today. Try another opponent or play unwagered.',
        daily_wager_cap: 'Daily wager winnings limit reached. Unwagered online play is still open.',
        sim_mismatch: 'The other player is on a different game version. Reload to update.',
        join_timeout: 'The other player didn’t join in time.',
    };
    return known[reason ?? ''] ?? reason ?? 'Could not reach the hub.';
}
function showOnlineOverlay(title: string, copy: string, button: string, kicker: string, action: (() => void) | null) {
    showOverlay(title, copy, button, kicker);
    overlayAction = action;
    ($('start') as HTMLButtonElement).disabled = !action;
}
async function beginOnline(match: OnlineMatch, fighters: [FighterId, FighterId], stageId: string, wager: boolean) {
    const stage = (STAGES.some(s => s.id === stageId) ? stageId : 'ranch') as StageId;
    showOnlineOverlay('Opponent found!', 'Loading fighters…', 'Loading…', 'ONLINE', null);
    await Promise.all([
        loadStageArt([stage]),ensurePoseAtlases(fighters,{pin:true}).catch(()=>undefined),
        ensurePowerArt().catch(()=>undefined),
    ]);
    if (match !== online || !match.session) return;
    chosen = fighters[0]; opponent = fighters[1]; mode = 'versus';
    matchTesting = false; matchGodMode = false;
    updateStage(stage);
    state = match.session.state;
    matchDepthOptions = null; depthRoundStarts.length = 0;
    presentation = createRoundPresentation();
    countdown.hide();
    versus.show(chosen, opponent);
    frames.length = 0; qaEvents.length = 0; accumulator = 0; held.clear(); queued = 0; queued2 = 0;
    overlayAction = null; ($('start') as HTMLButtonElement).disabled = false;
    $('mode-label').textContent = wager ? 'ONLINE / 10-TICKET WAGER' : 'ONLINE VERSUS';
    started = true; running = true;
    versus.suspend(false); countdown.suspend(false);
    $('overlay').hidden = true;
    canvas.focus();
    // Both players start together: skip the versus card after a moment instead of waiting for Enter.
    setTimeout(() => { if (match === online && versus.isOpen) versus.skip(); }, 2500);
    if (document.hidden) startHiddenClock();
}
/** One online fight frame: the rollback session owns the state; the outro waits for a KO both inputs confirm. */
/** QA: `?autoplay` lets the built-in CPU play the local side of an online match (soak and end-to-end tests). */
const qaAutoplay = new URLSearchParams(location.search).has('autoplay');
function advanceOnlineFrame(input: number) {
    if (!online) return;
    if (qaAutoplay && online.start) input = cpuInput(state, online.start.seat);
    online.play();
    online.tick(input);
    if (online.confirmedKo && state.winner !== null && presentation.phase === 'fight') {
        const losers = state.fighters.filter((_, i) => state.winner === 2 || i !== state.winner);
        const fromFloor = losers.every(f => f.reaction?.kind === 'knockdown' && f.reaction.phase === 'down');
        beginRoundOutro(presentation, state.winner as 0 | 1 | 2, fromFloor);
        held.clear(); queued = 0; queued2 = 0;
    }
}
function onlineOutcomeText(outcome: DuelOutcome, seat: number) {
    if (outcome.status === 'cancelled') return onlineFailureText(outcome.reason);
    const won = outcome.winnerSeat === seat;
    if (outcome.status === 'refunded') return outcome.wager ? `Stakes refunded (${outcome.reason.replace(/_/g, ' ')}).` : 'No winner recorded.';
    const tickets = outcome.wager ? (won ? ' +10 Tickets (20-Ticket pot).' : ' −10 Tickets.') : '';
    return (outcome.reason === 'forfeit' ? (won ? 'Your opponent forfeited.' : 'You forfeited.') : 'The hub verified the result.') + tickets;
}
function showOnlineResult() {
    const match = online;
    if (!match?.start) return;
    const seat = match.start.seat, outcome = match.outcome;
    const winnerSeat = outcome?.status === 'settled' ? outcome.winnerSeat : state.winner;
    running = false; started = false;
    const title = winnerSeat === 2 ? 'Double knockout.' : winnerSeat === seat ? 'You win.' : winnerSeat === null || winnerSeat === undefined ? 'Match over.' : 'You lose.';
    showOnlineOverlay(title, outcome ? onlineOutcomeText(outcome, seat) : 'Waiting for the hub to confirm the result…', 'Rematch', match.start.wager ? 'ONLINE / 10-TICKET WAGER' : 'ONLINE VERSUS', () => {
        void match.leave(); online = null; stopHiddenClock();
        void queueOnline({ ...selection.getSetup(), mode: match.start?.wager ? 'online-wager' : 'online' }, match.matchId ?? undefined);
    });
}
let onlineStatusAt = 0;
function updateOnlineStatus() {
    const now = performance.now();
    if (!online || now - onlineStatusAt < 500) return;
    onlineStatusAt = now;
    const s = online.status();
    $('device').textContent = online.phase === 'playing'
        ? `${s.link === 'direct' ? 'DIRECT' : 'RELAYED'} · ${s.pingMs === null ? '…' : Math.round(s.pingMs) + ' MS'} · ROLLBACK ${s.rollback}${s.stalled ? ' · WAITING' : ''}`
        : 'ONLINE';
}
function startHiddenClock() {
    if (hiddenClock || typeof Worker === 'undefined') return;
    const source = URL.createObjectURL(new Blob(['setInterval(() => postMessage(0), 16);'], { type: 'text/javascript' }));
    hiddenClock = new Worker(source);
    // Hidden-tab steps run under the crash guard too: a throw is counted, never left uncaught.
    hiddenClock.onmessage = () => { if (document.hidden && online) crashGuard.runFrame(() => frameJudged(stepTo(performance.now()))); };
}
function stopHiddenClock() { hiddenClock?.terminate(); hiddenClock = null; }

/** Player 2's bindings minus any key player 1 has remapped onto (player 1 wins). */
function withoutP1Keys(bindings: Readonly<Record<Action, string>>): Record<Action, string> {
    const p1 = new Set(Object.values(keys));
    return Object.fromEntries(Object.entries(bindings).map(([a, code]) => [a, p1.has(code) ? '' : code])) as Record<Action, string>;
}
/** Advance one frame. `p2Input` is player 2's input in local versus; otherwise the CPU plays slot 2. */
function advanceRoundFrame(input: number, p2Input?: number) {
    if(versus.advance())return;
    function enterBoss(form:BossForm){
        storyBoss=startStoryBoss(state,form);
        bossStarts.push({frame:state.frame,form});
        held.clear();queued=0;queued2=0;padNeedsRelease=true;
        Object.assign(presentation,{phase:'fight',frame:0,winner:null,fromFloor:false});
    }
    if(storyAnimation.blackingOut){
        if(storyAnimation.advanceBlackout()){
            if(storyAnimation.bossForm==='vmu')enterBoss('vmu');
            else storyAnimation.start('boss');
        }
        return;
    }
    storyAnimation.advanceBossReveal();
    const scene=storyAnimation.active;
    if(scene){
        if(storyAnimation.advance())return;
        held.clear();queued=0;queued2=0;padNeedsRelease=true;
        if(scene==='intro'){
            advanceRoundPresentation(presentation,true);countdown.show();return;
        }
        if(scene==='boss'||scene==='mecha'){
            enterBoss(scene==='mecha'?'mecha':storyAnimation.bossForm!);
            return;
        }
        if(storyBoss?.form==='vmu')story.finishMatch(state.winner!);
        reportRound();story.onRoundEnd(state.winner!);return;
    }
    if(countdown.advance()){
        // Entrances remain visible during the countdown; combat and replay wait.
        advanceRoundPresentation(presentation);
        return;
    }
    if (presentation.phase === 'intro') {
        advanceRoundPresentation(presentation, input !== 0);
        if ((presentation as RoundPresentation).phase !== 'fight') return;
        // A skip preserves this exact input for the first combat step.
    }
    if (online && presentation.phase !== 'fight') online.linger();
    if (presentation.phase === 'outro') {
        advanceRoundPresentation(presentation);
        if ((presentation as RoundPresentation).phase !== 'result') return;
        if (online) { showOnlineResult(); return; }
        if (nextMatchRound(state)) {
            depthRoundStarts.push(state.frame);
            presentation = createRoundPresentation();
            countdown.hide(); versus.show(state.fighters[0].id, state.fighters[1].id);
            held.clear(); queued = 0; queued2 = 0;
            return;
        }
        if(state.winner===0&&((!storyBoss&&storyAnimation.start('boss'))||storyAnimation.start('outro')))return;
        reportRound();
        if (story.onRoundEnd(state.winner!)) return;
        if (mode === 'versus') {
            const rounds = state.matchDepth?.rounds ? state.matchDepth.wins : null;
            const victor = rounds ? (rounds[0] === rounds[1] ? 2 : rounds[0] > rounds[1] ? 0 : 1) : state.winner!;
            showOverlay(victor === 2 ? (rounds ? 'MATCH DRAWN' : 'DOUBLE K.O.') : `PLAYER ${victor + 1} WINS`, `${rounds ? `Rounds ${rounds[0]}–${rounds[1]}. ` : ''}Best combos: P1 ${state.fighters[0].best} hits, P2 ${state.fighters[1].best} hits.`, 'Rematch', rounds ? 'LOCAL VERSUS / BEST OF 3' : 'LOCAL VERSUS');
            return;
        }
        // Best of 3 reports the match, not its last round: who took more rounds, and the score.
        const series = state.matchDepth?.rounds ? state.matchDepth.wins : null;
        const result = series ? (series[0] === series[1] ? 2 : series[0] > series[1] ? 0 : 1) : state.winner;
        const won = result === 0, drawn = result === 2;
        const score = series ? `Rounds ${series[0]}–${series[1]}. ` : '';
        showOverlay(drawn ? (series ? 'MATCH DRAWN' : 'DOUBLE K.O.') : won ? 'YOU WIN' : 'YOU LOSE', `${score}${drawn ? 'Nobody left standing.' : won ? 'You found your flow.' : 'Run it back.'} Best combo: ${state.fighters[0].best} hits. ${won ? 'Keep exploring your routes.' : 'Use away to block, and punish the recovery.'}`, 'Fight again', series ? 'MATCH COMPLETE / BEST OF 3' : 'ROUND COMPLETE');
        return;
    }
    if (presentation.phase !== 'fight') return;
    if (online) { advanceOnlineFrame(input); return; }
    const pair: [number, number] = [input, storyBoss?0:p2Input ?? cpuInput(state,1,matchCpuSkill)];
    if (training && !story.isActive && !online && (mode === 'dummy' || mode === 'guard')) {
        if(mode==='guard' && training.playing)training.stop();
        pair[1] = training.input(state, pair[0], pair[1]);
    }
    frames.push(pair);
    const qaBefore = qaPanel ? [state.fighters[0].move?.id,state.fighters[0].combo,state.fighters[0].pips,state.fighters[0].hp,state.fighters[1].hp,state.throwState?.phase,state.fighters[1].reaction?.phase].join('|') : '';
    const previousMoves=state.fighters.map(f=>f.move);
    if(storyBoss)stepStoryBoss(state,storyBoss,input);
    else step(state, pair);
    for(const [i,f] of state.fighters.entries())if(f.id==='michael'&&f.move!==previousMoves[i]&&(f.move?.id==='bolt'||f.move?.id==='special'))playRetainCallout();
    qaRecord(qaBefore);
    if (state.winner !== null) {
        const nextPhase=state.winner===0&&storyAnimation.bossForm?
            (!storyBoss?'boss':storyBoss.form==='giant'?'mecha':null):null;
        if(!nextPhase&&(storyBoss?.form!=='vmu'||state.winner!==0))story.finishMatch(state.winner);
        const losers = state.fighters.filter((_, i) => state.winner === 2 || i !== state.winner);
        const fromFloor = losers.every(f => f.reaction?.kind === 'knockdown' && f.reaction.phase === 'down');
        beginRoundOutro(presentation, state.winner as 0 | 1 | 2, fromFloor);
        if(state.winner===0){
            if(nextPhase==='boss')storyAnimation.startBossBlackout();
            else if(nextPhase&&storyAnimation.start(nextPhase))
                presentation.phase='result';
            else if(!nextPhase&&(storyAnimation.replaceDefeat||storyBoss)&&storyAnimation.start('outro'))
                presentation.phase='result';
        }
        qaStopAtOutro();
        held.clear(); queued = 0;queued2=0;
    }
}
/** Advance the simulation by the real time since the last call. Shared by the frame loop and the hidden-tab clock. */
/**
 * Runs the fixed steps that are due and returns how many ran, or null when combat is idle (paused,
 * a menu or dialog open, QA frozen), so the crash guard can tell "no step was due" from "idle".
 */
function stepTo(now: number): number | null {
    const elapsed = Math.min((now - lastTime) / 1000, .1);
    lastTime = now;
    // Keep KO icon rotation alive on the result screen without advancing combat.
    visualFrame += qaFrozen ? (qaSingleStep ? 1 : 0) : elapsed * 60;
    // While the feedback window holds a local match, the controller must not resume or steer it.
    const pad = feedbackHold ? 0 : pollPad();
    if (running && !selection.isOpen && (online || (!dialog.open && !story.isOpen && !partnerPicker.isOpen)) && (!qaFrozen||qaSingleStep)) {
        accumulator = qaSingleStep?1/60:accumulator+elapsed*(koSlow>0&&!online?KO_SLOW_RATE:1);
        qaSingleStep=false;
        let steps = 0;
        while (accumulator >= 1 / 60) {
            // Boss forms reuse the fight buttons and keys for their own actions (see bossFightInput).
            let input = (storyBoss ? bossFightInput(pad) : pad) | queued;
            const p2 = mode === 'versus' ? padMask(padP2, padKeys2) | queued2 | keyboardMask(held, withoutP1Keys(keys2)) : undefined;
            queued = 0;queued2=0;
            if(storyBoss){
                for(const code of held)input|=bossKeyInput(code,keys);
            }else{
                for(const a of Object.keys(A) as Action[])
                    if(held.has(keys[a]))input|=A[a];
            }
            accumulator -= 1 / 60;
            advanceRoundFrame(input, p2);
            steps++;
            // The final hit plays slowly for a moment; a new round (everyone standing again) re-arms it.
            const downed = !storyBoss && state.fighters.some(f => f.hp <= 0);
            if (koSlow > 0) koSlow--;
            if (downed && !koSeen) koSlow = KO_SLOW_FRAMES;
            koSeen = downed;
            if (!running || (presentation.phase === 'result'&&!storyAnimation.active)) break;
        }
        return steps;
    }
    return null;
}
/**
 * Whether the crash guard counts a frame as good: only when a step ran cleanly or combat is idle.
 * At 120/144 Hz many frames run no step; counting those as good would let a step that throws
 * every time it runs reset the streak forever and never show the panel.
 */
function frameJudged(steps: number | null): boolean { return steps === null || steps > 0; }
/** One rendered frame. The loop below runs it through the crash guard (crash.ts). */
function frameTick(now: number): boolean {
    const steps = stepTo(now);
    updateAudio();
    if(selection.isOpen){const picked=selection.getSetup();updateFooter(picked.rules==='bo3'&&(picked.mode==='cpu'||picked.mode==='versus'));}
    else updateFooter(!!state.matchDepth);
    trackFeedbackEvents();
    sceneSkip.hidden=!storyAnimation.active;sceneSkip.disabled=!running||dialog.open||story.isOpen;
    const bossAge=storyBoss?state.frame-storyBoss.startFrame:0;
    const recovery=storyBoss&&storyBoss.entryHp<1000&&state.winner===null&&bossAge<54
        ?{from:storyBoss.entryHp,progress:Math.min(1,bossAge/42)}:undefined;
    const bossScene=storyAnimation.active==='boss'||storyAnimation.active==='mecha';
    // Show the player at the boss spawn before the cinematic; the regular round replay stays intact.
    const displayState:CombatState=bossScene?{
        ...state,fighters:[storyBossPlayerPose(state.fighters[0]),state.fighters[1]],
        effects:[],projectiles:[],freeze:0,throwState:null,
    }:state;
    const displayPresentation=bossScene?undefined:presentation;
    if(!selection.isOpen&&storyAnimation.blackingOut){
        ctx.fillStyle='#000';
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }else if(!selection.isOpen) render(ctx,displayState,displayPresentation,visualFrame,
        (c,x,y,facing)=>{
            const boss=storyBoss,art=storyBossArt;
            if(!storyAnimation.active&&boss&&art){
                return drawMovingStoryBoss(c,state,boss,()=>drawStoryBossPose(c,state,boss,art)
                    ||storyAnimation.draw(c,x,y,facing,boss.form));
            }
            return storyAnimation.draw(c,x,y,facing,boss?.form);
        },
        storyBoss&&storyBossArt?(c)=>drawStoryBossAttacks(c,state,storyBoss!,storyBossArt!):undefined,
        storyBoss?storyBossTitle(storyBoss.form):undefined,storyAnimation.portalPull(),recovery);
    if(!selection.isOpen&&storyAnimation.bossRevealOpacity>0){
        const opacity=storyAnimation.bossRevealOpacity;
        const x=canvas.width/2,y=canvas.height*.62;
        const reveal=ctx.createRadialGradient(x,y,0,x,y,Math.hypot(x,y));
        reveal.addColorStop(0,`rgba(0,0,0,${opacity**1.65})`);
        reveal.addColorStop(.58,`rgba(0,0,0,${opacity})`);
        reveal.addColorStop(1,`rgba(0,0,0,${opacity**.65})`);
        ctx.save();ctx.fillStyle=reveal;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.restore();
    }
    const showTraining = trainingActive();
    trainingControls.hidden = trainingPanel.hidden = !showTraining;
    if (showTraining) drawTrainingGeometry(ctx, state);
    if (training === tutorialCoach && started && !selection.isOpen && !online && !story.isActive) {
        const lesson = tutorialCoach.view(controlPrompt);
        drawTutorial(ctx, lesson);
        if (lesson.cleared === 1 && tutorialCleared !== lesson.index) { tutorialCleared = lesson.index; audio.play('charge'); }
        if (lesson.cleared === 0) tutorialCleared = -1;
        if (lesson.complete && running) {
            showOverlay('TUTORIAL COMPLETE', 'Block, chain into a finisher, throw and tech, dash cancel, jump cancel, quick rise and Team Special: that is the whole toolkit. The pause menu lists every move.', 'Run it again', 'TUTORIAL');
            audio.play('win');
            overlayAction = () => { overlayAction = null; tutorialCoach.begin(); restart(); start(); };
        }
    }
    if (online) updateOnlineStatus();
    if(trainingPlayButton)trainingPlayButton.disabled = mode!=='dummy' || story.isActive || !!online;
    if (showTraining) trainingPanel.textContent = 'TRAINING · looping requires Standing dummy\nGreen: hurtbox · red: active hitbox · blue: projectile · gray: strike invulnerability\n' + trainingReadout(state) + `\nRecording ${trainingRecorder.recording ? 'ON' : 'off'} · ${trainingRecorder.frames.length} frames · playback ${trainingRecorder.playing ? 'ON' : 'off'}`;
    if(qaPanel)qaPanel.textContent=`MANUAL QA · frame ${state.frame} · ${qaFrozen?'QA frozen':running?'running':'paused'}\n`+state.fighters.map((f,i)=>`P${i+1} ${f.id}: x=${f.x.toFixed(1)} y=${f.y.toFixed(1)} vx=${f.vx.toFixed(2)} vy=${f.vy.toFixed(2)} ${f.move?.id??'neutral'} t=${f.move?.t??0} input=${f.input} hp=${f.hp} combo=${f.combo} best=${f.best} pips=${f.pips} reaction=${f.reaction?.kind??'-'}/${f.reaction?.phase??'-'}:${f.reaction?.t??0}`).join('\n')+'\nPresentation: '+JSON.stringify(presentation)+'\nReplay frames: '+frames.length+'\nThrow: '+JSON.stringify(state.throwState)+'\nProjectiles: '+state.projectiles.map(p=>`${p.shape} x=${p.x.toFixed(1)} y=${p.y.toFixed(1)} vx=${p.vx.toFixed(2)} vy=${p.vy.toFixed(2)}`).join('; ')+'\n'+qaEvents.join('\n');
    const padName = (a: Action) => padButtonName(padKeys[a]);
    $('coach').textContent = storyBoss ? (lastDevice === 'pad' ? `Auto-fire · stick / D-pad move · ↑ or ${padName('launcher')} double-jump · ${padName('dash')} dash · ${padName('light')} beam · ${padName('medium')} ball · ${padName('heavy')} shield · Start pauses (Restart is in the menu)` : `Auto-fire · A/D or arrows move · W or ↑ double-jump · Shift dash · ${keyName(keys.light)} or C beam · ${keyName(keys.medium)} or V ball · ${keyName(keys.heavy)} or X shield · R retry`) : mode === 'versus' && lastDevice === 'pad' ? `Controller 1 plays P1, controller 2 plays P2 · ${padName('light')} ${padName('medium')} ${padName('heavy')} attack · either Start pauses. Remap both in Settings.` : mode === 'versus' ? `P1: ${keyName(keys.left)}/${keyName(keys.right)} move, ${keyName(keys.light)} ${keyName(keys.medium)} ${keyName(keys.heavy)} attack · P2: ${keyName(keys2.left)}/${keyName(keys2.right)} move, ${keyName(keys2.light)} ${keyName(keys2.medium)} ${keyName(keys2.heavy)} attack. A second controller plays P2. Remap both in Settings.` : state.fighters[0].pips === 3 ? `Relay ready — press ${controlPrompt('special')} for your Team Special.` : mode === 'guard' ? 'Throws beat guard. Crouch bolts. Air attacks beat low guard.' : 'Light → Medium → Finisher earns one charge.';
    return frameJudged(steps);
}
/** Always reschedules, even when a frame throws; a throw ends that frame's fixed steps.
 * After a few failing frames in a row the game pauses and shows "Something broke". */
const tick = createFrameLoop(frameTick);
updateControls();
$('start').setAttribute('disabled','');
$('start').textContent='Loading fighter sprites…';
ensurePoseAtlases(['highsproto','vela'],{pin:true}).then(()=>{$('start').removeAttribute('disabled');$('start').textContent='Resume';selection.setReady(true);}).catch(error=>{const message='Fighter art could not load. Restart the local server and reload.';$('overlay-copy').textContent=message;selection.setReady(false,message);crashGuard.report(error,'boot');});
document.fonts.load('600 16px "Pixelify Sans"').then(()=>selection.refresh());
loadStagePreviews(STAGES.filter(stage=>!stage.parent).map(stage=>stage.id)).then(()=>selection.refresh()).catch(error=>console.warn('Stage preview uses local fallback.',error));
requestAnimationFrame(tick);
// Read-only snapshots and replay export for development. No debug meter injection.
Object.assign(window, { neonRelay: { snapshot: (): CombatState => structuredClone(state), presentationSnapshot: () => structuredClone(presentation), audioStatus: audio.status, storySnapshot: story.snapshot, storyAnimationSnapshot:storyAnimation.snapshot, replay: () => ({ version: 2, fighter: chosen, mode, opponent, cpuSkill:matchCpuSkill, difficultyAssisted:matchDifficultyAssist, ...(state.fighters[0].partner?{partner:state.fighters[0].partner}:{}), godMode:matchGodMode, ...(matchDepthOptions?{matchDepth:{...matchDepthOptions,roundStarts:[...depthRoundStarts]}}:{}), ...(bossStarts.length?{bossStarts:bossStarts.map(entry=>({...entry}))}:{}), ...(godModeChanges.length?{godModeChanges:godModeChanges.map(entry=>({...entry}))}:{}), frames: frames.map(f => [...f]) }), verifyReplay: () => {
            const replay = createState(chosen, mode, opponent);
            if(matchDepthOptions)enableMatchDepth(replay,matchDepthOptions);
            if(state.fighters[0].partner)replay.fighters[0].partner=state.fighters[0].partner;
            if(matchGodMode){replay.godMode=true;replay.fighters[0].pips=3;}
            let boss:StoryBoss|null=null,next=0,toggle=0;
            const applyChanges=()=>{
                while(replay.frame===godModeChanges[toggle]?.frame)
                    applyGodMode(replay,godModeChanges[toggle++].enabled);
            };
            for(const frame of frames){
                if(depthRoundStarts.includes(replay.frame))nextMatchRound(replay);
                if(replay.frame===bossStarts[next]?.frame)boss=startStoryBoss(replay,bossStarts[next++].form);
                applyChanges();
                if(boss)stepStoryBoss(replay,boss,frame[0]);
                else step(replay,frame);
            }
            if(replay.frame===bossStarts[next]?.frame)boss=startStoryBoss(replay,bossStarts[next].form);
            applyChanges();
            if(depthRoundStarts.includes(replay.frame))nextMatchRound(replay);
            return JSON.stringify(replay)===JSON.stringify(state)&&JSON.stringify(boss)===JSON.stringify(storyBoss);
        } } });
