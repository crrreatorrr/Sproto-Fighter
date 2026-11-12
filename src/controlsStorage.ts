import type { Action } from './core';
import { LEFT_STICK_DEADZONE, clampDeadzone } from './gamepad';
import { FEEDBACK_KEY, resolveKeyConflicts } from './localInput';

/**
 * Controller settings as saved on this browser: both players' keyboard and controller
 * mappings plus the left-stick dead zone. Input layer only: the simulation never sees a key
 * code or a button index, only the action bits these produce.
 */
export interface ControlsSnapshot {
    keys: Record<Action, string>;
    padKeys: Partial<Record<Action, number>>;
    keys2: Record<Action, string>;
    padKeys2: Partial<Record<Action, number>>;
    stickDeadzone: number;
}
export type ControlsDefaults = Omit<ControlsSnapshot, 'stickDeadzone'>;

/** Saved under the project's old working name until a past release; read once, then saved under the new key. */
export const CONTROLS_KEY = 'sproto-arena-controls', LEGACY_CONTROLS_KEY = 'neon-relay-controls';
export const CONTROLS_VERSION = 4;

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Defaults, overlaid with whatever valid mapping the browser saved. Never throws. */
export function loadControls(storage: Store | null, defaults: ControlsDefaults): ControlsSnapshot {
    const keys = { ...defaults.keys }, padKeys = { ...defaults.padKeys }, keys2 = { ...defaults.keys2 }, padKeys2 = { ...defaults.padKeys2 };
    let stickDeadzone = LEFT_STICK_DEADZONE;
    const actions = Object.keys(defaults.keys) as Action[], padActions = Object.keys(defaults.padKeys) as Action[];
    try {
        const saved = JSON.parse(storage?.getItem(CONTROLS_KEY) ?? storage?.getItem(LEGACY_CONTROLS_KEY) ?? 'null');
        if (saved && typeof saved === 'object') {
            for (const a of actions) if (typeof saved.keys?.[a] === 'string') keys[a] = saved.keys[a];
            for (const a of padActions) if (Number.isInteger(saved.padKeys?.[a])) padKeys[a] = saved.padKeys[a];
            // Version 3 moved jump from Space / Up to W.
            if ((saved.controlsVersion ?? 0) < 3 && ['Space', 'ArrowUp'].includes(keys.up) && !Object.entries(keys).some(([a, k]) => a !== 'up' && k === 'KeyW')) keys.up = 'KeyW';
            for (const a of actions) if (typeof saved.keys2?.[a] === 'string') keys2[a] = saved.keys2[a];
            for (const a of padActions) if (Number.isInteger(saved.padKeys2?.[a])) padKeys2[a] = saved.padKeys2[a];
            if (typeof saved.stickDeadzone === 'number') stickDeadzone = clampDeadzone(saved.stickDeadzone);
        }
    }
    catch { /* Storage may be disabled or hold something unreadable. Defaults still work. */ }
    // N twice opens feedback: a saved mapping can never hold it.
    for (const a of actions) if (keys[a] === FEEDBACK_KEY) keys[a] = defaults.keys[a];
    resolveKeyConflicts(keys, keys2);
    return { keys, padKeys, keys2, padKeys2, stickDeadzone };
}

/** Save the current mappings; false when the browser will not store them. */
export function saveControls(storage: Store | null, controls: ControlsSnapshot): boolean {
    if (!storage) return false;
    try {
        const { keys, padKeys, keys2, padKeys2, stickDeadzone } = controls;
        storage.setItem(CONTROLS_KEY, JSON.stringify({ controlsVersion: CONTROLS_VERSION, keys, padKeys, keys2, padKeys2, stickDeadzone }));
        storage.removeItem(LEGACY_CONTROLS_KEY);
        return true;
    }
    catch { return false; }
}

/**
 * What the keys and buttons that cannot be remapped do. The Controller settings screen lists
 * these under the remappable fight actions, so every key and button the game reads is shown.
 */
export const FIXED_CONTROLS: readonly { readonly action: string; readonly keyboard: string; readonly controller: string }[] = [
    { action: 'Move, jump, crouch', keyboard: 'The keys above (the arrow keys also work in story-boss forms)', controller: 'Left stick or D-pad (not remappable)' },
    { action: 'Pause / resume', keyboard: 'Escape', controller: 'Start (either controller in local versus)' },
    { action: 'Send feedback', keyboard: 'N twice', controller: 'Send feedback in the pause menu' },
    { action: 'Menu: move focus', keyboard: 'Arrow keys or W A S D (Tab also works)', controller: 'D-pad or left stick' },
    { action: 'Menu: confirm', keyboard: 'Enter or Space', controller: 'A' },
    { action: 'Menu: back / close', keyboard: 'Escape', controller: 'B' },
    { action: 'Fighter select: switch P1 / rival', keyboard: 'P1 and rival tabs', controller: 'X' },
    { action: 'Fighter select: jump to Start Fight', keyboard: 'Tab to Start Fight', controller: 'Start' },
    { action: 'Versus preview: continue', keyboard: 'Enter', controller: 'A' },
    { action: 'Story boss: beam / ball / shield / retry', keyboard: 'C / V / X / R (and the fight keys)', controller: 'Light / Medium / Finisher (Restart in the pause menu)' },
    { action: 'Cancel a remap', keyboard: 'Escape', controller: 'Start (B also cancels a key remap)' },
];
