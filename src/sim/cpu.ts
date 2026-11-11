// The controller is a pure read. Only step advances its seeded observations and intent.
import { getMove, grounded } from './combat';
import { A, FLOOR } from './constants';
import { COMBAT_STYLES, MOVES, bodySpread } from './roster';
import { cpuRandom, ensureCpuMemory } from './cpuState';
import type { CombatState, CpuMemory, Fighter, Projectile } from './types';

export const CPU_SKILLS = [1, 4, 7, 10] as const;
export const CPU_SKILL_VERSION = 4;
export const CPU_DIFFICULTIES = [
    { name: 'Easy', skill: 1 }, { name: 'Normal', skill: 4 },
    { name: 'Hard', skill: 7 }, { name: 'Expert', skill: 10 },
] as const;
// guard..combo are the published reaction model. The last four are reads of a rival's
// habits: `wake` holds guard while recovering from a hit or knockdown, `shot` guards a
// projectile that has been seen coming, `read` acts on a repeated pattern (stop-hit a
// walk-in, jump a crouching low poke, dash through a projectile gap) and `repeat` is the
// least punish chance once the same move has been blocked twice in three seconds.
const anchors = [
    { skill: 1, reaction: 28, guard: .25, low: .20, punish: 0, antiAir: 0, tech: 0, combo: .40, wake: .30, shot: .45, read: .15, repeat: .20 },
    { skill: 4, reaction: 18, guard: .50, low: .45, punish: .30, antiAir: .25, tech: .20, combo: .70, wake: .60, shot: .75, read: .60, repeat: .60 },
    { skill: 7, reaction: 12, guard: .70, low: .70, punish: .65, antiAir: .60, tech: .50, combo: .90, wake: .85, shot: .92, read: .85, repeat: .90 },
    { skill: 10, reaction: 8, guard: .85, low: .90, punish: .90, antiAir: .85, tech: .75, combo: 1, wake: .97, shot: .99, read: .97, repeat: .98 },
] as const;
export function cpuTuning(skill = 4) {
    const level = Math.max(1, Math.min(10, Number.isFinite(skill) ? skill : 4));
    const index = level < 4 ? 0 : level < 7 ? 1 : 2;
    const a = anchors[index], b = anchors[index + 1], t = (level - a.skill) / (b.skill - a.skill);
    const mix = (key: Exclude<keyof typeof a, 'skill'>) => a[key] + (b[key] - a[key]) * t;
    return { skill: level, reaction: Math.round(mix('reaction')), guard: mix('guard'), low: mix('low'),
        punish: mix('punish'), antiAir: mix('antiAir'), tech: mix('tech'), combo: mix('combo'),
        wake: mix('wake'), shot: mix('shot'), read: mix('read'), repeat: mix('repeat') };
}

/** How stale the rival's position may be when judging range. Recognising what they are doing still takes `reaction` frames. */
const TRACKING_FRAMES = 6;
/** Frames between a retreat being cut short and the next one being allowed. */
const ADVANCE_FRAMES = 45;
/** The longest the CPU backs away with nothing coming at it. */
export const CPU_RETREAT_LIMIT = 30;
/** Two guards of the same move inside this many combat ticks are a habit to punish. */
const REPEAT_WINDOW = 180;

/** Frames until a rival projectile reaches this fighter, or -1 when none is coming. */
function shotArrival(f: Fighter, shots: readonly Projectile[], slot: number): { eta: number; clear: boolean } {
    let eta = -1, clear = false;
    for (const p of shots) {
        if (p.owner === slot || p.life <= 0 || p.beamHit) continue;
        const dx = f.x - p.x;
        let frames: number;
        if (p.beamLength) {
            if (dx * (p.beamDirection ?? 1) < 0 || Math.abs(dx) > p.beamLength + 40) continue;
            frames = 0;
        } else {
            if (Math.abs(p.vx) < 1 || dx * p.vx <= 0) continue;
            // Assume we keep walking into it, so the guard is never late.
            frames = Math.max(0, Math.ceil((Math.abs(dx) - 40) / (Math.abs(p.vx) + 4)));
        }
        if (eta < 0 || frames < eta) {
            eta = frames;
            // A straight, level shot can be jumped. Arcs, bounces and beams cannot be trusted.
            clear = !p.beamLength && !p.gravity && !p.wave && !p.bounces && !p.returnAt && Math.abs(p.vy) < 1 && Math.abs(p.vx) <= 14;
        }
    }
    return { eta, clear };
}

/** Called exactly once per simulation tick, even when neither seat is CPU controlled. */
export function advanceCpuState(s: CombatState): void {
    const memories = ensureCpuMemory(s);
    for (const slot of [0, 1] as const) {
        const memory = memories[slot], f = s.fighters[slot], p = s.fighters[1 - slot];
        const move = p.move ? getMove(p, p.move.id) : null;
        const previous = memory.observations.at(-1);
        const newAttack = !!p.move && (previous?.move !== p.move.id || previous.age > p.move.t);
        if (newAttack) {
            memory.attackRoll = cpuRandom(memory); memory.lowRoll = cpuRandom(memory);
            memory.habits.attacks++; memory.habits.lows += Number(!!move?.low);
            memory.habits.projectiles += Number(!!move?.projectile);
        }
        memory.attackKey = p.move ? newAttack ? `${p.move.id}:${s.frame}` : memory.attackKey : '';
        if (!grounded(p) && !memory.airborne) { memory.jumpRoll = cpuRandom(memory); memory.habits.jumps++; }
        memory.airborne = !grounded(p);
        const hold = s.throwState;
        const caught = hold?.phase === 'hold' && hold.victim === slot;
        if (caught && memory.throwKey < 0) { memory.throwRoll = cpuRandom(memory); memory.throwKey = s.frame; }
        if (!caught) memory.throwKey = -1;
        if (f.combo > 0 && memory.combo === 0) memory.comboRoll = cpuRandom(memory);
        memory.combo = f.combo;
        if (s.frame >= memory.nextDecision) {
            memory.choice = cpuRandom(memory); memory.decisionAt = s.frame;
            memory.nextDecision = s.frame + 8 + Math.floor(cpuRandom(memory) * 7);
            memory.readRoll = cpuRandom(memory);
        }
        // One roll per hit taken decides whether guard is held through the recovery.
        if (f.stun > 0 && !memory.stunned) memory.wakeRoll = cpuRandom(memory);
        memory.stunned = f.stun > 0;
        // A guard is felt, not seen: remember which move it was and how often it repeats.
        if (f.blockstun > memory.blockstun && p.move) {
            memory.blocks.push({ move: p.move.id, tick: memory.combatTicks });
            if (memory.blocks.length > 8) memory.blocks.shift();
        }
        memory.blockstun = f.blockstun;
        const arrival = shotArrival(f, s.projectiles, slot);
        memory.shotSeen = arrival.eta >= 0;
        // Backing away with nothing incoming is capped; see cpuInput.
        const away = p.x < f.x ? A.right : A.left;
        const nearing = (p.x < f.x ? p.vx : -p.vx) > 1 && Math.abs(p.x - f.x) < 340;
        const threatened = !!p.move || arrival.eta >= 0 || f.blockstun > 0 || f.stun > 0 || !grounded(p) || nearing;
        memory.retreat = (f.input & away) && !threatened ? memory.retreat + 1 : 0;
        if (memory.advance > 0) memory.advance--;
        if (memory.retreat >= CPU_RETREAT_LIMIT) { memory.retreat = 0; memory.advance = ADVANCE_FRAMES; }
        memory.observations.push({ frame: s.frame, combatTick: memory.combatTicks, x: p.x, y: p.y, vx: p.vx, vy: p.vy, hp: p.hp,
            move: p.move?.id ?? null, age: p.move?.t ?? 0, startup: move?.startup ?? 0,
            active: move?.active ?? 0, recovery: move?.recovery ?? 0, low: !!move?.low,
            input: p.input, attackRoll: memory.attackRoll, lowRoll: memory.lowRoll, jumpRoll: memory.jumpRoll,
            attacks: memory.habits.attacks, lows: memory.habits.lows, projectiles: memory.habits.projectiles,
            shot: s.projectiles.some(projectile => projectile.owner !== slot && Math.abs(projectile.x - f.x) < 220),
            shotEta: arrival.eta, shotClear: arrival.clear });
        if (memory.observations.length > 30) memory.observations.shift();
        // Strategic intent uses the oldest retained observation (at least as
        // conservative as Easy's visual delay). Tactical reactions below use skill.
        const perceived = memory.observations[0];
        const gap = Math.abs(perceived.x - f.x) - bodySpread(f.id) - bodySpread(p.id);
        // A rival who mostly shoots is walked down, not out-waited: zoning back is for a life lead.
        const outgunned = perceived.projectiles > perceived.attacks / 2;
        memory.intent = perceived.move && perceived.age >= perceived.startup + perceived.active ? 'punish'
            : (perceived.move || (perceived.attacks > 0 && memory.choice < .85)) && gap < 200 ? 'defend' : gap > 250 && f.hp > perceived.hp && !outgunned
                ? 'zone' : gap > 100 ? 'approach' : 'pressure';
    }
}

/**
 * Input-only replay invariant: this call is idempotent and never consumes RNG.
 * The decision itself is `decide`; this wrapper only enforces the retreat limit.
 */
export function cpuInput(s: CombatState, slot: 0 | 1 = 1, skill = 4): number {
    const input = decide(s, slot, skill), memory = s.cpu?.[slot];
    if (!memory || memory.advance <= 0 || s.mode === 'dummy' || s.mode === 'guard') return input;
    const f = s.fighters[slot], rival = s.fighters[1 - slot];
    const away = rival.x < f.x ? A.right : A.left;
    const nearing = (rival.x < f.x ? rival.vx : -rival.vx) > 1 && Math.abs(rival.x - f.x) < 340;
    if (!(input & away) || f.blockstun || f.stun || rival.move || !grounded(rival) || memory.shotSeen || nearing) return input;
    // Nothing is coming: stop giving ground and step back in instead.
    const gap = Math.abs(rival.x - f.x) - bodySpread(f.id) - bodySpread(rival.id);
    return (input & ~away) | (gap > getMove(f, 'light').range && !(input & A.down) ? (away === A.left ? A.right : A.left) : 0);
}

function decide(s: CombatState, slot: 0 | 1, skill: number): number {
    const f = s.fighters[slot], current = s.fighters[1 - slot];
    if (s.mode === 'dummy') return 0;
    if (s.mode === 'guard') return (current.x < f.x ? A.right : A.left) | (current.input & A.down);
    const memory = s.cpu?.[slot], tuning = cpuTuning(skill);
    if (!memory) return 0;
    // Throw recognition is a separate tactile 3-frame response. The ordinary visual
    // reaction queue cannot fit in the universal 7-frame tech window (Phase 3).
    if (s.throwState?.phase === 'hold' && s.throwState.victim === slot &&
        s.throwState.t >= 3 && s.throwState.t <= 6 && memory.throwRoll < tuning.tech) return A.grab;
    if (f.hp <= 0) return 0;
    const seen = memory.observations.find(o => o.frame >= s.frame - tuning.reaction);
    if (!seen || s.frame < tuning.reaction) return 0;
    const toward = seen.x < f.x ? A.left : A.right, away = seen.x < f.x ? A.right : A.left;
    const spread = bodySpread(f.id) + bodySpread(current.id);
    // Recognising a move takes the full reaction time, but where a rival stands is tracked
    // continuously: range is judged from a much fresher sighting, and a rival seen walking in
    // is assumed to have kept walking since. A hit or guard we just landed is felt at once.
    const tracked = memory.observations.find(o => o.frame >= s.frame - Math.min(tuning.reaction, TRACKING_FRAMES)) ?? seen;
    const closing = tracked.y >= FLOOR && !tracked.move && !current.stun && !current.blockstun ? Math.max(0, tracked.x < f.x ? tracked.vx : -tracked.vx) : 0;
    const distance = Math.max(0, Math.abs(tracked.x - f.x) - spread - closing * (s.frame - tracked.frame));
    const pulse = s.frame - memory.decisionAt < 2;
    const light = getMove(f, 'light'), medium = getMove(f, 'medium'), heavy = getMove(f, 'heavy');
    const meleeGap = (range: number) => range - bodySpread(f.id) - 4;
    const lowHabit = seen.attacks > 0 && seen.lows / seen.attacks > .5;
    const grabChance = lowHabit || (seen.input & toward) ? .30 : .16;
    // Forecast defense is separate from the published visible-attack guard
    // probability. Disjoint intervals reserve space for guard, jab and throw.
    const forecastGuardShare = tuning.guard * (1 - grabChance) * .9;
    // A throw read has to close beyond jab spacing. Keep that seeded plan for
    // the decision interval instead of stopping forever outside grab reach.
    const grabGap = meleeGap(getMove(f, 'grab').range);
    const grabPlan = memory.choice > 1 - grabChance && grounded(f) && seen.y >= FLOOR && distance < 160;
    const pressureGap = grabPlan ? grabGap : meleeGap(light.range);
    const approach = memory.intent === 'zone' && distance > 200
        ? distance < 310 ? away : 0 : distance > pressureGap ? toward : 0;
    const expectsLow = seen.low || (seen.attacks > 0 && seen.lows / seen.attacks > .2);
    const guard = away | (expectsLow && seen.lowRoll < tuning.low ? A.down : 0);
    // A standing jab passes over a crouching rival; a low jab or a medium does not.
    const crouched = tracked.y >= FLOOR - 1 && !!(tracked.input & A.down);
    const jab = crouched ? A.down | A.light : A.light;
    // Extrapolate the commitment we actually saw. An old recovery observation
    // is not a fresh opening after the reaction queue has already consumed it.
    const projectedAge = seen.age + memory.combatTicks - seen.combatTick;
    const remaining = seen.startup + seen.active + seen.recovery - projectedAge;
    const casting = !!seen.move && !!MOVES[seen.move].projectile;
    // A shot that was seen leaving keeps travelling while the reaction queue catches up, and
    // a cast seen winding up will release one: both are a known arrival time, not a guess.
    // The estimate runs on past the release until the shot itself is seen.
    const windup = casting && projectedAge < seen.startup + seen.active + seen.recovery
        ? seen.startup - projectedAge + Math.max(0, Math.abs(seen.x - f.x) - 80) / (COMBAT_STYLES[current.id].projectile.speed + 4) : -99;
    const shotKnown = seen.shotEta >= 0 || windup >= -6;
    const shotEta = seen.shotEta >= 0 ? seen.shotEta - (s.frame - seen.frame) : windup;
    const shotDue = shotKnown && shotEta >= -2 && shotEta <= 7;
    // Crouching guard stops a shot without walking backwards: the ground already won is kept.
    const shotGuard = away | (grounded(f) ? A.down : 0);
    if (f.stun) {
        // Guard is held through the last frames of a hit or a knockdown, so a rival who
        // keeps swinging meets a block. Crouching early would change the rise timing.
        const rising = !f.reaction || f.reaction.kind !== 'knockdown' || f.reaction.phase === 'rise';
        if (memory.wakeRoll >= tuning.wake || (distance > 240 && !shotDue)) return 0;
        return away | (rising && expectsLow && seen.lowRoll < tuning.low ? A.down : 0);
    }
    // Finishing our own guard stun is a tactile opportunity, not a peek at the
    // rival's future input. Buffer a short punish only at the end of that stun.
    if (f.blockstun) {
        if (f.blockstun > 2) return guard;
        // The same move guarded twice in three seconds is a habit: punish it reliably.
        const habit = !!current.move && guardedLately(current.move.id) >= 2;
        if (memory.choice >= (habit ? Math.max(tuning.punish, tuning.repeat) : tuning.punish)) return guard;
        return guard | punishButton();
    }
    /** The strongest answer that reaches the move just guarded before its owner recovers. */
    function punishButton(): number {
        const blocked = current.move;
        // A recovering limb can be hit a little further out than a neutral body.
        const reach = Math.abs(current.x - f.x) - spread - (blocked && !MOVES[blocked.id].projectile ? 24 : 0);
        const low = !!(current.input & A.down);
        const lightReaches = reach < meleeGap(light.range) + 20;
        // Without a read, the old habit stands: a jab, and only when it can reach.
        if (!blocked || !habitOrFinisher(blocked.id)) return lightReaches ? A.light : 0;
        const m = getMove(current, blocked.id);
        const open = m.startup + m.active + m.recovery - blocked.t - f.blockstun;
        if (reach < meleeGap(heavy.range) && open > heavy.startup + 1) return A.heavy;
        if (reach < meleeGap(medium.range) && open > medium.startup + 1) return A.medium;
        return lightReaches ? low ? A.down | A.light : A.light : 0;
    }
    function guardedLately(id: keyof typeof MOVES): number {
        return memory!.blocks.filter(b => b.move === id && memory!.combatTicks - b.tick <= REPEAT_WINDOW).length;
    }
    function habitOrFinisher(id: keyof typeof MOVES): boolean {
        return MOVES[id].rank >= 4 || guardedLately(id) >= 2;
    }
    if (f.move?.connected && memory.comboRoll < tuning.combo) {
        if (f.move.id === 'launcher' && grounded(f)) return A.up | toward;
        const rank = MOVES[f.move.id].rank;
        if (rank === 1) return approach | A.medium;
        if (rank === 2) return approach | A.heavy;
    }
    if (f.move) return 0;
    const incoming = seen.move && projectedAge < seen.startup + seen.active;
    // A cast is answered below, by its arrival time: backing off from the wind-up only hands over space.
    if (incoming && !casting && distance < 220 && seen.attackRoll < tuning.guard) {
        return away | (seen.low && seen.lowRoll < tuning.low ? A.down : 0);
    }
    if (!grounded(f)) {
        // In the air: guard a shot that is about to arrive, otherwise keep the jump going
        // and dive on a rival underneath.
        if (shotDue && seen.attackRoll < tuning.shot) return away;
        // A jump taken over a crouching low poke ends in a dive; one taken over a shot keeps going forward.
        if (crouched && lowHabit) {
            if (f.vy > -2 && f.y < FLOOR - 60 && distance < meleeGap(getMove(f, 'airHeavy').range) - 10) return A.down | A.heavy;
            if (distance > 30) return toward;
        }
        if (shotKnown && distance > 30) return toward;
    }
    if (seen.y < FLOOR - 35 && seen.vy >= 0 && distance < 145 && seen.jumpRoll < tuning.antiAir)
        return pulse ? A.launcher : 0;
    const unsafe = seen.move && projectedAge >= seen.startup + seen.active && remaining >= light.startup;
    // A dash cannot guard, so it is not used while a shot is about to arrive.
    const dashIn = shotKnown && shotEta < 20 ? toward : toward | A.dash;
    if (unsafe && (memory.intent === 'punish' || tuning.skill >= 4) && memory.choice < tuning.punish && pulse && !shotDue) {
        return distance < meleeGap(heavy.range) && remaining >= heavy.startup ? A.heavy
            : distance < meleeGap(medium.range) && remaining >= medium.startup ? A.medium : distance < meleeGap(light.range) ? jab : dashIn;
    }
    // A cast within reach is a long commitment: hit it before it releases, or after the guard.
    if (casting && grounded(f) && !shotDue && memory.readRoll < tuning.read) {
        const left = projectedAge < seen.startup ? seen.startup - projectedAge : remaining;
        if (distance < meleeGap(medium.range) && left > medium.startup + 1) return A.medium;
        if (distance < meleeGap(light.range) && left > light.startup) return jab;
    }
    // A projectile on its way: guard in place for the frames it can connect, and use the
    // gap before the next one to close in. Better players jump a clean shot or answer it.
    if (shotKnown && shotEta >= -2) {
        const special = getMove(f, 'special');
        if (tuning.skill >= 7 && f.pips === 3 && grounded(f) && shotEta <= 10 &&
            Math.abs(seen.x - f.x) - bodySpread(current.id) < special.range) return A.special;
        if (shotDue) { if (seen.attackRoll < tuning.shot) return shotGuard; }
        else if (grounded(f)) {
            const jumpShare = tuning.skill >= 4 ? Math.min(.45, .15 + (tuning.skill - 4) * .05) : 0;
            if (seen.shotEta >= 0 && seen.shotClear && seen.attackRoll < jumpShare && shotEta >= 9 && shotEta <= 15 && distance > 120) return A.up | toward;
            if (distance > pressureGap) {
                // Far enough out, a dash covers the gap and still ends before the shot lands.
                if (shotEta > 20 && distance > 220 && f.dashLock === 0 && memory.readRoll < tuning.read) return toward | A.dash;
                return toward;
            }
        }
    }
    // Jabs are faster than visual reaction at every level. Anticipate pressure
    // using only already-observed habits. A seeded decision remains fixed for
    // its 8–14-frame interval; repeated reads never reroll guard probability.
    // Only strikes are forecast here; a rival who has only ever cast is walked down instead.
    if (!unsafe && !grabPlan && seen.attacks > seen.projectiles && distance < 190 && memory.choice < forecastGuardShare) return guard;
    const projectileActive = s.projectiles.some(p => p.owner === slot && p.life > 0);
    if (f.pips === 3 && pulse && (tuning.skill >= 7 || (tuning.skill >= 4 && memory.choice < .5)) &&
        (!incoming || unsafe) && Math.abs(seen.x - f.x) - bodySpread(current.id) < getMove(f, 'special').range) return A.special;
    if (grounded(f) && memory.readRoll < tuning.read) {
        if (closing > 2 && !tracked.move) {
            // Stop-hit: a rival walking into range without attacking runs into a medium. Once
            // they are close enough to jab first, the swing is too late and a guard in place is not.
            const jabbed = getMove(current, 'light').range - bodySpread(current.id) + closing * 3;
            if (distance >= jabbed && distance < meleeGap(medium.range) + closing * medium.startup) return A.medium;
            if (distance < jabbed + 12) return away | A.down;
        }
        // A rival who waits in a crouch and pokes low loses to a jump-in.
        if (crouched && lowHabit && seen.attacks >= 2 && !seen.move && distance > 120 && distance < 215) return A.up | toward;
    }
    if (grabPlan) return distance < grabGap ? A.grab : approach;
    // Once a pressure plan reaches jab distance, take initiative as soon as
    // our own commitment ends. Move state releases the button on the next tick;
    // the seeded interval chooses the plan, not a periodic attack metronome.
    const pressureReady = distance < meleeGap(light.range) && memory.choice >= forecastGuardShare;
    if (!pulse && !pressureReady) return approach;
    if (distance < meleeGap(light.range)) {
        const jabEnd = 1 - grabChance;
        if (grounded(f) && memory.choice >= forecastGuardShare && memory.choice <= jabEnd) {
            // Guard/throw already consumed the other intervals. Choose the
            // grounded jab variant within its own interval, regardless of the
            // older strategic label (which may still say "defend").
            const variant = (memory.choice - forecastGuardShare) / (jabEnd - forecastGuardShare);
            return variant < .25 || crouched ? A.down | A.light : A.light;
        }
        return (memory.intent === 'pressure' && memory.choice < .25) || crouched ? A.down | A.light : A.light;
    }
    if (distance < meleeGap(medium.range)) return A.medium;
    // A cast of our own cannot guard, so none starts while a shot is on its way.
    if (distance > 240 && !projectileActive && !shotKnown && memory.choice < .65) return A.bolt | (f.hp > seen.hp && distance < 340 ? away : 0);
    if (distance > 200 && memory.choice > .65 && f.dashLock === 0) return dashIn;
    return approach;
}
