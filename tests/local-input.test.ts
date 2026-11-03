import { describe, expect, it } from 'vitest';
import { A } from '../src/core';
import { P2_KEYS, UNBOUND, keyboardMask, padMask, pressedMask, rebindKey, rebindPad, resolveKeyConflicts, versusPads } from '../src/localInput';

const P1_DEFAULTS = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyJ', 'KeyK', 'KeyL', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'ShiftLeft'];
const pad = (axes: number[], pressed: number[] = []) => ({ connected: true, axes, buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: pressed.includes(i) })) });

describe('local versus input', () => {
  it('player 2 keys are distinct and never overlap player 1 defaults', () => {
    const codes = Object.values(P2_KEYS);
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

  it('gives the first connected pad to player 1 and the second to player 2', () => {
    const one = pad([0, 0]), two = pad([0, 0]);
    expect(versusPads([null, one, { ...two, connected: false }, two])).toEqual([one, two]);
    expect(versusPads([one])).toEqual([one, null]);
  });
});

describe('per-player remapping', () => {
  const p1 = () => ({ left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', light: 'KeyJ', medium: 'KeyK', heavy: 'KeyL', launcher: 'KeyU', bolt: 'KeyI', grab: 'KeyO', special: 'KeyP', dash: 'ShiftLeft' });
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
    const all = [...Object.values(sets[0]), ...Object.values(sets[1])];
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
});
