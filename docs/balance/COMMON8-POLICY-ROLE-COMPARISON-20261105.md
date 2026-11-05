# Matched policy × role-package screening panel

All four cells use exactly the same 16,104 directed bout/controller/repetition/initial-seed keys: 254 fighters, 2,013 sampled pairs, two independent seed pairs per matchup, both seats, skills 4 and 7. This is a diagnostic panel, not a full-roster acceptance certificate.

| Cell | Input policy | Role package | Source commit | Simulation |
| --- | --- | --- | --- | --- |
| A | Reviewed CPU | Original | `db5508c5d` | `373448bdc043a0e8` |
| B | Delayed-motion tracking | Original | `b329efc63` | `dae133515ccb22a6` |
| E | Reviewed CPU | V3 | `cbbbaf7f8` | `c662aee33095a523` |
| D | Delayed-motion tracking | V3 | `b702f62de` | `4d75d73d27717592` |

V3 changes Footwork light to startup 6 / damage 34 and Zoning light range to 94, with revised budget accounting. It omits earlier Brawler/Weapon light-range buffs. The exact V3 balance source is identical in E/D, the original balance source is identical in A/B, and each role intervention changes only `src/sim/balance.ts` within the simulation/core tree. Source hashes are pinned in the manifest.

| Cell | Normal outside 35–65% | Hard outside 35–65% | Normal mean | Hard mean |
| --- | ---: | ---: | ---: | ---: |
| A | 57 | 40 | 28.70 s | 34.35 s |
| B | 42 | 49 | 27.87 s | 30.49 s |
| E | 28 | 24 | 28.84 s | 34.18 s |
| D | 30 | 28 | 27.99 s | 30.76 s |

The role package reduces observed band failures under both policies. E has slightly fewer failures than D in both levels and preserves the simpler reviewed controller. This supported screening E ahead of D; it did not prove any fighter-band gate or a universal tracking benefit. A later selected F also includes a separate low-variety input-policy fix and must be measured separately.

## Skill 4: canonical archetype rates

| Archetype | A | B | E | D |
| --- | ---: | ---: | ---: | ---: |
| Brawler | 39.03% | 45.55% | 40.94% | 47.69% |
| Counter | 53.93% | 52.79% | 52.76% | 52.49% |
| Footwork | 58.11% | 56.37% | 52.80% | 51.32% |
| Hover | 55.00% | 59.17% | 50.00% | 57.50% |
| Paired | 46.03% | 42.82% | 42.31% | 42.49% |
| Pressure | 47.66% | 46.80% | 46.04% | 47.82% |
| Weapon | 50.00% | 51.02% | 53.91% | 47.96% |
| Zoning | 36.25% | 40.07% | 51.00% | 50.62% |

## Skill 7: canonical archetype rates

| Archetype | A | B | E | D |
| --- | ---: | ---: | ---: | ---: |
| Brawler | 46.19% | 45.79% | 46.19% | 48.33% |
| Counter | 51.78% | 55.34% | 50.86% | 54.94% |
| Footwork | 55.36% | 53.78% | 50.09% | 46.58% |
| Hover | 49.17% | 52.50% | 40.83% | 40.83% |
| Paired | 46.20% | 43.56% | 44.31% | 43.56% |
| Pressure | 49.44% | 49.14% | 49.54% | 47.56% |
| Weapon | 49.83% | 56.63% | 52.21% | 59.01% |
| Zoning | 40.27% | 38.87% | 53.78% | 55.19% |

## Interpretation and provenance

B−A isolates the tracking package with original roles; D−E isolates tracking under V3; E−A and D−B compare the same role package within each policy. These are controlled changes within the declared simulated seed panel. They do not establish causal human difficulty or generalize automatically beyond the sampled opponents and seeds. Overall seat-pooled roster win rate is mechanically 50%, so it is not a useful promotion metric.

Reverse seats share streams and are paired, not independent. Four bouts per matchup do not establish the population 70/30 target. Band-failure counts are nonlinear and sample-size dependent. Hover has only two actors; sparse subgroup swings need caution. No individual fighter bonuses or automatic coefficient fitting were applied.

Each B/D/E expansion reused all 4,064 pilot records exactly and executed only 12,040 missing bouts. The helper checked source/version/harness identity and every initial-seed key, compared reused records byte-equivalently after JSON parse, and wrote atomic per-level checkpoints. A no-simulation repeat/resume self-check passed before expansion. All final source guards passed.

A is recovered from the existing full reviewed-CPU archive by exact keys; its full data is not duplicated here. B/D/E archives preserve complete matches, raw outcomes, initial seeds, input/state hashes and expansion provenance. The [manifest](common8-panel-20261105/manifest.json) records raw/compressed SHA-256, source identities and common-key hashes. The exact [expansion helper](common8-panel-20261105/expand-panel.mjs) is retained with its original source hash.

These reports are historical screening evidence. They do not overwrite earlier phase reports or substitute for selected-source full-panel, story, browser, determinism or human feel validation.
