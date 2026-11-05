import { COMBAT_STYLES, CROUCH_SPIT_ORIGINS, bodySpread, isCrouchingSpit, isPairedFighter } from './roster';
import type { Fighter } from './types';

/** The same frozen numeric release point is used by simulation and CPU planning. */
export function getProjectileOrigin(f: Fighter): { forward: number; height: number } {
    const style = COMBAT_STYLES[f.id].projectile;
    return isCrouchingSpit(f) ? CROUCH_SPIT_ORIGINS[f.id]!
        : style.originByFacing?.[f.facing === 1 ? 'right' : 'left'] ?? style.origin
            ?? (f.id === 'rivet' ? { forward: 44, height: 109 }
                : f.id === 'vela' ? { forward: 59, height: 103 }
                    : isPairedFighter(f.id) ? { forward: bodySpread(f.id) + 65, height: 75 }
                        : { forward: 34, height: 95 });
}
