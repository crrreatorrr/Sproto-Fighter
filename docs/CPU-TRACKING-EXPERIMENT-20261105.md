# CPU tracking experiment

Frozen controller source: `b329efc630deb181ba94d66fea97907245afc873`, based on
`db5508c5d1f3b94204328fa966f656e4a6b76d20`. Proposed simulation: `dae133515ccb22a6`.
This is a separate experiment, not a claim that the gameplay plan is accepted.

The old range estimate mixed the fighter's current position with the opponent's
delayed position. During a sustained approach this adds approximately the
opponent's speed times the reaction delay to apparent distance. A causal test
shows more than 70 world units of error for a known unequal-speed approach. The
new forecast matches the current position in that unchanged-velocity test.

The controller queues velocity and the friction visible in that observation.
It projects their continuation through unfrozen gameplay ticks, bounded by known
arena walls and grounded body collision. New velocity, direction, position and
attacks remain hidden until the existing visual queue exposes them. Controller
reads remain pure; only `step` advances memory and RNG.

Ground casts also project the caster's known startup momentum and the target's
continued motion to release. A cast is rejected if its first numeric contact lane
is predicted to pass the target. Simulation and planning share the same frozen
numeric release-origin accessor. No artwork, projectile traits, move numbers,
reaction knobs, probabilities, per-fighter policy exceptions or reference policy
were changed. Initial-spawn knowledge is a separate experiment and is absent here.

## Measurements

The same eight fighters, independent reference v2, seed 20261105, four repetitions
per seat and 3600-frame cap were used before/after. Reverse seats share fighter
RNG streams; these small paired samples are diagnostic, not human calibration.

| Skill | Baseline CPU wins | Tracking CPU wins | Baseline mean CPU damage | Tracking mean CPU damage |
| --- | ---: | ---: | ---: | ---: |
| Easy · 1 | 0/64 | 0/64 | 263.4 | 314.4 |
| Normal · 4 | 0/64 | 10/64 | 448.8 | 486.3 |
| Hard · 7 | 9/64 | 30/64 | 579.2 | 788.6 |
| Expert · 10 | 30/64 | 48/64 | 768.4 | 900.6 |

No bout was a draw. [Raw baseline](balance/cpu-tracking-checkpoint-before.json),
[raw tracking](balance/cpu-tracking-checkpoint-after.json).

A separate complete round robin among the same eight fighters used four
repetitions per seat at Normal/Hard: 224 bouts per level, 448 before and 448 after.

| Fighter | Normal baseline → tracking | Hard baseline → tracking |
| --- | ---: | ---: |
| Bront | 44.6% → 42.9% | 58.9% → 44.6% |
| Duo | 48.2% → 48.2% | 46.4% → 62.5% |
| High Sproto | 32.1% → 39.3% | 58.9% → 41.1% |
| Mox | 80.4% → 75.0% | 62.5% → 58.9% |
| Rivet | 35.7% → 62.5% | 53.6% → 44.6% |
| Sir Bitcoin | 53.6% → 48.2% | 39.3% → 64.3% |
| Jessica | 53.6% → 39.3% | 48.2% → 57.1% |
| Vela | 51.8% → 44.6% | 32.1% → 26.8% |

No self-play bout was a draw. The 35–65% gate still fails on this small panel;
the stricter 40–60% target and full-roster viability are not established. In
particular, Vela's Hard result worsens. Correcting a perception artifact does not
prove that every kit becomes balanced.

[Raw self-play baseline](balance/cpu-tracking-selfplay-before.json),
[raw self-play tracking](balance/cpu-tracking-selfplay-after.json).
Both use the pinned measurement harness `44f777092c3e4795635879acd9b2fd9171d059b8`;
all source hashes, trial seeds, controller assignments and outcomes are retained.
The reference checkpoint reproducer is `scripts/lib/cpu-calibration-checkpoint.mjs`.
Self-play uses that harness's `runTournament` with the eight IDs in the records,
`samples:7`, `repeats:4`, `skills:[4,7]`, `seed:20261105`, `maxFrames:3600`, `bot:'cpu'`.

## Verification and limits

- 167 unit tests, TypeScript and production build pass. The focused CPU/tracking
  suite contains 28 tests, including eight new causal range/cast/replay checks.
- Independent read-only review found no early opponent-information read or
  controller mutation. It did not approve game feel or balance.
- Independent exhaustive release-origin equivalence passed all 254 fighters in
  both facings across ground/air and all sixteen directional masks: 48,768 origin
  selections and 32,512 real releases, including 256 dual-release and 128 beam
  cases. Another 8,128 travel/contact cases included 2,488 actual contacts, 1,239
  guarded. Projectile/fighter/effect/outcome data remained identical; CPU memory
  was intentionally excluded. [Raw review](balance/cpu-tracking-origin-equivalence.json).

Prediction is an explicit continuation assumption. Braking uses an approximate
0.3 damping rather than the simulation's fixed acceleration. Observed dash or
attack damping can continue beyond the known phase, and the minimum grounded
collision bound does not model the wider knocked-down body. Unknown jump/velocity
changes wait for visual observation. These can produce forecast errors; the
candidate does not claim exact future-state simulation.

The primary stack is untouched. The candidate still needs broader roster/route
measurements, three-engine determinism, matching hub bundle, broad smoke/audit
acceptance and human playtesting before promotion or online use. Nothing was
merged or deployed by this experiment.
