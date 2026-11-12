/** Campaign difficulty uses installed encounters, never the historical rival count. */
/**
 * The first rival's CPU skill. 1 was beaten without learning to block; 3 sat two thirds of the way to
 * Normal, which is no longer a soft target. 2 keeps the opener clearly winnable for a new player.
 */
export const STORY_START_SKILL = 2;
/**
 * The finale's CPU skill. Until 2026-11-12 the route ran to 10 (Expert), where the reference bot
 * won the finale gauntlet 0 of 256. The owner chose a finale that is very difficult but beatable:
 * at 3.95 the reference bot wins it roughly one time in seven. Single bouts and gauntlets lose
 * most of their difficulty between skill 3.5 and 4 (Normal), so the route works in that band
 * (docs/balance/CPU-KIT-AWARE-20261112.md, section 9).
 */
export const STORY_FINAL_SKILL = 3.95;
/** Added to each chapter's last encounter and to every gauntlet, so the bosses stand above their neighbours. */
export const STORY_BOSS_STEP = .12;
/**
 * How quickly the route leaves the opener: progress t becomes 1 - (1 - t)^curve. The middle of the
 * route sits close to its end, which keeps the second half firm without lifting the opener.
 */
export const STORY_ROUTE_CURVE = 5;
export interface DifficultyEncounter { id: string; index: number; chapter: number; gauntlet?: string }
/** A chapter's closing encounter or any gauntlet. */
export function storyBossEncounter(encounter: DifficultyEncounter, route: readonly DifficultyEncounter[]): boolean {
    const next = route[encounter.index + 1];
    return !!encounter.gauntlet || !next || next.chapter !== encounter.chapter;
}
export function storyDifficulty(encounter: DifficultyEncounter, route: readonly DifficultyEncounter[], assisted = false): number {
    const denominator = Math.max(1, route.length - 1);
    const chapter = route.filter(item => item.chapter === encounter.chapter);
    const first = chapter[0]?.index ?? encounter.index, last = chapter.at(-1)?.index ?? first;
    const progress = last === first ? 0 : (encounter.index - first) / (last - first);
    // Smooth within a chapter, retaining the exact chapter endpoints and finale.
    const smooth = progress * progress * (3 - 2 * progress);
    const t = (first + (last - first) * smooth) / denominator;
    // The ramp ends one boss step below the finale, so no encounter is set above it.
    const ramp = STORY_FINAL_SKILL - STORY_BOSS_STEP - STORY_START_SKILL;
    const ramped = STORY_START_SKILL + ramp * (1 - (1 - t) ** STORY_ROUTE_CURVE);
    const base = Math.min(STORY_FINAL_SKILL, ramped + STORY_BOSS_STEP * Number(storyBossEncounter(encounter, route)));
    return Math.max(1, base - Number(assisted));
}

/** Session-only, optional help. A draw or victory ends a straight-loss streak. */
export function createDifficultyRetry() {
    let encounter: string | null = null, losses = 0;
    return {
        begin(id: string) { if (encounter !== id) { encounter = id; losses = 0; } },
        record(id: string, winner: number, encounterComplete = true) {
            if (encounter !== id) { encounter = id; losses = 0; }
            if (winner === 0 && !encounterComplete) return;
            losses = winner === 1 ? losses + 1 : 0;
        },
        offered: (id: string) => encounter === id && losses >= 3,
        snapshot: () => ({ encounter, losses }),
    };
}
