import { A, getMove, type CombatState } from './core';
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
        const advantage = other.stun || other.blockstun ? Math.max(other.stun, other.blockstun) - remaining : null;
        return `P${i+1}: ${inputLabel(f.input)} | ${f.move?.id ?? 'neutral'} | commitment ${remaining}f | advantage ${advantage === null ? '—' : (advantage >= 0 ? '+' : '') + advantage + 'f'} | HP ${f.hp}`;
    }).join('\n');
}
