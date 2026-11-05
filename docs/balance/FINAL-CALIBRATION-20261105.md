# Final gameplay calibration (advisory)

Production baseline `a146a8d90`; simulation `7d0ce00ef52b567a`; source SHA-256 `e151e77bbf53dc08bb3241921ffda7fee57615454e0b18a62be57dc7f4f20377`.

Harness SHA-256 `45b19a0663cc4436f47de70b05e4bf3108b1206f34ded76f84c9da47b330bbec`; reference `reference-v2-persistent-delay18`.

Broad run: 33,472 bouts across 254 fighters, 4,184 sampled pairs, 17 proposed opponents per fighter, 2 independent seed pairs per matchup, both seats, skills 4 and 7. The whole-bout cap is 3600 frames. Optional match depth is disabled in this broad run.

Raw draws and measurement tie-breaks remain separate. Rates below exclude unresolved draws. Reverse seats are paired, not independent samples. Four bouts per matchup cannot establish the population 70/30 bound. These bots do not establish human round duration or feel.

Canonical archetypes below come from production `BALANCE_KITS[id].archetype`. The raw runner report retains its older heuristic role grouping; use this canonical table for kit analysis.

## Skill 4

16,736 bouts; raw draws 0.06%; unresolved 0.06%; mean 22.39 s; median 22.27 s. 107/254 fighters fall outside the observed 35–65% gate.

| Canonical archetype | Fighters | Decided win rate | Fighter-bout observations | Projectile damage share |
| --- | ---: | ---: | ---: | ---: |
| Brawler | 21 | 35.53% | 2732 | 32.21% |
| Counter | 49 | 50.98% | 6632 | 26.55% |
| Footwork | 85 | 66.06% | 11092 | 22.38% |
| Hover | 2 | 51.21% | 248 | 21.13% |
| Paired | 20 | 44.90% | 2592 | 49.64% |
| Pressure | 31 | 47.74% | 4064 | 28.44% |
| Weapon | 8 | 32.93% | 1148 | 24.11% |
| Zoning | 38 | 29.18% | 4964 | 31.80% |

Largest observed deviations from 50% (not per-fighter tuning prescriptions):

| Fighter | Archetype | Decided win rate | Bouts |
| --- | --- | ---: | ---: |
| highsproto | Zoning | 11.11% | 144 |
| agentsproto | Brawler | 11.54% | 104 |
| sprotosurvivor | Zoning | 12.50% | 112 |
| sidelinereferee | Zoning | 14.86% | 148 |
| pongohpos10i | Zoning | 16.67% | 168 |
| sproto2616 | Weapon | 18.33% | 120 |
| contresens | Zoning | 18.52% | 108 |
| spunow | Footwork | 81.25% | 96 |
| sproto215 | Footwork | 80.36% | 112 |
| chonky | Footwork | 80.26% | 152 |
| rektina | Footwork | 79.55% | 88 |
| samixsproto | Zoning | 20.54% | 112 |

Associations with per-fighter win rate under this CPU policy (descriptive, not causal): speed r=0.778, lightRange r=0.726, boltStartup r=-0.596, originForward r=-0.359, heavyStartup r=-0.302, boltDamage r=-0.250, spread r=-0.095, secondaryEmitter r=-0.066, beam r=0.037, heavyRange r=0.032, budget r=-0.019.

## Skill 7

16,736 bouts; raw draws 0.18%; unresolved 0.18%; mean 22.38 s; median 22.28 s. 102/254 fighters fall outside the observed 35–65% gate.

| Canonical archetype | Fighters | Decided win rate | Fighter-bout observations | Projectile damage share |
| --- | ---: | ---: | ---: | ---: |
| Brawler | 21 | 37.22% | 2732 | 29.24% |
| Counter | 49 | 49.46% | 6632 | 22.99% |
| Footwork | 85 | 66.43% | 11092 | 18.03% |
| Hover | 2 | 44.35% | 248 | 20.13% |
| Paired | 20 | 43.81% | 2592 | 51.05% |
| Pressure | 31 | 47.56% | 4064 | 25.07% |
| Weapon | 8 | 36.16% | 1148 | 20.28% |
| Zoning | 38 | 29.70% | 4964 | 31.13% |

Largest observed deviations from 50% (not per-fighter tuning prescriptions):

| Fighter | Archetype | Decided win rate | Bouts |
| --- | --- | ---: | ---: |
| bgbadger | Zoning | 14.89% | 96 |
| sproto2616 | Weapon | 18.33% | 120 |
| sprotosurvivor | Zoning | 18.75% | 112 |
| sproto651 | Footwork | 81.03% | 116 |
| sprotolg | Zoning | 19.12% | 136 |
| sproto1345 | Footwork | 80.65% | 124 |
| ghostsprotocol | Zoning | 19.67% | 124 |
| highsproto | Zoning | 20.14% | 144 |
| urmometh | Footwork | 79.69% | 128 |
| sprotosales | Footwork | 79.03% | 124 |
| jasper | Footwork | 78.79% | 132 |
| np | Footwork | 78.38% | 148 |

Associations with per-fighter win rate under this CPU policy (descriptive, not causal): speed r=0.822, lightRange r=0.752, boltStartup r=-0.591, heavyStartup r=-0.302, originForward r=-0.292, boltDamage r=-0.245, spread r=-0.121, secondaryEmitter r=-0.054, heavyRange r=0.049, budget r=-0.035, beam r=-0.032.

## Gate and curve findings

Observed 35–65% fighter-band gate: FAIL. This is separate from the stricter 40–60%, raw draw, matchup and human-playtest requirements.

The actual-route curve covers 247 encounters and 1,976 encounter trials: CPU 30, reference 1946, raw draws 0. First encounter CPU rate 0.00%; finale 25.00%. The fixed reference is not calibrated as a decent human, and the 15–65% endpoint or smooth empirical curve target is not established. Dedicated Story boss-form mechanics are excluded.

The earlier CPU-only report used two sampled opponents, one repetition and a different production fingerprint. It is a historical checkpoint, not a controlled before/after comparison with this broader final run. No literal `--compare` claim is made.

Recommended next work: investigate canonical archetype/template and CPU-policy biases together, rerun the same frozen schedule after role-level changes, and validate contact geometry against existing poses. Preserve the no-art boundary, seeded replay invariants and budget tests. Avoid per-fighter win-rate bonuses.

## Optional match-depth sample

- Skill 4: 112 full-match trials, 265 completed rounds, 0 partial rounds at the cap; raw match draws 0.00%; mean match 50.19 s; mean completed round 21.21 s.
- Skill 7: 112 full-match trials, 273 completed rounds, 0 partial rounds at the cap; raw match draws 0.00%; mean match 53.42 s; mean completed round 21.91 s.

This eight-fighter sample checks complete-match measurement, not roster-wide optional-mode balance. Entrances and between-round presentation are excluded.

## Evidence files

Compressed JSON retains every bout, seed and input/state hash. `final-calibration-manifest.json` records exact uncompressed/compressed SHA-256 values and sizes, plus canonical grouping and gate failures.

- `report-2026-11-05-final-calibration.json.gz`: 46,675,008 bytes raw, 2,393,522 bytes compressed; raw SHA-256 `c25f07cb6ff67a8e8041d1c686001d13db7b5c32444e3899262d6932851dcc47`.
- `curve-2026-11-05-final-calibration.json.gz`: 3,751,596 bytes raw, 150,247 bytes compressed; raw SHA-256 `7183b1046e21d7f01091c97acd4a779467911e009b248c97e8255b72f8981f65`.
- `report-2026-11-05-final-match-depth.json.gz`: 488,956 bytes raw, 26,423 bytes compressed; raw SHA-256 `0b672896209b6651edc0206dc55b34b81eb0ae0ffac0322ce187b3de709c142a`.
