// Direct peer-to-peer link for rollback packets: a WebRTC data channel that is
// unordered with no retransmits (a lost input packet is repeated by the next one
// anyway). Until the channel opens, and if it never does (strict NATs without a
// TURN server), packets travel through the hub match's relay instead, so a
// match never waits on WebRTC.

export type LinkKind = 'relay' | 'direct';

export interface PeerLinkOptions {
  /** Seat 0 creates the channel and the offer; seat 1 answers. */
  initiator: boolean;
  /** Send a signaling message to the other player (through the hub). */
  signal(message: SignalMessage): void;
  /** Send a packet through the hub relay. */
  relay(packet: ArrayBuffer): void;
  /** A packet arrived from the other player, by either path. */
  onPacket(packet: ArrayBuffer): void;
  iceServers?: RTCIceServer[];
}

export type SignalMessage =
  | { kind: 'offer' | 'answer'; sdp: string }
  | { kind: 'ice'; candidate: RTCIceCandidateInit }
  /** This side has loaded the match and is waiting to start (see OnlineMatch.markReady).
   * Older clients ignore it; PeerLink never acts on it. */
  | { kind: 'ready' };

export const DEFAULT_ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

/**
 * Parse VITE_ICE_SERVERS: a JSON array of RTCIceServer (a single object is also
 * accepted), for example a TURN server for players behind strict NATs:
 *
 *   [{"urls":"stun:stun.l.google.com:19302"},
 *    {"urls":["turn:turn.example.com:3478?transport=udp","turns:turn.example.com:5349"],
 *     "username":"sproto","credential":"<turn password>"}]
 *
 * Each entry needs `urls` (a stun:, turn: or turns: URL, or a list of them). A
 * turn:/turns: entry also needs string `username` and `credential`; an entry
 * without them is dropped with a warning, since the browser would reject the
 * whole configuration. Invalid JSON or no valid entry falls back to public STUN.
 * TURN credentials in a Vite variable are visible to every player: use
 * short-lived or restricted credentials.
 */
export function parseIceServers(configured: string | undefined, warn: (message: string) => void = message => console.warn(message)): RTCIceServer[] {
  if (!configured?.trim()) return DEFAULT_ICE_SERVERS;
  let parsed: unknown;
  try { parsed = JSON.parse(configured); } catch { warn('VITE_ICE_SERVERS is not valid JSON; using public STUN'); return DEFAULT_ICE_SERVERS; }
  const entries = Array.isArray(parsed) ? parsed : [parsed];
  const servers: RTCIceServer[] = [];
  entries.forEach((entry, index) => {
    const e = entry as { urls?: unknown; username?: unknown; credential?: unknown } | null;
    const urls = typeof e?.urls === 'string' ? [e.urls] : Array.isArray(e?.urls) ? e.urls : [];
    // stuns: is in the spec but browsers reject it, which would break the whole list.
    if (!urls.length || !urls.every(url => typeof url === 'string' && /^(stun|turn|turns):/i.test(url))) {
      warn(`VITE_ICE_SERVERS entry ${index} has no valid stun:/turn: urls; ignored`); return;
    }
    const relay = urls.some(url => /^turns?:/i.test(url));
    if (relay && (typeof e!.username !== 'string' || typeof e!.credential !== 'string')) {
      warn(`VITE_ICE_SERVERS entry ${index} is a TURN server without a string username and credential; ignored`); return;
    }
    const server: RTCIceServer = { urls: typeof e!.urls === 'string' ? e!.urls : urls as string[] };
    if (typeof e!.username === 'string') server.username = e!.username;
    if (typeof e!.credential === 'string') server.credential = e!.credential;
    servers.push(server);
  });
  if (!servers.length) { warn('VITE_ICE_SERVERS has no usable entry; using public STUN'); return DEFAULT_ICE_SERVERS; }
  return servers;
}

/** ICE servers from VITE_ICE_SERVERS (see parseIceServers), else a public STUN server. */
export function defaultIceServers(): RTCIceServer[] {
  return parseIceServers(import.meta.env.VITE_ICE_SERVERS);
}

export class PeerLink {
  kind: LinkKind = 'relay';
  private readonly pc: RTCPeerConnection | null;
  private channel: RTCDataChannel | null = null;
  private readonly pendingIce: RTCIceCandidateInit[] = [];

  constructor(private readonly options: PeerLinkOptions) {
    if (typeof RTCPeerConnection === 'undefined') { this.pc = null; return; }
    const pc = new RTCPeerConnection({ iceServers: options.iceServers ?? defaultIceServers() });
    this.pc = pc;
    pc.onicecandidate = e => { if (e.candidate) options.signal({ kind: 'ice', candidate: e.candidate.toJSON() }); };
    if (options.initiator) {
      this.adopt(pc.createDataChannel('rollback', { ordered: false, maxRetransmits: 0 }));
      void pc.createOffer().then(offer => pc.setLocalDescription(offer)).then(() => options.signal({ kind: 'offer', sdp: pc.localDescription!.sdp }))
        .catch(error => console.warn('WebRTC offer failed; staying on the relay', error));
    } else {
      pc.ondatachannel = e => this.adopt(e.channel);
    }
  }

  private adopt(channel: RTCDataChannel): void {
    channel.binaryType = 'arraybuffer';
    channel.onopen = () => { this.kind = 'direct'; };
    channel.onclose = () => { this.kind = 'relay'; };
    channel.onmessage = e => { if (e.data instanceof ArrayBuffer) this.options.onPacket(e.data); };
    this.channel = channel;
  }

  /** Handle a signaling message from the other player. */
  async handleSignal(message: SignalMessage): Promise<void> {
    const pc = this.pc;
    if (!pc) return;
    try {
      if (message.kind === 'offer' && !this.options.initiator) {
        await pc.setRemoteDescription({ type: 'offer', sdp: message.sdp });
        await pc.setLocalDescription(await pc.createAnswer());
        this.options.signal({ kind: 'answer', sdp: pc.localDescription!.sdp });
        this.flushIce();
      } else if (message.kind === 'answer' && this.options.initiator) {
        await pc.setRemoteDescription({ type: 'answer', sdp: message.sdp });
        this.flushIce();
      } else if (message.kind === 'ice') {
        if (pc.remoteDescription) await pc.addIceCandidate(message.candidate);
        else this.pendingIce.push(message.candidate);
      }
    } catch (error) {
      console.warn('WebRTC signaling failed; staying on the relay', error);
    }
  }

  private flushIce(): void {
    for (const candidate of this.pendingIce.splice(0)) void this.pc!.addIceCandidate(candidate).catch(() => undefined);
  }

  /** A packet arrived through the hub relay. */
  handleRelay(packet: ArrayBuffer): void { this.options.onPacket(packet); }

  /** Send by the direct channel when open, else through the relay. */
  send(packet: ArrayBuffer): void {
    if (this.channel?.readyState === 'open') {
      try { this.channel.send(packet); return; } catch { /* fall back to the relay */ }
    }
    this.options.relay(packet);
  }

  close(): void {
    this.channel?.close();
    this.pc?.close();
  }
}
