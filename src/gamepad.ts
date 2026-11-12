/**
 * Standard-mapping gamepad helpers shared by every screen (Sproto controller
 * convention: poll every frame, latch buttons held when a pad appears, A
 * confirms, B backs out, Start pauses). Pure: no DOM, no clock, no globals, so
 * tests can pass plain objects.
 */

/** W3C "standard" mapping indices (Xbox names; other pads match by position). */
export const PAD = {
    a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, lt: 6, rt: 7, view: 8, start: 9,
    leftStick: 10, rightStick: 11, up: 12, down: 13, left: 14, right: 15, home: 16,
} as const;

/** Analog triggers count as pressed above this value. */
export const TRIGGER_THRESHOLD = .5;
/** Radial deadzone of the left stick; readings inside it are treated as centred. */
export const LEFT_STICK_DEADZONE = .2;
/** Menus: stick threshold and key-repeat timing for held directions. */
export const MENU_STICK = .5, MENU_REPEAT_DELAY_MS = 350, MENU_REPEAT_INTERVAL_MS = 120;

export interface PadButtonLike { readonly pressed: boolean; readonly value?: number }
export interface PadLike {
    readonly axes: readonly number[];
    readonly buttons: readonly PadButtonLike[];
    readonly connected?: boolean;
}

/** Whether button `index` is down. Triggers use their analog value when the browser reports one. */
export function buttonDown(pad: PadLike, index: number): boolean {
    const button = pad.buttons[index];
    if (!button) return false;
    if ((index === PAD.lt || index === PAD.rt) && typeof button.value === 'number') return button.value > TRIGGER_THRESHOLD;
    return !!button.pressed;
}

/** 0/1 for every button of `pad`. */
export function readButtons(pad: PadLike): number[] {
    return pad.buttons.map((_, i) => buttonDown(pad, i) ? 1 : 0);
}

/** Radial deadzone, rescaled so motion starts smoothly from 0 at the edge of the deadzone. */
export function radialDeadzone(x: number, y: number, deadzone = LEFT_STICK_DEADZONE): [number, number] {
    const length = Math.hypot(x, y);
    if (length <= deadzone) return [0, 0];
    const scaled = Math.min(1, (length - deadzone) / (1 - deadzone));
    return [x / length * scaled, y / length * scaled];
}

export type MenuDirection = 'up' | 'down' | 'left' | 'right' | '';

/** Menu focus direction from the D-pad, or else the left stick's dominant axis past MENU_STICK. */
export function menuDirection(buttons: readonly number[], axes: readonly number[]): MenuDirection {
    if (buttons[PAD.left]) return 'left';
    if (buttons[PAD.right]) return 'right';
    if (buttons[PAD.up]) return 'up';
    if (buttons[PAD.down]) return 'down';
    const x = axes[0] ?? 0, y = axes[1] ?? 0;
    if (Math.max(Math.abs(x), Math.abs(y)) < MENU_STICK) return '';
    return Math.abs(x) >= Math.abs(y) ? (x < 0 ? 'left' : 'right') : (y < 0 ? 'up' : 'down');
}

/** Key-repeat for a held menu direction: fires at once, then after the first delay, then every interval. */
export class MenuRepeat {
    private last: MenuDirection = '';
    private at = 0;
    /** Returns true when `direction` should move the focus at time `now` (ms). */
    next(direction: MenuDirection, now: number): boolean {
        const fresh = direction !== this.last;
        this.last = direction;
        if (!direction) return false;
        if (!fresh && now < this.at) return false;
        this.at = now + (fresh ? MENU_REPEAT_DELAY_MS : MENU_REPEAT_INTERVAL_MS);
        return true;
    }
    reset(): void { this.last = ''; this.at = 0; }
}

/**
 * Per-pad latch. When a pad first appears (page load, travel from the hub,
 * reconnect) every button it already holds is ignored until released, so the
 * press that confirmed a hub portal never confirms anything here.
 */
export class PadLatch {
    private readonly latched = new Map<number, Set<number>>();
    /** Latched view of `buttons` for the pad in `slot`. */
    read(slot: number, buttons: readonly number[]): number[] {
        let held = this.latched.get(slot);
        if (!held) {
            held = new Set(buttons.flatMap((down, i) => down ? [i] : []));
            this.latched.set(slot, held);
        }
        for (const i of held) if (!buttons[i]) held.delete(i);
        return buttons.map((down, i) => down && !held.has(i) ? 1 : 0);
    }
    /** The pad in `slot` went away; its next appearance latches again. */
    forget(slot: number): void { this.latched.delete(slot); }
    /** Ignore whatever `slot` holds right now until each button is released. */
    holdCurrent(slot: number, buttons: readonly number[]): void {
        const held = this.latched.get(slot) ?? new Set<number>();
        buttons.forEach((down, i) => { if (down) held.add(i); });
        this.latched.set(slot, held);
    }
}

export type PadSlots = readonly [number | null, number | null];

/**
 * Which `navigator.getGamepads()` index belongs to player 1 and player 2.
 * Assignments are sticky, so unplugging player 1's pad in a match never hands
 * player 2's pad to player 1. With `promote` (outside a match), a lone player 2
 * pad moves up to player 1. Empty slots take unassigned pads in index order.
 */
export function assignPads(previous: PadSlots, pads: readonly (PadLike | null | undefined)[], promote: boolean): [number | null, number | null] {
    const live = (i: number | null) => i !== null && !!pads[i] && pads[i]!.connected !== false;
    const slots: [number | null, number | null] = [live(previous[0]) ? previous[0] : null, live(previous[1]) ? previous[1] : null];
    if (promote && slots[0] === null && slots[1] !== null) { slots[0] = slots[1]; slots[1] = null; }
    for (let i = 0; i < pads.length; i++) {
        if (!live(i) || slots.includes(i)) continue;
        if (slots[0] === null) slots[0] = i;
        else if (slots[1] === null) slots[1] = i;
    }
    return slots;
}

/** A pad as one screen sees it: latched buttons in the usual shape, raw axes. */
export interface PadView {
    readonly axes: readonly number[];
    readonly buttons: readonly { readonly pressed: boolean; readonly value: number }[];
}

/** The player's choice range for the left-stick dead zone (Controller settings). */
export const MIN_STICK_DEADZONE = .05, MAX_STICK_DEADZONE = .6;
export const clampDeadzone = (value: number): number =>
    Number.isFinite(value) ? Math.min(MAX_STICK_DEADZONE, Math.max(MIN_STICK_DEADZONE, Math.round(value * 100) / 100)) : LEFT_STICK_DEADZONE;

/**
 * Left stick as the rest of the game reads it. At the default dead zone the raw reading is kept
 * outside the dead zone: gameplay and menus compare it against their own direction thresholds
 * (all larger than the dead zone). Another dead zone is mapped onto the default's scale, so a
 * threshold keeps the same place in the stick's live travel: a larger dead zone needs a longer
 * push, a smaller one a shorter push, and the default reads exactly as it always has.
 */
export function stickAxes(x: number, y: number, deadzone = LEFT_STICK_DEADZONE): [number, number] {
    const [dx, dy] = radialDeadzone(x, y, deadzone);
    if (dx === 0 && dy === 0) return [0, 0];
    if (deadzone === LEFT_STICK_DEADZONE) return [x, y];
    const length = Math.hypot(x, y), live = Math.min(1, (length - deadzone) / (1 - deadzone));
    const scale = (LEFT_STICK_DEADZONE + live * (1 - LEFT_STICK_DEADZONE)) / length;
    return [x * scale, y * scale];
}

export function padView(axes: readonly number[], buttons: readonly number[], deadzone = LEFT_STICK_DEADZONE): PadView {
    const [x, y] = stickAxes(axes[0] ?? 0, axes[1] ?? 0, deadzone);
    return {
        axes: [x, y, ...axes.slice(2)],
        buttons: buttons.map(down => ({ pressed: !!down, value: down ? 1 : 0 })),
    };
}

export interface PadFrame {
    /** Player 1's pad (drives menus), latched; null if none. */
    readonly p1: PadView | null;
    /** Player 2's pad, latched; null if none. */
    readonly p2: PadView | null;
    /** Pads that disappeared this frame: player 1 and/or player 2. */
    readonly lost: readonly (1 | 2)[];
    /** A fresh press or a deliberate stick push on either pad (switches prompts to the controller). */
    readonly active: boolean;
    /** How many pads are assigned to players. */
    readonly count: number;
}

/** Sticky player assignment plus latch-on-connect for every pad, read once per frame. */
export class PadInput {
    private slots: [number | null, number | null] = [null, null];
    private readonly latch = new PadLatch();
    private previous: [number[], number[]] = [[], []];
    /** Left-stick dead zone for both players' pads (Controller settings); applies from the next poll. */
    deadzone = LEFT_STICK_DEADZONE;

    poll(pads: readonly (PadLike | null | undefined)[], promote: boolean): PadFrame {
        const before = this.slots;
        this.slots = assignPads(before, pads, promote);
        const lost: (1 | 2)[] = [];
        for (const index of before) {
            if (index !== null && !this.slots.includes(index)) this.latch.forget(index);
        }
        for (const p of [0, 1] as const) {
            if (before[p] !== null && !(pads[before[p]!] && pads[before[p]!]!.connected !== false)) lost.push((p + 1) as 1 | 2);
        }
        let active = false;
        const views = this.slots.map((index, p) => {
            if (index === null) { this.previous[p] = []; return null; }
            const pad = pads[index]!;
            const buttons = this.latch.read(index, readButtons(pad));
            if (buttons.some((down, i) => down && !this.previous[p][i])) active = true;
            const view = padView(pad.axes, buttons, this.deadzone);
            if (Math.max(Math.abs(view.axes[0] ?? 0), Math.abs(view.axes[1] ?? 0)) >= MENU_STICK) active = true;
            this.previous[p] = buttons;
            return view;
        });
        return { p1: views[0], p2: views[1], lost, active, count: this.slots.filter(s => s !== null).length };
    }

    /** Ignore every button currently held on both pads until released (e.g. a screen just opened). */
    holdCurrent(pads: readonly (PadLike | null | undefined)[]): void {
        for (const index of this.slots) if (index !== null && pads[index]) this.latch.holdCurrent(index, readButtons(pads[index]!));
    }
}

const BUTTON_NAMES = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'View', 'Start', 'L-stick', 'R-stick', 'D-pad ↑', 'D-pad ↓', 'D-pad ←', 'D-pad →', 'Home'];
/** Prompt label for a standard-mapping button. */
export function padButtonName(index: number | undefined): string {
    return index === undefined ? '—' : BUTTON_NAMES[index] ?? `Button ${index}`;
}

/** Buttons that can never be bound to a fight action: Start (pause / cancels a remap), the D-pad (movement) and Home (owned by the OS). */
export function canBindPadButton(index: number): boolean {
    return index !== PAD.start && index !== PAD.home && !(index >= PAD.up && index <= PAD.right);
}
