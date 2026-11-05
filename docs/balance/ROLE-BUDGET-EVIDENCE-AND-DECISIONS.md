# Shared-role evidence and remaining budget decisions

These are historical candidate measurements, separate from the final selected-source checks. A is reviewed CPU373 with original role numbers; B adds delayed motion tracking; E adds only Footwork light startup 6 / damage 34 and Zoning light range 94 to A; D applies those same two role changes to B. Brawler light 80 and Weapon light 88 are retained in D/E. No Paired, Pressure, Counter, HP or individual-ID adjustments are made.

All four cells contain exactly 16,104 common directed bout/seed keys: samples 8, repetitions 2, both seats, Normal 4 / Hard 7, seed 20261105. Source hashes and the shared key digest are in `common8-role-distribution-manifest.json`. Full lossless B/D/E reports and A reconstruction metadata are packaged separately under `common8-panel-20261105/`.

| Cell | Normal fighters outside 35–65% | Hard fighters outside 35–65% |
| --- | ---: | ---: |
| A reviewed/original | 57 | 40 |
| B tracking/original | 42 | 49 |
| E reviewed/V3 | 28 | 24 |
| D tracking/V3 | 30 | 28 |

E was selected for final integration over D: its observed counts are lower at both levels, and it retains the simpler reviewed policy. These are candidate-selection observations, not a passing fairness gate or proof of statistical superiority. Final selected-source broad/curve reports include an independent later CPU variety fix and must be kept distinct from these cells.

## Role distributions for E

| Skill | Role | Actors | Weighted rate | Min / median / max | Below 35 / above 65 |
| --- | --- | ---: | ---: | --- | --- |
| 4 | Brawler | 21 | 40.94% | 27.94/42.19/60.00% | 4/0 |
| 4 | Counter | 49 | 52.76% | 33.93/53.75/72.22% | 2/4 |
| 4 | Footwork | 85 | 52.80% | 33.33/52.50/75.00% | 1/6 |
| 4 | Hover | 2 | 50.00% | 43.33/43.33/56.67% | 0/0 |
| 4 | Paired | 20 | 42.31% | 25.00/43.06/51.92% | 2/0 |
| 4 | Pressure | 31 | 46.04% | 23.08/47.50/60.29% | 2/0 |
| 4 | Weapon | 8 | 53.91% | 35.00/51.56/70.83% | 0/2 |
| 4 | Zoning | 38 | 51.00% | 30.88/51.92/69.44% | 2/3 |
| 7 | Brawler | 21 | 46.19% | 26.67/46.15/62.50% | 1/0 |
| 7 | Counter | 49 | 50.86% | 32.69/51.56/69.23% | 1/2 |
| 7 | Footwork | 85 | 50.09% | 31.25/50.00/72.22% | 5/4 |
| 7 | Hover | 2 | 40.83% | 40.00/40.00/41.67% | 0/0 |
| 7 | Paired | 20 | 44.31% | 33.93/44.44/63.33% | 1/0 |
| 7 | Pressure | 31 | 49.54% | 36.67/50.00/67.86% | 0/1 |
| 7 | Weapon | 8 | 52.21% | 35.29/51.56/64.58% | 0/0 |
| 7 | Zoning | 38 | 53.78% | 25.00/50.00/80.36% | 2/7 |

Counter is not uniformly weak: 49 actors, six Normal and three Hard outliers, with both tails represented. Paired is mostly below 50%, but one Normal and two Hard actors already exceed 50%; one Hard point estimate is 63.33%. Those observations do not justify a blanket profile buff before confirming persistent effects with new seeds. The gzip retains per-actor Counter/Paired observations as joinable evidence, never as proposed ID-specific bonuses.

## Empirical versus prior budget prices

The production .65/.25/.10 light/heavy/projectile weights, squared neutral-speed factor and light-reach multiplier remain exploratory design priors. Golden tests lock them for review; goldens do not establish empirical calibration. The engine action-ready safety convention is blockstun−(active+recovery+1), verified using fresh noncancellable grab readiness after first blocked contact: light 16 attacker / 11 defender ticks, heavy 30 / 18, excluding hitstop. V3 uses that convention.

The advisory nonnegative fit in `scripts/lib/budget-calibration.mjs` uses held-out canonical matchups across both seeds, separate seed holdout, inner-only regularization selection, and matchup-cluster bootstrap intervals. It has no ID coefficients and makes no production writes. On reviewed373 baseline, unseen-matchup Brier is 0.24115 versus 0.24885 for the scalar budget; the shared-minus-existing interval is [-0.01058,-0.00452]. Accuracy is 57.31%. This is modest predictive evidence, not a causal price schedule. Coefficients change after role interventions, the ordinary-shot threat coefficient is not independently identified as positive, and the lone beam actor is excluded rather than assigned zero shot utility.

Both light/heavy block-advantage features are constant in this roster; their causal safety coefficients cannot be fitted from these observations. Retain an explicit safety prior unless a controlled timing intervention is approved and measured. Replacing the entire production budget with these unstable association coefficients would overstate the evidence. The plan’s empirically calibrated whole-kit requirement remains unresolved.

## Utility omitted by the scalar

`PROJECTILE-WHIFF-BUDGET-OBSERVATIONS.md`, its compressed raw rows and `projectile-utility-budget-manifest.json` preserve an all 254 numerical diagnostic. Full-screen ordinary-shot misses impose 66–79 additional recast-lock ticks beyond cleanup (median 77); the focused beam imposes zero. A hit/block often clears a shot sooner, so these are conditional whiff costs, not expected match DPS or automatic damage-price multipliers. Beams also beat ordinary shots in clashes; dual emitters split total packet damage across two lanes. Most exceptional trajectory families have fewer than five actors.

`selected-partner-utility-inventory.json` retains 13 special partner packages and their stun/push/launch/low profiles; 13 leads use them by default and 241 use generic contacts. It distinguishes declared caster powers from runtime eligibility, records frost slow, rounded per-hit drain, final pull/slam and Special advance 0–8. Neither those utilities nor reviewed emitter geometry are fully priced by the scalar. The ±10%/±3% tests prove bounded explicit role adjustments, not a complete budget for every retained mechanic.

If confirmed final outliers cannot be resolved within the current constraints, the proposed design decision is a shared mechanical-projectile/partner profile cost layer or additional subtemplates with explicitly expanded allowed fields. That would require review of whether profile costs may exceed the eight-role template band; it must not become per-ID win-rate bonuses. Insufficiency is not yet proven, and no such mechanics were changed here.

## Confirmation protocol

After the final source is frozen, select persistent extreme matchups using a recorded rule and run at least 100 independent seed pairs per matchup, both seats and both CPU levels. Keep seed pairs as clusters; do not treat the two seats as independent. Preserve raw draws and report the cluster uncertainty around the side-balanced rate. Four observed bouts cannot establish a population 70/30 limit. No confirmation panel or human playtest is claimed by this report.
