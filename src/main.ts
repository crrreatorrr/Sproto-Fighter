import { ensurePoseAtlases, getPoseAtlasLoadStatus } from './poseAtlas';
import { createSelectionMenu, type SelectionSetup } from './selectionMenu';
import './style.css';
import './arcadeSelection.css';
import './pixelUI.css';
import './mysticUI.css';
import { A, ROSTER, PLAYABLE_FIGHTERS, createState, cpuInput, step, type Action, type PlayableFighterId as FighterId, type Mode, type CombatState } from './core';
import { render } from './render';
import { ensurePowerArt } from './powerArt';
import { playRetainCallout } from './characterVoice';
import { createRoundPresentation, advanceRoundPresentation, beginRoundOutro, type RoundPresentation } from './animationEvents';
import { STAGES, setStage, loadStageArt, type StageId } from './stage';
import {storyProgress} from './storyProgress';
import { createStoryMode } from './storyMode';
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('game'), ctx = canvas.getContext('2d')!;
$('roster-count').textContent=`${PLAYABLE_FIGHTERS.length} FIGHTERS · ${STAGES.length} STAGES · UNLIMITED ROUND TIME`;
const defaults: Record<Action, string> = { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', light: 'KeyJ', medium: 'KeyK', heavy: 'KeyL', launcher: 'KeyU', bolt: 'KeyI', grab: 'KeyO', special: 'KeyP', dash: 'ShiftLeft' };
const padDefaults: Partial<Record<Action, number>> = { light: 0, medium: 2, heavy: 1, launcher: 3, bolt: 5, grab: 4, special: 7, dash: 6 };
const labels: Record<Action, string> = { left: 'Move left', right: 'Move right', up: 'Jump', down: 'Crouch', light: 'Light', medium: 'Medium', heavy: 'Finisher', launcher: 'Launcher', bolt: 'Ranged power', grab: 'Grab', special: 'Team special', dash: 'Dash' };
let keys = { ...defaults }, padKeys = { ...padDefaults };
try {
    const saved = JSON.parse(localStorage.getItem('neon-relay-controls') || 'null');
    if (saved) {
        for (const a of Object.keys(defaults) as Action[])
            if (typeof saved.keys?.[a] === 'string')
                keys[a] = saved.keys[a];
        for (const a of Object.keys(padDefaults) as Action[])
            if (Number.isInteger(saved.padKeys?.[a]))
                padKeys[a] = saved.padKeys[a];
        if ((saved.controlsVersion??0)<3 && ['Space','ArrowUp'].includes(keys.up) && !Object.entries(keys).some(([a,k]) => a !== 'up' && k === 'KeyW')) keys.up = 'KeyW';
    }
}
catch { /* Storage may be disabled. Defaults still work. */ }
let state = createState(), chosen: FighterId = 'rivet', mode: Mode = 'cpu', opponent: FighterId | undefined = 'vela', running = false, started = false, remapping: {
    action: Action;
    device: 'key' | 'pad';
} | null = null;
let matchGodMode=false, matchEarnedGodMode=false, testingGodMode=false, matchTesting=false;
let presentation = createRoundPresentation();
let modalDirection='',modalRepeatAt=0,padNeedsRelease=true;
let resumeAfterSettings = false, accumulator = 0, lastTime = 0, previousPad: number[] = [], previousStart = false;
const held = new Set<string>();
let queued = 0;
const frames: [
    number,
    number
][] = [];
const selection = createSelectionMenu({start:setup=>{void launchSelection(setup);},prepare:ensurePoseAtlases});
function updateStage(stage:StageId) {
    setStage(stage);
    const location=STAGES.find(s=>s.id===stage)!;
    $('stage-title').textContent=location.name.toUpperCase();
    $('stage-subtitle').textContent=stage==='ranch'?' / BONUS STAGE':' / '+location.theme.toUpperCase();
}
async function launchSelection(setup:SelectionSetup,isStory=false) {
    if(!storyProgress.isUnlocked(setup.fighter))return false;
    try{await Promise.all([ensurePoseAtlases(isStory&&setup.opponent==='vela'?[setup.fighter,'vela','vaudream']:[setup.fighter,setup.opponent]),[setup.fighter,setup.opponent].some(id=>['michael','sproto2531','sproto3106'].includes(id))?ensurePowerArt():Promise.resolve()]);}catch(error){selection.setReady(false,'Selected fighter art could not load. Choose again to retry.');console.error(error);return false;}
    matchEarnedGodMode=!isStory&&storyProgress.snapshot().completed&&!!setup.godMode;
    chosen=setup.fighter;opponent=setup.opponent;mode=isStory?'cpu':setup.mode;
    if(!isStory){story.leaveStory();freePlayMode=null;}
    updateStage(setup.stage);
    selection.setSetup({...setup,mode});selection.hide();$('fight-view').hidden=false;
    started=false;restart();start();
    $('mode-label').textContent=isStory?'STORY / WORLD '+STAGES.find(s=>s.id===setup.stage)!.chapter:mode==='cpu'?'CPU SPARRING':mode==='guard'?'GUARD PRACTICE':'COMBO PRACTICE';
    if(isStory&&setup.opponent==='vaudream')$('mode-label').textContent+=' / FINAL GAUNTLET / HEALTH REFILLED';
    updateGodModeLabel();
    return true;
}
function returnToSelection() {
    story.leaveStory();
    running=false;started=false;held.clear();queued=0;accumulator=0;qaSingleStep=false;
    resumeAfterSettings=false;resumeAfterJourney=false;
    $('fight-view').hidden=true;$('overlay').hidden=true;
    selection.show();
}
$('back-select').onclick=returnToSelection;$('overlay-select').onclick=returnToSelection;
function keyName(code: string) { return code.replace('Key', '').replace('Digit', '').replace('Arrow', '').replace('Left', '').replace('Right', ''); }
function save() {
    try {
        localStorage.setItem('neon-relay-controls', JSON.stringify({ controlsVersion: 3, keys, padKeys }));
    }
    catch { /* Nonpersistent mode. */ }
}
function updateControls() {
    $('directional-help').textContent = `${keyName(keys.up)} + ${keyName(keys.light)}: Rising strike · ${keyName(keys.up)} + forward + ${keyName(keys.medium)}: Diagonal · ${keyName(keys.down)} + ${keyName(keys.medium)}/${keyName(keys.heavy)}: Low / dive · ${keyName(keys.bolt)}: Horizontal spit (${keyName(keys.down)}: crouch low / ${keyName(keys.up)}: jump high) / aim other powers · ${keyName(keys.dash)} after hit: Dash cancel`;

    $('controls-strip').innerHTML = `<span class="control"><kbd>${keyName(keys.left)} ${keyName(keys.right)}</kbd> Move / block</span>` + (['up', 'down', 'light', 'medium', 'heavy', 'launcher', 'bolt', 'grab', 'special', 'dash'] as Action[]).map(a => `<span class="control"><kbd>${keyName(keys[a])}</kbd>${labels[a]}</span>`).join('');
    document.querySelectorAll<HTMLElement>('[data-key]').forEach(el => el.textContent = keyName(keys[el.dataset.key as Action]));
    $('bindings').innerHTML = Object.entries(labels).map(([a, label]) => `<div class="binding-row ${remapping?.action === a ? 'pending' : ''}"><span>${label}</span><button class="quiet" data-map="${a}" data-device="key">${remapping?.action === a && remapping.device === 'key' ? 'Press a key…' : keyName(keys[a as Action])}</button>${a in padDefaults ? `<button class="quiet" data-map="${a}" data-device="pad">${remapping?.action === a && remapping.device === 'pad' ? 'Press a button…' : 'Pad ' + padKeys[a as Action]}</button>` : '<span class="micro">D-pad / left stick</span>'}</div>`).join('');
    document.querySelectorAll<HTMLButtonElement>('[data-map]').forEach(b => b.onclick = () => { remapping = { action: b.dataset.map as Action, device: b.dataset.device as 'key' | 'pad' }; $('binding-status').textContent = 'Escape cancels. Existing bindings are swapped.'; updateControls(); });
}
function bind(value: string | number) {
    if (!remapping)
        return;
    const { action, device } = remapping;
    if (device === 'key') {
        const old = keys[action], other = (Object.keys(keys) as Action[]).find(a => keys[a] === value);
        if (other)
            keys[other] = old;
        keys[action] = String(value);
    }
    else {
        const old = padKeys[action], other = (Object.keys(padKeys) as Action[]).find(a => padKeys[a] === value);
        if (other)
            padKeys[other] = old;
        padKeys[action] = Number(value);
    }
    remapping = null;
    held.clear();
    queued = 0;
    save();
    updateControls();
    $('binding-status').textContent = 'Saved on this browser.';
}
function showOverlay(title: string, copy: string, button: string, kicker = 'COMBAT LAB / PAUSED') { running = false; held.clear(); queued = 0; $('overlay').hidden = false; $('overlay-title').textContent = title; $('overlay-copy').textContent = copy; $('start').textContent = button; $('overlay-kicker').textContent = kicker; if(!selection.isOpen)$('start').focus(); }
function start() {
    if (selection.isOpen || story.isOpen || dialog.open || ($('start') as HTMLButtonElement).disabled) return;
    if (presentation.phase === 'result')
        restart();
    started = true;
    running = true;
    padNeedsRelease = true;
    accumulator = 0;
    held.clear();
    queued = 0;
    $('overlay').hidden = true;
    $('pause').innerHTML = 'Pause <kbd>Esc</kbd>';
    canvas.focus();
}
function pause() {
    if (!started || presentation.phase === 'result')
        return;
    if (running)
        showOverlay('Take a breath.', 'Your round is paused. Resume when you’re ready.', 'Resume →');
    else
        start();
}
function restart() {
    matchTesting=testingGodMode;matchGodMode=testingGodMode||matchEarnedGodMode;
    state = createState(chosen, mode, opponent);
    if(matchGodMode){state.godMode=true;state.fighters[0].pips=3;}
    presentation = createRoundPresentation();
    frames.length = 0;
    qaEvents.length = 0;
    accumulator = 0;
    held.clear();
    queued = 0;
    updateGodModeLabel();
    if (started)
        start();
}
function updateGodModeLabel(){
    const label=$('mode-label');label.textContent=(label.textContent??'').replace(/ \/ GOD MODE(?: TEST)?$/,'')+(matchTesting?' / GOD MODE TEST':matchGodMode?' / GOD MODE':'');
}
function setTestingGodMode(enabled:boolean){
    testingGodMode=enabled;
    if(started&&!selection.isOpen){if(!story.retryMatch())restart();}
}
let resumeAfterJourney = false, freePlayMode: Mode | null = null;
const story = createStoryMode({
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
$('start').onclick = start;
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
    queued = 0;
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
$('defaults').onclick = () => { keys = { ...defaults }; padKeys = { ...padDefaults }; remapping = null; save(); updateControls(); };
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
    if (Object.values(keys).includes(e.code)) {
        e.preventDefault();
        if (!held.has(e.code)) {
            for (const a of Object.keys(A) as Action[])
                if (keys[a] === e.code)
                    queued |= A[a];
        }
        held.add(e.code);
    }
});
window.addEventListener('keyup', e => held.delete(e.code));
window.addEventListener('blur', () => {
    held.clear();
    queued = 0;
    if (running)
        pause();
});
document.addEventListener('visibilitychange', () => {
    if (document.hidden && running)
        pause();
});
canvas.addEventListener('pointerdown', () => canvas.focus());
function pollPad(): number {
    const pads = navigator.getGamepads?.() || [];
    const pad = Array.from(pads).find(p => p?.connected);
    const wasSelection=selection.isOpen,wasModal=story.isOpen||dialog.open,wasOverlay=!running&&!selection.isOpen;
    selection.pollPad(pad??null);
    if (!pad) {
        $('device').textContent = 'KEYBOARD READY';
        previousPad = [];
        return 0;
    }
    $('device').textContent = 'CONTROLLER CONNECTED';
    const buttons = pad.buttons.map(b => b.pressed ? 1 : 0);
    let boundPadThisFrame=false;
    if (remapping?.device === 'pad') {
        const index = buttons.findIndex((b, i) => b && !previousPad[i]);
        if (index >= 0 && index !== 9){bind(index);boundPadThisFrame=true;}
    }
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
let qaFrozen=false,qaSingleStep=false;
let qaStopAtOutro=()=>{};
const qaEvents:string[]=[];
if(qaPanel){
    const bar=document.createElement('div');bar.style.cssText='display:flex;gap:8px;padding:12px';
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
function advanceRoundFrame(input: number) {
    if (presentation.phase === 'intro') {
        advanceRoundPresentation(presentation, input !== 0);
        if ((presentation as RoundPresentation).phase !== 'fight') return;
        // A skip preserves this exact input for the first combat step.
    }
    if (presentation.phase === 'outro') {
        advanceRoundPresentation(presentation);
        if ((presentation as RoundPresentation).phase !== 'result') return;
        if (story.onRoundEnd(state.winner!)) return;
        const won = state.winner === 0;
        showOverlay(state.winner === 2 ? 'Double knockout.' : won ? 'You found your flow.' : 'Run it back.', `Best combo: ${state.fighters[0].best} hits. ${won ? 'Keep exploring your routes.' : 'Use away to block, and punish the recovery.'}`, 'Fight again →', 'ROUND COMPLETE');
        return;
    }
    if (presentation.phase !== 'fight') return;
    const pair: [number, number] = [input, cpuInput(state)];
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
        held.clear(); queued = 0;
    }
}
function tick(now: number) {
    const elapsed = Math.min((now - lastTime) / 1000, .1);
    lastTime = now;
    const pad = pollPad();
    if (running && !selection.isOpen && !dialog.open && !story.isOpen && (!qaFrozen||qaSingleStep)) {
        accumulator = qaSingleStep?1/60:accumulator+elapsed;
        qaSingleStep=false;
        while (accumulator >= 1 / 60) {
            let input = pad | queued;
            queued = 0;
            for (const a of Object.keys(A) as Action[])
                if (held.has(keys[a]))
                    input |= A[a];
            accumulator -= 1 / 60;
            advanceRoundFrame(input);
            if (!running || presentation.phase === 'result') break;
        }
    }
    if(!selection.isOpen) render(ctx, state, presentation);
    if(qaPanel)qaPanel.textContent=`MANUAL QA · frame ${state.frame} · ${qaFrozen?'QA frozen':running?'running':'paused'}\n`+state.fighters.map((f,i)=>`P${i+1} ${f.id}: x=${f.x.toFixed(1)} y=${f.y.toFixed(1)} vx=${f.vx.toFixed(2)} vy=${f.vy.toFixed(2)} ${f.move?.id??'neutral'} t=${f.move?.t??0} input=${f.input} hp=${f.hp} combo=${f.combo} best=${f.best} pips=${f.pips} reaction=${f.reaction?.kind??'-'}/${f.reaction?.phase??'-'}:${f.reaction?.t??0}`).join('\n')+'\nPresentation: '+JSON.stringify(presentation)+'\nReplay frames: '+frames.length+'\nThrow: '+JSON.stringify(state.throwState)+'\nProjectiles: '+state.projectiles.map(p=>`${p.shape} x=${p.x.toFixed(1)} y=${p.y.toFixed(1)} vx=${p.vx.toFixed(2)} vy=${p.vy.toFixed(2)}`).join('; ')+'\n'+qaEvents.join('\n');
    $('coach').textContent = state.fighters[0].pips === 3 ? `Relay ready — press ${keyName(keys.special)} for your Team Special.` : mode === 'guard' ? 'Throws beat guard. Crouch bolts. Air attacks beat low guard.' : 'Light → Medium → Finisher earns one charge.';
    requestAnimationFrame(tick);
}
updateControls();
$('start').setAttribute('disabled','');
$('start').textContent='Loading fighter sprites…';
ensurePoseAtlases(['rivet','vela']).then(()=>{$('start').removeAttribute('disabled');$('start').textContent='Resume →';selection.setReady(true);}).catch(error=>{const message='Fighter art could not load. Restart the local server and reload.';$('overlay-copy').textContent=message;selection.setReady(false,message);console.error(error);});
document.fonts.load('600 16px "Pixelify Sans"').then(()=>selection.refresh());
loadStageArt().then(()=>selection.refresh()).catch(error=>console.warn('Stage preview uses local fallback.',error));
requestAnimationFrame(tick);
// Read-only snapshots and replay export for development. No debug meter injection.
Object.assign(window, { neonRelay: { snapshot: (): CombatState => structuredClone(state), presentationSnapshot: () => structuredClone(presentation), storySnapshot: story.snapshot, replay: () => ({ version: 2, fighter: chosen, mode, opponent, godMode:matchGodMode, frames: frames.map(f => [...f]) }), verifyReplay: () => {
            const replay = createState(chosen, mode, opponent);
            if(matchGodMode){replay.godMode=true;replay.fighters[0].pips=3;}
            for (const frame of frames)
                step(replay, frame);
            return JSON.stringify(replay) === JSON.stringify(state);
        } } });
