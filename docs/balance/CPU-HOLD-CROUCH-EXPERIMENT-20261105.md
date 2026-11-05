# T / HoldCrouch CPU correctness prototype — 2026-11-05

Frozen I releases down immediately after starting its selected grounded low/sweep. Numeric hurtboxes depend on held input, so the CPU stands at low age 2 even though the low move continues. T preserves the selected crouch stance through commitment. This isolated change fixes a real high-jab contact counterfactual; it introduces no attack-selection strategy or probability threshold. No primary source, move data, artwork, reference or story mapping was changed.

## Frozen source and exact change

- Baseline I: `efb5829c1230dac84337ba0212d92a84a527563b`, simulation-source SHA-256 `612b5e933e3e5b268ecef90db543d1572e8f4827a6d3db5a3fc1da7606d1bf3f`.
- T source: `3923f108f3a1617393f5f6e9fa1573161799a496`, simulation-source SHA-256 `6984af1637ebadca38340dced749c774fafc9fbcc3989adc1eadd724acb412fe`.
- Server bundle fingerprint stays `a4c7ddde49ec5a64`. Pure `cpuInput` is tree-shaken from the server entry; the unchanged bundle generator check passes. The source hash identifies the policy difference.

After the existing connected-hit combo-cancel branch, a committed grounded `low` or `sweep` now returns only `A.down` instead of 0. Attack buttons are released. Airborne/other committed moves retain 0. Earlier stun, guardstun, practice, recognition and combo behavior keeps precedence. No RNG, visible-reaction knob, guard/throw partition, jab/low share, move stat or observation field changes. This branch derives directly from I and contains no other controller prototypes.

## Actual contact proof

Real Rivet high light has 5-frame startup. Both frozen cores start that jab, then start Bront low one frame later at roots 500/560. Subsequent defender input comes from that core's `cpuInput` at skill 4:

| Core | Own low age 2 input | Hurtbox top (floor 578) | HP after high jab |
| --- | ---: | ---: | ---: |
| I | 0 | 433 (standing height 145) | 962 |
| T | down | 491 (crouch height 87) | 1000 |

I's low remains committed at ages 2/3 before the jab interrupts it. T's low remains crouched through startup and avoids the jab's 92–126 height interval. The regression test also compares released-down and held-down counterfactuals using actual `step`, not just rectangle arithmetic. This is ordinary stance evasion, not armor or invulnerability; other attack heights retain their existing collision rules.

## Verification and protected behavior

`vitest run tests/cpu-hold-crouch.test.ts tests/cpu-difficulty.test.ts tests/cpu-low-variety.test.ts tests/defense.test.ts`: **80 tests pass** (25 new). Tests cover both low moves across startup/active/recovery and all four skill anchors, every airborne/other committed move, connected-low combo cancel, stun/guardstun/practice precedence, actual contact, repeated-read snapshots and input-only replay. TypeScript and `node scripts/build-sim-bundle.mjs --check` pass.

A bundled before/after comparison spans **365,760 fixtures**: all 254 actors × all 10 integer skills × every move × grounded/air × connected/unconnected × normal/stun/guardstun. **358,140 inputs match exactly**. The remaining **7,620** are exclusively committed grounded low/sweep returning 0 → down after earlier branches have declined. Every read preserves the full hashed state. This finite matrix is evidence for the protected paths, not an exhaustive enumeration of every reachable game state.

## Modest first-encounter regression (no tuning)

Same actual opening, High Sproto reference versus Zephyr CPU at skill 1, master seed 20261105, repetitions 0–255, both paired seats, context `story-v1-zephyr:0`, 3600-frame cap. Fixed `reference-v2-persistent-delay18` SHA-256 is `2aada800cc5ac2e80c41942a14db8a9a6bb8f541a8a9bc4cbdf5d640a364f4ff`. No reserved 20261106 or alternate skill was used.

Natural Story seat: I **1/256** CPU wins; T **2/256 = 0.78125%**, pointwise Wilson 95% 0.21–2.80%. Zero draws, zero reverse-seat outcome disagreements. Only repeat 70 changes from reference win to CPU win, mirrored in the paired seat; I's prior win is retained. This small difference does not establish a population improvement. The first-encounter approximately 15% target remains unmet. No finale or curve-tuning experiment was performed.

## Representative free-fight regression

Both seats use the selected source's production CPU, without a reference. The same fixed panel selects the first public non-beam representative of each of eight archetypes plus the first public beam profile. All 36 pairs × 2 repetitions × 2 paired seats × skills 4/7 = 288 bouts per source, **576 total**. Seed 20261105, existing `own-kit-freefight-diagnostic-v1` context and common fighter streams are retained for comparability. One worker ran I then T, then the first-encounter regression. No reserved seed was used.

| Actor | Role | I Normal | T Normal | I Hard | T Hard |
| --- | --- | ---: | ---: | ---: | ---: |
| rivet | Pressure | 12/32 | 8/32 | 8/32 | 10/32 |
| erik | Footwork | 22/32 | 24/32 | 18/32 | 18/32 |
| bront | Brawler | 16/32 | 18/32 | 14/32 | 12/32 |
| mandela | Weapon | 12/32 | 16/32 | 15/32 | 14/32 |
| duo | Paired | 24/32 | 24/32 | 18/32 | 16/32 |
| rune | Counter | 12/32 | 12/32 | 19/32 | 20/32 |
| sproto1870 | Hover | 17/32 | 13/32 | 16/32 | 16/32 |
| vela | Zoning | 12/32 | 10/32 | 16/32 | 18/32 |
| mox | Counter (beam) | 17/32 | 19/32 | 20/32 | 20/32 |

All results are raw game outcomes: **zero draws/timeouts**, so no measurement tie-break is needed. Mean bout times are 27.65 → 27.46 seconds at Normal and 31.92 → 31.83 at Hard. Role win changes are mixed. Each fighter's 32 rows share paired seats and span only two seeds per opponent; this cannot certify matchup/roster fairness or human round duration. Broad source-specific gates and human validation remain outstanding. The prototype remains separate for review, with no promotion claim.

## Evidence

[Compressed originals, frozen diagnostic runners and manifest](cpu-hold-crouch/) preserve source hashes, raw outcomes, complete bouts, seeds, input/final hashes, causal frame traces and protection counts. [Manifest](cpu-hold-crouch/manifest.json) includes raw/gzip hashes. The first-only runner uses the frozen Metrics harness; the panel/causal runners use the frozen diagnostic harness. Both have the same fixed reference where applicable. Explicit workspace paths identify the measured sources; change roots only when reproducing elsewhere. The I original endpoint baseline includes its earlier finale measurement for provenance; T itself runs the first encounter only.
