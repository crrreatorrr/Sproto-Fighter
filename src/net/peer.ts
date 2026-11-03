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
  | { kind: 'ice'; candidate: RTCIceCandidateInit };

/** ICE servers from VITE_ICE_SERVERS (JSON array of RTCIceServer), else a public STUN server. */
export function defaultIceServers(): RTCIceServer[] {
  const configured = import.meta.env.VITE_ICE_SERVERS;
  if (configured) {
    try { return JSON.parse(configured) as RTCIceServer[]; } catch { console.warn('VITE_ICE_SERVERS is not valid JSON'); }
  }
  return [{ urls: 'stun:stun.l.google.com:19302' }];
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
