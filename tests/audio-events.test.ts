import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { A, createState, cpuInput, step, type CombatState, type Effect } from '../src/core';
import { SOUND_NAMES, SoundTracker, effectSound, hitSound, panFor, whooshSound } from '../src/audioEvents';
import { AUDIO_MIX_VERSION, AUDIO_SETTINGS_KEY, CITY_LOOP_SECONDS, DEFAULT_VOLUME, FIGHT_BED_SPECS, GROOVE_ENCODER_DELAY_SAMPLES, GROOVE_LOOP_SECONDS, GROOVE_MUSIC_RATE, MENU_ENCODER_DELAY_SAMPLES, MENU_LOOP_SECONDS, MENU_MUSIC_RATE, OUTPUT_LIMIT, PREVIOUS_DEFAULT_VOLUME, SEAM_CROSSFADE_SECONDS, SFX_LIMIT, SONGS, SOUND_VOICES, TRENCHES_ENCODER_DELAY_SAMPLES, TRENCHES_LOOP_SECONDS, TRENCHES_MUSIC_RATE, YACHT_TRIM_GAIN, createAudio, crossfadeChannel, fightBedForZone, fightBedLoopRegion, fightMusicCue, limitDb, menuLoopRegion, readVolume, seamIsClick, softenLoopSeam, trenchesLoopRegion } from '../src/audio';
import { STAGES } from '../src/stage';
import { stageZone } from '../src/stageGroups';

const EFFECT_KINDS: Effect['kind'][] = ['hit', 'block', 'charge', 'dash', 'special', 'pumpkin'];

describe('sound mapping', () => {
    it('gives every effect kind the simulation emits a sound name that has a voice', () => {
        for (const kind of EFFECT_KINDS) for (const freeze of [0, 4, 6, 9, 12]) {
            const name = effectSound({ kind, color: '#ffffff' }, freeze);
            expect(name, kind).not.toBeNull();
            expect(SOUND_NAMES).toContain(name);
            expect(typeof SOUND_VOICES[name!]).toBe('function');
        }
    });
    it('has a voice for every sound name and nothing else', () => {
        expect(Object.keys(SOUND_VOICES).sort()).toEqual([...SOUND_NAMES].sort());
    });
    it('names hits by hit stop and separates guard, just-defend and projectile impact', () => {
        expect([4, 6, 9, 12].map(hitSound)).toEqual(['hitLight', 'hitMedium', 'hitHeavy', 'hitSpecial']);
        expect(effectSound({ kind: 'block', color: '#85c8ff' }, 3)).toBe('block');
        expect(effectSound({ kind: 'block', color: '#fff3ad' }, 3)).toBe('justDefend');
        expect(effectSound({ kind: 'hit', color: '#fff' }, 4, true)).toBe('shotImpact');
        expect(effectSound({ kind: 'hit', color: '#fff' }, 9, true)).toBe('hitHeavy');
    });
    it('gives each melee strength its own whoosh and leaves shots and throws to their own sounds', () => {
        expect(whooshSound('light')).toBe('whooshLight');
        expect(whooshSound('medium')).toBe('whooshMedium');
        expect(whooshSound('sweep')).toBe('whooshHeavy');
        expect(whooshSound('special')).toBe('teamSpecial');
        expect(whooshSound('bolt')).toBeNull();
        expect(whooshSound('grab')).toBeNull();
    });
    it('pans by arena position without hard-panning', () => {
        expect(panFor(640)).toBe(0);
        expect(panFor(0)).toBe(-.8);
        expect(panFor(1280)).toBe(.8);
        expect(panFor(320)).toBeCloseTo(-.5);
    });
});

describe('sound tracker', () => {
    const run = (drive: (s: CombatState) => [number, number], frames: number, s = createState('rivet', 'versus', 'vela')) => {
        const tracker = new SoundTracker(), heard: string[] = [];
        tracker.reset(s);
        for (let n = 0; n < frames && s.winner === null; n++) {
            step(s, drive(s));
            for (const cue of tracker.collect(s)) heard.push(cue.name);
        }
        return { heard, s, tracker };
    };
    it('voices a whiffed light once, and a blocked or landed attack once', () => {
        const { heard } = run(s => [s.frame === 5 ? A.light : 0, 0], 40);
        expect(heard).toEqual(['whooshLight']);
        const close = createState('rivet', 'versus', 'vela'); close.fighters[1].x = close.fighters[0].x + 70;
        const hit = run(s => [s.frame === 5 ? A.heavy : 0, 0], 60, close).heard;
        // The heavy file already contains the impact, so contact does not play it again.
        expect(hit.filter(name => name === 'whooshHeavy')).toHaveLength(1);
        expect(hit).not.toContain('hitHeavy');
        expect(hit[0]).toBe('whooshHeavy');
        const guard = createState('rivet', 'versus', 'vela'); guard.fighters[1].x = guard.fighters[0].x + 70;
        const blocked = run(s => [s.frame === 5 ? A.heavy : 0, s.frame >= 14 ? A.right : 0], 60, guard).heard;
        expect(blocked).toContain('whooshHeavy');
        expect(blocked).toContain('block');
        expect(blocked).not.toContain('hitHeavy');
    });
    it('voices a projectile once when it leaves, a throw, and the K.O.', () => {
        const shot = run(s => [s.frame === 5 ? A.bolt : 0, 0], 120).heard;
        expect(shot.filter(name => name === 'shot')).toHaveLength(1);
        expect(shot).not.toContain('shotImpact');
        const close = createState('rivet', 'versus', 'vela'); close.fighters[1].x = close.fighters[0].x + 60;
        expect(run(s => [s.frame === 5 ? A.grab : 0, 0], 80, close).heard).toContain('throw');
        const last = createState('rivet', 'versus', 'vela'); last.fighters[1].x = last.fighters[0].x + 70; last.fighters[1].hp = 10;
        const end = run(s => [s.frame === 5 ? A.heavy : 0, 0], 200, last).heard;
        expect(end.filter(name => name === 'ko')).toHaveLength(1);
        expect(end.at(-1)).toBe('win');
    });
    it('never writes to the state and stays silent when the same frame is read twice or time steps back', () => {
        const s = createState('rivet', 'cpu', 'vela'), tracker = new SoundTracker();
        for (let n = 0; n < 300 && s.winner === null; n++) {
            step(s, [cpuInput(s, 0, 7), cpuInput(s, 1, 7)]);
            const before = JSON.stringify(s);
            tracker.collect(s);
            expect(tracker.collect(s)).toEqual([]);
            expect(JSON.stringify(s)).toBe(before);
        }
        expect(tracker.collect(createState('rivet', 'cpu', 'vela'))).toEqual([]);
    });
    it('plays a team special once and names the fighter', () => {
        const s = createState('rivet', 'versus', 'vela');
        s.fighters[0].pips = 3;
        s.fighters[1].x = s.fighters[0].x + 70;
        const tracker = new SoundTracker();
        tracker.reset(s);
        const cues: { name: string; fighterId?: string }[] = [];
        for (let n = 0; n < 160 && s.winner === null; n++) {
            step(s, [n === 5 ? A.special : 0, 0]);
            cues.push(...tracker.collect(s));
        }
        const specials = cues.filter(cue => cue.name === 'teamSpecial');
        expect(specials).toHaveLength(1);
        expect(specials[0].fighterId).toBe('rivet');
        expect(cues.some(cue => cue.name === 'hitSpecial')).toBe(false);
    });
    it('still voices a body landing, which is not the attack clip', () => {
        const s = createState('rivet', 'versus', 'vela');
        s.fighters[1].y = 400;
        s.fighters[1].vy = 8;
        s.fighters[1].reaction = { kind: 'knockdown', phase: 'flight', t: 2, direction: 1 };
        const tracker = new SoundTracker();
        tracker.reset(s);
        const heard: string[] = [];
        for (let n = 0; n < 90 && !heard.includes('hitMedium'); n++) {
            step(s, [0, 0]);
            for (const cue of tracker.collect(s)) heard.push(cue.name);
        }
        expect(heard).toContain('hitMedium');
    });
});

describe('audio settings and songs', () => {
    const db = (linear: number) => 20 * Math.log10(linear);
    const fromDb = (value: number) => 10 ** (value / 20);
    it('reads stored volumes defensively', () => {
        expect(readVolume(null)).toEqual(DEFAULT_VOLUME);
        expect(readVolume('not json')).toEqual(DEFAULT_VOLUME);
        expect(readVolume('{"master":2,"sfx":-1,"music":"loud"}')).toEqual({ master: 1, sfx: 0, music: DEFAULT_VOLUME.music });
    });
    it('makes music the louder category and keeps both gains at or under 1', () => {
        expect(DEFAULT_VOLUME).toEqual({ master: .8, sfx: .7, music: .8 });
        const musicDb = db(DEFAULT_VOLUME.music / PREVIOUS_DEFAULT_VOLUME.music);
        const sfxDb = db(DEFAULT_VOLUME.sfx / PREVIOUS_DEFAULT_VOLUME.sfx);
        expect(musicDb).toBeGreaterThanOrEqual(4);
        expect(musicDb).toBeLessThanOrEqual(6);
        expect(sfxDb).toBeLessThanOrEqual(-2);
        expect(sfxDb).toBeGreaterThanOrEqual(-3);
        expect(DEFAULT_VOLUME.music * YACHT_TRIM_GAIN).toBeLessThanOrEqual(1);
        expect(DEFAULT_VOLUME.sfx).toBeLessThanOrEqual(1);
    });
    it('replaces a saved copy of the old mix and keeps a mix the player chose', () => {
        expect(readVolume(JSON.stringify(PREVIOUS_DEFAULT_VOLUME))).toEqual(DEFAULT_VOLUME);
        expect(readVolume(JSON.stringify({ master: .5, sfx: .9, music: .45 }))).toEqual({ master: .5, sfx: .7, music: .8 });
        expect(readVolume(JSON.stringify({ master: .8, sfx: .5, music: .45 }))).toEqual({ master: .8, sfx: .5, music: .45 });
        expect(readVolume(JSON.stringify({ master: .8, sfx: .9, music: .6 }))).toEqual({ master: .8, sfx: .9, music: .6 });
        expect(readVolume(JSON.stringify({ ...PREVIOUS_DEFAULT_VOLUME, mix: AUDIO_MIX_VERSION }))).toEqual(PREVIOUS_DEFAULT_VOLUME);
    });
    it('keeps the louder music linear and holds a stack of hits under full scale', () => {
        // The effects curve is the previous output limiter, not a weaker one.
        expect(SFX_LIMIT).toEqual({ threshold: -10, knee: 30, ratio: 8, attack: .003, release: .15 });
        // A full-scale loop, yacht trim included, stays under the output knee at the default mix.
        const fullScaleMusic = db(DEFAULT_VOLUME.music * YACHT_TRIM_GAIN * DEFAULT_VOLUME.master);
        expect(fullScaleMusic).toBeLessThan(OUTPUT_LIMIT.threshold - OUTPUT_LIMIT.knee / 2);
        expect(limitDb(fullScaleMusic, OUTPUT_LIMIT)).toBeCloseTo(fullScaleMusic, 5);
        // Two full-scale effects, in phase, after the effects limiter and the master fader.
        const limitedHits = limitDb(db(2 * DEFAULT_VOLUME.sfx), SFX_LIMIT) + db(DEFAULT_VOLUME.master);
        const sum = db(fromDb(fullScaleMusic) + fromDb(limitedHits));
        // Headroom before the ceiling: a full-scale loop plus two in-phase hits stays under 0 dB.
        expect(sum).toBeLessThan(0);
        expect(limitDb(sum, OUTPUT_LIMIT)).toBeLessThan(0);
        expect(limitDb(6, OUTPUT_LIMIT)).toBeLessThan(0);
    });
    it('saves volume changes and stays inert without a browser', () => {
        const saved: Record<string, string> = {};
        const audio = createAudio({ getItem: key => saved[key] ?? null, setItem: (key, value) => { saved[key] = value; } });
        audio.setVolume({ music: .2 });
        expect(readVolume(saved[AUDIO_SETTINGS_KEY]).music).toBe(.2);
        expect(JSON.parse(saved[AUDIO_SETTINGS_KEY]).mix).toBe(AUDIO_MIX_VERSION);
        audio.setVolume({ music: PREVIOUS_DEFAULT_VOLUME.music, sfx: PREVIOUS_DEFAULT_VOLUME.sfx });
        expect(readVolume(saved[AUDIO_SETTINGS_KEY])).toEqual(PREVIOUS_DEFAULT_VOLUME);
        expect(audio.unlock()).toBe(false);
        audio.play('hitHeavy'); audio.music('fight');
        expect(audio.status()).toMatchObject({ context: 'none', unlocked: false, played: 0, track: 'fight' });
    });
    it('ships a menu, a fight and a story loop with whole bars', () => {
        expect(Object.keys(SONGS).sort()).toEqual(['fight', 'menu', 'story']);
        for (const song of Object.values(SONGS)) {
            expect(song.bass.length % 16).toBe(0); expect(song.lead.length % 16).toBe(0); expect(song.hat.length % 16).toBe(0);
        }
    });
    it('trims encoder padding so the Trenches theme loops for exactly 192 bars', () => {
        expect(TRENCHES_LOOP_SECONDS).toBe(360);
        expect(TRENCHES_LOOP_SECONDS / (60 / 128)).toBe(768);
        expect(TRENCHES_LOOP_SECONDS / (60 / 128) / 4).toBe(192);
        const rate = TRENCHES_MUSIC_RATE;
        const loopSamples = Math.round(TRENCHES_LOOP_SECONDS * rate);
        expect(loopSamples).toBe(17_280_000);
        // Chrome and ffmpeg drop the priming and the trailing frame and land on this length.
        expect(trenchesLoopRegion(loopSamples, rate)).toEqual({ loopStart: 0, loopEnd: TRENCHES_LOOP_SECONDS });
        // A short tail still stays outside the loop.
        const tail = trenchesLoopRegion(loopSamples + 47, rate);
        expect(tail.loopStart).toBe(0);
        expect(tail.loopEnd - tail.loopStart).toBeCloseTo(TRENCHES_LOOP_SECONDS, 6);
        // A decoder that keeps the priming has 1105 samples at the head, then the music, then one frame.
        const withPriming = trenchesLoopRegion(TRENCHES_ENCODER_DELAY_SAMPLES + loopSamples + 1152, rate);
        expect(withPriming.loopStart).toBeCloseTo(TRENCHES_ENCODER_DELAY_SAMPLES / rate, 6);
        expect(withPriming.loopEnd - withPriming.loopStart).toBeCloseTo(TRENCHES_LOOP_SECONDS, 6);
        const at44100 = trenchesLoopRegion(Math.round(loopSamples * 44100 / rate), 44100);
        expect(at44100.loopStart).toBe(0);
        expect(at44100.loopEnd - at44100.loopStart).toBeCloseTo(TRENCHES_LOOP_SECONDS, 4);
    });
    it('plays the recorded bed on every Trenches stage and only while the fight is on', () => {
        const trenches = STAGES.filter(stage => stageZone(stage.id) === 'trenches').map(stage => stage.id);
        expect(trenches).toEqual(expect.arrayContaining([
            'trenches', 'rainworks', 'scrapyard', 'rustcanal', 'ashstation', 'culvertgarden',
            '00-trenches-drainage-floodgate', 'nov04-trenches-6',
        ]));
        expect(trenches.every(id => /trench/i.test(id) || /trench/i.test(STAGES.find(stage => stage.id === id)!.theme))).toBe(true);
        expect(stageZone('ranch')).toBe('ranch');
        expect(stageZone('circuit')).toBe('circuit');
        const fight = { feedbackHold: false, selectionOpen: false, storyOpen: false, fightOver: false, bed: 'trenches' as const };
        expect(fightMusicCue(fight)).toEqual({ track: 'fight', bed: 'trenches' });
        expect(fightMusicCue({ ...fight, bed: 'synth' })).toEqual({ track: 'fight', bed: 'synth' });
        expect(fightMusicCue({ ...fight, selectionOpen: true })).toEqual({ track: 'menu', bed: 'trenches' });
        expect(fightMusicCue({ ...fight, storyOpen: true })).toEqual({ track: 'story', bed: 'trenches' });
        expect(fightMusicCue({ ...fight, fightOver: true })).toEqual({ track: null, bed: 'trenches' });
        expect(fightMusicCue({ ...fight, feedbackHold: true })).toEqual({ track: null, bed: 'trenches' });
        expect(fightMusicCue({ ...fight, storyOpen: true, fightOver: true })).toEqual({ track: 'story', bed: 'trenches' });
        // Between story fights in the same zone the fight loop carries on through the result screen and the load.
        expect(fightMusicCue({ ...fight, carryFight: true, fightOver: true })).toEqual({ track: 'fight', bed: 'trenches' });
        expect(fightMusicCue({ ...fight, carryFight: true, storyOpen: true, fightOver: true })).toEqual({ track: 'fight', bed: 'trenches' });
        expect(fightMusicCue({ ...fight, carryFight: true, selectionOpen: true })).toEqual({ track: 'menu', bed: 'trenches' });
        expect(fightMusicCue({ ...fight, carryFight: true, feedbackHold: true })).toEqual({ track: null, bed: 'trenches' });
    });
    it('trims encoder padding so the City theme loops for exactly 192 bars', () => {
        expect(CITY_LOOP_SECONDS).toBe(368.64);
        expect(CITY_LOOP_SECONDS).toBeCloseTo(192 * 4 * 60 / 125, 8);
        const rate = GROOVE_MUSIC_RATE;
        const loopSamples = Math.round(CITY_LOOP_SECONDS * rate);
        expect(loopSamples).toBe(17_694_720);
        expect(fightBedLoopRegion('city', loopSamples, rate)).toEqual({ loopStart: 0, loopEnd: CITY_LOOP_SECONDS });
        const tail = fightBedLoopRegion('city', loopSamples + 47, rate);
        expect(tail.loopStart).toBe(0);
        expect(tail.loopEnd - tail.loopStart).toBeCloseTo(CITY_LOOP_SECONDS, 6);
        const withPriming = fightBedLoopRegion('city', GROOVE_ENCODER_DELAY_SAMPLES + loopSamples + 1152, rate);
        expect(withPriming.loopStart).toBeCloseTo(GROOVE_ENCODER_DELAY_SAMPLES / rate, 6);
        expect(withPriming.loopEnd - withPriming.loopStart).toBeCloseTo(CITY_LOOP_SECONDS, 6);
        expect(FIGHT_BED_SPECS.city.gain).toBe(1);
        expect(FIGHT_BED_SPECS.city.loopSeconds).toBe(CITY_LOOP_SECONDS);
    });
    it('trims encoder padding so yacht, castle, verse, bar and ranch loop for exactly 32 bars', () => {
        expect(GROOVE_LOOP_SECONDS).toBeCloseTo(32 * 4 * 60 / 125, 8);
        expect(Math.round(GROOVE_LOOP_SECONDS * GROOVE_MUSIC_RATE)).toBe(2_949_120);
        expect(YACHT_TRIM_GAIN).toBeCloseTo(10 ** (0.4 / 20), 8);
        expect(FIGHT_BED_SPECS.yacht.gain).toBe(YACHT_TRIM_GAIN);
        expect(FIGHT_BED_SPECS.castle.gain).toBe(1);
        expect(FIGHT_BED_SPECS.trenches.gain).toBe(1);
        const rate = GROOVE_MUSIC_RATE;
        const loopSamples = Math.round(GROOVE_LOOP_SECONDS * rate);
        for (const bed of ['yacht', 'castle', 'verse', 'bar', 'ranch'] as const) {
            expect(fightBedLoopRegion(bed, loopSamples, rate)).toEqual({ loopStart: 0, loopEnd: GROOVE_LOOP_SECONDS });
            // A short tail stays outside the loop.
            const tail = fightBedLoopRegion(bed, loopSamples + 47, rate);
            expect(tail.loopStart).toBe(0);
            expect(tail.loopEnd - tail.loopStart).toBeCloseTo(GROOVE_LOOP_SECONDS, 6);
            const primed = fightBedLoopRegion(bed, GROOVE_ENCODER_DELAY_SAMPLES + loopSamples + 47, rate);
            expect(primed.loopStart).toBeCloseTo(GROOVE_ENCODER_DELAY_SAMPLES / rate, 6);
            expect(primed.loopEnd - primed.loopStart).toBeCloseTo(GROOVE_LOOP_SECONDS, 6);
        }
        // Chrome drops the priming and returns 10 samples less than 32 bars, so the Bar loop is the whole buffer.
        const barDecoded = fightBedLoopRegion('bar', 2_949_110, GROOVE_MUSIC_RATE);
        expect(barDecoded.loopStart).toBe(0);
        expect(barDecoded.loopEnd).toBeCloseTo(2_949_110 / GROOVE_MUSIC_RATE, 8);
        expect(GROOVE_LOOP_SECONDS - barDecoded.loopEnd).toBeCloseTo(10 / GROOVE_MUSIC_RATE, 8);
    });
    it('plays yacht, city, castle and verse beds on those zones and nowhere else', () => {
        const ids = (zone: 'yacht' | 'circuit' | 'throne') => STAGES.filter(stage => stageZone(stage.id) === zone).map(stage => stage.id);
        const yacht = ids('yacht'), city = ids('circuit'), castle = ids('throne');
        expect(yacht).toEqual(expect.arrayContaining(['yacht', 'sundeck', '09-sunlit-cargo-pier', 'nov04-yacht-6']));
        expect(city).toEqual(expect.arrayContaining(['circuit', 'retro', 'skyrail', '03-circuit-checkpoint-lockdown', 'nov04-circuit-6']));
        expect(castle).toEqual(expect.arrayContaining(['throne', 'castle', 'glassgarden', '12-throne-furnace-relay-vault', 'nov04-throne-6']));
        const verse = STAGES.filter(stage => stageZone(stage.id) === 'verse').map(stage => stage.id);
        expect(verse).toEqual(expect.arrayContaining(['verse', 'starbridge', 'observatory', 'nov04-verse-6']));
        expect(yacht.every(id => fightBedForZone(stageZone(id)) === 'yacht')).toBe(true);
        expect(city.every(id => fightBedForZone(stageZone(id)) === 'city')).toBe(true);
        expect(castle.every(id => fightBedForZone(stageZone(id)) === 'castle')).toBe(true);
        expect(verse.every(id => fightBedForZone(stageZone(id)) === 'verse')).toBe(true);
        const bar = STAGES.filter(stage => stageZone(stage.id) === 'bar').map(stage => stage.id);
        expect(bar).toEqual(expect.arrayContaining(['bar', 'cellar', 'rooftop', 'bluebar', 'nov04-bar-6']));
        expect(bar.every(id => fightBedForZone(stageZone(id)) === 'bar')).toBe(true);
        const ranch = STAGES.filter(stage => stageZone(stage.id) === 'ranch').map(stage => stage.id);
        expect(ranch).toEqual(expect.arrayContaining(['ranch', 'ranch-orchard', '21-ranch-lantern-lit-barn', 'nov04-ranch-6']));
        expect(ranch.every(id => fightBedForZone(stageZone(id)) === 'ranch')).toBe(true);
        expect(fightBedForZone('hatchery')).toBe('synth');
        const fight = { feedbackHold: false, selectionOpen: false, storyOpen: false, fightOver: false, bed: 'yacht' as const };
        expect(fightMusicCue(fight)).toEqual({ track: 'fight', bed: 'yacht' });
        expect(fightMusicCue({ ...fight, bed: 'city', fightOver: true })).toEqual({ track: null, bed: 'city' });
        expect(fightMusicCue({ ...fight, bed: 'castle', selectionOpen: true })).toEqual({ track: 'menu', bed: 'castle' });
        expect(fightMusicCue({ ...fight, bed: 'verse', storyOpen: true })).toEqual({ track: 'story', bed: 'verse' });
        expect(fightMusicCue({ ...fight, bed: 'bar', feedbackHold: true })).toEqual({ track: null, bed: 'bar' });
        expect(fightMusicCue({ ...fight, bed: 'synth', storyOpen: true })).toEqual({ track: 'story', bed: 'synth' });
    });
    it('crossfades a clicking wrap onto the first sample and leaves a quiet seam alone', () => {
        const rate = 48000;
        const click = new Float32Array(1000);
        click[0] = 0.4; click[999] = -0.2;
        const region = { loopStart: 0, loopEnd: 1000 / rate };
        const buffer = { numberOfChannels: 1, sampleRate: rate, getChannelData: () => click };
        expect(seamIsClick(Math.abs(click[0] - click[999]), 0.01)).toBe(true);
        expect(softenLoopSeam(buffer, region)).toBe(true);
        expect(click[999]).toBeCloseTo(0.4, 5);
        expect(Math.round(SEAM_CROSSFADE_SECONDS * rate)).toBe(384);
        const quiet = new Float32Array(1000);
        quiet[0] = 0.0002; quiet[999] = -0.0001;
        const before = Float32Array.from(quiet);
        expect(seamIsClick(Math.abs(quiet[0] - quiet[999]), 0.01)).toBe(false);
        expect(softenLoopSeam({ numberOfChannels: 1, sampleRate: rate, getChannelData: () => quiet }, region)).toBe(false);
        expect(Array.from(quiet)).toEqual(Array.from(before));
        const manual = new Float32Array([1, 2, 3, 4, 9]);
        crossfadeChannel(manual, 0, 5, 2);
        expect(manual[4]).toBeCloseTo(1, 5);
    });
    it('ships the Trenches fight loop next to its metadata', () => {
        const bytes = readFileSync(new URL('../public/audio/music/trenches_fight_loop_6min.mp3', import.meta.url));
        const meta = JSON.parse(readFileSync(new URL('../public/audio/music/trenches_fight_loop_6min.json', import.meta.url), 'utf8'));
        expect(bytes.subarray(0, 3).toString('ascii')).toBe('ID3');
        expect(bytes.length).toBe(meta.file_size_bytes);
        expect(meta.filename).toBe('trenches_fight_loop_6min.mp3');
        expect(meta.duration_seconds).toBe(TRENCHES_LOOP_SECONDS);
        expect(meta.encoder_delay_samples).toBe(TRENCHES_ENCODER_DELAY_SAMPLES);
        expect(meta.sample_rate).toBe(TRENCHES_MUSIC_RATE);
        expect(meta.bpm).toBe(128);
        expect(meta.bars).toBe(192);
        expect(FIGHT_BED_SPECS.trenches.path).toBe('audio/music/trenches_fight_loop_6min.mp3');
        expect(FIGHT_BED_SPECS.trenches.loopSeconds).toBe(TRENCHES_LOOP_SECONDS);
        expect(existsSync(new URL('../public/audio/music/trenches_fight_loop.mp3', import.meta.url))).toBe(false);
        expect(existsSync(new URL('../public/audio/music/trenches_fight_loop.json', import.meta.url))).toBe(false);
    });
    it('ships the City fight loop next to its metadata', () => {
        const bytes = readFileSync(new URL('../public/audio/music/city_house_loop_6min.mp3', import.meta.url));
        const meta = JSON.parse(readFileSync(new URL('../public/audio/music/city_house_loop_6min.json', import.meta.url), 'utf8'));
        expect(bytes.subarray(0, 3).toString('ascii')).toBe('ID3');
        expect(bytes.length).toBe(meta.file_size_bytes);
        expect(meta.filename).toBe('city_house_loop_6min.mp3');
        expect(meta.duration_seconds).toBe(CITY_LOOP_SECONDS);
        expect(meta.encoder_delay_samples).toBe(GROOVE_ENCODER_DELAY_SAMPLES);
        expect(meta.sample_rate).toBe(GROOVE_MUSIC_RATE);
        expect(meta.bpm).toBe(125);
        expect(meta.bars).toBe(192);
        expect(FIGHT_BED_SPECS.city.path).toBe('audio/music/city_house_loop_6min.mp3');
        expect(existsSync(new URL('../public/audio/music/city_house_loop_v2.mp3', import.meta.url))).toBe(false);
        expect(existsSync(new URL('../public/audio/music/city_house_loop_v2.json', import.meta.url))).toBe(false);
    });
    it('ships the yacht, castle and verse fight loops next to their metadata', () => {
        for (const spec of [
            { file: 'yacht_groove_loop.mp3', meta: 'yacht_groove_loop.json', gain: YACHT_TRIM_GAIN },
            { file: 'castle_vampire_loop_v2.mp3', meta: 'castle_vampire_loop_v2.json', gain: 1 },
            { file: 'verse_alien_electro_loop.mp3', meta: 'verse_alien_electro_loop.json', gain: 1 },
            { file: 'ranch_country_loop_v2.mp3', meta: 'ranch_country_loop_v2.json', gain: 1 },
            { file: 'bar_rock_loop.mp3', meta: 'bar_rock_loop.json', gain: 1 },
        ]) {
            const bytes = readFileSync(new URL(`../public/audio/music/${spec.file}`, import.meta.url));
            const meta = JSON.parse(readFileSync(new URL(`../public/audio/music/${spec.meta}`, import.meta.url), 'utf8'));
            expect(bytes.subarray(0, 3).toString('ascii')).toBe('ID3');
            expect(bytes.length).toBe(meta.file_size_bytes);
            expect(meta.duration_seconds).toBe(GROOVE_LOOP_SECONDS);
            expect(meta.encoder_delay_samples).toBe(GROOVE_ENCODER_DELAY_SAMPLES);
            expect(meta.sample_rate).toBe(GROOVE_MUSIC_RATE);
            expect(meta.bpm).toBe(125);
            expect(meta.bars).toBe(32);
            expect(meta.gain).toBe(spec.gain);
        }
    });
    it('trims encoder padding so the menu theme loops for exactly 30 bars', () => {
        expect(MENU_LOOP_SECONDS).toBeCloseTo(60 / 125 * 4 * 30, 6);
        const rate = MENU_MUSIC_RATE;
        const loopSamples = Math.round(MENU_LOOP_SECONDS * rate);
        const withPriming = menuLoopRegion(Math.round(57.648 * rate), rate);
        expect(withPriming.loopStart).toBeCloseTo(MENU_ENCODER_DELAY_SAMPLES / rate, 6);
        expect(withPriming.loopEnd - withPriming.loopStart).toBeCloseTo(MENU_LOOP_SECONDS, 6);
        // A decoder that already dropped the priming leaves only a short tail.
        const trimmed = menuLoopRegion(loopSamples + 47, rate);
        expect(trimmed.loopStart).toBe(0);
        expect(trimmed.loopEnd).toBeCloseTo(MENU_LOOP_SECONDS, 6);
        const exact = menuLoopRegion(loopSamples, rate);
        expect(exact).toEqual({ loopStart: 0, loopEnd: MENU_LOOP_SECONDS });
    });
    it('commits the recorded menu loop and the ui click', () => {
        const music = readFileSync('public/audio/music/menu_theme_loop.mp3');
        const click = readFileSync('public/audio/sfx/ui_select.mp3');
        expect(music.subarray(0, 3).toString()).toBe('ID3');
        expect(click.subarray(0, 3).toString()).toBe('ID3');
        expect(music.length).toBeGreaterThan(1_000_000);
        expect(click.length).toBeGreaterThan(1_000);
        expect(click.length).toBeLessThan(20_000);
    });
});
