import { describe, expect, it } from 'vitest';
import {
  MENU_REPEAT_DELAY_MS, MENU_REPEAT_INTERVAL_MS, MenuRepeat, PAD, PadInput, PadLatch, assignPads, buttonDown,
  canBindPadButton, menuDirection, padButtonName, padView, radialDeadzone, readButtons, type PadLike,
} from '../src/gamepad';

/** A fake standard-mapping pad: `pressed` button indices, optional analog values, stick axes. */
const pad = (pressed: number[] = [], axes: number[] = [0, 0, 0, 0], values: Record<number, number> = {}, connected = true): PadLike => ({
  connected, axes,
  buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: pressed.includes(i), value: values[i] ?? (pressed.includes(i) ? 1 : 0) })),
});
const down = (view: { buttons: readonly { pressed: boolean }[] } | null) => view ? view.buttons.flatMap((b, i) => b.pressed ? [i] : []) : null;

describe('buttons and sticks', () => {
  it('reads triggers by their analog value past one half', () => {
    expect(buttonDown(pad([], undefined, { [PAD.rt]: .4 }), PAD.rt)).toBe(false);
    expect(buttonDown(pad([], undefined, { [PAD.rt]: .6 }), PAD.rt)).toBe(true);
    // Some browsers report a lightly touched trigger as pressed; the value decides.
    expect(buttonDown(pad([PAD.lt], undefined, { [PAD.lt]: .2 }), PAD.lt)).toBe(false);
    expect(buttonDown(pad([PAD.a]), PAD.a)).toBe(true);
    expect(buttonDown(pad(), 40)).toBe(false);
    expect(readButtons(pad([PAD.b, PAD.start])).slice(0, 10)).toEqual([0, 1, 0, 0, 0, 0, 0, 0, 0, 1]);
  });

  it('applies a radial deadzone and rescales from its edge', () => {
    expect(radialDeadzone(.1, .1)).toEqual([0, 0]);
    expect(radialDeadzone(.2, 0)).toEqual([0, 0]);
    const [x, y] = radialDeadzone(.6, 0);
    expect(x).toBeCloseTo(.5);
    expect(y).toBe(0);
    expect(radialDeadzone(1, 0)).toEqual([1, 0]);
    expect(Math.hypot(...radialDeadzone(.9, .9))).toBeCloseTo(1);
  });

  it('zeroes stick drift but keeps the raw reading outside the deadzone for fight thresholds', () => {
    expect(padView([.15, -.1, .5, 0], []).axes).toEqual([0, 0, .5, 0]);
    expect(padView([.35, 0], []).axes).toEqual([.35, 0]);
    expect(padView([0, 0], [0, 1]).buttons).toEqual([{ pressed: false, value: 0 }, { pressed: true, value: 1 }]);
  });
});

describe('menu navigation', () => {
  it('prefers the D-pad, then the stick past one half on its dominant axis', () => {
    const buttons = (i: number) => readButtons(pad([i]));
    expect(menuDirection(buttons(PAD.up), [0, 0])).toBe('up');
    expect(menuDirection(buttons(PAD.right), [-1, 0])).toBe('right');
    expect(menuDirection([], [-.49, 0])).toBe('');
    expect(menuDirection([], [-.7, .3])).toBe('left');
    expect(menuDirection([], [.2, .8])).toBe('down');
    expect(menuDirection([], [0, -.6])).toBe('up');
  });

  it('auto-repeats a held direction like a key: at once, after the first delay, then every interval', () => {
    const repeat = new MenuRepeat();
    expect(repeat.next('down', 0)).toBe(true);
    expect(repeat.next('down', MENU_REPEAT_DELAY_MS - 1)).toBe(false);
    expect(repeat.next('down', MENU_REPEAT_DELAY_MS)).toBe(true);
    expect(repeat.next('down', MENU_REPEAT_DELAY_MS + MENU_REPEAT_INTERVAL_MS - 1)).toBe(false);
    expect(repeat.next('down', MENU_REPEAT_DELAY_MS + MENU_REPEAT_INTERVAL_MS)).toBe(true);
    expect(repeat.next('up', 500)).toBe(true);
    expect(repeat.next('', 501)).toBe(false);
    expect(repeat.next('up', 502)).toBe(true);
    repeat.reset();
    expect(repeat.next('up', 503)).toBe(true);
  });
});

describe('latch on connect', () => {
  it('ignores buttons held when a pad appears until each is released', () => {
    const latch = new PadLatch();
    expect(latch.read(0, [1, 0, 1])).toEqual([0, 0, 0]);
    expect(latch.read(0, [1, 1, 0])).toEqual([0, 1, 0]);
    expect(latch.read(0, [0, 1, 1])).toEqual([0, 1, 1]);
    expect(latch.read(0, [1, 1, 1])).toEqual([1, 1, 1]);
  });

  it('latches again when a pad reconnects, and on request', () => {
    const latch = new PadLatch();
    latch.read(0, [0]);
    expect(latch.read(0, [1])).toEqual([1]);
    latch.forget(0);
    expect(latch.read(0, [1])).toEqual([0]);
    expect(latch.read(0, [0])).toEqual([0]);
    latch.holdCurrent(0, [1]);
    expect(latch.read(0, [1])).toEqual([0]);
  });
});

describe('player assignment', () => {
  it('gives pads to player 1 then player 2 in index order, skipping gaps and disconnected pads', () => {
    expect(assignPads([null, null], [null, pad(), pad([], undefined, {}, false), pad()], false)).toEqual([1, 3]);
    expect(assignPads([null, null], [pad()], false)).toEqual([0, null]);
    expect(assignPads([null, null], [], false)).toEqual([null, null]);
  });

  it('keeps assignments sticky in a match and promotes a lone player 2 pad outside one', () => {
    const both = [pad(), pad()];
    expect(assignPads([0, 1], [null, both[1]], false)).toEqual([null, 1]);
    expect(assignPads([0, 1], [null, both[1]], true)).toEqual([1, null]);
    // Player 1 plugs back in mid-match: they get their slot back, player 2 keeps theirs.
    expect(assignPads([null, 1], both, false)).toEqual([0, 1]);
    // A third pad never displaces either player.
    expect(assignPads([1, 2], [pad(), pad(), pad()], true)).toEqual([1, 2]);
  });
});

describe('PadInput frames', () => {
  it('hides the hub confirm press from the game and reports activity on fresh presses only', () => {
    const input = new PadInput();
    let frame = input.poll([pad([PAD.a])], true);
    expect(down(frame.p1)).toEqual([]);
    expect(frame.active).toBe(false);
    expect(frame.count).toBe(1);
    frame = input.poll([pad([PAD.a])], true);
    expect(down(frame.p1)).toEqual([]);
    frame = input.poll([pad()], true);
    expect(frame.active).toBe(false);
    frame = input.poll([pad([PAD.a])], true);
    expect(down(frame.p1)).toEqual([PAD.a]);
    expect(frame.active).toBe(true);
    frame = input.poll([pad([PAD.a])], true);
    expect(frame.active).toBe(false);
    expect(input.poll([pad([], [0, .8])], true).active).toBe(true);
  });

  it('hot-plugs: reports lost players, latches reconnects and fills player 2', () => {
    const input = new PadInput();
    expect(input.poll([], true)).toMatchObject({ p1: null, p2: null, count: 0, lost: [] });
    input.poll([pad(), pad()], false);
    let frame = input.poll([pad(), null], false);
    expect(frame.lost).toEqual([2]);
    expect(frame.p2).toBeNull();
    frame = input.poll([pad(), pad([PAD.start])], false);
    expect(frame.lost).toEqual([]);
    expect(down(frame.p2)).toEqual([]);
    frame = input.poll([null, pad()], false);
    expect(frame.lost).toEqual([1]);
    expect(frame.p1).toBeNull();
    expect(frame.p2).not.toBeNull();
    // Back in the menus, the remaining pad becomes player 1.
    frame = input.poll([null, pad([PAD.x])], true);
    expect(down(frame.p1)).toEqual([PAD.x]);
    expect(frame.p2).toBeNull();
  });

  it('holdCurrent ignores held buttons on both pads until released', () => {
    const input = new PadInput();
    input.poll([pad(), pad()], false);
    const held = [pad([PAD.start]), pad([PAD.a])];
    input.holdCurrent(held);
    const frame = input.poll(held, false);
    expect([down(frame.p1), down(frame.p2)]).toEqual([[], []]);
    input.poll([pad(), pad()], false);
    expect(down(input.poll(held, false).p1)).toEqual([PAD.start]);
  });
});

describe('remapping and prompts', () => {
  it('never binds Start, the D-pad or Home to a fight action', () => {
    expect([PAD.start, PAD.home, PAD.up, PAD.down, PAD.left, PAD.right].some(canBindPadButton)).toBe(false);
    expect([PAD.a, PAD.b, PAD.x, PAD.y, PAD.lb, PAD.rb, PAD.lt, PAD.rt, PAD.view, PAD.leftStick, PAD.rightStick].every(canBindPadButton)).toBe(true);
  });
  it('names standard buttons', () => {
    expect([PAD.a, PAD.rb, PAD.lt, PAD.start].map(padButtonName)).toEqual(['A', 'RB', 'LT', 'Start']);
    expect(padButtonName(undefined)).toBe('—');
    expect(padButtonName(20)).toBe('Button 20');
  });
});
