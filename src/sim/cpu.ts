// Built-in CPU opponent.
import { getMove, grounded } from './combat';
import { A } from './constants';
import { MOVES, bodySpread } from './roster';
import { CombatState } from './types';
/**
 * CPU tuning. Distances are the gap between the two nearest bodies (root
 * distance minus both fighters' body spread), so paired fighters behave like
 * single ones. Cycles are frame periods; "Frames" is how much of a cycle the
 * CPU spends on that choice.
 */
export const CPU = {
    approachGap: 105,   // walk in while farther than this
    closeGap: 90,       // light attacks / grabs inside this
    mediumGap: 125,     // medium attack inside this
    guardGap: 180,      // block an incoming attack inside this
    guardCycle: 120, guardFrames: 65,
    grabCycle: 150, grabFrames: 22,
    specialMaxGap: 450, // never fire the Team Special from farther than this
    zoneGap: 260,       // ranged power beyond this
    zoneRetreatGap: 390, zoneBoltCycle: 45, // Morelight keeps this distance
    boltCycle: 90,
    dashGap: 220, dashCycle: 120,
    inputFrames: 4,
} as const;
export function cpuInput(s: CombatState): number {
    const f = s.fighters[1], p = s.fighters[0], rootDistance = Math.abs(p.x - f.x), toward = p.x < f.x ? A.left : A.right, away = p.x < f.x ? A.right : A.left;
    // Approach and ordinary attacks use the gap between the two front bodies.
    // Root distance alone leaves a wide fighter stuck walking into collision.
    const distance = Math.max(0, rootDistance - bodySpread(f.id) - bodySpread(p.id));
    if (s.mode === 'dummy')
        return 0;
    if (s.mode === 'guard')
        return away | (p.input & A.down);
    if (f.stun || f.blockstun)
        return 0;
    if (f.move?.id === 'launcher' && f.move.connected && grounded(f))
        return A.up | toward;
    let input = distance > CPU.approachGap ? toward : 0;
    if (s.frame % 2 === 0)
        return input;
    if (f.move?.connected) {
        const rank = MOVES[f.move.id].rank;
        if (rank === 1)
            return input | A.medium;
        if (rank === 2)
            return input | (s.frame % 5 === 1 && grounded(f) ? A.launcher : A.heavy);
    }
    if (f.move)
        return input;
    if (p.move && distance < CPU.guardGap && s.frame % CPU.guardCycle < CPU.guardFrames)
        return away | (p.input & A.down);
    // Specials originate at the shared root; unlike ordinary melee their range
    // does not include the attacker's formation spread.
    if (f.pips === 3 && rootDistance - bodySpread(p.id) < Math.min(CPU.specialMaxGap, getMove(f, 'special').range))
        return A.special;
    if (f.id === 'vela' && distance > CPU.zoneGap) {
        input = distance < CPU.zoneRetreatGap ? away : 0;
        if (s.frame % CPU.zoneBoltCycle < CPU.inputFrames)
            return input | A.bolt;
    }
    if (distance < CPU.closeGap)
        return input | (s.frame % CPU.grabCycle < CPU.grabFrames ? A.grab : A.light);
    if (distance < CPU.mediumGap)
        return input | A.medium;
    if (distance > CPU.zoneGap && s.frame % CPU.boltCycle < 3)
        return input | A.bolt;
    if (distance > CPU.dashGap && s.frame % CPU.dashCycle < CPU.inputFrames)
        return input | A.dash;
    return input;
}
