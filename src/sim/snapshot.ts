// Save and restore simulation state for rollback netcode.
import { CombatState } from './types';

/** An immutable copy of a state at one frame. */
export interface Snapshot { readonly frame: number; readonly text: string }

/** Copy the whole state (about 1.3 KB; a few microseconds). */
export function saveState(s: CombatState): Snapshot {
    return { frame: s.frame, text: JSON.stringify(s) };
}

/**
 * Restore `target` to `snapshot` IN PLACE. The state object, its fighters
 * array and each fighter object keep their identity: the renderer keys
 * animation history (gait, landing, paired-body formation) by fighter object,
 * so replacing them would reset that history on every rollback. Everything
 * nested inside (moves, reactions, projectiles, effects) is replaced.
 */
export function loadState(target: CombatState, snapshot: Snapshot): void {
    const source = JSON.parse(snapshot.text) as CombatState;
    const t = target as unknown as Record<string, unknown>, s = source as unknown as Record<string, unknown>;
    for (const key of Object.keys(t)) if (key !== 'fighters' && !(key in s)) delete t[key];
    for (const key of Object.keys(s)) if (key !== 'fighters') t[key] = s[key];
    if (target.fighters.length !== source.fighters.length) throw new Error('snapshot is from a different match');
    for (let i = 0; i < source.fighters.length; i++) {
        const f = target.fighters[i] as unknown as Record<string, unknown>, g = source.fighters[i] as unknown as Record<string, unknown>;
        for (const key of Object.keys(f)) if (!(key in g)) delete f[key];
        Object.assign(f, g);
    }
}
