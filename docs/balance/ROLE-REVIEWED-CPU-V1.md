# Historical role V1 on the reviewed CPU

Base `db5508c5d`; measured simulation `9c2242ec19366cde`; production SHA-256 `b47bdccb19191650e464522533c68ac1305ac980193d82faa718c4784634be49`. This is a historical trial, not a selected release candidate. It includes the old Brawler and Weapon light-reach buffs as well as Footwork and Zoning changes.

# Controlled calibration comparison

The baseline is filtered onto the candidate’s exact directed fighter pairs, controllers, repetitions and initial RNG seeds. Unfiltered populations are not compared when sampling configurations differ. Source changes include every code difference between the two captured source hashes; associations do not establish causation.

## Skill 4

8052 exactly paired bouts; fighters outside 35–65%: 57 → 26; raw draws 0.06% → 0.02%; mean 28.70 → 28.70 seconds.

| Canonical archetype | Baseline decided rate | Candidate decided rate |
| --- | ---: | ---: |
| Brawler | 39.03% | 50.95% |
| Counter | 53.93% | 50.92% |
| Footwork | 58.11% | 52.14% |
| Hover | 55.00% | 50.00% |
| Paired | 46.03% | 41.50% |
| Pressure | 47.66% | 45.12% |
| Weapon | 50.00% | 56.80% |
| Zoning | 36.25% | 50.17% |

## Skill 7

8052 exactly paired bouts; fighters outside 35–65%: 40 → 37; raw draws 0.11% → 0.17%; mean 34.35 → 33.80 seconds.

| Canonical archetype | Baseline decided rate | Candidate decided rate |
| --- | ---: | ---: |
| Brawler | 46.19% | 60.00% |
| Counter | 51.78% | 48.65% |
| Footwork | 55.36% | 48.52% |
| Hover | 49.17% | 40.83% |
| Paired | 46.20% | 41.50% |
| Pressure | 49.44% | 49.24% |
| Weapon | 49.83% | 60.88% |
| Zoning | 40.27% | 52.53% |

Canonical assignment changes: 0. If nonzero, archetype aggregate changes also reflect membership changes. The exact paired per-fighter results remain available in the JSON comparison.

Candidate skills without a completed baseline level: none.


## Interpretation

The controlled Normal result improves substantially, but Hard improves only40→37 outside the band. In Hard, Brawler46.19→60.00% and Weapon49.83→60.88% show why the old global buffs should not be promoted automatically under the reviewed policy. Later D/E trials omit those two light buffs. No Paired/Pressure buffs are justified from this checkpoint.

Paired20actor distributions: Normal min25/max53.57%,17below50,2equal50,1above;3below35 and6below40. Hard min28.57/max63.33%,17below50,2equal50,1above;3below35 and8below40. One Hard actor is already above60, and these are48–100ish-bout estimates, not population win rates. Opponent/profile differences and paired seed dependence remain.

## Budget calibration status

Exploratory scalar weights are not empirically validated design prices. The accompanying advisory nonnegative fit uses held-out matchups/seeds and no ID coefficients. On reviewed373 baseline, unseen-pair Brier0.24115 versus existing-budget0.24885; on this role-trial source,0.24786 versus0.25012. Coefficients change across configurations; zero fitted projectile/light weights do not prove zero gameplay value. Constant block advantages are unidentified. A separate engine test establishes fresh noncancellable action readiness: light16attacker/11defender ticks and heavy30/18, excluding hitstop. This snapshot retains the earlier conventional−1 budget arithmetic; later V3 uses the corrected engine+1 arithmetic and golden scores.

No gate pass, empirical safety price, human-feel approval, or causal fit is claimed. Raw report `report-reviewed-cpu-role-v1.json.gz` preserves all16,104bouts, seeds and state/input hashes; raw SHA-256 `ee1a6f28cff517d89a04591d9b73e98a39cdfa8b4c5741a1764ae5fc95964994`.
