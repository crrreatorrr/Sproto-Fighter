# I: full shared-role reach compensation measurement

Frozen I `efb5829c1230dac84337ba0212d92a84a527563b`; simulation `a4c7ddde49ec5a64`; production SHA `612b5e933e3e5b268ecef90db543d1572e8f4827a6d3db5a3fc1da7606d1bf3f`; harness `9d0114188482dce4eba0cc438a8d4585f772a3c948750cd1fdffcde3300812f9`.

I changes F only through shared Brawler light reach 80→86 and Paired 82→86. No actor-specific buff, Counter nerf or controller change is included. Measurement source remained frozen.

The full panel covers 254 fighters, 4,184 sampled pairs, two independent seed pairs, both seats, skills 4/7 and seed 20261105: 33,472 bouts. All 16,104 common8 records were retained exactly; only 17,368 missing bouts were simulated. The smaller panels are nested in this report and are not independent confirmations. Each directed matchup/controller/repetition/initial seed key is matched against F and reviewed373.

| Skill | Bouts | Raw draws | Unresolved | Mean | Outside35–65% | F failures | Reviewed373 failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 4 | 16736 | 5 | 4 | 28.09s | 12 | 17 | 28 |
| 7 | 16736 | 3 | 0 | 32.60s | 7 | 7 | 18 |

The observed per-actor 35–65% gate remains unmet while the outlier counts above are nonzero. No balance acceptance is claimed.

Raw draws are retained independently from measurement tie-breaks. Reverse seats are paired rather than independent; four bouts per matchup do not establish a population 70/30 bound. Actor band failures are observed sampled results, not confidence-certified population values.

| Canonical archetype | Normal F→I | Hard F→I |
| --- | ---: | ---: |
| Brawler | 39.12% → 42.64% | 44.10% → 50.18% |
| Counter | 53.15% → 51.72% | 51.16% → 50.06% |
| Footwork | 54.08% → 53.87% | 51.24% → 50.45% |
| Hover | 45.97% → 45.97% | 47.98% → 43.15% |
| Paired | 41.05% → 44.17% | 43.98% → 48.38% |
| Pressure | 46.65% → 45.86% | 49.85% → 48.45% |
| Weapon | 49.48% → 49.56% | 47.91% → 46.43% |
| Zoning | 50.38% → 49.84% | 52.76% → 52.10% |

## Remaining actor outliers

| Skill | Actor | Archetype | Decided rate | Bouts |
| --- | --- | --- | ---: | ---: |
| 4 | sisma | Pressure | 27.27% | 132 |
| 4 | aktree | Zoning | 28.57% | 112 |
| 4 | azkarah | Zoning | 32.61% | 92 |
| 4 | gpm | Brawler | 33.09% | 136 |
| 4 | bigal | Brawler | 33.33% | 120 |
| 4 | janitor | Brawler | 33.97% | 156 |
| 4 | cantankerous | Pressure | 34.09% | 88 |
| 4 | satoshi | Pressure | 34.82% | 112 |
| 4 | greatcharly | Footwork | 66.18% | 136 |
| 4 | rune | Counter | 66.67% | 132 |
| 4 | sproto1187 | Footwork | 67.36% | 144 |
| 4 | mox | Counter | 74.04% | 104 |
| 7 | sproto651 | Footwork | 34.48% | 116 |
| 7 | sproto2101 | Footwork | 65.83% | 120 |
| 7 | vamp | Zoning | 65.83% | 120 |
| 7 | guest13 | Counter | 66.13% | 124 |
| 7 | sproto1601 | Zoning | 67.24% | 116 |
| 7 | sproto832 | Paired | 67.42% | 132 |
| 7 | crapto | Zoning | 71.97% | 132 |

## Interpretation and evidence

The [F comparison](comparison-2026-11-05-I-final17-vs-F.md) isolates the two shared reach changes. The [reviewed373 comparison](comparison-2026-11-05-I-final17-vs-reviewed373.md) includes all intervening role and input-policy changes, so those effects must not be attributed to reach alone. Canonical memberships are unchanged.

These measurements do not certify human difficulty, human-vs-Normal duration, per-encounter story smoothness, or feel. No I story route/endpoint measurement, high-repetition confirmatory matchup panel, human playtest, or reserved 20261106 acceptance stream was performed here. Production promotion remains a separate decision; no automatic acceptance is claimed.

The [manifest](I-role-reach-final17-manifest.json) retains exact source/harness identities, pilot/helper hashes, expansion counts, raw/compressed SHA-256 and all actor outliers. Complete gzip archives retain initial seeds, raw outcomes, input/state hashes and damage sources. Source/harness guards and exact pilot-preservation checks passed; gzip round-trips were verified. Historical reports remain unchanged.
