import { loadPoseAtlases, getPoseAtlasLoadStatus } from './poseAtlas';
import { loadHiggsfieldRigs } from './higgsfieldRig';
import { originalPortraits } from './originalPortraits';
import './style.css';
import { A, ROSTER, PLAYABLE_FIGHTERS, createState, cpuInput, step, type Action, type PlayableFighterId as FighterId, type Mode, type CombatState } from './core';
import { render } from './render';
import { STAGES, setStage } from './stage';
import { createStoryMode } from './storyMode';
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('game'), ctx = canvas.getContext('2d')!;
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
let state = createState(), chosen: FighterId = 'rivet', mode: Mode = 'cpu', opponent: FighterId | undefined = undefined, running = false, started = false, remapping: {
    action: Action;
    device: 'key' | 'pad';
} | null = null;
let resumeAfterSettings = false, accumulator = 0, lastTime = 0, previousPad: number[] = [], previousStart = false;
const held = new Set<string>();
let queued = 0;
const frames: [
    number,
    number
][] = [];
function keyName(code: string) { return code.replace('Key', '').replace('Digit', '').replace('Arrow', '').replace('Left', '').replace('Right', ''); }
function save() {
    try {
        localStorage.setItem('neon-relay-controls', JSON.stringify({ controlsVersion: 3, keys, padKeys }));
    }
    catch { /* Nonpersistent mode. */ }
}
function updateControls() {
    $('directional-help').textContent = `${keyName(keys.up)} + ${keyName(keys.light)}: Rising strike · ${keyName(keys.up)} + forward + ${keyName(keys.medium)}: Diagonal · ${keyName(keys.down)} + ${keyName(keys.medium)}/${keyName(keys.heavy)}: Low / dive · ${keyName(keys.bolt)}: Horizontal spit / aim other powers · ${keyName(keys.dash)} after hit: Dash cancel`;

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
function showOverlay(title: string, copy: string, button: string, kicker = 'COMBAT LAB / PAUSED') { running = false; held.clear(); queued = 0; $('overlay').hidden = false; $('overlay-title').textContent = title; $('overlay-copy').textContent = copy; $('start').textContent = button; $('overlay-kicker').textContent = kicker; }
function start() {
    if (story.isOpen || ($('start') as HTMLButtonElement).disabled) return;
    if (state.winner !== null)
        restart();
    started = true;
    running = true;
    accumulator = 0;
    held.clear();
    queued = 0;
    $('overlay').hidden = true;
    $('pause').innerHTML = 'Pause <kbd>Esc</kbd>';
    canvas.focus();
}
function pause() {
    if (!started || state.winner !== null)
        return;
    if (running)
        showOverlay('Take a breath.', 'Your round is paused. Resume when you’re ready.', 'Resume →');
    else
        start();
}
function restart() {
    state = createState(chosen, mode, opponent);
    frames.length = 0;
    qaEvents.length = 0;
    accumulator = 0;
    held.clear();
    queued = 0;
    if (started)
        start();
}
let resumeAfterJourney = false, freePlayMode: Mode | null = null;
const story = createStoryMode({
    ready: () => !($('start') as HTMLButtonElement).disabled,
    pause: () => { resumeAfterJourney = running; showOverlay('Choose your next destination.', 'Your current round is paused while you browse worlds and levels.', 'Resume →'); },
    resume: () => { if (resumeAfterJourney && started && state.winner === null) start(); },
    launch: (stage, isStory) => {
        setStage(stage);
        const location = STAGES.find(s => s.id === stage)!;
        $('stage-title').textContent = location.name.toUpperCase();
        $('stage-subtitle').textContent = stage === 'ranch' ? '/ BONUS STAGE / ORIGINAL RANCH' : '/ PLACEHOLDER STAGE / ' + location.theme.toUpperCase();
        if (isStory) { freePlayMode ??= mode; mode = 'cpu'; }
        else if (freePlayMode !== null) { mode = freePlayMode; freePlayMode = null; }
        ($('mode') as HTMLSelectElement).value = mode;
        $('mode-label').textContent = isStory ? 'STORY / WORLD ' + location.chapter : mode === 'cpu' ? 'CPU SPARRING' : mode === 'guard' ? 'GUARD PRACTICE' : 'COMBO PRACTICE';
        restart(); start();
    },
});
$('start').onclick = start;
$('pause').onclick = pause;
$('reset').onclick = restart;
$('mode').onchange = () => { story.leaveStory(); freePlayMode = null; mode = ($('mode') as HTMLSelectElement).value as Mode; $('mode-label').textContent = mode === 'cpu' ? 'CPU SPARRING' : mode === 'guard' ? 'GUARD PRACTICE' : 'COMBO PRACTICE'; restart(); };
const fighterOptions = document.querySelector('.fighter-options')!;
$('roster-count').textContent = `${PLAYABLE_FIGHTERS.length} PLAYABLE / ${PLAYABLE_FIGHTERS.length} SPRITE SETS`;
fighterOptions.innerHTML = PLAYABLE_FIGHTERS.map(id => `<button data-fighter="${id}" class="fighter ${id === chosen ? 'selected' : ''}"><img id="${id}-portrait" class="portrait" src="${originalPortraits[id]}" alt="${ROSTER[id].name} original reference" width="96" height="112"/><span><b>${ROSTER[id].name}</b><small>${ROSTER[id].role}</small></span><span class="selection-dot"></span></button>`).join('');
($('opponent') as HTMLSelectElement).innerHTML = '<option value="">Auto matchup</option>' + PLAYABLE_FIGHTERS.map(id => `<option value="${id}">${ROSTER[id].name}</option>`).join('');
document.querySelectorAll<HTMLButtonElement>('[data-fighter]').forEach(b => b.onclick = () => { chosen = b.dataset.fighter as FighterId; document.querySelectorAll('[data-fighter]').forEach(el => el.classList.toggle('selected', el === b)); $('fighter-copy').textContent = ROSTER[chosen].description; restart(); });
$('opponent').onchange = () => { opponent = ($('opponent') as HTMLSelectElement).value as FighterId || undefined; restart(); };
const dialog = $<HTMLDialogElement>('controls-dialog');
$('settings').onclick = () => {
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
    if (!pad) {
        $('device').textContent = 'KEYBOARD READY';
        previousPad = [];
        return 0;
    }
    $('device').textContent = 'CONTROLLER CONNECTED';
    const buttons = pad.buttons.map(b => b.pressed ? 1 : 0);
    if (remapping?.device === 'pad') {
        const index = buttons.findIndex((b, i) => b && !previousPad[i]);
        if (index >= 0 && index !== 9)
            bind(index);
    }
    const menu = !!buttons[9];
    if (menu && !previousStart && !dialog.open && !story.isOpen) {
        if (!started || state.winner !== null)
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
const qaEvents:string[]=[];
if(qaPanel){
    const bar=document.createElement('div');bar.style.cssText='display:flex;gap:8px;padding:12px';
    const freeze=document.createElement('button'),single=document.createElement('button');
    freeze.textContent='Freeze QA frame';single.textContent='Advance QA frame';
    freeze.onclick=()=>{qaFrozen=!qaFrozen;freeze.textContent=qaFrozen?'Resume QA playback':'Freeze QA frame';accumulator=0;};
    single.onclick=()=>{qaFrozen=true;qaSingleStep=true;freeze.textContent='Resume QA playback';};
    bar.append(freeze,single);document.querySelector('#app')!.append(bar);
    qaPanel.id='qa-status';qaPanel.style.cssText='white-space:pre-wrap;color:#dceafa;background:#13202d;padding:16px;font:12px monospace';document.querySelector('#app')!.append(qaPanel);}
function qaRecord(before:string){
    if(!qaPanel)return;
    const f=state.fighters[0],after=[f.move?.id,f.combo,f.pips,f.hp,state.fighters[1].hp,state.throwState?.phase,state.fighters[1].reaction?.phase].join('|');
    if(before!==after){qaEvents.push(`f${state.frame}: ${f.move?.id??'neutral'} ${f.move?.aim??''} hits=${f.combo} pips=${f.pips} hp=${f.hp}/${state.fighters[1].hp} x=${Math.round(f.x)} y=${Math.round(f.y)} input=${f.input} throw=${state.throwState?.direction??'-'}/${state.throwState?.phase??'-'} reaction2=${state.fighters[1].reaction?.kind??'-'}/${state.fighters[1].reaction?.phase??'-'}`);if(qaEvents.length>48)qaEvents.shift();}
}
function tick(now: number) {
    const elapsed = Math.min((now - lastTime) / 1000, .1);
    lastTime = now;
    const pad = pollPad();
    if (running && (!qaFrozen||qaSingleStep)) {
        accumulator = qaSingleStep?1/60:accumulator+elapsed;
        qaSingleStep=false;
        while (accumulator >= 1 / 60) {
            let input = pad | queued;
            queued = 0;
            for (const a of Object.keys(A) as Action[])
                if (held.has(keys[a]))
                    input |= A[a];
            const pair: [
                number,
                number
            ] = [input, cpuInput(state)];
            frames.push(pair);
            const qaBefore=qaPanel?[state.fighters[0].move?.id,state.fighters[0].combo,state.fighters[0].pips,state.fighters[0].hp,state.fighters[1].hp,state.throwState?.phase,state.fighters[1].reaction?.phase].join('|'):'';
            step(state, pair);
            qaRecord(qaBefore);
            accumulator -= 1 / 60;
            if (state.winner !== null) {
                if (story.onRoundEnd(state.winner)) break;
                const won = state.winner === 0;
                showOverlay(state.winner === 2 ? (state.clock <= 0 ? 'Time up — draw.' : 'Double knockout.') : won ? 'You found your flow.' : 'Run it back.', `Best combo: ${state.fighters[0].best} hits. ${won ? 'Keep exploring your routes.' : 'Use away to block, and punish the recovery.'}`, 'Fight again →', 'ROUND COMPLETE');
                break;
            }
        }
    }
    render(ctx, state);
    if(qaPanel)qaPanel.textContent=`MANUAL QA · frame ${state.frame} · ${qaFrozen?'QA frozen':running?'running':'paused'}\n`+state.fighters.map((f,i)=>`P${i+1} ${f.id}: x=${f.x.toFixed(1)} y=${f.y.toFixed(1)} vx=${f.vx.toFixed(2)} vy=${f.vy.toFixed(2)} ${f.move?.id??'neutral'} t=${f.move?.t??0} input=${f.input} hp=${f.hp} combo=${f.combo} best=${f.best} pips=${f.pips} reaction=${f.reaction?.kind??'-'}/${f.reaction?.phase??'-'}:${f.reaction?.t??0}`).join('\n')+'\nThrow: '+JSON.stringify(state.throwState)+'\nProjectiles: '+state.projectiles.map(p=>`${p.shape} x=${p.x.toFixed(1)} y=${p.y.toFixed(1)} vx=${p.vx.toFixed(2)} vy=${p.vy.toFixed(2)}`).join('; ')+'\n'+qaEvents.join('\n');
    $('coach').textContent = state.fighters[0].pips === 3 ? `Relay ready — press ${keyName(keys.special)} for your Team Special.` : mode === 'guard' ? 'Throws beat guard. Crouch bolts. Air attacks beat low guard.' : 'Light → Medium → Finisher earns one charge.';
    requestAnimationFrame(tick);
}
updateControls();
$('start').setAttribute('disabled','');
$('start').textContent='Loading fighter sprites…';
loadPoseAtlases().then(()=>{const installed=getPoseAtlasLoadStatus().ids;return PLAYABLE_FIGHTERS.some(id=>!installed.includes(id))?loadHiggsfieldRigs():undefined;}).then(()=>{$('start').removeAttribute('disabled');$('start').textContent='Enter the arena →';}).catch(error=>{$('overlay-copy').textContent='Fighter art could not load. Restart the local server and reload.';console.error(error);});
requestAnimationFrame(tick);
// Read-only snapshots and replay export for development. No debug meter injection.
Object.assign(window, { neonRelay: { snapshot: (): CombatState => structuredClone(state), storySnapshot: story.snapshot, replay: () => ({ version: 1, fighter: chosen, mode, opponent, frames: frames.map(f => [...f]) }), verifyReplay: () => {
            const replay = createState(chosen, mode, opponent);
            for (const frame of frames)
                step(replay, frame);
            return JSON.stringify(replay) === JSON.stringify(state);
        } } });
