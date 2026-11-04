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
import { P2_KEYS, UNBOUND, keyboardMask, pressedMask, padMask, versusPads, rebindKey, rebindPad, resolveKeyConflicts } from './localInput';
import { A, ROSTER, PLAYABLE_FIGHTERS, createState, cpuInput, step, type Action, type PlayableFighterId as FighterId, type Mode, type CombatState } from './core';
import { render } from './render';
import { ensurePowerArt } from './powerArt';
import { playRetainCallout } from './characterVoice';
import { createRoundPresentation, advanceRoundPresentation, beginRoundOutro, type RoundPresentation } from './animationEvents';
import { STAGES, setStage, loadStageArt, loadStagePreviews, getStageArtStatus, type StageId } from './stage';
import {storyProgress,STORY_ENCOUNTERS} from './storyProgress';
import {storyLocationForEncounter,loadStoryLocation,setActiveStoryLocation} from './stageVariants';
import { createStoryMode } from './storyMode';
import { connectHub, hubConfigured, type HubLink } from './hub/link';
import { OnlineMatch } from './net/onlineMatch';
import type { DuelOutcome } from './net/hubDuel';
import { isFighterAvailable, fighterLockReason, readRelicCache, writeRelicCache } from './hub/roster';
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('game'), ctx = canvas.getContext('2d')!;
$('roster-count').textContent=`${PLAYABLE_FIGHTERS.length} FIGHTERS · ${STAGES.length} STAGES · UNLIMITED ROUND TIME`;
const defaults: Record<Action, string> = { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', light: 'KeyJ', medium: 'KeyK', heavy: 'KeyL', launcher: 'KeyU', bolt: 'KeyI', grab: 'KeyO', special: 'KeyP', dash: 'ShiftLeft' };
const padDefaults: Partial<Record<Action, number>> = { light: 0, medium: 2, heavy: 1, launcher: 3, bolt: 5, grab: 4, special: 7, dash: 6 };
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
resolveKeyConflicts(keys, keys2);
let state = createState('highsproto'), chosen: FighterId = 'highsproto', mode: Mode = 'cpu', opponent: FighterId | undefined = 'vela', running = false, started = false, remapping: {
    action: Action;
    device: 'key' | 'pad';
    player: 1 | 2;
} | null = null;
/** Which player's mappings the Controls panel is showing. */
let controlsPlayer: 1 | 2 = 1;
let matchGodMode=false, matchEarnedGodMode=false, testingGodMode=false, matchTesting=false;
let presentation = createRoundPresentation();
let modalDirection='',modalRepeatAt=0,padNeedsRelease=true;
let resumeAfterSettings = false, accumulator = 0, lastTime = 0, previousPad: number[] = [], previousPad2: number[] = [], previousStart = false;
let visualFrame = 0;
const held = new Set<string>();
const blockedKeys = new Set<string>();
let queued = 0, queued2 = 0; // presses since the last frame, per playerqueued2=0;
const countdown=createFightCountdown(canvas.parentElement!);
const versus=createVersusScreen($('fight-view'),()=>{
    // Dismissing a preview must never become an attack, jump or pause in combat.
    for(const code of held)blockedKeys.add(code);
    held.clear();queued=0;queued2=0;padNeedsRelease=true;
    countdown.show();
    if(running&&!dialog.open&&!story.isOpen)canvas.focus();
});
const frames: [
    number,
    number
][] = [];
const storage = (() => { try { return window.localStorage; } catch { return null; } })();
let hubRelics: string[] = readRelicCache(storage);
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
const selection = createSelectionMenu({start:setup=>{void launchSelection(setup);},prepare:prepareSelectionArt,canPlay:canPlayFighter,locked:lockedFighter});
let toastTimer=0;
function hubToast(title:string,sub:string){
 const toast=$('hub-toast');toast.replaceChildren();
 const heading=document.createElement('b');heading.textContent=title;
 toast.append(heading,document.createTextNode(sub));toast.hidden=false;
 clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>{toast.hidden=true;},6000);
}
$('return-hub').onclick=()=>{if(hub)hub.exitHub();};
if(hubConfigured())$('return-hub').hidden=false;
void connectHub().then(link=>{
 hub=link;
 if(link.connected){
  hubRelics=link.relics;writeRelicCache(storage,hubRelics);selection.refreshLocks();
  $('return-hub').hidden=false;$('hub-label').textContent='● HUB LINKED / BAR ARCADE';$('hub-label').classList.add('linked');
 }else if(link.error){$('hub-label').textContent='● HUB OFFLINE / 1V1';console.warn('Hub connection unavailable:',link.error);}
});
/** Called exactly once at result; story saves are already settled at KO. */
function reportRound(){
 if(!hub?.connected||state.winner===null)return;
 const current=story.snapshot(),encounter=current.encounter;
 const chapterComplete=!!encounter&&current.wave===encounter.opponents.length-1&&
  STORY_ENCOUNTERS.filter(e=>e.chapter===encounter.chapter).every(e=>storyProgress.isCleared(e.index));
 void hub.onRoundEnd({winner:state.winner,mode,storyWorld:chapterComplete?encounter!.chapter:null,
  stage:current.active??selection.getSetup().stage,fighter:chosen,assisted:matchGodMode},hubToast);
}
function updateStage(stage:StageId) {
    setStage(stage);setActiveStoryLocation(null);
    const location=STAGES.find(s=>s.id===stage)!;
    $('stage-title').textContent=location.name.toUpperCase();
    $('stage-subtitle').textContent=stage==='ranch'?' / BONUS STAGE':' / '+location.theme.toUpperCase();
}
async function launchSelection(setup:SelectionSetup,isStory=false) {
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
    const requiredFighters=[setup.fighter,...(encounter?.opponents??[setup.opponent])];
    // Usually already prefetched; otherwise the rest of the bodies load now.
    $('selection-loading').textContent='Loading selected fighters…';
    try{await Promise.all([ensurePoseAtlases(requiredFighters,{pin:true}),requiredFighters.some(id=>['michael','sproto2531','sproto3106','vitaliketh'].includes(id))?ensurePowerArt():Promise.resolve()]);}catch(error){selection.setReady(false,'Selected fighter art could not load. Choose again to retry.');console.error(error);return false;}
    let scenery=encounter?storyLocationForEncounter(encounter,STORY_ENCOUNTERS,encounter.opponents.indexOf(setup.opponent)):null;
    if(scenery){try{await loadStoryLocation(scenery);}catch(error){console.warn('Story scenery unavailable; using the original arena.',error);scenery=null;}}
    matchEarnedGodMode=storyProgress.snapshot().godModeUnlocked&&!!setup.godMode;
    chosen=setup.fighter;opponent=setup.opponent;mode=isStory?'cpu':setup.mode as Mode;
    if(!isStory){story.leaveStory();freePlayMode=null;}
    updateStage(setup.stage);setActiveStoryLocation(scenery);
    if(scenery)$('stage-subtitle').textContent=' / '+scenery.title.toUpperCase();
    selection.setSetup({...setup,mode});selection.hide();$('fight-view').hidden=false;
    started=false;restart();start();
    $('mode-label').textContent=isStory?'STORY / WORLD '+STAGES.find(s=>s.id===setup.stage)!.chapter:mode==='cpu'?'CPU SPARRING':mode==='versus'?'LOCAL VERSUS':mode==='guard'?'GUARD PRACTICE':'COMBO PRACTICE';
    if(encounter&&encounter.opponents.length>1){
        const bout=encounter.opponents.indexOf(setup.opponent)+1;
        const gauntletName=encounter.gauntlet==='art'?'ART DUO':encounter.gauntlet==='nick-juicy'?'NICK → JUICY':'FINAL GAUNTLET';
        $('mode-label').textContent+=` / ${gauntletName} / BOUT ${bout} OF ${encounter.opponents.length}${bout>1?' / HEALTH REFILLED':''}`;
    }
    updateGodModeLabel();
    return true;
}
function returnToSelection() {
    if(online){if(online.phase==='playing'&&!window.confirm('Leave this online match? Leaving forfeits it.'))return;void online.leave();online=null;stopHiddenClock();}
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
function updateControls() {
    $('directional-help').textContent = `${keyName(keys.up)} + ${keyName(keys.light)}: Rising strike · ${keyName(keys.up)} + forward + ${keyName(keys.medium)}: Diagonal · ${keyName(keys.down)} + ${keyName(keys.medium)}/${keyName(keys.heavy)}: Low / dive · ${keyName(keys.bolt)}: Horizontal spit (${keyName(keys.down)}: crouch low / ${keyName(keys.up)}: jump high) / aim other powers · ${keyName(keys.dash)} after hit: Dash cancel`;

    $('controls-strip').innerHTML = `<span class="control"><kbd>${keyName(keys.left)} ${keyName(keys.right)}</kbd> Move / block</span>` + (['up', 'down', 'light', 'medium', 'heavy', 'launcher', 'bolt', 'grab', 'special', 'dash'] as Action[]).map(a => `<span class="control"><kbd>${keyName(keys[a])}</kbd>${labels[a]}</span>`).join('');
    document.querySelectorAll<HTMLElement>('[data-key]').forEach(el => el.textContent = keyName(keys[el.dataset.key as Action]));
    const playerKeys = controlsPlayer === 1 ? keys : keys2, playerPad = controlsPlayer === 1 ? padKeys : padKeys2;
    for (const p of [1, 2] as const) { const tab = $(`controls-p${p}`); tab.setAttribute('aria-selected', String(controlsPlayer === p)); tab.tabIndex = controlsPlayer === p ? 0 : -1; }
    $('controls-panel').dataset.player = String(controlsPlayer);
    $('controls-player-note').textContent = controlsPlayer === 1 ? 'Player 1 plays every mode and drives the menus with the first controller.' : 'Player 2 plays in Local versus with these keys or the second controller connected.';
    $('defaults').textContent = `Restore player ${controlsPlayer} defaults`;
    const pending = (a: string, device: 'key' | 'pad') => remapping?.player === controlsPlayer && remapping.action === a && remapping.device === device;
    $('bindings').innerHTML = Object.entries(labels).map(([a, label]) => `<div class="binding-row ${remapping?.player === controlsPlayer && remapping.action === a ? 'pending' : ''}"><span>${label}</span><button class="quiet" data-map="${a}" data-device="key">${pending(a, 'key') ? 'Press a key…' : playerKeys[a as Action] === UNBOUND ? '—' : keyName(playerKeys[a as Action])}</button>${a in padDefaults ? `<button class="quiet" data-map="${a}" data-device="pad">${pending(a, 'pad') ? 'Press a button…' : 'Pad ' + playerPad[a as Action]}</button>` : '<span class="micro">D-pad / left stick</span>'}</div>`).join('');
    document.querySelectorAll<HTMLButtonElement>('[data-map]').forEach(b => b.onclick = () => { remapping = { action: b.dataset.map as Action, device: b.dataset.device as 'key' | 'pad', player: controlsPlayer }; $('binding-status').textContent = 'Escape cancels. A key another action or player uses is swapped.'; updateControls(); });
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
function showOverlay(title: string, copy: string, button: string, kicker = 'COMBAT LAB / PAUSED') { running = false; versus.suspend(true);countdown.suspend(true);held.clear(); queued = 0;queued2=0; $('overlay').hidden = false; $('overlay-title').textContent = title; $('overlay-copy').textContent = copy; $('start').textContent = button; $('overlay-kicker').textContent = kicker; if(!selection.isOpen)$('start').focus(); }
function start() {
    if (selection.isOpen || story.isOpen || dialog.open || ($('start') as HTMLButtonElement).disabled) return;
    if (presentation.phase === 'result')
        restart();
    started = true;
    running = true;
    versus.suspend(false);countdown.suspend(false);
    padNeedsRelease = true;
    accumulator = 0;
    held.clear();
    queued = 0;queued2=0;
    $('overlay').hidden = true;
    $('pause').innerHTML = 'Pause <kbd>Esc</kbd>';
    canvas.focus();
}
function pause() {
    if (!started || presentation.phase === 'result' || online)
        return;
    if (running)
        showOverlay('Take a breath.', 'Your round is paused. Resume when you’re ready.', 'Resume →');
    else
        start();
}
function restart() {
    matchTesting=testingGodMode&&mode!=='versus';matchGodMode=(testingGodMode||matchEarnedGodMode)&&mode!=='versus';
    state = createState(chosen, mode, opponent);
    if(matchGodMode){state.godMode=true;state.fighters[0].pips=3;}
    presentation = createRoundPresentation();
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
    const label=$('mode-label');label.textContent=(label.textContent??'').replace(/ \/ GOD MODE(?: TEST)?$/,'')+(matchTesting?' / GOD MODE TEST':matchGodMode?' / GOD MODE':'');
}
function setTestingGodMode(enabled:boolean){
    testingGodMode=enabled;
    // Restart is deliberately blocked while Settings is open. Resume the new
    // round on close even if the previous one was already on its result screen.
    if(started&&!selection.isOpen){resumeAfterSettings=true;if(!story.retryMatch())restart();}
}
let resumeAfterJourney = false, freePlayMode: MenuMode | null = null;
const story = createStoryMode({
    map:mountCampaignMap,
    selectedFighter:()=>selection.getSetup().fighter,
    canPlayFighter,
    testing:()=>matchTesting,
    ready: () => !($('start') as HTMLButtonElement).disabled,
    pause: () => { resumeAfterJourney = running; showOverlay('Choose your next destination.', 'Your current round is paused while you browse worlds and levels.', 'Resume →'); },
    resume: () => { if (resumeAfterJourney && started && presentation.phase !== 'result') start(); },
    launch: (stage, isStory, storyOpponent) => {
        if(isStory)freePlayMode??=selection.getSetup().mode;
        const setup=selection.getSetup();
        if(storyOpponent)setup.opponent=storyOpponent;
        setup.stage=stage;setup.mode=isStory?'cpu':freePlayMode??setup.mode;
        if(!isStory)freePlayMode=null;
        return launchSelection(setup,isStory);
    },
});
$('start').onclick = () => overlayAction ? overlayAction() : start();
$('pause').onclick = pause;
$('reset').onclick = ()=>{if(!story.retryMatch())restart();};
const dialog = $<HTMLDialogElement>('controls-dialog');
$('testing-god-mode').onchange=()=>setTestingGodMode($<HTMLInputElement>('testing-god-mode').checked);
$('settings').onclick = () => {
    $<HTMLInputElement>('testing-god-mode').checked=testingGodMode;
    resumeAfterSettings = running;
    if (running)
        pause();
    held.clear();
    queued = 0;queued2=0;
    dialog.showModal();
};
function closeSettings() {
    remapping = null;
    dialog.close();
    updateControls();
    if (resumeAfterSettings)
        start();
}
$('close-settings').onclick = closeSettings;
dialog.addEventListener('cancel', e => {
    e.preventDefault();
    if (remapping) {
        remapping = null;
        updateControls();
    }
    else
        closeSettings();
});
$('defaults').onclick = () => {
    if (controlsPlayer === 1) { keys = { ...defaults }; padKeys = { ...padDefaults }; }
    else { keys2 = { ...P2_KEYS }; padKeys2 = { ...padDefaults }; }
    resolveKeyConflicts(keys, keys2); remapping = null; save(); updateControls();
};
for (const p of [1, 2] as const) $(`controls-p${p}`).onclick = () => { controlsPlayer = p; remapping = null; updateControls(); };
$('controls-tabs').onkeydown = e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); controlsPlayer = controlsPlayer === 1 ? 2 : 1; remapping = null; updateControls(); $(`controls-p${controlsPlayer}`).focus(); } };
window.addEventListener('keydown', e => {
    if (story.isOpen) return;
    if (dialog.open) {
        if (remapping?.device === 'key') {
            e.preventDefault();
            if (e.code === 'Escape') {
                remapping = null;
                updateControls();
            }
            else if (!['Tab', 'Enter'].includes(e.code))
                bind(e.code);
        }
        return;
    }
    if (selection.isOpen) return;
    if (e.code === 'Escape') {
        e.preventDefault();
        if (!e.repeat)
            pause();
        return;
    }
    if (!running)
        return;
    if(blockedKeys.has(e.code)){e.preventDefault();return;}
    if(versus.isOpen){
        e.preventDefault();if(e.code==='Enter'&&!e.repeat){blockedKeys.add(e.code);versus.skip();}return;
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
    const pads = navigator.getGamepads?.() || [];
    const pad = Array.from(pads).find(p => p?.connected);
    const wasSelection=selection.isOpen,wasModal=story.isOpen||dialog.open,wasOverlay=!running&&!selection.isOpen;
    selection.pollPad(pad??null);
    if (!pad) {
        if (!online) $('device').textContent = 'KEYBOARD READY';
        previousPad = [];
        return 0;
    }
    if (!online) $('device').textContent = 'CONTROLLER CONNECTED';
    const buttons = pad.buttons.map(b => b.pressed ? 1 : 0);
    let boundPadThisFrame=false;
    // Remapping listens to the remapped player's own controller: player 2's is
    // the second one connected (falling back to the first if there is only one).
    const second = versusPads(Array.from(pads))[1];
    const secondButtons = second ? second.buttons.map(b => b.pressed ? 1 : 0) : [];
    if (remapping?.device === 'pad') {
        const fromSecond = remapping.player === 2 && !!second;
        const source = fromSecond ? secondButtons : buttons, before = fromSecond ? previousPad2 : previousPad;
        const index = source.findIndex((b, i) => b && !before[i]);
        if (index >= 0 && index !== 9){bind(index);boundPadThisFrame=true;}
    }
    previousPad2 = secondButtons;
    if(wasModal&&(story.isOpen||dialog.open)&&!remapping&&!boundPadThisFrame){
        const activeDialog=document.querySelector<HTMLDialogElement>('dialog[open]')!;
        const direction=buttons[12]||buttons[14]||pad.axes[1]<-.55||pad.axes[0]<-.55?'previous':buttons[13]||buttons[15]||pad.axes[1]>.55||pad.axes[0]>.55?'next':'';
        const now=performance.now();
        if(direction&&(direction!==modalDirection||now>=modalRepeatAt)){
            const controls=Array.from(activeDialog.querySelectorAll<HTMLElement>('button:not(:disabled), select, input')).filter(el=>el.offsetParent!==null);
            const index=controls.indexOf(document.activeElement as HTMLElement);controls[(index+(direction==='previous'?-1:1)+controls.length)%controls.length]?.focus();
            modalRepeatAt=now+(direction===modalDirection?160:360);
        }
        modalDirection=direction;
        if(buttons[1]&&!previousPad[1])activeDialog.dispatchEvent(new Event('cancel',{cancelable:true}));
        else if(buttons[0]&&!previousPad[0]&&document.activeElement instanceof HTMLElement&&document.activeElement.matches('button,input[type=checkbox]'))document.activeElement.click();
    }else if(!wasOverlay)modalDirection='';
    if(wasOverlay&&!wasModal&&!dialog.open&&!story.isOpen){
        const direction=buttons[12]||buttons[14]||pad.axes[1]<-.55||pad.axes[0]<-.55?'previous':buttons[13]||buttons[15]||pad.axes[1]>.55||pad.axes[0]>.55?'next':'';
        const now=performance.now();
        if(direction&&(direction!==modalDirection||now>=modalRepeatAt)){
            const choices=[$('start'),$('overlay-select')],index=choices.indexOf(document.activeElement as HTMLElement);
            choices[(index+(direction==='previous'?-1:1)+choices.length)%choices.length].focus();modalRepeatAt=now+250;
        }
        modalDirection=direction;
        if(buttons[1]&&!previousPad[1])returnToSelection();
        else if(buttons[9]&&!previousPad[9])start();
        else if(buttons[0]&&!previousPad[0]){const active=document.activeElement;if(active===$('start')||active===$('overlay-select'))(active as HTMLElement).click();else $('start').focus();}
    }
    if(wasSelection||wasModal||wasOverlay||selection.isOpen||story.isOpen||dialog.open){padNeedsRelease=true;previousStart=!!buttons[9];previousPad=buttons;return 0;}
    if(padNeedsRelease){previousStart=!!buttons[9];previousPad=buttons;if(!buttons.some(Boolean)&&pad.axes.every(axis=>Math.abs(axis)<.3))padNeedsRelease=false;return 0;}
    if(versus.isOpen){
        const skip=!!buttons[0]&&!previousPad[0];
        previousStart=!!buttons[9];previousPad=buttons;
        if(skip)versus.skip();
        return 0;
    }
    const menu = !!buttons[9];
    if (menu && !previousStart && !dialog.open && !story.isOpen) {
        if (!started || presentation.phase === 'result')
            start();
        else
            pause();
    }
    previousStart = menu;
    previousPad = buttons;
    let mask = 0;
    if (pad.axes[0] < -.3 || buttons[14])
        mask |= A.left;
    if (pad.axes[0] > .3 || buttons[15])
        mask |= A.right;
    if (pad.axes[1] < -.55 || buttons[12])
        mask |= A.up;
    if (pad.axes[1] > .55 || buttons[13])
        mask |= A.down;
    for (const a of Object.keys(padKeys) as Action[])
        if (buttons[padKeys[a]!])
            mask |= A[a];
    return mask;
}
// Optional, visible read-only diagnostics for manual QA; never changes combat state.
const qaPanel = new URLSearchParams(location.search).has('qa') ? document.createElement('pre') : null;
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
const ONLINE_DELAY_KEY = 'sproto-arena-online-delay';
$<HTMLSelectElement>('online-delay').value = String(onlineInputDelay());
$<HTMLSelectElement>('online-delay').onchange = e => { try { localStorage.setItem(ONLINE_DELAY_KEY, (e.target as HTMLSelectElement).value); } catch { /* not saved */ } };
function onlineInputDelay(): number {
    try { const v = Number(localStorage.getItem(ONLINE_DELAY_KEY)); return v >= 1 && v <= 4 ? v : 2; } catch { return 2; }
}
async function queueOnline(setup: SelectionSetup, rematchOf?: string) {
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
                    showOnlineOverlay('No rematch', 'Your opponent didn’t choose Rematch.', 'Find another opponent →', 'ONLINE', () => void queueOnline(setup));
                }, 30000);
            }
            else if (phase === 'queued') showOnlineOverlay('Finding an opponent…', wager ? 'Both players stake 10 Tickets; the winner takes 20. The hub verifies the result before paying.' : 'Looking for another player. Pick “Fighter select” to stop searching.', 'Searching…', 'ONLINE', null);
            if (phase === 'failed' && presentation.phase !== 'result') showOnlineOverlay('Online match unavailable', onlineFailureText(detail), 'Back to fighter select →', 'ONLINE', returnToSelection);
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
        insufficient_tickets: 'One player has fewer than 10 Tickets. Win CPU matches to earn more.',
        not_eligible: 'Wagers open after 3 CPU wins. Win a few CPU matches first.',
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
    await Promise.all([loadStageArt([stage]), ensurePoseAtlases(fighters,{pin:true}).catch(() => undefined)]);
    if (match !== online || !match.session) return;
    chosen = fighters[0]; opponent = fighters[1]; mode = 'versus';
    matchTesting = false; matchGodMode = false;
    updateStage(stage);
    state = match.session.state;
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
    showOnlineOverlay(title, outcome ? onlineOutcomeText(outcome, seat) : 'Waiting for the hub to confirm the result…', 'Rematch →', match.start.wager ? 'ONLINE / 10-TICKET WAGER' : 'ONLINE VERSUS', () => {
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
    hiddenClock.onmessage = () => { if (document.hidden && online) stepTo(performance.now()); };
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
        reportRound();
        if (story.onRoundEnd(state.winner!)) return;
        if (mode === 'versus') {
            showOverlay(state.winner === 2 ? 'Double knockout.' : `Player ${state.winner! + 1} wins.`, `Best combos: P1 ${state.fighters[0].best} hits, P2 ${state.fighters[1].best} hits.`, 'Rematch →', 'LOCAL VERSUS');
            return;
        }
        const won = state.winner === 0;
        showOverlay(state.winner === 2 ? 'Double knockout.' : won ? 'You found your flow.' : 'Run it back.', `Best combo: ${state.fighters[0].best} hits. ${won ? 'Keep exploring your routes.' : 'Use away to block, and punish the recovery.'}`, 'Fight again →', 'ROUND COMPLETE');
        return;
    }
    if (presentation.phase !== 'fight') return;
    if (online) { advanceOnlineFrame(input); return; }
    const pair: [number, number] = [input, p2Input ?? cpuInput(state)];
    frames.push(pair);
    const qaBefore = qaPanel ? [state.fighters[0].move?.id,state.fighters[0].combo,state.fighters[0].pips,state.fighters[0].hp,state.fighters[1].hp,state.throwState?.phase,state.fighters[1].reaction?.phase].join('|') : '';
    const previousMoves=state.fighters.map(f=>f.move);
    step(state, pair);
    for(const [i,f] of state.fighters.entries())if(f.id==='michael'&&f.move!==previousMoves[i]&&(f.move?.id==='bolt'||f.move?.id==='special'))playRetainCallout();
    qaRecord(qaBefore);
    if (state.winner !== null) {
        story.finishMatch(state.winner);
        const losers = state.fighters.filter((_, i) => state.winner === 2 || i !== state.winner);
        const fromFloor = losers.every(f => f.reaction?.kind === 'knockdown' && f.reaction.phase === 'down');
        beginRoundOutro(presentation, state.winner as 0 | 1 | 2, fromFloor);
        qaStopAtOutro();
        held.clear(); queued = 0;queued2=0;
    }
}
/** Advance the simulation by the real time since the last call. Shared by the frame loop and the hidden-tab clock. */
function stepTo(now: number) {
    const elapsed = Math.min((now - lastTime) / 1000, .1);
    lastTime = now;
    // Keep KO icon rotation alive on the result screen without advancing combat.
    visualFrame += qaFrozen ? (qaSingleStep ? 1 : 0) : elapsed * 60;
    const pad = pollPad();
    if (running && !selection.isOpen && (online || (!dialog.open && !story.isOpen)) && (!qaFrozen||qaSingleStep)) {
        accumulator = qaSingleStep?1/60:accumulator+elapsed;
        qaSingleStep=false;
        while (accumulator >= 1 / 60) {
            let input = pad | queued;
            const p2 = mode === 'versus' ? padMask(versusPads(Array.from(navigator.getGamepads?.() ?? []))[1], padKeys2) | queued2 | keyboardMask(held, withoutP1Keys(keys2)) : undefined;
            queued = 0;queued2=0;
            for (const a of Object.keys(A) as Action[])
                if (held.has(keys[a]))
                    input |= A[a];
            accumulator -= 1 / 60;
            advanceRoundFrame(input, p2);
            if (!running || presentation.phase === 'result') break;
        }
    }
}
function tick(now: number) {
    stepTo(now);
    if(!selection.isOpen) render(ctx, state, presentation, visualFrame);
    if (online) updateOnlineStatus();
    if(qaPanel)qaPanel.textContent=`MANUAL QA · frame ${state.frame} · ${qaFrozen?'QA frozen':running?'running':'paused'}\n`+state.fighters.map((f,i)=>`P${i+1} ${f.id}: x=${f.x.toFixed(1)} y=${f.y.toFixed(1)} vx=${f.vx.toFixed(2)} vy=${f.vy.toFixed(2)} ${f.move?.id??'neutral'} t=${f.move?.t??0} input=${f.input} hp=${f.hp} combo=${f.combo} best=${f.best} pips=${f.pips} reaction=${f.reaction?.kind??'-'}/${f.reaction?.phase??'-'}:${f.reaction?.t??0}`).join('\n')+'\nPresentation: '+JSON.stringify(presentation)+'\nReplay frames: '+frames.length+'\nThrow: '+JSON.stringify(state.throwState)+'\nProjectiles: '+state.projectiles.map(p=>`${p.shape} x=${p.x.toFixed(1)} y=${p.y.toFixed(1)} vx=${p.vx.toFixed(2)} vy=${p.vy.toFixed(2)}`).join('; ')+'\n'+qaEvents.join('\n');
    $('coach').textContent = mode === 'versus' ? `P1: ${keyName(keys.left)}/${keyName(keys.right)} move, ${keyName(keys.light)} ${keyName(keys.medium)} ${keyName(keys.heavy)} attack · P2: ${keyName(keys2.left)}/${keyName(keys2.right)} move, ${keyName(keys2.light)} ${keyName(keys2.medium)} ${keyName(keys2.heavy)} attack. A second controller plays P2. Remap both in Settings.` : state.fighters[0].pips === 3 ? `Relay ready — press ${keyName(keys.special)} for your Team Special.` : mode === 'guard' ? 'Throws beat guard. Crouch bolts. Air attacks beat low guard.' : 'Light → Medium → Finisher earns one charge.';
    requestAnimationFrame(tick);
}
updateControls();
$('start').setAttribute('disabled','');
$('start').textContent='Loading fighter sprites…';
ensurePoseAtlases(['highsproto','vela'],{pin:true}).then(()=>{$('start').removeAttribute('disabled');$('start').textContent='Resume →';selection.setReady(true);}).catch(error=>{const message='Fighter art could not load. Restart the local server and reload.';$('overlay-copy').textContent=message;selection.setReady(false,message);console.error(error);});
document.fonts.load('600 16px "Pixelify Sans"').then(()=>selection.refresh());
loadStagePreviews(STAGES.filter(stage=>!stage.parent).map(stage=>stage.id)).then(()=>selection.refresh()).catch(error=>console.warn('Stage preview uses local fallback.',error));
requestAnimationFrame(tick);
// Read-only snapshots and replay export for development. No debug meter injection.
Object.assign(window, { neonRelay: { snapshot: (): CombatState => structuredClone(state), presentationSnapshot: () => structuredClone(presentation), storySnapshot: story.snapshot, replay: () => ({ version: 2, fighter: chosen, mode, opponent, godMode:matchGodMode, frames: frames.map(f => [...f]) }), verifyReplay: () => {
            const replay = createState(chosen, mode, opponent);
            if(matchGodMode){replay.godMode=true;replay.fighters[0].pips=3;}
            for (const frame of frames)
                step(replay, frame);
            return JSON.stringify(replay) === JSON.stringify(state);
        } } });
