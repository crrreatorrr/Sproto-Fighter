// Frozen numeric combat geometry; independent of sprites and rendering.
import data from './data/hitboxes.json';
import { A, FLOOR } from './constants';
import { bodySpread, MOVES, Move, MoveId } from './roster';
import { Fighter, Projectile } from './types';

export interface CombatRect { left: number; right: number; top: number; bottom: number }
export const HITBOX_DATA = data;
export const rectanglesOverlap = (a: CombatRect, b: CombatRect): boolean =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

/** Rectangles use world coordinates, positive y down; table heights are above root. */
export function getHitbox(f: Fighter, id: MoveId, move: Move): CombatRect {
    const box = data.moves[id];
    let heights: readonly number[] = box.height;
    if (id !== 'special' && id !== 'grab') {
        if (f.move?.aim === 'up') heights = data.aims.up.height;
        else if (f.move?.aim === 'upForward') heights = data.aims.upForward.height;
        else if (f.move?.aim === 'down' && f.y < FLOOR) heights = data.aims.downAir.height;
    }
    // The effective move range already includes the front member's spread.
    // Subtract the neutral target half-width so that ordinary root contact
    // retains the old reach; an extended recovery hurtbox is punishable farther out.
    const end = Math.max(box.forward[0] + 1, box.forward[1] + move.range - MOVES[id].range - data.body.halfWidth);
    const start = box.forward[0];
    return {
        left: f.x + (f.facing === 1 ? start : -end),
        right: f.x + (f.facing === 1 ? end : -start),
        top: f.y - heights[1], bottom: f.y - heights[0],
    };
}

/** An attacking limb remains vulnerable through active and recovery frames. */
export function getHurtbox(f: Fighter, move?: Move, moveAge = f.move?.t ?? 0): CombatRect {
    const airborne = f.y < FLOOR;
    const crouching = !airborne && !!(f.input & A.down);
    const width = data.body.halfWidth + bodySpread(f.id);
    const height = airborne ? data.body.airHeight : crouching ? data.body.crouchHeight : data.body.standingHeight;
    const box = { left: f.x - width, right: f.x + width, top: f.y - height,
        bottom: f.y - (airborne ? data.body.airBottom : 0) };
    if (f.move && move && !move.projectile && f.move.id !== 'grab' && f.move.id !== 'special' && moveAge >= move.startup) {
        const extension = Math.min(data.body.recoveryExtension, Math.max(0, move.range - bodySpread(f.id)) * .35);
        if (f.facing === 1) box.right += extension; else box.left -= extension;
    }
    return box;
}

export function getProjectileHitbox(p: Projectile): CombatRect {
    const halfHeight = p.beamLength ? data.projectile.beamHalfHeight : data.projectile.halfHeight;
    const halfWidth = p.shape === 'retain' ? data.projectile.retainerHalfWidth : data.projectile.halfWidth;
    const direction = p.beamDirection ?? 1;
    return { left: p.beamLength ? p.x + (direction === 1 ? 0 : -p.beamLength) : p.x - halfWidth,
        right: p.beamLength ? p.x + (direction === 1 ? p.beamLength : 0) : p.x + halfWidth,
        top: p.y - halfHeight, bottom: p.y + halfHeight };
}

/** Resolve all clashes before any projectile can damage a fighter this tick. */
export function clashProjectiles(projectiles: Projectile[]): void {
    for (let i = 0; i < projectiles.length; i++) for (let j = i + 1; j < projectiles.length; j++) {
        const a = projectiles[i], b = projectiles[j];
        if (a.life <= 0 || b.life <= 0 || a.owner === b.owner || !rectanglesOverlap(getProjectileHitbox(a), getProjectileHitbox(b))) continue;
        if (a.beamLength && !b.beamLength) b.life = 0;
        else if (b.beamLength && !a.beamLength) a.life = 0;
        else { a.life = 0; b.life = 0; }
    }
}
