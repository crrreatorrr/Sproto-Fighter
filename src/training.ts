import { A, COMBAT_STYLES, getHitbox, getHurtbox, getMove, getProjectileHitbox, grounded, type CombatState } from './core';
const actions = Object.entries(A);
export const inputLabel = (mask: number): string => actions.filter(([, bit]) => mask & bit).map(([name]) => name).join(' + ') || 'neutral';
const mirror = (mask: number): number => (mask & ~(A.left | A.right)) | (mask & A.left ? A.right : 0) | (mask & A.right ? A.left : 0);
/** Local training controller. Captures P1 inputs in facing-relative form, replays them on the dummy. */
export class TrainingRecorder {
    frames: number[] = []; recording = false; playing = false; cursor = 0;
    record(): void { this.frames = []; this.cursor = 0; this.playing = false; this.recording = true; }
    stop(): void { this.recording = false; this.playing = false; }
    play(): void { this.recording = false; this.cursor = 0; this.playing = this.frames.length > 0; }
    input(s: CombatState, player: number, dummy: number): number {
        if (this.recording && this.frames.length < 3600) this.frames.push(s.fighters[0].facing === 1 ? player : mirror(player));
        if (!this.playing || !this.frames.length) return dummy;
        const frame = this.frames[this.cursor++ % this.frames.length];
        return s.fighters[1].facing === 1 ? frame : mirror(frame);
    }
}
/** Remaining commitment vs observed stun, rather than claiming projectile travel has fixed advantage. */
export function trainingReadout(s: CombatState): string {
    return s.fighters.map((f, i) => {
        const other = s.fighters[1-i], move = f.move && getMove(f, f.move.id);
        const remaining = move && f.move ? Math.max(0, move.startup + move.active + move.recovery - f.move.t) : 0;
        // Stun decrements before act(), but a move clears after act(): its
        // owner can start an uncancelled action one tick after commitment ends.
        // A neutral fighter can act on the next tick, even at stun 1.
        const nextAction = Math.max(1, f.stun, f.blockstun, f.move ? remaining + 1 : 1);
        // Landing can clear air moves early; dash/jump buffers can change the
        // next action. Future Special waves/projectiles can refresh stun, while
        // knockdown/throw timing also needs more than the current countdown.
        const contextual = s.winner !== null || s.throwState || s.projectiles.some(p => p.life > 0 && !p.beamHit) || s.fighters.some(fighter =>
            fighter.hp <= 0 || !grounded(fighter) || fighter.dash > 0 || fighter.dashBuffer > 0 || fighter.jumpBuffer > 0 ||
            fighter.move?.id === 'special' || fighter.reaction?.kind === 'knockdown');
        const advantage = !contextual && (other.stun || other.blockstun)
            ? Math.max(1, other.stun, other.blockstun) - nextAction : null;
        return `P${i+1}: ${inputLabel(f.input)} | ${f.move?.id ?? 'neutral'} | commitment ${remaining}f | uncancelled advantage ${advantage === null ? '—' : (advantage >= 0 ? '+' : '') + advantage + 'f'} | HP ${f.hp}`;
    }).join('\n');
}

/** Draw the same frozen world rectangles used by collision, without changing combat state. */
export function drawTrainingGeometry(c: CanvasRenderingContext2D, s: CombatState): void {
    c.save();
    c.lineWidth = 2;
    const rectangle = (box: { left: number; right: number; top: number; bottom: number }, color: string) => {
        c.strokeStyle = color;
        c.strokeRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
    };
    for (const f of s.fighters) {
        const move = f.move ? getMove(f, f.move.id) : undefined;
        rectangle(getHurtbox(f, move), f.strikeInvuln > 0 ? '#aaaaaa' : '#65ef8e');
        if (!f.move || !move || move.projectile) continue;
        const active = f.move.id === 'special' ? COMBAT_STYLES[f.id].specialFrames.includes(f.move.t)
            : f.move.t >= move.startup && f.move.t < move.startup + move.active;
        if (active) rectangle(getHitbox(f, f.move.id, move), '#ff6a69');
    }
    for (const p of s.projectiles) if (p.life > 0 && !p.beamHit) rectangle(getProjectileHitbox(p), '#6ad8ff');
    c.restore();
}
