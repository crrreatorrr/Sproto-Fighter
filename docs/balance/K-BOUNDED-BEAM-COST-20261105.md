# K: bounded beam profile cost prototype

Exploratory source candidate from I (`efb5829c1230dac84337ba0212d92a84a527563b`), not a calibrated budget certificate or a selected integration. The existing mechanical `beamLength > 0` flag applies the same rule to every matching kit. There is currently one such actor. No fighter identity lookup tunes its cost.

## Constraint and selected fee

The existing role deltas and profile deltas share the allowance of at most three fields. Each integer field change is rounded inward to at most 10% of its untaxed value. All candidates must retain 97–103% of the unmodified archetype budget score. Exhaustive deterministic enumeration chooses the lowest score within these bounds, with stable damage/startup/recovery loop order breaking exact ties. There is no added profile premium and no coefficient change.

The current beam kit has 21 feasible combinations. Its untaxed damage/startup/recovery of **48/18/20** becomes **47/19/22**: actual deltas −2.0833%, +5.5556%, +10%. The score moves from **4.187274090619078** to **4.06767631569396**, or **97.143779%** of the archetype. The stronger individually lawful **44/19/22** combination falls below the 97% whole-kit floor and is rejected. Base damage is calculated once from untaxed commitment; later commitment fees cannot increase that base damage and cancel the fee.

This establishes the largest score reduction allowed by the present integer/cap model. It does not establish that this score prices beam utility correctly. The existing exploratory projectile coefficient and nominal projectile-speed proxy are unchanged; beam interval coverage, clash priority and lack of travel remain omitted utility. Their empirical pricing remains unresolved.

## Scope and validation

Pressure stays at light range84: F Hard Pressure median50.71%, maximum61.61%, with16/31 actors above50%; it is not uniformly weak. Drain ability metadata cleanup is deferred; existing eligibility and effects are untouched. Beam geometry, clash rules, partners, movement, HP, art and animation data are untouched.

All254 projectile geometry objects match I exactly. For253 nonbeam actors, all3036 effective move tables and45540 scripted state ticks (180 each against Rivet) match I exactly. The [parity record](K-BEAM-COST-20261105/runtime-parity.json) pins the source/hash and [reproduction script](K-BEAM-COST-20261105/runtime-parity.mjs); the recorded precommit base SHA is reconciled by the candidate source SHA. The intentional beam timing/damage changes are excluded from the state-equivalence claim.

All199 unit tests, TypeScript check, production build and the focused beam/Aaron smoke checks pass. Build output was removed from this isolated prototype after successful validation to conserve workspace disk.

Focused budget tests include actual Special casts for all254 leads (270–300 band), all-roster identity/phase bounds, pinned template and profile scores, rejection of the stronger over-budget fee, a hypothetical role-plus-beam allowance case, deterministic construction and unchanged inputs. Beam smoke retains both-facing contact, crouch/block, finite range, moving airborne origin, interruption and replay checks. Updated numeric expectations live outside historical art fixtures.

A small preselected common-seed beam panel must precede any roster screen. Match results and broader acceptance gates are pending; no human feel/playtest claim is made.
