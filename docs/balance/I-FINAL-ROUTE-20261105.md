# Actual final-I story-route measurement

Frozen I `efb5829c1230dac84337ba0212d92a84a527563b`; simulation `a4c7ddde49ec5a64`; production source SHA-256 `612b5e933e3e5b268ecef90db543d1572e8f4827a6d3db5a3fc1da7606d1bf3f`; harness `9d0114188482dce4eba0cc438a8d4585f772a3c948750cd1fdffcde3300812f9`.

This report measures I itself, after the shared Brawler/Paired reach changes. F route results are preserved as historical control evidence and are not attributed to I. No product source changed during measurement.

## Coverage and raw outcomes

The actual 247encounters use High Sproto with unchanged `reference-v2-persistent-delay18`, seed 20261105, four independent seed pairs per encounter, both seats and 3600-frame caps per regular bout. Sequential waves refill health and stop the trial on a raw loss or draw. Dedicated transformed-boss attacks and side-scroller mechanics are excluded.

| Source | Paired-seat trials | Regular fighter bouts | CPU encounter wins | Reference wins | Raw draws |
| --- | ---: | ---: | ---: | ---: | ---: |
| F | 1976 | 1994 | 202 | 1774 | 0 |
| I | 1976 | 1994 | 218 | 1758 | 0 |

Natural reference-left trials give F 98 CPU wins/988 and I 109/988. Across matched natural-seat trials, 14 reference wins become CPU wins and 3 CPU wins become reference wins. These are descriptive results on a heterogeneous fixed route, not a pooled population difficulty estimate.

I reverse-seat encounter outcomes agree in 980/988 paired seed trials. Reverse seats are a bias audit rather than extra independent repetitions.

First encounter remains 0/8 and finale 6/8 in both sources. Those are only four independent seed pairs each: the native row Wilson intervals pool dependent seats and are optimistic. The sparse finale 75% estimate does not supersede larger source-pinned endpoint diagnostics or establish the 65% target. Neither opening 15%, finale 65%, per-encounter smoothness nor human difficulty acceptance is claimed.

## Exact route and reference-stream checks

- All 247 IDs, indices, chapters, opponent/wave sequences, skill values and boss markers are identical between F and I.
- The reference policy source SHA-256 is `2aada800cc5ac2e80c41942a14db8a9a6bb8f541a8a9bc4cbdf5d640a364f4ff`. High Sproto roster attributes, combat style and complete balanced kit are byte-equivalent after JSON comparison across F/I.
- Every recorded reached-wave initial seed was independently rederived from the master seed, lineup, controllers, repetition and encounter/wave namespace: 3,988 records checked across both sources. All 1,994 shared reached-wave keys match fighters, controllers and initial seeds.
- Both final source/harness guards passed. The bundled route/difficulty hash differs because bundled shared balance code changed; the actual route tuples are identical, with their hash retained separately in the comparison.

These checks establish a matched source comparison. They do not make the fixed reference a calibrated decent human or establish feel. No human playtest, reserved 20261106 acceptance stream, story remap, reference weakening or opponent substitution was performed.

## Evidence

- [All 247 encounter rows](curve-2026-11-05-I-final-route.md).
- [Complete I raw archive](curve-2026-11-05-I-final-route.json.gz).
- [Exact comparison evidence](comparison-2026-11-05-I-final-route-vs-F.json.gz).
- [Comparison checker](I-final-route-comparison.mjs), preserving the original frozen checkout paths and source checks.
- [Manifest](I-final-route-manifest.json), recording source/ref/route identities, raw/compressed hashes, coverage and outcome-switch counts.

Gzip round-trips and raw/compressed SHA-256 were verified. Historical files and production source remain unchanged.
