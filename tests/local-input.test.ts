import { describe, expect, it } from 'vitest';
import { A } from '../src/core';
import { DOUBLE_TAP_FRAMES, DoubleTapDash, FEEDBACK_KEY, P2_KEYS, PAD_ACTIONS, PAD_DEFAULTS, UNBOUND, keyboardMask, menuKeyDirection, padMask, pressedMask, rebindKey, rebindPad, resolveKeyConflicts } from '../src/localInput';
import { PAD, canBindPadButton } from '../src/gamepad';

const P1_DEFAULTS = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyJ', 'KeyK', 'KeyL', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'ShiftLeft'];
/** Feed one mask per frame; returns what the simulation would see each frame. */
const run = (detector: DoubleTapDash, masks: number[]) => masks.map(mask => detector.apply(mask));
const repeat = (mask: number, frames: number) => Array<number>(frames).fill(mask);
const pad = (axes: number[], pressed: number[] = []) => ({ connected: true, axes, buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: pressed.includes(i) })) });

describe('local versus input', () => {
  it('player 2 keys are distinct and never overlap player 1 defaults', () => {
    const codes = Object.values(P2_KEYS).filter(code => code !== UNBOUND);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.filter(code => P1_DEFAULTS.includes(code))).toEqual([]);
  });

  it('maps held and freshly pressed keys to input bits', () => {
    expect(keyboardMask(new Set(['ArrowLeft', 'Comma', 'KeyJ']), P2_KEYS)).toBe(A.left | A.light);
    expect(pressedMask('BracketRight', P2_KEYS)).toBe(A.special);
    expect(pressedMask('KeyZ', P2_KEYS)).toBe(0);
  });

  it('reads stick, D-pad and mapped buttons from a gamepad', () => {
    expect(padMask(pad([-1, 0]), {})).toBe(A.left);
    expect(padMask(pad([0, 0], [12, 15]), {})).toBe(A.up | A.right);
    expect(padMask(pad([0, .2], [0]), { light: 0 })).toBe(A.light);
    expect(padMask(null, { light: 0 })).toBe(0);
  });
});

describe('default controller layout', () => {
  it('gives every fight button its own bindable button', () => {
    const buttons = Object.values(PAD_DEFAULTS);
    expect(buttons).toHaveLength(8);
    expect(new Set(buttons).size).toBe(buttons.length);
    expect(buttons.every(canBindPadButton)).toBe(true);
    expect(buttons).not.toContain(PAD.start);
    expect(buttons).not.toContain(PAD.view);
  });

  it('chains Light, Medium and Finisher over X, Y and B with the Launcher on A and Block on LT', () => {
    expect([PAD_DEFAULTS.light, PAD_DEFAULTS.medium, PAD_DEFAULTS.heavy, PAD_DEFAULTS.launcher]).toEqual([PAD.x, PAD.y, PAD.b, PAD.a]);
    expect(PAD_DEFAULTS.block).toBe(PAD.lt);
    expect(PAD_DEFAULTS.dash).toBeUndefined();
    expect(PAD_ACTIONS).toContain('dash');
    expect(PAD_ACTIONS).not.toContain('left');
    expect(PAD_DEFAULTS.special).toBe(PAD.rt);
  });

  it('leaves movement on the stick and D-pad', () => {
    expect(PAD_DEFAULTS.left).toBeUndefined();
    expect(PAD_DEFAULTS.up).toBeUndefined();
    expect(padMask(pad([0, 0], [PAD.up, PAD.left]), PAD_DEFAULTS)).toBe(A.up | A.left);
    expect(padMask(pad([0, 0], [PAD.x, PAD.lt]), PAD_DEFAULTS)).toBe(A.light | A.block);
  });
});

describe('keyboard menu keys', () => {
  it('moves with the arrows and W A S D', () => {
    expect(['ArrowUp', 'KeyW', 'ArrowDown', 'KeyS', 'ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD'].map(menuKeyDirection))
      .toEqual(['up', 'up', 'down', 'down', 'left', 'left', 'right', 'right']);
  });
  it('ignores every other key', () => {
    expect(['Enter', 'Space', 'Escape', 'KeyJ', 'ShiftLeft', ''].map(menuKeyDirection)).toEqual(['', '', '', '', '', '']);
  });
});

describe('per-player remapping', () => {
  const p1 = () => ({ left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', light: 'KeyJ', medium: 'KeyK', heavy: 'KeyL', launcher: 'KeyU', bolt: 'KeyI', grab: 'KeyO', special: 'KeyP', dash: UNBOUND, block: 'ShiftLeft' });
  it('swaps within one player', () => {
    const sets = [p1(), { ...P2_KEYS }];
    rebindKey(sets, 0, 'light', 'KeyK');
    expect([sets[0].light, sets[0].medium]).toEqual(['KeyK', 'KeyJ']);
  });
  it('swaps across players so no key is shared', () => {
    const sets = [p1(), { ...P2_KEYS }];
    rebindKey(sets, 1, 'light', 'KeyJ');
    expect(sets[1].light).toBe('KeyJ');
    expect(sets[0].light).toBe('Comma');
    const all = [...Object.values(sets[0]), ...Object.values(sets[1])].filter(code => code !== UNBOUND);
    expect(new Set(all).size).toBe(all.length);
  });
  it('swaps gamepad buttons within one map', () => {
    const map = { light: 0, medium: 2 };
    rebindPad(map, 'light', 2);
    expect(map).toEqual({ light: 2, medium: 0 });
  });
  it('unbinds player 2 keys that player 1 owns', () => {
    const p2 = { ...P2_KEYS, light: 'KeyJ' };
    resolveKeyConflicts(p1(), p2);
    expect(p2.light).toBe(UNBOUND);
    expect(p2.medium).toBe('Period');
  });
  it('keeps the feedback key (N) out of every mapping', () => {
    expect([...Object.values(p1()), ...Object.values(P2_KEYS)]).not.toContain(FEEDBACK_KEY);
    const sets = [p1(), { ...P2_KEYS }];
    rebindKey(sets, 0, 'light', FEEDBACK_KEY);
    rebindKey(sets, 1, 'block', FEEDBACK_KEY);
    expect(sets).toEqual([p1(), { ...P2_KEYS }]);
    const p2 = { ...P2_KEYS, grab: FEEDBACK_KEY };
    resolveKeyConflicts(p1(), p2);
    expect(p2.grab).toBe(UNBOUND);
  });
});

describe('double-tap dash', () => {
  it('dashes on a second press of the same direction and holds Dash while it stays held', () => {
    for (const dir of [A.left, A.right]) {
      const out = run(new DoubleTapDash(), [...repeat(dir, 3), ...repeat(0, 3), ...repeat(dir, 4), 0]);
      expect(out.slice(0, 6).every(mask => !(mask & A.dash))).toBe(true);
      expect(out.slice(6, 10)).toEqual(repeat(dir | A.dash, 4));
      expect(out[10]).toBe(0);
    }
  });

  it('accepts the second press up to DOUBLE_TAP_FRAMES after the first, and no later', () => {
    // Press on frame 0, release, press again exactly DOUBLE_TAP_FRAMES frames after the first press.
    const inTime = run(new DoubleTapDash(), [A.right, ...repeat(0, DOUBLE_TAP_FRAMES - 1), A.right]);
    expect(inTime.at(-1)).toBe(A.right | A.dash);
    const late = run(new DoubleTapDash(), [A.right, ...repeat(0, DOUBLE_TAP_FRAMES), A.right]);
    expect(late.at(-1)).toBe(A.right);
  });

  it('does not dash from walking, from opposite directions, or from holding both', () => {
    // A long walk, released and pressed again, starts a new double-tap window rather than dashing.
    expect(run(new DoubleTapDash(), [...repeat(A.right, 30), 0, A.right]).some(mask => mask & A.dash)).toBe(false);
    // Left, right, left is a wiggle, not a double-tap of left.
    expect(run(new DoubleTapDash(), [A.left, 0, A.right, 0, A.left]).some(mask => mask & A.dash)).toBe(false);
    // Both directions in between cancel the pending tap.
    expect(run(new DoubleTapDash(), [A.right, A.right | A.left, 0, A.right]).some(mask => mask & A.dash)).toBe(false);
  });

  it('stops dashing when the direction changes, and a third tap needs a fresh pair', () => {
    const d = new DoubleTapDash();
    expect(run(d, [A.right, 0, A.right, A.right | A.left, A.left])).toEqual([A.right, 0, A.right | A.dash, A.right | A.left, A.left]);
    // Tap-tap dashes; a quick third tap is the first of a new pair, so it does not dash again at once.
    expect(run(new DoubleTapDash(), [A.left, 0, A.left, 0, A.left, 0, A.left])).toEqual([A.left, 0, A.left | A.dash, 0, A.left, 0, A.left | A.dash]);
  });

  it('keeps the other bits, works with a held button, and forgets everything on reset', () => {
    expect(run(new DoubleTapDash(), [A.right, A.light, A.right | A.down])).toEqual([A.right, A.light, A.right | A.down | A.dash]);
    const d = new DoubleTapDash();
    run(d, [A.right, 0]);
    d.reset();
    expect(d.apply(A.right)).toBe(A.right);
  });

  it('is a pure function of the masks it is fed, so the same frames give the same dashes', () => {
    const masks = [A.right, 0, A.right, A.right, 0, 0, A.left, 0, A.left, 0, ...repeat(0, 20), A.left];
    expect(run(new DoubleTapDash(), masks)).toEqual(run(new DoubleTapDash(), masks));
  });
});
