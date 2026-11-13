/** Campaign difficulty uses installed encounters, never the historical rival count. */
/**
 * The first rival's CPU skill. 1 was beaten without learning to block; 3 sat two thirds of the way to
 * Normal, which is no longer a soft target. 2 keeps the opener clearly winnable for a new player.
 */
export const STORY_START_SKILL = 2;
/**
 * The finale's CPU skill. Until 2026-11-12 the route ran to 10 (Expert), where the reference bot
 * won the finale gauntlet 0 of 256. The owner chose a finale that is very difficult but beatable:
 * at 3.95 the reference bot wins it roughly one time in seven
 * (docs/balance/CPU-KIT-AWARE-20261112.md, section 9).
 */
export const STORY_FINAL_SKILL = 3.95;
/**
 * Where the route (every encounter that is not a boss) ends: one boss step below the finale. Single
 * bouts against the reference bot lose most of their winnability between skill 3.5 and 4 (Normal),
 * so the route works in that band. Ending it higher (3.9) did not move encounter 233.
 */
export const STORY_ROUTE_END = 3.83;
/**
 * How quickly the route leaves the opener: progress t becomes 1 - (1 - t)^curve. The middle of the
 * route sits close to its end, which keeps the second half firm without lifting the opener.
 */
export const STORY_ROUTE_CURVE = 5;
/** Added to each chapter's last encounter and to every gauntlet, so the bosses stand above their neighbours. */
export const STORY_BOSS_STEP = .12;
/**
 * Per-boss-slot calibration, added on top of the route and the boss step. Offsets belong to the place on
 * the route (a chapter's closing encounter, or a gauntlet that does not close its chapter), never to a
 * fighter, so reordering rivals keeps each level's difficulty. At one skill the reference bot's
 * win rate differs by about 30 points from one rival to the next, so one curve cannot make every boss a
 * spike. Each offset was chosen so that the reference bot (reference v2, High Sproto, seed 20261105)
 * wins the encounter roughly 20-35% of the time, and the finale roughly 10-18%; no boss is measured
 * harder than the finale. Single bouts flatten out around 35-40% between skill 4 and 6, so several
 * chapter bosses sit well above the finale's skill while still being easier than it; a two-wave
 * gauntlet is much harder than a single bout at the same skill. Several CPU behaviours start at skill
 * 4, so the two earlier gauntlets sit at exactly 4 (just under it they are about twice as winnable).
 * Comments give the resulting skill. Recalibrate when the CPU, the kits or the route change.
 */
export const STORY_BOSS_OFFSETS: Readonly<Record<string, number>> = {
    'chapter-1': 2.90, // chapter 1 boss, 6.00
    'chapter-2': 2.88, // chapter 2 boss, 6.50
    'chapter-3': 3.16, // chapter 3 boss, 7.00
    'chapter-4': 1.07, // chapter 4 boss, 5.00
    'chapter-5': 1.05, // chapter 5 boss, 5.00
    'chapter-6': .55, // chapter 6 boss, 4.50
    'chapter-7': .05, // chapter 7 closing gauntlet, 4.00
    'gauntlet-nick-juicy': .05, // chapter 8 gauntlet, 4.00
    'chapter-8': 0, // finale, STORY_FINAL_SKILL 3.95
};
export interface DifficultyEncounter { id: string; index: number; chapter: number; gauntlet?: string }
const closesChapter = (encounter: DifficultyEncounter, route: readonly DifficultyEncounter[]) => {
    const next = route[encounter.index + 1];
    return !next || next.chapter !== encounter.chapter;
};
/** A chapter's closing encounter or any gauntlet. */
export function storyBossEncounter(encounter: DifficultyEncounter, route: readonly DifficultyEncounter[]): boolean {
    return !!encounter.gauntlet || closesChapter(encounter, route);
}
/** The route slot a boss offset belongs to, or null for an ordinary encounter. */
export function storyBossSlot(encounter: DifficultyEncounter, route: readonly DifficultyEncounter[]): string | null {
    if (closesChapter(encounter, route)) return `chapter-${encounter.chapter}`;
    return encounter.gauntlet ? `gauntlet-${encounter.gauntlet}` : null;
}
export function storyDifficulty(encounter: DifficultyEncounter, route: readonly DifficultyEncounter[], assisted = false): number {
    const denominator = Math.max(1, route.length - 1);
    const chapter = route.filter(item => item.chapter === encounter.chapter);
    const first = chapter[0]?.index ?? encounter.index, last = chapter.at(-1)?.index ?? first;
    const progress = last === first ? 0 : (encounter.index - first) / (last - first);
    // Smooth within a chapter, retaining the exact chapter endpoints and finale.
    const smooth = progress * progress * (3 - 2 * progress);
    const t = (first + (last - first) * smooth) / denominator;
    const ramped = STORY_START_SKILL + (STORY_ROUTE_END - STORY_START_SKILL) * (1 - (1 - t) ** STORY_ROUTE_CURVE);
    const slot = storyBossSlot(encounter, route);
    const base = Math.min(10, ramped + (slot ? STORY_BOSS_STEP + (STORY_BOSS_OFFSETS[slot] ?? 0) : 0));
    // Round the published skill first, then drop one for help, so a calibrated 4
    // stays on the skill-4 threshold and help equals that published skill minus one.
    const published = Math.round(base * 1e6) / 1e6;
    return Math.max(1, published - Number(assisted));
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
