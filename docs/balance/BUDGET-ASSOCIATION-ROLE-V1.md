# Advisory empirical budget validation

Frozen simulation 9c2242ec19366cde; source SHA-256 b47bdccb19191650e464522533c68ac1305ac980193d82faa718c4784634be49.

Nonnegative ridge least squares on standardized shared-feature differences; clipped probability predictions; no ID coefficients or production writes.

Canonical pair SHA-256 mod10: 0–1 untouched matchup holdout across both repeats; 2–3 inner tuning at repeat0; 4–9 inner fit at repeat0; refit chosen model on2–9 repeat0. Repeat1 on2–9 is an additional seed holdout.

Associational model under one frozen CPU policy. Reverse seats are paired, not independent. Actor/matchup overlap remains in seed holdout; matchup holdout still reuses roster actors. Constant safety features cannot identify safety coefficients. Beams excluded rather than given zero shot utility.

Ordinary-shot actors: 253; excluded beam bouts 104; excluded raw draws 16.

| Held-out data | Shared features Brier | Existing budget Brier | Shared accuracy |
| --- | ---: | ---: | ---: |
| Unseen matchups and their seeds | 0.24786 | 0.25012 | 55.33% |
| New seeds on training matchups | 0.24749 | 0.24976 | 54.13% |

Neutral50% Brier baseline is0.25. Selected regularization 0.0001; coefficients below are predictive associations, not approved tuning prices.

Matchup-cluster bootstrap95% interval for shared-minus-existing held-out Brier: [-0.00343, -0.00105]. Reverse seats are not treated as independent samples.

| Shared feature | Standardized coefficient | Per-unit coefficient |
| --- | ---: | ---: |
| lightDamagePerCommitment | 0.000000 | 0.000000 |
| heavyDamagePerCommitment | 0.009733 | 0.119940 |
| ordinaryProjectileThreat | 0.000000 | 0.000000 |
| walkSpeed | 0.020040 | 0.056189 |
| nearestLightReach | 0.026813 | 0.006141 |
| nearestHeavyReach | 0.004365 | 0.000539 |

Unidentifiable constant features: lightBlockAdvantageNominal, heavyBlockAdvantageNominal. Safety needs a controlled timing intervention before its price can be estimated empirically.

Zero fitted weights mean no separately identified predictive contribution in this constrained, collinear dataset; they do not establish that heavy damage or projectile threat has zero gameplay value.

No fighter values were changed by this analysis. No population fairness, causal coefficient, human feel or story difficulty approval is implied.
