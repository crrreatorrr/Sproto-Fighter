# Small shared-role reach compensation: I pilot

Frozen I `efb5829c1230dac84337ba0212d92a84a527563b`; simulation `a4c7ddde49ec5a64`; production SHA-256 `612b5e933e3e5b268ecef90db543d1572e8f4827a6d3db5a3fc1da7606d1bf3f`; harness `9d0114188482dce4eba0cc438a8d4585f772a3c948750cd1fdffcde3300812f9`.

The source intervention from F changes only Brawler light reach 80→86 and Paired light reach 82→86, plus corresponding budget expectations and generated simulation artifacts. No actor-specific adjustment or Counter nerf is included. This is an unpromoted diagnostic, not full acceptance evidence.

All 254 fighters, 508 sampled pairs, two independent seed pairs, both seats, skills 4/7, seed 20261105 and a 3600-frame cap: 4,064 bouts. The F baseline is filtered to the exact directed matchup/controller/repetition/initial-seed keys. Source/harness identity guards passed. Reverse seats are paired, not independent. Four bouts per matchup do not establish a population 70/30 bound.

| Level | Outside 35–65%, F→I | Mean duration, F→I | Raw draws, F→I |
| --- | ---: | ---: | ---: |
| 4 | 135 → 125 | 28.11 → 28.14 s | 0 → 0 |
| 7 | 103 → 112 | 32.68 → 32.46 s | 0 → 0 |

| Archetype | Normal F→I | Hard F→I |
| --- | ---: | ---: |
| Brawler | 32.88% → 44.86% | 43.49% → 47.95% |
| Counter | 54.02% → 52.56% | 54.39% → 53.17% |
| Footwork | 54.90% → 53.00% | 50.44% → 50.22% |
| Hover | 50.00% → 50.00% | 43.75% → 43.75% |
| Paired | 37.85% → 46.18% | 47.57% → 48.26% |
| Pressure | 44.51% → 42.89% | 46.75% → 47.97% |
| Weapon | 42.86% → 42.14% | 51.43% → 47.86% |
| Zoning | 53.48% → 51.58% | 50.00% → 49.53% |

These are sparse screening point estimates. Counts from this small panel must not be compared directly with full F 17/7 failures. Archetype aggregates can hide individual actor or matchup outliers. A broader matched panel and separately declared high-repetition matchup confirmations would be needed before a balance conclusion. No I full-roster expansion, story endpoint run, human playtest or acceptance stream was performed by this measurement.

The [exact-key comparison](comparison-2026-11-05-I-role-reach-vs-F.md), [complete raw archive](report-2026-11-05-I-role-reach-quick.json.gz), and [manifest](I-role-reach-quick-manifest.json) preserve raw draws, tie-breaks, all initial seeds, input/final state hashes and exact compressed/uncompressed byte hashes. Gzip round-trips were verified. No production source was edited by this report work.
