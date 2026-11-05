# Advisory empirical budget validation

Frozen simulation 373448bdc043a0e8; source SHA-256 6dbb1f97b0bdedd2d0de3f21ef694c170f1e2fbd11f8ac74d22d047dd6f4c0f4.

Nonnegative ridge least squares on standardized shared-feature differences; clipped probability predictions; no ID coefficients or production writes.

Canonical pair SHA-256 mod10: 0–1 untouched matchup holdout across both repeats; 2–3 inner tuning at repeat0; 4–9 inner fit at repeat0; refit chosen model on2–9 repeat0. Repeat1 on2–9 is an additional seed holdout.

Associational model under one frozen CPU policy. Reverse seats are paired, not independent. Actor/matchup overlap remains in seed holdout; matchup holdout still reuses roster actors. Constant safety features cannot identify safety coefficients. Beams excluded rather than given zero shot utility.

Ordinary-shot actors: 253; excluded beam bouts 208; excluded raw draws 33.

| Held-out data | Shared features Brier | Existing budget Brier | Shared accuracy |
| --- | ---: | ---: | ---: |
| Unseen matchups and their seeds | 0.24115 | 0.24885 | 57.31% |
| New seeds on training matchups | 0.24209 | 0.24958 | 57.72% |

Neutral50% Brier baseline is0.25. Selected regularization 0.0001; coefficients below are predictive associations, not approved tuning prices.

Matchup-cluster bootstrap95% interval for shared-minus-existing held-out Brier: [-0.01058, -0.00452]. Reverse seats are not treated as independent samples.

| Shared feature | Standardized coefficient | Per-unit coefficient |
| --- | ---: | ---: |
| lightDamagePerCommitment | 0.010978 | 0.214528 |
| heavyDamagePerCommitment | 0.012620 | 0.155506 |
| ordinaryProjectileThreat | 0.000000 | 0.000000 |
| walkSpeed | 0.027136 | 0.076084 |
| nearestLightReach | 0.042798 | 0.014386 |
| nearestHeavyReach | 0.001167 | 0.000144 |

Unidentifiable constant features: lightBlockAdvantageNominal, heavyBlockAdvantageNominal. Safety needs a controlled timing intervention before its price can be estimated empirically.

Zero fitted weights mean no separately identified predictive contribution in this constrained, collinear dataset; they do not establish that heavy damage or projectile threat has zero gameplay value.

No fighter values were changed by this analysis. No population fairness, causal coefficient, human feel or story difficulty approval is implied.
