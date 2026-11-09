import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { CrashGuard, createFrameLoop, type CrashReport } from '../src/crash';
import { showCrashPanel } from '../src/crashPanel';

/** A manual rAF: frames run only when the test pumps them. */
function fakeRaf() {
  const queue: ((now: number) => void)[] = [];
  let scheduled = 0;
  return {
    raf: (cb: (now: number) => void) => {
      scheduled++;
      queue.push(cb);
    },
    pump(n: number) {
      for (let i = 0; i < n; i++) queue.shift()?.(i * 16);
    },
    get scheduled() {
      return scheduled;
    },
    get pending() {
      return queue.length;
    },
  };
}

describe('crash-proof main loop', () => {
  it('keeps scheduling after a frame throws, pauses after 3 failing frames, logs once', () => {
    const log = vi.fn();
    const guard = new CrashGuard({ threshold: 3, log });
    const fatal: CrashReport[] = [];
    guard.onFatal((r) => fatal.push(r));
    const r = fakeRaf();
    const step = vi.fn(() => {
      throw new TypeError("Cannot read properties of undefined (reading 'pos')");
    });
    createFrameLoop(step, { guard, raf: r.raf })(0);
    r.pump(20);

    expect(r.pending).toBe(1); // one throw never stops the loop for good
    expect(r.scheduled).toBe(21);
    expect(step).toHaveBeenCalledTimes(3); // paused after the third failing frame
    expect(guard.paused).toBe(true);
    expect(fatal).toHaveLength(1);
    expect(fatal[0]).toMatchObject({ source: 'frame', fatal: true, count: 3 });
    expect(log).toHaveBeenCalledTimes(1); // not once per frame
  });

  it('a good frame resets the run of failures', () => {
    const guard = new CrashGuard({ threshold: 3, log: () => {} });
    const r = fakeRaf();
    let n = 0;
    createFrameLoop(
      () => {
        if (++n % 3 !== 0) throw new Error('flaky');
      },
      { guard, raf: r.raf },
    )(0);
    r.pump(30);
    expect(guard.paused).toBe(false);
    expect(guard.errors).toBeGreaterThan(10);
  });

  it('a deliberate stop ends the loop without counting an error', () => {
    const guard = new CrashGuard({ log: () => {} });
    const r = fakeRaf();
    let stopped = false;
    const step = vi.fn(() => {
      stopped = true;
    });
    createFrameLoop(step, { guard, raf: r.raf, stop: () => stopped })(0);
    r.pump(5);
    expect(step).toHaveBeenCalledTimes(1);
    expect(r.pending).toBe(0);
    expect(guard.errors).toBe(0);
  });

  it('a throw inside a fixed step stops the remaining steps of that frame', () => {
    // Like stepTo: up to three 1/60 s steps due this frame; the second one throws.
    const ran: number[] = [];
    let accumulator = 3 / 60;
    const stepTo = () => {
      let frame = 0;
      while (accumulator >= 1 / 60) {
        accumulator -= 1 / 60;
        frame++;
        if (frame === 2) throw new Error('step threw');
        ran.push(frame);
      }
    };
    const guard = new CrashGuard({ log: () => {} });
    const r = fakeRaf();
    createFrameLoop(stepTo, { guard, raf: r.raf })(0);
    expect(ran).toEqual([1]);
    expect(guard.errors).toBe(1);
    expect(r.pending).toBe(1);
  });

  it('hands each distinct frame error to the browser once, and does not count it twice', () => {
    const target = new EventTarget() as unknown as Window;
    const surface = vi.fn((err: unknown) => {
      target.dispatchEvent(Object.assign(new Event('error'), { error: err, message: String(err) }));
    });
    const guard = new CrashGuard({ threshold: 1000, log: () => {}, surface });
    guard.install(target);
    const err = new Error('same');
    for (let i = 0; i < 5; i++) guard.report(err, 'frame');
    expect(surface).toHaveBeenCalledTimes(1);
    expect(guard.errors).toBe(5);
  });

  it('logs at most maxLogs distinct errors', () => {
    const log = vi.fn();
    const guard = new CrashGuard({ threshold: 1000, maxLogs: 2, log });
    for (let i = 0; i < 10; i++) guard.report(new Error(`e${i}`), 'frame');
    expect(log).toHaveBeenCalledTimes(2);
    expect(guard.suppressed).toBe(8);
  });
});

describe('page listeners, boot failures and onCrash', () => {
  it('feeds window error and unhandledrejection into the same counter and hook', () => {
    const log = vi.fn();
    const guard = new CrashGuard({ threshold: 3, log });
    const seen: CrashReport[] = [];
    guard.onCrash((r) => seen.push(r));
    const target = new EventTarget() as unknown as Window;
    const uninstall = guard.install(target);

    const err = new Error('async boom');
    target.dispatchEvent(Object.assign(new Event('error'), { error: err, message: err.message }));
    target.dispatchEvent(Object.assign(new Event('unhandledrejection'), { reason: 'nope' }));
    target.dispatchEvent(
      Object.assign(new Event('error'), { error: null, message: 'ResizeObserver loop completed' }),
    );
    expect(guard.errors).toBe(2);
    expect(seen.map((r) => r.source)).toEqual(['error', 'unhandledrejection']);
    expect(seen[0].stack).toContain('async boom');
    expect(log).toHaveBeenCalledTimes(2);

    uninstall();
    target.dispatchEvent(Object.assign(new Event('error'), { error: err, message: err.message }));
    expect(guard.errors).toBe(2);
  });

  it('a boot failure (fighter art) opens the panel at once and keeps the message', () => {
    const guard = new CrashGuard({ log: () => {} });
    const fatal: CrashReport[] = [];
    guard.onFatal((r) => fatal.push(r));
    guard.report(new Error('Failed to load /fighters/pose-atlas/vela.json'), 'boot');
    expect(guard.paused).toBe(true);
    expect(fatal).toHaveLength(1);
    expect(fatal[0]).toMatchObject({
      source: 'boot',
      message: 'Failed to load /fighters/pose-atlas/vela.json',
    });
  });

  it('a throwing listener does not break reporting', () => {
    const guard = new CrashGuard({ threshold: 1, log: () => {} });
    guard.onCrash(() => {
      throw new Error('listener');
    });
    const fatal = vi.fn();
    guard.onFatal(fatal);
    expect(() => guard.report(new Error('x'), 'frame')).not.toThrow();
    expect(fatal).toHaveBeenCalledTimes(1);
  });
});

describe('page errors (review fixes)', () => {
  const errorEvent = (init: object) => Object.assign(new Event('error'), init);
  const rejection = (reason: unknown) => Object.assign(new Event('unhandledrejection'), { reason });

  it('page errors with no failing frame never pause the game (async boot, hidden tab)', () => {
    const guard = new CrashGuard({ threshold: 3, log: () => {}, surface: null, origin: 'https://game.test' });
    const fatal = vi.fn();
    guard.onFatal(fatal);
    const target = new EventTarget() as unknown as Window;
    guard.install(target);
    for (let i = 0; i < 10; i++) {
      target.dispatchEvent(errorEvent({ error: new Error(`e${i}`), message: `e${i}` }));
      target.dispatchEvent(rejection(`r${i}`));
    }
    expect(guard.errors).toBe(20); // still counted and logged
    expect(guard.consecutive).toBe(0);
    expect(fatal).not.toHaveBeenCalled();
    guard.report(new Error('frame'), 'frame'); // one failing frame after them is one, not a pause
    expect(guard.consecutive).toBe(1);
    expect(guard.paused).toBe(false);
  });

  it('page errors extend a streak that a failing frame started', () => {
    const guard = new CrashGuard({ threshold: 3, log: () => {}, surface: null, origin: 'https://game.test' });
    const target = new EventTarget() as unknown as Window;
    guard.install(target);
    guard.report(new Error('frame'), 'frame');
    target.dispatchEvent(rejection('a'));
    expect(guard.paused).toBe(false);
    target.dispatchEvent(rejection('b'));
    expect(guard.paused).toBe(true);
  });

  it('ignores cross-origin and muted errors', () => {
    const guard = new CrashGuard({ log: () => {}, surface: null, origin: 'https://game.test' });
    const target = new EventTarget() as unknown as Window;
    guard.install(target);
    target.dispatchEvent(errorEvent({ error: null, message: 'Script error.' }));
    target.dispatchEvent(
      errorEvent({ error: new Error('ext'), message: 'ext', filename: 'chrome-extension://abc/content.js' }),
    );
    target.dispatchEvent(errorEvent({ error: new Error('ad'), message: 'ad', filename: 'https://ads.example/x.js' }));
    expect(guard.errors).toBe(0);
    target.dispatchEvent(
      errorEvent({ error: new Error('ours'), message: 'ours', filename: 'https://game.test/assets/i.js' }),
    );
    expect(guard.errors).toBe(1);
    target.dispatchEvent(errorEvent({ error: new Error('inline'), message: 'inline', filename: '' }));
    expect(guard.errors).toBe(2);
  });

  it('ignores AbortError and NotAllowedError rejections', () => {
    const guard = new CrashGuard({ log: () => {}, surface: null });
    const target = new EventTarget() as unknown as Window;
    guard.install(target);
    target.dispatchEvent(rejection(new DOMException('The user aborted a request.', 'AbortError')));
    target.dispatchEvent(rejection(new DOMException('play() failed', 'NotAllowedError')));
    expect(guard.errors).toBe(0);
    target.dispatchEvent(rejection(new DOMException('bad', 'NotFoundError')));
    expect(guard.errors).toBe(1);
  });

  it('a visibility change resets the streak', () => {
    const guard = new CrashGuard({ threshold: 3, log: () => {}, surface: null });
    const target = new EventTarget() as unknown as Window;
    const doc = new EventTarget() as unknown as Document;
    const uninstall = guard.install(target, doc);
    guard.report(new Error('a'), 'frame');
    guard.report(new Error('b'), 'frame');
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(guard.consecutive).toBe(0);
    guard.report(new Error('c'), 'frame');
    expect(guard.paused).toBe(false);
    uninstall();
    guard.report(new Error('d'), 'frame');
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(guard.consecutive).toBe(2);
  });

  it('a step that returns false neither grows nor resets the streak', () => {
    const guard = new CrashGuard({ threshold: 3, log: () => {}, surface: null });
    const queue: ((now: number) => void)[] = [];
    let n = 0;
    createFrameLoop(
      () => {
        n++;
        if (n % 10 === 0) throw new Error('step');
        return false;
      },
      { guard, raf: (cb) => queue.push(cb) },
    )(0);
    for (let i = 0; i < 25; i++) queue.shift()?.(i);
    expect(guard.consecutive).toBe(2);
    expect(guard.paused).toBe(false);
    for (let i = 0; i < 5; i++) queue.shift()?.(i);
    expect(guard.paused).toBe(true);
  });
});

describe('frame accounting and the panel (review fixes)', () => {
  /** Like main.ts stepTo + frameTick: a step that always throws, at a given refresh rate. */
  function stepLoop(hz: number) {
    let accumulator = 0;
    const advanceRoundFrame = (): void => {
      throw new Error('advanceRoundFrame threw');
    };
    const stepTo = (dt: number): number | null => {
      accumulator += dt;
      let steps = 0;
      while (accumulator >= 1 / 60) {
        accumulator -= 1 / 60; // consumed before the step runs, as in main.ts
        advanceRoundFrame();
        steps++;
      }
      return steps;
    };
    const guard = new CrashGuard({ threshold: 3, log: () => {}, surface: null });
    const queue: ((now: number) => void)[] = [];
    const judged = (steps: number | null) => steps === null || steps > 0;
    createFrameLoop(() => judged(stepTo(1 / hz)), { guard, raf: (cb) => queue.push(cb) })(0);
    for (let i = 0; i < 400 && !guard.paused; i++) queue.shift()?.(i);
    return guard;
  }

  it('a step that always throws trips the panel at 60, 120 and 144 Hz', () => {
    for (const hz of [60, 120, 144]) expect(stepLoop(hz).paused, `${hz} Hz`).toBe(true);
  });

  it('main.ts judges frames by the steps that ran and guards the hidden-tab clock', () => {
    const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
    expect(main).toMatch(/function stepTo\(now: number\): number \| null/);
    expect(main).toMatch(/return frameJudged\(steps\);\n\}\n/);
    expect(main).toMatch(/function frameJudged\(steps: number \| null\): boolean \{ return steps === null \|\| steps > 0; \}/);
    // The hidden-tab worker clock steps through the guard, never bare.
    expect(main).toMatch(/hiddenClock\.onmessage = \(\) => \{ if \(document\.hidden && online\) crashGuard\.runFrame\(/);
    expect(main.match(/stepTo\(/g)).toHaveLength(3); // definition, frameTick, hidden clock
  });

  it('runFrame counts a throw, resets on a clean run, and does nothing while paused', () => {
    const guard = new CrashGuard({ threshold: 2, log: () => {}, surface: null });
    expect(guard.runFrame(() => { throw new Error('a'); })).toBe(false);
    expect(guard.consecutive).toBe(1);
    expect(guard.runFrame(() => false)).toBe(true);
    expect(guard.consecutive).toBe(1); // nothing to judge
    expect(guard.runFrame(() => {})).toBe(true);
    expect(guard.consecutive).toBe(0);
    guard.runFrame(() => { throw new Error('b'); });
    guard.runFrame(() => { throw new Error('c'); });
    expect(guard.paused).toBe(true);
    const fn = vi.fn();
    expect(guard.runFrame(fn)).toBe(false);
    expect(fn).not.toHaveBeenCalled();
  });

  it('closes an open modal dialog so the panel is not hidden under the top layer', () => {
    type Fake = { tag: string; children: Fake[]; setAttribute(): void; append(...c: Fake[]): void; addEventListener(): void; focus(): void; remove(): void; [k: string]: unknown };
    const el = (tag: string): Fake => ({
      tag,
      children: [],
      setAttribute() {},
      append(...c: Fake[]) { this.children.push(...c); },
      addEventListener() {},
      focus() {},
      remove() {},
    });
    const settings = { open: true, close() { this.open = false; } };
    const story = { open: true, close() { this.open = false; } };
    const doc = {
      createElement: el,
      querySelectorAll: (sel: string) => (sel === 'dialog[open]' ? [settings, story].filter((d) => d.open) : []),
      pointerLockElement: null,
    };
    const appended: Fake[] = [];
    const parent = { ownerDocument: doc, querySelector: () => null, append: (n: Fake) => appended.push(n) };
    showCrashPanel(
      { source: 'frame', message: 'x', stack: '', count: 3, fatal: true },
      { parent: parent as unknown as HTMLElement },
    );
    expect(settings.open).toBe(false);
    expect(story.open).toBe(false);
    expect(appended).toHaveLength(1);
  });
});
