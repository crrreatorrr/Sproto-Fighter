// Match logs: everything needed to replay an online match, so the hub server
// can verify the winner by re-running the deterministic simulation.
//
// Inputs are stored as run-length-encoded frame pairs, base64. A pair is
// [player 1 mask, player 2 mask]; held inputs repeat for many frames, so a
// minute of play is typically well under 2 KB. Pure JavaScript (no atob,
// Buffer or TextEncoder), so it also runs in Nakama's JavaScript runtime.
import { createState, hashState, step, PLAYABLE_FIGHTERS, type PlayableFighterId } from '../core';

export const MAX_LOG_FRAMES = 60 * 60 * 10; // 10 minutes

export interface MatchLog {
  v: 1;
  /** Simulation fingerprint (src/net/simVersion.ts); must equal the verifier's. */
  sim: string;
  fighters: [PlayableFighterId, PlayableFighterId];
  /** Number of frames in `inputs`. */
  frames: number;
  /** Base64 of u16 triples [run length, p1 mask, p2 mask]. */
  inputs: string;
}

export interface ReplayResult {
  /** 0 or 1 for a KO win, 2 for a double KO, null if nobody won within the log. */
  winner: 0 | 1 | 2 | null;
  /** Frame at which the match ended (or the log ran out). */
  frame: number;
  hash: number;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBase64(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = bytes[i + 1], c = bytes[i + 2];
    const n = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + (b === undefined ? '=' : B64[(n >> 6) & 63]) + (c === undefined ? '=' : B64[n & 63]);
  }
  return out;
}

function base64ToBytes(text: string): number[] | null {
  if (text.length % 4 !== 0) return null;
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i += 4) {
    const chars = text.slice(i, i + 4);
    const values = [...chars].map(ch => ch === '=' ? 0 : B64.indexOf(ch));
    if (values.some(v => v < 0)) return null;
    const n = (values[0] << 18) | (values[1] << 12) | (values[2] << 6) | values[3];
    bytes.push((n >> 16) & 255);
    if (chars[2] !== '=') bytes.push((n >> 8) & 255);
    if (chars[3] !== '=') bytes.push(n & 255);
  }
  return bytes;
}

/** Encode per-frame input pairs. */
export function encodeInputs(pairs: readonly (readonly [number, number])[]): string {
  const bytes: number[] = [];
  const push16 = (v: number) => { bytes.push(v & 255, (v >> 8) & 255); };
  for (let i = 0; i < pairs.length;) {
    const [a, b] = pairs[i];
    let run = 1;
    while (i + run < pairs.length && run < 65535 && pairs[i + run][0] === a && pairs[i + run][1] === b) run++;
    push16(run); push16(a); push16(b);
    i += run;
  }
  return bytesToBase64(bytes);
}

/** Decode to per-frame input pairs; null if malformed or longer than `maxFrames`. */
export function decodeInputs(text: string, maxFrames = MAX_LOG_FRAMES): [number, number][] | null {
  const bytes = base64ToBytes(text);
  if (!bytes || bytes.length % 6 !== 0) return null;
  const pairs: [number, number][] = [];
  for (let i = 0; i < bytes.length; i += 6) {
    const run = bytes[i] | (bytes[i + 1] << 8), a = bytes[i + 2] | (bytes[i + 3] << 8), b = bytes[i + 4] | (bytes[i + 5] << 8);
    if (run === 0 || a > 4095 || b > 4095 || pairs.length + run > maxFrames) return null;
    for (let r = 0; r < run; r++) pairs.push([a, b]);
  }
  return pairs;
}

/** Validate a log's shape (not its outcome). Returns an error code or null. */
export function checkLog(log: unknown, sim: string): string | null {
  const l = log as Partial<MatchLog> | null;
  if (!l || l.v !== 1) return 'bad_version';
  if (l.sim !== sim) return 'sim_mismatch';
  if (!Array.isArray(l.fighters) || l.fighters.length !== 2 || !l.fighters.every(f => (PLAYABLE_FIGHTERS as readonly string[]).includes(f))) return 'bad_fighters';
  if (typeof l.frames !== 'number' || !Number.isInteger(l.frames) || l.frames < 0 || l.frames > MAX_LOG_FRAMES) return 'bad_frames';
  if (typeof l.inputs !== 'string') return 'bad_inputs';
  return null;
}

/** Re-run a match from its log. Throws on a malformed log (callers run checkLog first). */
export function replayMatch(log: MatchLog): ReplayResult {
  const pairs = decodeInputs(log.inputs);
  if (!pairs || pairs.length !== log.frames) throw new Error('malformed inputs');
  const s = createState(log.fighters[0], 'versus', log.fighters[1]);
  for (let f = 0; f < pairs.length && s.winner === null; f++) step(s, pairs[f]);
  return { winner: s.winner as ReplayResult['winner'], frame: s.frame, hash: hashState(s) };
}
