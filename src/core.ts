/**
 * Public entry point of the combat simulation. The implementation lives in
 * src/sim/: a serializable, fixed-60Hz state machine with no DOM, clock,
 * randomness or rendering. Import from here rather than from src/sim/ files,
 * whose other exports are internal.
 */
export { createState, getMove, grounded, isDown, THROW_BREAK_FRAMES } from './sim/combat';
export { getHitbox, getHurtbox, getProjectileHitbox, rectanglesOverlap, HITBOX_DATA } from './sim/geometry';
export type { CombatRect } from './sim/geometry';
export { A, FLOOR, GRAVITY, TICK_RATE, WALL, WIDTH } from './sim/constants';
export { cpuInput, cpuTuning, CPU_SKILLS, CPU_SKILL_VERSION, CPU_DIFFICULTIES } from './sim/cpu';
export { BALANCE_TEMPLATES, archetypeFor, budgetScore, buildBalancedKit, specialContactDamage } from './sim/balance';
export { BALANCE_KITS } from './sim/roster';
export { BACK_THROW_LIFT_FRAMES, BODY_SPACING, CHARACTER_ACTIONS, COMBAT_STYLES, DUO_SPREAD, GETUP_FRAMES, HORIZONTAL_SPIT_FIGHTERS, KNOCKDOWN_FRAMES, MOVES, PAIRED_BODY_IDS, PARTNER_ATTACKS, PLAYABLE_FIGHTERS, ROSTER, THROW_CATCH_FRAMES, THROW_GRIPS, THROW_HOLD_FRAMES, THROW_RECOVERY_FRAMES, bodyAtlasIds, bodyOffsets, bodySpread, fighterWall, fighterPartner, getThrowGrip, hasAuthoredProjectile, isCrouchingSpit, isFreePlayAddition, isHorizontalSpit, isPairedFighter, isPracticeMode, partnerContactIndex, specialPartnerIds } from './sim/roster';
export { hashState, hashText, step } from './sim/step';
export type { Action } from './sim/constants';
export type { AttackAim, CombatStyle, FighterId, HitReaction, Mode, MoveId, PartnerAttack, PlayableFighterId, SprotoFighterId, ThrowDirection, ThrowState } from './sim/roster';
export type { Attack, CombatState, Effect, Fighter, Projectile } from './sim/types';
export { saveState, loadState } from './sim/snapshot';
export type { Snapshot } from './sim/snapshot';
