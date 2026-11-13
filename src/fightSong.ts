/**
 * The pause menu's fight-song pick. Presentation only. The simulation never
 * imports this module, and nothing here is written into a replay or a hash.
 *
 * The pick lasts for the current stage and zone. A retry, the next bout and the
 * next rival in that same area keep it, so the loop is not asked to restart.
 * A different stage or a different zone clears it. Another pick replaces it.
 */
import type { StageId } from './stage';
import { STAGE_ZONES, stageZone, type StageZoneId } from './stageGroups';
import { fightBedForZone, isRecordedBed, type FightBed, type RecordedBed } from './audio';

export interface FightLoop {
    bed: RecordedBed;
    /** Zone name the player sees. Not a filename. */
    name: string;
}

/** Every recorded zone loop the game ships, in the zone-rail order, with its zone name. */
export function fightLoops(): readonly FightLoop[] {
    const loops: FightLoop[] = [];
    for (const zone of STAGE_ZONES) {
        const bed = fightBedForZone(zone.id);
        if (!isRecordedBed(bed)) continue;
        loops.push({ bed, name: zone.name });
    }
    return loops;
}

export interface FightSongPick {
    bed: RecordedBed;
    stage: StageId;
    zone: StageZoneId;
}

export function createFightSongChoice() {
    let pick: FightSongPick | null = null;
    /** True when both fights are the same stage and the same zone. */
    function sameArea(stage: StageId, other: StageId): boolean {
        return stage === other && stageZone(stage) === stageZone(other);
    }
    function bedFor(stage: StageId): FightBed {
        if (pick && sameArea(pick.stage, stage)) return pick.bed;
        return fightBedForZone(stageZone(stage));
    }
    return {
        get pick(): FightSongPick | null { return pick ? { ...pick } : null; },
        sameArea,
        bedFor,
        /** Store a shipped loop for this stage. A later call replaces the earlier pick. */
        choose(bed: FightBed, stage: StageId): FightSongPick | null {
            if (!isRecordedBed(bed)) return pick ? { ...pick } : null;
            pick = { bed, stage, zone: stageZone(stage) };
            return { ...pick };
        },
        /**
         * The story or a free-play launch moved to `stage`.
         * The same stage and zone keeps the pick. A different stage or zone clears it.
         */
        movedTo(stage: StageId): FightBed {
            if (pick && !sameArea(pick.stage, stage)) pick = null;
            return bedFor(stage);
        },
    };
}

export type FightSongChoice = ReturnType<typeof createFightSongChoice>;
