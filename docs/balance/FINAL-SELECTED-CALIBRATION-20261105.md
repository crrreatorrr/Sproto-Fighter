# Selected F: final seeded calibration

Frozen commit `7b1ab9d19eef10f30bf9b701b2130d8b2d302ed0`; simulation `c662aee33095a523`; production source SHA-256 `058d8215776d1db035c948b42cd224684e705f35ddc46fcb2841dd4b8e7ea495`. Harness `9d0114188482dce4eba0cc438a8d4585f772a3c948750cd1fdffcde3300812f9`.

F combines the reviewed CPU, V3 Footwork/Zoning package and reviewed low-variety input-policy correction. It excludes delayed-motion tracking and known-spawn initialization. No production source changed during measurement.

The full panel covers 254 actors, 4,184 sampled pairs, two independent seed pairs per matchup, both seats, skills 4/7 and seed 20261105: 33,472 bouts. Separate Normal/Hard runs were assembled losslessly; source component hashes are retained. Four paired-seat bouts per matchup do not certify a population 70/30 bound.

| Level | Bouts | Raw draws | Unresolved | Mean | Outside 35–65% |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4 | 16736 | 4 (0.02%) | 4 | 28.18 s | 17 |
| 7 | 16736 | 2 (0.01%) | 2 | 32.67 s | 7 |

The observed per-actor 35–65% gate remains unmet: 17 Normal and 7 Hard failures. Raw draws remain distinct from measurement tie-breaks. This CPU-vs-CPU duration does not establish human-vs-Normal duration or approve feel.

| Canonical archetype | Normal | Hard |
| --- | ---: | ---: |
| Brawler | 39.12% | 44.10% |
| Counter | 53.15% | 51.16% |
| Footwork | 54.08% | 51.24% |
| Hover | 45.97% | 47.98% |
| Paired | 41.05% | 43.98% |
| Pressure | 46.65% | 49.85% |
| Weapon | 49.48% | 47.91% |
| Zoning | 50.38% | 52.76% |

## Controlled comparisons

The [full common-seed A373 comparison](comparison-2026-11-05-final-selected-vs-reviewed373.md) verifies all 33,472 directed match/controller/repetition/initial-seed keys: band failures 28→17 Normal and 18→7 Hard. Those changes combine role and policy interventions. Canonical memberships are unchanged.

The [exact E8→F8 comparison](comparison-2026-11-05-final-selected-vs-E-common8.md) isolates the low-variety policy correction across 16,104 matched bouts. Normal failures worsen 28→40 while Hard improves 24→22. Normal Brawler falls 40.94→36.75%, Paired 42.31→39.44%, and Footwork rises 52.80→55.07%. The correction is not uniformly balance-positive. Sample sizes differ between full and common8 panels, so their failure counts must not be compared directly.

## Remaining actor outliers

| Skill | Actor | Archetype | Decided win rate | Bouts |
| --- | --- | --- | ---: | ---: |
| 4 | johnson | Brawler | 27.21% | 136 |
| 4 | mikemike | Brawler | 27.94% | 136 |
| 4 | godmod3d | Paired | 29.46% | 112 |
| 4 | sisma | Pressure | 30.30% | 132 |
| 4 | laserbach | Pressure | 33.04% | 112 |
| 4 | janitor | Brawler | 33.97% | 156 |
| 4 | cam | Brawler | 34.09% | 132 |
| 4 | cantankerous | Pressure | 34.09% | 88 |
| 4 | crumpleii | Brawler | 34.17% | 120 |
| 4 | azkarah | Zoning | 34.78% | 92 |
| 4 | satoshi | Pressure | 34.82% | 112 |
| 4 | sproto704 | Paired | 34.82% | 112 |
| 4 | micsash | Counter | 65.15% | 132 |
| 4 | vamp | Zoning | 65.83% | 120 |
| 4 | rune | Counter | 66.67% | 132 |
| 4 | cryptoboy | Counter | 68.00% | 100 |
| 4 | mox | Counter | 74.04% | 104 |
| 7 | bront | Brawler | 31.00% | 100 |
| 7 | bigal | Brawler | 32.50% | 120 |
| 7 | sproto704 | Paired | 34.82% | 112 |
| 7 | rune | Counter | 65.15% | 132 |
| 7 | guest13 | Counter | 67.74% | 124 |
| 7 | sproto1601 | Zoning | 68.10% | 116 |
| 7 | crapto | Zoning | 70.45% | 132 |

## Actual 247-encounter route

The [complete route report](curve-2026-11-05-final-selected.md) covers 1,976 paired-seat encounter trials and 1,994 regular bouts: CPU 202 wins, reference 1,774, no raw draws. First 0/8 and finale 6/8 are sparse estimates from four independent seed pairs, not eight independent samples. The native row intervals pool dependent seats and are optimistic.

The exact route IDs, opponents, chapters, skills and boss markers match the historical reviewed373 route. Its bundle hash differs because bundled roster/template code changed; the manifest records equality of the actual route tuples. Dedicated transformed boss controllers remain excluded.

Separate [256-seed endpoint diagnostics](FINAL-F-STORY-DIAGNOSTIC-20261105.md) give first 1/256 = 0.39% (Wilson 95% 0.07–2.18%) and finale 131/256 = 51.17% (45.08–57.23%). These natural-seat diagnostics avoid counting identical reverse seats twice; the sparse 6/8 finale estimate does not supersede them. The nominal opening 15% and finale 65% targets remain unmet against the fixed reference.

The reference is not calibrated to a decent human. Human playtesting, a predeclared tolerance, valid per-encounter smoothness acceptance and the reserved 20261106 acceptance stream remain outstanding. No human testing or target acceptance is claimed.

## Preserved evidence

The [manifest](final-selected-manifest.json) retains source/harness/route identities, source-part hashes, raw/compressed SHA-256, and every outlier. Complete raw bouts preserve initial seeds, raw results, damage attribution and input/state hashes. Gzip round-trips were checked byte-for-byte. Historical reports remain unchanged.
