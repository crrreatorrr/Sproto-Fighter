# Phase 4 measurement checkpoint

Integration parent: Phase 0 `66fdd51b5`; CPU implementation `0565b9e2b`.
The same seed, 254-fighter pool and 508 sampled pairs were used as the Phase 0
fast baseline, from both seats. The controller itself changed, so these are
behavior comparisons rather than proof of roster balance.

| Controller | Bouts | Raw draws | Mean bout |
| --- | ---: | ---: | ---: |
| Legacy baseline | 1,016 | 54.53% | 15.28 s |
| Normal (4) | 1,016 | 0.30% | 23.06 s |
| Hard (7) | 1,016 | 0.00% | 22.67 s |

The exact results and source hashes are in `report-2026-11-05-difficulty.json`.
Two sampled opponents per fighter is too small for the fairness target; 132
Normal and 134 Hard fighter estimates fall outside 35–65% in this diagnostic.
These results must not be described as an approved balance gate.

Typecheck, build and all 100 unit tests pass. Node and installed Chromium match
at all 100 determinism checkpoints. The Phase 0 GitHub determinism job passed
on Chromium, Firefox and WebKit; that result predates this simulation change.
Local Firefox/WebKit installation is blocked by environment network policy.

No human playtest was performed. The 15–65% reference-player story curve and
transformed boss difficulty remain uncalibrated. Dedicated boss forms use a
separate controller; interpolating regular-fighter skill does not establish
their challenge. Reference v1 is reproducible but too weak to represent a
decent human. Later tooling work will preserve this checkpoint and version
controller changes explicitly.
