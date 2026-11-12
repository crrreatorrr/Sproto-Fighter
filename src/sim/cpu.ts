// The controller is a pure read. Only step advances its seeded observations and intent.
import { getMove, grounded } from './combat';
import { A, FLOOR } from './constants';
import { HITBOX_DATA } from './geometry';
import { COMBAT_STYLES, MOVES, bodySpread, shotOrigin } from './roster';
import { cpuRandom, ensureCpuMemory } from './cpuState';
import type { CombatState, CpuMemory, Fighter, Projectile } from './types';

export const CPU_SKILLS = [1, 4, 7, 10] as const;
export const CPU_SKILL_VERSION = 5;
export const CPU_DIFFICULTIES = [
    { name: 'Easy', skill: 1 }, { name: 'Normal', skill: 4 },
    { name: 'Hard', skill: 7 }, { name: 'Expert', skill: 10 },
] as const;
// guard..combo are the published reaction model. The last four are reads of a rival's
// habits: `wake` holds guard while recovering from a hit or knockdown, `shot` guards a
// projectile that has been seen coming, `read` acts on a repeated pattern (stop-hit a
// walk-in, jump a crouching low poke, dash through a projectile gap, stop a guarded string) and
// `repeat` is the least punish chance once the same move has been blocked twice in three seconds.
// `track` is how many frames stale the rival's position may be when judging range: recognising a
// move always takes `reaction` frames, but Easy also misjudges distance and Expert barely does.
// What the CPU knows about either kit (jab reach and startup, where a cast leaves the body, how
// fast it flies, how long it commits its owner) is read from the kit data, never assumed from a
// standard fighter: see `outJabbed`, `shotArrival`, the wind-up estimate and `castSafe` below.
const anchors = [
    { skill: 1, reaction: 28, guard: .25, low: .20, punish: 0, antiAir: 0, tech: 0, combo: .40, wake: .30, shot: .45, read: .15, repeat: .20, track: 28 },
    { skill: 4, reaction: 18, guard: .50, low: .45, punish: .30, antiAir: .32, tech: .20, combo: .70, wake: .60, shot: .75, read: .35, repeat: .60, track: 10 },
    { skill: 7, reaction: 12, guard: .70, low: .70, punish: .65, antiAir: .72, tech: .50, combo: .90, wake: .75, shot: .92, read: .40, repeat: .90, track: 7 },
    { skill: 10, reaction: 8, guard: .85, low: .90, punish: .90, antiAir: .85, tech: .75, combo: 1, wake: .97, shot: .99, read: .97, repeat: .98, track: 6 },
] as const;
export function cpuTuning(skill = 4) {
    const level = Math.max(1, Math.min(10, Number.isFinite(skill) ? skill : 4));
    const index = level < 4 ? 0 : level < 7 ? 1 : 2;
    const a = anchors[index], b = anchors[index + 1], t = (level - a.skill) / (b.skill - a.skill);
    const mix = (key: Exclude<keyof typeof a, 'skill'>) => a[key] + (b[key] - a[key]) * t;
    return { skill: level, reaction: Math.round(mix('reaction')), guard: mix('guard'), low: mix('low'),
        punish: mix('punish'), antiAir: mix('antiAir'), tech: mix('tech'), combo: mix('combo'),
        wake: mix('wake'), shot: mix('shot'), read: mix('read'), repeat: mix('repeat'), track: Math.round(mix('track')) };
}

/** Frames between a retreat being cut short and the next one being allowed. */
const ADVANCE_FRAMES = 45;
/** The longest the CPU backs away with nothing coming at it. */
export const CPU_RETREAT_LIMIT = 30;
/** Share of decisions on which the first poke comes from the longer of the standing and crouching jab. */
const LONG_POKE_SHARE = .5;
/** Two guards of the same move inside this many combat ticks are a habit to punish. */
const REPEAT_WINDOW = 180;

/**
 * Where the nearest rival projectile is in time: `eta` frames until it reaches this fighter (-1 when
 * none is coming) and `pass` frames until it has left the body behind. Widths come from the hitbox
 * table and the fighter's own spread, so both hold for a pair as well as for a single body.
 */
function shotArrival(f: Fighter, shots: readonly Projectile[], slot: number): { eta: number; clear: boolean; pass: number } {
    let eta = -1, clear = false, pass = -1;
    const spread = bodySpread(f.id), reach = HITBOX_DATA.body.halfWidth + spread + HITBOX_DATA.projectile.halfWidth;
    for (const p of shots) {
        if (p.owner === slot || p.life <= 0 || p.beamHit) continue;
        const dx = f.x - p.x;
        let frames: number, leaves: number;
        if (p.beamLength) {
            if (dx * (p.beamDirection ?? 1) < 0 || Math.abs(dx) > p.beamLength + 40) continue;
            frames = 0; leaves = p.life;
        } else {
            const speed = Math.abs(p.vx), ahead = dx * Math.sign(p.vx);
            // It is tracked until it has cleared the far side of the body, not only up to the centre.
            if (speed < 1 || ahead <= -reach) continue;
            // Assume we keep walking into it, so the guard is never late.
            frames = Math.max(0, Math.ceil((ahead - 40 - spread) / (speed + 4)));
            leaves = Math.ceil((ahead + reach) / speed);
        }
        if (eta < 0 || frames < eta) {
            eta = frames; pass = leaves;
            // A straight, level shot can be jumped. Arcs, bounces and beams cannot be trusted.
            clear = !p.beamLength && !p.gravity && !p.wave && !p.bounces && !p.returnAt && Math.abs(p.vy) < 1 && Math.abs(p.vx) <= 14;
        }
    }
    return { eta, clear, pass };
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
        // Our own attacks are felt too: how often this rival guards them, and how often they land.
        if (p.blockstun > memory.rivalBlockstun) memory.habits.guarded++;
        else if (p.hp < memory.rivalHp && p.stun > 0) memory.habits.struck++;
        memory.rivalBlockstun = p.blockstun; memory.rivalHp = p.hp;
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
            shotEta: arrival.eta, shotClear: arrival.clear, shotPass: arrival.pass });
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
    const tracked = memory.observations.find(o => o.frame >= s.frame - Math.min(tuning.reaction, tuning.track)) ?? seen;
    const closing = tracked.y >= FLOOR && !tracked.move && !current.stun && !current.blockstun ? Math.max(0, tracked.x < f.x ? tracked.vx : -tracked.vx) : 0;
    const distance = Math.max(0, Math.abs(tracked.x - f.x) - spread - closing * (s.frame - tracked.frame));
    const pulse = s.frame - memory.decisionAt < 2;
    const light = getMove(f, 'light'), medium = getMove(f, 'medium'), heavy = getMove(f, 'heavy');
    const meleeGap = (range: number) => range - bodySpread(f.id) - 4;
    // Two fighters walking into each other both jab as soon as their own standing jab reaches, so a
    // few pixels of reach or one frame of startup would settle who strikes first every time. The
    // crouching jab out-reaches every standing jab and is never slower. From Normal up, a fighter
    // whose standing jab loses that race to this rival's kit opens with the crouching jab on part of
    // its decisions instead. A longer or faster standing jab is still an edge on the others.
    const jabGap = meleeGap(light.range), lowJab = getMove(f, 'low'), rivalJab = getMove(current, 'light');
    const outJabbed = rivalJab.range - bodySpread(current.id) > light.range - bodySpread(f.id) || rivalJab.startup < light.startup;
    // It is for a rival walking in on the ground: a crouching jab passes under a jump-in, so a rival
    // who keeps jumping is met with the standing jab as before.
    const jumpy = memory.habits.jumps * 4 > memory.habits.attacks;
    // Up close the same holds for speed alone: a kit whose crouching jab is its faster one uses it more.
    const outSped = tuning.skill >= 4 && rivalJab.startup < light.startup && lowJab.startup < light.startup;
    const pokeGap = tuning.skill >= 4 && outJabbed && closing > 2 && !jumpy && memory.readRoll >= 1 - LONG_POKE_SHARE
        ? Math.max(jabGap, meleeGap(lowJab.range)) : jabGap;
    const lowHabit = seen.attacks > 0 && seen.lows / seen.attacks > .5;
    // A rival who guards more of our attacks than they take is thrown more often (from Normal up).
    const turtle = tuning.skill >= 4 && memory.habits.guarded >= 2 && memory.habits.guarded > memory.habits.struck;
    const grabChance = turtle ? .42 : lowHabit || (seen.input & toward) ? .30 : .16;
    // Forecast defense is separate from the published visible-attack guard
    // probability. Disjoint intervals reserve space for guard, jab and throw.
    const forecastGuardShare = tuning.guard * (1 - grabChance) * .9;
    // A throw read has to close beyond jab spacing. Keep that seeded plan for
    // the decision interval instead of stopping forever outside grab reach.
    const grabGap = meleeGap(getMove(f, 'grab').range);
    const grabPlan = memory.choice > 1 - grabChance && grounded(f) && seen.y >= FLOOR && distance < 160;
    const pressureGap = grabPlan ? grabGap : jabGap;
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
    // The shot starts at the rival's emitter, which sits well ahead of some kits (a pair's front member).
    // A beam has no travel time: it lands on the frame it is released.
    const rivalShot = COMBAT_STYLES[current.id].projectile;
    const windup = casting && projectedAge < seen.startup + seen.active + seen.recovery
        ? seen.startup - projectedAge + (rivalShot.beamLength ? 0 : Math.max(0, Math.abs(seen.x - f.x) - shotOrigin(current).forward - 40 - bodySpread(f.id)) / (rivalShot.speed + 4)) : -99;
    // A beam stays out for its whole duration, so the estimate from its wind-up stays live that long.
    const late = -2 - (seen.shotEta < 0 && rivalShot.beamLength ? rivalShot.beamFrames ?? 0 : 0);
    const shotKnown = seen.shotEta >= 0 || windup >= late - 4;
    const shotEta = seen.shotEta >= 0 ? seen.shotEta - (s.frame - seen.frame) : windup;
    // Like range, a shot's position is tracked rather than recalled. The arrival estimate assumes we
    // walk into it, so for a fighter standing its ground it runs out early: the guard is held until
    // the shot has reached the far side of the body. That also keeps a crouch down under a shot that
    // flies over it (a high emitter, a forehead beam) instead of standing up into it.
    const trackedAge = s.frame - tracked.frame;
    const holding = grounded(f) && tracked.shotEta >= 0 && tracked.shotEta - trackedAge <= 7 && tracked.shotPass - trackedAge >= -2;
    const shotDue = (shotKnown && shotEta >= late && shotEta <= 7) || holding;
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
    function castSafe(): boolean {
        // Only a rival who has been seen to cast can answer with one.
        if (tuning.skill < 4 || seen!.projectiles === 0) return true;
        const own = COMBAT_STYLES[f.id].projectile, mine = getMove(f, 'bolt'), theirs = getMove(current, 'bolt');
        const level = (style: typeof own) => !style.beamLength && !style.gravity && !style.wave && !style.bounces && !style.ground;
        if (level(own) && level(rivalShot) && Math.abs(shotOrigin(f).height - shotOrigin(current).height) < 2 * HITBOX_DATA.projectile.halfHeight) return true;
        const gap = Math.abs(tracked.x - f.x) - shotOrigin(current).forward - HITBOX_DATA.body.halfWidth - bodySpread(f.id) - HITBOX_DATA.projectile.halfWidth;
        const flight = rivalShot.beamLength ? gap > rivalShot.beamLength ? Infinity : 0 : Math.max(0, gap) / Math.max(1, rivalShot.speed);
        return theirs.startup + flight > mine.startup + mine.active + mine.recovery;
    }
    function guardedLately(id: keyof typeof MOVES): number {
        return memory!.blocks.filter(b => b.move === id && memory!.combatTicks - b.tick <= REPEAT_WINDOW).length;
    }
    function habitOrFinisher(id: keyof typeof MOVES): boolean {
        return MOVES[id].rank >= 4 || guardedLately(id) >= 2;
    }
    // A read also means confirming the hit: a guarded jab is not followed into an unsafe finisher.
    const confirmed = !!f.move?.hitConfirmed || memory.readRoll >= tuning.read;
    if (f.move?.connected && confirmed && memory.comboRoll < tuning.combo) {
        if (f.move.id === 'launcher' && grounded(f)) return A.up | toward;
        const rank = MOVES[f.move.id].rank;
        // Follow up only with a button that will still reach once the hit's pushback has played out.
        // Throwing the finisher regardless whiffed for every kit but the long-reach ones, who were
        // the only fighters to convert a hit landed at the edge of medium range.
        const settled = Math.abs(current.x - f.x) - spread + Math.abs(current.vx) * 5.25;
        if (rank === 1) return approach | (settled < meleeGap(medium.range) + 10 ? A.medium : 0);
        if (rank === 2) return approach | (settled < Math.min(meleeGap(heavy.range), meleeGap(medium.range) + 30) + 10 ? A.heavy : 0);
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
        // From Hard up the anti-air comes out as soon as the jump is read, not on the next decision beat.
        return pulse || tuning.skill >= 7 ? A.launcher : 0;
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
    if ((shotKnown && shotEta >= late) || holding) {
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
    const pressureReady = distance < pokeGap && memory.choice >= forecastGuardShare;
    if (!pulse && !pressureReady) return approach;
    if (distance < meleeGap(light.range)) {
        const jabEnd = 1 - grabChance;
        if (grounded(f) && memory.choice >= forecastGuardShare && memory.choice <= jabEnd) {
            // Guard/throw already consumed the other intervals. Choose the
            // grounded jab variant within its own interval, regardless of the
            // older strategic label (which may still say "defend").
            const variant = (memory.choice - forecastGuardShare) / (jabEnd - forecastGuardShare);
            // Against a rival who keeps guarding, more of the jabs go low.
            return variant < (turtle ? .6 : outSped ? .5 : .25) || crouched ? A.down | A.light : A.light;
        }
        return (memory.intent === 'pressure' && memory.choice < .25) || crouched ? A.down | A.light : A.light;
    }
    // Past standing-jab reach but inside the crouching jab's.
    if (distance < pokeGap && grounded(f)) return A.down | A.light;
    if (distance < meleeGap(medium.range)) return A.medium;
    // A cast of our own cannot guard, so none starts while a shot is on its way, nor from a distance
    // at which a rival casting at the same moment would land theirs before ours has recovered. That
    // depends on both kits: how long our cast commits us, how early theirs releases, how fast it
    // flies and where it starts. Two level shots at the same height cancel each other and are safe.
    if (distance > 240 && castSafe() && !projectileActive && !shotKnown && memory.choice < .65) return A.bolt | (f.hp > seen.hp && distance < 340 ? away : 0);
    if (distance > 200 && memory.choice > .65 && f.dashLock === 0) return dashIn;
    return approach;
}
