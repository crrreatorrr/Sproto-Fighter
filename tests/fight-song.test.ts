import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FIGHT_BED_SPECS, fightBedForZone, fightMusicCue } from '../src/audio';
import { createFightSongChoice, fightLoops, type FightSongChoice } from '../src/fightSong';
import { STORY_ENCOUNTERS } from '../src/storyProgress';
import type { StageId } from '../src/stage';
import { STAGE_ZONES, stageZone, stagesInZone } from '../src/stageGroups';

/** What main asks the audio engine to play between fights. Same bed means the loop is not restarted. */
function cue(choice: FightSongChoice, stage: StageId, carry: StageId | null) {
    const bed = choice.bedFor(stage);
    return fightMusicCue({
        feedbackHold: false,
        selectionOpen: false,
        storyOpen: carry !== null,
        fightOver: carry !== null,
        bed,
        carryFight: carry !== null && choice.sameArea(stage, carry),
    });
}

describe('pause-menu fight song', () => {
    it('lists every shipped zone loop under its zone name', () => {
        const loops = fightLoops();
        expect(loops.map(loop => loop.bed).sort()).toEqual(Object.keys(FIGHT_BED_SPECS).sort());
        expect(loops.map(loop => loop.name)).toEqual(STAGE_ZONES.map(zone => zone.name));
        expect(loops.map(loop => loop.bed)).toEqual(STAGE_ZONES.map(zone => fightBedForZone(zone.id)));
        expect(new Set(loops.map(loop => loop.bed)).size).toBe(loops.length);
        for (const loop of loops) {
            expect(loop.name.startsWith('The ')).toBe(true);
            expect(loop.name.includes('.mp3')).toBe(false);
            expect(loop.name.includes('_')).toBe(false);
        }
    });

    it('keeps a pick across a retry, the next bout and the next rival in the same zone', () => {
        const hatchery = STORY_ENCOUNTERS.filter(encounter => encounter.stage === 'hatchery');
        const first = hatchery[0], rival = hatchery[1];
        const gauntlet = hatchery.find(encounter => encounter.opponents.length > 1);
        expect(first).toBeTruthy();
        expect(rival && rival.stage === first.stage && stageZone(rival.stage) === 'hatchery').toBe(true);
        expect(gauntlet && gauntlet.opponents.length).toBeGreaterThan(1);
        expect(gauntlet!.stage).toBe(first.stage);

        const choice = createFightSongChoice();
        const picked = 'trenches' as const;
        expect(picked).not.toBe(fightBedForZone('hatchery'));
        choice.choose(picked, first.stage);

        // Retry stays on this encounter's stage.
        expect(choice.movedTo(first.stage)).toBe(picked);
        expect(cue(choice, first.stage, first.stage)).toEqual({ track: 'fight', bed: picked });
        // The gauntlet's next bout is the same stage, so the loop is not restarted.
        expect(choice.movedTo(gauntlet!.stage)).toBe(picked);
        expect(cue(choice, gauntlet!.stage, gauntlet!.stage)).toEqual({ track: 'fight', bed: picked });
        // The next rival in this zone is another encounter on the same stage.
        expect(choice.movedTo(rival.stage)).toBe(picked);
        expect(cue(choice, rival.stage, rival.stage)).toEqual({ track: 'fight', bed: picked });
        expect(choice.pick).toEqual({ bed: picked, stage: first.stage, zone: 'hatchery' });
    });

    it('clears the pick when the story moves to another zone', () => {
        const leaving = STORY_ENCOUNTERS.find((encounter, index) => {
            const next = STORY_ENCOUNTERS[index + 1];
            return !!next && stageZone(next.stage) !== stageZone(encounter.stage);
        });
        const next = STORY_ENCOUNTERS[leaving!.index + 1];
        expect(leaving).toBeTruthy();
        expect(stageZone(next.stage)).not.toBe(stageZone(leaving!.stage));

        const choice = createFightSongChoice();
        const picked = fightLoops().find(loop => loop.bed !== fightBedForZone(stageZone(leaving!.stage)) && loop.bed !== fightBedForZone(stageZone(next.stage)))!;
        choice.choose(picked.bed, leaving!.stage);
        // Still on the old stage, the between-zone scene drops the fight loop instead of carrying it.
        expect(cue(choice, leaving!.stage, next.stage)).toEqual({ track: 'story', bed: picked.bed });
        expect(choice.movedTo(next.stage)).toBe(fightBedForZone(stageZone(next.stage)));
        expect(choice.pick).toBeNull();
        expect(cue(choice, next.stage, null)).toEqual({ track: 'fight', bed: fightBedForZone(stageZone(next.stage)) });
    });

    it('clears the pick when the stage changes inside a zone', () => {
        const stages = stagesInZone('circuit');
        expect(stages.length).toBeGreaterThan(1);
        const [here, there] = stages;
        expect(here.id).not.toBe(there.id);
        expect(stageZone(here.id)).toBe('circuit');
        expect(stageZone(there.id)).toBe('circuit');

        const choice = createFightSongChoice();
        choice.choose('bar', here.id);
        expect(cue(choice, here.id, there.id)).toEqual({ track: 'story', bed: 'bar' });
        expect(choice.movedTo(there.id)).toBe('city');
        expect(choice.pick).toBeNull();
        expect(cue(choice, there.id, null)).toEqual({ track: 'fight', bed: 'city' });
    });

    it('replaces the previous pick when the player chooses another song', () => {
        const choice = createFightSongChoice();
        choice.choose('yacht', 'trenches');
        expect(cue(choice, 'trenches', 'trenches')).toEqual({ track: 'fight', bed: 'yacht' });
        choice.choose('ranch', 'trenches');
        expect(choice.pick).toEqual({ bed: 'ranch', stage: 'trenches', zone: 'trenches' });
        expect(choice.bedFor('trenches')).toBe('ranch');
        expect(cue(choice, 'trenches', 'trenches')).toEqual({ track: 'fight', bed: 'ranch' });
        // Choosing the song that is already playing keeps that bed, so the loop is not restarted.
        choice.choose('ranch', 'trenches');
        expect(choice.bedFor('trenches')).toBe('ranch');
        expect(choice.movedTo('trenches')).toBe('ranch');
    });

    it('is not part of the simulation or the replay hash', () => {
        for (const path of ['../src/sim/step.ts', '../src/core.ts', '../src/net/matchLog.ts', '../src/net/hubDuel.ts']) {
            expect(readFileSync(new URL(path, import.meta.url), 'utf8')).not.toContain('fightSong');
        }
    });
});
