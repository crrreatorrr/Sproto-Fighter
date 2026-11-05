# Gameplay Phase 3: numeric geometry and defense

This branch changes only simulation code, numeric gameplay data and test expectations. No artwork,
pose atlas registrations, clip lengths, throw grips or files under `art/` and `public/fighters/`
are changed.

## Geometry and provenance

`src/sim/data/hitboxes.json` contains authored world-unit rectangles. Their reach starts from the
existing numerical move ranges, with the front-body spread applied once by `getMove`. The effective
range remains configurable by the archetype kit. Height bands, a 145-unit standing hurtbox,
87-unit crouch hurtbox and raised airborne hurtbox introduce explicit vertical decisions.
Active/recovering melee limbs extend their hurtbox toward the attack, allowing a whiff punish
beyond the neutral torso. Both fighters' exposed hurtboxes are captured together before hit
collection to keep simultaneous startup boundaries seat-neutral.

These initial rectangles are **not measured contact hulls**. A per-move active-pose review against
all existing artwork remains required before approving visual contact. Runtime combat never reads
sprite pixels. The exported `getHitbox`, `getHurtbox`, and `getProjectileHitbox` functions allow the
training overlay to draw exactly the same numerical rectangles as the simulation.

Projectiles use rectangles too. All shots advance before opposing overlaps are resolved, and all
clashes resolve before fighter contact. Allied shots do not clash. A beam beats an ordinary shot;
two beams or two ordinary shots cancel each other.

## Defense defaults

- Blockstun and pushback are move-specific; light has 11 blockstun, heavy 18.
- Heavy, sweep, projectile and Team Special contacts deal 12% rounded chip on guard. Chip leaves
  at least 1 HP by default in every mode, including Story. The optional `CombatState.chipKO`
  flag permits a future explicit harder rule; it is never enabled implicitly.
- Team Specials can be guarded under this phase's defense rules. The immunity of an active
  Special caster added by PR #22 is retained. Special contact uses its numerical range/height;
  prior arena-wide unconditional hits are deliberately replaced by geometric contact.
- A fresh grab press in catch ticks 0 through 6 breaks a throw with outward velocity and no
  damage. Holding grab before the catch does not break it. Hitstop pauses catch age, so a press
  during contact freeze can still tech. Both fighters briefly recover and cannot immediately
  throw-loop one another.
- Throw damage is 90 instead of 115. Existing smoke assertions for remaining HP are updated
  deliberately from 885 to 910; checks and historical art fixtures are retained.
- Rise grants three strike-protected simulation ticks in addition to existing 12-frame throw
  protection. Hitstop pauses both invulnerability counters.

The dedicated `tests/defense.test.ts` verifies crouch/high whiffs, low guard, exposed recovery,
airborne launcher contact, mirroring and simultaneous trades, blockstun/chip, Special guard and
caster immunity, throw-tech boundaries, rise protection, projectile clashes and crouch lanes.
`tests/theo.test.ts` retains projectile-origin and duck checks and updates blocked-shot expectations
for chip. The level Sun God shot originates 80 units above the root and now intersects the
87-unit crouched hurtbox, so its smoke test explicitly requires guarding rather than treating
crouch alone as invulnerability. Higher eye/egg/hand lanes still duck when rectangles do not overlap. Human feel and full art-contact approval are not claimed by these automated checks.
