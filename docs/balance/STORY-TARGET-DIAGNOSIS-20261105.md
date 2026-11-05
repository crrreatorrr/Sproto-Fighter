# Story target diagnosis: fixed reference, roster effects and uncertainty

The current evidence does not meet both story endpoints or certify the requested
per-encounter smoothness. Reviewed CPU `373448bdc043a0e8` gives a regular-fighter
finale near 65%, while its first encounter is too easy for the fixed reference.
Tracking and known-spawn candidates produce higher observed win rates but overshoot
that finale and still miss the first encounter's approximately 15% target.
These are findings about three frozen policies, not an impossibility result for
a future controller that respects the plan's reaction and probability knobs.

No primary application source, fighter stats, reference policy or artwork was
changed by this investigation. These diagnostics are separate from acceptance.

## Frozen sources and instrument

| Revision | Commit | Simulation |
| --- | --- | --- |
| Reviewed CPU | `db5508c5d1f3b94204328fa966f656e4a6b76d20` | `373448bdc043a0e8` |
| Delayed-motion tracking | `b329efc630deb181ba94d66fea97907245afc873` | `dae133515ccb22a6` |
| Tracking plus known-spawn neutral approach | `7e4bc3c7be66fe8e2c378892299d432411b01c1e` | `7652495407d4df08` |

All use High Sproto as the reference fighter and the unchanged independent
`reference-v2-persistent-delay18`. Its source SHA-256 is
`2aada800cc5ac2e80c41942a14db8a9a6bb8f541a8a9bc4cbdf5d640a364f4ff`.
The reviewed simulation-source SHA-256 is
`6dbb1f97b0bdedd2d0de3f21ef694c170f1e2fbd11f8ac74d22d047dd6f4c0f4`.

The reference delays attack observations by 18 frames, but uses immediate target
positions for direction and spacing. Its startup history also ramps into the
full delay. It is a fixed instrument, not a validated model of a decent human.
That limitation does not authorize weakening it, selecting a weaker reference
fighter, replacing it with the production CPU, or tuning against its frame-cycle
constants to manufacture the target rates. Human validation remains outstanding.

## Actual endpoints: 256 independent repetitions each

The actual installed route has 247 encounters. The first is ordinary Zephyr at
skill 1. The final sequential encounter is Morelight (Vela) then VMU (Vaudream)
at skill 10. The skill callback uses the entire 247-encounter route.

Every revision uses master seed `20261105`, repetitions 0–255 and the existing
`matchSeeds` context `encounter.id + ':' + wave`. Both seats retain the same
fighter/controller RNG streams. Each regular bout has a 3600-frame cap; health
and reference-controller history reset between waves. A reference trial must win
both final waves to clear that encounter. Raw draws stop a trial and remain draws.
There is no HP, damage or seat-swap adjudication in these rates.

The primary estimand below uses the actual Story seat: reference slot 0, CPU slot
1. The reverse seat is an audit. Every reverse-seat encounter outcome matched its
paired natural-seat outcome across all three revisions, so pooling the two seats
would duplicate these observations. Confidence intervals use 256 independent
repetitions (255 decided trials for the reviewed finale), not 512 pooled rows.

| Revision | First encounter CPU wins | Pointwise Wilson 95% | Finale CPU wins | Pointwise Wilson 95% |
| --- | ---: | ---: | ---: | ---: |
| Reviewed 373 | 0/256 = 0% | 0–1.48% | 165/255 decided = 64.71%; 1 raw draw | 58.66–70.31% |
| Tracking dae | 4/256 = 1.56% | 0.61–3.95% | 231/256 = 90.23% | 85.98–93.30% |
| Known-spawn 765 | 8/256 = 3.125% | 1.59–6.04% | 241/256 = 94.14% | 90.56–96.42% |

The reviewed finale's unconditional raw CPU win rate is 165/256 = 64.45%.
These are fixed-seed diagnostics, not a fresh reserved acceptance holdout. Since
these results now inform development, a later acceptance test needs fresh,
predeclared seed streams.

Sequential composition matters. On reviewed 373, the CPU won the first finale
wave in 103/256 natural-seat trials and the second in 62/153 reached trials.
That yields 165 encounter defeats even though each observed wave is around 40%
CPU wins. Tracking won 156 first waves and 75/100 reached second waves; known
spawn won 166 first waves and 75/90 reached second waves. The general encounter
failure probability is `1 - product(reference wave-clear probabilities)` when
waves are independent. It is not the win rate of the final fighter alone.

These simulations exclude dedicated transformed boss forms and their separate
side-scroller controller. They cannot certify the player's complete campaign
experience through those forms.

### Raw metadata caveat

The endpoint-only calls pass two encounters to the existing `runCurve` helper.
Its native `markedBoss` heuristic uses that subset's length and consequently
marks the first row as a boss. That flag is invalid for this subset. Zephyr is
ordinary/unmarked in the full route and receives no smoothness exemption.
The supplied skill callback still uses the full route, so skill 1/10 and the
outcomes are unaffected. Original raw files are preserved byte-for-byte.
The portable diagnostic adds `actualMarkedBoss` from the full route in its
analysis view. The native raw pooled-seat intervals are also preserved as
original tool output; use the natural-seat intervals above for inference.

## Fixed-opponent diagnostic removes roster-order changes

The reviewed 373 panel uses the same 11 opponents at skills 1, 4, 7 and 10,
master seed `20261105`, eight repetitions and both paired seats. Its RNG context
is `curve-diagnosis-fixed-panel-v1`, shared across skill levels. There are 704
bouts, 352 seat-paired observations, and 88 natural-seat observations per skill.
All 352 reverse-seat outcomes agreed with their natural-seat counterpart.

This panel covers seven archetypes and excludes Footwork; it is a diagnostic
panel, not a roster fairness gate or a roster-weighted population estimate.

| CPU opponent | Archetype | Easy 1 | Normal 4 | Hard 7 | Expert 10 |
| --- | --- | ---: | ---: | ---: | ---: |
| High Sproto | Zoning | 0/8 | 0/8 | 0/8 | 3/8 |
| Golden Sproto | Pressure | 0/8 | 2/8 | 1/8 | 3/8 |
| Morelight | Zoning | 0/8 | 0/8 | 1/8 | 3/8 |
| Fat Head Dave | Brawler | 0/8 | 0/8 | 0/8 | 2/8 |
| Yannix | Counter | 0/8 | 1/8 | 4/8 | 4/8 |
| Jessica | Weapon | 0/8 | 0/8 | 0/8 | 2/8 |
| Candles | Paired | 0/8 | 0/8 | 1/8 | 2/8 |
| sir bitcoin | Counter | 0/8 | 1/8 | 4/8 | 2/8 |
| Big Al | Brawler | 0/8 | 0/7 decided; 1 draw | 1/8 | 4/8 |
| VMU | Hover | 0/8 | 1/8 | 2/8 | 3/8 |
| Zephyr | Brawler | 0/8 | 0/8 | 0/8 | 2/8 |

Natural-seat totals are 0/88, 5/87 decided plus one draw, 14/88 and 30/88.
The controller strengthens across this fixed composition overall. Opponent
identity still changes its success, and a few eight-seed rows are nonmonotone.
Those small rows do not establish a true population reversal. In particular,
Zephyr's 0/8 at skills 1/4/7 and 2/8 at 10 do not identify a precise remapped
opening skill. A 64-independent-seed skill 1–10 sweep on the final selected
role/controller candidate is a reasonable next diagnostic; it was not run on
all intermediate candidates.

## A smooth scalar skill does not guarantee smooth encounter outcomes

Write the encounter CPU win probability as `p_e = F_e(skill_e)`. The planned
mapping constrains `skill_e`; different fighters and multi-wave encounter
composition change `F_e`. Even monotone `F_e` and a smooth global skill mapping
do not imply `abs(p_(e+1) - p_e) <= 0.10`.

For any frozen policy with skills pinned to 1 and 10 at the endpoints, changing
only intermediate scalar values cannot change either endpoint probability.
This explains why remapping the middle of tracking's curve cannot repair its
measured low first endpoint and high finale. It does not prove that a different
lawful controller or fair archetype rebalance cannot meet the targets.

The separate reviewed 373 full-route report has 212 CPU wins in 1976 seat rows.
Across 231 adjacent edges touching no marked boss, 74 absolute point-estimate
changes exceed 10 percentage points, including 38 upward changes. One example
is Agent SPROTO → Glow: skill 6.872 → 6.927, with estimates 0/8 → 8/8. These are
exploratory flags combining matchup changes and severe sampling noise, not
certified true probability jumps. The independent route report is
[curve-2026-11-05-post-cpu-review.md](curve-2026-11-05-post-cpu-review.md), with
raw JSON SHA-256 `39d98efb0be0c8053e2a1daf0f5e2f3ff65f910721023c545dcefad118e86c91`.

At eight rows per encounter, one changed win is 12.5 percentage points. Thus an
observed adjacent difference cannot be a nonzero value below 10 points. The rows
also contain only four independent seed pairs. Even incorrectly treating all
eight rows as independent gives these wide Wilson intervals:

| Wins / nominal trials | Pointwise Wilson 95% |
| --- | ---: |
| 0/8 | 0–32.44% |
| 1/8 | 2.24–47.09% |
| 4/8 | 21.52–78.48% |
| 5/8 | 30.57–86.32% |
| 8/8 | 67.56–100% |

For four perfectly paired seeds, 0/4 has an upper Wilson bound of 48.99%.
The current sparse route cannot certify the literal all-adjacent criterion.
A smooth interpolation of the published knob table is not such a certificate.

## Proposed measurement and decision protocol

The original approximately 15% → 65% endpoints and the all-adjacent 10-point
criterion remain unchanged requirements here. The alternatives below require
an explicit design decision; this report does not adopt one silently.

1. Freeze the final kit/controller/reference versions and estimand. Use Story's
   natural seat as primary; reverse seats measure bias and share their seed
   cluster. Keep raw draws, per-wave results, caps and transformed-boss coverage
   separate. Define the tolerance meant by “about 15%/65%” before acceptance.
2. Use calibration seeds for a fixed opponent × skill panel and the actual
   route. Common random numbers help revision comparisons; estimate uncertainty
   from paired seed differences, not independent-sample formulas on those
   revisions. Preserve the reference source hash and fighter.
3. Freeze the candidate before a reserved acceptance seed stream. Start endpoint
   precision assessment with at least 400 independent natural-seat repetitions
   per endpoint, plus reverse-seat audits. At worst-case `p=0.5`, approximately
   385 independent Bernoulli observations give a pointwise 95% half-width of five
   points; the corresponding planning counts are 196 at `p=0.15` and 350 at
   `p=0.65`. These are normal-approximation precision counts, not guaranteed
   equivalence-test power or simultaneous coverage. Draws, bounded seed-pair
   responses and repeated looks require appropriate adjustments.
4. To retain the literal all-adjacent requirement, measure all encounters and
   form simultaneous bounds for the 246 adjacent contrasts, excluding only
   explicitly marked boss edges. For planning, two independent worst-case
   Bernoulli samples need about 193 observations per encounter for a pointwise
   contrast half-width of 10 points. Bonferroni control over all 246 two-sided
   contrasts raises that to about 691. If an observed jump is already five
   points, proving its upper bound below ten leaves only a five-point margin
   and raises the same approximation to about 2761 per encounter. These are
   planning approximations, not a sufficient finite-sample pass rule. Use exact
   or appropriate cluster-aware intervals at acceptance; an inconclusive bound
   is not a pass. A conservative bounded-response Hoeffding plan is larger.
5. Predeclare sample sizes or use an anytime-valid confidence/alpha-spending
   procedure. Do not keep rerunning seeds until a point estimate happens to
   pass. Report per-encounter outliers even if presenting chapter aggregates.
6. Validate the reference and pacing with people separately. No amount of
   headless Monte Carlo establishes a human difficulty curve or approves feel.

The strict adjacent planning count of 691 means roughly 170,677 primary
encounter rollouts over 247 encounters, before reverse seats and extra waves.
The four-repetition route is useful screening evidence, not an inexpensive
substitute for that acceptance campaign.

### Material choices for the owner

| Choice | What remains fixed | What changes / tradeoff |
| --- | --- | --- |
| Keep the original formula and literal per-encounter criterion | Reference, knob anchors, skill endpoints and all targets | Continue lawful controller/role work and fund a much larger simultaneous per-encounter test. Current evidence is not a pass. |
| Use empirical chapter-level progression plus separately reported encounter outliers | Fixed reference and endpoint targets | Replaces the literal per-encounter smoothness acceptance criterion. Aggregation can hide spikes, so retain an explicit outlier policy. Requires approval. |
| Calibrate encounter/role-aware AI skill against the fixed reference | Stats remain fair; published knob table stays intact | Changes the fixed scalar story mapping. Requires visible, documented calibration limits, independent holdout validation and approval. It must not become fighter-stat bonuses or reference-specific exploits. |

Continue candidate work with causal controller fixes that generalize: predictions
from delayed observations, coherent neutral movement and cast release, preserved
reaction/guard/low/punish/anti-air/throw/combo probabilities, and independently
measured fair archetype data. Higher published defense probabilities alone do
not guarantee higher win probability: defending can displace offense, delayed
geometry changes spacing, and role interactions remain. The endpoint data above
show why a mixed small-panel gain is insufficient for promotion.

## Artifacts and reproduction

[story-target-diagnosis/manifest.json](story-target-diagnosis/manifest.json) pins
compressed and uncompressed SHA-256 values. Its raw files retain initial seeds,
input-stream hashes, final-state hashes, wave outcomes and both seat records.
Archives were made from each exact commit; the runtime and fixed harness were
not edited during measurement.

The portable runner is
[`scripts/lib/story-target-diagnosis.mjs`](../../scripts/lib/story-target-diagnosis.mjs).
For a pinned core archive and the unchanged reviewed harness:

```sh
node scripts/lib/story-target-diagnosis.mjs /tmp/pinned-core /tmp/fixed-harness /tmp/endpoints.json endpoints 256 SOURCE_COMMIT
node scripts/lib/story-target-diagnosis.mjs /tmp/pinned-core /tmp/fixed-harness /tmp/panel.json panel 8 SOURCE_COMMIT
```

The runner asserts the exact reference hash and records source/route fingerprints,
natural-seat intervals and paired-seat discordances. A one-repetition replay
reproduced both reviewed endpoint trial records exactly, including inputs and
final-state hashes. This report changes no product behavior or acceptance gate.
