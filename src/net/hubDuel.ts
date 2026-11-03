// Client side of the hub's `sproto_duel` match (metaverse-hub
// server/modules/src/sproto_duel.ts): matchmaking, the server-relayed
// WebRTC signaling, the input relay fallback, the stream of this player's own
// inputs (the server simulates the match from both streams and decides the
// winner itself) and the outcome.
import { Client, Session, type Socket, type MatchData, type MatchmakerMatched } from '@heroiclabs/nakama-js';
import { SIM_VERSION } from './simVersion';

export const OP = { HELLO: 1, START: 2, SIGNAL: 3, RELAY: 4, OUTCOME: 6, CANCEL: 7, INPUTS: 8 } as const;
export const GAME_ID = 'sproto-fighter';

export interface DuelStart {
  seat: 0 | 1;
  fighters: [string, string];
  stage: string;
  names: [string, string];
  wager: { stake: number; pot: number } | null;
}
export interface DuelOutcome {
  status: 'settled' | 'refunded' | 'cancelled';
  winnerSeat?: number | null;
  reason: string;
  wager?: boolean;
  stake?: number;
  /** Ticket change per user id (+stake for the winner, -stake for the loser, 0 on refund). */
  deltas?: Record<string, number>;
  seat?: number | null;
}

export interface DuelHandlers {
  onStart(start: DuelStart): void;
  onSignal(message: unknown): void;
  onRelay(packet: ArrayBuffer): void;
  onOutcome(outcome: DuelOutcome): void;
  onError?(error: unknown): void;
}

function toBase64(bytes: ArrayBuffer): string {
  let text = '';
  for (const b of new Uint8Array(bytes)) text += String.fromCharCode(b);
  return btoa(text);
}
function fromBase64(text: string): ArrayBuffer {
  const raw = atob(text), bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes.buffer;
}

/** One queued or running online duel. */
export class HubDuel {
  readonly userId: string;
  private socket: Socket | null = null;
  private matchId: string | null = null;
  private ticket: string | null = null;
  private decoder = new TextDecoder();

  constructor(private readonly client: Client, private readonly session: Session, private readonly handlers: DuelHandlers) {
    this.userId = session.user_id ?? '';
  }

  /** Open the realtime socket. */
  async connect(useSSL: boolean): Promise<void> {
    const socket = this.client.createSocket(useSSL, false);
    socket.onmatchdata = data => this.receive(data);
    socket.onmatchmakermatched = matched => { void this.join(matched); };
    socket.ondisconnect = () => this.handlers.onError?.(new Error('disconnected from hub'));
    await socket.connect(this.session, true);
    this.socket = socket;
  }

  /** Ask the matchmaker for an opponent; `wager` matches only players who also chose to wager. */
  async queue(options: { wager: boolean; fighter: string; stage: string }): Promise<void> {
    if (!this.socket) throw new Error('not connected');
    this.hello = { fighter: options.fighter, stage: options.stage, sim: SIM_VERSION };
    const wager = options.wager ? '1' : '0';
    const query = `+properties.game:${GAME_ID} +properties.wager:${wager} +properties.sim:${SIM_VERSION}`;
    const ticket = await this.socket.addMatchmaker(query, 2, 2, { game: GAME_ID, wager, sim: SIM_VERSION });
    this.ticket = ticket.ticket;
  }
  private hello: { fighter: string; stage: string; sim: string } | null = null;

  /** Leave the queue (before a match is found). */
  async cancelQueue(): Promise<void> {
    if (this.socket && this.ticket) await this.socket.removeMatchmaker(this.ticket).catch(() => undefined);
    this.ticket = null;
  }

  private async join(matched: MatchmakerMatched): Promise<void> {
    try {
      const match = await this.socket!.joinMatch(matched.match_id || undefined, matched.token || undefined);
      this.matchId = match.match_id;
      this.ticket = null;
      this.send(OP.HELLO, this.hello);
    } catch (error) {
      this.handlers.onError?.(error);
    }
  }

  private receive(data: MatchData): void {
    if (data.match_id !== this.matchId) return;
    const text = typeof data.data === 'string' ? data.data : this.decoder.decode(data.data);
    if (data.op_code === OP.RELAY) { this.handlers.onRelay(fromBase64(text)); return; }
    let body: unknown;
    try { body = JSON.parse(text); } catch { return; }
    if (data.op_code === OP.START) this.handlers.onStart(body as DuelStart);
    else if (data.op_code === OP.SIGNAL) this.handlers.onSignal(body);
    else if (data.op_code === OP.OUTCOME || data.op_code === OP.CANCEL) this.handlers.onOutcome(body as DuelOutcome);
  }

  private send(op: number, body: unknown): void {
    if (!this.socket || !this.matchId) return;
    void this.socket.sendMatchState(this.matchId, op, JSON.stringify(body)).catch(error => this.handlers.onError?.(error));
  }

  /** WebRTC offer/answer/ICE, relayed to the opponent by the server. */
  sendSignal(message: unknown): void { this.send(OP.SIGNAL, message); }

  /** Input packet through the server, used when no direct connection could be made. */
  sendRelay(packet: ArrayBuffer): void {
    if (!this.socket || !this.matchId) return;
    void this.socket.sendMatchState(this.matchId, OP.RELAY, toBase64(packet)).catch(() => undefined);
  }

  /** Stream this player's own inputs from frame `start`; the server simulates the match from both streams. */
  sendInputs(start: number, masks: number[]): void { if (masks.length) this.send(OP.INPUTS, { start, masks }); }

  async leave(): Promise<void> {
    await this.cancelQueue();
    if (this.socket && this.matchId) await this.socket.leaveMatch(this.matchId).catch(() => undefined);
    this.matchId = null;
    this.socket?.disconnect(false);
    this.socket = null;
  }
}

/** Nakama client and session for the current hub visit, or null when the game runs standalone. */
export function hubDuelSession(storage: Pick<Storage, 'getItem'>, serverUrl: string, serverKey: string): { client: Client; session: Session; useSSL: boolean } | null {
  let token: string | undefined;
  try { token = JSON.parse(storage.getItem(`hub:${GAME_ID}:session`) ?? 'null')?.token; } catch { /* no session */ }
  if (!token) return null;
  const url = new URL(serverUrl);
  const useSSL = url.protocol === 'https:';
  const client = new Client(serverKey, url.hostname, url.port || (useSSL ? '443' : '80'), useSSL);
  return { client, session: Session.restore(token, ''), useSSL };
}
