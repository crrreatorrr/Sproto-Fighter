import { A, type Action } from './core';
import { PAD, type MenuDirection } from './gamepad';

/**
 * Player 2's keyboard in local versus. Chosen to sit on the right half of a
 * laptop keyboard without a numpad and to avoid player 1's defaults
 * (WASD, J K L U I O P, Left Shift).
 */
export const P2_KEYS: Readonly<Record<Action, string>> = {
  left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown',
  light: 'Comma', medium: 'Period', heavy: 'Slash', launcher: 'Semicolon',
  bolt: 'Quote', grab: 'BracketLeft', special: 'BracketRight', dash: 'ShiftRight',
};

const ACTIONS = Object.keys(A) as Action[];

/** Input bits for the keys currently held under one set of bindings. */
export function keyboardMask(held: ReadonlySet<string>, bindings: Readonly<Record<Action, string>>): number {
  let mask = 0;
  for (const action of ACTIONS) if (held.has(bindings[action])) mask |= A[action];
  return mask;
}

/** Input bits for a key that was just pressed (buffered even if released before the next frame). */
export function pressedMask(code: string, bindings: Readonly<Record<Action, string>>): number {
  let mask = 0;
  for (const action of ACTIONS) if (bindings[action] === code) mask |= A[action];
  return mask;
}

/** Minimal gamepad shape, so tests can pass plain objects. */
export interface PadState { readonly axes: readonly number[]; readonly buttons: readonly { readonly pressed: boolean }[] }

/** Input bits from a standard-mapping gamepad: stick or D-pad, then mapped buttons. */
export function padMask(pad: PadState | null | undefined, buttons: Readonly<Partial<Record<Action, number>>>): number {
  if (!pad) return 0;
  const down = (i: number) => !!pad.buttons[i]?.pressed;
  let mask = 0;
  if ((pad.axes[0] ?? 0) < -.3 || down(14)) mask |= A.left;
  if ((pad.axes[0] ?? 0) > .3 || down(15)) mask |= A.right;
  if ((pad.axes[1] ?? 0) < -.55 || down(12)) mask |= A.up;
  if ((pad.axes[1] ?? 0) > .55 || down(13)) mask |= A.down;
  for (const action of ACTIONS) {
    const index = buttons[action];
    if (index !== undefined && down(index)) mask |= A[action];
  }
  return mask;
}

/**
 * Default controller layout (standard mapping) for both players. Modelled on
 * four-button tag fighters: Light → Medium → Finisher roll clockwise over
 * X → Y → B so the chain is one thumb sweep, and the Launcher (the S button of
 * that genre) sits on A. Ranged power and Grab use the bumpers, Team Special
 * the right trigger, and Dash the left trigger so the left index finger dashes
 * while the right thumb keeps attacking. Movement, jump and crouch are the
 * stick and D-pad; Start pauses. README "Controls" lists it.
 */
export const PAD_DEFAULTS: Readonly<Partial<Record<Action, number>>> = {
  light: PAD.x, medium: PAD.y, heavy: PAD.b, launcher: PAD.a,
  bolt: PAD.rb, grab: PAD.lb, special: PAD.rt, dash: PAD.lt,
};

/**
 * Menu focus direction for a keyboard key (`KeyboardEvent.code`): the arrow
 * keys and W A S D both move, matching the fight's movement keys.
 */
export function menuKeyDirection(code: string): MenuDirection {
  switch (code) {
    case 'ArrowUp': case 'KeyW': return 'up';
    case 'ArrowDown': case 'KeyS': return 'down';
    case 'ArrowLeft': case 'KeyA': return 'left';
    case 'ArrowRight': case 'KeyD': return 'right';
    default: return '';
  }
}

/** Unbound key slot: shown as "—" and never matched. */
export const UNBOUND = '';

/**
 * Bind `code` to `action` for `player` (index into `sets`), keeping every key
 * unique across both players: whoever held `code` before gets this action's
 * previous key instead (a swap). Mutates `sets`.
 */
export function rebindKey(sets: Record<Action, string>[], player: number, action: Action, code: string): void {
  const previous = sets[player][action];
  for (const [p, set] of sets.entries())
    for (const a of ACTIONS)
      if (set[a] === code && !(p === player && a === action)) set[a] = previous;
  sets[player][action] = code;
}

/** Bind gamepad `button` to `action` within one player's pad map, swapping with any previous holder. Mutates `map`. */
export function rebindPad(map: Partial<Record<Action, number>>, action: Action, button: number): void {
  const previous = map[action];
  for (const a of ACTIONS) if (a !== action && map[a] === button) map[a] = previous;
  map[action] = button;
}

/** After loading or resetting, unbind player 2 keys that player 1 already uses (player 1 wins). Mutates `p2`. */
export function resolveKeyConflicts(p1: Readonly<Record<Action, string>>, p2: Record<Action, string>): void {
  const taken = new Set(Object.values(p1));
  for (const a of ACTIONS) if (taken.has(p2[a])) p2[a] = UNBOUND;
}
