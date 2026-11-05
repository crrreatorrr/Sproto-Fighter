# Calibration after reviewed CPU integration

Frozen production `db5508c5d`; simulation `373448bdc043a0e8`; source SHA-256 `6dbb1f97b0bdedd2d0de3f21ef694c170f1e2fbd11f8ac74d22d047dd6f4c0f4`.

Harness SHA-256 `9d0114188482dce4eba0cc438a8d4585f772a3c948750cd1fdffcde3300812f9`.

This is a new historical checkpoint, not a replacement for earlier reports. It contains 33,472 bouts across all 254 fighters, 4,184 sampled pairs, two independent seed pairs per matchup, both seats, skills 4 and 7. Normal and Hard ran in separate processes on the same frozen source and were losslessly assembled. Exact component hashes are retained.

The old `7d0ce00ef52b567a` panel uses the same directed matchups, controller assignments, repetitions and initial seeds. The controlled comparison validates every key. Outcomes use canonical production archetypes. Reverse seats are paired; four bouts per matchup cannot establish the population 70/30 bound.

| Skill | Bouts | Raw draws | Unresolved | Mean duration | Outside 35–65% | Outside 40–60% |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 4 | 16736 | 7 (0.04%) | 6 | 28.79 s | 28 | 81 |
| 7 | 16736 | 26 (0.16%) | 4 | 34.35 s | 18 | 51 |

The initial observed 35–65% fighter-band gate still fails (28 Normal, 18 Hard), despite improving from 107/102 on the original panel. The stricter 40–60% target is also unestablished. CPU-vs-CPU duration does not certify the human-vs-Normal duration target or approve feel.

| Canonical archetype | Normal decided rate | Hard decided rate |
| --- | ---: | ---: |
| Brawler | 40.87% | 45.53% |
| Counter | 54.45% | 53.08% |
| Footwork | 56.72% | 55.27% |
| Hover | 49.19% | 45.56% |
| Paired | 45.14% | 46.37% |
| Pressure | 48.74% | 49.61% |
| Weapon | 51.39% | 50.78% |
| Zoning | 37.35% | 38.84% |

## Actual-route story measurement

The separate [actual-route report](curve-2026-11-05-post-cpu-review.md) covers 247 encounters, 1,976 paired-seat trials and 1,996 regular fighter bouts: CPU 212 wins, reference 1,764, no raw draws. First encounter 0/8; finale 4/8. These represent four independent seed pairs per encounter, not eight independent samples. Nominal row intervals are optimistic; independent endpoint diagnostics are separate evidence. The reference remains unvalidated as a human and dedicated boss-form mechanics are excluded.

## Tracking candidate screening

Candidate `b329efc630deb181ba94d66fea97907245afc873`, simulation `dae133515ccb22a6`, is a separate unselected policy candidate. Its 4,064-bout samples2/repeats2 screen is compared with the exact subset of the reviewed-CPU baseline, not the full panel's gate counts.

| Skill | Matched bouts | Outside 35–65%, baseline→tracking | Raw draws, baseline→tracking | Mean duration, baseline→tracking |
| --- | ---: | ---: | ---: | ---: |
| 4 | 2032 | 132 → 118 | 0.00% → 0.00% | 29.01 → 28.05 s |
| 7 | 2032 | 109 → 122 | 0.10% → 0.05% | 34.76 → 30.19 s |

The screen is mixed: Normal improves while Hard has more observed band failures. This does not establish a uniform balance gain or justify promoting the candidate. Sparse subgroup rates and gate counts need broader confirmation; no per-fighter adjustments were made.

## Evidence and feature definitions

- [Full controlled old-to-reviewed comparison](comparison-2026-11-05-reviewed373-vs-original7d.md).
- [Exact tracking subset comparison](comparison-2026-11-05-tracking-vs-reviewed373.md).
- `post-cpu-review-manifest.json` preserves source identities, exact raw/compressed hashes, per-fighter gate failures and assembly provenance.
- `post-cpu-review-kit-features.json` preserves shared per-actor numeric features for advisory modeling; actor IDs are join keys, not proposed fitted coefficients.
- The feature file uses post-contact action-ready arithmetic `stun - (active + recovery + 1)`. Isolated real-step checks give light first-action ticks 16/11 (−5) and heavy 30/18 (−12). Both safety columns are constant across this roster and cannot be identified from these matches. Beams are represented separately from zero-speed shot threat.

All new raw reports are losslessly gzip archived. Source kit features and manifests remain plain JSON. No production source or historical report was modified.

- `report-2026-11-05-post-cpu-review.json.gz`: 46,753,287 raw bytes → 2,465,767 compressed; raw SHA-256 `607d8938d242883e706df335d0036ffb7ca009e715adfc5434962b090afbdae3`.
- `comparison-2026-11-05-reviewed373-vs-original7d.json.gz`: 1,167,788 raw bytes → 109,973 compressed; raw SHA-256 `bda1e1fa01bd8a8975532b8f59f729929b28d734a7775f2ff767dcb893e60212`.
- `report-2026-11-05-tracking-quick-panel.json.gz`: 6,058,424 raw bytes → 335,123 compressed; raw SHA-256 `435394cf7c4e46f7bb3b47b490d18dca19674854ae64e0e99271f2ec3ec966e6`.
- `comparison-2026-11-05-tracking-vs-reviewed373.json.gz`: 953,985 raw bytes → 71,651 compressed; raw SHA-256 `35c0b45c3eddc4d59dc22cc401e5ecbf42d4d661dba4f797b21b6e5307817230`.
