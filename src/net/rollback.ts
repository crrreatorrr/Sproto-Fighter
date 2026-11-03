// Rollback netcode session for one online match, independent of transport.
//
// Each frame both players' inputs are needed. The local player's input is
// known (scheduled `inputDelay` frames ahead); the remote player's is
// predicted by repeating their last known input. When the real remote input
// arrives and differs, the session restores the snapshot taken before that
// frame and re-simulates up to the present. Side effects (sounds, callouts)
// are collected per frame and released only once that frame is confirmed,
// so a re-simulated frame never plays a sound twice.
import { hashText, loadState, saveState, step, type CombatState, type Snapshot } from '../core';
import type { InputPacket } from './protocol';

export interface RollbackOptions {
  /** Which fighter this machine controls. */
  localSlot: 0 | 1;
  /** Local inputs apply this many frames after they are sampled (1-3). */
  inputDelay: number;
  /** Never run more than this many frames past the last remote input (default 8). */
  maxRollback?: number;
  /** Exchange a state checksum every this many frames (default 30). */
  checksumEvery?: number;
}

/** Hooks around each simulated frame; events are released when the frame is confirmed. */
export interface FrameObserver<E> {
  before(state: CombatState): unknown;
  after(state: CombatState, token: unknown): E[];
}

export interface Desync { frame: number; local: number; remote: number }

export class RollbackSession<E = never> {
  readonly options: Required<RollbackOptions>;
  /** Next frame to simulate; frames [0, frame) have been simulated (some with predictions). */
  frame = 0;
  /** Highest frame for which both real inputs are known and simulated. */
  confirmedFrame = -1;
  /** Highest frame with a known remote input, all earlier ones known too. */
  remoteFrame = -1;
  /** The remote side's own next frame, from its latest packet (for time sync). */
  remoteCurrentFrame = 0;
  /** The remote side's reported frame advantage over us. */
  remoteAdvantage = 0;
  /** Round-trip time in ms, smoothed; null until measured. */
  rttMs: number | null = null;
  /** Highest local frame the remote side has acknowledged receiving. */
  remoteAck = -1;
  /** Frames re-simulated by the most recent rollback, and in total. */
  lastRollback = 0;
  totalRollbackFrames = 0;
  desync: Desync | null = null;
  /** Both players' inputs for every confirmed frame, in slot order: the match log. */
  readonly confirmedInputs: [number, number][] = [];

  private readonly localInputs = new Map<number, number>();
  private readonly remoteInputs = new Map<number, number>();
  private readonly predictions = new Map<number, number>();
  private readonly snapshots = new Map<number, Snapshot>();
  private readonly pendingEvents = new Map<number, E[]>();
  private readonly localChecksums = new Map<number, number>();
  private readonly remoteChecksums = new Map<number, number>();
  private nextLocalFrame: number;
  private serverStreamed = 0;
  private rollbackFrom: number | null = null;

  constructor(readonly state: CombatState, options: RollbackOptions, private readonly observer?: FrameObserver<E>,
    private readonly onConfirmed?: (frame: number, events: E[]) => void) {
    this.options = { maxRollback: 8, checksumEvery: 30, ...options };
    // Frames before the first delayed local input are neutral for both players.
    for (let f = 0; f < this.options.inputDelay; f++) { this.localInputs.set(f, 0); this.remoteInputs.set(f, 0); }
    this.nextLocalFrame = this.options.inputDelay;
    this.remoteFrame = this.options.inputDelay - 1;
  }

  /** Queue this tick's sampled local input; it applies `inputDelay` frames from now. Returns its frame. */
  addLocalInput(mask: number): number {
    // Never schedule more than inputDelay ahead of the simulation.
    if (this.nextLocalFrame > this.frame + this.options.inputDelay) return this.nextLocalFrame - 1;
    const f = this.nextLocalFrame++;
    this.localInputs.set(f, mask);
    return f;
  }

  /** Local inputs not yet streamed to the hub (each frame once, oldest first, at most 120). */
  takeInputsForServer(): { start: number; masks: number[] } {
    const start = this.serverStreamed, masks: number[] = [];
    while (this.serverStreamed < this.nextLocalFrame && masks.length < 120) masks.push(this.localInputs.get(this.serverStreamed++) ?? 0);
    return { start, masks };
  }

  /** Local inputs the remote side has not acknowledged yet, oldest first. */
  unacknowledgedLocal(): { start: number; inputs: number[] } {
    const start = Math.max(this.remoteAck + 1, this.nextLocalFrame - 32, 0);
    const inputs: number[] = [];
    for (let f = start; f < this.nextLocalFrame; f++) inputs.push(this.localInputs.get(f) ?? 0);
    return { start, inputs };
  }

  /** Record remote inputs starting at frame `start`. Duplicates and old frames are ignored. */
  addRemoteInputs(start: number, inputs: readonly number[], remoteCurrentFrame: number, ack: number): void {
    this.remoteCurrentFrame = Math.max(this.remoteCurrentFrame, remoteCurrentFrame);
    this.remoteAck = Math.max(this.remoteAck, ack);
    inputs.forEach((mask, i) => {
      const f = start + i;
      if (this.remoteInputs.has(f)) return;
      this.remoteInputs.set(f, mask);
      const predicted = this.predictions.get(f);
      if (predicted !== undefined && predicted !== mask) this.rollbackFrom = Math.min(this.rollbackFrom ?? f, f);
      this.predictions.delete(f);
    });
    while (this.remoteInputs.has(this.remoteFrame + 1)) this.remoteFrame++;
  }

  /** Record the remote checksum for a confirmed frame. */
  addRemoteChecksum(frame: number, hash: number): void {
    this.remoteChecksums.set(frame, hash);
    this.compareChecksum(frame);
  }

  /** Checksums of confirmed frames not yet sent: [frame, hash][] (call each tick, send, and forget). */
  takeLocalChecksums(): [number, number][] {
    const out = [...this.localChecksums.entries()].filter(([f]) => !this.sentChecksums.has(f));
    for (const [f] of out) this.sentChecksums.add(f);
    return out;
  }
  private readonly sentChecksums = new Set<number>();

  /** True when advancing would exceed the rollback window: wait for the remote side. */
  get stalled(): boolean {
    return this.frame - (this.remoteFrame + 1) >= this.options.maxRollback || !this.localInputs.has(this.frame);
  }

  /** This side's frame minus the remote side's last reported frame. */
  get localAdvantage(): number { return this.frame - this.remoteCurrentFrame; }

  /**
   * How many frames this machine runs ahead of the remote one, net of latency
   * (both sides' advantages, halved). Above about 1, this side should skip a
   * tick now and then so neither player carries all the rollbacks.
   */
  get framesAhead(): number { return (this.localAdvantage - this.remoteAdvantage) / 2; }

  private lastEchoStamp = 0;
  /** Build the packet to send this tick. `nowMs` stamps it for round-trip measurement. */
  makePacket(nowMs: number): InputPacket {
    const { start, inputs } = this.unacknowledgedLocal();
    return { start, inputs, frame: this.frame, ack: this.remoteFrame, advantage: this.localAdvantage,
      checksums: this.takeLocalChecksums().slice(0, 4), stamp: nowMs >>> 0, echo: this.lastEchoStamp };
  }

  /** Apply a received packet. `nowMs` is used with the echoed stamp to measure round-trip time. */
  receivePacket(p: InputPacket, nowMs: number): void {
    this.addRemoteInputs(p.start, p.inputs, p.frame, p.ack);
    this.remoteAdvantage = p.advantage;
    for (const [frame, hash] of p.checksums) this.addRemoteChecksum(frame, hash);
    this.lastEchoStamp = p.stamp;
    if (p.echo) {
      const sample = ((nowMs >>> 0) - p.echo) >>> 0;
      if (sample < 10000) this.rttMs = this.rttMs === null ? sample : this.rttMs * .875 + sample * .125;
    }
  }

  /** Apply any pending rollback, then simulate one new frame if allowed. Returns whether a frame was simulated. */
  advance(): boolean {
    this.applyRollback();
    if (this.stalled) return false;
    this.simulate(this.frame);
    this.frame++;
    this.updateConfirmed();
    return true;
  }

  private applyRollback(): void {
    const from = this.rollbackFrom;
    this.rollbackFrom = null;
    this.lastRollback = 0;
    if (from === null || from >= this.frame) return;
    const snapshot = this.snapshots.get(from);
    if (!snapshot) throw new Error(`no snapshot for frame ${from} (rollback window exceeded)`);
    loadState(this.state, snapshot);
    for (let f = from; f < this.frame; f++) this.pendingEvents.delete(f);
    const end = this.frame;
    for (let f = from; f < end; f++) this.simulate(f);
    this.lastRollback = end - from;
    this.totalRollbackFrames += this.lastRollback;
    this.updateConfirmed();
  }

  private remoteInputFor(f: number): number {
    const known = this.remoteInputs.get(f);
    if (known !== undefined) return known;
    // Predict: repeat the latest known remote input.
    const predicted = this.remoteInputs.get(this.remoteFrame) ?? 0;
    this.predictions.set(f, predicted);
    return predicted;
  }

  private simulate(f: number): void {
    this.snapshots.set(f, saveState(this.state));
    const local = this.localInputs.get(f) ?? 0, remote = this.remoteInputFor(f);
    const pair: [number, number] = this.options.localSlot === 0 ? [local, remote] : [remote, local];
    const token = this.observer?.before(this.state);
    step(this.state, pair);
    if (this.observer) this.pendingEvents.set(f, this.observer.after(this.state, token));
  }

  private updateConfirmed(): void {
    const limit = Math.min(this.remoteFrame, this.frame - 1);
    while (this.confirmedFrame < limit && this.localInputs.has(this.confirmedFrame + 1)) {
      const f = ++this.confirmedFrame;
      const local = this.localInputs.get(f) ?? 0, remote = this.remoteInputs.get(f) ?? 0;
      this.confirmedInputs.push(this.options.localSlot === 0 ? [local, remote] : [remote, local]);
      const events = this.pendingEvents.get(f) ?? [];
      this.pendingEvents.delete(f);
      this.onConfirmed?.(f, events);
      // State after frame f is the snapshot before f+1, or the live state.
      if ((f + 1) % this.options.checksumEvery === 0) {
        const after = this.snapshots.get(f + 1)?.text ?? saveState(this.state).text;
        this.localChecksums.set(f, hashText(after));
        this.compareChecksum(f);
      }
    }
    // Keep only what a rollback could still need.
    for (const f of this.snapshots.keys()) if (f < this.confirmedFrame) this.snapshots.delete(f);
    for (const f of this.localInputs.keys()) if (f < Math.min(this.confirmedFrame - 64, this.serverStreamed)) this.localInputs.delete(f);
    for (const f of this.remoteInputs.keys()) if (f < this.confirmedFrame - 64) this.remoteInputs.delete(f);
    for (const f of this.localChecksums.keys()) if (f < this.confirmedFrame - 600) { this.localChecksums.delete(f); this.sentChecksums.delete(f); }
  }

  private compareChecksum(frame: number): void {
    const local = this.localChecksums.get(frame), remote = this.remoteChecksums.get(frame);
    if (local === undefined || remote === undefined) return;
    if (local !== remote && !this.desync) this.desync = { frame, local, remote };
    this.remoteChecksums.delete(frame);
  }
}
