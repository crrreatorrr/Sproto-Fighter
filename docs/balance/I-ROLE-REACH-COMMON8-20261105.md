# Shared-role reach compensation: I common-eight panel

Frozen I `efb5829c1230dac84337ba0212d92a84a527563b`; simulation `a4c7ddde49ec5a64`; production SHA-256 `612b5e933e3e5b268ecef90db543d1572e8f4827a6d3db5a3fc1da7606d1bf3f`; harness `9d0114188482dce4eba0cc438a8d4585f772a3c948750cd1fdffcde3300812f9`.

The source intervention from F changes only Brawler light reach 80→86 and Paired light reach 82→86, plus corresponding budget expectations and generated simulation artifacts. No actor-specific adjustment or Counter nerf is included. This is an unpromoted diagnostic, not full acceptance evidence.

All 254 fighters, 2,013 sampled pairs, two independent seed pairs, both seats, skills 4/7, seed 20261105 and a 3600-frame cap: 16,104 bouts. The F baseline is filtered to the exact directed matchup/controller/repetition/initial-seed keys. Source/harness identity guards passed. Reverse seats are paired, not independent. Four bouts per matchup do not establish a population 70/30 bound.

| Level | Outside 35–65%, F→I | Mean duration, F→I | Raw draws, F→I |
| --- | ---: | ---: | ---: |
| 4 | 40 → 28 | 28.09 → 28.02 s | 2 → 3 |
| 7 | 22 → 23 | 32.78 → 32.65 s | 0 → 1 |

| Archetype | Normal F→I | Hard F→I |
| --- | ---: | ---: |
| Brawler | 36.75% → 42.86% | 46.27% → 50.00% |
| Counter | 52.95% → 51.29% | 51.23% → 50.31% |
| Footwork | 55.07% → 54.33% | 51.13% → 50.83% |
| Hover | 50.00% → 50.83% | 56.67% → 50.83% |
| Paired | 39.44% → 44.22% | 42.16% → 46.12% |
| Pressure | 45.93% → 44.92% | 50.36% → 49.19% |
| Weapon | 47.79% → 47.45% | 46.94% → 45.75% |
| Zoning | 51.00% → 50.12% | 51.87% → 51.37% |

These are screening point estimates. All 4,064 pilot records were reused exactly and only 12,040 missing bouts were simulated, with source/harness/seed guards and atomic checkpoints. The pilot is nested within this panel rather than independent confirmation. Counts from this sampled panel must not be compared directly with full F 17/7 failures. Archetype aggregates can hide individual actor or matchup outliers. A broader matched panel and separately declared high-repetition matchup confirmations would be needed before a balance conclusion. No I full-17 panel, story endpoint run, human playtest or acceptance stream was performed by this measurement.

The [exact-key comparison](comparison-2026-11-05-I-role-reach-common8-vs-F.md), [complete raw archive](report-2026-11-05-I-role-reach-common8.json.gz), and [manifest](I-role-reach-common8-manifest.json) preserve raw draws, tie-breaks, all initial seeds, input/final state hashes and exact compressed/uncompressed byte hashes. Gzip round-trips were verified. No production source was edited by this report work.
