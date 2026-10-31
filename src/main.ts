import {drawDumpstarPortrait} from './dumpstarArt';
import { drawBrontPortrait } from './brontArt';
import { drawZephyrPortrait } from './zephyrArt';
import { drawMoxPortrait } from './moxArt';
import { drawRunePortrait } from './runeArt';
import { drawPlaceholderPortrait } from './placeholderArt';
import { drawVelaPortrait } from './velaArt';
import { drawRivetPortrait } from './fighterArt';
import './style.css';
import { A, ROSTER, PLAYABLE_FIGHTERS, createState, cpuInput, step, type Action, type PlayableFighterId as FighterId, type Mode, type CombatState } from './core';
import { render } from './render';
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('game'), ctx = canvas.getContext('2d')!;
const defaults: Record<Action, string> = { left: 'KeyA', right: 'KeyD', up: 'Space', down: 'KeyS', light: 'KeyJ', medium: 'KeyK', heavy: 'KeyL', launcher: 'KeyU', bolt: 'KeyI', grab: 'KeyO', special: 'KeyP', dash: 'ShiftLeft' };
const padDefaults: Partial<Record<Action, number>> = { light: 0, medium: 2, heavy: 1, launcher: 3, bolt: 5, grab: 4, special: 7, dash: 6 };
const labels: Record<Action, string> = { left: 'Move left', right: 'Move right', up: 'Jump', down: 'Crouch', light: 'Light', medium: 'Medium', heavy: 'Finisher', launcher: 'Launcher', bolt: 'Bolt', grab: 'Grab', special: 'Team special', dash: 'Dash' };
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
        localStorage.setItem('neon-relay-controls', JSON.stringify({ keys, padKeys }));
    }
    catch { /* Nonpersistent mode. */ }
}
function updateControls() {
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
    accumulator = 0;
    held.clear();
    queued = 0;
    if (started)
        start();
}
$('start').onclick = start;
$('pause').onclick = pause;
$('reset').onclick = restart;
$('mode').onchange = () => { mode = ($('mode') as HTMLSelectElement).value as Mode; $('mode-label').textContent = mode === 'cpu' ? 'CPU SPARRING' : mode === 'guard' ? 'GUARD PRACTICE' : 'COMBO PRACTICE'; restart(); };
const fighterOptions = document.querySelector('.fighter-options')!;
$('roster-count').textContent = `${PLAYABLE_FIGHTERS.length} PLAYABLE / ${PLAYABLE_FIGHTERS.filter(id=>!id.startsWith('guest')).length} SPRITE SETS`;
fighterOptions.innerHTML = PLAYABLE_FIGHTERS.map(id => `<button data-fighter="${id}" class="fighter ${id === chosen ? 'selected' : ''}"><canvas id="${id}-portrait" class="portrait" width="96" height="112" aria-label="${ROSTER[id].name} portrait"></canvas><span><b>${ROSTER[id].name}</b><small>${id.startsWith('guest') ? 'PLACEHOLDER ART' : ROSTER[id].role}</small></span><span class="selection-dot"></span></button>`).join('');
($('opponent') as HTMLSelectElement).innerHTML = '<option value="">Auto matchup</option>' + PLAYABLE_FIGHTERS.map(id => `<option value="${id}">${ROSTER[id].name}${id.startsWith('guest') ? ' · placeholder' : ''}</option>`).join('');
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
    if (menu && !previousStart && !dialog.open) {
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
function tick(now: number) {
    const elapsed = Math.min((now - lastTime) / 1000, .1);
    lastTime = now;
    const pad = pollPad();
    if (running) {
        accumulator += elapsed;
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
            step(state, pair);
            accumulator -= 1 / 60;
            if (state.winner !== null) {
                const won = state.winner === 0;
                showOverlay(state.winner === 2 ? 'Double knockout.' : won ? 'You found your flow.' : 'Run it back.', `Best combo: ${state.fighters[0].best} hits. ${won ? 'Keep exploring your routes.' : 'Use away to block, and punish the recovery.'}`, 'Fight again →', 'ROUND COMPLETE');
                break;
            }
        }
    }
    render(ctx, state);
    $('coach').textContent = state.fighters[0].pips === 3 ? `Relay ready — press ${keyName(keys.special)} for your Team Special.` : mode === 'guard' ? 'Throws beat guard. Crouch bolts. Air attacks beat low guard.' : 'Light → Medium → Finisher earns one charge.';
    requestAnimationFrame(tick);
}
const portrait = $<HTMLCanvasElement>('rivet-portrait');
drawRivetPortrait(portrait.getContext('2d')!, portrait.width, portrait.height);
const velaPortrait = $<HTMLCanvasElement>('vela-portrait');
drawVelaPortrait(velaPortrait.getContext('2d')!, velaPortrait.width, velaPortrait.height);
for (const [id, draw] of [['bront', drawBrontPortrait], ['zephyr', drawZephyrPortrait], ['mox', drawMoxPortrait], ['rune', drawRunePortrait],['dumpstar',drawDumpstarPortrait]] as const) {
    const c = $<HTMLCanvasElement>(id + '-portrait');
    draw(c.getContext('2d')!, c.width, c.height);
}
for (const id of PLAYABLE_FIGHTERS.filter(id => id.startsWith('guest'))) {
    const c = $<HTMLCanvasElement>(id + '-portrait');
    drawPlaceholderPortrait(c.getContext('2d')!, c.width, c.height, id.slice(-2), ROSTER[id].color);
}
updateControls();
requestAnimationFrame(tick);
// Read-only snapshots and replay export for development. No debug meter injection.
Object.assign(window, { neonRelay: { snapshot: (): CombatState => structuredClone(state), replay: () => ({ version: 1, fighter: chosen, mode, opponent, frames: frames.map(f => [...f]) }), verifyReplay: () => {
            const replay = createState(chosen, mode, opponent);
            for (const frame of frames)
                step(replay, frame);
            return JSON.stringify(replay) === JSON.stringify(state);
        } } });
