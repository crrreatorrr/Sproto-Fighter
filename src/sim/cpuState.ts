import type { CombatState, CpuMemory } from './types';

/** Fixed seeds are part of match state, so snapshots and input-only replays agree. */
export const createCpuMemory = (seed: number): CpuMemory => ({
    seed, combatTicks: 0, intent: 'approach', nextDecision: 0, decisionAt: -1, choice: 0,
    attackKey: '', attackRoll: 1, lowRoll: 1, jumpRoll: 1, throwKey: -1, throwRoll: 1,
    combo: 0, comboRoll: 1, airborne: false, observations: [],
    habits: { attacks: 0, lows: 0, jumps: 0, projectiles: 0 },
});

/** Park–Miller: the product remains below 2^53; no approximate math or clock. */
export function cpuRandom(memory: CpuMemory): number {
    memory.seed = memory.seed * 16807 % 2147483647;
    return (memory.seed - 1) / 2147483646;
}

export function ensureCpuMemory(s: CombatState): [CpuMemory, CpuMemory] {
    return s.cpu ??= [createCpuMemory(104729), createCpuMemory(130363)];
}

/** Only createState calls this, before any input or motion can occur. */
export function primeCpuSpawn(s: CombatState): void {
    for (const slot of [0, 1] as const) {
        const p = s.fighters[1-slot];
        ensureCpuMemory(s)[slot].observations.push({ knownSpawn: true,
            frame: 0, combatTick: 0, x: p.x, y: p.y, vx: 0, vxDamping: 1, vy: 0, hp: p.hp,
            move: null, age: 0, startup: 0, active: 0, recovery: 0, low: false,
            input: 0, attackRoll: 1, lowRoll: 1, jumpRoll: 1, shot: false,
            attacks: 0, lows: 0, projectiles: 0 });
    }
}
