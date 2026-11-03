// Arena dimensions, physics constants and input bits.
/** Combat is a serializable, fixed-60Hz state machine. No DOM, clock, randomness, or rendering here. */
export const WIDTH = 1280, FLOOR = 578, TICK_RATE = 60;
// Keep broad heads and throw poses inside the arena camera.
export const WALL = 80;
/** Firm neutral jumps; launch/chase impulses retain their combo-specific values. */
export const GRAVITY = .85;
export const A = { left: 1, right: 2, up: 4, down: 8, light: 16, medium: 32, heavy: 64, launcher: 128, bolt: 256, grab: 512, special: 1024, dash: 2048 } as const;
export type Action = keyof typeof A;
