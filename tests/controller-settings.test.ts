import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { A, type Action } from '../src/core';
import { CONTROLS_KEY, CONTROLS_VERSION, FIXED_CONTROLS, LEGACY_CONTROLS_KEY, loadControls, saveControls } from '../src/controlsStorage';
import { LEFT_STICK_DEADZONE, MAX_STICK_DEADZONE, MIN_STICK_DEADZONE, PAD, PadInput, clampDeadzone, padView, stickAxes } from '../src/gamepad';
import { FEEDBACK_KEY, P2_KEYS, PAD_DEFAULTS, UNBOUND, padMask } from '../src/localInput';
import { bindFullscreenButtons, escapeLeavesFullscreenOnly, fullscreenLabel, fullscreenSupported, toggleFullscreen, type FullscreenDocument } from '../src/fullscreen';

const KEYS: Record<Action, string> = { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', light: 'KeyJ', medium: 'KeyK', heavy: 'KeyL', launcher: 'KeyU', bolt: 'KeyI', grab: 'KeyO', special: 'KeyP', dash: 'ShiftLeft' };
const defaults = () => ({ keys: { ...KEYS }, padKeys: { ...PAD_DEFAULTS }, keys2: { ...P2_KEYS }, padKeys2: { ...PAD_DEFAULTS } });
function memoryStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return { data, getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); }, removeItem: (k: string) => { data.delete(k); } };
}

describe('controller settings storage', () => {
  it('uses the defaults and the default dead zone when nothing is saved or storage is unavailable', () => {
    for (const store of [memoryStore(), null]) {
      const loaded = loadControls(store, defaults());
      expect(loaded.keys).toEqual(KEYS);
      expect(loaded.keys2).toEqual(P2_KEYS);
      expect(loaded.padKeys).toEqual(PAD_DEFAULTS);
      expect(loaded.stickDeadzone).toBe(LEFT_STICK_DEADZONE);
    }
  });

  it('round-trips both players, both devices and the dead zone under its own key', () => {
    const store = memoryStore({ [LEGACY_CONTROLS_KEY]: '{}' });
    const controls = { ...defaults(), stickDeadzone: .35 };
    controls.keys.light = 'KeyH'; controls.padKeys.light = PAD.rb; controls.padKeys.bolt = PAD.x; controls.keys2.heavy = 'KeyM'; controls.padKeys2.dash = PAD.lb;
    expect(saveControls(store, controls)).toBe(true);
    expect(store.data.has(LEGACY_CONTROLS_KEY)).toBe(false);
    const raw = JSON.parse(store.data.get(CONTROLS_KEY)!);
    expect(raw.controlsVersion).toBe(CONTROLS_VERSION);
    expect(raw.stickDeadzone).toBe(.35);
    expect(loadControls(store, defaults())).toEqual(controls);
  });

  it('keeps reading saves from before the dead zone and from the old storage key', () => {
    const legacy = memoryStore({ [LEGACY_CONTROLS_KEY]: JSON.stringify({ controlsVersion: 4, keys: { light: 'KeyH' }, padKeys: { light: 5 } }) });
    const loaded = loadControls(legacy, defaults());
    expect(loaded.keys.light).toBe('KeyH');
    expect(loaded.padKeys.light).toBe(5);
    expect(loaded.stickDeadzone).toBe(LEFT_STICK_DEADZONE);
  });

  it('applies the old fixes: jump moves to W before version 3, N is never bound, player 1 wins key conflicts', () => {
    const old = loadControls(memoryStore({ [CONTROLS_KEY]: JSON.stringify({ controlsVersion: 2, keys: { up: 'Space' } }) }), defaults());
    expect(old.keys.up).toBe('KeyW');
    const store = memoryStore({ [CONTROLS_KEY]: JSON.stringify({ controlsVersion: 4, keys: { light: FEEDBACK_KEY, medium: 'Comma' }, keys2: { grab: FEEDBACK_KEY } }) });
    const loaded = loadControls(store, defaults());
    expect(loaded.keys.light).toBe('KeyJ');
    expect(loaded.keys.medium).toBe('Comma');
    expect(loaded.keys2.light).toBe(UNBOUND);
    expect(loaded.keys2.grab).toBe(UNBOUND);
  });

  it('ignores unreadable saves, wrong types and out-of-range dead zones; storage errors never throw', () => {
    expect(loadControls(memoryStore({ [CONTROLS_KEY]: '{not json' }), defaults()).keys).toEqual(KEYS);
    const odd = loadControls(memoryStore({ [CONTROLS_KEY]: JSON.stringify({ keys: { light: 7 }, padKeys: { light: 'A' }, stickDeadzone: 4 }) }), defaults());
    expect(odd.keys.light).toBe('KeyJ');
    expect(odd.padKeys.light).toBe(PAD_DEFAULTS.light);
    expect(odd.stickDeadzone).toBe(MAX_STICK_DEADZONE);
    const throwing = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); }, removeItem: () => undefined };
    expect(loadControls(throwing, defaults()).keys).toEqual(KEYS);
    expect(saveControls(throwing, { ...defaults(), stickDeadzone: .2 })).toBe(false);
    expect(saveControls(null, { ...defaults(), stickDeadzone: .2 })).toBe(false);
  });

  it('lists every fixed key and button beside the remappable actions', () => {
    const text = FIXED_CONTROLS.map(row => `${row.action} ${row.keyboard} ${row.controller}`).join('\n');
    for (const needle of ['Pause', 'Escape', 'Start', 'N twice', 'Enter', 'confirm', 'back', 'D-pad', 'X', 'C / V / X / R']) expect(text).toContain(needle);
  });
});

describe('left-stick dead zone', () => {
  it('clamps the choice to its range', () => {
    expect(clampDeadzone(0)).toBe(MIN_STICK_DEADZONE);
    expect(clampDeadzone(.9)).toBe(MAX_STICK_DEADZONE);
    expect(clampDeadzone(.333)).toBe(.33);
    expect(clampDeadzone(Number.NaN)).toBe(LEFT_STICK_DEADZONE);
  });

  it('reads exactly as before at the default dead zone', () => {
    for (const [x, y] of [[.15, -.1], [.35, 0], [-.7, .7], [1, 1], [0, -.6]] as const)
      expect(padView([x, y, .5], [], LEFT_STICK_DEADZONE).axes).toEqual(padView([x, y, .5], []).axes);
    expect(stickAxes(.35, 0)).toEqual([.35, 0]);
    expect(stickAxes(.15, -.1)).toEqual([0, 0]);
  });

  it('a larger dead zone needs a longer push and a smaller one a shorter push, through the same fight thresholds', () => {
    const walk = (x: number, deadzone: number) => padMask({ axes: stickAxes(x, 0, deadzone), buttons: [] }, {}) & A.right;
    expect(walk(.35, LEFT_STICK_DEADZONE)).toBe(A.right);
    expect(walk(.35, .4)).toBe(0);
    expect(walk(.6, .4)).toBe(A.right);
    expect(walk(.25, LEFT_STICK_DEADZONE)).toBe(0);
    expect(walk(.25, .1)).toBe(A.right);
    expect(stickAxes(.05, 0, .1)).toEqual([0, 0]);
  });

  it('PadInput applies the dead zone from the next poll', () => {
    const input = new PadInput();
    const pads = [{ connected: true, axes: [.35, 0], buttons: [] }];
    expect(input.poll(pads, true).p1!.axes[0]).toBe(.35);
    input.deadzone = .4;
    expect(input.poll(pads, true).p1!.axes[0]).toBe(0);
  });
});

function fakeDocument(enabled = true) {
  const listeners: (() => void)[] = [];
  const doc = {
    fullscreenEnabled: enabled,
    fullscreenElement: null as Element | null,
    documentElement: { requestFullscreen: vi.fn(async () => { doc.fullscreenElement = {} as Element; listeners.forEach(fn => fn()); }) },
    exitFullscreen: vi.fn(async () => { doc.fullscreenElement = null; listeners.forEach(fn => fn()); }),
    addEventListener: (_type: 'fullscreenchange', fn: () => void) => { listeners.push(fn); },
  };
  return doc;
}

describe('full screen option', () => {
  it('requests full screen, then leaves it, and labels the state', async () => {
    const doc = fakeDocument();
    const button = { hidden: false, textContent: '', dataset: {} as Record<string, string>, onclick: null as null | (() => void), setAttribute: vi.fn() };
    bindFullscreenButtons([button as unknown as HTMLButtonElement], undefined, doc as unknown as FullscreenDocument);
    expect(button.textContent).toBe(fullscreenLabel(false));
    button.onclick!();
    await Promise.resolve(); await Promise.resolve();
    expect(doc.documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
    expect(button.textContent).toBe('Full screen: On');
    expect(button.setAttribute).toHaveBeenLastCalledWith('aria-pressed', 'true');
    await toggleFullscreen(doc as unknown as FullscreenDocument);
    expect(doc.exitFullscreen).toHaveBeenCalledTimes(1);
    expect(button.textContent).toBe('Full screen: Off');
  });

  it('is hidden where the browser cannot go full screen, and a refused request is reported, not thrown', async () => {
    const off = fakeDocument(false);
    const button = { hidden: false, textContent: '', dataset: {}, onclick: null, setAttribute: () => undefined };
    bindFullscreenButtons([button as unknown as HTMLButtonElement], undefined, off as unknown as FullscreenDocument);
    expect(button.hidden).toBe(true);
    expect(fullscreenSupported(off as unknown as FullscreenDocument)).toBe(false);
    const refusing = fakeDocument();
    refusing.documentElement.requestFullscreen = vi.fn(async () => { throw new TypeError('Permissions check failed'); });
    const refused = vi.fn();
    await expect(toggleFullscreen(refusing as unknown as FullscreenDocument, refused)).resolves.toBeUndefined();
    expect(refused).toHaveBeenCalledTimes(1);
  });

  it('Escape while full screen only leaves full screen', () => {
    const doc = fakeDocument();
    expect(escapeLeavesFullscreenOnly({ key: 'Escape' }, doc as unknown as FullscreenDocument)).toBe(false);
    doc.fullscreenElement = {} as Element;
    expect(escapeLeavesFullscreenOnly({ key: 'Escape', code: 'Escape' }, doc as unknown as FullscreenDocument)).toBe(true);
    expect(escapeLeavesFullscreenOnly({ key: 'Enter' }, doc as unknown as FullscreenDocument)).toBe(false);
  });
});

describe('every menu offers Main menu, the hub, Controller settings and Full screen', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
  const picker = readFileSync(new URL('../src/partnerPicker.ts', import.meta.url), 'utf8');
  const block = (source: string, start: string, end: string) => { const at = source.indexOf(start); expect(at, start).toBeGreaterThanOrEqual(0); return source.slice(at, source.indexOf(end, at)); };
  const button = (source: string, id: string, label?: RegExp) => {
    const match = new RegExp(`<button[^>]*id="${id}"[^>]*>([^<]*)<`).exec(source);
    expect(match, id).not.toBeNull();
    if (label) expect(match![1]).toMatch(label);
  };
  const menus: [string, string, (string | null)[]][] = [
    // [menu, markup, ids for Main menu, hub, Controller settings, Full screen]; the fighter select is the main menu.
    ['fighter select header', block(html, '<nav class="top-navigation"', '</nav>'), [null, 'return-hub', 'controller-settings', 'fullscreen-toggle']],
    ['pause and result menu', block(html, '<div id="overlay"', '<div class="arena-footer">'), ['overlay-select', 'overlay-hub', 'overlay-controls', 'overlay-fullscreen']],
    ['Settings and Controller settings', block(html, '<dialog id="controls-dialog"', '</dialog>'), ['settings-main-menu', 'settings-hub', 'settings-controls', 'settings-fullscreen']],
    ['Story worlds', block(html, '<dialog id="journey-dialog"', '</dialog>'), ['journey-main-menu', 'journey-hub', 'journey-controls', 'journey-fullscreen']],
    ['partner select', block(picker, 'partner-actions', '</section>'), ['partner-main-menu', 'partner-hub', 'partner-controls', 'partner-fullscreen']],
  ];
  it.each(menus)('%s', (_name, markup, [mainMenu, hub, controls, fullscreen]) => {
    if (mainMenu) button(markup, mainMenu, /^Main menu$/);
    button(markup, hub!, /hub/i);
    button(markup, controls!, /^Controller settings$/);
    button(markup, fullscreen!, /^Full screen/);
    for (const id of [mainMenu, hub, controls, fullscreen]) if (id) expect(main, `${id} is wired in main.ts`).toContain(`'${id}'`);
  });

  it('keeps each menu’s own options', () => {
    for (const id of ['start', 'overlay-restart', 'overlay-feedback', 'overlay-story', 'overlay-settings']) button(html, id);
    for (const id of ['story-worlds', 'settings', 'close-settings', 'defaults', 'journey-back', 'controls-back']) button(html, id);
    for (const id of ['partner-back', 'partner-confirm']) button(picker, id);
    for (const id of ['stick-deadzone', 'fixed-controls', 'bindings', 'controls-p1', 'controls-p2']) expect(html).toContain(`id="${id}"`);
  });
});
