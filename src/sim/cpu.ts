// The controller is a pure read. Only step advances its seeded observations and intent.
import { getMove, grounded } from './combat';
import { A, FLOOR } from './constants';
import { MOVES, BALANCE_KITS, COMBAT_STYLES, CROUCH_SPIT_ORIGINS, bodySpread, isHorizontalSpit, isPairedFighter, type FighterId } from './roster';
import { cpuRandom, ensureCpuMemory } from './cpuState';
import type { CombatState, CpuObservation, Fighter } from './types';
import { getHurtbox, HITBOX_DATA } from './geometry';

export const CPU_SKILLS = [1, 4, 7, 10] as const;
export const CPU_SKILL_VERSION = 3;
export const CPU_DIFFICULTIES = [
    { name: 'Easy', skill: 1 }, { name: 'Normal', skill: 4 },
    { name: 'Hard', skill: 7 }, { name: 'Expert', skill: 10 },
] as const;
const anchors = [
    { skill: 1, reaction: 28, guard: .25, low: .20, punish: 0, antiAir: 0, tech: 0, combo: .40 },
    { skill: 4, reaction: 18, guard: .50, low: .45, punish: .30, antiAir: .25, tech: .20, combo: .70 },
    { skill: 7, reaction: 12, guard: .70, low: .70, punish: .65, antiAir: .60, tech: .50, combo: .90 },
    { skill: 10, reaction: 8, guard: .85, low: .90, punish: .90, antiAir: .85, tech: .75, combo: 1 },
] as const;
export function cpuTuning(skill = 4) {
    const level = Math.max(1, Math.min(10, Number.isFinite(skill) ? skill : 4));
    const index = level < 4 ? 0 : level < 7 ? 1 : 2;
    const a = anchors[index], b = anchors[index + 1], t = (level - a.skill) / (b.skill - a.skill);
    const mix = (key: Exclude<keyof typeof a, 'skill'>) => a[key] + (b[key] - a[key]) * t;
    return { skill: level, reaction: Math.round(mix('reaction')), guard: mix('guard'), low: mix('low'),
        punish: mix('punish'), antiAir: mix('antiAir'), tech: mix('tech'), combo: mix('combo') };
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
        }
        memory.observations.push({ frame: s.frame, combatTick: memory.combatTicks, x: p.x, y: p.y, vy: p.vy, hp: p.hp,
            move: p.move?.id ?? null, age: p.move?.t ?? 0, startup: move?.startup ?? 0,
            active: move?.active ?? 0, recovery: move?.recovery ?? 0, low: !!move?.low,
            input: p.input, attackRoll: memory.attackRoll, lowRoll: memory.lowRoll, jumpRoll: memory.jumpRoll,
            attacks: memory.habits.attacks, lows: memory.habits.lows, projectiles: memory.habits.projectiles,
            shot: s.projectiles.some(projectile => projectile.owner !== slot && Math.abs(projectile.x - f.x) < 220) });
        if (memory.observations.length > 30) memory.observations.shift();
        // Strategic intent uses the oldest retained observation (at least as
        // conservative as Easy's visual delay). Tactical reactions below use skill.
        const perceived = memory.observations[0];
        const gap = Math.abs(perceived.x - f.x) - bodySpread(f.id) - bodySpread(p.id);
        memory.intent = perceived.move && perceived.age >= perceived.startup + perceived.active ? 'punish'
            : (perceived.move || (perceived.attacks > 0 && memory.choice < .85)) && gap < 200 ? 'defend' : gap > 250 && (f.hp > perceived.hp || perceived.projectiles > perceived.attacks / 2)
                ? 'zone' : gap > 100 ? 'approach' : 'pressure';
    }
}

/** Conservative flight forecast from a delayed cast and public kit, never live rival state.
 * Unknown aimed/curved paths reserve guard rather than claiming a safe duck.
 * An observed cast can threaten beyond its two active emission frames.
 */
export function cpuProjectileThreat(seen: CpuObservation, id: FighterId, own: Fighter, combatTick: number) {
    if (seen.move !== 'bolt') return { incoming: false, duck: false };
    const profile = COMBAT_STYLES[id].projectile;
    const facing = own.x >= seen.x ? 1 : -1;
    const horizontal = isHorizontalSpit(id) || profile.horizontal === true;
    const crouchOrigin = isHorizontalSpit(id) && seen.y >= FLOOR ? CROUCH_SPIT_ORIGINS[id] : undefined;
    const origin = profile.originByFacing?.[facing === 1 ? 'right' : 'left'] ?? profile.origin
        ?? (isPairedFighter(id) ? { forward: bodySpread(id) + 65, height: 75 } : { forward: 34, height: 95 });
    const emitters = profile.secondaryOrigin ? [origin, profile.secondaryOrigin] : [origin];
    // Cast aim is latched at acceptance, but the observation only contains current
    // input. Include both possible mouth lanes instead of inferring aim from input.
    if (crouchOrigin) emitters.push(crouchOrigin);
    const age = seen.age + combatTick - seen.combatTick - seen.startup;
    const lifetime = profile.beamFrames ?? 100;
    const width = HITBOX_DATA.body.halfWidth + bodySpread(own.id);
    if (age >= lifetime - 1) return { incoming: false, duck: false };
    let incoming = false, duck = !!(profile.origin || profile.originByFacing) && horizontal && seen.y >= FLOOR && own.y >= FLOOR && !profile.ground;
    const standing = getHurtbox({ ...own, input: 0 });
    const crouching = getHurtbox({ ...own, input: A.down });
    for (const emitter of emitters) {
        const gap = Math.abs(own.x - seen.x) - emitter.forward;
        const reach = profile.beamLength ?? profile.speed * (lifetime - 1) + Math.max(0, profile.accel ?? 0) * lifetime * (lifetime - 1) / 2;
        // Straight horizontal shots already past our present body are no longer a threat.
        // Curved/returning paths retain a conservative lifetime envelope.
        const traveled = !profile.beamLength && horizontal && !profile.returnAt ? Math.max(0, age) * profile.speed : 0;
        const half = profile.beamLength ? HITBOX_DATA.projectile.beamHalfHeight : HITBOX_DATA.projectile.halfHeight;
        const y = seen.y - emitter.height;
        const intersectsStanding = !horizontal || (y + half > standing.top && y - half < standing.bottom);
        if (gap + width > traveled - (profile.shape === 'retain' ? HITBOX_DATA.projectile.retainerHalfWidth : HITBOX_DATA.projectile.halfWidth) && gap - width < reach && intersectsStanding) incoming = true;
        // Every emitter must clear the crouch hull. No probabilistic lane guessing.
        duck &&= y + half <= crouching.top;
    }
    return { incoming, duck: incoming && duck };
}

/** Input-only replay invariant: this call is idempotent and never consumes RNG. */
export function cpuInput(s: CombatState, slot: 0 | 1 = 1, skill = 4): number {
    const f = s.fighters[slot], current = s.fighters[1 - slot];
    if (s.mode === 'dummy') return 0;
    if (s.mode === 'guard') return (current.x < f.x ? A.right : A.left) | (current.input & A.down);
    const memory = s.cpu?.[slot], tuning = cpuTuning(skill);
    if (!memory) return 0;
    // Throw recognition is a separate tactile 3-frame response. The ordinary visual
    // reaction queue cannot fit in the universal 7-frame tech window (Phase 3).
    if (s.throwState?.phase === 'hold' && s.throwState.victim === slot &&
        s.throwState.t >= 3 && s.throwState.t <= 6 && memory.throwRoll < tuning.tech) return A.grab;
    if (f.stun || f.hp <= 0) return 0;
    const seen = memory.observations.find(o => o.frame >= s.frame - tuning.reaction);
    if (!seen || s.frame < tuning.reaction) return 0;
    const toward = seen.x < f.x ? A.left : A.right, away = seen.x < f.x ? A.right : A.left;
    const distance = Math.max(0, Math.abs(seen.x - f.x) - bodySpread(f.id) - bodySpread(current.id));
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
    // Finishing our own guard stun is a tactile opportunity, not a peek at the
    // rival's future input. Buffer a short punish only at the end of that stun.
    if (f.blockstun) return guard | (f.blockstun <= 2 && memory.choice < tuning.punish ? A.light : 0);
    if (f.move?.connected && memory.comboRoll < tuning.combo) {
        if (f.move.id === 'launcher' && grounded(f)) return A.up | toward;
        const rank = MOVES[f.move.id].rank;
        if (rank === 1) return approach | A.medium;
        if (rank === 2) return approach | A.heavy;
    }
    if (f.move) return 0;
    // Extrapolate the commitment we actually saw. An old recovery observation
    // is not a fresh opening after the reaction queue has already consumed it.
    const projectedAge = seen.age + memory.combatTicks - seen.combatTick;
    const remaining = seen.startup + seen.active + seen.recovery - projectedAge;
    const incoming = seen.move && projectedAge < seen.startup + seen.active;
    const projectileThreat = cpuProjectileThreat(seen, current.id, f, memory.combatTicks);
    if (projectileThreat.incoming && seen.attackRoll < tuning.guard) return away | (projectileThreat.duck ? A.down : 0);
    // A ray whose public startup fits inside our delay cannot be visually
    // countered on its first cast. After observing a projectile-heavy habit,
    // reserve the existing seeded forecast guard share for that possible lane.
    // This is an anticipatory read, not information about a fresh hidden cast.
    const ray = COMBAT_STYLES[current.id].projectile.beamLength;
    if (!seen.move && ray && BALANCE_KITS[current.id].moves.bolt.startup <= tuning.reaction &&
        seen.projectiles > 0 && seen.projectiles > seen.attacks / 2 && memory.choice < forecastGuardShare) {
        const forecast = cpuProjectileThreat({ ...seen, move: 'bolt', age: 0,
            startup: BALANCE_KITS[current.id].moves.bolt.startup, combatTick: memory.combatTicks },
            current.id, f, memory.combatTicks);
        if (forecast.incoming) return away | (forecast.duck ? A.down : 0);
    }
    if (incoming && seen.move !== 'bolt' && distance < 220 && seen.attackRoll < tuning.guard) {
        return away | (seen.low && seen.lowRoll < tuning.low ? A.down : 0);
    }
    if (seen.y < FLOOR - 35 && seen.vy >= 0 && distance < 145 && seen.jumpRoll < tuning.antiAir)
        return pulse ? A.launcher : 0;
    const unsafe = seen.move && projectedAge >= seen.startup + seen.active && remaining >= light.startup;
    if (unsafe && (memory.intent === 'punish' || tuning.skill >= 4) && memory.choice < tuning.punish && pulse) {
        return distance < meleeGap(heavy.range) && remaining >= heavy.startup ? A.heavy
            : distance < meleeGap(medium.range) && remaining >= medium.startup ? A.medium : distance < meleeGap(light.range) ? A.light : toward | A.dash;
    }
    // Jabs are faster than visual reaction at every level. Anticipate pressure
    // using only already-observed habits. A seeded decision remains fixed for
    // its 8–14-frame interval; repeated reads never reroll guard probability.
    if (!unsafe && !grabPlan && seen.attacks > 0 && distance < 190 && memory.choice < forecastGuardShare) return guard;
    const projectileActive = s.projectiles.some(p => p.owner === slot && p.life > 0);
    if (seen.shot && memory.choice < tuning.guard) return away | (memory.choice < .15 ? A.down : 0);
    if (f.pips === 3 && pulse && (tuning.skill >= 7 || (tuning.skill >= 4 && memory.choice < .5)) &&
        (!incoming || unsafe) && Math.abs(seen.x - f.x) - bodySpread(current.id) < getMove(f, 'special').range) return A.special;
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
            return variant < .25 ? A.down | A.light : A.light;
        }
        return memory.intent === 'pressure' && memory.choice < .25 ? A.down | A.light : A.light;
    }
    if (distance < meleeGap(medium.range)) return A.medium;
    if (distance > 240 && !projectileActive && memory.choice < .65) return A.bolt | (f.hp > seen.hp && distance < 340 ? away : 0);
    if (distance > 200 && memory.choice > .65 && f.dashLock === 0) return toward | A.dash;
    return approach;
}
