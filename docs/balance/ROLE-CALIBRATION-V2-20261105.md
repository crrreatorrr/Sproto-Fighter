# Role calibration candidate v2 (exploratory)

Measured simulation `cfba549e19f98166`; source SHA-256 `bd38e6f748ef0d7f78467a7b6140245a42b6f777b213866c7200705a28839d73`; harness SHA-256 `45b19a0663cc4436f47de70b05e4bf3108b1206f34ded76f84c9da47b330bbec`.

## Changes and scope

V1 preserves requested movement (Pressure 5.6, Footwork 6.2, Brawler 5.2) and tests a shared Footwork light commitment/damage tax plus slower-role light-reach compensation. V2 additionally tests replacing SKIRMISH’s +2% light range with +2% heavy range, retaining its −2% heavy damage. No individual fighter IDs, HP or CPU policy receive tuning. All identity deltas remain at most two fields, within ±10%, and their score within ±3% of the role template.

The budget now uses actual per-move blockstun and remaining active/recovery commitment: nominal first-contact on-block advantage = blockstun − (active + recovery − 1). It prices neutral walk speed and nearest-body light reach, avoiding double-counting paired spread. Explicit .65/.25/.10 light/heavy/projectile weights, squared speed ratio and light-reach ratio are locked by all-eight-template golden score assertions. They are an exploratory, interpretable response to measured associations, not fitted causal coefficients or a validated global power model. Budget scoring itself does not alter live combat. Callers scoring a specific kit pass its template movement as the third `budgetScore` argument; two arguments use neutral-reference movement.

## Controlled results

# Controlled calibration comparison

The baseline is filtered onto the candidate’s exact directed fighter pairs, controllers, repetitions and initial RNG seeds. The full samples17 baseline and samples8 candidate are not compared as unfiltered populations. Source changes include every code difference between the two captured source hashes; associations do not establish causation.

## Skill 4

8052 exactly paired bouts; fighters outside 35–65%: 113 → 74; raw draws 0.00% → 0.00%; mean 22.29 → 22.41 seconds.

| Canonical archetype | Baseline decided rate | Candidate decided rate |
| --- | ---: | ---: |
| Brawler | 35.71% | 40.87% |
| Counter | 50.71% | 50.34% |
| Footwork | 66.94% | 61.08% |
| Hover | 56.67% | 55.00% |
| Paired | 44.72% | 44.47% |
| Pressure | 46.65% | 46.54% |
| Weapon | 31.29% | 44.73% |
| Zoning | 28.95% | 36.63% |

## Skill 7

8052 exactly paired bouts; fighters outside 35–65%: 108 → 61; raw draws 0.20% → 0.14%; mean 22.12 → 22.34 seconds.

| Canonical archetype | Baseline decided rate | Candidate decided rate |
| --- | ---: | ---: |
| Brawler | 39.35% | 51.27% |
| Counter | 48.96% | 47.48% |
| Footwork | 67.25% | 58.41% |
| Hover | 43.33% | 45.00% |
| Paired | 43.86% | 43.29% |
| Pressure | 46.44% | 48.93% |
| Weapon | 31.16% | 40.65% |
| Zoning | 29.96% | 41.06% |

Canonical assignment changes: 0. If nonzero, archetype aggregate changes also reflect membership changes. The exact paired per-fighter results remain available in the JSON comparison.


## V1 versus V2 interpretation

Both candidates improve the old frozen-policy panel, but V2 does not establish superiority over V1. V1 had 70/66 fighters outside 35–65%; V2 has 74/61. Within Footwork, V1 SKIRMISH was 62.37% Normal / 61.66% Hard, versus plain FOOTWORK 55.34% / 50.99%. V2 is 63.14% / 61.48% versus 53.81% / 51.14%. Removing the light-reach delta did not remove that subgroup bias, so the observed V1 subgroup association was not evidence of that delta being the principal cause.

CPU policy is held fixed throughout. Its delayed opponent position compared with current self position may amplify mobility and projectile-emission differences; this is a code-based hypothesis, not a causal measurement. The checkpoint must not be used to justify additional role buffs before testing the independent perception-policy candidate. Projectile traits also overlap role identity and require separate analysis.

**The individual 35–65% gate still fails.** The stricter 40–60% fighter target, population 70/30 matchup bound, reference/human difficulty calibration and human contact/feel approval remain unestablished. No broad samples17 candidate run was performed; only the exact common-seed samples8 panel was measured.

## Verification and evidence

Typecheck and all 150 unit tests pass, including actual 254-lead default-partner Special damage within 270–300, minimum visible phases, identity bounds, paired reach and golden budget scores. Aaron and Captain Green pinned-kit checks pass after refreshing numeric expectations outside historical art files. No art or animation assets changed.

The 16,104-bout report is merged from two independent CLI calls on the same frozen source, skills 4 and 7 separately, samples8/repeats2/seed20261105/cap3600. Every match record is preserved. The report records both source report hashes and exact commands. `report-2026-11-05-role-calibration-v2.json.gz` retains seeds, input/state hashes and raw outcomes; raw JSON SHA-256 `450462c09548316e4fa80232040aaaab61b2302839d798992dcc97d8526db397`.

The accompanying [projectile subgroup observations](ROLE-CALIBRATION-PROJECTILE-SUBGROUPS-20261105.md) label shared traits and low actor counts. Maximum primary release height143.75 rules out the proposed above-standing-head overflow; no height fix is warranted. Front-origin/trajectory associations remain confounded with original roles and CPU timing.
