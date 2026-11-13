// Optional match-depth rules. Absent configuration preserves the online ruleset.
import { A, GRAVITY, TICK_RATE } from './constants';
import { createState } from './combat';
import type { CombatState } from './types';
import type { PlayableFighterId } from './roster';
export type MatchModifier = 'none' | 'double-meter' | 'low-gravity' | 'specials-only' | 'sudden-death' | 'reflect-projectiles';
export interface MatchDepth {
    round: number; wins: [number, number]; remaining: number;
    roundRecorded: boolean; complete: boolean; rounds: boolean;
    modifier: MatchModifier; startHp: [number, number];
    meter: [number, number]; backPressed: [number, number]; juggles: [number, number];
}
/** Local experimental rules: serialized with snapshots and explicitly included in replays. */
export function enableMatchDepth(s: CombatState, options: { rounds?: boolean; modifier?: MatchModifier } = {}): void {
    const hp = options.modifier === 'sudden-death' ? 300 : 1000;
    s.matchDepth = { round: 1, wins: [0, 0], remaining: 60 * TICK_RATE,
        roundRecorded: false, complete: false, rounds: options.rounds ?? true,
        modifier: options.modifier ?? 'none', startHp: [hp, hp], meter: [0, 0],
        backPressed: [-100, -100], juggles: [0, 0] };
    for (const f of s.fighters) { f.hp = hp; if (options.modifier === 'specials-only') f.pips = 3; }
}
export const matchGravity = (s: CombatState): number => s.matchDepth?.modifier === 'low-gravity' ? .6 : GRAVITY;
export function matchInput(s: CombatState, input: number): number {
    return s.matchDepth?.modifier === 'specials-only' ? input & (A.left | A.right | A.up | A.down | A.dash | A.block | A.bolt | A.special) : input;
}
/** Fixed-point meter, in 1/10000 of a pip; no progress is discarded at integer boundaries. */
export function grantMeter(s: CombatState, slot: number, units: number): void {
    const m = s.matchDepth, f = s.fighters[slot];
    if (!m) { f.pips = Math.min(3, f.pips + units / 10000); return; }
    if (f.pips >= 3) { m.meter[slot] = 0; return; }
    m.meter[slot] += units * (m.modifier === 'double-meter' ? 2 : 1);
    while (m.meter[slot] >= 10000 && f.pips < 3) { m.meter[slot] -= 10000; f.pips++; }
    if (f.pips === 3) m.meter[slot] = 0;
}
/** Called only for combat ticks, so pause and entrance clips do not consume time. */
export function tickMatchDepth(s: CombatState): void {
    const m = s.matchDepth; if (!m) return;
    if (m.remaining > 0) m.remaining--;
    if (!m.remaining && s.winner === null) {
        const [a, b] = s.fighters;
        const left = a.hp * m.startHp[1], right = b.hp * m.startHp[0];
        s.winner = left === right ? 2 : left > right ? 0 : 1;
        s.notice = 'TIME'; s.noticeLife = 120;
    }
    if (s.winner !== null && !m.roundRecorded) {
        m.roundRecorded = true;
        if (s.winner < 2) m.wins[s.winner]++;
        m.complete = !m.rounds || m.wins.some(w => w >= 2);
    }
}
/** Between-round presentation calls this; input-only replay calls it on its next step. */
export function nextMatchRound(s: CombatState): boolean {
    const m = s.matchDepth;
    if (!m || s.winner === null || !m.roundRecorded || m.complete) return false;
    const [a, b] = s.fighters;
    const fresh = createState(a.id as PlayableFighterId, s.mode, b.id as PlayableFighterId);
    fresh.fighters[0].partner = a.partner; fresh.fighters[1].partner = b.partner;
    const frame = s.frame, godMode = s.godMode;
    // Keep unrelated serialized controller/rules state in the containing object.
    s.fighters = fresh.fighters; s.projectiles = []; s.effects = []; s.freeze = 0;
    s.throwState = null; s.winner = null; s.notice = 'ROUND ' + (m.round + 1); s.noticeLife = 120;
    m.round++; m.remaining = 60 * TICK_RATE; m.roundRecorded = false;
    m.meter = [0, 0]; m.backPressed = [-100, -100]; m.juggles = [0, 0];
    for (let i = 0; i < 2; i++) { s.fighters[i].hp = m.startHp[i]; if (m.modifier === 'specials-only') s.fighters[i].pips = 3; }
    s.frame = frame; if (godMode) s.godMode = true;
    return true;
}
// Chapter 3 (and every fifth chapter after it) keeps standard rules with the chapter clock. It used to be
// specials-only, which refills both meters every frame and so gave the story CPU unlimited Team Specials.
// Outside God Mode, which fills only P1, nobody in the campaign gets meter they have not earned.
export const CHAPTER_BOSS_MODIFIERS: readonly MatchModifier[] = ['double-meter', 'low-gravity', 'none', 'sudden-death', 'reflect-projectiles'];
/** Chapter index comes from the campaign; these rules never change fighter health/damage secretly. */
export const chapterBossModifier = (chapterIndex: number): MatchModifier => CHAPTER_BOSS_MODIFIERS[((chapterIndex % 5) + 5) % 5];
