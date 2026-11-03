// One online duel from queue to outcome: hub matchmaking (HubDuel), the peer
// link (PeerLink), and the rollback session that owns the match state.
// main.ts calls tick() once per simulation frame with this player's input.
import { createState, type CombatState, type PlayableFighterId } from '../core';
import { HubDuel, hubDuelSession, type DuelOutcome, type DuelStart } from './hubDuel';
import { PeerLink, type LinkKind, type SignalMessage } from './peer';
import { decodePacket, encodePacket } from './protocol';
import { RollbackSession } from './rollback';

export type OnlinePhase = 'connecting' | 'queued' | 'starting' | 'playing' | 'finished' | 'failed';

/** Side effects released only for confirmed frames (never twice through a rollback). */
export type OnlineEvent = { kind: 'ko' } | { kind: 'move'; slot: number; move: string };

export interface OnlineHooks {
  onPhase(phase: OnlinePhase, detail?: string): void;
  onStart(start: DuelStart): void;
  onEvent(event: OnlineEvent): void;
  onOutcome(outcome: DuelOutcome): void;
}

export interface OnlineStatus {
  link: LinkKind;
  pingMs: number | null;
  rollback: number;
  framesAhead: number;
  stalled: boolean;
}

export class OnlineMatch {
  phase: OnlinePhase = 'connecting';
  session: RollbackSession<OnlineEvent> | null = null;
  start: DuelStart | null = null;
  /** The hub match id once started (for a rematch with the same opponent). */
  matchId: string | null = null;
  outcome: DuelOutcome | null = null;
  /** The KO as confirmed by both players' inputs (a predicted KO can still be rolled back). */
  confirmedKo = false;
  private duel: HubDuel | null = null;
  private peer: PeerLink | null = null;
  private ticks = 0;

  constructor(private readonly hooks: OnlineHooks, private readonly inputDelay = 2) {}

  /** True when this page was opened from the hub, so online play is possible. */
  static available(): boolean {
    return OnlineMatch.connection() !== null;
  }

  private static connection() {
    let storage: Storage | null = null;
    try { storage = window.sessionStorage; } catch { /* storage disabled */ }
    if (!storage) return null;
    const url = (import.meta.env.VITE_NAKAMA_URL || 'http://127.0.0.1:7350').replace(/\/$/, '');
    const key = import.meta.env.VITE_NAKAMA_SERVER_KEY ?? (import.meta.env.DEV ? 'defaultkey' : '');
    return hubDuelSession(storage, url, key);
  }

  private setPhase(phase: OnlinePhase, detail?: string): void {
    this.phase = phase;
    this.hooks.onPhase(phase, detail);
  }

  /** Connect to the hub and queue for an opponent. */
  /** `rematchOf` pairs only with the opponent from that match (who must also choose Rematch). */
  async queue(options: { wager: boolean; fighter: PlayableFighterId; stage: string; rematchOf?: string }): Promise<void> {
    const connection = OnlineMatch.connection();
    if (!connection) { this.setPhase('failed', 'Online play needs the hub: open Sproto Fighter from the arcade cabinet.'); return; }
    this.duel = new HubDuel(connection.client, connection.session, {
      onStart: start => this.begin(start),
      onSignal: message => void this.peer?.handleSignal(message as SignalMessage),
      onRelay: packet => this.peer?.handleRelay(packet),
      onOutcome: outcome => { this.outcome = outcome; this.setPhase(outcome.status === 'cancelled' ? 'failed' : 'finished', outcome.reason); this.hooks.onOutcome(outcome); },
      onError: error => { if (this.phase !== 'finished') this.setPhase('failed', error instanceof Error ? error.message : String(error)); },
    });
    try {
      await this.duel.connect(connection.useSSL);
      await this.duel.queue(options);
      this.setPhase('queued');
    } catch (error) {
      this.setPhase('failed', error instanceof Error ? error.message : 'Could not reach the hub.');
    }
  }

  private begin(start: DuelStart): void {
    this.start = start;
    this.matchId = this.duel?.currentMatchId ?? null;
    const state = createState(start.fighters[0] as PlayableFighterId, 'versus', start.fighters[1] as PlayableFighterId);
    const observer = {
      before: (s: CombatState) => ({ winner: s.winner, moves: s.fighters.map(f => f.move?.id ?? null) }),
      after: (s: CombatState, token: unknown): OnlineEvent[] => {
        const before = token as { winner: number | null; moves: (string | null)[] };
        const events: OnlineEvent[] = [];
        if (before.winner === null && s.winner !== null) events.push({ kind: 'ko' });
        s.fighters.forEach((f, slot) => { const id = f.move?.id ?? null; if (id && id !== before.moves[slot]) events.push({ kind: 'move', slot, move: id }); });
        return events;
      },
    };
    this.session = new RollbackSession<OnlineEvent>(state, { localSlot: start.seat, inputDelay: this.inputDelay }, observer, (_frame, events) => {
      for (const event of events) { if (event.kind === 'ko') this.confirmedKo = true; this.hooks.onEvent(event); }
    });
    this.peer = new PeerLink({
      initiator: start.seat === 0,
      signal: message => this.duel?.sendSignal(message),
      relay: packet => this.duel?.sendRelay(packet),
      onPacket: packet => { const p = decodePacket(packet); if (p) this.session?.receivePacket(p, performance.now()); },
    });
    this.setPhase('starting');
    this.hooks.onStart(start);
  }

  /** The fight has begun on this side (after the countdown). */
  play(): void { if (this.phase === 'starting') this.setPhase('playing'); }

  /**
   * One simulation tick: schedule this player's input, simulate (or wait if the
   * other side is too far behind), and send packets. A side running ahead sits
   * out one tick in four so both share the rollbacks.
   */
  tick(localInput: number): void {
    const session = this.session;
    if (!session || this.phase !== 'playing') return;
    this.ticks++;
    if (!(session.framesAhead >= 2 && this.ticks % 4 === 0)) {
      session.addLocalInput(localInput);
      session.advance();
    }
    this.peer?.send(encodePacket(session.makePacket(performance.now())));
    if (this.ticks % 6 === 0) {
      const stream = session.takeInputsForServer();
      this.duel?.sendInputs(stream.start, stream.masks);
    }
  }

  /** Keep packets and the server stream flowing after the KO, until the outcome arrives. */
  linger(): void {
    const session = this.session;
    if (!session || this.phase === 'failed' || this.outcome) return;
    session.addLocalInput(0);
    session.advance();
    this.peer?.send(encodePacket(session.makePacket(performance.now())));
    const stream = session.takeInputsForServer();
    this.duel?.sendInputs(stream.start, stream.masks);
  }

  status(): OnlineStatus {
    const s = this.session;
    return { link: this.peer?.kind ?? 'relay', pingMs: s?.rttMs ?? null, rollback: s?.lastRollback ?? 0, framesAhead: s?.framesAhead ?? 0, stalled: s?.stalled ?? false };
  }

  /** Leave the queue or the match (mid-match, this forfeits after the reconnect window). */
  async leave(): Promise<void> {
    this.peer?.close();
    this.peer = null;
    await this.duel?.leave();
    this.duel = null;
  }
}
