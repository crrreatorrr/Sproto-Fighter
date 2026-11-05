# Phase 1 numeric normalization

Implementation baseline: `209f16eec`, including merged PR #22. These are initial
templates for calibration with the Phase 0 harness and parameterized CPU; the
40–60% roster and 70/30 matchup targets are **not yet established**.

Eight templates replace intake-order numbers. Existing combat roles select a
template; paired fighters select Paired. At most two role-specific tradeoffs
preserve staff/halberd/sword and skirmisher differences. The budget weights in
`src/sim/balance.ts` score damage per commitment, reach and recovery safety, and
projectile damage times speed per commitment. Every role tradeoff must stay
within 10%, and its score within 3% of its template. These weights and initial
template strengths still need empirical calibration, not merely passing tests.

Each clean Team Special removes 285 HP after the existing combo scaling, for
two through six contacts. Contact counts and selected partner identity remain;
contact timing comes from the template, with slower long-range zoning and faster
short-range brawler relays. Specials keep the newer caster immunity and guard
bypass from #22. Their horizontal range is deliberately restored as an effective
rule; vertical coverage remains arena-wide. Entering Special during an existing
combo still receives that combo's scaling.

Projectile damage compensates for speed and commitment. A fighter can have one
outstanding volley; the existing two-emitter fighters still emit two half-damage
shots in that volley. A stationary focused beam keeps zero velocity and its
reviewed beam extent. Projectile images, origins, trajectories and special power
identities are preserved. Their utility, beam reach and selected partner effects
are additional calibration risks which the scalar budget does not prove fair.

Paired reach is budgeted as **nearest-body reach**, `getMove.range - bodySpread`.
The engine already adds formation spread both to collision separation and to
the attack's root-space range. Subtracting spread a second time would make an
82-unit light unable to cross the 127-unit minimum root gap of a 72-spread pair.
Tests exercise solo/pair and pair/pair contact without altering body spacing.

Historical `art/**/before-gameplay.json` files remain unchanged. Aaron and Captain
Green now use pinned effective expectations under `scripts/fixtures/`, alongside
checks retaining historical identity and projectile emission geometry. Numeric
projectile, Special and timing expectations in existing checks are updated
deliberately; asset/clip checks remain in place.

No artwork, animation files, atlas registrations or clip lengths change.
Human feel approval, the final Normal/Hard balance reports, cross-engine
determinism and hub-bundle integration are recorded by the integration owner.
