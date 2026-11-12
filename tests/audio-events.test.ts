import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { A, createState, cpuInput, step, type CombatState, type Effect } from '../src/core';
import { SOUND_NAMES, SoundTracker, effectSound, hitSound, panFor, whooshSound } from '../src/audioEvents';
import { DEFAULT_VOLUME, MENU_ENCODER_DELAY_SAMPLES, MENU_LOOP_SECONDS, MENU_MUSIC_RATE, SONGS, SOUND_VOICES, createAudio, menuLoopRegion, readVolume } from '../src/audio';

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
    it('reads stored volumes defensively', () => {
        expect(readVolume(null)).toEqual(DEFAULT_VOLUME);
        expect(readVolume('not json')).toEqual(DEFAULT_VOLUME);
        expect(readVolume('{"master":2,"sfx":-1,"music":"loud"}')).toEqual({ master: 1, sfx: 0, music: DEFAULT_VOLUME.music });
    });
    it('saves volume changes and stays inert without a browser', () => {
        const saved: Record<string, string> = {};
        const audio = createAudio({ getItem: key => saved[key] ?? null, setItem: (key, value) => { saved[key] = value; } });
        audio.setVolume({ music: .2 });
        expect(readVolume(saved['sproto-arena-audio']).music).toBe(.2);
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
