# Phase 4 follow-up: proactive defense and pressure

**Historical candidate:** this document and its four linked before/after reports
record commit `bb0452eab` (simulation `462b87f2f3e19a3e`). They do not describe later
controller revisions. See [the review follow-up](CPU-CALIBRATION-REVIEW-20261105.md)
for the current candidate and its separately generated checkpoint.

This is a separate review candidate. It does not replace the previously validated
integration stack or establish the gameplay plan's human difficulty targets.

The first curve against the fixed v2 reference exposed a controller problem:
every visual reaction delay exceeds a five-frame jab startup. Reactive guard
alone therefore arrives after contact. The CPU also treated delayed recovery
observations as fresh openings and could stop at jab spacing while its chosen
throw remained out of reach.

The candidate keeps the published skill probabilities and reaction delays,
fighter stats and input-only replay invariant. It changes decisions:

- Observation queues carry attack/low counts from observation time. Neutral
  defense anticipates already-observed pressure for a seeded 8–14-frame decision
  interval. It never reads a future attack or rerolls on a controller read.
- The last two frames of the CPU's own blockstun can buffer a short retaliation,
  with the existing skill-dependent punish probability. This is tactile feedback.
- A known move's commitment is projected through the reaction delay. A recovery
  window that already expired cannot trigger a new punish; the chosen punish must
  fit its estimated remaining commitment.
- A seeded throw read walks into legal grab spacing instead of stopping at jab
  spacing. Pressure plans take initiative when their own commitment ends rather
  than waiting for another periodic input pulse. No fighter/reference exceptions
  or health/damage bonuses are introduced.

## Fixed checkpoint

The same independent reference policy, eight fighter IDs, seed 20261105, four
repetitions, both seats and 3600-frame cap were used before and after. Reverse seats
share fighter RNG streams. Sixty-four bouts per level are diagnostic, not 64 fully
independent human samples. The fixed reference is not calibrated to human play.

| Skill | Before CPU wins | After CPU wins | Before mean CPU damage | After mean CPU damage |
| --- | ---: | ---: | ---: | ---: |
| Easy · 1 | 0/64 | 0/64 | 274.5 | 318.9 |
| Normal · 4 | 0/64 | 2/64 | 282.2 | 440.4 |
| Hard · 7 | 2/64 | 28/64 | 255.8 | 787.8 |
| Expert · 10 | 4/64 | 62/64 | 422.4 | 990.8 |

No checkpoint bout was a draw. Easy's win rate has not improved in this sample;
Expert is too strong against this particular reference to claim a calibrated
difficulty endpoint. These limits remain open rather than tuning to force a
desired result against one scripted opponent.

Raw checkpoint records: [before](balance/cpu-calibration-checkpoint-before.json),
[after](balance/cpu-calibration-checkpoint-after.json). Reproduce with the pinned
measurement checkout at `44f777092c3e4795635879acd9b2fd9171d059b8`:

```sh
node scripts/lib/cpu-calibration-checkpoint.mjs \
  /path/to/candidate/src/core.ts /path/to/measurement-checkout /tmp/checkpoint.json 4
```

## Actual-route advisory curve

All 247 encounters use the same fixed High Sproto reference, four repetitions per
seat and existing chapter-smoothed skill mapping. Sequential encounters require
the reference to win every ordinary fighter wave. Dedicated transformed bosses
remain excluded. Both reports use the exact same simulation baseline hash before
the controller change, reference policy, route, difficulty mapping and seed schedule.

| Chapter | Before CPU wins / trials | After CPU wins / trials |
| --- | ---: | ---: |
| 1 | 4/288 | 0/288 |
| 2 | 4/288 | 6/288 |
| 3 | 4/288 | 24/288 |
| 4 | 4/288 | 48/288 |
| 5 | 6/296 | 138/296 |
| 6 | 2/288 | 198/288 |
| 7 | 4/224 | 210/224 |
| 8 | 2/16 | 16/16 |
| Total | 30/1976 · 1.52% | 640/1976 · 32.39% |

Encounter one remains 0/8 CPU wins; the ordinary finale changes from 2/8 to 8/8.
There are no raw draws. A rising chapter trend is visible, but the target 15–65%
endpoints and per-encounter smoothness are **not met or established**. Eight paired
trials per encounter also leave wide uncertainty. This does not establish the
Normal/Hard roster-balance gate or human feel.

Curve records retain trial seeds, controller assignments, raw outcomes, final HP,
duration and input/state hashes: [before](balance/cpu-calibration-curve-before.json),
[after](balance/cpu-calibration-curve-after.json). Source and reference hashes are
embedded in the reports.

## Verification and compatibility

Fifteen focused CPU/retry tests pass, including six new anticipation, delayed-habit,
expired-opening, tactile-punish, throw-spacing and pressure-initiation checks. The
existing pure-read, input-only replay, rollback and delayed-facing checks pass.
`npm run check` and `npm run build` pass. No art or animation files changed.

The proposed simulation fingerprint is `462b87f2f3e19a3e`. It requires a corresponding
hub bundle refresh before online use. This follow-up has not received full roster
audits, three-engine determinism CI, a hub compatibility run, or a human playtest.
Nothing was deployed or merged.
