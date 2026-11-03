import { describe, expect, it } from 'vitest';
import { A } from '../src/core';
import { P2_KEYS, keyboardMask, padMask, pressedMask, versusPads } from '../src/localInput';

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
