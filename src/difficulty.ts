/** Campaign difficulty uses installed encounters, never the historical rival count. */
export interface DifficultyEncounter { id: string; index: number; chapter: number; gauntlet?: string }
export function storyDifficulty(encounter: DifficultyEncounter, route: readonly DifficultyEncounter[], assisted = false): number {
    const denominator = Math.max(1, route.length - 1);
    const chapter = route.filter(item => item.chapter === encounter.chapter);
    const first = chapter[0]?.index ?? encounter.index, last = chapter.at(-1)?.index ?? first;
    const progress = last === first ? 0 : (encounter.index - first) / (last - first);
    // Smooth within a chapter, retaining the exact chapter endpoints and finale.
    const smooth = progress * progress * (3 - 2 * progress);
    const index = first + (last - first) * smooth;
    const markedBoss = !!encounter.gauntlet || encounter.index >= route.length - 15;
    const base = Math.min(10, 1 + 9 * index / denominator + Number(markedBoss));
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
