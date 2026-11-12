/**
 * Which sounds a frame of combat should make. Pure: it reads the state the renderer already
 * reads (effects, hit stop, moves, projectiles, throws, the winner) and returns sound names.
 * It never writes to the state, and the simulation never reads anything from here.
 */
import { FLOOR, WIDTH, getMove, type CombatState, type Effect, type MoveId } from './core';

export const SOUND_NAMES = [
    'hitLight', 'hitMedium', 'hitHeavy', 'hitSpecial',
    'block', 'justDefend', 'throw', 'tech',
    'whooshLight', 'whooshMedium', 'whooshHeavy',
    'shot', 'shotImpact',
    'ko', 'roundStart', 'win', 'lose',
    'menuMove', 'menuConfirm', 'menuBack',
    'dash', 'charge', 'teamSpecial',
] as const;
export type SoundName = typeof SOUND_NAMES[number];
export interface SoundCue { name: SoundName; /** -1 is the left wall, 1 the right. */ pan: number; volume?: number; /** Seconds to wait before it sounds. */ delay?: number; /** Set on a team special so the recording follows that fighter. */ fighterId?: string }

/** The colour the simulation gives a just-defend guard spark. */
const JUST_DEFEND = '#fff3ad';
/** Stereo position from an arena x. Kept inside +/-0.8 so nothing is hard-panned. */
export const panFor = (x: number): number => Math.max(-.8, Math.min(.8, (x / WIDTH) * 2 - 1));

/** Hit stop is 4, 6, 9 or 12 frames by strength, so it names the hit sound. */
export function hitSound(freeze: number): SoundName {
    return freeze >= 12 ? 'hitSpecial' : freeze >= 9 ? 'hitHeavy' : freeze >= 6 ? 'hitMedium' : 'hitLight';
}
/** Every effect kind the simulation emits maps to a sound; `null` means the kind is silent on purpose. */
export function effectSound(effect: Pick<Effect, 'kind' | 'color'>, freeze: number, projectileGone = false): SoundName | null {
    switch (effect.kind) {
        case 'hit': return projectileGone && freeze < 6 ? 'shotImpact' : hitSound(freeze);
        case 'special': return 'hitSpecial';
        case 'block': return effect.color === JUST_DEFEND ? 'justDefend' : 'block';
        case 'charge': return 'charge';
        case 'dash': return 'dash';
        case 'pumpkin': return 'shotImpact';
    }
}
/**
 * The swing of a move as it starts. The recorded file already contains the impact,
 * so a later hit does not play it again. Projectiles and throws have their own sounds.
 */
export function whooshSound(id: MoveId): SoundName | null {
    switch (id) {
        case 'light': case 'low': case 'airLight': return 'whooshLight';
        case 'medium': case 'airMedium': case 'launcher': return 'whooshMedium';
        case 'heavy': case 'sweep': case 'airHeavy': return 'whooshHeavy';
        case 'special': return 'teamSpecial';
        case 'bolt': case 'grab': return null;
    }
}

/** Remembers what the last frame looked like so each event sounds once. */
export class SoundTracker {
    /** Effects already voiced, by kind, place and birth frame. Object identity would not survive a rollback. */
    private effects = new Map<string, number>();
    private moves: ({ id: MoveId; t: number } | null)[] = [null, null];
    private throwing = false;
    private notice = '';
    private winner: number | null = null;
    private down = false;
    private frame = -1;
    /** This fighter's current move already played a clip that includes the impact. */
    private attackCovered = [false, false];
    /** This fighter's shot clip already includes the projectile impact. */
    private shotCovered = [false, false];

    /** Forget everything: a new round or a new match must not replay the old one's sounds. */
    reset(s?: CombatState): void {
        this.effects.clear();
        this.moves = s ? s.fighters.map(f => f.move ? { id: f.move.id, t: f.move.t } : null) : [null, null];
        this.throwing = !!s?.throwState; this.notice = s && s.noticeLife > 0 ? s.notice : ''; this.winner = s?.winner ?? null;
        this.down = !!s?.fighters.some(f => f.hp <= 0); this.frame = s?.frame ?? -1;
        this.attackCovered = [false, false]; this.shotCovered = [false, false];
        if (s) for (const e of s.effects) this.effects.set(effectKey(e, s.frame), s.frame);
    }

    /** `listener` is the seat that hears "win" or "lose" (0 against the CPU; the local seat online). */
    collect(s: CombatState, listener = 0): SoundCue[] {
        const cues: SoundCue[] = [];
        // A restart or a new round steps the frame backwards: resynchronise without sound.
        if (s.frame < this.frame) { this.reset(s); return cues; }
        if (s.frame === this.frame) return cues;
        this.frame = s.frame;
        s.fighters.forEach((f, i) => {
            const move = f.move, before = this.moves[i];
            if (move) {
                const fresh = !before || before.id !== move.id || move.t < before.t;
                if (fresh) this.attackCovered[i] = false;
                const name = fresh ? whooshSound(move.id) : null;
                // The file is the whole attack, so it plays at full level rather than as a quiet swing under a second hit.
                if (name) {
                    const cue: SoundCue = { name, pan: panFor(f.x), volume: 1 };
                    if (name === 'teamSpecial') cue.fighterId = f.id;
                    cues.push(cue);
                    this.attackCovered[i] = true;
                }
                if (move.id === 'grab' && fresh && !s.throwState) cues.push({ name: 'whooshLight', pan: panFor(f.x), volume: 1 });
                if (move.id === 'bolt') {
                    // The shot leaves when startup ends. The same file contains the landing.
                    const startup = getMove(f, 'bolt').startup;
                    if (move.t >= startup && (fresh || before!.t < startup)) {
                        cues.push({ name: 'shot', pan: panFor(f.x) });
                        this.shotCovered[i] = true;
                    }
                }
            } else this.attackCovered[i] = false;
            this.moves[i] = move ? { id: move.id, t: move.t } : null;
        });
        for (const e of s.effects) {
            const key = effectKey(e, s.frame);
            if (this.effects.has(key)) continue;
            this.effects.set(key, s.frame);
            // An effect first seen late (a rollback rebuilt it) is not voiced again.
            if (e.max - e.life > 3) continue;
            // A throw catch and a throw break both emit a guard spark; they are voiced below.
            if (e.kind === 'block' && (s.throwState || (s.notice === 'THROW BREAK' && s.noticeLife >= 58))) continue;
            // A hit with no melee move behind it came from a projectile (or is a body landing on the floor).
            const victim = Math.abs(s.fighters[0].x - e.x) <= Math.abs(s.fighters[1].x - e.x) ? 0 : 1, strikerIndex = 1 - victim, striker = s.fighters[strikerIndex].move;
            const floorBody = e.kind === 'hit' && e.y >= FLOOR - 20;
            const ranged = e.kind === 'hit' && e.y < FLOOR - 20 && !(striker && striker.id !== 'bolt' && striker.hit);
            const name = floorBody ? 'hitMedium' : effectSound(e, s.freeze, ranged);
            if (!name) continue;
            // A body landing is not the attack that already played. Everything else from that attack is in the clip.
            if (!floorBody && ranged && this.shotCovered[strikerIndex]) continue;
            if (!floorBody && !ranged && this.attackCovered[strikerIndex] && (name === 'hitLight' || name === 'hitMedium' || name === 'hitHeavy' || name === 'hitSpecial')) continue;
            const cue: SoundCue = { name, pan: panFor(e.x) };
            if (name === 'hitSpecial') cue.fighterId = s.fighters[strikerIndex].id;
            cues.push(cue);
        }
        if (this.effects.size > 64) for (const [key, born] of this.effects) if (born < s.frame - 90) this.effects.delete(key);
        const throwing = !!s.throwState;
        if (throwing && !this.throwing) cues.push({ name: 'throw', pan: panFor(s.fighters[s.throwState!.attacker].x) });
        this.throwing = throwing;
        const notice = s.noticeLife > 0 ? s.notice : '';
        if (notice === 'THROW BREAK' && this.notice !== 'THROW BREAK') cues.push({ name: 'tech', pan: 0 });
        this.notice = notice;
        const down = s.fighters.some(f => f.hp <= 0);
        if (down && !this.down) cues.push({ name: 'ko', pan: 0 });
        this.down = down;
        if (s.winner !== null && this.winner === null && s.winner !== 2)
            cues.push({ name: s.winner === listener ? 'win' : 'lose', pan: 0, delay: .45 });
        this.winner = s.winner;
        return cues;
    }
}
const effectKey = (e: Effect, frame: number): string => `${e.kind}|${e.x}|${e.y}|${frame - (e.max - e.life)}`;
