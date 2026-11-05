# Role calibration candidate v1 (exploratory)

Base `c367f98c4`; measured simulation `ec53ae92b417d3bf`; source SHA-256 `09765d0ac9ac13df58f92265d64da80226c2a5f6ce4f327402d87513e0455b91`.

Preserves movement and changes only shared role templates: Footwork light startup 5→6 and damage 37→34; Zoning/Brawler nearest light reach 80→94; Weapon 88→100. No fighter-specific damage, HP, CPU or ID adjustments. Existing ±10% identity and ±3% relative-template budget tests pass.

The old scalar budget omitted movement and underweighted neutral light spacing. V1 explores light/heavy/projectile weights .65/.25/.10 with a squared neutral-speed ratio and light-reach ratio. These weights are empirically motivated by the prior descriptive associations; they are not a causal fit or proof of equal strength. Safety and golden-value review remains pending in this snapshot.

# Controlled calibration comparison

The baseline is filtered onto the candidate’s exact directed fighter pairs, controllers, repetitions and initial RNG seeds. The full samples17 baseline and samples8 candidate are not compared as unfiltered populations. Source changes include every code difference between the two captured source hashes; associations do not establish causation.

## Skill 4

8052 exactly paired bouts; fighters outside 35–65%: 113 → 70; raw draws 0.00% → 0.02%; mean 22.29 → 22.39 seconds.

| Canonical archetype | Baseline decided rate | Candidate decided rate |
| --- | ---: | ---: |
| Brawler | 35.71% | 41.03% |
| Counter | 50.71% | 50.46% |
| Footwork | 66.94% | 60.99% |
| Hover | 56.67% | 56.67% |
| Paired | 44.72% | 44.31% |
| Pressure | 46.65% | 46.85% |
| Weapon | 31.29% | 46.09% |
| Zoning | 28.95% | 35.99% |

## Skill 7

8052 exactly paired bouts; fighters outside 35–65%: 108 → 66; raw draws 0.20% → 0.11%; mean 22.12 → 22.33 seconds.

| Canonical archetype | Baseline decided rate | Candidate decided rate |
| --- | ---: | ---: |
| Brawler | 39.35% | 50.63% |
| Counter | 48.96% | 47.82% |
| Footwork | 67.25% | 58.65% |
| Hover | 43.33% | 50.00% |
| Paired | 43.86% | 43.29% |
| Pressure | 46.44% | 48.73% |
| Weapon | 31.16% | 40.99% |
| Zoning | 29.96% | 40.23% |

Canonical assignment changes: 0. If nonzero, archetype aggregate changes also reflect membership changes. The exact paired per-fighter results remain available in the JSON comparison.


Within Footwork, SKIRMISH has 51 actors and 3180 fighter-bout observations at each level: 62.37% Normal and 61.66% Hard. Plain FOOTWORK has 22 actors / 1312 observations: 55.34% and 50.99%. The SKIRMISH +2% light-reach tradeoff may buy a larger first-contact advantage than its −2% heavy damage pays for. V2 will replace that with a heavy-reach tradeoff without targeting individual IDs. Mechanical traits are confounded with roles and opponent schedules; this is exploratory evidence.

The per-fighter gate still FAILS (70/66 outside 35–65%). The stricter 40–60%, matchup and human-feel targets are not established. No human playtest or visual-contact approval is claimed.

Evidence: `report-2026-11-05-role-calibration-v1.json.gz`; raw JSON SHA-256 `f5db0c5c68233cebc68d83125061a7b92a71d7e6cfb6344c59b85b32bcd57729`. Full seeds, inputs/state hashes and raw draws are retained. Exact common-seed baseline pairing is recorded in the comparison above.
