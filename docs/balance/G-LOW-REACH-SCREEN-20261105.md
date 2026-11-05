# Selected F role distribution and G reach-policy screen

F remains the selected historical full-panel checkpoint. G is an unpromoted input-policy prototype. This diagnostic does not authorize replacing F or certify balance, human difficulty or feel. No full G panel was run.

## F shared-role distributions

| Level | Archetype | Actors | Minimum | Median | Maximum | Above 60% | Above 65% |
| --- | --- | ---: | --- | ---: | --- | ---: | ---: |
| 4 | Brawler | 21 | johnson 27.21% | 38.79% | dumpstar 52.73% | 0 | 0 |
| 4 | Paired | 20 | godmod3d 29.46% | 41.55% | peterpan 50.83% | 0 | 0 |
| 7 | Brawler | 21 | bront 31.00% | 43.24% | dumpstar 58.04% | 0 | 0 |
| 7 | Paired | 20 | sproto704 34.82% | 44.76% | sproto832 59.09% | 0 | 0 |

Neither Brawler nor Paired has an actor above 60% in this panel. Lowest Footwork rates are 39.10% Drzmoody on Normal and 38.89% Mildtacos on Hard. These observations support investigating shared mechanics; they do not justify actor-specific buffs.

Mox uses shared Counter/PSYCHIC mechanics (speed 5.6, light reach 86, heavy 145) and a 520-length beam lasting 12 frames with 48 damage, startup 18/recovery 20, origin 36.25/143.75. Johnson uses Brawler (speed 5.2, light 80, heavy 135) and a speed 9 ring with 61 damage, startup 22/recovery 22, origin 97.5/84.375. Both default partners use generic push 4/stun 28 rather than bespoke utility. The static Johnson projectile-origin overshoot margin at closest standing spacing is 17.5; this is a geometric hypothesis, not observed causal attribution.

## G common-seed pilot

G source `05397f05169a1581a44e4b138025dd071865480c`; production SHA `b78ee795990bc2b8e73c064c0348ba9a868eb49242a6967765bec3fcea56920d`; simulation `c662aee33095a523`; harness `9d0114188482dce4eba0cc438a8d4585f772a3c948750cd1fdffcde3300812f9`.

All 254 fighters, 508 sampled pairs, two independent seed pairs, both seats, skills 4/7: 4,064 bouts. Every directed fighter/controller/repetition/initial-seed key was matched to the exact subset of the F full report. Raw draws are preserved separately from measurement tie-breaks. Reverse seats are paired, not independent; no 70/30 bound follows from four bouts per pair.

| Level | Outside35–65%,F→G | Mean,F→G | Raw draws,F→G |
| --- | ---: | ---: | ---: |
| 4 | 135 → 130 | 28.11 → 27.60s | 0 → 0 |
| 7 | 103 → 106 | 32.68 → 32.05s | 0 → 0 |

See the [exact-key comparison](comparison-2026-11-05-G-low-reach-vs-F.md) for canonical-role rates. Counts from this small panel must not be compared directly with F full-panel 17/7 failures. The separate first-endpoint diagnostic remains 1/256; no story endpoint improvement is established. Sourceguard checks passed.

Raw archives preserve all inputs/state hashes, seeds and outcomes. The [manifest](G-low-reach-quick-manifest.json) records source identities and exact byte hashes. This report is screening evidence only.
