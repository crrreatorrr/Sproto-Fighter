# OwnKit/S: free-fight policy pilot

Frozen source `340ae0bbc1104751a56e27555978bace4ce35824`; production SHA-256 `6f9d4323303198bdd21e6d347a524edbae9637894aff77586e15029957d45dc4`; simulation `a4c7ddde49ec5a64`; harness `9d0114188482dce4eba0cc438a8d4585f772a3c948750cd1fdffcde3300812f9`.

OwnKit/S is a separate input-policy prototype from the K beam-fee experiment. It changes approach intent based on the actor’s own kit and neutral cast share. No fighter stats, move table, reference, physics or Story mapping change is part of this intervention. This source is unpromoted; the report makes no acceptance claim.

The pilot covers 254 fighters, 508 sampled pairs, two independent seed pairs, both seats, skills 4/7 and seed 20261105: 4,064 bouts with 3600-frame caps. Every directed matchup/controller/repetition/initial seed key matches the exact subset of the full I report. Full I gate counts are not compared directly with sparse pilot counts. Reverse seats are paired rather than additional independent repetitions; four bouts per matchup do not establish a 70/30 population bound.

| Skill | Bouts | Outside 35–65%, I→S | Raw draws I→S | Unresolved I→S | Mean I→S |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4 | 2032 | 125 → 113 | 0 → 2 | 0 → 2 | 28.14 → 23.88s |
| 7 | 2032 | 112 → 132 | 0 → 0 | 0 → 0 | 32.46 → 28.34s |

| Canonical archetype | Normal I→S | Hard I→S |
| --- | ---: | ---: |
| Brawler | 44.86% → 40.75% | 47.95% → 42.47% |
| Counter | 52.56% → 47.80% | 53.17% → 48.66% |
| Footwork | 53.00% → 54.25% | 50.22% → 46.78% |
| Hover | 50.00% → 31.25% | 43.75% → 56.25% |
| Paired | 46.18% → 45.49% | 48.26% → 40.62% |
| Pressure | 42.89% → 45.53% | 47.97% → 49.80% |
| Weapon | 42.14% → 37.14% | 47.86% → 50.71% |
| Zoning | 51.58% → 57.28% | 49.53% → 66.14% |

The prototype shortens bouts at both levels, but the observed actor-band count improves on Normal and worsens on Hard. Hard Zoning rises from 49.53% to 66.14% while Brawler and Paired fall below their baseline group rates. These mixed results do not establish a balance gain.

These are screening observations on a fixed, sparse panel. Changes in group means can hide within-group actor or matchup changes; gate failure counts are nonlinear and sample-size dependent. Source and harness guards passed. Raw draws remain separate from HP/damage/reverse-seat measurement tie-breaks.

No S Story route/endpoint measurement, full-panel expansion, human playtest, or reserved 20261106 acceptance stream was run. The fixed reference is unchanged but does not participate in these CPU-vs-CPU bouts. No human difficulty, feel or promotion conclusion follows.

## Evidence

- [Exact-key I comparison](comparison-2026-11-05-S-own-kit-vs-I.md).
- [Full pilot raw archive](report-2026-11-05-S-own-kit-quick.json.gz), including every initial seed, raw result, damage source and input/final-state hash.
- [Manifest](S-own-kit-quick-manifest.json), preserving source/harness identities and raw/compressed byte hashes.

Gzip round-trips and SHA-256 were verified. Production source and historical reports remain unchanged.
