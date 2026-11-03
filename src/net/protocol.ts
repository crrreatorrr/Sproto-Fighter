// Wire format for rollback packets. Binary, little-endian, sent over an
// unreliable, unordered channel: every packet repeats all unacknowledged
// inputs, so a lost packet costs nothing and late ones are harmless.
//
//   u8  type (1 = inputs)
//   u32 start frame of the inputs below
//   u32 sender's next frame to simulate
//   i32 ack: highest frame of the receiver's inputs the sender has
//   i8  sender's frame advantage (its frame minus our last reported frame)
//   u8  input count (0-32)
//   u16 × count input masks
//   u8  checksum count (0-4), then per checksum: u32 frame, u32 hash
//   u32 sender's ping stamp (ms, wraps), u32 echoed stamp from the receiver
//
// A typical packet (4 unacknowledged inputs, no checksum) is 30 bytes.

export interface InputPacket {
  start: number;
  frame: number;
  ack: number;
  advantage: number;
  inputs: number[];
  checksums: [number, number][];
  stamp: number;
  echo: number;
}

export function encodePacket(p: InputPacket): ArrayBuffer {
  const inputs = p.inputs.slice(0, 32), checksums = p.checksums.slice(0, 4);
  const buffer = new ArrayBuffer(1 + 4 + 4 + 4 + 1 + 1 + inputs.length * 2 + 1 + checksums.length * 8 + 8);
  const v = new DataView(buffer);
  let o = 0;
  v.setUint8(o, 1); o += 1;
  v.setUint32(o, p.start, true); o += 4;
  v.setUint32(o, p.frame, true); o += 4;
  v.setInt32(o, p.ack, true); o += 4;
  v.setInt8(o, Math.max(-128, Math.min(127, Math.round(p.advantage)))); o += 1;
  v.setUint8(o, inputs.length); o += 1;
  for (const mask of inputs) { v.setUint16(o, mask, true); o += 2; }
  v.setUint8(o, checksums.length); o += 1;
  for (const [frame, hash] of checksums) { v.setUint32(o, frame, true); v.setUint32(o + 4, hash >>> 0, true); o += 8; }
  v.setUint32(o, p.stamp >>> 0, true); v.setUint32(o + 4, p.echo >>> 0, true);
  return buffer;
}

/** Decode a packet; returns null for anything malformed (never throws on bad input). */
export function decodePacket(buffer: ArrayBuffer): InputPacket | null {
  try {
    const v = new DataView(buffer);
    let o = 0;
    if (v.getUint8(o) !== 1) return null; o += 1;
    const start = v.getUint32(o, true); o += 4;
    const frame = v.getUint32(o, true); o += 4;
    const ack = v.getInt32(o, true); o += 4;
    const advantage = v.getInt8(o); o += 1;
    const count = v.getUint8(o); o += 1;
    if (count > 32) return null;
    const inputs: number[] = [];
    for (let i = 0; i < count; i++) { inputs.push(v.getUint16(o, true)); o += 2; }
    const checksumCount = v.getUint8(o); o += 1;
    if (checksumCount > 4) return null;
    const checksums: [number, number][] = [];
    for (let i = 0; i < checksumCount; i++) { checksums.push([v.getUint32(o, true), v.getUint32(o + 4, true)]); o += 8; }
    const stamp = v.getUint32(o, true), echo = v.getUint32(o + 4, true); o += 8;
    if (o !== buffer.byteLength) return null;
    return { start, frame, ack, advantage, inputs, checksums, stamp, echo };
  } catch {
    return null;
  }
}
