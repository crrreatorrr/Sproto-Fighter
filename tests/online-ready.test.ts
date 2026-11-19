import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_ICE_SERVERS, parseIceServers } from '../src/net/peer';
import { OnlineMatch } from '../src/net/onlineMatch';

describe('VITE_ICE_SERVERS', () => {
    const quiet = () => {};
    it('falls back to public STUN when unset, empty or not JSON', () => {
        expect(parseIceServers(undefined, quiet)).toEqual(DEFAULT_ICE_SERVERS);
        expect(parseIceServers('  ', quiet)).toEqual(DEFAULT_ICE_SERVERS);
        expect(parseIceServers('[{urls:', quiet)).toEqual(DEFAULT_ICE_SERVERS);
    });
    it('keeps STUN and TURN entries with credentials', () => {
        const text = JSON.stringify([
            { urls: 'stun:stun.example.com:3478' },
            { urls: ['turn:turn.example.com:3478?transport=udp', 'turns:turn.example.com:5349'], username: 'u', credential: 'p' },
        ]);
        expect(parseIceServers(text, quiet)).toEqual([
            { urls: 'stun:stun.example.com:3478' },
            { urls: ['turn:turn.example.com:3478?transport=udp', 'turns:turn.example.com:5349'], username: 'u', credential: 'p' },
        ]);
    });
    it('accepts a single object', () => {
        expect(parseIceServers('{"urls":"turn:t.example.com","username":"u","credential":"p"}', quiet)).toEqual([{ urls: 'turn:t.example.com', username: 'u', credential: 'p' }]);
    });
    it('drops a TURN entry without credentials and entries without valid urls, with a warning', () => {
        const warnings: string[] = [];
        const servers = parseIceServers(JSON.stringify([{ urls: 'turn:t.example.com' }, { urls: 'http://x' }, { urls: 'stun:s.example.com' }]), m => warnings.push(m));
        expect(servers).toEqual([{ urls: 'stun:s.example.com' }]);
        expect(warnings).toHaveLength(2);
        expect(parseIceServers(JSON.stringify([{ urls: 'turn:t.example.com', username: 'u' }]), quiet)).toEqual(DEFAULT_ICE_SERVERS);
    });
});

describe('online READY barrier', () => {
    afterEach(() => { vi.useRealTimers(); });
    const hooks = { onPhase() {}, onStart() {}, onEvent() {}, onOutcome() {} };
    const receiveReady = (match: OnlineMatch) => (match as unknown as { receiveReady(): void }).receiveReady();
    it('resolves as soon as the other player is ready, also when READY came first', async () => {
        vi.useFakeTimers();
        const match = new OnlineMatch(hooks);
        const waiting = match.peerReadyWithin(6000);
        receiveReady(match);
        await expect(waiting).resolves.toBe(true);
        await expect(match.peerReadyWithin(6000)).resolves.toBe(true);
    });
    it('gives up after the timeout for an opponent that never sends READY', async () => {
        vi.useFakeTimers();
        const match = new OnlineMatch(hooks);
        const waiting = match.peerReadyWithin(6000);
        vi.advanceTimersByTime(5999);
        let settled = false; void waiting.then(() => { settled = true; });
        await Promise.resolve();
        expect(settled).toBe(false);
        vi.advanceTimersByTime(1);
        await expect(waiting).resolves.toBe(false);
    });
    it('sends READY on the signaling channel the hub already relays', () => {
        const match = new OnlineMatch(hooks);
        const sent: unknown[] = [];
        (match as unknown as { duel: { sendSignal(m: unknown): void } }).duel = { sendSignal: m => sent.push(m) };
        match.markReady();
        expect(sent).toEqual([{ kind: 'ready' }]);
    });
});
