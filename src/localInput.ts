import { A, type Action } from './core';

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
 * Gamepad for each player in local versus: the first connected pad belongs to
 * player 1 (it also drives menus), the second to player 2.
 */
export function versusPads<T extends { connected: boolean } | null>(pads: readonly T[]): [T | null, T | null] {
  const connected = pads.filter((p): p is NonNullable<T> => !!p?.connected);
  return [connected[0] ?? null, connected[1] ?? null];
}
