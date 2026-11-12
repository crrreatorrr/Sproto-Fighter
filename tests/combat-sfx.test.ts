import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLAYABLE_FIGHTERS, ROSTER } from '../src/core';
import { SOUND_NAMES } from '../src/audioEvents';
import { COMBAT_SFX_DIR, FIGHTER_SPECIAL_FILES, KO_ALTERNATE_FILE, VAMP_SPECIAL_GAIN, combatClip, combatClipPaths } from '../src/combatSfx';

const SYNTH = ['roundStart', 'win', 'lose', 'menuMove', 'menuConfirm', 'menuBack'] as const;

/** Enough of a CSV reader for the combat manifest: quoted prompts contain commas. */
function parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quoted) {
            if (c === '"') {
                if (text[i + 1] === '"') { cell += '"'; i++; }
                else quoted = false;
            } else cell += c;
        } else if (c === '"') quoted = true;
        else if (c === ',') { row.push(cell); cell = ''; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') i++;
            row.push(cell); cell = '';
            if (row.some(value => value.length > 0)) rows.push(row);
            row = [];
        } else cell += c;
    }
    if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
    return rows;
}

const GENERIC: Record<string, readonly string[]> = {
    'atk_light_01.mp3': ['whooshLight', 'hitLight'],
    'atk_medium_01.mp3': ['whooshMedium', 'hitMedium'],
    'atk_heavy_01.mp3': ['whooshHeavy', 'hitHeavy'],
    'atk_grab_01.mp3': ['throw'],
    'atk_ranged_01.mp3': ['shot', 'shotImpact'],
    'atk_block_01.mp3': ['block'],
    'atk_justdefend_01.mp3': ['justDefend'],
    'atk_tech_01.mp3': ['tech'],
    'atk_dash_01.mp3': ['dash'],
    'atk_charge_01.mp3': ['charge'],
    'atk_special_01.mp3': ['teamSpecial', 'hitSpecial'],
    'ko_01.mp3': ['ko'],
};

describe('recorded combat clips', () => {
    const manifest = parseCsv(readFileSync('public/audio/sfx/combat/manifest.csv', 'utf8'));
    const rows = manifest.slice(1).map(row => ({ file: row[0], category: row[1], character: row[2] }));

    it('keeps win, lose, round start and the menu sounds synthesised', () => {
        for (const name of SYNTH) expect(combatClip(name), name).toBeNull();
        for (const name of SOUND_NAMES) {
            if ((SYNTH as readonly string[]).includes(name)) continue;
            expect(combatClip(name)?.path, name).toMatch(/\.mp3$/);
        }
    });

    it('maps each shared file onto the sound names it replaces', () => {
        for (const [file, names] of Object.entries(GENERIC)) {
            const paths = names.map(name => combatClip(name as typeof SOUND_NAMES[number])!.path);
            expect(new Set(paths).size, file).toBe(1);
            expect(paths[0].endsWith(file), file).toBe(true);
        }
    });

    it('gives the 27 manifest fighters their own special and everyone else the default', () => {
        const byName = new Map<string, string[]>();
        for (const id of PLAYABLE_FIGHTERS) byName.set(ROSTER[id].name, [...(byName.get(ROSTER[id].name) ?? []), id]);
        const specials = rows.filter(row => row.category === 'special' && row.character);
        expect(specials).toHaveLength(27);
        const matched = new Set<string>();
        for (const row of specials) {
            const ids = byName.get(row.character) ?? [];
            expect(ids, row.character).toHaveLength(1);
            const id = ids[0];
            matched.add(id);
            expect(FIGHTER_SPECIAL_FILES[id], row.character).toBe(row.file);
            expect(combatClip('teamSpecial', id)!.path.endsWith(row.file)).toBe(true);
            expect(combatClip('hitSpecial', id)!.path.endsWith(row.file)).toBe(true);
        }
        expect(matched.size).toBe(27);
        for (const id of PLAYABLE_FIGHTERS) {
            if (matched.has(id)) continue;
            expect(combatClip('teamSpecial', id)!.path.endsWith('atk_special_01.mp3'), id).toBe(true);
        }
        expect(combatClip('teamSpecial')!.path.endsWith('atk_special_01.mp3')).toBe(true);
    });

    it('boosts only the quiet VAMP special by 10 dB', () => {
        expect(combatClip('teamSpecial', 'vamp')!.gain).toBeCloseTo(VAMP_SPECIAL_GAIN, 8);
        expect(VAMP_SPECIAL_GAIN).toBeCloseTo(10 ** (10 / 20), 8);
        expect(combatClip('teamSpecial', 'rivet')!.gain).toBe(1);
        expect(combatClip('ko')!.gain).toBe(1);
    });

    it('ships every mapped clip, and ko_02 only as an unused alternate', () => {
        const onDisk = readdirSync('public/audio/sfx/combat').filter(name => name.endsWith('.mp3')).sort();
        const mapped = combatClipPaths().map(path => path.slice(COMBAT_SFX_DIR.length)).sort();
        expect(onDisk).toEqual([...mapped, KO_ALTERNATE_FILE].sort());
        expect(mapped).not.toContain(KO_ALTERNATE_FILE);
        for (const file of onDisk) expect(readFileSync(`public/audio/sfx/combat/${file}`).subarray(0, 3).toString()).toBe('ID3');
        const listed = new Set(rows.map(row => row.file));
        expect([...listed].sort()).toEqual(onDisk);
    });
});
