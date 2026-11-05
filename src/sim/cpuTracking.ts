import { FLOOR, WIDTH } from './constants';
import { COMBAT_STYLES, bodySpread, fighterWall } from './roster';
import { getMove } from './combat';
import { HITBOX_DATA } from './geometry';
import { getProjectileOrigin } from './projectileOrigin';
import type { CombatState, CpuObservation, Fighter } from './types';

interface TrackingBounds { wall: number; selfX: number; selfGrounded: boolean; minimumGap: number }
/** Continue only queued velocity and queued friction; never sample a new rival input. */
export function projectCpuMotion(seen: CpuObservation, ticks: number, bounds: TrackingBounds): { x: number; vx: number } {
    let x = seen.x, vx = seen.vx;
    const elapsed = Math.max(0, ticks);
    if (seen.vxDamping === 1) x += vx * elapsed;
    else for (let tick = 0; tick < elapsed; tick++) { vx *= seen.vxDamping; x += vx; }
    const bounded = Math.max(bounds.wall, Math.min(WIDTH - bounds.wall, x));
    if (bounded !== x) vx = 0;
    x = bounded;
    // Known grounded bodies cannot pass through one another. Unknown jumps or
    // direction changes only enter this forecast once the visual queue exposes them.
    if (bounds.selfGrounded && seen.y >= FLOOR) {
        const side = seen.x >= bounds.selfX ? 1 : -1;
        const contact = bounds.selfX + side * bounds.minimumGap;
        const separated = side === 1 ? Math.max(x, contact) : Math.min(x, contact);
        if (separated !== x) vx = 0;
        x = Math.max(bounds.wall, Math.min(WIDTH - bounds.wall, separated));
    }
    return { x, vx };
}

export function cpuTrackingBounds(f: Fighter, opponent: Fighter['id'], selfX = f.x): TrackingBounds {
    return { wall: fighterWall(opponent), selfX, selfGrounded: f.y >= FLOOR,
        minimumGap: 55 + bodySpread(f.id) + bodySpread(opponent) };
}

/** Reject a ground cast predicted to release its forward shot beyond the rival. */
export function cpuCastHasLane(s: CombatState, slot: 0 | 1, seen: CpuObservation, elapsed: number): boolean {
    const f = s.fighters[slot], opponent = s.fighters[1 - slot].id;
    if (f.y < FLOOR || seen.y < FLOOR) return true; // Vertical interception is not forecast here.
    const startup = getMove(f, 'bolt').startup;
    // A known ground cast damps the caster's existing momentum each startup tick.
    let releaseX = f.x, vx = f.vx;
    for (let tick = 0; tick < startup; tick++) { vx *= .7; releaseX += vx; }
    releaseX = Math.max(fighterWall(f.id), Math.min(WIDTH - fighterWall(f.id), releaseX));
    const target = projectCpuMotion(seen, elapsed + startup, cpuTrackingBounds(f, opponent, releaseX));
    const style = COMBAT_STYLES[f.id].projectile;
    const origins = [getProjectileOrigin(f), ...(style.secondaryOrigin ? [style.secondaryOrigin] : [])];
    const shotHalfWidth = style.shape === 'retain' ? HITBOX_DATA.projectile.retainerHalfWidth : HITBOX_DATA.projectile.halfWidth;
    const targetHalfWidth = HITBOX_DATA.body.halfWidth + bodySpread(opponent);
    const firstTravel = style.beamLength ? 0 : style.speed + (style.accel ?? 0);
    const firstContact = Math.max(...origins.map(origin => origin.forward + firstTravel)) - shotHalfWidth - targetHalfWidth;
    return (target.x - releaseX) * f.facing > firstContact + 4;
}
