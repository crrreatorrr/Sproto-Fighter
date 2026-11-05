# Selected F: opening skill sweep and endpoint diagnostics

Candidate F's fixed-reference point estimates miss the planned 15% opening and
65% finale targets. The opening fighter can beat this reference at higher
skills, but reaching the opening target through a scalar remap would require a
large departure from the planned skill-1 opening. No mapping or reference was
changed, and the reserved acceptance stream has not been used.

Source: `7b1ab9d19eef10f30bf9b701b2130d8b2d302ed0`, E roles plus the reviewed low
choice fix, without tracking or known-spawn initialization. Simulation version
`c662aee33095a523`; simulation-source SHA-256
`058d8215776d1db035c948b42cd224684e705f35ddc46fcb2841dd4b8e7ea495`.

The independent reference remains High Sproto with
`reference-v2-persistent-delay18`, source SHA-256
`2aada800cc5ac2e80c41942a14db8a9a6bb8f541a8a9bc4cbdf5d640a364f4ff`.
The source was archived before measurement. Both diagnostics use master seed
`20261105`, the actual encounter/wave seed namespace and a 3600-frame cap per
regular fighter bout. Reverse seats share fighter/controller streams and are
bias audits, not additional independent repetitions.

## Opening sweep: actual first encounter, Zephyr

Each skill has 64 independent repetitions, tested in both seats. The same seed
pairs are reused across skills. The table uses the actual Story seat: reference
slot 0, CPU slot 1. All 640 reverse-seat outcomes agree with their paired result.
There were no draws in the 1280 regular bouts.

| Skill | CPU wins / 64 | Rate | Pointwise Wilson 95% |
| ---: | ---: | ---: | ---: |
| 1 | 1 | 1.56% | 0.28–8.33% |
| 2 | 0 | 0% | 0–5.66% |
| 3 | 1 | 1.56% | 0.28–8.33% |
| 4 | 1 | 1.56% | 0.28–8.33% |
| 5 | 2 | 3.125% | 0.86–10.70% |
| 6 | 2 | 3.125% | 0.86–10.70% |
| 7 | 4 | 6.25% | 2.46–15.00% |
| 8 | 4 | 6.25% | 2.46–15.00% |
| 9 | 14 | 21.875% | 13.50–33.43% |
| 10 | 17 | 26.56% | 17.30–38.48% |

The point-estimate crossing of 15% lies between skills 8 and 9. A straight-line
interpolation would suggest about 8.56, but that is **not a validated mapping**:
reaction frames are rounded, controller choices can change discretely, outcomes
need not be monotone, ten levels were examined and the intervals are pointwise.
At these levels, the CPU uses approximately 11–9 reaction frames instead of the
planned opening's 28. Such an opening would be close to Expert on the published
knob scale and would require an explicit design decision.

All fighter stats and the reference policy were fixed within this sweep. The
17/64 Expert wins show functional combat range against the reference; the poor
Easy result does not mean Zephyr has no ability to win at any skill. It also
does not establish how a decent human would experience either level.

## Exact 256-repetition endpoint comparison

This diagnostic reuses the same endpoint seed pairs as the reviewed, tracking
and known-spawn comparisons in
[STORY-TARGET-DIAGNOSIS-20261105.md](STORY-TARGET-DIAGNOSIS-20261105.md).
The first 64 opening repetitions are therefore a subset of the sweep, not
independent confirmation.

| Encounter | Skill | Natural-seat CPU wins | Pointwise Wilson 95% |
| --- | ---: | ---: | ---: |
| First: Zephyr | 1 | 1/256 = 0.39% | 0.07–2.18% |
| Finale: Morelight → VMU | 10 | 131/256 = 51.17% | 45.08–57.23% |

There were no draws, and all 512 reverse-seat encounter results matched their
paired natural-seat result. The finale CPU won the first wave in 76/256 trials
and the second in 55/180 reached trials, producing 131 encounter defeats. These
1024 seat-level encounter trials comprise 1384 regular fighter bouts.

The exact nominal 15% opening and 65% finale rates lie above these pointwise
intervals. “About” still needs a predeclared tolerance for formal acceptance.
The data do not certify the requested human difficulty curve or per-encounter
smoothness. Changing only intermediate scalar values while keeping the original
skill-1/skill-10 endpoints cannot repair these measured endpoint values for this
frozen policy.

## Scope and next decision

The native endpoint helper's two-row subset has the previously documented boss
marker issue; the analysis uses the full 247-encounter route and correctly marks
Zephyr ordinary and the finale a boss. Natural-seat confidence intervals above
avoid the native pooled-seat interval's duplicated sample count. Dedicated
transformed boss controllers are excluded from these regular-fighter trials.

The master seed `20261106` and proposed 400-independent-repetition acceptance
endpoints remain reserved. Do not use that holdout to select a mapping or keep
rerunning it until a target passes. Review this diagnostic and freeze any
subsequent candidate before authorizing acceptance. The existing full-route
measurement is separate; neither this opening sweep nor two endpoints certify
all 246 adjacent probability changes.

Retain the original target/mapping as unmet unless the owner explicitly chooses
continued lawful controller work, a calibrated mapping, or the chapter-level
criterion discussed in the protocol report. No hidden stat bonus, fighter swap,
reference weakening or unilateral target change is justified by these results.
Human playtesting and reference-to-human calibration remain outstanding.

## Artifacts

[story-target-diagnosis/finalF-manifest.json](story-target-diagnosis/finalF-manifest.json)
pins source, simulation, route, reference, raw JSON, compressed bytes and result
hashes. Adjacent compressed files contain all seed pairs, controller inputs/final
state hashes and per-wave records. The diagnostic runner is
[`scripts/lib/story-target-diagnosis.mjs`](../../scripts/lib/story-target-diagnosis.mjs).
No product source, story mapping or primary checkout was edited by measurement.
