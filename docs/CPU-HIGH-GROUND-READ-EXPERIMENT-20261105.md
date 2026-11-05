# H: provisional delayed offensive-habit read

Frozen source `63ef54d2b29c66f0ff71bde78e5a3fbfc54d6357` is isolated from G
`76279a021976aebdb30d7b5928894624224a6f1b`. Both retain server fingerprint
`c662aee33095a523`; only pure input policy changes. Source hashes and compressed
raw-record hashes are in [the manifest](balance/cpu-H/manifest.json).

The explicit provisional rule is: after at least three **delayed observed**
attacks, if fewer than 10% were low and fewer than 20% were projectiles and the
observed rival was grounded, choose lows in 65% of the selected ground-jab
interval. Otherwise retain 25%. Thresholds are strict; exactly 10% or 20% does
not qualify. These values are an experiment, not validated tuning constants.

This is an offensive variant read using the existing low attack and its G reach.
It does not add high-habit ducking to guard. Guard/throw intervals, reaction and
defense anchors, timing, RNG draws, fighter stats and the fixed reference remain
unchanged. Off-interval and airborne variants keep G's behavior. Newly changed
live counters, attacks, projectiles and airborne state do not bypass observation
delay. There are no fighter, reference or frame-cycle exceptions.

## Verification

83 focused tests and TypeScript pass. The 29 new cases cover every skill anchor
under default, learned-high, exact low/projectile threshold, observed-airborne
and just-below-threshold histories. The selected interval yields 260/400 lows
only when the read qualifies and 100/400 otherwise. Live unseen history cannot
activate or disable the read; observed changes can. Guard/throw boundaries,
read purity and input-only replay are also checked. All earlier low-reach and
low-variety tests pass.

## Same-seed diagnostics

The eight-fighter checkpoint uses fixed reference v2, seed 20261105, four
repetitions per seat and a 3600-frame cap, matching G's configuration. Reverse
seats share fighter streams, so paired observations are not independent human
samples.

| Skill | G CPU wins | H CPU wins | G mean CPU damage | H mean CPU damage |
| --- | ---: | ---: | ---: | ---: |
| Easy · 1 | 0/64 | 0/64 | 285.7 | 292.3 |
| Normal · 4 | 6/64 | 6/64 | 476.7 | 542.3 |
| Hard · 7 | 12/64 | 14/64 | 578.2 | 600.8 |
| Expert · 10 | 23/64 | 22/64 | 678.1 | 701.5 |

No checkpoint bout was a draw.
[Raw G checkpoint](balance/cpu-H/checkpoint-G.json.gz),
[raw H checkpoint](balance/cpu-H/checkpoint-H.json.gz).

Actual opening/finale tests use 256 independent seed pairs per endpoint with
the same fixed reference, actual encounter/wave seed contexts, 3600-frame cap
and unchanged skill 1/10 mapping. The finale requires reference wins over both
ordinary Vela and Vaudream waves with refilled health. Dedicated transformed
boss controllers are excluded.

| Endpoint | G CPU wins | H CPU wins | H pointwise Wilson 95% |
| --- | ---: | ---: | ---: |
| Ordinary Zephyr opening · skill 1 | 1/256 · 0.39% | 2/256 · 0.78% | 0.21–2.80% |
| Ordinary Vela→Vaudream finale · skill 10 | 134/256 · 52.34% | 128/256 · 50.00% | 43.92–56.08% |

No endpoint trial was a draw; every reverse-seat outcome matches. Intervals use
256 natural-seat observations, not 512 independent observations. Native raw
`runCurve` marks both rows as bosses because it received an endpoint subset;
the portable report's `actualMarkedBoss` corrects the interpretation: Zephyr is
ordinary and is not exempt from smoothness criteria.
[Raw G endpoints](balance/cpu-H/endpoints-G.json.gz),
[raw H endpoints](balance/cpu-H/endpoints-H.json.gz).

## Held result

H does not improve both endpoints: the opening remains far below approximately
15%, and the finale moves farther below approximately 65%. The checkpoint is
also mixed. The reference remains uncalibrated to humans, but this is sufficient
to **hold H without promotion or a full H roster panel**. No fairness, route
smoothness, human duration or game-feel acceptance is claimed. Other frozen
sources' broader jobs were left untouched.

The fixed measurement checkout is `44f777092c3e4795635879acd9b2fd9171d059b8`.
The checkpoint reproducer is `scripts/lib/cpu-calibration-checkpoint.mjs`; the
endpoint instrument is the portable `scripts/lib/story-target-diagnosis.mjs` on
the diagnostic report branch. The manifest preserves provenance and raw hashes.
No primary, hub, deployment, artwork or animation files were changed.
