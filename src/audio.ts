/**
 * Sound for the client. Combat effects are recorded clips, decoded before they are needed.
 * Win, lose, round start and the story loop stay synthesised. The front-end menus play a
 * recorded theme and one recorded click. Trenches, City, Yacht, Castle, Verse, Bar and Ranch
 * fights play recorded loops. Presentation only. The simulation never imports this module and
 * nothing here feeds back into combat. Browsers block audio until the player does something,
 * so the context is created (or resumed) on the first key, click or controller press.
 */
import type { SoundName } from './audioEvents';
import { combatClip, combatClipPaths } from './combatSfx';

export type MusicTrack = 'menu' | 'fight' | 'story';
/** Recorded bed for the fight track. Other stages keep the synthesised fight loop. */
export type FightBed = 'synth' | 'trenches' | 'yacht' | 'city' | 'castle' | 'verse' | 'bar' | 'ranch';
export type RecordedBed = Exclude<FightBed, 'synth'>;
export interface Volume { master: number; sfx: number; music: number }
export interface PlayOptions { volume?: number; pan?: number; delay?: number; /** Fighter whose team-special recording should play. */ fighterId?: string }

/** 24 bars of 4/4 at 128 BPM. The Trenches fight theme loops for exactly this long. */
export const TRENCHES_LOOP_SECONDS = 45.000687;
/** Priming samples ffmpeg wrote into trenches_fight_loop.mp3 (start time 0.023021 s at 48 kHz). */
export const TRENCHES_ENCODER_DELAY_SAMPLES = 1105;
export const TRENCHES_MUSIC_RATE = 48000;
export const TRENCHES_MUSIC_PATH = 'audio/music/trenches_fight_loop.mp3';
/** 32 bars of 4/4 at 125 BPM. Yacht, City, Castle, Verse, Bar and Ranch fight themes are written to this length. */
export const GROOVE_LOOP_SECONDS = 61.44;
/** The same ffmpeg priming (start time 0.023021 s at 48 kHz) sits on each of those masters. */
export const GROOVE_ENCODER_DELAY_SAMPLES = 1105;
export const GROOVE_MUSIC_RATE = 48000;
/** The yacht master is about 0.4 dB quieter than the other fight loops. */
export const YACHT_TRIM_DB = 0.4;
export const YACHT_TRIM_GAIN = 10 ** (YACHT_TRIM_DB / 20);
/** Fade the recorded fight theme in when a fight starts and out when it ends or the player leaves. */
const FIGHT_FADE = .6;
/** Equal-power join used only when a trimmed wrap would click. Eight milliseconds at 48 kHz. */
export const SEAM_CROSSFADE_SECONDS = 0.008;

export const DEFAULT_VOLUME: Volume = { master: .8, sfx: .9, music: .45 };
export const AUDIO_SETTINGS_KEY = 'sproto-arena-audio';
/** 30 bars of 4/4 at 125 BPM. The menu theme loops for exactly this long. */
export const MENU_LOOP_SECONDS = 57.6;
/** Priming samples ffmpeg wrote into menu_theme_loop.mp3 (start time 0.023021s at 48 kHz). */
export const MENU_ENCODER_DELAY_SAMPLES = 1105;
export const MENU_MUSIC_RATE = 48000;
export const MENU_MUSIC_PATH = 'audio/music/menu_theme_loop.mp3';
export const UI_SELECT_PATH = 'audio/sfx/ui_select.mp3';
/** The click peaks near 0.21. This brings one press up beside the other effects. */
const UI_SELECT_GAIN = 3.2;
/** Fade the menu theme out when a fight (or anything outside the menus) takes over. */
const MENU_FADE_OUT = .45;

const clamp01 = (v: unknown, fallback: number) => typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback;
/** Stored volumes, tolerant of a missing or damaged entry. */
export function readVolume(raw: string | null | undefined): Volume {
    try {
        const saved = raw ? JSON.parse(raw) : null;
        return { master: clamp01(saved?.master, DEFAULT_VOLUME.master), sfx: clamp01(saved?.sfx, DEFAULT_VOLUME.sfx), music: clamp01(saved?.music, DEFAULT_VOLUME.music) };
    } catch { return { ...DEFAULT_VOLUME }; }
}

/**
 * Trim MP3 encoder padding so a recorded loop lasts `loopSeconds`.
 * Chrome's decodeAudioData (and ffmpeg) drop the priming delay and one trailing MP3 frame,
 * leaving a short tail after the musical length. A decoder that keeps the priming has those
 * samples at the head (1105 at 48 kHz). When the buffer is at least one delay longer than
 * the loop, that head is skipped. Otherwise the loop starts at 0 and the tail is cut.
 */
export function sampleLoopRegion(bufferLength: number, sampleRate: number, loopSeconds: number, encoderDelaySamples: number, nominalRate: number): { loopStart: number; loopEnd: number } {
    const rate = sampleRate > 0 ? sampleRate : nominalRate;
    const loopSamples = Math.round(loopSeconds * rate);
    const delaySamples = Math.round(encoderDelaySamples * rate / nominalRate);
    const length = Math.max(0, Math.floor(bufferLength));
    const extra = length - loopSamples;
    const head = extra >= delaySamples ? delaySamples : 0;
    const end = Math.min(length, head + loopSamples);
    return { loopStart: head / rate, loopEnd: end / rate };
}
/** Menu theme: 57.6 s, priming skipped only when the decoder kept it. */
export const menuLoopRegion = (bufferLength: number, sampleRate: number) =>
    sampleLoopRegion(bufferLength, sampleRate, MENU_LOOP_SECONDS, MENU_ENCODER_DELAY_SAMPLES, MENU_MUSIC_RATE);
export const trenchesLoopRegion = (bufferLength: number, sampleRate: number) =>
    sampleLoopRegion(bufferLength, sampleRate, TRENCHES_LOOP_SECONDS, TRENCHES_ENCODER_DELAY_SAMPLES, TRENCHES_MUSIC_RATE);

export interface FightBedSpec {
    path: string;
    loopSeconds: number;
    encoderDelaySamples: number;
    sampleRate: number;
    /** Linear multiplier on the music slider. 1 leaves the master as delivered. */
    gain: number;
}
export const FIGHT_BED_SPECS: Record<RecordedBed, FightBedSpec> = {
    trenches: { path: TRENCHES_MUSIC_PATH, loopSeconds: TRENCHES_LOOP_SECONDS, encoderDelaySamples: TRENCHES_ENCODER_DELAY_SAMPLES, sampleRate: TRENCHES_MUSIC_RATE, gain: 1 },
    yacht: { path: 'audio/music/yacht_groove_loop.mp3', loopSeconds: GROOVE_LOOP_SECONDS, encoderDelaySamples: GROOVE_ENCODER_DELAY_SAMPLES, sampleRate: GROOVE_MUSIC_RATE, gain: YACHT_TRIM_GAIN },
    city: { path: 'audio/music/city_house_loop_v2.mp3', loopSeconds: GROOVE_LOOP_SECONDS, encoderDelaySamples: GROOVE_ENCODER_DELAY_SAMPLES, sampleRate: GROOVE_MUSIC_RATE, gain: 1 },
    castle: { path: 'audio/music/castle_vampire_loop_v2.mp3', loopSeconds: GROOVE_LOOP_SECONDS, encoderDelaySamples: GROOVE_ENCODER_DELAY_SAMPLES, sampleRate: GROOVE_MUSIC_RATE, gain: 1 },
    verse: { path: 'audio/music/verse_alien_electro_loop.mp3', loopSeconds: GROOVE_LOOP_SECONDS, encoderDelaySamples: GROOVE_ENCODER_DELAY_SAMPLES, sampleRate: GROOVE_MUSIC_RATE, gain: 1 },
    bar: { path: 'audio/music/bar_rock_loop.mp3', loopSeconds: GROOVE_LOOP_SECONDS, encoderDelaySamples: GROOVE_ENCODER_DELAY_SAMPLES, sampleRate: GROOVE_MUSIC_RATE, gain: 1 },
    ranch: { path: 'audio/music/ranch_country_loop_v2.mp3', loopSeconds: GROOVE_LOOP_SECONDS, encoderDelaySamples: GROOVE_ENCODER_DELAY_SAMPLES, sampleRate: GROOVE_MUSIC_RATE, gain: 1 },
};
/** Menu zone id to fight bed. City's zone is `circuit` and Castle's is `throne`. Hatchery stays synthesised. */
const ZONE_BEDS: Record<string, FightBed> = { trenches: 'trenches', yacht: 'yacht', circuit: 'city', throne: 'castle', verse: 'verse', bar: 'bar', ranch: 'ranch' };
export function fightBedForZone(zone: string): FightBed {
    return ZONE_BEDS[zone] ?? 'synth';
}
export function isRecordedBed(bed: FightBed): bed is RecordedBed {
    return Object.prototype.hasOwnProperty.call(FIGHT_BED_SPECS, bed);
}
export function fightBedLoopRegion(bed: RecordedBed, bufferLength: number, sampleRate: number): { loopStart: number; loopEnd: number } {
    const spec = FIGHT_BED_SPECS[bed];
    return sampleLoopRegion(bufferLength, sampleRate, spec.loopSeconds, spec.encoderDelaySamples, spec.sampleRate);
}

/**
 * A wrap step well above the groove's own sample-to-sample motion is a click.
 * Quiet zero-crossing seams (Trenches, Yacht, Castle) stay under the floor.
 */
export function seamIsClick(jump: number, p95: number): boolean {
    return jump > 0.02 && jump > p95 * 2.5 + 1e-4;
}
/**
 * Ramp the wrap step out over `fade` samples so the last sample equals the first.
 * Mixing the head waveform in would play the attack twice; this only removes the click.
 */
export function crossfadeChannel(channel: { [index: number]: number; length: number }, start: number, end: number, fade: number): void {
    const width = Math.max(0, Math.min(Math.floor(fade), Math.floor((end - start) / 2)));
    if (width < 2 || start < 0 || end > channel.length) return;
    const delta = channel[start] - channel[end - 1];
    for (let i = 0; i < width; i++) channel[end - width + i] += delta * ((i + 1) / width);
}
/** Returns true when a channel was crossfaded. Clean seams are left untouched. */
export function softenLoopSeam(buffer: { numberOfChannels: number; sampleRate: number; getChannelData: (channel: number) => Float32Array }, region: { loopStart: number; loopEnd: number }): boolean {
    const rate = buffer.sampleRate > 0 ? buffer.sampleRate : GROOVE_MUSIC_RATE;
    const start = Math.round(region.loopStart * rate), end = Math.round(region.loopEnd * rate);
    if (end - start < 8) return false;
    let softened = false;
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const data = buffer.getChannelData(channel);
        if (end > data.length || start < 0) continue;
        const jump = Math.abs(data[start] - data[end - 1]);
        const window = Math.min(2000, end - start - 1);
        const deltas: number[] = [];
        for (let i = end - window; i < end; i++) deltas.push(Math.abs(data[i] - data[i - 1]));
        deltas.sort((a, b) => a - b);
        const p95 = deltas[Math.floor(deltas.length * 0.95)] ?? 0;
        if (!seamIsClick(jump, p95)) continue;
        crossfadeChannel(data, start, end, Math.round(SEAM_CROSSFADE_SECONDS * rate));
        softened = true;
    }
    return softened;
}

export interface MusicCueInput {
    feedbackHold: boolean;
    selectionOpen: boolean;
    storyOpen: boolean;
    /** Result screen, with no story cinematic still playing. */
    fightOver: boolean;
    bed: FightBed;
}
/** Which bed and track to play. Menus win over the story map, and the map wins over a finished fight. */
export function fightMusicCue(input: MusicCueInput): { track: MusicTrack | null; bed: FightBed } {
    const bed = input.bed;
    if (input.feedbackHold) return { track: null, bed };
    if (input.selectionOpen) return { track: 'menu', bed };
    if (input.storyOpen) return { track: 'story', bed };
    if (input.fightOver) return { track: null, bed };
    return { track: 'fight', bed };
}

const assetUrl = (path: string): string => {
    const base = typeof document === 'undefined' ? '/' : ((document.querySelector?.('meta[name="sproto-asset-base"]') as HTMLMetaElement | null)?.content || '/');
    return base + path.replace(/^\/+/, '');
};

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

const UI_SOUNDS = new Set<SoundName>(['menuMove', 'menuConfirm', 'menuBack']);

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
    let menuBuffer: AudioBuffer | null = null, uiBuffer: AudioBuffer | null = null;
    let menuBytes: ArrayBuffer | null = null, uiBytes: ArrayBuffer | null = null;
    let menuSource: AudioBufferSourceNode | null = null, menuGain: GainNode | null = null;
    let menuStarts = 0, samplesRequested = false, menuFailed = false, uiFailed = false, decoding = false;
    let fightBed: FightBed = 'synth';
    let fightSource: AudioBufferSourceNode | null = null, fightFade: GainNode | null = null, fightLevel: GainNode | null = null;
    let playingBuffer: AudioBuffer | null = null;
    let fightStarts = 0;
    const loaded = new Map<RecordedBed, { bytes: ArrayBuffer | null; buffer: AudioBuffer | null; failed: boolean; softened: boolean }>();
    const slot = (bed: RecordedBed) => {
        let row = loaded.get(bed);
        if (!row) { row = { bytes: null, buffer: null, failed: false, softened: false }; loaded.set(bed, row); }
        return row;
    };
    /** A recorded bed that has not failed still owns the fight track, even while its file is loading. */
    const wantsRecorded = (bed: FightBed) => isRecordedBed(bed) && !slot(bed).failed;
    const bedGain = () => isRecordedBed(fightBed) ? FIGHT_BED_SPECS[fightBed].gain : 1;
    const lastAt = new Map<SoundName, number>();
    const combatBytes = new Map<string, ArrayBuffer>(), combatBuffers = new Map<string, AudioBuffer>(), combatFailed = new Set<string>();
    const applyVolume = () => {
        if (!ctx || !master || !sfx || !musicBus) return;
        master.gain.setTargetAtTime(volume.master, ctx.currentTime, .02);
        sfx.gain.setTargetAtTime(volume.sfx, ctx.currentTime, .02);
        musicBus.gain.setTargetAtTime(volume.music * .5, ctx.currentTime, .05);
        // Leave a fade-out alone. menuSource is cleared when the fade starts.
        if (menuGain && menuSource) menuGain.gain.setTargetAtTime(volume.music, ctx.currentTime, .05);
        // The fade envelope owns fightFade. fightLevel follows the music slider, including mute, times any per-track trim.
        if (fightLevel && fightSource) fightLevel.gain.setTargetAtTime(volume.music * bedGain(), ctx.currentTime, .05);
    };
    function requestSamples(): void {
        if (samplesRequested || typeof fetch !== 'function') return;
        samplesRequested = true;
        const pull = (path: string) => fetch(assetUrl(path)).then(response => response.ok ? response.arrayBuffer() : Promise.reject(new Error(path))).catch(() => null);
        const beds = Object.keys(FIGHT_BED_SPECS) as RecordedBed[];
        void Promise.all([
            pull(MENU_MUSIC_PATH),
            pull(UI_SELECT_PATH),
            ...beds.map(bed => pull(FIGHT_BED_SPECS[bed].path)),
        ]).then(([menu, click, ...fights]) => {
            menuBytes = menu; uiBytes = click;
            if (!menu) menuFailed = true;
            if (!click) uiFailed = true;
            beds.forEach((bed, index) => {
                const row = slot(bed);
                row.bytes = fights[index];
                if (!fights[index]) row.failed = true;
            });
            if (ctx) void decodeReady();
        });
        // Combat clips start downloading with the menu theme so a hit does not wait on the network.
        for (const path of combatClipPaths()) {
            void pull(path).then(bytes => {
                if (!bytes) { combatFailed.add(path); return; }
                combatBytes.set(path, bytes);
                if (ctx) void decodeReady();
            });
        }
    }
    async function decodeReady(): Promise<void> {
        const combatReady = [...combatBytes.keys()].filter(path => !combatBuffers.has(path) && !combatFailed.has(path));
        if (!ctx || decoding) return;
        const beds = (Object.keys(FIGHT_BED_SPECS) as RecordedBed[]).filter(bed => slot(bed).bytes && !slot(bed).buffer && !slot(bed).failed);
        if (!menuBytes && !menuFailed && !uiBytes && !uiFailed && !beds.length && combatReady.length === 0) return;
        // Held across the awaits so a second unlock cannot start a second copy of a loop.
        decoding = true;
        try {
            if (menuBytes && !menuBuffer && !menuFailed) {
                try { menuBuffer = await ctx.decodeAudioData(menuBytes.slice(0)); }
                catch { menuFailed = true; }
            }
            if (uiBytes && !uiBuffer && !uiFailed) {
                try { uiBuffer = await ctx.decodeAudioData(uiBytes.slice(0)); }
                catch { uiFailed = true; }
            }
            for (const bed of beds) {
                const row = slot(bed);
                if (!row.bytes || row.buffer || row.failed) continue;
                try { row.buffer = await ctx.decodeAudioData(row.bytes.slice(0)); }
                catch { row.failed = true; }
            }
            // Start the loops before the combat clips, so a long decode does not hold the theme.
            if (track === 'menu') ensureMenu();
            if (track === 'fight') ensureFight();
            for (const path of combatReady) {
                const bytes = combatBytes.get(path);
                if (!bytes || combatBuffers.has(path) || combatFailed.has(path)) continue;
                try { combatBuffers.set(path, await ctx.decodeAudioData(bytes.slice(0))); }
                catch { combatFailed.add(path); }
            }
        } finally { decoding = false; }
        const moreCombat = [...combatBytes.keys()].some(path => !combatBuffers.has(path) && !combatFailed.has(path));
        const menuWaiting = !!menuBytes && !menuBuffer && !menuFailed;
        const uiWaiting = !!uiBytes && !uiBuffer && !uiFailed;
        const bedsWaiting = (Object.keys(FIGHT_BED_SPECS) as RecordedBed[]).some(bed => slot(bed).bytes && !slot(bed).buffer && !slot(bed).failed);
        if (moreCombat || menuWaiting || uiWaiting || bedsWaiting) { void decodeReady(); return; }
        if (track === 'menu') ensureMenu();
        if (track === 'fight') ensureFight();
    }
    /** One decoded combat clip through the effects bus. `level` may exceed 1 for a quiet file. */
    function playCombat(buffer: AudioBuffer, at: number, level: number, pan: number): void {
        if (!ctx || !sfx) return;
        const source = ctx.createBufferSource(), gain = ctx.createGain();
        source.buffer = buffer;
        gain.gain.value = level;
        source.connect(gain);
        let out: AudioNode = gain;
        if (pan && typeof ctx.createStereoPanner === 'function') {
            const panner = ctx.createStereoPanner(); panner.pan.value = Math.max(-1, Math.min(1, pan));
            gain.connect(panner); out = panner;
        }
        out.connect(sfx);
        source.start(at);
    }
    /** Create or resume the context. Returns false where Web Audio is missing or still blocked. */
    function unlock(): boolean {
        if (typeof window === 'undefined') return false;
        if (!ctx) {
            const Context = (window as unknown as AudioWindow).AudioContext ?? (window as unknown as AudioWindow).webkitAudioContext;
            if (!Context) return false;
            // The recorded loops are 48 kHz. Playing them at another rate resamples the wrap and can click.
            try { ctx = new Context({ sampleRate: GROOVE_MUSIC_RATE }); }
            catch { try { ctx = new Context(); } catch { return false; } }
            master = ctx.createGain(); sfx = ctx.createGain(); musicBus = ctx.createGain();
            // A gentle limiter keeps stacked impacts from clipping.
            const limiter = ctx.createDynamicsCompressor();
            limiter.threshold.value = -10; limiter.ratio.value = 8; limiter.attack.value = .003; limiter.release.value = .15;
            sfx.connect(master); musicBus.connect(master); master.connect(limiter).connect(ctx.destination);
            master.gain.value = volume.master; sfx.gain.value = volume.sfx; musicBus.gain.value = volume.music * .5;
        }
        const pending = ctx.state === 'suspended' ? ctx.resume().then(() => undefined, () => undefined) : Promise.resolve();
        void pending.then(() => decodeReady());
        if (track === 'menu') ensureMenu();
        else if (track === 'fight') ensureFight();
        else if (track && !timer) startMusic();
        return ctx.state === 'running';
    }
    /** One overlapping copy of the recorded click. The three menu names share it. */
    function playUi(name: SoundName, at: number, level: number): void {
        if (!ctx || !sfx) return;
        if (uiBuffer) {
            const source = ctx.createBufferSource(), gain = ctx.createGain();
            source.buffer = uiBuffer;
            gain.gain.value = UI_SELECT_GAIN * level;
            source.connect(gain).connect(sfx);
            source.start(at);
            return;
        }
        const gain = ctx.createGain();
        gain.gain.value = level;
        gain.connect(sfx);
        SOUND_VOICES[name](ctx, gain, at);
    }
    function play(name: SoundName, options: PlayOptions = {}): void {
        if (!ctx || !sfx || ctx.state !== 'running' || volume.master * volume.sfx <= 0) return;
        const at = ctx.currentTime + (options.delay ?? 0);
        const level = Math.max(0, Math.min(1.5, options.volume ?? 1));
        // Menu clicks retrigger freely. A new press must not cut off or wait out the last one.
        if (UI_SOUNDS.has(name)) { playUi(name, at, level); played++; lastSound = name; return; }
        // The same combat sound twice inside 30 ms (both fighters trading) is one sound.
        if (!options.delay && at - (lastAt.get(name) ?? -1) < .03) return;
        lastAt.set(name, at);
        const clip = combatClip(name, options.fighterId);
        const buffer = clip ? combatBuffers.get(clip.path) : undefined;
        if (clip && buffer) {
            // Per-clip gain sits after the cue level. The bus limiter keeps a boosted file from clipping.
            playCombat(buffer, at, level * clip.gain, options.pan ?? 0);
            played++; lastSound = name;
            return;
        }
        const gain = ctx.createGain(); gain.gain.value = level;
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
    function stopFightSample(fade: number): void {
        if (!fightSource || !fightFade || !ctx) { fightSource = null; fightFade = null; fightLevel = null; playingBuffer = null; return; }
        const source = fightSource, fadeNode = fightFade;
        fightSource = null; fightFade = null; fightLevel = null; playingBuffer = null;
        const now = ctx.currentTime;
        fadeNode.gain.cancelScheduledValues(now);
        fadeNode.gain.setValueAtTime(Math.max(0, Math.min(1, fadeNode.gain.value)), now);
        try {
            if (fade <= 0) source.stop();
            else { fadeNode.gain.linearRampToValueAtTime(0, now + fade); source.stop(now + fade + .02); }
        } catch { /* already stopped */ }
    }
    /** Start the recorded fight loop once, faded in. Calling it again while it plays does not restart it. */
    function startFightSample(): void {
        if (!ctx || !master || fightSource || track !== 'fight' || !isRecordedBed(fightBed) || ctx.state !== 'running') return;
        const row = slot(fightBed);
        if (!row.buffer) return;
        const region = fightBedLoopRegion(fightBed, row.buffer.length, row.buffer.sampleRate);
        if (!(region.loopEnd > region.loopStart)) return;
        if (!row.softened) { softenLoopSeam(row.buffer, region); row.softened = true; }
        if (timer) { clearInterval(timer); timer = undefined; playing = null; }
        const source = ctx.createBufferSource(), fade = ctx.createGain(), level = ctx.createGain();
        source.buffer = row.buffer;
        source.loop = true;
        source.loopStart = region.loopStart;
        source.loopEnd = region.loopEnd;
        const now = ctx.currentTime;
        fade.gain.setValueAtTime(0, now);
        fade.gain.linearRampToValueAtTime(1, now + FIGHT_FADE);
        level.gain.value = volume.music * FIGHT_BED_SPECS[fightBed].gain;
        source.connect(fade).connect(level).connect(master);
        source.start(now, region.loopStart);
        fightSource = source; fightFade = fade; fightLevel = level; playingBuffer = row.buffer; fightStarts++;
    }
    /** Recorded theme when that bed's file decoded; the synthesised fight loop if it did not, or the stage has none. */
    function ensureFight(): void {
        if (track !== 'fight') return;
        if (wantsRecorded(fightBed)) { if (isRecordedBed(fightBed) && slot(fightBed).buffer) startFightSample(); return; }
        if (ctx && !timer) startMusic();
    }
    function startMusic(): void {
        // A recorded loop replaces its pattern. The pattern is only the fallback when that file never decodes.
        if (!ctx || timer || (track === 'menu' && menuBuffer)) return;
        if (track === 'fight' && wantsRecorded(fightBed)) return;
        nextStep = ctx.currentTime + .08; step = 0; playing = track;
        // Look a little ahead of the clock so a busy frame never drops a note.
        timer = setInterval(() => {
            if (!ctx || !track || ctx.state !== 'running' || (track === 'menu' && menuBuffer)) return;
            if (track === 'fight' && wantsRecorded(fightBed)) return;
            if (playing !== track) { playing = track; step = 0; nextStep = Math.max(nextStep, ctx.currentTime + .05); }
            if (nextStep < ctx.currentTime - .5) nextStep = ctx.currentTime + .05;
            const song = SONGS[track];
            while (nextStep < ctx.currentTime + .25) { scheduleStep(song, step++, nextStep); nextStep += 60 / song.bpm / 4; }
        }, 60);
    }
    function stopMenuSample(fade: number): void {
        if (!menuSource || !menuGain || !ctx) { menuSource = null; menuGain = null; return; }
        const source = menuSource, gain = menuGain;
        menuSource = null; menuGain = null;
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(Math.max(0, gain.gain.value), now);
        try {
            if (fade <= 0) source.stop();
            else { gain.gain.linearRampToValueAtTime(0, now + fade); source.stop(now + fade + .02); }
        } catch { /* already stopped */ }
    }
    /** Start the recorded loop once. Calling it again while it plays does not restart it. */
    function startMenuSample(): void {
        if (!ctx || !master || !menuBuffer || menuSource || track !== 'menu' || ctx.state !== 'running') return;
        const region = menuLoopRegion(menuBuffer.length, menuBuffer.sampleRate);
        if (!(region.loopEnd > region.loopStart)) return;
        if (timer) { clearInterval(timer); timer = undefined; playing = null; }
        const source = ctx.createBufferSource(), gain = ctx.createGain();
        source.buffer = menuBuffer;
        source.loop = true;
        source.loopStart = region.loopStart;
        source.loopEnd = region.loopEnd;
        gain.gain.value = volume.music;
        source.connect(gain).connect(master);
        source.start(ctx.currentTime, region.loopStart);
        menuSource = source; menuGain = gain; menuStarts++;
    }
    /** Recorded theme when the file decoded; the synthesised menu loop only if it did not. */
    function ensureMenu(): void {
        if (track !== 'menu') return;
        if (menuBuffer) { startMenuSample(); return; }
        if (menuFailed && ctx && !timer) startMusic();
    }
    /** Switch the looping track; `null` stops music. Safe to call every frame. */
    function music(next: MusicTrack | null): void {
        if (next === track) {
            if (next === 'menu') ensureMenu();
            if (next === 'fight') ensureFight();
            return;
        }
        const previous = track;
        track = next;
        if (previous === 'menu') stopMenuSample(MENU_FADE_OUT);
        if (previous === 'fight') stopFightSample(FIGHT_FADE);
        if (!next) { clearInterval(timer); timer = undefined; playing = null; return; }
        if (next === 'menu') { clearInterval(timer); timer = undefined; playing = null; ensureMenu(); return; }
        if (next === 'fight' && wantsRecorded(fightBed)) {
            clearInterval(timer); timer = undefined; playing = null;
            ensureFight();
            return;
        }
        if (ctx && !timer) startMusic();
    }
    /** Which fight bed the current stage uses. Safe to call every frame. Ignored until the track is `fight`. */
    function fightBedSet(next: FightBed): void {
        if (next === fightBed) { if (track === 'fight') ensureFight(); return; }
        fightBed = next;
        if (track !== 'fight') return;
        stopFightSample(FIGHT_FADE);
        clearInterval(timer); timer = undefined; playing = null;
        if (wantsRecorded(next)) { ensureFight(); return; }
        if (ctx) startMusic();
    }
    function setVolume(next: Partial<Volume>): void {
        volume = { master: clamp01(next.master, volume.master), sfx: clamp01(next.sfx, volume.sfx), music: clamp01(next.music, volume.music) };
        try { storage?.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(volume)); } catch { /* not saved */ }
        applyVolume();
    }
    if (typeof window !== 'undefined') requestSamples();
    return {
        unlock, play, music, setVolume,
        fightBed: fightBedSet,
        volume: (): Volume => ({ ...volume }),
        /** Read-only state for QA and the browser smoke check. */
        status: () => ({
            context: ctx?.state ?? 'none', unlocked: ctx?.state === 'running', track, played, lastSound, menuStarts,
            menuLoop: menuSource ? { start: menuSource.loopStart, end: menuSource.loopEnd } : null,
            combatReady: combatBuffers.size, combatClips: combatClipPaths().length,
            fightBed, fightStarts,
            fightMusic: fightLevel && fightSource ? fightLevel.gain.value : null,
            fightLoop: fightSource && playingBuffer ? { start: fightSource.loopStart, end: fightSource.loopEnd, rate: playingBuffer.sampleRate, samples: playingBuffer.length } : null,
        }),
    };
}
export type GameAudio = ReturnType<typeof createAudio>;
