/**
 * Sound for the client: synthesised effects and music on Web Audio, so no audio files ship.
 * Presentation only. The simulation never imports this module and nothing here feeds back
 * into combat. Browsers block audio until the player does something, so the context is
 * created (or resumed) on the first key, click or controller press.
 */
import type { SoundName } from './audioEvents';

export type MusicTrack = 'menu' | 'fight' | 'story';
export interface Volume { master: number; sfx: number; music: number }
export interface PlayOptions { volume?: number; pan?: number; delay?: number }

export const DEFAULT_VOLUME: Volume = { master: .8, sfx: .9, music: .45 };
export const AUDIO_SETTINGS_KEY = 'sproto-arena-audio';
const clamp01 = (v: unknown, fallback: number) => typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback;
/** Stored volumes, tolerant of a missing or damaged entry. */
export function readVolume(raw: string | null | undefined): Volume {
    try {
        const saved = raw ? JSON.parse(raw) : null;
        return { master: clamp01(saved?.master, DEFAULT_VOLUME.master), sfx: clamp01(saved?.sfx, DEFAULT_VOLUME.sfx), music: clamp01(saved?.music, DEFAULT_VOLUME.music) };
    } catch { return { ...DEFAULT_VOLUME }; }
}

type Voice = (ctx: AudioContext, out: AudioNode, at: number) => void;
type Wave = OscillatorType;
/** One oscillator with a pitch slide and a short percussive envelope. */
function tone(ctx: AudioContext, out: AudioNode, at: number, wave: Wave, from: number, to: number, length: number, level: number, attack = .004): void {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(from, at);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), at + length);
    gain.gain.setValueAtTime(.0001, at);
    gain.gain.exponentialRampToValueAtTime(level, at + attack);
    gain.gain.exponentialRampToValueAtTime(.0001, at + length);
    osc.connect(gain).connect(out);
    osc.start(at); osc.stop(at + length + .02);
}
let noiseBuffer: AudioBuffer | null = null;
/** Filtered noise: the body of every impact and swing. The filter sweeps from `from` to `to`. */
function noise(ctx: AudioContext, out: AudioNode, at: number, type: BiquadFilterType, from: number, to: number, length: number, level: number, q = 1): void {
    if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
        noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        // A fixed sequence, so every session sounds the same.
        let seed = 22222;
        for (let i = 0; i < data.length; i++) { seed = seed * 16807 % 2147483647; data[i] = seed / 1073741823.5 - 1; }
    }
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = noiseBuffer; source.loop = true;
    filter.type = type; filter.Q.value = q;
    filter.frequency.setValueAtTime(from, at);
    filter.frequency.exponentialRampToValueAtTime(Math.max(30, to), at + length);
    gain.gain.setValueAtTime(.0001, at);
    gain.gain.exponentialRampToValueAtTime(level, at + .005);
    gain.gain.exponentialRampToValueAtTime(.0001, at + length);
    source.connect(filter).connect(gain).connect(out);
    source.start(at, (at * 7919) % .9); source.stop(at + length + .02);
}
const notes = (ctx: AudioContext, out: AudioNode, at: number, wave: Wave, pitches: number[], step: number, level: number) =>
    pitches.forEach((pitch, i) => tone(ctx, out, at + i * step, wave, pitch, pitch, step * 1.6, level));

/** Every sound the game can ask for. tests/audio-events.test.ts checks the list is complete. */
export const SOUND_VOICES: Record<SoundName, Voice> = {
    hitLight: (c, o, t) => { noise(c, o, t, 'bandpass', 2200, 700, .06, .5, 1.2); tone(c, o, t, 'sine', 240, 120, .06, .5); },
    hitMedium: (c, o, t) => { noise(c, o, t, 'bandpass', 1600, 420, .1, .6, 1); tone(c, o, t, 'triangle', 190, 80, .1, .7); },
    hitHeavy: (c, o, t) => { noise(c, o, t, 'lowpass', 3200, 180, .2, .8); tone(c, o, t, 'sine', 150, 42, .22, 1); tone(c, o, t, 'square', 90, 60, .05, .25); },
    hitSpecial: (c, o, t) => { noise(c, o, t, 'lowpass', 4200, 160, .3, .8); tone(c, o, t, 'sine', 170, 38, .32, 1); tone(c, o, t, 'sawtooth', 320, 960, .22, .3); },
    block: (c, o, t) => { tone(c, o, t, 'square', 940, 700, .05, .28); noise(c, o, t, 'highpass', 3000, 5000, .04, .3); },
    justDefend: (c, o, t) => { tone(c, o, t, 'sine', 1320, 1320, .18, .4); tone(c, o, t + .03, 'sine', 1980, 1980, .2, .3); },
    throw: (c, o, t) => { noise(c, o, t, 'bandpass', 320, 1300, .16, .5, 1.5); tone(c, o, t + .12, 'sine', 130, 55, .14, .7); },
    tech: (c, o, t) => { tone(c, o, t, 'square', 620, 1240, .07, .3); tone(c, o, t + .08, 'square', 620, 1240, .07, .3); },
    whooshLight: (c, o, t) => noise(c, o, t, 'bandpass', 900, 2600, .07, .22, 2),
    whooshMedium: (c, o, t) => noise(c, o, t, 'bandpass', 600, 2200, .11, .28, 2),
    whooshHeavy: (c, o, t) => noise(c, o, t, 'bandpass', 320, 1800, .17, .36, 1.6),
    shot: (c, o, t) => { tone(c, o, t, 'sawtooth', 760, 190, .16, .3); noise(c, o, t, 'bandpass', 2400, 900, .1, .2, 2); },
    shotImpact: (c, o, t) => { noise(c, o, t, 'bandpass', 1000, 500, .11, .5, 1.4); tone(c, o, t, 'sine', 320, 100, .12, .5); },
    ko: (c, o, t) => { tone(c, o, t, 'sine', 120, 28, .7, 1); noise(c, o, t, 'lowpass', 2600, 90, .6, .7); tone(c, o, t, 'sawtooth', 440, 110, .45, .3); },
    roundStart: (c, o, t) => notes(c, o, t, 'square', [440, 660], .12, .25),
    win: (c, o, t) => notes(c, o, t, 'triangle', [523.25, 659.25, 783.99, 1046.5], .11, .45),
    lose: (c, o, t) => notes(c, o, t, 'triangle', [392, 329.63, 261.63, 220], .15, .4),
    menuMove: (c, o, t) => tone(c, o, t, 'square', 660, 660, .035, .14),
    menuConfirm: (c, o, t) => notes(c, o, t, 'square', [660, 990], .06, .18),
    menuBack: (c, o, t) => notes(c, o, t, 'square', [440, 330], .06, .18),
    dash: (c, o, t) => noise(c, o, t, 'bandpass', 500, 3000, .12, .22, 1.2),
    charge: (c, o, t) => notes(c, o, t, 'sine', [880, 1108.73, 1318.51], .07, .3),
    teamSpecial: (c, o, t) => { tone(c, o, t, 'sawtooth', 200, 1200, .42, .35, .05); noise(c, o, t, 'bandpass', 400, 4000, .42, .3, 1); },
};

/** Step-sequenced loops. A row is one bar of sixteenth notes; 0 is a rest, other numbers are semitones above the root. */
interface Song { bpm: number; root: number; bass: number[]; lead: number[]; hat: number[]; leadWave: Wave; bassWave: Wave }
const _ = 0;
export const SONGS: Record<MusicTrack, Song> = {
    menu: { bpm: 92, root: 110, bassWave: 'triangle', leadWave: 'sine',
        bass: [1, _, _, _, _, _, 1, _, 8, _, _, _, _, _, 8, _, 6, _, _, _, _, _, 6, _, 4, _, _, _, 8, _, _, _],
        lead: [13, _, 16, _, 20, _, 16, _, 13, _, 16, _, 20, _, 25, _, 11, _, 14, _, 18, _, 14, _, 9, _, 13, _, 16, _, 20, _],
        hat: [_, _, _, _, 1, _, _, _, _, _, _, _, 1, _, _, _] },
    fight: { bpm: 138, root: 82.41, bassWave: 'sawtooth', leadWave: 'square',
        bass: [1, _, 1, 1, _, 1, _, 1, 1, _, 1, 1, _, 1, 4, _, 6, _, 6, 6, _, 6, _, 6, 8, _, 8, 8, _, 11, 8, _],
        lead: [25, _, _, 28, _, _, 30, _, 32, _, 30, _, 28, _, _, _, 30, _, _, 33, _, _, 35, _, 32, _, 30, _, 28, _, 25, _],
        hat: [1, _, 1, _, 2, _, 1, _, 1, _, 1, 1, 2, _, 1, _] },
    story: { bpm: 104, root: 98, bassWave: 'triangle', leadWave: 'triangle',
        bass: [1, _, _, _, 8, _, _, _, 5, _, _, _, 8, _, _, _, 3, _, _, _, 10, _, _, _, 6, _, _, _, 8, _, _, _],
        lead: [13, _, _, 17, _, _, 20, _, 25, _, _, 20, _, 17, _, _, 15, _, _, 18, _, _, 22, _, 20, _, 18, _, 15, _, _, _],
        hat: [_, _, 1, _, _, _, 1, _, _, _, 1, _, _, _, 1, 1] },
};
const semitone = (root: number, step: number) => root * 2 ** ((step - 1) / 12);

interface AudioWindow { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
export function createAudio(storage: Pick<Storage, 'getItem' | 'setItem'> | null = null) {
    let ctx: AudioContext | null = null, master: GainNode | null = null, sfx: GainNode | null = null, musicBus: GainNode | null = null;
    let volume = readVolume((() => { try { return storage?.getItem(AUDIO_SETTINGS_KEY); } catch { return null; } })());
    let track: MusicTrack | null = null, playing: MusicTrack | null = null, step = 0, nextStep = 0, timer: ReturnType<typeof setInterval> | undefined;
    let played = 0, lastSound: SoundName | null = null;
    const lastAt = new Map<SoundName, number>();
    const applyVolume = () => {
        if (!ctx || !master || !sfx || !musicBus) return;
        master.gain.setTargetAtTime(volume.master, ctx.currentTime, .02);
        sfx.gain.setTargetAtTime(volume.sfx, ctx.currentTime, .02);
        musicBus.gain.setTargetAtTime(volume.music * .5, ctx.currentTime, .05);
    };
    /** Create or resume the context. Returns false where Web Audio is missing or still blocked. */
    function unlock(): boolean {
        if (typeof window === 'undefined') return false;
        if (!ctx) {
            const Context = (window as unknown as AudioWindow).AudioContext ?? (window as unknown as AudioWindow).webkitAudioContext;
            if (!Context) return false;
            try { ctx = new Context(); } catch { return false; }
            master = ctx.createGain(); sfx = ctx.createGain(); musicBus = ctx.createGain();
            // A gentle limiter keeps stacked impacts from clipping.
            const limiter = ctx.createDynamicsCompressor();
            limiter.threshold.value = -10; limiter.ratio.value = 8; limiter.attack.value = .003; limiter.release.value = .15;
            sfx.connect(master); musicBus.connect(master); master.connect(limiter).connect(ctx.destination);
            master.gain.value = volume.master; sfx.gain.value = volume.sfx; musicBus.gain.value = volume.music * .5;
        }
        if (ctx.state === 'suspended') void ctx.resume().catch(() => { /* still blocked; the next input tries again */ });
        if (track && !timer) startMusic();
        return ctx.state === 'running';
    }
    function play(name: SoundName, options: PlayOptions = {}): void {
        if (!ctx || !sfx || ctx.state !== 'running' || volume.master * volume.sfx <= 0) return;
        const at = ctx.currentTime + (options.delay ?? 0);
        // The same sound twice inside 30 ms (both fighters trading) is one sound.
        if (!options.delay && at - (lastAt.get(name) ?? -1) < .03) return;
        lastAt.set(name, at);
        const gain = ctx.createGain(); gain.gain.value = Math.max(0, Math.min(1.5, options.volume ?? 1));
        let out: AudioNode = gain;
        if (options.pan && typeof ctx.createStereoPanner === 'function') {
            const panner = ctx.createStereoPanner(); panner.pan.value = Math.max(-1, Math.min(1, options.pan));
            gain.connect(panner); out = panner;
        }
        out.connect(sfx);
        SOUND_VOICES[name](ctx, gain, at);
        played++; lastSound = name;
    }
    function scheduleStep(song: Song, index: number, at: number): void {
        if (!ctx || !musicBus) return;
        const sixteenth = 60 / song.bpm / 4;
        const bass = song.bass[index % song.bass.length], lead = song.lead[index % song.lead.length], hat = song.hat[index % song.hat.length];
        if (bass) tone(ctx, musicBus, at, song.bassWave, semitone(song.root, bass), semitone(song.root, bass), sixteenth * 1.8, .32, .01);
        if (lead) tone(ctx, musicBus, at, song.leadWave, semitone(song.root, lead), semitone(song.root, lead), sixteenth * 1.5, .14, .01);
        if (hat) noise(ctx, musicBus, at, 'highpass', hat === 2 ? 1800 : 6000, hat === 2 ? 900 : 7000, hat === 2 ? .09 : .03, hat === 2 ? .22 : .1);
    }
    function startMusic(): void {
        if (!ctx || timer) return;
        nextStep = ctx.currentTime + .08; step = 0; playing = track;
        // Look a little ahead of the clock so a busy frame never drops a note.
        timer = setInterval(() => {
            if (!ctx || !track || ctx.state !== 'running') return;
            if (playing !== track) { playing = track; step = 0; nextStep = Math.max(nextStep, ctx.currentTime + .05); }
            if (nextStep < ctx.currentTime - .5) nextStep = ctx.currentTime + .05;
            const song = SONGS[track];
            while (nextStep < ctx.currentTime + .25) { scheduleStep(song, step++, nextStep); nextStep += 60 / song.bpm / 4; }
        }, 60);
    }
    /** Switch the looping track; `null` stops music. Safe to call every frame. */
    function music(next: MusicTrack | null): void {
        if (next === track) return;
        track = next;
        if (!next) { clearInterval(timer); timer = undefined; playing = null; return; }
        if (ctx && !timer) startMusic();
    }
    function setVolume(next: Partial<Volume>): void {
        volume = { master: clamp01(next.master, volume.master), sfx: clamp01(next.sfx, volume.sfx), music: clamp01(next.music, volume.music) };
        try { storage?.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(volume)); } catch { /* not saved */ }
        applyVolume();
    }
    return {
        unlock, play, music, setVolume,
        volume: (): Volume => ({ ...volume }),
        /** Read-only state for QA and the browser smoke check. */
        status: () => ({ context: ctx?.state ?? 'none', unlocked: ctx?.state === 'running', track, played, lastSound }),
    };
}
export type GameAudio = ReturnType<typeof createAudio>;
