# Enabled optional match-depth sample

Production `a146a8d90`; simulation `7d0ce00ef52b567a`.

Source SHA-256 `e151e77bbf53dc08bb3241921ffda7fee57615454e0b18a62be57dc7f4f20377`.

Harness SHA-256 `45b19a0663cc4436f47de70b05e4bf3108b1206f34ded76f84c9da47b330bbec`.

224 full-match trials across eight representative fighters, all 28 pairs, two independent seed pairs per matchup, both seats, skills 4 and 7. Optional match depth was enabled. The 10,800-frame cap applies to the entire match; intermediate round winners did not stop simulation.

| CPU skill | Full matches | Completed rounds | Raw match draws | Partial rounds at cap | Mean match | Mean round |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 4 | 112 | 265 | 0 | 0 | 50.19 s | 21.21 s |
| 7 | 112 | 273 | 0 | 0 | 53.42 s | 21.91 s |

All 538 rounds ended decisively; none used timer decisions. Separate tooling tests exercise drawn timer rounds and whole-match cap exhaustion.

Canonical production archetypes represented: bront (Brawler), duo (Paired), highsproto (Zoning), rivet (Pressure), rune (Counter), sproto1011 (Weapon), vela (Zoning), zephyr (Brawler).

This is an enabled-mode functional/performance sample, not full-roster optional balance certification or human feel approval. Entrances and between-round presentation are excluded from combat duration. The raw JSON retains the historical heuristic archetype grouping; the canonical mapping above comes from production BALANCE_KITS.

Compressed JSON preserves every bout, initial seed, round record, input hash and final-state hash. The adjacent manifest records exact source/harness identity, configuration, sizes and hashes.

Raw JSON: 488,956 bytes; compressed: 26,423 bytes.

Raw SHA-256 `0b672896209b6651edc0206dc55b34b81eb0ae0ffac0322ce187b3de709c142a`.

Compressed SHA-256 `f4c8b8a44a0d6c8a603767d5eaffc3cc6a5e37ec0836f7dd4dcd570240748e7c`.
